/**
 * Phase B3 — Global admin search.
 *
 * Lightweight client-side fuzzy search across the data already loaded by
 * AdminDashboard: customers (company / contact / VAT-ID), invoices
 * (invoice_number), offers (offer_number), reservations (id prefix).
 * Picking a result jumps to the matching admin tab via the URL search params.
 */
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, Users, Receipt, FileText, Package } from "lucide-react";

interface Hit {
  type: "customer" | "invoice" | "offer" | "reservation";
  label: string;
  sub?: string;
  tab: string;
}

interface AdminGlobalSearchProps {
  customers: Array<{ id: string; company_name: string; contact_first_name?: string; contact_last_name?: string; tax_id?: string | null }>;
  invoices: Array<{ id: string; invoice_number: string; customer_company?: string | null; status: string }>;
  offers: Array<{ id: string; offer_number: string; status: string }>;
  reservations: Array<{ id: string; product_name?: string | null; status: string }>;
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
}: AdminGlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [, setSearchParams] = useSearchParams();

  const hits = useMemo<Hit[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: Hit[] = [];

    for (const c of customers) {
      const name = `${c.contact_first_name ?? ""} ${c.contact_last_name ?? ""}`.trim();
      const haystack = `${c.company_name} ${name} ${c.tax_id ?? ""}`.toLowerCase();
      if (haystack.includes(q)) {
        out.push({
          type: "customer",
          label: c.company_name,
          sub: name || c.tax_id || undefined,
          tab: "customers",
        });
      }
    }
    for (const i of invoices) {
      if (
        i.invoice_number.toLowerCase().includes(q) ||
        (i.customer_company ?? "").toLowerCase().includes(q)
      ) {
        out.push({
          type: "invoice",
          label: i.invoice_number,
          sub: `${i.customer_company ?? ""} · ${i.status}`,
          tab: "invoices",
        });
      }
    }
    for (const o of offers) {
      if (o.offer_number.toLowerCase().includes(q)) {
        out.push({
          type: "offer",
          label: o.offer_number,
          sub: o.status,
          tab: "offers",
        });
      }
    }
    for (const r of reservations) {
      if ((r.product_name ?? "").toLowerCase().includes(q) || r.id.toLowerCase().startsWith(q)) {
        out.push({
          type: "reservation",
          label: r.product_name || r.id.slice(0, 8),
          sub: `Anfrage · ${r.status}`,
          tab: "reservations",
        });
      }
    }
    return out.slice(0, 12);
  }, [query, customers, invoices, offers, reservations]);

  const jump = (tab: string) => {
    const p = new URLSearchParams(window.location.search);
    if (tab === "reservations") p.delete("tab");
    else p.set("tab", tab);
    setSearchParams(p);
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
              {hits.map((hit, idx) => {
                const Icon = ICONS[hit.type];
                return (
                  <li key={`${hit.type}-${idx}`}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => jump(hit.tab)}
                      className="w-full text-left px-3 py-2 hover:bg-muted/60 flex items-center gap-3"
                    >
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{hit.label}</p>
                        {hit.sub && (
                          <p className="text-xs text-muted-foreground truncate">{hit.sub}</p>
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
