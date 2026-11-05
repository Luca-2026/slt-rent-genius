ALTER TABLE public.offer_payment_links ADD COLUMN IF NOT EXISTS checkout_request jsonb;
CREATE OR REPLACE FUNCTION public.begin_rental_checkout(_link uuid,_version integer,_claim uuid,_request jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.offer_payment_links; r public.rental_inquiries; paid numeric; expected numeric; other_attempt boolean;
BEGIN
IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
IF _claim IS NULL OR _request IS NULL THEN RAISE EXCEPTION 'Missing checkout attempt'; END IF;
SELECT * INTO l FROM public.offer_payment_links WHERE id=_link;
IF NOT FOUND OR l.inquiry_table IS DISTINCT FROM 'rental_inquiries' THEN RAISE EXCEPTION 'Invalid rental link'; END IF;
SELECT * INTO r FROM public.rental_inquiries WHERE id=l.inquiry_id FOR UPDATE;
SELECT * INTO l FROM public.offer_payment_links WHERE id=_link FOR UPDATE;
IF r.id IS NULL OR l.status IS DISTINCT FROM 'active' OR l.offer_number IS DISTINCT FROM r.offer_number OR r.payment_decision_version IS DISTINCT FROM _version OR r.offer_payload->'bank_transfer_discount'->>'selected'='bank' THEN RAISE EXCEPTION 'Auftrag wurde inzwischen geändert'; END IF;
IF l.checkout_claim IS NOT NULL THEN
 IF l.checkout_request IS NULL OR l.checkout_claimed_at < now()-interval '23 hours' THEN RAISE EXCEPTION 'Zahlungsversuch muss vor erneutem Start abgeglichen werden'; END IF;
 RETURN jsonb_build_object('claim',l.checkout_claim,'request',l.checkout_request,'session_id',l.stripe_session_id);
END IF;
IF EXISTS(SELECT 1 FROM public.offer_payment_links WHERE inquiry_table='rental_inquiries' AND inquiry_id=r.id AND id<>l.id AND status='active' AND (checkout_claim IS NOT NULL OR stripe_session_id IS NOT NULL)) THEN RAISE EXCEPTION 'Andere Online-Zahlung muss zuerst sicher beendet werden'; END IF;
SELECT COALESCE(sum(round((p->>'amount')::numeric*100)),0) INTO paid FROM jsonb_array_elements(COALESCE(r.payments,'[]')) p;
expected:=GREATEST(0,round(r.offer_total_gross*100)+round(COALESCE((r.offer_payload->>'deposit')::numeric,0)*100)-paid);
IF (_request->'metadata'->>'choice')='anzahlung' THEN
 IF r.offer_payload->>'payment_terms' IS DISTINCT FROM 'anzahlung_30' THEN RAISE EXCEPTION 'Anzahlung nicht vereinbart'; END IF;
 expected:=GREATEST(0,round(r.offer_total_gross*100*0.3)-paid);
END IF;
IF expected<=0 OR (_request->'metadata'->>'amount_cents')::numeric IS DISTINCT FROM expected OR (_request->'metadata'->>'payment_decision_version')::integer IS DISTINCT FROM _version THEN RAISE EXCEPTION 'Zahlbetrag wurde inzwischen geändert'; END IF;
UPDATE public.offer_payment_links SET checkout_claim=_claim,checkout_claimed_at=now(),checkout_request=_request WHERE id=_link;
RETURN jsonb_build_object('claim',_claim,'request',_request,'session_id',l.stripe_session_id);
END $$;
REVOKE ALL ON FUNCTION public.begin_rental_checkout(uuid,integer,uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.begin_rental_checkout(uuid,integer,uuid,jsonb) TO service_role;
COMMENT ON COLUMN public.offer_payment_links.checkout_request IS 'Immutable Stripe create request for an unresolved attempt; recover with the same claim/idempotency key, never clear on an ambiguous provider error.';
DO $$ DECLARE def text; BEGIN
SELECT pg_get_functiondef('public.select_rental_payment_method(uuid,text,integer,text,jsonb)'::regprocedure) INTO def;
IF position('IF (r.offer_payload - ''items''' IN def)=0 THEN RAISE EXCEPTION 'Missing expected payment snapshot guard'; END IF;
def:=replace(def,'IF (r.offer_payload - ''items''',E'IF (r.offer_payload->''bank_transfer_discount'' - ''selected'') IS DISTINCT FROM (_payload->''bank_transfer_discount'' - ''selected'') THEN RAISE EXCEPTION ''Rabattvereinbarung darf nicht geändert werden''; END IF;\nIF (r.offer_payload - ''items'''); EXECUTE def;
END $$;