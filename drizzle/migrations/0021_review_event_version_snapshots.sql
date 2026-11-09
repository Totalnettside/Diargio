ALTER TABLE public.listing_review_events ADD COLUMN reviewed_data jsonb;
UPDATE public.listing_review_events e SET reviewed_data=r.data FROM public.listing_revisions r WHERE r.id=e.revision_id;
CREATE OR REPLACE FUNCTION public.snapshot_review_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN SELECT data INTO NEW.reviewed_data FROM public.listing_revisions WHERE id=NEW.revision_id; RETURN NEW; END; $$;
REVOKE ALL ON FUNCTION public.snapshot_review_event() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER snapshot_review_version BEFORE INSERT ON public.listing_review_events FOR EACH ROW EXECUTE FUNCTION public.snapshot_review_event();
CREATE OR REPLACE FUNCTION public.validate_review_content(_data jsonb) RETURNS void LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF coalesce(trim(_data->>'title'),'')='' OR coalesce(_data->>'image','')='' OR coalesce(trim(_data->>'description'),'')='' THEN RAISE EXCEPTION 'Bilde, tittel og beskrivelse kreves'; END IF;
 IF coalesce((_data->>'widthCm')::numeric,0)<=0 OR coalesce((_data->>'heightCm')::numeric,0)<=0 THEN RAISE EXCEPTION 'Gyldige mål kreves'; END IF;
 IF coalesce(_data->>'sellerType','') NOT IN ('Kunstner','Privat','Galleri','Kunsthandler') OR coalesce(jsonb_typeof(_data->'ownWork'),'')<>'boolean' THEN RAISE EXCEPTION 'Selgertype og eget verk/videresalg kreves'; END IF;
 IF coalesce(_data->>'type','')='' OR coalesce(_data->>'condition','')='' OR coalesce(_data->>'delivery','') NOT IN ('Må hentes','Kan sendes','Begge deler') THEN RAISE EXCEPTION 'Type, tilstand og levering kreves'; END IF;
 IF coalesce((_data->>'price')::numeric,-1)<0 OR (_data->>'price')::numeric>1000000000 OR coalesce((_data->>'shippingPrice')::numeric,-1)<0 OR (_data->>'shippingPrice')::numeric>1000000000 THEN RAISE EXCEPTION 'Ugyldig pris eller frakt'; END IF;
 IF coalesce(_data->>'saleType','') NOT IN ('Fastpris','Bud ønskes','Auksjon','Pris på forespørsel') THEN RAISE EXCEPTION 'Salgsform kreves'; END IF;
 IF _data->>'saleType'<>'Pris på forespørsel' AND (_data->>'price')::numeric<=0 THEN RAISE EXCEPTION 'Pris kreves'; END IF;
END; $$;