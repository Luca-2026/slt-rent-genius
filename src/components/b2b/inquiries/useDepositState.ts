import { chargeQuantityText } from "@/lib/returnCharges";
/**
 * Kautionsstatus einer Mietanfrage für die Rechnungserstellung:
 * - Liegt eine Kaution vor (Zahlung über die Miete hinaus) und ist sie nicht abgerechnet,
 *   darf keine Rechnung versendet werden – erst „Kaution abrechnen“.
 * - Ohne Kaution übernimmt die Rechnung die noch nicht berechneten Rückgabekosten.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { netOf, round2, sumPayments } from "@/lib/depositSettlement";
import type { OfferLine } from "./offerMath";

export interface DepositState {
  loaded: boolean;
  settled: boolean;
  /** Rechnung aus der Kautionsabrechnung (= Schlussrechnung) */
  settlementInvoiceId: string | null;
  /** Mit der Kaution verrechneter Betrag – Zahlungszeile „Kaution verrechnet“ auf der Schlussrechnung */
  offset: number;
  depositHeld: number;
  /** Rücknahmeprotokoll abgeschlossen – erst dann sperrt die Kaution die Rechnung */
  hasProtocol: boolean;
  /** Rückgabekosten als Rechnungspositionen (netto), nur unberechnete */
  chargeLines: OfferLine[];
}

/**
 * Sperre gilt nur für die Schlussrechnung nach Rückgabe: Voraus- und
 * Folgerechnungen (Miete im Voraus, alle 4 Wochen) müssen bei laufender
 * Miete mit offener Kaution jederzeit versendbar bleiben.
 */
export function depositBlocksInvoice(s: DepositState): boolean {
  return s.loaded && !s.settled && s.depositHeld > 0.004 && s.hasProtocol;
}

/** Zahlungen in Reihenfolge nur bis zur Miete anrechnen (Rest war Kaution). */
export function paymentsUpToRent<T extends { amount?: unknown }>(payments: T[], rent: number): T[] {
  let left = round2(rent);
  const out: T[] = [];
  for (const p of payments) {
    if (left <= 0) break;
    const amt = Number(p.amount) || 0;
    const use = round2(Math.min(amt, left));
    if (use > 0) out.push({ ...p, amount: use });
    left = round2(left - use);
  }
  return out;
}

