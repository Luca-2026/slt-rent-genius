DO $migration$
DECLARE definition text;
BEGIN
  SELECT pg_get_functiondef('public.record_rental_staff_payments(uuid,uuid,jsonb,integer,jsonb,jsonb)'::regprocedure) INTO definition;
  IF position('ERRCODE=''40001''' in definition)=0 THEN
    RAISE EXCEPTION 'Expected payment conflict code not found';
  END IF;
  definition := replace(definition, 'ERRCODE=''40001''', 'ERRCODE=''PT409''');
  EXECUTE definition;
END
$migration$;
COMMENT ON FUNCTION public.record_rental_staff_payments(uuid,uuid,jsonb,integer,jsonb,jsonb) IS 'Stale payment snapshots are HTTP 409 business conflicts (PT409), not retryable serialization failures. Authorization and atomic receipt validation remain unchanged.';