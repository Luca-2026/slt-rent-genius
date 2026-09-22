CREATE OR REPLACE FUNCTION public.ensure_repair_list(_location text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _title text;
  _id uuid;
BEGIN
  _title := 'Reparaturen ' || CASE _location
    WHEN 'krefeld' THEN 'Krefeld'
    WHEN 'bonn' THEN 'Bonn'
    WHEN 'muelheim' THEN 'Mülheim an der Ruhr'
    ELSE initcap(_location) END;

  SELECT id INTO _id FROM public.staff_todo_lists
   WHERE title = _title AND status <> 'done'
   ORDER BY created_at LIMIT 1;

  IF _id IS NULL THEN
    INSERT INTO public.staff_todo_lists (title, description, location, status, priority, created_by, created_by_name, sent_at)
    VALUES (_title, 'Automatisch angelegte Reparaturaufgaben aus Schadensmeldungen.', _location, 'sent', 'normal', auth.uid(), 'System', now())
    RETURNING id INTO _id;
  END IF;

  RETURN _id;
END;
$$;