ALTER TABLE public.phone_calls
  ADD COLUMN IF NOT EXISTS rental_inquiry_id uuid REFERENCES public.rental_inquiries(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS phone_calls_rental_inquiry_idx ON public.phone_calls(rental_inquiry_id);