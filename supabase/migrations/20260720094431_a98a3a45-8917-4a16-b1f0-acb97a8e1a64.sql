CREATE TABLE public._tmp_seo_draft_load (slug text PRIMARY KEY, meta text, faqs jsonb, gen_at timestamptz);
GRANT SELECT, INSERT, UPDATE, DELETE ON public._tmp_seo_draft_load TO authenticated;
GRANT ALL ON public._tmp_seo_draft_load TO service_role;
ALTER TABLE public._tmp_seo_draft_load ENABLE ROW LEVEL SECURITY;