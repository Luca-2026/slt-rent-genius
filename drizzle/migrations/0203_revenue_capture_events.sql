CREATE FUNCTION public.capture_inquiry_revenue(r jsonb,t text,live boolean DEFAULT false) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE p jsonb; orig jsonb:=nullif(r->'original_accepted_offer','null'::jsonb); link record; net numeric; raw_net numeric; prior numeric; prior_lines jsonb; lines jsonb; stamp timestamptz; BEGIN
FOR link IN SELECT * FROM public.offer_acceptance_links WHERE inquiry_table=t AND inquiry_id=(r->>'id')::uuid AND (dispatched_at IS NOT NULL OR accepted_at IS NOT NULL) ORDER BY created_at,id LOOP
IF link.offer_number=orig->>'offer_number' THEN p:=orig->'offer_payload'; ELSIF link.offer_number=r->>'offer_number' AND coalesce((r->>'order_revision')::int,0)=0 AND orig IS NULL THEN p:=r->'offer_payload'; ELSE p:=NULL; END IF;
raw_net:=public.revenue_number(p->'totals'->>'netAmount'); IF abs(coalesce(public.revenue_number(p->'totals'->>'grossAmount'),-1)-coalesce(link.gross_amount,-2))>0.01 THEN raw_net:=NULL; END IF;
IF link.dispatched_at IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.revenue_events e WHERE e.id=t||':'||(r->>'id')||':offered:Versand '||link.offer_number) THEN
SELECT coalesce(sum(e.net_amount),0) INTO prior FROM public.revenue_events e WHERE e.source_table=t AND e.source_id=(r->>'id')::uuid AND e.stage='offered';
net:=raw_net; IF EXISTS(SELECT 1 FROM public.revenue_events e WHERE e.source_table=t AND e.source_id=(r->>'id')::uuid AND e.stage='offered' AND e.net_amount IS NULL) THEN net:=NULL; END IF;
lines:=public.revenue_lines(p->'items',p,net,CASE WHEN t='sales_inquiries' THEN 'sales' ELSE 'rental' END);
SELECT coalesce(jsonb_agg(jsonb_set(x,'{net}',to_jsonb(-public.revenue_number(x->>'net')))),'[]') INTO prior_lines FROM public.revenue_events e CROSS JOIN LATERAL jsonb_array_elements(e.lines) x WHERE e.source_table=t AND e.source_id=(r->>'id')::uuid AND e.stage='offered';
PERFORM public.revenue_record(r,t,'offered','Versand '||link.offer_number,link.dispatched_at,net-prior,coalesce(p,jsonb_build_object('offer_number',link.offer_number)),lines||prior_lines);
END IF;
IF link.accepted_at IS NOT NULL THEN PERFORM public.revenue_record(r,t,'accepted','Annahme',link.accepted_at,raw_net,coalesce(p,jsonb_build_object('offer_number',link.offer_number))); END IF;
END LOOP;
IF NOT EXISTS(SELECT 1 FROM public.revenue_events WHERE source_table=t AND source_id=(r->>'id')::uuid AND stage='accepted' AND event_kind='Annahme') THEN
p:=coalesce(orig->'offer_payload',r->'offer_payload'); stamp:=public.revenue_time(r->>'offer_accepted_at'); IF stamp IS NOT NULL THEN PERFORM public.revenue_record(r,t,'accepted','Annahme',stamp,public.revenue_number(p->'totals'->>'netAmount'),p); END IF; END IF;
IF live AND coalesce(r->>'email_sent','false')='true' AND NOT EXISTS(SELECT 1 FROM public.revenue_events WHERE source_table=t AND source_id=(r->>'id')::uuid AND stage='offered' AND event_kind='Versand '||(r->>'offer_number')) THEN
p:=r->'offer_payload'; SELECT coalesce(sum(e.net_amount),0) INTO prior FROM public.revenue_events e WHERE e.source_table=t AND e.source_id=(r->>'id')::uuid AND e.stage='offered'; net:=public.revenue_number(p->'totals'->>'netAmount');
IF EXISTS(SELECT 1 FROM public.revenue_events e WHERE e.source_table=t AND e.source_id=(r->>'id')::uuid AND e.stage='offered' AND e.net_amount IS NULL) THEN net:=NULL; END IF;
PERFORM public.revenue_record(r,t,'offered','Versand '||(r->>'offer_number'),now(),net-prior,p,CASE WHEN prior=0 THEN NULL ELSE jsonb_build_array(jsonb_build_object('name','Angebotsänderung','category','Nicht aufgeschlüsselt','net',net-prior)) END); END IF;
END $$;
REVOKE ALL ON FUNCTION public.capture_inquiry_revenue(jsonb,text,boolean) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.capture_inquiry_revenue(jsonb,text,boolean) TO service_role;
CREATE FUNCTION public.capture_document_revenue(r jsonb,t text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE items jsonb; p jsonb; net numeric; loc text; code text; BEGIN
IF t='b2b_offers' THEN
IF EXISTS(SELECT 1 FROM public.b2b_reservations z JOIN public.rental_inquiries q ON q.id=z.inquiry_id WHERE z.id=(r->>'reservation_id')::uuid AND q.offer_number=r->>'offer_number') THEN RETURN; END IF;
SELECT jsonb_agg(to_jsonb(x)) INTO items FROM public.b2b_offer_items x WHERE offer_id=(r->>'id')::uuid;
SELECT location,order_code INTO loc,code FROM public.b2b_reservations WHERE id=(r->>'reservation_id')::uuid;
r:=r||jsonb_build_object('location',loc,'order_code',code); p:=jsonb_build_object('items',items,'delivery_cost',r->'delivery_cost','offer_number',r->'offer_number');
IF r->>'email_sent'='true' AND r->>'email_sent_at' IS NOT NULL THEN PERFORM public.revenue_record(r,t,'offered','Versand '||(r->>'offer_number'),public.revenue_time(r->>'email_sent_at'),public.revenue_number(r->>'net_amount'),p); END IF;
IF r->>'accepted_at' IS NOT NULL THEN PERFORM public.revenue_record(r,t,'accepted','Annahme',public.revenue_time(r->>'accepted_at'),public.revenue_number(r->>'net_amount'),p); END IF;
ELSE
IF r->>'status'='draft' OR (t='b2b_invoices' AND r->>'status'='cancelled' AND r->>'invoice_kind' IS NULL) THEN RETURN; END IF;
net:=public.revenue_number(r->>'net_amount'); IF r->>'invoice_kind'='credit_note' THEN net:=-abs(net); END IF;
IF t='inquiry_invoices' THEN
SELECT jsonb_agg(to_jsonb(x)) INTO items FROM public.inquiry_invoice_items x WHERE invoice_id=(r->>'id')::uuid;
IF r->>'rental_inquiry_id' IS NOT NULL THEN SELECT order_code INTO code FROM public.rental_inquiries WHERE id=(r->>'rental_inquiry_id')::uuid; ELSE SELECT order_code INTO code FROM public.sales_inquiries WHERE id=(r->>'sales_inquiry_id')::uuid; END IF;
ELSE
IF EXISTS(SELECT 1 FROM public.inquiry_invoices i WHERE i.invoice_number=r->>'invoice_number') THEN RETURN; END IF;
SELECT jsonb_agg(to_jsonb(x)) INTO items FROM public.b2b_invoice_items x WHERE invoice_id=(r->>'id')::uuid;
SELECT issuing_location INTO loc FROM public.b2b_offers WHERE id=(r->>'source_offer_id')::uuid;
IF loc IS NULL THEN SELECT location INTO loc FROM public.b2b_reservations WHERE id=(r->>'reservation_id')::uuid; END IF;
SELECT order_code INTO code FROM public.b2b_reservations WHERE id=(r->>'reservation_id')::uuid;
r:=r||jsonb_build_object('location',loc);
END IF;
r:=r||jsonb_build_object('order_code',code); p:=r||jsonb_build_object('items',items);
PERFORM public.revenue_record(r,t,'invoiced',coalesce(r->>'invoice_kind','invoice'),public.revenue_time(r->>'invoice_date'),net,p);
UPDATE public.revenue_events e SET lines=public.revenue_lines(items,p,e.net_amount,e.business) WHERE e.source_table=t AND e.source_id=(r->>'id')::uuid AND e.stage='invoiced';
END IF; END $$;
REVOKE ALL ON FUNCTION public.capture_document_revenue(jsonb,text) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.capture_document_revenue(jsonb,text) TO service_role;
CREATE FUNCTION public.capture_revision_revenue(r jsonb,t text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE src text:=CASE WHEN t='rental_order_revisions' THEN 'rental_inquiries' ELSE 'sales_inquiries' END; sid uuid:=coalesce((r->>'rental_inquiry_id')::uuid,(r->>'sales_inquiry_id')::uuid); d jsonb; prev jsonb; p jsonb:=r->'snapshot'->'offer_payload'; net numeric; prior numeric; lines jsonb; old_lines jsonb; BEGIN
IF coalesce((r->>'version')::int,0)=0 THEN RETURN; END IF;
IF src='rental_inquiries' THEN SELECT to_jsonb(x) INTO d FROM public.rental_inquiries x WHERE id=sid; SELECT snapshot->'offer_payload' INTO prev FROM public.rental_order_revisions WHERE rental_inquiry_id=sid AND version=(r->>'version')::int-1; ELSE SELECT to_jsonb(x) INTO d FROM public.sales_inquiries x WHERE id=sid; SELECT snapshot->'offer_payload' INTO prev FROM public.sales_order_revisions WHERE sales_inquiry_id=sid AND version=(r->>'version')::int-1; END IF;
net:=public.revenue_number(p->'totals'->>'netAmount'); prior:=public.revenue_number(prev->'totals'->>'netAmount');
lines:=public.revenue_lines(p->'items',p,net,CASE WHEN src='sales_inquiries' THEN 'sales' ELSE 'rental' END);
SELECT coalesce(jsonb_agg(jsonb_set(x,'{net}',to_jsonb(-public.revenue_number(x->>'net')))),'[]') INTO old_lines FROM jsonb_array_elements(public.revenue_lines(prev->'items',prev,prior,CASE WHEN src='sales_inquiries' THEN 'sales' ELSE 'rental' END)) x;
PERFORM public.revenue_record(d,src,'accepted','Änderung '||(r->>'version'),public.revenue_time(r->>'agreed_at'),net-prior,p,lines||old_lines);
END $$;
REVOKE ALL ON FUNCTION public.capture_revision_revenue(jsonb,text) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.capture_revision_revenue(jsonb,text) TO service_role;
CREATE FUNCTION public.revenue_capture_trigger() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE r jsonb:=to_jsonb(NEW); d jsonb; net numeric; BEGIN
IF TG_TABLE_NAME IN('rental_inquiries','sales_inquiries') THEN
PERFORM public.capture_inquiry_revenue(r,TG_TABLE_NAME,TG_OP='UPDATE' AND coalesce(r->>'email_sent','false')='true' AND (to_jsonb(OLD)->>'email_sent') IS DISTINCT FROM 'true');
IF r->>'cancelled_at' IS NOT NULL AND (TG_OP='INSERT' OR to_jsonb(OLD)->>'cancelled_at' IS NULL) THEN
SELECT CASE WHEN count(*) FILTER(WHERE net_amount IS NULL)>0 THEN NULL ELSE sum(net_amount) END INTO net FROM public.revenue_events WHERE source_table=TG_TABLE_NAME AND source_id=NEW.id AND stage='accepted';
IF EXISTS(SELECT 1 FROM public.revenue_events WHERE source_table=TG_TABLE_NAME AND source_id=NEW.id AND stage='accepted') THEN PERFORM public.revenue_record(r,TG_TABLE_NAME,'accepted','Auftragsstorno',public.revenue_time(r->>'cancelled_at'),-net,NULL,jsonb_build_array(jsonb_build_object('name','Auftragsstorno','category','Nicht aufgeschlüsselt','net',-net))); END IF; END IF;
ELSIF TG_TABLE_NAME='offer_acceptance_links' THEN
IF NEW.inquiry_table='rental_inquiries' THEN SELECT to_jsonb(x) INTO r FROM public.rental_inquiries x WHERE id=NEW.inquiry_id; ELSIF NEW.inquiry_table='sales_inquiries' THEN SELECT to_jsonb(x) INTO r FROM public.sales_inquiries x WHERE id=NEW.inquiry_id; END IF;
IF r IS NOT NULL THEN PERFORM public.capture_inquiry_revenue(r,NEW.inquiry_table); END IF;
ELSIF TG_TABLE_NAME IN('rental_order_revisions','sales_order_revisions') THEN PERFORM public.capture_revision_revenue(r,TG_TABLE_NAME);
ELSIF TG_TABLE_NAME IN('inquiry_invoice_items','b2b_invoice_items') THEN
IF TG_TABLE_NAME='inquiry_invoice_items' THEN SELECT to_jsonb(x) INTO d FROM public.inquiry_invoices x WHERE id=NEW.invoice_id; PERFORM public.capture_document_revenue(d,'inquiry_invoices'); ELSE SELECT to_jsonb(x) INTO d FROM public.b2b_invoices x WHERE id=NEW.invoice_id; PERFORM public.capture_document_revenue(d,'b2b_invoices'); END IF;
ELSE PERFORM public.capture_document_revenue(r,TG_TABLE_NAME); END IF; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.revenue_capture_trigger() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER analytics_inquiry AFTER INSERT OR UPDATE OF offer_accepted_at,email_sent,cancelled_at ON public.rental_inquiries FOR EACH ROW EXECUTE FUNCTION public.revenue_capture_trigger();
CREATE TRIGGER analytics_sales AFTER INSERT OR UPDATE OF offer_accepted_at,email_sent ON public.sales_inquiries FOR EACH ROW EXECUTE FUNCTION public.revenue_capture_trigger();
CREATE TRIGGER analytics_acceptance AFTER INSERT OR UPDATE OF dispatched_at,accepted_at ON public.offer_acceptance_links FOR EACH ROW EXECUTE FUNCTION public.revenue_capture_trigger();
CREATE TRIGGER analytics_rental_revision AFTER INSERT ON public.rental_order_revisions FOR EACH ROW EXECUTE FUNCTION public.revenue_capture_trigger();
CREATE TRIGGER analytics_sales_revision AFTER INSERT ON public.sales_order_revisions FOR EACH ROW EXECUTE FUNCTION public.revenue_capture_trigger();
CREATE TRIGGER analytics_b2b_offer AFTER INSERT OR UPDATE OF email_sent_at,accepted_at ON public.b2b_offers FOR EACH ROW EXECUTE FUNCTION public.revenue_capture_trigger();
CREATE TRIGGER analytics_invoice AFTER INSERT OR UPDATE OF status ON public.inquiry_invoices FOR EACH ROW EXECUTE FUNCTION public.revenue_capture_trigger();
CREATE TRIGGER analytics_b2b_invoice AFTER INSERT OR UPDATE OF status ON public.b2b_invoices FOR EACH ROW EXECUTE FUNCTION public.revenue_capture_trigger();
CREATE TRIGGER analytics_invoice_items AFTER INSERT OR UPDATE ON public.inquiry_invoice_items FOR EACH ROW EXECUTE FUNCTION public.revenue_capture_trigger();
CREATE TRIGGER analytics_b2b_invoice_items AFTER INSERT OR UPDATE ON public.b2b_invoice_items FOR EACH ROW EXECUTE FUNCTION public.revenue_capture_trigger();
CREATE FUNCTION public.backfill_revenue_events() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE r record; n numeric; BEGIN
IF auth.uid() IS NOT NULL AND auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Nur System' USING ERRCODE='42501'; END IF;
FOR r IN SELECT to_jsonb(q) j,'rental_inquiries' t FROM public.rental_inquiries q UNION ALL SELECT to_jsonb(q),'sales_inquiries' FROM public.sales_inquiries q LOOP PERFORM public.capture_inquiry_revenue(r.j,r.t); END LOOP;
FOR r IN SELECT to_jsonb(q) j,'rental_order_revisions' t FROM public.rental_order_revisions q WHERE version>0 UNION ALL SELECT to_jsonb(q),'sales_order_revisions' FROM public.sales_order_revisions q WHERE version>0 LOOP PERFORM public.capture_revision_revenue(r.j,r.t); END LOOP;
FOR r IN SELECT to_jsonb(q) j,'inquiry_invoices' t FROM public.inquiry_invoices q UNION ALL SELECT to_jsonb(q),'b2b_invoices' FROM public.b2b_invoices q UNION ALL SELECT to_jsonb(q),'b2b_offers' FROM public.b2b_offers q LOOP PERFORM public.capture_document_revenue(r.j,r.t); END LOOP;
FOR r IN SELECT * FROM public.rental_inquiries WHERE cancelled_at IS NOT NULL LOOP
SELECT CASE WHEN count(*) FILTER(WHERE net_amount IS NULL)>0 THEN NULL ELSE sum(net_amount) END INTO n FROM public.revenue_events WHERE source_table='rental_inquiries' AND source_id=r.id AND stage='accepted' AND event_kind<>'Auftragsstorno';
IF EXISTS(SELECT 1 FROM public.revenue_events WHERE source_table='rental_inquiries' AND source_id=r.id AND stage='accepted') THEN PERFORM public.revenue_record(to_jsonb(r),'rental_inquiries','accepted','Auftragsstorno',r.cancelled_at,-n,NULL,jsonb_build_array(jsonb_build_object('name','Auftragsstorno','category','Nicht aufgeschlüsselt','net',-n))); END IF; END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.backfill_revenue_events() FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.backfill_revenue_events() TO service_role;
SELECT public.backfill_revenue_events();