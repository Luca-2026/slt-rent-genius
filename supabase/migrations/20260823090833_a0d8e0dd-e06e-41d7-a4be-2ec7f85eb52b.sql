ALTER TABLE public.rental_inquiries
  ADD COLUMN IF NOT EXISTS b2b_profile_id uuid REFERENCES public.b2b_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS b2b_reservation_id uuid,
  ADD COLUMN IF NOT EXISTS rental_group_id text;

CREATE INDEX IF NOT EXISTS idx_rental_inquiries_group ON public.rental_inquiries(rental_group_id);

ALTER TABLE public.b2b_reservations
  ADD COLUMN IF NOT EXISTS inquiry_id uuid REFERENCES public.rental_inquiries(id) ON DELETE SET NULL;

ALTER TABLE public.crm_customers
  ADD COLUMN IF NOT EXISTS b2b_profile_id uuid REFERENCES public.b2b_profiles(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_customers_b2b_profile ON public.crm_customers(b2b_profile_id) WHERE b2b_profile_id IS NOT NULL;

-- B2B-Profil -> Kundendaten (CRM) synchronisieren
CREATE OR REPLACE FUNCTION public.sync_b2b_profile_to_crm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_crm_id uuid;
BEGIN
  SELECT id INTO v_crm_id FROM public.crm_customers WHERE b2b_profile_id = NEW.id LIMIT 1;

  IF v_crm_id IS NULL AND NEW.contact_email IS NOT NULL THEN
    SELECT id INTO v_crm_id
    FROM public.crm_customers
    WHERE b2b_profile_id IS NULL
      AND email IS NOT NULL
      AND lower(email) = lower(NEW.contact_email)
    ORDER BY created_at
    LIMIT 1;
  END IF;

  IF v_crm_id IS NULL THEN
    INSERT INTO public.crm_customers (
      customer_kind, company_name, first_name, last_name, email, phone,
      street, postal_code, city, country, vat_id, location, b2b_profile_id
    ) VALUES (
      'business', NEW.company_name, NEW.contact_first_name, NEW.contact_last_name,
      NEW.contact_email, NEW.contact_phone,
      btrim(concat_ws(' ', NEW.street, NEW.house_number)), NEW.postal_code, NEW.city,
      COALESCE(NEW.country, 'DE'), NEW.tax_id, NEW.assigned_location, NEW.id
    );
  ELSE
    UPDATE public.crm_customers SET
      customer_kind = 'business',
      company_name = NEW.company_name,
      first_name = NEW.contact_first_name,
      last_name = NEW.contact_last_name,
      email = COALESCE(NEW.contact_email, email),
      phone = COALESCE(NEW.contact_phone, phone),
      street = COALESCE(NULLIF(btrim(concat_ws(' ', NEW.street, NEW.house_number)), ''), street),
      postal_code = COALESCE(NEW.postal_code, postal_code),
      city = COALESCE(NEW.city, city),
      country = COALESCE(NEW.country, country, 'DE'),
      vat_id = COALESCE(NEW.tax_id, vat_id),
      location = COALESCE(NEW.assigned_location, location),
      b2b_profile_id = NEW.id,
      updated_at = now()
    WHERE id = v_crm_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_b2b_profile_to_crm ON public.b2b_profiles;
CREATE TRIGGER trg_sync_b2b_profile_to_crm
AFTER INSERT OR UPDATE ON public.b2b_profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_b2b_profile_to_crm();

-- B2B-Portalanfrage -> Mietanfrage
CREATE OR REPLACE FUNCTION public.sync_b2b_reservation_to_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile public.b2b_profiles%ROWTYPE;
  v_crm_id uuid;
  v_inquiry_id uuid;
  v_start_time text;
  v_end_time text;
  v_line text;
BEGIN
  IF NEW.status IS DISTINCT FROM 'pending' THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_profile FROM public.b2b_profiles WHERE id = NEW.b2b_profile_id;
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_crm_id FROM public.crm_customers WHERE b2b_profile_id = v_profile.id LIMIT 1;

  v_start_time := NULLIF(NEW.start_time, '');
  v_end_time := NULLIF(NEW.end_time, '');

  IF NEW.rental_group_id IS NOT NULL THEN
    SELECT id INTO v_inquiry_id
    FROM public.rental_inquiries
    WHERE rental_group_id = NEW.rental_group_id
    LIMIT 1;
  END IF;

  IF v_inquiry_id IS NOT NULL THEN
    v_line := format('+ %s× %s (%s%s)', NEW.quantity, COALESCE(NEW.product_name, NEW.product_id),
      NEW.start_date, CASE WHEN NEW.end_date IS NOT NULL THEN ' – ' || NEW.end_date ELSE '' END);
    UPDATE public.rental_inquiries
    SET message = btrim(concat_ws(E'\n', message, v_line)),
        updated_at = now()
    WHERE id = v_inquiry_id;
  ELSE
    INSERT INTO public.rental_inquiries (
      source, location, product_name, product_id, category_slug, quantity,
      start_date, start_time, end_date, end_time,
      customer_kind, company_name, vat_id,
      customer_name, customer_email, customer_phone,
      customer_street, customer_postal_code, customer_city,
      message, status, crm_customer_id, b2b_profile_id, b2b_reservation_id, rental_group_id,
      raw_payload
    ) VALUES (
      'b2b_portal', NEW.location, NEW.product_name, NEW.product_id, NEW.category_slug, NEW.quantity,
      NEW.start_date::text, v_start_time, NEW.end_date::text, v_end_time,
      'business', v_profile.company_name, v_profile.tax_id,
      btrim(concat_ws(' ', v_profile.contact_first_name, v_profile.contact_last_name)),
      v_profile.contact_email, v_profile.contact_phone,
      btrim(concat_ws(' ', v_profile.street, v_profile.house_number)), v_profile.postal_code, v_profile.city,
      NEW.notes, 'new', v_crm_id, v_profile.id, NEW.id, NEW.rental_group_id,
      jsonb_build_object(
        'origin', 'b2b_portal',
        'reservation_id', NEW.id,
        'additional_services', NEW.additional_services,
        'deposit', NEW.deposit
      )
    )
    RETURNING id INTO v_inquiry_id;
  END IF;

  UPDATE public.b2b_reservations SET inquiry_id = v_inquiry_id WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_b2b_reservation_to_inquiry ON public.b2b_reservations;
CREATE TRIGGER trg_sync_b2b_reservation_to_inquiry
AFTER INSERT ON public.b2b_reservations
FOR EACH ROW EXECUTE FUNCTION public.sync_b2b_reservation_to_inquiry();