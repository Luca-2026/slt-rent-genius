
-- Step 1: Create SECURITY DEFINER helper functions to break circular RLS

-- Get b2b_profile_id for a user (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_b2b_profile_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.b2b_profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Get b2b_profile_id for an authorized person (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_authorized_profile_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b2b_profile_id FROM public.b2b_authorized_persons
  WHERE user_id = _user_id AND is_active = true
$$;

-- Step 2: Fix b2b_profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.b2b_profiles;
CREATE POLICY "Users can view their own profile" ON public.b2b_profiles
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authorized persons can view company profile" ON public.b2b_profiles;
CREATE POLICY "Authorized persons can view company profile" ON public.b2b_profiles
  FOR SELECT USING (id IN (SELECT public.get_authorized_profile_ids(auth.uid())));

DROP POLICY IF EXISTS "Users can update limited profile fields" ON public.b2b_profiles;
CREATE POLICY "Users can update limited profile fields" ON public.b2b_profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    (user_id = auth.uid())
    AND (status = (SELECT bp.status FROM public.b2b_profiles bp WHERE bp.id = b2b_profiles.id))
    AND (credit_limit = (SELECT bp.credit_limit FROM public.b2b_profiles bp WHERE bp.id = b2b_profiles.id))
    AND (used_credit = (SELECT bp.used_credit FROM public.b2b_profiles bp WHERE bp.id = b2b_profiles.id))
    AND (NOT (assigned_location IS DISTINCT FROM (SELECT bp.assigned_location FROM public.b2b_profiles bp WHERE bp.id = b2b_profiles.id)))
    AND (NOT (internal_notes IS DISTINCT FROM (SELECT bp.internal_notes FROM public.b2b_profiles bp WHERE bp.id = b2b_profiles.id)))
    AND (NOT (status_changed_by IS DISTINCT FROM (SELECT bp.status_changed_by FROM public.b2b_profiles bp WHERE bp.id = b2b_profiles.id)))
    AND (NOT (rejection_reason IS DISTINCT FROM (SELECT bp.rejection_reason FROM public.b2b_profiles bp WHERE bp.id = b2b_profiles.id)))
    AND (vat_id_verified = (SELECT bp.vat_id_verified FROM public.b2b_profiles bp WHERE bp.id = b2b_profiles.id))
  );

-- Step 3: Fix b2b_authorized_persons policies (use helper function instead of subquery on b2b_profiles)
DROP POLICY IF EXISTS "Users can view own authorized persons" ON public.b2b_authorized_persons;
CREATE POLICY "Users can view own authorized persons" ON public.b2b_authorized_persons
  FOR SELECT USING (b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own authorized persons" ON public.b2b_authorized_persons;
CREATE POLICY "Users can insert own authorized persons" ON public.b2b_authorized_persons
  FOR INSERT WITH CHECK (b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid()));

DROP POLICY IF EXISTS "Users can update own authorized persons" ON public.b2b_authorized_persons;
CREATE POLICY "Users can update own authorized persons" ON public.b2b_authorized_persons
  FOR UPDATE USING (b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid()));

DROP POLICY IF EXISTS "Users can delete own authorized persons" ON public.b2b_authorized_persons;
CREATE POLICY "Users can delete own authorized persons" ON public.b2b_authorized_persons
  FOR DELETE USING (b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid()));

-- Step 4: Fix other tables that have circular references through b2b_profiles

-- b2b_offers
DROP POLICY IF EXISTS "B2B users can view their own offers" ON public.b2b_offers;
CREATE POLICY "B2B users can view their own offers" ON public.b2b_offers
  FOR SELECT USING (b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid()));

DROP POLICY IF EXISTS "Authorized persons can view company offers" ON public.b2b_offers;
CREATE POLICY "Authorized persons can view company offers" ON public.b2b_offers
  FOR SELECT USING (b2b_profile_id IN (SELECT public.get_authorized_profile_ids(auth.uid())));

