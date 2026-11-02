CREATE OR REPLACE FUNCTION public.expire_open_offer_link(p_id uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.offer_acceptance_links; r public.rental_inquiries;
BEGIN
 SELECT * INTO l FROM public.offer_acceptance_links WHERE id=p_id AND status='active' AND inquiry_table='rental_inquiries' FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 SELECT * INTO r FROM public.rental_inquiries WHERE id=l.inquiry_id FOR UPDATE;
 IF r.offer_number=l.offer_number AND r.status IN ('new','in_progress','offer_sent') AND now()>=public.offer_link_deadline(l) THEN
 UPDATE public.offer_acceptance_links SET status='expired' WHERE id=l.id;
 UPDATE public.rental_inquiries SET status='done' WHERE id=r.id;
 INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details) VALUES(r.id,'offer_expired',jsonb_build_object('offer_number',l.offer_number,'deadline',public.offer_link_deadline(l)));
 RETURN true;
 END IF; RETURN false;
END $$;
REVOKE ALL ON FUNCTION public.expire_open_offer_link(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.expire_open_offer_link(uuid) TO service_role;
REVOKE ALL ON FUNCTION public.guard_offer_link_decision() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.track_offer_dispatch() FROM PUBLIC,anon,authenticated;