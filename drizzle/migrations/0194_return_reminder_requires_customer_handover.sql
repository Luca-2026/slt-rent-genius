DO $migration$
DECLARE source text; anchor text := ' IF EXISTS(SELECT 1 FROM public.b2b_return_protocols WHERE rental_inquiry_id=r.id AND status IN (''signed'',''signed_staff_only'')) THEN RAISE EXCEPTION ''Rückgabe bereits abgeschlossen''; END IF;';
BEGIN
 SELECT pg_get_functiondef('public.claim_rental_return_reminder(uuid,integer,text,boolean)'::regprocedure) INTO source;
 IF position(anchor IN source)=0 THEN RAISE EXCEPTION 'Return reminder definition differs from inspected baseline'; END IF;
 source := replace(source,anchor,anchor || E'\n IF NOT EXISTS(SELECT 1 FROM public.b2b_delivery_notes WHERE rental_inquiry_id=r.id AND status=''signed'') THEN RAISE EXCEPTION ''Kundenseitig unterschriebene Übergabe fehlt''; END IF;');
 EXECUTE source;
END $migration$;