
-- 1. Add VAT ID verification flag to b2b_profiles
ALTER TABLE public.b2b_profiles 
ADD COLUMN IF NOT EXISTS vat_id_verified boolean NOT NULL DEFAULT false;

-- 2. Enhance b2b_invoices with detailed financial fields
ALTER TABLE public.b2b_invoices 
ADD COLUMN IF NOT EXISTS reservation_id uuid REFERENCES public.b2b_reservations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS net_amount numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS vat_rate numeric NOT NULL DEFAULT 19,
ADD COLUMN IF NOT EXISTS vat_amount numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS gross_amount numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_cost numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_reverse_charge boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS vat_id_at_creation text,
ADD COLUMN IF NOT EXISTS email_sent boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS email_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS customer_company text,
ADD COLUMN IF NOT EXISTS customer_address text,
ADD COLUMN IF NOT EXISTS customer_postal_code text,
ADD COLUMN IF NOT EXISTS customer_city text,
ADD COLUMN IF NOT EXISTS customer_country text DEFAULT 'Deutschland',
ADD COLUMN IF NOT EXISTS payment_due_days integer NOT NULL DEFAULT 14;

-- 3. Create b2b_invoice_items table
CREATE TABLE IF NOT EXISTS public.b2b_invoice_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id uuid NOT NULL REFERENCES public.b2b_invoices(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  description text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  discount_percent numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  rental_start date,
  rental_end date,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on invoice items
ALTER TABLE public.b2b_invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for b2b_invoice_items
CREATE POLICY "Admins can manage invoice items"
ON public.b2b_invoice_items
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own invoice items"
ON public.b2b_invoice_items
FOR SELECT
USING (
  invoice_id IN (
    SELECT bi.id FROM public.b2b_invoices bi
    WHERE bi.b2b_profile_id IN (
      SELECT bp.id FROM public.b2b_profiles bp
      WHERE bp.user_id = auth.uid()
    )
  )
);

-- 4. Create invoice number sequence
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START WITH 1;

-- 5. Function to generate invoice numbers (SLT-YYYY-NNNN format)
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_val integer;
  current_year text;
BEGIN
  next_val := nextval('public.invoice_number_seq');
  current_year := to_char(now(), 'YYYY');
  RETURN 'SLT-' || current_year || '-' || lpad(next_val::text, 4, '0');
END;
$$;

-- 6. Index for faster invoice lookups
CREATE INDEX IF NOT EXISTS idx_b2b_invoice_items_invoice_id ON public.b2b_invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_b2b_invoices_reservation_id ON public.b2b_invoices(reservation_id);
CREATE INDEX IF NOT EXISTS idx_b2b_invoices_b2b_profile_id ON public.b2b_invoices(b2b_profile_id);
