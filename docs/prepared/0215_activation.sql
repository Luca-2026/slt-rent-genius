-- Exact live preconditions captured read-only before this narrowly scoped correction.
DO $guard$ BEGIN
 IF md5(pg_get_functiondef('public.check_availability(uuid)'::regprocedure)) <> '8447786c3f1b8d69369711eaff8ae2c8'
 OR md5(pg_get_functiondef('public.check_inventory_availability(text,text,date,date,uuid,uuid)'::regprocedure)) <> 'c2928f57ab698b172fddcd38dfe59257'
 OR md5(pg_get_functiondef('public.confirm_order(uuid,jsonb)'::regprocedure)) <> '3b52f61a470ab435b638dce6c8859ead' THEN
 RAISE EXCEPTION 'Live-Funktionen inzwischen geändert; Aktivierung abgebrochen'; END IF;
END $guard$;

-- Narrow quantity guard: no stock rows, prices, roles or business records are changed.
-- Same inclusive Berlin-day and existing slt_stock_location pools as availability.
CREATE OR REPLACE FUNCTION public.slt_cms_inquiry_claims(_row jsonb)
RETURNS TABLE(product_id uuid, pool text, first_day date, last_day date, qty integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.rental_inquiries; it jsonb; p public.b2b_managed_products; per record;
BEGIN
 r := jsonb_populate_record(NULL::public.rental_inquiries, _row);
 IF r.status IN ('cancelled','rejected') OR NOT COALESCE(r.status='accepted' OR r.order_confirmed_at IS NOT NULL,false) THEN RETURN; END IF;
 IF COALESCE((r.offer_payload->>'undated_offer')::boolean,false) THEN RETURN; END IF;
 FOR it IN SELECT value FROM jsonb_array_elements(CASE WHEN jsonb_array_length(COALESCE(r.offer_payload->'items','[]'))>0 THEN r.offer_payload->'items' ELSE jsonb_build_array(jsonb_build_object('product_slug',r.product_id,'product_name',r.product_name,'articles',r.quantity)) END) LOOP
  IF COALESCE((it->>'period_free')::boolean,false) THEN CONTINUE; END IF;
  SELECT * INTO p FROM public.b2b_managed_products m WHERE m.slug=it->>'product_slug' OR m.id::text=it->>'product_slug' ORDER BY (m.slug=it->>'product_slug') DESC LIMIT 1;
  IF NOT FOUND THEN
   -- Legacy references may contain the display name instead of the slug/UUID.
   SELECT * INTO p FROM public.b2b_managed_products m WHERE lower(m.name)=lower(it->>'product_name') AND (SELECT count(*) FROM public.b2b_managed_products m2 WHERE lower(m2.name)=lower(it->>'product_name'))=1;
   IF NOT FOUND THEN CONTINUE; END IF;
  END IF;
  -- The separate direct-sign engine/holds and instance engine remain authoritative.
  IF p.slug='halteverbotsschilder-set' OR EXISTS(SELECT 1 FROM public.b2b_product_instances x WHERE x.managed_product_id=p.id AND x.status NOT IN ('retired','lost')) THEN CONTINUE; END IF;
  IF NOT EXISTS(SELECT 1 FROM jsonb_each_text(COALESCE(p.quantities,'{}')) x(k,v) WHERE v~'^[0-9]+$' AND v::numeric>0) THEN CONTINUE; END IF;
  product_id:=p.id; pool:=public.slt_stock_location(r.location);
  SELECT * INTO per FROM public.slt_item_period(r,it);
  first_day:=(per.from_at AT TIME ZONE 'Europe/Berlin')::date;
  last_day:=GREATEST(first_day,(per.to_at AT TIME ZONE 'Europe/Berlin')::date);
  qty:=GREATEST(COALESCE(NULLIF(it->>'articles','')::numeric,1)::integer,1);
  RETURN NEXT;
 END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.slt_cms_reservation_claims(_row jsonb)
RETURNS TABLE(product_id uuid, pool text, first_day date, last_day date, qty integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.b2b_reservations; p public.b2b_managed_products;
BEGIN
 r:=jsonb_populate_record(NULL::public.b2b_reservations,_row);
 IF NOT COALESCE(r.status IN ('pending','offer_sent','confirmed','active'),false) THEN RETURN; END IF;
 SELECT * INTO p FROM public.b2b_managed_products m WHERE m.slug=r.product_id OR m.id::text=r.product_id ORDER BY (m.slug=r.product_id) DESC LIMIT 1;
 IF NOT FOUND THEN
  SELECT * INTO p FROM public.b2b_managed_products m WHERE lower(m.name)=lower(r.product_name) AND (SELECT count(*) FROM public.b2b_managed_products m2 WHERE lower(m2.name)=lower(r.product_name))=1;
  IF NOT FOUND THEN RETURN; END IF;
 END IF;
 IF p.slug='halteverbotsschilder-set' THEN RETURN; END IF;
 IF EXISTS(SELECT 1 FROM public.b2b_product_instances x WHERE x.managed_product_id=p.id AND x.status NOT IN ('retired','lost')) THEN RETURN; END IF;
 IF NOT EXISTS(SELECT 1 FROM jsonb_each_text(COALESCE(p.quantities,'{}')) x(k,v) WHERE v~'^[0-9]+$' AND v::numeric>0) THEN RETURN; END IF;
 product_id:=p.id;pool:=public.slt_stock_location(r.location);first_day:=r.start_date;last_day:=GREATEST(r.start_date,COALESCE(r.end_date,r.start_date));qty:=GREATEST(COALESCE(r.quantity,1),1);
 RETURN NEXT;
END $$;

CREATE OR REPLACE FUNCTION public.slt_cms_all_claims()
RETURNS TABLE(product_id uuid,pool text,first_day date,last_day date,qty integer,booking_id uuid,representation text)
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public AS $$
 SELECT c.*,i.id,'inquiry'::text FROM public.rental_inquiries i CROSS JOIN LATERAL public.slt_cms_inquiry_claims(to_jsonb(i)) c
 UNION ALL
 SELECT c.*,COALESCE(r.inquiry_id,(SELECT i.id FROM public.rental_inquiries i WHERE i.b2b_reservation_id=r.id LIMIT 1),r.id),'reservation'::text
 FROM public.b2b_reservations r CROSS JOIN LATERAL public.slt_cms_reservation_claims(to_jsonb(r)) c
$$;

CREATE OR REPLACE FUNCTION public.slt_cms_validate_delta(_old jsonb,_new jsonb)
RETURNS void LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=public AS $$
DECLARE k record; day date; available integer; new_qty integer; old_qty integer; booked integer; current_claims jsonb;
BEGIN
 IF _old=_new THEN RETURN; END IF;
 -- A new READ COMMITTED snapshot after each product lock is required. Never promise
 -- availability under a stale REPEATABLE READ or SERIALIZABLE snapshot.
 IF current_setting('transaction_isolation') <> 'read committed' THEN RAISE EXCEPTION 'Mengenprüfung benötigt READ COMMITTED; Transaktion erneut starten' USING ERRCODE='40001'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_to_recordset(_new) c(product_id uuid,pool text,first_day date,last_day date,qty int) WHERE pool IS NULL OR first_day IS NULL OR last_day IS NULL OR qty IS NULL) THEN RAISE EXCEPTION 'Standort oder Mietzeitraum für Mengenprüfung unvollständig' USING ERRCODE='23514'; END IF;
 -- Product rows are the existing shared lock resource. UUID order covers every
 -- affected article in one statement, independent of line or location order.
 -- A product lock deliberately also serializes its separate location pools.
 PERFORM p.id FROM public.b2b_managed_products p WHERE p.id IN (SELECT c.product_id FROM jsonb_to_recordset(_old||_new) c(product_id uuid)) ORDER BY p.id FOR UPDATE;
 SELECT COALESCE(jsonb_agg(to_jsonb(c)),'[]') INTO current_claims FROM public.slt_cms_all_claims() c;
 FOR k IN SELECT DISTINCT c.product_id,c.pool FROM jsonb_to_recordset(_old||_new) c(product_id uuid,pool text) ORDER BY 1,2 LOOP
  SELECT public.slt_quantity_at(p.quantities,k.pool) INTO available FROM public.b2b_managed_products p WHERE p.id=k.product_id;
  FOR day IN SELECT DISTINCT d FROM (
   SELECT c.first_day d FROM jsonb_to_recordset(_old||_new||current_claims) c(product_id uuid,pool text,first_day date,last_day date) WHERE c.product_id=k.product_id AND c.pool=k.pool
   UNION SELECT c.last_day+1 FROM jsonb_to_recordset(_old||_new||current_claims) c(product_id uuid,pool text,first_day date,last_day date) WHERE c.product_id=k.product_id AND c.pool=k.pool
  ) points WHERE d IS NOT NULL ORDER BY d LOOP
   SELECT COALESCE(sum(c.qty),0) INTO new_qty FROM jsonb_to_recordset(_new) c(product_id uuid,pool text,first_day date,last_day date,qty int) WHERE c.product_id=k.product_id AND c.pool=k.pool AND day BETWEEN c.first_day AND c.last_day;
   SELECT COALESCE(sum(c.qty),0) INTO old_qty FROM jsonb_to_recordset(_old) c(product_id uuid,pool text,first_day date,last_day date,qty int) WHERE c.product_id=k.product_id AND c.pool=k.pool AND day BETWEEN c.first_day AND c.last_day;
   -- Releases and unchanged historical overbookings must not block bookkeeping,
   -- price-only amendments, cancellation, return or legitimate stock reductions.
   CONTINUE WHEN new_qty<=old_qty;
   IF available IS NULL THEN RAISE EXCEPTION 'CMS-Bestand für Standort nicht verlässlich bekannt' USING ERRCODE='23514'; END IF;
   IF EXISTS(SELECT 1 FROM jsonb_to_recordset(current_claims) c(product_id uuid,pool text,first_day date,last_day date) WHERE c.product_id=k.product_id AND (c.pool=k.pool OR c.pool IS NULL) AND (c.first_day IS NULL OR c.pool IS NULL)) THEN RAISE EXCEPTION 'Bestehender Mietzeitraum oder Standort unvollständig; Disposition prüfen' USING ERRCODE='23514'; END IF;
   -- A portal reservation and its linked inquiry describe the SAME booking.
   -- Keep the larger representation per day (including unmatched extra holds),
   -- not the sum of its duplicate representations. Different bookings sum.
   SELECT COALESCE(sum(q),0) INTO booked FROM (
    SELECT booking_id,max(qty_sum) q FROM (
     SELECT booking_id,representation,sum(qty) qty_sum FROM jsonb_to_recordset(current_claims) c(product_id uuid,pool text,first_day date,last_day date,qty int,booking_id uuid,representation text)
     WHERE c.product_id=k.product_id AND c.pool=k.pool AND day BETWEEN c.first_day AND c.last_day GROUP BY booking_id,representation
    ) by_representation GROUP BY booking_id
   ) by_booking;
   IF booked>available THEN RAISE EXCEPTION 'Artikel %: CMS-Bestand in % am % nicht ausreichend (% benötigt, % vorhanden)',k.product_id,k.pool,day,booked,available USING ERRCODE='23514'; END IF;
  END LOOP;
 END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.slt_cms_statement_guard()
RETURNS trigger LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=public AS $$
DECLARE old_rows jsonb:='[]';new_rows jsonb:='[]';old_claims jsonb:='[]';new_claims jsonb:='[]';helper text;
BEGIN
 helper:=CASE WHEN TG_TABLE_NAME='rental_inquiries' THEN 'slt_cms_inquiry_claims' ELSE 'slt_cms_reservation_claims' END;
 IF TG_OP<>'INSERT' THEN EXECUTE 'SELECT COALESCE(jsonb_agg(to_jsonb(r)),''[]''::jsonb) FROM cms_old r' INTO old_rows; END IF;
 IF TG_OP<>'DELETE' THEN EXECUTE 'SELECT COALESCE(jsonb_agg(to_jsonb(r)),''[]''::jsonb) FROM cms_new r' INTO new_rows; END IF;
 EXECUTE format('SELECT COALESCE(jsonb_agg(to_jsonb(c) ORDER BY c.product_id,c.pool,c.first_day,c.last_day,c.qty),''[]''::jsonb) FROM jsonb_array_elements($1) r CROSS JOIN LATERAL public.%I(r) c',helper) INTO old_claims USING old_rows;
 EXECUTE format('SELECT COALESCE(jsonb_agg(to_jsonb(c) ORDER BY c.product_id,c.pool,c.first_day,c.last_day,c.qty),''[]''::jsonb) FROM jsonb_array_elements($1) r CROSS JOIN LATERAL public.%I(r) c',helper) INTO new_claims USING new_rows;
 PERFORM public.slt_cms_validate_delta(old_claims,new_claims);
 RETURN NULL;
END $$;

REVOKE ALL ON FUNCTION public.slt_cms_inquiry_claims(jsonb),public.slt_cms_reservation_claims(jsonb),public.slt_cms_all_claims(),public.slt_cms_validate_delta(jsonb,jsonb),public.slt_cms_statement_guard() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.slt_cms_inquiry_claims(jsonb),public.slt_cms_reservation_claims(jsonb),public.slt_cms_all_claims(),public.slt_cms_validate_delta(jsonb,jsonb),public.slt_cms_statement_guard() TO service_role;
CREATE TRIGGER cms_quantity_insert AFTER INSERT ON public.rental_inquiries REFERENCING NEW TABLE AS cms_new FOR EACH STATEMENT EXECUTE FUNCTION public.slt_cms_statement_guard();
CREATE TRIGGER cms_quantity_update AFTER UPDATE ON public.rental_inquiries REFERENCING OLD TABLE AS cms_old NEW TABLE AS cms_new FOR EACH STATEMENT EXECUTE FUNCTION public.slt_cms_statement_guard();
CREATE TRIGGER cms_quantity_delete AFTER DELETE ON public.rental_inquiries REFERENCING OLD TABLE AS cms_old FOR EACH STATEMENT EXECUTE FUNCTION public.slt_cms_statement_guard();
CREATE TRIGGER cms_quantity_insert AFTER INSERT ON public.b2b_reservations REFERENCING NEW TABLE AS cms_new FOR EACH STATEMENT EXECUTE FUNCTION public.slt_cms_statement_guard();
CREATE TRIGGER cms_quantity_update AFTER UPDATE ON public.b2b_reservations REFERENCING OLD TABLE AS cms_old NEW TABLE AS cms_new FOR EACH STATEMENT EXECUTE FUNCTION public.slt_cms_statement_guard();
CREATE TRIGGER cms_quantity_delete AFTER DELETE ON public.b2b_reservations REFERENCING OLD TABLE AS cms_old FOR EACH STATEMENT EXECUTE FUNCTION public.slt_cms_statement_guard();
-- HOTFIX 0215 (vorbereitet, NICHT angewendet): Mengenbasierte Verfügbarkeit
-- 1) Belegung je Angebotsposition über slt_item_period (Positionsdaten, Anfrage nur Fallback, Europe/Berlin).
-- 2) Angenommene Aufträge inkl. ohne AB bleiben konservativ belegt; vorhandene ABs
--    bleiben auch bei done/abweichendem Status belegt. Stornierte/abgelehnte Aufträge nicht.
--    Unverbindliche Angebote ohne AB belegen nicht; B2B-Holds unverändert.
-- 3) check_availability: Berliner Kalendertag statt UTC-Cast; other_locations auch für CMS-Mengen (nur Anzeige).
-- Reservierungen (b2b_reservations) und Einzelgeräte-Allocations unverändert.
-- Rollback: docs/prepared/0215_availability_item_period_rollback.sql
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
  WHERE i.managed_product_id = v_product_id AND public.slt_stock_location(i.location::text) = v_loc AND i.status NOT IN ('retired', 'lost');
  IF EXISTS (SELECT 1 FROM public.b2b_product_instances i WHERE i.managed_product_id = v_product_id AND i.status NOT IN ('retired','lost')) THEN
    stock := COALESCE(v_instances, 0); stock_source := 'instances';
  ELSIF v_cms IS NOT NULL THEN
    stock := v_cms; stock_source := 'cms';
  ELSE
    stock := NULL; stock_source := 'none';
  END IF;

  WITH inquiry_lines AS (
    SELECT i.id, COALESCE(i.offer_number, 'Anfrage') AS ref, i.customer_name,
      (per.from_at AT TIME ZONE 'Europe/Berlin')::date AS s,
      (per.to_at AT TIME ZONE 'Europe/Berlin')::date AS e,
      GREATEST(COALESCE(NULLIF(item ->> 'articles', '')::int, NULLIF(substring(COALESCE(item ->> 'description', '') from '(\d+)\s*Artikel'), '')::int, 1), 1) AS qty
    FROM public.rental_inquiries i
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(i.offer_payload -> 'items', '[]'::jsonb)) AS item
    CROSS JOIN LATERAL public.slt_item_period(i, item) per
    WHERE i.status NOT IN ('cancelled', 'rejected') AND (i.status = 'accepted' OR i.order_confirmed_at IS NOT NULL)
      AND (_exclude_inquiry_id IS NULL OR i.id <> _exclude_inquiry_id)
      AND public.slt_stock_location(i.location) = v_loc
      AND (item ->> 'product_slug' IN (_slug,v_product_id::text) OR (v_product_name IS NOT NULL AND lower(item ->> 'product_name') = lower(v_product_name)))
  ),
  inquiry_raw AS (
    SELECT i.id, COALESCE(i.offer_number, 'Anfrage') AS ref, i.customer_name,
      public.slt_try_date(i.start_date) AS s,
      GREATEST(COALESCE(public.slt_try_date(i.end_date), public.slt_try_date(i.start_date)), public.slt_try_date(i.start_date)) AS e,
      GREATEST(COALESCE(i.quantity, 1), 1) AS qty
    FROM public.rental_inquiries i
    WHERE i.status NOT IN ('cancelled', 'rejected') AND (i.status = 'accepted' OR i.order_confirmed_at IS NOT NULL)
      AND (i.offer_payload IS NULL OR jsonb_array_length(COALESCE(i.offer_payload -> 'items', '[]'::jsonb)) = 0)
      AND (_exclude_inquiry_id IS NULL OR i.id <> _exclude_inquiry_id)
      AND public.slt_stock_location(i.location) = v_loc
      AND (i.product_id IN (_slug,v_product_id::text) OR (v_product_name IS NOT NULL AND lower(i.product_name) = lower(v_product_name)))
  ),
  reservations AS (
    SELECT r.id, 'Reservierung' AS ref, r.product_name AS customer_name, r.start_date AS s,
      GREATEST(COALESCE(r.end_date, r.start_date), r.start_date) AS e,
      GREATEST(COALESCE(r.quantity, 1), 1) AS qty
    FROM public.b2b_reservations r
    WHERE r.status IN ('pending', 'offer_sent', 'confirmed', 'active')
      AND (_exclude_reservation_id IS NULL OR r.id <> _exclude_reservation_id)
      AND (_exclude_inquiry_id IS NULL OR (r.inquiry_id IS DISTINCT FROM _exclude_inquiry_id AND NOT EXISTS (SELECT 1 FROM public.rental_inquiries own WHERE own.id=_exclude_inquiry_id AND own.b2b_reservation_id=r.id)))
      AND public.slt_stock_location(r.location) = v_loc
      AND (r.product_id IN (_slug,v_product_id::text) OR (v_product_name IS NOT NULL AND lower(r.product_name) = lower(v_product_name)))
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
 qstock int; qbooked int; all_ok boolean := true; ok boolean; src text; d1 date; d2 date;
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
  d1 := (per.from_at AT TIME ZONE 'Europe/Berlin')::date;
  d2 := (per.to_at AT TIME ZONE 'Europe/Berlin')::date;
  need := GREATEST(COALESCE(NULLIF(it->>'articles','')::numeric, 1)::int, 1);
  has_inst := EXISTS (SELECT 1 FROM public.b2b_product_instances WHERE managed_product_id = p.id AND status NOT IN ('retired','lost'));
  other := '{}'::jsonb;
  IF has_inst THEN
   src := 'instances';
   SELECT count(*) INTO free FROM public.slt_free_instances(p.id, loc, per.from_at, per.to_at, inq.id);
   FOREACH l IN ARRAY ARRAY['krefeld','bonn','muelheim'] LOOP
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
    -- Konservative Tagesprüfung: gleiche überlappende Positionen der aktuellen Anfrage
    -- gemeinsam prüfen, sonst könnten zwei Zeilen jeweils denselben letzten Artikel verwenden.
    SELECT COALESCE(sum(GREATEST(COALESCE(NULLIF(sibling->>'articles','')::numeric,1)::int,1)), need)::int INTO need
    FROM jsonb_array_elements(COALESCE(inq.offer_payload->'items','[]'::jsonb)) sibling
    CROSS JOIN LATERAL public.slt_item_period(inq, sibling) sibling_period
    WHERE (sibling->>'product_slug' IN (it->>'product_slug',p.id::text) OR lower(sibling->>'product_name')=lower(p.name))
      AND sibling_period.from_at IS NOT NULL
      AND daterange((sibling_period.from_at AT TIME ZONE 'Europe/Berlin')::date,
        GREATEST((sibling_period.from_at AT TIME ZONE 'Europe/Berlin')::date,(sibling_period.to_at AT TIME ZONE 'Europe/Berlin')::date),'[]') && daterange(d1,GREATEST(d1,d2),'[]');
    SELECT c.booked INTO qbooked FROM public.check_inventory_availability(it->>'product_slug', loc, d1, d2, inq.id, NULL) c;
    free := GREATEST(qstock - COALESCE(qbooked,0), 0);
    ok := free >= need;
    -- Nur Anzeige: Pool-Standorte (Mülheim zählt zu Krefeld) einmal je Bestandsstandort.
    FOR l IN SELECT DISTINCT public.slt_stock_location(x) FROM unnest(ARRAY['krefeld','bonn','muelheim']) x LOOP
     CONTINUE WHEN l = loc;
     other := other || jsonb_build_object(l, (SELECT GREATEST(COALESCE(c.stock,0) - COALESCE(c.booked,0), 0)
       FROM public.check_inventory_availability(it->>'product_slug', l, d1, d2, inq.id, NULL) c));
    END LOOP;
   END IF;
  END IF;
  all_ok := all_ok AND ok;
  res := res || jsonb_build_object('index', idx, 'product_name', COALESCE(it->>'product_name', p.name),
   'managed_product_id', p.id, 'needed', need, 'free', free, 'available', ok, 'source', src,
   'location', loc, 'from_at', per.from_at, 'to_at', per.to_at, 'other_locations', other);
 END LOOP;
 RETURN jsonb_build_object('inquiry_id', inq.id, 'location', loc, 'all_available', all_ok, 'items', res);
END $function$;

CREATE OR REPLACE FUNCTION public.confirm_order(inquiry_id uuid, decisions jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  inq public.rental_inquiries; uid uuid := auth.uid(); mode text := COALESCE(decisions->>'mode','confirm');
  it jsonb; idx int := -1; p record; per record; loc text; need int; d jsonb; src_loc text; inst uuid; k int;
  payload jsonb; extra jsonb := '[]'::jsonb; n_alloc int := 0; n_trans int := 0; cost numeric; charged boolean; tracked boolean;
BEGIN
  IF NOT public.can_edit_operations(uid) THEN RAISE EXCEPTION 'Keine Berechtigung'; END IF;
  SELECT * INTO inq FROM public.rental_inquiries r WHERE r.id = inquiry_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Anfrage nicht gefunden'; END IF;
  IF mode = 'pending' THEN
    UPDATE public.rental_inquiries SET availability_pending = true WHERE id = inq.id;
    INSERT INTO public.rental_inquiry_events(rental_inquiry_id, event, details, user_id) VALUES (inq.id, 'availability_pending', decisions, uid);
    RETURN jsonb_build_object('mode', mode);
  ELSIF mode = 'reject' THEN
    UPDATE public.rental_inquiries SET status = 'rejected', availability_pending = false WHERE id = inq.id;
    INSERT INTO public.rental_inquiry_events(rental_inquiry_id, event, details, user_id) VALUES (inq.id, 'availability_rejected', decisions, uid);
    RETURN jsonb_build_object('mode', mode);
  ELSIF mode <> 'confirm' THEN RAISE EXCEPTION 'Ungültige Entscheidung';
  END IF;
  IF inq.status <> 'accepted' THEN RAISE EXCEPTION 'Nur angenommene Angebote können bestätigt werden'; END IF;
  PERFORM public.slt_cms_validate_delta('[]'::jsonb, COALESCE((SELECT jsonb_agg(to_jsonb(c)) FROM public.slt_cms_inquiry_claims(to_jsonb(inq)) c),'[]'::jsonb));
  -- Bereits belegt (erneuter Versand): nichts doppelt buchen
  IF EXISTS (SELECT 1 FROM public.b2b_instance_allocations a WHERE a.rental_inquiry_id = inq.id) THEN
    RETURN jsonb_build_object('mode', mode, 'already_allocated', true);
  END IF;
  loc := public.slt_normalize_location(inq.location);
  payload := COALESCE(inq.offer_payload, '{}'::jsonb);
  FOR it IN SELECT * FROM jsonb_array_elements(COALESCE(payload->'items','[]'::jsonb)) LOOP
    idx := idx + 1;
    CONTINUE WHEN COALESCE(it->>'product_slug','') = '';
    SELECT id, name INTO p FROM public.b2b_managed_products WHERE slug = it->>'product_slug';
    CONTINUE WHEN NOT FOUND;
    tracked := EXISTS (SELECT 1 FROM public.b2b_product_instances WHERE managed_product_id = p.id);
    CONTINUE WHEN NOT tracked;
    SELECT * INTO per FROM public.slt_item_period(inq, it);
    CONTINUE WHEN per.from_at IS NULL;
    need := GREATEST(COALESCE(NULLIF(it->>'articles','')::numeric, 1)::int, 1);
    d := decisions->'items'->(idx::text);
    FOR k IN 1..need LOOP
      inst := NULL;
      SELECT f INTO inst FROM public.slt_free_instances(p.id, loc, per.from_at, per.to_at, NULL) f LIMIT 1;
      IF inst IS NULL THEN
        IF d IS NULL OR d->>'action' <> 'order_from' THEN
          RAISE EXCEPTION '% ist am Standort % im Zeitraum nicht verfügbar', COALESCE(it->>'product_name', p.name), loc;
        END IF;
        src_loc := public.slt_normalize_location(d->>'source');
        SELECT f INTO inst FROM public.slt_free_instances(p.id, src_loc, per.from_at, per.to_at, NULL) f LIMIT 1;
        IF inst IS NULL THEN RAISE EXCEPTION '% ist auch in % nicht frei', COALESCE(it->>'product_name', p.name), src_loc; END IF;
        cost := NULLIF(d->>'transport_cost','')::numeric;
        charged := COALESCE((d->>'cost_charged')::boolean, false) AND COALESCE(cost,0) > 0;
        INSERT INTO public.b2b_transport_orders(instance_id, managed_product_id, from_location, to_location, due_at, rental_inquiry_id, transport_cost, cost_charged, created_by)
          VALUES (inst, p.id, src_loc, loc, per.from_at, inq.id, cost, charged, uid);
        UPDATE public.b2b_product_instances SET location = loc, updated_by = uid, updated_at = now() WHERE id = inst;
        n_trans := n_trans + 1;
        IF charged THEN
          extra := extra || jsonb_build_object('product_name', 'Überführung ' || COALESCE(it->>'product_name', p.name),
            'description', 'Überführung von ' || initcap(src_loc) || ' nach ' || initcap(loc),
            'quantity', 1, 'articles', 1, 'unit', 'pauschal', 'unit_price', cost, 'discount_percent', 0);
        END IF;
      END IF;
      INSERT INTO public.b2b_instance_allocations(instance_id, rental_inquiry_id, managed_product_id, from_at, to_at, kind, created_by)
        VALUES (inst, inq.id, p.id, per.from_at, per.to_at, 'rental', uid);
      n_alloc := n_alloc + 1;
    END LOOP;
  END LOOP;
  IF jsonb_array_length(extra) > 0 THEN
    payload := jsonb_set(payload, '{items}', COALESCE(payload->'items','[]'::jsonb) || extra);
    UPDATE public.rental_inquiries SET offer_payload = payload WHERE id = inq.id;
  END IF;
  UPDATE public.rental_inquiries SET availability_pending = false, order_confirmed_at = COALESCE(order_confirmed_at, now()) WHERE id = inq.id;
  INSERT INTO public.rental_inquiry_events(rental_inquiry_id, event, details, user_id)
    VALUES (inq.id, 'order_confirmed', jsonb_build_object('decisions', decisions, 'allocations', n_alloc, 'transports', n_trans, 'charged_items', extra), uid);
  RETURN jsonb_build_object('mode', mode, 'allocations', n_alloc, 'transports', n_trans);
END $function$;
