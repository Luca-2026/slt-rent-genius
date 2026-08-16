-- CMS-Mietartikel: Schreibrechte nur Geschäftsführung
DROP POLICY IF EXISTS "Admins can insert managed products" ON public.b2b_managed_products;
DROP POLICY IF EXISTS "Admins can update managed products" ON public.b2b_managed_products;
DROP POLICY IF EXISTS "Admins can delete managed products" ON public.b2b_managed_products;

CREATE POLICY "Super admins can insert managed products"
ON public.b2b_managed_products FOR INSERT TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update managed products"
ON public.b2b_managed_products FOR UPDATE TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete managed products"
ON public.b2b_managed_products FOR DELETE TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Einzelartikel
DROP POLICY IF EXISTS "Admins full access to instances" ON public.b2b_product_instances;
CREATE POLICY "Staff can view instances"
ON public.b2b_product_instances FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_staff_member(auth.uid()));
CREATE POLICY "Super admins manage instances"
ON public.b2b_product_instances FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Wartungsintervalle
DROP POLICY IF EXISTS "Admins full access to maintenance intervals" ON public.b2b_maintenance_intervals;
CREATE POLICY "Staff can view maintenance intervals"
ON public.b2b_maintenance_intervals FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_staff_member(auth.uid()));
CREATE POLICY "Super admins manage maintenance intervals"
ON public.b2b_maintenance_intervals FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Wartungsprotokoll
DROP POLICY IF EXISTS "Admins full access to maintenance log" ON public.b2b_maintenance_log;
CREATE POLICY "Staff can view maintenance log"
ON public.b2b_maintenance_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_staff_member(auth.uid()));
CREATE POLICY "Super admins manage maintenance log"
ON public.b2b_maintenance_log FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Betriebsstunden
DROP POLICY IF EXISTS "Admins full access to hours log" ON public.b2b_instance_hours_log;
CREATE POLICY "Staff can view hours log"
ON public.b2b_instance_hours_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_staff_member(auth.uid()));
CREATE POLICY "Super admins manage hours log"
ON public.b2b_instance_hours_log FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));