ALTER TABLE public.inquiry_invoices DROP CONSTRAINT inquiry_invoices_kind_check;
ALTER TABLE public.inquiry_invoices ADD CONSTRAINT inquiry_invoices_kind_check
  CHECK (invoice_kind = ANY (ARRAY['invoice'::text, 'supplement'::text, 'credit_note'::text]));

ALTER TABLE public.inquiry_invoices
  ADD COLUMN IF NOT EXISTS credited_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credit_reason text;

COMMENT ON COLUMN public.inquiry_invoices.credited_amount IS 'Summe aller Gutschriften (brutto, positiv) zu dieser Rechnung';
COMMENT ON COLUMN public.inquiry_invoices.credit_reason IS 'Grund der Gutschrift bzw. Stornierung';

CREATE TABLE IF NOT EXISTS public.credit_note_number_counters (
  year integer NOT NULL,
  month integer NOT NULL,
  last_value integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (year, month)
);
GRANT ALL ON public.credit_note_number_counters TO service_role;
ALTER TABLE public.credit_note_number_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nur Service-Rolle verwaltet Gutschriftnummern"
  ON public.credit_note_number_counters FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.generate_inquiry_credit_note_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_now date := (now() AT TIME ZONE 'Europe/Berlin')::date;
  v_year integer := EXTRACT(YEAR FROM v_now)::integer;
  v_month integer := EXTRACT(MONTH FROM v_now)::integer;
  v_next integer;
BEGIN
  INSERT INTO public.credit_note_number_counters (year, month, last_value)
  VALUES (v_year, v_month, 1)
  ON CONFLICT (year, month)
  DO UPDATE SET last_value = public.credit_note_number_counters.last_value + 1, updated_at = now()
  RETURNING last_value INTO v_next;

  RETURN 'GS-' || v_year::text || '-' || lpad(v_month::text, 2, '0') || '-' || lpad(v_next::text, 4, '0');
END;
$function$;

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
      OR (OLD.status = 'paid' AND NEW.status IN ('paid','cancelled'))
      OR (OLD.status = 'cancelled' AND NEW.status = 'cancelled')
    ) THEN
      RAISE EXCEPTION 'GoBD: Unzulässiger Statuswechsel % -> %', OLD.status, NEW.status
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;