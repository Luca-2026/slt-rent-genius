ALTER TABLE public.b2b_managed_products
  ADD COLUMN IF NOT EXISTS image_alts text[] NOT NULL DEFAULT '{}'::text[];