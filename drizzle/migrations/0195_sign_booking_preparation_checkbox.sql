ALTER TABLE public.sign_bookings ADD COLUMN prepared_at timestamptz, ADD COLUMN prepared_by uuid;
CREATE OR REPLACE FUNCTION public.set_sign_booking_prepared(_booking uuid, _prepared boolean, _expected timestamptz)
RETURNS public.sign_bookings
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE b public.sign_bookings; actor uuid := auth.uid();
BEGIN
  SELECT * INTO b FROM public.sign_bookings WHERE id = _booking FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Buchung nicht gefunden' USING ERRCODE='P0002'; END IF;
  IF actor IS NULL OR NOT (public.has_role(actor, 'admin') OR EXISTS (
    SELECT 1 FROM public.staff_profiles s WHERE s.user_id = actor AND s.is_active
    AND CASE WHEN s.location IN ('krefeld','muelheim') THEN 'krefeld' ELSE s.location END = CASE WHEN b.location IN ('krefeld','muelheim') THEN 'krefeld' ELSE b.location END
  )) THEN RAISE EXCEPTION 'Keine Berechtigung für diesen Standort' USING ERRCODE='42501'; END IF;
  IF b.prepared_at IS DISTINCT FROM _expected THEN RAISE EXCEPTION 'Vorbereitungsstatus wurde geändert. Bitte aktualisieren.' USING ERRCODE='PT409'; END IF;
  IF b.cancelled_at IS NOT NULL OR b.status NOT IN ('paid','reserved','review') OR EXISTS (SELECT 1 FROM public.rental_inquiries i WHERE i.id=b.inquiry_id AND i.status IN ('done','cancelled','rejected')) THEN
    RAISE EXCEPTION 'Abgeschlossene oder stornierte Buchungen bleiben unverändert' USING ERRCODE='23514';
  END IF;
  UPDATE public.sign_bookings SET prepared_at = CASE WHEN _prepared THEN now() ELSE NULL END, prepared_by = CASE WHEN _prepared THEN actor ELSE NULL END WHERE id=_booking RETURNING * INTO b;
  RETURN b;
END; $$;
REVOKE ALL ON FUNCTION public.set_sign_booking_prepared(uuid,boolean,timestamptz) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.set_sign_booking_prepared(uuid,boolean,timestamptz) TO authenticated;
COMMENT ON COLUMN public.sign_bookings.prepared_at IS 'Staff preparation checkbox only; not proof of handover, return, payment or rental completion.';