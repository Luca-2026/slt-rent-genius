ALTER TABLE public.b2b_reservations ADD COLUMN IF NOT EXISTS order_code text;
CREATE INDEX IF NOT EXISTS b2b_reservations_order_code_idx ON public.b2b_reservations(order_code);

CREATE OR REPLACE FUNCTION public.generate_order_code()
RETURNS text LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
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
      AND NOT EXISTS (SELECT 1 FROM public.sales_inquiries WHERE order_code = code)
      AND NOT EXISTS (SELECT 1 FROM public.b2b_reservations WHERE order_code = code);
  END LOOP;
  RETURN code;
END;
$$;

-- Anfrage übernimmt bei Portalbuchungen die Auftrags-ID der Buchung
CREATE OR REPLACE FUNCTION public.assign_order_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_code text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'rental_inquiries' AND NEW.b2b_reservation_id IS NOT NULL THEN
      SELECT order_code INTO v_code FROM public.b2b_reservations WHERE id = NEW.b2b_reservation_id;
    END IF;
    NEW.order_code := COALESCE(v_code, public.generate_order_code());
  ELSE
    NEW.order_code := COALESCE(OLD.order_code, public.generate_order_code());
  END IF;
  RETURN NEW;
END;
$$;

-- Portalbuchung: eine ID je Auftrag (Buchungsgruppe teilt sich die ID)
CREATE OR REPLACE FUNCTION public.assign_reservation_order_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_code text;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.order_code IS NOT NULL THEN
    NEW.order_code := OLD.order_code;
    RETURN NEW;
  END IF;
  IF NEW.rental_group_id IS NOT NULL THEN
    SELECT order_code INTO v_code FROM public.b2b_reservations
      WHERE rental_group_id = NEW.rental_group_id AND order_code IS NOT NULL AND id <> NEW.id LIMIT 1;
  END IF;
  NEW.order_code := COALESCE(v_code, public.generate_order_code());
  RETURN NEW;
END;
$$;

-- Bestand: bereits verknüpfte Buchungen übernehmen die ID ihrer Anfrage
UPDATE public.b2b_reservations r SET order_code = i.order_code
  FROM public.rental_inquiries i WHERE i.id = r.inquiry_id AND r.order_code IS NULL;
UPDATE public.b2b_reservations r SET order_code = g.order_code
  FROM (SELECT DISTINCT ON (rental_group_id) rental_group_id, order_code FROM public.b2b_reservations
        WHERE order_code IS NOT NULL AND rental_group_id IS NOT NULL) g
  WHERE r.rental_group_id = g.rental_group_id AND r.order_code IS NULL;
UPDATE public.b2b_reservations SET order_code = public.generate_order_code()
  WHERE order_code IS NULL AND rental_group_id IS NULL;
UPDATE public.b2b_reservations r SET order_code = g.code
  FROM (SELECT rental_group_id, public.generate_order_code() AS code FROM public.b2b_reservations
        WHERE order_code IS NULL GROUP BY rental_group_id) g
  WHERE r.rental_group_id = g.rental_group_id AND r.order_code IS NULL;

DROP TRIGGER IF EXISTS trg_assign_order_code ON public.b2b_reservations;
CREATE TRIGGER trg_assign_order_code BEFORE INSERT OR UPDATE OF order_code ON public.b2b_reservations
  FOR EACH ROW EXECUTE FUNCTION public.assign_reservation_order_code();
REVOKE EXECUTE ON FUNCTION public.generate_order_code() FROM anon, authenticated, public;
COMMENT ON COLUMN public.b2b_reservations.order_code IS 'Auftrags-ID (6 Zeichen, unveränderlich), je Buchungsgruppe gleich; Anfrage übernimmt sie';