ALTER TABLE public.staff_todo_lists ADD COLUMN credit_profile_id uuid REFERENCES public.b2b_profiles(id), ADD COLUMN credit_request_amount numeric(12,2), ADD COLUMN credit_request_status text CHECK (credit_request_status IN ('pending','approved','rejected')), ADD COLUMN credit_decided_by uuid, ADD COLUMN credit_decided_at timestamptz;
CREATE UNIQUE INDEX one_pending_credit_approval ON public.staff_todo_lists(credit_profile_id) WHERE credit_request_status='pending';
CREATE POLICY credit_tasks_admin_only ON public.staff_todo_lists AS RESTRICTIVE FOR ALL TO authenticated USING (credit_profile_id IS NULL OR public.has_role(auth.uid(),'admin')) WITH CHECK (credit_profile_id IS NULL OR public.has_role(auth.uid(),'admin'));
CREATE OR REPLACE FUNCTION public.can_access_todo_list(_list_id uuid,_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.is_staff_member(_user_id) AND EXISTS(SELECT 1 FROM public.staff_todo_lists l WHERE l.id=_list_id AND (l.credit_profile_id IS NULL OR public.has_role(_user_id,'admin')) AND (l.status<>'draft' OR l.created_by=_user_id OR public.has_role(_user_id,'admin'))) $$;
CREATE FUNCTION public.guard_credit_approval_task() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF auth.uid() IS NOT NULL AND (CASE WHEN TG_OP='INSERT' THEN NEW.credit_profile_id IS NOT NULL ELSE OLD.credit_profile_id IS NOT NULL END) THEN RAISE EXCEPTION 'Kreditlimitfreigaben ausschließlich über die Freigabeentscheidung bearbeiten' USING ERRCODE='42501'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW; END $$;
CREATE TRIGGER guard_credit_approval_task BEFORE INSERT OR UPDATE OR DELETE ON public.staff_todo_lists FOR EACH ROW EXECUTE FUNCTION public.guard_credit_approval_task();
CREATE FUNCTION public.request_credit_limit_approval(_profile uuid,_amount numeric) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE p public.b2b_profiles; tid uuid; actor uuid:=auth.uid(); actor_name text; BEGIN
 SELECT * INTO p FROM public.b2b_profiles WHERE id=_profile FOR UPDATE;
 IF NOT FOUND OR actor IS NULL OR NOT public.can_manage_b2b_onboarding(actor,p.assigned_location) THEN RAISE EXCEPTION 'Keine Berechtigung für diesen Standort' USING ERRCODE='42501'; END IF;
 IF p.status<>'approved' OR _amount IS NULL OR _amount<=2000 OR _amount<>round(_amount,2) OR _amount>9999999999.99 THEN RAISE EXCEPTION 'Freigeschalteter Kunde und Kreditlimit über 2.000 € erforderlich'; END IF;
 SELECT id INTO tid FROM public.staff_todo_lists WHERE credit_profile_id=_profile AND credit_request_status='pending';
 IF tid IS NOT NULL THEN
 IF EXISTS(SELECT 1 FROM public.staff_todo_lists WHERE id=tid AND credit_request_amount<>_amount) THEN RAISE EXCEPTION 'Für diesen Kunden liegt bereits eine Kreditlimitfreigabe beim Admin'; END IF; RETURN tid; END IF;
 SELECT concat_ws(' ',first_name,last_name) INTO actor_name FROM public.staff_profiles WHERE user_id=actor;
 PERFORM set_config('request.jwt.claim.sub','',true);
 INSERT INTO public.staff_todo_lists(title,description,location,status,priority,due_date,created_by,created_by_name,assigned_name,sent_at,credit_profile_id,credit_request_amount,credit_request_status) VALUES ('Kreditlimit freigeben – '||p.company_name,'Beantragt: '||_amount||' €; bisheriges Kreditlimit: '||p.credit_limit||' €. Kreditlimitfreigabe liegt beim Admin.',NULL,'sent','high',(now() AT TIME ZONE 'Europe/Berlin')::date,actor,actor_name,'Benedikt / Luca',now(),_profile,_amount,'pending') RETURNING id INTO tid;
 INSERT INTO public.staff_todo_items(list_id,title,sort_order) VALUES(tid,'Kreditlimit prüfen und genehmigen oder ablehnen',0);
 PERFORM set_config('request.jwt.claim.sub',actor::text,true); RETURN tid; END $$;
REVOKE ALL ON FUNCTION public.request_credit_limit_approval(uuid,numeric) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.request_credit_limit_approval(uuid,numeric) TO authenticated;
CREATE FUNCTION public.apply_staff_credit_limit(_actor uuid,_profile uuid,_amount numeric,_request uuid DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE p public.b2b_profiles; t public.staff_todo_lists; BEGIN
 SELECT * INTO p FROM public.b2b_profiles WHERE id=_profile FOR UPDATE;
 IF NOT FOUND OR _actor IS NULL OR _amount IS NULL OR _amount<=0 OR _amount<>round(_amount,2) THEN RAISE EXCEPTION 'Ungültiges Kreditlimit'; END IF;
 IF NOT public.has_role(_actor,'admin') AND (NOT public.can_manage_b2b_onboarding(_actor,p.assigned_location) OR _amount>2000 OR p.credit_limit>2000 OR p.status<>'approved') THEN RAISE EXCEPTION 'Kreditlimitfreigabe liegt beim Admin oder keine Standortberechtigung' USING ERRCODE='42501'; END IF;
 SELECT * INTO t FROM public.staff_todo_lists WHERE credit_profile_id=_profile AND credit_request_status='pending' FOR UPDATE;
 IF FOUND THEN
 IF NOT public.has_role(_actor,'admin') OR _request IS DISTINCT FROM t.id OR _amount<>t.credit_request_amount THEN RAISE EXCEPTION 'Offene Admin-Freigabe ausdrücklich entscheiden' USING ERRCODE='42501'; END IF;
 ELSIF _request IS NOT NULL THEN RAISE EXCEPTION 'Kreditlimitfreigabe bereits entschieden'; END IF;
 UPDATE public.b2b_profiles SET credit_limit=_amount,credit_limit_requested_at=NULL WHERE id=_profile;
 IF t.id IS NOT NULL THEN UPDATE public.staff_todo_lists SET credit_request_status='approved',credit_decided_by=_actor,credit_decided_at=now(),status='done',completed_at=now() WHERE id=t.id; UPDATE public.staff_todo_items SET is_done=true,done_at=now(),done_by=_actor WHERE list_id=t.id; END IF; END $$;
REVOKE ALL ON FUNCTION public.apply_staff_credit_limit(uuid,uuid,numeric,uuid) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.apply_staff_credit_limit(uuid,uuid,numeric,uuid) TO service_role;
CREATE FUNCTION public.reject_credit_limit_approval(_request uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE actor uuid:=auth.uid(); pid uuid; BEGIN
 IF actor IS NULL OR NOT public.has_role(actor,'admin') THEN RAISE EXCEPTION 'Admin-Freigabe erforderlich' USING ERRCODE='42501'; END IF;
 SELECT credit_profile_id INTO pid FROM public.staff_todo_lists WHERE id=_request;
 PERFORM 1 FROM public.b2b_profiles WHERE id=pid FOR UPDATE;
 PERFORM set_config('request.jwt.claim.sub','',true);
 UPDATE public.staff_todo_lists SET credit_request_status='rejected',credit_decided_by=actor,credit_decided_at=now(),status='done',completed_at=now() WHERE id=_request AND credit_request_status='pending';
 IF NOT FOUND THEN RAISE EXCEPTION 'Kreditlimitfreigabe bereits entschieden'; END IF;
 UPDATE public.staff_todo_items SET is_done=true,done_at=now(),done_by=actor WHERE list_id=_request;
 PERFORM set_config('request.jwt.claim.sub',actor::text,true); END $$;
REVOKE ALL ON FUNCTION public.reject_credit_limit_approval(uuid) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.reject_credit_limit_approval(uuid) TO authenticated;