CREATE OR REPLACE VIEW public.managed_products_public AS
SELECT id, slug, name, model_name, description, detailed_description, category, subcategory, available_locations, images, specifications, features, tags, rental_notes, price_per_day, price_weekend, price_per_month, min_rental_months, weight_kg, drive_type, rentware_code, on_request, pdf_url, external_manual_url, video_url, video_urls, sort_order, seo_meta_description, seo_faqs, seo_local_content, seo_title, seo_use_case_bau, seo_use_case_event, seo_use_case_privat, related_slugs, image_alts, price_unit_label, addon_options, created_at, updated_at, spec_order, stocked_locations, suggested_accessory_slugs,
  pricing_scheme, main_category, price_from_1_rd, price_from_3_rd, price_from_10_rd, price_from_20_rd, price_weekend_num, price_base_1_3_cd, surcharge_per_cd_from_4, surcharge_per_cd_from_8
FROM public.b2b_managed_products
WHERE is_published = true;
GRANT SELECT ON public.managed_products_public TO anon, authenticated;