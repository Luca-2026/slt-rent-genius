ALTER TABLE public.offer_payment_links ADD COLUMN IF NOT EXISTS checkout_claim uuid;
ALTER TABLE public.offer_payment_links ADD COLUMN IF NOT EXISTS checkout_claimed_at timestamptz;
CREATE OR REPLACE FUNCTION public.claim_rental_checkout(_link uuid,_version integer,_claim uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE l public.offer_payment_links; r public.rental_inquiries; BEGIN
IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
SELECT * INTO l FROM public.offer_payment_links WHERE id=_link;
SELECT * INTO r FROM public.rental_inquiries WHERE id=l.inquiry_id FOR UPDATE;
SELECT * INTO l FROM public.offer_payment_links WHERE id=_link FOR UPDATE;
IF r.id IS NULL OR l.status<>'active' OR l.offer_number IS DISTINCT FROM r.offer_number OR r.payment_decision_version<>_version OR r.offer_payload->'bank_transfer_discount'->>'selected'='bank' OR l.checkout_claim IS NOT NULL THEN RETURN false; END IF;
UPDATE public.offer_payment_links SET checkout_claim=_claim,checkout_claimed_at=now() WHERE id=_link; RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.claim_rental_checkout(uuid,integer,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_rental_checkout(uuid,integer,uuid) TO service_role;
DO $$ DECLARE def text; BEGIN SELECT pg_get_functiondef('public.select_rental_payment_method(uuid,text,integer,text,jsonb)'::regprocedure) INTO def;
def:=replace(def,'IF EXISTS(SELECT 1 FROM public.offer_payment_links WHERE inquiry_table=''rental_inquiries'' AND inquiry_id=_id AND status=''active'' AND stripe_session_id IS NOT NULL)', 'IF EXISTS(SELECT 1 FROM public.offer_payment_links WHERE inquiry_table=''rental_inquiries'' AND inquiry_id=_id AND status=''active'' AND (stripe_session_id IS NOT NULL OR checkout_claim IS NOT NULL))'); EXECUTE def; END $$;