export function useDepositState(inquiry: Record<string, any>, enabled: boolean) {
  const [state, setState] = useState<DepositState>({ loaded: false, settled: false, settlementInvoiceId: null, offset: 0, depositHeld: 0, hasProtocol: false, chargeLines: [] });
  const load = useCallback(async () => {
    if (!enabled) return;
    const [{ data: s }, { data: protocols }] = await Promise.all([
      supabase.from("deposit_settlements").select("id, invoice_id, deductions, offset_amount, settled_at").eq("rental_inquiry_id", inquiry.id).maybeSingle(),
      supabase
        .from("b2b_return_protocols")
        .select("id, return_protocol_number, b2b_return_extra_charges(id, label, quantity, unit_price, billed)")
        .eq("rental_inquiry_id", inquiry.id),
    ]);
    const protocolIds = (protocols ?? []).map((p: any) => p.id);
    const { data: damages } = protocolIds.length
      ? await supabase
          .from("b2b_protocol_damages")
          .select("id, item_name, category, description, amount, return_protocol_id")
          .in("return_protocol_id", protocolIds)
          .eq("billed", false)
      : { data: [] as any[] };
    const protoRef = (pid: string) => {
      const num = (protocols ?? []).find((p: any) => p.id === pid)?.return_protocol_number;
      return num ? `laut Rückgabeprotokoll ${num}` : "laut Rückgabeprotokoll";
    };
    const chargeLines: OfferLine[] = [];
    for (const p of (protocols ?? []) as any[]) {
      for (const c of (p.b2b_return_extra_charges ?? []) as any[]) {
        if (c.billed) continue;
        const gross = round2((Number(c.quantity) || 0) * (Number(c.unit_price) || 0));
        if (gross <= 0) continue;
        // Service (Reinigung, Betankung, Mehrstunden): steuerpflichtig, 19 % USt.
        chargeLines.push({
          product_name: c.label,
          description: [chargeQuantityText(c.label, Number(c.quantity) || 0, Number(c.unit_price) || 0), protoRef(p.id)].filter(Boolean).join(" · "),
          quantity: 1,
          unit: "pauschal",
          duration: 1,
          unit_price: netOf(gross),
          measure: chargeMeasure(c.label, Number(c.quantity) || 0, netOf(gross)),
          discount_percent: 0,
          vat_rate: 19,
          protocol_charge_id: c.id,
          protocol_charge_source: "extra_charge",
        } as OfferLine);
      }
    }
    // Schäden am Mietgerät: nicht steuerbarer Schadensersatz (0 % USt, brutto = netto).
    for (const d of (damages ?? []) as any[]) {
      const amount = round2(Number(d.amount) || 0);
      if (amount <= 0) continue;
      chargeLines.push({
        product_name: `Schadensersatz${d.item_name ? ` – ${d.item_name}` : ""}`,
        description: [[d.category, d.description].filter(Boolean).join(": "), protoRef(d.return_protocol_id)].filter(Boolean).join(" · "),
        quantity: 1,
        unit: "pauschal",
        duration: 1,
        unit_price: amount,
        discount_percent: 0,
        vat_rate: 0,
        protocol_charge_id: d.id,
        protocol_charge_source: "damage",
      } as OfferLine);
    }
    // Nach der Kautionsabrechnung: Abzüge (wie abgerechnet) kommen auf die Schlussrechnung,
    // solange danach noch keine Rechnung erstellt wurde (alte Abrechnungen mit eigener Rechnung ausgenommen).
    let offset = 0;
    if (s && !(s as any).invoice_id) {
      const { data: later } = await supabase
        .from("inquiry_invoices")
        .select("id, status, invoice_kind, created_at")
        .eq("rental_inquiry_id", inquiry.id)
        .gt("created_at", (s as any).settled_at);
      const billedAfter = (later ?? []).some((r: any) => r.status !== "cancelled" && r.invoice_kind !== "credit_note");
      if (!billedAfter) {
        offset = round2(Number((s as any).offset_amount) || 0);
        for (const d of (((s as any).deductions ?? []) as any[])) {
          const gross = round2(Number(d.gross) || 0);
          if (d.removed || gross <= 0) continue;
          const dmg = d.kind === "damage";
          chargeLines.push({
            product_name: dmg && !/^Schadensersatz/.test(d.label) ? `Schadensersatz – ${d.label}` : d.label,
            description: dmg ? "Nicht steuerbarer Schadensersatz" : [d.quantity_text, "Rückgabekosten laut Rückgabeprotokoll"].filter(Boolean).join(" · "),
            quantity: 1, unit: "pauschal", duration: 1,
            unit_price: dmg ? gross : netOf(gross),
            discount_percent: 0,
            vat_rate: dmg ? 0 : 19,
            measure: dmg ? undefined : chargeMeasure(d.label, quantityFromText(d.quantity_text), netOf(gross)),
            protocol_charge_source: "settlement",
          } as OfferLine);
        }
      }
    }
    // Ohne Angebotssumme gibt es keine Miete als Referenz – dann zählt jede
    // Zahlung als Mietzahlung, nicht als Kaution (z. B. Telefonbuchung bar).
    const rent = Number(inquiry.offer_total_gross) || 0;
    const held = rent > 0 ? round2(sumPayments(inquiry.payments) - rent) : 0;
    setState({ loaded: true, settled: !!s, settlementInvoiceId: (s as any)?.invoice_id ?? null, offset, depositHeld: Math.max(0, held), hasProtocol: (protocols ?? []).length > 0, chargeLines });
  }, [enabled, inquiry.id, inquiry.payments, inquiry.offer_total_gross]);
  useEffect(() => { void load(); }, [load]);
  return { ...state, reload: load };
}
