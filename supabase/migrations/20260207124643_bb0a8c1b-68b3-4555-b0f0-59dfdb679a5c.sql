
-- Modify b2b_reservations to use text-based product references instead of UUID FK
-- This allows storing references to static product data

ALTER TABLE public.b2b_reservations 
  DROP CONSTRAINT IF EXISTS b2b_reservations_product_id_fkey;

ALTER TABLE public.b2b_reservations 
  ALTER COLUMN product_id TYPE text USING product_id::text;

-- Add product_name for display
ALTER TABLE public.b2b_reservations 
  ADD COLUMN IF NOT EXISTS product_name text;

-- Add category for discount tracking
ALTER TABLE public.b2b_reservations 
  ADD COLUMN IF NOT EXISTS category_slug text;
