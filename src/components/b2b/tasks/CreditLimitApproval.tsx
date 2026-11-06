import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { TodoList } from "./types";

export function CreditLimitApproval({ list, onDone }: { list: TodoList; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const decide = async (approve: boolean) => {
    if (!list.credit_profile_id || !list.credit_request_amount || busy) return;
    setBusy(true);
    try {
      if (approve) {
        const { data, error } = await supabase.functions.invoke("grant-credit-limit", { body: { profileId: list.credit_profile_id, amount: Number(list.credit_request_amount), requestId: list.id } });
        if (error || data?.error) throw new Error(data?.error || error?.message);
        toast({ title: "Kreditlimit genehmigt", description: data?.email_sent ? "Der Kunde wurde benachrichtigt." : "Das Limit ist gespeichert; die Kunden-E-Mail konnte nicht gesendet werden." });
      } else {
        const { error } = await supabase.rpc("reject_credit_limit_approval", { _request: list.id });
        if (error) throw error;
        toast({ title: "Kreditlimit abgelehnt", description: "Das bisherige Limit bleibt unverändert." });
      }
      onDone();
    } catch (error) { toast({ title: "Freigabe nicht gespeichert", description: error instanceof Error ? error.message : "Bitte erneut versuchen.", variant: "destructive" }); }
    finally { setBusy(false); }
  };
  return <section className="space-y-3 border-b border-border pb-4">
    <p className="font-semibold">Beantragtes Kreditlimit: {Number(list.credit_request_amount).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</p>
    <p className="text-sm text-muted-foreground">Entscheidung: {list.credit_request_status === "approved" ? "Genehmigt" : list.credit_request_status === "rejected" ? "Abgelehnt" : "Admin-Freigabe offen"}</p>
    {list.credit_request_status === "pending" && <div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={() => decide(true)}>Kreditlimit genehmigen</Button><Button variant="outline" disabled={busy} onClick={() => decide(false)}>Ablehnen</Button></div>}
  </section>;
}