CREATE OR REPLACE FUNCTION public.enforce_time_entry_lock()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_lock date := public.timesheet_locked_through();
  v_date date := COALESCE(NEW.work_date, OLD.work_date);
  v_entry_user_id uuid := COALESCE(NEW.user_id, OLD.user_id);
  v_rejected_period_open boolean := false;
BEGIN
  -- Serverseitige Vorgänge (Service Role, z. B. Kontolöschung) nicht blockieren
  IF auth.uid() IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF v_entry_user_id = auth.uid() THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.staff_timesheets s
      WHERE s.user_id = auth.uid()
        AND s.status = 'rejected'
        AND v_date BETWEEN COALESCE(
          s.period_start,
          make_date(s.year, s.month, 1)
        ) AND COALESCE(
          s.period_end,
          (make_date(s.year, s.month, 1) + interval '1 month - 1 day')::date
        )
    ) INTO v_rejected_period_open;
  END IF;

  IF v_date <= v_lock AND NOT v_rejected_period_open THEN
    RAISE EXCEPTION 'Der Abrechnungszeitraum bis zum % ist abgeschlossen und gesperrt.', to_char(v_lock, 'DD.MM.YYYY')
      USING ERRCODE = 'check_violation';
  END IF;

  IF TG_OP <> 'DELETE' AND NEW.note IS NOT NULL AND char_length(NEW.note) > 300 THEN
    RAISE EXCEPTION 'Die Tätigkeitsnotiz darf maximal 300 Zeichen umfassen.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;