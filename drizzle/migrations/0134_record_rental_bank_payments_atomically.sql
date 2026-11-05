CREATE OR REPLACE FUNCTION public.record_rental_staff_payments(_id uuid, _actor uuid, _expected_payments jsonb, _expected_version integer, _payments jsonb, _bank_payload jsonb DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.rental_inquiries; total numeric; claims text;
BEGIN
IF auth.role() IS DISTINCT FROM 'service_role' OR _actor IS NULL OR NOT public.can_edit_operations(_actor) THEN RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE='42501'; END IF;
IF jsonb_typeof(_payments) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Ungültige Zahlungen'; END IF;
SELECT * INTO r FROM public.rental_inquiries WHERE id=_id FOR UPDATE;
IF NOT FOUND OR COALESCE(r.payments,'[]'::jsonb) IS DISTINCT FROM _expected_payments OR r.payment_decision_version IS DISTINCT FROM _expected_version THEN RAISE EXCEPTION 'Zahlungen wurden inzwischen geändert. Bitte neu laden.' USING ERRCODE='40001'; END IF;
IF EXISTS(SELECT 1 FROM jsonb_array_elements(_payments) p WHERE jsonb_typeof(p) IS DISTINCT FROM 'object' OR COALESCE((p->>'amount')::numeric,0)<=0 OR round((p->>'amount')::numeric,2) IS DISTINCT FROM (p->>'amount')::numeric) THEN RAISE EXCEPTION 'Ungültiger Zahlungsbetrag'; END IF;
IF _bank_payload IS NOT NULL THEN
 IF jsonb_array_length(_payments)=0 OR EXISTS(SELECT 1 FROM jsonb_array_elements(_payments) p WHERE p->>'label' IS DISTINCT FROM 'Banküberweisung' OR p->>'provider'='stripe' OR COALESCE(p->>'reference','')~'^(cs_|pi_)') THEN RAISE EXCEPTION 'Gemischte Zahlungen erhalten keinen Überweisungsrabatt'; END IF;
 PERFORM public.select_rental_payment_method(_id,r.offer_number,_expected_version,'bank',_bank_payload);
END IF;
SELECT COALESCE(sum((p->>'amount')::numeric),0) INTO total FROM jsonb_array_elements(_payments) p;
claims:=current_setting('request.jwt.claims',true);
PERFORM set_config('request.jwt.claims',jsonb_build_object('role','service_role','sub',_actor)::text,true);
UPDATE public.rental_inquiries SET payments=_payments,paid_amount=total WHERE id=_id;
PERFORM set_config('request.jwt.claims',COALESCE(claims,''),true);
SELECT * INTO r FROM public.rental_inquiries WHERE id=_id;
RETURN jsonb_build_object('success',true,'paid_amount',total,'gross',r.offer_total_gross,'version',r.payment_decision_version,'bank_transfer_discount',r.offer_payload->'bank_transfer_discount');
END $$;
REVOKE ALL ON FUNCTION public.record_rental_staff_payments(uuid,uuid,jsonb,integer,jsonb,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_rental_staff_payments(uuid,uuid,jsonb,integer,jsonb,jsonb) TO service_role;