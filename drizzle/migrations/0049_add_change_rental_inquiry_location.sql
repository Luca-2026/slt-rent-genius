-- Standort einer Mietanfrage nachträglich ändern (z. B. Abholung an anderem Standort).
-- Zentral als Security-Definer-Funktion, damit Anfrage, Standort-Postfach und
-- verknüpfte B2B-Reservierung atomar und mit denselben Rechten aktualisiert werden.
-- Versendete Angebote/Rechnungen bleiben unverändert (Snapshot/GoBD) – die neue
-- Fassung entsteht über die bestehende Angebotsüberarbeitung im Portal.

CREATE OR REPLACE FUNCTION public.change_rental_inquiry_location(_inquiry_id uuid, _new_location text)
RETURNS TABLE(old_location text, new_location text, reservations_updated integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _old text;
  _email text;
  _actor text;
  _res_count integer := 0;
  _note text;
  _label_old text;
  _label_new text;
BEGIN
  -- Operative Rechte wie bei Inventar/CMS/Protokollen: admin, niederlassungsleiter, standort_mitarbeiter.
  IF NOT public.can_edit_operations(auth.uid()) THEN
    RAISE EXCEPTION 'Keine Berechtigung für die Standortänderung';
  END IF;

  _new_location := public.slt_normalize_location(_new_location);
  IF _new_location NOT IN ('krefeld', 'bonn', 'muelheim') THEN
    RAISE EXCEPTION 'Ungültiger Standort: %', _new_location;
  END IF;

  SELECT public.slt_normalize_location(ri.location)
    INTO _old
    FROM public.rental_inquiries ri
   WHERE ri.id = _inquiry_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mietanfrage nicht gefunden';
  END IF;

  IF _old IS NOT DISTINCT FROM _new_location THEN
    RETURN QUERY SELECT _old, _new_location, 0;
    RETURN;
  END IF;

  _email := CASE _new_location
    WHEN 'bonn' THEN 'bonn@slt-rental.de'
    WHEN 'muelheim' THEN 'muelheim@slt-rental.de'
    ELSE 'krefeld@slt-rental.de'
  END;

  UPDATE public.rental_inquiries
     SET location = _new_location,
         location_email = _email
   WHERE id = _inquiry_id;

  -- Verknüpfte B2B-Reservierung(en) mitziehen, damit Bestand/Verfügbarkeit stimmen.
  UPDATE public.b2b_reservations r
     SET location = _new_location
   WHERE r.inquiry_id = _inquiry_id
      OR r.id = (SELECT ri.b2b_reservation_id FROM public.rental_inquiries ri WHERE ri.id = _inquiry_id);
  GET DIAGNOSTICS _res_count = ROW_COUNT;

  SELECT NULLIF(TRIM(CONCAT_WS(' ', sp.first_name, sp.last_name)), '')
    INTO _actor
    FROM public.staff_profiles sp
   WHERE sp.user_id = auth.uid()
   LIMIT 1;
  _actor := COALESCE(_actor, public.get_user_email(auth.uid()), 'Unbekannt');

  _label_old := CASE _old WHEN 'bonn' THEN 'Bonn' WHEN 'muelheim' THEN 'Mülheim an der Ruhr' WHEN 'krefeld' THEN 'Krefeld' ELSE COALESCE(_old, '–') END;
  _label_new := CASE _new_location WHEN 'bonn' THEN 'Bonn' WHEN 'muelheim' THEN 'Mülheim an der Ruhr' ELSE 'Krefeld' END;

  -- Nachvollziehbarkeit: Änderung als eigene Zeile in den internen Notizen festhalten.
  _note := '[' || to_char(now() AT TIME ZONE 'Europe/Berlin', 'DD.MM.YYYY, HH24:MI') || ' Uhr] Standort geändert: '
        || _label_old || ' → ' || _label_new || ' (durch ' || _actor || ')';

  UPDATE public.rental_inquiries
     SET internal_notes = CASE
           WHEN internal_notes IS NULL OR btrim(internal_notes) = '' THEN _note
           ELSE internal_notes || E'\n' || _note
         END
   WHERE id = _inquiry_id;

  RETURN QUERY SELECT _old, _new_location, _res_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.change_rental_inquiry_location(uuid, text) TO authenticated;