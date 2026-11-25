DO $migration$
DECLARE def text;
BEGIN
SELECT pg_get_functiondef('public.save_rental_order_amendment(uuid,integer,jsonb,text,timestamp with time zone)'::regprocedure) INTO def;
IF position('THEN r.start_date ELSE (SELECT min(i->>''rental_start'')::date' IN def)=0 THEN RAISE EXCEPTION 'Expected amendment date expression missing'; END IF;
def:=replace(def,'THEN r.start_date ELSE (SELECT min(i->>''rental_start'')::date','THEN r.start_date::text ELSE (SELECT min(i->>''rental_start'')::date::text');
def:=replace(def,'THEN r.end_date ELSE (SELECT max(i->>''rental_end'')::date','THEN r.end_date::text ELSE (SELECT max(i->>''rental_end'')::date::text');
EXECUTE def;
END $migration$;