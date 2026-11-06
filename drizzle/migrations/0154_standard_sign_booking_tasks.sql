CREATE OR REPLACE FUNCTION public.sync_sign_booking_tasks() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE lid uuid; r public.rental_inquiries; loc text;
BEGIN
 SELECT * INTO r FROM public.rental_inquiries WHERE id=NEW.inquiry_id;
 IF NEW.package = 'standard' THEN
  IF NEW.status = 'paid' THEN
   loc := CASE WHEN NEW.location='bonn' THEN 'Bonn' ELSE 'Krefeld' END;
   INSERT INTO public.staff_todo_lists(title,description,location,status,priority,due_date,created_by_name,sent_at,sign_booking_id)
   VALUES('Halteverbotsschilder #'||r.order_code||' · bekleben und ausgeben', concat_ws(E'\n',
     'Neue bezahlte Buchung ('||NEW.quantity||' Sets, Selbstabholung '||loc||').',
     'Mietzeitraum: '||to_char(NEW.start_date,'DD.MM.YYYY')||' bis '||to_char(NEW.end_date,'DD.MM.YYYY'),
     CASE WHEN NEW.permit_valid_from IS NOT NULL THEN 'Schilder bekleben für: '||to_char(NEW.permit_valid_from,'DD.MM.YYYY')||' bis '||to_char(NEW.permit_valid_until,'DD.MM.YYYY')||' · Genehmigung vom '||to_char(NEW.permit_issued_on,'DD.MM.YYYY') ELSE 'Genehmigungszeitraum nicht angegeben – beim Kunden erfragen.' END,
     'Kunde: '||concat_ws(' · ',r.customer_name,r.customer_phone,r.customer_email)),
     NEW.location,'sent','high',GREATEST((now() AT TIME ZONE 'Europe/Berlin')::date, NEW.start_date - 1),'Automatische Schilderbuchung',now(),NEW.id)
   ON CONFLICT (sign_booking_id) WHERE sign_booking_id IS NOT NULL DO NOTHING RETURNING id INTO lid;
   IF lid IS NOT NULL THEN
    INSERT INTO public.staff_todo_items(list_id,title,note,sort_order,sign_step) VALUES
     (lid,'Schilder für den genehmigten Zeitraum bekleben','Zeitraum laut Kundenangabe; kann vom Mietzeitraum abweichen.',0,'label'),
     (lid,'Schilder und Füße an Kunden ausgeben','Abholung ab '||to_char(NEW.start_date,'DD.MM.YYYY'),1,'handover'),
     (lid,'Rückgabe prüfen','Rückgabe bis '||to_char(NEW.end_date,'DD.MM.YYYY')||'; Vollständigkeit und Schäden prüfen.',2,'return'),
     (lid,'Rechnung erstellen','Nach Rückgabe Rechnung am Auftrag erstellen; Zahlung und Kaution sind dort erfasst.',3,'invoice');
   END IF;
  END IF;
  RETURN NEW;
 END IF;
 IF NEW.status IN ('reserved','paid','review') THEN
 INSERT INTO public.staff_todo_lists(title,description,location,status,priority,due_date,created_by_name,sent_at,sign_booking_id)
 VALUES('Halteverbot #'||r.order_code||' · Genehmigung prüfen und aufstellen',concat_ws(E'\n','Genehmigung vor Aufstellung prüfen. Aufstellung erst nach vollständiger Zahlung und geprüfter Genehmigung.', 'Aufstelladresse: '||concat_ws(', ',r.delivery_street,r.delivery_postal_code,r.delivery_city),'Zeitraum: '||NEW.start_date||' bis '||NEW.end_date,CASE WHEN NEW.permit_mode='slt' OR (NEW.permit_mode IS NULL AND NEW.permit_path IS NULL) THEN 'Genehmigung durch SLT beantragen (14 Werktage Mo–Sa, ohne NRW-Feiertage); städtische Gebühren anschließend transparent nach Bescheid abrechnen.' ELSE 'Genehmigung am Auftrag verfügbar – Inhalt und Gültigkeit prüfen.' END),NEW.location,'sent','high',(now() AT TIME ZONE 'Europe/Berlin')::date,'Automatische Schilderbuchung',now(),NEW.id)
 ON CONFLICT (sign_booking_id) WHERE sign_booking_id IS NOT NULL DO NOTHING RETURNING id INTO lid;
 IF lid IS NOT NULL THEN
 INSERT INTO public.staff_todo_items(list_id,title,note,sort_order,sign_step) VALUES
 (lid,CASE WHEN NEW.permit_mode='slt' THEN 'Genehmigung durch SLT beantragen und prüfen' ELSE 'Vorhandene Genehmigung prüfen' END,'Adresse, Zeitraum, Auflagen und rechtzeitige Aufstellung prüfen. Gebühren transparent nach Bescheid abrechnen.',0,'permit'),
 (lid,'Halteverbot aufstellen und Aufstellprotokoll erstellen','Erst nach vollständigem Zahlungseingang und geprüfter Genehmigung; Aufstelltermin anhand der behördlichen Auflagen planen.',1,'setup'),
 (lid,'Schilder nach Ende abbauen und zurücknehmen','Mietende: '||NEW.end_date::text,2,'removal');
 END IF;
 ELSIF NEW.status='expired' THEN
 UPDATE public.staff_todo_lists SET status='done',completed_at=now(),description=COALESCE(description,'')||E'\nReservierung ohne Zahlung abgelaufen – keine Aufstellung durchführen.' WHERE sign_booking_id=NEW.id AND status<>'done';
 END IF;
 RETURN NEW;
END; $function$;
ALTER TABLE public.sign_bookings ADD COLUMN IF NOT EXISTS staff_notified_at timestamptz;
COMMENT ON COLUMN public.sign_bookings.staff_notified_at IS 'When the location mailbox received the new-booking notice.';