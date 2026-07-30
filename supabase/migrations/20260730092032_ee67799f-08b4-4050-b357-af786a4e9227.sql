CREATE OR REPLACE VIEW public.managed_products_public AS
  SELECT id, slug, name, model_name, description, detailed_description, category,
    available_locations, images, specifications, features, tags, rental_notes,
    price_per_day, price_weekend, price_per_month, min_rental_months, weight_kg,
    drive_type, rentware_code, on_request, pdf_url, external_manual_url, video_url,
    video_urls, sort_order, seo_meta_description, seo_faqs, seo_local_content,
    created_at, updated_at, image_alts
  FROM public.b2b_managed_products
  WHERE is_published = true;