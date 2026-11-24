DO $migration$
DECLARE def text;
BEGIN
SELECT pg_get_functiondef('public.guard_sign_booking_requirements()'::regprocedure) INTO def;
IF position('interval ''96 hours''' IN def)=0 THEN RAISE EXCEPTION 'Expected existing permit lead guard missing'; END IF;
def:=replace(def,'interval ''96 hours''','interval ''72 hours''');
def:=replace(def,'Mindestens 96 Stunden Vorlauf erforderlich','Mindestens 72 Stunden Vorlauf erforderlich');
EXECUTE def;
END $migration$;