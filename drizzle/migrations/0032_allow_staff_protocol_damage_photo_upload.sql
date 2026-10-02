CREATE POLICY "Staff can upload protocol damage photos for active customers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'b2b-documents'
  AND (storage.foldername(name))[1] = 'protocol-damages'
  AND public.is_staff_member(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.b2b_profiles p
    WHERE p.id::text = (storage.foldername(name))[2]
  )
);