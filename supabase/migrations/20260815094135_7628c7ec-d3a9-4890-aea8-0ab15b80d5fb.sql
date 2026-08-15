ALTER TABLE public.staff_todo_lists REPLICA IDENTITY FULL;
ALTER TABLE public.staff_todo_items REPLICA IDENTITY FULL;
ALTER TABLE public.staff_todo_comments REPLICA IDENTITY FULL;
ALTER TABLE public.staff_material_transfers REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_todo_lists;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_todo_items;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_todo_comments;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_material_transfers;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;