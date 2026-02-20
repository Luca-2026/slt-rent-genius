
-- Drop the overly permissive user update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.b2b_profiles;

-- Create a restricted UPDATE policy that only allows users to update safe contact/address fields
-- Sensitive fields like status, credit_limit, used_credit, assigned_location, internal_notes,
-- status_changed_by, rejection_reason, vat_id_verified are locked to their current values
CREATE POLICY "Users can update limited profile fields"
ON public.b2b_profiles FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND
  status = (SELECT bp.status FROM b2b_profiles bp WHERE bp.id = b2b_profiles.id) AND
  credit_limit = (SELECT bp.credit_limit FROM b2b_profiles bp WHERE bp.id = b2b_profiles.id) AND
  used_credit = (SELECT bp.used_credit FROM b2b_profiles bp WHERE bp.id = b2b_profiles.id) AND
  assigned_location IS NOT DISTINCT FROM (SELECT bp.assigned_location FROM b2b_profiles bp WHERE bp.id = b2b_profiles.id) AND
  internal_notes IS NOT DISTINCT FROM (SELECT bp.internal_notes FROM b2b_profiles bp WHERE bp.id = b2b_profiles.id) AND
  status_changed_by IS NOT DISTINCT FROM (SELECT bp.status_changed_by FROM b2b_profiles bp WHERE bp.id = b2b_profiles.id) AND
  rejection_reason IS NOT DISTINCT FROM (SELECT bp.rejection_reason FROM b2b_profiles bp WHERE bp.id = b2b_profiles.id) AND
  vat_id_verified = (SELECT bp.vat_id_verified FROM b2b_profiles bp WHERE bp.id = b2b_profiles.id)
);
