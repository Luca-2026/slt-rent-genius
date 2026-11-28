CREATE OR REPLACE FUNCTION public.order_refund_totals(_inquiry uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE i public.rental_inquiries; s public.deposit_settlements; b public.rental_refund_bases; invoice record; paid bigint; held bigint; rent_due bigint:=0; deposit_due bigint; d_used bigint:=0; r_used bigint:=0; pending boolean:=false; reason text; invoices integer;
BEGIN
SELECT * INTO i FROM public.rental_inquiries WHERE id=_inquiry; IF i.id IS NULL THEN RAISE EXCEPTION 'Auftrag nicht gefunden'; END IF;
IF auth.role() IS DISTINCT FROM 'service_role' AND NOT(public.can_edit_operations(auth.uid()) AND (public.has_role(auth.uid(),'admin') OR EXISTS(SELECT 1 FROM public.staff_profiles sp WHERE sp.user_id=auth.uid() AND sp.is_active AND public.slt_stock_location(sp.location)=public.slt_stock_location(i.location)))) THEN RAISE EXCEPTION 'Keine Standortberechtigung' USING ERRCODE='42501'; END IF;
SELECT coalesce(sum(round((p->>'amount')::numeric*100)),0) INTO paid FROM jsonb_array_elements(coalesce(i.payments,'[]')) p;
held:=least(greatest(0,paid-round(coalesce((i.offer_payload->'totals'->>'grossAmount')::numeric,i.offer_total_gross,0)*100)),greatest(0,round(coalesce((i.offer_payload->>'deposit')::numeric,0)*100)));
SELECT * INTO s FROM public.deposit_settlements WHERE rental_inquiry_id=i.id; SELECT * INTO b FROM public.rental_refund_bases WHERE inquiry_id=i.id;
SELECT count(*) INTO invoices FROM public.inquiry_invoices WHERE rental_inquiry_id=i.id AND status NOT IN ('draft','cancelled');
IF s.id IS NOT NULL THEN deposit_due:=greatest(0,round(s.balance*100)); ELSE deposit_due:=held; IF i.cancelled_at IS NULL THEN reason:='Kaution zuerst abrechnen'; END IF; END IF;
IF b.id IS NOT NULL AND invoices>0 THEN reason:='Vorhandene Belege erfordern Korrekturabrechnung'; END IF; IF b.id IS NOT NULL THEN rent_due:=greatest(0,round((b.paid_amount-b.gross_amount)*100));
ELSIF i.cancelled_at IS NOT NULL AND invoices=0 THEN rent_due:=greatest(0,paid-held-round((i.cancellation_payload->'totals'->>'grossAmount')::numeric*100));
ELSIF invoices=1 THEN SELECT * INTO invoice FROM public.inquiry_invoices WHERE rental_inquiry_id=i.id AND status NOT IN ('draft','cancelled'); IF invoice.invoice_kind IN ('invoice','final') AND invoice.parent_invoice_id IS NULL AND coalesce(jsonb_array_length(invoice.deducted_installments),0)=0 THEN rent_due:=greatest(0,round((invoice.paid_amount-invoice.gross_amount)*100)); ELSE reason:='Vorhandene Belege erfordern Korrekturabrechnung'; END IF;
ELSIF invoices>1 THEN reason:='Vorhandene Rechnungen und Abschläge erfordern Korrekturabrechnung'; END IF;
SELECT coalesce(sum(d.amount_cents) FILTER(WHERE d.status NOT IN ('failed','canceled')),0),coalesce(bool_or(d.status IN ('creating','pending','requires_action')),false) INTO d_used,pending FROM public.deposit_refunds d JOIN public.offer_payment_links l ON l.id=d.link_id WHERE l.inquiry_id=i.id AND l.inquiry_table='rental_inquiries';
IF s.payout_status='paid' AND s.payout_method IN ('cash','transfer') THEN d_used:=greatest(d_used,deposit_due); END IF;
SELECT coalesce(sum(r.amount_cents) FILTER(WHERE r.status NOT IN ('failed','canceled')),0),pending OR coalesce(bool_or(r.status IN ('creating','pending','requires_action','partial_failed')),false) INTO r_used,pending FROM public.rental_order_refunds r JOIN public.rental_refund_bases rb ON rb.id=r.basis_id WHERE rb.inquiry_id=i.id;
SELECT r_used+coalesce(sum(r.amount_cents) FILTER(WHERE r.status NOT IN ('failed','canceled')),0),pending OR coalesce(bool_or(r.status IN ('creating','pending','requires_action','partial_failed')),false) INTO r_used,pending FROM public.credit_note_refunds r JOIN public.inquiry_invoices inv ON inv.id=r.credit_note_id WHERE inv.rental_inquiry_id=i.id;
SELECT d_used+coalesce(sum(r.deposit_cents) FILTER(WHERE r.status NOT IN ('failed','canceled')),0),r_used+coalesce(sum(r.rent_cents) FILTER(WHERE r.status NOT IN ('failed','canceled')),0),pending OR coalesce(bool_or(r.status IN ('creating','pending','partial_failed')),false) INTO d_used,r_used,pending FROM public.order_refund_requests r WHERE r.inquiry_id=i.id;
RETURN jsonb_build_object('paid_cents',paid,'deposit_entitlement',deposit_due,'rent_entitlement',rent_due,'deposit_used',d_used,'rent_used',r_used,'deposit_available',greatest(0,deposit_due-d_used),'rent_available',greatest(0,rent_due-r_used),'pending',pending,'blocked_reason',reason,'basis_id',b.id);
END $function$;
