/**
 * Phase B3 — Global admin search.
 *
 * Lightweight client-side fuzzy search across the data already loaded by
 * AdminDashboard: customers (company / contact / VAT-ID / email),
 * invoices (invoice_number), offers (offer_number), reservations (id prefix).
 *
 * Treffer werden mit unterscheidenden Sekundärinfos (E-Mail, Stadt, USt-IdNr.)
 * angezeigt — wichtig, wenn mehrere Kundenkonten denselben Firmennamen tragen.
 *
 * Klick liefert das gewählte Objekt an den Parent via `onSelect`. Der Parent
 * entscheidet, ob er ein Detail-Dialog öffnet (Kunde) oder nur den passenden
 * Tab aktiviert (Rechnung/Angebot/Anfrage).
 */
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Users, Receipt, FileText, Package } from "lucide-react";

export type AdminSearchHit =
  | { type: "customer"; id: string; tab: "customers" }
  | { type: "invoice"; id: string; tab: "invoices" }
  | { type: "offer"; id: string; tab: "offers" }
  | { type: "reservation"; id: string; tab: "reservations" };

interface CustomerLite {
  id: string;
  company_name: string;
  contact_first_name?: string;
  contact_last_name?: string;
  contact_email?: string;
  tax_id?: string | null;
  city?: string | null;
}
interface InvoiceLite {
  id: string;
  invoice_number: string;
  customer_company?: string | null;
  status: string;
}
interface OfferLite {
  id: string;
  offer_number: string;
  status: string;
}
interface ReservationLite {
  id: string;
  product_name?: string | null;
  status: string;
}

interface AdminGlobalSearchProps {
  customers: CustomerLite[];
  invoices: InvoiceLite[];
  offers: OfferLite[];
  reservations: ReservationLite[];
  onSelect: (hit: AdminSearchHit) => void;
}

interface DisplayHit {
  key: string;
  type: AdminSearchHit["type"];
  label: string;
  sub?: string;
  hit: AdminSearchHit;
}

const ICONS = {
  customer: Users,
  invoice: Receipt,
  offer: FileText,
  reservation: Package,
};

export function AdminGlobalSearch({
  customers,
  invoices,
  offers,
  reservations,
  onSelect,
}: AdminGlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const hits = useMemo<DisplayHit[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: DisplayHit[] = [];

    for (const c of customers) {
      const contactName = `${c.contact_first_name ?? ""} ${c.contact_last_name ?? ""}`.trim();
      const haystack = `${c.company_name} ${contactName} ${c.tax_id ?? ""} ${c.contact_email ?? ""}`.toLowerCase();
      if (haystack.includes(q)) {
        // Sub-Zeile mit unterscheidender Information: E-Mail + ggf. Stadt + ggf. USt-IdNr.
        const parts: string[] = [];
        if (c.contact_email) parts.push(c.contact_email);
        if (c.city) parts.push(c.city);
        if (c.tax_id) parts.push(`USt-IdNr.: ${c.tax_id}`);
        out.push({
          key: `customer-${c.id}`,
          type: "customer",
          label: c.company_name,
          sub: parts.join(" · ") || contactName || undefined,
          hit: { type: "customer", id: c.id, tab: "customers" },
        });
      }
    }
    for (const i of invoices) {
      if (
        i.invoice_number.toLowerCase().includes(q) ||
        (i.customer_company ?? "").toLowerCase().includes(q)
      ) {
        out.push({
          key: `invoice-${i.id}`,
          type: "invoice",
          label: i.invoice_number,
          sub: `${i.customer_company ?? ""} · ${i.status}`,
          hit: { type: "invoice", id: i.id, tab: "invoices" },
        });
      }
    }
    for (const o of offers) {
      if (o.offer_number.toLowerCase().includes(q)) {
        out.push({
          key: `offer-${o.id}`,
          type: "offer",
          label: o.offer_number,
          sub: o.status,
          hit: { type: "offer", id: o.id, tab: "offers" },
        });
      }
    }
    for (const r of reservations) {
      if ((r.product_name ?? "").toLowerCase().includes(q) || r.id.toLowerCase().startsWith(q)) {
        out.push({
          key: `reservation-${r.id}`,
          type: "reservation",
          label: r.product_name || r.id.slice(0, 8),
          sub: `Anfrage · ${r.status}`,
          hit: { type: "reservation", id: r.id, tab: "reservations" },
        });
      }
    }
    return out.slice(0, 12);
  }, [query, customers, invoices, offers, reservations]);

  const pick = (hit: AdminSearchHit) => {
    onSelect(hit);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Suche: Kunde, Rechnungs-Nr, Angebots-Nr, Anfrage…"
          className="pl-9"
        />
      </div>
      {open && query.length >= 2 && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-md max-h-80 overflow-auto">
          {hits.length === 0 ? (
            <div className="px-3 py-3 text-sm text-muted-foreground">Keine Treffer.</div>
          ) : (
            <ul className="py-1">
              {hits.map((h) => {
                const Icon = ICONS[h.type];
                return (
                  <li key={h.key}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(h.hit)}
                      className="w-full text-left px-3 py-2 hover:bg-muted/60 flex items-center gap-3"
                    >
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{h.label}</p>
                        {h.sub && (
                          <p className="text-xs text-muted-foreground truncate">{h.sub}</p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
