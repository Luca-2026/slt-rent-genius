CREATE FUNCTION public.guard_rental_additional_payout() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Auszahlungsnachweise dürfen nicht gelöscht werden'; END IF;
IF TG_OP='INSERT' THEN
-- Every compensation transfer is separate from received funds; require explicit approval even below the absolute Stripe cap.
NEW.approval_required:=true; NEW.status:='requested'; NEW.approved_by:=NULL; NEW.approved_at:=NULL; NEW.paid_by:=NULL; NEW.paid_at:=NULL; NEW.transfer_reference:=NULL;
ELSE
IF (to_jsonb(NEW)-ARRAY['status','approved_by','approved_at','decision_note','paid_by','paid_at','transfer_reference']) IS DISTINCT FROM (to_jsonb(OLD)-ARRAY['status','approved_by','approved_at','decision_note','paid_by','paid_at','transfer_reference']) THEN RAISE EXCEPTION 'Betrag und Empfänger des Antrags sind unveränderlich'; END IF;
IF OLD.status IN ('paid','rejected') AND to_jsonb(NEW) IS DISTINCT FROM to_jsonb(OLD) THEN RAISE EXCEPTION 'Abgeschlossene Auszahlung ist unveränderlich'; END IF;
IF NEW.status IN ('approved','rejected') AND OLD.status='requested' THEN
 IF NOT public.can_approve_rental_payout(auth.uid()) OR NEW.approved_by IS DISTINCT FROM auth.uid() OR NEW.approved_at IS NULL THEN RAISE EXCEPTION 'Freigabe nur durch berechtigten Superadmin' USING ERRCODE='42501'; END IF;
ELSIF NEW.status='paid' AND OLD.status='approved' THEN
 IF NEW.approved_by IS DISTINCT FROM OLD.approved_by OR NEW.approved_at IS DISTINCT FROM OLD.approved_at OR NEW.decision_note IS DISTINCT FROM OLD.decision_note OR NEW.paid_by IS DISTINCT FROM auth.uid() OR NOT public.can_edit_operations(auth.uid()) OR NEW.paid_at IS NULL OR length(btrim(coalesce(NEW.transfer_reference,'')))<5 THEN RAISE EXCEPTION 'Freigabe und Zahlungsnachweis erforderlich'; END IF;
ELSE RAISE EXCEPTION 'Ungültiger Auszahlungsstatuswechsel'; END IF;
END IF;
RETURN NEW;
END $$;
CREATE TRIGGER guard_rental_additional_payout BEFORE INSERT OR UPDATE OR DELETE ON public.rental_additional_payouts FOR EACH ROW EXECUTE FUNCTION public.guard_rental_additional_payout();
CREATE FUNCTION public.guard_payout_event_append_only() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Auszahlungsverlauf ist unveränderlich'; END $$;
CREATE TRIGGER payout_event_append_only BEFORE UPDATE OR DELETE ON public.rental_additional_payout_events FOR EACH ROW EXECUTE FUNCTION public.guard_payout_event_append_only();