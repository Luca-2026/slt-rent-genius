CREATE OR REPLACE FUNCTION public.sync_single_rental_invoice_receipts(_inquiry uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public SET statement_timeout='5s' SET lock_timeout='2s' AS $$
DECLARE r public.rental_inquiries; i public.inquiry_invoices; p jsonb; out_payments jsonb; available numeric; credited numeric:=0; used numeric; total numeric; receipt_total numeric; n integer; receipt_time timestamptz;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 SELECT * INTO r FROM public.rental_inquiries WHERE id=_inquiry FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('updated',false,'reason','missing_order'); END IF;
 SELECT count(*) INTO n FROM public.inquiry_invoices WHERE rental_inquiry_id=_inquiry AND status NOT IN ('draft','cancelled') AND invoice_kind<>'credit_note';
 IF n<>1 THEN RETURN jsonb_build_object('updated',false,'reason','ambiguous_invoice_allocation'); END IF;
 SELECT * INTO i FROM public.inquiry_invoices WHERE rental_inquiry_id=_inquiry AND status NOT IN ('draft','cancelled') AND invoice_kind<>'credit_note' FOR UPDATE;
 IF i.invoice_kind<>'invoice' OR i.rental_refund_basis_id IS NOT NULL OR EXISTS(SELECT 1 FROM public.credit_note_refunds WHERE credit_note_id=i.id) OR EXISTS(SELECT 1 FROM public.rental_order_refunds WHERE inquiry_id=_inquiry) THEN RETURN jsonb_build_object('updated',false,'reason','special_accounting'); END IF;
 SELECT coalesce(sum((value->>'amount')::numeric),0) INTO receipt_total FROM jsonb_array_elements(coalesce(r.payments,'[]'));
 available:=greatest(0,least(receipt_total,coalesce(r.offer_total_gross,0),i.gross_amount-coalesce(i.credited_amount,0))-coalesce(i.paid_amount,0));
 out_payments:=coalesce(i.payments,'[]');
 FOR p IN SELECT value FROM jsonb_array_elements(coalesce(r.payments,'[]')) ORDER BY value->>'date',value->>'recorded_at' LOOP
  EXIT WHEN available<=0;
  IF coalesce(p->>'provider','')<>'stripe' OR coalesce(p->>'payment_intent_id','')='' OR coalesce(p->>'reference','')='' OR (p->>'amount')::numeric<=0 THEN CONTINUE; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(out_payments) e WHERE e->>'reference'=p->>'reference' OR e->>'payment_intent_id'=p->>'payment_intent_id') THEN CONTINUE; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.offer_payment_links l WHERE l.inquiry_id=_inquiry AND l.inquiry_table='rental_inquiries' AND l.payment_intent_id=p->>'payment_intent_id' AND l.stripe_session_id=p->>'reference' AND l.paid_at IS NOT NULL AND l.amount_cents=round((p->>'amount')::numeric*100)) THEN CONTINUE; END IF;
  used:=least(available,(p->>'amount')::numeric);
  receipt_time:=coalesce((p->>'recorded_at')::timestamptz,now());
  out_payments:=out_payments||jsonb_build_array(p||jsonb_build_object('amount',used,'receipt_amount',(p->>'amount')::numeric,'invoice_payment_recorded_at',receipt_time));
  credited:=credited+used; available:=available-used;
 END LOOP;
 IF credited<=0 THEN RETURN jsonb_build_object('updated',false,'reason','no_unallocated_receipt'); END IF;
 total:=coalesce(i.paid_amount,0)+credited;
 UPDATE public.inquiry_invoices SET payments=out_payments,paid_amount=total,status=CASE WHEN total+coalesce(credited_amount,0)>=gross_amount THEN 'paid' ELSE status END,paid_at=CASE WHEN total+coalesce(credited_amount,0)>=gross_amount THEN coalesce(paid_at,receipt_time) ELSE paid_at END WHERE id=i.id;
 RETURN jsonb_build_object('updated',true,'invoice_id',i.id,'credited',credited);
END $$;
REVOKE ALL ON FUNCTION public.sync_single_rental_invoice_receipts(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sync_single_rental_invoice_receipts(uuid) TO service_role;