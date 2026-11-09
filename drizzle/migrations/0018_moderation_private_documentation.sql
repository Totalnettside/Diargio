CREATE POLICY "Listing owners upload documentation" ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='listing-documentation' AND (storage.foldername(name))[1]=auth.uid()::text AND EXISTS(SELECT 1 FROM public.listings l WHERE l.id=(storage.foldername(name))[2] AND l.user_id=auth.uid()));
CREATE POLICY "Owners and admins read listing documentation" ON storage.objects FOR SELECT TO authenticated USING(bucket_id='listing-documentation' AND ((storage.foldername(name))[1]=auth.uid()::text OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "Owners remove listing documentation" ON storage.objects FOR DELETE TO authenticated USING(bucket_id='listing-documentation' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE OR REPLACE FUNCTION public.guard_listing_status_transition() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_OP='UPDATE' AND OLD.moderation_status='sold' AND NEW.moderation_status<>'sold' THEN RAISE EXCEPTION 'Solgte annonser kan ikke gjenpubliseres'; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_listing_status_transition() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER guard_listing_status BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.guard_listing_status_transition();