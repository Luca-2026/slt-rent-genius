CREATE TABLE public.rental_feedback_invitations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), token text NOT NULL DEFAULT encode(gen_random_bytes(32),'hex') UNIQUE,
 customer_key text NOT NULL, customer_email text NOT NULL, crm_customer_id uuid, b2b_profile_id uuid,
 source_kind text NOT NULL CHECK(source_kind IN ('inquiry','portal')), source_order_id uuid NOT NULL,
 invoice_id uuid NOT NULL, order_ref text NOT NULL, location text NOT NULL, rented_items text NOT NULL,
 customer_name text, feedback_id uuid REFERENCES public.customer_feedback(id), created_at timestamptz NOT NULL DEFAULT now(), submitted_at timestamptz,
 UNIQUE(source_kind,source_order_id)
);
GRANT ALL ON public.rental_feedback_invitations TO service_role;
ALTER TABLE public.rental_feedback_invitations ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.rental_feedback_coupons (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL DEFAULT upper(encode(gen_random_bytes(10),'hex')) UNIQUE,
 customer_key text NOT NULL UNIQUE, customer_email text NOT NULL UNIQUE, crm_customer_id uuid, b2b_profile_id uuid,
 invitation_id uuid NOT NULL REFERENCES public.rental_feedback_invitations(id) UNIQUE, feedback_id uuid NOT NULL REFERENCES public.customer_feedback(id),
 discount_percent numeric NOT NULL DEFAULT 10 CHECK(discount_percent=10),
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','reserved','redeemed','blocked')),
 reserved_kind text, reserved_order_id uuid, reserved_offer_number text, reserved_until timestamptz,
 redeemed_at timestamptz, block_reason text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rental_feedback_coupons TO authenticated;
GRANT ALL ON public.rental_feedback_coupons TO service_role;
ALTER TABLE public.rental_feedback_coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY coupon_staff_read ON public.rental_feedback_coupons FOR SELECT TO authenticated USING(public.is_staff_member(auth.uid()));
CREATE POLICY coupon_customer_read ON public.rental_feedback_coupons FOR SELECT TO authenticated USING(b2b_profile_id IN (SELECT public.get_b2b_profile_id_for_user(auth.uid()) UNION SELECT public.get_authorized_profile_ids(auth.uid())));
CREATE TABLE public.rental_coupon_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), coupon_id uuid NOT NULL REFERENCES public.rental_feedback_coupons(id),
 event text NOT NULL, order_id uuid, actor uuid, note text, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rental_coupon_events TO authenticated;
GRANT ALL ON public.rental_coupon_events TO service_role;
ALTER TABLE public.rental_coupon_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY coupon_events_staff_read ON public.rental_coupon_events FOR SELECT TO authenticated USING(public.is_staff_member(auth.uid()));
ALTER TABLE public.rental_inquiries ADD COLUMN feedback_coupon_code text;
ALTER TABLE public.b2b_offers ADD COLUMN feedback_coupon_code text;

CREATE FUNCTION public.feedback_customer_identity(p_crm uuid,p_profile uuid,p_email text) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.crm_customers; email text:=lower(btrim(p_email)); profile uuid:=p_profile;
BEGIN
 IF p_crm IS NOT NULL THEN SELECT * INTO c FROM public.crm_customers WHERE id=p_crm; IF NOT FOUND THEN RAISE EXCEPTION 'Kundenakte fehlt'; END IF; profile:=coalesce(profile,c.b2b_profile_id); END IF;
 IF email IS NULL OR email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[a-zA-Z]{2,}$' THEN RAISE EXCEPTION 'Kundenidentität unvollständig'; END IF;
 IF profile IS NULL AND p_crm IS NULL THEN RAISE EXCEPTION 'Kundenakte muss zuerst zugeordnet werden'; END IF;
 RETURN jsonb_build_object('key',CASE WHEN profile IS NOT NULL THEN 'b2b:'||profile::text ELSE 'crm:'||p_crm::text END,'email',email,'profile',profile,'crm',p_crm);
