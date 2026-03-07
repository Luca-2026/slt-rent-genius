ALTER TABLE public.b2b_profiles ADD COLUMN email_confirmed boolean NOT NULL DEFAULT false;

-- Update existing profiles to mark them as email confirmed (they already went through the process)
UPDATE public.b2b_profiles SET email_confirmed = true WHERE status IN ('approved', 'rejected');