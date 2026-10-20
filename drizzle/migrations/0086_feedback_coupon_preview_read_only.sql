CREATE OR REPLACE FUNCTION public.check_rental_coupon(p_code text,p_kind text,p_order uuid,p_profile uuid DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.rental_feedback_coupons; r public.rental_inquiries; prof public.b2b_profiles; identity jsonb;
BEGIN
 SELECT * INTO c FROM public.rental_feedback_coupons WHERE code=upper(btrim(p_code)) FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Gutschein nicht gefunden'; END IF;
 IF p_kind='inquiry' THEN
  SELECT * INTO r FROM public.rental_inquiries WHERE id=p_order; IF NOT FOUND THEN RAISE EXCEPTION 'Auftrag fehlt'; END IF;
  IF r.status IN ('accepted','done','rejected') OR r.offer_accepted_at IS NOT NULL THEN RAISE EXCEPTION 'Gutschein gilt nur für einen neuen Mietauftrag'; END IF;
  identity:=public.feedback_customer_identity(r.crm_customer_id,r.b2b_profile_id,r.customer_email);
 ELSEIF p_kind='portal' THEN
  SELECT * INTO prof FROM public.b2b_profiles WHERE id=p_profile; IF NOT FOUND THEN RAISE EXCEPTION 'Kunde fehlt'; END IF;
  IF EXISTS(SELECT 1 FROM public.b2b_offers WHERE id=p_order AND status='accepted') THEN RAISE EXCEPTION 'Gutschein gilt nur für einen neuen Mietauftrag'; END IF;
  identity:=public.feedback_customer_identity(NULL,prof.id,coalesce(nullif(prof.billing_email,''),prof.contact_email));
 ELSE RAISE EXCEPTION 'Ungültiger Mietauftrag'; END IF;
 IF c.customer_key<>identity->>'key' OR c.customer_email<>identity->>'email' THEN RAISE EXCEPTION 'Gutschein gehört zu einem anderen Kunden oder Rechnungsadresse muss geklärt werden'; END IF;
 IF c.status IN ('redeemed','blocked') THEN RAISE EXCEPTION 'Gutschein ist bereits eingelöst oder gesperrt'; END IF;
 IF c.status='reserved' AND (c.reserved_order_id IS DISTINCT FROM p_order OR c.reserved_kind IS DISTINCT FROM p_kind) AND (c.reserved_until IS NULL OR c.reserved_until>=now()) THEN RAISE EXCEPTION 'Gutschein ist bereits in einem anderen Angebot reserviert'; END IF;
 RETURN jsonb_build_object('id',c.id,'code',c.code,'discount_percent',10);
END $$;