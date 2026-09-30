/**
 * Reine Regeln für Übergabe- und Rückgabeprotokolle zu Mietanfragen.
 * Foto-Limit, Artikel aus dem Auftrag, Auswahl der Aufträge – getestet.
 */

/** Höchstzahl Fotos je Protokoll (Zustandsfotos + Schadensfotos zusammen). */
export const MAX_PROTOCOL_PHOTOS = 15;

export type ProtocolKind = "delivery" | "return";

/** Freie Foto-Plätze, wenn schon `used` Fotos im Protokoll sind. */
export function remainingPhotoSlots(used: number, max: number = MAX_PROTOCOL_PHOTOS): number {
  return Math.max(0, max - Math.max(0, used));
}

/** Wie viele von `incoming` neuen Fotos noch aufgenommen werden dürfen. */
export function acceptedPhotoCount(used: number, incoming: number, max: number = MAX_PROTOCOL_PHOTOS): number {
  return Math.min(Math.max(0, incoming), remainingPhotoSlots(used, max));
}

/** Zeitstempel eines Fotos, deutsch: „30.09.2026, 20:15 Uhr“. */
export function formatPhotoTimestamp(iso: string | number | Date): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" });
  const time = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });
  return `${date}, ${time} Uhr`;
}

/**
 * Aufnahmezeit eines Fotos: Änderungsdatum der Datei (Kamera-Fotos tragen die
 * Aufnahmezeit), liegt es in der Zukunft oder fehlt es, gilt die Hochladezeit.
 */
export function photoTakenAt(lastModified: number | undefined, now: number = Date.now()): string {
  if (!lastModified || !Number.isFinite(lastModified) || lastModified > now + 60_000 || lastModified < 946684800000) {
    return new Date(now).toISOString();
  }
  return new Date(lastModified).toISOString();
}

export interface ProtocolItem {
  name: string;
  quantity: number;
  detail: string | null;
}

type InquiryLike = {
  product_name?: string | null;
  quantity?: number | null;
  requested_items?: unknown;
  offer_payload?: unknown;
};

/**
 * Artikel für das Protokoll: aus dem zuletzt versendeten Angebot (maßgeblich
 * für die Auftragsbestätigung), sonst aus den angefragten Artikeln.
 */
export function protocolItemsFromInquiry(inq: InquiryLike): ProtocolItem[] {
  const payload = (inq.offer_payload ?? null) as { items?: unknown } | null;
  const offerItems = Array.isArray(payload?.items) ? (payload!.items as Record<string, unknown>[]) : [];
  const fromOffer = offerItems
    .filter((it) => String(it.product_name ?? "").trim())
    .map((it) => {
      const qty = Number(it.articles ?? it.quantity ?? 1);
      const desc = String(it.description ?? "");
      // Set-Angabe nur bei Set-Artikeln übernehmen (Beschreibungen anderer Positionen können sie fälschlich enthalten)
      const isSet = /set/i.test(String(it.product_name));
      const setInfo = isSet ? desc.split(" · ").find((p) => /Set\b.*Stück/.test(p)) ?? null : null;
      return { name: String(it.product_name).trim(), quantity: qty > 0 ? qty : 1, detail: setInfo };
    });
  if (fromOffer.length) return fromOffer;

  const requested = Array.isArray(inq.requested_items) ? (inq.requested_items as Record<string, unknown>[]) : [];
  const fromRequest = requested
    .filter((it) => String(it.product_name ?? "").trim())
    .map((it) => {
      const qty = Number(it.quantity ?? 1);
      const set = Number(it.set_size ?? 0);
      return {
        name: String(it.product_name).trim(),
        quantity: qty > 0 ? qty : 1,
        detail: set > 1 ? `${qty} × ${set}er Set = ${qty * set} Stück` : null,
      };
    });
  if (fromRequest.length) return fromRequest;

  const name = String(inq.product_name ?? "").trim();
  return name ? [{ name, quantity: inq.quantity && inq.quantity > 0 ? inq.quantity : 1, detail: null }] : [];
}

type CandidateRow = { status: unknown; order_confirmed_at?: string | null };

/**
 * Welche Aufträge stehen zur Auswahl?
 * Übergabe: angenommen (Auftragsbestätigung verschickt oder offen), noch keine Übergabe.
 * Rückgabe: Übergabe erfolgt, noch keine Rückgabe.
 */
export function isProtocolCandidate(
  row: CandidateRow,
  kind: ProtocolKind,
  state: { handedOver: boolean; returned: boolean },
): boolean {
  if (String(row.status) !== "accepted") return false;
  if (state.returned) return false;
  return kind === "delivery" ? !state.handedOver : state.handedOver;
}
