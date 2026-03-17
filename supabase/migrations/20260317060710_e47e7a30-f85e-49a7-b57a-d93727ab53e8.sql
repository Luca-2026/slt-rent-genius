ALTER TABLE public.b2b_offers 
  ADD COLUMN IF NOT EXISTS created_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS created_by_staff_name text,
  ADD COLUMN IF NOT EXISTS issuing_location text,
  ADD COLUMN IF NOT EXISTS return_location text;