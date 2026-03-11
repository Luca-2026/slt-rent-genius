
-- Fix the trigger to handle DELETE
CREATE OR REPLACE FUNCTION public.adjust_credit_on_invoice_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- On DELETE: if invoice was consuming credit, release it
  IF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('open', 'overdue') THEN
      UPDATE b2b_profiles
      SET used_credit = GREATEST(used_credit - OLD.gross_amount, 0)
      WHERE id = OLD.b2b_profile_id;
    END IF;
    RETURN OLD;
  END IF;

  -- On UPDATE: handle status transitions
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF OLD.status IN ('open', 'overdue') AND NEW.status IN ('paid', 'cancelled') THEN
      UPDATE b2b_profiles
      SET used_credit = GREATEST(used_credit - OLD.gross_amount, 0)
      WHERE id = NEW.b2b_profile_id;
    ELSIF OLD.status IN ('paid', 'cancelled') AND NEW.status IN ('open', 'overdue') THEN
      UPDATE b2b_profiles
      SET used_credit = used_credit + NEW.gross_amount
      WHERE id = NEW.b2b_profile_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Re-create trigger to include DELETE
DROP TRIGGER IF EXISTS trg_adjust_credit_on_invoice ON public.b2b_invoices;
CREATE TRIGGER trg_adjust_credit_on_invoice
  AFTER INSERT OR UPDATE OR DELETE ON public.b2b_invoices
  FOR EACH ROW EXECUTE FUNCTION public.adjust_credit_on_invoice_change();

-- Fix PTB Unternehmen: recalculate used_credit from actual open/overdue invoices
UPDATE b2b_profiles
SET used_credit = COALESCE((
  SELECT SUM(gross_amount) FROM b2b_invoices 
  WHERE b2b_profile_id = '58dd029e-22de-4f97-a9df-86a73e82e287' 
  AND status IN ('open', 'overdue')
), 0)
WHERE id = '58dd029e-22de-4f97-a9df-86a73e82e287';
