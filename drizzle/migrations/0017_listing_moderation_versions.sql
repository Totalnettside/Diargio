ALTER TABLE public.listings ADD COLUMN moderation_status text NOT NULL DEFAULT 'draft';
ALTER TABLE public.listings ADD CONSTRAINT listings_moderation_status CHECK (moderation_status IN ('draft','published','withdrawn','sold'));
UPDATE public.listings SET moderation_status=CASE WHEN data->>'sold'='true' OR data->>'status' IN ('sold','Solgt') THEN 'sold' ELSE 'published' END;

CREATE TABLE public.listing_revisions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), listing_id text NOT NULL REFERENCES public.listings(id), user_id uuid NOT NULL,
 version integer NOT NULL DEFAULT 1, data jsonb NOT NULL, status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','pending','changes_requested','published','rejected','withdrawn','sold')),
 submitted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), seller_message text
);
GRANT SELECT ON public.listing_revisions TO authenticated;
GRANT ALL ON public.listing_revisions TO service_role;
ALTER TABLE public.listing_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner or admin reads revisions" ON public.listing_revisions FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE UNIQUE INDEX listing_one_open_revision ON public.listing_revisions(listing_id) WHERE status IN ('draft','pending','changes_requested');

CREATE TABLE public.listing_review_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), listing_id text NOT NULL REFERENCES public.listings(id), revision_id uuid REFERENCES public.listing_revisions(id), version integer NOT NULL,
 user_id uuid NOT NULL, actor_id uuid NOT NULL, decision text NOT NULL, reason text, title text NOT NULL, price numeric NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(), read_at timestamptz, email_status text NOT NULL DEFAULT 'not_sent', email_error text, email_retry_at timestamptz
);
GRANT SELECT ON public.listing_review_events TO authenticated;
GRANT ALL ON public.listing_review_events TO service_role;
ALTER TABLE public.listing_review_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner or admin reads review events" ON public.listing_review_events FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE INDEX listing_review_events_listing ON public.listing_review_events(listing_id,created_at);
CREATE TABLE public.listing_review_notes (
 event_id uuid PRIMARY KEY REFERENCES public.listing_review_events(id), note text NOT NULL
);
GRANT SELECT ON public.listing_review_notes TO authenticated;
GRANT ALL ON public.listing_review_notes TO service_role;
ALTER TABLE public.listing_review_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins read internal notes" ON public.listing_review_notes FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));

DROP POLICY "Listings viewable by everyone" ON public.listings;
CREATE POLICY "Published listings public" ON public.listings FOR SELECT TO anon,authenticated USING(moderation_status='published');
CREATE POLICY "Owners read hidden listings" ON public.listings FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY "Admins read hidden listings" ON public.listings FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
REVOKE INSERT,UPDATE,DELETE ON public.listings FROM anon,authenticated;
DROP POLICY "Owners or admins update listings" ON public.listings;
DROP POLICY "Users insert own listings" ON public.listings;
DROP POLICY "Owners or admins delete listings" ON public.listings;

CREATE OR REPLACE FUNCTION public.validate_review_content(_data jsonb) RETURNS void LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF coalesce(trim(_data->>'title'),'')='' OR coalesce(_data->>'image','')='' OR coalesce(trim(_data->>'description'),'')='' THEN RAISE EXCEPTION 'Bilde, tittel og beskrivelse kreves'; END IF;
 IF coalesce((_data->>'widthCm')::numeric,0)<=0 OR coalesce((_data->>'heightCm')::numeric,0)<=0 THEN RAISE EXCEPTION 'Gyldige mål kreves'; END IF;
 IF _data->>'sellerType' NOT IN ('Kunstner','Privat','Galleri','Kunsthandler') OR NOT _data ? 'ownWork' OR jsonb_typeof(_data->'ownWork')<>'boolean' THEN RAISE EXCEPTION 'Selgertype og eget verk/videresalg kreves'; END IF;
 IF coalesce(_data->>'type','')='' OR coalesce(_data->>'condition','')='' OR _data->>'delivery' NOT IN ('Må hentes','Kan sendes','Begge deler') THEN RAISE EXCEPTION 'Type, tilstand og levering kreves'; END IF;
 IF coalesce((_data->>'price')::numeric,-1)<0 OR (_data->>'price')::numeric>1000000000 OR coalesce((_data->>'shippingPrice')::numeric,-1)<0 OR (_data->>'shippingPrice')::numeric>1000000000 THEN RAISE EXCEPTION 'Ugyldig pris eller frakt'; END IF;
 IF _data->>'saleType'<>'Pris på forespørsel' AND (_data->>'price')::numeric<=0 THEN RAISE EXCEPTION 'Pris kreves'; END IF;
