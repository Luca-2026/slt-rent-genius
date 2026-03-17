ALTER TABLE public.b2b_offers 
  ADD COLUMN IF NOT EXISTS customer_signature_data text,
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz;