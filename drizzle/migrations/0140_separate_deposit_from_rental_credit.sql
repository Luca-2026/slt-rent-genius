ALTER TABLE public.deposit_settlements ADD COLUMN rental_credit numeric NOT NULL DEFAULT 0;
COMMENT ON COLUMN public.deposit_settlements.rental_credit IS 'Rental overpayment retained for final invoice, never included in deposit payout. Historical settlements retain original evidence.';
CREATE OR REPLACE FUNCTION public.settle_deposit(_inquiry_id uuid, _deductions jsonb, _payout_method text, _expected_balance numeric, _invoice_id uuid DEFAULT NULL::uuid, _payout_date date DEFAULT NULL::date, _notes text DEFAULT NULL::text)
RETURNS public.deposit_settlements LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public AS $$
DECLARE
_uid uuid := auth.uid(); _inq public.rental_inquiries;
_paid numeric; _rent numeric; _net numeric; _gross numeric; _held numeric; _bal numeric; _credit numeric;
_row public.deposit_settlements; _name text;
BEGIN
IF _uid IS NULL OR NOT public.can_edit_operations(_uid) THEN RAISE EXCEPTION 'Keine Berechtigung für die Kautionsabrechnung' USING ERRCODE='42501'; END IF;
SELECT * INTO _inq FROM public.rental_inquiries WHERE id=_inquiry_id FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Mietanfrage nicht gefunden'; END IF;
IF EXISTS(SELECT 1 FROM public.deposit_settlements WHERE rental_inquiry_id=_inquiry_id) THEN RAISE EXCEPTION 'CONFLICT: Kaution wurde bereits abgerechnet' USING ERRCODE='40001'; END IF;
IF _payout_method NOT IN ('cash','transfer','stripe','none') OR _payout_method IS NULL THEN RAISE EXCEPTION 'Ungültiger Auszahlungsweg'; END IF;
IF jsonb_typeof(_deductions) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Abzüge ungültig'; END IF;
SELECT round(coalesce(sum((p->>'amount')::numeric),0),2) INTO _paid FROM jsonb_array_elements(coalesce(_inq.payments,'[]'::jsonb)) p;
_rent := round(coalesce(_inq.offer_total_gross,0),2);
SELECT round(coalesce(sum(CASE WHEN d->>'kind'='damage' THEN (d->>'gross')::numeric ELSE round((d->>'gross')::numeric/1.19,2) END),0),2) INTO _net FROM jsonb_array_elements(_deductions) d WHERE coalesce((d->>'removed')::boolean,false)=false AND (d->>'gross')::numeric>0;
SELECT round(coalesce(sum(CASE WHEN d->>'kind'='damage' THEN (d->>'gross')::numeric ELSE round(round((d->>'gross')::numeric/1.19,2)*1.19,2) END),0),2) INTO _gross FROM jsonb_array_elements(_deductions) d WHERE coalesce((d->>'removed')::boolean,false)=false AND (d->>'gross')::numeric>0;
_held := greatest(0,_paid-_rent);
IF _inq.offer_payload->>'deposit' IS NOT NULL THEN _held := least(_held,greatest(0,round((_inq.offer_payload->>'deposit')::numeric,2))); END IF;
_credit := round(greatest(0,_paid-_rent-_held),2);
_bal := round(_held-greatest(0,_rent-_paid)-_gross,2);
IF _expected_balance IS NULL OR abs(_bal-round(_expected_balance,2))>=0.005 THEN RAISE EXCEPTION 'CONFLICT: Beträge haben sich geändert (Server: % €) – bitte neu laden',_bal USING ERRCODE='40001'; END IF;
IF _bal>0 AND _payout_method='none' THEN RAISE EXCEPTION 'Bitte Auszahlungsweg wählen'; END IF;
SELECT coalesce(nullif(trim(coalesce(sp.first_name,'')||' '||coalesce(sp.last_name,'')),''),u.email) INTO _name FROM auth.users u LEFT JOIN public.staff_profiles sp ON sp.user_id=u.id WHERE u.id=_uid;
INSERT INTO public.deposit_settlements(rental_inquiry_id,paid_amount,rent_amount,deposit_held,rental_credit,deductions,deductions_net,deductions_gross,offset_amount,balance,payout_method,payout_status,payout_date,invoice_id,notes,settled_by,settled_by_name)
VALUES(_inquiry_id,_paid,_rent,_held,_credit,_deductions,_net,_gross,least(_held,_gross),_bal,CASE WHEN _bal>0 THEN _payout_method ELSE 'none' END,CASE WHEN _bal<=0 THEN 'none' WHEN _payout_method='stripe' THEN 'pending' ELSE 'paid' END,CASE WHEN _bal>0 AND _payout_method<>'stripe' THEN coalesce(_payout_date,current_date) END,_invoice_id,nullif(trim(coalesce(_notes,'')),''),_uid,_name) RETURNING * INTO _row;
UPDATE public.b2b_return_extra_charges c SET billed=true FROM public.b2b_return_protocols p WHERE c.return_protocol_id=p.id AND p.rental_inquiry_id=_inquiry_id AND c.billed=false;
UPDATE public.b2b_protocol_damages d SET billed=true FROM public.b2b_return_protocols p WHERE d.return_protocol_id=p.id AND p.rental_inquiry_id=_inquiry_id AND d.billed=false;
INSERT INTO public.rental_inquiry_events(rental_inquiry_id,event,user_id,details) VALUES(_inquiry_id,'deposit_settled',_uid,jsonb_build_object('paid',_paid,'rent',_rent,'deposit_held',_held,'rental_credit',_credit,'deductions_gross',_gross,'balance',_bal,'payout_method',_row.payout_method,'invoice_id',_invoice_id,'by',_name));
RETURN _row;
END $$;
REVOKE ALL ON FUNCTION public.settle_deposit(uuid,jsonb,text,numeric,uuid,date,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.settle_deposit(uuid,jsonb,text,numeric,uuid,date,text) TO authenticated;