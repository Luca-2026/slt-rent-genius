
CREATE SEQUENCE IF NOT EXISTS public.b2b_rental_invoice_number_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  next_val integer;
  current_year text;
BEGIN
  next_val := nextval('public.b2b_rental_invoice_number_seq');
  current_year := to_char(now(), 'YYYY');
  RETURN 'SLT-B2B-RNT-' || current_year || '-' || lpad(next_val::text, 4, '0');
END;
$function$;
