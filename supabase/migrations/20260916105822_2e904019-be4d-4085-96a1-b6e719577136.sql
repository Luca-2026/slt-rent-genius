ALTER TABLE public.inquiry_invoices
  ADD COLUMN IF NOT EXISTS paid_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payments jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.inquiry_invoices.paid_amount IS 'Summe aller erfassten (Teil-)Zahlungen brutto';
COMMENT ON COLUMN public.inquiry_invoices.payments IS 'Liste erfasster Zahlungen: [{date, amount, method, reference, note}]';