CREATE TABLE public.customer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  source text,
  location text,
  order_ref text,
  customer_name text,
  customer_email text,
  customer_type text,
  ratings jsonb NOT NULL DEFAULT '{}'::jsonb,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommend_score int,
  avg_rating numeric,
  status text NOT NULL DEFAULT 'new',
  internal_note text
);

GRANT INSERT ON public.customer_feedback TO anon;
GRANT INSERT ON public.customer_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_feedback TO authenticated;
GRANT ALL ON public.customer_feedback TO service_role;

ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
ON public.customer_feedback FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can read feedback"
ON public.customer_feedback FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update feedback"
ON public.customer_feedback FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete feedback"
ON public.customer_feedback FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_customer_feedback_updated_at
BEFORE UPDATE ON public.customer_feedback
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_customer_feedback_created_at ON public.customer_feedback (created_at DESC);