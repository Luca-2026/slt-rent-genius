CREATE TABLE public.manual_rental_coupons (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL DEFAULT upper(encode(gen_random_bytes(10),'hex')) UNIQUE,
 customer_key text NOT NULL, customer_email text NOT NULL, crm_customer_id uuid NOT NULL REFERENCES public.crm_customers(id), b2b_profile_id uuid,
 discount_percent numeric NOT NULL CHECK(discount_percent>0 AND discount_percent<=20),
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','reserved','redeemed','blocked')),
 reserved_kind text, reserved_order_id uuid, reserved_offer_number text, reserved_until timestamptz, redeemed_at timestamptz, block_reason text,
 issued_by uuid NOT NULL, issue_reason text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.manual_rental_coupons TO authenticated;
GRANT ALL ON public.manual_rental_coupons TO service_role;
ALTER TABLE public.manual_rental_coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY manual_coupon_staff_read ON public.manual_rental_coupons FOR SELECT TO authenticated USING(public.is_staff_member(auth.uid()));
CREATE POLICY manual_coupon_customer_read ON public.manual_rental_coupons FOR SELECT TO authenticated USING(b2b_profile_id IN (SELECT public.get_b2b_profile_id_for_user(auth.uid()) UNION SELECT public.get_authorized_profile_ids(auth.uid())));
CREATE TABLE public.manual_rental_coupon_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), coupon_id uuid NOT NULL REFERENCES public.manual_rental_coupons(id), event text NOT NULL, order_id uuid, actor uuid, note text, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.manual_rental_coupon_events TO authenticated;
GRANT ALL ON public.manual_rental_coupon_events TO service_role;
ALTER TABLE public.manual_rental_coupon_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY manual_coupon_events_staff_read ON public.manual_rental_coupon_events FOR SELECT TO authenticated USING(public.is_staff_member(auth.uid()));
CREATE FUNCTION public.can_issue_rental_coupon() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT auth.uid() IS NOT NULL AND (public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'niederlassungsleiter') AND EXISTS(SELECT 1 FROM public.staff_profiles WHERE user_id=auth.uid() AND is_active=true)))
$$;
REVOKE ALL ON FUNCTION public.can_issue_rental_coupon() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.can_issue_rental_coupon() TO authenticated,service_role;
CREATE FUNCTION public.issue_manual_rental_coupon(p_customer uuid,p_percent numeric,p_reason text) RETURNS public.manual_rental_coupons LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE customer public.crm_customers; identity jsonb; coupon public.manual_rental_coupons;
BEGIN
 IF NOT public.can_issue_rental_coupon() THEN RAISE EXCEPTION 'Keine Berechtigung zur Gutscheinvergabe' USING ERRCODE='42501'; END IF;
 IF p_percent IS NULL OR p_percent<=0 OR p_percent>20 THEN RAISE EXCEPTION 'Rabatt muss größer 0 und höchstens 20 Prozent sein'; END IF;
 IF p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 5 AND 500 THEN RAISE EXCEPTION 'Vergabegrund mit 5 bis 500 Zeichen erforderlich'; END IF;
 SELECT * INTO customer FROM public.crm_customers WHERE id=p_customer;
 IF NOT FOUND THEN RAISE EXCEPTION 'Kundenakte fehlt'; END IF;
 identity:=public.feedback_customer_identity(customer.id,customer.b2b_profile_id,customer.email);
 INSERT INTO public.manual_rental_coupons(customer_key,customer_email,crm_customer_id,b2b_profile_id,discount_percent,issued_by,issue_reason)
 VALUES(identity->>'key',identity->>'email',customer.id,customer.b2b_profile_id,p_percent,auth.uid(),btrim(p_reason)) RETURNING * INTO coupon;
 IF EXISTS(SELECT 1 FROM public.rental_feedback_coupons WHERE code=coupon.code) THEN RAISE EXCEPTION 'Codekonflikt, bitte erneut versuchen'; END IF;
 INSERT INTO public.manual_rental_coupon_events(coupon_id,event,actor,note) VALUES(coupon.id,'issued',auth.uid(),btrim(p_reason));
 RETURN coupon;
