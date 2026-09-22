-- Strukturierte Schäden zu Übergabe-/Rücknahmeprotokollen
CREATE TABLE public.b2b_protocol_damages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_type text NOT NULL CHECK (protocol_type IN ('delivery_note','return_protocol')),
  delivery_note_id uuid REFERENCES public.b2b_delivery_notes(id) ON DELETE CASCADE,
  return_protocol_id uuid REFERENCES public.b2b_return_protocols(id) ON DELETE CASCADE,
  b2b_profile_id uuid REFERENCES public.b2b_profiles(id) ON DELETE SET NULL,
  item_name text,
  category text NOT NULL DEFAULT 'sonstiges',
  description text,
  photo_urls text[] NOT NULL DEFAULT '{}',
  amount numeric(10,2),
  billed boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.b2b_protocol_damages TO authenticated;
GRANT ALL ON public.b2b_protocol_damages TO service_role;

ALTER TABLE public.b2b_protocol_damages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage protocol damages"
ON public.b2b_protocol_damages
FOR ALL
TO authenticated
USING (public.is_staff_member(auth.uid()) OR public.has_role(auth.uid(),'admin'))
WITH CHECK (public.is_staff_member(auth.uid()) OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Customers read own protocol damages"
ON public.b2b_protocol_damages
FOR SELECT
TO authenticated
USING (b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid()));

CREATE INDEX idx_protocol_damages_dn ON public.b2b_protocol_damages(delivery_note_id);
CREATE INDEX idx_protocol_damages_rp ON public.b2b_protocol_damages(return_protocol_id);

-- Zusatzkosten bei Rücknahme
CREATE TABLE public.b2b_return_extra_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_protocol_id uuid NOT NULL REFERENCES public.b2b_return_protocols(id) ON DELETE CASCADE,
  b2b_profile_id uuid REFERENCES public.b2b_profiles(id) ON DELETE SET NULL,
  label text NOT NULL,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  notes text,
  billed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.b2b_return_extra_charges TO authenticated;
GRANT ALL ON public.b2b_return_extra_charges TO service_role;

ALTER TABLE public.b2b_return_extra_charges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage extra charges"
ON public.b2b_return_extra_charges
FOR ALL
TO authenticated
USING (public.is_staff_member(auth.uid()) OR public.has_role(auth.uid(),'admin'))
WITH CHECK (public.is_staff_member(auth.uid()) OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Customers read own extra charges"
ON public.b2b_return_extra_charges
FOR SELECT
TO authenticated
USING (b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid()));

CREATE INDEX idx_return_extra_charges_rp ON public.b2b_return_extra_charges(return_protocol_id);

-- Ausweisabgleich und Summen
ALTER TABLE public.b2b_delivery_notes
  ADD COLUMN id_checked boolean NOT NULL DEFAULT false,
  ADD COLUMN id_check_type text,
  ADD COLUMN id_checked_at timestamptz;

ALTER TABLE public.b2b_return_protocols
  ADD COLUMN id_checked boolean NOT NULL DEFAULT false,
  ADD COLUMN id_check_type text,
  ADD COLUMN id_checked_at timestamptz,
  ADD COLUMN extra_charges_total numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN damages_total numeric(10,2) NOT NULL DEFAULT 0;