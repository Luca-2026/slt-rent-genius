
-- Offer number sequence
CREATE SEQUENCE IF NOT EXISTS public.offer_number_seq START 1;

-- Function to generate offer numbers
CREATE OR REPLACE FUNCTION public.generate_offer_number()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  next_val integer;
  current_year text;
BEGIN
  next_val := nextval('public.offer_number_seq');
  current_year := to_char(now(), 'YYYY');
  RETURN 'ANG-' || current_year || '-' || lpad(next_val::text, 4, '0');
END;
$$;

-- Offers table
CREATE TABLE public.b2b_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID REFERENCES public.b2b_reservations(id),
  b2b_profile_id UUID NOT NULL REFERENCES public.b2b_profiles(id),
  offer_number TEXT NOT NULL,
  offer_date TEXT NOT NULL,
  valid_until TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  net_amount NUMERIC NOT NULL DEFAULT 0,
  vat_rate NUMERIC NOT NULL DEFAULT 19,
  vat_amount NUMERIC NOT NULL DEFAULT 0,
  gross_amount NUMERIC NOT NULL DEFAULT 0,
  delivery_cost NUMERIC NOT NULL DEFAULT 0,
  is_reverse_charge BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  file_url TEXT,
  file_name TEXT,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Offer items table
CREATE TABLE public.b2b_offer_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID NOT NULL REFERENCES public.b2b_offers(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  description TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  discount_percent NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  rental_start TEXT,
  rental_end TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customer-specific permanent prices
CREATE TABLE public.b2b_customer_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  b2b_profile_id UUID NOT NULL REFERENCES public.b2b_profiles(id),
  product_name TEXT NOT NULL,
  product_id TEXT,
  unit_price NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(b2b_profile_id, product_name)
);

-- Enable RLS
ALTER TABLE public.b2b_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_offer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_customer_prices ENABLE ROW LEVEL SECURITY;

-- RLS policies for b2b_offers
CREATE POLICY "Admins can manage all offers"
ON public.b2b_offers FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "B2B users can view their own offers"
ON public.b2b_offers FOR SELECT
USING (
  b2b_profile_id IN (
    SELECT id FROM public.b2b_profiles WHERE user_id = auth.uid()
  )
);

-- RLS policies for b2b_offer_items
CREATE POLICY "Admins can manage all offer items"
ON public.b2b_offer_items FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "B2B users can view their own offer items"
ON public.b2b_offer_items FOR SELECT
USING (
  offer_id IN (
    SELECT id FROM public.b2b_offers WHERE b2b_profile_id IN (
      SELECT id FROM public.b2b_profiles WHERE user_id = auth.uid()
    )
  )
);

-- RLS policies for b2b_customer_prices
CREATE POLICY "Admins can manage all customer prices"
ON public.b2b_customer_prices FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "B2B users can view their own prices"
ON public.b2b_customer_prices FOR SELECT
USING (
  b2b_profile_id IN (
    SELECT id FROM public.b2b_profiles WHERE user_id = auth.uid()
  )
);

-- Update triggers
CREATE TRIGGER update_b2b_offers_updated_at
BEFORE UPDATE ON public.b2b_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_b2b_customer_prices_updated_at
BEFORE UPDATE ON public.b2b_customer_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
