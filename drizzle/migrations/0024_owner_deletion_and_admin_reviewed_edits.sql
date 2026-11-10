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
 IF admin AND l.user_id<>auth.uid() AND _action IN ('block','delete') AND coalesce(trim(_reason),'')='' THEN RAISE EXCEPTION 'Begrunnelse kreves'; END IF;
 IF _action='delete' THEN UPDATE public.listings SET deleted_at=coalesce(deleted_at,now()),moderation_status=CASE WHEN moderation_status='sold' THEN 'sold' ELSE 'withdrawn' END,updated_at=now() WHERE id=_id;
 ELSIF _action='restore' THEN UPDATE public.listings SET deleted_at=NULL,updated_at=now() WHERE id=_id;
 ELSIF _action IN ('block','unblock') THEN UPDATE public.listings SET blocked=(_action='block'),moderation_status=CASE WHEN moderation_status='sold' THEN 'sold' ELSE 'withdrawn' END,updated_at=now() WHERE id=_id;
 ELSIF _action='draft' THEN UPDATE public.listing_revisions SET status='draft',version=version+1,updated_at=now() WHERE listing_id=_id AND status='pending';
 ELSE
  IF l.moderation_status='sold' AND _action<>'withdrawn' THEN RAISE EXCEPTION 'Verket er allerede solgt'; END IF;
  UPDATE public.listings SET moderation_status=CASE WHEN moderation_status='sold' THEN 'sold' ELSE _action END,updated_at=now() WHERE id=_id;
 END IF;
 IF _action IN ('delete','withdrawn','block','sold') THEN UPDATE public.listing_revisions SET status=CASE WHEN _action='sold' THEN 'sold' ELSE 'withdrawn' END,updated_at=now() WHERE listing_id=_id AND status IN ('draft','pending','changes_requested'); END IF;
 IF admin THEN INSERT INTO public.administrative_actions(actor_id,target_type,target_id,action,reason,internal_note,before_data,after_data) VALUES(auth.uid(),'listing',_id,_action,nullif(trim(_reason),''),nullif(trim(_note),''),to_jsonb(l),(SELECT to_jsonb(x) FROM public.listings x WHERE id=_id)); END IF;
END; $$;
CREATE OR REPLACE FUNCTION public.admin_save_listing_revision(_id text,_data jsonb,_reason text DEFAULT '',_note text DEFAULT '') RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.listings; r public.listing_revisions; clean jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
 SELECT * INTO l FROM public.listings WHERE id=_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Fant ikke annonsen'; END IF;
 IF l.deleted_at IS NOT NULL OR l.blocked OR l.moderation_status='sold' THEN RAISE EXCEPTION 'Annonsen er sperret, slettet eller solgt'; END IF;
 IF EXISTS(SELECT 1 FROM public.art_orders WHERE listing_id=_id AND status NOT IN ('expired','failed','refunded','completed')) THEN RAISE EXCEPTION 'Annonsen har en aktiv ordre'; END IF;
 clean:=(_data-ARRAY['moderationStatus','sellerMessage','revisionId','revisionVersion'])||jsonb_build_object('id',_id,'sellerId',l.user_id);
 IF coalesce(trim(clean->>'title'),'')='' OR coalesce(clean->>'image','')='' OR jsonb_array_length(coalesce(clean->'images',jsonb_build_array(clean->'image')))=0 THEN RAISE EXCEPTION 'Bilde og tittel kreves'; END IF;
 SELECT * INTO r FROM public.listing_revisions WHERE listing_id=_id AND status IN ('draft','pending','changes_requested') FOR UPDATE;
 IF NOT FOUND THEN INSERT INTO public.listing_revisions(listing_id,user_id,data) VALUES(_id,l.user_id,clean) RETURNING * INTO r;
 ELSE UPDATE public.listing_revisions SET data=clean,status='draft',version=version+1,updated_at=now() WHERE id=r.id; END IF;
 INSERT INTO public.administrative_actions(actor_id,target_type,target_id,action,reason,internal_note,before_data,after_data) VALUES(auth.uid(),'listing',_id,'edit',nullif(trim(_reason),''),nullif(trim(_note),''),l.data,clean);
 RETURN r.id;
END; $$;
REVOKE ALL ON FUNCTION public.admin_save_listing_revision(text,jsonb,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_save_listing_revision(text,jsonb,text,text) TO authenticated;