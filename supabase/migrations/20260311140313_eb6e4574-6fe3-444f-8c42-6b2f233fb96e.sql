-- Function for customers to sign delivery notes
CREATE OR REPLACE FUNCTION public.sign_delivery_note(
  _note_id uuid,
  _signature_data text,
  _agb_accepted boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM b2b_delivery_notes dn
    JOIN b2b_profiles bp ON bp.id = dn.b2b_profile_id
    WHERE dn.id = _note_id
      AND bp.user_id = auth.uid()
      AND dn.status = 'pending_customer_signature'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM b2b_delivery_notes dn
      WHERE dn.id = _note_id
        AND dn.b2b_profile_id IN (SELECT get_authorized_profile_ids(auth.uid()))
        AND dn.status = 'pending_customer_signature'
    ) THEN
      RAISE EXCEPTION 'Not authorized or protocol not pending signature';
    END IF;
  END IF;

  UPDATE b2b_delivery_notes
  SET 
    signature_data = _signature_data,
    signed_at = now(),
    status = 'signed',
    agb_accepted = _agb_accepted,
    agb_accepted_at = CASE WHEN _agb_accepted THEN now() ELSE NULL END,
    updated_at = now()
  WHERE id = _note_id
    AND status = 'pending_customer_signature';
END;
$$;

-- Function for customers to sign return protocols
CREATE OR REPLACE FUNCTION public.sign_return_protocol(
  _protocol_id uuid,
  _signature_data text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM b2b_return_protocols rp
    JOIN b2b_profiles bp ON bp.id = rp.b2b_profile_id
    WHERE rp.id = _protocol_id
      AND bp.user_id = auth.uid()
      AND rp.status = 'pending_customer_signature'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM b2b_return_protocols rp
      WHERE rp.id = _protocol_id
        AND rp.b2b_profile_id IN (SELECT get_authorized_profile_ids(auth.uid()))
        AND rp.status = 'pending_customer_signature'
    ) THEN
      RAISE EXCEPTION 'Not authorized or protocol not pending signature';
    END IF;
  END IF;

  UPDATE b2b_return_protocols
  SET 
    customer_signature_data = _signature_data,
    signed_at = now(),
    status = 'signed',
    updated_at = now()
  WHERE id = _protocol_id
    AND status = 'pending_customer_signature';
END;
$$;