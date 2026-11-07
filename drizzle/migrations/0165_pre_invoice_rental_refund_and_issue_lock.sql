CREATE TABLE public.rental_refund_bases (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), inquiry_id uuid NOT NULL UNIQUE REFERENCES public.rental_inquiries(id), gross_amount numeric NOT NULL, paid_amount numeric NOT NULL, payments jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.rental_refund_bases TO authenticated; GRANT ALL ON public.rental_refund_bases TO service_role;
ALTER TABLE public.rental_refund_bases ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_read ON public.rental_refund_bases FOR SELECT TO authenticated USING (public.can_edit_operations(auth.uid()));
CREATE TABLE public.rental_order_refunds (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), basis_id uuid NOT NULL UNIQUE REFERENCES public.rental_refund_bases(id), amount_cents integer NOT NULL CHECK(amount_cents>0), status text NOT NULL DEFAULT 'creating' CHECK(status IN ('creating','pending','requires_action','succeeded','failed','partial_failed','canceled')), allocations jsonb NOT NULL DEFAULT '[]', payout_method text NOT NULL DEFAULT 'stripe' CHECK(payout_method IN ('stripe','transfer')), bank_reference text, created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.rental_order_refunds TO authenticated; GRANT ALL ON public.rental_order_refunds TO service_role;
ALTER TABLE public.rental_order_refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_read ON public.rental_order_refunds FOR SELECT TO authenticated USING (public.can_edit_operations(auth.uid()));
CREATE FUNCTION public.guard_rental_refund_basis() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
PERFORM pg_advisory_xact_lock(hashtextextended('rental-refund-invoice:'||NEW.inquiry_id::text,0));
IF EXISTS(SELECT 1 FROM public.inquiry_invoices WHERE rental_inquiry_id=NEW.inquiry_id AND status NOT IN ('draft','cancelled')) THEN RAISE EXCEPTION 'Erstattungsgrundlage nur vor erstmaliger Rechnung'; END IF;
IF TG_OP='UPDATE' AND (NEW.inquiry_id IS DISTINCT FROM OLD.inquiry_id OR NEW.id IS DISTINCT FROM OLD.id) THEN RAISE EXCEPTION 'Erstattungsgrundlage ist unveränderlich'; END IF;
IF TG_OP='UPDATE' AND EXISTS(SELECT 1 FROM public.rental_order_refunds WHERE basis_id=OLD.id) AND (NEW.gross_amount IS DISTINCT FROM OLD.gross_amount OR NEW.paid_amount IS DISTINCT FROM OLD.paid_amount OR NEW.payments IS DISTINCT FROM OLD.payments) THEN RAISE EXCEPTION 'Erstattung bereits beauftragt; Abrechnungsgrundlage darf nicht geändert werden'; END IF;
RETURN NEW; END $$;
CREATE TRIGGER guard_rental_refund_basis BEFORE INSERT OR UPDATE ON public.rental_refund_bases FOR EACH ROW EXECUTE FUNCTION public.guard_rental_refund_basis();
CREATE FUNCTION public.guard_rental_order_refund() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE b public.rental_refund_bases; a jsonb; used bigint; paid bigint; seen text[]:=ARRAY[]::text[]; intent text; BEGIN
SELECT * INTO b FROM public.rental_refund_bases WHERE id=NEW.basis_id;
PERFORM pg_advisory_xact_lock(hashtextextended('rental-refund-invoice:'||b.inquiry_id::text,0));
IF TG_OP='INSERT' AND EXISTS(SELECT 1 FROM public.inquiry_invoices WHERE rental_inquiry_id=b.inquiry_id AND status NOT IN ('draft','cancelled')) THEN RAISE EXCEPTION 'Rechnung bereits ausgestellt'; END IF;
IF NEW.amount_cents IS DISTINCT FROM greatest(0,round((b.paid_amount-b.gross_amount)*100))::integer THEN RAISE EXCEPTION 'Mietguthaben stimmt nicht mit geprüfter Abrechnung überein'; END IF;
IF TG_OP='UPDATE' AND (NEW.basis_id IS DISTINCT FROM OLD.basis_id OR NEW.amount_cents IS DISTINCT FROM OLD.amount_cents OR NEW.payout_method IS DISTINCT FROM OLD.payout_method OR NEW.created_by IS DISTINCT FROM OLD.created_by OR (OLD.bank_reference IS NOT NULL AND NEW.bank_reference IS DISTINCT FROM OLD.bank_reference)) THEN RAISE EXCEPTION 'Erstattungsanspruch ist unveränderlich'; END IF;
IF TG_OP='UPDATE' AND OLD.status='succeeded' AND NEW.status<>'succeeded' THEN RAISE EXCEPTION 'Erstattung ist endgültig'; END IF;
IF NEW.payout_method='transfer' THEN
IF jsonb_array_length(b.payments)=0 OR EXISTS(SELECT 1 FROM public.offer_payment_links WHERE inquiry_id=b.inquiry_id AND status='paid' AND inquiry_table='rental_inquiries') OR EXISTS(SELECT 1 FROM jsonb_array_elements(b.payments) p WHERE coalesce(p->>'reference','') ~ '^(pi_|cs_)' OR coalesce(p->>'label','') !~* '(überweisung|ueberweisung|bank)') THEN RAISE EXCEPTION 'Erstattung per Überweisung nur für reine Bankzahlungen'; END IF;
IF NEW.status NOT IN ('creating','succeeded') OR jsonb_array_length(NEW.allocations)<>0 OR (NEW.status='succeeded' AND length(btrim(coalesce(NEW.bank_reference,'')))<3) THEN RAISE EXCEPTION 'Banknachweis fehlt'; END IF;
RETURN NEW; END IF;
IF jsonb_typeof(NEW.allocations)<>'array' OR jsonb_array_length(NEW.allocations)=0 OR (SELECT coalesce(sum((value->>'amount_cents')::bigint),0) FROM jsonb_array_elements(NEW.allocations))<>NEW.amount_cents THEN RAISE EXCEPTION 'Ungültige Erstattungsaufteilung'; END IF;
IF TG_OP='UPDATE' AND (jsonb_array_length(NEW.allocations)<>jsonb_array_length(OLD.allocations) OR EXISTS(SELECT 1 FROM jsonb_array_elements(NEW.allocations) n WHERE NOT EXISTS(SELECT 1 FROM jsonb_array_elements(OLD.allocations) o WHERE o->>'payment_intent'=n->>'payment_intent' AND o->>'amount_cents'=n->>'amount_cents' AND (o->>'refund_id' IS NULL OR o->>'refund_id'=n->>'refund_id')))) THEN RAISE EXCEPTION 'Erstattungsaufteilung ist unveränderlich'; END IF;
FOR a IN SELECT value FROM jsonb_array_elements(NEW.allocations) ORDER BY value->>'payment_intent' LOOP
intent:=a->>'payment_intent';
IF intent IS NULL OR intent=ANY(seen) OR (a->>'amount_cents')::integer<=0 THEN RAISE EXCEPTION 'Ungültige Originalzahlung'; END IF; seen:=array_append(seen,intent);
PERFORM pg_advisory_xact_lock(hashtextextended('stripe-refund:'||intent,0));
SELECT max(paid_cents) INTO paid FROM public.offer_payment_links WHERE inquiry_id=b.inquiry_id AND inquiry_table='rental_inquiries' AND status='paid' AND payment_intent_id=intent;
IF paid IS NULL THEN RAISE EXCEPTION 'Originalzahlung gehört nicht zu diesem Auftrag'; END IF;
SELECT coalesce(sum(d.amount_cents),0) INTO used FROM public.deposit_refunds d JOIN public.offer_payment_links l ON l.id=d.link_id WHERE l.payment_intent_id=intent AND d.status NOT IN ('failed','canceled');
SELECT used+coalesce(sum((x->>'amount_cents')::bigint),0) INTO used FROM public.credit_note_refunds r CROSS JOIN LATERAL jsonb_array_elements(r.allocations) x WHERE x->>'payment_intent'=intent AND coalesce(x->>'status','creating') NOT IN ('failed','canceled');
SELECT used+coalesce(sum((x->>'amount_cents')::bigint),0) INTO used FROM public.rental_order_refunds r CROSS JOIN LATERAL jsonb_array_elements(r.allocations) x WHERE r.id<>NEW.id AND x->>'payment_intent'=intent AND coalesce(x->>'status','creating') NOT IN ('failed','canceled');
IF coalesce(a->>'status','creating') NOT IN ('failed','canceled') AND used+(a->>'amount_cents')::bigint>paid THEN RAISE EXCEPTION 'Kaution und Mieterstattungen übersteigen gemeinsam die ursprüngliche Stripe-Gesamtzahlung'; END IF;
IF a->>'status'='succeeded' AND NOT EXISTS(SELECT 1 FROM public.stripe_refund_receipts s WHERE s.refund_id=a->>'refund_id' AND s.payment_intent=intent AND s.amount_cents=(a->>'amount_cents')::integer AND s.status='succeeded' AND s.currency='eur') THEN RAISE EXCEPTION 'Erfolgreicher Providerbeleg fehlt'; END IF;
END LOOP;
IF NEW.status='succeeded' AND EXISTS(SELECT 1 FROM jsonb_array_elements(NEW.allocations) a WHERE coalesce(a->>'status','creating')<>'succeeded') THEN RAISE EXCEPTION 'Auszahlung nicht vollständig bestätigt'; END IF;
RETURN NEW; END $$;
CREATE TRIGGER guard_rental_order_refund BEFORE INSERT OR UPDATE ON public.rental_order_refunds FOR EACH ROW EXECUTE FUNCTION public.guard_rental_order_refund();
DO $$ DECLARE definition text; BEGIN
SELECT pg_get_functiondef('public.guard_shared_stripe_refund_capacity()'::regprocedure) INTO definition;
definition:=replace(definition,'IF _used+_new>coalesce(_source.paid_cents,0)',E'SELECT _used+coalesce(sum((a->>''amount_cents'')::bigint),0) INTO _used FROM public.rental_order_refunds r CROSS JOIN LATERAL jsonb_array_elements(r.allocations) a WHERE a->>''payment_intent''=_intent AND coalesce(a->>''status'',''creating'') NOT IN (''failed'',''canceled'');\n IF _used+_new>coalesce(_source.paid_cents,0)');
EXECUTE definition;
END $$;
CREATE FUNCTION public.sync_rental_order_refund(_basis uuid,_intent text,_refund_id text,_status text,_amount integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE items jsonb; a jsonb; overall text; BEGIN
IF NOT EXISTS(SELECT 1 FROM public.stripe_refund_receipts WHERE refund_id=_refund_id AND payment_intent=_intent AND amount_cents=_amount AND status=_status AND currency='eur') THEN RAISE EXCEPTION 'Providerbeleg fehlt'; END IF;
SELECT allocations INTO items FROM public.rental_order_refunds WHERE basis_id=_basis FOR UPDATE;
SELECT value INTO a FROM jsonb_array_elements(items) WHERE value->>'payment_intent'=_intent;
IF a IS NULL OR (a->>'amount_cents')::integer<>_amount OR (a->>'refund_id' IS NOT NULL AND a->>'refund_id'<>_refund_id) THEN RAISE EXCEPTION 'Unpassender Erstattungsbeleg'; END IF;
IF a->>'status' IN ('succeeded','failed','canceled') AND a->>'status'<>_status THEN RETURN; END IF;
SELECT jsonb_agg(CASE WHEN value->>'payment_intent'=_intent THEN value||jsonb_build_object('refund_id',_refund_id,'status',_status) ELSE value END) INTO items FROM jsonb_array_elements(items);
SELECT CASE WHEN bool_and(value->>'status'='succeeded') THEN 'succeeded' WHEN bool_and(value->>'status' IN ('succeeded','failed','canceled')) THEN 'partial_failed' ELSE 'pending' END INTO overall FROM jsonb_array_elements(items);
UPDATE public.rental_order_refunds SET allocations=items,status=overall,updated_at=now() WHERE basis_id=_basis;
END $$;
REVOKE ALL ON FUNCTION public.sync_rental_order_refund(uuid,text,text,text,integer) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.sync_rental_order_refund(uuid,text,text,text,integer) TO service_role;
ALTER TABLE public.inquiry_invoices ADD COLUMN rental_refund_basis_id uuid REFERENCES public.rental_refund_bases(id);
CREATE FUNCTION public.check_rental_invoice_refunds(_inquiry uuid,_gross numeric,_paid numeric) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE s public.deposit_settlements; b public.rental_refund_bases; r public.rental_order_refunds; due integer; refunded integer:=0; BEGIN
PERFORM pg_advisory_xact_lock(hashtextextended('rental-refund-invoice:'||_inquiry::text,0));
SELECT * INTO s FROM public.deposit_settlements WHERE rental_inquiry_id=_inquiry;
IF s.id IS NOT NULL AND s.balance>0 AND (s.payout_status IS DISTINCT FROM 'paid' OR (s.payout_method='stripe' AND NOT public.deposit_payout_verified(_inquiry,round(s.balance*100)::bigint))) THEN RAISE EXCEPTION 'Rechnung gesperrt: Kautionserstattung noch offen'; END IF;
due:=greatest(0,round((_paid-_gross)*100))::integer;
SELECT * INTO b FROM public.rental_refund_bases WHERE inquiry_id=_inquiry;
IF b.id IS NOT NULL THEN SELECT * INTO r FROM public.rental_order_refunds WHERE basis_id=b.id; END IF;
IF due>0 OR r.id IS NOT NULL THEN
IF b.id IS NULL OR b.gross_amount IS DISTINCT FROM _gross OR b.paid_amount IS DISTINCT FROM _paid THEN RAISE EXCEPTION 'Rechnung gesperrt: Erstattungsgrundlage zuerst mit aktueller Vorschau prüfen'; END IF;
IF due>0 AND (r.id IS NULL OR r.status<>'succeeded' OR r.amount_cents<>due) THEN RAISE EXCEPTION 'Rechnung gesperrt: Mietguthabenerstattung noch offen'; END IF;
refunded:=coalesce(r.amount_cents,0);
END IF;
RETURN jsonb_build_object('basis_id',b.id,'refunded_cents',refunded);
END $$;
REVOKE ALL ON FUNCTION public.check_rental_invoice_refunds(uuid,numeric,numeric) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.check_rental_invoice_refunds(uuid,numeric,numeric) TO service_role;
CREATE FUNCTION public.guard_invoice_refund_completion() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF NEW.rental_inquiry_id IS NOT NULL AND NEW.invoice_kind IN ('invoice','final') AND NEW.status NOT IN ('draft','cancelled') AND (TG_OP='INSERT' OR OLD.status='draft') THEN
IF NEW.rental_refund_basis_id IS NOT NULL OR EXISTS(SELECT 1 FROM public.deposit_settlements WHERE rental_inquiry_id=NEW.rental_inquiry_id) THEN
PERFORM public.check_rental_invoice_refunds(NEW.rental_inquiry_id,NEW.gross_amount,NEW.paid_amount);
END IF; END IF;
RETURN NEW; END $$;
CREATE TRIGGER guard_invoice_refund_completion BEFORE INSERT OR UPDATE ON public.inquiry_invoices FOR EACH ROW EXECUTE FUNCTION public.guard_invoice_refund_completion();
COMMENT ON TABLE public.rental_refund_bases IS 'Unnumbered server-calculated final billing basis, not an invoice; frozen once refund is claimed.';
COMMENT ON TABLE public.rental_order_refunds IS 'Pre-invoice rental refunds share original-payment capacity and provider evidence with deposit and credit refunds.';