CREATE OR REPLACE FUNCTION public.check_public_rate_limit(_bucket text, _client_key text, _max_hits integer, _window_seconds integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _window timestamptz;
  _hits integer;
BEGIN
  IF _bucket IS NULL OR _client_key IS NULL OR _max_hits < 1 OR _window_seconds < 1 THEN
    RETURN false;
  END IF;
  _window := to_timestamp(floor(extract(epoch FROM now()) / _window_seconds) * _window_seconds);
  INSERT INTO public.public_rate_limits AS r (bucket, client_key, window_start, hits)
  VALUES (_bucket, left(_client_key, 200), _window, 1)
  ON CONFLICT (bucket, client_key, window_start)
  DO UPDATE SET hits = r.hits + 1
  RETURNING r.hits INTO _hits;
  IF random() < 0.01 THEN
    DELETE FROM public.public_rate_limits WHERE window_start < now() - interval '1 day';
  END IF;
  RETURN _hits <= _max_hits;
END;
$$;

REVOKE ALL ON FUNCTION public.check_public_rate_limit(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_public_rate_limit(text, text, integer, integer) TO service_role;
GRANT ALL ON public.public_rate_limits TO service_role;