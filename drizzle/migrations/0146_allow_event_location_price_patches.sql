CREATE OR REPLACE FUNCTION public.save_managed_article(_id uuid, _article jsonb, _location_prices jsonb DEFAULT '[]'::jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE k text; cols text; vals text; assignments text; loc jsonb; rowdata jsonb; exists_row boolean;
BEGIN
IF NOT public.can_edit_operations(auth.uid()) THEN RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE='42501'; END IF;
IF _id IS NULL OR jsonb_typeof(_article) IS DISTINCT FROM 'object' OR jsonb_typeof(_location_prices) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Ungültige Artikeldaten'; END IF;
IF _article ?| ARRAY['id','created_at','updated_at','created_by','updated_by'] THEN RAISE EXCEPTION 'Geschützte Artikelfelder'; END IF;
IF EXISTS(SELECT 1 FROM jsonb_object_keys(_article) key WHERE NOT EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid='public.b2b_managed_products'::regclass AND attname=key AND attnum>0 AND NOT attisdropped)) THEN RAISE EXCEPTION 'Unbekanntes Artikelfeld'; END IF;
PERFORM pg_advisory_xact_lock(hashtextextended('cms-save:'||_id::text,0));
SELECT EXISTS(SELECT 1 FROM public.b2b_managed_products WHERE id=_id) INTO exists_row;
SELECT string_agg(format('%I',key),',' ORDER BY key),string_agg(format('r.%I',key),',' ORDER BY key),string_agg(format('%I=r.%I',key,key),',' ORDER BY key) INTO cols,vals,assignments FROM jsonb_object_keys(_article) key;
IF cols IS NULL THEN RAISE EXCEPTION 'Leere Artikeldaten'; END IF;
IF exists_row THEN
EXECUTE format('UPDATE public.b2b_managed_products p SET %s,updated_by=auth.uid() FROM jsonb_populate_record(NULL::public.b2b_managed_products,$1) r WHERE p.id=$2',assignments) USING _article,_id;
ELSE
EXECUTE format('INSERT INTO public.b2b_managed_products(id,%s,created_by,updated_by) SELECT $2,%s,auth.uid(),auth.uid() FROM jsonb_populate_record(NULL::public.b2b_managed_products,$1) r',cols,vals) USING _article,_id;
END IF;
FOR loc IN SELECT value FROM jsonb_array_elements(_location_prices) LOOP
IF loc->>'location' NOT IN ('krefeld','bonn','muelheim') OR loc->>'location' IS NULL THEN RAISE EXCEPTION 'Ungültiger Preisstandort'; END IF;
IF EXISTS(SELECT 1 FROM jsonb_object_keys(loc) key WHERE key NOT IN ('location','price_from_1_rd','price_from_3_rd','price_from_10_rd','price_from_20_rd','price_weekend_num','price_base_1_3_cd','surcharge_per_cd_from_4','surcharge_per_cd_from_8','tier_prices_manual')) THEN RAISE EXCEPTION 'Ungültiges Standortpreisfeld'; END IF;
rowdata:=loc||jsonb_build_object('managed_product_id',_id);
SELECT string_agg(format('%I',key),',' ORDER BY key),string_agg(format('r.%I',key),',' ORDER BY key),string_agg(format('%I=EXCLUDED.%I',key,key),',' ORDER BY key) INTO cols,vals,assignments FROM jsonb_object_keys(rowdata) key;
EXECUTE format('INSERT INTO public.b2b_managed_product_location_prices(%s) SELECT %s FROM jsonb_populate_record(NULL::public.b2b_managed_product_location_prices,$1) r ON CONFLICT(managed_product_id,location) DO UPDATE SET %s',cols,vals,assignments) USING rowdata;
END LOOP;
RETURN _id;
END $$;
REVOKE ALL ON FUNCTION public.save_managed_article(uuid,jsonb,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_managed_article(uuid,jsonb,jsonb) TO authenticated;