END $$;
REVOKE ALL ON FUNCTION public.feedback_customer_identity(uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.feedback_customer_identity(uuid,uuid,text) TO service_role;

CREATE FUNCTION public.ensure_rental_feedback_invitation(p_kind text,p_invoice uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE i public.inquiry_invoices; r public.rental_inquiries; b public.b2b_invoices; res public.b2b_reservations; prof public.b2b_profiles; inv public.rental_feedback_invitations; identity jsonb; ref text; loc text; items text; name text; order_id uuid; crm uuid; profile uuid; email text;
BEGIN
 IF p_kind='inquiry' THEN
  SELECT * INTO i FROM public.inquiry_invoices WHERE id=p_invoice; IF NOT FOUND OR i.inquiry_type<>'rental' OR i.invoice_kind NOT IN ('invoice','final') OR i.status IN ('draft','cancelled') OR coalesce(i.credited_amount,0)>=i.gross_amount THEN RETURN NULL; END IF;
  SELECT * INTO r FROM public.rental_inquiries WHERE id=i.rental_inquiry_id;
  IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM public.b2b_return_protocols WHERE rental_inquiry_id=r.id AND status='completed') THEN RETURN NULL; END IF;
  order_id:=r.id; crm:=coalesce(i.crm_customer_id,r.crm_customer_id); profile:=r.b2b_profile_id; email:=i.customer_email; ref:=coalesce(r.order_code,i.invoice_number); loc:=public.slt_normalize_location(r.location); items:=r.product_name; name:=i.customer_name;
 ELSEIF p_kind='portal' THEN
  SELECT * INTO b FROM public.b2b_invoices WHERE id=p_invoice; IF NOT FOUND OR b.invoice_kind NOT IN ('invoice','final') OR b.status IN ('draft','cancelled') OR coalesce(b.credited_amount,0)>=b.gross_amount THEN RETURN NULL; END IF;
  SELECT * INTO res FROM public.b2b_reservations WHERE id=b.reservation_id;
  IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM public.b2b_return_protocols WHERE reservation_id=res.id AND status='completed') THEN RETURN NULL; END IF;
  SELECT * INTO prof FROM public.b2b_profiles WHERE id=b.b2b_profile_id;
  order_id:=res.id; profile:=prof.id; email:=coalesce(nullif(prof.billing_email,''),prof.contact_email); ref:=coalesce(res.order_code,b.invoice_number); loc:=public.slt_normalize_location(res.location); items:=res.product_name; name:=concat_ws(' ',prof.contact_first_name,prof.contact_last_name);
 ELSE RAISE EXCEPTION 'Ungültige Rechnungsart'; END IF;
 identity:=public.feedback_customer_identity(crm,profile,email);
 INSERT INTO public.rental_feedback_invitations(customer_key,customer_email,crm_customer_id,b2b_profile_id,source_kind,source_order_id,invoice_id,order_ref,location,rented_items,customer_name)
 VALUES(identity->>'key',identity->>'email',crm,profile,p_kind,order_id,p_invoice,ref,coalesce(loc,'krefeld'),coalesce(nullif(items,''),'Mietauftrag'),name) ON CONFLICT(source_kind,source_order_id) DO NOTHING;
 SELECT * INTO inv FROM public.rental_feedback_invitations WHERE source_kind=p_kind AND source_order_id=order_id;
 RETURN jsonb_build_object('token',inv.token,'id',inv.id);
