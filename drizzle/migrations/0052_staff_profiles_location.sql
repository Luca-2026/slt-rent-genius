ALTER TABLE public.staff_profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.staff_profiles ADD CONSTRAINT staff_profiles_location_check CHECK (location IS NULL OR location IN ('krefeld','bonn','muelheim'));
COMMENT ON COLUMN public.staff_profiles.location IS 'Zugeteilter Standort (krefeld, bonn, muelheim); Voreinstellung für Standortfilter im Portal';