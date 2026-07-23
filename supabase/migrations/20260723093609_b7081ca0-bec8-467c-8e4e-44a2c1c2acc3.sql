
-- 1) b2b_profiles: default_payment_terms
ALTER TABLE public.b2b_profiles
  ADD COLUMN IF NOT EXISTS default_payment_terms TEXT NOT NULL DEFAULT 'vorkasse';

ALTER TABLE public.b2b_profiles
  DROP CONSTRAINT IF EXISTS b2b_profiles_default_payment_terms_check;
ALTER TABLE public.b2b_profiles
  ADD CONSTRAINT b2b_profiles_default_payment_terms_check
  CHECK (default_payment_terms IN ('vorkasse','net_7','net_14','net_30'));

-- 2) b2b_invoices: payment_terms, source_offer_id, allow draft status,
--    make invoice_number/invoice_date nullable for drafts
ALTER TABLE public.b2b_invoices
  ADD COLUMN IF NOT EXISTS payment_terms TEXT NOT NULL DEFAULT 'vorkasse',
  ADD COLUMN IF NOT EXISTS source_offer_id UUID NULL REFERENCES public.b2b_offers(id) ON DELETE SET NULL;

ALTER TABLE public.b2b_invoices
  DROP CONSTRAINT IF EXISTS b2b_invoices_payment_terms_check;
ALTER TABLE public.b2b_invoices
  ADD CONSTRAINT b2b_invoices_payment_terms_check
  CHECK (payment_terms IN ('vorkasse','net_7','net_14','net_30'));

ALTER TABLE public.b2b_invoices ALTER COLUMN invoice_number DROP NOT NULL;
ALTER TABLE public.b2b_invoices ALTER COLUMN invoice_date DROP NOT NULL;

-- Status set: draft, open, overdue, paid, cancelled
ALTER TABLE public.b2b_invoices
  DROP CONSTRAINT IF EXISTS b2b_invoices_status_check;
ALTER TABLE public.b2b_invoices
  ADD CONSTRAINT b2b_invoices_status_check
  CHECK (status IN ('draft','open','overdue','paid','cancelled'));

-- Ensure non-draft rows always have a number + date
ALTER TABLE public.b2b_invoices
  DROP CONSTRAINT IF EXISTS b2b_invoices_finalized_requires_number;
ALTER TABLE public.b2b_invoices
  ADD CONSTRAINT b2b_invoices_finalized_requires_number
  CHECK (status = 'draft' OR (invoice_number IS NOT NULL AND invoice_date IS NOT NULL));

CREATE INDEX IF NOT EXISTS idx_b2b_invoices_source_offer ON public.b2b_invoices(source_offer_id);
CREATE INDEX IF NOT EXISTS idx_b2b_invoices_status_due ON public.b2b_invoices(status, due_date);

-- 3) Auto-compute due_date on transition draft -> open (if not explicitly set)
CREATE OR REPLACE FUNCTION public.compute_invoice_due_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_date DATE;
  days INT;
BEGIN
  IF NEW.status IN ('open','overdue','paid','cancelled') AND NEW.invoice_date IS NOT NULL THEN
    IF NEW.due_date IS NULL OR (TG_OP='UPDATE' AND OLD.status='draft') THEN
      base_date := NEW.invoice_date;
      days := CASE NEW.payment_terms
        WHEN 'vorkasse' THEN 0
        WHEN 'net_7' THEN 7
        WHEN 'net_14' THEN 14
        WHEN 'net_30' THEN 30
        ELSE 14 END;
      NEW.due_date := base_date + days;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_b2b_invoices_compute_due_date ON public.b2b_invoices;
CREATE TRIGGER trg_b2b_invoices_compute_due_date
BEFORE INSERT OR UPDATE ON public.b2b_invoices
FOR EACH ROW EXECUTE FUNCTION public.compute_invoice_due_date();

