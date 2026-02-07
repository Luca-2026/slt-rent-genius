
-- Add individual payment terms to b2b_profiles
ALTER TABLE public.b2b_profiles
ADD COLUMN payment_due_days integer NOT NULL DEFAULT 14;

COMMENT ON COLUMN public.b2b_profiles.payment_due_days IS 'Individual payment terms in days for this B2B customer';
