ALTER TABLE public.listings ADD COLUMN deleted_at timestamptz;
ALTER TABLE public.listings ADD COLUMN blocked boolean NOT NULL DEFAULT false;
CREATE TABLE public.profile_restrictions(user_id uuid PRIMARY KEY REFERENCES public.profiles(id), blocked boolean NOT NULL DEFAULT false, reason text, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.profile_restrictions TO authenticated;
GRANT ALL ON public.profile_restrictions TO service_role;
ALTER TABLE public.profile_restrictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner and admin read restrictions" ON public.profile_restrictions FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TABLE public.administrative_actions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),actor_id uuid NOT NULL,target_type text NOT NULL,target_id text NOT NULL,action text NOT NULL,reason text,internal_note text,before_data jsonb,after_data jsonb,created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.administrative_actions TO authenticated;
GRANT ALL ON public.administrative_actions TO service_role;
ALTER TABLE public.administrative_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin reads action history" ON public.administrative_actions FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE OR REPLACE FUNCTION public.profile_is_blocked(_user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.profile_restrictions WHERE user_id=_user AND blocked); $$;
REVOKE ALL ON FUNCTION public.profile_is_blocked(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profile_is_blocked(uuid) TO anon,authenticated,service_role;
DROP POLICY "Published listings public" ON public.listings;
CREATE POLICY "Published listings public" ON public.listings FOR SELECT TO anon,authenticated USING(moderation_status='published' AND deleted_at IS NULL AND NOT blocked AND NOT public.profile_is_blocked(user_id));
CREATE OR REPLACE FUNCTION public.manage_listing_visibility(_id text,_action text,_reason text DEFAULT '',_note text DEFAULT '') RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.listings; admin boolean;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 admin:=public.has_role(auth.uid(),'admin');
 SELECT * INTO l FROM public.listings WHERE id=_id FOR UPDATE;
 IF NOT FOUND OR (l.user_id<>auth.uid() AND NOT admin) THEN RAISE EXCEPTION 'Forbidden'; END IF;
 IF _action NOT IN ('draft','withdrawn','sold','delete','block','unblock','restore') THEN RAISE EXCEPTION 'Invalid action'; END IF;
 IF NOT admin AND (_action IN ('block','unblock','restore') OR public.profile_is_blocked(auth.uid())) THEN RAISE EXCEPTION 'Forbidden'; END IF;
 IF NOT admin AND (l.deleted_at IS NOT NULL OR l.blocked) THEN RAISE EXCEPTION 'Forbidden'; END IF;
 IF _action IN ('delete','sold') AND (EXISTS(SELECT 1 FROM public.art_orders WHERE listing_id=_id AND status NOT IN ('expired','failed','refunded','completed')) OR EXISTS(SELECT 1 FROM public.bids WHERE listing_id=_id AND status='accepted' AND NOT EXISTS(SELECT 1 FROM public.art_orders WHERE listing_id=_id AND status IN ('refunded','completed')))) THEN RAISE EXCEPTION 'Annonsen er knyttet til en pågående handel. Handelen må avklares før annonsen kan slettes.'; END IF;
 IF _action='sold' AND l.moderation_status='sold' THEN RETURN; END IF;
 IF admin AND _action IN ('block','delete') AND coalesce(trim(_reason),'')='' THEN RAISE EXCEPTION 'Begrunnelse kreves'; END IF;
 IF _action='delete' THEN
  UPDATE public.listings SET deleted_at=coalesce(deleted_at,now()),moderation_status=CASE WHEN moderation_status='sold' THEN 'sold' ELSE 'withdrawn' END,updated_at=now() WHERE id=_id;
 ELSIF _action='restore' THEN
  UPDATE public.listings SET deleted_at=NULL,updated_at=now() WHERE id=_id;
 ELSIF _action IN ('block','unblock') THEN
  UPDATE public.listings SET blocked=(_action='block'),moderation_status=CASE WHEN moderation_status='sold' THEN 'sold' ELSE 'withdrawn' END,updated_at=now() WHERE id=_id;
 ELSIF _action='draft' THEN
  UPDATE public.listing_revisions SET status='draft',version=version+1,updated_at=now() WHERE listing_id=_id AND status='pending';
 ELSE
  IF l.moderation_status='sold' AND _action<>'withdrawn' THEN RAISE EXCEPTION 'Verket er allerede solgt'; END IF;
  UPDATE public.listings SET moderation_status=CASE WHEN moderation_status='sold' THEN 'sold' ELSE _action END,updated_at=now() WHERE id=_id;
 END IF;
 IF _action IN ('delete','withdrawn','block','sold') THEN UPDATE public.listing_revisions SET status=CASE WHEN _action='sold' THEN 'sold' ELSE 'withdrawn' END,updated_at=now() WHERE listing_id=_id AND status IN ('draft','pending','changes_requested'); END IF;
 IF admin THEN INSERT INTO public.administrative_actions(actor_id,target_type,target_id,action,reason,internal_note,before_data,after_data) VALUES(auth.uid(),'listing',_id,_action,nullif(trim(_reason),''),nullif(trim(_note),''),to_jsonb(l),(SELECT to_jsonb(x) FROM public.listings x WHERE id=_id)); END IF;
END; $$;
REVOKE ALL ON FUNCTION public.manage_listing_visibility(text,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.manage_listing_visibility(text,text,text,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.change_listing_visibility(_id text,_action text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN PERFORM public.manage_listing_visibility(_id,_action,'',''); END; $$;
CREATE OR REPLACE FUNCTION public.manage_profile_restriction(_user uuid,_blocked boolean,_reason text,_note text DEFAULT '') RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
 IF _user=auth.uid() THEN RAISE EXCEPTION 'Du kan ikke sperre din egen profil'; END IF;
 IF _blocked AND coalesce(trim(_reason),'')='' THEN RAISE EXCEPTION 'Begrunnelse kreves'; END IF;
 PERFORM 1 FROM public.profiles WHERE id=_user FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Profilen finnes ikke'; END IF;
 INSERT INTO public.profile_restrictions(user_id,blocked,reason) VALUES(_user,_blocked,nullif(trim(_reason),'')) ON CONFLICT(user_id) DO UPDATE SET blocked=EXCLUDED.blocked,reason=EXCLUDED.reason,updated_at=now();
 IF _blocked THEN
  UPDATE public.listings SET moderation_status='withdrawn',updated_at=now() WHERE user_id=_user AND moderation_status='published';
  UPDATE public.listing_revisions SET status='withdrawn',updated_at=now() WHERE user_id=_user AND status='pending';
 END IF;
 INSERT INTO public.administrative_actions(actor_id,target_type,target_id,action,reason,internal_note) VALUES(auth.uid(),'profile',_user::text,CASE WHEN _blocked THEN 'block' ELSE 'unblock' END,nullif(trim(_reason),''),nullif(trim(_note),''));
END; $$;
REVOKE ALL ON FUNCTION public.manage_profile_restriction(uuid,boolean,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.manage_profile_restriction(uuid,boolean,text,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.guard_unpublished_trade() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.listings;
BEGIN
 SELECT * INTO l FROM public.listings WHERE id=NEW.listing_id FOR UPDATE;
 IF l.moderation_status IS DISTINCT FROM 'published' OR l.deleted_at IS NOT NULL OR l.blocked OR public.profile_is_blocked(l.user_id) THEN RAISE EXCEPTION 'Annonsen er ikke publisert'; END IF;
 IF public.profile_is_blocked(NEW.buyer_id) THEN RAISE EXCEPTION 'Profilen er sperret'; END IF;
 RETURN NEW;
END; $$;
CREATE OR REPLACE FUNCTION public.guard_restricted_listing_revision() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF public.profile_is_blocked(NEW.user_id) THEN RAISE EXCEPTION 'Profilen er sperret'; END IF;
 IF EXISTS(SELECT 1 FROM public.listings WHERE id=NEW.listing_id AND (deleted_at IS NOT NULL OR blocked)) THEN RAISE EXCEPTION 'Annonsen er sperret eller slettet'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER guard_restricted_listing_revision BEFORE INSERT OR UPDATE ON public.listing_revisions FOR EACH ROW EXECUTE FUNCTION public.guard_restricted_listing_revision();
CREATE OR REPLACE FUNCTION public.guard_restricted_message() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF public.profile_is_blocked(NEW.sender_id) THEN RAISE EXCEPTION 'Profilen er sperret'; END IF; RETURN NEW; END; $$;
CREATE TRIGGER guard_restricted_message BEFORE INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.guard_restricted_message();
CREATE OR REPLACE FUNCTION public.guard_restricted_publication() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NEW.moderation_status='published' AND (NEW.deleted_at IS NOT NULL OR NEW.blocked OR public.profile_is_blocked(NEW.user_id)) THEN RAISE EXCEPTION 'Annonsen er sperret eller slettet'; END IF; RETURN NEW; END; $$;
CREATE TRIGGER guard_restricted_publication BEFORE INSERT OR UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.guard_restricted_publication();
REVOKE ALL ON FUNCTION public.guard_restricted_listing_revision(),public.guard_restricted_message(),public.guard_restricted_publication() FROM PUBLIC,anon,authenticated;
COMMENT ON COLUMN public.listings.deleted_at IS 'Soft deletion; retain immutable orders, reviewed snapshots and referenced images. Restoration never republishes without review.';