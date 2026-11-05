DO $$ DECLARE def text; BEGIN
SELECT pg_get_functiondef('public.begin_rental_checkout(uuid,integer,uuid,jsonb)'::regprocedure) INTO def;
IF position('AND id<>l.id AND status=''active''' IN def)=0 THEN RAISE EXCEPTION 'Missing competing checkout guard'; END IF;
def:=replace(def,'AND id<>l.id AND status=''active''','AND id<>l.id'); EXECUTE def;
SELECT pg_get_functiondef('public.settle_rental_stripe_receipt(text,text,uuid,text,text,integer,text,text,integer)'::regprocedure) INTO def;
def:=replace(def,'settle_rental_stripe_receipt(','settle_rental_stripe_receipt_v2(');
def:=replace(def,'_version integer)','_version integer, _claim uuid)');
IF position('expected:=CASE' IN def)=0 OR position('(l.checkout_claim IS NULL OR l.checkout_request IS NULL)' IN def)=0 THEN RAISE EXCEPTION 'Missing receipt guards'; END IF;
def:=replace(def,'expected:=CASE',E'IF EXISTS(SELECT 1 FROM jsonb_array_elements(COALESCE(r.payments,''[]'')) p WHERE p->>''reference''=_session AND (_intent IS NULL OR p->>''payment_intent_id''=_intent) AND round((p->>''amount'')::numeric*100)=_amount) AND _currency=''eur'' THEN\n UPDATE public.stripe_webhook_events SET result=''already_booked'' WHERE event_id=_event;\n RETURN jsonb_build_object(''added'',false,''result'',''already_booked'');\nEND IF;\nexpected:=CASE');
def:=replace(def,'(l.checkout_claim IS NULL OR l.checkout_request IS NULL)','(_claim IS NULL OR l.checkout_claim IS DISTINCT FROM _claim OR l.checkout_request IS NULL)');
def:=replace(def,'stripe_session_id=_session,payment_intent_id=_intent','stripe_session_id=_session,amount_cents=_amount,payment_intent_id=_intent');
EXECUTE def;
END $$;
REVOKE ALL ON FUNCTION public.settle_rental_stripe_receipt_v2(text,text,uuid,text,text,integer,text,text,integer,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.settle_rental_stripe_receipt_v2(text,text,uuid,text,text,integer,text,text,integer,uuid) TO service_role;
COMMENT ON FUNCTION public.settle_rental_stripe_receipt(text,text,uuid,text,text,integer,text,text,integer) IS 'DEPRECATED: use settle_rental_stripe_receipt_v2 with provider checkout claim; retained for deployment compatibility.';