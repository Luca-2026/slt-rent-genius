CREATE OR REPLACE FUNCTION public.guard_b2b_profile_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NOT public.has_role(auth.uid(), 'admin')
     AND NOT public.is_staff_member(auth.uid()) THEN
    NEW.status := 'pending';
    NEW.credit_limit := 0;
    NEW.used_credit := 0;
    NEW.internal_notes := NULL;
    NEW.status_changed_by := NULL;
    NEW.rejection_reason := NULL;
    NEW.vat_id_verified := false;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_guard_b2b_profile_insert ON public.b2b_profiles;
CREATE TRIGGER trg_guard_b2b_profile_insert BEFORE INSERT ON public.b2b_profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_b2b_profile_insert();
ALTER TABLE public.b2b_profiles ADD COLUMN IF NOT EXISTS welcome_sent_at timestamptz;