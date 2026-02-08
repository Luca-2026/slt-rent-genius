
-- Create return protocols table
CREATE TABLE public.b2b_return_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES public.b2b_reservations(id),
  b2b_profile_id uuid NOT NULL REFERENCES public.b2b_profiles(id),
  delivery_note_id uuid REFERENCES public.b2b_delivery_notes(id),
  return_protocol_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'signed',
  -- Condition documentation
  overall_condition text NOT NULL DEFAULT 'good', -- good, minor_damage, major_damage
  condition_notes text,
  damage_description text,
  cleaning_required boolean NOT NULL DEFAULT false,
  all_items_returned boolean NOT NULL DEFAULT true,
  missing_items_notes text,
  -- Meter/hour readings
  meter_reading_start text,
  meter_reading_end text,
  -- Signatures
  customer_signature_data text,
  staff_signature_data text,
  staff_name text,
  signed_at timestamptz,
  -- Document
  file_url text,
  file_name text,
  notes text,
  -- Email
  email_sent boolean NOT NULL DEFAULT false,
  email_sent_at timestamptz,
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create return protocol items table
CREATE TABLE public.b2b_return_protocol_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_protocol_id uuid NOT NULL REFERENCES public.b2b_return_protocols(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  description text,
  quantity integer NOT NULL DEFAULT 1,
  condition text NOT NULL DEFAULT 'good', -- good, minor_damage, major_damage, missing
  condition_notes text,
  serial_number text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Sequence for return protocol numbers
CREATE SEQUENCE IF NOT EXISTS public.return_protocol_number_seq START WITH 1 INCREMENT BY 1;

-- Function to generate return protocol number
CREATE OR REPLACE FUNCTION public.generate_return_protocol_number()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  next_val integer;
  current_year text;
BEGIN
  next_val := nextval('public.return_protocol_number_seq');
  current_year := to_char(now(), 'YYYY');
  RETURN 'RP-' || current_year || '-' || lpad(next_val::text, 4, '0');
END;
$$;

-- Enable RLS
ALTER TABLE public.b2b_return_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_return_protocol_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for return protocols
CREATE POLICY "Admins can manage return protocols"
ON public.b2b_return_protocols
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can manage return protocols"
ON public.b2b_return_protocols
FOR ALL
USING (public.has_role(auth.uid(), 'standort_mitarbeiter'));

CREATE POLICY "B2B users can view own return protocols"
ON public.b2b_return_protocols
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.b2b_profiles
    WHERE id = b2b_profile_id AND user_id = auth.uid()
  )
);

-- RLS for return protocol items
CREATE POLICY "Admins can manage return protocol items"
ON public.b2b_return_protocol_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.b2b_return_protocols rp
    WHERE rp.id = return_protocol_id
    AND public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Staff can manage return protocol items"
ON public.b2b_return_protocol_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.b2b_return_protocols rp
    WHERE rp.id = return_protocol_id
    AND public.has_role(auth.uid(), 'standort_mitarbeiter')
  )
);

CREATE POLICY "B2B users can view own return protocol items"
ON public.b2b_return_protocol_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.b2b_return_protocols rp
    JOIN public.b2b_profiles bp ON bp.id = rp.b2b_profile_id
    WHERE rp.id = return_protocol_id AND bp.user_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_return_protocols_updated_at
BEFORE UPDATE ON public.b2b_return_protocols
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
