CREATE OR REPLACE FUNCTION public.guard_offer_link_decision() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE current_offer text; inquiry_status text; handover boolean;
BEGIN
 IF OLD.status='active' AND NEW.status IN ('accepted','declined') THEN
 IF OLD.inquiry_table='rental_inquiries' THEN SELECT offer_number,status INTO current_offer,inquiry_status FROM public.rental_inquiries WHERE id=OLD.inquiry_id FOR UPDATE;
 ELSE SELECT offer_number,status INTO current_offer,inquiry_status FROM public.sales_inquiries WHERE id=OLD.inquiry_id FOR UPDATE; END IF;
 handover := OLD.inquiry_table='rental_inquiries' AND NEW.status='accepted' AND NEW.accepted_channel='onsite' AND current_setting('slt.signed_handover',true)=OLD.inquiry_id::text;
 IF current_offer IS DISTINCT FROM OLD.offer_number OR inquiry_status NOT IN ('new','in_progress','offer_sent') OR (NOT COALESCE(handover,false) AND now()>=public.offer_link_deadline(OLD)) THEN RAISE EXCEPTION 'Angebot ist nicht mehr gültig'; END IF;
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
CREATE OR REPLACE FUNCTION public.bind_signed_rental_handover() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.rental_inquiries; actor uuid; link_id uuid; claims text; result jsonb;
BEGIN
 IF NEW.rental_inquiry_id IS NULL THEN RETURN NEW; END IF;
 IF TG_OP='UPDATE' THEN IF OLD.customer_signed_at IS NOT NULL OR NEW.customer_signed_at IS NULL THEN RETURN NEW; END IF; END IF;
 SELECT * INTO r FROM public.rental_inquiries WHERE id=NEW.rental_inquiry_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Mietvorgang nicht gefunden'; END IF;
 IF TG_OP='INSERT' AND EXISTS(SELECT 1 FROM public.b2b_delivery_notes WHERE rental_inquiry_id=r.id) THEN RAISE EXCEPTION 'Übergabeprotokoll bereits vorhanden'; END IF;
 IF NEW.customer_signed_at IS NULL THEN
 IF r.status<>'accepted' THEN RAISE EXCEPTION 'Ohne Kundenunterschrift zuerst Angebot annehmen lassen'; END IF;
 RETURN NEW;
 END IF;
 actor:=NULLIF(NEW.protocol_data->>'created_by','')::uuid;
 IF NOT public.can_edit_operations(actor) THEN RAISE EXCEPTION 'Keine Berechtigung für Übergabe'; END IF;
 IF NEW.signature_data IS NULL OR NEW.signature_data NOT LIKE 'data:image/png;base64,%' OR NOT COALESCE(NEW.agb_accepted,false) OR NOT COALESCE((NEW.protocol_data->>'items_confirmed')::boolean,false) THEN RAISE EXCEPTION 'Kundenunterschrift und Bestätigungen fehlen'; END IF;
 IF r.status NOT IN ('new','in_progress','offer_sent','accepted') OR r.closed_manually_at IS NOT NULL OR r.offer_number IS NULL OR COALESCE((r.offer_payload->>'undated_offer')::boolean,false) THEN RAISE EXCEPTION 'Kein bestätigbares Mietangebot vorhanden'; END IF;
 IF r.status<>'accepted' THEN
 SELECT id INTO link_id FROM public.offer_acceptance_links WHERE inquiry_table='rental_inquiries' AND inquiry_id=r.id AND offer_number=r.offer_number AND status='active' ORDER BY created_at DESC LIMIT 1 FOR UPDATE;
 IF link_id IS NULL THEN RAISE EXCEPTION 'Kein aktuelles Angebot zur Unterschrift vorhanden'; END IF;
 PERFORM set_config('slt.signed_handover',r.id::text,true);
 UPDATE public.offer_acceptance_links SET status='accepted',accepted_at=NEW.customer_signed_at,signer_name=NEW.protocol_data->>'customer_signer_name',signature_data=NEW.signature_data,agb_accepted=true,accepted_channel='onsite',accepted_user_agent='handover-staff:'||actor::text WHERE id=link_id;
 PERFORM set_config('slt.signed_handover','',true);
 UPDATE public.rental_inquiries SET status='accepted',offer_accepted_at=NEW.customer_signed_at WHERE id=r.id;
 END IF;
 claims:=current_setting('request.jwt.claims',true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',actor,'role','authenticated')::text,true);
 result:=public.confirm_order(r.id,'{"mode":"confirm","items":{}}'::jsonb);
 PERFORM set_config('request.jwt.claims',COALESCE(claims,''),true);
 INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details,user_id) VALUES(r.id,'order_bound_by_handover',jsonb_build_object('protocol_id',NEW.id,'signed_at',NEW.customer_signed_at,'confirmation',result),actor);
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.bind_signed_rental_handover() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.bind_signed_rental_handover() TO service_role;
CREATE TRIGGER bind_signed_rental_handover BEFORE INSERT OR UPDATE OF customer_signed_at ON public.b2b_delivery_notes FOR EACH ROW EXECUTE FUNCTION public.bind_signed_rental_handover();