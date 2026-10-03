ALTER TABLE public.b2b_invoices ADD COLUMN invoice_kind text NOT NULL DEFAULT 'invoice', ADD COLUMN parent_invoice_id uuid REFERENCES public.b2b_invoices(id), ADD COLUMN credited_amount numeric NOT NULL DEFAULT 0;
CREATE FUNCTION public.finalize_portal_credit_note(p_credit_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE credit public.b2b_invoices; original public.b2b_invoices; credit_amount numeric;
BEGIN
  SELECT * INTO credit FROM public.b2b_invoices WHERE id=p_credit_id FOR UPDATE;
  IF credit.id IS NULL OR credit.status <> 'draft' OR credit.invoice_kind <> 'credit_note' THEN RAISE EXCEPTION 'Gutschrift ist kein Entwurf'; END IF;
  SELECT * INTO original FROM public.b2b_invoices WHERE id=credit.parent_invoice_id FOR UPDATE;
  credit_amount := round(abs(credit.gross_amount),2);
  IF original.id IS NULL OR original.status IN ('draft','cancelled') OR original.invoice_kind <> 'invoice' OR credit_amount <= 0 OR credit_amount > round(original.gross_amount-original.credited_amount,2) THEN RAISE EXCEPTION 'Gutschrift übersteigt den noch korrigierbaren Betrag'; END IF;
  UPDATE public.b2b_invoices SET status='paid' WHERE id=credit.id;
  UPDATE public.b2b_invoices SET credited_amount=round(credited_amount+credit_amount,2), status=CASE WHEN round(credited_amount+credit_amount,2)=round(gross_amount,2) THEN 'cancelled' ELSE status END WHERE id=original.id;
END;
$$;
REVOKE ALL ON FUNCTION public.finalize_portal_credit_note(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_portal_credit_note(uuid) TO service_role;
CREATE FUNCTION public.guard_portal_invoice_credit_integrity()
RETURNS trigger LANGUAGE plpgsql SET search_path=public
AS $$ BEGIN
  IF OLD.status <> 'draft' AND (NEW.invoice_kind IS DISTINCT FROM OLD.invoice_kind OR NEW.parent_invoice_id IS DISTINCT FROM OLD.parent_invoice_id) THEN RAISE EXCEPTION 'GoBD: Rechnungsbezug ist unveränderlich'; END IF;
  IF NEW.credited_amount IS DISTINCT FROM OLD.credited_amount AND current_user NOT IN ('postgres','service_role') THEN RAISE EXCEPTION 'Gutschriften nur über die gesicherte Gutschriftfunktion'; END IF;
  IF NEW.status='cancelled' AND OLD.status <> 'cancelled' AND round(NEW.credited_amount,2) <> round(NEW.gross_amount,2) THEN RAISE EXCEPTION 'Stornierung nur mit vollständiger Gutschrift'; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_a_portal_credit_integrity BEFORE UPDATE ON public.b2b_invoices FOR EACH ROW EXECUTE FUNCTION public.guard_portal_invoice_credit_integrity();
-- Preserve every existing immutable field check; only allow paid -> cancelled via a complete credit note.
CREATE OR REPLACE FUNCTION public.enforce_invoice_immutability()
RETURNS trigger LANGUAGE plpgsql SET search_path=public
AS $$ BEGIN
  IF TG_OP='DELETE' THEN
    IF OLD.status <> 'draft' THEN RAISE EXCEPTION 'GoBD: Finalisierte Rechnungen dürfen nicht gelöscht werden' USING ERRCODE='check_violation'; END IF;
    RETURN OLD;
  END IF;
  IF OLD.status <> 'draft' THEN
    IF (to_jsonb(NEW) - ARRAY['status','file_url','file_name','email_sent','email_sent_at','notes','updated_at','credited_amount']) IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['status','file_url','file_name','email_sent','email_sent_at','notes','updated_at','credited_amount']) THEN RAISE EXCEPTION 'GoBD: Finalisierte Rechnungen sind unveränderlich' USING ERRCODE='check_violation'; END IF;
    IF NEW.status <> OLD.status AND NOT ((OLD.status IN ('open','overdue') AND NEW.status IN ('open','overdue','paid','cancelled')) OR (OLD.status='paid' AND NEW.status='cancelled' AND round(NEW.credited_amount,2)=round(NEW.gross_amount,2))) THEN RAISE EXCEPTION 'GoBD: Unzulässiger Statuswechsel' USING ERRCODE='check_violation'; END IF;
  END IF;
  RETURN NEW;
END; $$;