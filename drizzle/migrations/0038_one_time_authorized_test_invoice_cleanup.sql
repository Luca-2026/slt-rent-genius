CREATE FUNCTION public.cleanup_authorized_test_invoices_20261003()
RETURNS jsonb LANGUAGE plpgsql SET search_path = public
AS $$
DECLARE result jsonb;
BEGIN
  IF current_user <> 'postgres' OR NOT EXISTS (
    SELECT 1 FROM public.admin_audit_log WHERE id = 'f8455dd1-7d7b-4963-b676-068dc668f378' AND action = 'test_invoice_cleanup_authorized'
  ) THEN RAISE EXCEPTION 'Test cleanup is not authorized'; END IF;
  LOCK TABLE public.b2b_invoices, public.inquiry_invoices IN ACCESS EXCLUSIVE MODE;
  IF (SELECT count(*) FROM public.b2b_invoices) <> 11 OR (SELECT count(*) FROM public.inquiry_invoices) <> 7 THEN
    RAISE EXCEPTION 'Invoice inventory changed; cleanup aborted';
  END IF;
  ALTER TABLE public.b2b_invoices DISABLE TRIGGER trg_b2b_invoices_immutability_del;
  ALTER TABLE public.inquiry_invoices DISABLE TRIGGER trg_inquiry_invoices_immutability_del;
  DELETE FROM public.inquiry_invoices WHERE id IN ('0b146ca2-f442-4f0c-996a-c94723e519a0','c5ae5971-7fd7-499c-b363-58a0dad0d227','f5f8a346-f977-4f5b-b6b0-ecbb6b53e5fd');
  DELETE FROM public.inquiry_invoices WHERE id IN ('457fb0c4-bc55-4470-8fb4-5df278280dea','4871ef07-d39d-4def-89fb-3f7b151f7e58','657869fc-539c-4f4a-bf3f-9440c96aa78c','748a0a7f-cd83-47e5-9504-6b58eee983a7');
  DELETE FROM public.b2b_invoices WHERE id IN ('0fccabf3-cc76-46b3-9173-cdcb1e507263','4455a1e3-5241-418a-b9d4-7561c010b2f6','74319956-7753-4980-82db-db46940b016a','b1adc5d1-0ec9-4168-8f07-9b1dd4b8a590','b56927d2-d44c-4920-8d83-42e3c4537299','b803c5da-250a-4f20-aa24-7a7b9f940b7f','e51c701d-caae-4104-aa2e-2e55a1194c06','e609e0fd-d664-4783-92af-fd3c3caa3e00','f1a0d231-88fb-4fd8-ad70-38b4c4806c95','fe972255-56a9-4ea1-92d0-6a8cdc21ec6f','fee64b95-58e1-4673-a2f4-ffa3e1fe5b55');
  ALTER TABLE public.b2b_invoices ENABLE TRIGGER trg_b2b_invoices_immutability_del;
  ALTER TABLE public.inquiry_invoices ENABLE TRIGGER trg_inquiry_invoices_immutability_del;
  RETURN jsonb_build_object('deleted_invoices',15,'deleted_related_credit_notes',3,'completed_at',now());
END;
$$;
REVOKE ALL ON FUNCTION public.cleanup_authorized_test_invoices_20261003() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_authorized_test_invoices_20261003() TO postgres;
COMMENT ON FUNCTION public.cleanup_authorized_test_invoices_20261003() IS 'Single-use, explicitly authorized test cleanup; inaccessible to app roles and removed immediately after execution.';