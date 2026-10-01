ALTER TABLE public.b2b_managed_products ADD COLUMN IF NOT EXISTS spec_order text[];
ALTER TABLE public.new_machines ADD COLUMN IF NOT EXISTS spec_order text[];
ALTER TABLE public.used_machines ADD COLUMN IF NOT EXISTS spec_order text[];
COMMENT ON COLUMN public.b2b_managed_products.spec_order IS 'Anzeigereihenfolge der Schlüssel in specifications (jsonb sortiert Schlüssel selbst).';