
-- Allow SECURITY DEFINER functions (audit_row_change, log_admin_login) to insert
CREATE POLICY "System can insert audit rows"
  ON public.admin_audit_log FOR INSERT
  WITH CHECK (true);

GRANT INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

-- Attach audit triggers to the relevant tables
DROP TRIGGER IF EXISTS audit_b2b_managed_products ON public.b2b_managed_products;
CREATE TRIGGER audit_b2b_managed_products
AFTER INSERT OR UPDATE OR DELETE ON public.b2b_managed_products
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS audit_b2b_profiles ON public.b2b_profiles;
CREATE TRIGGER audit_b2b_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.b2b_profiles
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS audit_b2b_invoices ON public.b2b_invoices;
CREATE TRIGGER audit_b2b_invoices
AFTER INSERT OR UPDATE OR DELETE ON public.b2b_invoices
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS audit_b2b_offers ON public.b2b_offers;
CREATE TRIGGER audit_b2b_offers
AFTER INSERT OR UPDATE OR DELETE ON public.b2b_offers
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS audit_b2b_delivery_notes ON public.b2b_delivery_notes;
CREATE TRIGGER audit_b2b_delivery_notes
AFTER INSERT OR UPDATE OR DELETE ON public.b2b_delivery_notes
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
