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
  // Fehlerantworten (z. B. 409) lesbar machen statt nur „non-2xx“ – die Oberfläche zeigt data.error an.
  if (res.error && !res.data) {
    let message: string | undefined;
    try {
      const body = await (res.error as any)?.context?.clone?.().json?.();
      if (body && typeof body.error === "string") message = body.error;
    } catch { /* kein JSON */ }
    if (message && /rk_(live|test)_|sk_(live|test)_|charge_write/.test(message)) {
      message = "Der Stripe-Schlüssel hat nicht die nötige Berechtigung. Es wurde nichts ausgeführt.";
    }
    return { data: { error: message ?? "Die Aktion konnte nicht ausgeführt werden. Bitte erneut versuchen." } as any, error: res.error };
  }
  return res;
}
