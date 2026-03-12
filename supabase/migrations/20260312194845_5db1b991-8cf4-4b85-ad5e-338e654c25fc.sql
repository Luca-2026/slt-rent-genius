ALTER TABLE public.b2b_delivery_notes ADD COLUMN IF NOT EXISTS staff_signature_data text;
ALTER TABLE public.b2b_delivery_notes ADD COLUMN IF NOT EXISTS staff_name text;