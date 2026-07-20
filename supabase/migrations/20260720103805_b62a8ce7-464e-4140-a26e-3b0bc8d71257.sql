
ALTER VIEW public.maintenance_due_overview SET (security_invoker = true);
REVOKE EXECUTE ON FUNCTION public.complete_maintenance(UUID, DATE, NUMERIC, TEXT, TEXT, NUMERIC, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_maintenance(UUID, DATE, NUMERIC, TEXT, TEXT, NUMERIC, TEXT) TO authenticated;
