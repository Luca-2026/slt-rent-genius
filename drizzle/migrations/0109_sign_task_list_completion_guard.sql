CREATE OR REPLACE FUNCTION public.guard_sign_list_completion() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.sign_booking_id IS NOT NULL AND NEW.status='done' AND OLD.status<>'done' AND EXISTS(SELECT 1 FROM public.sign_bookings WHERE id=NEW.sign_booking_id AND status<>'expired') AND (NOT EXISTS(SELECT 1 FROM public.staff_todo_items WHERE list_id=NEW.id) OR EXISTS(SELECT 1 FROM public.staff_todo_items WHERE list_id=NEW.id AND NOT is_done)) THEN RAISE EXCEPTION 'Zuerst Genehmigungsprüfung, Aufstellung und Abbau abschließen' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_sign_list_completion() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER guard_sign_list_completion BEFORE UPDATE OF status ON public.staff_todo_lists FOR EACH ROW EXECUTE FUNCTION public.guard_sign_list_completion();