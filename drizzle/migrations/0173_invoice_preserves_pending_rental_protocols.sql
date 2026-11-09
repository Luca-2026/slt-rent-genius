CREATE OR REPLACE FUNCTION public.close_rental_inquiry_on_invoice()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.rental_inquiry_id IS NOT NULL
    AND COALESCE(NEW.invoice_kind,'invoice') IN ('invoice','final')
    AND NEW.status IN ('open','paid','overdue') THEN
  UPDATE public.rental_inquiries r
  SET status=CASE
       WHEN r.status IN ('done','rejected') THEN r.status
       WHEN r.closed_manually_at IS NOT NULL OR EXISTS (
         SELECT 1 FROM public.b2b_return_protocols p
         WHERE p.rental_inquiry_id=r.id AND p.status IN ('signed','signed_staff_only')
       ) THEN 'done'
       ELSE r.status END,
      installment_enabled=CASE WHEN NEW.invoice_kind='final' THEN false ELSE r.installment_enabled END,
      updated_at=now()
  WHERE r.id=NEW.rental_inquiry_id;
 END IF;
 IF NEW.sales_inquiry_id IS NOT NULL AND NEW.invoice_kind='final' AND NEW.status IN ('open','paid','overdue') THEN
  UPDATE public.sales_inquiries SET installment_enabled=false,updated_at=now()
  WHERE id=NEW.sales_inquiry_id AND installment_enabled;
 END IF;
 RETURN NEW;
END $$;