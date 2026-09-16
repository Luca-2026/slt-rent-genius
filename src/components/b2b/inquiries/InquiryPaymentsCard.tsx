import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banknote, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatEuro } from "./offerMath";

/** Erfasste (Teil-)Zahlung zu einer Anfrage. */
export interface InquiryPayment {
  date?: string;
  amount: number;
  label?: string;
  reference?: string;
}

/** Zahlungen aus einem unbekannten JSON-Wert robust lesen. */
export function parseInquiryPayments(raw: unknown): InquiryPayment[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p) => {
      const o = (p ?? {}) as Record<string, unknown>;
      return {
        date: typeof o.date === "string" ? o.date : undefined,
        amount: Math.round((Number(o.amount) || 0) * 100) / 100,
        label: typeof o.label === "string" ? o.label : undefined,
        reference: typeof o.reference === "string" ? o.reference : undefined,
      };
    })
    .filter((p) => p.amount > 0);
}

interface Props {
  table: "rental_inquiries" | "sales_inquiries";
  inquiryId: string;
  payments: unknown;
  /** Angebotssumme brutto – zur Anzeige des offenen Betrags. */
  offerTotalGross?: number | null;
  disabled?: boolean;
  onChanged: () => void;
}

/**
 * Zahlungseingänge zu einer Anfrage erfassen – schon bevor die Rechnung erstellt wird
 * (z. B. Vorkasse auf das Angebot). Die Rechnung übernimmt diese Zahlungen später.
 */
export function InquiryPaymentsCard({ table, inquiryId, payments, offerTotalGross, disabled, onChanged }: Props) {
  const { toast } = useToast();
  const [rows, setRows] = useState<InquiryPayment[]>(() => parseInquiryPayments(payments));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRows(parseInquiryPayments(payments));
  }, [inquiryId, payments]);

  const total = useMemo(
    () => Math.round(rows.reduce((s, p) => s + (Number(p.amount) || 0), 0) * 100) / 100,
    [rows],
  );
  const open = offerTotalGross != null ? Math.round((Number(offerTotalGross) - total) * 100) / 100 : null;

  const patch = (index: number, values: Partial<InquiryPayment>) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...values } : row)));

  const add = () =>
    setRows((prev) => [
      ...prev,
      {
        date: new Date().toISOString().slice(0, 10),
        amount: open && open > 0 ? open : 0,
        label: "Banküberweisung",
        reference: "",
      },
    ]);

  const save = async () => {
    const clean = rows
      .map((p) => ({
        date: p.date || new Date().toISOString().slice(0, 10),
        amount: Math.round((Number(p.amount) || 0) * 100) / 100,
        label: (p.label || "").trim() || "Zahlungseingang",
        reference: (p.reference || "").trim(),
      }))
      .filter((p) => p.amount > 0);
    const paidAmount = Math.round(clean.reduce((s, p) => s + p.amount, 0) * 100) / 100;
    setSaving(true);
    const { error } = await supabase
      .from(table)
      .update({ payments: clean, paid_amount: paidAmount } as never)
      .eq("id", inquiryId);
    setSaving(false);
    if (error) {
      toast({ title: "Zahlungen konnten nicht gespeichert werden", description: error.message, variant: "destructive" });
      return;
    }
    setRows(clean);
    toast({ title: "Zahlungen gespeichert", description: `Erhalten: ${formatEuro(paidAmount)}` });
    onChanged();
  };

  return (
    <div className="rounded-lg border border-border p-3 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Banknote className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">Zahlungseingänge</span>
        <span className="text-xs text-muted-foreground">
          Vorkasse und Teilzahlungen hier erfassen – die Rechnung übernimmt sie automatisch.
        </span>
      </div>

      {rows.length === 0 && (
        <p className="text-xs text-muted-foreground">Noch keine Zahlung erfasst.</p>
      )}

      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[130px_120px_1fr_1fr_auto] items-end">
          <div>
            <Label className="text-[11px]">Datum</Label>
            <Input type="date" value={row.date ?? ""} onChange={(e) => patch(index, { date: e.target.value })} />
          </div>
          <div>
            <Label className="text-[11px]">Betrag (€)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={row.amount}
              onChange={(e) => patch(index, { amount: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-[11px]">Zahlungsweg</Label>
            <Input value={row.label ?? ""} onChange={(e) => patch(index, { label: e.target.value })} placeholder="Banküberweisung" />
          </div>
          <div>
            <Label className="text-[11px]">Verwendungszweck</Label>
            <Input
              value={row.reference ?? ""}
              onChange={(e) => patch(index, { reference: e.target.value })}
              placeholder="z. B. Angebotsnummer"
            />
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
            aria-label="Zahlung entfernen"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={add} disabled={disabled || saving}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Zahlung hinzufügen
        </Button>
        <Button size="sm" onClick={save} disabled={disabled || saving}>
          Zahlungen speichern
        </Button>
        <span className="text-sm ml-auto">
          Erhalten <strong>{formatEuro(total)}</strong>
          {open != null && (
            <span className={open > 0 ? "ml-2 text-destructive font-semibold" : "ml-2 text-primary font-semibold"}>
              {open > 0 ? `offen ${formatEuro(open)}` : "vollständig bezahlt"}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
