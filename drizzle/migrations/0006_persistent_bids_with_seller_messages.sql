CREATE TABLE public.bids (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 listing_id text NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
 buyer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
 seller_id uuid NOT NULL REFERENCES auth.users(id),
 conversation_id uuid REFERENCES public.conversations(id),
 amount numeric NOT NULL CHECK (amount > 0 AND amount <= 1000000000),
 message text CHECK (length(message) <= 2000),
 read_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (buyer_id <> seller_id)
);
GRANT SELECT, INSERT ON public.bids TO authenticated;
GRANT UPDATE (read_at) ON public.bids TO authenticated;
GRANT ALL ON public.bids TO service_role;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties read bids" ON public.bids FOR SELECT TO authenticated USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers submit bids to listing owner" ON public.bids FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id AND buyer_id <> seller_id AND EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.user_id = seller_id));
CREATE POLICY "Seller marks bids read" ON public.bids FOR UPDATE TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);
CREATE INDEX bids_seller_created_idx ON public.bids (seller_id, created_at DESC);
CREATE INDEX bids_buyer_created_idx ON public.bids (buyer_id, created_at DESC);
CREATE OR REPLACE FUNCTION public.deliver_bid_message() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
 IF NEW.buyer_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.listings WHERE id = NEW.listing_id AND user_id = NEW.seller_id AND user_id <> auth.uid()) THEN RAISE EXCEPTION 'Invalid seller'; END IF;
 INSERT INTO public.conversations(listing_id, buyer_id, seller_id) VALUES(NEW.listing_id, NEW.buyer_id, NEW.seller_id) ON CONFLICT(listing_id, buyer_id) DO NOTHING;
 SELECT id INTO NEW.conversation_id FROM public.conversations WHERE listing_id = NEW.listing_id AND buyer_id = NEW.buyer_id AND seller_id = NEW.seller_id;
 IF NEW.conversation_id IS NULL THEN RAISE EXCEPTION 'Conversation unavailable'; END IF;
 INSERT INTO public.messages(conversation_id, sender_id, body) VALUES(NEW.conversation_id, NEW.buyer_id, 'Bud: ' || NEW.amount::text || ' kr' || CASE WHEN coalesce(NEW.message, '') <> '' THEN E'\n' || NEW.message ELSE '' END);
 RETURN NEW;
END; $$;
CREATE TRIGGER deliver_bid_message BEFORE INSERT ON public.bids FOR EACH ROW EXECUTE FUNCTION public.deliver_bid_message();
CREATE OR REPLACE FUNCTION public.submit_artwork_bid(_listing_id text, _amount numeric, _message text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE _seller uuid; _id uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 SELECT user_id INTO _seller FROM public.listings WHERE id = _listing_id;
 IF _seller IS NULL OR _seller = auth.uid() THEN RAISE EXCEPTION 'Invalid listing'; END IF;
 INSERT INTO public.bids(listing_id, buyer_id, seller_id, amount, message) VALUES(_listing_id, auth.uid(), _seller, _amount, NULLIF(trim(_message), '')) RETURNING id INTO _id;
 RETURN _id;
END; $$;
REVOKE ALL ON FUNCTION public.submit_artwork_bid(text, numeric, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_artwork_bid(text, numeric, text) TO authenticated;
ALTER TABLE public.bids REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;