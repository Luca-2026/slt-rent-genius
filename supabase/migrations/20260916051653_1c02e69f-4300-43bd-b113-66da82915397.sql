-- Momentaufnahme des versendeten Angebots
ALTER TABLE public.rental_inquiries ADD COLUMN IF NOT EXISTS offer_payload jsonb;
ALTER TABLE public.sales_inquiries ADD COLUMN IF NOT EXISTS offer_payload jsonb;

-- Nummernkreis je Jahr/Monat
CREATE TABLE public.invoice_number_counters (
  year integer NOT NULL,
  month integer NOT NULL,
  last_value integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (year, month)
);
GRANT SELECT ON public.invoice_number_counters TO authenticated;
GRANT ALL ON public.invoice_number_counters TO service_role;
ALTER TABLE public.invoice_number_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "counters_select_staff" ON public.invoice_number_counters
  FOR SELECT TO authenticated USING (public.is_staff_member(auth.uid()));

CREATE OR REPLACE FUNCTION public.generate_inquiry_invoice_number()
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
  INSERT INTO public.invoice_number_counters (year, month, last_value)
  VALUES (v_year, v_month, 1)
  ON CONFLICT (year, month)
  DO UPDATE SET last_value = public.invoice_number_counters.last_value + 1, updated_at = now()
  RETURNING last_value INTO v_next;

  RETURN 'RE-' || v_year::text || '-' || lpad(v_month::text, 2, '0') || '-' || lpad(v_next::text, 4, '0');
END;
$$;

-- Rechnungen aus Anfragen
CREATE TABLE public.inquiry_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number text UNIQUE,
  invoice_kind text NOT NULL DEFAULT 'invoice',
  parent_invoice_id uuid REFERENCES public.inquiry_invoices(id) ON DELETE SET NULL,
  inquiry_type text NOT NULL,
  rental_inquiry_id uuid REFERENCES public.rental_inquiries(id) ON DELETE SET NULL,
  sales_inquiry_id uuid REFERENCES public.sales_inquiries(id) ON DELETE SET NULL,
  crm_customer_id uuid REFERENCES public.crm_customers(id) ON DELETE SET NULL,
  location text,
  location_email text,
  customer_kind text NOT NULL DEFAULT 'private',
  company_name text,
  customer_name text,
  customer_email text NOT NULL,
  customer_phone text,
  vat_id text,
  customer_street text,
  customer_postal_code text,
  customer_city text,
  customer_country text NOT NULL DEFAULT 'Deutschland',
  delivery_requested boolean NOT NULL DEFAULT false,
  delivery_street text,
  delivery_postal_code text,
  delivery_city text,
  service_period_start date,
  service_period_end date,
  invoice_date date NOT NULL DEFAULT (now() AT TIME ZONE 'Europe/Berlin')::date,
  due_date date,
  payment_terms text NOT NULL DEFAULT 'net_14',
  payment_terms_custom text,
  payment_due_days integer NOT NULL DEFAULT 14,
  net_amount numeric NOT NULL DEFAULT 0,
  vat_rate numeric NOT NULL DEFAULT 19,
  vat_amount numeric NOT NULL DEFAULT 0,
  gross_amount numeric NOT NULL DEFAULT 0,
  delivery_cost_delivery numeric NOT NULL DEFAULT 0,
  delivery_cost_return numeric NOT NULL DEFAULT 0,
  setup_cost numeric NOT NULL DEFAULT 0,
  dismantle_cost numeric NOT NULL DEFAULT 0,
  deposit numeric NOT NULL DEFAULT 0,
  notes text,
  internal_notes text,
  status text NOT NULL DEFAULT 'draft',
  file_url text,
  file_name text,
  file_path text,
  email_sent boolean NOT NULL DEFAULT false,
  email_sent_at timestamp with time zone,
  paid_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_by uuid,
  created_by_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT inquiry_invoices_kind_check CHECK (invoice_kind IN ('invoice','supplement')),
  CONSTRAINT inquiry_invoices_type_check CHECK (inquiry_type IN ('rental','sales')),
  CONSTRAINT inquiry_invoices_status_check CHECK (status IN ('draft','open','overdue','paid','cancelled'))
);

