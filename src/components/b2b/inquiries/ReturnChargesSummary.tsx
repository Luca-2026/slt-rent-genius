/** Rückgabekosten aus dem Rücknahmeprotokoll direkt in der Mietanfrage aufsummiert (nur Anzeige). */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { chargeQuantityText } from "@/lib/returnCharges";
import { formatEuro } from "./offerMath";

interface Line { key: string; label: string; detail?: string | null; gross: number; damage: boolean; billed: boolean }

export function ReturnChargesSummary({ inquiryId, reloadKey }: { inquiryId: string; reloadKey?: unknown }) {
  const [lines, setLines] = useState<Line[] | null>(null);
  useEffect(() => {
    let alive = true;
    void (async () => {
      const { data } = await supabase
        .from("b2b_return_protocols")
        .select("id, return_protocol_number, b2b_return_extra_charges(id, label, quantity, unit_price, billed), b2b_protocol_damages(id, description, amount, billed)")
        .eq("rental_inquiry_id", inquiryId);
      const out: Line[] = [];
      for (const p of (data ?? []) as any[]) {
        for (const c of p.b2b_return_extra_charges ?? []) {
          const qty = Number(c.quantity) || 0, up = Number(c.unit_price) || 0;
          const gross = Math.round(qty * up * 100) / 100;
          if (gross > 0) out.push({ key: c.id, label: c.label, detail: chargeQuantityText(c.label, qty, up), gross, damage: false, billed: !!c.billed });
        }
        for (const d of p.b2b_protocol_damages ?? []) {
          const gross = Number(d.amount) || 0;
          if (gross > 0) out.push({ key: d.id, label: d.description || "Schaden", gross, damage: true, billed: !!d.billed });
        }
      }
      if (alive) setLines(out);
    })();
    return () => { alive = false; };
  }, [inquiryId, reloadKey]);

  if (!lines || lines.length === 0) return null;
  const service = lines.filter((l) => !l.damage).reduce((s, l) => s + l.gross, 0);
  const damage = lines.filter((l) => l.damage).reduce((s, l) => s + l.gross, 0);
  const allBilled = lines.every((l) => l.billed);
  return (
    <div className="mb-4 rounded-lg border border-accent/50 bg-accent/5 p-3 text-sm space-y-1.5" data-testid="return-charges-summary">
      <div className="flex items-center justify-between gap-2 font-semibold">
        <span>Rückgabekosten laut Rücknahmeprotokoll</span>
        <span className="text-xs font-normal text-muted-foreground">{allBilled ? "abgerechnet" : "noch offen"}</span>
      </div>
      {lines.map((l) => (
        <div key={l.key} className="flex justify-between gap-3">
          <span className="min-w-0 break-words">
            {l.label}
            {l.detail && <span className="block text-xs text-muted-foreground">{l.detail}</span>}
            <span className="block text-xs text-muted-foreground">{l.damage ? "Schadensersatz – ohne USt" : "Service – 19 % USt"}</span>
          </span>
          <span className="shrink-0 tabular-nums">{formatEuro(l.gross)}</span>
        </div>
      ))}
      <div className="border-t border-border pt-1.5 space-y-0.5">
        {service > 0 && damage > 0 && (
          <>
            <div className="flex justify-between text-xs"><span>Service brutto</span><span className="tabular-nums">{formatEuro(service)}</span></div>
            <div className="flex justify-between text-xs"><span>Schadensersatz</span><span className="tabular-nums">{formatEuro(damage)}</span></div>
          </>
        )}
        <div className="flex justify-between font-semibold"><span>Summe Rückgabekosten (brutto)</span><span className="tabular-nums">{formatEuro(service + damage)}</span></div>
      </div>
    </div>
  );
}
