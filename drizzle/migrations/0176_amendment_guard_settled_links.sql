-- Stale online payment links no longer block amendments once recorded payments already cover rent and deposit (#2R848D).
CREATE OR REPLACE FUNCTION public.save_rental_order_amendment(_id uuid, _expected integer, _payload jsonb, _note text, _agreed_at timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE r public.rental_inquiries; expected_total numeric; item_net numeric; item_vat numeric; addon_net numeric; cost_net numeric; total numeric; result jsonb; availability jsonb; snapshot jsonb;
BEGIN
IF NOT public.can_edit_operations(auth.uid()) THEN RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE='42501'; END IF;
SELECT * INTO r FROM public.rental_inquiries WHERE id=_id FOR UPDATE;
IF NOT FOUND OR r.status<>'accepted' OR r.offer_number IS NULL THEN RAISE EXCEPTION 'Nur angenommene Mietaufträge können geändert werden'; END IF;
IF r.order_revision<>_expected THEN RAISE EXCEPTION 'Auftrag wurde inzwischen geändert' USING ERRCODE='40001'; END IF;
IF length(trim(COALESCE(_note,'')))<5 OR _agreed_at IS NULL OR _agreed_at>now()+interval '5 minutes' THEN RAISE EXCEPTION 'Vereinbarung mit Datum und Notiz erforderlich'; END IF;
IF COALESCE((r.offer_payload->>'direct_booking')::boolean,false) THEN RAISE EXCEPTION 'Direktbuchungen benötigen eine eigene Änderungsabwicklung'; END IF;
IF EXISTS(SELECT 1 FROM public.deposit_settlements WHERE rental_inquiry_id=_id) THEN RAISE EXCEPTION 'Kaution bereits abgerechnet; Änderung gesperrt'; END IF;
IF EXISTS(SELECT 1 FROM public.offer_payment_links WHERE inquiry_id=_id AND inquiry_table='rental_inquiries' AND status='active' AND stripe_session_id IS NOT NULL) AND (SELECT COALESCE(sum(round(COALESCE((p->>'amount')::numeric,0)*100)),0) FROM jsonb_array_elements(CASE WHEN jsonb_typeof(r.payments)='array' THEN r.payments ELSE '[]'::jsonb END) p) < round(COALESCE(r.offer_total_gross,0)*100)+round(COALESCE((r.offer_payload->>'deposit')::numeric,0)*100) THEN RAISE EXCEPTION 'Aktive Online-Zahlung zuerst abschließen oder den Zahlungslink sperren'; END IF;
SELECT COALESCE(sum(round((i->>'quantity')::numeric*(i->>'unit_price')::numeric*(1-COALESCE((i->>'discount_percent')::numeric,0)/100),2)),0), round(COALESCE(sum(round((i->>'quantity')::numeric*(i->>'unit_price')::numeric*(1-COALESCE((i->>'discount_percent')::numeric,0)/100),2)*COALESCE((i->>'vat_rate')::numeric,19)/100),0),2) INTO item_net,item_vat FROM jsonb_array_elements(_payload->'items') i;
SELECT round(COALESCE(sum((a->>'amount')::numeric),0),2) INTO addon_net FROM jsonb_array_elements(_payload->'items') i CROSS JOIN LATERAL jsonb_array_elements(COALESCE(i->'addons','[]'::jsonb)) a WHERE COALESCE((a->>'optional')::boolean,false)=false;
cost_net:=COALESCE((_payload->>'delivery_cost_delivery')::numeric,0)+COALESCE((_payload->>'delivery_cost_return')::numeric,0)+COALESCE((_payload->>'setup_cost')::numeric,0)+COALESCE((_payload->>'dismantle_cost')::numeric,0)+COALESCE((_payload->>'return_location_cost')::numeric,0);
expected_total:=round(item_net+addon_net+cost_net,2)+round(item_vat+addon_net*0.19+cost_net*0.19,2);
IF abs(expected_total-(_payload->'totals'->>'grossAmount')::numeric)>0 THEN RAISE EXCEPTION 'Auftragssumme stimmt nicht mit Positionen überein'; END IF;
total:=(_payload->'totals'->>'grossAmount')::numeric;
IF total IS NULL OR total<=0 OR jsonb_array_length(_payload->'items')=0 THEN RAISE EXCEPTION 'Ungültige Auftragssumme'; END IF;
snapshot:=jsonb_build_object('offer_payload',r.offer_payload,'offer_total_gross',r.offer_total_gross,'start_date',r.start_date,'end_date',r.end_date,'offer_number',r.offer_number,'offer_file_url',r.offer_file_url,'offer_sent_at',r.offer_sent_at,'offer_accepted_at',r.offer_accepted_at,'order_confirmation_number',r.order_confirmation_number,'order_confirmation_file_url',r.order_confirmation_file_url);
IF r.order_revision=0 THEN INSERT INTO public.rental_order_revisions(rental_inquiry_id,version,snapshot,agreement_note,agreed_at,created_by) VALUES(_id,0,snapshot,'Ursprünglich angenommener Auftrag',COALESCE(r.offer_accepted_at,now()),auth.uid()); END IF;
UPDATE public.rental_inquiries SET original_accepted_offer=COALESCE(original_accepted_offer,snapshot),offer_payload=_payload,offer_total_gross=total,order_revision=order_revision+1,availability_pending=true,start_date=(SELECT min(i->>'rental_start')::date FROM jsonb_array_elements(_payload->'items') i),end_date=(SELECT max(i->>'rental_end')::date FROM jsonb_array_elements(_payload->'items') i) WHERE id=_id;
PERFORM id FROM public.b2b_managed_products WHERE slug IN(SELECT i->>'product_slug' FROM jsonb_array_elements(_payload->'items') i) ORDER BY id FOR UPDATE;
availability:=public.check_availability(_id);
IF NOT COALESCE((availability->>'all_available')::boolean,false) THEN RAISE EXCEPTION 'Geänderte Artikel oder Zeiträume nicht vollständig verfügbar. Verfügbarkeit zuerst klären' USING ERRCODE='40001'; END IF;
DELETE FROM public.b2b_instance_allocations WHERE rental_inquiry_id=_id;
UPDATE public.b2b_reservations SET start_date=(SELECT start_date::date FROM public.rental_inquiries WHERE id=_id),end_date=(SELECT end_date::date FROM public.rental_inquiries WHERE id=_id),updated_at=now() WHERE inquiry_id=_id OR id=r.b2b_reservation_id;
result:=public.confirm_order(_id,'{"mode":"confirm","items":{}}'::jsonb);
UPDATE public.offer_payment_links SET status='superseded',updated_at=now() WHERE inquiry_id=_id AND inquiry_table='rental_inquiries' AND status='active';
INSERT INTO public.rental_order_revisions(rental_inquiry_id,version,snapshot,agreement_note,agreed_at,created_by) VALUES(_id,_expected+1,jsonb_build_object('offer_payload',_payload,'offer_total_gross',total,'offer_number',r.offer_number),trim(_note),_agreed_at,auth.uid());
INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details,user_id) VALUES(_id,'order_amended',jsonb_build_object('version',_expected+1,'agreement_note',trim(_note),'agreed_at',_agreed_at),auth.uid());
RETURN jsonb_build_object('version',_expected+1,'totals',_payload->'totals');
END; $function$;