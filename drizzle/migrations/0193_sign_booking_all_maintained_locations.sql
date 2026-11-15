ALTER TABLE public.sign_bookings DROP CONSTRAINT sign_booking_values;
ALTER TABLE public.sign_bookings ADD CONSTRAINT sign_booking_values CHECK (location IN ('krefeld','bonn','muelheim') AND package IN ('standard','sorglos') AND quantity BETWEEN 1 AND 10 AND end_date>=start_date AND gross_cents>0 AND deposit_cents>=0 AND total_cents=gross_cents+deposit_cents AND status IN ('reserved','paid','expired','review'));
DO $patch$
DECLARE def text; old text;
BEGIN
 def:=pg_get_functiondef('public.reserve_sign_booking(uuid,text,jsonb,text)'::regprocedure);
 old:='loc NOT IN (''krefeld'',''bonn'')';
 IF strpos(def,old)=0 THEN RAISE EXCEPTION 'Expected booking location check missing'; END IF;
 def:=replace(def,old,'(loc IS NULL OR loc NOT IN (''krefeld'',''bonn'',''muelheim'') OR NOT (loc = ANY(COALESCE(p.available_locations,ARRAY[]::text[]))))');
 old:='CASE WHEN loc=''bonn'' THEN ''Bonn'' ELSE ''Krefeld'' END';
 IF strpos(def,old)=0 THEN RAISE EXCEPTION 'Expected inquiry location label missing'; END IF;
 def:=replace(def,old,'CASE loc WHEN ''bonn'' THEN ''Bonn'' WHEN ''muelheim'' THEN ''Mülheim an der Ruhr'' ELSE ''Krefeld'' END');
 EXECUTE def;
 def:=pg_get_functiondef('public.sign_calendar_availability(text,date,date)'::regprocedure);
 old:='_location NOT IN (''bonn'',''krefeld'')';
 IF strpos(def,old)=0 THEN RAISE EXCEPTION 'Expected calendar location check missing'; END IF;
 def:=replace(def,old,'(_location IS NULL OR _location NOT IN (''krefeld'',''bonn'',''muelheim'') OR NOT EXISTS(SELECT 1 FROM public.b2b_managed_products WHERE slug=''halteverbotsschilder-set'' AND is_published AND _location=ANY(available_locations)))');
 EXECUTE def;
END; $patch$;