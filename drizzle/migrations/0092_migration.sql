DROP POLICY IF EXISTS "Users can view their own reservations" ON public.b2b_reservations;
CREATE POLICY "Users can view their own reservations" ON public.b2b_reservations
  FOR SELECT TO authenticated USING (
    user_id = auth.uid()
    AND (
      b2b_profile_id IS NULL
      OR b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid())
      OR b2b_profile_id IN (SELECT public.get_authorized_profile_ids(auth.uid()))
    )
  );