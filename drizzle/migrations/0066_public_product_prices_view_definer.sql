CREATE OR REPLACE VIEW public.public_product_prices AS
SELECT lp.managed_product_id,
       lp.location,
       lp.price_from_1_rd,
       lp.price_from_3_rd,
       lp.price_from_10_rd,
       lp.price_from_20_rd,
       lp.price_weekend_num,
       lp.price_base_1_3_cd,
       lp.surcharge_per_cd_from_4,
       lp.surcharge_per_cd_from_8
FROM public.b2b_managed_product_location_prices lp
JOIN public.b2b_managed_products p ON p.id = lp.managed_product_id
WHERE p.is_published = true;