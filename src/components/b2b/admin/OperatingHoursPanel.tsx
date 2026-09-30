import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FUEL_LEVELS } from "@/components/b2b/protocols/protocolShared";

interface Reading {
  id: string;
  kind: string;
  operating_hours: number | null;
  fuel_level: string | null;
  location: string | null;
  protocol_number: string | null;
  recorded_at: string;
}

const KIND: Record<string, string> = { delivery: "Übergabe", return: "Rückgabe", manual: "Manuell" };
const fuelLabel = (f: string | null) =>
  !f ? "–" : f === "kein_tank" ? "kein Tank" : FUEL_LEVELS.find((x) => x.value === f)?.label ?? f;
const fmtHours = (h: number | null) => (h == null ? "–" : `${h.toLocaleString("de-DE", { maximumFractionDigits: 1 })} h`);

/** Zeigt die aus Übergabe-/Rückgabeprotokollen erfassten Betriebsstunden eines Artikels. */
export function OperatingHoursPanel({ productId }: { productId: string | null | undefined }) {
  const [rows, setRows] = useState<Reading[] | null>(null);

  useEffect(() => {
    if (!productId) { setRows([]); return; }
    supabase
      .from("b2b_operating_hours_readings")
      .select("id,kind,operating_hours,fuel_level,location,protocol_number,recorded_at")
      .eq("managed_product_id", productId)
      .order("recorded_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setRows((data as Reading[]) ?? []));
  }, [productId]);

  if (!productId) return <p className="text-xs text-muted-foreground">Betriebsstunden erscheinen hier, sobald der Artikel gespeichert ist und in Protokollen erfasst wurde.</p>;
  if (rows === null) return <p className="text-xs text-muted-foreground">Lade Betriebsstunden …</p>;

  // Letzter Stand je Standort
  const latest = new Map<string, Reading>();
  for (const r of rows) if (r.operating_hours != null && !latest.has(r.location ?? "–")) latest.set(r.location ?? "–", r);

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">Noch keine Betriebsstunden erfasst. Sie werden automatisch aus Übergabe- und Rückgabeprotokollen übernommen.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {[...latest.entries()].map(([loc, r]) => (
              <div key={loc} className="rounded-md border px-3 py-2">
                <p className="text-[11px] uppercase text-muted-foreground">Aktueller Stand {loc !== "–" ? loc : ""}</p>
                <p className="text-lg font-semibold">{fmtHours(r.operating_hours)}</p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr className="text-left"><th className="py-1 pr-2">Datum</th><th className="pr-2">Vorgang</th><th className="pr-2">Stunden</th><th className="pr-2">Tank</th><th>Protokoll</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-1 pr-2 whitespace-nowrap">{new Date(r.recorded_at).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}</td>
                    <td className="pr-2">{KIND[r.kind] ?? r.kind}</td>
                    <td className="pr-2 font-medium">{fmtHours(r.operating_hours)}</td>
                    <td className="pr-2">{fuelLabel(r.fuel_level)}</td>
                    <td>{r.protocol_number ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
