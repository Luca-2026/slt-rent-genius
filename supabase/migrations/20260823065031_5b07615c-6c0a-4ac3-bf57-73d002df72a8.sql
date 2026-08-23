CREATE TABLE public.crm_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_kind text NOT NULL DEFAULT 'b2c',
  company_name text,
  salutation text,
  first_name text,
  last_name text,
  email text,
  phone text,
  street text,
  postal_code text,
  city text,
  country text DEFAULT 'Deutschland',
  vat_id text,
  location text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_customers TO authenticated;
GRANT ALL ON public.crm_customers TO service_role;

ALTER TABLE public.crm_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view customers"
  ON public.crm_customers FOR SELECT TO authenticated
  USING (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can create customers"
  ON public.crm_customers FOR INSERT TO authenticated
  WITH CHECK (public.is_staff_member(auth.uid()));

CREATE POLICY "Staff can update customers"
  ON public.crm_customers FOR UPDATE TO authenticated
  USING (public.is_staff_member(auth.uid()))
  WITH CHECK (public.is_staff_member(auth.uid()));

CREATE POLICY "Admins can delete customers"
  ON public.crm_customers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_crm_customers_updated_at
  BEFORE UPDATE ON public.crm_customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_crm_customers_email ON public.crm_customers (lower(email));
CREATE INDEX idx_crm_customers_company ON public.crm_customers (lower(company_name));

ALTER TABLE public.rental_inquiries
  ADD COLUMN IF NOT EXISTS crm_customer_id uuid REFERENCES public.crm_customers(id) ON DELETE SET NULL;