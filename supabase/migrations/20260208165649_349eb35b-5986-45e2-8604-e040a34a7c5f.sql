
-- Add AGB acceptance fields to delivery notes
ALTER TABLE public.b2b_delivery_notes
  ADD COLUMN agb_accepted boolean NOT NULL DEFAULT false,
  ADD COLUMN agb_accepted_at timestamp with time zone;
