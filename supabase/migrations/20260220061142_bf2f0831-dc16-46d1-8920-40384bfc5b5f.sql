
-- Fix 1: Enforce server-side file restrictions on the bewerbungen bucket
UPDATE storage.buckets
SET
  file_size_limit = 10485760,  -- 10MB in bytes
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
WHERE id = 'bewerbungen';

-- Fix 2: Create a security-definer view for user-facing b2b profile reads
-- This excludes admin-only fields: internal_notes, rejection_reason, status_changed_by, status_changed_at
CREATE OR REPLACE VIEW public.b2b_profiles_customer WITH (security_invoker = true) AS
SELECT
  id,
  user_id,
  company_name,
  legal_form,
  tax_id,
  trade_register_number,
  contact_first_name,
  contact_last_name,
  contact_position,
  contact_phone,
  contact_email,
  billing_email,
  street,
  house_number,
  postal_code,
  city,
  country,
  status,
  credit_limit,
  used_credit,
  payment_due_days,
  assigned_location,
  assigned_contact_override,
  postal_invoice,
  vat_id_verified,
  document_url,
  document_filename,
  deletion_requested_at,
  created_at,
  updated_at
FROM public.b2b_profiles;
