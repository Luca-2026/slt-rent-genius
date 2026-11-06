CREATE TABLE public.test_order_registry (
 source_table text NOT NULL CHECK(source_table IN ('rental_inquiries','sales_inquiries','b2b_reservations','b2b_invoices')),
 source_id uuid NOT NULL,
 evidence text NOT NULL CHECK(length(btrim(evidence))>=10),
 registered_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(source_table,source_id)
);
GRANT SELECT ON public.test_order_registry TO authenticated;
GRANT ALL ON public.test_order_registry TO service_role;
ALTER TABLE public.test_order_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY test_registry_admin_read ON public.test_order_registry FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));

CREATE FUNCTION public.credit_registered_test_invoice(_table text,_id uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE inv jsonb; credits jsonb; credit jsonb; credit_id uuid; num text; reason text; remaining numeric; remaining_net numeric; remaining_vat numeric; matches boolean;
BEGIN
 IF _table NOT IN ('inquiry_invoices','b2b_invoices') THEN RAISE EXCEPTION 'Invalid invoice source'; END IF;
 EXECUTE format('SELECT to_jsonb(i) FROM public.%I i WHERE id=$1 FOR UPDATE',_table) INTO inv USING _id;
 IF inv IS NULL THEN RAISE EXCEPTION 'Invoice not found'; END IF;
 IF inv->>'invoice_kind'='credit_note' OR inv->>'status'='draft' THEN RETURN NULL; END IF;
 IF _table='inquiry_invoices' THEN
 SELECT EXISTS(SELECT 1 FROM public.test_order_registry t WHERE (t.source_table='rental_inquiries' AND t.source_id=(inv->>'rental_inquiry_id')::uuid) OR (t.source_table='sales_inquiries' AND t.source_id=(inv->>'sales_inquiry_id')::uuid)) INTO matches;
 ELSE
 SELECT EXISTS(SELECT 1 FROM public.test_order_registry t WHERE (t.source_table='b2b_reservations' AND t.source_id=(inv->>'reservation_id')::uuid) OR (t.source_table='b2b_invoices' AND t.source_id=_id)) INTO matches;
 END IF;
 IF NOT matches THEN RETURN NULL; END IF;
 EXECUTE format('SELECT jsonb_build_object(''gross'',coalesce(-sum(gross_amount),0),''net'',coalesce(-sum(net_amount),0),''vat'',coalesce(-sum(vat_amount),0)) FROM public.%I WHERE parent_invoice_id=$1 AND invoice_kind=''credit_note'' AND status NOT IN (''draft'',''cancelled'')',_table) INTO credits USING _id;
 IF round(coalesce((inv->>'credited_amount')::numeric,0),2)<>round((credits->>'gross')::numeric,2) THEN RAISE EXCEPTION 'Credit documents and credited total disagree'; END IF;
 remaining:=round((inv->>'gross_amount')::numeric-(credits->>'gross')::numeric,2);
 IF remaining=0 THEN RETURN NULL; END IF;
 IF remaining<0 THEN RAISE EXCEPTION 'Overcredited invoice'; END IF;
 remaining_net:=round((inv->>'net_amount')::numeric-(credits->>'net')::numeric,2);
 remaining_vat:=round((inv->>'vat_amount')::numeric-(credits->>'vat')::numeric,2);
 IF remaining<>remaining_net+remaining_vat THEN RAISE EXCEPTION 'Credit tax totals disagree'; END IF;
 num:=public.generate_inquiry_credit_note_number_for(CASE WHEN inv->>'inquiry_type'='sales' THEN 'V' ELSE 'M' END);
 credit_id:=gen_random_uuid();
 reason:='Automatische vollständige Gutschrift: registrierter interner Testauftrag, kein produktiver Umsatz. Bezug: '||(inv->>'invoice_number');
 credit:=inv||jsonb_build_object('id',credit_id,'invoice_number',num,'invoice_kind','credit_note','parent_invoice_id',_id,'invoice_date',current_date,'due_date',current_date,'status','draft','net_amount',-remaining_net,'vat_amount',-remaining_vat,'gross_amount',-remaining,'amount',-remaining,'credited_amount',0,'credit_reason',reason,'credit_refund_amount',0,'notes',reason,'internal_notes',reason,'payments','[]'::jsonb,'paid_amount',0,'paid_at',NULL,'cancelled_at',NULL,'created_at',now(),'updated_at',now(),'created_by',NULL,'created_by_name','Automatische Testbereinigung','file_url',NULL,'file_name',NULL,'file_path',NULL,'email_sent',false,'email_sent_at',NULL,'payment_due_days',0,'delivery_cost',0,'delivery_cost_delivery',0,'delivery_cost_return',0,'setup_cost',0,'dismantle_cost',0,'deposit',0,'return_location_cost',0,'installment_number',NULL,'deducted_installments','[]'::jsonb);
 EXECUTE format('INSERT INTO public.%I SELECT (jsonb_populate_record(NULL::public.%I,$1)).*',_table,_table) USING credit;
 IF _table='inquiry_invoices' THEN
 INSERT INTO public.inquiry_invoice_items(invoice_id,position,product_name,description,quantity,unit,unit_price,total_price,vat_rate,addons) VALUES(credit_id,1,'Vollständige Test-Rechnungskorrektur',reason,1,'Pauschale',-remaining_net,-remaining_net,(inv->>'vat_rate')::numeric,'[]');
 ELSE
 INSERT INTO public.b2b_invoice_items(invoice_id,product_name,description,quantity,unit_price,total_price) VALUES(credit_id,'Vollständige Test-Rechnungskorrektur',reason,1,-remaining_net,-remaining_net);
 END IF;
 EXECUTE format('UPDATE public.%I SET status=''paid'' WHERE id=$1',_table) USING credit_id;
 EXECUTE format('UPDATE public.%I SET credited_amount=gross_amount,status=''cancelled'',updated_at=now() WHERE id=$1',_table) USING _id;
 RETURN credit_id;
END $$;
REVOKE ALL ON FUNCTION public.credit_registered_test_invoice(text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.credit_registered_test_invoice(text,uuid) TO service_role;
CREATE FUNCTION public.auto_credit_registered_test_invoice() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NEW.invoice_kind<>'credit_note' AND NEW.status<>'draft' THEN PERFORM public.credit_registered_test_invoice(TG_TABLE_NAME,NEW.id); END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.auto_credit_registered_test_invoice() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER auto_credit_test_inquiry AFTER INSERT OR UPDATE OF status ON public.inquiry_invoices FOR EACH ROW WHEN(NEW.invoice_kind<>'credit_note' AND NEW.status<>'draft') EXECUTE FUNCTION public.auto_credit_registered_test_invoice();
CREATE TRIGGER auto_credit_test_portal AFTER INSERT OR UPDATE OF status ON public.b2b_invoices FOR EACH ROW WHEN(NEW.invoice_kind<>'credit_note' AND NEW.status<>'draft') EXECUTE FUNCTION public.auto_credit_registered_test_invoice();

CREATE OR REPLACE FUNCTION public.guard_invoice_after_rental_refund() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF NEW.rental_inquiry_id IS NOT NULL THEN
PERFORM pg_advisory_xact_lock(hashtextextended('rental-refund-invoice:'||NEW.rental_inquiry_id::text,0));
IF NEW.invoice_kind<>'credit_note' AND NEW.status NOT IN ('draft','cancelled') AND EXISTS(SELECT 1 FROM public.credit_note_refunds r JOIN public.inquiry_invoices i ON i.id=r.credit_note_id WHERE i.rental_inquiry_id=NEW.rental_inquiry_id AND i.id<>NEW.id AND r.refund_kind='rental_credit') THEN RAISE EXCEPTION 'Rechnung mit separat erstattetem Mietguthaben benötigt eine gesonderte Korrekturabrechnung'; END IF;
END IF;
RETURN NEW; END $$;