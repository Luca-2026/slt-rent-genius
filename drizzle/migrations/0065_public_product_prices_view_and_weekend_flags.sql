CREATE OR REPLACE VIEW public.public_product_prices
WITH (security_invoker = true) AS
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

GRANT SELECT ON public.public_product_prices TO anon;
GRANT SELECT ON public.public_product_prices TO authenticated;
GRANT SELECT ON public.public_product_prices TO service_role;

ALTER TABLE public.rental_inquiries ADD COLUMN use_saturday boolean NOT NULL DEFAULT false;
ALTER TABLE public.rental_inquiries ADD COLUMN use_sunday boolean NOT NULL DEFAULT false;