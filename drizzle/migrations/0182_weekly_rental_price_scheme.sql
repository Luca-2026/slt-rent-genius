ALTER TABLE public.b2b_managed_products ADD COLUMN price_short_1_3_rd numeric(10,2), ADD COLUMN price_from_1_week numeric(10,2), ADD COLUMN price_from_2_weeks numeric(10,2), ADD COLUMN price_from_3_weeks numeric(10,2), ADD COLUMN price_from_4_weeks numeric(10,2);
ALTER TABLE public.b2b_managed_product_location_prices ADD COLUMN price_short_1_3_rd numeric(10,2), ADD COLUMN price_from_1_week numeric(10,2), ADD COLUMN price_from_2_weeks numeric(10,2), ADD COLUMN price_from_3_weeks numeric(10,2), ADD COLUMN price_from_4_weeks numeric(10,2);
ALTER TABLE public.b2b_managed_products DROP CONSTRAINT b2b_managed_products_pricing_scheme_check;
ALTER TABLE public.b2b_managed_products ADD CONSTRAINT b2b_managed_products_pricing_scheme_check CHECK (pricing_scheme IN ('bau','event','woche'));
ALTER TABLE public.b2b_managed_products ADD CONSTRAINT managed_week_prices_nonnegative CHECK (price_short_1_3_rd >= 0 AND price_from_1_week >= 0 AND price_from_2_weeks >= 0 AND price_from_3_weeks >= 0 AND price_from_4_weeks >= 0);
ALTER TABLE public.b2b_managed_product_location_prices ADD CONSTRAINT location_week_prices_nonnegative CHECK (price_short_1_3_rd >= 0 AND price_from_1_week >= 0 AND price_from_2_weeks >= 0 AND price_from_3_weeks >= 0 AND price_from_4_weeks >= 0);
DO $migration$
DECLARE definition text;
BEGIN
SELECT pg_get_functiondef(oid) INTO definition FROM pg_proc WHERE pronamespace='public'::regnamespace AND proname='save_managed_article';
IF position('''surcharge_per_cd_from_8'',''tier_prices_manual''' IN definition)=0 THEN RAISE EXCEPTION 'Unexpected article price allowlist'; END IF;
definition:=replace(definition,'''surcharge_per_cd_from_8'',''tier_prices_manual''','''surcharge_per_cd_from_8'',''price_short_1_3_rd'',''price_from_1_week'',''price_from_2_weeks'',''price_from_3_weeks'',''price_from_4_weeks'',''tier_prices_manual''');
EXECUTE definition;
SELECT rtrim(pg_get_viewdef('public.managed_products_public'::regclass,true),';') INTO definition;
EXECUTE 'CREATE OR REPLACE VIEW public.managed_products_public AS SELECT old.*,p.price_short_1_3_rd,p.price_from_1_week,p.price_from_2_weeks,p.price_from_3_weeks,p.price_from_4_weeks FROM ('||definition||') old JOIN public.b2b_managed_products p ON p.id=old.id';
SELECT rtrim(pg_get_viewdef('public.public_product_prices'::regclass,true),';') INTO definition;
EXECUTE 'CREATE OR REPLACE VIEW public.public_product_prices AS SELECT old.*,lp.price_short_1_3_rd,lp.price_from_1_week,lp.price_from_2_weeks,lp.price_from_3_weeks,lp.price_from_4_weeks FROM ('||definition||') old JOIN public.b2b_managed_product_location_prices lp ON lp.managed_product_id=old.managed_product_id AND lp.location=old.location';
END $migration$;
GRANT SELECT ON public.managed_products_public,public.public_product_prices TO anon,authenticated;
GRANT ALL ON public.managed_products_public,public.public_product_prices TO service_role;
COMMENT ON COLUMN public.b2b_managed_products.price_short_1_3_rd IS 'Net flat price for 1-3 elapsed 24-hour rental days; null uses one-week price.';
COMMENT ON COLUMN public.b2b_managed_products.price_from_4_weeks IS 'Net weekly rate from 4 started 168-hour weeks, applying to all billed weeks.';