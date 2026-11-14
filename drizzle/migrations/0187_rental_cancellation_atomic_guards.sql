CREATE OR REPLACE FUNCTION public.confirm_rental_cancellation(_inquiry uuid,_actor uuid,_expected timestamptz,_snapshot jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET lock_timeout='2s' AS $$
DECLARE r public.rental_inquiries; p record; sb record;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' OR NOT public.can_edit_operations(_actor) THEN RAISE EXCEPTION 'Nicht berechtigt' USING ERRCODE='42501'; END IF;
 SELECT * INTO r FROM public.rental_inquiries WHERE id=_inquiry FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Auftrag nicht gefunden'; END IF;
 IF NOT public.has_role(_actor,'admin') AND NOT EXISTS(SELECT 1 FROM public.staff_profiles s WHERE s.user_id=_actor AND s.is_active AND public.slt_stock_location(s.location)=public.slt_stock_location(r.location)) THEN RAISE EXCEPTION 'Keine Berechtigung für diesen Standort' USING ERRCODE='42501'; END IF;
 IF r.cancelled_at IS NOT NULL THEN RETURN r.cancellation_payload; END IF;
 IF r.updated_at IS DISTINCT FROM _expected THEN RAISE EXCEPTION 'Auftrag wurde geändert. Bitte neu laden.' USING ERRCODE='PT409'; END IF;
 IF EXISTS(SELECT 1 FROM public.inquiry_invoices WHERE rental_inquiry_id=r.id AND status<>'draft') THEN RAISE EXCEPTION 'Vorhandene Rechnungen erfordern gesonderte Korrekturabrechnung' USING ERRCODE='23514'; END IF;
 IF EXISTS(SELECT 1 FROM public.b2b_delivery_notes d WHERE (d.rental_inquiry_id=r.id OR d.reservation_id=r.b2b_reservation_id) AND d.status IN ('signed','signed_staff_only')) THEN RAISE EXCEPTION 'Bereits übergebene Geräte über Rückgabe abrechnen' USING ERRCODE='23514'; END IF;
 IF _snapshot IS NULL OR coalesce(length(_snapshot->>'reason'),0)<3 OR jsonb_typeof(_snapshot->'invoice_items') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Ungültige Stornodaten'; END IF;
 IF EXISTS(SELECT 1 FROM public.b2b_transport_orders WHERE rental_inquiry_id=r.id AND status='done') THEN RAISE EXCEPTION 'Ausgeführter Transport erfordert individuelle Abrechnung'; END IF;
 FOR p IN SELECT mp.id FROM public.b2b_managed_products mp WHERE mp.id IN (SELECT managed_product_id FROM public.b2b_instance_allocations WHERE rental_inquiry_id=r.id) OR (mp.slug='halteverbotsschilder-set' AND EXISTS(SELECT 1 FROM public.sign_bookings WHERE inquiry_id=r.id)) ORDER BY mp.id LOOP PERFORM 1 FROM public.b2b_managed_products WHERE id=p.id FOR UPDATE; END LOOP;
 FOR sb IN SELECT id FROM public.sign_bookings WHERE inquiry_id=r.id ORDER BY id FOR UPDATE LOOP
  IF EXISTS(SELECT 1 FROM public.staff_todo_items it JOIN public.staff_todo_lists l ON l.id=it.list_id WHERE l.sign_booking_id=sb.id AND it.sign_step IN ('setup','handover') AND it.completed_at IS NOT NULL) THEN RAISE EXCEPTION 'Bereits aufgestellte oder ausgegebene Schilder über Rückgabe abrechnen'; END IF;
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
 INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details,user_id) VALUES(r.id,'order_cancelled',r.cancellation_payload,_actor);
 RETURN r.cancellation_payload;
END $$;
REVOKE ALL ON FUNCTION public.confirm_rental_cancellation(uuid,uuid,timestamptz,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_rental_cancellation(uuid,uuid,timestamptz,jsonb) TO service_role;
CREATE OR REPLACE FUNCTION public.guard_cancelled_order_invoice() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.rental_inquiries;
BEGIN
 IF NEW.rental_inquiry_id IS NULL OR NEW.invoice_kind='credit_note' THEN RETURN NEW; END IF;
 SELECT * INTO r FROM public.rental_inquiries WHERE id=NEW.rental_inquiry_id FOR UPDATE;
 IF r.cancelled_at IS NOT NULL THEN
  IF EXISTS(SELECT 1 FROM public.inquiry_invoices WHERE rental_inquiry_id=r.id AND id<>NEW.id AND status<>'draft' AND invoice_kind<>'credit_note') THEN RAISE EXCEPTION 'Stornorechnung bereits vorhanden' USING ERRCODE='23514'; END IF;
  IF NEW.invoice_kind<>'invoice' OR round(NEW.gross_amount,2)<>round((r.cancellation_payload->'totals'->>'grossAmount')::numeric,2) THEN RAISE EXCEPTION 'Rechnung entspricht nicht der gespeicherten Stornoabrechnung' USING ERRCODE='23514'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER cancelled_order_invoice_guard BEFORE INSERT ON public.inquiry_invoices FOR EACH ROW EXECUTE FUNCTION public.guard_cancelled_order_invoice();