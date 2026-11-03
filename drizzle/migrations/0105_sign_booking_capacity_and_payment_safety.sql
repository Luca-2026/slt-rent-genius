CREATE OR REPLACE FUNCTION public.guard_sign_inventory() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.b2b_managed_products; loc text; s date; e date; need int:=0; used int; it jsonb;
BEGIN
 IF TG_TABLE_NAME='rental_inquiries' THEN
  IF NEW.status NOT IN ('in_progress','offer_sent','accepted') THEN RETURN NEW; END IF;
  IF EXISTS(SELECT 1 FROM public.sign_bookings WHERE inquiry_id=NEW.id) THEN RETURN NEW; END IF;
  FOR it IN SELECT value FROM jsonb_array_elements(COALESCE(NEW.offer_payload->'items','[]')) LOOP IF it->>'product_slug'='halteverbotsschilder-set' THEN need:=need+GREATEST(COALESCE((it->>'articles')::int,1),1); END IF; END LOOP;
  IF need=0 AND NEW.product_id='halteverbotsschilder-set' THEN need:=GREATEST(COALESCE(NEW.quantity,1),1); END IF;
  s:=public.slt_try_date(NEW.start_date); e:=COALESCE(public.slt_try_date(NEW.end_date),s);
 ELSE
  IF NEW.product_id<>'halteverbotsschilder-set' OR NEW.status NOT IN ('pending','offer_sent','confirmed','active') THEN RETURN NEW; END IF;
  need:=GREATEST(COALESCE(NEW.quantity,1),1); s:=NEW.start_date; e:=COALESCE(NEW.end_date,s);
 END IF;
 loc:=public.slt_normalize_location(NEW.location);
 IF need=0 OR loc NOT IN ('krefeld','bonn') OR s IS NULL THEN RETURN NEW; END IF;
 SELECT * INTO p FROM public.b2b_managed_products WHERE slug='halteverbotsschilder-set' FOR UPDATE;
 IF NOT COALESCE((p.direct_booking_config->>'enabled')::boolean,false) THEN RETURN NEW; END IF;
 SELECT COALESCE(sum(quantity),0) INTO used FROM public.sign_bookings WHERE location=loc AND (status='paid' OR(status='reserved' AND expires_at>now())) AND daterange(start_date,end_date,'[]') && daterange(s,e,'[]');
 SELECT used+COALESCE(sum(GREATEST(COALESCE((x->>'articles')::int,1),1)),0) INTO used FROM public.rental_inquiries r CROSS JOIN LATERAL jsonb_array_elements(COALESCE(r.offer_payload->'items','[]')) x WHERE r.id<>NEW.id AND r.status IN ('in_progress','offer_sent','accepted') AND public.slt_normalize_location(r.location)=loc AND x->>'product_slug'=p.slug AND NOT EXISTS(SELECT 1 FROM public.sign_bookings sb WHERE sb.inquiry_id=r.id) AND public.slt_try_date(r.start_date)<=e AND COALESCE(public.slt_try_date(r.end_date),public.slt_try_date(r.start_date))>=s;
 SELECT used+COALESCE(sum(GREATEST(COALESCE(r.quantity,1),1)),0) INTO used FROM public.rental_inquiries r WHERE r.id<>NEW.id AND r.status IN ('in_progress','offer_sent','accepted') AND public.slt_normalize_location(r.location)=loc AND r.product_id=p.slug AND jsonb_array_length(COALESCE(r.offer_payload->'items','[]'))=0 AND NOT EXISTS(SELECT 1 FROM public.sign_bookings sb WHERE sb.inquiry_id=r.id) AND public.slt_try_date(r.start_date)<=e AND COALESCE(public.slt_try_date(r.end_date),public.slt_try_date(r.start_date))>=s;
 SELECT used+COALESCE(sum(GREATEST(COALESCE(r.quantity,1),1)),0) INTO used FROM public.b2b_reservations r WHERE r.id<>NEW.id AND r.status IN ('pending','offer_sent','confirmed','active') AND public.slt_normalize_location(r.location)=loc AND r.product_id=p.slug AND r.start_date<=e AND COALESCE(r.end_date,r.start_date)>=s;
 IF used+need>COALESCE((p.quantities->>loc)::int,0) THEN RAISE EXCEPTION 'Nicht genügend Halteverbotsschilder-Sets verfügbar' USING ERRCODE='40001'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER guard_sign_inventory BEFORE INSERT OR UPDATE OF status,offer_payload,quantity,start_date,end_date,location ON public.rental_inquiries FOR EACH ROW EXECUTE FUNCTION public.guard_sign_inventory();
