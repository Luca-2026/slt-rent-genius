ALTER TABLE public.b2b_managed_products REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.b2b_managed_products;