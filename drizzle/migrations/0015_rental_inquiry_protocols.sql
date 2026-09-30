-- Protokolle zu Mietanfragen (auch Privatkunden ohne Portalkonto)
ALTER TABLE public.b2b_delivery_notes ALTER COLUMN b2b_profile_id DROP NOT NULL;
ALTER TABLE public.b2b_return_protocols ALTER COLUMN b2b_profile_id DROP NOT NULL;

ALTER TABLE public.b2b_delivery_notes ADD COLUMN IF NOT EXISTS protocol_data jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.b2b_return_protocols ADD COLUMN IF NOT EXISTS protocol_data jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_delivery_notes_rental_inquiry ON public.b2b_delivery_notes(rental_inquiry_id);
CREATE INDEX IF NOT EXISTS idx_return_protocols_rental_inquiry ON public.b2b_return_protocols(rental_inquiry_id);

-- Mitarbeiter dürfen Übergabeprotokolle sehen (Anlage läuft serverseitig)
DROP POLICY IF EXISTS "Staff can view delivery notes" ON public.b2b_delivery_notes;
CREATE POLICY "Staff can view delivery notes" ON public.b2b_delivery_notes
  FOR SELECT TO authenticated USING (public.is_staff_member(auth.uid()));
DROP POLICY IF EXISTS "Staff can view return protocols" ON public.b2b_return_protocols;
CREATE POLICY "Staff can view return protocols" ON public.b2b_return_protocols
  FOR SELECT TO authenticated USING (public.is_staff_member(auth.uid()));