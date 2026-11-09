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
DROP POLICY "Listing owners upload documentation" ON storage.objects;
CREATE POLICY "Listing owners upload draft documentation" ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='listing-documentation' AND (storage.foldername(name))[1]=auth.uid()::text AND EXISTS(SELECT 1 FROM public.listing_revisions r WHERE r.listing_id=(storage.foldername(name))[2] AND r.user_id=auth.uid() AND r.status IN ('draft','changes_requested')) AND NOT EXISTS(SELECT 1 FROM public.listing_revisions r WHERE r.listing_id=(storage.foldername(name))[2] AND r.status='pending'));
DROP POLICY "Owners remove listing documentation" ON storage.objects;
CREATE POLICY "Owners remove draft documentation" ON storage.objects FOR DELETE TO authenticated USING(bucket_id='listing-documentation' AND (storage.foldername(name))[1]=auth.uid()::text AND EXISTS(SELECT 1 FROM public.listing_revisions r WHERE r.listing_id=(storage.foldername(name))[2] AND r.user_id=auth.uid() AND r.status IN ('draft','changes_requested')) AND NOT EXISTS(SELECT 1 FROM public.listing_revisions r WHERE r.listing_id=(storage.foldername(name))[2] AND r.status='pending'));
