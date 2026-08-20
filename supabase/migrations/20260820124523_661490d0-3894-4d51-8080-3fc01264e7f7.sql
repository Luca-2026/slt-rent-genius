ALTER VIEW public.managed_products_public SET (security_invoker = true);
GRANT SELECT ON public.b2b_managed_products TO anon, authenticated;