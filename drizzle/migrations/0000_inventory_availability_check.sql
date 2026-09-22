-- Hilfsfunktionen für die Bestandsprüfung im Angebotsprozess
CREATE OR REPLACE FUNCTION public.slt_normalize_location(_raw text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN _raw IS NULL OR btrim(_raw) = '' THEN NULL
    WHEN lower(_raw) LIKE '%bonn%' THEN 'bonn'
    WHEN lower(_raw) LIKE '%lheim%' OR lower(_raw) LIKE '%mulheim%' THEN 'muelheim'
    WHEN lower(_raw) LIKE '%krefeld%' THEN 'krefeld'
    ELSE lower(btrim(_raw))
  END
$$;

CREATE OR REPLACE FUNCTION public.slt_try_date(_raw text)
RETURNS date
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN _raw ~ '^\d{4}-\d{2}-\d{2}' THEN to_date(substring(_raw from 1 for 10), 'YYYY-MM-DD')
    ELSE NULL
  END
$$;

-- Verfügbarkeitsprüfung: Bestand je Standort gegen alle Belegungen im Zeitraum.
CREATE OR REPLACE FUNCTION public.check_inventory_availability(
  _slug text,
  _location text,
  _start date,
  _end date,
  _exclude_inquiry_id uuid DEFAULT NULL,
  _exclude_reservation_id uuid DEFAULT NULL
)
RETURNS TABLE (stock integer, stock_source text, booked integer, conflicts jsonb)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_loc text := public.slt_normalize_location(_location);
  v_product_id uuid;
  v_product_name text;
  v_quantities jsonb;
  v_cms int;
  v_instances int;
  v_start date := COALESCE(_start, CURRENT_DATE);
  v_end date := COALESCE(_end, _start, CURRENT_DATE);
BEGIN
  IF NOT (public.is_staff_member(auth.uid()) OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Nicht berechtigt';
  END IF;

  IF v_end < v_start THEN
    v_end := v_start;
  END IF;

  SELECT p.id, p.name, p.quantities INTO v_product_id, v_product_name, v_quantities
  FROM public.b2b_managed_products p
  WHERE p.slug = _slug;

  -- 1) Bestand: CMS-Menge hat Vorrang, sonst gezählte Einzelartikel
  v_cms := NULLIF(v_quantities ->> v_loc, '')::int;

  SELECT count(*)::int INTO v_instances
  FROM public.b2b_product_instances i
  WHERE i.managed_product_id = v_product_id
    AND public.slt_normalize_location(i.location::text) = v_loc
    AND i.status NOT IN ('retired', 'lost');

  IF v_cms IS NOT NULL THEN
    stock := v_cms;
    stock_source := 'cms';
  ELSIF COALESCE(v_instances, 0) > 0 THEN
    stock := v_instances;
    stock_source := 'instances';
  ELSE
    stock := NULL;
    stock_source := 'none';
  END IF;

  -- 2) Belegungen im Zeitraum (Anfragen mit Angebot, Roh-Anfragen, B2B-Reservierungen)
  WITH inquiry_lines AS (
    SELECT
      i.id,
      COALESCE(i.offer_number, 'Anfrage') AS ref,
      i.customer_name,
      public.slt_try_date(i.start_date) AS s,
      COALESCE(public.slt_try_date(i.end_date), public.slt_try_date(i.start_date)) AS e,
      GREATEST(
        COALESCE(
          NULLIF(item ->> 'articles', '')::int,
          NULLIF(substring(COALESCE(item ->> 'description', '') from '(\d+)\s*Artikel'), '')::int,
          1
        ), 1
      ) AS qty
    FROM public.rental_inquiries i
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(i.offer_payload -> 'items', '[]'::jsonb)) AS item
    WHERE i.status IN ('in_progress', 'offer_sent', 'accepted')
      AND (_exclude_inquiry_id IS NULL OR i.id <> _exclude_inquiry_id)
      AND public.slt_normalize_location(i.location) = v_loc
      AND (
        item ->> 'product_slug' = _slug
        OR (v_product_name IS NOT NULL AND lower(item ->> 'product_name') = lower(v_product_name))
      )
  ),
  inquiry_raw AS (
    SELECT
      i.id,
      COALESCE(i.offer_number, 'Anfrage') AS ref,
      i.customer_name,
      public.slt_try_date(i.start_date) AS s,
      COALESCE(public.slt_try_date(i.end_date), public.slt_try_date(i.start_date)) AS e,
      GREATEST(COALESCE(i.quantity, 1), 1) AS qty
    FROM public.rental_inquiries i
    WHERE i.status IN ('in_progress', 'offer_sent', 'accepted')
      AND (i.offer_payload IS NULL OR jsonb_array_length(COALESCE(i.offer_payload -> 'items', '[]'::jsonb)) = 0)
      AND (_exclude_inquiry_id IS NULL OR i.id <> _exclude_inquiry_id)
      AND public.slt_normalize_location(i.location) = v_loc
      AND (
        i.product_id = _slug
        OR (v_product_name IS NOT NULL AND lower(i.product_name) = lower(v_product_name))
      )
  ),
  reservations AS (
    SELECT
      r.id,
      'Reservierung' AS ref,
      r.product_name AS customer_name,
      r.start_date AS s,
      COALESCE(r.end_date, r.start_date) AS e,
      GREATEST(COALESCE(r.quantity, 1), 1) AS qty
    FROM public.b2b_reservations r
    WHERE r.status IN ('pending', 'offer_sent', 'confirmed', 'active')
      AND (_exclude_reservation_id IS NULL OR r.id <> _exclude_reservation_id)
      AND public.slt_normalize_location(r.location) = v_loc
      AND (
        r.product_id = _slug
        OR (v_product_name IS NOT NULL AND lower(r.product_name) = lower(v_product_name))
      )
  ),
  all_rows AS (
    SELECT * FROM inquiry_lines
    UNION ALL SELECT * FROM inquiry_raw
    UNION ALL SELECT * FROM reservations
  ),
  overlapping AS (
    SELECT *
    FROM all_rows
    WHERE s IS NOT NULL
      AND daterange(s, COALESCE(e, s), '[]') && daterange(v_start, v_end, '[]')
  )
  SELECT
    COALESCE(sum(qty), 0)::int,
    COALESCE(
      jsonb_agg(jsonb_build_object(
        'id', id, 'ref', ref, 'label', customer_name,
        'start', s, 'end', COALESCE(e, s), 'quantity', qty
      ) ORDER BY s),
      '[]'::jsonb
    )
  INTO booked, conflicts
  FROM overlapping;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.check_inventory_availability(text, text, date, date, uuid, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.check_inventory_availability(text, text, date, date, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_inventory_availability(text, text, date, date, uuid, uuid) TO service_role;