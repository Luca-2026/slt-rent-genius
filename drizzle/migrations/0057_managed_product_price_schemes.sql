CREATE OR REPLACE FUNCTION public.parse_price_text(_raw text)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  tok text;
  last_dot int;
  last_comma int;
  sep text;
  sep_pos int;
  decimals int;
BEGIN
  IF _raw IS NULL THEN RETURN NULL; END IF;
  tok := substring(regexp_replace(_raw, '\s', '', 'g') from '(\d[\d.,]*)');
  IF tok IS NULL THEN RETURN NULL; END IF;
  tok := regexp_replace(tok, '[.,]+$', '');
  last_dot := length(tok) - position('.' in reverse(tok)) + 1;
  IF position('.' in tok) = 0 THEN last_dot := 0; END IF;
  last_comma := length(tok) - position(',' in reverse(tok)) + 1;
  IF position(',' in tok) = 0 THEN last_comma := 0; END IF;
  IF last_dot > last_comma THEN sep := '.'; sep_pos := last_dot;
  ELSIF last_comma > last_dot THEN sep := ','; sep_pos := last_comma;
  ELSE sep := NULL; END IF;
  IF sep IS NOT NULL THEN
    decimals := length(tok) - sep_pos;
    IF decimals = 3 THEN
      tok := regexp_replace(tok, '[.,]', '', 'g');
    ELSE
      tok := regexp_replace(substring(tok from 1 for sep_pos - 1), '[.,]', '', 'g') || '.' || substring(tok from sep_pos + 1);
    END IF;
  END IF;
  RETURN tok::numeric;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

CREATE TABLE IF NOT EXISTS public.migration_price_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  managed_product_id uuid NOT NULL,
  old_values jsonb,
  new_values jsonb,
  warning text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.migration_price_log TO authenticated;
GRANT ALL ON public.migration_price_log TO service_role;
ALTER TABLE public.migration_price_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read migration price log" ON public.migration_price_log;
CREATE POLICY "Admins read migration price log" ON public.migration_price_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

DO $$
DECLARE
  fresh boolean := NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'b2b_managed_products' AND column_name = 'pricing_scheme'
  );
  event_cats text[] := ARRAY['beleuchtung','beschallung','buehne','traversen-rigging','moebel-zelte',
    'geschirr-glaeser-besteck','gastro-equipment','spezialeffekte','huepfburgen','kommunikation'];
