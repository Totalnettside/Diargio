CREATE TABLE public.art_settlements (
 order_id uuid PRIMARY KEY REFERENCES public.art_orders(id), environment text NOT NULL CHECK(environment IN ('sandbox','live')), seller_id uuid NOT NULL, destination text NOT NULL, amount bigint NOT NULL CHECK(amount>0), transfer_id text UNIQUE, reversal_id text, operation text CHECK(operation IN ('payout','refund')), lease_until timestamptz, lease_token uuid, last_error text, transferred_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.art_settlements TO authenticated;
GRANT ALL ON public.art_settlements TO service_role;
ALTER TABLE public.art_settlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order parties read settlements" ON public.art_settlements FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.art_orders o WHERE o.id=order_id AND (auth.uid() IN (o.buyer_id,o.seller_id) OR public.has_role(auth.uid(),'admin'))));
CREATE OR REPLACE FUNCTION public.claim_art_settlement(_order uuid,_operation text,_amount bigint,_destination text) RETURNS public.art_settlements LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.art_orders; s public.art_settlements; token uuid=gen_random_uuid();
BEGIN
 SELECT * INTO o FROM public.art_orders WHERE id=_order FOR UPDATE;
 IF NOT FOUND OR o.paid_at IS NULL OR o.stripe_payment_id IS NULL OR _operation NOT IN ('payout','refund') THEN RAISE EXCEPTION 'Invalid settlement'; END IF;
 IF _amount<=0 OR _amount>o.total_amount OR NOT EXISTS(SELECT 1 FROM public.artist_payment_accounts WHERE user_id=o.seller_id AND environment=o.environment AND stripe_account_id=_destination) THEN RAISE EXCEPTION 'Invalid seller account or amount'; END IF;
 INSERT INTO public.art_settlements(order_id,environment,seller_id,destination,amount) VALUES(o.id,o.environment,o.seller_id,_destination,_amount) ON CONFLICT DO NOTHING;
 SELECT * INTO s FROM public.art_settlements WHERE order_id=o.id FOR UPDATE;
 IF s.destination<>_destination OR s.amount<>_amount THEN RAISE EXCEPTION 'Settlement is immutable'; END IF;
 IF s.lease_until>now() THEN RAISE EXCEPTION 'Oppgjøret behandles allerede. Prøv igjen senere.'; END IF;
 IF s.operation IS NOT NULL AND s.operation<>_operation THEN RAISE EXCEPTION 'Tidligere betalingshandling må avstemmes først.'; END IF;
 IF _operation='payout' AND o.status NOT IN ('approved','payout_pending','paid_out') THEN RAISE EXCEPTION 'Mottak må godkjennes før oppgjør'; END IF;
 IF _operation='refund' AND o.status NOT IN ('paid','shipped','approved','disputed','refund_pending','paid_out') THEN RAISE EXCEPTION 'Refund unavailable'; END IF;
 IF _operation='payout' AND o.status='paid_out' THEN RETURN s; END IF;
 UPDATE public.art_settlements SET operation=_operation,lease_until=now()+interval '5 minutes',lease_token=token,last_error=NULL WHERE order_id=o.id RETURNING * INTO s;
 UPDATE public.art_orders SET status=CASE WHEN _operation='payout' THEN 'payout_pending' ELSE 'refund_pending' END WHERE id=o.id;
 RETURN s;
END; $$;
REVOKE ALL ON FUNCTION public.claim_art_settlement(uuid,text,bigint,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_art_settlement(uuid,text,bigint,text) TO service_role;
CREATE OR REPLACE FUNCTION public.finish_art_settlement(_order uuid,_token uuid,_transfer text,_reversal text,_refund text,_status text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s public.art_settlements;
BEGIN
 PERFORM 1 FROM public.art_orders WHERE id=_order FOR UPDATE;
 SELECT * INTO s FROM public.art_settlements WHERE order_id=_order FOR UPDATE;
 IF NOT FOUND OR s.lease_token IS DISTINCT FROM _token OR _status NOT IN ('paid_out','refunded','refund_pending') THEN RAISE EXCEPTION 'Settlement claim changed'; END IF;
 IF _status='paid_out' AND (s.operation<>'payout' OR _transfer IS NULL) THEN RAISE EXCEPTION 'Transfer not confirmed'; END IF;
 IF _status IN ('refunded','refund_pending') AND (s.operation<>'refund' OR _refund IS NULL) THEN RAISE EXCEPTION 'Refund not confirmed'; END IF;
 UPDATE public.art_settlements SET transfer_id=coalesce(_transfer,transfer_id),reversal_id=coalesce(_reversal,reversal_id),transferred_at=CASE WHEN _status='paid_out' THEN now() ELSE transferred_at END,operation=NULL,lease_until=NULL,lease_token=NULL,last_error=NULL WHERE order_id=_order;
 UPDATE public.art_orders SET status=_status,stripe_refund_id=coalesce(_refund,stripe_refund_id) WHERE id=_order AND status IN ('payout_pending','refund_pending');
END; $$;
REVOKE ALL ON FUNCTION public.finish_art_settlement(uuid,uuid,text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finish_art_settlement(uuid,uuid,text,text,text,text) TO service_role;
CREATE OR REPLACE FUNCTION public.guard_settlement_order_change() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.status IS DISTINCT FROM OLD.status AND EXISTS(SELECT 1 FROM public.art_settlements WHERE order_id=OLD.id AND operation IS NOT NULL AND lease_until>now()) AND NEW.status NOT IN ('payout_pending','refund_pending','paid_out','refunded') THEN RAISE EXCEPTION 'Settlement is processing'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER guard_settlement_order_change BEFORE UPDATE ON public.art_orders FOR EACH ROW EXECUTE FUNCTION public.guard_settlement_order_change();