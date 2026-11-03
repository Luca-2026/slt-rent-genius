CREATE OR REPLACE FUNCTION public.slt_stock_location(_raw text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT CASE public.slt_normalize_location(_raw) WHEN 'muelheim' THEN 'krefeld' ELSE public.slt_normalize_location(_raw) END $$;

CREATE OR REPLACE FUNCTION public.slt_quantity_at(_q jsonb, _stock_loc text)
RETURNS int LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT CASE WHEN count(*) = 0 THEN NULL ELSE sum(v::int)::int END
  FROM jsonb_each_text(COALESCE(_q,'{}'::jsonb)) e(k,v)
  WHERE v ~ '^[0-9]+$' AND public.slt_stock_location(k) = _stock_loc $$;

CREATE OR REPLACE FUNCTION public.slt_free_instances(_product uuid, _location text, _from timestamp with time zone, _to timestamp with time zone, _exclude_inquiry uuid)
 RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT i.id FROM public.b2b_product_instances i
  WHERE i.managed_product_id = _product
    AND public.slt_stock_location(i.location::text) = public.slt_stock_location(_location)
    AND i.status::text IN ('available','rented')
    AND NOT EXISTS (SELECT 1 FROM public.b2b_instance_allocations a
                    WHERE a.instance_id = i.id
                      AND (_exclude_inquiry IS NULL OR a.rental_inquiry_id <> _exclude_inquiry)
                      AND tstzrange(a.from_at, a.to_at, '[)') && tstzrange(_from, _to, '[)'))
  ORDER BY i.internal_inventory_number NULLS LAST, i.created_at
$function$;

CREATE OR REPLACE FUNCTION public.check_inventory_availability(_slug text, _location text, _start date, _end date, _exclude_inquiry_id uuid DEFAULT NULL::uuid, _exclude_reservation_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(stock integer, stock_source text, booked integer, conflicts jsonb)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_loc text := public.slt_stock_location(_location);
  v_product_id uuid; v_product_name text; v_quantities jsonb; v_cms int; v_instances int;
  v_start date := COALESCE(_start, CURRENT_DATE);
  v_end date := COALESCE(_end, _start, CURRENT_DATE);
BEGIN
  IF NOT (public.is_staff_member(auth.uid()) OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Nicht berechtigt';
  END IF;
  IF v_end < v_start THEN v_end := v_start; END IF;

  SELECT p.id, p.name, p.quantities INTO v_product_id, v_product_name, v_quantities
  FROM public.b2b_managed_products p WHERE p.slug = _slug;

  v_cms := public.slt_quantity_at(v_quantities, v_loc);
  SELECT count(*)::int INTO v_instances FROM public.b2b_product_instances i
  WHERE i.managed_product_id = v_product_id
    AND public.slt_stock_location(i.location::text) = v_loc
    AND i.status NOT IN ('retired', 'lost');

  -- Einzelgeräte mit Seriennummer haben Vorrang; Menge nur für Artikel ohne Einzelgeräte.
  IF EXISTS (SELECT 1 FROM public.b2b_product_instances i WHERE i.managed_product_id = v_product_id AND i.status NOT IN ('retired','lost')) THEN
    stock := COALESCE(v_instances, 0); stock_source := 'instances';
  ELSIF v_cms IS NOT NULL THEN
    stock := v_cms; stock_source := 'cms';
  ELSE
    stock := NULL; stock_source := 'none';
  END IF;

  WITH inquiry_lines AS (
    SELECT i.id, COALESCE(i.offer_number, 'Anfrage') AS ref, i.customer_name,
      public.slt_try_date(i.start_date) AS s,
      GREATEST(COALESCE(public.slt_try_date(i.end_date), public.slt_try_date(i.start_date)), public.slt_try_date(i.start_date)) AS e,
      GREATEST(COALESCE(NULLIF(item ->> 'articles', '')::int, NULLIF(substring(COALESCE(item ->> 'description', '') from '(\d+)\s*Artikel'), '')::int, 1), 1) AS qty
    FROM public.rental_inquiries i
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(i.offer_payload -> 'items', '[]'::jsonb)) AS item
    WHERE i.status IN ('in_progress', 'offer_sent', 'accepted')
      AND (_exclude_inquiry_id IS NULL OR i.id <> _exclude_inquiry_id)
      AND public.slt_stock_location(i.location) = v_loc
      AND (item ->> 'product_slug' = _slug OR (v_product_name IS NOT NULL AND lower(item ->> 'product_name') = lower(v_product_name)))
  ),
  inquiry_raw AS (
    SELECT i.id, COALESCE(i.offer_number, 'Anfrage') AS ref, i.customer_name,
      public.slt_try_date(i.start_date) AS s,
      GREATEST(COALESCE(public.slt_try_date(i.end_date), public.slt_try_date(i.start_date)), public.slt_try_date(i.start_date)) AS e,
      GREATEST(COALESCE(i.quantity, 1), 1) AS qty
    FROM public.rental_inquiries i
    WHERE i.status IN ('in_progress', 'offer_sent', 'accepted')
      AND (i.offer_payload IS NULL OR jsonb_array_length(COALESCE(i.offer_payload -> 'items', '[]'::jsonb)) = 0)
      AND (_exclude_inquiry_id IS NULL OR i.id <> _exclude_inquiry_id)
      AND public.slt_stock_location(i.location) = v_loc
      AND (i.product_id = _slug OR (v_product_name IS NOT NULL AND lower(i.product_name) = lower(v_product_name)))
  ),
  reservations AS (
    SELECT r.id, 'Reservierung' AS ref, r.product_name AS customer_name, r.start_date AS s,
      GREATEST(COALESCE(r.end_date, r.start_date), r.start_date) AS e,
      GREATEST(COALESCE(r.quantity, 1), 1) AS qty
    FROM public.b2b_reservations r
    WHERE r.status IN ('pending', 'offer_sent', 'confirmed', 'active')
      AND (_exclude_reservation_id IS NULL OR r.id <> _exclude_reservation_id)
      AND public.slt_stock_location(r.location) = v_loc
      AND (r.product_id = _slug OR (v_product_name IS NOT NULL AND lower(r.product_name) = lower(v_product_name)))
  ),
  all_rows AS (SELECT * FROM inquiry_lines UNION ALL SELECT * FROM inquiry_raw UNION ALL SELECT * FROM reservations),
  overlapping AS (
    SELECT * FROM all_rows
    WHERE s IS NOT NULL AND daterange(s, GREATEST(COALESCE(e, s), s), '[]') && daterange(v_start, v_end, '[]')
  )
  SELECT COALESCE(sum(qty), 0)::int,
    COALESCE(jsonb_agg(jsonb_build_object('id', id, 'ref', ref, 'label', customer_name, 'start', s, 'end', GREATEST(COALESCE(e, s), s), 'quantity', qty) ORDER BY s), '[]'::jsonb)
  INTO booked, conflicts FROM overlapping;
  RETURN NEXT;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_availability(inquiry_id uuid)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  inq public.rental_inquiries; it jsonb; idx int := -1; p record; per record;
  loc text; need int; free int; other jsonb; l text; res jsonb := '[]'::jsonb; has_inst boolean;
  qstock int; qbooked int; all_ok boolean := true; ok boolean; src text;
BEGIN
  IF NOT public.can_edit_operations(auth.uid()) THEN RAISE EXCEPTION 'Keine Berechtigung'; END IF;
  SELECT * INTO inq FROM public.rental_inquiries r WHERE r.id = inquiry_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Anfrage nicht gefunden'; END IF;
  loc := public.slt_stock_location(inq.location);
  FOR it IN SELECT * FROM jsonb_array_elements(COALESCE(inq.offer_payload->'items','[]'::jsonb)) LOOP
    idx := idx + 1;
    CONTINUE WHEN COALESCE(it->>'product_slug','') = '';
    SELECT id, name, quantities INTO p FROM public.b2b_managed_products WHERE slug = it->>'product_slug';
    CONTINUE WHEN NOT FOUND;
    SELECT * INTO per FROM public.slt_item_period(inq, it);
    CONTINUE WHEN per.from_at IS NULL;
    need := GREATEST(COALESCE(NULLIF(it->>'articles','')::numeric, 1)::int, 1);
    has_inst := EXISTS (SELECT 1 FROM public.b2b_product_instances WHERE managed_product_id = p.id AND status NOT IN ('retired','lost'));
    other := '{}'::jsonb;
    IF has_inst THEN
      src := 'instances';
      SELECT count(*) INTO free FROM public.slt_free_instances(p.id, loc, per.from_at, per.to_at, inq.id);
      FOREACH l IN ARRAY ARRAY['krefeld','bonn'] LOOP
        CONTINUE WHEN l = loc;
        other := other || jsonb_build_object(l, (SELECT count(*) FROM public.slt_free_instances(p.id, l, per.from_at, per.to_at, inq.id)));
      END LOOP;
      ok := free >= need;
    ELSE
      qstock := COALESCE(public.slt_quantity_at(p.quantities, loc), 0);
      IF COALESCE((SELECT sum(CASE WHEN v ~ '^[0-9]+$' THEN v::int ELSE 0 END) FROM jsonb_each_text(COALESCE(p.quantities,'{}')) e(k,v)),0) = 0 THEN
        src := 'untracked'; free := NULL; ok := true;
      ELSE
        src := 'quantities';
        SELECT c.booked INTO qbooked FROM public.check_inventory_availability(it->>'product_slug', loc, per.from_at::date, per.to_at::date, inq.id, NULL) c;
        free := GREATEST(qstock - COALESCE(qbooked,0), 0);
        ok := free >= need;
      END IF;
    END IF;
    all_ok := all_ok AND ok;
    res := res || jsonb_build_object('index', idx, 'product_name', COALESCE(it->>'product_name', p.name),
      'managed_product_id', p.id, 'needed', need, 'free', free, 'available', ok, 'source', src,
      'location', loc, 'from_at', per.from_at, 'to_at', per.to_at, 'other_locations', other);
  END LOOP;
  RETURN jsonb_build_object('inquiry_id', inq.id, 'location', loc, 'all_available', all_ok, 'items', res);
END $function$;