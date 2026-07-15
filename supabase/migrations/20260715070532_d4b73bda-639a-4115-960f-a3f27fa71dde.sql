
-- View auf security_invoker umstellen (Erwartung von Supabase)
ALTER VIEW public.managed_products_public SET (security_invoker = on);

-- Public/authenticated darf veröffentlichte Zeilen sehen – RLS-Policy erlaubt SELECT
CREATE POLICY "Public can select published managed products"
  ON public.b2b_managed_products FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Um interne Felder (quantities, quantity_notes) trotzdem zu schützen, entziehen wir
-- den kompletten Table-Grant an public/authenticated und geben nur ausgewählte Spalten frei.
REVOKE SELECT ON public.b2b_managed_products FROM authenticated;

GRANT SELECT (
  id, slug, name, model_name, description, detailed_description,
  category, available_locations, images, specifications, features, tags,
  rental_notes, price_per_day, price_weekend, price_per_month, min_rental_months,
  weight_kg, drive_type, rentware_code, on_request, pdf_url, external_manual_url,
  video_url, video_urls, sort_order, seo_meta_description, seo_faqs, seo_local_content,
  is_published, created_at, updated_at
) ON public.b2b_managed_products TO anon, authenticated;

-- INSERT/UPDATE/DELETE für authenticated wiederherstellen (RLS-Policy filtert auf Admin)
GRANT INSERT, UPDATE, DELETE ON public.b2b_managed_products TO authenticated;

-- Admins brauchen zusätzlich Zugriff auf die internen Spalten – dafür geben wir authenticated
-- Column-Level-Rechte auf die internen Felder (RLS-Policy "Admins can select all managed products" filtert)
GRANT SELECT (quantities, quantity_notes, created_by, updated_by)
  ON public.b2b_managed_products TO authenticated;
