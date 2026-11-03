DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.reserve_sign_booking(uuid,text,jsonb,text)'::regprocedure);
 IF strpos(def,'''Rundum-sorglos-Paket · Antrag, Aufstellung, Aufstellprotokoll und Abbau · städtische Gebühren separat''')=0 THEN RAISE EXCEPTION 'Reservation description template changed'; END IF;
 def:=replace(def,'''Rundum-sorglos-Paket · Antrag, Aufstellung, Aufstellprotokoll und Abbau · städtische Gebühren separat''','CASE WHEN _body->>''permitMode''=''existing'' THEN ''Rundum-sorglos-Paket · vorhandene Genehmigung prüfen, Aufstellung, Aufstellprotokoll und Abbau'' ELSE ''Rundum-sorglos-Paket · Genehmigungsantrag durch SLT, Aufstellung, Aufstellprotokoll und Abbau · städtische Gebühren transparent nach Bescheid'' END');
 EXECUTE def;
 def:=pg_get_functiondef('public.sync_sign_booking_tasks()'::regprocedure);
 def:=replace(def,'CASE WHEN NEW.permit_path IS NULL THEN','CASE WHEN NEW.permit_mode=''slt'' OR (NEW.permit_mode IS NULL AND NEW.permit_path IS NULL) THEN');
 EXECUTE def;
END; $patch$;