CREATE INDEX idx_inquiry_invoices_rental ON public.inquiry_invoices(rental_inquiry_id);
CREATE INDEX idx_inquiry_invoices_sales ON public.inquiry_invoices(sales_inquiry_id);
CREATE INDEX idx_inquiry_invoices_status ON public.inquiry_invoices(status);
CREATE INDEX idx_inquiry_invoices_parent ON public.inquiry_invoices(parent_invoice_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiry_invoices TO authenticated;
GRANT ALL ON public.inquiry_invoices TO service_role;
ALTER TABLE public.inquiry_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inquiry_invoices_select_staff" ON public.inquiry_invoices
  FOR SELECT TO authenticated USING (public.is_staff_member(auth.uid()));
CREATE POLICY "inquiry_invoices_insert_staff" ON public.inquiry_invoices
  FOR INSERT TO authenticated WITH CHECK (public.is_staff_member(auth.uid()));
CREATE POLICY "inquiry_invoices_update_staff" ON public.inquiry_invoices
  FOR UPDATE TO authenticated USING (public.is_staff_member(auth.uid())) WITH CHECK (public.is_staff_member(auth.uid()));
CREATE POLICY "inquiry_invoices_delete_admin_draft" ON public.inquiry_invoices
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') AND status = 'draft');

CREATE TABLE public.inquiry_invoice_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id uuid NOT NULL REFERENCES public.inquiry_invoices(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  product_name text NOT NULL,
  description text,
  quantity numeric NOT NULL DEFAULT 1,
  unit text,
  unit_price numeric NOT NULL DEFAULT 0,
  discount_percent numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  rental_start text,
  rental_end text,
  addons jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_inquiry_invoice_items_invoice ON public.inquiry_invoice_items(invoice_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiry_invoice_items TO authenticated;
GRANT ALL ON public.inquiry_invoice_items TO service_role;
ALTER TABLE public.inquiry_invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inquiry_invoice_items_select_staff" ON public.inquiry_invoice_items
  FOR SELECT TO authenticated USING (public.is_staff_member(auth.uid()));
CREATE POLICY "inquiry_invoice_items_write_staff" ON public.inquiry_invoice_items
  FOR ALL TO authenticated USING (public.is_staff_member(auth.uid())) WITH CHECK (public.is_staff_member(auth.uid()));

CREATE TRIGGER trg_inquiry_invoices_updated_at
  BEFORE UPDATE ON public.inquiry_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Unveränderlichkeit finalisierter Rechnungen
CREATE OR REPLACE FUNCTION public.enforce_inquiry_invoice_immutability()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
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
$$;

CREATE TRIGGER trg_inquiry_invoices_immutability_upd
  BEFORE UPDATE ON public.inquiry_invoices
  FOR EACH ROW EXECUTE FUNCTION public.enforce_inquiry_invoice_immutability();
CREATE TRIGGER trg_inquiry_invoices_immutability_del
  BEFORE DELETE ON public.inquiry_invoices
  FOR EACH ROW EXECUTE FUNCTION public.enforce_inquiry_invoice_immutability();

-- Positionen finalisierter Rechnungen sind ebenfalls gesperrt
CREATE OR REPLACE FUNCTION public.enforce_inquiry_invoice_items_immutability()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  parent_status text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT status INTO parent_status FROM public.inquiry_invoices WHERE id = OLD.invoice_id;
    IF parent_status IS NOT NULL AND parent_status <> 'draft' THEN
      RAISE EXCEPTION 'GoBD: Positionen einer versendeten Rechnung dürfen nicht geändert werden.'
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN OLD;
  END IF;

  SELECT status INTO parent_status FROM public.inquiry_invoices WHERE id = NEW.invoice_id;
  IF parent_status IS NOT NULL AND parent_status <> 'draft' THEN
    RAISE EXCEPTION 'GoBD: Positionen einer versendeten Rechnung dürfen nicht geändert werden.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_inquiry_invoice_items_immutability
  BEFORE INSERT OR UPDATE OR DELETE ON public.inquiry_invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.enforce_inquiry_invoice_items_immutability();