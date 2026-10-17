import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { acceptanceChannelLabel } from "@/lib/onsiteSign";

type Acceptance = { offer_number: string; accepted_at: string; signer_name: string | null; signature_data: string | null; gross_amount: number; accepted_channel: string | null };

/** Zeigt im Portal, dass der Kunde ein Angebot unterschrieben und angenommen hat (online oder vor Ort). */
export function OfferAcceptanceNotice({ inquiryId }: { inquiryId: string }) {
  const [rows, setRows] = useState<Acceptance[]>([]);
  useEffect(() => {
    let active = true;
    supabase
      .from("offer_acceptance_links")
      .select("offer_number, accepted_at, signer_name, signature_data, gross_amount, accepted_channel")
      .eq("inquiry_id", inquiryId)
      .eq("status", "accepted")
      .order("accepted_at", { ascending: false })
      .then(({ data }) => { if (active) setRows((data ?? []) as Acceptance[]); });
    return () => { active = false; };
  }, [inquiryId]);
  if (!rows.length) return null;
  const a = rows[0];
  return (
    <div className="rounded-lg border-2 border-primary bg-primary/5 p-3 space-y-2">
      <p className="font-semibold text-foreground flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> Angebot {a.offer_number} {acceptanceChannelLabel(a.accepted_channel)}
      </p>
      <p className="text-sm text-muted-foreground break-words">
        Am {new Date(a.accepted_at).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" })} Uhr
        {a.signer_name ? ` von ${a.signer_name}` : ""} unterschrieben, AGB bestätigt. Nächster Schritt: Auftragsbestätigung senden.
      </p>
      {a.signature_data && (
        <img src={a.signature_data} alt={`Unterschrift ${a.signer_name ?? "Kunde"}`} className="h-16 max-w-full rounded border border-border bg-card object-contain" />
      )}
    </div>
  );
}
