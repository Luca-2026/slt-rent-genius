GRANT INSERT ON public.customer_feedback TO anon;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.customer_feedback TO authenticated;
GRANT ALL ON public.customer_feedback TO service_role;