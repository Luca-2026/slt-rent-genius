-- 1) Materialtransfers: Verknüpfung zum Katalogartikel + Buchungsstatus
ALTER TABLE public.staff_material_transfers
  ADD COLUMN IF NOT EXISTS product_slug text,
  ADD COLUMN IF NOT EXISTS stock_applied boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stock_applied_at timestamptz;

-- Hilfsfunktion: Bestandsmenge eines Artikels an einem Standort verändern (nie < 0)
CREATE OR REPLACE FUNCTION public.adjust_product_stock(_slug text, _location text, _delta integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current integer;
  _next integer;
BEGIN
  IF _slug IS NULL OR _location IS NULL OR _delta = 0 THEN
    RETURN;
  END IF;

  SELECT COALESCE((quantities ->> _location)::integer, 0)
    INTO _current
    FROM public.b2b_managed_products
   WHERE slug = _slug
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  _next := GREATEST(_current + _delta, 0);

  UPDATE public.b2b_managed_products
     SET quantities = COALESCE(quantities, '{}'::jsonb) || jsonb_build_object(_location, _next),
         updated_at = now()
   WHERE slug = _slug;
END;
$$;

-- Transfer-Umbuchung bei Statuswechsel auf/von "erledigt"
CREATE OR REPLACE FUNCTION public.apply_material_transfer_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _should boolean;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.stock_applied AND OLD.product_slug IS NOT NULL THEN
      PERFORM public.adjust_product_stock(OLD.product_slug, OLD.to_location, -OLD.quantity);
      PERFORM public.adjust_product_stock(OLD.product_slug, OLD.from_location, OLD.quantity);
    END IF;
    RETURN OLD;
  END IF;

  _should := (NEW.status = 'erledigt') AND NEW.product_slug IS NOT NULL;

  IF _should AND NOT COALESCE(NEW.stock_applied, false) THEN
    PERFORM public.adjust_product_stock(NEW.product_slug, NEW.from_location, -NEW.quantity);
    PERFORM public.adjust_product_stock(NEW.product_slug, NEW.to_location, NEW.quantity);
    NEW.stock_applied := true;
    NEW.stock_applied_at := now();
  ELSIF NOT _should AND COALESCE(NEW.stock_applied, false) THEN
    PERFORM public.adjust_product_stock(OLD.product_slug, OLD.to_location, -OLD.quantity);
    PERFORM public.adjust_product_stock(OLD.product_slug, OLD.from_location, OLD.quantity);
    NEW.stock_applied := false;
    NEW.stock_applied_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_material_transfer_stock ON public.staff_material_transfers;
CREATE TRIGGER trg_material_transfer_stock
BEFORE INSERT OR UPDATE ON public.staff_material_transfers
FOR EACH ROW EXECUTE FUNCTION public.apply_material_transfer_stock();

DROP TRIGGER IF EXISTS trg_material_transfer_stock_delete ON public.staff_material_transfers;
CREATE TRIGGER trg_material_transfer_stock_delete
BEFORE DELETE ON public.staff_material_transfers
FOR EACH ROW EXECUTE FUNCTION public.apply_material_transfer_stock();

-- 2) Zentrale Schadensverwaltung
CREATE TABLE IF NOT EXISTS public.b2b_inventory_damages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug text,
  product_name text NOT NULL,
  location text NOT NULL DEFAULT 'krefeld',
  category text NOT NULL DEFAULT 'sonstiges',
  description text,
  photo_urls text[] NOT NULL DEFAULT '{}'::text[],
  quantity integer NOT NULL DEFAULT 1,
  needs_repair boolean NOT NULL DEFAULT false,
  reduces_stock boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'offen',
  stock_applied boolean NOT NULL DEFAULT false,
  todo_item_id uuid REFERENCES public.staff_todo_items(id) ON DELETE SET NULL,
  todo_list_id uuid REFERENCES public.staff_todo_lists(id) ON DELETE SET NULL,
  protocol_damage_id uuid REFERENCES public.b2b_protocol_damages(id) ON DELETE SET NULL,
  protocol_type text,
  protocol_number text,
  b2b_profile_id uuid REFERENCES public.b2b_profiles(id) ON DELETE SET NULL,
  amount numeric(10,2),
  created_by uuid,
  created_by_name text,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT b2b_inventory_damages_status_check CHECK (status IN ('offen','in_reparatur','repariert')),
  CONSTRAINT b2b_inventory_damages_location_check CHECK (location IN ('krefeld','bonn','muelheim'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.b2b_inventory_damages TO authenticated;
GRANT ALL ON public.b2b_inventory_damages TO service_role;

ALTER TABLE public.b2b_inventory_damages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view inventory damages" ON public.b2b_inventory_damages;
CREATE POLICY "Staff can view inventory damages"
ON public.b2b_inventory_damages FOR SELECT TO authenticated
USING (public.is_staff_member(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Staff can create inventory damages" ON public.b2b_inventory_damages;
CREATE POLICY "Staff can create inventory damages"
ON public.b2b_inventory_damages FOR INSERT TO authenticated
WITH CHECK (public.is_staff_member(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Staff can update inventory damages" ON public.b2b_inventory_damages;
CREATE POLICY "Staff can update inventory damages"
ON public.b2b_inventory_damages FOR UPDATE TO authenticated
USING (public.is_staff_member(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.is_staff_member(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Staff can delete inventory damages" ON public.b2b_inventory_damages;
CREATE POLICY "Staff can delete inventory damages"
ON public.b2b_inventory_damages FOR DELETE TO authenticated
USING (public.is_staff_member(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_inventory_damages_status ON public.b2b_inventory_damages (status);
CREATE INDEX IF NOT EXISTS idx_inventory_damages_slug ON public.b2b_inventory_damages (product_slug);
CREATE INDEX IF NOT EXISTS idx_inventory_damages_location ON public.b2b_inventory_damages (location);

DROP TRIGGER IF EXISTS trg_inventory_damages_updated_at ON public.b2b_inventory_damages;
CREATE TRIGGER trg_inventory_damages_updated_at
BEFORE UPDATE ON public.b2b_inventory_damages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Reparaturliste je Standort sicherstellen
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
   WHERE title = _title AND status <> 'archived'
   ORDER BY created_at LIMIT 1;

  IF _id IS NULL THEN
    INSERT INTO public.staff_todo_lists (title, description, location, status, priority, created_by, created_by_name)
    VALUES (_title, 'Automatisch angelegte Reparaturaufgaben aus Schadensmeldungen.', _location, 'open', 'normal', auth.uid(), 'System')
    RETURNING id INTO _id;
  END IF;

  RETURN _id;
END;
$$;

-- Schaden: Bestandsabzug und Reparaturaufgabe synchron halten
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
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.stock_applied AND OLD.product_slug IS NOT NULL THEN
      PERFORM public.adjust_product_stock(OLD.product_slug, OLD.location, OLD.quantity);
    END IF;
    IF OLD.todo_item_id IS NOT NULL THEN
      DELETE FROM public.staff_todo_items WHERE id = OLD.todo_item_id AND is_done = false;
    END IF;
    RETURN OLD;
  END IF;

  _should_reduce := NEW.reduces_stock AND NEW.status <> 'repariert' AND NEW.product_slug IS NOT NULL;

  IF _should_reduce AND NOT COALESCE(NEW.stock_applied, false) THEN
    PERFORM public.adjust_product_stock(NEW.product_slug, NEW.location, -NEW.quantity);
    NEW.stock_applied := true;
  ELSIF NOT _should_reduce AND COALESCE(NEW.stock_applied, false) THEN
    PERFORM public.adjust_product_stock(COALESCE(OLD.product_slug, NEW.product_slug), COALESCE(OLD.location, NEW.location), COALESCE(OLD.quantity, NEW.quantity));
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

DROP TRIGGER IF EXISTS trg_inventory_damage_sync ON public.b2b_inventory_damages;
CREATE TRIGGER trg_inventory_damage_sync
BEFORE INSERT OR UPDATE ON public.b2b_inventory_damages
FOR EACH ROW EXECUTE FUNCTION public.sync_inventory_damage();

DROP TRIGGER IF EXISTS trg_inventory_damage_sync_delete ON public.b2b_inventory_damages;
CREATE TRIGGER trg_inventory_damage_sync_delete
BEFORE DELETE ON public.b2b_inventory_damages
FOR EACH ROW EXECUTE FUNCTION public.sync_inventory_damage();

-- Abgehakte Reparaturaufgabe schließt den Schaden
CREATE OR REPLACE FUNCTION public.resolve_damage_on_todo_done()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_done AND NOT COALESCE(OLD.is_done, false) THEN
    UPDATE public.b2b_inventory_damages
       SET status = 'repariert', resolved_at = now(), resolved_by = auth.uid()
     WHERE todo_item_id = NEW.id AND status <> 'repariert';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_todo_item_resolves_damage ON public.staff_todo_items;
CREATE TRIGGER trg_todo_item_resolves_damage
AFTER UPDATE ON public.staff_todo_items
FOR EACH ROW EXECUTE FUNCTION public.resolve_damage_on_todo_done();