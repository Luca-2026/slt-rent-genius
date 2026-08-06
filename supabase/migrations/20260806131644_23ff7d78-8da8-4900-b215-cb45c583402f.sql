ALTER VIEW public.managed_products_public SET (security_invoker = off);
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.managed_products_public FROM anon, authenticated;
GRANT SELECT ON public.managed_products_public TO anon, authenticated;