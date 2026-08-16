DROP POLICY IF EXISTS "Staff can update relevant todo lists" ON public.staff_todo_lists;
CREATE POLICY "Staff can update relevant todo lists"
ON public.staff_todo_lists
FOR UPDATE
TO authenticated
USING (
  public.is_staff_member(auth.uid())
  AND (
    status <> 'draft'
    OR created_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  )
);