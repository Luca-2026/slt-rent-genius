/**
 * CMS-Datenpublikation → SEO-Refresh (Paket 1B).
 * Reine, testbare Logik. STANDARDMÄSSIG DEAKTIVIERT: Es existiert kein offiziell
 * unterstützter content-only Deploy auf dem Lovable-Hosting; jede Veröffentlichung
 * würde den aktuellen Entwicklungsstand mit live schalten. Der Koordinator führt
 * daher nur mit explizit übergebenem Adapter aus, nie automatisch beim Speichern.
 */

/** Felder, die in managed_products_public öffentlich sichtbar sind (ohne Zeitstempel). */
export const PUBLIC_FIELDS = [
  "slug", "name", "model_name", "description", "detailed_description", "category", "subcategory",
  "available_locations", "images", "specifications", "features", "tags", "rental_notes",
  "price_per_day", "price_weekend", "price_per_month", "min_rental_months", "weight_kg", "drive_type",
  "rentware_code", "on_request", "pdf_url", "external_manual_url", "video_url", "video_urls", "sort_order",
  "seo_meta_description", "seo_faqs", "seo_local_content", "seo_title", "seo_use_case_bau",
  "seo_use_case_event", "seo_use_case_privat", "related_slugs", "image_alts", "price_unit_label",
  "addon_options", "spec_order", "stocked_locations", "suggested_accessory_slugs", "pricing_scheme",
  "main_category", "price_from_1_rd", "price_from_3_rd", "price_from_10_rd", "price_from_20_rd",
  "price_weekend_num", "price_base_1_3_cd", "surcharge_per_cd_from_4", "surcharge_per_cd_from_8",
  "deposit_amount", "price_short_1_3_rd", "price_from_1_week", "price_from_2_weeks", "price_from_3_weeks",
  "price_from_4_weeks", "prices_same_all_locations",
] as const;

type Row = Record<string, unknown> & { is_published?: boolean | null };

const canon = (v: unknown): string => {
  if (v === undefined) return "null";
  if (Array.isArray(v)) return `[${v.map(canon).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v as object).sort().map((k) => `${JSON.stringify(k)}:${canon((v as Record<string, unknown>)[k])}`).join(",")}}`;
  }
  return JSON.stringify(v);
};

export type ChangeKind = "none" | "published" | "unpublished" | "public_update";

/**
 * Entscheidet, ob eine gespeicherte Änderung öffentliche Artefakte betrifft.
 * Entwürfe (vorher und nachher unveröffentlicht) lösen nie etwas aus.
 * Standortpreise: geänderte Standortpreiszeilen eines publizierten Artikels als `locationPricesChanged` übergeben.
 */
export function classifyChange(before: Row | null, after: Row | null, locationPricesChanged = false): ChangeKind {
  const wasPub = !!before?.is_published;
  const isPub = !!after?.is_published;
  if (!wasPub && !isPub) return "none";
  if (!wasPub && isPub) return "published";
  if (wasPub && !isPub) return "unpublished";
  if (locationPricesChanged) return "public_update";
  return PUBLIC_FIELDS.some((f) => canon(before?.[f]) !== canon(after?.[f])) ? "public_update" : "none";
}

export interface SnapshotCheck { ok: boolean; reason?: string }

/** Ein Snapshot ist nur gültig, wenn er vollständig ist (exakte Zählung) und keine Unveröffentlichten enthält. */
export function validateCatalogSnapshot(rows: unknown, expectedCount: number | null): SnapshotCheck {
  if (!Array.isArray(rows)) return { ok: false, reason: "Antwort ist keine Liste" };
  if (expectedCount === null || !Number.isFinite(expectedCount)) return { ok: false, reason: "Gesamtzahl unbekannt" };
  if (rows.length !== expectedCount) return { ok: false, reason: `unvollständig: ${rows.length} von ${expectedCount}` };
  const ids = new Set<string>();
  for (const r of rows as Row[]) {
    if (!r || typeof r.slug !== "string" || !r.slug) return { ok: false, reason: "Artikel ohne Slug" };
    if (r.is_published === false) return { ok: false, reason: `unveröffentlichter Artikel ${r.slug}` };
    const key = String(r.id ?? r.slug);
    if (ids.has(key)) return { ok: false, reason: `doppelter Artikel ${key}` };
    ids.add(key);
  }
  return { ok: true };
}

