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
