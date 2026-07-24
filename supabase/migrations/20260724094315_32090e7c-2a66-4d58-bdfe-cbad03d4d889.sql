
CREATE OR REPLACE FUNCTION public.log_admin_login()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_email text;
  v_is_admin boolean;
  v_is_super boolean;
  v_is_b2b boolean;
  v_is_authorized boolean;
  v_role text;
  v_label text;
BEGIN
  IF v_user IS NULL THEN RETURN; END IF;

  v_email := public.get_user_email(v_user);
  v_is_super := public.is_super_admin(v_user);
  v_is_admin := public.has_role(v_user, 'admin');
  v_is_b2b := EXISTS (SELECT 1 FROM public.b2b_profiles WHERE user_id = v_user);
  v_is_authorized := EXISTS (
    SELECT 1 FROM public.b2b_authorized_persons WHERE user_id = v_user AND is_active = true
  );

  v_role := CASE
    WHEN v_is_super THEN 'super_admin'
    WHEN v_is_admin THEN 'admin'
    WHEN v_is_b2b THEN 'b2b_customer'
    WHEN v_is_authorized THEN 'b2b_authorized_person'
    ELSE 'user'
  END;

  v_label := CASE
    WHEN v_is_super OR v_is_admin THEN 'Admin-Anmeldung'
    WHEN v_is_b2b OR v_is_authorized THEN 'B2B-Kunden-Anmeldung'
    ELSE 'Anmeldung'
  END;

  INSERT INTO public.admin_audit_log(actor_user_id, actor_email, actor_role, action, entity_type, entity_label)
  VALUES (v_user, v_email, v_role, 'login', 'auth', v_label);
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_admin_login() TO authenticated;
