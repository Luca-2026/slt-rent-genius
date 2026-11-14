ALTER TABLE public.rental_inquiries ADD COLUMN IF NOT EXISTS cancelled_at timestamptz, ADD COLUMN IF NOT EXISTS cancellation_payload jsonb;
ALTER TABLE public.sign_bookings ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
CREATE OR REPLACE FUNCTION public.guard_rental_cancellation() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF OLD.cancelled_at IS NOT NULL AND (NEW.cancelled_at IS DISTINCT FROM OLD.cancelled_at OR NEW.cancellation_payload IS DISTINCT FROM OLD.cancellation_payload OR NEW.status IS DISTINCT FROM OLD.status) THEN RAISE EXCEPTION 'Stornierung ist unveränderlich; Abrechnung und Erstattung bleiben möglich' USING ERRCODE='23514'; END IF;
 IF NEW.cancelled_at IS DISTINCT FROM OLD.cancelled_at OR NEW.cancellation_payload IS DISTINCT FROM OLD.cancellation_payload THEN
  IF current_setting('app.cancellation_write',true) IS DISTINCT FROM 'allowed' THEN RAISE EXCEPTION 'Stornierung nur über den geschützten Stornoablauf' USING ERRCODE='42501'; END IF;
 END IF;
 IF NEW.status='cancelled' AND NEW.cancelled_at IS NULL THEN RAISE EXCEPTION 'Bitte Auftrag über die Stornoaktion stornieren' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER rental_cancellation_guard BEFORE UPDATE ON public.rental_inquiries FOR EACH ROW EXECUTE FUNCTION public.guard_rental_cancellation();
CREATE OR REPLACE FUNCTION public.confirm_rental_cancellation(_inquiry uuid,_actor uuid,_expected timestamptz,_snapshot jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET lock_timeout='2s' AS $$
DECLARE r public.rental_inquiries; p record; sb record;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 IF NOT public.can_edit_operations(_actor) THEN RAISE EXCEPTION 'Nicht berechtigt' USING ERRCODE='42501'; END IF;
 SELECT * INTO r FROM public.rental_inquiries WHERE id=_inquiry FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Auftrag nicht gefunden'; END IF;
 IF NOT public.has_role(_actor,'admin') AND NOT EXISTS(SELECT 1 FROM public.staff_profiles s WHERE s.user_id=_actor AND s.is_active AND public.slt_stock_location(s.location)=public.slt_stock_location(r.location)) THEN RAISE EXCEPTION 'Keine Berechtigung für diesen Standort' USING ERRCODE='42501'; END IF;
 IF r.cancelled_at IS NOT NULL THEN RETURN r.cancellation_payload; END IF;
 IF r.updated_at IS DISTINCT FROM _expected THEN RAISE EXCEPTION 'Auftrag wurde geändert. Bitte neu laden.' USING ERRCODE='PT409'; END IF;
 IF EXISTS(SELECT 1 FROM public.b2b_delivery_notes d WHERE d.rental_inquiry_id=r.id AND d.status IN ('signed','signed_staff_only')) THEN RAISE EXCEPTION 'Bereits übergebene Geräte über Rückgabe abrechnen' USING ERRCODE='23514'; END IF;
 IF _snapshot IS NULL OR coalesce(length(_snapshot->>'reason'),0)<3 OR jsonb_typeof(_snapshot->'invoice_items') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Ungültige Stornodaten'; END IF;
 IF EXISTS(SELECT 1 FROM public.b2b_transport_orders WHERE rental_inquiry_id=r.id AND status='done') THEN RAISE EXCEPTION 'Ausgeführter Transport erfordert individuelle Abrechnung'; END IF;
 FOR p IN SELECT mp.id FROM public.b2b_managed_products mp JOIN public.b2b_instance_allocations a ON a.managed_product_id=mp.id WHERE a.rental_inquiry_id=r.id GROUP BY mp.id ORDER BY mp.id LOOP PERFORM 1 FROM public.b2b_managed_products WHERE id=p.id FOR UPDATE; END LOOP;
 FOR sb IN SELECT id FROM public.sign_bookings WHERE inquiry_id=r.id ORDER BY id FOR UPDATE LOOP
  UPDATE public.sign_bookings SET cancelled_at=now(),status='expired' WHERE id=sb.id;
  UPDATE public.staff_todo_lists SET status='completed',completed_at=now() WHERE sign_booking_id=sb.id;
 END LOOP;
 DELETE FROM public.b2b_instance_allocations WHERE rental_inquiry_id=r.id;
 UPDATE public.b2b_reservations SET status='cancelled' WHERE inquiry_id=r.id OR id=r.b2b_reservation_id;
 UPDATE public.b2b_transport_orders SET status='cancelled' WHERE rental_inquiry_id=r.id AND status='open';
 UPDATE public.offer_payment_links SET status='superseded',updated_at=now() WHERE inquiry_id=r.id AND inquiry_table='rental_inquiries' AND status='active';
 UPDATE public.offer_acceptance_links SET status='void' WHERE inquiry_id=r.id AND inquiry_table='rental_inquiries' AND status='active';
 PERFORM set_config('app.cancellation_write','allowed',true);
 UPDATE public.rental_inquiries SET status='cancelled',cancelled_at=now(),cancellation_payload=_snapshot||jsonb_build_object('actor',_actor,'confirmed_at',now()),installment_enabled=false WHERE id=r.id RETURNING * INTO r;
 INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details,created_by) VALUES(r.id,'order_cancelled',r.cancellation_payload,_actor);
 RETURN r.cancellation_payload;
END $$;
REVOKE ALL ON FUNCTION public.confirm_rental_cancellation(uuid,uuid,timestamptz,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_rental_cancellation(uuid,uuid,timestamptz,jsonb) TO service_role;
COMMENT ON COLUMN public.rental_inquiries.cancellation_payload IS 'Immutable cancellation fee and evidence snapshot; issued documents and original offer remain unchanged.';
COMMENT ON COLUMN public.sign_bookings.cancelled_at IS 'Cancellation evidence; expired status releases inventory without overwriting payment facts.';