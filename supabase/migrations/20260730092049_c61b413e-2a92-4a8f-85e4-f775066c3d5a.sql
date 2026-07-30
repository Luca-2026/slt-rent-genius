ALTER VIEW public.managed_products_public SET (security_invoker = on);
REVOKE INSERT, UPDATE, DELETE ON public.managed_products_public FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.managed_products_public FROM authenticated;
GRANT SELECT ON public.managed_products_public TO anon, authenticated;