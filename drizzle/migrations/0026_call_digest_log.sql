CREATE TABLE public.call_digest_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  digest_date date NOT NULL,
  mailbox text NOT NULL,
  call_count integer NOT NULL DEFAULT 0,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (digest_date, mailbox)
);
GRANT ALL ON public.call_digest_log TO service_role;
GRANT SELECT ON public.call_digest_log TO authenticated;
ALTER TABLE public.call_digest_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read digest log" ON public.call_digest_log FOR SELECT TO authenticated USING (public.is_staff_member(auth.uid()));