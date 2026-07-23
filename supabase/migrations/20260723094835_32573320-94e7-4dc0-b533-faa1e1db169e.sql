-- Härtung: payment_terms und source_offer_id sind ab Status != draft unveränderlich
CREATE OR REPLACE FUNCTION public.enforce_invoice_immutability()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status <> 'draft' THEN
      RAISE EXCEPTION 'GoBD: Finalisierte Rechnungen (%) dürfen nicht gelöscht werden. Bitte stornieren.', OLD.invoice_number
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status <> 'draft' THEN
    IF NEW.invoice_number IS DISTINCT FROM OLD.invoice_number
      OR NEW.invoice_date IS DISTINCT FROM OLD.invoice_date
      OR NEW.due_date IS DISTINCT FROM OLD.due_date
      OR NEW.b2b_profile_id IS DISTINCT FROM OLD.b2b_profile_id
      OR NEW.net_amount IS DISTINCT FROM OLD.net_amount
      OR NEW.vat_rate IS DISTINCT FROM OLD.vat_rate
      OR NEW.vat_amount IS DISTINCT FROM OLD.vat_amount
      OR NEW.gross_amount IS DISTINCT FROM OLD.gross_amount
      OR NEW.amount IS DISTINCT FROM OLD.amount
      OR NEW.delivery_cost IS DISTINCT FROM OLD.delivery_cost
      OR NEW.is_reverse_charge IS DISTINCT FROM OLD.is_reverse_charge
      OR NEW.vat_id_at_creation IS DISTINCT FROM OLD.vat_id_at_creation
      OR NEW.customer_company IS DISTINCT FROM OLD.customer_company
      OR NEW.customer_address IS DISTINCT FROM OLD.customer_address
      OR NEW.customer_postal_code IS DISTINCT FROM OLD.customer_postal_code
      OR NEW.customer_city IS DISTINCT FROM OLD.customer_city
      OR NEW.customer_country IS DISTINCT FROM OLD.customer_country
      OR NEW.payment_terms IS DISTINCT FROM OLD.payment_terms
      OR NEW.payment_due_days IS DISTINCT FROM OLD.payment_due_days
      OR NEW.source_offer_id IS DISTINCT FROM OLD.source_offer_id
      OR NEW.reservation_id IS DISTINCT FROM OLD.reservation_id
    THEN
      RAISE EXCEPTION 'GoBD: Finalisierte Rechnungen sind unveränderlich. Nur Status (stornieren/bezahlt), Datei-/E-Mail-Metadaten und interne Notizen dürfen aktualisiert werden.'
        USING ERRCODE = 'check_violation';
    END IF;

    IF NEW.status <> OLD.status THEN
      IF NOT (
        (OLD.status IN ('open','overdue') AND NEW.status IN ('open','overdue','paid','cancelled'))
        OR (OLD.status = 'paid' AND NEW.status = 'paid')
        OR (OLD.status = 'cancelled' AND NEW.status = 'cancelled')
      ) THEN
        RAISE EXCEPTION 'GoBD: Unzulässiger Statuswechsel % -> %', OLD.status, NEW.status
          USING ERRCODE = 'check_violation';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;