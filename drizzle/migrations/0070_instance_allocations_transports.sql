CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;

ALTER TABLE public.rental_inquiries ADD COLUMN IF NOT EXISTS availability_pending boolean NOT NULL DEFAULT false;

CREATE TABLE public.b2b_instance_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES public.b2b_product_instances(id) ON DELETE RESTRICT,
  rental_inquiry_id uuid NOT NULL REFERENCES public.rental_inquiries(id) ON DELETE CASCADE,
  managed_product_id uuid NOT NULL,
  from_at timestamptz NOT NULL,
  to_at timestamptz NOT NULL,
  kind text NOT NULL DEFAULT 'rental' CHECK (kind IN ('rental','transport')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (to_at > from_at),
  CONSTRAINT b2b_instance_allocations_no_overlap EXCLUDE USING gist (instance_id WITH =, tstzrange(from_at, to_at, '[)') WITH &&)
);
CREATE INDEX b2b_instance_allocations_range_idx ON public.b2b_instance_allocations (instance_id, from_at, to_at);
CREATE INDEX b2b_instance_allocations_inquiry_idx ON public.b2b_instance_allocations (rental_inquiry_id);
GRANT SELECT ON public.b2b_instance_allocations TO authenticated;
GRANT ALL ON public.b2b_instance_allocations TO service_role;
ALTER TABLE public.b2b_instance_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view allocations" ON public.b2b_instance_allocations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_staff_member(auth.uid()));

