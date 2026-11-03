CREATE OR REPLACE FUNCTION public.assign_order_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_code text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'rental_inquiries' THEN
      IF NEW.b2b_reservation_id IS NOT NULL THEN
        SELECT order_code INTO v_code FROM public.b2b_reservations WHERE id = NEW.b2b_reservation_id;
      END IF;
    END IF;
    NEW.order_code := COALESCE(v_code, public.generate_order_code());
  ELSE
    NEW.order_code := COALESCE(OLD.order_code, public.generate_order_code());
  END IF;
  RETURN NEW;
END;
$$;