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
    IF TG_OP = 'INSERT' THEN
      v_entity_id := NEW.id::text;
      v_label := NEW.name;
    ELSIF TG_OP = 'UPDATE' THEN
      v_entity_id := NEW.id::text;
      v_label := COALESCE(NEW.name, OLD.name);
    ELSE
      v_entity_id := OLD.id::text;
      v_label := OLD.name;
    END IF;
    v_cols := ARRAY['name','category','status','price_per_day','description','seo_title','seo_meta_description','image_url','rentware_code','is_published'];
  ELSIF TG_TABLE_NAME = 'b2b_profiles' THEN
    IF TG_OP = 'INSERT' THEN
      v_entity_id := NEW.id::text;
      v_label := NEW.company_name;
    ELSIF TG_OP = 'UPDATE' THEN
      v_entity_id := NEW.id::text;
      v_label := COALESCE(NEW.company_name, OLD.company_name);
    ELSE
      v_entity_id := OLD.id::text;
      v_label := OLD.company_name;
    END IF;
    v_cols := ARRAY['status','credit_limit','rejection_reason','assigned_location','vat_id_verified'];
  ELSIF TG_TABLE_NAME = 'b2b_invoices' THEN
    IF TG_OP = 'INSERT' THEN
      v_entity_id := NEW.id::text;
      v_label := COALESCE(NEW.invoice_number, 'Entwurf');
    ELSIF TG_OP = 'UPDATE' THEN
      v_entity_id := NEW.id::text;
      v_label := COALESCE(NEW.invoice_number, OLD.invoice_number, 'Entwurf');
    ELSE
      v_entity_id := OLD.id::text;
      v_label := COALESCE(OLD.invoice_number, 'Entwurf');
    END IF;
    v_cols := ARRAY['status','gross_amount','invoice_number'];
  ELSIF TG_TABLE_NAME = 'b2b_offers' THEN
    IF TG_OP = 'INSERT' THEN
      v_entity_id := NEW.id::text;
      v_label := COALESCE(NEW.offer_number, 'Entwurf');
    ELSIF TG_OP = 'UPDATE' THEN
      v_entity_id := NEW.id::text;
      v_label := COALESCE(NEW.offer_number, OLD.offer_number, 'Entwurf');
    ELSE
      v_entity_id := OLD.id::text;
      v_label := COALESCE(OLD.offer_number, 'Entwurf');
    END IF;
    v_cols := ARRAY['status','total_gross','offer_number'];
  ELSIF TG_TABLE_NAME = 'b2b_delivery_notes' THEN
    IF TG_OP = 'INSERT' THEN
      v_entity_id := NEW.id::text;
      v_label := COALESCE(NEW.note_number, 'Entwurf');
    ELSIF TG_OP = 'UPDATE' THEN
      v_entity_id := NEW.id::text;
      v_label := COALESCE(NEW.note_number, OLD.note_number, 'Entwurf');
    ELSE
      v_entity_id := OLD.id::text;
      v_label := COALESCE(OLD.note_number, 'Entwurf');
    END IF;
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