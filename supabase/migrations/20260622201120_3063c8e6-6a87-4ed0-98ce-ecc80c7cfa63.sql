DROP POLICY IF EXISTS "Service role can manage cache" ON public.google_reviews_cache;

REVOKE INSERT, UPDATE, DELETE ON public.google_reviews_cache FROM anon, authenticated;
GRANT ALL ON public.google_reviews_cache TO service_role;