CREATE TRIGGER guard_sign_inventory BEFORE INSERT OR UPDATE OF status,quantity,start_date,end_date,location ON public.b2b_reservations FOR EACH ROW EXECUTE FUNCTION public.guard_sign_inventory();
CREATE OR REPLACE FUNCTION public.sign_booking_payment_state() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b public.sign_bookings; paid bigint; v jsonb;
BEGIN
 SELECT * INTO b FROM public.sign_bookings WHERE inquiry_id=NEW.id FOR UPDATE;
 IF NOT FOUND THEN RETURN NEW; END IF;
 FOR v IN SELECT value FROM jsonb_array_elements(COALESCE(NEW.payments,'[]')) LOOP
  IF jsonb_typeof(v->'amount')<>'number' OR (v->>'amount')::numeric<=0 OR (v->>'amount')::numeric*100<>round((v->>'amount')::numeric*100) THEN RAISE EXCEPTION 'Zahlungen müssen positive centgenaue Beträge enthalten'; END IF;
 END LOOP;
 SELECT COALESCE(sum(round((v->>'amount')::numeric*100)),0) INTO paid FROM jsonb_array_elements(COALESCE(NEW.payments,'[]')) v;
 IF b.status='reserved' AND b.expires_at>now() AND paid=b.total_cents THEN
 UPDATE public.sign_bookings SET status='paid',confirmed_at=now() WHERE id=b.id;
 INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details) VALUES(NEW.id,'sign_booking_paid',jsonb_build_object('booking_id',b.id,'paid_cents',paid));
 ELSIF paid>0 AND (b.status='expired' OR (b.status='reserved' AND b.expires_at<=now()) OR paid>b.total_cents) THEN
 UPDATE public.sign_bookings SET status='review' WHERE id=b.id;
 INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details) VALUES(NEW.id,'sign_booking_payment_review',jsonb_build_object('paid_cents',paid,'booking_id',b.id));
 END IF;
 RETURN NEW;
END; $$;
CREATE OR REPLACE FUNCTION public.finish_sign_confirmation(_id uuid,_path text,_url text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b public.sign_bookings;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 SELECT * INTO b FROM public.sign_bookings WHERE id=_id FOR UPDATE;
 IF NOT FOUND OR b.status<>'paid' THEN RAISE EXCEPTION 'Buchung nicht vollständig bezahlt'; END IF;
 IF b.confirmation_sent_at IS NOT NULL THEN RETURN; END IF;
 UPDATE public.sign_bookings SET confirmation_sent_at=now(),confirmation_file_path=_path WHERE id=b.id;
 UPDATE public.rental_inquiries SET order_confirmed_at=now(),order_confirmed_by_name='SLT Rental – Direktbuchung',order_confirmation_number=replace(offer_number,'ANG-','AB-'),order_confirmation_file_url=_url WHERE id=b.inquiry_id;
 INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details) VALUES(b.inquiry_id,'sign_booking_confirmation_sent',jsonb_build_object('booking_id',b.id,'file_path',_path));
END; $$;
REVOKE ALL ON FUNCTION public.finish_sign_confirmation(uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finish_sign_confirmation(uuid,text,text) TO service_role;