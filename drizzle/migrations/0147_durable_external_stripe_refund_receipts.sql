CREATE TABLE public.stripe_refund_receipts(refund_id text PRIMARY KEY, payment_intent text NOT NULL, amount_cents bigint NOT NULL CHECK(amount_cents>0), currency text NOT NULL CHECK(currency='eur'), livemode boolean NOT NULL, status text NOT NULL CHECK(status IN ('pending','requires_action','succeeded','failed','canceled')), updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.stripe_refund_receipts TO service_role;
ALTER TABLE public.stripe_refund_receipts ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.record_stripe_refund_receipt(_id text,_intent text,_amount bigint,_currency text,_live boolean,_status text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE old public.stripe_refund_receipts;
BEGIN
IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
IF _id NOT LIKE 're_%' OR _intent NOT LIKE 'pi_%' OR _amount IS NULL OR _amount<=0 OR _currency IS DISTINCT FROM 'eur' OR _live IS NULL OR _status IS NULL OR _status NOT IN ('pending','requires_action','succeeded','failed','canceled') THEN RAISE EXCEPTION 'Ungültiger Providerbeleg'; END IF;
PERFORM pg_advisory_xact_lock(hashtextextended('stripe-refund:'||_intent,0));
SELECT * INTO old FROM public.stripe_refund_receipts WHERE refund_id=_id FOR UPDATE;
IF FOUND THEN
IF old.payment_intent<>_intent OR old.amount_cents<>_amount OR old.currency<>_currency OR old.livemode<>_live THEN RAISE EXCEPTION 'Provideridentität ist unveränderlich'; END IF;
IF old.status IN ('succeeded','failed','canceled') AND old.status<>_status THEN RETURN; END IF;
END IF;
INSERT INTO public.stripe_refund_receipts(refund_id,payment_intent,amount_cents,currency,livemode,status) VALUES(_id,_intent,_amount,_currency,_live,_status) ON CONFLICT(refund_id) DO UPDATE SET status=EXCLUDED.status,updated_at=now();
END $$;
CREATE OR REPLACE FUNCTION public.assert_stripe_refund_execution_capacity(_intent text,_deposit_id uuid DEFAULT NULL,_credit_id uuid DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE paid bigint; used bigint;
BEGIN
IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
PERFORM pg_advisory_xact_lock(hashtextextended('stripe-refund:'||_intent,0));
SELECT max(paid_cents) INTO paid FROM public.offer_payment_links WHERE payment_intent_id=_intent AND status='paid';
IF paid IS NULL THEN RAISE EXCEPTION 'Ursprüngliche Zahlung nicht bestätigt'; END IF;
SELECT COALESCE(sum(amount_cents),0) INTO used FROM public.stripe_refund_receipts WHERE payment_intent=_intent AND status NOT IN ('failed','canceled');
SELECT used+COALESCE(sum(d.amount_cents),0) INTO used FROM public.deposit_refunds d JOIN public.offer_payment_links l ON l.id=d.link_id WHERE l.payment_intent_id=_intent AND d.status NOT IN ('failed','canceled') AND NOT EXISTS(SELECT 1 FROM public.stripe_refund_receipts p WHERE p.refund_id=d.stripe_refund_id);
SELECT used+COALESCE(sum((a->>'amount_cents')::bigint),0) INTO used FROM public.credit_note_refunds c CROSS JOIN LATERAL jsonb_array_elements(c.allocations) a WHERE a->>'payment_intent'=_intent AND COALESCE(a->>'status','creating') NOT IN ('failed','canceled') AND NOT EXISTS(SELECT 1 FROM public.stripe_refund_receipts p WHERE p.refund_id=a->>'refund_id');
IF used>paid THEN RAISE EXCEPTION 'Externe und interne Erstattungen übersteigen die ursprüngliche Stripe-Gesamtzahlung'; END IF;
IF EXISTS(SELECT 1 FROM public.stripe_refund_receipts p WHERE p.payment_intent=_intent AND p.status NOT IN ('failed','canceled') AND NOT EXISTS(SELECT 1 FROM public.deposit_refunds d JOIN public.offer_payment_links l ON l.id=d.link_id WHERE d.stripe_refund_id=p.refund_id AND l.payment_intent_id=p.payment_intent AND d.amount_cents=p.amount_cents) AND NOT EXISTS(SELECT 1 FROM public.credit_note_refunds c CROSS JOIN LATERAL jsonb_array_elements(c.allocations) a WHERE a->>'refund_id'=p.refund_id AND a->>'payment_intent'=p.payment_intent AND (a->>'amount_cents')::bigint=p.amount_cents)) THEN RAISE EXCEPTION 'Externe Erstattung muss vor weiterer Auszahlung fachlich zugeordnet werden'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.record_stripe_refund_receipt(text,text,bigint,text,boolean,text),public.assert_stripe_refund_execution_capacity(text,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_stripe_refund_receipt(text,text,bigint,text,boolean,text),public.assert_stripe_refund_execution_capacity(text,uuid,uuid) TO service_role;
COMMENT ON TABLE public.stripe_refund_receipts IS 'Authoritative provider refund facts, including manual external refunds. Unknown attribution blocks new automated payouts; never rewrites original payments or invoices.';