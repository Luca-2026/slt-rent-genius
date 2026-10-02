CREATE POLICY "Operative staff upload product images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.can_edit_operations(auth.uid()));
CREATE POLICY "Operative staff update product images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.can_edit_operations(auth.uid()));
CREATE POLICY "Operative staff delete product images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.can_edit_operations(auth.uid()));
CREATE POLICY "Operative staff upload brand assets" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'brand-assets' AND public.can_edit_operations(auth.uid()));