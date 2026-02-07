-- Add start_time and end_time text fields to project_requests
ALTER TABLE public.project_requests
  ADD COLUMN IF NOT EXISTS start_time text,
  ADD COLUMN IF NOT EXISTS end_time text;