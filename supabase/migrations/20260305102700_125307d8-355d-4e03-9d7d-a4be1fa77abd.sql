
CREATE TABLE public.google_reviews_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id text NOT NULL UNIQUE,
  rating numeric,
  total_reviews integer,
  reviews jsonb DEFAULT '[]'::jsonb,
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.google_reviews_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached reviews" ON public.google_reviews_cache
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage cache" ON public.google_reviews_cache
  FOR ALL USING (true) WITH CHECK (true);
