CREATE TABLE public.timesheet_lock_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locked_period_end date NOT NULL,
  active_until timestamptz NOT NULL,
  reason text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.timesheet_lock_overrides TO authenticated;
GRANT ALL ON public.timesheet_lock_overrides TO service_role;

ALTER TABLE public.timesheet_lock_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view lock overrides"
ON public.timesheet_lock_overrides FOR SELECT TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Admins manage lock overrides"
ON public.timesheet_lock_overrides FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_timesheet_lock_overrides_updated_at
BEFORE UPDATE ON public.timesheet_lock_overrides
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.timesheet_locked_through()
RETURNS date
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  WITH base AS (
    SELECT CASE
      WHEN EXTRACT(DAY FROM (now() AT TIME ZONE 'Europe/Berlin')::date) >= 21
        THEN (date_trunc('month', (now() AT TIME ZONE 'Europe/Berlin')::date) + interval '19 days')::date
      ELSE (date_trunc('month', (now() AT TIME ZONE 'Europe/Berlin')::date) - interval '1 month' + interval '19 days')::date
    END AS lock_date
  )
  SELECT CASE
    WHEN EXISTS (
      SELECT 1 FROM public.timesheet_lock_overrides o, base b
      WHERE o.locked_period_end = b.lock_date AND o.active_until > now()
    )
    THEN (SELECT (b.lock_date - interval '1 month')::date FROM base b)
    ELSE (SELECT b.lock_date FROM base b)
  END
$function$;