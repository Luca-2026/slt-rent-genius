CREATE OR REPLACE FUNCTION public.close_rental_inquiry_on_invoice()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.rental_inquiry_id IS NOT NULL
     AND COALESCE(NEW.invoice_kind, 'invoice') = 'invoice'
     AND NEW.status IN ('open', 'paid', 'overdue') THEN
    UPDATE public.rental_inquiries
       SET status = 'done', updated_at = now()
     WHERE id = NEW.rental_inquiry_id
       AND status NOT IN ('done', 'rejected');
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.close_rental_inquiry_on_invoice() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_close_rental_inquiry_on_invoice ON public.inquiry_invoices;
CREATE TRIGGER trg_close_rental_inquiry_on_invoice
AFTER INSERT OR UPDATE OF status ON public.inquiry_invoices
FOR EACH ROW EXECUTE FUNCTION public.close_rental_inquiry_on_invoice();