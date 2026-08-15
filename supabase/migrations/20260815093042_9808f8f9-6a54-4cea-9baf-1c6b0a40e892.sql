-- Helper: aktiver Mitarbeiter oder Admin
CREATE OR REPLACE FUNCTION public.is_staff_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE user_id = _user_id AND is_active = true
  ) OR public.has_role(_user_id, 'admin');
$$;

-- ============ Aufgabenlisten ============
CREATE TABLE public.staff_todo_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text,
  assigned_to uuid,
  assigned_name text,
  assigned_email text,
  created_by uuid,
  created_by_name text,
  status text NOT NULL DEFAULT 'draft',
  priority text NOT NULL DEFAULT 'normal',
  due_date date,
  estimated_minutes integer,
  actual_minutes integer,
  sent_at timestamptz,
  completed_at timestamptz,
  email_sent boolean NOT NULL DEFAULT false,
  email_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_todo_lists TO authenticated;
GRANT ALL ON public.staff_todo_lists TO service_role;
ALTER TABLE public.staff_todo_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view todo lists"
ON public.staff_todo_lists FOR SELECT TO authenticated
USING (
  public.is_staff_member(auth.uid())
  AND (status <> 'draft' OR created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Staff can create todo lists"
ON public.staff_todo_lists FOR INSERT TO authenticated
WITH CHECK (public.is_staff_member(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Staff can update relevant todo lists"
ON public.staff_todo_lists FOR UPDATE TO authenticated
USING (
  public.is_staff_member(auth.uid())
  AND (created_by = auth.uid() OR assigned_to = auth.uid() OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Owner or admin can delete todo lists"
ON public.staff_todo_lists FOR DELETE TO authenticated
USING (
  public.is_staff_member(auth.uid())
  AND (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
);

CREATE TRIGGER update_staff_todo_lists_updated_at
BEFORE UPDATE ON public.staff_todo_lists
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sichtbarkeit einer Liste (für Kind-Tabellen)
CREATE OR REPLACE FUNCTION public.can_access_todo_list(_list_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_staff_member(_user_id)
     AND EXISTS (
       SELECT 1 FROM public.staff_todo_lists l
       WHERE l.id = _list_id
         AND (l.status <> 'draft' OR l.created_by = _user_id OR public.has_role(_user_id, 'admin'))
     );
$$;

-- ============ Aufgabenpunkte ============
CREATE TABLE public.staff_todo_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.staff_todo_lists(id) ON DELETE CASCADE,
  title text NOT NULL,
  note text,
  is_done boolean NOT NULL DEFAULT false,
  done_at timestamptz,
  done_by uuid,
  estimated_minutes integer,
  actual_minutes integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_todo_items TO authenticated;
GRANT ALL ON public.staff_todo_items TO service_role;
ALTER TABLE public.staff_todo_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view todo items"
ON public.staff_todo_items FOR SELECT TO authenticated
USING (public.can_access_todo_list(list_id, auth.uid()));

CREATE POLICY "Staff can create todo items"
ON public.staff_todo_items FOR INSERT TO authenticated
WITH CHECK (public.can_access_todo_list(list_id, auth.uid()));

CREATE POLICY "Staff can update todo items"
ON public.staff_todo_items FOR UPDATE TO authenticated
USING (public.can_access_todo_list(list_id, auth.uid()));

CREATE POLICY "Staff can delete todo items"
ON public.staff_todo_items FOR DELETE TO authenticated
USING (public.can_access_todo_list(list_id, auth.uid()));

CREATE TRIGGER update_staff_todo_items_updated_at
BEFORE UPDATE ON public.staff_todo_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Kommentare / interner Chat ============
CREATE TABLE public.staff_todo_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.staff_todo_lists(id) ON DELETE CASCADE,
  author_id uuid,
  author_name text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_todo_comments TO authenticated;
GRANT ALL ON public.staff_todo_comments TO service_role;
ALTER TABLE public.staff_todo_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view todo comments"
ON public.staff_todo_comments FOR SELECT TO authenticated
USING (public.can_access_todo_list(list_id, auth.uid()));

CREATE POLICY "Staff can write todo comments"
ON public.staff_todo_comments FOR INSERT TO authenticated
WITH CHECK (public.can_access_todo_list(list_id, auth.uid()) AND author_id = auth.uid());

CREATE POLICY "Author or admin can update todo comments"
ON public.staff_todo_comments FOR UPDATE TO authenticated
USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Author or admin can delete todo comments"
ON public.staff_todo_comments FOR DELETE TO authenticated
USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ============ Materialdisposition ============
CREATE TABLE public.staff_material_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  from_location text NOT NULL,
  to_location text NOT NULL,
  tour_date date,
  status text NOT NULL DEFAULT 'offen',
  notes text,
  todo_list_id uuid REFERENCES public.staff_todo_lists(id) ON DELETE SET NULL,
  created_by uuid,
  created_by_name text,
  done_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_material_transfers TO authenticated;
GRANT ALL ON public.staff_material_transfers TO service_role;
ALTER TABLE public.staff_material_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view material transfers"
ON public.staff_material_transfers FOR SELECT TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can create material transfers"
ON public.staff_material_transfers FOR INSERT TO authenticated
WITH CHECK (public.is_staff_member(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Staff can update material transfers"
ON public.staff_material_transfers FOR UPDATE TO authenticated
USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Owner or admin can delete material transfers"
ON public.staff_material_transfers FOR DELETE TO authenticated
USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_staff_material_transfers_updated_at
BEFORE UPDATE ON public.staff_material_transfers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_staff_todo_items_list ON public.staff_todo_items(list_id);
CREATE INDEX idx_staff_todo_comments_list ON public.staff_todo_comments(list_id);
CREATE INDEX idx_staff_todo_lists_assigned ON public.staff_todo_lists(assigned_to);
CREATE INDEX idx_staff_material_transfers_tour ON public.staff_material_transfers(tour_date);