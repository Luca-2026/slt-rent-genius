/**
 * Gemeinsame Produktbild-Auflösung für Angebots- und Rechnungs-PDFs.
 *
 * Hintergrund: Bilder fehlten in Dokumenten, weil
 *  - Vite-gehashte /assets/… Pfade nach jedem Build ungültig werden,
 *  - Preview-/localhost-Origins vom Edge-Runtime nicht erreichbar sind,
 *  - CMS-Produkte (b2b_managed_products) im statischen Frontend-Lookup fehlen,
 *  - pdf-lib ausschließlich JPEG und PNG einbetten kann (kein WebP/AVIF).
 */

export const SITE_ORIGIN = "https://www.slt-rental.de";

const SUPPORTED_EXT = /\.(jpe?g|png)$/i;

/** Absolute, öffentlich erreichbare URL erzeugen (oder null, wenn unbrauchbar). */
export function normalizeImageUrl(raw?: string | null): string | null {
  if (!raw) return null;
  let s = String(raw).trim();
  if (!s || s.toLowerCase().includes("placeholder")) return null;

  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      // Storage- und Live-URLs unverändert übernehmen
      if (u.hostname.endsWith("supabase.co") || u.hostname === "www.slt-rental.de") return s;
      // Preview-, Dev- und Lovable-Hosts auf die Live-Domain umbiegen
      s = u.pathname;
    } catch {
      return null;
    }
  }

  if (!s.startsWith("/")) s = `/${s}`;
  // Build-abhängige Pfade sind für externe Dokumente wertlos
  if (s.startsWith("/assets/") || s.startsWith("/src/")) return null;
  return `${SITE_ORIGIN}${s}`;
}

/** Aus einer Bilderliste das für PDFs am besten geeignete Bild wählen. */
export function pickPdfImage(images?: (string | null)[] | null): string | null {
  const list = (images || []).filter(Boolean).map(String);
  if (!list.length) return null;
  const supported = list.find((i) => SUPPORTED_EXT.test(i.split("?")[0]));
  return normalizeImageUrl(supported || list[0]);
}

/** WebP/AVIF kann pdf-lib nicht – daher zusätzlich JPG/PNG-Geschwister probieren. */
function imageCandidates(url: string): string[] {
  const base = url.split("?")[0];
  if (SUPPORTED_EXT.test(base)) return [url];
  const stem = base.replace(/\.[a-z0-9]+$/i, "");
  return [`${stem}.jpg`, `${stem}.jpeg`, `${stem}.png`];
}

/**
 * Fehlende Bilder serverseitig aus dem CMS nachschlagen (Name -> Bild-URL).
 * Damit funktionieren Dokumente auch für Produkte, die es nur im CMS gibt.
 */
export async function resolveImagesByName(
  client: any,
  names: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const unique = Array.from(new Set(names.map((n) => (n || "").trim()).filter(Boolean)));
  if (!unique.length) return result;

  try {
    const { data, error } = await client
      .from("managed_products_public")
      .select("name, images")
      .in("name", unique);
    if (error) {
      console.error("resolveImagesByName failed:", error.message);
      return result;
    }
    for (const row of data || []) {
      const url = pickPdfImage(row.images);
      if (url) result.set(String(row.name).trim().toLowerCase(), url);
    }
  } catch (e) {
    console.error("resolveImagesByName exception:", (e as Error).message);
  }
  return result;
}

const FETCH_HEADERS = {
  // Manche Hoster (Serverprofis) resetten Verbindungen ohne Browser-typische Header
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept": "image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8",
  "Accept-Language": "de-DE,de;q=0.9",
};

async function fetchImageBytes(url: string): Promise<Uint8Array | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const resp = await fetch(url, { signal: controller.signal, headers: FETCH_HEADERS });
      clearTimeout(timeout);
      if (!resp.ok) {
        await resp.body?.cancel();
        return null;
      }
      const bytes = new Uint8Array(await resp.arrayBuffer());
      return bytes.length ? bytes : null;
    } catch (e) {
      if (attempt === 1) {
        console.warn(`Bild konnte nicht geladen werden: ${url} (${(e as Error).message})`);
        return null;
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  return null;
}

/**
 * Bilder laden und in das PDF-Dokument einbetten.
 * Rückgabe: Map original-URL -> eingebettetes pdf-lib-Bild.
 */
export async function embedProductImages(
  doc: any,
  urls: (string | null | undefined)[],
): Promise<Map<string, any>> {
  const cache = new Map<string, any>();
  const unique = Array.from(new Set(urls.filter(Boolean).map(String)));

  // Begrenzte Parallelität – zu viele gleichzeitige Requests werden vom Webserver abgewiesen
  const queue = [...unique];
  const worker = async () => {
    while (queue.length) {
      const url = queue.shift()!;
      let done = false;
      for (const candidate of imageCandidates(url)) {
        const bytes = await fetchImageBytes(candidate);
        if (!bytes) continue;
        const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
        const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8;
        if (!isPng && !isJpg) {
          console.warn(`Bildformat für PDF nicht unterstützt: ${candidate}`);
          continue;
        }
        try {
          cache.set(url, isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes));
          done = true;
          break;
        } catch (e) {
          console.warn(`Einbetten fehlgeschlagen: ${candidate} (${(e as Error).message})`);
        }
      }
      if (!done) console.warn(`Kein einbettbares Bild gefunden für: ${url}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, unique.length) }, worker));

  return cache;
}
