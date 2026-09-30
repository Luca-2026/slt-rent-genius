/**
 * Berechnung von Zusatzoptionen (Versicherungen etc.) je Angebotsposition.
 *
 * Reines, abhängigkeitsfreies Modul – wird identisch vom Portal (über
 * `src/lib/addonCalc.ts`) und von den Edge Functions genutzt, damit Anzeige,
 * PDF, E-Mail und Serverprüfung immer denselben Betrag und Text ergeben.
 *
 * Berechnungsgrundlage:
 *  - "line":        wie die Mietposition (gleiche Dauer und Einheit)
 *  - "full_period": gesamte Mietdauer in Kalendertagen – z. B. Maschinenbruch
 *                   beim Bagger, der nur nach Arbeitstagen berechnet wird,
 *                   dessen Versicherungsschutz aber auch am Wochenende läuft.
 *  - "once":        einmaliger Festbetrag
 */

export type AddonPriceType = "flat" | "per_unit" | "percent";
export type AddonBasis = "line" | "full_period" | "once";

export interface AddonCalcSpec {
  price_type: AddonPriceType;
  /** Prozentsatz (percent) bzw. Netto-Betrag (per_unit: je Artikel und Tag/Einheit; flat: gesamt) */
  rate: number;
  basis: AddonBasis;
  /** Kalendertage der gesamten Mietdauer (nur bei basis = full_period) */
  days?: number | null;
}

export interface AddonLineContext {
  /** Anzahl Artikel */
  articles: number;
  /** Abgerechnete Dauer in der Einheit der Position */
  duration: number;
  /** Tage je Einheit der Position (1 bei Tagen, 7 bei Wochen, 30 bei Monaten, null bei Stück/Pauschal) */
  days_per_unit: number | null;
  unit_price: number;
  discount_percent: number;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Tage je Mengeneinheit – Schlüssel (kalendertage) oder Anzeigetext (Kalendertage, Woche …). */
export function daysPerUnit(unit: string | null | undefined): number | null {
  const u = (unit ?? "").toLowerCase();
  if (!u) return 1;
  if (u.includes("woche")) return 7;
  if (u.includes("monat")) return 30;
  if (u.includes("tag")) return 1;
  return null; // Stück, Pauschal
}

/** Kalendertage inkl. Start- und Endtag (ISO yyyy-mm-dd). null, wenn nicht berechenbar. */
export function calendarDaysInclusive(start?: string | null, end?: string | null): number | null {
  const re = /^(\d{4})-(\d{2})-(\d{2})/;
  const a = re.exec(start ?? "");
  const b = re.exec(end ?? "");
  if (!a || !b) return null;
  const ta = Date.UTC(+a[1], +a[2] - 1, +a[3]);
  const tb = Date.UTC(+b[1], +b[2] - 1, +b[3]);
  if (!Number.isFinite(ta) || !Number.isFinite(tb) || tb < ta) return null;
  return Math.round((tb - ta) / 86_400_000) + 1;
}

/** Ist "gesamte Mietdauer" für diese Position sinnvoll? (nur zeitbasierte Einheiten) */
export function supportsFullPeriod(ctx: Pick<AddonLineContext, "days_per_unit">): boolean {
  return ctx.days_per_unit !== null;
}

/**
 * Betrag einer Zusatzoption. Gibt null zurück, wenn er nicht berechenbar ist
 * (z. B. gesamte Mietdauer ohne Kalendertage) – dann muss manuell erfasst werden.
 */
export function computeAddonAmount(spec: AddonCalcSpec, ctx: AddonLineContext): number | null {
  const rate = Number(spec.rate);
  if (!Number.isFinite(rate)) return null;
  const articles = Math.max(1, Number(ctx.articles) || 1);
  const duration = Math.max(1, Number(ctx.duration) || 1);
  const factor = 1 - (Number(ctx.discount_percent) || 0) / 100;
  const price = Number(ctx.unit_price) || 0;

  if (spec.price_type === "flat" || spec.basis === "once") {
    return spec.price_type === "flat" ? round2(rate) : null;
  }

  if (spec.basis === "full_period") {
    const days = Number(spec.days);
    if (!ctx.days_per_unit || !Number.isFinite(days) || days <= 0) return null;
    if (spec.price_type === "percent") {
      const dailyPrice = price / ctx.days_per_unit;
      return round2(articles * dailyPrice * days * factor * (rate / 100));
    }
    return round2(rate * articles * days);
  }

  // basis = line
  if (spec.price_type === "percent") {
    return round2(articles * duration * price * factor * (rate / 100));
  }
  return round2(rate * articles * duration);
}

const fmtEuro = (n: number) =>
  `${n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const fmtNum = (n: number) => n.toLocaleString("de-DE", { maximumFractionDigits: 2 });
const fmtDate = (iso?: string | null, withYear = true) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  if (!m) return "";
  return withYear ? `${m[3]}.${m[2]}.${m[1]}` : `${m[3]}.${m[2]}.`;
};

export function formatPeriod(start?: string | null, end?: string | null): string {
  const s = fmtDate(start, false);
  const e = fmtDate(end, true);
  if (s && e) return `${s}–${e}`;
  return fmtDate(start) || fmtDate(end);
}

export interface AddonDescribeInput {
  price_type?: AddonPriceType;
  rate?: number;
  basis?: AddonBasis;
  days?: number | null;
  period_start?: string | null;
  period_end?: string | null;
  manual?: boolean;
  /** Anzeige-Einheit der Position (Singular), z. B. "Arbeitstag" – nur für per_unit/line */
  line_unit?: string;
}

/**
 * Kundenverständliche Erläuterungszeile für Angebot, PDF, E-Mail und Rechnung.
 * Leerstring bei alten Angeboten ohne Berechnungsangaben.
 */
export function describeAddon(a: AddonDescribeInput): string {
  if (!a.price_type || a.rate === undefined || a.rate === null) return "";
  const period = formatPeriod(a.period_start, a.period_end);
  const days = Number(a.days) || 0;
  const fullPeriodText =
    `berechnet über die gesamte Mietdauer: ${days} ${days === 1 ? "Kalendertag" : "Kalendertage"}` +
    (period ? ` (${period})` : "") +
    ", da der Versicherungsschutz auch an nicht berechneten Tagen (z. B. Wochenende) besteht";

  if (a.basis === "full_period" && days > 0) {
    if (a.manual) return `Gilt für die gesamte Mietdauer: ${days} ${days === 1 ? "Kalendertag" : "Kalendertage"}${period ? ` (${period})` : ""}`;
    if (a.price_type === "percent") return `${fmtNum(a.rate)} % · ${fullPeriodText}`;
    if (a.price_type === "per_unit") return `${fmtEuro(a.rate)} je Artikel und Kalendertag · ${fullPeriodText}`;
  }
  if (a.manual) return "";
  if (a.price_type === "percent") return `${fmtNum(a.rate)} % der Mietsumme dieser Position`;
  if (a.price_type === "per_unit") return `${fmtEuro(a.rate)} je Artikel und ${a.line_unit || "Einheit"}`;
  return "";
}
