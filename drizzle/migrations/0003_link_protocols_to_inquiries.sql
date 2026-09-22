ALTER TABLE public.b2b_delivery_notes
  ADD COLUMN rental_inquiry_id uuid REFERENCES public.rental_inquiries(id) ON DELETE SET NULL;

ALTER TABLE public.b2b_return_protocols
  ADD COLUMN rental_inquiry_id uuid REFERENCES public.rental_inquiries(id) ON DELETE SET NULL;

CREATE INDEX idx_delivery_notes_inquiry ON public.b2b_delivery_notes(rental_inquiry_id);
CREATE INDEX idx_return_protocols_inquiry ON public.b2b_return_protocols(rental_inquiry_id);