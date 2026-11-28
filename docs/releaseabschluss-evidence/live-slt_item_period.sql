CREATE OR REPLACE FUNCTION public.slt_item_period(_inq rental_inquiries, _item jsonb, OUT from_at timestamp with time zone, OUT to_at timestamp with time zone)
 RETURNS record
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE sd date; ed date; st time; et time;
BEGIN
  sd := COALESCE(public.slt_try_date(_item->>'rental_start'), public.slt_try_date(_inq.start_date));
  ed := COALESCE(public.slt_try_date(_item->>'rental_end'), public.slt_try_date(_inq.end_date), sd);
  BEGIN st := NULLIF(_inq.start_time,'')::time; EXCEPTION WHEN others THEN st := NULL; END;
  BEGIN et := NULLIF(_inq.end_time,'')::time; EXCEPTION WHEN others THEN et := NULL; END;
  IF sd IS NULL THEN from_at := NULL; to_at := NULL; RETURN; END IF;
  from_at := ((sd + COALESCE(st, time '00:00'))::timestamp) AT TIME ZONE 'Europe/Berlin';
  to_at := ((ed + COALESCE(et, time '23:59'))::timestamp) AT TIME ZONE 'Europe/Berlin';
  IF to_at <= from_at THEN to_at := from_at + interval '1 minute'; END IF;
END $function$;
