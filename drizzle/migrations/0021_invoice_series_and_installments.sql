-- Getrennte Rechnungsnummernkreise (Miete RE-M-, Verkauf RE-V-)
CREATE TABLE public.invoice_series_counters (
  series text NOT NULL CHECK (series IN ('M','V')),
  year integer NOT NULL,
  month integer NOT NULL,
  last_value integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (series, year, month)
);
GRANT ALL ON public.invoice_series_counters TO service_role;
ALTER TABLE public.invoice_series_counters ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.generate_inquiry_invoice_number_for(_series text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_now date := (now() AT TIME ZONE 'Europe/Berlin')::date;
  v_year integer := EXTRACT(YEAR FROM v_now)::integer;
  v_month integer := EXTRACT(MONTH FROM v_now)::integer;
  v_next integer;
BEGIN
  IF _series NOT IN ('M','V') THEN
    RAISE EXCEPTION 'Unbekannter Rechnungskreis %', _series;
  END IF;
  INSERT INTO public.invoice_series_counters (series, year, month, last_value)
  VALUES (_series, v_year, v_month, 1)
  ON CONFLICT (series, year, month)
  DO UPDATE SET last_value = public.invoice_series_counters.last_value + 1, updated_at = now()
  RETURNING last_value INTO v_next;
  RETURN 'RE-' || _series || '-' || v_year::text || '-' || lpad(v_month::text, 2, '0') || '-' || lpad(v_next::text, 4, '0');
END;
$$;
REVOKE EXECUTE ON FUNCTION public.generate_inquiry_invoice_number_for(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_inquiry_invoice_number_for(text) TO service_role;

-- Abschlags- und Schlussrechnungen
ALTER TABLE public.inquiry_invoices DROP CONSTRAINT inquiry_invoices_kind_check;
ALTER TABLE public.inquiry_invoices ADD CONSTRAINT inquiry_invoices_kind_check
  CHECK (invoice_kind = ANY (ARRAY['invoice','supplement','credit_note','installment','final']));
ALTER TABLE public.inquiry_invoices ADD COLUMN installment_number integer;
ALTER TABLE public.inquiry_invoices ADD COLUMN deducted_installments jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Abschlagsplan je Auftrag
ALTER TABLE public.rental_inquiries
  ADD COLUMN installment_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN installment_amount_net numeric,
  ADD COLUMN installment_interval_months integer NOT NULL DEFAULT 1 CHECK (installment_interval_months BETWEEN 1 AND 12),
  ADD COLUMN installment_next_due date,
  ADD COLUMN installment_open_ended boolean NOT NULL DEFAULT false,
  ADD COLUMN installment_reminded_on date;
ALTER TABLE public.sales_inquiries
  ADD COLUMN installment_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN installment_amount_net numeric,
  ADD COLUMN installment_interval_months integer NOT NULL DEFAULT 1 CHECK (installment_interval_months BETWEEN 1 AND 12),
  ADD COLUMN installment_next_due date,
  ADD COLUMN installment_open_ended boolean NOT NULL DEFAULT false,
  ADD COLUMN installment_reminded_on date;
CREATE INDEX idx_rental_inquiries_installment_due ON public.rental_inquiries (installment_next_due) WHERE installment_enabled;
CREATE INDEX idx_sales_inquiries_installment_due ON public.sales_inquiries (installment_next_due) WHERE installment_enabled;

-- Schlussrechnung schließt den Auftrag und beendet den Abschlagsplan
CREATE OR REPLACE FUNCTION public.close_rental_inquiry_on_invoice()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.rental_inquiry_id IS NOT NULL
     AND COALESCE(NEW.invoice_kind, 'invoice') IN ('invoice', 'final')
     AND NEW.status IN ('open', 'paid', 'overdue') THEN
    UPDATE public.rental_inquiries
       SET status = CASE WHEN status IN ('done','rejected') THEN status ELSE 'done' END,
           installment_enabled = CASE WHEN NEW.invoice_kind = 'final' THEN false ELSE installment_enabled END,
           updated_at = now()
     WHERE id = NEW.rental_inquiry_id
       AND (status NOT IN ('done', 'rejected') OR (NEW.invoice_kind = 'final' AND installment_enabled));
  END IF;
  IF NEW.sales_inquiry_id IS NOT NULL
     AND NEW.invoice_kind = 'final'
     AND NEW.status IN ('open', 'paid', 'overdue') THEN
    UPDATE public.sales_inquiries
       SET installment_enabled = false, updated_at = now()
     WHERE id = NEW.sales_inquiry_id AND installment_enabled;
  END IF;
  RETURN NEW;
END;
$$;

-- GoBD: neue Felder ebenfalls unveränderlich
CREATE OR REPLACE FUNCTION public.enforce_inquiry_invoice_immutability()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status <> 'draft' THEN
      RAISE EXCEPTION 'GoBD: Versendete Rechnungen (%) dürfen nicht gelöscht werden. Bitte stornieren.', OLD.invoice_number USING ERRCODE = 'check_violation';
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
      OR NEW.delivery_requested IS DISTINCT FROM OLD.delivery_requested
      OR NEW.delivery_street IS DISTINCT FROM OLD.delivery_street
      OR NEW.delivery_postal_code IS DISTINCT FROM OLD.delivery_postal_code
      OR NEW.delivery_city IS DISTINCT FROM OLD.delivery_city
      OR NEW.delivery_cost_delivery IS DISTINCT FROM OLD.delivery_cost_delivery
      OR NEW.delivery_cost_return IS DISTINCT FROM OLD.delivery_cost_return
      OR NEW.setup_cost IS DISTINCT FROM OLD.setup_cost
      OR NEW.dismantle_cost IS DISTINCT FROM OLD.dismantle_cost
      OR NEW.deposit IS DISTINCT FROM OLD.deposit
      OR NEW.service_period_start IS DISTINCT FROM OLD.service_period_start
      OR NEW.service_period_end IS DISTINCT FROM OLD.service_period_end
      OR NEW.installment_number IS DISTINCT FROM OLD.installment_number
      OR NEW.deducted_installments IS DISTINCT FROM OLD.deducted_installments
    THEN
      RAISE EXCEPTION 'GoBD: Versendete Rechnungen sind unveränderlich. Nur Status, Zahlungs-/Storno-Vermerke, interne Notizen sowie Datei- und E-Mail-Angaben dürfen geändert werden.' USING ERRCODE = 'check_violation';
    END IF;

    IF NEW.status <> OLD.status AND NOT (
      (OLD.status IN ('open','overdue') AND NEW.status IN ('open','overdue','paid','cancelled'))
      OR (OLD.status = 'paid' AND NEW.status IN ('paid','cancelled'))
      OR (OLD.status = 'cancelled' AND NEW.status = 'cancelled')
    ) THEN
      RAISE EXCEPTION 'GoBD: Unzulässiger Statuswechsel % -> %', OLD.status, NEW.status USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;