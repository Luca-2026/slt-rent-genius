CREATE OR REPLACE FUNCTION public.reserve_sign_booking(_request uuid, _token text, _body jsonb, _permit_token text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.b2b_managed_products; b public.sign_bookings; c jsonb; loc text; pkg text; qty int; s date; e date; used int; capacity int; gross int; dep int; iid uuid; number text; payload jsonb; upload public.sign_permit_uploads;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 SELECT * INTO p FROM public.b2b_managed_products WHERE slug='halteverbotsschilder-set' AND is_published FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Artikel nicht verfügbar'; END IF;
 c:=p.direct_booking_config;
 IF NOT COALESCE((c->>'enabled')::boolean,false) THEN RAISE EXCEPTION 'Direktbuchung nicht verfügbar'; END IF;
 IF NOT COALESCE((c->>'live_enabled')::boolean,false) AND lower(_body->>'email') <> 'luca@sandhoff.org' THEN RAISE EXCEPTION 'Direktbuchung befindet sich noch im Testbetrieb' USING ERRCODE='42501'; END IF;
 SELECT * INTO b FROM public.sign_bookings WHERE request_id=_request;
 IF FOUND THEN
  IF b.snapshot->'request' IS DISTINCT FROM _body THEN RAISE EXCEPTION 'Buchung wurde inzwischen geändert' USING ERRCODE='40001'; END IF;
  RETURN jsonb_build_object('id',b.id,'token',b.token,'inquiry_id',b.inquiry_id,'status',b.status,'expires_at',b.expires_at);
 END IF;
 loc:=_body->>'location'; pkg:=_body->>'package'; qty:=(_body->>'quantity')::int; s:=(_body->>'start_date')::date; e:=(_body->>'end_date')::date;
 IF loc NOT IN ('krefeld','bonn') OR pkg NOT IN ('standard','sorglos') OR qty NOT BETWEEN 1 AND 10 OR s < (now() AT TIME ZONE 'Europe/Berlin')::date OR e<s OR e-s+1> (c->>'maxRentalDays')::int THEN RAISE EXCEPTION 'Ungültige Buchung'; END IF;
 IF length(COALESCE(_body->>'name',''))<2 OR position('@' IN COALESCE(_body->>'email',''))<2 OR _body->>'termsAccepted' IS DISTINCT FROM 'true' THEN RAISE EXCEPTION 'Kontaktdaten oder Bedingungen fehlen'; END IF;
 IF c->>'depositCents' IS NULL THEN RAISE EXCEPTION 'Kaution fehlt'; END IF;
 capacity:=COALESCE((p.quantities->>loc)::int,0);
 -- Serialize against staff confirmation as well as other public reservations via the product row lock.
 SELECT COALESCE(sum(quantity),0) INTO used FROM public.sign_bookings WHERE location=loc AND (status='paid' OR (status='reserved' AND expires_at>now())) AND daterange(start_date,end_date,'[]') && daterange(s,e,'[]');
 SELECT used + COALESCE(sum(GREATEST(COALESCE((it->>'articles')::int,1),1)),0) INTO used FROM public.rental_inquiries r CROSS JOIN LATERAL jsonb_array_elements(COALESCE(r.offer_payload->'items','[]')) it WHERE r.status IN ('in_progress','offer_sent','accepted','done') AND (r.status<>'done' OR r.order_confirmed_at IS NOT NULL) AND public.slt_normalize_location(r.location)=loc AND it->>'product_slug'=p.slug AND NOT EXISTS(SELECT 1 FROM public.sign_bookings sb WHERE sb.inquiry_id=r.id) AND public.slt_try_date(r.start_date)<=e AND COALESCE(public.slt_try_date(r.end_date),public.slt_try_date(r.start_date))>=s;
 SELECT used + COALESCE(sum(GREATEST(COALESCE(r.quantity,1),1)),0) INTO used FROM public.rental_inquiries r WHERE r.status IN ('in_progress','offer_sent','accepted','done') AND (r.status<>'done' OR r.order_confirmed_at IS NOT NULL) AND public.slt_normalize_location(r.location)=loc AND r.product_id=p.slug AND jsonb_array_length(COALESCE(r.offer_payload->'items','[]'))=0 AND NOT EXISTS(SELECT 1 FROM public.sign_bookings sb WHERE sb.inquiry_id=r.id) AND public.slt_try_date(r.start_date)<=e AND COALESCE(public.slt_try_date(r.end_date),public.slt_try_date(r.start_date))>=s;
 SELECT used + COALESCE(sum(GREATEST(COALESCE(r.quantity,1),1)),0) INTO used FROM public.b2b_reservations r WHERE r.status IN ('pending','offer_sent','confirmed','active') AND public.slt_normalize_location(r.location)=loc AND r.product_id=p.slug AND r.start_date<=e AND COALESCE(r.end_date,r.start_date)>=s;
 IF used+qty>capacity THEN RAISE EXCEPTION 'Nicht genügend Sets für diesen Zeitraum verfügbar' USING ERRCODE='40001'; END IF;
 IF _permit_token IS NOT NULL THEN SELECT * INTO upload FROM public.sign_permit_uploads WHERE token=_permit_token AND booking_id IS NULL AND created_at>now()-interval '2 hours' FOR UPDATE; IF NOT FOUND THEN RAISE EXCEPTION 'Genehmigungsupload ungültig'; END IF; END IF;
 gross:=(CASE WHEN pkg='standard' THEN c->>'standardGrossCents' ELSE c->>'sorglosGrossCents' END)::int*qty; dep:=(c->>'depositCents')::int*qty;
 IF gross<=0 OR dep<0 THEN RAISE EXCEPTION 'Preis nicht verfügbar'; END IF;
 number:=public.generate_offer_number_for('M');
 payload:=jsonb_build_object('payment_terms','vorkasse','deposit',dep/100.0,'direct_booking',true,'municipal_fees_separate',pkg='sorglos','totals',jsonb_build_object('grossAmount',gross/100.0,'netAmount',round(gross/119.0,2),'vatAmount',gross/100.0-round(gross/119.0,2)),'items',jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'product_slug',p.slug,'product_name',p.name,'description',CASE WHEN pkg='standard' THEN 'Standard-Set · 1–10 Miettage' ELSE 'Rundum-sorglos-Paket · Antrag, Aufstellung, Aufstellprotokoll und Abbau · städtische Gebühren separat' END,'articles',qty,'quantity',qty,'duration',1,'unit','pauschal','unit_price',gross/119.0/qty,'discount_percent',0,'start_date',s,'end_date',e)));
 INSERT INTO public.rental_inquiries(source,location,location_email,product_id,product_name,category_slug,quantity,start_date,end_date,start_time,end_time,customer_name,customer_email,customer_phone,customer_street,customer_postal_code,customer_city,customer_kind,status,offer_number,offer_total_gross,offer_payload,offer_accepted_at,requested_items,raw_payload,email_sent,message,setup_service_requested,delivery_requested,delivery_street,delivery_postal_code,delivery_city)
 VALUES('sign_direct_booking',CASE WHEN loc='bonn' THEN 'Bonn' ELSE 'Krefeld' END,loc||'@slt-rental.de',p.slug,p.name,p.category,qty,s::text,e::text,_body->>'start_time',_body->>'end_time',_body->>'name',lower(_body->>'email'),_body->>'phone',_body->>'street',_body->>'postalCode',_body->>'city',_body->>'customerKind','accepted',number,gross/100.0,payload,now(),payload->'items',jsonb_build_object('cart_request_id',_request,'sign_booking',_body),false,_body->>'message',pkg='sorglos',pkg='sorglos',_body->>'zoneStreet',_body->>'zonePostalCode',_body->>'zoneCity') RETURNING id INTO iid;
 INSERT INTO public.sign_bookings(request_id,token,inquiry_id,location,package,quantity,start_date,end_date,gross_cents,deposit_cents,total_cents,snapshot,permit_path) VALUES(_request,_token,iid,loc,pkg,qty,s,e,gross,dep,gross+dep,jsonb_build_object('request',_body,'config',c,'offer_payload',payload),upload.file_path) RETURNING * INTO b;
 IF upload.id IS NOT NULL THEN UPDATE public.sign_permit_uploads SET booking_id=b.id WHERE id=upload.id; END IF;
 INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details) VALUES(iid,'sign_booking_reserved',jsonb_build_object('booking_id',b.id,'expires_at',b.expires_at));
 RETURN jsonb_build_object('id',b.id,'token',b.token,'inquiry_id',iid,'status',b.status,'expires_at',b.expires_at);
