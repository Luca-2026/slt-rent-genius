
-- Add user_id column to b2b_authorized_persons to link them to auth accounts
ALTER TABLE public.b2b_authorized_persons 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add invited_at timestamp to track when invitation was sent
ALTER TABLE public.b2b_authorized_persons 
ADD COLUMN invited_at timestamp with time zone;

-- Create index for faster lookups by user_id
CREATE INDEX idx_b2b_authorized_persons_user_id ON public.b2b_authorized_persons(user_id) WHERE user_id IS NOT NULL;

-- RLS policy: authorized persons can view their own company's reservations
CREATE POLICY "Authorized persons can view company reservations"
ON public.b2b_reservations
FOR SELECT
USING (
  b2b_profile_id IN (
    SELECT ap.b2b_profile_id FROM public.b2b_authorized_persons ap
    WHERE ap.user_id = auth.uid() AND ap.is_active = true
  )
);

-- RLS policy: authorized persons can create reservations for their company
CREATE POLICY "Authorized persons can create company reservations"
ON public.b2b_reservations
FOR INSERT
WITH CHECK (
  b2b_profile_id IN (
    SELECT ap.b2b_profile_id FROM public.b2b_authorized_persons ap
    WHERE ap.user_id = auth.uid() AND ap.is_active = true
  )
  AND user_id = auth.uid()
);

-- RLS policy: authorized persons can view their company profile
CREATE POLICY "Authorized persons can view company profile"
ON public.b2b_profiles
FOR SELECT
USING (
  id IN (
    SELECT ap.b2b_profile_id FROM public.b2b_authorized_persons ap
    WHERE ap.user_id = auth.uid() AND ap.is_active = true
  )
);

-- RLS policy: authorized persons can view company offers
CREATE POLICY "Authorized persons can view company offers"
ON public.b2b_offers
FOR SELECT
USING (
  b2b_profile_id IN (
    SELECT ap.b2b_profile_id FROM public.b2b_authorized_persons ap
    WHERE ap.user_id = auth.uid() AND ap.is_active = true
  )
);

-- RLS policy: authorized persons can view company invoices
CREATE POLICY "Authorized persons can view company invoices"
ON public.b2b_invoices
FOR SELECT
USING (
  b2b_profile_id IN (
    SELECT ap.b2b_profile_id FROM public.b2b_authorized_persons ap
    WHERE ap.user_id = auth.uid() AND ap.is_active = true
  )
);

-- RLS policy: authorized persons can view company delivery notes
CREATE POLICY "Authorized persons can view company delivery notes"
ON public.b2b_delivery_notes
FOR SELECT
USING (
  b2b_profile_id IN (
    SELECT ap.b2b_profile_id FROM public.b2b_authorized_persons ap
    WHERE ap.user_id = auth.uid() AND ap.is_active = true
  )
);

-- Security definer function to check if user is an active authorized person for a profile
CREATE OR REPLACE FUNCTION public.is_authorized_person(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.b2b_authorized_persons ap
    JOIN public.b2b_profiles bp ON bp.id = ap.b2b_profile_id
    WHERE ap.user_id = _user_id
      AND ap.is_active = true
      AND bp.status = 'approved'
  )
$$;

-- Function to get authorized person's max rental value
CREATE OR REPLACE FUNCTION public.get_authorized_person_limit(_user_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(ap.max_rental_value, 0)
  FROM public.b2b_authorized_persons ap
  WHERE ap.user_id = _user_id
    AND ap.is_active = true
  LIMIT 1
$$;
