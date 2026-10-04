CREATE TABLE public.public_rate_limits (
  bucket text NOT NULL,
  client_key text NOT NULL,
  window_start timestamptz NOT NULL,
  hits integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, client_key, window_start)
);
GRANT ALL ON public.public_rate_limits TO service_role;
ALTER TABLE public.public_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.hit_rate_limit(_bucket text, _key text, _limit integer, _window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _start timestamptz := to_timestamp(floor(extract(epoch from now()) / _window_seconds) * _window_seconds);
  _hits integer;
BEGIN
  INSERT INTO public.public_rate_limits AS r (bucket, client_key, window_start, hits)
  VALUES (_bucket, left(_key, 200), _start, 1)
  ON CONFLICT (bucket, client_key, window_start) DO UPDATE SET hits = r.hits + 1
  RETURNING hits INTO _hits;
  DELETE FROM public.public_rate_limits WHERE window_start < now() - interval '2 days';
  RETURN _hits <= _limit;
END;
$$;
REVOKE ALL ON FUNCTION public.hit_rate_limit(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hit_rate_limit(text, text, integer, integer) TO service_role;

ALTER TABLE public.customer_feedback ADD COLUMN IF NOT EXISTS staff_notified_at timestamptz;