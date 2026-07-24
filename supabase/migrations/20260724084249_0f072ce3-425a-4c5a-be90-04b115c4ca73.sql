
-- 1) Audit log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid,
  actor_email text,
  actor_role text,
  action text NOT NULL, -- login, insert, update, delete, status_change
  entity_type text NOT NULL, -- b2b_managed_products, b2b_profiles, b2b_invoices, b2b_offers, b2b_delivery_notes, auth
  entity_id text,
  entity_label text,
  changes jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_entity ON public.admin_audit_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_actor ON public.admin_audit_log (actor_user_id);

GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- 2) Super admin check (hardcoded emails)
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id
      AND lower(email) IN ('l.sandhoff@slt-rental.de', 'b.noechle@slt-rental.de')
  )
$$;

-- 3) RLS: only super admins can read
DROP POLICY IF EXISTS "Super admins can view audit log" ON public.admin_audit_log;
CREATE POLICY "Super admins can view audit log"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- 4) Helper: get email for a user
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = _user_id LIMIT 1
$$;

-- 5) Log admin login (called from the app after sign-in)
CREATE OR REPLACE FUNCTION public.log_admin_login()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_email text;
  v_is_admin boolean;
  v_is_super boolean;
BEGIN
  IF v_user IS NULL THEN RETURN; END IF;
  v_is_admin := public.has_role(v_user, 'admin');
  v_is_super := public.is_super_admin(v_user);
  IF NOT (v_is_admin OR v_is_super) THEN RETURN; END IF;
  v_email := public.get_user_email(v_user);
  INSERT INTO public.admin_audit_log(actor_user_id, actor_email, actor_role, action, entity_type, entity_label)
  VALUES (v_user, v_email, CASE WHEN v_is_super THEN 'super_admin' ELSE 'admin' END, 'login', 'auth', 'Anmeldung');
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_admin_login() TO authenticated;

-- 6) Generic audit trigger function
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
BEGIN
  -- Actor context
  IF v_user IS NOT NULL THEN
    v_is_admin := public.has_role(v_user, 'admin');
    v_is_super := public.is_super_admin(v_user);
    v_email := public.get_user_email(v_user);
    v_role := CASE WHEN v_is_super THEN 'super_admin' WHEN v_is_admin THEN 'admin' ELSE 'user' END;
  ELSE
    v_role := 'system';
  END IF;

  -- Only log admin/super-admin/system changes for these tables
  IF v_user IS NOT NULL AND NOT (v_is_admin OR v_is_super) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_action := lower(TG_OP);

  IF TG_TABLE_NAME = 'b2b_managed_products' THEN
    v_entity_id := COALESCE((NEW).id::text, (OLD).id::text);
    v_label := COALESCE((NEW).name, (OLD).name);
    v_cols := ARRAY['name','category','status','base_price_per_day','description','seo_title','meta_description','image_url','rentware_code','is_draft'];
  ELSIF TG_TABLE_NAME = 'b2b_profiles' THEN
    v_entity_id := COALESCE((NEW).id::text, (OLD).id::text);
    v_label := COALESCE((NEW).company_name, (OLD).company_name);
    v_cols := ARRAY['status','credit_limit','rejection_reason','assigned_location','vat_id_verified'];
  ELSIF TG_TABLE_NAME = 'b2b_invoices' THEN
    v_entity_id := COALESCE((NEW).id::text, (OLD).id::text);
    v_label := COALESCE((NEW).invoice_number, (OLD).invoice_number, 'Entwurf');
    v_cols := ARRAY['status','gross_amount','invoice_number'];
  ELSIF TG_TABLE_NAME = 'b2b_offers' THEN
    v_entity_id := COALESCE((NEW).id::text, (OLD).id::text);
    v_label := COALESCE((NEW).offer_number, (OLD).offer_number, 'Entwurf');
    v_cols := ARRAY['status','total_gross','offer_number'];
  ELSIF TG_TABLE_NAME = 'b2b_delivery_notes' THEN
    v_entity_id := COALESCE((NEW).id::text, (OLD).id::text);
    v_label := COALESCE((NEW).note_number, (OLD).note_number, 'Entwurf');
    v_cols := ARRAY['status','note_number'];
  ELSE
    v_entity_id := NULL;
    v_cols := ARRAY[]::text[];
  END IF;

  -- Compute changes for UPDATE
  IF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    FOREACH v_col IN ARRAY v_cols LOOP
      IF (v_old->v_col) IS DISTINCT FROM (v_new->v_col) THEN
        v_changes := v_changes || jsonb_build_object(v_col, jsonb_build_object('old', v_old->v_col, 'new', v_new->v_col));
      END IF;
    END LOOP;
    -- Skip noise: nothing meaningful changed
    IF v_changes = '{}'::jsonb THEN
      RETURN NEW;
    END IF;
    -- Mark status_change if only status differs
    IF v_changes ? 'status' AND jsonb_object_keys(v_changes) = 'status' THEN
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

-- 7) Attach triggers
DROP TRIGGER IF EXISTS trg_audit_managed_products ON public.b2b_managed_products;
CREATE TRIGGER trg_audit_managed_products
AFTER INSERT OR UPDATE OR DELETE ON public.b2b_managed_products
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_profiles ON public.b2b_profiles;
CREATE TRIGGER trg_audit_profiles
AFTER UPDATE ON public.b2b_profiles
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_invoices ON public.b2b_invoices;
CREATE TRIGGER trg_audit_invoices
AFTER INSERT OR UPDATE ON public.b2b_invoices
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_offers ON public.b2b_offers;
CREATE TRIGGER trg_audit_offers
AFTER INSERT OR UPDATE ON public.b2b_offers
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

DROP TRIGGER IF EXISTS trg_audit_delivery_notes ON public.b2b_delivery_notes;
CREATE TRIGGER trg_audit_delivery_notes
AFTER INSERT OR UPDATE ON public.b2b_delivery_notes
FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();
