-- lovable-cron-fallback-reviewed: Wake on booking insertion/payment; one-minute retry only while reserved or unpaid-confirmation rows exist, unschedule after drain. Required 24-hour release with at most one-minute persisted delay; immediate capacity reads expire at the exact deadline.
CREATE TABLE public.sign_booking_processor_config(id integer PRIMARY KEY CHECK(id=1),endpoint text NOT NULL);
GRANT ALL ON public.sign_booking_processor_config TO service_role;
ALTER TABLE public.sign_booking_processor_config ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.wake_sign_booking_processor() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE endpoint text; command text;
BEGIN
 SELECT c.endpoint INTO endpoint FROM public.sign_booking_processor_config c WHERE id=1;
 IF endpoint IS NULL THEN RETURN NEW; END IF;
 PERFORM pg_advisory_xact_lock(881034);
 IF NEW.status='paid' AND NEW.confirmation_sent_at IS NULL THEN
 PERFORM net.http_post(url:=endpoint,headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT secret FROM public.internal_cron_secret WHERE id=1)),body:='{}'::jsonb);
 END IF;
 IF (NEW.status='reserved' OR(NEW.status='paid' AND NEW.confirmation_sent_at IS NULL)) AND NOT EXISTS(SELECT 1 FROM cron.job WHERE jobname='sign-booking-pending') THEN
 command:=format('SELECT net.http_post(url:=%L,headers:=jsonb_build_object(''Content-Type'',''application/json'',''x-cron-secret'',(SELECT secret FROM public.internal_cron_secret WHERE id=1)),body:=''{}''::jsonb);',endpoint);
 PERFORM cron.schedule('sign-booking-pending','* * * * *',command);
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER sign_booking_wake AFTER INSERT OR UPDATE OF status,confirmation_sent_at ON public.sign_bookings FOR EACH ROW EXECUTE FUNCTION public.wake_sign_booking_processor();
CREATE OR REPLACE FUNCTION public.drain_sign_booking_processor() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE j record;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501'; END IF;
 PERFORM pg_advisory_xact_lock(881034);
 IF NOT EXISTS(SELECT 1 FROM public.sign_bookings WHERE status='reserved' OR(status='paid' AND confirmation_sent_at IS NULL)) THEN
 FOR j IN SELECT jobid FROM cron.job WHERE jobname='sign-booking-pending' LOOP PERFORM cron.unschedule(j.jobid); END LOOP;
 END IF;
END; $$;
REVOKE ALL ON FUNCTION public.drain_sign_booking_processor() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.drain_sign_booking_processor() TO service_role;