-- VORBEREITET, NICHT PRODUKTIV ANGEWENDET (Paket 1B.2). Anwendung nur nach separater Freigabe.
-- 1) Einheitliche Standortprüfung für Finanzaktionen (bestehende Regel aus reserve_order_refund:
--    can_edit_operations UND (admin ODER aktives Mitarbeiterprofil am Auftragsstandort)).
CREATE OR REPLACE FUNCTION public.can_manage_rental_finance(_actor uuid,_location text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT _actor IS NOT NULL AND public.can_edit_operations(_actor) AND (public.has_role(_actor,'admin') OR (public.slt_stock_location(_location) IS NOT NULL AND EXISTS(SELECT 1 FROM public.staff_profiles s WHERE s.user_id=_actor AND s.is_active AND public.slt_stock_location(s.location)=public.slt_stock_location(_location))))
$$;
REVOKE ALL ON FUNCTION public.can_manage_rental_finance(uuid,text) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.can_manage_rental_finance(uuid,text) TO authenticated,service_role;

-- 2) settle_deposit: zusätzlich Standortbindung nach dem Laden des Auftrags.
DO $$ DECLARE d text; BEGIN SELECT pg_get_functiondef('public.settle_deposit(uuid,jsonb,text,numeric,uuid,date,text)'::regprocedure) INTO d;
  IF position('IF NOT FOUND THEN RAISE EXCEPTION ''Mietanfrage nicht gefunden''; END IF;' IN d)=0 THEN RAISE EXCEPTION 'settle_deposit: Ankerstelle nicht gefunden'; END IF;
  d:=replace(d,'IF NOT FOUND THEN RAISE EXCEPTION ''Mietanfrage nicht gefunden''; END IF;','IF NOT FOUND THEN RAISE EXCEPTION ''Mietanfrage nicht gefunden''; END IF; IF NOT public.can_manage_rental_finance(_uid,_inq.location) THEN RAISE EXCEPTION ''Keine Standortberechtigung für diese Kautionsabrechnung'' USING ERRCODE=''42501''; END IF;');
  EXECUTE d; END $$;

-- 3) mark_deposit_payout_done: Standortbindung über den Auftrag der Abrechnung.
CREATE OR REPLACE FUNCTION public.mark_deposit_payout_done(_settlement_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE s public.deposit_settlements; loc text; BEGIN IF NOT public.can_edit_operations(auth.uid()) THEN RAISE EXCEPTION 'Keine Berechtigung für Kautionserstattungen' USING ERRCODE='42501'; END IF; SELECT * INTO s FROM public.deposit_settlements WHERE id=_settlement_id FOR UPDATE; IF NOT FOUND THEN RAISE EXCEPTION 'Kautionsabrechnung nicht gefunden'; END IF; SELECT location INTO loc FROM public.rental_inquiries WHERE id=s.rental_inquiry_id; IF NOT public.can_manage_rental_finance(auth.uid(),loc) THEN RAISE EXCEPTION 'Keine Standortberechtigung für diese Kautionserstattung' USING ERRCODE='42501'; END IF; IF s.payout_method='stripe' AND NOT public.deposit_payout_verified(s.rental_inquiry_id,round(s.balance*100)::bigint) THEN RAISE EXCEPTION 'Stripe-Erstattung ist nicht durch erfolgreiche Zahlungsbelege bestätigt'; END IF; UPDATE public.deposit_settlements SET payout_status='paid',payout_date=current_date WHERE id=s.id AND payout_status='pending'; END $$;

-- 4) Manuelle Bar-/Bankrückzahlung: tatsächliches Auszahlungsdatum, einmalig gesetzt.
ALTER TABLE public.order_refund_requests ADD COLUMN IF NOT EXISTS paid_out_on date;
DO $$ DECLARE d text; BEGIN SELECT pg_get_functiondef('public.guard_order_refund_immutable()'::regprocedure) INTO d;
  IF position('-''bank_reference'')' IN d)=0 THEN RAISE EXCEPTION 'guard: Ankerstelle nicht gefunden'; END IF;
  d:=replace(d,'-''bank_reference'')','-''bank_reference''-''paid_out_on'')');
  d:=replace(d,'OR (OLD.bank_reference IS NOT NULL','OR (OLD.paid_out_on IS NOT NULL AND OLD.paid_out_on IS DISTINCT FROM NEW.paid_out_on) OR (OLD.bank_reference IS NOT NULL');
  EXECUTE d; END $$;

CREATE OR REPLACE FUNCTION public.confirm_manual_order_refund(_id uuid,_actor uuid,_reference text,_paid_on date) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.order_refund_requests; i public.rental_inquiries; ref text:=btrim(coalesce(_reference,''));
BEGIN
IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Nicht berechtigt' USING ERRCODE='42501'; END IF;
IF length(ref)<3 OR length(ref)>200 THEN RAISE EXCEPTION 'Auszahlungsnachweis fehlt'; END IF;
IF _paid_on IS NULL OR _paid_on>(now() AT TIME ZONE 'Europe/Berlin')::date THEN RAISE EXCEPTION 'Auszahlungsdatum fehlt oder liegt in der Zukunft'; END IF;
SELECT * INTO r FROM public.order_refund_requests WHERE id=_id FOR UPDATE; IF r.id IS NULL THEN RAISE EXCEPTION 'Erstattungsauftrag nicht gefunden'; END IF;
SELECT * INTO i FROM public.rental_inquiries WHERE id=r.inquiry_id;
IF NOT public.can_manage_rental_finance(_actor,i.location) THEN RAISE EXCEPTION 'Keine Standortberechtigung' USING ERRCODE='42501'; END IF;
IF r.rent_cents>0 AND NOT(public.has_role(_actor,'admin') OR public.has_role(_actor,'niederlassungsleiter')) THEN RAISE EXCEPTION 'Keine Mieterstattungsberechtigung' USING ERRCODE='42501'; END IF;
IF r.payout_method NOT IN ('cash','transfer') THEN RAISE EXCEPTION 'Stripe benötigt Providerbeleg'; END IF;
IF _paid_on<(r.created_at AT TIME ZONE 'Europe/Berlin')::date THEN RAISE EXCEPTION 'Auszahlungsdatum liegt vor dem Erstattungsauftrag'; END IF;
IF r.status='succeeded' THEN IF r.bank_reference IS NOT DISTINCT FROM ref AND r.paid_out_on IS NOT DISTINCT FROM _paid_on THEN RETURN; END IF; RAISE EXCEPTION 'Auszahlung wurde bereits mit anderem Nachweis bestätigt' USING ERRCODE='PT409'; END IF;
IF r.status<>'creating' THEN RAISE EXCEPTION 'Erstattungsauftrag ist nicht offen' USING ERRCODE='PT409'; END IF;
UPDATE public.order_refund_requests SET status='succeeded',bank_reference=ref,paid_out_on=_paid_on,completed_at=now() WHERE id=r.id;
INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,details,user_id) VALUES(r.inquiry_id,'refund_completed',jsonb_build_object('request_id',r.id,'deposit_cents',r.deposit_cents,'rent_cents',r.rent_cents,'method',r.payout_method,'paid_on',_paid_on,'reference',ref),_actor);
END $$;
REVOKE ALL ON FUNCTION public.confirm_manual_order_refund(uuid,uuid,text,date) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.confirm_manual_order_refund(uuid,uuid,text,date) TO service_role;
