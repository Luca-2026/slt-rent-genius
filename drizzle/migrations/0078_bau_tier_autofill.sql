ALTER TABLE public.b2b_managed_products ADD COLUMN tier_prices_manual text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.b2b_managed_product_location_prices ADD COLUMN tier_prices_manual text[] NOT NULL DEFAULT '{}';

INSERT INTO public.migration_price_log (managed_product_id, old_values, new_values, warning)
SELECT id,
  jsonb_build_object('price_from_3_rd', price_from_3_rd, 'price_from_10_rd', price_from_10_rd, 'price_from_20_rd', price_from_20_rd),
  jsonb_build_object('price_from_3_rd', round(price_from_1_rd * 0.9), 'price_from_10_rd', round(price_from_1_rd * 0.8), 'price_from_20_rd', round(price_from_1_rd * 0.6)),
  'Staffelpreise automatisch aus Tagespreis berechnet (−10 %/−20 %/−40 %, kaufmännisch auf volle Euro gerundet)'
FROM public.b2b_managed_products
WHERE pricing_scheme = 'bau' AND price_from_1_rd IS NOT NULL;

UPDATE public.b2b_managed_products
SET price_from_3_rd = round(price_from_1_rd * 0.9),
    price_from_10_rd = round(price_from_1_rd * 0.8),
    price_from_20_rd = round(price_from_1_rd * 0.6),
    price_per_month = replace(to_char(round(price_from_1_rd * 0.6) * 20, 'FM999990D00'), '.', ',') || ' €'
WHERE pricing_scheme = 'bau' AND price_from_1_rd IS NOT NULL;