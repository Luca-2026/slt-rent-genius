DO $migration$
DECLARE definition text;
BEGIN
 SELECT pg_get_functiondef('public.reserve_sign_booking(uuid,text,jsonb,text)'::regprocedure) INTO definition;
 IF position('(slug ILIKE ''%zusatz%'' OR slug LIKE ''vz-1000-%'')' in definition)=0 THEN RAISE EXCEPTION 'Expected additional sign guard missing'; END IF;
 definition:=replace(definition,'(slug ILIKE ''%zusatz%'' OR slug LIKE ''vz-1000-%'')','slug=''vz-1060-31-ra1-gr-1''');
 definition:=replace(definition,'''product_name'',ep.name','''product_name'',''2x VZ 1060 31 (Haltverbot auch auf dem Seitenstreifen)''');
 definition:=replace(definition,'''Zusatzschild · pauschal für den Mietzeitraum''','''Zusatzzeichen-Set (2 Schilder) · pauschal für den Mietzeitraum''');
 EXECUTE definition;
END $migration$;