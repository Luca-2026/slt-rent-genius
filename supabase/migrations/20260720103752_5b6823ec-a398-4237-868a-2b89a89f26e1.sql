
-- ============================================================
-- Einzelartikel-Bestand + Wartungsverwaltung
-- ============================================================

-- Enum: Status eines Einzelartikels
DO $$ BEGIN
  CREATE TYPE public.instance_status AS ENUM (
    'available', 'rented', 'maintenance', 'repair', 'retired', 'lost'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enum: Intervall-Typ einer Wartung
DO $$ BEGIN
  CREATE TYPE public.maintenance_interval_type AS ENUM (
    'hours', 'days', 'months', 'years', 'one_time'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 1) Einzelartikel (Instances)
-- ============================================================
CREATE TABLE public.b2b_product_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  managed_product_id UUID NOT NULL REFERENCES public.b2b_managed_products(id) ON DELETE CASCADE,
  serial_number TEXT,
  internal_inventory_number TEXT,
  location TEXT NOT NULL CHECK (location IN ('krefeld','bonn','muelheim')),
  status public.instance_status NOT NULL DEFAULT 'available',
  purchase_date DATE,
  purchase_price NUMERIC(12,2),
  supplier TEXT,
  current_operating_hours NUMERIC(10,1) DEFAULT 0,
  notes TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (internal_inventory_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.b2b_product_instances TO authenticated;
GRANT ALL ON public.b2b_product_instances TO service_role;

ALTER TABLE public.b2b_product_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to instances"
  ON public.b2b_product_instances FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_instances_product ON public.b2b_product_instances(managed_product_id);
CREATE INDEX idx_instances_location ON public.b2b_product_instances(location);
CREATE INDEX idx_instances_status ON public.b2b_product_instances(status);

CREATE TRIGGER trg_instances_updated_at
  BEFORE UPDATE ON public.b2b_product_instances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 2) Betriebsstunden-Verlauf
-- ============================================================
CREATE TABLE public.b2b_instance_hours_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.b2b_product_instances(id) ON DELETE CASCADE,
  hours NUMERIC(10,1) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recorded_by UUID,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.b2b_instance_hours_log TO authenticated;
GRANT ALL ON public.b2b_instance_hours_log TO service_role;

ALTER TABLE public.b2b_instance_hours_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to hours log"
  ON public.b2b_instance_hours_log FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_hours_log_instance ON public.b2b_instance_hours_log(instance_id, recorded_at DESC);

-- ============================================================
-- 3) Wartungsintervalle
-- ============================================================
CREATE TABLE public.b2b_maintenance_intervals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.b2b_product_instances(id) ON DELETE CASCADE,
  title TEXT NOT NULL,                    -- z.B. "DGUV V3 Prüfung", "Ölwechsel", "Filterwechsel"
  interval_type public.maintenance_interval_type NOT NULL,
  interval_value INTEGER,                 -- z.B. 250 (h), 12 (Monate); NULL bei one_time
  last_done_at DATE,
  last_done_hours NUMERIC(10,1),
  next_due_at DATE,
  next_due_hours NUMERIC(10,1),
  warn_days_before INTEGER DEFAULT 14,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.b2b_maintenance_intervals TO authenticated;
GRANT ALL ON public.b2b_maintenance_intervals TO service_role;

ALTER TABLE public.b2b_maintenance_intervals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to maintenance intervals"
  ON public.b2b_maintenance_intervals FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_intervals_instance ON public.b2b_maintenance_intervals(instance_id);
CREATE INDEX idx_intervals_due_at ON public.b2b_maintenance_intervals(next_due_at) WHERE is_active;

CREATE TRIGGER trg_intervals_updated_at
  BEFORE UPDATE ON public.b2b_maintenance_intervals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4) Wartungshistorie (durchgeführte Wartungen)
-- ============================================================
CREATE TABLE public.b2b_maintenance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES public.b2b_product_instances(id) ON DELETE CASCADE,
  interval_id UUID REFERENCES public.b2b_maintenance_intervals(id) ON DELETE SET NULL,
  performed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  performed_by UUID,
  performed_by_name TEXT,
  hours_at_service NUMERIC(10,1),
  title TEXT NOT NULL,                    -- Kopie des Interval-Titels ODER Ad-hoc-Titel
  description TEXT,
  parts_replaced TEXT,
  cost NUMERIC(10,2),
  attachments JSONB DEFAULT '[]'::jsonb,  -- z.B. Prüfprotokoll-URLs
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.b2b_maintenance_log TO authenticated;
GRANT ALL ON public.b2b_maintenance_log TO service_role;

ALTER TABLE public.b2b_maintenance_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to maintenance log"
  ON public.b2b_maintenance_log FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_maint_log_instance ON public.b2b_maintenance_log(instance_id, performed_at DESC);

