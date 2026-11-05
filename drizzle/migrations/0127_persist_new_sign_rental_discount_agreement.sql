DO $$ DECLARE def text; old text := 'INSERT INTO public.rental_inquiries(source,location,location_email'; BEGIN
SELECT pg_get_functiondef('public.reserve_sign_booking(uuid,text,jsonb,text)'::regprocedure) INTO def;
IF position(old IN def)=0 THEN RAISE EXCEPTION 'Schilderreservierung: erwartete Einfügestelle fehlt'; END IF;
def:=replace(def,old,E'IF _body->''bankTransferDiscount''->>''version''=''bank-transfer-3-v1'' AND EXISTS(SELECT 1 FROM public.rental_payment_incentive_settings WHERE id=true AND live_enabled=true) THEN payload:=payload||jsonb_build_object(''bank_transfer_discount'',jsonb_build_object(''version'',''bank-transfer-3-v1'',''rate'',3,''selected'',''regular'')); END IF;\nINSERT INTO public.rental_inquiries(source,location,location_email');
EXECUTE def;
END $$;