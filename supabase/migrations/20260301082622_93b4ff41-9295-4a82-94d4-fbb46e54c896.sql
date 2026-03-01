
-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can download their own invoices" ON storage.objects;

-- Create a properly scoped SELECT policy using folder-based isolation
-- Files are stored as: invoices/{profile_id}/... or offers/{profile_id}/...
CREATE POLICY "Users can download their own invoices"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'b2b-invoices'
  AND (
    -- User can only access files in folders matching their b2b_profile_id
    (storage.foldername(name))[2]::text IN (
      SELECT id::text FROM public.b2b_profiles WHERE user_id = auth.uid()
    )
    -- Admins can access all invoices
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    -- Staff roles that need invoice access
    OR public.has_role(auth.uid(), 'buchhaltung'::public.app_role)
    OR public.has_role(auth.uid(), 'standort_mitarbeiter'::public.app_role)
  )
);
