REVOKE ALL ON FUNCTION public.generate_inquiry_invoice_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_inquiry_invoice_number() TO service_role;