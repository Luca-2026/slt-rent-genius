
-- 1. Lock sensitive fields on b2b_reservations user-update policy
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.b2b_reservations;
CREATE POLICY "Users can update their own reservations"
ON public.b2b_reservations
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND status IS NOT DISTINCT FROM (SELECT status FROM public.b2b_reservations r2 WHERE r2.id = b2b_reservations.id)
  AND discounted_price IS NOT DISTINCT FROM (SELECT discounted_price FROM public.b2b_reservations r2 WHERE r2.id = b2b_reservations.id)
  AND original_price IS NOT DISTINCT FROM (SELECT original_price FROM public.b2b_reservations r2 WHERE r2.id = b2b_reservations.id)
  AND deposit IS NOT DISTINCT FROM (SELECT deposit FROM public.b2b_reservations r2 WHERE r2.id = b2b_reservations.id)
);

-- 2. Allow authorized persons to view offer items for their company
CREATE POLICY "Authorized persons can view company offer items"
ON public.b2b_offer_items
FOR SELECT
USING (
  offer_id IN (
    SELECT o.id FROM public.b2b_offers o
    WHERE o.b2b_profile_id IN (SELECT public.get_authorized_profile_ids(auth.uid()))
  )
);

-- 3. Tighten bewerbungen upload policy: enforce allowed extensions and no path traversal
DROP POLICY IF EXISTS "Anyone can upload application documents" ON storage.objects;
CREATE POLICY "Anyone can upload application documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'bewerbungen'
  AND position('..' in name) = 0
  AND lower(name) ~ '\.(pdf|doc|docx)$'
);

-- 4. Remove broad SELECT (listing) policy on brand-assets bucket. Public CDN
--    delivery of files in a public bucket continues to work without it.
DROP POLICY IF EXISTS "Brand assets are publicly accessible" ON storage.objects;
