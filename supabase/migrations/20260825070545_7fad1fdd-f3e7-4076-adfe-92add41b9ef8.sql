ALTER TABLE public.staff_timesheets
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_by_name text,
  ADD COLUMN IF NOT EXISTS payroll_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS payroll_sent_to text;