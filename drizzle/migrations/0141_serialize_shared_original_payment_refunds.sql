ALTER TABLE public.deposit_refunds ADD COLUMN request_id uuid;
CREATE UNIQUE INDEX deposit_refunds_request_id_unique ON public.deposit_refunds(request_id) WHERE request_id IS NOT NULL;
CREATE OR REPLACE FUNCTION public.guard_shared_stripe_refund_capacity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _intents text[]; _intent text; _source record; _used bigint; _new bigint; _owner uuid; _allocation jsonb; _seen text[]:=ARRAY[]::text[];
BEGIN
IF TG_TABLE_NAME='deposit_refunds' THEN
 SELECT * INTO _source FROM public.offer_payment_links WHERE id=NEW.link_id;
 IF _source.payment_intent_id IS NULL OR _source.status<>'paid' OR coalesce(_source.paid_cents,0)<=0 THEN RAISE EXCEPTION 'Keine bestätigte ursprüngliche Stripe-Zahlung'; END IF;
 _intents:=ARRAY[_source.payment_intent_id];
 IF TG_OP='UPDATE' AND (NEW.link_id<>OLD.link_id OR NEW.amount_cents<>OLD.amount_cents OR NEW.request_id IS DISTINCT FROM OLD.request_id) THEN RAISE EXCEPTION 'Erstattungsanspruch ist unveränderlich'; END IF;
ELSE
 SELECT rental_inquiry_id INTO _owner FROM public.inquiry_invoices WHERE id=NEW.credit_note_id;
 IF _owner IS NULL THEN RAISE EXCEPTION 'Keine zuordenbare Miet-Rechnungskorrektur'; END IF;
 IF jsonb_typeof(NEW.allocations) IS DISTINCT FROM 'array' OR jsonb_array_length(NEW.allocations)=0 THEN RAISE EXCEPTION 'Erstattungsaufteilung fehlt'; END IF;
 FOR _allocation IN SELECT value FROM jsonb_array_elements(NEW.allocations) LOOP
  _intent:=_allocation->>'payment_intent';
  IF _intent IS NULL OR _intent=ANY(_seen) OR coalesce((_allocation->>'amount_cents')::bigint,0)<=0 THEN RAISE EXCEPTION 'Ungültige Erstattungsaufteilung'; END IF;
  _seen:=array_append(_seen,_intent);
  IF NOT EXISTS(SELECT 1 FROM public.offer_payment_links WHERE payment_intent_id=_intent AND inquiry_id=_owner AND inquiry_table='rental_inquiries' AND status='paid' AND paid_cents>0) THEN RAISE EXCEPTION 'Erstattung gehört nicht zur ursprünglichen Zahlung dieses Auftrags'; END IF;
 END LOOP;
 _intents:=_seen;
 IF TG_OP='UPDATE' AND (NEW.credit_note_id<>OLD.credit_note_id OR NEW.amount_cents<>OLD.amount_cents OR EXISTS(SELECT 1 FROM jsonb_array_elements(NEW.allocations) n WHERE NOT EXISTS(SELECT 1 FROM jsonb_array_elements(OLD.allocations) o WHERE o->>'payment_intent'=n->>'payment_intent' AND o->>'amount_cents'=n->>'amount_cents')) OR jsonb_array_length(NEW.allocations)<>jsonb_array_length(OLD.allocations)) THEN RAISE EXCEPTION 'Erstattungsanspruch ist unveränderlich'; END IF;
