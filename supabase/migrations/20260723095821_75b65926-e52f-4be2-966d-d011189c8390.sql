DROP POLICY IF EXISTS "Authorized persons can view company invoices" ON public.b2b_invoices;
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.b2b_invoices;

CREATE POLICY "Users can view their own invoices"
ON public.b2b_invoices FOR SELECT
USING (
  b2b_profile_id = get_b2b_profile_id_for_user(auth.uid())
  AND status <> 'draft'
);

CREATE POLICY "Authorized persons can view company invoices"
ON public.b2b_invoices FOR SELECT
USING (
  b2b_profile_id IN (SELECT get_authorized_profile_ids(auth.uid()))
  AND status <> 'draft'
);