ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'niederlassungsleiter';

-- Vollzugriff = jede Admin-Rolle (nicht mehr feste E-Mail-Liste)
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text = 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_staff_member(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.staff_profiles WHERE user_id = _user_id AND is_active = true)
  OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
             AND role::text IN ('admin','standort_mitarbeiter','niederlassungsleiter'))
$$;

-- Operatives Personal: darf Inventar, CMS, Verkaufsartikel und Protokolle bearbeiten
CREATE OR REPLACE FUNCTION public.can_edit_operations(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
                 AND role::text IN ('admin','standort_mitarbeiter','niederlassungsleiter'))
$$;

CREATE POLICY "Operative staff manage managed products" ON public.b2b_managed_products FOR ALL TO authenticated
  USING (public.can_edit_operations(auth.uid())) WITH CHECK (public.can_edit_operations(auth.uid()));
CREATE POLICY "Operative staff manage instances" ON public.b2b_product_instances FOR ALL TO authenticated
  USING (public.can_edit_operations(auth.uid())) WITH CHECK (public.can_edit_operations(auth.uid()));
CREATE POLICY "Operative staff manage maintenance intervals" ON public.b2b_maintenance_intervals FOR ALL TO authenticated
  USING (public.can_edit_operations(auth.uid())) WITH CHECK (public.can_edit_operations(auth.uid()));
CREATE POLICY "Operative staff manage maintenance log" ON public.b2b_maintenance_log FOR ALL TO authenticated
  USING (public.can_edit_operations(auth.uid())) WITH CHECK (public.can_edit_operations(auth.uid()));
CREATE POLICY "Operative staff manage hours log" ON public.b2b_instance_hours_log FOR ALL TO authenticated
  USING (public.can_edit_operations(auth.uid())) WITH CHECK (public.can_edit_operations(auth.uid()));
CREATE POLICY "Operative staff manage local category content" ON public.b2b_local_category_content FOR ALL TO authenticated
  USING (public.can_edit_operations(auth.uid())) WITH CHECK (public.can_edit_operations(auth.uid()));
CREATE POLICY "Operative staff manage new machines" ON public.new_machines FOR ALL TO authenticated
  USING (public.can_edit_operations(auth.uid())) WITH CHECK (public.can_edit_operations(auth.uid()));
CREATE POLICY "Operative staff manage used machines" ON public.used_machines FOR ALL TO authenticated
  USING (public.can_edit_operations(auth.uid())) WITH CHECK (public.can_edit_operations(auth.uid()));
CREATE POLICY "Operative staff manage delivery notes" ON public.b2b_delivery_notes FOR ALL TO authenticated
  USING (public.can_edit_operations(auth.uid())) WITH CHECK (public.can_edit_operations(auth.uid()));
CREATE POLICY "Operative staff manage delivery note items" ON public.b2b_delivery_note_items FOR ALL TO authenticated
  USING (public.can_edit_operations(auth.uid())) WITH CHECK (public.can_edit_operations(auth.uid()));
CREATE POLICY "Operative staff manage return protocols" ON public.b2b_return_protocols FOR ALL TO authenticated
  USING (public.can_edit_operations(auth.uid())) WITH CHECK (public.can_edit_operations(auth.uid()));
CREATE POLICY "Operative staff manage return protocol items" ON public.b2b_return_protocol_items FOR ALL TO authenticated
  USING (public.can_edit_operations(auth.uid())) WITH CHECK (public.can_edit_operations(auth.uid()));
CREATE POLICY "Operative staff read b2b profiles" ON public.b2b_profiles FOR SELECT TO authenticated
  USING (public.can_edit_operations(auth.uid()));