-- b2b_offer_items
DROP POLICY IF EXISTS "B2B users can view their own offer items" ON public.b2b_offer_items;
CREATE POLICY "B2B users can view their own offer items" ON public.b2b_offer_items
  FOR SELECT USING (offer_id IN (
    SELECT id FROM public.b2b_offers
    WHERE b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid())
  ));

-- b2b_reservations
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.b2b_reservations;
CREATE POLICY "Users can view their own reservations" ON public.b2b_reservations
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authorized persons can view company reservations" ON public.b2b_reservations;
CREATE POLICY "Authorized persons can view company reservations" ON public.b2b_reservations
  FOR SELECT USING (b2b_profile_id IN (SELECT public.get_authorized_profile_ids(auth.uid())));

DROP POLICY IF EXISTS "Authorized persons can create company reservations" ON public.b2b_reservations;
CREATE POLICY "Authorized persons can create company reservations" ON public.b2b_reservations
  FOR INSERT WITH CHECK (
    b2b_profile_id IN (SELECT public.get_authorized_profile_ids(auth.uid()))
    AND user_id = auth.uid()
  );

-- b2b_invoices
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.b2b_invoices;
CREATE POLICY "Users can view their own invoices" ON public.b2b_invoices
  FOR SELECT USING (b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid()));

DROP POLICY IF EXISTS "Authorized persons can view company invoices" ON public.b2b_invoices;
CREATE POLICY "Authorized persons can view company invoices" ON public.b2b_invoices
  FOR SELECT USING (b2b_profile_id IN (SELECT public.get_authorized_profile_ids(auth.uid())));

-- b2b_delivery_notes
DROP POLICY IF EXISTS "B2B users can view their own delivery notes" ON public.b2b_delivery_notes;
CREATE POLICY "B2B users can view their own delivery notes" ON public.b2b_delivery_notes
  FOR SELECT USING (b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid()));

DROP POLICY IF EXISTS "Authorized persons can view company delivery notes" ON public.b2b_delivery_notes;
CREATE POLICY "Authorized persons can view company delivery notes" ON public.b2b_delivery_notes
  FOR SELECT USING (b2b_profile_id IN (SELECT public.get_authorized_profile_ids(auth.uid())));

-- b2b_return_protocols
DROP POLICY IF EXISTS "B2B users can view own return protocols" ON public.b2b_return_protocols;
CREATE POLICY "B2B users can view own return protocols" ON public.b2b_return_protocols
  FOR SELECT USING (b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid()));

-- b2b_category_discounts
DROP POLICY IF EXISTS "Users can view their own discounts" ON public.b2b_category_discounts;
CREATE POLICY "Users can view their own discounts" ON public.b2b_category_discounts
  FOR SELECT USING (b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid()));

-- b2b_customer_prices
DROP POLICY IF EXISTS "B2B users can view their own prices" ON public.b2b_customer_prices;
CREATE POLICY "B2B users can view their own prices" ON public.b2b_customer_prices
  FOR SELECT USING (b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid()));

-- b2b_invoice_items
DROP POLICY IF EXISTS "Users can view their own invoice items" ON public.b2b_invoice_items;
CREATE POLICY "Users can view their own invoice items" ON public.b2b_invoice_items
  FOR SELECT USING (invoice_id IN (
    SELECT id FROM public.b2b_invoices
    WHERE b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid())
  ));

-- b2b_delivery_note_items
DROP POLICY IF EXISTS "B2B users can view their own delivery note items" ON public.b2b_delivery_note_items;
CREATE POLICY "B2B users can view their own delivery note items" ON public.b2b_delivery_note_items
  FOR SELECT USING (delivery_note_id IN (
    SELECT id FROM public.b2b_delivery_notes
    WHERE b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid())
  ));

-- b2b_return_protocol_items
DROP POLICY IF EXISTS "B2B users can view own return protocol items" ON public.b2b_return_protocol_items;
CREATE POLICY "B2B users can view own return protocol items" ON public.b2b_return_protocol_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.b2b_return_protocols rp
    WHERE rp.id = b2b_return_protocol_items.return_protocol_id
      AND rp.b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid())
  ));
