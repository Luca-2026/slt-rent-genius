ALTER TABLE public.b2b_profiles ADD COLUMN IF NOT EXISTS onsite_onboarding boolean NOT NULL DEFAULT false;
ALTER TABLE public.b2b_profiles ADD COLUMN IF NOT EXISTS invitation_sent_at timestamptz;
CREATE OR REPLACE FUNCTION public.can_manage_b2b_onboarding(_actor uuid, _location text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT public.has_role(_actor,'admin') OR (public.has_role(_actor,'niederlassungsleiter') AND EXISTS (SELECT 1 FROM public.staff_profiles s WHERE s.user_id=_actor AND s.is_active AND public.slt_normalize_location(s.location)=public.slt_normalize_location(_location)))
$$;
REVOKE ALL ON FUNCTION public.can_manage_b2b_onboarding(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.can_manage_b2b_onboarding(uuid,text) TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.guard_onsite_b2b_approval() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF OLD.onsite_onboarding AND NEW.onsite_onboarding IS DISTINCT FROM OLD.onsite_onboarding THEN RAISE EXCEPTION 'Vor-Ort-Anlage kann nicht entfernt werden'; END IF;
 IF NEW.onsite_onboarding AND NEW.status='approved' THEN
  IF NOT EXISTS(SELECT 1 FROM auth.users u WHERE u.id=NEW.user_id AND u.email_confirmed_at IS NOT NULL AND coalesce(u.encrypted_password,'')<>'') THEN RAISE EXCEPTION 'E-Mail-Bestätigung und eigenes Passwort fehlen'; END IF;
  IF coalesce(NEW.document_url,'') NOT LIKE 'private:%' OR coalesce(NEW.sepa_mandate_url,'') NOT LIKE 'private:%' THEN RAISE EXCEPTION 'Gewerbenachweis und SEPA-Mandat fehlen'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guard_onsite_b2b_approval BEFORE UPDATE ON public.b2b_profiles FOR EACH ROW EXECUTE FUNCTION public.guard_onsite_b2b_approval();
CREATE OR REPLACE FUNCTION public.approve_onsite_b2b_profile(_profile uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.b2b_profiles;
BEGIN
 SELECT * INTO p FROM public.b2b_profiles WHERE id=_profile FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'B2B-Profil nicht gefunden'; END IF;
 IF NOT public.can_manage_b2b_onboarding(auth.uid(),p.assigned_location) THEN RAISE EXCEPTION 'Keine Berechtigung für diesen Standort' USING ERRCODE='42501'; END IF;
 IF NOT EXISTS(SELECT 1 FROM auth.users u WHERE u.id=p.user_id AND u.email_confirmed_at IS NOT NULL AND coalesce(u.encrypted_password,'')<>'') THEN RAISE EXCEPTION 'Der Kunde muss zuerst die E-Mail bestätigen und sein Passwort festlegen'; END IF;
 IF coalesce(p.document_url,'') NOT LIKE 'private:%' OR coalesce(p.sepa_mandate_url,'') NOT LIKE 'private:%' THEN RAISE EXCEPTION 'Bitte Gewerbenachweis und SEPA-Mandat hochladen'; END IF;
 UPDATE public.b2b_profiles SET status='approved',email_confirmed=true,status_changed_at=now(),status_changed_by=auth.uid(),rejection_reason=null WHERE id=p.id;
 INSERT INTO public.admin_audit_log(actor_user_id,actor_email,actor_role,action,entity_type,entity_id,entity_label,changes) VALUES(auth.uid(),public.get_user_email(auth.uid()),'staff','onsite_b2b_approved','b2b_profiles',p.id::text,p.company_name,jsonb_build_object('status','approved'));
END $$;
REVOKE ALL ON FUNCTION public.approve_onsite_b2b_profile(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.approve_onsite_b2b_profile(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.confirm_b2b_email(_user_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF auth.uid() IS NULL OR auth.uid()<>_user_id OR NOT EXISTS(SELECT 1 FROM auth.users WHERE id=_user_id AND email_confirmed_at IS NOT NULL) THEN RAISE EXCEPTION 'E-Mail noch nicht bestätigt'; END IF;
 UPDATE public.b2b_profiles SET email_confirmed=true,updated_at=now() WHERE user_id=_user_id AND email_confirmed=false;
END $$;