REVOKE INSERT, UPDATE, DELETE ON public.purchases FROM authenticated, anon;
DROP POLICY IF EXISTS "Buyer records purchase" ON public.purchases;
REVOKE UPDATE ON public.messages FROM authenticated;
GRANT UPDATE (read_at) ON public.messages TO authenticated;
REVOKE UPDATE ON public.conversations FROM authenticated;
GRANT UPDATE (updated_at) ON public.conversations TO authenticated;
DROP POLICY IF EXISTS "Buyer starts conversation" ON public.conversations;
CREATE POLICY "Buyer starts validated conversation" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id AND buyer_id <> seller_id AND EXISTS (SELECT 1 FROM public.listings l WHERE l.id=listing_id AND l.user_id=seller_id));
REVOKE SELECT, INSERT, UPDATE ON public.profiles FROM anon, authenticated;
GRANT SELECT (id,display_name,avatar_url,bio,bankid_verified,created_at,updated_at,location,website,story,techniques,studio_images) ON public.profiles TO anon,authenticated;
GRANT UPDATE (display_name,avatar_url,bio,first_name,last_name,phone,location,website,onboarded,story,techniques,studio_images,updated_at) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
REVOKE UPDATE ON public.bids FROM authenticated;
GRANT UPDATE (read_at) ON public.bids TO authenticated;
CREATE TABLE public.account_library (user_id uuid PRIMARY KEY, data jsonb NOT NULL DEFAULT '{}'::jsonb, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.account_library TO authenticated;
GRANT ALL ON public.account_library TO service_role;
ALTER TABLE public.account_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage library" ON public.account_library FOR ALL TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
CREATE TABLE public.art_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), buyer_id uuid NOT NULL, seller_id uuid NOT NULL, listing_id text NOT NULL,
 environment text NOT NULL, status text NOT NULL DEFAULT 'reserved', snapshot jsonb NOT NULL,
 artwork_amount bigint NOT NULL, shipping_amount bigint NOT NULL DEFAULT 0, total_amount bigint NOT NULL,
 currency text NOT NULL DEFAULT 'nok', expires_at timestamptz NOT NULL DEFAULT now()+interval '31 minutes',
 stripe_session_id text UNIQUE, stripe_payment_id text UNIQUE, stripe_refund_id text UNIQUE,
 shipping_note text, dispute_note text, admin_note text, paid_at timestamptz, approved_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT order_environment CHECK (environment IN ('sandbox','live')),
 CONSTRAINT order_status CHECK (status IN ('reserved','pending','paid','shipped','approved','disputed','refund_pending','refunded','expired','failed','payout_pending','paid_out')),
 CONSTRAINT order_amounts CHECK (artwork_amount>0 AND shipping_amount>=0 AND total_amount=artwork_amount+shipping_amount),
 CONSTRAINT order_parties CHECK (buyer_id<>seller_id)
);
GRANT SELECT ON public.art_orders TO authenticated;
GRANT ALL ON public.art_orders TO service_role;
ALTER TABLE public.art_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties and admins read orders" ON public.art_orders FOR SELECT TO authenticated USING (auth.uid() IN (buyer_id,seller_id) OR public.has_role(auth.uid(),'admin'));
CREATE UNIQUE INDEX one_unsettled_order_per_artwork ON public.art_orders(listing_id,environment) WHERE status NOT IN ('expired','failed','refunded');
CREATE TABLE public.payment_events (event_id text NOT NULL, environment text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(event_id,environment));
GRANT ALL ON public.payment_events TO service_role;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.artist_payment_accounts (user_id uuid NOT NULL, environment text NOT NULL, stripe_account_id text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,environment));
GRANT SELECT ON public.artist_payment_accounts TO authenticated;
GRANT ALL ON public.artist_payment_accounts TO service_role;
ALTER TABLE public.artist_payment_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner reads payment account" ON public.artist_payment_accounts FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE OR REPLACE FUNCTION public.reserve_art_order(_buyer uuid,_listing text,_environment text,_snapshot jsonb,_artwork bigint,_shipping bigint) RETURNS public.art_orders LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.listings; o public.art_orders;
BEGIN
 IF _environment NOT IN ('sandbox','live') THEN RAISE EXCEPTION 'Invalid environment'; END IF;
 SELECT * INTO l FROM public.listings WHERE id=_listing FOR UPDATE;
 IF NOT FOUND OR l.user_id=_buyer THEN RAISE EXCEPTION 'Artwork unavailable'; END IF;
 IF EXISTS(SELECT 1 FROM public.purchases WHERE listing_id=_listing) THEN RAISE EXCEPTION 'Artwork sold'; END IF;
 UPDATE public.art_orders SET status='expired',updated_at=now() WHERE listing_id=_listing AND environment=_environment AND status='reserved' AND expires_at<now();
 SELECT * INTO o FROM public.art_orders WHERE listing_id=_listing AND environment=_environment AND status NOT IN ('expired','failed','refunded');
 IF FOUND THEN
  IF o.buyer_id=_buyer AND o.status='reserved' AND o.expires_at>now() THEN RETURN o; END IF;
  RAISE EXCEPTION 'Artwork reserved';
 END IF;
 INSERT INTO public.art_orders(buyer_id,seller_id,listing_id,environment,snapshot,artwork_amount,shipping_amount,total_amount) VALUES(_buyer,l.user_id,_listing,_environment,_snapshot,_artwork,_shipping,_artwork+_shipping) RETURNING * INTO o;
 RETURN o;
END; $$;
REVOKE ALL ON FUNCTION public.reserve_art_order(uuid,text,text,jsonb,bigint,bigint) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_art_order(uuid,text,text,jsonb,bigint,bigint) TO service_role;
CREATE OR REPLACE FUNCTION public.confirm_art_payment(_order uuid,_session text,_payment text,_amount bigint,_currency text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.art_orders;
BEGIN
 SELECT * INTO o FROM public.art_orders WHERE id=_order FOR UPDATE;
 IF NOT FOUND OR o.stripe_session_id IS DISTINCT FROM _session OR o.total_amount<>_amount OR lower(_currency)<>o.currency THEN RAISE EXCEPTION 'Payment does not match order'; END IF;
 IF o.status IN ('paid','shipped','approved','disputed','refund_pending','refunded','payout_pending','paid_out') THEN RETURN; END IF;
 IF o.status NOT IN ('reserved','pending') THEN RAISE EXCEPTION 'Payment requires reconciliation'; END IF;
 UPDATE public.art_orders SET status='paid',stripe_payment_id=_payment,paid_at=now(),updated_at=now() WHERE id=o.id;
 IF o.environment='live' THEN
  IF EXISTS(SELECT 1 FROM public.purchases WHERE listing_id=o.listing_id) THEN RAISE EXCEPTION 'Artwork already sold'; END IF;
  INSERT INTO public.purchases(buyer_id,seller_id,listing_id) VALUES(o.buyer_id,o.seller_id,o.listing_id);
 END IF;
END; $$;
REVOKE ALL ON FUNCTION public.confirm_art_payment(uuid,text,text,bigint,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_art_payment(uuid,text,text,bigint,text) TO service_role;
COMMENT ON COLUMN public.profiles.vipps_sub IS 'DEPRECATED: Vipps login removed; identity linkage is not client writable';
COMMENT ON TABLE public.purchases IS 'Legacy confirmed-live-sale marker; client writes revoked. Financial truth is art_orders.';