CREATE TABLE public.b2b_transport_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES public.b2b_product_instances(id) ON DELETE RESTRICT,
  managed_product_id uuid NOT NULL,
  from_location text NOT NULL,
  to_location text NOT NULL,
  due_at timestamptz NOT NULL,
  rental_inquiry_id uuid REFERENCES public.rental_inquiries(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','cancelled')),
  transport_cost numeric,
  cost_charged boolean NOT NULL DEFAULT false,
  done_at timestamptz,
  done_by uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX b2b_transport_orders_status_idx ON public.b2b_transport_orders (status, due_at);
GRANT SELECT, UPDATE ON public.b2b_transport_orders TO authenticated;
GRANT ALL ON public.b2b_transport_orders TO service_role;
ALTER TABLE public.b2b_transport_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view transports" ON public.b2b_transport_orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_staff_member(auth.uid()));
CREATE POLICY "Operations update transports" ON public.b2b_transport_orders FOR UPDATE TO authenticated
  USING (public.can_edit_operations(auth.uid())) WITH CHECK (public.can_edit_operations(auth.uid()));

CREATE TABLE public.rental_inquiry_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_inquiry_id uuid NOT NULL REFERENCES public.rental_inquiries(id) ON DELETE CASCADE,
  event text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX rental_inquiry_events_inquiry_idx ON public.rental_inquiry_events (rental_inquiry_id, created_at);
GRANT SELECT ON public.rental_inquiry_events TO authenticated;
GRANT ALL ON public.rental_inquiry_events TO service_role;
ALTER TABLE public.rental_inquiry_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view inquiry events" ON public.rental_inquiry_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_staff_member(auth.uid()));

-- Zeitraum einer Position (Europe/Berlin); Positionsdaten haben Vorrang vor der Anfrage
CREATE OR REPLACE FUNCTION public.slt_item_period(_inq public.rental_inquiries, _item jsonb, OUT from_at timestamptz, OUT to_at timestamptz)
LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE sd date; ed date; st time; et time;
BEGIN
  sd := COALESCE(public.slt_try_date(_item->>'rental_start'), public.slt_try_date(_inq.start_date));
  ed := COALESCE(public.slt_try_date(_item->>'rental_end'), public.slt_try_date(_inq.end_date), sd);
  BEGIN st := NULLIF(_inq.start_time,'')::time; EXCEPTION WHEN others THEN st := NULL; END;
  BEGIN et := NULLIF(_inq.end_time,'')::time; EXCEPTION WHEN others THEN et := NULL; END;
  IF sd IS NULL THEN from_at := NULL; to_at := NULL; RETURN; END IF;
  from_at := ((sd + COALESCE(st, time '00:00'))::timestamp) AT TIME ZONE 'Europe/Berlin';
  to_at := ((ed + COALESCE(et, time '23:59'))::timestamp) AT TIME ZONE 'Europe/Berlin';
  IF to_at <= from_at THEN to_at := from_at + interval '1 minute'; END IF;
END $$;

-- Freie Einzelgeräte eines Artikels an einem Standort im Zeitraum
CREATE OR REPLACE FUNCTION public.slt_free_instances(_product uuid, _location text, _from timestamptz, _to timestamptz, _exclude_inquiry uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT i.id FROM public.b2b_product_instances i
  WHERE i.managed_product_id = _product
    AND public.slt_normalize_location(i.location) = _location
    AND i.status::text IN ('available','rented')
    AND NOT EXISTS (SELECT 1 FROM public.b2b_instance_allocations a
                    WHERE a.instance_id = i.id
                      AND (_exclude_inquiry IS NULL OR a.rental_inquiry_id <> _exclude_inquiry)
                      AND tstzrange(a.from_at, a.to_at, '[)') && tstzrange(_from, _to, '[)'))
  ORDER BY i.internal_inventory_number NULLS LAST, i.created_at
$$;
REVOKE ALL ON FUNCTION public.slt_free_instances(uuid, text, timestamptz, timestamptz, uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.check_availability(inquiry_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  inq public.rental_inquiries; it jsonb; idx int := -1; p record; per record;
  loc text; need int; free int; other jsonb; l text; res jsonb := '[]'::jsonb; has_inst boolean;
  qstock int; qbooked int; all_ok boolean := true; ok boolean; src text;
BEGIN
  IF NOT public.can_edit_operations(auth.uid()) THEN RAISE EXCEPTION 'Keine Berechtigung'; END IF;
  SELECT * INTO inq FROM public.rental_inquiries r WHERE r.id = inquiry_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Anfrage nicht gefunden'; END IF;
  loc := public.slt_normalize_location(inq.location);
  FOR it IN SELECT * FROM jsonb_array_elements(COALESCE(inq.offer_payload->'items','[]'::jsonb)) LOOP
    idx := idx + 1;
    CONTINUE WHEN COALESCE(it->>'product_slug','') = '';
    SELECT id, name, quantities INTO p FROM public.b2b_managed_products WHERE slug = it->>'product_slug';
    CONTINUE WHEN NOT FOUND;
    SELECT * INTO per FROM public.slt_item_period(inq, it);
    CONTINUE WHEN per.from_at IS NULL;
    need := GREATEST(COALESCE(NULLIF(it->>'articles','')::numeric, 1)::int, 1);
    has_inst := EXISTS (SELECT 1 FROM public.b2b_product_instances WHERE managed_product_id = p.id);
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
      qstock := COALESCE(NULLIF(p.quantities->>loc,'')::numeric,0)::int;
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
END $$;
REVOKE ALL ON FUNCTION public.check_availability(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_availability(uuid) TO authenticated;

-- decisions: {"mode":"confirm"|"pending"|"reject","items":{"<index>":{"action":"order_from","source":"bonn","transport_cost":50,"cost_charged":true}}}
CREATE OR REPLACE FUNCTION public.confirm_order(inquiry_id uuid, decisions jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
END $$;
REVOKE ALL ON FUNCTION public.confirm_order(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirm_order(uuid, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.backfill_allocations(dry_run boolean DEFAULT true)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inq public.rental_inquiries; it jsonb; p record; per record; loc text; need int; inst uuid; k int;
  ok jsonb := '[]'::jsonb; fail jsonb := '[]'::jsonb; skipped jsonb := '[]'::jsonb; got int;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Nur Admin'; END IF;
  FOR inq IN SELECT * FROM public.rental_inquiries r WHERE r.status = 'accepted'
      AND COALESCE(public.slt_try_date(r.end_date), public.slt_try_date(r.start_date)) >= (now() AT TIME ZONE 'Europe/Berlin')::date
      AND NOT EXISTS (SELECT 1 FROM public.b2b_instance_allocations a WHERE a.rental_inquiry_id = r.id)
      ORDER BY r.start_date LOOP
    loc := public.slt_normalize_location(inq.location);
    FOR it IN SELECT * FROM jsonb_array_elements(COALESCE(inq.offer_payload->'items','[]'::jsonb)) LOOP
      CONTINUE WHEN COALESCE(it->>'product_slug','') = '';
      SELECT id, name INTO p FROM public.b2b_managed_products WHERE slug = it->>'product_slug';
      IF NOT FOUND OR NOT EXISTS (SELECT 1 FROM public.b2b_product_instances WHERE managed_product_id = p.id) THEN
        skipped := skipped || jsonb_build_object('offer', inq.offer_number, 'customer', inq.customer_name, 'item', it->>'product_name', 'reason', 'keine Einzelgeräte angelegt');
        CONTINUE;
      END IF;
      SELECT * INTO per FROM public.slt_item_period(inq, it);
      need := GREATEST(COALESCE(NULLIF(it->>'articles','')::numeric, 1)::int, 1);
      SELECT count(*) INTO got FROM public.slt_free_instances(p.id, loc, per.from_at, per.to_at, NULL);
      IF got < need THEN
        fail := fail || jsonb_build_object('offer', inq.offer_number, 'customer', inq.customer_name, 'item', it->>'product_name', 'location', loc, 'needed', need, 'free', got, 'from_at', per.from_at, 'to_at', per.to_at);
        CONTINUE;
      END IF;
      IF NOT dry_run THEN
        FOR k IN 1..need LOOP
          SELECT f INTO inst FROM public.slt_free_instances(p.id, loc, per.from_at, per.to_at, NULL) f LIMIT 1;
          INSERT INTO public.b2b_instance_allocations(instance_id, rental_inquiry_id, managed_product_id, from_at, to_at, kind, created_by)
            VALUES (inst, inq.id, p.id, per.from_at, per.to_at, 'rental', auth.uid());
        END LOOP;
      END IF;
      ok := ok || jsonb_build_object('offer', inq.offer_number, 'customer', inq.customer_name, 'item', it->>'product_name', 'location', loc, 'count', need, 'from_at', per.from_at, 'to_at', per.to_at);
    END LOOP;
  END LOOP;
  RETURN jsonb_build_object('dry_run', dry_run, 'allocated', ok, 'not_assignable', fail, 'skipped', skipped);
END $$;
REVOKE ALL ON FUNCTION public.backfill_allocations(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.backfill_allocations(boolean) TO authenticated;