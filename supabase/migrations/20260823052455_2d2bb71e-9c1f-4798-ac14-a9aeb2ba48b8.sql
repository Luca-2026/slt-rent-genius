ALTER TABLE public.rental_inquiries
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS vat_id text;