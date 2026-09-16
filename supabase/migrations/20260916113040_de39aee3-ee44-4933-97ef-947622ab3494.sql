ALTER TABLE public.rental_inquiries
  ADD COLUMN IF NOT EXISTS payments jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS paid_amount numeric NOT NULL DEFAULT 0;

ALTER TABLE public.sales_inquiries
  ADD COLUMN IF NOT EXISTS payments jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS paid_amount numeric NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.rental_inquiries.payments IS 'Erfasste (Teil-)Zahlungen zur Anfrage: [{date, amount, label, reference}]';
COMMENT ON COLUMN public.rental_inquiries.paid_amount IS 'Summe aller erfassten Zahlungen (brutto)';
COMMENT ON COLUMN public.sales_inquiries.payments IS 'Erfasste (Teil-)Zahlungen zur Anfrage: [{date, amount, label, reference}]';
COMMENT ON COLUMN public.sales_inquiries.paid_amount IS 'Summe aller erfassten Zahlungen (brutto)';