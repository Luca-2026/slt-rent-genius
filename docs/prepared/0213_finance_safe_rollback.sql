-- Emergency fail-closed rollback ONLY; separate approval required even for this artifact.
-- Keeps financial rows, paid_out_on, evidence, location checks and scoped SELECT policies.
-- Never restore the old unverified manual confirmation or broaden read/execute rights.
CREATE OR REPLACE FUNCTION public.confirm_manual_order_refund(_id uuid,_actor uuid,_reference text,_paid_on date)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN RAISE EXCEPTION 'Manuelle Bestätigung vorübergehend gesperrt; vorhandene Auszahlungsnachweise erhalten' USING ERRCODE='23514'; END $$;
REVOKE ALL ON FUNCTION public.confirm_manual_order_refund(uuid,uuid,text,date) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_manual_order_refund(uuid,uuid,text,date) TO service_role;
CREATE OR REPLACE FUNCTION public.confirm_order_refund_manual(_id uuid,_actor uuid,_reference text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN RAISE EXCEPTION 'Alter Bestätigungsweg gesperrt; vorhandene Auszahlungsnachweise erhalten' USING ERRCODE='23514'; END $$;
REVOKE ALL ON FUNCTION public.confirm_order_refund_manual(uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_order_refund_manual(uuid,uuid,text) TO service_role;