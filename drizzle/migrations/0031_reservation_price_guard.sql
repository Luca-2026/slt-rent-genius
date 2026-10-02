CREATE OR REPLACE FUNCTION public.guard_b2b_reservation_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Customers never set prices or status themselves; staff/admin set them later.
  IF auth.uid() IS NOT NULL
     AND NOT public.has_role(auth.uid(), 'admin')
     AND NOT public.is_staff_member(auth.uid()) THEN
    NEW.original_price := NULL;
    NEW.discounted_price := NULL;
    NEW.deposit := NULL;
    NEW.status := 'pending';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_b2b_reservation_insert ON public.b2b_reservations;
CREATE TRIGGER trg_guard_b2b_reservation_insert
BEFORE INSERT ON public.b2b_reservations
FOR EACH ROW EXECUTE FUNCTION public.guard_b2b_reservation_insert();

REVOKE EXECUTE ON FUNCTION public.guard_b2b_reservation_insert() FROM PUBLIC, anon, authenticated;