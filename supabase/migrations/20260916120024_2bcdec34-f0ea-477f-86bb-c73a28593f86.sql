ALTER FUNCTION public.record_inquiry_invoice_payment(uuid, numeric, date, text, text) SECURITY INVOKER;
REVOKE ALL ON FUNCTION public.record_inquiry_invoice_payment(uuid, numeric, date, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_inquiry_invoice_payment(uuid, numeric, date, text, text) TO authenticated, service_role;