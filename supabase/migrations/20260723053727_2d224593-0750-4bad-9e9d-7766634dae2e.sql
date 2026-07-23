
DROP VIEW public.local_category_content_public;

CREATE VIEW public.local_category_content_public
  WITH (security_invoker = true)
  AS
  SELECT location, category, hookline, standort_fakten, faqs
  FROM public.b2b_local_category_content;

GRANT SELECT ON public.local_category_content_public TO anon, authenticated;
