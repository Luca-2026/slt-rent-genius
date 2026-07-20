CREATE TABLE public._tmp_seo_load (slug text PRIMARY KEY, meta text, faqs jsonb);
GRANT SELECT, INSERT, UPDATE, DELETE ON public._tmp_seo_load TO authenticated;
GRANT ALL ON public._tmp_seo_load TO service_role;
ALTER TABLE public._tmp_seo_load ENABLE ROW LEVEL SECURITY;