DO $$
DECLARE name text; definition text;
BEGIN
 FOREACH name IN ARRAY ARRAY['public.reserve_sign_booking(uuid,text,jsonb,text)', 'public.guard_sign_inventory()'] LOOP
  definition:=pg_get_functiondef(name::regprocedure);
  IF position('40001' in definition)=0 THEN RAISE EXCEPTION 'Expected business rejection code absent in %',name; END IF;
  definition:=replace(definition,'''40001''','''23514''');
  EXECUTE definition;
 END LOOP;
END $$;
ALTER FUNCTION public.reserve_sign_booking(uuid,text,jsonb,text) SET lock_timeout='2s';