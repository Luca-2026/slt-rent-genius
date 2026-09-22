/**
 * Gemeinsame Bausteine für Übergabe- und Rücknahmeprotokoll.
 * Kategorien für Schäden, Vorlagen für Zusatzkosten, Maschinenerkennung
 * und der Foto-Upload werden von beiden Protokollen genutzt.
 */
import { supabase } from "@/integrations/supabase/client";

export const DAMAGE_CATEGORIES = [
  { value: "kratzer", label: "Kratzer" },
  { value: "delle", label: "Delle" },
  { value: "schlag", label: "Schlag / Bruch" },
  { value: "lack", label: "Lack" },
  { value: "glas", label: "Glas / Scheibe" },
  { value: "reifen", label: "Reifen / Fahrwerk" },
  { value: "verschmutzung", label: "Verschmutzung" },
  { value: "technischer_defekt", label: "Technischer Defekt" },
  { value: "fehlendes_zubehoer", label: "Fehlendes Zubehör" },
  { value: "sonstiges", label: "Sonstiges" },
] as const;

export type DamageCategory = (typeof DAMAGE_CATEGORIES)[number]["value"];

export const damageCategoryLabel = (value: string) =>
  DAMAGE_CATEGORIES.find((c) => c.value === value)?.label || value;

export interface ProtocolDamage {
  id: string;
  itemName: string;
  category: DamageCategory | string;
  description: string;
  amount: string;
  photos: { file: File; preview: string }[];
  uploadedPaths?: string[];
}

export const emptyDamage = (itemName = ""): ProtocolDamage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  itemName,
  category: "kratzer",
  description: "",
  amount: "",
  photos: [],
});

export interface ExtraCharge {
  id: string;
  label: string;
  quantity: string;
  unitPrice: string;
  notes: string;
}

export const EXTRA_CHARGE_TEMPLATES: { label: string; unitPrice: string }[] = [
  { label: "Reinigung", unitPrice: "" },
  { label: "Fehlender Kraftstoff", unitPrice: "" },
  { label: "Betriebsstunden über Inklusivkontingent", unitPrice: "" },
  { label: "Verspätete Rückgabe", unitPrice: "" },
  { label: "Fehlendes Zubehör", unitPrice: "" },
];

export const emptyExtraCharge = (label = ""): ExtraCharge => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  label,
  quantity: "1",
  unitPrice: "",
  notes: "",
});

export const toNumber = (v: string) => {
  const n = parseFloat((v || "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

export const extraChargeTotal = (c: ExtraCharge) => toNumber(c.quantity) * toNumber(c.unitPrice);

export const sumExtraCharges = (list: ExtraCharge[]) =>
  list.reduce((sum, c) => sum + extraChargeTotal(c), 0);

export const sumDamages = (list: ProtocolDamage[]) =>
  list.reduce((sum, d) => sum + toNumber(d.amount), 0);

export const formatEuro = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

/**
 * Maschinen benötigen Betriebsstunden und Tankfüllstand.
 * Erst wird die Kategorie aus dem Artikelstamm geprüft, sonst greifen Stichwörter.
 */
const MACHINE_CATEGORY_SLUGS = [
  "erdbewegung",
  "baumaschinen",
  "verdichtung",
  "stromerzeuger",
  "stromversorgung",
  "nutzfahrzeuge",
  "hebetechnik",
  "arbeitsbuehnen",
  "kompressoren",
  "pumpen",
];

const MACHINE_KEYWORDS = [
  "bagger",
  "dumper",
  "aggregat",
  "radlader",
  "stromerzeuger",
  "generator",
  "stampfer",
  "ruettelplatte",
  "rüttelplatte",
  "walze",
  "kompressor",
  "arbeitsbühne",
  "arbeitsbuehne",
  "teleskoplader",
  "gabelstapler",
  "kehrmaschine",
  "motorpumpe",
  "kettensäge",
  "kettensaege",
  "trennschleifer",
  "erdrakete",
  "minibagger",
  "lkw",
  "transporter",
];

export function isMachineLike(
  names: (string | null | undefined)[],
  categorySlugs: (string | null | undefined)[] = [],
): boolean {
  const cats = categorySlugs.filter(Boolean).map((c) => String(c).toLowerCase());
  if (cats.some((c) => MACHINE_CATEGORY_SLUGS.some((m) => c.includes(m)))) return true;
  return names
    .filter(Boolean)
    .map((n) => String(n).toLowerCase())
    .some((n) => MACHINE_KEYWORDS.some((kw) => n.includes(kw)));
}

export const FUEL_LEVELS = [
  { value: "voll", label: "Voll (100 %)" },
  { value: "dreiviertel", label: "¾ (75 %)" },
  { value: "halb", label: "½ (50 %)" },
  { value: "viertel", label: "¼ (25 %)" },
  { value: "leer", label: "Leer" },
];

export const CLEANLINESS_HINT = "1 = Sehr verschmutzt · 5 = Sauber";

/** Lädt Schadensfotos in den geschützten Dokumentenspeicher und gibt die Pfade zurück. */
export async function uploadDamagePhotos(
  profileId: string,
  photos: { file: File; preview: string }[],
): Promise<string[]> {
  const paths: string[] = [];
  for (const photo of photos) {
    const ext = photo.file.name.split(".").pop() || "jpg";
    const path = `protocol-damages/${profileId}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const { error } = await supabase.storage.from("b2b-documents").upload(path, photo.file, { upsert: true });
    if (error) {
      console.error("Foto-Upload fehlgeschlagen:", error);
      continue;
    }
    paths.push(path);
  }
  return paths;
}

/** Bereitet die Schäden für den Versand an die Edge Function auf (inkl. Upload). */
export async function serializeDamages(profileId: string, damages: ProtocolDamage[]) {
  const result: {
    item_name: string | null;
    category: string;
    description: string | null;
    amount: number | null;
    photo_urls: string[];
  }[] = [];
  for (const d of damages) {
    const uploaded = await uploadDamagePhotos(profileId, d.photos);
    result.push({
      item_name: d.itemName || null,
      category: d.category,
      description: d.description || null,
      amount: d.amount ? toNumber(d.amount) : null,
      photo_urls: uploaded,
    });
  }
  return result;
}

export const serializeExtraCharges = (list: ExtraCharge[]) =>
  list
    .filter((c) => c.label.trim())
    .map((c) => ({
      label: c.label.trim(),
      quantity: toNumber(c.quantity) || 1,
      unit_price: toNumber(c.unitPrice),
      notes: c.notes || null,
    }));
