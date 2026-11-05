CREATE OR REPLACE FUNCTION public.sync_credit_note_refund_v2(_credit_id uuid,_intent text,_refund_id text,_status text,_amount integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE items jsonb; overall text; a jsonb;
BEGIN
IF _intent IS NULL OR btrim(_intent)='' OR _refund_id IS NULL OR btrim(_refund_id)='' OR _amount IS NULL OR _amount<=0 OR _status IS NULL OR _status NOT IN ('pending','requires_action','succeeded','failed','canceled') THEN RAISE EXCEPTION 'Ungültiger Erstattungsnachweis'; END IF;
SELECT allocations INTO items FROM public.credit_note_refunds WHERE credit_note_id=_credit_id FOR UPDATE;
IF items IS NULL THEN RAISE EXCEPTION 'Erstattungsanspruch noch nicht gespeichert'; END IF;
SELECT value INTO a FROM jsonb_array_elements(items) WHERE value->>'payment_intent'=_intent;
IF a IS NULL OR (a->>'amount_cents')::bigint IS DISTINCT FROM _amount OR (a->>'refund_id' IS NOT NULL AND a->>'refund_id'<>_refund_id) THEN RAISE EXCEPTION 'Erstattung stimmt nicht mit dem gespeicherten Anspruch überein'; END IF;
IF a->>'status' IN ('succeeded','failed','canceled') AND _status<>a->>'status' THEN RETURN; END IF;
SELECT jsonb_agg(CASE WHEN value->>'payment_intent'=_intent THEN value||jsonb_build_object('refund_id',_refund_id,'status',_status) ELSE value END) INTO items FROM jsonb_array_elements(items);
SELECT CASE WHEN bool_and(value->>'status'='succeeded') THEN 'succeeded' WHEN bool_and(value->>'status' IN ('succeeded','failed','canceled')) THEN CASE WHEN bool_or(value->>'status'='succeeded') THEN 'partial_failed' ELSE 'failed' END ELSE 'pending' END INTO overall FROM jsonb_array_elements(items);
UPDATE public.credit_note_refunds SET allocations=items,status=overall,updated_at=now() WHERE credit_note_id=_credit_id;
END $$;
REVOKE ALL ON FUNCTION public.sync_credit_note_refund_v2(uuid,text,text,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sync_credit_note_refund_v2(uuid,text,text,text,integer) TO service_role;
COMMENT ON FUNCTION public.sync_credit_note_refund(uuid,text,text,text) IS 'DEPRECATED: use sync_credit_note_refund_v2 with provider amount evidence';
CREATE OR REPLACE FUNCTION public.sync_deposit_refund(_id uuid,_intent text,_refund_id text,_status text,_amount integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.deposit_refunds; l public.offer_payment_links;
BEGIN
IF _intent IS NULL OR btrim(_intent)='' OR _refund_id IS NULL OR btrim(_refund_id)='' OR _amount IS NULL OR _amount<=0 OR _status IS NULL OR _status NOT IN ('pending','requires_action','succeeded','failed','canceled') THEN RAISE EXCEPTION 'Ungültiger Erstattungsnachweis'; END IF;
SELECT * INTO r FROM public.deposit_refunds WHERE id=_id FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Erstattungsanspruch noch nicht gespeichert'; END IF;
SELECT * INTO l FROM public.offer_payment_links WHERE id=r.link_id;
IF l.payment_intent_id IS DISTINCT FROM _intent OR r.amount_cents IS DISTINCT FROM _amount OR (r.stripe_refund_id IS NOT NULL AND r.stripe_refund_id<>_refund_id) THEN RAISE EXCEPTION 'Erstattung stimmt nicht mit dem gespeicherten Anspruch überein'; END IF;
IF r.status IN ('succeeded','failed','canceled') AND _status<>r.status THEN RETURN; END IF;
UPDATE public.deposit_refunds SET stripe_refund_id=_refund_id,status=_status,updated_at=now() WHERE id=_id;
END $$;