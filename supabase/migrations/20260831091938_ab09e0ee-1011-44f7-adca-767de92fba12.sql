ALTER TABLE public.b2b_managed_products DROP CONSTRAINT b2b_managed_products_created_by_fkey,
  ADD CONSTRAINT b2b_managed_products_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.b2b_managed_products DROP CONSTRAINT b2b_managed_products_updated_by_fkey,
  ADD CONSTRAINT b2b_managed_products_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.b2b_profiles DROP CONSTRAINT b2b_profiles_status_changed_by_fkey,
  ADD CONSTRAINT b2b_profiles_status_changed_by_fkey FOREIGN KEY (status_changed_by) REFERENCES auth.users(id) ON DELETE SET NULL;