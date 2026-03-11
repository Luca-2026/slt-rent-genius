
-- Create a trigger function that resets the invoice number sequence when the table is empty
CREATE OR REPLACE FUNCTION public.reset_invoice_sequence_if_empty()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.b2b_invoices LIMIT 1) THEN
    -- Reset the sequence to start from 1 again
    ALTER SEQUENCE public.b2b_rental_invoice_number_seq RESTART WITH 1;
  END IF;
  RETURN NULL;
END;
$$;

-- Create the trigger on DELETE
CREATE TRIGGER trg_reset_invoice_seq_on_empty
AFTER DELETE ON public.b2b_invoices
FOR EACH STATEMENT
EXECUTE FUNCTION public.reset_invoice_sequence_if_empty();
