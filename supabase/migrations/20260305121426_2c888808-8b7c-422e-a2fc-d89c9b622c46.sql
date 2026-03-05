
CREATE OR REPLACE FUNCTION public.update_b2b_profile_with_pending(
  _user_id uuid,
  _company_name text,
  _legal_form text,
  _tax_id text,
  _trade_register_number text,
  _contact_first_name text,
  _contact_last_name text,
  _contact_position text,
  _contact_phone text,
  _billing_email text,
  _street text,
  _house_number text,
  _postal_code text,
  _city text,
  _assigned_location text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller is the owner
  IF auth.uid() IS NULL OR auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.b2b_profiles
  SET
    company_name = _company_name,
    legal_form = _legal_form,
    tax_id = _tax_id,
    trade_register_number = _trade_register_number,
    contact_first_name = _contact_first_name,
    contact_last_name = _contact_last_name,
    contact_position = _contact_position,
    contact_phone = _contact_phone,
    billing_email = _billing_email,
    street = _street,
    house_number = _house_number,
    postal_code = _postal_code,
    city = _city,
    assigned_location = _assigned_location,
    status = 'pending',
    updated_at = now()
  WHERE user_id = _user_id;
END;
$$;
