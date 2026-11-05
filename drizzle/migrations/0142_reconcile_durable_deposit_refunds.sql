CREATE OR REPLACE FUNCTION public.sync_deposit_refund(_id uuid,_intent text,_refund_id text,_status text,_amount integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.deposit_refunds; l public.offer_payment_links;
BEGIN
SELECT * INTO r FROM public.deposit_refunds WHERE id=_id FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Erstattungsanspruch noch nicht gespeichert'; END IF;
SELECT * INTO l FROM public.offer_payment_links WHERE id=r.link_id;
IF l.payment_intent_id IS DISTINCT FROM _intent OR r.amount_cents<>_amount OR (r.stripe_refund_id IS NOT NULL AND r.stripe_refund_id<>_refund_id) THEN RAISE EXCEPTION 'Erstattung stimmt nicht mit dem gespeicherten Anspruch überein'; END IF;
IF r.status IN ('succeeded','failed','canceled') AND _status<>r.status THEN RETURN; END IF;
UPDATE public.deposit_refunds SET stripe_refund_id=_refund_id,status=_status,updated_at=now() WHERE id=_id;
END $$;
REVOKE ALL ON FUNCTION public.sync_deposit_refund(uuid,text,text,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sync_deposit_refund(uuid,text,text,text,integer) TO service_role;