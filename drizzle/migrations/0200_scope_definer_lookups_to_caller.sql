CREATE OR REPLACE FUNCTION public.get_authorized_profile_ids(_user_id uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b2b_profile_id FROM public.b2b_authorized_persons
  WHERE user_id = _user_id AND is_active = true
    AND (_user_id = auth.uid() OR auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin'))
$$;
CREATE OR REPLACE FUNCTION public.get_b2b_profile_locked_fields(_profile_id uuid)
RETURNS TABLE(status b2b_status, credit_limit numeric, used_credit numeric, assigned_location text, internal_notes text, status_changed_by uuid, rejection_reason text, vat_id_verified boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.status, p.credit_limit, p.used_credit, p.assigned_location, p.internal_notes, p.status_changed_by, p.rejection_reason, p.vat_id_verified
  FROM public.b2b_profiles p
  WHERE p.id = _profile_id
    AND (p.user_id = auth.uid() OR auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin'))
  LIMIT 1
$$;
REVOKE EXECUTE ON FUNCTION public.get_b2b_profile_locked_fields(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_b2b_profile_locked_fields(uuid) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.backfill_allocations(boolean) FROM PUBLIC, anon;