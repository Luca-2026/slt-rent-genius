ALTER TABLE public.staff_timesheets
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_by uuid,
  ADD COLUMN IF NOT EXISTS rejected_by_name text,
  ADD COLUMN IF NOT EXISTS rejection_reason text;