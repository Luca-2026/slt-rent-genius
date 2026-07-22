REVOKE ALL ON public.b2b_managed_products FROM anon;
GRANT SELECT ON public.managed_products_public TO anon;
GRANT SELECT ON public.managed_products_public TO authenticated;