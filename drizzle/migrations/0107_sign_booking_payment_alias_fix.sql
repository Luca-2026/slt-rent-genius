CREATE OR REPLACE FUNCTION public.sign_booking_payment_state() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b public.sign_bookings; paid bigint; entry jsonb;
BEGIN
 SELECT * INTO b FROM public.sign_bookings WHERE inquiry_id=NEW.id FOR UPDATE;
 IF NOT FOUND THEN RETURN NEW; END IF;
 FOR entry IN SELECT value FROM jsonb_array_elements(COALESCE(NEW.payments,'[]')) LOOP
  IF jsonb_typeof(entry->'amount') IS DISTINCT FROM 'number' OR (entry->>'amount')::numeric<=0 OR (entry->>'amount')::numeric*100<>round((entry->>'amount')::numeric*100) THEN RAISE EXCEPTION 'Zahlungen müssen positive centgenaue Beträge enthalten'; END IF;
 END LOOP;
 SELECT COALESCE(sum(round((payments.value->>'amount')::numeric*100)),0) INTO paid FROM jsonb_array_elements(COALESCE(NEW.payments,'[]')) AS payments(value);
 IF b.status='reserved' AND b.expires_at>now() AND paid=b.total_cents THEN
 UPDATE public.sign_bookings SET status='paid',confirmed_at=now() WHERE id=b.id;
 INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details) VALUES(NEW.id,'sign_booking_paid',jsonb_build_object('booking_id',b.id,'paid_cents',paid));
 ELSIF paid>0 AND (b.status='expired' OR (b.status='reserved' AND b.expires_at<=now()) OR paid>b.total_cents) THEN
 UPDATE public.sign_bookings SET status='review' WHERE id=b.id;
 INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details) VALUES(NEW.id,'sign_booking_payment_review',jsonb_build_object('paid_cents',paid,'booking_id',b.id));
 END IF;
 RETURN NEW;
END; $$;