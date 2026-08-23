CREATE SEQUENCE IF NOT EXISTS public.inquiry_offer_number_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.generate_inquiry_offer_number()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  next_val integer;
BEGIN
  next_val := nextval('public.inquiry_offer_number_seq');
  RETURN 'ANG-A-' || to_char(now(), 'YYYY') || '-' || lpad(next_val::text, 4, '0');
END;
$function$;

REVOKE ALL ON FUNCTION public.generate_inquiry_offer_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_inquiry_offer_number() TO service_role;