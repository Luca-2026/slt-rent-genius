CREATE OR REPLACE FUNCTION public.close_rental_without_protocol(_inquiry_id uuid, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.rental_inquiries;
BEGIN
  IF NOT coalesce(public.is_super_admin(auth.uid()), false) THEN
    RAISE EXCEPTION 'Nur Superadmins dürfen Aufträge ohne Rückgabeprotokoll abschließen.' USING ERRCODE = '42501';
  END IF;
  IF length(trim(coalesce(_reason, ''))) < 5 THEN
    RAISE EXCEPTION 'Bitte einen Grund angeben (mindestens 5 Zeichen).' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO r FROM public.rental_inquiries WHERE id = _inquiry_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Auftrag nicht gefunden.' USING ERRCODE = 'P0002'; END IF;
  IF r.status NOT IN ('accepted', 'done') THEN
    RAISE EXCEPTION 'Nur angenommene Aufträge können manuell abgeschlossen werden.' USING ERRCODE = '22023';
  END IF;
  IF r.closed_manually_at IS NOT NULL THEN RETURN; END IF;
  UPDATE public.rental_inquiries
     SET closed_manually_at = now(), closed_manually_by = auth.uid(), closed_manually_reason = trim(_reason), status = 'done'
   WHERE id = _inquiry_id;
  INSERT INTO public.rental_inquiry_events (rental_inquiry_id, user_id, event, details)
  VALUES (_inquiry_id, auth.uid(), 'closed_without_return_protocol', jsonb_build_object('reason', trim(_reason), 'previous_status', r.status));
END $$;
REVOKE ALL ON FUNCTION public.close_rental_without_protocol(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.close_rental_without_protocol(uuid, text) TO authenticated;