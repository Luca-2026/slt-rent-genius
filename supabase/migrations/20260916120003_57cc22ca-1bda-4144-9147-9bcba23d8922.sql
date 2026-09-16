ALTER TABLE public.inquiry_invoices
  ADD CONSTRAINT inquiry_invoices_nonnegative_tracking
  CHECK (paid_amount >= 0 AND credited_amount >= 0),
  ADD CONSTRAINT inquiry_invoices_credit_cap
  CHECK (invoice_kind = 'credit_note' OR credited_amount <= gross_amount + 0.01);

CREATE OR REPLACE FUNCTION public.apply_inquiry_invoice_credit(
  p_invoice_id uuid,
  p_credit_amount numeric,
  p_reason text
)
RETURNS public.inquiry_invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice public.inquiry_invoices;
  v_new_credited numeric;
BEGIN
  IF p_credit_amount IS NULL OR p_credit_amount <= 0 THEN
    RAISE EXCEPTION 'Der Gutschriftbetrag muss größer als 0 sein.' USING ERRCODE = 'check_violation';
  END IF;

  SELECT * INTO v_invoice
  FROM public.inquiry_invoices
  WHERE id = p_invoice_id AND invoice_kind <> 'credit_note'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ursprungsrechnung nicht gefunden.' USING ERRCODE = 'no_data_found';
  END IF;

  v_new_credited := round((coalesce(v_invoice.credited_amount, 0) + p_credit_amount)::numeric, 2);
  IF v_new_credited > v_invoice.gross_amount + 0.01 THEN
    RAISE EXCEPTION 'Der Gutschriftbetrag überschreitet den noch verfügbaren Rechnungsbetrag.' USING ERRCODE = 'check_violation';
  END IF;

  UPDATE public.inquiry_invoices
  SET credited_amount = v_new_credited,
      credit_reason = nullif(trim(p_reason), ''),
      status = CASE WHEN v_new_credited >= gross_amount - 0.01 THEN 'cancelled' ELSE status END,
      cancelled_at = CASE WHEN v_new_credited >= gross_amount - 0.01 THEN coalesce(cancelled_at, now()) ELSE cancelled_at END,
      updated_at = now()
  WHERE id = p_invoice_id
  RETURNING * INTO v_invoice;

  RETURN v_invoice;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_inquiry_invoice_payment(
  p_invoice_id uuid,
  p_amount numeric,
  p_payment_date date,
  p_label text DEFAULT 'Banküberweisung',
  p_reference text DEFAULT ''
)
RETURNS public.inquiry_invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice public.inquiry_invoices;
  v_payment jsonb;
  v_paid numeric;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_any_role(auth.uid(), ARRAY['superadmin'::app_role, 'admin'::app_role, 'standortmitarbeiter'::app_role]) THEN
    RAISE EXCEPTION 'Keine Berechtigung zur Zahlungserfassung.' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Der Zahlungsbetrag muss größer als 0 sein.' USING ERRCODE = 'check_violation';
  END IF;

  SELECT * INTO v_invoice
  FROM public.inquiry_invoices
  WHERE id = p_invoice_id AND invoice_kind <> 'credit_note'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Rechnung nicht gefunden.' USING ERRCODE = 'no_data_found';
  END IF;

  v_payment := jsonb_build_object(
    'amount', round(p_amount::numeric, 2),
    'date', coalesce(p_payment_date, current_date)::text,
    'label', coalesce(nullif(trim(p_label), ''), 'Banküberweisung'),
    'reference', coalesce(trim(p_reference), '')
  );
  v_paid := round((coalesce(v_invoice.paid_amount, 0) + p_amount)::numeric, 2);

  UPDATE public.inquiry_invoices
  SET payments = coalesce(payments, '[]'::jsonb) || jsonb_build_array(v_payment),
      paid_amount = v_paid,
      status = CASE WHEN v_paid >= gross_amount - 0.01 THEN 'paid' ELSE status END,
      paid_at = CASE WHEN v_paid >= gross_amount - 0.01 THEN coalesce(paid_at, now()) ELSE paid_at END,
      updated_at = now()
  WHERE id = p_invoice_id
  RETURNING * INTO v_invoice;

  RETURN v_invoice;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_inquiry_invoice_credit(uuid, numeric, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_inquiry_invoice_credit(uuid, numeric, text) TO service_role;
REVOKE ALL ON FUNCTION public.record_inquiry_invoice_payment(uuid, numeric, date, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_inquiry_invoice_payment(uuid, numeric, date, text, text) TO authenticated, service_role;

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