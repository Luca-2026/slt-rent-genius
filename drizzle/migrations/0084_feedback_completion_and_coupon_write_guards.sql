CREATE OR REPLACE FUNCTION public.ensure_rental_feedback_invitation(p_kind text,p_invoice uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE i public.inquiry_invoices; r public.rental_inquiries; b public.b2b_invoices; res public.b2b_reservations; prof public.b2b_profiles; inv public.rental_feedback_invitations; identity jsonb; ref text; loc text; items text; name text; order_id uuid; crm uuid; profile uuid; email text;
BEGIN
 IF p_kind='inquiry' THEN
  SELECT * INTO i FROM public.inquiry_invoices WHERE id=p_invoice; IF NOT FOUND OR i.inquiry_type<>'rental' OR i.invoice_kind NOT IN ('invoice','final') OR i.status IN ('draft','cancelled') OR coalesce(i.credited_amount,0)>=i.gross_amount THEN RETURN NULL; END IF;
  SELECT * INTO r FROM public.rental_inquiries WHERE id=i.rental_inquiry_id;
  IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM public.b2b_return_protocols WHERE rental_inquiry_id=r.id AND status IN ('signed','signed_staff_only')) THEN RETURN NULL; END IF;
  order_id:=r.id; crm:=coalesce(i.crm_customer_id,r.crm_customer_id); profile:=r.b2b_profile_id; email:=i.customer_email; ref:=coalesce(r.order_code,i.invoice_number); loc:=public.slt_normalize_location(r.location); items:=r.product_name; name:=i.customer_name;
 ELSEIF p_kind='portal' THEN
  SELECT * INTO b FROM public.b2b_invoices WHERE id=p_invoice; IF NOT FOUND OR b.invoice_kind NOT IN ('invoice','final') OR b.status IN ('draft','cancelled') OR coalesce(b.credited_amount,0)>=b.gross_amount THEN RETURN NULL; END IF;
  SELECT * INTO res FROM public.b2b_reservations WHERE id=b.reservation_id;
  IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM public.b2b_return_protocols WHERE reservation_id=res.id AND status IN ('signed','signed_staff_only')) THEN RETURN NULL; END IF;
  SELECT * INTO prof FROM public.b2b_profiles WHERE id=b.b2b_profile_id;
  order_id:=res.id; profile:=prof.id; email:=coalesce(nullif(prof.billing_email,''),prof.contact_email); ref:=coalesce(res.order_code,b.invoice_number); loc:=public.slt_normalize_location(res.location); items:=res.product_name; name:=concat_ws(' ',prof.contact_first_name,prof.contact_last_name);
 ELSE RAISE EXCEPTION 'Ungültige Rechnungsart'; END IF;
 identity:=public.feedback_customer_identity(crm,profile,email);
 INSERT INTO public.rental_feedback_invitations(customer_key,customer_email,crm_customer_id,b2b_profile_id,source_kind,source_order_id,invoice_id,order_ref,location,rented_items,customer_name)
 VALUES(identity->>'key',identity->>'email',crm,profile,p_kind,order_id,p_invoice,ref,coalesce(loc,'krefeld'),coalesce(nullif(items,''),'Mietauftrag'),name) ON CONFLICT(source_kind,source_order_id) DO NOTHING;
 SELECT * INTO inv FROM public.rental_feedback_invitations WHERE source_kind=p_kind AND source_order_id=order_id;
 IF inv.customer_key<>identity->>'key' OR inv.customer_email<>identity->>'email' THEN RAISE EXCEPTION 'Feedback-Kundenidentität muss geklärt werden'; END IF;
 RETURN jsonb_build_object('token',inv.token,'id',inv.id);
END $$;
CREATE FUNCTION public.guard_feedback_coupon_write() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE old_code text; new_code text;
BEGIN
 IF TG_OP='UPDATE' THEN old_code:=OLD.feedback_coupon_code; END IF;
 new_code:=NEW.feedback_coupon_code;
 IF new_code IS DISTINCT FROM old_code AND coalesce(auth.role(),'')<>'service_role' THEN RAISE EXCEPTION 'Gutscheinzuordnung nur über geprüfte Angebotserstellung'; END IF;
 IF TG_TABLE_NAME='rental_inquiries' AND TG_OP='UPDATE' AND new_code IS NOT NULL AND NEW.status='accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
  IF NOT EXISTS(SELECT 1 FROM public.rental_feedback_coupons WHERE code=new_code AND status='redeemed' AND reserved_kind='inquiry' AND reserved_order_id=NEW.id AND reserved_offer_number=NEW.offer_number) THEN RAISE EXCEPTION 'Gutscheinangebot muss über die geprüfte Angebotsannahme bestätigt werden'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER feedback_coupon_inquiry_write BEFORE INSERT OR UPDATE ON public.rental_inquiries FOR EACH ROW EXECUTE FUNCTION public.guard_feedback_coupon_write();
CREATE TRIGGER feedback_coupon_offer_write BEFORE INSERT OR UPDATE ON public.b2b_offers FOR EACH ROW EXECUTE FUNCTION public.guard_feedback_coupon_write();
CREATE OR REPLACE FUNCTION public.guard_feedback_coupon_acceptance() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE code text; current_number text;
BEGIN
 IF TG_TABLE_NAME='offer_acceptance_links' THEN
  IF NEW.status='accepted' AND OLD.status IS DISTINCT FROM 'accepted' AND NEW.inquiry_table='rental_inquiries' THEN
   SELECT feedback_coupon_code,offer_number INTO code,current_number FROM public.rental_inquiries WHERE id=NEW.inquiry_id;
   IF code IS NOT NULL THEN
    IF current_number IS DISTINCT FROM NEW.offer_number THEN RAISE EXCEPTION 'Angebotsfassung nicht mehr aktuell'; END IF;
    PERFORM public.redeem_reserved_rental_coupon(code,'inquiry',NEW.inquiry_id,NEW.offer_number);
   END IF;
  END IF;
 ELSE
  IF NEW.status='accepted' AND OLD.status IS DISTINCT FROM 'accepted' AND NEW.feedback_coupon_code IS NOT NULL THEN
   PERFORM public.redeem_reserved_rental_coupon(NEW.feedback_coupon_code,'portal',NEW.id,NEW.offer_number);
  END IF;
 END IF;
 RETURN NEW;
END $$;