-- REVIEWED REPLACEMENT ARTIFACT ONLY: do NOT execute in production without separate approval.
-- The original drizzle/prepared/0213 remains untouched. Use this INSTEAD OF that artifact.
-- Execute the whole file in one transaction. Cash cancellation completion stays fail-closed
-- until the accountant confirms journal reconciliation and closed-period treatment.
CREATE OR REPLACE FUNCTION public.can_manage_rental_finance(_actor uuid,_location text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
SELECT _actor IS NOT NULL AND public.can_edit_operations(_actor) AND
 (public.has_role(_actor,'admin') OR (public.slt_stock_location(_location) IS NOT NULL AND EXISTS
 (SELECT 1 FROM public.staff_profiles s WHERE s.user_id=_actor AND s.is_active
 AND public.slt_stock_location(s.location)=public.slt_stock_location(_location))))
$$;
REVOKE ALL ON FUNCTION public.can_manage_rental_finance(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.can_manage_rental_finance(uuid,text) TO authenticated,service_role;

DO $$ DECLARE d text; BEGIN
SELECT pg_get_functiondef('public.settle_deposit(uuid,jsonb,text,numeric,uuid,date,text)'::regprocedure) INTO d;
IF position('public.can_manage_rental_finance(_uid,_inq.location)' IN d)=0 THEN
 IF position('IF NOT FOUND THEN RAISE EXCEPTION ''Mietanfrage nicht gefunden''; END IF;' IN d)=0 THEN
  RAISE EXCEPTION 'settle_deposit: reviewed anchor missing';
 END IF;
 d:=replace(d,'IF NOT FOUND THEN RAISE EXCEPTION ''Mietanfrage nicht gefunden''; END IF;',
 'IF NOT FOUND THEN RAISE EXCEPTION ''Mietanfrage nicht gefunden''; END IF; IF NOT public.can_manage_rental_finance(_uid,_inq.location) THEN RAISE EXCEPTION ''Keine Standortberechtigung für diese Kautionsabrechnung'' USING ERRCODE=''42501''; END IF;');
 EXECUTE d;
END IF;
SELECT pg_get_functiondef('public.settle_deposit(uuid,jsonb,text,numeric,uuid,date,text)'::regprocedure) INTO d;
IF position('Gemeinsame Kautionserstattung bereits beauftragt' IN d)=0 THEN
 d:=replace(d,'IF EXISTS(SELECT 1 FROM public.deposit_settlements WHERE rental_inquiry_id=_inquiry_id)',
 'IF EXISTS(SELECT 1 FROM public.order_refund_requests WHERE inquiry_id=_inquiry_id AND deposit_cents>0 AND status NOT IN (''failed'',''canceled'')) THEN RAISE EXCEPTION ''Gemeinsame Kautionserstattung bereits beauftragt; vorhandenen Nachweis prüfen'' USING ERRCODE=''PT409''; END IF; IF EXISTS(SELECT 1 FROM public.deposit_settlements WHERE rental_inquiry_id=_inquiry_id)');
 IF position('Gemeinsame Kautionserstattung bereits beauftragt' IN d)=0 THEN RAISE EXCEPTION 'settlement capacity: reviewed anchor missing'; END IF;
 EXECUTE d;
END IF;
END $$;

CREATE OR REPLACE FUNCTION public.mark_deposit_payout_done(_settlement_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET lock_timeout='2s' AS $$
DECLARE s public.deposit_settlements; loc text; owner_id uuid;
BEGIN
IF NOT public.can_edit_operations(auth.uid()) THEN RAISE EXCEPTION 'Keine Berechtigung für Kautionserstattungen' USING ERRCODE='42501'; END IF;
SELECT rental_inquiry_id INTO owner_id FROM public.deposit_settlements WHERE id=_settlement_id;
IF owner_id IS NULL THEN RAISE EXCEPTION 'Kautionsabrechnung nicht gefunden'; END IF;
SELECT location INTO loc FROM public.rental_inquiries WHERE id=owner_id FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Auftrag nicht gefunden'; END IF;
IF NOT public.can_manage_rental_finance(auth.uid(),loc) THEN RAISE EXCEPTION 'Keine Standortberechtigung für diese Kautionserstattung' USING ERRCODE='42501'; END IF;
SELECT * INTO s FROM public.deposit_settlements WHERE id=_settlement_id AND rental_inquiry_id=owner_id FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Kautionsabrechnung nicht gefunden'; END IF;
IF s.payout_status IS DISTINCT FROM 'pending' THEN RETURN; END IF;
IF EXISTS(SELECT 1 FROM public.order_refund_requests WHERE inquiry_id=owner_id AND deposit_cents>0 AND status NOT IN ('failed','canceled')) THEN
 RAISE EXCEPTION 'Gemeinsame Kautionserstattung bereits beauftragt; vorhandenen Nachweis prüfen' USING ERRCODE='PT409';
END IF;
IF s.payout_method='stripe' AND NOT public.deposit_payout_verified(s.rental_inquiry_id,round(s.balance*100)::bigint) THEN RAISE EXCEPTION 'Stripe-Erstattung ist nicht durch erfolgreiche Zahlungsbelege bestätigt'; END IF;
UPDATE public.deposit_settlements SET payout_status='paid',payout_date=current_date WHERE id=s.id AND payout_status='pending';
END $$;
REVOKE ALL ON FUNCTION public.mark_deposit_payout_done(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mark_deposit_payout_done(uuid) TO authenticated,service_role;

ALTER TABLE public.order_refund_requests ADD COLUMN IF NOT EXISTS paid_out_on date;
COMMENT ON COLUMN public.order_refund_requests.paid_out_on IS 'Actual confirmed manual payout day; historical NULL is unknown and must not be backfilled from completion time.';
DO $$ DECLARE d text; BEGIN
SELECT pg_get_functiondef('public.guard_order_refund_immutable()'::regprocedure) INTO d;
IF position('OLD.paid_out_on IS NOT NULL' IN d)=0 THEN
 IF position('-''bank_reference'')' IN d)=0 THEN RAISE EXCEPTION 'refund guard: reviewed anchor missing'; END IF;
 d:=replace(d,'-''bank_reference'')','-''bank_reference''-''paid_out_on'')');
 d:=replace(d,'OR (OLD.bank_reference IS NOT NULL','OR (OLD.paid_out_on IS NOT NULL AND OLD.paid_out_on IS DISTINCT FROM NEW.paid_out_on) OR (OLD.bank_reference IS NOT NULL');
 EXECUTE d;
END IF;
END $$;

CREATE OR REPLACE FUNCTION public.confirm_manual_order_refund(_id uuid,_actor uuid,_reference text,_paid_on date)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET lock_timeout='2s' AS $$
DECLARE r public.order_refund_requests; i public.rental_inquiries; owner_id uuid;
 ref text:=btrim(coalesce(_reference,'')); totals jsonb;
BEGIN
IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Nicht berechtigt' USING ERRCODE='42501'; END IF;
IF length(ref)<3 OR length(ref)>200 THEN RAISE EXCEPTION 'Auszahlungsnachweis fehlt'; END IF;
IF _paid_on IS NULL OR _paid_on>(now() AT TIME ZONE 'Europe/Berlin')::date THEN RAISE EXCEPTION 'Auszahlungsdatum fehlt oder liegt in der Zukunft'; END IF;
SELECT inquiry_id INTO owner_id FROM public.order_refund_requests WHERE id=_id;
IF owner_id IS NULL THEN RAISE EXCEPTION 'Erstattungsauftrag nicht gefunden'; END IF;
-- Same lock order as reservation/settlement: inquiry first, child second.
SELECT * INTO i FROM public.rental_inquiries WHERE id=owner_id FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Auftrag nicht gefunden'; END IF;
IF NOT public.can_manage_rental_finance(_actor,i.location) THEN RAISE EXCEPTION 'Keine Standortberechtigung' USING ERRCODE='42501'; END IF;
SELECT * INTO r FROM public.order_refund_requests WHERE id=_id AND inquiry_id=owner_id FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Erstattungsauftrag nicht gefunden'; END IF;
IF r.payout_method='stripe' THEN RAISE EXCEPTION 'Stripe benötigt Providerbeleg'; END IF;
IF _paid_on<(r.created_at AT TIME ZONE 'Europe/Berlin')::date THEN RAISE EXCEPTION 'Auszahlungsdatum liegt vor dem Erstattungsauftrag'; END IF;
-- Historical successes stay readable; do not invent their actual payout date on retry.
IF r.status='succeeded' THEN
 IF r.bank_reference IS NOT DISTINCT FROM ref AND r.paid_out_on IS NOT DISTINCT FROM _paid_on THEN RETURN; END IF;
 RAISE EXCEPTION 'Auszahlung wurde bereits mit anderem oder historischem Nachweis bestätigt' USING ERRCODE='PT409';
END IF;
IF r.status<>'creating' THEN RAISE EXCEPTION 'Erstattungsauftrag ist nicht offen' USING ERRCODE='PT409'; END IF;
IF r.payout_method='cash' THEN RAISE EXCEPTION 'Storno-Barauszahlung gesperrt: Kassenbuchnachweis und Kassenperiodenfreigabe fehlen' USING ERRCODE='23514'; END IF;
IF i.cancelled_at IS NULL OR r.rent_cents<>0 OR r.payout_method<>'transfer' THEN RAISE EXCEPTION 'Nur stornierte reine Bankkaution freigegeben' USING ERRCODE='23514'; END IF;
IF EXISTS(SELECT 1 FROM public.offer_payment_links WHERE inquiry_id=i.id AND inquiry_table='rental_inquiries' AND status='paid')
 OR jsonb_array_length(coalesce(i.payments,'[]'))=0
 OR EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(i.payments,'[]')) p WHERE coalesce(p->>'label','')!~*'(überweisung|ueberweisung|bank)' OR coalesce(p->>'reference','')~'^(pi_|cs_)')
THEN RAISE EXCEPTION 'Rückzahlung nur auf ursprüngliche Zahlungsart' USING ERRCODE='23514'; END IF;
totals:=public.order_refund_totals(i.id);
IF (totals->>'deposit_used')::bigint>(totals->>'deposit_entitlement')::bigint OR totals->>'blocked_reason' IS NOT NULL THEN
 RAISE EXCEPTION 'Kautionsanspruch geändert oder bereits anderweitig erstattet' USING ERRCODE='23514';
END IF;
UPDATE public.order_refund_requests SET status='succeeded',bank_reference=ref,paid_out_on=_paid_on,completed_at=now() WHERE id=r.id;
INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details,user_id)
VALUES(r.inquiry_id,'refund_completed',jsonb_build_object('request_id',r.id,'deposit_cents',r.deposit_cents,'rent_cents',r.rent_cents,'method',r.payout_method,'paid_on',_paid_on,'reference',ref),_actor);
END $$;
REVOKE ALL ON FUNCTION public.confirm_manual_order_refund(uuid,uuid,text,date) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_manual_order_refund(uuid,uuid,text,date) TO service_role;

-- Preserve signature for old clients but fail closed; no fabricated actual payout date.
CREATE OR REPLACE FUNCTION public.confirm_order_refund_manual(_id uuid,_actor uuid,_reference text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN RAISE EXCEPTION 'Alter Bestätigungsweg gesperrt: tatsächliches Auszahlungsdatum und geprüfter Nachweis erforderlich' USING ERRCODE='23514'; END $$;
REVOKE ALL ON FUNCTION public.confirm_order_refund_manual(uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_order_refund_manual(uuid,uuid,text) TO service_role;

DO $$ DECLARE d text; BEGIN
SELECT pg_get_functiondef('public.reserve_order_refund(uuid,uuid,uuid,integer,integer,text,jsonb)'::regprocedure) INTO d;
IF position('Kassenperiodenfreigabe fehlt' IN d)=0 THEN
 d:=replace(d,'SELECT * INTO i FROM public.rental_inquiries WHERE id=_inquiry FOR UPDATE;',
 'SELECT * INTO i FROM public.rental_inquiries WHERE id=_inquiry FOR UPDATE; IF _method=''cash'' AND i.cancelled_at IS NOT NULL THEN RAISE EXCEPTION ''Storno-Barauszahlung gesperrt: Kassenperiodenfreigabe fehlt'' USING ERRCODE=''23514''; END IF;');
 IF position('Kassenperiodenfreigabe fehlt' IN d)=0 THEN RAISE EXCEPTION 'reservation: reviewed anchor missing'; END IF;
 EXECUTE d;
END IF;
END $$;

-- Targeted SELECT policies for the financial ledgers already read directly by the UI.
-- This uses current roles/profiles, not a new grant model. No live rights are changed here.
CREATE OR REPLACE FUNCTION public.can_read_finance_record(_kind text,_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE loc text; order_loc text; owner_id uuid; sales_id uuid; link_table text; source_kind text; source_uuid uuid;
BEGIN
IF auth.uid() IS NULL OR NOT public.can_edit_operations(auth.uid()) THEN RETURN false; END IF;
IF public.has_role(auth.uid(),'admin') THEN RETURN true; END IF;
CASE _kind
WHEN 'rental_inquiries' THEN SELECT location INTO loc FROM public.rental_inquiries WHERE id=_id;
WHEN 'sales_inquiries' THEN SELECT location INTO loc FROM public.sales_inquiries WHERE id=_id;
WHEN 'inquiry_invoices' THEN
 SELECT location,rental_inquiry_id,sales_inquiry_id INTO loc,owner_id,sales_id FROM public.inquiry_invoices WHERE id=_id;
 IF owner_id IS NOT NULL AND sales_id IS NOT NULL THEN RETURN false; END IF;
 IF owner_id IS NOT NULL THEN SELECT location INTO order_loc FROM public.rental_inquiries WHERE id=owner_id;
 ELSIF sales_id IS NOT NULL THEN SELECT location INTO order_loc FROM public.sales_inquiries WHERE id=sales_id; END IF;
 IF owner_id IS NOT NULL OR sales_id IS NOT NULL THEN
  IF public.slt_stock_location(order_loc) IS NULL THEN RETURN false; END IF;
  IF public.slt_stock_location(loc) IS NOT NULL AND public.slt_stock_location(loc)<>public.slt_stock_location(order_loc) THEN RETURN false; END IF;
  loc:=order_loc;
 END IF;
WHEN 'offer_payment_links' THEN
 SELECT inquiry_table,inquiry_id INTO link_table,owner_id FROM public.offer_payment_links WHERE id=_id;
 IF link_table NOT IN ('rental_inquiries','sales_inquiries') OR link_table IS NULL THEN RETURN false; END IF;
 RETURN public.can_read_finance_record(link_table,owner_id);
WHEN 'deposit_settlements' THEN
 SELECT rental_inquiry_id INTO owner_id FROM public.deposit_settlements WHERE id=_id;
 RETURN public.can_read_finance_record('rental_inquiries',owner_id);
WHEN 'deposit_refunds' THEN
 SELECT link_id INTO owner_id FROM public.deposit_refunds WHERE id=_id;
 RETURN public.can_read_finance_record('offer_payment_links',owner_id);
WHEN 'rental_refund_bases' THEN
 SELECT inquiry_id INTO owner_id FROM public.rental_refund_bases WHERE id=_id;
 RETURN public.can_read_finance_record('rental_inquiries',owner_id);
WHEN 'rental_order_refunds' THEN
 SELECT basis_id INTO owner_id FROM public.rental_order_refunds WHERE id=_id;
 RETURN public.can_read_finance_record('rental_refund_bases',owner_id);
WHEN 'credit_note_refunds' THEN
 SELECT credit_note_id INTO owner_id FROM public.credit_note_refunds WHERE id=_id;
 RETURN public.can_read_finance_record('inquiry_invoices',owner_id);
WHEN 'cash_journal' THEN
 SELECT source_table,source_id INTO source_kind,source_uuid FROM public.cash_journal WHERE id=_id;
 IF source_kind NOT IN ('rental_inquiries','sales_inquiries','inquiry_invoices','deposit_settlements') OR source_kind IS NULL THEN RETURN false; END IF;
 RETURN public.can_read_finance_record(source_kind,source_uuid);
ELSE RETURN false;
END CASE;
RETURN public.can_manage_rental_finance(auth.uid(),loc);
END $$;
REVOKE ALL ON FUNCTION public.can_read_finance_record(text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.can_read_finance_record(text,uuid) TO authenticated,service_role;
ALTER POLICY "Staff can read deposit settlements" ON public.deposit_settlements USING (public.can_read_finance_record('deposit_settlements',id));
ALTER POLICY "Staff can read deposit refunds" ON public.deposit_refunds USING (public.can_read_finance_record('deposit_refunds',id));
ALTER POLICY staff_read ON public.rental_refund_bases USING (public.can_read_finance_record('rental_refund_bases',id));
ALTER POLICY staff_read ON public.rental_order_refunds USING (public.can_read_finance_record('rental_order_refunds',id));
ALTER POLICY staff_read_credit_refunds ON public.credit_note_refunds USING (public.can_read_finance_record('credit_note_refunds',id));
ALTER POLICY "Staff read cash journal" ON public.cash_journal USING (public.can_read_finance_record('cash_journal',id));