DROP POLICY IF EXISTS "System can insert audit rows" ON public.admin_audit_log;

CREATE POLICY "Staff can insert audit rows"
ON public.admin_audit_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

REVOKE INSERT, UPDATE, DELETE ON public.admin_audit_log FROM anon;