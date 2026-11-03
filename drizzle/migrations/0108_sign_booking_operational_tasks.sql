ALTER TABLE public.staff_todo_lists ADD COLUMN sign_booking_id uuid REFERENCES public.sign_bookings(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX staff_todo_lists_sign_booking_unique ON public.staff_todo_lists(sign_booking_id) WHERE sign_booking_id IS NOT NULL;
ALTER TABLE public.staff_todo_items ADD COLUMN sign_step text;
CREATE OR REPLACE FUNCTION public.sync_sign_booking_tasks() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE lid uuid; r public.rental_inquiries;
BEGIN
 IF NEW.package <> 'sorglos' THEN RETURN NEW; END IF;
 SELECT * INTO r FROM public.rental_inquiries WHERE id=NEW.inquiry_id;
 IF NEW.status IN ('reserved','paid','review') THEN
 INSERT INTO public.staff_todo_lists(title,description,location,status,priority,due_date,created_by_name,sent_at,sign_booking_id)
 VALUES('Halteverbot #'||r.order_code||' · Genehmigung prüfen und aufstellen',concat_ws(E'\n','Genehmigung vor Aufstellung prüfen. Aufstellung erst nach vollständiger Zahlung und geprüfter Genehmigung.', 'Aufstelladresse: '||concat_ws(', ',r.delivery_street,r.delivery_postal_code,r.delivery_city),'Zeitraum: '||NEW.start_date||' bis '||NEW.end_date,CASE WHEN NEW.permit_path IS NULL THEN 'Noch keine Genehmigung hochgeladen – Genehmigung einholen.' ELSE 'Genehmigung am Auftrag verfügbar – Inhalt und Gültigkeit prüfen.' END),NEW.location,'sent','high',(now() AT TIME ZONE 'Europe/Berlin')::date,'Automatische Schilderbuchung',now(),NEW.id)
 ON CONFLICT (sign_booking_id) WHERE sign_booking_id IS NOT NULL DO NOTHING RETURNING id INTO lid;
 IF lid IS NOT NULL THEN
 INSERT INTO public.staff_todo_items(list_id,title,note,sort_order,sign_step) VALUES
 (lid,'Genehmigung prüfen','Adresse, Zeitraum, Auflagen und rechtzeitige Aufstellung anhand der Genehmigung prüfen; fehlende Genehmigung einholen.',0,'permit'),
 (lid,'Halteverbot aufstellen und Aufstellprotokoll erstellen','Erst nach vollständigem Zahlungseingang und geprüfter Genehmigung; Aufstelltermin anhand der behördlichen Auflagen planen.',1,'setup'),
 (lid,'Schilder nach Ende abbauen und zurücknehmen','Mietende: '||NEW.end_date::text,2,'removal');
 END IF;
 ELSIF NEW.status='expired' THEN
 UPDATE public.staff_todo_lists SET status='done',completed_at=now(),description=COALESCE(description,'')||E'\nReservierung ohne Zahlung abgelaufen – keine Aufstellung durchführen.' WHERE sign_booking_id=NEW.id AND status<>'done';
 END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.sync_sign_booking_tasks() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER sign_booking_operational_tasks AFTER INSERT OR UPDATE OF status ON public.sign_bookings FOR EACH ROW EXECUTE FUNCTION public.sync_sign_booking_tasks();
CREATE OR REPLACE FUNCTION public.guard_sign_task_completion() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE bid uuid; b public.sign_bookings;
BEGIN
 SELECT sign_booking_id INTO bid FROM public.staff_todo_lists WHERE id=NEW.list_id;
 IF bid IS NULL OR NOT NEW.is_done OR OLD.is_done THEN RETURN NEW; END IF;
 SELECT * INTO b FROM public.sign_bookings WHERE id=bid;
 IF b.status='expired' THEN RAISE EXCEPTION 'Reservierung abgelaufen – keine Aufstellung durchführen' USING ERRCODE='23514'; END IF;
 IF NEW.sign_step IN ('setup','removal') AND (b.status<>'paid' OR NOT EXISTS(SELECT 1 FROM public.staff_todo_items WHERE list_id=NEW.list_id AND sign_step='permit' AND is_done)) THEN RAISE EXCEPTION 'Zuerst vollständigen Zahlungseingang und Genehmigungsprüfung abschließen' USING ERRCODE='23514'; END IF;
 IF NEW.sign_step='removal' AND NOT EXISTS(SELECT 1 FROM public.staff_todo_items WHERE list_id=NEW.list_id AND sign_step='setup' AND is_done) THEN RAISE EXCEPTION 'Zuerst Aufstellung abschließen' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_sign_task_completion() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER guard_sign_task_completion BEFORE UPDATE OF is_done ON public.staff_todo_items FOR EACH ROW EXECUTE FUNCTION public.guard_sign_task_completion();