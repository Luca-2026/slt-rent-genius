-- 1) b2b_profiles: anon vollständig sperren
REVOKE ALL ON public.b2b_profiles FROM anon;
REVOKE ALL ON public.b2b_profiles_customer FROM anon;

-- 2) Interne Betriebsdaten: anon vollständig sperren
REVOKE ALL ON public.b2b_product_instances FROM anon;
REVOKE ALL ON public.b2b_maintenance_intervals FROM anon;
REVOKE ALL ON public.b2b_maintenance_log FROM anon;
REVOKE ALL ON public.b2b_instance_hours_log FROM anon;
REVOKE ALL ON public.maintenance_due_overview FROM anon;