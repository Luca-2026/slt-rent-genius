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
  depositHeld: number;
  /** Rückgabekosten als Rechnungspositionen (netto), nur unberechnete */
  chargeLines: OfferLine[];
}

export function depositBlocksInvoice(s: DepositState): boolean {
  return s.loaded && !s.settled && s.depositHeld > 0.004;
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
  const [state, setState] = useState<DepositState>({ loaded: false, settled: false, depositHeld: 0, chargeLines: [] });
  const load = useCallback(async () => {
    if (!enabled) return;
    const [{ data: s }, { data: protocols }] = await Promise.all([
      supabase.from("deposit_settlements").select("id").eq("rental_inquiry_id", inquiry.id).maybeSingle(),
      supabase
        .from("b2b_return_protocols")
        .select("id, return_protocol_number, b2b_return_extra_charges(id, label, quantity, unit_price, billed)")
        .eq("rental_inquiry_id", inquiry.id),
    ]);
    const chargeLines: OfferLine[] = [];
    for (const p of (protocols ?? []) as any[]) {
      for (const c of (p.b2b_return_extra_charges ?? []) as any[]) {
        if (c.billed) continue;
        const gross = round2((Number(c.quantity) || 0) * (Number(c.unit_price) || 0));
        if (gross <= 0) continue;
        chargeLines.push({
          product_name: c.label,
          description: p.return_protocol_number ? `laut Rückgabeprotokoll ${p.return_protocol_number}` : "laut Rückgabeprotokoll",
          quantity: 1,
          unit: "pauschal",
          duration: 1,
          unit_price: netOf(gross),
          discount_percent: 0,
        } as OfferLine);
      }
    }
    // Ohne Angebotssumme gibt es keine Miete als Referenz – dann zählt jede
    // Zahlung als Mietzahlung, nicht als Kaution (z. B. Telefonbuchung bar).
    const rent = Number(inquiry.offer_total_gross) || 0;
    const held = rent > 0 ? round2(sumPayments(inquiry.payments) - rent) : 0;
    setState({ loaded: true, settled: !!s, depositHeld: Math.max(0, held), chargeLines });
  }, [enabled, inquiry.id, inquiry.payments, inquiry.offer_total_gross]);
  useEffect(() => { void load(); }, [load]);
  return { ...state, reload: load };
}
