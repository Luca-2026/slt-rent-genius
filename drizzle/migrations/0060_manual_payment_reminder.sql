ALTER TABLE public.rental_inquiries ADD COLUMN IF NOT EXISTS payment_reminder_manual_at timestamptz;
ALTER TABLE public.sales_inquiries ADD COLUMN IF NOT EXISTS payment_reminder_manual_at timestamptz;