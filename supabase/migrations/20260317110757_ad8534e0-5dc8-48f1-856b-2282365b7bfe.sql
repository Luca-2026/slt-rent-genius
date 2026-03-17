
CREATE OR REPLACE FUNCTION public.reset_invoice_sequence_if_empty()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  max_num integer;
BEGIN
  SELECT MAX(
    CAST(
      SUBSTRING(invoice_number FROM '\d+$') AS integer
    )
  ) INTO max_num
  FROM public.b2b_invoices;

  IF max_num IS NULL THEN
    ALTER SEQUENCE public.b2b_rental_invoice_number_seq RESTART WITH 1;
  ELSE
    EXECUTE format('ALTER SEQUENCE public.b2b_rental_invoice_number_seq RESTART WITH %s', max_num + 1);
  END IF;

  RETURN NULL;
END;
$function$;

-- Ensure trigger exists on delete
DROP TRIGGER IF EXISTS trg_reset_invoice_seq ON public.b2b_invoices;
CREATE TRIGGER trg_reset_invoice_seq
  AFTER DELETE ON public.b2b_invoices
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.reset_invoice_sequence_if_empty();
