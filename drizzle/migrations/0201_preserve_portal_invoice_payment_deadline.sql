CREATE OR REPLACE FUNCTION public.compute_invoice_due_date()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE days integer;
BEGIN
  -- Only new issuance/finalization may calculate a deadline; historical documents stay frozen.
  IF TG_OP = 'UPDATE' AND OLD.status <> 'draft' THEN RETURN NEW; END IF;
  IF NEW.status IN ('open','overdue','paid','cancelled') AND NEW.invoice_date IS NOT NULL THEN
    days := NEW.payment_due_days;
    IF days IS NULL THEN
      days := CASE NEW.payment_terms WHEN 'vorkasse' THEN 0 WHEN 'net_7' THEN 7 WHEN 'net_14' THEN 14 WHEN 'net_30' THEN 30 ELSE 14 END;
    END IF;
    IF days < 0 OR days > 365 THEN RAISE EXCEPTION 'Invalid invoice payment deadline'; END IF;
    NEW.due_date := NEW.invoice_date + days;
  END IF;
  RETURN NEW;
END;
$function$;