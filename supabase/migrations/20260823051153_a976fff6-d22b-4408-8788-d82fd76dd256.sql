ALTER TABLE public.rental_inquiries
  ADD COLUMN IF NOT EXISTS customer_kind text NOT NULL DEFAULT 'private';

ALTER TABLE public.sales_inquiries
  ADD COLUMN IF NOT EXISTS customer_kind text NOT NULL DEFAULT 'private';

UPDATE public.sales_inquiries
SET customer_kind = CASE
  WHEN customer_type ILIKE '%gewerb%' OR customer_type ILIKE '%business%' OR customer_type ILIKE '%firm%'
       OR customer_type ILIKE '%unternehm%' OR customer_type ILIKE '%geschäft%' OR customer_type ILIKE '%b2b%'
       OR (company_name IS NOT NULL AND btrim(company_name) <> '')
    THEN 'business'
  ELSE 'private'
END;

ALTER TABLE public.rental_inquiries
  ADD CONSTRAINT rental_inquiries_customer_kind_check CHECK (customer_kind IN ('private','business'));

ALTER TABLE public.sales_inquiries
  ADD CONSTRAINT sales_inquiries_customer_kind_check CHECK (customer_kind IN ('private','business'));