DROP POLICY "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
FOR SELECT TO public
USING (
  auth.uid() = id
  OR public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.user_id = profiles.id
      AND l.moderation_status IN ('published', 'sold')
      AND l.deleted_at IS NULL
      AND NOT l.blocked
  )
  OR EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.reviewer_id = profiles.id
  )
  OR (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE auth.uid() IN (c.buyer_id, c.seller_id)
        AND profiles.id IN (c.buyer_id, c.seller_id)
    )
  )
);

DROP POLICY "Reviews viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews viewable by everyone" ON public.reviews
FOR SELECT TO public
USING (
  auth.uid() = reviewer_id
  OR auth.uid() = seller_id
  OR public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.user_id = reviews.seller_id
      AND l.moderation_status IN ('published', 'sold')
      AND l.deleted_at IS NULL
      AND NOT l.blocked
  )
);

DROP POLICY "Artwork images public read" ON storage.objects;

DROP POLICY "Avatar images are public" ON storage.objects;
CREATE POLICY "Avatar images are public" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'avatars'
  AND owner_id = (SELECT auth.uid())::text
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

DROP POLICY "Owners and shared wall viewers read rooms" ON storage.objects;
CREATE POLICY "Owners and shared wall viewers read rooms" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'art-wall-rooms'
  AND owner_id = (SELECT auth.uid())::text
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);