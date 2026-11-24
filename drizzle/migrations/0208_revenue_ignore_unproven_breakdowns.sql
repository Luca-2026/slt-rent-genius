DO $$ DECLARE d text; BEGIN
SELECT pg_get_functiondef('public.get_revenue_report(date,date,text,text,text,text,text,integer)'::regprocedure) INTO d;
d:=replace(d,'CASE WHEN p_category=''all'' THEN net_amount ELSE','CASE WHEN net_amount IS NULL THEN NULL WHEN p_category=''all'' THEN net_amount ELSE');
d:=replace(d,'jsonb_array_elements(s.lines) x WHERE p_category=''all'' OR x->>''category''=p_category','jsonb_array_elements(s.lines) x WHERE s.net_amount IS NOT NULL AND (p_category=''all'' OR x->>''category''=p_category)');
d:=replace(d,'WHERE e.event_date BETWEEN p_from AND p_to) c','WHERE e.event_date BETWEEN p_from AND p_to AND e.net_amount IS NOT NULL) c');
EXECUTE d;
END $$;