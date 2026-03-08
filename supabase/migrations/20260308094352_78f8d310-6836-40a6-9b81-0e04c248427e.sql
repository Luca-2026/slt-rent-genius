
CREATE OR REPLACE FUNCTION public.confirm_b2b_email(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow the user themselves to confirm their own email
  IF auth.uid() IS NULL OR auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.b2b_profiles
  SET email_confirmed = true, updated_at = now()
  WHERE user_id = _user_id AND email_confirmed = false;
END;
$$;
