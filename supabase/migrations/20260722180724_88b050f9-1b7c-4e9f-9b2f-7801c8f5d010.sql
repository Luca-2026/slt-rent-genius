ALTER TABLE public.b2b_managed_products
  ADD COLUMN IF NOT EXISTS seo_use_case_bau text,
  ADD COLUMN IF NOT EXISTS seo_use_case_event text,
  ADD COLUMN IF NOT EXISTS seo_use_case_privat text;

COMMENT ON COLUMN public.b2b_managed_products.seo_use_case_bau IS 'Etappe 5b.4: Einsatzbeschreibung Bau (aus productSEOData.ts migriert)';
COMMENT ON COLUMN public.b2b_managed_products.seo_use_case_event IS 'Etappe 5b.4: Einsatzbeschreibung Event (aus productSEOData.ts migriert, noch nicht im Prerender aktiv)';
COMMENT ON COLUMN public.b2b_managed_products.seo_use_case_privat IS 'Etappe 5b.4: Einsatzbeschreibung Privat (aus productSEOData.ts migriert, noch nicht im Prerender aktiv)';