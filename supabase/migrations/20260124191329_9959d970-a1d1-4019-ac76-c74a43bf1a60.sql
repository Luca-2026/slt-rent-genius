-- Create storage bucket for application documents (resumes, cover letters)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bewerbungen', 'bewerbungen', false);

-- Create RLS policy for uploads - anyone can upload (public applications)
CREATE POLICY "Anyone can upload application documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bewerbungen');

-- Create RLS policy for reading - only authenticated admins can read
CREATE POLICY "Only admins can view application documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'bewerbungen' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create table to store job applications
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  
  -- Personal data
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Address (optional)
  street TEXT,
  postal_code TEXT,
  city TEXT,
  
  -- Application details
  earliest_start_date DATE,
  salary_expectation TEXT,
  motivation TEXT,
  
  -- Job-specific fields (stored as JSONB for flexibility)
  job_specific_answers JSONB DEFAULT '{}',
  
  -- Documents
  resume_url TEXT,
  resume_filename TEXT,
  cover_letter_url TEXT,
  cover_letter_filename TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'new',
  internal_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit applications (INSERT)
CREATE POLICY "Anyone can submit job applications"
ON public.job_applications FOR INSERT
WITH CHECK (true);

-- Only admins can view applications
CREATE POLICY "Only admins can view job applications"
ON public.job_applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can update applications
CREATE POLICY "Only admins can update job applications"
ON public.job_applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();