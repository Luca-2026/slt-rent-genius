ALTER TABLE public.credit_note_refunds ADD COLUMN refund_kind text NOT NULL DEFAULT 'credit_note' CHECK(refund_kind IN ('credit_note','rental_credit')), ADD COLUMN payout_method text NOT NULL DEFAULT 'stripe' CHECK(payout_method IN ('stripe','transfer')), ADD COLUMN bank_reference text, ADD COLUMN receipt_snapshot jsonb, ADD COLUMN receipt_path text;
COMMENT ON TABLE public.credit_note_refunds IS 'Original-payment refunds: credit-note corrections or direct invoice rental overpayment; rental receipts are not tax credit notes.';
CREATE OR REPLACE FUNCTION public.guard_credit_note_refund_amount() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c record; p record; alloc_sum bigint; siblings bigint; eligible bigint;
BEGIN
SELECT * INTO c FROM public.inquiry_invoices WHERE id=NEW.credit_note_id FOR UPDATE;
IF TG_OP='UPDATE' AND (NEW.refund_kind IS DISTINCT FROM OLD.refund_kind OR NEW.payout_method IS DISTINCT FROM OLD.payout_method OR NEW.receipt_snapshot IS DISTINCT FROM OLD.receipt_snapshot OR NEW.credit_note_id IS DISTINCT FROM OLD.credit_note_id OR NEW.amount_cents IS DISTINCT FROM OLD.amount_cents OR (OLD.bank_reference IS NOT NULL AND NEW.bank_reference IS DISTINCT FROM OLD.bank_reference)) THEN RAISE EXCEPTION 'Erstattungsanspruch ist unveränderlich'; END IF;
IF NEW.refund_kind='rental_credit' THEN
IF c.rental_inquiry_id IS NULL OR c.invoice_kind NOT IN ('invoice','final') OR c.status IN ('draft','cancelled') OR c.parent_invoice_id IS NOT NULL OR coalesce(jsonb_array_length(c.deducted_installments),0)>0 THEN RAISE EXCEPTION 'Keine gültige erstmalige Mietrechnung'; END IF;
IF EXISTS(SELECT 1 FROM public.inquiry_invoices i WHERE i.rental_inquiry_id=c.rental_inquiry_id AND i.id<>c.id AND i.status NOT IN ('draft','cancelled')) THEN RAISE EXCEPTION 'Weitere Rechnungen oder Korrekturen erfordern gesonderte Abrechnung'; END IF;
eligible:=greatest(0,round((coalesce(c.paid_amount,0)-c.gross_amount)*100));
IF NEW.amount_cents IS DISTINCT FROM eligible OR eligible<=0 THEN RAISE EXCEPTION 'Mietguthaben stimmt nicht mit Rechnung minus Mietzahlungen überein'; END IF;
IF NEW.payout_method='transfer' THEN
IF EXISTS(SELECT 1 FROM public.offer_payment_links l WHERE l.inquiry_id=c.rental_inquiry_id AND l.inquiry_table='rental_inquiries' AND l.status='paid') OR EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c.payments,'[]')) a WHERE coalesce(a->>'reference','') ~ '^(pi_|cs_)' OR coalesce(a->>'label','') !~* '(überweisung|ueberweisung|bank)') THEN RAISE EXCEPTION 'Überweisungserstattung nur für eindeutig reine Bankzahlungen'; END IF;
IF NEW.status NOT IN ('creating','succeeded') OR (NEW.status='succeeded' AND length(btrim(coalesce(NEW.bank_reference,'')))<3) OR jsonb_array_length(NEW.allocations)<>0 THEN RAISE EXCEPTION 'Banknachweis fehlt oder ungültiger Auszahlungsstatus'; END IF;
RETURN NEW;
END IF;
ELSE
IF c.invoice_kind<>'credit_note' OR c.parent_invoice_id IS NULL THEN RAISE EXCEPTION 'Keine gültige Gutschrift'; END IF;
IF NEW.amount_cents>round(abs(c.gross_amount)*100) OR (c.credit_refund_amount IS NOT NULL AND NEW.amount_cents>round(c.credit_refund_amount*100)) THEN RAISE EXCEPTION 'Erstattung übersteigt den Gutschriftbetrag'; END IF;
SELECT * INTO p FROM public.inquiry_invoices WHERE id=c.parent_invoice_id FOR UPDATE;
SELECT coalesce(sum(r.amount_cents),0) INTO siblings FROM public.credit_note_refunds r JOIN public.inquiry_invoices ci ON ci.id=r.credit_note_id WHERE ci.parent_invoice_id=c.parent_invoice_id AND r.id<>NEW.id AND r.status NOT IN ('failed','canceled');
IF siblings+NEW.amount_cents>round(coalesce(p.paid_amount,0)*100) THEN RAISE EXCEPTION 'Es kann nicht mehr erstattet werden, als bezahlt wurde'; END IF;
END IF;
SELECT coalesce(sum((a->>'amount_cents')::bigint),0) INTO alloc_sum FROM jsonb_array_elements(NEW.allocations) a;
IF alloc_sum<>NEW.amount_cents THEN RAISE EXCEPTION 'Erstattungsaufteilung stimmt nicht mit dem Betrag überein'; END IF;
RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.guard_bank_rental_refund_shared() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF TG_TABLE_NAME='credit_note_refunds' AND NEW.refund_kind='rental_credit' AND NEW.payout_method='transfer' THEN RETURN NEW; END IF;
RETURN public.guard_shared_stripe_refund_capacity();
END $$;