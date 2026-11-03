ALTER TABLE public.cash_journal ADD COLUMN IF NOT EXISTS cash_register text;

CREATE OR REPLACE FUNCTION public.cash_register_for_location(_loc text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT CASE
    WHEN lower(coalesce(_loc,'')) LIKE 'bonn%' THEN 'bonn'
    WHEN lower(coalesce(_loc,'')) LIKE 'krefeld%' OR lower(coalesce(_loc,'')) LIKE 'm_lheim%' OR lower(coalesce(_loc,'')) LIKE 'muelheim%' THEN 'krefeld'
    ELSE NULL END $$;

CREATE OR REPLACE FUNCTION public.log_cash_payments()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _old jsonb := CASE WHEN TG_OP = 'UPDATE' THEN coalesce(OLD.payments, '[]'::jsonb) ELSE '[]'::jsonb END;
  _new jsonb := coalesce(NEW.payments, '[]'::jsonb);
  _code text; _doc text; _name text; _company text; _reg text;
BEGIN
  IF _old = _new THEN RETURN NEW; END IF;
  _reg := public.cash_register_for_location(NEW.location);
  IF TG_TABLE_NAME = 'rental_inquiries' THEN
    _code := NEW.order_code; _doc := NULL; _name := NEW.customer_name; _company := NEW.company_name;
  ELSIF TG_TABLE_NAME = 'sales_inquiries' THEN
    _code := NEW.order_code; _doc := NULL;
    _name := nullif(trim(concat_ws(' ', NEW.first_name, NEW.last_name)), '');
    _company := coalesce(nullif(NEW.company_name, ''), NEW.billing_company);
  ELSE
    _doc := NEW.invoice_number; _name := NEW.customer_name; _company := NEW.company_name;
    SELECT coalesce(
      (SELECT order_code FROM public.rental_inquiries WHERE id = NEW.rental_inquiry_id),
      (SELECT order_code FROM public.sales_inquiries WHERE id = NEW.sales_inquiry_id)) INTO _code;
  END IF;

  INSERT INTO public.cash_journal (source_table, source_id, kind, amount, payment_date, label, reference, order_code, document_number, customer_name, company_name, cash_register)
  SELECT TG_TABLE_NAME, NEW.id, d.kind, d.sign * round((d.p->>'amount')::numeric, 2),
         coalesce(nullif(d.p->>'date','')::date, current_date), d.p->>'label', d.p->>'reference',
         _code, _doc, _name, _company, _reg
  FROM (
    SELECT 'payment' kind, 1 sign, n.p FROM (
      SELECT p, row_number() OVER (PARTITION BY p) rn FROM jsonb_array_elements(_new) p) n
      WHERE NOT EXISTS (SELECT 1 FROM (SELECT p, row_number() OVER (PARTITION BY p) rn FROM jsonb_array_elements(_old) p) o WHERE o.p = n.p AND o.rn = n.rn)
    UNION ALL
    SELECT 'payment_removed', -1, o.p FROM (
      SELECT p, row_number() OVER (PARTITION BY p) rn FROM jsonb_array_elements(_old) p) o
      WHERE NOT EXISTS (SELECT 1 FROM (SELECT p, row_number() OVER (PARTITION BY p) rn FROM jsonb_array_elements(_new) p) n WHERE o.p = n.p AND o.rn = n.rn)
  ) d
  WHERE lower(coalesce(d.p->>'label','')) LIKE 'bar%' AND coalesce((d.p->>'amount')::numeric, 0) > 0;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.log_cash_deposit_payout()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.payout_method = 'cash' AND NEW.balance > 0 THEN
    INSERT INTO public.cash_journal (source_table, source_id, kind, amount, payment_date, label, order_code, customer_name, company_name, cash_register)
    SELECT 'deposit_settlements', NEW.id, 'deposit_payout', -round(NEW.balance, 2), coalesce(NEW.payout_date, current_date),
           'Kaution bar ausgezahlt', r.order_code, r.customer_name, r.company_name, public.cash_register_for_location(r.location)
    FROM public.rental_inquiries r WHERE r.id = NEW.rental_inquiry_id;
  END IF;
  RETURN NEW;
END $function$;