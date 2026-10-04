CREATE OR REPLACE FUNCTION public.guard_credit_note_refund_amount()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c record; p record; alloc_sum bigint; siblings bigint;
BEGIN
  SELECT * INTO c FROM inquiry_invoices WHERE id = NEW.credit_note_id FOR SHARE;
  IF c IS NULL OR c.invoice_kind <> 'credit_note' OR c.parent_invoice_id IS NULL THEN
    RAISE EXCEPTION 'Keine gültige Gutschrift';
  END IF;
  IF NEW.amount_cents > round(abs(c.gross_amount) * 100)
     OR (c.credit_refund_amount IS NOT NULL AND NEW.amount_cents > round(c.credit_refund_amount * 100)) THEN
    RAISE EXCEPTION 'Erstattung übersteigt den Gutschriftbetrag';
  END IF;
  SELECT coalesce(sum((a->>'amount_cents')::bigint), 0) INTO alloc_sum FROM jsonb_array_elements(coalesce(NEW.allocations, '[]'::jsonb)) a;
  IF alloc_sum <> NEW.amount_cents THEN RAISE EXCEPTION 'Erstattungsaufteilung stimmt nicht mit dem Betrag überein'; END IF;
  SELECT * INTO p FROM inquiry_invoices WHERE id = c.parent_invoice_id FOR UPDATE;
  SELECT coalesce(sum(r.amount_cents), 0) INTO siblings FROM credit_note_refunds r
    JOIN inquiry_invoices ci ON ci.id = r.credit_note_id
    WHERE ci.parent_invoice_id = c.parent_invoice_id AND r.id <> NEW.id AND r.status NOT IN ('failed', 'canceled');
  IF siblings + NEW.amount_cents > round(coalesce(p.paid_amount, 0) * 100) THEN
    RAISE EXCEPTION 'Es kann nicht mehr erstattet werden, als bezahlt wurde';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_credit_note_refund_amount ON public.credit_note_refunds;
CREATE TRIGGER guard_credit_note_refund_amount BEFORE INSERT OR UPDATE OF amount_cents, allocations ON public.credit_note_refunds
FOR EACH ROW EXECUTE FUNCTION public.guard_credit_note_refund_amount();