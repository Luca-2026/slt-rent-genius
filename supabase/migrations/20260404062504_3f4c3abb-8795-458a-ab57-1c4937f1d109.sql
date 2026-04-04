
CREATE TABLE public.used_machines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  hours INTEGER,
  price_net NUMERIC,
  price_on_request BOOLEAN DEFAULT false,
  description TEXT,
  specifications JSONB,
  images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available',
  reference_number TEXT,
  location TEXT DEFAULT 'krefeld',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.used_machines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available used machines"
  ON public.used_machines FOR SELECT
  USING (status = 'available' OR status = 'reserved');

CREATE POLICY "Admins can manage used machines"
  ON public.used_machines FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
