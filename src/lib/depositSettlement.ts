/**
 * Kautionsabrechnung je Mietauftrag.
 *
 * Regeln (vom Kunden vorgegeben):
 * - Jede Zahlung zählt zuerst auf die Miete, erst der Rest ist Kaution.
 * - Kosten aus dem Rückgabeprotokoll (Reinigung, Tank, Schäden, Zusatzkosten)
 *   werden mit der Kaution verrechnet.
 * - Ergebnis > 0 = Erstattung an den Kunden, < 0 = Nachzahlung.
 * - Abzüge werden netto geführt (Rechnung), brutto = netto × 1,19 auf den Cent –
 *   so stimmt die Abrechnung exakt mit der erzeugten Rechnung überein.
 * Spiegel der Rechenregel: DB-Funktion settle_deposit (serverseitige Prüfung).
 */
export const VAT_RATE = 0.19;
export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export interface SettlementDeduction {
  key: string;
  label: string;
  /** Bruttobetrag laut Protokoll bzw. Eingabe */
  gross: number;
  source: "protocol" | "damage" | "manual";
  /**
   * Rechnungskategorie: "service" = steuerpflichtige Leistung (19 % USt:
   * Reinigung, Betankung, Mehrstunden), "damage" = nicht steuerbarer
   * Schadensersatz (Schäden am Mietgerät, ohne USt).
   */
  kind: "service" | "damage";
  /** Abgewählt (mit Grund) – zählt nicht */
  removed?: boolean;
  reason?: string;
}

export interface SettlementInput {
  /** Summe aller erfassten Zahlungen (brutto) */
  paid: number;
  /** Mietbetrag laut Angebot (brutto, ohne Kaution) */
  rent: number;
  deductions: SettlementDeduction[];
}

export interface SettlementResult {
  paid: number;
  rent: number;
  /** Kaution vorhanden = Zahlung über die Miete hinaus (nie negativ) */
  depositHeld: number;
  /** Fehlbetrag auf die Miete (Sonderfall Teilzahlung) */
  rentShortfall: number;
  deductionsNet: number;
  deductionsGross: number;
  /** Mit der Kaution verrechneter Teil der Abzüge */
  offset: number;
  /** > 0 Erstattung, < 0 Nachzahlung */
  balance: number;
  refund: number;
  due: number;
}

export const netOf = (gross: number) => round2(gross / (1 + VAT_RATE));

/** Netto einer Abzugsposition: Schadensersatz ist nicht steuerbar (brutto = netto). */
export const deductionNet = (d: Pick<SettlementDeduction, "gross" | "kind">) =>
  d.kind === "damage" ? round2(d.gross) : netOf(d.gross);

export function computeSettlement({ paid, rent, deductions }: SettlementInput): SettlementResult {
  const p = round2(Math.max(0, paid));
  const r = round2(Math.max(0, rent));
  const active = deductions.filter((d) => !d.removed && d.gross > 0);
  const deductionsNet = round2(active.reduce((s, d) => s + deductionNet(d), 0));
  // Brutto je Position: Service netto × 1,19; Schadensersatz bleibt ohne USt.
  const deductionsGross = round2(
    active.reduce((s, d) => s + (d.kind === "damage" ? round2(d.gross) : round2(deductionNet(d) * (1 + VAT_RATE))), 0),
  );
  const depositHeld = round2(Math.max(0, p - r));
  const rentShortfall = round2(Math.max(0, r - p));
  const offset = round2(Math.min(depositHeld, deductionsGross));
  const balance = round2(p - r - deductionsGross);
  return {
    paid: p,
    rent: r,
    depositHeld,
    rentShortfall,
    deductionsNet,
    deductionsGross,
    offset,
    balance,
    refund: balance > 0 ? balance : 0,
    due: balance < 0 ? round2(-balance) : 0,
  };
}

/** Problem bei Abzügen (Grund fehlt), sonst null. */
export function deductionProblem(deductions: SettlementDeduction[]): string | null {
  for (const d of deductions) {
    if (d.source === "manual" && !d.removed && (!d.label.trim() || !(d.gross > 0))) return "Eigener Abzug braucht Bezeichnung und Betrag";
    if (d.source !== "manual" && d.removed && !d.reason?.trim()) return `Grund für entfernten Abzug „${d.label}“ fehlt`;
  }
  return null;
}

export const sumPayments = (payments: unknown): number =>
  round2((Array.isArray(payments) ? payments : []).reduce((s, p) => s + (Number((p as { amount?: unknown })?.amount) || 0), 0));
