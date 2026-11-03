CREATE TABLE public.cash_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table text NOT NULL,
  source_id uuid NOT NULL,
  kind text NOT NULL,             -- payment | payment_removed | deposit_payout
  amount numeric(12,2) NOT NULL,  -- + Einnahme, - Ausgabe
  payment_date date NOT NULL,
  label text,
  reference text,
  order_code text,
  document_number text,
  customer_name text,
  company_name text,
  logged_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cash_journal_logged_at ON public.cash_journal (logged_at);
GRANT SELECT ON public.cash_journal TO authenticated;
GRANT ALL ON public.cash_journal TO service_role;
ALTER TABLE public.cash_journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read cash journal" ON public.cash_journal FOR SELECT TO authenticated USING (public.is_staff_member(auth.uid()));

CREATE OR REPLACE FUNCTION public.guard_cash_journal_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Kassenprotokoll ist unveränderlich (GoBD)'; END $$;
CREATE TRIGGER cash_journal_immutable BEFORE UPDATE OR DELETE ON public.cash_journal
  FOR EACH ROW EXECUTE FUNCTION public.guard_cash_journal_immutable();

CREATE OR REPLACE FUNCTION public.log_cash_payments() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _old jsonb := CASE WHEN TG_OP = 'UPDATE' THEN coalesce(OLD.payments, '[]'::jsonb) ELSE '[]'::jsonb END;
  _new jsonb := coalesce(NEW.payments, '[]'::jsonb);
  _code text; _doc text; _name text; _company text;
BEGIN
  IF _old = _new THEN RETURN NEW; END IF;
  IF TG_TABLE_NAME = 'rental_inquiries' THEN
    _code := NEW.order_code; _doc := NULL; _name := NEW.customer_name; _company := NEW.company_name;
  ELSIF TG_TABLE_NAME = 'sales_inquiries' THEN
    _code := NEW.order_code; _doc := NULL;
    _name := nullif(trim(concat_ws(' ', NEW.first_name, NEW.last_name)), '');
    _company := coalesce(nullif(NEW.company_name, ''), NEW.billing_company);
  ELSE
    _doc := NEW.invoice_number; _name := NEW.customer_name; _company := NEW.company_name;
    SELECT coalesce(
      (SELECT order_code FROM public.rental_inquiries WHERE id = NEW.rental_inquiry_id),
      (SELECT order_code FROM public.sales_inquiries WHERE id = NEW.sales_inquiry_id)) INTO _code;
  END IF;

  INSERT INTO public.cash_journal (source_table, source_id, kind, amount, payment_date, label, reference, order_code, document_number, customer_name, company_name)
  SELECT TG_TABLE_NAME, NEW.id, d.kind, d.sign * round((d.p->>'amount')::numeric, 2),
         coalesce(nullif(d.p->>'date','')::date, current_date), d.p->>'label', d.p->>'reference',
         _code, _doc, _name, _company
  FROM (
    SELECT 'payment' kind, 1 sign, n.p FROM (
      SELECT p, row_number() OVER (PARTITION BY p) rn FROM jsonb_array_elements(_new) p) n
      WHERE NOT EXISTS (SELECT 1 FROM (SELECT p, row_number() OVER (PARTITION BY p) rn FROM jsonb_array_elements(_old) p) o WHERE o.p = n.p AND o.rn = n.rn)
    UNION ALL
    SELECT 'payment_removed', -1, o.p FROM (
      SELECT p, row_number() OVER (PARTITION BY p) rn FROM jsonb_array_elements(_old) p) o
      WHERE NOT EXISTS (SELECT 1 FROM (SELECT p, row_number() OVER (PARTITION BY p) rn FROM jsonb_array_elements(_new) p) n WHERE o.p = n.p AND o.rn = n.rn)
  ) d
  WHERE lower(coalesce(d.p->>'label','')) LIKE 'bar%' AND coalesce((d.p->>'amount')::numeric, 0) > 0;
  RETURN NEW;
END $$;

CREATE TRIGGER rental_cash_journal AFTER INSERT OR UPDATE OF payments ON public.rental_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.log_cash_payments();
CREATE TRIGGER sales_cash_journal AFTER INSERT OR UPDATE OF payments ON public.sales_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.log_cash_payments();
-- Rechnungen übernehmen beim Anlegen Zahlungen aus dem Auftrag: nur spätere Zahlungseingänge zählen.
CREATE TRIGGER invoice_cash_journal AFTER UPDATE OF payments ON public.inquiry_invoices
  FOR EACH ROW EXECUTE FUNCTION public.log_cash_payments();

CREATE OR REPLACE FUNCTION public.log_cash_deposit_payout() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.payout_method = 'cash' AND NEW.balance > 0 THEN
    INSERT INTO public.cash_journal (source_table, source_id, kind, amount, payment_date, label, order_code, customer_name, company_name)
    SELECT 'deposit_settlements', NEW.id, 'deposit_payout', -round(NEW.balance, 2), coalesce(NEW.payout_date, current_date),
           'Kaution bar ausgezahlt', r.order_code, r.customer_name, r.company_name
    FROM public.rental_inquiries r WHERE r.id = NEW.rental_inquiry_id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER deposit_cash_journal AFTER INSERT ON public.deposit_settlements
  FOR EACH ROW EXECUTE FUNCTION public.log_cash_deposit_payout();
REVOKE ALL ON FUNCTION public.log_cash_payments(), public.log_cash_deposit_payout() FROM public, anon, authenticated;