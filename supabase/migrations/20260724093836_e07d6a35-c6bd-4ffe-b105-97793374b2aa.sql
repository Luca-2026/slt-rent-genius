-- Ensure audit table privileges exist for function writes and report reads
GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

-- Ensure the insert policy exists without failing if it already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_audit_log'
      AND policyname = 'System can insert audit rows'
  ) THEN
    CREATE POLICY "System can insert audit rows"
      ON public.admin_audit_log
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Keep super-admin email logic corrected
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = _user_id
      AND lower(email) IN ('l.sandhoff@slt-rental.de', 'b.noechel@slt-rental.de')
  )
$$;

-- Fix status-change detection: jsonb_object_keys cannot be used as a scalar expression
CREATE OR REPLACE FUNCTION public.audit_row_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_email text;
  v_role text;
  v_is_admin boolean;
  v_is_super boolean;
  v_action text;
  v_entity_id text;
  v_label text;
  v_changes jsonb := '{}'::jsonb;
  v_cols text[];
  v_col text;
  v_old jsonb;
  v_new jsonb;
  v_change_count integer;
BEGIN
  IF v_user IS NOT NULL THEN
    v_is_admin := public.has_role(v_user, 'admin');
    v_is_super := public.is_super_admin(v_user);
    v_email := public.get_user_email(v_user);
    v_role := CASE WHEN v_is_super THEN 'super_admin' WHEN v_is_admin THEN 'admin' ELSE 'user' END;
  ELSE
    v_role := 'system';
  END IF;

  IF v_user IS NOT NULL AND NOT (v_is_admin OR v_is_super) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_action := lower(TG_OP);

  IF TG_TABLE_NAME = 'b2b_managed_products' THEN
    v_entity_id := COALESCE(NEW.id::text, OLD.id::text);
    v_label := COALESCE(NEW.name, OLD.name);
    v_cols := ARRAY['name','category','status','base_price_per_day','description','seo_title','meta_description','image_url','rentware_code','is_draft'];
  ELSIF TG_TABLE_NAME = 'b2b_profiles' THEN
    v_entity_id := COALESCE(NEW.id::text, OLD.id::text);
    v_label := COALESCE(NEW.company_name, OLD.company_name);
    v_cols := ARRAY['status','credit_limit','rejection_reason','assigned_location','vat_id_verified'];
  ELSIF TG_TABLE_NAME = 'b2b_invoices' THEN
    v_entity_id := COALESCE(NEW.id::text, OLD.id::text);
    v_label := COALESCE(NEW.invoice_number, OLD.invoice_number, 'Entwurf');
    v_cols := ARRAY['status','gross_amount','invoice_number'];
  ELSIF TG_TABLE_NAME = 'b2b_offers' THEN
    v_entity_id := COALESCE(NEW.id::text, OLD.id::text);
    v_label := COALESCE(NEW.offer_number, OLD.offer_number, 'Entwurf');
    v_cols := ARRAY['status','total_gross','offer_number'];
  ELSIF TG_TABLE_NAME = 'b2b_delivery_notes' THEN
    v_entity_id := COALESCE(NEW.id::text, OLD.id::text);
    v_label := COALESCE(NEW.note_number, OLD.note_number, 'Entwurf');
    v_cols := ARRAY['status','note_number'];
  ELSE
    v_entity_id := NULL;
    v_cols := ARRAY[]::text[];
  END IF;

  IF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);

    FOREACH v_col IN ARRAY v_cols LOOP
      IF (v_old->v_col) IS DISTINCT FROM (v_new->v_col) THEN
        v_changes := v_changes || jsonb_build_object(v_col, jsonb_build_object('old', v_old->v_col, 'new', v_new->v_col));
      END IF;
    END LOOP;

    IF v_changes = '{}'::jsonb THEN
      RETURN NEW;
    END IF;

    SELECT count(*) INTO v_change_count FROM jsonb_object_keys(v_changes);
    IF v_change_count = 1 AND v_changes ? 'status' THEN
      v_action := 'status_change';
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    v_new := to_jsonb(NEW);
    FOREACH v_col IN ARRAY v_cols LOOP
      IF (v_new->v_col) IS NOT NULL THEN
        v_changes := v_changes || jsonb_build_object(v_col, v_new->v_col);
      END IF;
    END LOOP;
  ELSIF TG_OP = 'DELETE' THEN
    v_changes := jsonb_build_object('deleted', to_jsonb(OLD));
  END IF;

  INSERT INTO public.admin_audit_log(actor_user_id, actor_email, actor_role, action, entity_type, entity_id, entity_label, changes)
  VALUES (v_user, v_email, v_role, v_action, TG_TABLE_NAME, v_entity_id, v_label, v_changes);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach exactly one audit trigger per monitored table
DROP TRIGGER IF EXISTS trg_audit_managed_products ON public.b2b_managed_products;
DROP TRIGGER IF EXISTS audit_b2b_managed_products ON public.b2b_managed_products;
CREATE TRIGGER trg_audit_managed_products
AFTER INSERT OR UPDATE OR DELETE ON public.b2b_managed_products
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_profiles ON public.b2b_profiles;
DROP TRIGGER IF EXISTS audit_b2b_profiles ON public.b2b_profiles;
CREATE TRIGGER trg_audit_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.b2b_profiles
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_invoices ON public.b2b_invoices;
DROP TRIGGER IF EXISTS audit_b2b_invoices ON public.b2b_invoices;
CREATE TRIGGER trg_audit_invoices
AFTER INSERT OR UPDATE OR DELETE ON public.b2b_invoices
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_offers ON public.b2b_offers;
DROP TRIGGER IF EXISTS audit_b2b_offers ON public.b2b_offers;
CREATE TRIGGER trg_audit_offers
AFTER INSERT OR UPDATE OR DELETE ON public.b2b_offers
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_delivery_notes ON public.b2b_delivery_notes;
DROP TRIGGER IF EXISTS audit_b2b_delivery_notes ON public.b2b_delivery_notes;
CREATE TRIGGER trg_audit_delivery_notes
AFTER INSERT OR UPDATE OR DELETE ON public.b2b_delivery_notes
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();