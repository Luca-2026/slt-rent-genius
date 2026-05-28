ALTER TABLE public.b2b_profiles
  ADD COLUMN IF NOT EXISTS sepa_mandate_url text,
  ADD COLUMN IF NOT EXISTS sepa_mandate_filename text;

COMMENT ON COLUMN public.b2b_profiles.sepa_mandate_url IS 'URL des hochgeladenen, unterschriebenen SEPA-Firmenlastschrift-Mandats (b2b-documents Bucket).';
COMMENT ON COLUMN public.b2b_profiles.sepa_mandate_filename IS 'Originaldateiname des SEPA-Mandats für Anzeige/Download.';