-- 4) GoBD immutability: block edits/deletes on finalized invoices
CREATE OR REPLACE FUNCTION public.enforce_invoice_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  allowed_when_finalized TEXT[] := ARRAY[
    'status','updated_at','file_url','file_name','email_sent','email_sent_at','notes'
  ];
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status <> 'draft' THEN
      RAISE EXCEPTION 'GoBD: Finalisierte Rechnungen (%) dürfen nicht gelöscht werden. Bitte stornieren.', OLD.invoice_number
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status <> 'draft' THEN
    -- allow: any status change to cancelled/paid/overdue; allow file/email/notes/updated_at updates
    -- disallow changes to core invoice fields
    IF NEW.invoice_number IS DISTINCT FROM OLD.invoice_number
      OR NEW.invoice_date IS DISTINCT FROM OLD.invoice_date
      OR NEW.due_date IS DISTINCT FROM OLD.due_date
      OR NEW.b2b_profile_id IS DISTINCT FROM OLD.b2b_profile_id
      OR NEW.net_amount IS DISTINCT FROM OLD.net_amount
      OR NEW.vat_rate IS DISTINCT FROM OLD.vat_rate
      OR NEW.vat_amount IS DISTINCT FROM OLD.vat_amount
      OR NEW.gross_amount IS DISTINCT FROM OLD.gross_amount
      OR NEW.amount IS DISTINCT FROM OLD.amount
      OR NEW.delivery_cost IS DISTINCT FROM OLD.delivery_cost
      OR NEW.is_reverse_charge IS DISTINCT FROM OLD.is_reverse_charge
      OR NEW.vat_id_at_creation IS DISTINCT FROM OLD.vat_id_at_creation
      OR NEW.customer_company IS DISTINCT FROM OLD.customer_company
      OR NEW.customer_address IS DISTINCT FROM OLD.customer_address
      OR NEW.customer_postal_code IS DISTINCT FROM OLD.customer_postal_code
      OR NEW.customer_city IS DISTINCT FROM OLD.customer_city
      OR NEW.customer_country IS DISTINCT FROM OLD.customer_country
      OR NEW.payment_terms IS DISTINCT FROM OLD.payment_terms
      OR NEW.payment_due_days IS DISTINCT FROM OLD.payment_due_days
      OR NEW.source_offer_id IS DISTINCT FROM OLD.source_offer_id
      OR NEW.reservation_id IS DISTINCT FROM OLD.reservation_id
    THEN
      RAISE EXCEPTION 'GoBD: Finalisierte Rechnungen sind unveränderlich. Nur Status (stornieren/bezahlt), Datei-/E-Mail-Metadaten und interne Notizen dürfen aktualisiert werden.'
        USING ERRCODE = 'check_violation';
    END IF;

    -- Legal status transitions from finalized:
    --   open <-> overdue, open|overdue -> paid|cancelled, cancelled/paid remain
    IF NEW.status <> OLD.status THEN
      IF NOT (
        (OLD.status IN ('open','overdue') AND NEW.status IN ('open','overdue','paid','cancelled'))
        OR (OLD.status = 'paid' AND NEW.status = 'paid')
        OR (OLD.status = 'cancelled' AND NEW.status = 'cancelled')
      ) THEN
        RAISE EXCEPTION 'GoBD: Unzulässiger Statuswechsel % -> %', OLD.status, NEW.status
          USING ERRCODE = 'check_violation';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_b2b_invoices_immutability_upd ON public.b2b_invoices;
CREATE TRIGGER trg_b2b_invoices_immutability_upd
BEFORE UPDATE ON public.b2b_invoices
FOR EACH ROW EXECUTE FUNCTION public.enforce_invoice_immutability();

DROP TRIGGER IF EXISTS trg_b2b_invoices_immutability_del ON public.b2b_invoices;
CREATE TRIGGER trg_b2b_invoices_immutability_del
BEFORE DELETE ON public.b2b_invoices
FOR EACH ROW EXECUTE FUNCTION public.enforce_invoice_immutability();

-- 5) Invoice items: block writes when parent invoice is finalized
CREATE OR REPLACE FUNCTION public.enforce_invoice_items_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  parent_status TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT status INTO parent_status FROM public.b2b_invoices WHERE id = OLD.invoice_id;
    IF parent_status IS NOT NULL AND parent_status <> 'draft' THEN
      RAISE EXCEPTION 'GoBD: Positionen einer finalisierten Rechnung dürfen nicht geändert werden.'
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN OLD;
  ELSE
    SELECT status INTO parent_status FROM public.b2b_invoices WHERE id = NEW.invoice_id;
    IF parent_status IS NOT NULL AND parent_status <> 'draft' THEN
      RAISE EXCEPTION 'GoBD: Positionen einer finalisierten Rechnung dürfen nicht geändert werden.'
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_b2b_invoice_items_immutability ON public.b2b_invoice_items;
CREATE TRIGGER trg_b2b_invoice_items_immutability
BEFORE INSERT OR UPDATE OR DELETE ON public.b2b_invoice_items
FOR EACH ROW EXECUTE FUNCTION public.enforce_invoice_items_immutability();

-- 6) Sequence reset only over finalized numbers (drafts have NULL invoice_number,
--    so the existing helper already ignores them; make that explicit and safe)
CREATE OR REPLACE FUNCTION public.reset_invoice_sequence_if_empty()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  max_num integer;
BEGIN
  SELECT MAX(
    CAST(SUBSTRING(invoice_number FROM '\d+$') AS integer)
  ) INTO max_num
  FROM public.b2b_invoices
  WHERE invoice_number IS NOT NULL;

  IF max_num IS NULL THEN
    ALTER SEQUENCE public.b2b_rental_invoice_number_seq RESTART WITH 1;
  ELSE
    -- Never reuse finalized numbers: set next to max+1
    EXECUTE format('ALTER SEQUENCE public.b2b_rental_invoice_number_seq RESTART WITH %s', max_num + 1);
  END IF;

  RETURN NULL;
END;
$$;

-- 7) Nightly overdue automation (soft: also called from admin tab on load)
CREATE OR REPLACE FUNCTION public.mark_overdue_invoices()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE public.b2b_invoices
  SET status = 'overdue', updated_at = now()
  WHERE status = 'open'
    AND due_date IS NOT NULL
    AND due_date < CURRENT_DATE;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_overdue_invoices() TO authenticated, service_role;
