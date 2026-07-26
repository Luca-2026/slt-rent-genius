ALTER TABLE public.customer_feedback
  ADD COLUMN IF NOT EXISTS voucher_code text,
  ADD COLUMN IF NOT EXISTS voucher_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS voucher_sent_to text,
  ADD COLUMN IF NOT EXISTS google_review_confirmed boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.validate_customer_feedback()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  IF NEW.order_ref IS NULL OR btrim(NEW.order_ref) = '' THEN
    RAISE EXCEPTION 'Buchungsnummer ist erforderlich.' USING ERRCODE = 'check_violation';
  END IF;
  NEW.order_ref := btrim(NEW.order_ref);

  SELECT count(*) INTO recent_count
  FROM public.customer_feedback
  WHERE created_at > now() - interval '1 hour';

  IF recent_count >= 20 THEN
    RAISE EXCEPTION 'Zu viele Rückmeldungen in kurzer Zeit. Bitte versuche es später erneut.' USING ERRCODE = 'check_violation';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.customer_feedback
    WHERE lower(order_ref) = lower(NEW.order_ref)
      AND created_at > now() - interval '30 days'
  ) THEN
    RAISE EXCEPTION 'Zu dieser Buchungsnummer wurde bereits Feedback abgegeben.' USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_customer_feedback ON public.customer_feedback;
CREATE TRIGGER trg_validate_customer_feedback
BEFORE INSERT ON public.customer_feedback
FOR EACH ROW EXECUTE FUNCTION public.validate_customer_feedback();

CREATE INDEX IF NOT EXISTS idx_customer_feedback_order_ref ON public.customer_feedback (lower(order_ref));