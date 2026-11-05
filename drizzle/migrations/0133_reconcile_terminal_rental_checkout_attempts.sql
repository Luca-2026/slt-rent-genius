CREATE OR REPLACE FUNCTION public.release_terminal_rental_checkout(_link uuid,_session text,_claim uuid,_terminal text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.offer_payment_links; r public.rental_inquiries;
BEGIN
IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
IF _terminal NOT IN ('expired','booked') THEN RAISE EXCEPTION 'Provider outcome not terminal'; END IF;
SELECT * INTO l FROM public.offer_payment_links WHERE id=_link;
IF NOT FOUND OR l.inquiry_table IS DISTINCT FROM 'rental_inquiries' THEN RAISE EXCEPTION 'Invalid rental link'; END IF;
SELECT * INTO r FROM public.rental_inquiries WHERE id=l.inquiry_id FOR UPDATE;
SELECT * INTO l FROM public.offer_payment_links WHERE id=_link FOR UPDATE;
IF l.stripe_session_id IS DISTINCT FROM _session OR l.checkout_claim IS DISTINCT FROM _claim THEN RETURN false; END IF;
IF _terminal='booked' AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(COALESCE(r.payments,'[]')) p WHERE p->>'reference'=_session AND p->>'provider'='stripe') THEN RAISE EXCEPTION 'Zahlung noch nicht gebucht'; END IF;
UPDATE public.offer_payment_links SET stripe_session_id=NULL,checkout_claim=NULL,checkout_claimed_at=NULL,checkout_request=NULL,updated_at=now() WHERE id=_link;
RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.release_terminal_rental_checkout(uuid,text,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.release_terminal_rental_checkout(uuid,text,uuid,text) TO service_role;