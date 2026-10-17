CREATE OR REPLACE FUNCTION public.validate_art_listing() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE payout numeric; commission numeric; fee numeric; total numeric;
BEGIN
 IF TG_OP='UPDATE' AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN RAISE EXCEPTION 'Listing owner cannot change'; END IF;
 IF TG_OP='UPDATE' AND EXISTS(SELECT 1 FROM public.art_orders WHERE listing_id=OLD.id AND status NOT IN ('expired','failed','refunded')) AND NEW.data IS DISTINCT FROM OLD.data THEN RAISE EXCEPTION 'Listing has an active order'; END IF;
 IF coalesce(trim(NEW.data->>'title'),'')='' OR coalesce(NEW.data->>'image','')='' THEN RAISE EXCEPTION 'Title and image required'; END IF;
 IF NEW.data ? 'shippingPrice' AND ((NEW.data->>'shippingPrice')::numeric<0 OR (NEW.data->>'shippingPrice')::numeric>1000000000) THEN RAISE EXCEPTION 'Invalid shipping price'; END IF;
 IF NEW.data ? 'sellerPayout' THEN
  payout=round((NEW.data->>'sellerPayout')::numeric);
  IF payout<0 OR payout>1000000000 THEN RAISE EXCEPTION 'Invalid payout'; END IF;
  commission=round(payout*0.2);
  fee=CASE WHEN payout>2000 AND coalesce((NEW.data->>'artFeeApplies')::boolean,true) THEN round((payout+commission)*0.05) ELSE 0 END;
  total=payout+commission+fee;
  NEW.data=jsonb_set(NEW.data,'{price}',to_jsonb(total));
 END IF;
 IF (NEW.data->>'price')::numeric<0 OR (NEW.data->>'price')::numeric>1500000000 THEN RAISE EXCEPTION 'Invalid listing price'; END IF;
 NEW.data=jsonb_set(jsonb_set(NEW.data,'{id}',to_jsonb(NEW.id)),'{sellerId}',to_jsonb(NEW.user_id::text));
 RETURN NEW;
END; $$;
CREATE TRIGGER validate_art_listing BEFORE INSERT OR UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.validate_art_listing();
CREATE OR REPLACE FUNCTION public.guard_listing_deletion() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.art_orders WHERE listing_id=OLD.id AND status NOT IN ('expired','failed','refunded')) THEN RAISE EXCEPTION 'Active order: listing cannot be deleted'; END IF;
 RETURN OLD;
END; $$;
CREATE TRIGGER guard_listing_deletion BEFORE DELETE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.guard_listing_deletion();
CREATE OR REPLACE FUNCTION public.unavailable_artwork_ids() RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT listing_id FROM public.purchases UNION SELECT listing_id FROM public.art_orders WHERE environment='live' AND status IN ('paid','shipped','approved','disputed','refund_pending','payout_pending','paid_out') $$;
CREATE OR REPLACE FUNCTION public.sold_listing_ids(_seller uuid) RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT listing_id FROM public.purchases WHERE seller_id=_seller UNION SELECT listing_id FROM public.art_orders WHERE seller_id=_seller AND environment='live' AND status IN ('paid','shipped','approved','disputed','refund_pending','payout_pending','paid_out') $$;