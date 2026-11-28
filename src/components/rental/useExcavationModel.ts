import { useMemo } from "react";
import { LOCATION_LABELS } from "@/lib/inventoryAvailability";
import { getLocationById, getProductsForLocationCategory } from "@/data/rentalData";
import { useManagedProductsVersion } from "@/data/managedProductsCache";
import { computeState, soilResult, readMachine, recommendExcavators, accessSanityHint, assessDumper, type ExcState, type Assessment } from "@/lib/excavationCalculator";

export interface Machine { id: string; name: string; image?: string; sub: string; onRequest: boolean; rentware: boolean; data: ReturnType<typeof readMachine> }
/** Gemeinsame Auswertung für Rechner und Projektbericht – damit beide exakt dasselbe zeigen. */
export function useExcavationModel(s: ExcState, locationId?: string) {
  const version = useManagedProductsVersion();
  const c = computeState(s);
  const r = soilResult(c.bank, c.density, c.loosening);
  const machines: Machine[] = useMemo(() => {
    const list = locationId ? getProductsForLocationCategory(locationId, "erdbewegung") : [];
    return list.map((p) => ({ id: p.id, name: p.name, image: p.image, sub: p.category ?? "", onRequest: !!p.onRequest, rentware: !!(locationId && p.rentwareCode?.[locationId]), data: readMachine(p.specifications) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, version]);
  const excavators = machines.filter((m) => /bagger/.test(m.sub));
  const pick = recommendExcavators(excavators, { volume: c.bank, depthM: c.depthM, accessM: c.accessM });
  const dumpers = machines.filter((m) => /dumper/.test(m.sub)).map((m) => ({ ...m, a: assessDumper(m.data, c.accessM, r.loose, r.looseDensity, c.fill) }));
  const bestDumper = dumpers.filter((d) => d.a.status === "fit").sort((a, b) => a.a.trips!.trips - b.a.trips!.trips)[0];
  // Paket/Warenkorb ausschließlich mit nach Daten passenden Geräten.
  const lines = [pick.main && { slug: pick.main.id, qty: 1 }, bestDumper && { slug: bestDumper.id, qty: 1 }].filter(Boolean) as { slug: string; qty: number }[];
  const byId = (id: string) => machines.find((m) => m.id === id);
  const location = locationId ? getLocationById(locationId) : undefined;
  return { c, r, accessHint: accessSanityHint(c.accessM, excavators), machines, excavators, pick, dumpers, bestDumper, lines, byId, location, locName: location ? LOCATION_LABELS[location.id] ?? location.name : undefined };
}
export const productPath = (locationId: string, id: string) => `/mieten/${locationId}/erdbewegung/${id}`;
export const statusLabel = (a: Pick<Assessment, "status"> & { accessTier?: Assessment["accessTier"] }) => (a.status === "check" && a.accessTier === "tight" ? "Sehr knapp – persönliche Prüfung nötig" : a.status === "check" && a.accessTier === "possible" ? "Potenziell passend – genau prüfen lassen" : a.status === "fit" ? "Nach vorliegenden Daten passend" : a.status === "check" ? "Eignung prüfen lassen" : "Nach Daten ungeeignet");

const n1 = (v: number, d = 1) => v.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
export const SHAPE_LABELS: Record<string, string> = { rect: "Rechteck", area: "Fläche", trench: "Graben", circle: "Kreis", volume: "Bekanntes Volumen" };
/** Beschreibung einer Teilfläche mit Maßen, z. B. „Graben 20 m × 40 cm × 80 cm“. */
export function shapeText(x: { kind: string; a?: number; b?: number; c?: number }) {
  const v = (n?: number) => (n == null ? "–" : n.toLocaleString("de-DE", { maximumFractionDigits: 2 }));
  switch (x.kind) {
    case "rect": return `${v(x.a)} m × ${v(x.b)} m × ${v(x.c)} cm tief`;
    case "area": return `${v(x.a)} m² × ${v(x.c)} cm tief`;
    case "trench": return `${v(x.a)} m lang × ${v(x.b)} cm breit × ${v(x.c)} cm tief`;
    case "circle": return `Ø ${v(x.a)} m × ${v(x.c)} cm tief`;
    default: return `${v(x.a)} m³`;
  }
}
/** Text für die Anfrage an SLT – nur Projektparameter, keine personenbezogenen Daten. */
export function inquiryMessage(m: ReturnType<typeof useExcavationModel>, project: string, soilLabel: string, shareUrl: string) {
  const { c, r, pick, bestDumper } = m;
  return [
    `Aushubrechner – ${project}`,
    ...c.shapes.map((x, i) => `Teilfläche ${i + 1}: ${SHAPE_LABELS[x.kind]} ${shapeText(x)}`),
    `Bodenart: ${soilLabel} (${n1(c.density)} t/m³, ${n1(c.loosening, 0)} % Auflockerung)`,
    `Volumen: ${n1(r.bank)} m³ gewachsen / ${n1(r.loose)} m³ gelockert, ca. ${n1(r.tons)} t`,
    `Schmalste Zufahrt: ${c.accessM ? `${n1(c.accessM * 100, 0)} cm` : "nicht angegeben"} · Miettage: ${c.days}`,
    pick.main ? `Passend nach Daten: ${pick.main.name}${bestDumper ? `, ${bestDumper.name}` : ""}` : "Bitte passende Maschine empfehlen.",
    `Konfiguration: ${shareUrl}`,
  ].join("\n");
}
