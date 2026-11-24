CREATE OR REPLACE FUNCTION public.finish_art_settlement(_order uuid,_token uuid,_transfer text,_reversal text,_refund text,_status text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s public.art_settlements;
BEGIN
 _transfer=nullif(_transfer,''); _reversal=nullif(_reversal,''); _refund=nullif(_refund,'');
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