import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { BANK_DISCOUNT_TERMS } from "@/lib/bankTransferDiscount";

export function SignPaymentOptions({ paymentUrl, selected, onChanged }: { paymentUrl: string | null; selected: "bank" | "regular"; onChanged: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const select = async (method: string) => {
    if (!paymentUrl || (method !== "bank" && method !== "regular")) return;
    const token = paymentUrl.split("/zahlung/")[1];
    if (!token || !/^[A-Za-z0-9_-]{20,64}$/.test(token)) { setError("Zahlungslink nicht verfügbar."); return; }
    setBusy(true); setError("");
    try {
      const { data, error } = await supabase.functions.invoke("offer-pay", { body: { action: "select_method", token, method } });
      if (error || data?.error) {
        let message = data?.error;
        try { message ??= (await error?.context?.json())?.error; } catch { /* safe fallback */ }
        throw new Error(message ?? "Zahlungsart konnte nicht geändert werden.");
      }
      await onChanged();
    } catch (error) { setError(error instanceof Error ? error.message : "Zahlungsart konnte nicht geändert werden."); }
    finally { setBusy(false); }
  };
  return <section className="space-y-3 border-t border-border pt-3" aria-label="Zahlungsart">
    <h4 className="font-semibold">Zahlungsart</h4>
    <RadioGroup value={selected} disabled={busy || !paymentUrl} onValueChange={value => void select(value)}>
      <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="bank" />Überweisung · 3 % Rabatt</label>
      <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="regular" />Online-Zahlung · regulärer Preis</label>
    </RadioGroup>
    <p className="text-sm text-muted-foreground">{BANK_DISCOUNT_TERMS}</p>
    {busy && <Loader2 className="h-4 w-4 animate-spin" aria-label="Zahlungsart wird gespeichert" />}
    {selected === "regular" && paymentUrl && <Button asChild className="w-full"><a href={paymentUrl} target="_blank" rel="noopener noreferrer"><CreditCard className="h-4 w-4" />Online bezahlen</a></Button>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
  </section>;
}