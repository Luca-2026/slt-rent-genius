
-- Extend the app_role enum with new roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'standort_mitarbeiter';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'buchhaltung';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'readonly';

-- Create a staff_profiles table for internal employees
CREATE TABLE public.staff_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  position text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

-- Only admins can manage staff profiles
CREATE POLICY "Admins can manage staff profiles"
  ON public.staff_profiles
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Staff can view their own profile
CREATE POLICY "Staff can view own profile"
  ON public.staff_profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_staff_profiles_updated_at
  BEFORE UPDATE ON public.staff_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
