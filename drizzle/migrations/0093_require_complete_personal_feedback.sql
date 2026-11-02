CREATE OR REPLACE FUNCTION public.guard_personal_feedback_completion() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE k text;
BEGIN
 IF NEW.source = 'invoice_personal' THEN
  FOREACH k IN ARRAY ARRAY['q1_buchung','q2_beratung','q3_preis','q4_abholung','q5_zustand','q6_einweisung','q7_miete','q8_support','q9_ruecknahme','q10_rechnung'] LOOP
   IF jsonb_typeof(NEW.ratings -> k) IS DISTINCT FROM 'number' OR (NEW.ratings ->> k) !~ '^[1-5]$' THEN
    RAISE EXCEPTION 'Bitte bewerte alle zehn Fragen. Freitext ist optional.';
   END IF;
  END LOOP;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER personal_feedback_completion BEFORE INSERT ON public.customer_feedback FOR EACH ROW EXECUTE FUNCTION public.guard_personal_feedback_completion();