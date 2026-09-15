import type { Product } from "./rentalData";

export interface ProductFaq {
  q: string;
  a: string;
}

export interface DrivingLicenseInfo {
  heading: string;
  text: string;
}

const normalizeQuestion = (value: string) =>
  value.toLocaleLowerCase("de-DE").replace(/[^a-z0-9äöüß]+/g, " ").trim();

export function getDrivingLicenseInfo(
  product: Pick<Product, "id" | "name" | "weightKg" | "specifications" | "tags">,
  categoryId: string,
): DrivingLicenseInfo | undefined {
  const check = "Prüfe vor Fahrtantritt Führerschein, Fahrzeugpapiere und die zulässige Anhängelast des Zugfahrzeugs.";

  if (categoryId === "anhaenger") {
    if (product.id === "baumaschinen-3500") {
      return {
        heading: "Führerschein und Zugfahrzeug",
        text: `Laut Fahrzeugdaten ist Klasse BE oder die alte Klasse 3 erforderlich. ${check}`,
      };
    }
    if (product.weightKg === 750) {
      return {
        heading: "Führerschein und Zugfahrzeug",
        text: `Für diesen Anhänger mit 750 kg zulässigem Gesamtgewicht reicht Klasse B. ${check}`,
      };
    }
    if (typeof product.weightKg === "number" && product.weightKg > 750) {
      return {
        heading: "Führerschein und Zugfahrzeug",
        text: `Welche Fahrerlaubnis passt, hängt bei diesem Anhänger vom zulässigen Gesamtgewicht des gesamten Gespanns ab: Klasse B gilt bis 3.500 kg, B96 für Kombinationen über 3.500 bis 4.250 kg und BE darüber im Rahmen der jeweiligen Klassenbestimmungen. ${check}`,
      };
    }
  }

  if (product.id === "man-kipper-meiller-d205") {
    return {
      heading: "Führerschein",
      text: "Für den 7,49-t-Dreiseitenkipper ist Klasse C1 erforderlich. Eine alte Klasse 3 kann Bestandsschutz umfassen; maßgeblich ist der konkrete Eintrag im Führerschein.",
    };
  }
  if (product.id === "pritschenkipper-3-5t-dreiseitenkipper") {
    return {
      heading: "Führerschein",
      text: `Der 3,5-t-Pritschenkipper ist mit Klasse B fahrbar. ${check}`,
    };
  }
  if (product.id === "weinsberg-caraone-480-qdk") {
    return {
      heading: "Führerschein und Zugfahrzeug",
      text: `Der Wohnwagen hat 1.500 kg zulässiges Gesamtgewicht und benötigt ein Zugfahrzeug mit mindestens 1.500 kg zulässiger Anhängelast. Ob Klasse B, B96 oder BE erforderlich ist, hängt von den zulässigen Gesamtmassen der Kombination ab. ${check}`,
    };
  }
  return undefined;
}

function factFaqs(product: Product, categoryId: string): ProductFaq[] {
  const items: ProductFaq[] = [];
  const driving = getDrivingLicenseInfo(product, categoryId);
  if (driving) {
    items.push({ q: `Welchen Führerschein brauche ich für ${product.name}?`, a: driving.text });
  }

  const specs = Object.entries(product.specifications ?? {}).slice(0, 4);
  if (specs.length) {
    items.push({
      q: `Welche technischen Daten hat ${product.name}?`,
      a: specs.map(([name, value]) => `${name}: ${value}`).join("; ") + ".",
    });
  }
  if (product.description?.trim()) {
    items.push({
      q: `Was zeichnet ${product.name} aus?`,
      a: product.description.trim(),
    });
  }
  if (product.rentalNotes?.length) {
    items.push({
      q: `Welche Mietbedingungen gelten für ${product.name}?`,
      a: product.rentalNotes.slice(0, 3).join("; ") + ".",
    });
  }
  return items;
}

/**
 * Eine gemeinsame FAQ-Kaskade für sichtbare Seite, Prerendering und JSON-LD.
 * Redaktionelle Produkt-FAQs haben Vorrang. Belegte Kategorie-, Standort- und
 * Produktstammdaten ergänzen nur fehlende Fragen und sichern mindestens drei
 * Antworten, sofern der Datensatz genügend belastbare Fakten enthält.
 */
export function resolveProductFaqs({
  product,
  categoryId,
  productFaqs,
  categoryFaqs,
  localFaqs,
  minimum = 3,
}: {
  product: Product;
  categoryId: string;
  productFaqs?: ProductFaq[] | null;
  categoryFaqs?: ProductFaq[] | null;
  localFaqs?: ProductFaq[] | null;
  minimum?: number;
}): ProductFaq[] {
  const preferred = productFaqs?.length ? productFaqs : (categoryFaqs ?? []);
  const candidates = [...preferred, ...(localFaqs ?? []), ...factFaqs(product, categoryId)];
  const seen = new Set<string>();
  const result: ProductFaq[] = [];
  for (const faq of candidates) {
    const q = faq.q?.trim();
    const a = faq.a?.trim();
    if (!q || !a) continue;
    const key = normalizeQuestion(q);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ q, a });
  }
  return result.length >= minimum ? result : result;
}

export function localizeProductText(
  text: string,
  location: { name: string; email: string },
): string {
  const { name, email } = location;
  let result = text
    .replace(/Genehmigungs-Kopie an die jeweilige Standort-E-Mail senden \(krefeld@\/bonn@\/muelheim@slt-rental\.de\)/gi, `Genehmigungs-Kopie an ${email} senden`)
    .replace(/Genehmigungs-Kopie an mieten@slt-rental\.de/gi, `Genehmigungs-Kopie an ${email}`)
    .replace(/Genehmigungs-Kopie an (?:krefeld|bonn|muelheim)@slt-rental\.de/gi, `Genehmigungs-Kopie an ${email}`)
    .replace(/an mieten@slt-rental\.de gesendet/gi, `an ${email} gesendet`)
    .replace(/an (?:krefeld|bonn|muelheim)@slt-rental\.de gesendet/gi, `an ${email} gesendet`)
    .replace(/Bonn\s*[&,]\s*Krefeld\s*[&,]\s*Mülheim(?:\s*an\s*der\s*Ruhr)?/gi, name)
    .replace(/Krefeld\s*[&,]\s*Bonn\s*[&,]\s*Mülheim(?:\s*an\s*der\s*Ruhr)?/gi, name)
    .replace(/Bonn\s*[&,]\s*Krefeld/gi, name)
    .replace(/Krefeld\s*[&,]\s*Bonn/gi, name);
  if (name !== "Krefeld") result = result.replace(/\bKrefeld\b/g, name);
  if (name !== "Bonn") result = result.replace(/\bBonn\b/g, name);
  if (!name.startsWith("Mülheim")) result = result.replace(/\bMülheim(?:\s*an\s*der\s*Ruhr)?\b/g, name);
  return result;
}