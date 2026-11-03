DO $patch$
DECLARE def text; old_price text := 'END)::int*qty; dep:=';
BEGIN
 def:=pg_get_functiondef('public.reserve_sign_booking(uuid,text,jsonb,text)'::regprocedure);
 IF strpos(def,old_price)=0 THEN RAISE EXCEPTION 'Reservation price template changed'; END IF;
 def:=replace(def,old_price,'END)::int; gross:=round(gross::numeric*(10+GREATEST(0,e-s+1-10))/10)::int*qty; dep:=');
 def:=replace(def,'''Standard-Set · 1–10 Miettage''','''Standard-Set · ''||(e-s+1)::text||'' Miettage''');
 EXECUTE def;
 def:=pg_get_functiondef('public.sign_calendar_availability(text,date,date)'::regprocedure);
 IF strpos(def,'_to-_from>62')=0 THEN RAISE EXCEPTION 'Calendar template changed'; END IF;
 EXECUTE replace(def,'_to-_from>62','_to-_from>130');
END; $patch$;