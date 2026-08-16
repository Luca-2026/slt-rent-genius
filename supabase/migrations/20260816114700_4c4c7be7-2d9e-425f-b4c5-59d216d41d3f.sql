CREATE OR REPLACE FUNCTION public.is_staff_member(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE user_id = _user_id AND is_active = true
  )
  OR public.has_role(_user_id, 'admin')
  OR public.has_role(_user_id, 'standort_mitarbeiter');
$function$;