CREATE TABLE public.offer_series_counters (
  series text NOT NULL CHECK (series IN ('M', 'V')),
  year integer NOT NULL,
  month integer NOT NULL,
  last_value integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (series, year, month)
);
GRANT ALL ON public.offer_series_counters TO service_role;
ALTER TABLE public.offer_series_counters ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.generate_offer_number_for(_series text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_now date := (now() AT TIME ZONE 'Europe/Berlin')::date;
  v_year integer := EXTRACT(YEAR FROM v_now)::integer;
  v_month integer := EXTRACT(MONTH FROM v_now)::integer;
  v_next integer;
BEGIN
  IF _series IS NULL OR _series NOT IN ('M', 'V') THEN
    RAISE EXCEPTION 'Unbekannter Angebotskreis %', _series;
  END IF;
  INSERT INTO public.offer_series_counters (series, year, month, last_value)
  VALUES (_series, v_year, v_month, 1)
  ON CONFLICT (series, year, month)
  DO UPDATE SET last_value = public.offer_series_counters.last_value + 1, updated_at = now()
  RETURNING last_value INTO v_next;
  RETURN 'ANG-' || _series || '-' || v_year::text || '-' || lpad(v_month::text, 2, '0') || '-' || lpad(v_next::text, 4, '0');
END;
$$;
REVOKE ALL ON FUNCTION public.generate_offer_number_for(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_offer_number_for(text) TO service_role;

-- Deployed older portal clients continue in the same rental series during rollout.
CREATE OR REPLACE FUNCTION public.generate_offer_number()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT public.generate_offer_number_for('M'); $$;
REVOKE ALL ON FUNCTION public.generate_offer_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_offer_number() TO service_role;

CREATE OR REPLACE FUNCTION public.generate_inquiry_offer_number()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT public.generate_offer_number_for('M'); $$;
REVOKE ALL ON FUNCTION public.generate_inquiry_offer_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_inquiry_offer_number() TO service_role;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT public.generate_inquiry_invoice_number_for('M'); $$;
REVOKE ALL ON FUNCTION public.generate_invoice_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_invoice_number() TO service_role;