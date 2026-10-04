
CREATE TABLE public.offer_payment_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  inquiry_table text NOT NULL CHECK (inquiry_table IN ('rental_inquiries','sales_inquiries')),
  inquiry_id uuid NOT NULL,
  offer_number text NOT NULL,
  customer_email text,
  rent_cents integer NOT NULL CHECK (rent_cents >= 0),
  deposit_cents integer NOT NULL CHECK (deposit_cents >= 0),
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paid','superseded','void','amount_mismatch')),
  livemode boolean NOT NULL DEFAULT false,
  stripe_session_id text,
  payment_intent_id text,
  paid_cents integer,
  paid_at timestamptz,
  warning text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT offer_payment_links_sum CHECK (amount_cents = rent_cents + deposit_cents)
);
CREATE UNIQUE INDEX offer_payment_links_one_active ON public.offer_payment_links (inquiry_table, inquiry_id) WHERE status = 'active';
CREATE INDEX offer_payment_links_inquiry ON public.offer_payment_links (inquiry_table, inquiry_id);
CREATE INDEX offer_payment_links_session ON public.offer_payment_links (stripe_session_id);
CREATE INDEX offer_payment_links_pi ON public.offer_payment_links (payment_intent_id);

CREATE TABLE public.deposit_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.offer_payment_links(id) ON DELETE RESTRICT,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  stripe_refund_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  reason text,
  created_by uuid,
  created_by_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX deposit_refunds_link ON public.deposit_refunds (link_id);

CREATE TABLE public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  type text NOT NULL,
  result text,
  received_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.offer_payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read payment links" ON public.offer_payment_links
  FOR SELECT TO authenticated USING (public.is_staff_member(auth.uid()));
CREATE POLICY "Staff can read deposit refunds" ON public.deposit_refunds
  FOR SELECT TO authenticated USING (public.is_staff_member(auth.uid()));

REVOKE ALL ON public.offer_payment_links, public.deposit_refunds, public.stripe_webhook_events FROM anon, authenticated;
GRANT SELECT ON public.offer_payment_links, public.deposit_refunds TO authenticated;
GRANT ALL ON public.offer_payment_links, public.deposit_refunds, public.stripe_webhook_events TO service_role;
