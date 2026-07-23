-- Einmaliger, protokollierter Cleanup Phase-3-Testdaten (letzter Reset vor Go-Live)
BEGIN;
SET LOCAL session_replication_role = 'replica';  -- umgeht GoBD-Immutability-Trigger nur fuer diesen Cleanup

DELETE FROM public.b2b_invoice_items WHERE invoice_id = '7f75c1c7-2cff-448e-ad1d-1e79eea2dc2b';
DELETE FROM public.b2b_invoices      WHERE id         = '7f75c1c7-2cff-448e-ad1d-1e79eea2dc2b';

-- Sequenz auf letzten realen Stand (0003) zuruecksetzen, naechste Nummer wird 0004
ALTER SEQUENCE public.b2b_rental_invoice_number_seq RESTART WITH 4;

RESET session_replication_role;
COMMIT;