CREATE UNIQUE INDEX one_confirmed_purchase_per_artwork ON public.purchases(listing_id);
CREATE OR REPLACE FUNCTION public.reserve_art_order(_buyer uuid,_listing text,_environment text,_snapshot jsonb,_artwork bigint,_shipping bigint) RETURNS public.art_orders LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.listings; o public.art_orders; b public.bids;
BEGIN
 IF _environment NOT IN ('sandbox','live') THEN RAISE EXCEPTION 'Invalid environment'; END IF;
 SELECT * INTO l FROM public.listings WHERE id=_listing FOR UPDATE;
 IF NOT FOUND OR l.user_id=_buyer THEN RAISE EXCEPTION 'Artwork unavailable'; END IF;
 IF _environment='live' AND EXISTS(SELECT 1 FROM public.purchases WHERE listing_id=_listing) THEN RAISE EXCEPTION 'Artwork sold'; END IF;
 IF _snapshot->'listingVersion' IS DISTINCT FROM to_jsonb(l.updated_at) THEN RAISE EXCEPTION 'Listing changed: reload checkout'; END IF;
 IF nullif(_snapshot->>'bidId','') IS NOT NULL THEN
  SELECT * INTO b FROM public.bids WHERE id=(_snapshot->>'bidId')::uuid AND buyer_id=_buyer AND seller_id=l.user_id AND listing_id=_listing AND status='accepted' FOR UPDATE;
  IF NOT FOUND OR round(b.amount*100)<>_artwork THEN RAISE EXCEPTION 'Bid changed'; END IF;
 ELSIF round((l.data->>'price')::numeric*100)<>_artwork OR l.data->>'saleType'<>'Fastpris' THEN RAISE EXCEPTION 'Price changed'; END IF;
 IF _snapshot->>'deliveryMode'='pickup' THEN
  IF l.data->>'delivery' NOT IN ('Må hentes','Begge deler') OR _shipping<>0 THEN RAISE EXCEPTION 'Pickup unavailable'; END IF;
 ELSE
  IF l.data->>'delivery'='Må hentes' OR NOT l.data ? 'shippingPrice' OR round((l.data->>'shippingPrice')::numeric*100)<>_shipping THEN RAISE EXCEPTION 'Shipping changed'; END IF;
 END IF;
 SELECT * INTO o FROM public.art_orders WHERE listing_id=_listing AND environment=_environment AND status NOT IN ('expired','failed','refunded');
 IF FOUND THEN
  IF o.buyer_id=_buyer AND o.status='reserved' THEN RETURN o; END IF;
  RAISE EXCEPTION 'Artwork reserved';
 END IF;
 INSERT INTO public.art_orders(buyer_id,seller_id,listing_id,environment,snapshot,artwork_amount,shipping_amount,total_amount) VALUES(_buyer,l.user_id,_listing,_environment,_snapshot,_artwork,_shipping,_artwork+_shipping) RETURNING * INTO o;
 RETURN o;
END; $$;
CREATE OR REPLACE FUNCTION public.guard_listing_deletion() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.art_orders WHERE listing_id=OLD.id AND environment='live' AND status NOT IN ('expired','failed','refunded')) THEN RAISE EXCEPTION 'Active order: listing cannot be deleted'; END IF;
 RETURN OLD;
END; $$;
CREATE OR REPLACE FUNCTION public.guard_order_transition() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF TG_OP='UPDATE' AND (NEW.snapshot IS DISTINCT FROM OLD.snapshot OR NEW.buyer_id IS DISTINCT FROM OLD.buyer_id OR NEW.seller_id IS DISTINCT FROM OLD.seller_id OR NEW.listing_id IS DISTINCT FROM OLD.listing_id OR NEW.total_amount IS DISTINCT FROM OLD.total_amount OR NEW.environment IS DISTINCT FROM OLD.environment) THEN RAISE EXCEPTION 'Order snapshot is immutable'; END IF;
 NEW.updated_at=now(); RETURN NEW;
END; $$;
CREATE TRIGGER guard_order_transition BEFORE UPDATE ON public.art_orders FOR EACH ROW EXECUTE FUNCTION public.guard_order_transition();
CREATE OR REPLACE FUNCTION public.confirm_art_payment(_order uuid,_session text,_payment text,_amount bigint,_currency text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.art_orders;
BEGIN
 SELECT * INTO o FROM public.art_orders WHERE id=_order FOR UPDATE;
 IF NOT FOUND OR o.stripe_session_id IS DISTINCT FROM _session OR o.total_amount<>_amount OR lower(_currency)<>o.currency THEN RAISE EXCEPTION 'Payment does not match order'; END IF;
 IF o.stripe_payment_id IS NOT NULL AND o.stripe_payment_id<>_payment THEN RAISE EXCEPTION 'Payment ID mismatch'; END IF;
 IF o.status IN ('paid','shipped','approved','disputed','refund_pending','refunded','payout_pending','paid_out') THEN RETURN; END IF;
 IF o.status NOT IN ('reserved','pending') THEN RAISE EXCEPTION 'Payment requires reconciliation'; END IF;
 UPDATE public.art_orders SET status='paid',stripe_payment_id=_payment,paid_at=now(),updated_at=now() WHERE id=o.id;
 IF o.environment='live' THEN INSERT INTO public.purchases(buyer_id,seller_id,listing_id) VALUES(o.buyer_id,o.seller_id,o.listing_id); END IF;
END; $$;