/**
 * Schlussrechnung nach der Kautionsabrechnung – serverseitig maßgeblich, damit
 * ein veralteter Entwurf im Browser die Rechnung nicht verfälscht:
 * - Zahlungen zählen nur bis zur Miete, die Kaution steht als „Kaution verrechnet“.
 * - Kaution erhalten / verrechnet / erstattet (inkl. Weg und Datum) steht auf der Rechnung.
 * - Reinigung und Kraftstoff erhalten ihre echte Einheit (15 Min bzw. Liter).
 * Rein rechnerisch, ohne Deno-Imports – getestet in src/test/finalInvoiceDeposit.test.ts.
 */

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export interface SettlementRow {
  deposit_held: number | string | null;
  offset_amount: number | string | null;
  balance: number | string | null;
  payout_method: string | null;
  payout_status: string | null;
  payout_date: string | null;
  settled_at: string;
  invoice_id?: string | null;
}

export interface DepositSummary {
  held: number;
  offset: number;
  refund: number;
  due: number;
  payoutMethod: string | null;
  payoutStatus: string | null;
  payoutDate: string | null;
  settledDate: string;
}

export interface PaymentLine { date: string; amount: number; label: string; reference: string }

export function depositSummary(s: SettlementRow): DepositSummary {
  const balance = r2(Number(s.balance) || 0);
  return {
    held: r2(Math.max(0, Number(s.deposit_held) || 0)),
    offset: r2(Math.max(0, Number(s.offset_amount) || 0)),
    refund: Math.max(0, balance),
    due: Math.max(0, -balance),
    payoutMethod: s.payout_method,
    payoutStatus: s.payout_status,
    payoutDate: s.payout_date,
    settledDate: String(s.settled_at).slice(0, 10),
  };
}

/**
 * Gilt die Abrechnung für diese Rechnung? Nur, solange nach der Abrechnung noch
 * keine gültige Rechnung erstellt wurde (stornierte und Gutschriften zählen nicht).
 */
export function settlementAppliesToNewInvoice(
  s: SettlementRow | null | undefined,
  invoices: { status: string | null; invoice_kind: string | null; created_at: string }[],
): boolean {
  if (!s || s.invoice_id) return false;
  const t = new Date(s.settled_at).getTime();
  return !invoices.some((r) => new Date(r.created_at).getTime() > t && r.status !== "cancelled" && r.invoice_kind !== "credit_note");
}

const isDepositLine = (p: { label?: string }) => /^Kaution\b/i.test(String(p.label ?? "").trim());

/**
 * Zahlungen für die Schlussrechnung: zuerst auf die Miete. Was laut Auftrag über
 * die Miete hinaus gezahlt wurde, war Kaution – davon steht nur der verrechnete
 * Teil als „Kaution verrechnet“ auf der Rechnung.
 */
export function settlementPayments(
  payments: PaymentLine[],
  storedPaymentsTotal: number,
  sum: DepositSummary,
  orderCode: string | null,
): PaymentLine[] {
  const rentPaid = r2(Math.max(0, storedPaymentsTotal - sum.held));
  let left = rentPaid;
  const out: PaymentLine[] = [];
  for (const p of payments) {
    if (isDepositLine(p)) continue;
    if (left <= 0) break;
    const use = r2(Math.min(Number(p.amount) || 0, left));
    if (use > 0) out.push({ ...p, amount: use });
    left = r2(left - use);
  }
  if (sum.offset > 0) {
    out.push({ date: sum.settledDate, amount: sum.offset, label: "Kaution verrechnet", reference: orderCode ? `Auftrag ${orderCode}` : "" });
  }
  return out;
}

const deDate = (iso: string | null) => (iso ? iso.slice(0, 10).split("-").reverse().join(".") : "");
const eur = (n: number) => `${n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €`;

/** Erstattungsweg als Text, z. B. „bar ausgezahlt am 19.10.2026“. */
export function payoutText(sum: DepositSummary): string {
  if (sum.refund <= 0) return "";
  const on = sum.payoutDate ? ` am ${deDate(sum.payoutDate)}` : "";
  const pending = sum.payoutStatus === "pending";
  switch (sum.payoutMethod) {
    case "cash": return pending ? "wird bar ausgezahlt" : `bar ausgezahlt${on}`;
    case "transfer": return pending ? "wird per Überweisung erstattet" : `per Überweisung erstattet${on}`;
    case "stripe": return pending ? "wird auf die ursprüngliche Zahlungsart erstattet" : `auf die ursprüngliche Zahlungsart erstattet${on}`;
    default: return pending ? "Erstattung offen" : `erstattet${on}`;
  }
}

/** Hinweistext für Rechnung und E-Mail. */
export function depositSummaryNote(sum: DepositSummary): string {
  if (sum.held <= 0) return "";
  const parts = [`Kautionsabrechnung vom ${deDate(sum.settledDate)}: Kaution erhalten ${eur(sum.held)}`];
  if (sum.offset > 0) parts.push(`mit den Rückgabekosten verrechnet ${eur(sum.offset)}`);
  if (sum.refund > 0) parts.push(`Restkaution ${eur(sum.refund)} ${payoutText(sum)}`);
  let text = parts.join(", ") + ".";
  if (sum.due > 0) text += ` Nicht durch die Kaution gedeckt: ${eur(sum.due)}.`;
  return text;
}

export type ChargeUnit = "liter" | "15min";
export interface Measure { quantity: number; unit: ChargeUnit; unit_price: number }

/** Spiegel von chargeUnitKind in src/lib/returnCharges.ts. */
export function chargeUnitKind(label: string): ChargeUnit | null {
  if (/reinigung/i.test(label)) return "15min";
  if (/kraftstoff|diesel|benzin|adblue|nachgetankt|betankung/i.test(label)) return "liter";
  return null;
}

/** Menge aus der Mengenangabe in der Beschreibung („3 Liter à …“, „2 × 15 Min …“). */
export function quantityFromText(text: string | null | undefined): number {
  const m = String(text ?? "").match(/^\s*([\d.,]+)\s*(?:Liter|×)/);
  if (!m) return 0;
  const n = Number(m[1].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Fehlt einer Rückgabeposition die Einheit (z. B. aus einem alten Entwurf),
 * wird sie aus Bezeichnung und Mengenangabe ergänzt. Einzelpreis = Summe ÷ Menge.
 */
export function inferChargeMeasure(item: { product_name: string; description?: string | null; quantity: number; unit_price: number; vat_rate?: number; measure?: Measure }): Measure | undefined {
  if (item.measure) return item.measure;
  if (item.vat_rate === 0) return undefined;
  const unit = chargeUnitKind(item.product_name);
  const qty = quantityFromText(item.description);
  const total = r2(item.quantity * item.unit_price);
  if (!unit || !(qty > 0) || !(total > 0)) return undefined;
  return { quantity: r2(qty), unit, unit_price: Math.round((total / qty) * 10000) / 10000 };
}

export const measureUnitLabel = (u: ChargeUnit) => (u === "liter" ? "Liter" : "× 15 Min");
