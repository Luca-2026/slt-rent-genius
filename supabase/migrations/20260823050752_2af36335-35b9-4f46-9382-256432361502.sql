ALTER TABLE public.rental_inquiries REPLICA IDENTITY FULL;
ALTER TABLE public.sales_inquiries REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rental_inquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales_inquiries;