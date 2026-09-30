ALTER TABLE public.b2b_managed_products
  ADD COLUMN IF NOT EXISTS tracks_operating_hours boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_fuel_tank boolean NOT NULL DEFAULT false;

UPDATE public.b2b_managed_products
SET tracks_operating_hours = true, has_fuel_tank = true
WHERE lower(name || ' ' || coalesce(category,'')) ~ '(bagger|dumper|aggregat|radlader|stromerzeuger|generator|rüttel|ruettel|walze|stampfer|verdicht|teleskop|hubsteiger|arbeitsbühne|arbeitsbuehne|stapler|kompressor|erdbewegung|baumaschinen)';

CREATE TABLE public.b2b_operating_hours_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  managed_product_id uuid REFERENCES public.b2b_managed_products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  instance_id uuid REFERENCES public.b2b_product_instances(id) ON DELETE SET NULL,
  location text,
  kind text NOT NULL CHECK (kind IN ('delivery','return','manual')),
  operating_hours numeric,
  fuel_level text,
  rental_inquiry_id uuid,
  delivery_note_id uuid,
  return_protocol_id uuid,
  protocol_number text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.b2b_operating_hours_readings TO authenticated;
GRANT ALL ON public.b2b_operating_hours_readings TO service_role;
ALTER TABLE public.b2b_operating_hours_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read operating hours" ON public.b2b_operating_hours_readings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_staff_member(auth.uid()));
CREATE INDEX idx_ohr_product ON public.b2b_operating_hours_readings(managed_product_id, recorded_at DESC);
CREATE INDEX idx_ohr_inquiry ON public.b2b_operating_hours_readings(rental_inquiry_id);