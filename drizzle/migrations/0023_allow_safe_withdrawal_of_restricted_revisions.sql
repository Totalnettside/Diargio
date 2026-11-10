CREATE OR REPLACE FUNCTION public.guard_restricted_listing_revision() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_OP='UPDATE' AND NEW.status IN ('withdrawn','sold') AND NEW.data IS NOT DISTINCT FROM OLD.data THEN RETURN NEW; END IF;
 IF public.profile_is_blocked(NEW.user_id) THEN RAISE EXCEPTION 'Profilen er sperret'; END IF;
 IF EXISTS(SELECT 1 FROM public.listings WHERE id=NEW.listing_id AND (deleted_at IS NOT NULL OR blocked)) THEN RAISE EXCEPTION 'Annonsen er sperret eller slettet'; END IF;
 RETURN NEW;
END; $$;