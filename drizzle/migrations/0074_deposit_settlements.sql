CREATE TABLE public.deposit_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_inquiry_id uuid NOT NULL UNIQUE REFERENCES public.rental_inquiries(id) ON DELETE RESTRICT,
  paid_amount numeric(12,2) NOT NULL DEFAULT 0,
  rent_amount numeric(12,2) NOT NULL DEFAULT 0,
  deposit_held numeric(12,2) NOT NULL DEFAULT 0,
  deductions jsonb NOT NULL DEFAULT '[]'::jsonb,
  deductions_net numeric(12,2) NOT NULL DEFAULT 0,
  deductions_gross numeric(12,2) NOT NULL DEFAULT 0,
  offset_amount numeric(12,2) NOT NULL DEFAULT 0,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  payout_method text NOT NULL DEFAULT 'none',
  payout_status text NOT NULL DEFAULT 'none',
  payout_date date,
  invoice_id uuid REFERENCES public.inquiry_invoices(id),
  notes text,
  settled_by uuid,
  settled_by_name text,
  settled_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.deposit_settlements TO authenticated;
GRANT ALL ON public.deposit_settlements TO service_role;
ALTER TABLE public.deposit_settlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read deposit settlements" ON public.deposit_settlements
  FOR SELECT TO authenticated USING (public.is_staff_member(auth.uid()));

CREATE OR REPLACE FUNCTION public.guard_deposit_settlement_immutable()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Kautionsabrechnungen sind unveränderlich (GoBD) – Korrektur nur per Gutschrift';
  END IF;
  -- Nur die Stripe-Auszahlung darf nachträglich als erledigt markiert werden.
  IF (to_jsonb(NEW) - 'payout_status' - 'payout_date') IS DISTINCT FROM (to_jsonb(OLD) - 'payout_status' - 'payout_date') THEN
    RAISE EXCEPTION 'Kautionsabrechnungen sind unveränderlich (GoBD) – Korrektur nur per Gutschrift';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER deposit_settlement_immutable BEFORE UPDATE OR DELETE ON public.deposit_settlements
  FOR EACH ROW EXECUTE FUNCTION public.guard_deposit_settlement_immutable();

CREATE OR REPLACE FUNCTION public.settle_deposit(
  _inquiry_id uuid,
  _deductions jsonb,
  _payout_method text,
  _expected_balance numeric,
  _invoice_id uuid DEFAULT NULL,
  _payout_date date DEFAULT NULL,
  _notes text DEFAULT NULL
) RETURNS public.deposit_settlements
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _inq public.rental_inquiries;
  _paid numeric; _rent numeric; _net numeric; _gross numeric; _held numeric; _bal numeric;
  _row public.deposit_settlements;
  _name text;
BEGIN
  IF _uid IS NULL OR NOT public.can_edit_operations(_uid) THEN
    RAISE EXCEPTION 'Keine Berechtigung für die Kautionsabrechnung' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO _inq FROM public.rental_inquiries WHERE id = _inquiry_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Mietanfrage nicht gefunden'; END IF;
  IF EXISTS (SELECT 1 FROM public.deposit_settlements WHERE rental_inquiry_id = _inquiry_id) THEN
    RAISE EXCEPTION 'CONFLICT: Kaution wurde bereits abgerechnet' USING ERRCODE = '40001';
  END IF;
  IF _payout_method NOT IN ('cash','transfer','stripe','none') THEN
    RAISE EXCEPTION 'Ungültiger Auszahlungsweg';
  END IF;
  IF jsonb_typeof(_deductions) <> 'array' THEN RAISE EXCEPTION 'Abzüge ungültig'; END IF;

  SELECT round(coalesce(sum((p->>'amount')::numeric), 0), 2) INTO _paid
    FROM jsonb_array_elements(coalesce(_inq.payments, '[]'::jsonb)) p;
  _rent := round(coalesce(_inq.offer_total_gross, 0), 2);
  SELECT round(coalesce(sum(round((d->>'gross')::numeric / 1.19, 2)), 0), 2) INTO _net
    FROM jsonb_array_elements(_deductions) d
   WHERE coalesce((d->>'removed')::boolean, false) = false AND (d->>'gross')::numeric > 0;
  _gross := round(_net * 1.19, 2);
  _held := greatest(0, _paid - _rent);
  _bal := round(_paid - _rent - _gross, 2);

  IF abs(_bal - round(coalesce(_expected_balance, 0), 2)) >= 0.005 THEN
    RAISE EXCEPTION 'CONFLICT: Beträge haben sich geändert (Server: % €) – bitte neu laden', _bal USING ERRCODE = '40001';
  END IF;
  IF _gross > 0 AND _invoice_id IS NULL THEN RAISE EXCEPTION 'Rechnung über die Abzüge fehlt'; END IF;
  IF _bal > 0 AND _payout_method = 'none' THEN RAISE EXCEPTION 'Bitte Auszahlungsweg wählen'; END IF;

  SELECT coalesce(nullif(trim(sp.display_name), ''), u.email) INTO _name
    FROM auth.users u LEFT JOIN public.staff_profiles sp ON sp.user_id = u.id WHERE u.id = _uid;

  INSERT INTO public.deposit_settlements (
    rental_inquiry_id, paid_amount, rent_amount, deposit_held, deductions, deductions_net, deductions_gross,
    offset_amount, balance, payout_method, payout_status, payout_date, invoice_id, notes, settled_by, settled_by_name)
  VALUES (
    _inquiry_id, _paid, _rent, _held, _deductions, _net, _gross,
    least(_held, _gross), _bal,
    CASE WHEN _bal > 0 THEN _payout_method ELSE 'none' END,
    CASE WHEN _bal <= 0 THEN 'none' WHEN _payout_method = 'stripe' THEN 'pending' ELSE 'paid' END,
    CASE WHEN _bal > 0 AND _payout_method <> 'stripe' THEN coalesce(_payout_date, current_date) END,
    _invoice_id, nullif(trim(coalesce(_notes, '')), ''), _uid, _name)
  RETURNING * INTO _row;

  UPDATE public.b2b_return_extra_charges c SET billed = true
   FROM public.b2b_return_protocols p
   WHERE c.return_protocol_id = p.id AND p.rental_inquiry_id = _inquiry_id AND c.billed = false;

  INSERT INTO public.rental_inquiry_events (rental_inquiry_id, event, user_id, details)
  VALUES (_inquiry_id, 'deposit_settled', _uid, jsonb_build_object(
    'paid', _paid, 'rent', _rent, 'deposit_held', _held, 'deductions_gross', _gross,
    'balance', _bal, 'payout_method', _row.payout_method, 'invoice_id', _invoice_id, 'by', _name));
  RETURN _row;
END $$;

REVOKE ALL ON FUNCTION public.settle_deposit(uuid, jsonb, text, numeric, uuid, date, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.settle_deposit(uuid, jsonb, text, numeric, uuid, date, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.mark_deposit_payout_done(_settlement_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'niederlassungsleiter')) THEN
    RAISE EXCEPTION 'Nur Admin oder Niederlassungsleitung' USING ERRCODE = '42501';
  END IF;
  UPDATE public.deposit_settlements SET payout_status = 'paid', payout_date = current_date
   WHERE id = _settlement_id AND payout_status = 'pending';
END $$;
REVOKE ALL ON FUNCTION public.mark_deposit_payout_done(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.mark_deposit_payout_done(uuid) TO authenticated;