CREATE TABLE public.new_machines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  name TEXT NOT NULL,
  article_number TEXT,
  gtin TEXT,
  category TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  specifications JSONB DEFAULT '{}'::jsonb,
  content JSONB DEFAULT '{}'::jsonb,
  images TEXT[] DEFAULT '{}'::text[],
  showroom_locations TEXT[] DEFAULT '{}'::text[],
  price_gross NUMERIC,
  vat_rate NUMERIC NOT NULL DEFAULT 19,
  price_on_request BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.new_machines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active new machines"
  ON public.new_machines
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage new machines"
  ON public.new_machines
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_new_machines_updated_at
  BEFORE UPDATE ON public.new_machines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_new_machines_brand ON public.new_machines(brand);
CREATE INDEX idx_new_machines_active ON public.new_machines(is_active);