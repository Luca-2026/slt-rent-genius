
-- Drop the restrictive user update policy that blocks admins from changing status
DROP POLICY IF EXISTS "Users can update limited profile fields" ON public.b2b_profiles;

-- Recreate it with an exclusion for admins
CREATE POLICY "Users can update limited profile fields"
ON public.b2b_profiles
FOR UPDATE
USING (user_id = auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (
  (user_id = auth.uid())
  AND NOT has_role(auth.uid(), 'admin'::app_role)
  AND (status = (SELECT bp.status FROM b2b_profiles bp WHERE bp.id = b2b_profiles.id))
  AND (credit_limit = (SELECT bp.credit_limit FROM b2b_profiles bp WHERE bp.id = b2b_profiles.id))
  AND (used_credit = (SELECT bp.used_credit FROM b2b_profiles bp WHERE bp.id = b2b_profiles.id))
  AND NOT (assigned_location IS DISTINCT FROM (SELECT bp.assigned_location FROM b2b_profiles bp WHERE bp.id = b2b_profiles.id))
  AND NOT (internal_notes IS DISTINCT FROM (SELECT bp.internal_notes FROM b2b_profiles bp WHERE bp.id = b2b_profiles.id))
  AND NOT (status_changed_by IS DISTINCT FROM (SELECT bp.status_changed_by FROM b2b_profiles bp WHERE bp.id = b2b_profiles.id))
  AND NOT (rejection_reason IS DISTINCT FROM (SELECT bp.rejection_reason FROM b2b_profiles bp WHERE bp.id = b2b_profiles.id))
  AND (vat_id_verified = (SELECT bp.vat_id_verified FROM b2b_profiles bp WHERE bp.id = b2b_profiles.id))
);
