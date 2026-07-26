ALTER TABLE public.customer_feedback ADD COLUMN IF NOT EXISTS rented_items TEXT;

CREATE OR REPLACE FUNCTION public.validate_customer_feedback()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  recent_count integer;
BEGIN
  IF NEW.order_ref IS NULL OR btrim(NEW.order_ref) = '' THEN
    RAISE EXCEPTION 'Buchungsnummer ist erforderlich.' USING ERRCODE = 'check_violation';
  END IF;
  NEW.order_ref := btrim(NEW.order_ref);

  IF NEW.customer_email IS NULL OR btrim(NEW.customer_email) = '' THEN
    RAISE EXCEPTION 'E-Mail-Adresse ist erforderlich.' USING ERRCODE = 'check_violation';
  END IF;
  NEW.customer_email := lower(btrim(NEW.customer_email));
  IF NEW.customer_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[a-zA-Z]{2,}$' THEN
    RAISE EXCEPTION 'E-Mail-Adresse ist ungültig.' USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.rented_items IS NULL OR btrim(NEW.rented_items) = '' THEN
    RAISE EXCEPTION 'Angabe zum gemieteten Artikel ist erforderlich.' USING ERRCODE = 'check_violation';
  END IF;
  NEW.rented_items := btrim(NEW.rented_items);

  IF NEW.location IS NULL OR btrim(NEW.location) = '' THEN
    RAISE EXCEPTION 'Standort ist erforderlich.' USING ERRCODE = 'check_violation';
  END IF;

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
$function$;