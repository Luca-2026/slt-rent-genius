CREATE OR REPLACE FUNCTION public.guard_direct_rental_refund_finality() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF NEW.refund_kind='rental_credit' AND TG_OP='UPDATE' THEN
IF OLD.payout_method='transfer' AND OLD.status='succeeded' AND NEW.status IS DISTINCT FROM OLD.status THEN RAISE EXCEPTION 'Bestätigte Bankerstattung ist endgültig'; END IF;
END IF;
RETURN NEW; END $$;
CREATE TRIGGER guard_direct_rental_refund_finality BEFORE UPDATE ON public.credit_note_refunds FOR EACH ROW EXECUTE FUNCTION public.guard_direct_rental_refund_finality();
CREATE OR REPLACE FUNCTION public.guard_invoice_after_rental_refund() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF NEW.rental_inquiry_id IS NOT NULL THEN
PERFORM pg_advisory_xact_lock(hashtextextended('rental-refund-invoice:'||NEW.rental_inquiry_id::text,0));
IF NEW.status NOT IN ('draft','cancelled') AND EXISTS(SELECT 1 FROM public.credit_note_refunds r JOIN public.inquiry_invoices i ON i.id=r.credit_note_id WHERE i.rental_inquiry_id=NEW.rental_inquiry_id AND i.id<>NEW.id AND r.refund_kind='rental_credit') THEN RAISE EXCEPTION 'Rechnung mit separat erstattetem Mietguthaben benötigt eine gesonderte Korrekturabrechnung'; END IF;
END IF;
RETURN NEW; END $$;
CREATE OR REPLACE FUNCTION public.lock_direct_rental_refund_invoice() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE owner_id uuid; BEGIN
IF NEW.refund_kind='rental_credit' THEN SELECT rental_inquiry_id INTO owner_id FROM public.inquiry_invoices WHERE id=NEW.credit_note_id; PERFORM pg_advisory_xact_lock(hashtextextended('rental-refund-invoice:'||owner_id::text,0)); END IF; RETURN NEW; END $$;
CREATE TRIGGER aab_lock_direct_rental_refund_invoice BEFORE INSERT OR UPDATE ON public.credit_note_refunds FOR EACH ROW EXECUTE FUNCTION public.lock_direct_rental_refund_invoice();