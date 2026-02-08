
-- Add deposit, time, and additional services to b2b_reservations
ALTER TABLE public.b2b_reservations 
  ADD COLUMN IF NOT EXISTS deposit numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS start_time text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS end_time text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS additional_services jsonb DEFAULT NULL;

-- Add deposit and additional services to b2b_offers
ALTER TABLE public.b2b_offers
  ADD COLUMN IF NOT EXISTS deposit numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS additional_services jsonb DEFAULT NULL;
