// Standort × Kategorie spezifischer Content
// ------------------------------------------------------------
// Pro Standort × Kategorie ein Eintrag mit sichtbarem, einzigartigem
// Content. Wird im ProductDetail visibel gerendert UND in den
// SSR-Prerender geschrieben, damit Google echte Differenzierung
// zwischen Krefeld-, Bonn- und Mülheim-Varianten sieht.
//
// LEITLINIEN (verbindlich):
// 1. NIEMALS Fakten erfinden. Nur Inhalte, die sich aus locationData
//    (Adresse, Öffnungszeiten, Liefergebiet, Verkehrsanbindung)
//    belegen lassen.
// 2. „Echt lokal" Test: Eine Aussage gehört hier nur rein, wenn sie
//    in Krefeld so NICHT stimmen würde. Generische Tipps („welche
//    Plattengröße") gehören in den Kategorie-FAQ-Block, NICHT hier.
// 3. Terminologie: Bonn = Filiale, Krefeld = Hauptlager,
//    Mülheim = Service-Standort. Kein „Zentrallager Bonn".
// 4. Keine doppelten FAQ-Sektionen: die `faqs` hier werden im
//    bestehenden Produkt-FAQ-Block angehängt (kein zweiter Block).

export interface LocalCategoryFaq {
  q: string;
  a: string;
}

export interface LocalCategoryContent {
  /** 1 Satz, am Standort verankert – wird sichtbar im Standort-Block angezeigt. */
  hookline: string;
  /** Harte Standort-Fakten (Adresse, Öffnungszeiten, A-Anbindung, Liefergebiet).
   *  Ein Absatz, keine Use-Case-Prosa. Wird sichtbar gerendert. */
  standortFakten: string;
  /** Nur wirklich lokale FAQs (Antwort ist standortspezifisch).
   *  Werden in den bestehenden Produkt-FAQ-Block eingehängt. */
  faqs: LocalCategoryFaq[];
}

type LocalContentMap = Record<string, Record<string, LocalCategoryContent>>;

