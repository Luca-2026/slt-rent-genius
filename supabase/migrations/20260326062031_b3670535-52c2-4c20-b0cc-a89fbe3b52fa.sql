CREATE POLICY "Admins can upload to b2b-documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'b2b-documents'
  AND has_role(auth.uid(), 'admin'::app_role)
);