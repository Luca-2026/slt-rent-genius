CREATE TABLE public.staff_time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  work_date date NOT NULL,
  start_time time,
  end_time time,
  break_minutes integer NOT NULL DEFAULT 0,
  note text,
  location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, work_date)
);

CREATE TABLE public.staff_timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  staff_name text,
  staff_email text,
  year integer NOT NULL,
  month integer NOT NULL,
  status text NOT NULL DEFAULT 'open',
  total_minutes integer NOT NULL DEFAULT 0,
  submitted_at timestamptz,
  pdf_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, year, month)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_time_entries TO authenticated;
GRANT ALL ON public.staff_time_entries TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_timesheets TO authenticated;
GRANT ALL ON public.staff_timesheets TO service_role;

ALTER TABLE public.staff_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_timesheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view own time entries" ON public.staff_time_entries
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff insert own time entries" ON public.staff_time_entries
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_staff_member(auth.uid()));

CREATE POLICY "Staff update own time entries" ON public.staff_time_entries
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff delete own time entries" ON public.staff_time_entries
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff view own timesheets" ON public.staff_timesheets
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff insert own timesheets" ON public.staff_timesheets
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_staff_member(auth.uid()));

CREATE POLICY "Staff update own timesheets" ON public.staff_timesheets
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_staff_time_entries_updated_at BEFORE UPDATE ON public.staff_time_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_timesheets_updated_at BEFORE UPDATE ON public.staff_timesheets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Staff read own timesheet pdfs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'timesheets' AND ((storage.foldername(name))[1] = auth.uid()::text OR has_role(auth.uid(), 'admin'::app_role)));