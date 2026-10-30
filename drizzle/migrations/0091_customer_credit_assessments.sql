CREATE FUNCTION public.can_manage_credit_checks(_actor uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.has_role(_actor,'admin') OR (public.has_role(_actor,'niederlassungsleiter') AND EXISTS (SELECT 1 FROM public.staff_profiles s WHERE s.user_id=_actor AND s.is_active)) $$;
REVOKE ALL ON FUNCTION public.can_manage_credit_checks(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_credit_checks(uuid) TO authenticated,service_role;
CREATE TABLE public.customer_credit_assessments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 crm_customer_id uuid REFERENCES public.crm_customers(id) ON DELETE RESTRICT,
 company_name text NOT NULL CHECK (char_length(btrim(company_name)) BETWEEN 1 AND 255),
 registration_number text CHECK (char_length(registration_number)<=100),
 postal_code text CHECK (char_length(postal_code)<=20),
 city text CHECK (char_length(city)<=255),
 source text NOT NULL DEFAULT 'manual_creditsafe' CHECK (source IN ('manual_creditsafe','creditsafe_api')),
 rating text CHECK (char_length(rating)<=100),
 recommended_limit numeric(14,2) CHECK (recommended_limit>=0),
 currency text NOT NULL DEFAULT 'EUR' CHECK (currency='EUR'),
 checked_at timestamptz NOT NULL,
 report_reference text CHECK (char_length(report_reference)<=255),
 notes text CHECK (char_length(notes)<=4000),
 created_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid NOT NULL DEFAULT auth.uid(),
 CHECK (rating IS NOT NULL OR recommended_limit IS NOT NULL)
);
GRANT SELECT,INSERT ON public.customer_credit_assessments TO authenticated;
GRANT ALL ON public.customer_credit_assessments TO service_role;
ALTER TABLE public.customer_credit_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY credit_assessments_read ON public.customer_credit_assessments FOR SELECT TO authenticated USING (public.can_manage_credit_checks(auth.uid()));
CREATE POLICY credit_assessments_manual_insert ON public.customer_credit_assessments FOR INSERT TO authenticated WITH CHECK (public.can_manage_credit_checks(auth.uid()) AND created_by=auth.uid() AND source='manual_creditsafe' AND (crm_customer_id IS NULL OR EXISTS(SELECT 1 FROM public.crm_customers c WHERE c.id=crm_customer_id AND c.customer_kind IN ('business','b2b'))));
CREATE INDEX customer_credit_assessments_customer_date ON public.customer_credit_assessments(crm_customer_id,checked_at DESC,created_at DESC);
CREATE FUNCTION public.guard_credit_assessment() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN IF NEW.checked_at > now() + interval '5 minutes' THEN RAISE EXCEPTION 'Prüfzeitpunkt darf nicht in der Zukunft liegen'; END IF; IF NEW.rating IS NOT NULL AND btrim(NEW.rating)='' THEN RAISE EXCEPTION 'Rating darf nicht leer sein'; END IF; RETURN NEW; END $$;
CREATE TRIGGER guard_credit_assessment BEFORE INSERT OR UPDATE ON public.customer_credit_assessments FOR EACH ROW EXECUTE FUNCTION public.guard_credit_assessment();
COMMENT ON TABLE public.customer_credit_assessments IS 'Append-only credit assessment history; recommendations never grant credit or change payment eligibility. Manual nonportal checks only via explicit authorized entry.';