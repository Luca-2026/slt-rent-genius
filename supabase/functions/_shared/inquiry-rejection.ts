/**
 * Absage einer Anfrage mit Entscheidung je angefragtem Artikel.
 * Die Artikelliste kommt immer aus der gespeicherten Anfrage (nie vom Browser),
 * der Browser liefert nur je Position „verfügbar / nicht verfügbar" und
 * optional einen Alternativvorschlag.
 */
import { byForm, type AddressForm } from "./salutation.ts";

export interface RejectionItem {
  index: number;
  name: string;
  quantity: number;
  start_date: string | null;
  end_date: string | null;
}

export interface RejectionAlternative {
  name: string;
  slug: string;
  category: string;
  image: string;
  price: string;
  location: string;
  note: string;
}

export interface RejectionDecision extends RejectionItem {
  available: boolean;
  alternative: RejectionAlternative | null;
}

const str = (v: unknown, max = 200) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : "");
const dateOf = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : null);

/** Alle angefragten Artikel der gespeicherten Anfrage; Fallback: Einzelartikel. */
export function rejectionItemsOf(
  inquiryType: "rental" | "sales",
  inquiry: Record<string, unknown>,
): RejectionItem[] {
  const fallbackName = inquiryType === "rental"
    ? str(inquiry.product_name)
    : [str(inquiry.brand), str(inquiry.model)].filter(Boolean).join(" ");
  const raw = inquiryType === "rental" && Array.isArray(inquiry.requested_items)
    ? (inquiry.requested_items as Record<string, unknown>[])
    : [];
  const list = raw
    .map((r) => ({
      name: str(r?.product_name),
      quantity: Math.max(1, Math.round(Number(r?.quantity) || 1)),
      start_date: dateOf(r?.start_date),
      end_date: dateOf(r?.end_date),
    }))
    .filter((r) => r.name)
    .map((r, index) => ({ index, ...r }));
  if (list.length) return list;
  if (!fallbackName) return [];
  const q = Math.max(1, Math.round(Number(inquiry.quantity) || 1));
  return [{
    index: 0,
    name: fallbackName,
    quantity: q,
    start_date: inquiryType === "rental" ? dateOf(inquiry.start_date) : null,
    end_date: inquiryType === "rental" ? dateOf(inquiry.end_date) : null,
  }];
}

function cleanAlternative(raw: unknown): RejectionAlternative | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  const name = str(a.name);
  if (!name) return null;
  return {
    name,
    slug: str(a.slug, 120),
    category: str(a.category, 120),
    image: str(a.image, 500),
    price: str(a.price, 80),
    location: str(a.location, 80),
    note: str(a.note, 300),
  };
}

export type DecisionResult =
  | { ok: true; decisions: RejectionDecision[] }
  | { ok: false; error: string };

/**
 * Verknüpft die Browser-Entscheidungen (per Index) mit den gespeicherten Artikeln.
 * Ohne Angabe gilt ein Artikel als nicht verfügbar. Mindestens ein Artikel muss
 * nicht verfügbar sein, sonst ist es keine Absage.
 */
export function normalizeRejectionDecisions(items: RejectionItem[], raw: unknown): DecisionResult {
  if (!items.length) return { ok: false, error: "Die Anfrage enthält keinen Artikel." };
  const byIndex = new Map<number, Record<string, unknown>>();
  if (Array.isArray(raw)) {
    for (const r of raw) {
      if (!r || typeof r !== "object") continue;
      const idx = Number((r as Record<string, unknown>).index);
      if (Number.isInteger(idx) && idx >= 0 && idx < items.length) byIndex.set(idx, r as Record<string, unknown>);
    }
  }
  const decisions = items.map((item) => {
    const r = byIndex.get(item.index);
    const available = r?.available === true;
    return { ...item, available, alternative: available ? null : cleanAlternative(r?.alternative) };
  });
  if (!decisions.some((d) => !d.available)) {
    return { ok: false, error: "Mindestens ein Artikel muss als nicht verfügbar markiert sein. Sind alle Artikel verfügbar, bitte ein Angebot erstellen." };
  }
  return { ok: true, decisions };
}

function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const fmtDate = (v: string | null) => {
  if (!v) return "";
  const [y, m, d] = v.split("-");
  return `${d}.${m}.${y}`;
};

export function alternativeUrl(alt: RejectionAlternative, fallbackLocationKey: string, resolveLocationKey: (raw: string) => string) {
  if (!alt.slug || !alt.category) return "";
  const loc = alt.location ? resolveLocationKey(alt.location) : fallbackLocationKey;
  return loc ? `https://www.slt-rental.de/mieten/${loc}/${alt.category}/${alt.slug}/` : "";
}

