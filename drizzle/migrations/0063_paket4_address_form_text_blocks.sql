ALTER TABLE public.rental_inquiries ADD COLUMN IF NOT EXISTS customer_mobile text;
ALTER TABLE public.rental_inquiries ADD COLUMN IF NOT EXISTS address_form text NOT NULL DEFAULT 'du';
ALTER TABLE public.rental_inquiries ADD CONSTRAINT rental_inquiries_address_form_check CHECK (address_form IN ('du','sie'));
ALTER TABLE public.crm_customers ADD COLUMN IF NOT EXISTS address_form text NOT NULL DEFAULT 'du';
ALTER TABLE public.crm_customers ADD CONSTRAINT crm_customers_address_form_check CHECK (address_form IN ('du','sie'));

-- Neue Anfrage eines bekannten Kunden übernimmt die Anrede-Form der Kundenakte
CREATE OR REPLACE FUNCTION public.inherit_inquiry_address_form()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v text;
BEGIN
  IF NEW.crm_customer_id IS NOT NULL THEN
    SELECT address_form INTO v FROM public.crm_customers WHERE id = NEW.crm_customer_id;
    IF v IS NOT NULL THEN NEW.address_form := v; END IF;
  END IF;
  RETURN NEW;
END $$;
-- Name nach trg_link_rental_inquiry_to_crm sortiert, damit die Akte bereits verknüpft ist
CREATE TRIGGER trg_zz_inherit_address_form BEFORE INSERT ON public.rental_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.inherit_inquiry_address_form();

CREATE TABLE public.text_blocks (
  key text PRIMARY KEY,
  text_business text,
  text_private text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.text_blocks TO authenticated;
GRANT ALL ON public.text_blocks TO service_role;
ALTER TABLE public.text_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read text blocks" ON public.text_blocks FOR SELECT TO authenticated USING (public.is_staff_member(auth.uid()));
CREATE POLICY "Operations can insert text blocks" ON public.text_blocks FOR INSERT TO authenticated WITH CHECK (public.can_edit_operations(auth.uid()));
CREATE POLICY "Operations can update text blocks" ON public.text_blocks FOR UPDATE TO authenticated USING (public.can_edit_operations(auth.uid())) WITH CHECK (public.can_edit_operations(auth.uid()));
CREATE TRIGGER update_text_blocks_updated_at BEFORE UPDATE ON public.text_blocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();