END $$;
REVOKE ALL ON FUNCTION public.ensure_rental_feedback_invitation(text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_rental_feedback_invitation(text,uuid) TO service_role;

CREATE FUNCTION public.submit_rental_feedback(p_token text,p_ratings jsonb,p_answers jsonb,p_recommend integer) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE inv public.rental_feedback_invitations; fb uuid; coupon public.rental_feedback_coupons; avg_value numeric;
BEGIN
 SELECT * INTO inv FROM public.rental_feedback_invitations WHERE token=p_token FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Ungültiger Feedback-Link'; END IF;
 IF inv.feedback_id IS NULL THEN
  IF jsonb_typeof(p_ratings)<>'object' OR jsonb_typeof(p_answers)<>'object' OR octet_length(p_answers::text)>20000 OR octet_length(p_ratings::text)>2000 THEN RAISE EXCEPTION 'Ungültiges Feedback'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_each(p_ratings) WHERE jsonb_typeof(value)<>'number' OR value::text !~ '^[1-5]$') THEN RAISE EXCEPTION 'Bewertungen müssen zwischen 1 und 5 liegen'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_each(p_answers) WHERE jsonb_typeof(value)<>'string' OR length(value #>> '{}')>3000) THEN RAISE EXCEPTION 'Ungültiger Kommentar'; END IF;
  IF p_ratings='{}'::jsonb AND NOT EXISTS(SELECT 1 FROM jsonb_each_text(p_answers) WHERE length(btrim(value))>0) THEN RAISE EXCEPTION 'Bitte mindestens eine Bewertung oder einen Kommentar abgeben'; END IF;
  IF p_recommend IS NOT NULL AND p_recommend NOT BETWEEN 0 AND 10 THEN RAISE EXCEPTION 'Ungültige Empfehlung'; END IF;
  SELECT round(avg(value::text::numeric),2) INTO avg_value FROM jsonb_each(p_ratings);
  INSERT INTO public.customer_feedback(source,location,order_ref,rented_items,customer_name,customer_email,ratings,answers,recommend_score,avg_rating,google_review_confirmed)
  VALUES('invoice_personal',inv.location,inv.order_ref,inv.rented_items,inv.customer_name,inv.customer_email,p_ratings,p_answers,p_recommend,avg_value,false) RETURNING id INTO fb;
  UPDATE public.rental_feedback_invitations SET feedback_id=fb,submitted_at=now() WHERE id=inv.id;
  PERFORM pg_advisory_xact_lock(hashtextextended(inv.customer_email,0));
  INSERT INTO public.rental_feedback_coupons(customer_key,customer_email,crm_customer_id,b2b_profile_id,invitation_id,feedback_id)
  VALUES(inv.customer_key,inv.customer_email,inv.crm_customer_id,inv.b2b_profile_id,inv.id,fb) ON CONFLICT DO NOTHING RETURNING * INTO coupon;
  IF coupon.id IS NOT NULL THEN INSERT INTO public.rental_coupon_events(coupon_id,event) VALUES(coupon.id,'activated'); END IF;
 END IF;
 SELECT * INTO coupon FROM public.rental_feedback_coupons WHERE invitation_id=inv.id;
 RETURN jsonb_build_object('submitted',true,'coupon_code',coupon.code,'coupon_status',coupon.status,'already_received',coupon.id IS NULL);
END $$;
REVOKE ALL ON FUNCTION public.submit_rental_feedback(text,jsonb,jsonb,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.submit_rental_feedback(text,jsonb,jsonb,integer) TO service_role;

CREATE FUNCTION public.check_rental_coupon(p_code text,p_kind text,p_order uuid,p_profile uuid DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.rental_feedback_coupons; r public.rental_inquiries; prof public.b2b_profiles; identity jsonb;
BEGIN
 SELECT * INTO c FROM public.rental_feedback_coupons WHERE code=upper(btrim(p_code)) FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Gutschein nicht gefunden'; END IF;
 IF p_kind='inquiry' THEN
  SELECT * INTO r FROM public.rental_inquiries WHERE id=p_order; IF NOT FOUND THEN RAISE EXCEPTION 'Auftrag fehlt'; END IF;
  identity:=public.feedback_customer_identity(r.crm_customer_id,r.b2b_profile_id,r.customer_email);
 ELSEIF p_kind='portal' THEN
  SELECT * INTO prof FROM public.b2b_profiles WHERE id=p_profile; IF NOT FOUND THEN RAISE EXCEPTION 'Kunde fehlt'; END IF;
  identity:=public.feedback_customer_identity(NULL,prof.id,coalesce(nullif(prof.billing_email,''),prof.contact_email));
 ELSE RAISE EXCEPTION 'Ungültiger Mietauftrag'; END IF;
 IF c.customer_key<>identity->>'key' OR c.customer_email<>identity->>'email' THEN RAISE EXCEPTION 'Gutschein gehört zu einem anderen Kunden oder Rechnungsadresse muss geklärt werden'; END IF;
 IF c.status IN ('redeemed','blocked') THEN RAISE EXCEPTION 'Gutschein ist bereits eingelöst oder gesperrt'; END IF;
 IF c.status='reserved' AND (c.reserved_order_id IS DISTINCT FROM p_order OR c.reserved_kind IS DISTINCT FROM p_kind) THEN
  IF c.reserved_until<now() THEN
   UPDATE public.rental_feedback_coupons SET status='active',reserved_kind=NULL,reserved_order_id=NULL,reserved_offer_number=NULL,reserved_until=NULL,updated_at=now() WHERE id=c.id;
   INSERT INTO public.rental_coupon_events(coupon_id,event,order_id) VALUES(c.id,'released_expired',c.reserved_order_id);
  ELSE RAISE EXCEPTION 'Gutschein ist bereits in einem anderen Angebot reserviert'; END IF;
 END IF;
 RETURN jsonb_build_object('id',c.id,'code',c.code,'discount_percent',10);
END $$;
REVOKE ALL ON FUNCTION public.check_rental_coupon(text,text,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.check_rental_coupon(text,text,uuid,uuid) TO service_role;

CREATE FUNCTION public.reserve_rental_coupon(p_code text,p_kind text,p_order uuid,p_profile uuid,p_offer text,p_until timestamptz) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.rental_feedback_coupons;
BEGIN
 PERFORM public.check_rental_coupon(p_code,p_kind,p_order,p_profile);
 SELECT * INTO c FROM public.rental_feedback_coupons WHERE code=upper(btrim(p_code)) FOR UPDATE;
 IF p_offer IS NULL OR p_until<=now() THEN RAISE EXCEPTION 'Angebotsgültigkeit fehlt'; END IF;
 UPDATE public.rental_feedback_coupons SET status='reserved',reserved_kind=p_kind,reserved_order_id=p_order,reserved_offer_number=p_offer,reserved_until=p_until,updated_at=now() WHERE id=c.id;
 INSERT INTO public.rental_coupon_events(coupon_id,event,order_id,note) VALUES(c.id,'reserved',p_order,p_offer);
END $$;
REVOKE ALL ON FUNCTION public.reserve_rental_coupon(text,text,uuid,uuid,text,timestamptz) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_rental_coupon(text,text,uuid,uuid,text,timestamptz) TO service_role;

CREATE FUNCTION public.redeem_reserved_rental_coupon(p_code text,p_kind text,p_order uuid,p_offer text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.rental_feedback_coupons;
BEGIN
 SELECT * INTO c FROM public.rental_feedback_coupons WHERE code=p_code FOR UPDATE;
 IF NOT FOUND OR c.status<>'reserved' OR c.reserved_kind<>p_kind OR c.reserved_order_id<>p_order OR c.reserved_offer_number<>p_offer OR c.reserved_until<now() THEN RAISE EXCEPTION 'Gutscheinreservierung nicht mehr gültig. Angebot bitte neu erstellen'; END IF;
 UPDATE public.rental_feedback_coupons SET status='redeemed',redeemed_at=now(),updated_at=now() WHERE id=c.id;
 INSERT INTO public.rental_coupon_events(coupon_id,event,order_id,actor,note) VALUES(c.id,'redeemed',p_order,auth.uid(),p_offer);
END $$;
REVOKE ALL ON FUNCTION public.redeem_reserved_rental_coupon(text,text,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_reserved_rental_coupon(text,text,uuid,text) TO service_role;

CREATE FUNCTION public.guard_feedback_coupon_acceptance() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE code text;
BEGIN
 IF TG_TABLE_NAME='offer_acceptance_links' THEN
  IF NEW.status='accepted' AND OLD.status IS DISTINCT FROM 'accepted' AND NEW.inquiry_table='rental_inquiries' THEN
   SELECT feedback_coupon_code INTO code FROM public.rental_inquiries WHERE id=NEW.inquiry_id;
   IF code IS NOT NULL THEN PERFORM public.redeem_reserved_rental_coupon(code,'inquiry',NEW.inquiry_id,NEW.offer_number); END IF;
  END IF;
 ELSE
  IF NEW.status='accepted' AND OLD.status IS DISTINCT FROM 'accepted' AND NEW.feedback_coupon_code IS NOT NULL THEN
   PERFORM public.redeem_reserved_rental_coupon(NEW.feedback_coupon_code,'portal',NEW.id,NEW.offer_number);
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER feedback_coupon_link_accept BEFORE UPDATE ON public.offer_acceptance_links FOR EACH ROW EXECUTE FUNCTION public.guard_feedback_coupon_acceptance();
CREATE TRIGGER feedback_coupon_portal_accept BEFORE UPDATE ON public.b2b_offers FOR EACH ROW EXECUTE FUNCTION public.guard_feedback_coupon_acceptance();

CREATE FUNCTION public.block_rental_coupon(p_coupon uuid,p_reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.rental_feedback_coupons;
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Keine Berechtigung'; END IF;
 IF length(btrim(p_reason)) NOT BETWEEN 5 AND 500 THEN RAISE EXCEPTION 'Bitte Sperrgrund angeben'; END IF;
 SELECT * INTO c FROM public.rental_feedback_coupons WHERE id=p_coupon FOR UPDATE;
 IF NOT FOUND OR c.status NOT IN ('active','reserved') THEN RAISE EXCEPTION 'Dieser Gutschein kann nicht gesperrt werden'; END IF;
 UPDATE public.rental_feedback_coupons SET status='blocked',block_reason=btrim(p_reason),updated_at=now() WHERE id=c.id;
 INSERT INTO public.rental_coupon_events(coupon_id,event,actor,note) VALUES(c.id,'blocked',auth.uid(),btrim(p_reason));
END $$;
REVOKE ALL ON FUNCTION public.block_rental_coupon(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.block_rental_coupon(uuid,text) TO authenticated,service_role;