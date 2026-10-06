CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (buyer_id, listing_id)
);
GRANT SELECT, INSERT ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties read purchases" ON public.purchases FOR SELECT TO authenticated USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyer records purchase" ON public.purchases FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id AND buyer_id <> seller_id);
DROP POLICY "Users write own reviews" ON public.reviews;
CREATE POLICY "Buyers write reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = reviewer_id AND reviewer_id <> seller_id
  AND EXISTS (SELECT 1 FROM public.purchases p WHERE p.buyer_id = reviewer_id AND p.seller_id = reviews.seller_id)
);