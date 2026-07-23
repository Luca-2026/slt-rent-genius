
CREATE TABLE public.b2b_local_category_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL CHECK (location IN ('krefeld','bonn','muelheim')),
  category text NOT NULL,
  hookline text,
  standort_fakten text,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (location, category)
);

GRANT SELECT (location, category, hookline, standort_fakten, faqs) ON public.b2b_local_category_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.b2b_local_category_content TO authenticated;
GRANT ALL ON public.b2b_local_category_content TO service_role;

ALTER TABLE public.b2b_local_category_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published readable by all"
  ON public.b2b_local_category_content
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins select all local category content"
  ON public.b2b_local_category_content
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert local category content"
  ON public.b2b_local_category_content
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update local category content"
  ON public.b2b_local_category_content
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete local category content"
  ON public.b2b_local_category_content
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_b2b_local_category_content_updated_at
  BEFORE UPDATE ON public.b2b_local_category_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE VIEW public.local_category_content_public
  WITH (security_invoker = true)
  AS
  SELECT location, category, hookline, standort_fakten, faqs
  FROM public.b2b_local_category_content
  WHERE is_published = true;

GRANT SELECT ON public.local_category_content_public TO anon, authenticated;
