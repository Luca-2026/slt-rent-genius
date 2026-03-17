
CREATE OR REPLACE FUNCTION public.reset_offer_sequence_after_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  max_num integer;
  extracted text;
BEGIN
  -- Extract the numeric suffix from the highest remaining offer number
  SELECT MAX(
    CAST(
      SUBSTRING(offer_number FROM '\d+$') AS integer
    )
  ) INTO max_num
  FROM public.b2b_offers;

  IF max_num IS NULL THEN
    -- No offers left, reset to 1
    ALTER SEQUENCE public.offer_number_seq RESTART WITH 1;
  ELSE
    -- Reset to max + 1 so next offer continues from there
    EXECUTE format('ALTER SEQUENCE public.offer_number_seq RESTART WITH %s', max_num + 1);
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_reset_offer_seq_after_delete
  AFTER DELETE ON public.b2b_offers
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.reset_offer_sequence_after_delete();
