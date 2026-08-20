ALTER TABLE public.b2b_managed_products ADD COLUMN IF NOT EXISTS subcategory text;

DROP VIEW IF EXISTS public.managed_products_public;
CREATE VIEW public.managed_products_public AS
 SELECT id,
    slug,
    name,
    model_name,
    description,
    detailed_description,
    category,
    subcategory,
    available_locations,
    images,
    specifications,
    features,
    tags,
    rental_notes,
    price_per_day,
    price_weekend,
    price_per_month,
    min_rental_months,
    weight_kg,
    drive_type,
    rentware_code,
    on_request,
    pdf_url,
    external_manual_url,
    video_url,
    video_urls,
    sort_order,
    seo_meta_description,
    seo_faqs,
    seo_local_content,
    image_alts,
    price_unit_label,
    created_at,
    updated_at
   FROM public.b2b_managed_products
  WHERE is_published = true;

GRANT SELECT ON public.managed_products_public TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.managed_products_public FROM anon;