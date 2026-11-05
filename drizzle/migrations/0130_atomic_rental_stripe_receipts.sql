CREATE OR REPLACE FUNCTION public.settle_rental_stripe_receipt(_event text,_type text,_link uuid,_session text,_intent text,_amount integer,_currency text,_offer text,_version integer) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.offer_payment_links; r public.rental_inquiries; expected integer; total numeric; remaining integer; receipt jsonb; added boolean; result text;
BEGIN
IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
SELECT * INTO l FROM public.offer_payment_links WHERE id=_link;
IF NOT FOUND OR l.inquiry_table IS DISTINCT FROM 'rental_inquiries' THEN RAISE EXCEPTION 'Invalid rental payment link'; END IF;
SELECT * INTO r FROM public.rental_inquiries WHERE id=l.inquiry_id FOR UPDATE;
SELECT * INTO l FROM public.offer_payment_links WHERE id=_link FOR UPDATE;
INSERT INTO public.stripe_webhook_events(event_id,type) VALUES(_event,_type) ON CONFLICT(event_id) DO NOTHING;
SELECT e.result INTO result FROM public.stripe_webhook_events e WHERE e.event_id=_event FOR UPDATE;
IF result IS NOT NULL THEN RETURN jsonb_build_object('added',false,'result',result); END IF;
expected:=CASE WHEN l.checkout_claim IS NOT NULL THEN (l.checkout_request->'metadata'->>'amount_cents')::integer ELSE _amount END;
IF r.id IS NULL OR _currency IS DISTINCT FROM 'eur' OR _amount<=0 OR expected IS DISTINCT FROM _amount OR l.offer_number IS DISTINCT FROM _offer OR r.offer_number IS DISTINCT FROM _offer OR (_version IS NOT NULL AND r.payment_decision_version IS DISTINCT FROM _version) OR r.offer_payload->'bank_transfer_discount'->>'selected'='bank' OR (l.stripe_session_id IS DISTINCT FROM _session AND (l.checkout_claim IS NULL OR l.checkout_request IS NULL)) THEN
 UPDATE public.offer_payment_links SET warning='Zahlung zur Prüfung: '||_session||', '||COALESCE(_amount::text,'?')||' Cent; Auftragsfassung oder Betrag stimmt nicht.',updated_at=now() WHERE id=_link;
 UPDATE public.stripe_webhook_events SET result='reconciliation_required:'||_session||':'||COALESCE(_intent,'')||':'||COALESCE(_amount::text,'') WHERE event_id=_event;
 RETURN jsonb_build_object('added',false,'result','reconciliation_required');
END IF;
added:=NOT EXISTS(SELECT 1 FROM jsonb_array_elements(COALESCE(r.payments,'[]')) p WHERE p->>'reference'=_session OR (_intent IS NOT NULL AND p->>'payment_intent_id'=_intent));
IF added THEN
 receipt:=jsonb_build_object('date',to_char(now() AT TIME ZONE 'Europe/Berlin','YYYY-MM-DD'),'amount',_amount::numeric/100,'label','Online-Zahlung (Stripe)','reference',_session,'payment_intent_id',_intent,'provider','stripe');
 r.payments:=COALESCE(r.payments,'[]')||jsonb_build_array(receipt);
 SELECT COALESCE(sum((p->>'amount')::numeric),0) INTO total FROM jsonb_array_elements(r.payments) p;
 UPDATE public.rental_inquiries SET payments=r.payments,paid_amount=total WHERE id=r.id;
ELSE SELECT COALESCE(sum((p->>'amount')::numeric),0) INTO total FROM jsonb_array_elements(COALESCE(r.payments,'[]')) p; END IF;
remaining:=GREATEST(0,round(r.offer_total_gross*100)::integer+round(COALESCE((r.offer_payload->>'deposit')::numeric,0)*100)::integer-round(total*100)::integer);
UPDATE public.offer_payment_links SET status=CASE WHEN remaining>0 THEN 'active' ELSE 'paid' END,stripe_session_id=_session,payment_intent_id=_intent,paid_cents=round(total*100)::integer,paid_at=now(),warning=NULL,checkout_claim=NULL,checkout_claimed_at=NULL,checkout_request=NULL,updated_at=now() WHERE id=_link;
UPDATE public.stripe_webhook_events SET result=CASE WHEN added THEN 'booked' ELSE 'already_booked' END WHERE event_id=_event;
RETURN jsonb_build_object('added',added,'result',CASE WHEN added THEN 'booked' ELSE 'already_booked' END,'remaining_cents',remaining);
END $$;
REVOKE ALL ON FUNCTION public.settle_rental_stripe_receipt(text,text,uuid,text,text,integer,text,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.settle_rental_stripe_receipt(text,text,uuid,text,text,integer,text,text,integer) TO service_role;