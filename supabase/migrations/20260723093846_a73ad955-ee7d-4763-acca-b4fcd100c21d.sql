
CREATE OR REPLACE FUNCTION public.adjust_credit_on_invoice_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  old_charged BOOLEAN;
  new_charged BOOLEAN;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IN ('open', 'overdue') THEN
      UPDATE b2b_profiles SET used_credit = used_credit + NEW.gross_amount
      WHERE id = NEW.b2b_profile_id;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('open', 'overdue') THEN
      UPDATE b2b_profiles SET used_credit = GREATEST(used_credit - OLD.gross_amount, 0)
      WHERE id = OLD.b2b_profile_id;
    END IF;
    RETURN OLD;
  END IF;

  -- UPDATE: react to any transition into/out of the "charged" set (open|overdue)
  old_charged := OLD.status IN ('open','overdue');
  new_charged := NEW.status IN ('open','overdue');

  IF old_charged AND NOT new_charged THEN
    UPDATE b2b_profiles SET used_credit = GREATEST(used_credit - OLD.gross_amount, 0)
    WHERE id = NEW.b2b_profile_id;
  ELSIF NOT old_charged AND new_charged THEN
    UPDATE b2b_profiles SET used_credit = used_credit + NEW.gross_amount
    WHERE id = NEW.b2b_profile_id;
  ELSIF old_charged AND new_charged AND OLD.gross_amount IS DISTINCT FROM NEW.gross_amount THEN
    UPDATE b2b_profiles SET used_credit = GREATEST(used_credit - OLD.gross_amount + NEW.gross_amount, 0)
    WHERE id = NEW.b2b_profile_id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Fix the used_credit for the two test invoices already open
UPDATE b2b_profiles
SET used_credit = used_credit + 714
WHERE id = 'dbeb70b2-171c-4e2e-b033-703c7a97813c';
