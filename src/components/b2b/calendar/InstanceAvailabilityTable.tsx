import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { deviceAvailability, dayCells, rangesOverlap, toLocalIso } from "@/lib/calendarEntries";
import { getLocationDisplayName } from "@/utils/plzLocationMapping";
import { cn } from "@/lib/utils";

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

const TIMELINE_DAYS = 14;
const WEEKDAY = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const fmtD = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric" });
const fmtDT = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

interface Props {
  rows: InstanceRow[];
  locationFilter: string;
}

/** Ein Gerät: Statuszeile + 14-Tage-Zeitleiste. */
function InstanceCard({ r, now, todayIso }: { r: InstanceRow; now: string; todayIso: string }) {
  const avail = deviceAvailability(r.allocations, now);
  const cells = dayCells(r.allocations, todayIso, TIMELINE_DAYS);
  const outOfService = r.status !== "available" && r.status !== "rented";

  return (
    <div className="rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-mono text-xs text-muted-foreground">{r.internal_inventory_number || r.serial_number || "—"}</span>
        <span className="text-sm">{getLocationDisplayName(r.location) || r.location}</span>
        {outOfService ? (
          <Badge variant="destructive">{STATUS_LABEL[r.status] ?? r.status}</Badge>
        ) : avail.state === "busy" ? (
          <Badge variant="default" className="bg-orange-500 text-white hover:bg-orange-500">
            Belegt bis {fmtD(avail.busyUntil)}
          </Badge>
        ) : avail.state === "free_until" ? (
          <Badge variant="secondary" className="bg-green-100 text-green-900 hover:bg-green-100">
            Frei bis {fmtD(avail.freeUntil)}
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-green-100 text-green-900 hover:bg-green-100">Frei</Badge>
        )}
        {avail.state === "busy" && avail.next && (
          <span className="text-xs text-muted-foreground">danach frei bis {fmtD(avail.next.from_at)}</span>
        )}
      </div>
      {/* 14-Tage-Zeitleiste: grün = frei, orange = belegt */}
      <div className="mt-2 flex gap-0.5" aria-label="Belegung der nächsten 14 Tage">
        {cells.map((busy, i) => {
          const d = new Date(`${toLocalIso(new Date(new Date(`${todayIso}T00:00:00`).getTime() + i * 86400000))}T00:00:00`);
          return (
            <div key={i} className="flex-1">
              <div
                title={`${d.toLocaleDateString("de-DE")}: ${busy ? "belegt" : "frei"}`}
                className={cn(
                  "h-3 rounded-sm",
                  busy ? "bg-orange-400" : "bg-green-200",
                  i === 0 && "ring-1 ring-foreground/40",
                )}
              />
              <div className="mt-0.5 text-center text-[9px] leading-none text-muted-foreground">
                {i % 2 === 0 ? WEEKDAY[d.getDay()] : ""}
              </div>
            </div>
          );
        })}
      </div>
      {/* Nächste Belegung mit Auftrags-Link */}
      {avail.state !== "free" && avail.next && (
        <div className="mt-1 text-xs text-muted-foreground">
          {avail.state === "busy" ? "Nächste Belegung" : "Belegt"}: {fmtDT(avail.next.from_at)} – {fmtDT(avail.next.to_at)}
          {"orderCode" in avail.next && (avail.next as InstanceRow["allocations"][number]).orderCode && (
            <>
              {" · "}
              <Link
                className="font-mono underline"
                to={`/b2b/mietanfragen/${(avail.next as InstanceRow["allocations"][number]).rental_inquiry_id}`}
              >
                #{(avail.next as InstanceRow["allocations"][number]).orderCode}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** Verfügbarkeitsliste aller Einzelgeräte, gruppiert nach Artikel, mit Zeitleiste. */
export function InstanceAvailabilityTable({ rows, locationFilter }: Props) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const now = new Date().toISOString();
  const todayIso = toLocalIso(new Date());
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

  // Nach Artikel gruppieren
  const groups = useMemo(() => {
    const map = new Map<string, InstanceRow[]>();
    for (const r of visible) {
      const list = map.get(r.productName) ?? [];
      list.push(r);
      map.set(r.productName, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [visible]);

  const freeCount = (list: InstanceRow[]) =>
    list.filter((r) => (r.status === "available" || r.status === "rented") && deviceAvailability(r.allocations, now).state !== "busy").length;

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
      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Geräte für diese Auswahl.</p>
      ) : (
        <div className="space-y-5">
          {groups.map(([product, list]) => (
            <section key={product}>
              <div className="mb-2 flex items-baseline gap-2">
                <h3 className="font-semibold">{product}</h3>
                <span className="text-xs text-muted-foreground">
                  {freeCount(list)} von {list.length} jetzt frei
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {list.map((r) => (
                  <InstanceCard key={r.id} r={r} now={now} todayIso={todayIso} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
