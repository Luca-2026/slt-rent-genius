REVOKE EXECUTE ON FUNCTION public.generate_inquiry_credit_note_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_inquiry_credit_note_number() TO service_role;