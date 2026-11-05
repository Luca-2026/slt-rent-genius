CREATE TABLE public.rental_payout_approvers (user_id uuid PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.rental_payout_approvers TO authenticated;
GRANT ALL ON public.rental_payout_approvers TO service_role;
ALTER TABLE public.rental_payout_approvers ENABLE ROW LEVEL SECURITY;
CREATE POLICY approvers_read_self ON public.rental_payout_approvers FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE FUNCTION public.can_approve_rental_payout(_actor uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.has_role(_actor,'admin') AND EXISTS(SELECT 1 FROM public.rental_payout_approvers WHERE user_id=_actor) $$;
REVOKE ALL ON FUNCTION public.can_approve_rental_payout(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_approve_rental_payout(uuid) TO authenticated,service_role;
CREATE TABLE public.rental_additional_payouts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rental_inquiry_id uuid NOT NULL REFERENCES public.rental_inquiries(id), credit_note_id uuid NOT NULL UNIQUE REFERENCES public.inquiry_invoices(id),
 amount_cents integer NOT NULL CHECK(amount_cents>0), original_stripe_cents bigint NOT NULL, correction_refund_cents bigint NOT NULL, prior_refund_cents bigint NOT NULL,
 approval_required boolean NOT NULL, status text NOT NULL CHECK(status IN ('requested','approved','rejected','paid')),
 reason text NOT NULL, recipient text NOT NULL, iban text NOT NULL, created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), approved_by uuid, approved_at timestamptz, decision_note text, paid_by uuid, paid_at timestamptz, transfer_reference text
);
GRANT SELECT ON public.rental_additional_payouts TO authenticated;
GRANT ALL ON public.rental_additional_payouts TO service_role;
ALTER TABLE public.rental_additional_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_read_additional_payouts ON public.rental_additional_payouts FOR SELECT TO authenticated USING(public.can_edit_operations(auth.uid()));
CREATE TABLE public.rental_additional_payout_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), payout_id uuid NOT NULL REFERENCES public.rental_additional_payouts(id), actor uuid NOT NULL, event text NOT NULL, details jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.rental_additional_payout_events TO authenticated;
GRANT ALL ON public.rental_additional_payout_events TO service_role;
ALTER TABLE public.rental_additional_payout_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_read_payout_events ON public.rental_additional_payout_events FOR SELECT TO authenticated USING(public.can_edit_operations(auth.uid()));
CREATE FUNCTION public.request_rental_additional_payout(_credit uuid,_amount integer,_reason text,_recipient text,_iban text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.inquiry_invoices; r public.rental_inquiries; existing public.rental_additional_payouts; original bigint; correction bigint; previous bigint; req boolean; new_id uuid;
BEGIN
IF NOT public.can_edit_operations(auth.uid()) THEN RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE='42501'; END IF;
IF _amount IS NULL OR _amount<1 OR _amount>10000000 OR length(btrim(coalesce(_reason,''))) NOT BETWEEN 5 AND 1000 OR length(btrim(coalesce(_recipient,''))) NOT BETWEEN 2 AND 200 OR upper(replace(coalesce(_iban,''),' ','')) !~ '^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$' THEN RAISE EXCEPTION 'Betrag, Grund und Überweisungsempfänger vollständig angeben'; END IF;
SELECT * INTO c FROM public.inquiry_invoices WHERE id=_credit;
IF c.id IS NULL OR c.invoice_kind IS DISTINCT FROM 'credit_note' OR c.status IN ('draft','cancelled') OR c.rental_inquiry_id IS NULL THEN RAISE EXCEPTION 'Ausgestellte Miet-Rechnungskorrektur erforderlich'; END IF;
SELECT * INTO r FROM public.rental_inquiries WHERE id=c.rental_inquiry_id FOR UPDATE;
SELECT * INTO existing FROM public.rental_additional_payouts WHERE credit_note_id=_credit;
IF existing.id IS NOT NULL THEN
 IF existing.amount_cents=_amount AND existing.reason=btrim(_reason) AND existing.recipient=btrim(_recipient) AND existing.iban=upper(replace(_iban,' ','')) THEN RETURN existing.id; END IF;
 RAISE EXCEPTION 'Für diese Korrektur besteht bereits ein unveränderlicher Auszahlungsantrag';
END IF;
SELECT coalesce(sum(paid_cents),0) INTO original FROM (SELECT DISTINCT ON(payment_intent_id) payment_intent_id,paid_cents FROM public.offer_payment_links WHERE inquiry_id=r.id AND inquiry_table='rental_inquiries' AND status='paid' AND payment_intent_id IS NOT NULL ORDER BY payment_intent_id,paid_at DESC) x;
IF original<=0 THEN RAISE EXCEPTION 'Keine bestätigte ursprüngliche Stripe-Zahlung gefunden'; END IF;
correction:=round(coalesce(c.credit_refund_amount,abs(c.gross_amount),0)*100);
SELECT coalesce(sum(amount_cents),0) INTO previous FROM public.rental_additional_payouts WHERE rental_inquiry_id=r.id AND status<>'rejected';
SELECT previous+coalesce(sum(d.amount_cents),0) INTO previous FROM public.deposit_refunds d JOIN public.offer_payment_links l ON l.id=d.link_id WHERE l.inquiry_id=r.id AND l.inquiry_table='rental_inquiries' AND d.status NOT IN ('failed','cancelled');
SELECT previous+coalesce(sum(f.amount_cents),0) INTO previous FROM public.credit_note_refunds f JOIN public.inquiry_invoices i ON i.id=f.credit_note_id WHERE i.rental_inquiry_id=r.id AND i.id<>c.id AND f.status NOT IN ('failed','cancelled');
req:=previous+correction+_amount>original;
INSERT INTO public.rental_additional_payouts(rental_inquiry_id,credit_note_id,amount_cents,original_stripe_cents,correction_refund_cents,prior_refund_cents,approval_required,status,reason,recipient,iban,created_by) VALUES(r.id,c.id,_amount,original,correction,previous,req,CASE WHEN req THEN 'requested' ELSE 'approved' END,btrim(_reason),btrim(_recipient),upper(replace(_iban,' ','')),auth.uid()) RETURNING id INTO new_id;
INSERT INTO public.rental_additional_payout_events(payout_id,actor,event,details) VALUES(new_id,auth.uid(),'requested',jsonb_build_object('amount_cents',_amount,'approval_required',req));
RETURN new_id;
END $$;
REVOKE ALL ON FUNCTION public.request_rental_additional_payout(uuid,integer,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_rental_additional_payout(uuid,integer,text,text,text) TO authenticated;
CREATE FUNCTION public.decide_rental_additional_payout(_id uuid,_approve boolean,_note text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.rental_additional_payouts;
BEGIN
IF NOT public.can_approve_rental_payout(auth.uid()) THEN RAISE EXCEPTION 'Freigabe nur durch berechtigten Superadmin' USING ERRCODE='42501'; END IF;
SELECT * INTO p FROM public.rental_additional_payouts WHERE id=_id FOR UPDATE;
IF p.id IS NULL OR p.status<>'requested' THEN RAISE EXCEPTION 'Kein offener Freigabeantrag'; END IF;
IF length(btrim(coalesce(_note,''))) NOT BETWEEN 3 AND 1000 THEN RAISE EXCEPTION 'Entscheidungsnotiz erforderlich'; END IF;
UPDATE public.rental_additional_payouts SET status=CASE WHEN _approve THEN 'approved' ELSE 'rejected' END,approved_by=auth.uid(),approved_at=now(),decision_note=btrim(_note) WHERE id=_id;
INSERT INTO public.rental_additional_payout_events(payout_id,actor,event,details) VALUES(_id,auth.uid(),CASE WHEN _approve THEN 'approved' ELSE 'rejected' END,jsonb_build_object('note',btrim(_note)));
END $$;
REVOKE ALL ON FUNCTION public.decide_rental_additional_payout(uuid,boolean,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decide_rental_additional_payout(uuid,boolean,text) TO authenticated;
CREATE FUNCTION public.complete_rental_additional_payout(_id uuid,_reference text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.rental_additional_payouts;
BEGIN
IF NOT public.can_edit_operations(auth.uid()) THEN RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE='42501'; END IF;
IF length(btrim(coalesce(_reference,''))) NOT BETWEEN 5 AND 300 THEN RAISE EXCEPTION 'Zahlungsnachweis/Bankreferenz erforderlich'; END IF;
SELECT * INTO p FROM public.rental_additional_payouts WHERE id=_id FOR UPDATE;
IF p.status='paid' THEN RETURN; END IF;
IF p.id IS NULL OR p.status<>'approved' OR (p.approval_required AND (p.approved_by IS NULL OR NOT public.can_approve_rental_payout(p.approved_by))) THEN RAISE EXCEPTION 'Freigabe vor Auszahlung erforderlich'; END IF;
UPDATE public.rental_additional_payouts SET status='paid',paid_by=auth.uid(),paid_at=now(),transfer_reference=btrim(_reference) WHERE id=_id;
INSERT INTO public.rental_additional_payout_events(payout_id,actor,event,details) VALUES(_id,auth.uid(),'paid',jsonb_build_object('reference',btrim(_reference)));
END $$;
REVOKE ALL ON FUNCTION public.complete_rental_additional_payout(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_rental_additional_payout(uuid,text) TO authenticated;
COMMENT ON TABLE public.rental_additional_payouts IS 'Separate bank compensation beyond an invoice correction; never a Stripe refund or invoice price mutation. Client writes only through guarded RPCs.';