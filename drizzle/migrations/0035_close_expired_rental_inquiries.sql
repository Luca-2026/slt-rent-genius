CREATE OR REPLACE FUNCTION public.close_expired_rental_inquiries()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer;
BEGIN
  -- Mietzeitraum vorbei, kein Auftrag zustande gekommen -> erledigt
  UPDATE public.rental_inquiries
     SET status = 'done', updated_at = now()
   WHERE status IN ('new', 'in_progress', 'offer_sent')
     AND order_confirmed_at IS NULL
     AND public.slt_try_date(coalesce(nullif(end_date, ''), start_date)) < (now() AT TIME ZONE 'Europe/Berlin')::date;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;
REVOKE ALL ON FUNCTION public.close_expired_rental_inquiries() FROM PUBLIC, anon, authenticated;
SELECT cron.schedule('close-expired-rental-inquiries', '10 * * * *', $$SELECT public.close_expired_rental_inquiries();$$);