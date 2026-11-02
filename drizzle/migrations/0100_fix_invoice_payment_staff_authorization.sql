CREATE OR REPLACE FUNCTION public.record_inquiry_invoice_payment(p_invoice_id uuid, p_amount numeric, p_payment_date date, p_label text DEFAULT 'Banküberweisung'::text, p_reference text DEFAULT ''::text)
 RETURNS public.inquiry_invoices
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_invoice public.inquiry_invoices;
  v_payment jsonb;
  v_paid numeric;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_staff_member(auth.uid()) THEN
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
$function$;
REVOKE ALL ON FUNCTION public.record_inquiry_invoice_payment(uuid,numeric,date,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_inquiry_invoice_payment(uuid,numeric,date,text,text) TO authenticated, service_role;