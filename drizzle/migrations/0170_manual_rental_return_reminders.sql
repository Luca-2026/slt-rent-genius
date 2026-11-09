CREATE OR REPLACE FUNCTION public.can_send_rental_return_reminder(_actor uuid, _location text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.has_role(_actor,'admin') OR (public.has_role(_actor,'niederlassungsleiter') AND EXISTS(SELECT 1 FROM public.staff_profiles s WHERE s.user_id=_actor AND s.is_active AND CASE WHEN s.location IN ('krefeld','muelheim') THEN 'krefeld' ELSE s.location END = CASE WHEN _location IN ('krefeld','muelheim') THEN 'krefeld' ELSE _location END)) $$;
CREATE TABLE public.rental_return_reminders(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rental_inquiry_id uuid NOT NULL REFERENCES public.rental_inquiries(id), stage integer NOT NULL CHECK(stage IN (1,2)), recipient_email text NOT NULL, reply_to text NOT NULL, actor_id uuid NOT NULL, actor_name text NOT NULL, customer_snapshot jsonb NOT NULL, no_response_confirmed boolean NOT NULL DEFAULT false, message_id uuid NOT NULL DEFAULT gen_random_uuid(), status text NOT NULL DEFAULT 'preparing' CHECK(status IN ('preparing','queued','sent','failed','suppressed')), created_at timestamptz NOT NULL DEFAULT now(), queued_at timestamptz, UNIQUE(rental_inquiry_id,stage));
GRANT SELECT ON public.rental_return_reminders TO authenticated;
GRANT ALL ON public.rental_return_reminders TO service_role;
ALTER TABLE public.rental_return_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY reminder_read ON public.rental_return_reminders FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.rental_inquiries i WHERE i.id=rental_inquiry_id AND public.can_send_rental_return_reminder(auth.uid(),i.location)));
CREATE OR REPLACE FUNCTION public.claim_rental_return_reminder(_inquiry uuid,_stage integer,_expected_email text,_no_response boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.rental_inquiries; d public.rental_return_reminders; _start text; _end text; _item jsonb; _reply text; _actor_name text; _last_status text;
BEGIN
 SELECT * INTO r FROM public.rental_inquiries WHERE id=_inquiry FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Auftrag nicht gefunden'; END IF;
 IF NOT coalesce(public.can_send_rental_return_reminder(auth.uid(),r.location),false) THEN RAISE EXCEPTION 'Keine Berechtigung für Rückgabeerinnerungen an diesem Standort' USING ERRCODE='42501'; END IF;
 IF _stage NOT IN (1,2) THEN RAISE EXCEPTION 'Ungültige Erinnerungsstufe'; END IF;
 IF r.closed_manually_at IS NOT NULL OR r.status NOT IN ('accepted','done') OR (r.status='done' AND r.order_confirmed_at IS NULL) THEN RAISE EXCEPTION 'Kein offener Mietauftrag'; END IF;
 IF EXISTS(SELECT 1 FROM public.b2b_return_protocols WHERE rental_inquiry_id=r.id AND status IN ('signed','signed_staff_only')) THEN RAISE EXCEPTION 'Rückgabe bereits abgeschlossen'; END IF;
 IF coalesce((r.offer_payload->>'open_ended')::boolean,false) OR coalesce((r.raw_payload->>'open_ended')::boolean,false) OR coalesce((r.offer_payload->>'undated_offer')::boolean,false) THEN RAISE EXCEPTION 'Kein verbindliches Mietende'; END IF;
 SELECT min(left(j->>'rental_start',10)),max(left(j->>'rental_end',10)) INTO _start,_end FROM jsonb_array_elements(CASE WHEN jsonb_typeof(r.offer_payload->'items')='array' THEN r.offer_payload->'items' ELSE '[]'::jsonb END) j WHERE coalesce(j->>'period_free','false')<>'true';
 _start:=coalesce(_start,left(r.start_date,10)); _end:=coalesce(_end,left(r.end_date,10));
 IF _end IS NULL OR _end !~ '^\d{4}-\d{2}-\d{2}$' OR (_start IS NOT NULL AND _end<_start) THEN RAISE EXCEPTION 'Mietzeitraum muss geprüft werden'; END IF;
 FOR _item IN SELECT value FROM jsonb_array_elements(CASE WHEN jsonb_typeof(r.offer_payload->'items')='array' THEN r.offer_payload->'items' ELSE '[]'::jsonb END) LOOP
 IF _item->>'rental_end' < _item->>'rental_start' THEN RAISE EXCEPTION 'Mietzeitraum muss geprüft werden'; END IF;
 END LOOP;
 IF (_end::date + CASE WHEN r.end_time ~ '^\d{2}:\d{2}$' THEN r.end_time::time ELSE time '23:59:59.999999' END) AT TIME ZONE 'Europe/Berlin' > now() THEN RAISE EXCEPTION 'Mietende noch nicht überschritten'; END IF;
 IF lower(trim(coalesce(r.customer_email,'')))<>lower(trim(coalesce(_expected_email,''))) OR r.customer_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Kundenadresse geändert oder ungültig. Bitte neu laden'; END IF;
 _reply:=CASE r.location WHEN 'bonn' THEN 'bonn@slt-rental.de' WHEN 'krefeld' THEN 'krefeld@slt-rental.de' WHEN 'muelheim' THEN 'muelheim@slt-rental.de' END;
 IF _reply IS NULL THEN RAISE EXCEPTION 'Bitte zuerst den Standort zuordnen'; END IF;
 IF _stage=2 THEN
 IF NOT _no_response THEN RAISE EXCEPTION 'Bitte bestätigen, dass keine Antwort und keine Rückgabe vorliegt'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.rental_return_reminders a JOIN public.email_send_log l ON l.message_id=a.message_id WHERE a.rental_inquiry_id=r.id AND a.stage=1 AND l.status='sent') THEN RAISE EXCEPTION 'Erste Erinnerung noch nicht erfolgreich versendet'; END IF;
 END IF;
 SELECT * INTO d FROM public.rental_return_reminders WHERE rental_inquiry_id=r.id AND stage=_stage;
 IF FOUND THEN
 IF d.recipient_email<>trim(r.customer_email) OR d.reply_to<>_reply OR d.customer_snapshot->>'end_date'<>_end THEN RAISE EXCEPTION 'Auftragsdaten seit Erinnerung geändert. Bitte Versandverlauf prüfen'; END IF;
 SELECT status INTO _last_status FROM public.email_send_log WHERE message_id=d.message_id ORDER BY created_at DESC LIMIT 1;
 IF d.status='queued' AND coalesce(_last_status,'pending') NOT IN ('dlq','failed') THEN RETURN jsonb_build_object('already_queued',true,'delivery',to_jsonb(d)); END IF;
 IF _last_status='sent' OR d.status='sent' THEN RETURN jsonb_build_object('already_queued',true,'delivery',to_jsonb(d)); END IF;
 UPDATE public.rental_return_reminders SET status='preparing', message_id=gen_random_uuid(),actor_id=auth.uid(),created_at=now() WHERE id=d.id RETURNING * INTO d;
 ELSE
 SELECT concat_ws(' ',first_name,last_name) INTO _actor_name FROM public.staff_profiles WHERE user_id=auth.uid() AND is_active;
 INSERT INTO public.rental_return_reminders(rental_inquiry_id,stage,recipient_email,reply_to,actor_id,actor_name,customer_snapshot,no_response_confirmed) VALUES(r.id,_stage,trim(r.customer_email),_reply,auth.uid(),coalesce(nullif(_actor_name,''),'SLT Rental Team'),jsonb_build_object('name',r.customer_name,'order_code',r.order_code,'product_name',r.product_name,'offer_payload',r.offer_payload,'end_date',_end,'crm_customer_id',r.crm_customer_id,'address_form',r.address_form),_no_response) RETURNING * INTO d;
 END IF;
 RETURN jsonb_build_object('already_queued',false,'delivery',to_jsonb(d));
END $$;
REVOKE ALL ON FUNCTION public.claim_rental_return_reminder(uuid,integer,text,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.claim_rental_return_reminder(uuid,integer,text,boolean) TO authenticated;
REVOKE ALL ON FUNCTION public.can_send_rental_return_reminder(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.can_send_rental_return_reminder(uuid,text) TO authenticated,service_role;