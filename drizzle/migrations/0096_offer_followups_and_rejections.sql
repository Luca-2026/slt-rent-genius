ALTER TABLE public.offer_acceptance_links ADD COLUMN expires_at timestamptz, ADD COLUMN dispatched_at timestamptz, ADD COLUMN declined_at timestamptz, ADD COLUMN decline_reason text, ADD COLUMN decline_note text;
ALTER TABLE public.offer_acceptance_links DROP CONSTRAINT offer_acceptance_links_status_check;
ALTER TABLE public.offer_acceptance_links ADD CONSTRAINT offer_acceptance_links_status_check CHECK (status IN ('active','accepted','void','declined','expired'));
CREATE TABLE public.offer_followup_deliveries (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), link_id uuid NOT NULL REFERENCES public.offer_acceptance_links(id), kind text NOT NULL CHECK(kind IN ('followup','decline')), sequence integer NOT NULL DEFAULT 0, recipient text NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sent')), provider_id text, sent_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(link_id,kind,sequence));
GRANT SELECT ON public.offer_followup_deliveries TO authenticated;
GRANT ALL ON public.offer_followup_deliveries TO service_role;
ALTER TABLE public.offer_followup_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read offer delivery history" ON public.offer_followup_deliveries FOR SELECT TO authenticated USING(public.is_staff_member(auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE OR REPLACE FUNCTION public.offer_link_deadline(p_link public.offer_acceptance_links) RETURNS timestamptz LANGUAGE plpgsql STABLE SET search_path=public AS $$
DECLARE r public.rental_inquiries; deadline timestamptz; item jsonb; d date; t text; candidate timestamptz; has_item boolean:=false;
BEGIN
 deadline:=COALESCE(p_link.expires_at,(p_link.valid_until+1)::timestamp AT TIME ZONE 'Europe/Berlin');
 IF p_link.inquiry_table='rental_inquiries' THEN
 SELECT * INTO r FROM public.rental_inquiries WHERE id=p_link.inquiry_id;
 FOR item IN SELECT value FROM jsonb_array_elements(CASE WHEN jsonb_typeof(r.offer_payload->'items')='array' THEN r.offer_payload->'items' ELSE '[]'::jsonb END) LOOP
 d:=public.slt_try_date(item->>'rental_start');
 IF d IS NOT NULL THEN
 has_item:=true; t:=item->>'rental_start_time'; IF t IS NULL OR t !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN t:='00:00'; END IF;
 candidate:=(d+t::time) AT TIME ZONE 'Europe/Berlin'; deadline:=LEAST(deadline,candidate);
 END IF;
 END LOOP;
 IF NOT has_item THEN
 d:=public.slt_try_date(r.start_date); t:=r.start_time;
 IF d IS NOT NULL THEN IF t IS NULL OR t !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN t:='00:00'; END IF; deadline:=LEAST(deadline,(d+t::time) AT TIME ZONE 'Europe/Berlin'); END IF;
 END IF;
 END IF;
 RETURN deadline;
END $$;
REVOKE ALL ON FUNCTION public.offer_link_deadline(public.offer_acceptance_links) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.offer_link_deadline(public.offer_acceptance_links) TO service_role;
CREATE OR REPLACE FUNCTION public.guard_offer_link_decision() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE current_offer text; inquiry_status text;
BEGIN
 IF OLD.status='active' AND NEW.status IN ('accepted','declined') THEN
 IF OLD.inquiry_table='rental_inquiries' THEN SELECT offer_number,status INTO current_offer,inquiry_status FROM public.rental_inquiries WHERE id=OLD.inquiry_id FOR UPDATE;
 ELSE SELECT offer_number,status INTO current_offer,inquiry_status FROM public.sales_inquiries WHERE id=OLD.inquiry_id FOR UPDATE; END IF;
 IF current_offer IS DISTINCT FROM OLD.offer_number OR inquiry_status NOT IN ('new','in_progress','offer_sent') OR now()>=public.offer_link_deadline(OLD) THEN RAISE EXCEPTION 'Angebot ist nicht mehr gültig'; END IF;
 IF NEW.status='declined' THEN
 IF NEW.decline_reason NOT IN ('price','no_need','dates','other') OR length(COALESCE(NEW.decline_note,''))>2000 THEN RAISE EXCEPTION 'Ungültiger Ablehnungsgrund'; END IF;
 NEW.declined_at:=now();
 IF OLD.inquiry_table='rental_inquiries' THEN
 UPDATE public.rental_inquiries SET status='rejected' WHERE id=OLD.inquiry_id;
 INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details) VALUES(OLD.inquiry_id,'offer_declined',jsonb_build_object('offer_number',OLD.offer_number,'reason',NEW.decline_reason,'note',NEW.decline_note));
 ELSE UPDATE public.sales_inquiries SET status='rejected' WHERE id=OLD.inquiry_id; END IF;
 END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guard_offer_link_decision BEFORE UPDATE ON public.offer_acceptance_links FOR EACH ROW EXECUTE FUNCTION public.guard_offer_link_decision();
CREATE OR REPLACE FUNCTION public.expire_open_offer_links() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.offer_acceptance_links; n integer:=0; r public.rental_inquiries;
BEGIN
 FOR l IN SELECT * FROM public.offer_acceptance_links WHERE status='active' AND inquiry_table='rental_inquiries' FOR UPDATE SKIP LOCKED LOOP
 SELECT * INTO r FROM public.rental_inquiries WHERE id=l.inquiry_id FOR UPDATE;
 IF r.offer_number=l.offer_number AND r.status IN ('new','in_progress','offer_sent') AND now()>=public.offer_link_deadline(l) THEN
 UPDATE public.offer_acceptance_links SET status='expired' WHERE id=l.id;
 UPDATE public.rental_inquiries SET status='done' WHERE id=r.id;
 INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details) VALUES(r.id,'offer_expired',jsonb_build_object('offer_number',l.offer_number,'deadline',public.offer_link_deadline(l)));
 n:=n+1;
 END IF;
 END LOOP;
 RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.expire_open_offer_links() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.expire_open_offer_links() TO service_role;
CREATE OR REPLACE FUNCTION public.offer_link_deadline_by_id(p_id uuid) RETURNS timestamptz LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.offer_link_deadline(l) FROM public.offer_acceptance_links l WHERE l.id=p_id $$;
REVOKE ALL ON FUNCTION public.offer_link_deadline_by_id(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.offer_link_deadline_by_id(uuid) TO service_role;