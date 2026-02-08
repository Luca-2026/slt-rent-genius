
-- Add deletion_requested_at column to track customer deletion requests
ALTER TABLE public.b2b_profiles 
ADD COLUMN deletion_requested_at timestamptz DEFAULT NULL;
