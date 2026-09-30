/**
 * Button „Neues Übergabe-/Rückgabeprotokoll“ im Protokoll-Reiter:
 * Auftrag auswählen (angenommen, noch nicht zurückgegeben), dann Protokoll.
 */
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useRentalInquiries } from "@/hooks/useInquiries";
import { useRentalProtocolStatus } from "@/hooks/useRentalProtocolStatus";
import { isProtocolCandidate, type ProtocolKind } from "@/lib/rentalProtocol";
import { getLocationDisplayName } from "@/utils/plzLocationMapping";
import type { RentalInquiry } from "@/components/b2b/inquiries/types";
import { RentalProtocolDialog } from "./RentalProtocolDialog";

const fmt = (v: string | null) => (v ? new Date(v.slice(0, 10)).toLocaleDateString("de-DE") : "—");

export function NewRentalProtocolButton({ kind, onCreated }: { kind: ProtocolKind; onCreated?: () => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<RentalInquiry | null>(null);
  const [q, setQ] = useState("");
  const { rows, reload } = useRentalInquiries();
  const protocols = useRentalProtocolStatus();
  const label = kind === "delivery" ? "Übergabeprotokoll" : "Rückgabeprotokoll";

  const candidates = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows
      .filter((r) => {
        const st = protocols.byInquiry.get(r.id);
        return isProtocolCandidate(r, kind, { handedOver: !!st?.delivery, returned: !!st?.ret });
      })
      .filter((r) => !term || [r.customer_name, r.company_name, r.product_name, r.order_confirmation_number, r.offer_number, fmt(r.start_date)]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(term)))
      .sort((a, b) => String(a.start_date ?? "").localeCompare(String(b.start_date ?? "")));
  }, [rows, protocols.byInquiry, kind, q]);

  return (
    <>
      <Button onClick={() => { void reload(); void protocols.reload(); setPickerOpen(true); }}>
        <Plus className="h-4 w-4 mr-1" /> Neues {label}
      </Button>
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mietauftrag auswählen</DialogTitle>
            <DialogDescription>
              {kind === "delivery"
                ? "Angenommene Aufträge ohne Übergabeprotokoll."
                : "Übergebene Aufträge ohne Rückgabeprotokoll."}
            </DialogDescription>
          </DialogHeader>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kunde, Artikel, Nummer oder Datum suchen …" />
          <div className="space-y-2">
            {candidates.length === 0 && <p className="text-sm text-muted-foreground py-4">Kein passender Auftrag gefunden.</p>}
            {candidates.map((r) => (
              <button
                key={r.id}
                type="button"
                className="w-full text-left rounded-lg border p-3 hover:border-primary transition-colors"
                onClick={() => { setSelected(r); setPickerOpen(false); }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold break-words">{[r.company_name, r.customer_name].filter(Boolean).join(" · ") || r.customer_email}</span>
                  {r.order_confirmed_at
                    ? <Badge variant="secondary">AB {r.order_confirmation_number ?? "verschickt"}</Badge>
                    : <Badge variant="outline">Auftragsbestätigung offen</Badge>}
                </div>
                <p className="text-sm text-muted-foreground break-words">
                  {r.product_name} · {fmt(r.start_date)} – {fmt(r.end_date)}{r.location ? ` · ${getLocationDisplayName(r.location)}` : ""}
                </p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <RentalProtocolDialog
        kind={kind}
        inquiry={selected}
        open={!!selected}
        onOpenChange={(o) => { if (!o) setSelected(null); }}
        onCreated={() => { void protocols.reload(); onCreated?.(); }}
      />
    </>
  );
}
