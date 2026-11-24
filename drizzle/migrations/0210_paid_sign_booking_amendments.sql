DO $migration$
DECLARE def text; old_guard text; new_guard text;
BEGIN
SELECT pg_get_functiondef('public.save_rental_order_amendment(uuid,integer,jsonb,text,timestamptz)'::regprocedure) INTO def;
old_guard := $old$IF COALESCE((r.offer_payload->>'direct_booking')::boolean,false) THEN RAISE EXCEPTION 'Direktbuchungen benötigen eine eigene Änderungsabwicklung'; END IF;$old$;
new_guard := $new$IF COALESCE((r.offer_payload->>'direct_booking')::boolean,false) THEN
IF NOT EXISTS(SELECT 1 FROM public.sign_bookings WHERE inquiry_id=_id AND status='paid' AND confirmation_sent_at IS NOT NULL) THEN RAISE EXCEPTION 'Nur vollständig bezahlte und bestätigte Schilderbuchungen können ergänzt werden'; END IF;
IF _payload->>'direct_booking' IS DISTINCT FROM 'true' OR _payload->'deposit' IS DISTINCT FROM r.offer_payload->'deposit' OR _payload->'payment_terms' IS DISTINCT FROM r.offer_payload->'payment_terms' THEN RAISE EXCEPTION 'Bezahltes Paket und Kaution bleiben unverändert'; END IF;
IF (_payload - 'items' - 'totals') IS DISTINCT FROM (r.offer_payload - 'items' - 'totals') THEN RAISE EXCEPTION 'Bezahlte Buchungsvereinbarung bleibt unverändert'; END IF;
IF jsonb_array_length(_payload->'items')<=jsonb_array_length(r.offer_payload->'items') OR EXISTS(SELECT 1 FROM jsonb_array_elements(r.offer_payload->'items') WITH ORDINALITY old(item,n) WHERE old.item IS DISTINCT FROM _payload->'items'->(old.n::int-1)) THEN RAISE EXCEPTION 'Bezahlte Positionen bleiben unverändert; Zusatzartikel separat ergänzen'; END IF;
IF EXISTS(SELECT 1 FROM jsonb_array_elements(_payload->'items') WITH ORDINALITY new(item,n) WHERE n>jsonb_array_length(r.offer_payload->'items') AND item->>'product_slug'='halteverbotsschilder-set') THEN RAISE EXCEPTION 'Weitere Halteverbotsschilder-Sets separat buchen'; END IF;
END IF;
IF EXISTS(SELECT 1 FROM public.offer_payment_links l WHERE l.inquiry_id=_id AND l.inquiry_table='rental_inquiries' AND (l.checkout_claim IS NOT NULL OR l.stripe_session_id IS NOT NULL) AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(COALESCE(r.payments,'[]')) p WHERE p->>'reference'=l.stripe_session_id AND p->>'payment_intent_id'=l.payment_intent_id AND round((p->>'amount')::numeric*100)=l.amount_cents AND p->>'provider'='stripe')) THEN RAISE EXCEPTION 'Online-Zahlungsversuch zuerst sicher abgleichen'; END IF;$new$;
IF position(old_guard IN def)=0 THEN RAISE EXCEPTION 'Missing direct booking amendment guard'; END IF;
def:=replace(def,old_guard,new_guard);
old_guard:=$old$IF abs(expected_total-(_payload->'totals'->>'grossAmount')::numeric)>0 THEN$old$;
new_guard:=$new$IF r.offer_payload->>'direct_booking'='true' THEN
SELECT COALESCE(sum(round((i->>'quantity')::numeric*(i->>'unit_price')::numeric*(1-COALESCE((i->>'discount_percent')::numeric,0)/100),2)),0), round(COALESCE(sum(round((i->>'quantity')::numeric*(i->>'unit_price')::numeric*(1-COALESCE((i->>'discount_percent')::numeric,0)/100),2)*COALESCE((i->>'vat_rate')::numeric,19)/100),0),2) INTO item_net,item_vat FROM jsonb_array_elements(_payload->'items') WITH ORDINALITY x(i,n) WHERE n>jsonb_array_length(r.offer_payload->'items');
SELECT round(COALESCE(sum((a->>'amount')::numeric),0),2) INTO addon_net FROM jsonb_array_elements(_payload->'items') WITH ORDINALITY x(i,n) CROSS JOIN LATERAL jsonb_array_elements(COALESCE(i->'addons','[]')) a WHERE n>jsonb_array_length(r.offer_payload->'items') AND COALESCE((a->>'optional')::boolean,false)=false;
expected_total:=r.offer_total_gross+round(item_net+addon_net,2)+round(item_vat+addon_net*0.19,2);
IF (_payload->'totals'->>'netAmount')::numeric IS DISTINCT FROM round((r.offer_payload->'totals'->>'netAmount')::numeric+item_net+addon_net,2) OR (_payload->'totals'->>'vatAmount')::numeric IS DISTINCT FROM round((r.offer_payload->'totals'->>'vatAmount')::numeric+item_vat+addon_net*0.19,2) THEN RAISE EXCEPTION 'Nachtragssummen stimmen nicht'; END IF;
END IF;
IF abs(expected_total-(_payload->'totals'->>'grossAmount')::numeric)>0 THEN$new$;
IF position(old_guard IN def)=0 THEN RAISE EXCEPTION 'Missing amendment amount guard'; END IF;
def:=replace(def,old_guard,new_guard);
def:=replace(def,'start_date=(SELECT min(i->>''rental_start'')::date FROM jsonb_array_elements(_payload->''items'') i),end_date=(SELECT max(i->>''rental_end'')::date FROM jsonb_array_elements(_payload->''items'') i)', 'start_date=CASE WHEN r.offer_payload->>''direct_booking''=''true'' THEN r.start_date ELSE (SELECT min(i->>''rental_start'')::date FROM jsonb_array_elements(_payload->''items'') i) END,end_date=CASE WHEN r.offer_payload->>''direct_booking''=''true'' THEN r.end_date ELSE (SELECT max(i->>''rental_end'')::date FROM jsonb_array_elements(_payload->''items'') i) END');
EXECUTE def;
SELECT pg_get_functiondef('public.sign_booking_payment_state()'::regprocedure) INTO def;
IF position('IF b.status=''reserved''' IN def)=0 THEN RAISE EXCEPTION 'Missing sign payment state guard'; END IF;
def:=replace(def,'IF b.status=''reserved''', 'IF b.status=''paid'' AND COALESCE(NEW.order_revision,0)>0 THEN RETURN NEW; END IF; IF b.status=''reserved''');
EXECUTE def;
SELECT pg_get_functiondef('public.begin_rental_checkout(uuid,integer,uuid,jsonb)'::regprocedure) INTO def;
old_guard:=$old$IF EXISTS(SELECT 1 FROM public.offer_payment_links WHERE inquiry_table='rental_inquiries' AND inquiry_id=r.id AND id<>l.id AND (checkout_claim IS NOT NULL OR stripe_session_id IS NOT NULL))$old$;
new_guard:=$new$IF EXISTS(SELECT 1 FROM public.offer_payment_links other WHERE other.inquiry_table='rental_inquiries' AND other.inquiry_id=r.id AND other.id<>l.id AND (other.checkout_claim IS NOT NULL OR other.stripe_session_id IS NOT NULL) AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(COALESCE(r.payments,'[]')) p WHERE p->>'reference'=other.stripe_session_id AND p->>'payment_intent_id'=other.payment_intent_id AND round((p->>'amount')::numeric*100)=other.amount_cents AND p->>'provider'='stripe'))$new$;
IF position(old_guard IN def)=0 THEN RAISE EXCEPTION 'Missing competing checkout guard'; END IF;
def:=replace(def,old_guard,new_guard);
EXECUTE def;
END $migration$;