CREATE OR REPLACE FUNCTION public.guard_branch_b2b_profile_update() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 -- Service-role calls (grant-credit-limit) and admins keep full control.
 IF auth.uid() IS NULL OR public.has_role(auth.uid(),'admin') OR OLD.user_id = auth.uid() THEN RETURN NEW; END IF;
 IF NOT public.has_role(auth.uid(),'niederlassungsleiter') THEN RETURN NEW; END IF;
 IF NEW.credit_limit IS DISTINCT FROM OLD.credit_limit OR NEW.used_credit IS DISTINCT FROM OLD.used_credit THEN
  RAISE EXCEPTION 'Kreditlimits werden über die Kreditlimit-Freigabe vergeben (Niederlassungsleitung bis 2.000 €)' USING ERRCODE='42501';
 END IF;
 IF NEW.assigned_location IS NULL OR NOT public.can_manage_b2b_onboarding(auth.uid(), NEW.assigned_location) THEN
  RAISE EXCEPTION 'Kunden können nur für den eigenen Standort freigeschaltet werden' USING ERRCODE='42501';
 END IF;
 IF NEW.status IS DISTINCT FROM OLD.status THEN NEW.status_changed_by := auth.uid(); NEW.status_changed_at := now(); END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.guard_branch_b2b_profile_update() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_branch_b2b_profile_update BEFORE UPDATE ON public.b2b_profiles FOR EACH ROW EXECUTE FUNCTION public.guard_branch_b2b_profile_update();
CREATE POLICY "Branch managers update own location profiles" ON public.b2b_profiles FOR UPDATE TO authenticated
 USING (public.has_role(auth.uid(),'niederlassungsleiter') AND (assigned_location IS NULL OR public.can_manage_b2b_onboarding(auth.uid(), assigned_location)))
 WITH CHECK (public.can_manage_b2b_onboarding(auth.uid(), assigned_location));