-- 1) Fehlender search_path bei zwei Trigger-Funktionen
ALTER FUNCTION public.enforce_invoice_immutability() SET search_path = public;
ALTER FUNCTION public.enforce_invoice_items_immutability() SET search_path = public;

-- 2) Trigger-Funktionen: kein direkter Aufruf über die API nötig
REVOKE EXECUTE ON FUNCTION public.adjust_credit_on_invoice_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_material_transfer_stock() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_row_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_invoice_due_date() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_inquiry_invoice_immutability() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_inquiry_invoice_items_immutability() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_invoice_immutability() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_invoice_items_immutability() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_invoice_sequence_if_empty() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_offer_sequence_after_delete() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.resolve_damage_on_todo_done() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_inventory_damage() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_customer_feedback() FROM anon, authenticated;

-- 3) Interne Hilfs-/Buchungsfunktionen: nur serverseitig
REVOKE EXECUTE ON FUNCTION public.adjust_product_stock(text, text, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.adjust_product_stock_delta(text, text, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_repair_list(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.slt_normalize_location(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.slt_try_date(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_delivery_note_number() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_invoice_number() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_offer_number() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_return_protocol_number() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_email(uuid) FROM anon;

-- 4) Portalfunktionen: nur für angemeldete Nutzer, nie anonym
REVOKE EXECUTE ON FUNCTION public.check_inventory_availability(text, text, date, date, uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.sign_delivery_note(uuid, text, boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.sign_return_protocol(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.timesheet_locked_through() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_b2b_profile_with_pending(uuid, text, text, text, text, text, text, text, text, text, text, text, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_admin_login() FROM anon;
REVOKE EXECUTE ON FUNCTION public.mark_overdue_invoices() FROM anon;
REVOKE EXECUTE ON FUNCTION public.confirm_b2b_email(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_b2b_profile_locked_fields(uuid) FROM anon;

-- Hinweis: has_role, is_super_admin, is_staff_member, is_approved_b2b,
-- is_authorized_person, get_authorized_profile_ids, get_authorized_person_limit,
-- get_b2b_profile_id_for_user und can_access_todo_list werden in RLS-Policies
-- ausgewertet, die auch für nicht angemeldete Besucher greifen. Ein Entzug der
-- Ausführungsrechte würde öffentliche Seiten mit Fehlern brechen.
