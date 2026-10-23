ALTER TABLE public.b2b_delivery_notes ADD COLUMN IF NOT EXISTS customer_signed_at timestamptz;
CREATE TABLE public.delivery_signature_links (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), delivery_note_id uuid NOT NULL REFERENCES public.b2b_delivery_notes(id), token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), used_at timestamptz
);
GRANT ALL ON public.delivery_signature_links TO service_role;
ALTER TABLE public.delivery_signature_links ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.complete_delivery_signature(_token_hash text, _signature text, _signer text, _file_url text, _pdf_path text, _signed_at timestamptz) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE l public.delivery_signature_links; d public.b2b_delivery_notes;
BEGIN
 SELECT * INTO l FROM public.delivery_signature_links WHERE token_hash=_token_hash FOR UPDATE;
 IF NOT FOUND OR l.used_at IS NOT NULL OR l.expires_at<=now() THEN RAISE EXCEPTION 'Unterschriftslink ungültig oder bereits verwendet'; END IF;
 SELECT * INTO d FROM public.b2b_delivery_notes WHERE id=l.delivery_note_id FOR UPDATE;
 IF d.signature_data IS NOT NULL OR d.status NOT IN ('signed_staff_only','pending_customer_signature') THEN RAISE EXCEPTION 'Protokoll bereits unterschrieben'; END IF;
 IF _signature NOT LIKE 'data:image/png;base64,%' OR length(_signature)>600000 OR length(trim(_signer))<2 THEN RAISE EXCEPTION 'Unterschrift und Name fehlen'; END IF;
 UPDATE public.b2b_delivery_notes SET signature_data=_signature, customer_signed_at=_signed_at, signed_at=_signed_at, status='signed', agb_accepted=true, agb_accepted_at=_signed_at, file_url=_file_url,
 protocol_data=coalesce(protocol_data,'{}'::jsonb)||jsonb_build_object('customer_signer_name',trim(_signer),'customer_signed_at',_signed_at,'items_confirmed',true,'pdf_path',_pdf_path), updated_at=now() WHERE id=d.id;
 UPDATE public.delivery_signature_links SET used_at=_signed_at WHERE delivery_note_id=d.id AND used_at IS NULL;
 RETURN d.id;
END $$;
REVOKE ALL ON FUNCTION public.complete_delivery_signature(text,text,text,text,text,timestamptz) FROM public,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.complete_delivery_signature(text,text,text,text,text,timestamptz) TO service_role;