CREATE OR REPLACE FUNCTION public.slt_stock_location(_raw text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO public AS $$
SELECT public.slt_normalize_location(_raw)
$$;
COMMENT ON FUNCTION public.slt_stock_location(text) IS 'Physical inventory location, not cash-register consolidation. Cross-location rentals require explicit transport.';
CREATE OR REPLACE FUNCTION public.check_availability(inquiry_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO public AS $$
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