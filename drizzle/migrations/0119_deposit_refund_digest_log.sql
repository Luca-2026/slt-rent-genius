CREATE TABLE public.deposit_refund_digest_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  digest_date date NOT NULL UNIQUE,
  refund_count integer NOT NULL DEFAULT 0,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  sent_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.deposit_refund_digest_log TO service_role;
GRANT SELECT ON public.deposit_refund_digest_log TO authenticated;
ALTER TABLE public.deposit_refund_digest_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read refund digest log" ON public.deposit_refund_digest_log FOR SELECT TO authenticated USING (public.is_staff_member(auth.uid()));