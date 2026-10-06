CREATE TABLE public.listings (
  id text PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listings viewable by everyone" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Users insert own listings" ON public.listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners or admins update listings" ON public.listings FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners or admins delete listings" ON public.listings FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Artwork images public read" ON storage.objects FOR SELECT USING (bucket_id = 'artworks');
CREATE POLICY "Users upload own artwork images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'artworks' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own artwork images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'artworks' AND auth.uid()::text = (storage.foldername(name))[1]);