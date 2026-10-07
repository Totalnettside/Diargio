ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS story text,
  ADD COLUMN IF NOT EXISTS techniques text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS studio_images text[] NOT NULL DEFAULT '{}';

CREATE TABLE public.artist_follows (
  follower_id uuid NOT NULL DEFAULT auth.uid(),
  artist_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, artist_id),
  CHECK (follower_id <> artist_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.artist_follows TO authenticated;
GRANT ALL ON public.artist_follows TO service_role;
ALTER TABLE public.artist_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Followers read own follows" ON public.artist_follows FOR SELECT TO authenticated USING (auth.uid() = follower_id);
CREATE POLICY "Followers add follows" ON public.artist_follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Followers update own follows" ON public.artist_follows FOR UPDATE TO authenticated USING (auth.uid() = follower_id) WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Followers remove follows" ON public.artist_follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

CREATE OR REPLACE FUNCTION public.artist_follower_count(_artist uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT count(*)::int FROM public.artist_follows WHERE artist_id = _artist $$;

CREATE OR REPLACE FUNCTION public.sold_listing_ids(_seller uuid)
RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT DISTINCT listing_id FROM public.purchases WHERE seller_id = _seller $$;

GRANT EXECUTE ON FUNCTION public.artist_follower_count(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sold_listing_ids(uuid) TO anon, authenticated;