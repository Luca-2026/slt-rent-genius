CREATE TABLE public.rental_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'product_booking',
  location text,
  location_email text,
  product_name text,
  product_id text,
  category_slug text,
  quantity integer,
  start_date text,
  start_time text,
  end_date text,
  end_time text,
  delivery_requested boolean NOT NULL DEFAULT false,
  delivery_street text,
  delivery_postal_code text,
  delivery_city text,
  setup_service_requested boolean NOT NULL DEFAULT false,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_street text,
  customer_postal_code text,
  customer_city text,
  message text,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw_payload jsonb,
  status text NOT NULL DEFAULT 'new',
  assigned_to uuid,
  assigned_name text,
  assigned_at timestamptz,
  internal_notes text,
  offer_number text,
  offer_file_url text,
  offer_total_gross numeric,
  offer_sent_at timestamptz,
  email_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.rental_inquiries TO authenticated;
GRANT ALL ON public.rental_inquiries TO service_role;

ALTER TABLE public.rental_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff and admins can view rental inquiries"
  ON public.rental_inquiries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_staff_member(auth.uid()));

CREATE POLICY "Staff and admins can update rental inquiries"
  ON public.rental_inquiries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_staff_member(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_staff_member(auth.uid()));

CREATE POLICY "Admins can insert rental inquiries"
  ON public.rental_inquiries FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_staff_member(auth.uid()));

CREATE TRIGGER update_rental_inquiries_updated_at
  BEFORE UPDATE ON public.rental_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_rental_inquiries_status_created ON public.rental_inquiries (status, created_at DESC);


CREATE TABLE public.sales_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'new_machine',
  source text,
  location text,
  location_email text,
  brand text,
  product_category text,
  model text,
  article_number text,
  quantity text,
  requirements text,
  addons jsonb NOT NULL DEFAULT '[]'::jsonb,
  year integer,
  listed_price text,
  searched_machine text,
  interest text,
  wish_date text,
  delivery_option text,
  delivery_street text,
  delivery_postal_code text,
  delivery_city text,
  delivery_note text,
  customer_type text,
  company_name text,
  vat_id text,
  salutation text,
  first_name text,
  last_name text,
  customer_email text,
  customer_phone text,
  billing_identical boolean,
  billing_company text,
  billing_street text,
  billing_postal_code text,
  billing_city text,
  billing_country text,
  financing_desired boolean,
  financing_term text,
  financing_down_payment text,
  message text,
  found_via text,
  raw_payload jsonb,
  status text NOT NULL DEFAULT 'new',
  assigned_to uuid,
  assigned_name text,
  assigned_at timestamptz,
  internal_notes text,
  offer_number text,
  offer_file_url text,
  offer_total_gross numeric,
  offer_sent_at timestamptz,
  email_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.sales_inquiries TO authenticated;
GRANT ALL ON public.sales_inquiries TO service_role;

ALTER TABLE public.sales_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff and admins can view sales inquiries"
  ON public.sales_inquiries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_staff_member(auth.uid()));

CREATE POLICY "Staff and admins can update sales inquiries"
  ON public.sales_inquiries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_staff_member(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_staff_member(auth.uid()));

CREATE POLICY "Admins can insert sales inquiries"
  ON public.sales_inquiries FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_staff_member(auth.uid()));

CREATE TRIGGER update_sales_inquiries_updated_at
  BEFORE UPDATE ON public.sales_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_sales_inquiries_status_created ON public.sales_inquiries (status, created_at DESC);