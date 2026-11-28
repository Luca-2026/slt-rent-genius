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