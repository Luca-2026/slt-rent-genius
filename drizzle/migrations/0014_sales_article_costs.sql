CREATE TABLE public.sales_article_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_kind text NOT NULL CHECK (article_kind IN ('new','used')),
  article_id uuid NOT NULL,
  purchase_price_net numeric(12,2) CHECK (purchase_price_net IS NULL OR purchase_price_net >= 0),
  overhead_percent numeric(5,2) NOT NULL DEFAULT 10,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (article_kind, article_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_article_costs TO authenticated;
GRANT ALL ON public.sales_article_costs TO service_role;
ALTER TABLE public.sales_article_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read sales costs" ON public.sales_article_costs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_staff_member(auth.uid()));
CREATE POLICY "Admins manage sales costs" ON public.sales_article_costs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_sales_article_costs_updated BEFORE UPDATE ON public.sales_article_costs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
COMMENT ON TABLE public.sales_article_costs IS 'Interne Einkaufspreise für Verkaufsartikel (nicht öffentlich). Mindestpreis = EK netto × (1 + Gemeinkosten %).';