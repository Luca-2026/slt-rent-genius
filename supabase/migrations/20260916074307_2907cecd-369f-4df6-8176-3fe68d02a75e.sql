ALTER TABLE public.inquiry_invoices ADD COLUMN IF NOT EXISTS offer_number text;

CREATE OR REPLACE FUNCTION public.enforce_inquiry_invoice_immutability()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status <> 'draft' THEN
      RAISE EXCEPTION 'GoBD: Versendete Rechnungen (%) dürfen nicht gelöscht werden. Bitte stornieren.', OLD.invoice_number
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN OLD;
  END IF;

  IF OLD.status <> 'draft' THEN
    IF NEW.invoice_number IS DISTINCT FROM OLD.invoice_number
      OR NEW.invoice_date IS DISTINCT FROM OLD.invoice_date
      OR NEW.due_date IS DISTINCT FROM OLD.due_date
      OR NEW.net_amount IS DISTINCT FROM OLD.net_amount
      OR NEW.vat_rate IS DISTINCT FROM OLD.vat_rate
      OR NEW.vat_amount IS DISTINCT FROM OLD.vat_amount
      OR NEW.gross_amount IS DISTINCT FROM OLD.gross_amount
      OR NEW.customer_email IS DISTINCT FROM OLD.customer_email
      OR NEW.company_name IS DISTINCT FROM OLD.company_name
      OR NEW.customer_name IS DISTINCT FROM OLD.customer_name
      OR NEW.customer_street IS DISTINCT FROM OLD.customer_street
      OR NEW.customer_postal_code IS DISTINCT FROM OLD.customer_postal_code
      OR NEW.customer_city IS DISTINCT FROM OLD.customer_city
      OR NEW.payment_terms IS DISTINCT FROM OLD.payment_terms
      OR NEW.invoice_kind IS DISTINCT FROM OLD.invoice_kind
      OR NEW.parent_invoice_id IS DISTINCT FROM OLD.parent_invoice_id
      OR NEW.offer_number IS DISTINCT FROM OLD.offer_number
    THEN
      RAISE EXCEPTION 'GoBD: Versendete Rechnungen sind unveränderlich. Nur Status, Zahlungs-/Storno-Vermerke, interne Notizen sowie Datei- und E-Mail-Angaben dürfen geändert werden.'
        USING ERRCODE = 'check_violation';
    END IF;

    IF NEW.status <> OLD.status AND NOT (
      (OLD.status IN ('open','overdue') AND NEW.status IN ('open','overdue','paid','cancelled'))
      OR (OLD.status = 'paid' AND NEW.status = 'paid')
      OR (OLD.status = 'cancelled' AND NEW.status = 'cancelled')
    ) THEN
      RAISE EXCEPTION 'GoBD: Unzulässiger Statuswechsel % -> %', OLD.status, NEW.status
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$