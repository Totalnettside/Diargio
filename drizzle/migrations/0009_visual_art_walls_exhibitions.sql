CREATE TABLE public.art_walls (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL DEFAULT auth.uid(),
 name text NOT NULL DEFAULT 'Min kunstvegg',
 layout jsonb NOT NULL DEFAULT '{}'::jsonb,
 shared boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.art_walls TO authenticated;
GRANT SELECT ON public.art_walls TO anon;
GRANT ALL ON public.art_walls TO service_role;
ALTER TABLE public.art_walls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their walls" ON public.art_walls FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Shared walls are readable" ON public.art_walls FOR SELECT TO anon, authenticated USING (shared = true);
CREATE POLICY "Owners create walls" ON public.art_walls FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners update walls" ON public.art_walls FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners delete walls" ON public.art_walls FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TABLE public.art_exhibitions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL DEFAULT 'Ny utstilling',
 rooms jsonb NOT NULL DEFAULT '[]'::jsonb,
 published boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.art_exhibitions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.art_exhibitions TO authenticated;
GRANT ALL ON public.art_exhibitions TO service_role;
ALTER TABLE public.art_exhibitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published exhibitions are public" ON public.art_exhibitions FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY "Admins read all exhibitions" ON public.art_exhibitions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins create exhibitions" ON public.art_exhibitions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update exhibitions" ON public.art_exhibitions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete exhibitions" ON public.art_exhibitions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE OR REPLACE FUNCTION public.unavailable_artwork_ids()
RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT DISTINCT listing_id FROM public.purchases $$;
REVOKE ALL ON FUNCTION public.unavailable_artwork_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unavailable_artwork_ids() TO anon, authenticated, service_role;