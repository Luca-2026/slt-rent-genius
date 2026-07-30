ALTER VIEW public.managed_products_public SET (security_invoker = off);
GRANT SELECT ON public.managed_products_public TO anon, authenticated;
GRANT ALL ON public.managed_products_public TO service_role;
REVOKE INSERT, UPDATE, DELETE ON public.managed_products_public FROM anon, authenticated;