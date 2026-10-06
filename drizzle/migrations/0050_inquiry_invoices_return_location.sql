ALTER TABLE public.inquiry_invoices
  ADD COLUMN IF NOT EXISTS return_location text,
  ADD COLUMN IF NOT EXISTS return_location_cost numeric NOT NULL DEFAULT 0;
COMMENT ON COLUMN public.inquiry_invoices.return_location IS 'Abweichender Rückgabestandort (One-Way-Miete); NULL = Rückgabe am Abholstandort';
COMMENT ON COLUMN public.inquiry_invoices.return_location_cost IS 'Netto-Aufpreis für Rückgabe an anderem Standort';