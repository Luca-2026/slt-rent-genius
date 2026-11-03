CREATE OR REPLACE FUNCTION public.sign_nrw_workday(d date) RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
DECLARE y int:=extract(year from d); a int; b int; c int; h int; l int; m int; easter date;
BEGIN
 a:=y%19; b:=y/100; c:=y%100;
 h:=(19*a+b-b/4-((b-(b+8)/25+1)/3)+15)%30;
 l:=(32+2*(b%4)+2*(c/4)-h-(c%4))%7;
 m:=(a+11*h+22*l)/451;
 easter:=make_date(y,(h+l-7*m+114)/31,(h+l-7*m+114)%31+1);
 RETURN extract(isodow from d)<>7 AND to_char(d,'MM-DD') NOT IN ('01-01','05-01','10-03','11-01','12-25','12-26') AND d NOT IN (easter-2,easter+1,easter+39,easter+50,easter+60);
END; $$;
REVOKE ALL ON FUNCTION public.sign_nrw_workday(date) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sign_nrw_workday(date) TO service_role;
ALTER TABLE public.sign_bookings ADD COLUMN permit_mode text CHECK(permit_mode IN ('existing','slt')), ADD COLUMN terms_accepted_at timestamptz, ADD COLUMN terms_version text, ADD COLUMN terms_document_hash text;
CREATE OR REPLACE FUNCTION public.guard_sign_booking_requirements() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb:=NEW.snapshot->'request'; d date; n int:=0; expected_hash text;
BEGIN
 IF TG_OP<>'INSERT' THEN RETURN NEW; END IF;
 IF r->>'termsAccepted' IS DISTINCT FROM 'true' OR r->>'termsVersion' IS DISTINCT FROM '2026-05' THEN RAISE EXCEPTION 'AGB müssen ausdrücklich in aktueller Fassung bestätigt werden' USING ERRCODE='23514'; END IF;
 expected_hash:=CASE WHEN r->>'customerKind'='private' THEN '770d16fa42d287aa23d556309b1afeb7ec93d6ab7fb7a97f1dbe7c46fd3d4864' ELSE 'dd3195c51333a0b76e7e559dc656e10482a79baa1eb89c95cd5525272c83a217' END;
 IF r->>'termsDocumentHash' IS DISTINCT FROM expected_hash THEN RAISE EXCEPTION 'AGB-Fassung konnte nicht bestätigt werden' USING ERRCODE='23514'; END IF;
 NEW.terms_accepted_at:=now(); NEW.terms_version:=r->>'termsVersion'; NEW.terms_document_hash:=expected_hash;
 IF NEW.package='sorglos' THEN
  IF r->>'permitMode' IS NULL OR r->>'permitMode' NOT IN ('existing','slt') THEN RAISE EXCEPTION 'Genehmigungswahl fehlt' USING ERRCODE='23514'; END IF;
  NEW.permit_mode:=r->>'permitMode';
  IF NEW.permit_mode='existing' THEN
   IF NEW.permit_path IS NULL THEN RAISE EXCEPTION 'Vorhandene Genehmigung muss hochgeladen werden' USING ERRCODE='23514'; END IF;
   IF (NEW.start_date::text||' '||(r->>'start_time'))::timestamp AT TIME ZONE 'Europe/Berlin' < now()+interval '96 hours' THEN RAISE EXCEPTION 'Mindestens 96 Stunden Vorlauf erforderlich' USING ERRCODE='23514'; END IF;
  ELSE
   d:=(now() AT TIME ZONE 'Europe/Berlin')::date;
   WHILE n<14 LOOP d:=d+1; IF public.sign_nrw_workday(d) THEN n:=n+1; END IF; END LOOP;
   IF NEW.start_date<d THEN RAISE EXCEPTION 'Mindestens 14 Werktage Vorlauf erforderlich (Mo–Sa, ohne NRW-Feiertage)' USING ERRCODE='23514'; END IF;
  END IF;
 END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_sign_booking_requirements() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER sign_booking_requirements BEFORE INSERT ON public.sign_bookings FOR EACH ROW EXECUTE FUNCTION public.guard_sign_booking_requirements();
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.sync_sign_booking_tasks()'::regprocedure);
 def:=replace(def,'(lid,''Genehmigung prüfen'',''(Adresse', '(lid,''Genehmigung prüfen'',''(Adresse');
 def:=replace(def,'''Noch keine Genehmigung hochgeladen – Genehmigung einholen.''', '''Genehmigung durch SLT beantragen (14 Werktage Mo–Sa, ohne NRW-Feiertage); städtische Gebühren anschließend transparent nach Bescheid abrechnen.''');
 def:=replace(def,'(lid,''Genehmigung prüfen'',''Adresse, Zeitraum, Auflagen und rechtzeitige Aufstellung anhand der Genehmigung prüfen; fehlende Genehmigung einholen.'',0,''permit'')','(lid,CASE WHEN NEW.permit_mode=''slt'' THEN ''Genehmigung durch SLT beantragen und prüfen'' ELSE ''Vorhandene Genehmigung prüfen'' END,''Adresse, Zeitraum, Auflagen und rechtzeitige Aufstellung prüfen. Gebühren transparent nach Bescheid abrechnen.'',0,''permit'')');
 EXECUTE def;
END; $patch$;