DO $$
DECLARE existing_view text;
BEGIN
  SELECT pg_get_viewdef('public.managed_products_public'::regclass, true) INTO existing_view;
  EXECUTE 'CREATE OR REPLACE VIEW public.managed_products_public AS SELECT existing.*, p.prices_same_all_locations FROM (' || rtrim(existing_view, E';\n ') || ') existing JOIN public.b2b_managed_products p ON p.id = existing.id';
END $$;