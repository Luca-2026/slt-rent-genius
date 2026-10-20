CREATE FUNCTION public.guard_coupon_reservation() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE invite public.rental_feedback_invitations;
BEGIN
 IF NEW.status='reserved' THEN
  SELECT * INTO invite FROM public.rental_feedback_invitations WHERE id=NEW.invitation_id;
  IF invite.source_kind=NEW.reserved_kind AND invite.source_order_id=NEW.reserved_order_id THEN RAISE EXCEPTION 'Gutschein gilt erst für die nächste Miete, nicht für den Feedback-Auftrag'; END IF;
  IF NEW.reserved_kind='inquiry' AND EXISTS(SELECT 1 FROM public.rental_inquiries WHERE id=NEW.reserved_order_id AND (status IN ('accepted','done','rejected') OR offer_accepted_at IS NOT NULL)) THEN RAISE EXCEPTION 'Gutschein kann nicht nachträglich auf einen abgeschlossenen oder angenommenen Auftrag angewendet werden'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER coupon_next_rental_guard BEFORE UPDATE ON public.rental_feedback_coupons FOR EACH ROW EXECUTE FUNCTION public.guard_coupon_reservation();
CREATE FUNCTION public.list_rental_feedback_invitations() RETURNS TABLE(id uuid,customer_email text,order_ref text,location text,created_at timestamptz,submitted_at timestamptz,source_kind text,source_order_id uuid,invoice_id uuid) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT i.id,i.customer_email,i.order_ref,i.location,i.created_at,i.submitted_at,i.source_kind,i.source_order_id,i.invoice_id FROM public.rental_feedback_invitations i WHERE public.is_staff_member(auth.uid()) ORDER BY i.created_at DESC;
$$;
REVOKE ALL ON FUNCTION public.list_rental_feedback_invitations() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.list_rental_feedback_invitations() TO authenticated,service_role;