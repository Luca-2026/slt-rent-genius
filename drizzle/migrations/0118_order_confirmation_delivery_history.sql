CREATE TABLE public.rental_order_confirmation_deliveries(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),rental_inquiry_id uuid NOT NULL REFERENCES public.rental_inquiries(id),version integer NOT NULL,confirmation_number text NOT NULL,file_url text NOT NULL,snapshot jsonb NOT NULL,sent_at timestamptz NOT NULL DEFAULT now(),sent_by uuid NOT NULL);
GRANT SELECT ON public.rental_order_confirmation_deliveries TO authenticated;
GRANT ALL ON public.rental_order_confirmation_deliveries TO service_role;
ALTER TABLE public.rental_order_confirmation_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_read_confirmation_deliveries ON public.rental_order_confirmation_deliveries FOR SELECT TO authenticated USING(public.is_staff_member(auth.uid()));
CREATE TRIGGER immutable_confirmation_deliveries BEFORE UPDATE OR DELETE ON public.rental_order_confirmation_deliveries FOR EACH ROW EXECUTE FUNCTION public.guard_order_revision_history();