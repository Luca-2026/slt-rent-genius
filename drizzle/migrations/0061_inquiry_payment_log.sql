CREATE TABLE public.inquiry_payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_table text NOT NULL CHECK (inquiry_table IN ('rental_inquiries','sales_inquiries')),
  inquiry_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('added','removed')),
  amount numeric NOT NULL,
  payment_date text,
  method text,
  reference text,
  actor_user_id uuid,
  actor_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inquiry_payment_events_inquiry_idx ON public.inquiry_payment_events (inquiry_id, created_at);
GRANT SELECT ON public.inquiry_payment_events TO authenticated;
GRANT ALL ON public.inquiry_payment_events TO service_role;
ALTER TABLE public.inquiry_payment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read payment log" ON public.inquiry_payment_events
  FOR SELECT TO authenticated USING (public.is_staff_member(auth.uid()));

CREATE OR REPLACE FUNCTION public.stamp_inquiry_payments()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
  v_email text;
  v_old jsonb := COALESCE(CASE WHEN TG_OP = 'UPDATE' THEN OLD.payments END, '[]'::jsonb);
  v_new jsonb := COALESCE(NEW.payments, '[]'::jsonb);
  v_out jsonb := '[]'::jsonb;
  e jsonb;
BEGIN
  IF jsonb_typeof(v_new) <> 'array' THEN RETURN NEW; END IF;
  IF jsonb_typeof(v_old) <> 'array' THEN v_old := '[]'::jsonb; END IF;
  IF v_new = v_old THEN RETURN NEW; END IF;
  v_email := CASE WHEN v_user IS NULL THEN NULL ELSE public.get_user_email(v_user) END;

  FOR e IN SELECT * FROM jsonb_array_elements(v_new) LOOP
    -- Stempel nur behalten, wenn der Eintrag unverändert schon existierte (nicht fälschbar)
    IF NOT (e ? 'recorded_at' AND v_old @> jsonb_build_array(e)) THEN
      e := (e - 'recorded_at' - 'recorded_by' - 'recorded_by_id')
        || jsonb_build_object('recorded_at', now(), 'recorded_by',
             COALESCE(v_email, CASE WHEN COALESCE(e->>'provider','') = 'stripe' OR COALESCE(e->>'reference','') ~ '^(cs_|pi_)' THEN 'System (Stripe)' ELSE 'System' END),
             'recorded_by_id', v_user);
    END IF;
    v_out := v_out || jsonb_build_array(e);
  END LOOP;
  NEW.payments := v_out;

  INSERT INTO public.inquiry_payment_events (inquiry_table, inquiry_id, action, amount, payment_date, method, reference, actor_user_id, actor_email)
  SELECT TG_TABLE_NAME, NEW.id, 'added', COALESCE((x->>'amount')::numeric,0), x->>'date', x->>'label', x->>'reference', v_user, x->>'recorded_by'
  FROM jsonb_array_elements(v_out) x WHERE NOT (v_old @> jsonb_build_array(x));

  INSERT INTO public.inquiry_payment_events (inquiry_table, inquiry_id, action, amount, payment_date, method, reference, actor_user_id, actor_email)
  SELECT TG_TABLE_NAME, NEW.id, 'removed', COALESCE((x->>'amount')::numeric,0), x->>'date', x->>'label', x->>'reference', v_user,
         COALESCE(v_email, 'System')
  FROM jsonb_array_elements(v_old) x WHERE NOT (v_out @> jsonb_build_array(x));

  RETURN NEW;
END $$;

CREATE TRIGGER trg_stamp_payments_rental BEFORE INSERT OR UPDATE OF payments ON public.rental_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.stamp_inquiry_payments();
CREATE TRIGGER trg_stamp_payments_sales BEFORE INSERT OR UPDATE OF payments ON public.sales_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.stamp_inquiry_payments();