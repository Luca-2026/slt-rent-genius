CREATE OR REPLACE FUNCTION public.crm_find_or_create_from_inquiry(
  _kind text, _company text, _name text, _email text, _phone text,
  _street text, _postal text, _city text, _vat text, _location text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
  v_email text := nullif(lower(btrim(coalesce(_email, ''))), '');
  v_phone text := nullif(regexp_replace(coalesce(_phone, ''), '\D', '', 'g'), '');
  v_name text := nullif(btrim(coalesce(_name, '')), '');
BEGIN
  IF v_email IS NULL AND v_phone IS NULL THEN
    RETURN NULL;
  END IF;
  IF v_email IS NOT NULL THEN
    SELECT id INTO v_id FROM public.crm_customers
    WHERE lower(btrim(email)) = v_email
    ORDER BY (b2b_profile_id IS NOT NULL) DESC, created_at LIMIT 1;
  END IF;
  IF v_id IS NULL AND v_phone IS NOT NULL AND length(v_phone) >= 6 THEN
    SELECT id INTO v_id FROM public.crm_customers
    WHERE regexp_replace(coalesce(phone, ''), '\D', '', 'g') = v_phone
    ORDER BY created_at LIMIT 1;
  END IF;
  IF v_id IS NOT NULL THEN
    RETURN v_id;
  END IF;
  INSERT INTO public.crm_customers (
    customer_kind, company_name, first_name, last_name, email, phone,
    street, postal_code, city, vat_id, location, notes
  ) VALUES (
    CASE WHEN _kind IN ('business', 'b2b') THEN 'b2b' ELSE 'b2c' END,
    nullif(btrim(coalesce(_company, '')), ''),
    CASE WHEN v_name IS NULL THEN NULL WHEN position(' ' in v_name) = 0 THEN v_name ELSE split_part(v_name, ' ', 1) END,
    CASE WHEN v_name IS NULL OR position(' ' in v_name) = 0 THEN NULL ELSE btrim(substr(v_name, position(' ' in v_name) + 1)) END,
    nullif(btrim(coalesce(_email, '')), ''),
    nullif(btrim(coalesce(_phone, '')), ''),
    nullif(btrim(coalesce(_street, '')), ''),
    nullif(btrim(coalesce(_postal, '')), ''),
    nullif(btrim(coalesce(_city, '')), ''),
    nullif(btrim(coalesce(_vat, '')), ''),
    _location,
    'Automatisch aus Mietanfrage angelegt'
  ) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.crm_find_or_create_from_inquiry(text,text,text,text,text,text,text,text,text,text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.link_rental_inquiry_to_crm()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.crm_customer_id IS NULL AND coalesce(NEW.source, '') <> 'qa_test' THEN
    NEW.crm_customer_id := public.crm_find_or_create_from_inquiry(
      NEW.customer_kind, NEW.company_name, NEW.customer_name, NEW.customer_email, NEW.customer_phone,
      NEW.customer_street, NEW.customer_postal_code, NEW.customer_city, NEW.vat_id, NEW.location);
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.link_rental_inquiry_to_crm() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_link_rental_inquiry_to_crm ON public.rental_inquiries;
CREATE TRIGGER trg_link_rental_inquiry_to_crm
BEFORE INSERT ON public.rental_inquiries
FOR EACH ROW EXECUTE FUNCTION public.link_rental_inquiry_to_crm();

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT * FROM public.rental_inquiries
           WHERE crm_customer_id IS NULL AND coalesce(source, '') <> 'qa_test'
           ORDER BY created_at
  LOOP
    UPDATE public.rental_inquiries
    SET crm_customer_id = public.crm_find_or_create_from_inquiry(
      r.customer_kind, r.company_name, r.customer_name, r.customer_email, r.customer_phone,
      r.customer_street, r.customer_postal_code, r.customer_city, r.vat_id, r.location)
    WHERE id = r.id;
  END LOOP;
END $$;