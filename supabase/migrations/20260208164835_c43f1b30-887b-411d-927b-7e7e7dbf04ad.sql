
-- Sequence for delivery note numbers (LS-YYYY-NNNN)
CREATE SEQUENCE IF NOT EXISTS public.delivery_note_number_seq START WITH 1;

-- Function to generate delivery note numbers
CREATE OR REPLACE FUNCTION public.generate_delivery_note_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
DECLARE
  next_val integer;
  current_year text;
BEGIN
  next_val := nextval('public.delivery_note_number_seq');
  current_year := to_char(now(), 'YYYY');
  RETURN 'LS-' || current_year || '-' || lpad(next_val::text, 4, '0');
END;
$$;

-- Create delivery notes table
CREATE TABLE public.b2b_delivery_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id uuid REFERENCES public.b2b_offers(id),
  reservation_id uuid REFERENCES public.b2b_reservations(id),
  b2b_profile_id uuid NOT NULL REFERENCES public.b2b_profiles(id),
  delivery_note_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  signature_data text, -- base64 encoded PNG signature
  file_url text,
  file_name text,
  notes text,
  signed_at timestamp with time zone,
  email_sent boolean NOT NULL DEFAULT false,
  email_sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.b2b_delivery_notes ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can manage delivery notes"
  ON public.b2b_delivery_notes
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- B2B users can view their own delivery notes
CREATE POLICY "B2B users can view their own delivery notes"
  ON public.b2b_delivery_notes
  FOR SELECT
  USING (b2b_profile_id IN (
    SELECT b2b_profiles.id FROM b2b_profiles WHERE b2b_profiles.user_id = auth.uid()
  ));

-- Create delivery note items table
CREATE TABLE public.b2b_delivery_note_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_note_id uuid NOT NULL REFERENCES public.b2b_delivery_notes(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  description text,
  quantity integer NOT NULL DEFAULT 1,
  serial_number text,
  condition_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.b2b_delivery_note_items ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can manage delivery note items"
  ON public.b2b_delivery_note_items
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- B2B users can view their own delivery note items
CREATE POLICY "B2B users can view their own delivery note items"
  ON public.b2b_delivery_note_items
  FOR SELECT
  USING (delivery_note_id IN (
    SELECT id FROM b2b_delivery_notes 
    WHERE b2b_profile_id IN (
      SELECT b2b_profiles.id FROM b2b_profiles WHERE b2b_profiles.user_id = auth.uid()
    )
  ));

-- Trigger for updated_at
CREATE TRIGGER update_delivery_notes_updated_at
  BEFORE UPDATE ON public.b2b_delivery_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