/** HTML-Liste aller angefragten Artikel mit Status und Alternativvorschlag. */
export function rejectionItemsHtml(
  decisions: RejectionDecision[],
  form: AddressForm,
  opts: { inquiryPeriod: string; locationKey: string; resolveLocationKey: (raw: string) => string },
): string {
  const rows = decisions.map((d) => {
    const ownPeriod = d.start_date
      ? `${fmtDate(d.start_date)}${d.end_date ? ` bis ${fmtDate(d.end_date)}` : ""}`
      : "";
    const period = ownPeriod && ownPeriod !== opts.inquiryPeriod ? ` · ${escapeHtml(ownPeriod)}` : "";
    const badge = d.available
      ? `<span style="display:inline-block;background:#dcfce7;color:#166534;font-weight:bold;font-size:12px;padding:2px 8px;border-radius:999px;">Verfügbar</span>`
      : `<span style="display:inline-block;background:#fee2e2;color:#991b1b;font-weight:bold;font-size:12px;padding:2px 8px;border-radius:999px;">Nicht verfügbar</span>`;
    const alt = d.alternative;
    const url = alt ? alternativeUrl(alt, opts.locationKey, opts.resolveLocationKey) : "";
    const altHtml = alt
      ? `<div style="margin-top:10px;padding:10px 12px;background:#f8fafc;border-radius:6px;">
        <div style="font-size:12px;color:#00507d;font-weight:bold;">${byForm(form, "Unser Vorschlag für dich", "Unser Alternativvorschlag")}</div>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-top:6px;"><tr>
          ${alt.image ? `<td style="width:72px;vertical-align:top;padding-right:10px;"><img src="${escapeHtml(alt.image)}" alt="${escapeHtml(alt.name)}" width="72" style="width:72px;max-width:72px;border-radius:6px;display:block;"></td>` : ""}
          <td style="vertical-align:top;">
            <div style="font-weight:bold;">${escapeHtml(alt.name)}</div>
            ${alt.price ? `<div style="color:#475569;margin-top:2px;">${escapeHtml(alt.price)}</div>` : ""}
            ${alt.note ? `<div style="margin-top:6px;white-space:pre-wrap;">${escapeHtml(alt.note)}</div>` : ""}
            ${url ? `<div style="margin-top:8px;"><a href="${escapeHtml(url)}" style="background:#ff8e02;color:#ffffff;text-decoration:none;padding:8px 14px;border-radius:6px;display:inline-block;">Artikel ansehen</a></div>` : ""}
          </td>
        </tr></table>
      </div>`
      : "";
    return `<tr><td style="padding:12px;border-top:1px solid #e2e8f0;">
      <div><strong>${escapeHtml(d.quantity > 1 ? `${d.quantity} × ${d.name}` : d.name)}</strong>${period}</div>
      <div style="margin-top:6px;">${badge}</div>
      ${altHtml}
    </td></tr>`;
  }).join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e2e8f0;border-radius:8px;margin:20px 0;border-collapse:separate;">
    <tr><td style="padding:10px 12px;background:#f1f5f9;font-weight:bold;color:#00507d;">${byForm(form, "Deine angefragten Artikel", "Ihre angefragten Artikel")}</td></tr>
    ${rows}
  </table>`;
}

/** Einleitungs-/Absagetext je Anrede, Anfrageart und Teil-/Komplettabsage. */
export function rejectionTexts(
  form: AddressForm,
  inquiryType: "rental" | "sales",
  decisions: RejectionDecision[],
) {
  const unavailable = decisions.filter((d) => !d.available);
  const someAvailable = unavailable.length < decisions.length;
  const multi = decisions.length > 1;
  const hasAlternative = unavailable.some((d) => d.alternative);

  let standard: string;
  if (inquiryType === "sales") {
    standard = multi
      ? byForm(form,
        "Leider sind nicht alle angefragten Artikel aktuell verfügbar. Unten siehst du für jeden Artikel, wie es aussieht. Das bedauern wir sehr.",
        "Leider sind nicht alle angefragten Artikel aktuell verfügbar. Unten sehen Sie für jeden Artikel, wie es aussieht. Das bedauern wir sehr.")
      : byForm(form,
        "Leider müssen wir dir mitteilen, dass der angefragte Artikel aktuell nicht verfügbar ist. Das bedauern wir sehr.",
        "Leider müssen wir Ihnen mitteilen, dass der angefragte Artikel aktuell nicht verfügbar ist. Das bedauern wir sehr.");
  } else if (!multi) {
    standard = byForm(form,
      "Leider müssen wir dir mitteilen, dass der gewünschte Mietgegenstand im angefragten Zeitraum bereits ausgebucht und daher nicht verfügbar ist. Das bedauern wir sehr.",
      "Leider müssen wir Ihnen mitteilen, dass der gewünschte Mietgegenstand im angefragten Zeitraum bereits ausgebucht und daher nicht verfügbar ist. Das bedauern wir sehr.");
  } else if (someAvailable) {
    standard = byForm(form,
      "Leider ist ein Teil der angefragten Artikel im gewünschten Zeitraum bereits ausgebucht. Unten siehst du für jeden Artikel, was verfügbar ist und was nicht. Das bedauern wir sehr.",
      "Leider ist ein Teil der angefragten Artikel im gewünschten Zeitraum bereits ausgebucht. Unten sehen Sie für jeden Artikel, was verfügbar ist und was nicht. Das bedauern wir sehr.");
  } else {
    standard = byForm(form,
      "Leider sind alle angefragten Artikel im gewünschten Zeitraum bereits ausgebucht und daher nicht verfügbar. Das bedauern wir sehr.",
      "Leider sind alle angefragten Artikel im gewünschten Zeitraum bereits ausgebucht und daher nicht verfügbar. Das bedauern wir sehr.");
  }

  const closing = someAvailable
    ? byForm(form,
      `Die als verfügbar markierten Artikel${hasAlternative ? " und unsere Vorschläge" : ""} bieten wir dir sehr gern an – antworte einfach kurz auf diese E-Mail oder ruf uns an, dann erstellen wir dir direkt ein Angebot. Du musst die Anfrage nicht neu ausfüllen.`,
      `Die als verfügbar markierten Artikel${hasAlternative ? " und unsere Vorschläge" : ""} bieten wir Ihnen sehr gern an – antworten Sie einfach kurz auf diese E-Mail oder rufen Sie uns an, dann erstellen wir Ihnen direkt ein Angebot. Sie müssen die Anfrage nicht neu ausfüllen.`)
    : hasAlternative
      ? byForm(form,
        "Gerne erstellen wir dir zu unserem Vorschlag ein Angebot – antworte einfach kurz auf diese E-Mail oder ruf uns an. Du musst die Anfrage nicht neu ausfüllen.",
        "Gerne erstellen wir Ihnen zu unserem Vorschlag ein Angebot – antworten Sie einfach kurz auf diese E-Mail oder rufen Sie uns an. Sie müssen die Anfrage nicht neu ausfüllen.")
      : inquiryType === "rental"
        ? byForm(form,
          "Sehr gerne prüfen wir für dich eine Alternative oder einen anderen Zeitraum – melde dich einfach kurz bei uns. Wir unterstützen dich beim nächsten Projekt sehr gerne wieder und freuen uns jederzeit über deine Anfrage.",
          "Sehr gerne prüfen wir für Sie eine Alternative oder einen anderen Zeitraum – melden Sie sich einfach kurz bei uns. Wir unterstützen Sie beim nächsten Projekt sehr gerne wieder und freuen uns jederzeit über Ihre Anfrage.")
        : byForm(form,
          "Sehr gerne prüfen wir für dich eine Alternative aus unserem Bestand – melde dich einfach kurz bei uns. Wir freuen uns jederzeit über deine Anfrage.",
          "Sehr gerne prüfen wir für Sie eine Alternative aus unserem Bestand – melden Sie sich einfach kurz bei uns. Wir freuen uns jederzeit über Ihre Anfrage.");

  return { standard, closing, someAvailable, multi };
}

/** Kurzer Betreff-Zusatz: ein Artikel = Name, mehrere = Anzahl. */
export function rejectionSubjectSuffix(decisions: RejectionDecision[]): string {
  if (decisions.length === 1) return ` – ${decisions[0].name}`;
  return ` – ${decisions.length} Artikel`;
}

/** Interne Notiz: welche Artikel abgesagt, welche verfügbar, welche Alternative. */
export function rejectionNoteSummary(decisions: RejectionDecision[]): string {
  return decisions
    .map((d) => `${d.name}: ${d.available ? "verfügbar" : "nicht verfügbar"}${d.alternative ? ` → Alternative ${d.alternative.name}` : ""}`)
    .join("; ");
}