// ------------------------------------------------------------
// Inhalts-Matrix: localContent[locationId][categoryId]
// ------------------------------------------------------------
export const localCategoryContent: LocalContentMap = {
  // =================================================================
  // BONN – Filiale Drachenburgstraße 8, 53179 Bonn (Bad Godesberg/Mehlem)
  // Öffnung: Mo–Fr 07:00–18:00, Sa 08:00–17:30
  // Einzugsgebiet: Bonn, Köln-Süd, Wachtberg, Bad Honnef,
  // Königswinter, Sankt Augustin, Rhein-Sieg-Kreis, Ahrtal
  // =================================================================
  bonn: {
    verdichtung: {
      hookline:
        "Rüttelplatten, Stampfer und Walzen mietest du direkt an unserer Filiale Bonn – mit Lieferung in den Rhein-Sieg-Kreis und ins Ahrtal.",
      standortFakten:
        "Abholung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über die B9, die A555 (Bonn–Köln) und die A565 (Bonner Autobahnring). Geliefert wird ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal bis Bad Neuenahr-Ahrweiler.",
      faqs: [
        {
          q: "Hat die SLT-Filiale Bonn auch samstags geöffnet?",
          a: "Ja. Unsere Filiale Bonn in der Drachenburgstraße 8 ist samstags regulär von 08:00 bis 17:30 Uhr geöffnet – ohne Voranmeldung. Werktags öffnen wir bereits um 07:00 Uhr, eine Stunde früher als unser Hauptsitz in Krefeld. Damit kannst du Verdichtungsgeräte auch für Wochenendeinsätze direkt vor Ort abholen.",
        },
        {
          q: "Liefert ihr Verdichtungsgeräte ins Ahrtal und in den Rhein-Sieg-Kreis?",
          a: "Ja. Ab unserer Filiale Bonn liefern wir Rüttelplatten, Stampfer und Walzen ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag.",
        },
      ],
    },

    erdbewegung: {
      hookline:
        "Minibagger, Dumper und Anbaugeräte mietest du an unserer Filiale Bonn – passend für Tiefbau und GaLaBau zwischen Rhein-Sieg-Kreis, Köln-Süd und Ahrtal.",
      standortFakten:
        "Abholung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über die B9, die A555 (Bonn–Köln) und die A565 (Bonner Autobahnring). Geliefert wird ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal bis Bad Neuenahr-Ahrweiler. Tieflader-Transport für größere Bagger und Dumper organisieren wir bei Bedarf mit.",
      faqs: [
        {
          q: "Welche Bagger und Dumper habt ihr an der Filiale Bonn vor Ort?",
          a: "Wir führen einen Teil unseres Erdbewegungs-Sortiments – darunter Minibagger und passende Anbaugeräte – an unserer Filiale Bonn als Stamm-Sortiment. Modelle, die nicht vor Ort stehen, disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
        {
          q: "Liefert ihr Minibagger ins Ahrtal und in den Rhein-Sieg-Kreis?",
          a: "Ja. Ab unserer Filiale Bonn liefern wir Minibagger, Dumper und Anbaugeräte ins gesamte Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin sowie ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, Lieferung in der Regel am nächsten Werktag. Bei größeren Maschinen organisieren wir den Tieflader-Transport mit.",
        },
      ],
    },

    anhaenger: {
      hookline:
        "Auto-, Kasten-, Planen-, Koffer-, Baumaschinen- und Aggregat-Anhänger mietest du an unserer Filiale Bonn – 24/7 per SMS-Code-Schloss abholbar, persönliche Übergabe Mo–Sa möglich.",
      standortFakten:
        "Abholung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg). Anhänger sind dort rund um die Uhr per SMS-Code-Schloss abholbar – auch nachts, sonntags und an Feiertagen, ohne Personalaufwand. Für persönliche Einweisung, Zubehör (Planen, Spanngurte) oder Beratung sind wir Mo–Fr ab 07:00 Uhr und samstags regulär von 08:00 bis 17:30 Uhr vor Ort. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565. Lieferung im Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal bis Bad Neuenahr-Ahrweiler.",
      faqs: [
        {
          q: "Kann ich den Anhänger an der Filiale Bonn auch nachts oder sonntags abholen?",
          a: "Ja. An unserem Standort Drachenburgstraße 8 in Bonn-Bad Godesberg sind alle Mietanhänger 24/7 per SMS-Code-Schloss abholbar – auch nachts, sonntags und an Feiertagen, ohne dass jemand vor Ort sein muss. Nach der Buchung bekommst du den Code per SMS. Für persönliche Einweisung oder Zubehör nutze zusätzlich unsere regulären Öffnungszeiten Mo–Fr 07:00–18:00 und Sa 08:00–17:30.",
        },
        {
          q: "Welche Anhänger habt ihr an der Filiale Bonn vor Ort?",
          a: "An der Filiale Bonn führen wir das gefragte Anhänger-Kernsortiment direkt vor Ort – darunter Planen-, Koffer-, Baumaschinen- und Aggregat-Anhänger in mehreren Größenklassen. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. Spezialtypen, die nicht vor Ort stehen, disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
      ],
    },

    // Weitere Kategorien folgen in den nächsten Sprints (mit gleichem
    // „echt lokal"-Maßstab: nur Aussagen, die in Krefeld so nicht
    // stimmen würden).
  },

  // =================================================================
  // MÜLHEIM AN DER RUHR – Service-Standort Ruhrorter Str. 122
  // Übergabe nach Vereinbarung in der Bobcat-Filiale,
  // Geräte aus Hauptsitz Krefeld disponiert.
  // Einzugsgebiet: Mülheim, Essen, Duisburg, Oberhausen, Bochum,
  // Gelsenkirchen, Hattingen
  // =================================================================
  muelheim: {
    erdbewegung: {
      hookline:
        "Bagger, Dumper und Bobcat-Geräte für das Ruhrgebiet – Beratung und Übergabe an unserem Service-Standort Mülheim in der Bobcat-Filiale.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Beratung, Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt; das Gerät selbst disponieren wir aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich. Liefer- und Übergabegebiet umfasst das gesamte Ruhrgebiet: Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen.",
      faqs: [
        {
          q: "Stehen die Bagger direkt am Service-Standort Mülheim?",
          a: "Nein. Unser Standort Mülheim ist eine Beratungs- und Übergabe-Stelle in der dortigen Bobcat-Filiale. Die Geräte selbst lagern in unserem Hauptsitz Krefeld und werden auf Anfrage nach Mülheim disponiert – in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig taggleich. Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt.",
        },
        {
          q: "Liefert ihr Bagger nach Essen, Duisburg oder Oberhausen?",
          a: "Ja. Unser Liefer- und Übergabegebiet ab Mülheim umfasst das gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt zum Standort über A40 und A52. Tieflader-Transport für größere Bagger organisieren wir bei Bedarf direkt aus Krefeld.",
        },
      ],
    },

    anhaenger: {
      hookline:
        "Anhänger für das Ruhrgebiet – 24/7 per SMS-Code-Schloss abholbar an unserem Service-Standort Mülheim in der Bobcat-Filiale, persönliche Übergabe nach Vereinbarung.",
      standortFakten:
        "Abholung an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr, eingebettet in die Bobcat-Filiale vor Ort. Anhänger sind dort 24/7 per SMS-Code-Schloss abholbar – auch nachts, sonntags und an Feiertagen. Persönliche Übergabe, Einweisung und Beratung nach Vereinbarung. Anfahrt direkt über A40 (Ruhrschnellweg) und A52. Liefer- und Übergabegebiet umfasst das gesamte Ruhrgebiet: Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen.",
      faqs: [
        {
          q: "Kann ich den Anhänger in Mülheim auch außerhalb der Öffnungszeiten abholen?",
          a: "Ja. An unserem Standort Ruhrorter Str. 122 in der Bobcat-Filiale Mülheim sind Mietanhänger 24/7 per SMS-Code-Schloss abholbar – auch nachts, sonntags und an Feiertagen, ohne dass jemand vor Ort sein muss. Nach der Buchung bekommst du den Code per SMS. Persönliche Übergabe und Einweisung sind zusätzlich nach Vereinbarung möglich.",
        },
        {
          q: "Welche Anhänger habt ihr am Standort Mülheim vor Ort?",
          a: "An unserem Service-Standort Mülheim führen wir einen Teil des Anhänger-Sortiments direkt vor Ort und 24/7 abholbar – unter anderem Baumaschinen- und Plattform-Anhänger sowie weitere häufig gefragte Typen. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. Modelle, die nicht vor Ort stehen, disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
      ],
    },
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
