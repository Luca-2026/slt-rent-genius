
-- Trigger function to automatically adjust used_credit on b2b_profiles
-- when invoices are created, paid, or cancelled
CREATE OR REPLACE FUNCTION public.adjust_credit_on_invoice_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- On INSERT: if invoice is open/overdue, increase used_credit
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IN ('open', 'overdue') THEN
      UPDATE b2b_profiles
      SET used_credit = used_credit + NEW.gross_amount
      WHERE id = NEW.b2b_profile_id;
    END IF;
    RETURN NEW;
  END IF;

  -- On UPDATE: handle status transitions
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Was consuming credit, now freed (paid or cancelled)
    IF OLD.status IN ('open', 'overdue') AND NEW.status IN ('paid', 'cancelled') THEN
      UPDATE b2b_profiles
      SET used_credit = GREATEST(used_credit - OLD.gross_amount, 0)
      WHERE id = NEW.b2b_profile_id;
    
    -- Was freed, now consuming credit again (e.g. paid -> open correction)
    ELSIF OLD.status IN ('paid', 'cancelled') AND NEW.status IN ('open', 'overdue') THEN
      UPDATE b2b_profiles
      SET used_credit = used_credit + NEW.gross_amount
      WHERE id = NEW.b2b_profile_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on b2b_invoices
CREATE TRIGGER trg_adjust_credit_on_invoice
  AFTER INSERT OR UPDATE OF status ON public.b2b_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.adjust_credit_on_invoice_change();
