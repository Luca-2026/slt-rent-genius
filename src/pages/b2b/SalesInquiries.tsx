import { useMemo, useState } from "react";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useSalesInquiries } from "@/hooks/useInquiries";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { InquiryStatusBadge } from "@/components/b2b/inquiries/InquiryStatusBadge";
import { InquiryDetailPanel } from "@/components/b2b/inquiries/InquiryDetailPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { isOpenInquiry } from "@/lib/inquiryStatus";
import {
  SALES_KIND_LABELS,
  salesInquiryCustomer,
  salesInquiryTitle,
  type SalesInquiry,
} from "@/components/b2b/inquiries/types";
import { getLocationDisplayName } from "@/utils/plzLocationMapping";

export default function SalesInquiries() {
  const { isStaff, loading: accessLoading } = useStaffAccess();
  const { rows, loading, reload } = useSalesInquiries();
  const [search, setSearch] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [kind, setKind] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (onlyOpen && !isOpenInquiry(r.status)) return false;
      if (kind !== "all" && r.kind !== kind) return false;
      if (!q) return true;
      return [salesInquiryTitle(r), salesInquiryCustomer(r), r.customer_email, r.location]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, search, onlyOpen, kind]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;

  if (!accessLoading && !isStaff) {
    return (
      <B2BPortalLayout title="Verkaufsanfragen">
        <p className="text-muted-foreground">Kein Zugriff auf diesen Bereich.</p>
      </B2BPortalLayout>
    );
  }

  return (
    <B2BPortalLayout title="Verkaufsanfragen" subtitle="Neuartikel, Gebrauchtartikel & Kaufanfragen">
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suche nach Artikel, Kunde, Standort …"
          className="sm:max-w-sm"
        />
        <Button variant={onlyOpen ? "default" : "outline"} onClick={() => setOnlyOpen((v) => !v)}>
          {onlyOpen ? "Nur offene" : "Alle Anfragen"}
        </Button>
        <div className="flex gap-1 flex-wrap">
          {["all", "new_machine", "used_machine", "rental_purchase"].map((k) => (
            <Button key={k} size="sm" variant={kind === k ? "default" : "outline"} onClick={() => setKind(k)}>
              {k === "all" ? "Alle Typen" : SALES_KIND_LABELS[k]}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Wird geladen …</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">Keine Anfragen gefunden.</p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((r) => (
            <Card
              key={r.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedId(r.id)}
            >
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold truncate">{salesInquiryTitle(r)}</span>
                    <InquiryStatusBadge status={r.status} />
                    <span className="text-xs text-muted-foreground">
                      {SALES_KIND_LABELS[r.kind] ?? r.kind}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {salesInquiryCustomer(r)}
                    {r.location && ` · ${getLocationDisplayName(r.location)}`}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground sm:text-right">
                  <div>{new Date(r.created_at).toLocaleDateString("de-DE")}</div>
                  <div>{r.assigned_name ? `→ ${r.assigned_name}` : "offen"}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selected ? salesInquiryTitle(selected) : "Verkaufsanfrage"}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4">
              <InquiryDetailPanel
                table="sales_inquiries"
                inquiryType="sales"
                inquiry={selected}
                onChanged={reload}
                defaultItems={[
                  {
                    product_name: salesInquiryTitle(selected),
                    description: [selected.article_number, selected.product_category].filter(Boolean).join(" · "),
                    quantity: Number(selected.quantity) > 0 ? Number(selected.quantity) : 1,
                    unit_price: 0,
                    discount_percent: 0,
                  },
                ]}
                defaultDelivery={{
                  requested: Boolean(selected.delivery_street || selected.delivery_city),
                  street: selected.delivery_street ?? "",
                  postal_code: selected.delivery_postal_code ?? "",
                  city: selected.delivery_city ?? "",
                }}

                details={<SalesDetails inquiry={selected} />}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </B2BPortalLayout>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium break-words">{value}</span>
    </div>
  );
}

function SalesDetails({ inquiry }: { inquiry: SalesInquiry }) {
  return (
    <div className="space-y-1 rounded-lg border border-border p-3">
      <Row label="Eingegangen" value={new Date(inquiry.created_at).toLocaleString("de-DE")} />
      <Row label="Typ" value={SALES_KIND_LABELS[inquiry.kind] ?? inquiry.kind} />
      <Row label="Standort" value={inquiry.location ? getLocationDisplayName(inquiry.location) : null} />
      <Row label="Artikel" value={salesInquiryTitle(inquiry)} />
      <Row label="Artikelnummer" value={inquiry.article_number} />
      <Row label="Kategorie" value={inquiry.product_category} />
      <Row label="Baujahr" value={inquiry.year ? String(inquiry.year) : null} />
      <Row label="Listenpreis" value={inquiry.listed_price} />
      <Row label="Menge" value={inquiry.quantity} />
      <Row label="Anforderungen" value={inquiry.requirements} />
      <Row label="Wunschtermin" value={inquiry.wish_date} />
      <Row label="Lieferung" value={inquiry.delivery_option} />
      <Row
        label="Lieferadresse"
        value={[inquiry.delivery_street, [inquiry.delivery_postal_code, inquiry.delivery_city].filter(Boolean).join(" ")]
          .filter(Boolean)
          .join(", ") || null}
      />
      <Row label="Kunde" value={salesInquiryCustomer(inquiry)} />
      <Row label="Kundentyp" value={inquiry.customer_type} />
      <Row label="USt-IdNr." value={inquiry.vat_id} />
      <Row label="E-Mail" value={inquiry.customer_email} />
      <Row label="Telefon" value={inquiry.customer_phone} />
      <Row
        label="Rechnungsadresse"
        value={[inquiry.billing_company, inquiry.billing_street, [inquiry.billing_postal_code, inquiry.billing_city].filter(Boolean).join(" ")]
          .filter(Boolean)
          .join(", ") || null}
      />
      <Row
        label="Finanzierung"
        value={inquiry.financing_desired ? [inquiry.financing_term, inquiry.financing_down_payment].filter(Boolean).join(" · ") || "gewünscht" : null}
      />
      <Row label="Nachricht" value={inquiry.message} />
      <Row label="Aufmerksam über" value={inquiry.found_via} />
    </div>
  );
}
