CREATE TABLE public.sales_delivery_notes (
 id uuid PRIMARY KEY, sales_inquiry_id uuid NOT NULL REFERENCES public.sales_inquiries(id),
 delivery_note_number text NOT NULL UNIQUE DEFAULT public.generate_delivery_note_number(),
 snapshot jsonb NOT NULL, file_path text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL,
 receipt_method text CHECK(receipt_method IN ('digital','paper')), signer_name text, received_at timestamptz, receipt_recorded_at timestamptz, receipt_recorded_by uuid, signature_data text, signed_file_path text
);
GRANT SELECT ON public.sales_delivery_notes TO authenticated;
GRANT ALL ON public.sales_delivery_notes TO service_role;
ALTER TABLE public.sales_delivery_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY sales_delivery_staff_read ON public.sales_delivery_notes FOR SELECT TO authenticated USING(public.can_edit_operations(auth.uid()));
CREATE OR REPLACE FUNCTION public.guard_sales_delivery_receipt() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF TG_OP='UPDATE' THEN
  IF (NEW.id,NEW.sales_inquiry_id,NEW.delivery_note_number,NEW.snapshot,NEW.file_path,NEW.created_at,NEW.created_by) IS DISTINCT FROM (OLD.id,OLD.sales_inquiry_id,OLD.delivery_note_number,OLD.snapshot,OLD.file_path,OLD.created_at,OLD.created_by) THEN RAISE EXCEPTION 'Lieferschein unveränderlich'; END IF;
  IF OLD.receipt_method IS NOT NULL AND NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'Empfangsnachweis bereits abgeschlossen'; END IF;
 END IF;
 IF NEW.receipt_method IS NOT NULL AND (NEW.signer_name IS NULL OR length(trim(NEW.signer_name))<2 OR NEW.received_at IS NULL OR NEW.receipt_recorded_at IS NULL OR NEW.receipt_recorded_by IS NULL OR NEW.signed_file_path IS NULL OR (NEW.receipt_method='digital' AND NEW.signature_data IS NULL)) THEN RAISE EXCEPTION 'Empfangsnachweis unvollständig'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER guard_sales_delivery_receipt BEFORE INSERT OR UPDATE ON public.sales_delivery_notes FOR EACH ROW EXECUTE FUNCTION public.guard_sales_delivery_receipt();