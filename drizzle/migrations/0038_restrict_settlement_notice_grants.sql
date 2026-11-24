REVOKE ALL ON public.art_settlements FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.art_settlements TO authenticated;
GRANT ALL ON public.art_settlements TO service_role;
REVOKE ALL ON public.art_payment_notices FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.art_payment_notices TO authenticated;
GRANT UPDATE(read_at) ON public.art_payment_notices TO authenticated;
GRANT ALL ON public.art_payment_notices TO service_role;