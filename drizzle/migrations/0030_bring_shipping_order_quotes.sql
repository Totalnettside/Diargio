CREATE OR REPLACE FUNCTION public.reserve_art_order(_buyer uuid,_listing text,_environment text,_snapshot jsonb,_artwork bigint,_shipping bigint) RETURNS public.art_orders LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.listings; o public.art_orders; b public.bids;
BEGIN
 IF _environment NOT IN ('sandbox','live') THEN RAISE EXCEPTION 'Invalid environment'; END IF;
 SELECT * INTO l FROM public.listings WHERE id=_listing FOR UPDATE;
 IF NOT FOUND OR l.user_id=_buyer OR l.moderation_status<>'published' THEN RAISE EXCEPTION 'Artwork unavailable'; END IF;
 IF _environment='live' AND EXISTS(SELECT 1 FROM public.purchases WHERE listing_id=_listing) THEN RAISE EXCEPTION 'Artwork sold'; END IF;
 IF _snapshot->'listingVersion' IS DISTINCT FROM to_jsonb(l.updated_at) THEN RAISE EXCEPTION 'Listing changed: reload checkout'; END IF;
 IF nullif(_snapshot->>'bidId','') IS NOT NULL THEN
  SELECT * INTO b FROM public.bids WHERE id=(_snapshot->>'bidId')::uuid AND buyer_id=_buyer AND seller_id=l.user_id AND listing_id=_listing AND status='accepted' FOR UPDATE;
  IF NOT FOUND OR round(b.amount*100)<>_artwork THEN RAISE EXCEPTION 'Bid changed'; END IF;
 ELSIF round((l.data->>'price')::numeric*100)<>_artwork OR l.data->>'saleType'<>'Fastpris' THEN RAISE EXCEPTION 'Price changed'; END IF;
 IF _snapshot->>'deliveryMode'='pickup' THEN
  IF l.data->>'delivery' NOT IN ('Må hentes','Begge deler') OR _shipping<>0 THEN RAISE EXCEPTION 'Pickup unavailable'; END IF;
 ELSIF _snapshot->>'deliveryMode'='shipping' THEN
  IF l.data->>'delivery'='Må hentes' THEN RAISE EXCEPTION 'Shipping unavailable'; END IF;
  IF l.data->>'shippingMethod'='bring' THEN
   IF _snapshot->'shippingPackage' IS DISTINCT FROM l.data->'shippingPackage'
      OR coalesce(_snapshot->'shippingQuote'->>'productId','')<>'5800'
      OR coalesce(_snapshot->'shippingQuote'->>'toPostalCode','')!~'^[0-9]{4}$'
      OR _shipping<=0
      OR coalesce((_snapshot->'shippingQuote'->>'amount')::bigint,-1)<>_shipping
      OR coalesce((_snapshot->'shippingQuote'->>'quotedAt')::timestamptz,'epoch'::timestamptz)<now()-interval '5 minutes'
      OR (_snapshot->'shippingQuote'->>'quotedAt')::timestamptz>now()+interval '1 minute'
   THEN RAISE EXCEPTION 'Bring quote changed: calculate shipping again'; END IF;
  ELSIF NOT l.data ? 'shippingPrice' OR round((l.data->>'shippingPrice')::numeric*100)<>_shipping THEN RAISE EXCEPTION 'Shipping changed'; END IF;
 ELSE RAISE EXCEPTION 'Invalid delivery mode';
 END IF;
 SELECT * INTO o FROM public.art_orders WHERE listing_id=_listing AND environment=_environment AND status NOT IN ('expired','failed','refunded');
 IF FOUND THEN
  IF o.buyer_id=_buyer AND o.status='reserved' THEN
   IF o.shipping_amount<>_shipping OR o.artwork_amount<>_artwork
      OR o.snapshot->>'deliveryMode' IS DISTINCT FROM _snapshot->>'deliveryMode'
      OR o.snapshot->'shippingQuote'->>'toPostalCode' IS DISTINCT FROM _snapshot->'shippingQuote'->>'toPostalCode'
   THEN RAISE EXCEPTION 'Leveringen er endret. Avbryt den gamle reservasjonen i ordreoversikten først.'; END IF;
   RETURN o;
  END IF;
  RAISE EXCEPTION 'Artwork reserved';
 END IF;
 INSERT INTO public.art_orders(buyer_id,seller_id,listing_id,environment,snapshot,artwork_amount,shipping_amount,total_amount) VALUES(_buyer,l.user_id,_listing,_environment,_snapshot,_artwork,_shipping,_artwork+_shipping) RETURNING * INTO o;
 RETURN o;
END; $$;
REVOKE ALL ON FUNCTION public.reserve_art_order(uuid,text,text,jsonb,bigint,bigint) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_art_order(uuid,text,text,jsonb,bigint,bigint) TO service_role;