/** Liest Gesamtzahl aus PostgREST Content-Range ("0-392/393"). */
export function parseContentRangeTotal(header: string | null): number | null {
  const m = header?.match(/\/(\d+)$/);
  return m ? Number(m[1]) : null;
}

export interface RefreshAdapter<A> {
  /** Lädt und baut Artefakte aus einem Snapshot; darf nichts live schalten. */
  build(revision: number): Promise<{ artifact: A; rows: unknown; expectedCount: number | null }>;
  /** Atomarer Wechsel auf das neue Artefakt. */
  activate(artifact: A): Promise<void>;
}

export type RefreshStatus = "idle" | "pending" | "running" | "updated" | "failed" | "disabled";

export interface RefreshState<A> {
  status: RefreshStatus;
  requestedRevision: number;
  builtRevision: number;
  lastGood: A | null;
  lastError: string | null;
  attempts: number;
}

/**
 * Single-flight-Koordinator mit Watermark: Änderungen während eines Laufs
 * erhöhen requestedRevision und führen zu genau einem Folgelauf (Coalescing).
 * Fehler lassen lastGood unverändert (kein Leeren, kein Überschreiben).
 */
export function createRefreshCoordinator<A>(opts: {
  enabled: boolean;
  adapter: RefreshAdapter<A>;
  maxAttempts?: number;
  backoffMs?: (attempt: number) => number;
  sleep?: (ms: number) => Promise<void>;
}) {
  const maxAttempts = opts.maxAttempts ?? 3;
  const backoff = opts.backoffMs ?? ((a) => Math.min(60_000, 2_000 * 2 ** (a - 1)));
  const sleep = opts.sleep ?? ((ms) => new Promise<void>((r) => setTimeout(r, ms)));
  const state: RefreshState<A> = {
    status: opts.enabled ? "idle" : "disabled", requestedRevision: 0, builtRevision: 0,
    lastGood: null, lastError: null, attempts: 0,
  };
  let running: Promise<void> | null = null;

  async function runOnce(revision: number): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      state.attempts = attempt;
      try {
        const { artifact, rows, expectedCount } = await opts.adapter.build(revision);
        const check = validateCatalogSnapshot(rows, expectedCount);
        if (!check.ok) throw new Error(`Snapshot ungültig: ${check.reason}`);
        await opts.adapter.activate(artifact);
        state.lastGood = artifact;
        state.builtRevision = revision;
        state.lastError = null;
        return true;
      } catch (e) {
        state.lastError = (e as Error).message;
        if (attempt < maxAttempts) await sleep(backoff(attempt));
      }
    }
    return false;
  }

  async function loop() {
    while (state.builtRevision < state.requestedRevision) {
      state.status = "running";
      const target = state.requestedRevision;
      const ok = await runOnce(target);
      if (!ok) { state.status = "failed"; return; }
    }
    state.status = "updated";
  }

  return {
    state,
    /** Meldet eine relevante Änderung. Gibt nie einen Fehler an den CMS-Speichervorgang weiter. */
    notify(kind: ChangeKind): Promise<void> {
      if (!opts.enabled || kind === "none") return Promise.resolve();
      state.requestedRevision += 1;
      if (state.status !== "running") state.status = "pending";
      if (!running) {
        running = loop().catch((e) => { state.status = "failed"; state.lastError = String(e); })
          .finally(() => { running = null; });
      }
      return running;
    },
  };
}
