ALTER TABLE public.b2b_managed_products
  ADD COLUMN IF NOT EXISTS seo_draft_meta_description text,
  ADD COLUMN IF NOT EXISTS seo_draft_faqs jsonb,
  ADD COLUMN IF NOT EXISTS seo_draft_generated_at timestamptz;

COMMENT ON COLUMN public.b2b_managed_products.seo_draft_meta_description IS 'KI-generierter Entwurf (Etappe 2 Nacharbeit). Muss manuell reviewed und in seo_meta_description übernommen werden.';
COMMENT ON COLUMN public.b2b_managed_products.seo_draft_faqs IS 'KI-generierter FAQ-Entwurf. Format: [{"q":"...","a":"..."}]. Nicht im Frontend aktiv.';