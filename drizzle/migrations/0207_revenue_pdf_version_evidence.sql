DO $$ DECLARE d text; BEGIN
SELECT pg_get_functiondef('public.capture_inquiry_revenue(jsonb,text,boolean)'::regprocedure) INTO d;
d:=replace(d,'raw_net:=public.revenue_number(p->''totals''->>''netAmount'');','IF p IS NOT NULL THEN p:=p||jsonb_build_object(''offer_number'',link.offer_number); END IF; raw_net:=public.revenue_number(p->''totals''->>''netAmount'');');
d:=replace(d,'p:=coalesce(orig->''offer_payload'',r->''offer_payload''); stamp:=','p:=coalesce(orig->''offer_payload'',r->''offer_payload'')||jsonb_build_object(''offer_number'',coalesce(orig->>''offer_number'',r->>''offer_number'')); stamp:=');
EXECUTE d;
SELECT pg_get_functiondef('public.revenue_record(jsonb,text,text,text,timestamptz,numeric,jsonb,jsonb)'::regprocedure) INTO d;
d:=replace(d,'coalesce(custom_lines,public.revenue_lines(payload->''items'',payload,net,b))','CASE WHEN net IS NULL THEN ''[]''::jsonb ELSE coalesce(custom_lines,public.revenue_lines(payload->''items'',payload,net,b)) END');
d:=replace(d,'ELSE coalesce(nullif(r->>''offer_file_url'',''''),r->>''file_url'') END','WHEN t=''b2b_offers'' THEN r->>''file_url'' WHEN payload->>''offer_number''=r->''original_accepted_offer''->>''offer_number'' THEN r->''original_accepted_offer''->>''offer_file_url'' WHEN coalesce(payload->>''offer_number'',r->>''offer_number'')=r->>''offer_number'' THEN r->>''offer_file_url'' END');
EXECUTE d;
END $$;