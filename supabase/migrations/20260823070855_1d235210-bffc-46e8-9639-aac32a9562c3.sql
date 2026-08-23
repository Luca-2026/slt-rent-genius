ALTER TABLE public.sales_inquiries
  ADD COLUMN IF NOT EXISTS crm_customer_id uuid REFERENCES public.crm_customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS product_slug text,
  ADD COLUMN IF NOT EXISTS product_kind text;

CREATE INDEX IF NOT EXISTS sales_inquiries_crm_customer_id_idx ON public.sales_inquiries (crm_customer_id);