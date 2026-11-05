DO $mig$
DECLARE d text;
BEGIN
  SELECT pg_get_functiondef('public.save_rental_order_amendment(uuid,integer,jsonb,text,timestamp with time zone)'::regprocedure) INTO d;
  IF position('SET start_date=(SELECT start_date FROM public.rental_inquiries WHERE id=_id),end_date=(SELECT end_date FROM public.rental_inquiries WHERE id=_id)' IN d) = 0 THEN
    RAISE EXCEPTION 'expected reservation date update not found';
  END IF;
  d := replace(d,
    'SET start_date=(SELECT start_date FROM public.rental_inquiries WHERE id=_id),end_date=(SELECT end_date FROM public.rental_inquiries WHERE id=_id)',
    'SET start_date=(SELECT start_date::date FROM public.rental_inquiries WHERE id=_id),end_date=(SELECT end_date::date FROM public.rental_inquiries WHERE id=_id)');
  EXECUTE d;
END
$mig$;