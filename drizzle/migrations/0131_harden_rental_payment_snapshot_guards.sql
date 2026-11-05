DO $$ DECLARE def text; BEGIN
SELECT pg_get_functiondef('public.select_rental_payment_method(uuid,text,integer,text,jsonb)'::regprocedure) INTO def;
IF position('(r.offer_payload->''bank_transfer_discount'' - ''selected'')' IN def)=0 THEN RAISE EXCEPTION 'Missing policy guard'; END IF;
def:=replace(def,'(r.offer_payload->''bank_transfer_discount'' - ''selected'')','((r.offer_payload->''bank_transfer_discount'') - ''selected'')');
def:=replace(def,'(_payload->''bank_transfer_discount'' - ''selected'')','((_payload->''bank_transfer_discount'') - ''selected'')');
EXECUTE def;
SELECT pg_get_functiondef('public.settle_rental_stripe_receipt(text,text,uuid,text,text,integer,text,text,integer)'::regprocedure) INTO def;
def:=replace(def,'CASE WHEN l.checkout_claim IS NOT NULL THEN','CASE WHEN l.checkout_request IS NOT NULL THEN');
def:=replace(def,'ELSE _amount END','ELSE l.amount_cents END');
def:=replace(def,'(_version IS NOT NULL AND r.payment_decision_version IS DISTINCT FROM _version)','((r.offer_payload->''bank_transfer_discount'' IS NOT NULL OR _version IS NOT NULL) AND r.payment_decision_version IS DISTINCT FROM _version)');
EXECUTE def;
END $$;