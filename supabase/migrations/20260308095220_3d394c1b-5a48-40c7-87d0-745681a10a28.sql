
-- Create a security definer function to get locked profile fields without triggering RLS
CREATE OR REPLACE FUNCTION public.get_b2b_profile_locked_fields(_profile_id uuid)
RETURNS TABLE(
  status b2b_status,
  credit_limit numeric,
  used_credit numeric,
  assigned_location text,
  internal_notes text,
  status_changed_by uuid,
  rejection_reason text,
  vat_id_verified boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status, credit_limit, used_credit, assigned_location, internal_notes, status_changed_by, rejection_reason, vat_id_verified
  FROM public.b2b_profiles
  WHERE id = _profile_id
  LIMIT 1
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can update limited profile fields" ON public.b2b_profiles;

-- Recreate without self-referencing subqueries
CREATE POLICY "Users can update limited profile fields"
ON public.b2b_profiles
FOR UPDATE
USING (user_id = auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (
  (user_id = auth.uid())
  AND NOT has_role(auth.uid(), 'admin'::app_role)
  AND (status = (SELECT f.status FROM get_b2b_profile_locked_fields(b2b_profiles.id) f))
  AND (credit_limit = (SELECT f.credit_limit FROM get_b2b_profile_locked_fields(b2b_profiles.id) f))
  AND (used_credit = (SELECT f.used_credit FROM get_b2b_profile_locked_fields(b2b_profiles.id) f))
  AND NOT (assigned_location IS DISTINCT FROM (SELECT f.assigned_location FROM get_b2b_profile_locked_fields(b2b_profiles.id) f))
  AND NOT (internal_notes IS DISTINCT FROM (SELECT f.internal_notes FROM get_b2b_profile_locked_fields(b2b_profiles.id) f))
  AND NOT (status_changed_by IS DISTINCT FROM (SELECT f.status_changed_by FROM get_b2b_profile_locked_fields(b2b_profiles.id) f))
  AND NOT (rejection_reason IS DISTINCT FROM (SELECT f.rejection_reason FROM get_b2b_profile_locked_fields(b2b_profiles.id) f))
  AND (vat_id_verified = (SELECT f.vat_id_verified FROM get_b2b_profile_locked_fields(b2b_profiles.id) f))
);
