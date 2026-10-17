import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { rangesOverlap } from "@/lib/calendarEntries";
import { getLocationDisplayName } from "@/utils/plzLocationMapping";

export interface InstanceRow {
  id: string;
  internal_inventory_number: string | null;
  serial_number: string | null;
  location: string;
  status: string;
  productName: string;
  /** Belegungen des Geräts (ISO-Zeitstempel). */
  allocations: Array<{ from_at: string; to_at: string; rental_inquiry_id: string; orderCode: string | null }>;
}

const STATUS_LABEL: Record<string, string> = {
  available: "Verfügbar",
  rented: "Vermietet",
  maintenance: "Wartung",
  repair: "Reparatur",
  retired: "Ausgemustert",
  lost: "Verloren",
};

const fmtDT = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

interface Props {
  rows: InstanceRow[];
  locationFilter: string;
}

/** Verfügbarkeitsliste aller Einzelgeräte mit aktueller/nächster Belegung. */
export function InstanceAvailabilityTable({ rows, locationFilter }: Props) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const now = new Date().toISOString();
  const rangeActive = !!from && !!to && from <= to;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (locationFilter !== "all" && r.location !== locationFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (q && !`${r.productName} ${r.internal_inventory_number ?? ""} ${r.serial_number ?? ""}`.toLowerCase().includes(q)) return false;
      if (rangeActive) {
        const busy = r.allocations.some((a) => rangesOverlap(a.from_at, a.to_at, `${from}T00:00:00`, `${to}T23:59:59`));
        if (busy) return false; // Zeitraum-Filter zeigt nur freie Geräte
      }
      return true;
    });
  }, [rows, locationFilter, statusFilter, search, rangeActive, from, to]);

  const currentOrNext = (r: InstanceRow) => {
    const upcoming = r.allocations.filter((a) => a.to_at >= now).sort((a, b) => a.from_at.localeCompare(b.from_at));
    return upcoming[0] ?? null;
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Artikel oder Inventarnummer suchen …"
          className="w-full sm:w-64"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {Object.entries(STATUS_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <label htmlFor="cal-from">Frei von</label>
          <Input id="cal-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36" />
          <label htmlFor="cal-to">bis</label>
          <Input id="cal-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36" />
        </div>
      </div>
      {rangeActive && (
        <p className="mb-2 text-sm text-muted-foreground">
          Es werden nur Geräte gezeigt, die im Zeitraum {from} bis {to} komplett frei sind.
        </p>
      )}
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Geräte für diese Auswahl.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="p-2">Gerät</th>
                <th className="p-2">Artikel</th>
                <th className="p-2">Standort</th>
                <th className="p-2">Status</th>
                <th className="p-2">Aktuelle / nächste Belegung</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const next = currentOrNext(r);
                return (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="p-2 font-mono text-xs">{r.internal_inventory_number || r.serial_number || "—"}</td>
                    <td className="p-2">{r.productName}</td>
                    <td className="p-2">{getLocationDisplayName(r.location) || r.location}</td>
                    <td className="p-2">
                      <Badge variant={r.status === "available" ? "secondary" : r.status === "rented" ? "default" : "destructive"}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-xs">
                      {next ? (
                        <span>
                          {fmtDT(next.from_at)} – {fmtDT(next.to_at)}
                          {next.orderCode && (
                            <>
                              {" · "}
                              <Link className="font-mono underline" to={`/b2b/mietanfragen/${next.rental_inquiry_id}`}>#{next.orderCode}</Link>
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">frei</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
