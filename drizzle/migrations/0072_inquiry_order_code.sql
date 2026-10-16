ALTER TABLE public.rental_inquiries ADD COLUMN IF NOT EXISTS order_code text;
ALTER TABLE public.sales_inquiries ADD COLUMN IF NOT EXISTS order_code text;

CREATE OR REPLACE FUNCTION public.generate_order_code()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
  i int;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.rental_inquiries WHERE order_code = code)
      AND NOT EXISTS (SELECT 1 FROM public.sales_inquiries WHERE order_code = code);
  END LOOP;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_order_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.order_code := public.generate_order_code();
  ELSE
    NEW.order_code := OLD.order_code;
    IF NEW.order_code IS NULL THEN NEW.order_code := public.generate_order_code(); END IF;
  END IF;
  RETURN NEW;
END;
$$;

UPDATE public.rental_inquiries SET order_code = public.generate_order_code() WHERE order_code IS NULL;
UPDATE public.sales_inquiries SET order_code = public.generate_order_code() WHERE order_code IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS rental_inquiries_order_code_key ON public.rental_inquiries(order_code);
CREATE UNIQUE INDEX IF NOT EXISTS sales_inquiries_order_code_key ON public.sales_inquiries(order_code);

DROP TRIGGER IF EXISTS trg_assign_order_code ON public.rental_inquiries;
CREATE TRIGGER trg_assign_order_code BEFORE INSERT OR UPDATE OF order_code ON public.rental_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.assign_order_code();
DROP TRIGGER IF EXISTS trg_assign_order_code ON public.sales_inquiries;
CREATE TRIGGER trg_assign_order_code BEFORE INSERT OR UPDATE OF order_code ON public.sales_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.assign_order_code();

REVOKE EXECUTE ON FUNCTION public.generate_order_code() FROM anon, authenticated, public;
COMMENT ON COLUMN public.rental_inquiries.order_code IS 'Auftrags-ID (6 Zeichen, unveränderlich), Anzeige mit #';
COMMENT ON COLUMN public.sales_inquiries.order_code IS 'Auftrags-ID (6 Zeichen, unveränderlich), Anzeige mit #';