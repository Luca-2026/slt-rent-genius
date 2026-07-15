
-- 1. Tabelle
CREATE TABLE public.b2b_managed_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  model_name text,
  description text,
  detailed_description text,
  category text NOT NULL,
  available_locations text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
  features text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  rental_notes text[] NOT NULL DEFAULT '{}',
  price_per_day text,
  price_weekend text,
  price_per_month text,
  min_rental_months integer,
  weight_kg numeric,
  drive_type text,
  rentware_code jsonb NOT NULL DEFAULT '{}'::jsonb,
  on_request boolean NOT NULL DEFAULT false,
  pdf_url text,
  external_manual_url text,
  video_url text,
  video_urls text[] NOT NULL DEFAULT '{}',
  sort_order integer,
  seo_meta_description text,
  seo_faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo_local_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  quantities jsonb NOT NULL DEFAULT '{}'::jsonb,
  quantity_notes jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_b2b_managed_products_slug ON public.b2b_managed_products(slug);
CREATE INDEX idx_b2b_managed_products_category ON public.b2b_managed_products(category);
CREATE INDEX idx_b2b_managed_products_published ON public.b2b_managed_products(is_published);

-- 2. GRANTs
GRANT SELECT, INSERT, UPDATE, DELETE ON public.b2b_managed_products TO authenticated;
GRANT ALL ON public.b2b_managed_products TO service_role;

-- 3. RLS
ALTER TABLE public.b2b_managed_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can select all managed products"
  ON public.b2b_managed_products FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert managed products"
  ON public.b2b_managed_products FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update managed products"
  ON public.b2b_managed_products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete managed products"
  ON public.b2b_managed_products FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Öffentlicher View ohne interne Felder
CREATE VIEW public.managed_products_public AS
SELECT
  id, slug, name, model_name, description, detailed_description,
  category, available_locations, images, specifications, features, tags,
  rental_notes, price_per_day, price_weekend, price_per_month, min_rental_months,
  weight_kg, drive_type, rentware_code, on_request, pdf_url, external_manual_url,
  video_url, video_urls, sort_order, seo_meta_description, seo_faqs, seo_local_content,
  created_at, updated_at
FROM public.b2b_managed_products
WHERE is_published = true;

GRANT SELECT ON public.managed_products_public TO anon, authenticated;

-- 5. updated_at trigger
CREATE TRIGGER trg_b2b_managed_products_updated_at
  BEFORE UPDATE ON public.b2b_managed_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Storage-Policies für product-images
CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
