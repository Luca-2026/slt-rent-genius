-- =============================================
-- SLT Rental B2B Portal Database Schema
-- =============================================

-- 1. Create B2B Status Enum
CREATE TYPE public.b2b_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Create App Role Enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 3. Create User Roles Table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 4. Create B2B Profiles Table
CREATE TABLE public.b2b_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    -- Company Information
    company_name TEXT NOT NULL,
    legal_form TEXT, -- GmbH, UG, AG, Einzelunternehmen, etc.
    tax_id TEXT, -- USt-IdNr.
    trade_register_number TEXT, -- Handelsregisternummer
    -- Contact Person
    contact_first_name TEXT NOT NULL,
    contact_last_name TEXT NOT NULL,
    contact_position TEXT,
    contact_phone TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    -- Address
    street TEXT NOT NULL,
    house_number TEXT,
    postal_code TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT DEFAULT 'Deutschland',
    -- Documents
    document_url TEXT, -- URL to uploaded document (Handelsregisterauszug/Gewerbeanmeldung)
    document_filename TEXT,
    -- Status
    status b2b_status NOT NULL DEFAULT 'pending',
    status_changed_at TIMESTAMP WITH TIME ZONE,
    status_changed_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    -- Notes
    internal_notes TEXT,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Create Project Requests Table
CREATE TABLE public.project_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    -- Project Info
    project_name TEXT NOT NULL,
    project_description TEXT,
    -- Location
    site_street TEXT NOT NULL,
    site_postal_code TEXT NOT NULL,
    site_city TEXT NOT NULL,
    -- Timeline
    start_date DATE NOT NULL,
    end_date DATE,
    -- Equipment
    equipment_needed TEXT NOT NULL,
    -- Delivery
    delivery_required BOOLEAN DEFAULT false,
    pickup_required BOOLEAN DEFAULT false,
    -- Services
    additional_services TEXT,
    -- Contact
    preferred_callback_date DATE,
    preferred_callback_time TEXT,
    -- Attachments
    attachment_urls TEXT[], -- Array of URLs to uploaded files
    -- Status
    status TEXT NOT NULL DEFAULT 'new',
    internal_notes TEXT,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

-- 7. Create Security Definer Function for Role Checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 8. Create function to check if user is approved B2B
CREATE OR REPLACE FUNCTION public.is_approved_b2b(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.b2b_profiles
    WHERE user_id = _user_id
      AND status = 'approved'
  )
$$;

-- 9. RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 10. RLS Policies for b2b_profiles
CREATE POLICY "Users can view their own profile"
ON public.b2b_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.b2b_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.b2b_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.b2b_profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.b2b_profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 11. RLS Policies for project_requests
CREATE POLICY "Users can view their own requests"
ON public.project_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Approved B2B users can create requests"
ON public.project_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND public.is_approved_b2b(auth.uid()));

CREATE POLICY "Users can update their own requests"
ON public.project_requests FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all requests"
ON public.project_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all requests"
ON public.project_requests FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 12. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 13. Create triggers for updated_at
CREATE TRIGGER update_b2b_profiles_updated_at
BEFORE UPDATE ON public.b2b_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_requests_updated_at
BEFORE UPDATE ON public.project_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 14. Create Storage Bucket for B2B Documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('b2b-documents', 'b2b-documents', false);

-- 15. Storage RLS Policies for b2b-documents bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'b2b-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'b2b-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'b2b-documents' 
    AND public.has_role(auth.uid(), 'admin')
);