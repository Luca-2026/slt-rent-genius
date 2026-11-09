CREATE POLICY "Active branch managers read customer document PDFs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'b2b-invoices'
  AND public.has_role(auth.uid(), 'niederlassungsleiter'::public.app_role)
  AND EXISTS (
    SELECT 1 FROM public.staff_profiles s
    WHERE s.user_id = auth.uid() AND s.is_active = true
  )
);
