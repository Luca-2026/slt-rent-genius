-- PREPARED ONLY. Never apply automatically; independent from reviewed finance 0213.
-- Captures previously public CMS paths atomically with existing article writes.
BEGIN;
CREATE TABLE IF NOT EXISTS public.managed_article_url_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  managed_product_id uuid NOT NULL,
  location text NOT NULL CHECK(location IN ('krefeld','bonn','muelheim')),
  old_slug text NOT NULL,
  old_category text NOT NULL,
  old_path text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(managed_product_id,old_path)
);
GRANT ALL ON public.managed_article_url_history TO service_role;
REVOKE ALL ON public.managed_article_url_history FROM PUBLIC,anon,authenticated;
ALTER TABLE public.managed_article_url_history ENABLE ROW LEVEL SECURITY;
-- No direct customer/staff reads or writes. Definer trigger owns history capture.
CREATE OR REPLACE FUNCTION public.cms_url_segment(_value text) RETURNS text
LANGUAGE plpgsql IMMUTABLE STRICT SET search_path = '' AS $$
DECLARE bytes bytea := pg_catalog.convert_to(_value,'UTF8'); result text := ''; n integer; b integer;
BEGIN
  FOR n IN 0..pg_catalog.octet_length(bytes)-1 LOOP
    b := pg_catalog.get_byte(bytes,n);
    IF (b BETWEEN 65 AND 90) OR (b BETWEEN 97 AND 122) OR (b BETWEEN 48 AND 57) OR b IN (45,95,46,126,33,39,40,41,42)
    THEN result := result || pg_catalog.chr(b);
    ELSE result := result || '%' || pg_catalog.upper(pg_catalog.lpad(pg_catalog.to_hex(b),2,'0')); END IF;
  END LOOP;
  RETURN result;
END $$;
CREATE OR REPLACE FUNCTION public.capture_managed_article_url_history() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE loc text;
BEGIN
  IF OLD.is_published AND (TG_OP='DELETE' OR
    OLD.slug IS DISTINCT FROM NEW.slug OR OLD.category IS DISTINCT FROM NEW.category OR
    OLD.available_locations IS DISTINCT FROM NEW.available_locations OR OLD.is_published IS DISTINCT FROM NEW.is_published) THEN
    FOREACH loc IN ARRAY OLD.available_locations LOOP
      IF loc IN ('krefeld','bonn','muelheim') THEN
        INSERT INTO public.managed_article_url_history(managed_product_id,location,old_slug,old_category,old_path)
        VALUES(OLD.id,loc,OLD.slug,OLD.category,'/mieten/' || loc || '/' || public.cms_url_segment(OLD.category) || '/' || public.cms_url_segment(OLD.slug))
        ON CONFLICT(managed_product_id,old_path) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
  RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.capture_managed_article_url_history() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS capture_managed_article_url_history ON public.b2b_managed_products;
CREATE TRIGGER capture_managed_article_url_history AFTER UPDATE OR DELETE ON public.b2b_managed_products
FOR EACH ROW EXECUTE FUNCTION public.capture_managed_article_url_history();
-- Projection excludes private/deactivated targets, removed locations, current-route reuse,
-- and ambiguously owned history. No history backfill from invented past state.
CREATE OR REPLACE VIEW public.public_product_url_redirects AS
SELECT h.old_path AS id,h.managed_product_id,h.location,h.old_path
FROM public.managed_article_url_history h
JOIN public.b2b_managed_products p ON p.id=h.managed_product_id AND p.is_published AND h.location=ANY(p.available_locations)
WHERE NOT EXISTS (SELECT 1 FROM public.managed_article_url_history conflict WHERE conflict.old_path=h.old_path AND conflict.managed_product_id<>h.managed_product_id)
AND NOT EXISTS (SELECT 1 FROM public.b2b_managed_products current_product WHERE current_product.is_published AND h.location=ANY(current_product.available_locations)
  AND h.old_path='/mieten/' || h.location || '/' || public.cms_url_segment(current_product.category) || '/' || public.cms_url_segment(current_product.slug));
GRANT SELECT ON public.public_product_url_redirects TO anon,authenticated,service_role;
COMMIT;
-- Rollback: disable CMS_URL_HISTORY_ENABLED, then DROP TRIGGER capture_managed_article_url_history
-- ON public.b2b_managed_products. Retain table and all history; do not delete evidence.
-- Re-enable capture only with reviewed release. Older clients/save RPC are unchanged.