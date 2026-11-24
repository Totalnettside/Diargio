CREATE TABLE public.art_payment_notices (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),order_id uuid NOT NULL REFERENCES public.art_orders(id),user_id uuid NOT NULL,status text NOT NULL,title text NOT NULL,read_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(order_id,user_id,status));
GRANT SELECT ON public.art_payment_notices TO authenticated;
GRANT UPDATE(read_at) ON public.art_payment_notices TO authenticated;
GRANT ALL ON public.art_payment_notices TO service_role;
ALTER TABLE public.art_payment_notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recipient reads payment notices" ON public.art_payment_notices FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY "Recipient marks payment notices read" ON public.art_payment_notices FOR UPDATE TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE OR REPLACE FUNCTION public.notify_art_payment_transition() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE label text;
BEGIN
 IF NEW.environment<>'live' OR NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
 label=CASE NEW.status WHEN 'paid' THEN 'Betaling bekreftet' WHEN 'shipped' THEN 'Verket er sendt eller klart for henting' WHEN 'approved' THEN 'Kjøper har godkjent mottak' WHEN 'paid_out' THEN 'Selgerandel overført til Stripe' WHEN 'disputed' THEN 'Oppgjøret er satt på vent' WHEN 'refunded' THEN 'Betalingen er refundert' ELSE NULL END;
 IF label IS NULL THEN RETURN NEW; END IF;
 INSERT INTO public.art_payment_notices(order_id,user_id,status,title) VALUES(NEW.id,NEW.buyer_id,NEW.status,label),(NEW.id,NEW.seller_id,NEW.status,label) ON CONFLICT DO NOTHING;
 RETURN NEW;
END; $$;
CREATE TRIGGER notify_art_payment_transition AFTER UPDATE ON public.art_orders FOR EACH ROW EXECUTE FUNCTION public.notify_art_payment_transition();
REVOKE ALL ON FUNCTION public.notify_art_payment_transition() FROM PUBLIC,anon,authenticated;