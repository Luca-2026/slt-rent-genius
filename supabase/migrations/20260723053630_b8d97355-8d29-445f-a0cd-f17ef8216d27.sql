
REVOKE ALL ON public.b2b_local_category_content FROM anon;
GRANT SELECT (location, category, hookline, standort_fakten, faqs) ON public.b2b_local_category_content TO anon;
