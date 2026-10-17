ALTER TABLE public.payment_events ADD COLUMN processed_at timestamptz; ALTER TABLE public.payment_events ADD COLUMN processing_until timestamptz;
CREATE OR REPLACE FUNCTION public.claim_payment_event(_event text,_environment text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE e public.payment_events;
BEGIN
 INSERT INTO public.payment_events(event_id,environment) VALUES(_event,_environment) ON CONFLICT DO NOTHING;
 SELECT * INTO e FROM public.payment_events WHERE event_id=_event AND environment=_environment FOR UPDATE;
 IF e.processed_at IS NOT NULL OR e.processing_until>now() THEN RETURN false; END IF;
 UPDATE public.payment_events SET processing_until=now()+interval '2 minutes' WHERE event_id=_event AND environment=_environment;
 RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.claim_payment_event(text,text) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.claim_payment_event(text,text) TO service_role;