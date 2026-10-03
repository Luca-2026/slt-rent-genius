import { supabase } from "@/integrations/supabase/client";

/**
 * Ruft eine Edge Function auf. Antwortet sie mit 401 (abgelaufene/ungültige
 * Sitzung), wird die Sitzung einmal erneuert und der Aufruf wiederholt.
 * Gelingt die Erneuerung nicht, kommt eine verständliche Fehlermeldung zurück.
 */
export async function invokeWithAuth<T = any>(name: string, body: unknown) {
  const call = () => supabase.functions.invoke<T>(name, { body: body as any });
  let res = await call();
  const status = (res.error as any)?.context?.status;
  if (res.error && status === 401) {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) {
      return { data: { error: "Deine Anmeldung ist abgelaufen. Bitte melde dich neu an und versuche es noch einmal." } as any, error: res.error };
    }
    res = await call();
  }
  return res;
}
