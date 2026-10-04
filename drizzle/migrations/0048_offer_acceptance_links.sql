CREATE TABLE public.offer_acceptance_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  inquiry_table text NOT NULL CHECK (inquiry_table IN ('rental_inquiries','sales_inquiries')),
  inquiry_id uuid NOT NULL,
  offer_number text NOT NULL,
  gross_amount numeric NOT NULL DEFAULT 0,
  valid_until date,
  customer_email text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','accepted','void')),
  accepted_at timestamptz,
  signer_name text,
  signature_data text,
  agb_accepted boolean NOT NULL DEFAULT false,
  accepted_ip text,
  accepted_user_agent text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX offer_acceptance_links_inquiry_idx ON public.offer_acceptance_links (inquiry_id);
GRANT SELECT ON public.offer_acceptance_links TO authenticated;
GRANT ALL ON public.offer_acceptance_links TO service_role;
ALTER TABLE public.offer_acceptance_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view offer acceptances" ON public.offer_acceptance_links
  FOR SELECT TO authenticated USING (public.is_staff_member(auth.uid()));