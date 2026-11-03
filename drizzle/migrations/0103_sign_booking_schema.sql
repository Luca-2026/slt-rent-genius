ALTER TABLE public.b2b_managed_products ADD COLUMN IF NOT EXISTS direct_booking_config jsonb;
CREATE TABLE public.sign_bookings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), request_id uuid NOT NULL UNIQUE, token text NOT NULL UNIQUE,
 inquiry_id uuid NOT NULL UNIQUE REFERENCES public.rental_inquiries(id), location text NOT NULL,
 package text NOT NULL, quantity integer NOT NULL, start_date date NOT NULL, end_date date NOT NULL,
 gross_cents integer NOT NULL, deposit_cents integer NOT NULL, total_cents integer NOT NULL,
 status text NOT NULL DEFAULT 'reserved', expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
 confirmed_at timestamptz, confirmation_sent_at timestamptz, confirmation_file_path text, permit_path text, snapshot jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT sign_booking_values CHECK (location IN ('krefeld','bonn') AND package IN ('standard','sorglos') AND quantity BETWEEN 1 AND 10 AND end_date >= start_date AND gross_cents > 0 AND deposit_cents >= 0 AND total_cents = gross_cents + deposit_cents AND status IN ('reserved','paid','expired','review'))
);
GRANT SELECT ON public.sign_bookings TO authenticated;
GRANT ALL ON public.sign_bookings TO service_role;
ALTER TABLE public.sign_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY sign_booking_staff_read ON public.sign_bookings FOR SELECT TO authenticated USING(public.is_staff_member(auth.uid()));
CREATE INDEX sign_bookings_capacity ON public.sign_bookings(location,start_date,end_date) WHERE status IN ('reserved','paid');
CREATE TABLE public.sign_permit_uploads (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), token text NOT NULL UNIQUE, file_path text NOT NULL UNIQUE, filename text NOT NULL,
 content_type text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), booking_id uuid REFERENCES public.sign_bookings(id)
);
GRANT SELECT ON public.sign_permit_uploads TO authenticated;
GRANT ALL ON public.sign_permit_uploads TO service_role;
ALTER TABLE public.sign_permit_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY sign_permit_staff_read ON public.sign_permit_uploads FOR SELECT TO authenticated USING(public.is_staff_member(auth.uid()));
CREATE POLICY sign_permit_staff_download ON storage.objects FOR SELECT TO authenticated USING(bucket_id='sign-permits' AND public.is_staff_member(auth.uid()));
COMMENT ON COLUMN public.b2b_managed_products.direct_booking_config IS 'Server-owned opt-in package prices in integer gross cents; only supported articles may use public direct checkout.';