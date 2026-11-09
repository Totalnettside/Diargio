CREATE OR REPLACE FUNCTION public.save_listing_revision(_id text,_data jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.listings; r public.listing_revisions; clean jsonb; keys text[]:=ARRAY['price','sellerPayout','artFeeApplies','shippingPrice','delivery','saleType']; commercial jsonb;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 clean:=(_data - ARRAY['moderationStatus','sellerMessage','revisionId','revisionVersion']) || jsonb_build_object('id',_id,'sellerId',auth.uid());
 IF coalesce(trim(clean->>'title'),'')='' OR coalesce(clean->>'image','')='' THEN RAISE EXCEPTION 'Bilde og tittel kreves for utkast'; END IF;
 SELECT * INTO l FROM public.listings WHERE id=_id FOR UPDATE;
 IF NOT FOUND THEN
  INSERT INTO public.listings(id,user_id,data) VALUES(_id,auth.uid(),clean) RETURNING * INTO l;
 ELSIF l.user_id<>auth.uid() THEN RAISE EXCEPTION 'Forbidden';
 ELSIF l.moderation_status='sold' THEN RAISE EXCEPTION 'Solgte annonser kan ikke endres';
 END IF;
 IF EXISTS(SELECT 1 FROM public.art_orders WHERE listing_id=_id AND status NOT IN ('expired','failed','refunded')) THEN RAISE EXCEPTION 'Annonsen har en aktiv ordre'; END IF;
 SELECT * INTO r FROM public.listing_revisions WHERE listing_id=_id AND status IN ('draft','pending','changes_requested') FOR UPDATE;
 IF FOUND AND r.status='pending' THEN RAISE EXCEPTION 'Trekk den innsendte versjonen tilbake til utkast før redigering'; END IF;
 IF l.moderation_status='published' THEN
  SELECT coalesce(jsonb_object_agg(key,value),'{}'::jsonb) INTO commercial FROM jsonb_each(clean) WHERE key=ANY(keys);
  UPDATE public.listings SET data=(data-keys)||commercial,updated_at=now() WHERE id=_id;
  IF (clean-keys)=(l.data-keys) AND r.id IS NULL THEN RETURN NULL; END IF;
 END IF;
 IF r.id IS NULL THEN
  INSERT INTO public.listing_revisions(listing_id,user_id,data) VALUES(_id,auth.uid(),clean) RETURNING id INTO r.id;
 ELSE
  UPDATE public.listing_revisions SET data=clean,status='draft',version=version+1,updated_at=now(),seller_message=NULL WHERE id=r.id;
 END IF;
 RETURN r.id;
END; $$;