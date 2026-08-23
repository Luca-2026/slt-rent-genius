GRANT DELETE ON public.rental_inquiries TO authenticated;
GRANT DELETE ON public.sales_inquiries TO authenticated;

CREATE POLICY "Super admins can delete rental inquiries"
ON public.rental_inquiries FOR DELETE TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete sales inquiries"
ON public.sales_inquiries FOR DELETE TO authenticated
USING (public.is_super_admin(auth.uid()));