END IF;
FOR _intent IN SELECT unnest(_intents) ORDER BY 1 LOOP
 PERFORM pg_advisory_xact_lock(hashtextextended('stripe-refund:'||_intent,0));
 SELECT max(paid_cents) AS paid_cents,max(deposit_cents) AS deposit_cents INTO _source FROM public.offer_payment_links WHERE payment_intent_id=_intent AND status='paid';
 SELECT coalesce(sum(d.amount_cents),0) INTO _used FROM public.deposit_refunds d JOIN public.offer_payment_links l ON l.id=d.link_id WHERE l.payment_intent_id=_intent AND d.status NOT IN ('failed','canceled') AND NOT(TG_TABLE_NAME='deposit_refunds' AND d.id=NEW.id);
 SELECT _used+coalesce(sum((a->>'amount_cents')::bigint),0) INTO _used FROM public.credit_note_refunds c CROSS JOIN LATERAL jsonb_array_elements(c.allocations) a WHERE a->>'payment_intent'=_intent AND coalesce(a->>'status','creating') NOT IN ('failed','canceled') AND NOT(TG_TABLE_NAME='credit_note_refunds' AND c.id=NEW.id);
 IF TG_TABLE_NAME='deposit_refunds' THEN
  _new:=CASE WHEN NEW.status IN ('failed','canceled') THEN 0 ELSE NEW.amount_cents END;
  IF _new+(SELECT coalesce(sum(d.amount_cents),0) FROM public.deposit_refunds d JOIN public.offer_payment_links l ON l.id=d.link_id WHERE l.payment_intent_id=_intent AND d.id<>NEW.id AND d.status NOT IN ('failed','canceled'))>coalesce(_source.deposit_cents,0) THEN RAISE EXCEPTION 'Kautionserstattung übersteigt die ursprünglich gezahlte Kaution'; END IF;
 ELSE
  SELECT coalesce(sum((a->>'amount_cents')::bigint),0) INTO _new FROM jsonb_array_elements(NEW.allocations) a WHERE a->>'payment_intent'=_intent AND coalesce(a->>'status','creating') NOT IN ('failed','canceled');
 END IF;
 IF _used+_new>coalesce(_source.paid_cents,0) THEN RAISE EXCEPTION 'Kaution und Mieterstattungen übersteigen gemeinsam die ursprüngliche Stripe-Gesamtzahlung'; END IF;
END LOOP;
RETURN NEW;
END $$;
CREATE TRIGGER aaa_shared_refund_capacity BEFORE INSERT OR UPDATE ON public.deposit_refunds FOR EACH ROW EXECUTE FUNCTION public.guard_shared_stripe_refund_capacity();
CREATE TRIGGER aaa_shared_refund_capacity BEFORE INSERT OR UPDATE ON public.credit_note_refunds FOR EACH ROW EXECUTE FUNCTION public.guard_shared_stripe_refund_capacity();
REVOKE ALL ON FUNCTION public.guard_shared_stripe_refund_capacity() FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.sync_credit_note_refund(_credit_id uuid,_intent text,_refund_id text,_status text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE items jsonb; overall text; a jsonb;
BEGIN
SELECT allocations INTO items FROM public.credit_note_refunds WHERE credit_note_id=_credit_id FOR UPDATE;
IF items IS NULL THEN RAISE EXCEPTION 'Erstattungsanspruch noch nicht gespeichert'; END IF;
SELECT value INTO a FROM jsonb_array_elements(items) WHERE value->>'payment_intent'=_intent;
IF a IS NULL OR (a->>'refund_id' IS NOT NULL AND a->>'refund_id'<>_refund_id) THEN RAISE EXCEPTION 'Erstattungsidentität stimmt nicht überein'; END IF;
IF a->>'status' IN ('succeeded','failed','canceled') AND _status<>a->>'status' THEN RETURN; END IF;
SELECT jsonb_agg(CASE WHEN value->>'payment_intent'=_intent THEN value||jsonb_build_object('refund_id',_refund_id,'status',_status) ELSE value END) INTO items FROM jsonb_array_elements(items);
SELECT CASE WHEN bool_and(value->>'status'='succeeded') THEN 'succeeded' WHEN bool_and(value->>'status' IN ('failed','canceled')) THEN 'failed' ELSE 'pending' END INTO overall FROM jsonb_array_elements(items);
UPDATE public.credit_note_refunds SET allocations=items,status=overall,updated_at=now() WHERE credit_note_id=_credit_id;
END $$;
REVOKE ALL ON FUNCTION public.sync_credit_note_refund(uuid,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sync_credit_note_refund(uuid,text,text,text) TO service_role;