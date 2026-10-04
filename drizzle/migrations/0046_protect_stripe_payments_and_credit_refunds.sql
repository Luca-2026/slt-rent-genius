CREATE OR REPLACE FUNCTION public.protect_stripe_payment_entries() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE p jsonb;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    FOR p IN SELECT value FROM jsonb_array_elements(COALESCE(OLD.payments, '[]'::jsonb)) LOOP
      IF (p->>'reference' ~ '^(cs_|pi_)' OR p->>'label' ILIKE '%stripe%') AND NOT COALESCE(NEW.payments, '[]'::jsonb) @> jsonb_build_array(p) THEN
        RAISE EXCEPTION 'Bestätigte Stripe-Zahlungen dürfen nicht verändert oder entfernt werden.' USING ERRCODE = '23514';
      END IF;
    END LOOP;
  END IF;
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    FOR p IN SELECT value FROM jsonb_array_elements(COALESCE(NEW.payments, '[]'::jsonb)) LOOP
      IF (p->>'reference' ~ '^(cs_|pi_)' OR p->>'label' ILIKE '%stripe%') AND (TG_OP = 'INSERT' OR NOT COALESCE(OLD.payments, '[]'::jsonb) @> jsonb_build_array(p)) THEN
        RAISE EXCEPTION 'Stripe-Zahlungen werden ausschließlich automatisch bestätigt.' USING ERRCODE = '23514';
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER protect_rental_stripe_payments BEFORE INSERT OR UPDATE OF payments ON public.rental_inquiries FOR EACH ROW EXECUTE FUNCTION public.protect_stripe_payment_entries();
CREATE TRIGGER protect_sales_stripe_payments BEFORE INSERT OR UPDATE OF payments ON public.sales_inquiries FOR EACH ROW EXECUTE FUNCTION public.protect_stripe_payment_entries();
CREATE TRIGGER protect_invoice_stripe_payments BEFORE INSERT OR UPDATE OF payments ON public.inquiry_invoices FOR EACH ROW EXECUTE FUNCTION public.protect_stripe_payment_entries();
ALTER TABLE public.inquiry_invoices ADD COLUMN credit_refund_amount numeric;
CREATE TABLE public.credit_note_refunds (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 credit_note_id uuid NOT NULL UNIQUE REFERENCES public.inquiry_invoices(id),
 amount_cents integer NOT NULL CHECK (amount_cents > 0),
 status text NOT NULL DEFAULT 'creating',
 allocations jsonb NOT NULL DEFAULT '[]'::jsonb,
 created_by uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_note_refunds TO authenticated;
GRANT ALL ON public.credit_note_refunds TO service_role;
ALTER TABLE public.credit_note_refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_read_credit_refunds ON public.credit_note_refunds FOR SELECT TO authenticated USING (public.is_staff_member(auth.uid()));
CREATE OR REPLACE FUNCTION public.sync_credit_note_refund(_credit_id uuid, _intent text, _refund_id text, _status text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE items jsonb; overall text;
BEGIN
 SELECT allocations INTO items FROM public.credit_note_refunds WHERE credit_note_id = _credit_id FOR UPDATE;
 IF items IS NULL THEN RETURN; END IF;
 SELECT jsonb_agg(CASE WHEN value->>'payment_intent' = _intent THEN value || jsonb_build_object('refund_id', _refund_id, 'status', _status) ELSE value END) INTO items FROM jsonb_array_elements(items);
 SELECT CASE WHEN bool_and(value->>'status' = 'succeeded') THEN 'succeeded' WHEN bool_or(value->>'status' IN ('failed','canceled')) THEN 'failed' ELSE 'pending' END INTO overall FROM jsonb_array_elements(items);
 UPDATE public.credit_note_refunds SET allocations = items, status = overall, updated_at = now() WHERE credit_note_id = _credit_id;
END; $$;
REVOKE ALL ON FUNCTION public.sync_credit_note_refund(uuid,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_credit_note_refund(uuid,text,text,text) TO service_role;