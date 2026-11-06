-- lovable-cron-fallback-reviewed: existing wake-on-enqueue retry job, only armed while bookings are pending and unscheduled after drain; this only adds the staff notice to the pending condition.
CREATE OR REPLACE FUNCTION public.wake_sign_booking_processor() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE endpoint text; command text; pending boolean;
BEGIN
 SELECT c.endpoint INTO endpoint FROM public.sign_booking_processor_config c WHERE id=1;
 IF endpoint IS NULL THEN RETURN NEW; END IF;
 PERFORM pg_advisory_xact_lock(881034);
 pending := NEW.status='paid' AND (NEW.confirmation_sent_at IS NULL OR NEW.staff_notified_at IS NULL);
 IF pending THEN
 PERFORM net.http_post(url:=endpoint,headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',(SELECT secret FROM public.internal_cron_secret WHERE id=1)),body:='{}'::jsonb);
 END IF;
 IF (NEW.status='reserved' OR pending) AND NOT EXISTS(SELECT 1 FROM cron.job WHERE jobname='sign-booking-pending') THEN
 command:=format('SELECT net.http_post(url:=%L,headers:=jsonb_build_object(''Content-Type'',''application/json'',''x-cron-secret'',(SELECT secret FROM public.internal_cron_secret WHERE id=1)),body:=''{}''::jsonb);',endpoint);
 PERFORM cron.schedule('sign-booking-pending','* * * * *',command);
 END IF;
 RETURN NEW;
END; $function$;
CREATE OR REPLACE FUNCTION public.drain_sign_booking_processor() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE j record;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE='42501'; END IF;
 PERFORM pg_advisory_xact_lock(881034);
 IF NOT EXISTS(SELECT 1 FROM public.sign_bookings WHERE status='reserved' OR(status='paid' AND (confirmation_sent_at IS NULL OR staff_notified_at IS NULL))) THEN
 FOR j IN SELECT jobid FROM cron.job WHERE jobname='sign-booking-pending' LOOP PERFORM cron.unschedule(j.jobid); END LOOP;
 END IF;
END; $function$;