END; $$;
REVOKE ALL ON FUNCTION public.validate_review_content(jsonb) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.save_listing_revision(_id text,_data jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.listings; r public.listing_revisions; clean jsonb; keys text[]:=ARRAY['price','sellerPayout','artFeeApplies','shippingPrice','delivery','saleType']; commercial jsonb;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 clean:=(_data - ARRAY['moderationStatus','sellerMessage','revisionId','revisionVersion']) || jsonb_build_object('id',_id,'sellerId',auth.uid());
 PERFORM public.validate_review_content(clean);
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
REVOKE ALL ON FUNCTION public.save_listing_revision(text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_listing_revision(text,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_listing_revision(_id text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.listings; r public.listing_revisions; event_id uuid;
BEGIN
 SELECT * INTO l FROM public.listings WHERE id=_id AND user_id=auth.uid() FOR UPDATE;
 IF NOT FOUND OR l.moderation_status='sold' THEN RAISE EXCEPTION 'Forbidden'; END IF;
 SELECT * INTO r FROM public.listing_revisions WHERE listing_id=_id AND status IN ('draft','changes_requested') FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Ingen redigerbart utkast'; END IF;
 PERFORM public.validate_review_content(r.data);
 IF l.moderation_status='withdrawn' THEN UPDATE public.listings SET moderation_status='draft',updated_at=now() WHERE id=_id; END IF;
 UPDATE public.listing_revisions SET status='pending',submitted_at=now(),updated_at=now() WHERE id=r.id;
 INSERT INTO public.listing_review_events(listing_id,revision_id,version,user_id,actor_id,decision,title,price) VALUES(_id,r.id,r.version,l.user_id,auth.uid(),'submitted',r.data->>'title',(r.data->>'price')::numeric) RETURNING id INTO event_id;
 RETURN event_id;
END; $$;
REVOKE ALL ON FUNCTION public.submit_listing_revision(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.submit_listing_revision(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.review_listing_revision(_revision uuid,_version integer,_decision text,_reason text,_note text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.listings; r public.listing_revisions; event_id uuid; lid text; clean jsonb;
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
 IF _decision NOT IN ('published','changes_requested','rejected') THEN RAISE EXCEPTION 'Invalid decision'; END IF;
 IF _decision<>'published' AND coalesce(trim(_reason),'')='' THEN RAISE EXCEPTION 'Begrunnelse kreves'; END IF;
 SELECT listing_id INTO lid FROM public.listing_revisions WHERE id=_revision;
 SELECT * INTO l FROM public.listings WHERE id=lid FOR UPDATE;
 SELECT * INTO r FROM public.listing_revisions WHERE id=_revision FOR UPDATE;
 IF r.id IS NULL OR r.status<>'pending' OR r.version<>_version OR l.moderation_status IN ('withdrawn','sold') THEN RAISE EXCEPTION 'Annonsen er allerede behandlet, trukket eller solgt'; END IF;
 IF _decision='published' THEN
  PERFORM public.validate_review_content(r.data);
  clean:=r.data;
  IF l.moderation_status='published' THEN clean:=(clean-ARRAY['price','sellerPayout','artFeeApplies','shippingPrice','delivery','saleType'])||(SELECT jsonb_object_agg(key,value) FROM jsonb_each(l.data) WHERE key IN ('price','sellerPayout','artFeeApplies','shippingPrice','delivery','saleType')); END IF;
  UPDATE public.listings SET data=clean,moderation_status='published',updated_at=now() WHERE id=l.id;
 END IF;
 UPDATE public.listing_revisions SET status=_decision,seller_message=nullif(trim(_reason),''),updated_at=now() WHERE id=r.id;
 INSERT INTO public.listing_review_events(listing_id,revision_id,version,user_id,actor_id,decision,reason,title,price) VALUES(l.id,r.id,r.version,l.user_id,auth.uid(),_decision,nullif(trim(_reason),''),r.data->>'title',(r.data->>'price')::numeric) RETURNING id INTO event_id;
 IF coalesce(trim(_note),'')<>'' THEN INSERT INTO public.listing_review_notes(event_id,note) VALUES(event_id,_note); END IF;
 RETURN event_id;
END; $$;
REVOKE ALL ON FUNCTION public.review_listing_revision(uuid,integer,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.review_listing_revision(uuid,integer,text,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.change_listing_visibility(_id text,_action text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.listings;
BEGIN
 SELECT * INTO l FROM public.listings WHERE id=_id FOR UPDATE;
 IF NOT FOUND OR (l.user_id<>auth.uid() AND NOT public.has_role(auth.uid(),'admin')) THEN RAISE EXCEPTION 'Forbidden'; END IF;
 IF _action NOT IN ('draft','withdrawn','sold') THEN RAISE EXCEPTION 'Invalid action'; END IF;
 IF l.moderation_status='sold' THEN RAISE EXCEPTION 'Verket er allerede solgt'; END IF;
 IF _action='draft' THEN
  UPDATE public.listing_revisions SET status='draft',version=version+1,updated_at=now() WHERE listing_id=_id AND status='pending';
 ELSE
  UPDATE public.listings SET moderation_status=_action,updated_at=now() WHERE id=_id;
  UPDATE public.listing_revisions SET status=_action,updated_at=now() WHERE listing_id=_id AND status IN ('draft','pending','changes_requested');
 END IF;
END; $$;
REVOKE ALL ON FUNCTION public.change_listing_visibility(text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.change_listing_visibility(text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_unpublished_trade() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s text;
BEGIN
 SELECT moderation_status INTO s FROM public.listings WHERE id=NEW.listing_id FOR UPDATE;
 IF s IS DISTINCT FROM 'published' THEN RAISE EXCEPTION 'Annonsen er ikke publisert'; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_unpublished_trade() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER guard_bid_publication BEFORE INSERT ON public.bids FOR EACH ROW EXECUTE FUNCTION public.guard_unpublished_trade();
CREATE TRIGGER guard_order_publication BEFORE INSERT ON public.art_orders FOR EACH ROW EXECUTE FUNCTION public.guard_unpublished_trade();
DROP POLICY "Buyers submit bids to listing owner" ON public.bids;
CREATE POLICY "Buyers bid on published listings" ON public.bids FOR INSERT TO authenticated WITH CHECK(auth.uid()=buyer_id AND buyer_id<>seller_id AND EXISTS(SELECT 1 FROM public.listings l WHERE l.id=listing_id AND l.user_id=seller_id AND l.moderation_status='published'));

CREATE OR REPLACE FUNCTION public.mark_review_events_read() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$ UPDATE public.listing_review_events SET read_at=now() WHERE user_id=auth.uid() AND decision<>'submitted' AND read_at IS NULL; $$;
REVOKE ALL ON FUNCTION public.mark_review_events_read() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mark_review_events_read() TO authenticated;