END; $$;
REVOKE ALL ON FUNCTION public.reserve_sign_booking(uuid,text,jsonb,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_sign_booking(uuid,text,jsonb,text) TO service_role;
CREATE OR REPLACE FUNCTION public.sign_booking_payment_state() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b public.sign_bookings; paid bigint;
BEGIN
 SELECT * INTO b FROM public.sign_bookings WHERE inquiry_id=NEW.id FOR UPDATE;
 IF NOT FOUND THEN RETURN NEW; END IF;
 SELECT COALESCE(sum(round((v->>'amount')::numeric*100)),0) INTO paid FROM jsonb_array_elements(COALESCE(NEW.payments,'[]')) v;
 IF b.status='reserved' AND b.expires_at>now() AND paid=b.total_cents THEN
 UPDATE public.sign_bookings SET status='paid',confirmed_at=now() WHERE id=b.id;
 INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details) VALUES(NEW.id,'sign_booking_paid',jsonb_build_object('booking_id',b.id,'paid_cents',paid));
 ELSIF paid>0 AND (b.status='expired' OR paid>b.total_cents) THEN
 UPDATE public.sign_bookings SET status='review' WHERE id=b.id;
 INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details) VALUES(NEW.id,'sign_booking_payment_review',jsonb_build_object('paid_cents',paid,'booking_id',b.id));
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER sign_booking_payment_state AFTER UPDATE OF payments ON public.rental_inquiries FOR EACH ROW EXECUTE FUNCTION public.sign_booking_payment_state();
CREATE OR REPLACE FUNCTION public.expire_sign_bookings() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b record; n int:=0;
BEGIN
 IF auth.role() IS NOT NULL AND auth.role()<>'service_role' THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 FOR b IN SELECT * FROM public.sign_bookings WHERE status='reserved' AND expires_at<=now() FOR UPDATE SKIP LOCKED LOOP
 UPDATE public.sign_bookings SET status='expired' WHERE id=b.id;
 UPDATE public.rental_inquiries SET status='done',internal_notes=COALESCE(internal_notes,'')||E'\nDirektbuchung: 24-Stunden-Reservierung ohne vollständigen Zahlungseingang abgelaufen.' WHERE id=b.inquiry_id;
 UPDATE public.offer_payment_links SET status='superseded',updated_at=now() WHERE inquiry_id=b.inquiry_id AND inquiry_table='rental_inquiries' AND status='active';
 INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details) VALUES(b.inquiry_id,'sign_booking_expired',jsonb_build_object('booking_id',b.id)); n:=n+1;
 END LOOP; RETURN n;
END; $$;
REVOKE ALL ON FUNCTION public.expire_sign_bookings() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.expire_sign_bookings() TO service_role;