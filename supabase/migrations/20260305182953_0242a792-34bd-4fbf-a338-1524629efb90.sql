-- Allow admins to delete any reservation
CREATE POLICY "Admins can delete reservations"
ON public.b2b_reservations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow users to delete their own pending reservations
CREATE POLICY "Users can delete own pending reservations"
ON public.b2b_reservations
FOR DELETE
TO authenticated
USING (user_id = auth.uid() AND status = 'pending');