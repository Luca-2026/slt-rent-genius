-- Add postal invoice preference to b2b_profiles
ALTER TABLE public.b2b_profiles 
ADD COLUMN postal_invoice boolean NOT NULL DEFAULT false;

-- Add postal invoice surcharge amount (stored for reference)
COMMENT ON COLUMN public.b2b_profiles.postal_invoice IS 'Customer opted for postal invoice delivery (2.50€ surcharge per invoice)';