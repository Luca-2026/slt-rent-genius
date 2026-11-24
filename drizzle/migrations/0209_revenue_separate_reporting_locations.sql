CREATE FUNCTION public.revenue_site(p text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT CASE WHEN lower(coalesce(p,'')) LIKE '%bonn%' THEN 'bonn' WHEN lower(coalesce(p,'')) LIKE '%mülheim%' OR lower(coalesce(p,'')) LIKE '%muelheim%' THEN 'muelheim' WHEN lower(coalesce(p,'')) LIKE '%krefeld%' THEN 'krefeld' ELSE NULL END $$;
REVOKE ALL ON FUNCTION public.revenue_site(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.revenue_site(text) TO authenticated,service_role;
ALTER TABLE public.revenue_events ADD COLUMN reporting_location text CHECK(reporting_location IN ('bonn','krefeld','muelheim'));
COMMENT ON COLUMN public.revenue_events.reporting_location IS 'Physical reporting site captured from document/source location; location remains the organizational permission scope.';
DO $$ DECLARE d text; BEGIN
SELECT pg_get_functiondef('public.revenue_record(jsonb,text,text,text,timestamptz,numeric,jsonb,jsonb)'::regprocedure) INTO d;
IF position('occurred_at,location,document_number' IN d)=0 THEN RAISE EXCEPTION 'Unexpected revenue_record definition'; END IF;
d:=replace(d,'occurred_at,location,document_number','occurred_at,reporting_location,location,document_number');
d:=replace(d,'stamp,branch,coalesce','stamp,public.revenue_site(coalesce(nullif(r->>''issuing_location'',''''),r->>''location'')),branch,coalesce');
EXECUTE d;
END $$;
WITH sources AS (
SELECT 'inquiry_invoices' AS source_table,i.id AS source_id,i.location AS raw_location FROM public.inquiry_invoices i
UNION ALL SELECT 'rental_inquiries',q.id,q.location FROM public.rental_inquiries q
UNION ALL SELECT 'sales_inquiries',q.id,q.location FROM public.sales_inquiries q
UNION ALL SELECT 'b2b_offers',o.id,coalesce(nullif(o.issuing_location,''),r.location) FROM public.b2b_offers o LEFT JOIN public.b2b_reservations r ON r.id=o.reservation_id
UNION ALL SELECT 'b2b_invoices',i.id,coalesce(nullif(o.issuing_location,''),r.location) FROM public.b2b_invoices i LEFT JOIN public.b2b_offers o ON o.id=i.source_offer_id LEFT JOIN public.b2b_reservations r ON r.id=i.reservation_id
)
UPDATE public.revenue_events e SET reporting_location=public.revenue_site(s.raw_location) FROM sources s WHERE e.source_table=s.source_table AND e.source_id=s.source_id AND e.location=public.revenue_branch(s.raw_location);
CREATE INDEX revenue_events_reporting_period ON public.revenue_events(reporting_location,event_date,stage,business);
ALTER POLICY revenue_events_read ON public.revenue_events USING(public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()) OR (public.has_role(auth.uid(),'niederlassungsleiter') AND location IN(SELECT public.revenue_branch(s.location) FROM public.staff_profiles s WHERE s.user_id=auth.uid() AND s.is_active=true)));
DO $$ DECLARE d text; old_scope text; new_scope text; BEGIN
SELECT pg_get_functiondef('public.get_revenue_report(date,date,text,text,text,text,text,integer)'::regprocedure) INTO d;
d:=replace(d,'''all'',''bonn'',''krefeld'',''unassigned''','''all'',''bonn'',''krefeld'',''muelheim'',''unassigned''');
d:=replace(d,'ELSE loc:=scope->>''location''; IF p_location NOT IN(''all'',loc) THEN','ELSE loc:=p_location; IF p_location<>''all'' AND public.revenue_branch(p_location) IS DISTINCT FROM scope->>''location'' THEN');
old_scope:='SELECT e.* FROM public.revenue_events e WHERE (loc=''all'' OR loc=e.location OR (loc=''unassigned'' AND e.location IS NULL))';
new_scope:='SELECT e.id,e.source_table,e.source_id,e.stage,e.business,e.event_date,e.reporting_location AS location,e.document_number,e.order_code,e.customer_name,e.segment,e.event_kind,e.net_amount,e.lines,nullif(concat_ws('' · '',e.warning,CASE WHEN e.reporting_location IS NULL AND e.location IS NOT NULL THEN ''Einzelstandort nicht eindeutig zugeordnet'' END),'''') AS warning FROM public.revenue_events e WHERE (coalesce((scope->>''admin'')::boolean,false) OR e.location=scope->>''location'') AND (loc=''all'' OR loc=e.reporting_location OR (loc=''unassigned'' AND e.reporting_location IS NULL))';
IF position(old_scope IN d)=0 THEN RAISE EXCEPTION 'Unexpected get_revenue_report scope'; END IF;
d:=replace(d,old_scope,new_scope);
EXECUTE d;
END $$;