BEGIN
  ALTER TABLE public.b2b_managed_products
    ADD COLUMN IF NOT EXISTS main_category text NOT NULL DEFAULT 'bau',
    ADD COLUMN IF NOT EXISTS pricing_scheme text NOT NULL DEFAULT 'bau',
    ADD COLUMN IF NOT EXISTS price_from_1_rd numeric(10,2),
    ADD COLUMN IF NOT EXISTS price_from_3_rd numeric(10,2),
    ADD COLUMN IF NOT EXISTS price_from_10_rd numeric(10,2),
    ADD COLUMN IF NOT EXISTS price_from_20_rd numeric(10,2),
    ADD COLUMN IF NOT EXISTS price_weekend_num numeric(10,2),
    ADD COLUMN IF NOT EXISTS price_base_1_3_cd numeric(10,2),
    ADD COLUMN IF NOT EXISTS surcharge_per_cd_from_4 numeric(10,2),
    ADD COLUMN IF NOT EXISTS surcharge_per_cd_from_8 numeric(10,2),
    ADD COLUMN IF NOT EXISTS prices_same_all_locations boolean NOT NULL DEFAULT true;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'b2b_managed_products_main_category_check') THEN
    ALTER TABLE public.b2b_managed_products ADD CONSTRAINT b2b_managed_products_main_category_check CHECK (main_category IN ('event','bau'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'b2b_managed_products_pricing_scheme_check') THEN
    ALTER TABLE public.b2b_managed_products ADD CONSTRAINT b2b_managed_products_pricing_scheme_check CHECK (pricing_scheme IN ('event','bau'));
  END IF;

  IF fresh THEN
    INSERT INTO public.migration_price_log (managed_product_id, old_values, new_values, warning)
    SELECT p.id,
      jsonb_build_object('price_per_day', p.price_per_day, 'price_weekend', p.price_weekend, 'price_per_month', p.price_per_month),
      jsonb_build_object('price_from_1_rd', public.parse_price_text(p.price_per_day),
        'price_weekend_num', public.parse_price_text(p.price_weekend),
        'price_from_20_rd', round(public.parse_price_text(p.price_per_month) / 20, 2)),
      concat_ws('; ',
        CASE WHEN nullif(trim(p.price_per_day), '') IS NOT NULL AND public.parse_price_text(p.price_per_day) IS NULL THEN 'price_per_day nicht parsebar' END,
        CASE WHEN nullif(trim(p.price_weekend), '') IS NOT NULL AND public.parse_price_text(p.price_weekend) IS NULL THEN 'price_weekend nicht parsebar' END,
        CASE WHEN nullif(trim(p.price_per_month), '') IS NOT NULL AND public.parse_price_text(p.price_per_month) IS NULL THEN 'price_per_month nicht parsebar' END)
    FROM public.b2b_managed_products p
    WHERE (nullif(trim(p.price_per_day), '') IS NOT NULL AND public.parse_price_text(p.price_per_day) IS NULL)
       OR (nullif(trim(p.price_weekend), '') IS NOT NULL AND public.parse_price_text(p.price_weekend) IS NULL)
       OR (nullif(trim(p.price_per_month), '') IS NOT NULL AND public.parse_price_text(p.price_per_month) IS NULL);

    UPDATE public.b2b_managed_products p SET
      price_from_1_rd = public.parse_price_text(p.price_per_day),
      price_weekend_num = public.parse_price_text(p.price_weekend),
      price_from_20_rd = round(public.parse_price_text(p.price_per_month) / 20, 2),
      main_category = CASE WHEN p.category = ANY(event_cats) OR p.subcategory = ANY(event_cats) THEN 'event' ELSE 'bau' END,
      pricing_scheme = CASE WHEN p.category = ANY(event_cats) OR p.subcategory = ANY(event_cats) THEN 'event' ELSE 'bau' END,
      price_base_1_3_cd = CASE WHEN p.category = ANY(event_cats) OR p.subcategory = ANY(event_cats)
        THEN public.parse_price_text(p.price_per_day) END;

    UPDATE public.b2b_managed_products p SET addon_options = sub.opts
    FROM (
      SELECT q.id, jsonb_agg(
        e.elem || jsonb_build_object(
          'sort_order', e.ord - 1,
          'is_default', (e.ord = fi.first_ord),
          'surcharge_percent', COALESCE(e.elem->'surcharge_percent', 'null'::jsonb),
          'deductible', COALESCE(e.elem->'deductible', 'null'::jsonb))
        ORDER BY e.ord) AS opts
      FROM public.b2b_managed_products q
      CROSS JOIN LATERAL jsonb_array_elements(q.addon_options) WITH ORDINALITY AS e(elem, ord)
      LEFT JOIN LATERAL (
        SELECT min(x.ord) AS first_ord
        FROM jsonb_array_elements(q.addon_options) WITH ORDINALITY AS x(elem, ord)
        WHERE x.elem->>'key' IN ('maschinenbruch','elektronik','vollkasko','sb_reduktion')
           OR x.elem->>'label' ILIKE '%versicherung%'
      ) fi ON true
      WHERE jsonb_typeof(q.addon_options) = 'array' AND jsonb_array_length(q.addon_options) > 0
      GROUP BY q.id
    ) sub
    WHERE p.id = sub.id;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.b2b_managed_product_location_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  managed_product_id uuid NOT NULL REFERENCES public.b2b_managed_products(id) ON DELETE CASCADE,
  location text NOT NULL CHECK (location IN ('krefeld','bonn','muelheim')),
  price_from_1_rd numeric(10,2),
  price_from_3_rd numeric(10,2),
  price_from_10_rd numeric(10,2),
  price_from_20_rd numeric(10,2),
  price_weekend_num numeric(10,2),
  price_base_1_3_cd numeric(10,2),
  surcharge_per_cd_from_4 numeric(10,2),
  surcharge_per_cd_from_8 numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (managed_product_id, location)
);
GRANT SELECT ON public.b2b_managed_product_location_prices TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.b2b_managed_product_location_prices TO authenticated;
GRANT ALL ON public.b2b_managed_product_location_prices TO service_role;
ALTER TABLE public.b2b_managed_product_location_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can select all location prices" ON public.b2b_managed_product_location_prices;
CREATE POLICY "Admins can select all location prices" ON public.b2b_managed_product_location_prices
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Operative staff manage location prices" ON public.b2b_managed_product_location_prices;
CREATE POLICY "Operative staff manage location prices" ON public.b2b_managed_product_location_prices
  FOR ALL TO authenticated USING (public.can_edit_operations(auth.uid())) WITH CHECK (public.can_edit_operations(auth.uid()));
DROP POLICY IF EXISTS "Public can select published location prices" ON public.b2b_managed_product_location_prices;
CREATE POLICY "Public can select published location prices" ON public.b2b_managed_product_location_prices
  FOR SELECT TO anon, authenticated USING (EXISTS (
    SELECT 1 FROM public.b2b_managed_products p WHERE p.id = managed_product_id AND p.is_published = true));
DROP POLICY IF EXISTS "Super admins can delete location prices" ON public.b2b_managed_product_location_prices;
CREATE POLICY "Super admins can delete location prices" ON public.b2b_managed_product_location_prices
  FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "Super admins can insert location prices" ON public.b2b_managed_product_location_prices;
CREATE POLICY "Super admins can insert location prices" ON public.b2b_managed_product_location_prices
  FOR INSERT TO authenticated WITH CHECK (public.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "Super admins can update location prices" ON public.b2b_managed_product_location_prices;
CREATE POLICY "Super admins can update location prices" ON public.b2b_managed_product_location_prices
  FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS update_location_prices_updated_at ON public.b2b_managed_product_location_prices;
CREATE TRIGGER update_location_prices_updated_at BEFORE UPDATE ON public.b2b_managed_product_location_prices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();