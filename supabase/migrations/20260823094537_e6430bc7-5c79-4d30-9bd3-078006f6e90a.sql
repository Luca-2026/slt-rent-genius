
ALTER TABLE public.staff_timesheets
  ADD COLUMN IF NOT EXISTS period_start date,
  ADD COLUMN IF NOT EXISTS period_end date;

-- Ende des zuletzt abgeschlossenen (= gesperrten) Abrechnungszeitraums.
CREATE OR REPLACE FUNCTION public.timesheet_locked_through()
RETURNS date
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXTRACT(DAY FROM (now() AT TIME ZONE 'Europe/Berlin')::date) >= 21
      THEN (date_trunc('month', (now() AT TIME ZONE 'Europe/Berlin')::date) + interval '19 days')::date
    ELSE (date_trunc('month', (now() AT TIME ZONE 'Europe/Berlin')::date) - interval '1 month' + interval '19 days')::date
  END
$$;

CREATE TABLE IF NOT EXISTS public.staff_timesheet_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_end date NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  channel text NOT NULL DEFAULT 'email',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_end, channel)
);

GRANT SELECT ON public.staff_timesheet_reminders TO authenticated;
GRANT ALL ON public.staff_timesheet_reminders TO service_role;
ALTER TABLE public.staff_timesheet_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff view own timesheet reminders" ON public.staff_timesheet_reminders;
CREATE POLICY "Staff view own timesheet reminders"
ON public.staff_timesheet_reminders FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Sperre: abgeschlossene Zeiträume dürfen von Mitarbeitenden nicht mehr geändert werden.
CREATE OR REPLACE FUNCTION public.enforce_time_entry_lock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lock date := public.timesheet_locked_through();
  v_date date := COALESCE(NEW.work_date, OLD.work_date);
BEGIN
  IF auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF v_date <= v_lock THEN
    RAISE EXCEPTION 'Der Abrechnungszeitraum bis zum % ist abgeschlossen und gesperrt.', to_char(v_lock, 'DD.MM.YYYY')
      USING ERRCODE = 'check_violation';
  END IF;

  IF TG_OP <> 'DELETE' AND NEW.note IS NOT NULL AND char_length(NEW.note) > 300 THEN
    RAISE EXCEPTION 'Die Tätigkeitsnotiz darf maximal 300 Zeichen umfassen.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_time_entry_lock ON public.staff_time_entries;
CREATE TRIGGER trg_time_entry_lock
BEFORE INSERT OR UPDATE OR DELETE ON public.staff_time_entries
FOR EACH ROW EXECUTE FUNCTION public.enforce_time_entry_lock();
