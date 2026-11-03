CREATE OR REPLACE FUNCTION public.sign_reserved_sets(_loc text,_start date,_end date) RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT COALESCE((SELECT sum(quantity) FROM public.sign_bookings WHERE location=_loc AND (status='paid' OR (status='reserved' AND expires_at>now())) AND start_date<=_end AND end_date>=_start),0)::int +
 COALESCE((SELECT sum(GREATEST(COALESCE((it->>'articles')::int,1),1)) FROM public.rental_inquiries r CROSS JOIN LATERAL jsonb_array_elements(COALESCE(r.offer_payload->'items','[]')) it WHERE r.status IN ('in_progress','offer_sent','accepted','done') AND (r.status<>'done' OR r.order_confirmed_at IS NOT NULL) AND public.slt_normalize_location(r.location)=_loc AND it->>'product_slug'='halteverbotsschilder-set' AND NOT EXISTS(SELECT 1 FROM public.sign_bookings sb WHERE sb.inquiry_id=r.id) AND public.slt_try_date(r.start_date)<=_end AND COALESCE(public.slt_try_date(r.end_date),public.slt_try_date(r.start_date))>=_start),0)::int +
 COALESCE((SELECT sum(GREATEST(COALESCE(r.quantity,1),1)) FROM public.rental_inquiries r WHERE r.status IN ('in_progress','offer_sent','accepted','done') AND (r.status<>'done' OR r.order_confirmed_at IS NOT NULL) AND public.slt_normalize_location(r.location)=_loc AND r.product_id='halteverbotsschilder-set' AND jsonb_array_length(COALESCE(r.offer_payload->'items','[]'))=0 AND NOT EXISTS(SELECT 1 FROM public.sign_bookings sb WHERE sb.inquiry_id=r.id) AND public.slt_try_date(r.start_date)<=_end AND COALESCE(public.slt_try_date(r.end_date),public.slt_try_date(r.start_date))>=_start),0)::int +
 COALESCE((SELECT sum(GREATEST(COALESCE(r.quantity,1),1)) FROM public.b2b_reservations r WHERE r.status IN ('pending','offer_sent','confirmed','active') AND public.slt_normalize_location(r.location)=_loc AND r.product_id='halteverbotsschilder-set' AND r.start_date<=_end AND COALESCE(r.end_date,r.start_date)>=_start),0)::int;
$$;
REVOKE ALL ON FUNCTION public.sign_reserved_sets(text,date,date) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sign_reserved_sets(text,date,date) TO service_role;
CREATE OR REPLACE FUNCTION public.sign_calendar_availability(_location text,_from date,_to date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE capacity int; result jsonb;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 IF _location NOT IN ('bonn','krefeld') OR _to<_from OR _to-_from>62 THEN RAISE EXCEPTION 'Ungültiger Zeitraum'; END IF;
 SELECT COALESCE((quantities->>_location)::int,0) INTO capacity FROM public.b2b_managed_products WHERE slug='halteverbotsschilder-set' AND is_published;
 SELECT jsonb_agg(jsonb_build_object('date',d::date,'remaining',GREATEST(0,COALESCE(capacity,0)-public.sign_reserved_sets(_location,d::date,d::date)))) INTO result FROM generate_series(_from,_to,interval '1 day') d;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.sign_calendar_availability(text,date,date) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sign_calendar_availability(text,date,date) TO service_role;
DO $patch$
DECLARE def text; first_pos int; last_pos int;
BEGIN
 def:=pg_get_functiondef('public.reserve_sign_booking(uuid,text,jsonb,text)'::regprocedure);
 first_pos:=strpos(def,' SELECT COALESCE(sum(quantity),0) INTO used');
 last_pos:=strpos(def,' IF used+qty>capacity');
 IF first_pos=0 OR last_pos=0 THEN RAISE EXCEPTION 'Expected reservation capacity block not found'; END IF;
 def:=substr(def,1,first_pos-1)||E' used:=public.sign_reserved_sets(loc,s,e);\n'||substr(def,last_pos);
 def:=replace(def,'gross:=(CASE WHEN pkg=''standard'' THEN c->>''standardGrossCents'' ELSE c->>''sorglosGrossCents'' END)::int*qty;',E'IF pkg=''sorglos'' AND c->>''sorglosRadiusKm'' IS NOT NULL AND (_body->>''verifiedDistanceKm'' IS NULL OR (_body->>''verifiedDistanceKm'')::numeric<0) THEN RAISE EXCEPTION ''Aufstelladresse konnte nicht geprüft werden''; END IF;\n gross:=(CASE WHEN pkg=''standard'' THEN c->>''standardGrossCents'' WHEN c->>''sorglosRadiusKm'' IS NOT NULL AND (_body->>''verifiedDistanceKm'')::numeric>(c->>''sorglosRadiusKm'')::numeric THEN c->>''sorglosOuterGrossCents'' ELSE c->>''sorglosGrossCents'' END)::int*qty;');
 EXECUTE def;
END; $patch$;