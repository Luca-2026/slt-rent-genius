DROP POLICY IF EXISTS "Staff can insert audit rows" ON public.admin_audit_log;
CREATE POLICY "Staff can insert audit rows"
ON public.admin_audit_log
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_member(auth.uid()));