END $$;
REVOKE ALL ON FUNCTION public.issue_manual_rental_coupon(uuid,numeric,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.issue_manual_rental_coupon(uuid,numeric,text) TO authenticated;
CREATE FUNCTION public.manual_coupon_action(p_code text,p_action text,p_kind text,p_order uuid,p_profile uuid,p_offer text,p_until timestamptz) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.manual_rental_coupons; r public.rental_inquiries; prof public.b2b_profiles; identity jsonb;
BEGIN
 SELECT * INTO c FROM public.manual_rental_coupons WHERE code=upper(btrim(p_code)) FOR UPDATE;
 IF NOT FOUND THEN RETURN NULL; END IF;
 IF p_action='redeem' THEN
  IF c.status<>'reserved' OR c.reserved_kind IS DISTINCT FROM p_kind OR c.reserved_order_id IS DISTINCT FROM p_order OR c.reserved_offer_number IS DISTINCT FROM p_offer OR c.reserved_until IS NULL OR c.reserved_until<now() THEN RAISE EXCEPTION 'Gutscheinreservierung nicht mehr gültig'; END IF;
  UPDATE public.manual_rental_coupons SET status='redeemed',redeemed_at=now(),updated_at=now() WHERE id=c.id;
  INSERT INTO public.manual_rental_coupon_events(coupon_id,event,order_id,actor,note) VALUES(c.id,'redeemed',p_order,auth.uid(),p_offer);
  RETURN jsonb_build_object('id',c.id);
 END IF;
 IF p_kind='inquiry' THEN
  SELECT * INTO r FROM public.rental_inquiries WHERE id=p_order;
  IF NOT FOUND THEN RAISE EXCEPTION 'Auftrag fehlt'; END IF;
  IF r.status IN ('accepted','done','rejected') OR r.offer_accepted_at IS NOT NULL THEN RAISE EXCEPTION 'Gutschein gilt nur für einen neuen Mietauftrag'; END IF;
  identity:=public.feedback_customer_identity(r.crm_customer_id,r.b2b_profile_id,r.customer_email);
 ELSIF p_kind='portal' THEN
  SELECT * INTO prof FROM public.b2b_profiles WHERE id=p_profile;
  IF NOT FOUND THEN RAISE EXCEPTION 'Kunde fehlt'; END IF;
  IF EXISTS(SELECT 1 FROM public.b2b_offers WHERE id=p_order AND status='accepted') THEN RAISE EXCEPTION 'Gutschein gilt nur für einen neuen Mietauftrag'; END IF;
  identity:=public.feedback_customer_identity(NULL,prof.id,coalesce(nullif(prof.billing_email,''),prof.contact_email));
 ELSE RAISE EXCEPTION 'Ungültiger Mietauftrag'; END IF;
 IF c.customer_key IS DISTINCT FROM identity->>'key' OR c.customer_email IS DISTINCT FROM identity->>'email' THEN RAISE EXCEPTION 'Gutschein gehört zu einem anderen Kunden'; END IF;
 IF c.status IN ('redeemed','blocked') THEN RAISE EXCEPTION 'Gutschein ist bereits eingelöst oder gesperrt'; END IF;
 IF c.status='reserved' AND (c.reserved_order_id IS DISTINCT FROM p_order OR c.reserved_kind IS DISTINCT FROM p_kind) AND (c.reserved_until IS NULL OR c.reserved_until>=now()) THEN RAISE EXCEPTION 'Gutschein ist in einem anderen Angebot reserviert'; END IF;
 IF p_action='reserve' THEN
  IF p_offer IS NULL OR p_until IS NULL OR p_until<=now() THEN RAISE EXCEPTION 'Angebotsgültigkeit fehlt'; END IF;
  IF c.status='reserved' AND c.reserved_until<now() THEN INSERT INTO public.manual_rental_coupon_events(coupon_id,event,order_id) VALUES(c.id,'released_expired',c.reserved_order_id); END IF;
  UPDATE public.manual_rental_coupons SET status='reserved',reserved_kind=p_kind,reserved_order_id=p_order,reserved_offer_number=p_offer,reserved_until=p_until,updated_at=now() WHERE id=c.id;
  INSERT INTO public.manual_rental_coupon_events(coupon_id,event,order_id,actor,note) VALUES(c.id,'reserved',p_order,auth.uid(),p_offer);
 ELSIF p_action<>'check' THEN RAISE EXCEPTION 'Ungültige Gutscheinaktion'; END IF;
 RETURN jsonb_build_object('id',c.id,'code',c.code,'discount_percent',c.discount_percent);
END $$;
REVOKE ALL ON FUNCTION public.manual_coupon_action(text,text,text,uuid,uuid,text,timestamptz) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.manual_coupon_action(text,text,text,uuid,uuid,text,timestamptz) TO service_role;
DO $migration$
DECLARE fn record; definition text; insertion text;
BEGIN
 FOR fn IN SELECT p.oid,p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('check_rental_coupon','reserve_rental_coupon','redeem_reserved_rental_coupon') LOOP
  definition:=pg_get_functiondef(fn.oid);
  insertion:=CASE fn.proname
   WHEN 'check_rental_coupon' THEN 'IF EXISTS(SELECT 1 FROM public.manual_rental_coupons WHERE code=upper(btrim(p_code))) THEN RETURN public.manual_coupon_action(p_code,''check'',p_kind,p_order,p_profile,NULL,NULL); END IF;'
   WHEN 'reserve_rental_coupon' THEN 'IF EXISTS(SELECT 1 FROM public.manual_rental_coupons WHERE code=upper(btrim(p_code))) THEN PERFORM public.manual_coupon_action(p_code,''reserve'',p_kind,p_order,p_profile,p_offer,p_until); RETURN; END IF;'
   ELSE 'IF EXISTS(SELECT 1 FROM public.manual_rental_coupons WHERE code=upper(btrim(p_code))) THEN PERFORM public.manual_coupon_action(p_code,''redeem'',p_kind,p_order,NULL,p_offer,NULL); RETURN; END IF;' END;
  EXECUTE regexp_replace(definition,'BEGIN', 'BEGIN '||insertion);
 END LOOP;
END $migration$;
CREATE OR REPLACE FUNCTION public.guard_feedback_coupon_write() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE old_code text; new_code text;
BEGIN
 IF TG_OP='UPDATE' THEN old_code:=OLD.feedback_coupon_code; END IF;
 new_code:=NEW.feedback_coupon_code;
 IF new_code IS DISTINCT FROM old_code AND coalesce(auth.role(),'')<>'service_role' THEN RAISE EXCEPTION 'Gutscheinzuordnung nur über geprüfte Angebotserstellung'; END IF;
 IF TG_TABLE_NAME='rental_inquiries' AND TG_OP='UPDATE' AND new_code IS NOT NULL AND NEW.status='accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
  IF NOT EXISTS(SELECT 1 FROM public.rental_feedback_coupons WHERE code=new_code AND status='redeemed' AND reserved_kind='inquiry' AND reserved_order_id=NEW.id AND reserved_offer_number=NEW.offer_number) AND NOT EXISTS(SELECT 1 FROM public.manual_rental_coupons WHERE code=new_code AND status='redeemed' AND reserved_kind='inquiry' AND reserved_order_id=NEW.id AND reserved_offer_number=NEW.offer_number) THEN RAISE EXCEPTION 'Gutscheinangebot muss über die geprüfte Angebotsannahme bestätigt werden'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE FUNCTION public.block_manual_rental_coupon(p_coupon uuid,p_reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.manual_rental_coupons;
BEGIN
 IF NOT public.can_issue_rental_coupon() THEN RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE='42501'; END IF;
 IF p_reason IS NULL OR length(btrim(p_reason)) NOT BETWEEN 5 AND 500 THEN RAISE EXCEPTION 'Bitte Sperrgrund angeben'; END IF;
 SELECT * INTO c FROM public.manual_rental_coupons WHERE id=p_coupon FOR UPDATE;
 IF NOT FOUND OR c.status NOT IN ('active','reserved') THEN RAISE EXCEPTION 'Dieser Gutschein kann nicht gesperrt werden'; END IF;
 UPDATE public.manual_rental_coupons SET status='blocked',block_reason=btrim(p_reason),updated_at=now() WHERE id=c.id;
 INSERT INTO public.manual_rental_coupon_events(coupon_id,event,actor,note) VALUES(c.id,'blocked',auth.uid(),btrim(p_reason));
END $$;
REVOKE ALL ON FUNCTION public.block_manual_rental_coupon(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.block_manual_rental_coupon(uuid,text) TO authenticated;