-- ============================================================
-- 5) Helper: Wartung als erledigt markieren → next_due neu berechnen
-- ============================================================
CREATE OR REPLACE FUNCTION public.complete_maintenance(
  _interval_id UUID,
  _performed_at DATE,
  _hours_at_service NUMERIC,
  _description TEXT,
  _parts_replaced TEXT,
  _cost NUMERIC,
  _performed_by_name TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_interval public.b2b_maintenance_intervals%ROWTYPE;
  v_log_id UUID;
  v_next_due_at DATE;
  v_next_due_hours NUMERIC;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO v_interval FROM public.b2b_maintenance_intervals WHERE id = _interval_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Interval not found';
  END IF;

  -- Log-Eintrag anlegen
  INSERT INTO public.b2b_maintenance_log(
    instance_id, interval_id, performed_at, performed_by, performed_by_name,
    hours_at_service, title, description, parts_replaced, cost
  ) VALUES (
    v_interval.instance_id, _interval_id, _performed_at, auth.uid(), _performed_by_name,
    _hours_at_service, v_interval.title, _description, _parts_replaced, _cost
  ) RETURNING id INTO v_log_id;

  -- Nächstes Fälligkeitsdatum/-stunden berechnen
  v_next_due_at := NULL;
  v_next_due_hours := NULL;

  IF v_interval.interval_type = 'days' AND v_interval.interval_value IS NOT NULL THEN
    v_next_due_at := _performed_at + (v_interval.interval_value || ' days')::interval;
  ELSIF v_interval.interval_type = 'months' AND v_interval.interval_value IS NOT NULL THEN
    v_next_due_at := _performed_at + (v_interval.interval_value || ' months')::interval;
  ELSIF v_interval.interval_type = 'years' AND v_interval.interval_value IS NOT NULL THEN
    v_next_due_at := _performed_at + (v_interval.interval_value || ' years')::interval;
  ELSIF v_interval.interval_type = 'hours' AND v_interval.interval_value IS NOT NULL AND _hours_at_service IS NOT NULL THEN
    v_next_due_hours := _hours_at_service + v_interval.interval_value;
  END IF;

  UPDATE public.b2b_maintenance_intervals
  SET last_done_at = _performed_at,
      last_done_hours = _hours_at_service,
      next_due_at = v_next_due_at,
      next_due_hours = v_next_due_hours,
      is_active = CASE WHEN v_interval.interval_type = 'one_time' THEN false ELSE is_active END,
      updated_at = now()
  WHERE id = _interval_id;

  -- Betriebsstunden am Artikel updaten, wenn höher
  IF _hours_at_service IS NOT NULL THEN
    UPDATE public.b2b_product_instances
    SET current_operating_hours = GREATEST(COALESCE(current_operating_hours, 0), _hours_at_service),
        updated_at = now()
    WHERE id = v_interval.instance_id
      AND (current_operating_hours IS NULL OR current_operating_hours < _hours_at_service);

    INSERT INTO public.b2b_instance_hours_log(instance_id, hours, recorded_by, note)
    VALUES (v_interval.instance_id, _hours_at_service, auth.uid(), 'Erfasst über Wartung: ' || v_interval.title);
  END IF;

  RETURN v_log_id;
END;
$$;

-- ============================================================
-- 6) View: Fällige/überfällige Wartungen (für Dashboard-Widget)
-- ============================================================
CREATE OR REPLACE VIEW public.maintenance_due_overview AS
SELECT
  mi.id AS interval_id,
  mi.title,
  mi.interval_type,
  mi.next_due_at,
  mi.next_due_hours,
  mi.warn_days_before,
  pi.id AS instance_id,
  pi.serial_number,
  pi.internal_inventory_number,
  pi.location,
  pi.current_operating_hours,
  mp.id AS managed_product_id,
  mp.name AS product_name,
  mp.slug AS product_slug,
  CASE
    WHEN mi.next_due_at IS NOT NULL AND mi.next_due_at < CURRENT_DATE THEN 'overdue'
    WHEN mi.next_due_at IS NOT NULL AND mi.next_due_at <= CURRENT_DATE + (COALESCE(mi.warn_days_before,14) || ' days')::interval THEN 'due_soon'
    WHEN mi.next_due_hours IS NOT NULL AND pi.current_operating_hours IS NOT NULL
         AND pi.current_operating_hours >= mi.next_due_hours THEN 'overdue'
    WHEN mi.next_due_hours IS NOT NULL AND pi.current_operating_hours IS NOT NULL
         AND (mi.next_due_hours - pi.current_operating_hours) <= 25 THEN 'due_soon'
    ELSE 'ok'
  END AS due_status
FROM public.b2b_maintenance_intervals mi
JOIN public.b2b_product_instances pi ON pi.id = mi.instance_id
JOIN public.b2b_managed_products mp ON mp.id = pi.managed_product_id
WHERE mi.is_active = true;

GRANT SELECT ON public.maintenance_due_overview TO authenticated;
GRANT SELECT ON public.maintenance_due_overview TO service_role;
