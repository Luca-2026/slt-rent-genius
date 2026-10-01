ALTER TABLE public.phone_calls ADD COLUMN IF NOT EXISTS assistant text;
ALTER TABLE public.phone_calls ADD CONSTRAINT phone_calls_assistant_check CHECK (assistant IS NULL OR assistant IN ('krefeld','bonn'));
CREATE INDEX IF NOT EXISTS phone_calls_assistant_idx ON public.phone_calls(assistant);
COMMENT ON COLUMN public.phone_calls.assistant IS 'Welcher fonio-Assistent: krefeld (Krefeld + Mülheim an der Ruhr) oder bonn; aus ?assistant= der Webhook-Adresse';