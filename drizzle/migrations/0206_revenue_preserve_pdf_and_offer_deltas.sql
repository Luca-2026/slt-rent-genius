ALTER TABLE public.revenue_events ADD COLUMN document_url text;
DO $$ DECLARE d text; BEGIN
SELECT pg_get_functiondef('public.revenue_record(jsonb,text,text,text,timestamptz,numeric,jsonb,jsonb)'::regprocedure) INTO d;
d:=replace(d,'net_amount,lines,warning)','net_amount,lines,warning,document_url)');
d:=replace(d,'''Standort nicht belegt'' END),'''')) ON CONFLICT(id)', '''Standort nicht belegt'' END),''''),CASE WHEN s=''invoiced'' THEN coalesce(nullif(r->>''file_url'',''''),r->>''file_path'') ELSE coalesce(nullif(r->>''offer_file_url'',''''),r->>''file_url'') END) ON CONFLICT(id)');
EXECUTE d;
END $$;
UPDATE public.revenue_events e SET document_url=coalesce(nullif(i.file_url,''),i.file_path) FROM public.inquiry_invoices i WHERE e.source_table='inquiry_invoices' AND e.source_id=i.id;
UPDATE public.revenue_events e SET document_url=i.file_url FROM public.b2b_invoices i WHERE e.source_table='b2b_invoices' AND e.source_id=i.id;
UPDATE public.revenue_events e SET document_url=i.file_url FROM public.b2b_offers i WHERE e.source_table='b2b_offers' AND e.source_id=i.id AND e.document_number=i.offer_number;
UPDATE public.revenue_events e SET document_url=CASE WHEN q.original_accepted_offer->>'offer_number'=e.document_number THEN q.original_accepted_offer->>'offer_file_url' WHEN q.offer_number=e.document_number THEN q.offer_file_url END FROM public.rental_inquiries q WHERE e.source_table='rental_inquiries' AND e.source_id=q.id;
UPDATE public.revenue_events e SET document_url=CASE WHEN q.original_accepted_offer->>'offer_number'=e.document_number THEN q.original_accepted_offer->>'offer_file_url' WHEN q.offer_number=e.document_number THEN q.offer_file_url END FROM public.sales_inquiries q WHERE e.source_table='sales_inquiries' AND e.source_id=q.id;
DO $$ DECLARE d text; BEGIN
SELECT pg_get_functiondef('public.get_revenue_document(text)'::regprocedure) INTO d;
d:=replace(d,'IF url IS NULL THEN RAISE EXCEPTION','url:=coalesce(e.document_url,url); IF url IS NULL THEN RAISE EXCEPTION');
EXECUTE d;
SELECT pg_get_functiondef('public.capture_document_revenue(jsonb,text)'::regprocedure) INTO d;
d:=replace(d,'net numeric; loc text; code text;', 'net numeric; loc text; code text; prior numeric; has_prior boolean;');
d:=replace(d, 'IF r->>''email_sent''=''true'' AND r->>''email_sent_at'' IS NOT NULL THEN PERFORM public.revenue_record(r,t,''offered'',''Versand ''||(r->>''offer_number''),public.revenue_time(r->>''email_sent_at''),public.revenue_number(r->>''net_amount''),p); END IF;',
'IF r->>''email_sent''=''true'' AND r->>''email_sent_at'' IS NOT NULL THEN
SELECT count(*)>0,CASE WHEN count(*) FILTER(WHERE e.net_amount IS NULL)>0 THEN NULL ELSE coalesce(sum(e.net_amount),0) END INTO has_prior,prior FROM public.revenue_events e WHERE e.source_table=t AND e.source_id=(r->>''id'')::uuid AND e.stage=''offered'';
net:=public.revenue_number(r->>''net_amount'');
IF NOT has_prior OR net IS DISTINCT FROM prior THEN
PERFORM public.revenue_record(r,t,''offered'',''Versand ''||(r->>''offer_number'')||'' Fassung ''||md5(coalesce((net-prior)::text,''unknown'')||coalesce(r->>''email_sent_at'','''')),public.revenue_time(r->>''email_sent_at''),net-prior,p,CASE WHEN NOT has_prior THEN NULL ELSE jsonb_build_array(jsonb_build_object(''name'',''Angebotsänderung'',''category'',''Nicht aufgeschlüsselt'',''net'',net-prior)) END);
END IF; END IF;');
EXECUTE d;
END $$;