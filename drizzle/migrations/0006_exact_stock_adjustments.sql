-- Bestandsbuchungen exakt zurückbuchen: gebuchte Menge merken, damit
-- eine auf 0 begrenzte Abbuchung nicht zu viel zurückgibt.

ALTER TABLE public.b2b_inventory_damages
  ADD COLUMN IF NOT EXISTS applied_quantity integer NOT NULL DEFAULT 0;

ALTER TABLE public.staff_material_transfers
  ADD COLUMN IF NOT EXISTS applied_from_quantity integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS applied_to_quantity integer NOT NULL DEFAULT 0;

-- Gibt die tatsächlich gebuchte Veränderung zurück (kann durch die
-- Untergrenze 0 kleiner ausfallen als gewünscht).
CREATE OR REPLACE FUNCTION public.adjust_product_stock_delta(_slug text, _location text, _delta integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current integer;
  _next integer;
BEGIN
  IF _slug IS NULL OR _location IS NULL OR _delta = 0 THEN
    RETURN 0;
  END IF;

  SELECT COALESCE((quantities ->> _location)::integer, 0)
    INTO _current
    FROM public.b2b_managed_products
   WHERE slug = _slug
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  _next := GREATEST(_current + _delta, 0);

  UPDATE public.b2b_managed_products
     SET quantities = COALESCE(quantities, '{}'::jsonb) || jsonb_build_object(_location, _next),
         updated_at = now()
   WHERE slug = _slug;

  RETURN _next - _current;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_inventory_damage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _should_reduce boolean;
  _list_id uuid;
  _item_id uuid;
  _applied integer;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.stock_applied AND OLD.product_slug IS NOT NULL AND OLD.applied_quantity > 0 THEN
      PERFORM public.adjust_product_stock_delta(OLD.product_slug, OLD.location, OLD.applied_quantity);
    END IF;
    IF OLD.todo_item_id IS NOT NULL THEN
      DELETE FROM public.staff_todo_items WHERE id = OLD.todo_item_id AND is_done = false;
    END IF;
    RETURN OLD;
  END IF;

  _should_reduce := NEW.reduces_stock AND NEW.status <> 'repariert' AND NEW.product_slug IS NOT NULL;

  IF _should_reduce AND NOT COALESCE(NEW.stock_applied, false) THEN
    _applied := public.adjust_product_stock_delta(NEW.product_slug, NEW.location, -NEW.quantity);
    NEW.applied_quantity := -_applied;
    NEW.stock_applied := true;
  ELSIF NOT _should_reduce AND COALESCE(NEW.stock_applied, false) THEN
    IF COALESCE(OLD.applied_quantity, 0) > 0 THEN
      PERFORM public.adjust_product_stock_delta(
        COALESCE(OLD.product_slug, NEW.product_slug),
        COALESCE(OLD.location, NEW.location),
        OLD.applied_quantity);
    END IF;
    NEW.applied_quantity := 0;
    NEW.stock_applied := false;
  END IF;

  IF NEW.needs_repair AND NEW.status <> 'repariert' AND NEW.todo_item_id IS NULL THEN
    _list_id := public.ensure_repair_list(NEW.location);
    INSERT INTO public.staff_todo_items (list_id, title, note)
    VALUES (
      _list_id,
      'Reparatur: ' || NEW.product_name,
      COALESCE(NEW.description, '') ||
        CASE WHEN NEW.protocol_number IS NOT NULL THEN ' (Protokoll ' || NEW.protocol_number || ')' ELSE '' END
    )
    RETURNING id INTO _item_id;
    NEW.todo_item_id := _item_id;
    NEW.todo_list_id := _list_id;
    IF NEW.status = 'offen' THEN
      NEW.status := 'in_reparatur';
    END IF;
  END IF;

  IF NEW.status = 'repariert' AND NEW.resolved_at IS NULL THEN
    NEW.resolved_at := now();
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_material_transfer_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _should boolean;
  _out integer;
  _in integer;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.stock_applied AND OLD.product_slug IS NOT NULL THEN
      PERFORM public.adjust_product_stock_delta(OLD.product_slug, OLD.to_location, -COALESCE(OLD.applied_to_quantity, OLD.quantity));
      PERFORM public.adjust_product_stock_delta(OLD.product_slug, OLD.from_location, COALESCE(OLD.applied_from_quantity, OLD.quantity));
    END IF;
    RETURN OLD;
  END IF;

  _should := (NEW.status = 'erledigt') AND NEW.product_slug IS NOT NULL;

  IF _should AND NOT COALESCE(NEW.stock_applied, false) THEN
    _out := public.adjust_product_stock_delta(NEW.product_slug, NEW.from_location, -NEW.quantity);
    -- Nur die tatsächlich abgebuchte Menge am Ziel gutschreiben.
    _in := public.adjust_product_stock_delta(NEW.product_slug, NEW.to_location, -_out);
    NEW.applied_from_quantity := -_out;
    NEW.applied_to_quantity := _in;
    NEW.stock_applied := true;
    NEW.stock_applied_at := now();
  ELSIF NOT _should AND COALESCE(NEW.stock_applied, false) THEN
    PERFORM public.adjust_product_stock_delta(OLD.product_slug, OLD.to_location, -COALESCE(OLD.applied_to_quantity, OLD.quantity));
    PERFORM public.adjust_product_stock_delta(OLD.product_slug, OLD.from_location, COALESCE(OLD.applied_from_quantity, OLD.quantity));
    NEW.applied_from_quantity := 0;
    NEW.applied_to_quantity := 0;
    NEW.stock_applied := false;
    NEW.stock_applied_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;