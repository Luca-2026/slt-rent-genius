// Sprint 1/2 – Standort × Kategorie spezifischer Content
// ------------------------------------------------------------
// Pro Standort × Kategorie ein Eintrag mit sichtbarem, einzigartigem
// SEO-Content. Wird im ProductDetail visibel gerendert UND in den
// SSR-Prerender geschrieben, damit Google echte Differenzierung
// zwischen Krefeld-, Bonn- und Mülheim-Varianten sieht.
//
// Pflegeprinzip: ~10 Kategorien × 2 Filial-Standorte = ~20 Einträge
// (Krefeld ist Hauptstandort und braucht keinen Sonder-Block, weil
// dort kein Duplikat-Problem mit "Lieferung aus Krefeld" besteht).
//
// WICHTIG: NIEMALS Fakten erfinden. Nur Inhalte, die wir aus
// locationData (Adresse, Liefergebiet, Branchenfokus) und realistischen
// Anwendungs-Kontexten ableiten können.

export interface LocalCategoryFaq {
  q: string;
  a: string;
}

export interface LocalCategoryContent {
  /** Kurze, sichtbare Einleitung am Standort-Bezug verankert */
  hookline: string;
  /** Realistischer lokaler Anwendungsfall (1 Absatz, 2–3 Sätze) */
  useCase: string;
  /** Hinweis zu Lieferradius / Verkehrsanbindung am Standort */
  deliveryNote: string;
  /** 2 standortspezifische FAQs */
  faqs: LocalCategoryFaq[];
}

type LocalContentMap = Record<string, Record<string, LocalCategoryContent>>;

// ------------------------------------------------------------
// Inhalts-Matrix: localContent[locationId][categoryId]
// ------------------------------------------------------------
export const localCategoryContent: LocalContentMap = {
  // =================================================================
  // BONN – Filiale Drachenburgstraße 8, 53179 Bonn
  // Einzugsgebiet: Bonn, Köln-Süd, Wachtberg, Bad Honnef,
  // Königswinter, Sankt Augustin, Rhein-Sieg-Kreis, Ahrtal
  // =================================================================
  bonn: {
    verdichtung: {
      hookline:
        "Rüttelplatten, Stampfer und Walzen für Tiefbau und Pflasterarbeiten in Bonn und der Rheinschiene – ab unserem Standort Drachenburgstraße in Bonn-Beuel.",
      useCase:
        "Typische Einsätze in unserem Bonner Einzugsgebiet sind Pflasterbettverdichtung in Wohngebieten von Bad Godesberg, Plettenberg, Beuel und der Bonner Südstadt sowie Grabenverdichtung bei Versorgerleitungen im Rhein-Sieg-Kreis. Für GaLaBau-Betriebe in Wachtberg und Königswinter halten wir die gängigen Plattengrößen von 60 kg bis über 400 kg vor, jeweils benzin- oder dieselbetrieben.",
      deliveryNote:
        "Lieferung im Bonner Stadtgebiet, nach Sankt Augustin, Troisdorf, Königswinter, Bad Honnef, Wachtberg und ins Ahrtal in der Regel am nächsten Werktag. Anfahrt über die A555 (Bonn–Köln), A565 (Bonner Autobahnring) und A59 (Rechtsrheinisch). Abholung vor Ort an der Drachenburgstraße 8 in Bonn-Beuel ab 7:00 Uhr.",
      faqs: [
        {
          q: "Welche Rüttelplatte ist für Pflasterarbeiten in Bonn typisch?",
          a: "Für die Verdichtung von Bettungssand und Pflasterfugen in Bonner Hof- und Gartenprojekten reichen Rüttelplatten zwischen 90 kg und 160 kg. Für größere Hofflächen oder Tiefbauarbeiten im Rhein-Sieg-Kreis kommen 200 kg bis 400 kg Klassen zum Einsatz. Wir beraten zur passenden Größe direkt am Standort Bonn.",
        },
        {
          q: "Liefern Sie Rüttelplatten auch in Bad Godesberg und Königswinter?",
          a: "Ja, unser Liefergebiet ab Bonn umfasst das gesamte Bonner Stadtgebiet (inkl. Bad Godesberg, Beuel, Hardtberg), den linksrheinischen Rhein-Sieg-Kreis bis Wachtberg und Meckenheim sowie rechtsrheinisch Königswinter, Bad Honnef und Sankt Augustin. Lieferung in der Regel am nächsten Werktag, kurzfristige Buchungen nach Verfügbarkeit auch taggleich.",
        },
      ],
    },
    // Weitere Kategorien für Bonn werden in nachfolgenden Sprints ergänzt:
    // erdbewegung, anhaenger, werkzeug, gartenpflege, arbeitsbuehnen, event, ...
  },

  // =================================================================
  // MÜLHEIM AN DER RUHR – Service-Standort Ruhrorter Str. 122
  // Einzugsgebiet: Mülheim, Essen, Duisburg, Oberhausen, Bochum,
  // Gelsenkirchen, Hattingen
  // =================================================================
  muelheim: {
    // Inhalte folgen in Sprint 3 (Mülheim/Verdichtung)
  },
};

/**
 * Liefert den standortspezifischen Inhalt oder `null`, wenn (noch) nichts
 * gepflegt ist. Komponenten rendern in dem Fall keinen zusätzlichen Block.
 */
export function getLocalCategoryContent(
  locationId: string | undefined,
  categoryId: string | undefined,
): LocalCategoryContent | null {
  if (!locationId || !categoryId) return null;
  return localCategoryContent[locationId]?.[categoryId] ?? null;
}
