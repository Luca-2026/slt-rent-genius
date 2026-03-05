
-- Create table for authorized persons who can rent/pick up on behalf of B2B customer
CREATE TABLE public.b2b_authorized_persons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  b2b_profile_id UUID NOT NULL REFERENCES public.b2b_profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  max_rental_value NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.b2b_authorized_persons ENABLE ROW LEVEL SECURITY;

-- B2B users can manage their own authorized persons
CREATE POLICY "Users can view own authorized persons"
  ON public.b2b_authorized_persons FOR SELECT
  USING (b2b_profile_id IN (
    SELECT id FROM public.b2b_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own authorized persons"
  ON public.b2b_authorized_persons FOR INSERT
  WITH CHECK (b2b_profile_id IN (
    SELECT id FROM public.b2b_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own authorized persons"
  ON public.b2b_authorized_persons FOR UPDATE
  USING (b2b_profile_id IN (
    SELECT id FROM public.b2b_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own authorized persons"
  ON public.b2b_authorized_persons FOR DELETE
  USING (b2b_profile_id IN (
    SELECT id FROM public.b2b_profiles WHERE user_id = auth.uid()
  ));

-- Admins can manage all
CREATE POLICY "Admins can manage authorized persons"
  ON public.b2b_authorized_persons FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Updated at trigger
CREATE TRIGGER update_b2b_authorized_persons_updated_at
  BEFORE UPDATE ON public.b2b_authorized_persons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
