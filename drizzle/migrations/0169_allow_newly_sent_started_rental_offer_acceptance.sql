CREATE OR REPLACE FUNCTION public.offer_link_deadline(p_link public.offer_acceptance_links) RETURNS timestamptz LANGUAGE plpgsql STABLE SET search_path=public AS $$
DECLARE r public.rental_inquiries; deadline timestamptz; item jsonb; d date; t text; candidate timestamptz; rental_start timestamptz; rental_end timestamptz; sent timestamptz;
BEGIN
 deadline:=COALESCE(p_link.expires_at,(p_link.valid_until+1)::timestamp AT TIME ZONE 'Europe/Berlin');
 IF p_link.inquiry_table<>'rental_inquiries' THEN RETURN deadline; END IF;
 SELECT * INTO r FROM public.rental_inquiries WHERE id=p_link.inquiry_id;
 sent:=COALESCE(p_link.dispatched_at,p_link.created_at);
 FOR item IN SELECT value FROM jsonb_array_elements(CASE WHEN jsonb_typeof(r.offer_payload->'items')='array' THEN r.offer_payload->'items' ELSE '[]'::jsonb END) LOOP
 IF COALESCE((item->>'period_free')::boolean,false) THEN CONTINUE; END IF;
 d:=public.slt_try_date(item->>'rental_start'); t:=item->>'rental_start_time';
 IF d IS NOT NULL THEN
 IF t IS NULL OR t !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN t:='00:00'; END IF;
 candidate:=(d+t::time) AT TIME ZONE 'Europe/Berlin'; rental_start:=LEAST(rental_start,candidate);
 END IF;
 d:=public.slt_try_date(item->>'rental_end'); t:=item->>'rental_end_time';
 IF d IS NOT NULL THEN
 IF t IS NULL OR t !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN t:='23:59'; END IF;
 candidate:=(d+t::time) AT TIME ZONE 'Europe/Berlin'; rental_end:=LEAST(rental_end,candidate);
 END IF;
 END LOOP;
 IF rental_start IS NULL THEN
 d:=public.slt_try_date(r.start_date); t:=r.start_time;
 IF d IS NOT NULL THEN
 IF t IS NULL OR t !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN t:='00:00'; END IF;
 rental_start:=(d+t::time) AT TIME ZONE 'Europe/Berlin';
 END IF;
 END IF;
 IF rental_end IS NULL THEN
 d:=public.slt_try_date(r.end_date); t:=r.end_time;
 IF d IS NOT NULL THEN
 IF t IS NULL OR t !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN t:='23:59'; END IF;
 rental_end:=(d+t::time) AT TIME ZONE 'Europe/Berlin';
 END IF;
 END IF;
 IF rental_start IS NOT NULL THEN
 IF sent IS NOT NULL AND rental_start<=sent THEN
 deadline:=LEAST(deadline,rental_end);
 ELSE deadline:=LEAST(deadline,rental_start);
 END IF;
 END IF;
 RETURN deadline;
END $$;
REVOKE ALL ON FUNCTION public.offer_link_deadline(public.offer_acceptance_links) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.offer_link_deadline(public.offer_acceptance_links) TO service_role;
COMMENT ON FUNCTION public.offer_link_deadline(public.offer_acceptance_links) IS 'Future rentals expire at rental start; offers freshly sent after start remain acceptable until rental end or offer validity, whichever is earlier. Existing terminal link decisions are never reopened.';