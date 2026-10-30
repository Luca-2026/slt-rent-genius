CREATE OR REPLACE FUNCTION public.link_onsite_b2b_profile(_customer uuid,_user uuid,_actor uuid,_legal_form text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.crm_customers; p uuid;
BEGIN
 SELECT * INTO c FROM public.crm_customers WHERE id=_customer FOR UPDATE;
 IF NOT FOUND OR NOT public.can_manage_b2b_onboarding(_actor,c.location) THEN RAISE EXCEPTION 'Keine Berechtigung'; END IF;
 IF c.b2b_profile_id IS NOT NULL THEN RAISE EXCEPTION 'Kunde hat bereits einen B2B-Zugang'; END IF;
 IF NOT EXISTS(SELECT 1 FROM auth.users u WHERE u.id=_user AND lower(u.email)=lower(c.email) AND u.email_confirmed_at IS NULL) THEN RAISE EXCEPTION 'Zugang passt nicht zum Kunden'; END IF;
 INSERT INTO public.b2b_profiles(user_id,company_name,legal_form,contact_first_name,contact_last_name,contact_email,contact_phone,street,postal_code,city,country,tax_id,assigned_location,status,credit_limit,email_confirmed,onsite_onboarding) VALUES(_user,c.company_name,_legal_form,c.first_name,c.last_name,lower(c.email),c.phone,c.street,c.postal_code,c.city,coalesce(c.country,'Deutschland'),c.vat_id,c.location,'pending',0,false,true) RETURNING id INTO p;
 UPDATE public.crm_customers SET b2b_profile_id=p,customer_kind='business' WHERE id=c.id;
 RETURN p;
END $$;
REVOKE ALL ON FUNCTION public.link_onsite_b2b_profile(uuid,uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.link_onsite_b2b_profile(uuid,uuid,uuid,text) TO service_role;
CREATE OR REPLACE FUNCTION public.onsite_b2b_password_set(_user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM auth.users WHERE id=_user AND coalesce(encrypted_password,'')<>'') $$;
REVOKE ALL ON FUNCTION public.onsite_b2b_password_set(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.onsite_b2b_password_set(uuid) TO service_role;