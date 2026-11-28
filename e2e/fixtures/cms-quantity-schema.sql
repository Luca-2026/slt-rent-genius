CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT '00000000-0000-0000-0000-000000000001'::uuid $$;
    CREATE TABLE allowed(ok boolean); INSERT INTO allowed VALUES (true);
    CREATE FUNCTION public.is_staff_member(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT ok FROM allowed $$;
    CREATE FUNCTION public.has_role(uuid, text) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
    CREATE FUNCTION public.can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT ok FROM allowed $$;
    CREATE TABLE public.rental_inquiries(id uuid PRIMARY KEY, status text, location text, start_date text, end_date text, start_time text, end_time text,
      offer_payload jsonb, offer_number text, customer_name text, product_id text, product_name text, quantity int, order_confirmed_at timestamptz, b2b_reservation_id uuid);
    CREATE TABLE public.b2b_managed_products(id uuid PRIMARY KEY, slug text, name text, quantities jsonb);
    CREATE TABLE public.b2b_product_instances(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), managed_product_id uuid, location text, status text, internal_inventory_number text, created_at timestamptz DEFAULT now());
    CREATE TABLE public.b2b_instance_allocations(instance_id uuid, rental_inquiry_id uuid, from_at timestamptz, to_at timestamptz);
    CREATE TABLE public.b2b_reservations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), status text, location text, product_id text, product_name text, start_date date, end_date date, quantity int, inquiry_id uuid);
    CREATE FUNCTION public.slt_try_date(_raw text) RETURNS date LANGUAGE sql IMMUTABLE AS $$
      SELECT CASE WHEN _raw ~ '^\d{4}-\d{2}-\d{2}' THEN to_date(substring(_raw from 1 for 10), 'YYYY-MM-DD') ELSE NULL END $$;
    CREATE FUNCTION public.slt_normalize_location(_raw text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
      SELECT CASE WHEN _raw IS NULL OR btrim(_raw) = '' THEN NULL WHEN lower(_raw) LIKE '%bonn%' THEN 'bonn'
        WHEN lower(_raw) LIKE '%lheim%' OR lower(_raw) LIKE '%mulheim%' THEN 'muelheim' WHEN lower(_raw) LIKE '%krefeld%' THEN 'krefeld' ELSE lower(btrim(_raw)) END $$;
    CREATE FUNCTION public.slt_stock_location(_raw text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT public.slt_normalize_location(_raw) $$;
    CREATE FUNCTION public.slt_quantity_at(_q jsonb, _stock_loc text) RETURNS integer LANGUAGE sql IMMUTABLE AS $$
      SELECT CASE WHEN count(*) = 0 THEN NULL ELSE sum(v::int)::int END FROM jsonb_each_text(COALESCE(_q,'{}'::jsonb)) e(k,v)
      WHERE v ~ '^[0-9]+$' AND public.slt_stock_location(k) = _stock_loc $$;
    CREATE FUNCTION public.slt_item_period(_inq rental_inquiries, _item jsonb, OUT from_at timestamptz, OUT to_at timestamptz) RETURNS record LANGUAGE plpgsql STABLE AS $$
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
    CREATE FUNCTION public.slt_free_instances(_product uuid, _location text, _from timestamptz, _to timestamptz, _exclude_inquiry uuid) RETURNS SETOF uuid LANGUAGE sql STABLE AS $$
      SELECT i.id FROM public.b2b_product_instances i WHERE i.managed_product_id = _product
        AND public.slt_stock_location(i.location) = public.slt_stock_location(_location) AND i.status IN ('available','rented')
        AND NOT EXISTS (SELECT 1 FROM public.b2b_instance_allocations a WHERE a.instance_id = i.id
          AND (_exclude_inquiry IS NULL OR a.rental_inquiry_id <> _exclude_inquiry) AND tstzrange(a.from_at, a.to_at, '[)') && tstzrange(_from, _to, '[)'))
      ORDER BY i.internal_inventory_number NULLS LAST, i.created_at $$;
CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
ALTER TABLE rental_inquiries ADD availability_pending boolean DEFAULT false;
ALTER TABLE b2b_instance_allocations ADD managed_product_id uuid, ADD kind text, ADD created_by uuid;
ALTER TABLE b2b_product_instances ADD updated_by uuid, ADD updated_at timestamptz;
CREATE TABLE b2b_transport_orders(instance_id uuid,managed_product_id uuid,from_location text,to_location text,due_at timestamptz,rental_inquiry_id uuid,transport_cost numeric,cost_charged boolean,created_by uuid);
CREATE TABLE rental_inquiry_events(rental_inquiry_id uuid,event text,details jsonb,user_id uuid);
