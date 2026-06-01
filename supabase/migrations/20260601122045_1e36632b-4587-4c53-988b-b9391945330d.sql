CREATE TABLE public.b2b_admin_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  b2b_profile_id uuid NOT NULL,
  sender_user_id uuid,
  sender_name text,
  subject text NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  email_sent boolean NOT NULL DEFAULT false,
  email_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.b2b_admin_messages TO authenticated;
GRANT ALL ON public.b2b_admin_messages TO service_role;

ALTER TABLE public.b2b_admin_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage admin messages"
  ON public.b2b_admin_messages
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Profile owner can view messages"
  ON public.b2b_admin_messages
  FOR SELECT
  USING (b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid()));

CREATE POLICY "Authorized persons can view messages"
  ON public.b2b_admin_messages
  FOR SELECT
  USING (b2b_profile_id IN (SELECT public.get_authorized_profile_ids(auth.uid())));

CREATE POLICY "Profile owner can mark as read"
  ON public.b2b_admin_messages
  FOR UPDATE
  USING (b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid()))
  WITH CHECK (b2b_profile_id = public.get_b2b_profile_id_for_user(auth.uid()));

CREATE POLICY "Authorized persons can mark as read"
  ON public.b2b_admin_messages
  FOR UPDATE
  USING (b2b_profile_id IN (SELECT public.get_authorized_profile_ids(auth.uid())))
  WITH CHECK (b2b_profile_id IN (SELECT public.get_authorized_profile_ids(auth.uid())));

CREATE INDEX idx_b2b_admin_messages_profile ON public.b2b_admin_messages(b2b_profile_id, created_at DESC);

CREATE TRIGGER update_b2b_admin_messages_updated_at
  BEFORE UPDATE ON public.b2b_admin_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.b2b_admin_messages;
ALTER TABLE public.b2b_admin_messages REPLICA IDENTITY FULL;