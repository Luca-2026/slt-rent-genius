
-- =====================================================
-- PHASE 1: B2B Portal Database Schema
-- =====================================================

-- 1. Product Categories
CREATE TABLE public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  icon_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Anyone can view product categories"
  ON public.product_categories FOR SELECT
  USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage product categories"
  ON public.product_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES public.product_categories(id) ON DELETE SET NULL,
  daily_price numeric NOT NULL DEFAULT 0,
  weekly_price numeric,
  monthly_price numeric,
  deposit numeric DEFAULT 0,
  weight_class text,
  images text[] DEFAULT '{}',
  specifications jsonb DEFAULT '{}',
  available_locations text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Everyone can view active products
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

-- Admins can view all products (including inactive)
CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage products
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Extend b2b_profiles with new columns
ALTER TABLE public.b2b_profiles
  ADD COLUMN IF NOT EXISTS billing_email text,
  ADD COLUMN IF NOT EXISTS credit_limit numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS used_credit numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS assigned_location text,
  ADD COLUMN IF NOT EXISTS assigned_contact_override jsonb;

-- 4. B2B Category Discounts (per-customer pricing)
CREATE TABLE public.b2b_category_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  b2b_profile_id uuid NOT NULL REFERENCES public.b2b_profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
  discount_percent numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(b2b_profile_id, category_id)
);

ALTER TABLE public.b2b_category_discounts ENABLE ROW LEVEL SECURITY;

-- Users can view their own discounts
CREATE POLICY "Users can view their own discounts"
  ON public.b2b_category_discounts FOR SELECT
  USING (
    b2b_profile_id IN (
      SELECT id FROM public.b2b_profiles WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all discounts
CREATE POLICY "Admins can manage discounts"
  ON public.b2b_category_discounts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. B2B Reservations
CREATE TABLE public.b2b_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  b2b_profile_id uuid NOT NULL REFERENCES public.b2b_profiles(id),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id),
  location text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  quantity integer NOT NULL DEFAULT 1,
  original_price numeric,
  discounted_price numeric,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.b2b_reservations ENABLE ROW LEVEL SECURITY;

-- Users can view their own reservations
CREATE POLICY "Users can view their own reservations"
  ON public.b2b_reservations FOR SELECT
  USING (user_id = auth.uid());

-- Approved B2B users can create reservations
CREATE POLICY "Approved B2B users can create reservations"
  ON public.b2b_reservations FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.is_approved_b2b(auth.uid()));

-- Users can update their own pending reservations
CREATE POLICY "Users can update their own reservations"
  ON public.b2b_reservations FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can manage all reservations
CREATE POLICY "Admins can manage reservations"
  ON public.b2b_reservations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. B2B Invoices
CREATE TABLE public.b2b_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  b2b_profile_id uuid NOT NULL REFERENCES public.b2b_profiles(id),
  invoice_number text NOT NULL,
  invoice_date date NOT NULL,
  due_date date,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'open',
  file_url text,
  file_name text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.b2b_invoices ENABLE ROW LEVEL SECURITY;

-- Users can view their own invoices
CREATE POLICY "Users can view their own invoices"
  ON public.b2b_invoices FOR SELECT
  USING (
    b2b_profile_id IN (
      SELECT id FROM public.b2b_profiles WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all invoices
CREATE POLICY "Admins can manage invoices"
  ON public.b2b_invoices FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Newsletter Subscribers
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  gdpr_consent boolean NOT NULL DEFAULT false,
  gdpr_consent_date timestamptz,
  source text DEFAULT 'popup',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Admins can view and manage subscribers
CREATE POLICY "Admins can manage newsletter subscribers"
  ON public.newsletter_subscribers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. Triggers for updated_at
CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON public.product_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_b2b_category_discounts_updated_at
  BEFORE UPDATE ON public.b2b_category_discounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_b2b_reservations_updated_at
  BEFORE UPDATE ON public.b2b_reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_b2b_invoices_updated_at
  BEFORE UPDATE ON public.b2b_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Storage bucket for invoices
INSERT INTO storage.buckets (id, name, public)
VALUES ('b2b-invoices', 'b2b-invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Only authenticated users can view their own invoices
CREATE POLICY "Users can download their own invoices"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'b2b-invoices' 
    AND auth.uid() IS NOT NULL
  );

-- Admins can upload invoices
CREATE POLICY "Admins can upload invoices"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'b2b-invoices'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update invoices"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'b2b-invoices'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete invoices"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'b2b-invoices'
    AND public.has_role(auth.uid(), 'admin')
  );
