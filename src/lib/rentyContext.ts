/** Seitenkontext für Renty: nur kanonischer Pfad, Standort und Artikel-Slug – keine Querystrings, keine personenbezogenen Daten. */
const LOCS = ["krefeld", "bonn", "muelheim"] as const;
export type RentyLocation = typeof LOCS[number];
export interface RentyPageContext { path: string; location: RentyLocation | null; product: string | null }

export function rentyPageContext(pathname: string, search = ""): RentyPageContext | null {
  const path = pathname.toLowerCase();
  if (!/^\/[a-z0-9\-/]{0,150}$/.test(path)) return null;
  const parts = path.split("/").filter(Boolean);
  const fromPath = parts[0] === "mieten" && (LOCS as readonly string[]).includes(parts[1]) ? (parts[1] as RentyLocation) : null;
  const q = new URLSearchParams(search).get("standort");
  const fromQuery = q && (LOCS as readonly string[]).includes(q) ? (q as RentyLocation) : null;
  const product = parts[0] === "mieten" && parts[3] && /^[a-z0-9-]{1,80}$/.test(parts[3]) ? parts[3] : null;
  return { path, location: fromPath ?? fromQuery, product };
}

/** Kontextbezogene Einstiegsfragen; null = allgemeine Fragen. */
export function rentyStarterQuestions(ctx: RentyPageContext | null): string[] | null {
  if (!ctx) return null;
  const p = ctx.path;
  if (p.startsWith("/tools/aushubrechner")) return ["Wie viel Aushub fällt bei meinem Projekt an?", "Welcher Bagger passt durch meine Zufahrt?", "Wie viele Dumperfahrten brauche ich?"];
  if (p.startsWith("/tools/bautrockner-rechner") || /heizung-trocknung/.test(p)) return ["Wie viele Bautrockner brauche ich für meinen Raum?", "Wie lange dauert die Trocknung nach einem Wasserschaden?", "Bringen Turbolüfter etwas?"];
  if (p.startsWith("/tools/baustromrechner") || /kabel-stromverteiler|aggregate/.test(p)) return ["Welchen Baustromverteiler brauche ich?", "Reicht ein Stromaggregat für meine Geräte?", "Welche CEE-Kabel brauche ich?"];
  if (p.startsWith("/tools")) return ["Welcher Rechner passt zu meinem Projekt?", "Wie viel Aushub fällt an?", "Was kostet die Lieferung?"];
  if (/\/erdbewegung/.test(p)) return ["Welcher Bagger passt zu meinem Projekt?", "Passt der Bagger durch meine Zufahrt?", "Wie viel Aushub fällt an?"];
  if (p.startsWith("/lieferung")) return ["Wie berechnen sich die Lieferkosten?", "Kann ich auch selbst abholen?"];
  return null;
}
