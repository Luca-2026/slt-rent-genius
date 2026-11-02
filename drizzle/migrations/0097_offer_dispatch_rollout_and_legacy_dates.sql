CREATE TABLE public.offer_followup_settings (id boolean PRIMARY KEY DEFAULT true CHECK(id), live_enabled boolean NOT NULL DEFAULT false);
GRANT SELECT ON public.offer_followup_settings TO authenticated;
GRANT ALL ON public.offer_followup_settings TO service_role;
ALTER TABLE public.offer_followup_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read offer followup activation" ON public.offer_followup_settings FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE OR REPLACE FUNCTION public.track_offer_dispatch() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.offer_sent_at IS DISTINCT FROM OLD.offer_sent_at AND NEW.offer_number IS NOT NULL THEN
 UPDATE public.offer_acceptance_links SET dispatched_at=COALESCE(dispatched_at,NEW.offer_sent_at) WHERE inquiry_id=NEW.id AND inquiry_table='rental_inquiries' AND offer_number=NEW.offer_number AND status='active';
 END IF; RETURN NEW;
END $$;
CREATE TRIGGER track_offer_dispatch AFTER UPDATE ON public.rental_inquiries FOR EACH ROW EXECUTE FUNCTION public.track_offer_dispatch();
UPDATE public.offer_acceptance_links l SET dispatched_at=r.offer_sent_at FROM public.rental_inquiries r WHERE l.inquiry_table='rental_inquiries' AND l.inquiry_id=r.id AND l.offer_number=r.offer_number AND l.status='active' AND l.dispatched_at IS NULL AND r.offer_sent_at IS NOT NULL;
