CREATE TABLE public.inquiry_doc_drafts (
  draft_key text PRIMARY KEY,
  inquiry_type text NOT NULL,
  inquiry_id uuid NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid NOT NULL DEFAULT auth.uid(),
  updated_by_name text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inquiry_doc_drafts_inquiry_idx ON public.inquiry_doc_drafts (inquiry_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiry_doc_drafts TO authenticated;
GRANT ALL ON public.inquiry_doc_drafts TO service_role;
ALTER TABLE public.inquiry_doc_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage inquiry drafts" ON public.inquiry_doc_drafts
  FOR ALL TO authenticated
  USING (public.is_staff_member(auth.uid()))
  WITH CHECK (public.is_staff_member(auth.uid()) AND updated_by = auth.uid());