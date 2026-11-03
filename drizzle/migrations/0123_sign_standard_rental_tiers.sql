CREATE OR REPLACE FUNCTION public.sign_rental_gross_cents(_base integer, _days integer, _max integer, _tiers jsonb DEFAULT NULL) RETURNS integer LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
DECLARE t jsonb; selected jsonb; previous integer:=0; cents bigint;
BEGIN
 IF _base IS NULL OR _base<=0 OR _days IS NULL OR _days<1 OR _max IS NULL OR _days>_max THEN RAISE EXCEPTION 'Ungültiger Schildertarif'; END IF;
 IF _tiers IS NULL THEN RETURN round(_base::numeric*(10+GREATEST(0,_days-10))/10)::integer; END IF;
 IF jsonb_typeof(_tiers)<>'array' OR jsonb_array_length(_tiers)=0 OR (_tiers->0->>'fromDays')::integer IS DISTINCT FROM 1 OR (_tiers->0->>'grossCents')::integer IS DISTINCT FROM _base THEN RAISE EXCEPTION 'Ungültige Preisstaffeln'; END IF;
 FOR t IN SELECT value FROM jsonb_array_elements(_tiers) LOOP
  IF (t->>'fromDays') IS NULL OR (t->>'grossCents') IS NULL OR (t->>'extraDayGrossCents') IS NULL OR (t->>'fromDays') !~ '^[0-9]+$' OR (t->>'grossCents') !~ '^[0-9]+$' OR (t->>'extraDayGrossCents') !~ '^[0-9]+$' OR (t->>'fromDays')::integer<=previous OR (t->>'grossCents')::integer<=0 THEN RAISE EXCEPTION 'Ungültige Preisstaffeln'; END IF;
  previous:=(t->>'fromDays')::integer;
  IF _days>=previous THEN selected:=t; END IF;
 END LOOP;
 cents:=(selected->>'grossCents')::bigint+(_days-(selected->>'fromDays')::integer)*(selected->>'extraDayGrossCents')::bigint;
 RETURN cents::integer;
END; $$;
REVOKE ALL ON FUNCTION public.sign_rental_gross_cents(integer,integer,integer,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sign_rental_gross_cents(integer,integer,integer,jsonb) TO service_role;
DO $$ DECLARE def text; old text:='gross:=round(gross::numeric*(10+GREATEST(0,e-s+1-10))/10)::int*qty;'; replacement text:='gross:=public.sign_rental_gross_cents(gross,e-s+1,(c->>''maxRentalDays'')::int,CASE WHEN pkg=''standard'' THEN c->''standardRentalTiers'' ELSE NULL END)*qty;'; BEGIN
 SELECT pg_get_functiondef('public.reserve_sign_booking(uuid,text,jsonb,text)'::regprocedure) INTO def;
 IF position(old IN def)=0 THEN RAISE EXCEPTION 'Expected sign reservation pricing not found'; END IF;
 EXECUTE replace(def,old,replacement);
END; $$;