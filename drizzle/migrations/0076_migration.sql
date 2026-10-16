CREATE OR REPLACE FUNCTION public.guard_deposit_stripe_payout()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.payout_method = 'stripe' AND NOT EXISTS (
    SELECT 1 FROM public.rental_inquiries r, jsonb_array_elements(coalesce(r.payments,'[]'::jsonb)) p
     WHERE r.id = NEW.rental_inquiry_id AND (p->>'reference' ~ '^(cs_|pi_)' OR p->>'label' ILIKE '%stripe%')
  ) THEN
    RAISE EXCEPTION 'Stripe-Erstattung nur möglich, wenn die Zahlung über Stripe eingegangen ist. Bitte bar oder per Überweisung erstatten.' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_guard_deposit_stripe_payout ON public.deposit_settlements;
CREATE TRIGGER trg_guard_deposit_stripe_payout BEFORE INSERT ON public.deposit_settlements
FOR EACH ROW EXECUTE FUNCTION public.guard_deposit_stripe_payout();