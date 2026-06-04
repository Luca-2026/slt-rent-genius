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
// 3. Terminologie: Bonn = Filiale, Krefeld = Hauptsitz,
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
        "Auto-, Kasten-, Planen-, Koffer-, Baumaschinen- und Aggregat-Anhänger mietest du an unserer Filiale Bonn – 24/7 an 365 Tagen im Jahr per SMS-Code-Schloss abholbar und zurückgebbar. Anhänger werden grundsätzlich abgeholt, eine Lieferung bieten wir hierfür nicht an.",
      standortFakten:
        "Abholung und Rückgabe an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg) – 24/7 an 365 Tagen im Jahr per SMS-Code-Schloss, auch nachts, sonntags und an Feiertagen, ohne Personalaufwand. Für persönliche Einweisung, Zubehör (Planen, Spanngurte) oder Beratung sind wir Mo–Fr ab 07:00 Uhr und samstags regulär von 08:00 bis 17:30 Uhr vor Ort. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565. Hinweis: Mietanhänger werden ausschließlich vor Ort abgeholt und zurückgegeben – eine Lieferung wie bei Baumaschinen ist für Anhänger und Nutzfahrzeuge nicht vorgesehen.",
      faqs: [
        {
          q: "Kann ich den Anhänger an der Filiale Bonn auch nachts, sonntags oder an Feiertagen abholen und zurückgeben?",
          a: "Ja. An unserem Standort Drachenburgstraße 8 in Bonn-Bad Godesberg sind alle Mietanhänger 24/7 an 365 Tagen im Jahr per SMS-Code-Schloss abholbar und zurückgebbar – auch nachts, sonntags und an Feiertagen, ohne dass jemand vor Ort sein muss. Nach der Buchung bekommst du den Code per SMS. Für persönliche Einweisung oder Zubehör nutze zusätzlich unsere regulären Öffnungszeiten Mo–Fr 07:00–18:00 und Sa 08:00–17:30.",
        },
        {
          q: "Liefert ihr Anhänger auch nach Bonn oder ins Ahrtal?",
          a: "Nein. Anhänger und Nutzfahrzeuge werden bei uns grundsätzlich nicht geliefert – sie werden an der Filiale Bonn (Drachenburgstraße 8) abgeholt und dort wieder zurückgegeben. Dafür ist die Abholung und Rückgabe 24/7 an 365 Tagen im Jahr per SMS-Code-Schloss möglich, also völlig unabhängig von Öffnungszeiten.",
        },
        {
          q: "Welche Anhänger habt ihr an der Filiale Bonn vor Ort?",
          a: "An der Filiale Bonn führen wir das gefragte Anhänger-Kernsortiment direkt vor Ort – darunter Planen-, Koffer-, Baumaschinen- und Aggregat-Anhänger in mehreren Größenklassen. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. Spezialtypen, die nicht vor Ort stehen, disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
      ],
    },

    arbeitsbuehnen: {
      hookline:
        "Scheren-, Mast- und Anhängerbühnen mietest du an unserer Filiale Bonn – mit Lieferung ins Bonner Stadtgebiet, in den Rhein-Sieg-Kreis und ins Ahrtal.",
      standortFakten:
        "Abholung und Einweisung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Geliefert wird ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anhängerbühnen werden vor Ort abgeholt, selbstfahrende Bühnen liefern wir per Transport an die Einsatzstelle.",
      faqs: [
        {
          q: "Liefert ihr Arbeitsbühnen ins Ahrtal und in den Rhein-Sieg-Kreis?",
          a: "Ja. Ab unserer Filiale Bonn liefern wir selbstfahrende Scheren- und Mastbühnen ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag. Anhängerbühnen werden direkt vor Ort an der Drachenburgstraße abgeholt.",
        },
        {
          q: "Welche Arbeitsbühnen habt ihr an der Filiale Bonn vor Ort?",
          a: "An der Filiale Bonn führen wir ein Kernsortiment an Arbeitsbühnen direkt vor Ort – darunter Scheren-, Mast- und Anhängerbühnen für typische Einsätze in Tiefbau, Sanierung und GaLaBau. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. Größere Arbeitshöhen oder Spezialmodelle disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
      ],
    },

    werkzeuge: {
      hookline:
        "Bohr-, Säge-, Fräs- und Messwerkzeuge mietest du an unserer Filiale Bonn – samstags bis 17:30 Uhr abholbar, ohne Voranmeldung.",
      standortFakten:
        "Abholung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr – damit eine Stunde früher als unser Hauptsitz in Krefeld und samstags deutlich länger. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565. Für Sanierungs- und Renovierungsprojekte im Bonner Stadtgebiet, Rhein-Sieg-Kreis und Ahrtal sind die meisten Werkzeuge kompakt genug für den eigenen Pkw – Lieferung ist auf Anfrage ebenfalls möglich.",
      faqs: [
        {
          q: "Kann ich Werkzeuge an der Filiale Bonn auch samstags abholen?",
          a: "Ja. Unsere Filiale Bonn in der Drachenburgstraße 8 ist samstags regulär von 08:00 bis 17:30 Uhr geöffnet – ohne Voranmeldung. Damit kannst du Bohrhämmer, Sägen, Fräsen oder Messtechnik auch für Wochenend-Projekte direkt vor Ort mitnehmen. Werktags öffnen wir bereits um 07:00 Uhr, eine Stunde früher als unser Hauptsitz in Krefeld.",
        },
        {
          q: "Welche Werkzeuge habt ihr an der Filiale Bonn vor Ort?",
          a: "An der Filiale Bonn führen wir ein breites Werkzeug-Kernsortiment direkt vor Ort – Bohr-, Säge-, Fräs-, Schleif- und Messwerkzeuge für Sanierung, GaLaBau und Innenausbau. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. Spezialwerkzeuge, die nicht vor Ort stehen, disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
      ],
    },

    "heizung-trocknung": {
      hookline:
        "Heizlüfter, Heizpilze und Bautrockner mietest du an unserer Filiale Bonn – mit Lieferung ins Bonner Stadtgebiet, in den Rhein-Sieg-Kreis und ins Ahrtal.",
      standortFakten:
        "Abholung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Geliefert wird ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal bis Bad Neuenahr-Ahrweiler – relevant vor allem für Wasserschäden, Neubau-Trocknung und Außen-Events in der Region.",
      faqs: [
        {
          q: "Liefert ihr Bautrockner und Heizgeräte ins Ahrtal und in den Rhein-Sieg-Kreis?",
          a: "Ja. Ab unserer Filiale Bonn liefern wir Bautrockner, Heizlüfter und Heizpilze ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag. Für Wasserschäden organisieren wir die Lieferung nach Möglichkeit kurzfristig.",
        },
        {
          q: "Welche Heiz- und Trocknungsgeräte habt ihr an der Filiale Bonn vor Ort?",
          a: "An der Filiale Bonn führen wir ein Kernsortiment an Heizlüftern, Heizpilzen und Bautrocknern direkt vor Ort – passend für Bautrocknung, Wasserschaden-Sanierung und Outdoor-Events. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. Größere Mengen oder Spezialgeräte disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
      ],
    },

    "leitern-gerueste": {
      hookline:
        "Mehrzweckleitern, Stehleitern und Rollgerüste mietest du an unserer Filiale Bonn – kompakte Leitern auch samstags bis 17:30 Uhr ohne Voranmeldung abholbar, Rollgerüste mit Lieferung in den Rhein-Sieg-Kreis und ins Ahrtal.",
      standortFakten:
        "Abholung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Klapp- und Mehrzweckleitern lassen sich in der Regel im eigenen Pkw oder Kombi transportieren – Rollgerüste, große Steh- und Schiebeleitern liefern wir per Transport ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal bis Bad Neuenahr-Ahrweiler.",
      faqs: [
        {
          q: "Kann ich Leitern an der Filiale Bonn auch samstags abholen?",
          a: "Ja. Unsere Filiale Bonn in der Drachenburgstraße 8 ist samstags regulär von 08:00 bis 17:30 Uhr geöffnet – ohne Voranmeldung. Mehrzweck-, Steh- und Klappleitern kannst du also auch für Wochenend-Projekte direkt vor Ort mitnehmen, in der Regel passen sie in jeden Kombi oder Pkw mit Dachträger.",
        },
        {
          q: "Liefert ihr Rollgerüste ins Ahrtal oder in den Rhein-Sieg-Kreis?",
          a: "Ja. Rollgerüste, große Steh- und Schiebeleitern liefern wir ab unserer Filiale Bonn ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag.",
        },
        {
          q: "Welche Leitern und Gerüste habt ihr an der Filiale Bonn vor Ort?",
          a: "An der Filiale Bonn führen wir ein Kernsortiment an Leitern und Rollgerüsten direkt vor Ort – passend für Sanierung, Malerarbeiten, GaLaBau und Innenausbau. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. Spezialmodelle oder größere Gerüst-Konfigurationen disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
      ],
    },

    aggregate: {
      hookline:
        "Stromaggregate von 2,8 bis 100 kVA mietest du an unserer Filiale Bonn – kleine tragbare Aggregate auch samstags bis 17:30 Uhr ohne Voranmeldung abholbar, große Diesel-Stromerzeuger mit Lieferung in den Rhein-Sieg-Kreis und ins Ahrtal.",
      standortFakten:
        "Abholung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Kleine Aggregate ab 2,8 kVA passen in der Regel in jeden Pkw oder Kombi. Größere Diesel-Aggregate (20, 50, 80, 100 kVA) liefern wir per Transport ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal bis Bad Neuenahr-Ahrweiler – passend für Baustellen ohne Netzanschluss, Events, Notstrom und Wasserschaden-Sanierung.",
      faqs: [
        {
          q: "Liefert ihr große Stromaggregate ins Ahrtal oder in den Rhein-Sieg-Kreis?",
          a: "Ja. Diesel-Aggregate ab 20 kVA liefern wir ab unserer Filiale Bonn ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag. Bei Wasserschäden oder Stromausfällen disponieren wir nach Möglichkeit kurzfristig.",
        },
        {
          q: "Kann ich kleine Aggregate in Bonn auch samstags abholen?",
          a: "Ja. Unsere Filiale Bonn in der Drachenburgstraße 8 ist samstags regulär von 08:00 bis 17:30 Uhr geöffnet – ohne Voranmeldung. Tragbare Aggregate wie der 2,8 kVA Ford FG4050 oder der 7,5 kVA Kärcher PGG 8/3 passen in jeden Pkw und sind für Wochenend-Events oder Außen-Einsätze direkt mitnehmbar.",
        },
        {
          q: "Welche Aggregate habt ihr an der Filiale Bonn vor Ort?",
          a: "An der Filiale Bonn führen wir ein Kernsortiment an Stromaggregaten direkt vor Ort – von tragbaren Modellen ab 2,8 kVA bis zu größeren Diesel-Stromerzeugern. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. Modelle, die nicht vor Ort stehen, oder Spezial-Konfigurationen disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
      ],
    },

    "kabel-stromverteiler": {
      hookline:
        "CEE-Kabel (16/32/63 A), Schukokabel, Kabeltrommeln und CEE-Unterverteiler mietest du an unserer Filiale Bonn – kompakte Mengen auch samstags bis 17:30 Uhr ohne Voranmeldung abholbar, große Verteilerschränke mit Lieferung in den Rhein-Sieg-Kreis und ins Ahrtal.",
      standortFakten:
        "Abholung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). CEE- und Schukokabel (3, 5, 10, 20, 50 m), Schuko-Kabeltrommeln sowie CEE-Adapter (16↔32, 32↔63) passen in der Regel in jeden Pkw oder Kombi. Größere CEE-Unterverteiler und Verteilerschränke (z. B. 24 kVA, 44 kVA, 55 kVA Anschlussschrank) liefern wir per Transport ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal bis Bad Neuenahr-Ahrweiler – passend zur Stromversorgung von Baustellen, Events und Notstrom-Szenarien.",
      faqs: [
        {
          q: "Liefert ihr CEE-Verteilerschränke ins Ahrtal oder in den Rhein-Sieg-Kreis?",
          a: "Ja. Anschluss- und Verteilerschränke (24 kVA, 44 kVA, 55 kVA) sowie passende CEE-Kabel liefern wir ab unserer Filiale Bonn ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag.",
        },
        {
          q: "Kann ich CEE-Kabel und Adapter in Bonn auch samstags abholen?",
          a: "Ja. Unsere Filiale Bonn in der Drachenburgstraße 8 ist samstags regulär von 08:00 bis 17:30 Uhr geöffnet – ohne Voranmeldung. CEE-Kabel (16/32/63 A in Längen von 3 bis 50 m), Schukokabel, die 50-m-Schuko-Kabeltrommel sowie Mennekes-Adapter 16↔32 und 32↔63 kannst du direkt mitnehmen.",
        },
        {
          q: "Welche Verteiler und Kabel habt ihr an der Filiale Bonn vor Ort?",
          a: "An der Filiale Bonn führen wir ein Kernsortiment aus CEE-Kabeln, Schukokabeln, Kabeltrommeln, CEE-Unterverteilern (16/32/63 A) und CEE-Adaptern direkt vor Ort. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. Große Verteilerschränke (z. B. Anschlussverteilerschrank 44 kVA) und passende Konfigurationen für Aggregat-Speisung disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
      ],
    },

    gartenpflege: {
      hookline:
        "Vertikutierer, Häcksler, Erdbohrer, Akku-Kettensägen, Freischneider, Baumstumpffräse und Hochdruckreiniger mietest du an unserer Filiale Bonn – die meisten Geräte passen in jeden Pkw oder Kombi und sind samstags bis 17:30 Uhr ohne Voranmeldung abholbar.",
      standortFakten:
        "Abholung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg/Mehlem). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Vertikutierer (elektrisch und benzinbetrieben), Akku-Kettensäge, Freischneider, Benzin-Bodenhacke, Benzin-Erdbohrer, Erdbohrer 4308 sowie Häcksler (Axt und LS95) lassen sich in der Regel im eigenen Pkw, Kombi oder kleinen Anhänger transportieren. Größere Geräte wie die Baumstumpffräse F360 liefern wir auf Anfrage ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal – passend für Grundstückspflege, Heckenrückschnitt, Rasen-Sanierung im Frühjahr und Aufräumarbeiten nach Sturm- oder Hochwasser-Schäden.",
      faqs: [
        {
          q: "Kann ich Vertikutierer und Häcksler in Bonn auch samstags abholen?",
          a: "Ja. Unsere Filiale Bonn in der Drachenburgstraße 8 ist samstags regulär von 08:00 bis 17:30 Uhr geöffnet – ohne Voranmeldung. Vertikutierer (elektrisch und Benzin), Häcksler (Axt und LS95), Akku-Kettensäge, Freischneider und Erdbohrer kannst du direkt mitnehmen – ideal für den Wochenend-Einsatz im Garten.",
        },
        {
          q: "Welche Gartengeräte habt ihr an der Filiale Bonn vor Ort?",
          a: "An der Filiale Bonn führen wir das Kernsortiment Gartenpflege direkt vor Ort – darunter Vertikutierer (elektrisch und benzinbetrieben), Häcksler Axt und LS95, Akku-Kettensäge, Freischneider, Benzin-Bodenhacke, Benzin-Erdbohrer, Erdbohrer 4308 und Hochdruckreiniger. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. Spezialgeräte wie die Baumstumpffräse F360 disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
        {
          q: "Liefert ihr Gartengeräte ins Ahrtal oder in den Rhein-Sieg-Kreis?",
          a: "Ja. Größere Geräte wie die Baumstumpffräse F360 oder mehrere Gartengeräte als Paket liefern wir ab unserer Filiale Bonn ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag. Vertikutierer, Akku-Kettensägen und Erdbohrer holst du in der Regel selbst mit Pkw oder Kombi ab.",
        },
      ],
    },

    absperrtechnik: {
      hookline:
        "TL-Warnleuchten, Schrankenzäune, Warnbarken, Fußplatten und das 18-teilige Halteverbotsschilder-Set mietest du an unserer Filiale Bonn – kompakte Artikel wie Warnleuchten und Klemmschellen auch samstags bis 17:30 Uhr ohne Voranmeldung abholbar.",
      standortFakten:
        "Abholung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg/Mehlem). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Warnleuchten, Fußplatten, Klemmschellen und Warnbarken passen in der Regel in jeden Pkw oder Kombi. Das 18-teilige Halteverbotsschilder-Set für mobile Halteverbotszonen nach StVO wird vor Ort zusammengestellt und kann ebenfalls selbst abgeholt werden. Für Baustellen, Events und Umzüge im Bonner Stadtgebiet, Rhein-Sieg-Kreis und Ahrtal liefern wir auf Anfrage größere Mengen an Schrankenzäunen, Bauzäunen und Verkehrszeichen direkt zur Einsatzstelle.",
      faqs: [
        {
          q: "Kann ich Warnleuchten und das Halteverbotsschilder-Set in Bonn auch samstags abholen?",
          a: "Ja. Unsere Filiale Bonn in der Drachenburgstraße 8 ist samstags regulär von 08:00 bis 17:30 Uhr geöffnet – ohne Voranmeldung. TL-Warnleuchten, Fußplatten, Wemas-Klemmschellen, Warnbarken und das 18-teilige Halteverbotsschilder-Set kannst du direkt mitnehmen, in der Regel passen sie in jeden Pkw oder Kombi.",
        },
        {
          q: "Liefert ihr Absperrtechnik ins Ahrtal und in den Rhein-Sieg-Kreis?",
          a: "Ja. Ab unserer Filiale Bonn liefern wir größere Mengen an Schrankenzäunen, Bauzäunen, Verkehrszeichen und Halteverbotsschilder-Sets ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag. Kompakte Artikel wie Warnleuchten und Klemmschellen holst du in der Regel selbst ab.",
        },
        {
          q: "Welche Absperrtechnik habt ihr an der Filiale Bonn vor Ort?",
          a: "An der Filiale Bonn führen wir ein Kernsortiment an Absperrtechnik direkt vor Ort – darunter TL-Warnleuchte gelb, Fußplatte K1 TL, Schrankenzaun RA2 weiß/rot, Wemas Klemmschelle K1, Warnbarke RA2 und das 18-teilige Halteverbotsschilder-Set für mobile Halteverbotszonen. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. Spezial-Verkehrszeichen oder größere Mengen an Bauzäunen disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
      ],
    },

    beleuchtung: {
      hookline:
        "LED Outdoorscheinwerfer TourLED 50 XCR, Moving Heads, LED-Beleuchtungssets und Party-Ton-&-Licht-Sets mietest du an unserer Filiale Bonn – einzelne Scheinwerfer und kleinere Sets auch samstags bis 17:30 Uhr ohne Voranmeldung abholbar.",
      standortFakten:
        "Abholung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg/Mehlem). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Einzelne LED-Outdoorscheinwerfer, Moving Heads und kleinere Beleuchtungssets passen in der Regel in jeden Pkw oder Kombi und können direkt abgeholt werden. Größere Sets wie das LED Outdoorscheinwerfer 6er-Set oder das Party Ton & Licht-Set liefern wir auf Anfrage ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal – passend für Firmenevents, Hochzeiten, Geburtstage, Konzerte und Außenveranstaltungen.",
      faqs: [
        {
          q: "Kann ich LED-Scheinwerfer und kleinere Licht-Sets in Bonn auch samstags abholen?",
          a: "Ja. Unsere Filiale Bonn in der Drachenburgstraße 8 ist samstags regulär von 08:00 bis 17:30 Uhr geöffnet – ohne Voranmeldung. LED Outdoorscheinwerfer TourLED 50 XCR, einzelne Moving Heads und kleinere Beleuchtungssets kannst du direkt mitnehmen, in der Regel passen sie in jeden Pkw oder Kombi.",
        },
        {
          q: "Liefert ihr Beleuchtungstechnik ins Ahrtal und in den Rhein-Sieg-Kreis?",
          a: "Ja. Ab unserer Filiale Bonn liefern wir größere Beleuchtungssets wie das LED Outdoorscheinwerfer 6er-Set oder das Party Ton & Licht-Set ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag. Einzelne Scheinwerfer und Moving Heads holst du in der Regel selbst ab.",
        },
        {
          q: "Welche Beleuchtung habt ihr an der Filiale Bonn vor Ort?",
          a: "An der Filiale Bonn führen wir ein Event-Beleuchtungs-Kernsortiment direkt vor Ort – darunter LED Outdoorscheinwerfer TourLED 50 XCR, LED Moving Head Vector Spot Zoom 2.0, LED Beleuchtungsset single und duo (4in1 Multieffekt-Lichtanlage), Party Ton & Licht-Set und LED Outdoorscheinwerfer 6er-Set. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. Spezial-Beleuchtung wie der SLT LED Fluter RGBWAUV, Showtec Sunstrip Active MKII oder Nebelmaschinen disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
      ],
    },

    beschallung: {
      hookline:
        "Soundboks Gen.3 (126 dB Bluetooth-Outdoor-Lautsprecher), 2.1 Soundsystem 1400W RMS mit Mischpult sowie Ersatz-Akkus mietest du an unserer Filiale Bonn – Soundboks und Zubehör auch samstags bis 17:30 Uhr ohne Voranmeldung abholbar.",
      standortFakten:
        "Abholung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg/Mehlem). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Soundboks Gen.3 (15,4 kg) und Batteryboks passen in jeden Pkw oder Kombi. Das 2.1 Soundsystem 1400W RMS (ca. 55 kg) liefert die 1400-Watt-PA-Anlage mit integriertem 4-Kanal-Mischpult für bis zu 75 Personen. Größere Beschallungssets liefern wir auf Anfrage ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal – passend für Hochzeiten, Firmenevents, Geburtstage und Outdoor-Partys.",
      faqs: [
        {
          q: "Kann ich den Soundboks in Bonn auch samstags abholen?",
          a: "Ja. Unsere Filiale Bonn in der Drachenburgstraße 8 ist samstags regulär von 08:00 bis 17:30 Uhr geöffnet – ohne Voranmeldung. Der Soundboks Gen.3 (15,4 kg, Bluetooth 5.0, bis zu 40 Stunden Akkulaufzeit) und der Batteryboks Ersatz-Akku passen in jeden Pkw oder Kombi und sind direkt mitnehmbar.",
        },
        {
          q: "Liefert ihr das 2.1 Soundsystem ins Ahrtal und in den Rhein-Sieg-Kreis?",
          a: "Ja. Ab unserer Filiale Bonn liefern wir das 2.1 Soundsystem 1400W RMS mit integriertem 4-Kanal-Mischpult (geeignet für bis zu 75 Personen) ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag. Soundboks und kleines Zubehör holst du in der Regel selbst ab.",
        },
        {
          q: "Welche Beschallung habt ihr an der Filiale Bonn vor Ort?",
          a: "An der Filiale Bonn führen wir ein Beschallungs-Kernsortiment direkt vor Ort – darunter Soundboks Gen.3 (126 dB Bluetooth-Outdoor-Lautsprecher mit TeamUP-Modus), Soundboks Batteryboks Ersatz-Akku und das 2.1 Soundsystem 1400W RMS mit integriertem 4-Kanal-Mischpult für bis zu 75 Personen. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. Größere PA-Systeme wie das D.A.S. Soundsystem 3500W RMS, D.A.S. Audio Action 508A/Vantec oder Funkmikrofon-Sets disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
      ],
    },

    kommunikation: {
      hookline:
        "Funkmikrofon für Reden und Präsentationen mietest du an unserer Filiale Bonn – kompakt und samstags bis 17:30 Uhr ohne Voranmeldung abholbar.",
      standortFakten:
        "Abholung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg/Mehlem). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Das Funkmikrofon passt in jeden Pkw oder Kombi und ist direkt mitnehmbar. Größere Funkgeräte-Sets oder Headset-Konfigurationen liefern wir auf Anfrage ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal – die Geräte disponieren wir bei Bedarf aus unserem Hauptsitz in Krefeld, in der Regel innerhalb von 24 Stunden.",
      faqs: [
        {
          q: "Kann ich das Funkmikrofon in Bonn auch samstags abholen?",
          a: "Ja. Unsere Filiale Bonn in der Drachenburgstraße 8 ist samstags regulär von 08:00 bis 17:30 Uhr geöffnet – ohne Voranmeldung. Das Funkmikrofon ist kompakt und passt in jeden Pkw oder Kombi, sodass du es direkt mitnehmen kannst.",
        },
        {
          q: "Liefert ihr Funkmikrofone ins Ahrtal und in den Rhein-Sieg-Kreis?",
          a: "Ja. Ab unserer Filiale Bonn liefern wir Funkmikrofone und größere Kommunikationssets ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag. Das einzelne Funkmikrofon holst du in der Regel selbst ab.",
        },
        {
          q: "Welche Kommunikationsgeräte habt ihr an der Filiale Bonn vor Ort?",
          a: "An der Filiale Bonn führen wir das Funkmikrofon für Reden und Präsentationen direkt vor Ort. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. UHF-Funkgeräte-Sets, Headset-Taschensender oder größere Konfigurationen disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
      ],
    },

    "moebel-zelte": {
      hookline:
        "Party- / Eventzelte (3×3 m und 4×6 m), Zeltboden anthrazit, Bierzeltgarnituren mit Hussen, Stehtische, Stühle und Kleiderständer mietest du an unserer Filiale Bonn – Möbel auch samstags bis 17:30 Uhr ohne Voranmeldung abholbar, Party- / Eventzelte mit Lieferung in den Rhein-Sieg-Kreis und ins Ahrtal.",
      standortFakten:
        "Abholung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg/Mehlem). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Bierzeltgarnitur-Sets, Hussen-Sets, Stehtische, Stühle, Kleiderbügel und Kleiderständer mit Rollen passen in der Regel in jeden Kombi oder Transporter. Die Party- / Eventzelte 3×3 m (9 m² Grundfläche) und 4×6 m (24 m² Grundfläche) mit UV-beständiger 500 g/m² PVC-Plane sowie der Event- / Event- / Zeltboden Anthrazit liefern wir auf Anfrage ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal bis Bad Neuenahr-Ahrweiler – passend für Hochzeiten, Geburtstage, Firmenfeiern und Vereinsfeste.",
      faqs: [
        {
          q: "Kann ich Bierzeltgarnituren und Stehtische in Bonn auch samstags abholen?",
          a: "Ja. Unsere Filiale Bonn in der Drachenburgstraße 8 ist samstags regulär von 08:00 bis 17:30 Uhr geöffnet – ohne Voranmeldung. Bierzeltgarnitur-Sets, Hussen-Sets weiß, Stehtische, Stehtisch-Hussen weiß, Stühle weiß sowie Kleiderbügel-20er-Sets und Kleiderständer mit Rollen kannst du direkt mitnehmen, in der Regel passen sie in jeden Kombi oder kleinen Transporter.",
        },
        {
          q: "Liefert ihr Party- / Eventzelte ins Ahrtal oder in den Rhein-Sieg-Kreis?",
          a: "Ja. Die Party- / Eventzelte 3×3 m und 4×6 m (UV-beständige 500 g/m² PVC-Plane, rasterfaserverstärkt, inkl. Dachspanner gegen Wassersäcke) sowie den Event- / Zeltboden Anthrazit liefern wir ab unserer Filiale Bonn ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag. Wichtig: Zelte trocken zurückgeben – andernfalls fällt eine Trocknungspauschale an (60 € für 3×3 m, 100 € für 4×6 m).",
        },
        {
          q: "Welche Möbel und Zelte habt ihr an der Filiale Bonn vor Ort?",
          a: "An der Filiale Bonn führen wir ein Event-Kernsortiment direkt vor Ort – Party- / Eventzelt 3×3 m, Party- / Eventzelt 4×6 m, Event- / Event- / Zeltboden Anthrazit, Bierzeltgarnitur-Set, Bierzeltgarnitur Hussen-Set weiß, Stehtisch, Stehtisch Husse weiß, Klappstuhl Event black, Kleiderbügel 20er-Set black und Kleiderständer mit Rollen black. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. Größere Zeltkonfigurationen (4×8, 4×10, 4×14 m), Party- / Eventzelte extra hoch (6×8 und 6×12 m), Sonnenschirme oder Getränkekühlschränke disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
      ],
    },

    "geschirr-glaeser-besteck": {
      hookline:
        "Gläser (Passionata & Brunelli), Teller, Schüsseln, Besteck und Gastro-Spülmaschine mietest du an unserer Filiale Bonn – abholbar samstags bis 17:30 Uhr, Lieferung in den Rhein-Sieg-Kreis und ins Ahrtal.",
      standortFakten:
        "Abholung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg/Mehlem). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Gläser-Sets (Longdrink, Wasser, Weißwein, Rotwein, Champagner), Teller SIMPLY und Deluxe, Dessertteller, Schüsseln, Kaffeetassen, Aschenbecher sowie Besteck-Sets (Gabeln, Löffel, Messer) und die Gastro-Spülmaschine passen in der Regel in jeden Pkw oder Kombi. Größere Mengen oder der Buffet-Tellerwärmer liefern wir auf Anfrage ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal bis Bad Neuenahr-Ahrweiler.",
      faqs: [
        {
          q: "Kann ich Geschirr und Gläser in Bonn auch samstags abholen?",
          a: "Ja. Unsere Filiale Bonn in der Drachenburgstraße 8 ist samstags regulär von 08:00 bis 17:30 Uhr geöffnet – ohne Voranmeldung. Gläser-Sets, Teller, Besteck und kleinere Geschirr-Mengen passen in der Regel in jeden Pkw oder Kombi und können direkt mitgenommen werden. Größere Mengen oder die Gastro-Spülmaschine organisieren wir auf Wunsch mit Lieferung.",
        },
        {
          q: "Liefert ihr Geschirr, Gläser und Besteck ins Ahrtal und in den Rhein-Sieg-Kreis?",
          a: "Ja. Ab unserer Filiale Bonn liefern wir größere Mengen an Gläsern, Geschirr, Besteck und Event-Equipment ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag. Kleine Sets holst du in der Regel selbst ab.",
        },
        {
          q: "Welches Geschirr, Gläser und Besteck habt ihr an der Filiale Bonn vor Ort?",
          a: "An der Filiale Bonn führen wir ein Event-Geschirr-Kernsortiment direkt vor Ort – darunter Longdrink-, Wasser-, Weißwein-, Rotwein- und Champagnergläser (Passionata & Brunelli), Teller SIMPLY und Deluxe, Dessertteller, Schüsseln, Kaffeetassen, Aschenbecher, Besteck-Sets (Gabeln, Löffel, Messer) sowie die Gastro-Spülmaschine. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. Der Buffet-Tellerwärmer oder größere Mengen disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
      ],
    },

    buehne: {
      hookline:
        "Nivtec Systempodeste (2×0,5 m, 2×0,75 m, 2×1 m), Teleskopfüße (40/80 cm), Verstellspindelfüße (60 cm) und Manfrotto Autopoles disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – Übergabe und Beratung an unserer Filiale Bonn.",
      standortFakten:
        "Übergabe und Beratung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg/Mehlem). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Bühnenequipment (Nivtec Systempodeste in 2×0,5 m, 2×0,75 m und 2×1 m, Teleskopfüße 40/80 cm, Verstellspindelfuß 60 cm sowie Manfrotto 032B Autopole schwarz) disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – in der Regel innerhalb von 24 Stunden. Lieferung ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal bis Bad Neuenahr-Ahrweiler möglich.",
      faqs: [
        {
          q: "Stehen Nivtec-Podeste direkt an der Filiale Bonn?",
          a: "In der Regel disponieren wir Nivtec Systempodeste, Teleskopfüße und Verstellspindelfüße auf Anfrage aus unserem Hauptsitz in Krefeld nach Bonn – üblicherweise innerhalb von 24 Stunden. Übergabe, Beratung und Rückgabe finden an unserer Filiale Bonn in der Drachenburgstraße 8 statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
        {
          q: "Liefert ihr Bühnenpodeste ins Ahrtal oder in den Rhein-Sieg-Kreis?",
          a: "Ja. Nivtec-Systempodeste, Teleskopfüße, Verstellspindelfüße und Manfrotto Autopoles liefern wir ab unserer Filiale Bonn ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag.",
        },
      ],
    },

    "traversen-rigging": {
      hookline:
        "Milos M290 Traversen-System (Multicube, P4 QTU 500/1000/1500/2000, UBPQC Base) und Traversen-Cover weiß (2 m und 3 m) disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – Übergabe und Beratung an unserer Filiale Bonn.",
      standortFakten:
        "Übergabe und Beratung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg/Mehlem). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Milos M290 Traversen (Multicube black, P4 QTU 500/1000/1500/2000 black, UBPQC Base black) und die Traversen-Cover weiß in 2 m und 3 m disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – in der Regel innerhalb von 24 Stunden. Lieferung ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal bis Bad Neuenahr-Ahrweiler möglich.",
      faqs: [
        {
          q: "Stehen Milos-Traversen direkt an der Filiale Bonn?",
          a: "Milos M290 Traversen (Multicube, P4 QTU 500/1000/1500/2000, UBPQC Base) und Traversen-Cover disponieren wir in der Regel auf Anfrage aus unserem Hauptsitz Krefeld nach Bonn – üblicherweise innerhalb von 24 Stunden. Übergabe, Beratung und Rückgabe finden an unserer Filiale Bonn in der Drachenburgstraße 8 statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
        {
          q: "Liefert ihr Traversen ins Ahrtal oder in den Rhein-Sieg-Kreis?",
          a: "Ja. Milos M290 Traversen-Komponenten und Traversen-Cover weiß (2 m, 3 m) liefern wir ab unserer Filiale Bonn ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag.",
        },
      ],
    },

    spezialeffekte: {
      hookline:
        "ADJ Fog Fury Jett PRO Nebelmaschine, Kalt-Funkenfontänen (Spark/Sparkular) als Einzelgerät, 2er- und 4er-Set, TCM FX Turbo CO2 Jet und XL Profi Popcornmaschine disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – Übergabe und Beratung an unserer Filiale Bonn.",
      standortFakten:
        "Übergabe und Beratung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg/Mehlem). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Spezialeffekt-Geräte – ADJ Fog Fury Jett PRO, Kalt-Funkenfontänen Einzelgerät/2er-Set/4er-Set, TCM FX Turbo CO2 Jet und die XL Profi Popcornmaschine – disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – in der Regel innerhalb von 24 Stunden. Lieferung ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal bis Bad Neuenahr-Ahrweiler möglich – passend für Hochzeiten, Firmenfeiern, Bühnenshows und Vereinsfeste.",
      faqs: [
        {
          q: "Liefert ihr Nebelmaschinen und Kalt-Funkenfontänen ins Ahrtal oder in den Rhein-Sieg-Kreis?",
          a: "Ja. Die ADJ Fog Fury Jett PRO Nebelmaschine, Kalt-Funkenfontänen (Spark/Sparkular) als Einzelgerät, 2er- und 4er-Set, den TCM FX Turbo CO2 Jet sowie die XL Profi Popcornmaschine liefern wir ab unserer Filiale Bonn ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag.",
        },
        {
          q: "Stehen Nebelmaschine und Sparkulars direkt an der Filiale Bonn?",
          a: "Spezialeffekt-Geräte disponieren wir in der Regel auf Anfrage aus unserem Hauptsitz Krefeld nach Bonn – üblicherweise innerhalb von 24 Stunden. Übergabe, Einweisung und Rückgabe finden an unserer Filiale Bonn in der Drachenburgstraße 8 statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
      ],
    },

    huepfburgen: {
      hookline:
        "HappyHop Hüpfburg Lamar 2,8×2,1 m, Hüpfburg Wasserpark 3×4 m, Hüpfburg Rollercoaster 4,9×4 m und Hüpfburg Clown 6,1×5,2 m disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – Lieferung ins Bonner Stadtgebiet, in den Rhein-Sieg-Kreis und ins Ahrtal.",
      standortFakten:
        "Übergabe und Beratung an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg/Mehlem). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Hüpfburgen – HappyHop Lamar 2,8×2,1 m, Wasserpark 3×4 m, Rollercoaster 4,9×4 m sowie Clown 6,1×5,2 m – disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – in der Regel innerhalb von 24 Stunden. Lieferung ins Bonner Stadtgebiet, nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin, in den Rhein-Sieg-Kreis sowie ins Ahrtal bis Bad Neuenahr-Ahrweiler möglich – passend für Kindergeburtstage, Schulfeste, Vereinsfeiern und Stadtteilfeste.",
      faqs: [
        {
          q: "Liefert ihr Hüpfburgen ins Ahrtal oder in den Rhein-Sieg-Kreis?",
          a: "Ja. Die HappyHop Hüpfburg Lamar 2,8×2,1 m, die Hüpfburg Wasserpark 3×4 m, die Hüpfburg Rollercoaster 4,9×4 m und die Hüpfburg Clown 6,1×5,2 m liefern wir ab unserer Filiale Bonn ins gesamte Bonner Stadtgebiet sowie nach Wachtberg, Königswinter, Bad Honnef, Sankt Augustin und ins Ahrtal bis Bad Neuenahr-Ahrweiler. Anfahrt über A555, A565 und B9, in der Regel am nächsten Werktag.",
        },
        {
          q: "Stehen die Hüpfburgen direkt an der Filiale Bonn?",
          a: "Hüpfburgen disponieren wir in der Regel auf Anfrage aus unserem Hauptsitz Krefeld nach Bonn – üblicherweise innerhalb von 24 Stunden. Übergabe, Aufbau-Hinweise und Rückgabe finden an unserer Filiale Bonn in der Drachenburgstraße 8 statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
      ],
    },

    "wohnwagen-camping": {
      hookline:
        "Den Weinsberg CaraOne 480 QDK (familientauglich, bis 5 Personen, Dusche, WC, Truma-Heizung und Mover) mietest du auf Anfrage an unserer Filiale Bonn – ab 30 €/Tag inkl. Vollkasko.",
      standortFakten:
        "Übergabe und Rückgabe an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg/Mehlem). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Der Weinsberg CaraOne 480 QDK (Gesamtlänge mit Deichsel 7,07 m, zulässiges Gesamtgewicht 1.500 kg, 2 Erwachsene + 3 Kinder) wird auf Anfrage aus unserem Hauptsitz Krefeld disponiert. Mindestmietdauer 5 Tage, Servicepauschale 99 € einmalig (Einweisung, 11-kg-Gasflasche, Spiegelverlängerungen, Strom-Adapterkabel, Sanitärchemie, 2 Rollen Toilettenpapier), Endreinigung optional 99 €, Kaution 1.000 €, Teil- und Vollkasko enthalten (Selbstbeteiligung gegenüber Versicherung 2.500 €). Wohnwagen werden mit dem eigenen Zugfahrzeug (ab 1.500 kg Anhängelast) abgeholt – eine Lieferung bieten wir hierfür nicht an.",
      faqs: [
        {
          q: "Kann ich den Wohnwagen direkt an der Filiale Bonn übernehmen?",
          a: "Ja. Übergabe, Einweisung und Rückgabe des Weinsberg CaraOne 480 QDK finden an unserer Filiale Bonn in der Drachenburgstraße 8 statt. Den Wohnwagen selbst disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – frag uns am besten frühzeitig an, gerade für Ferienzeiten.",
        },
        {
          q: "Welches Zugfahrzeug brauche ich für den Weinsberg CaraOne 480 QDK?",
          a: "Der Weinsberg CaraOne 480 QDK hat ein zulässiges Gesamtgewicht von 1.500 kg, eine Aufbaulänge von 5,84 m und eine Gesamtlänge mit Deichsel von 7,07 m. Du brauchst also ein Zugfahrzeug mit mindestens 1.500 kg Anhängelast. Mover und Antischlingerkupplung sind serienmäßig dabei. Wohnwagen werden bei uns ausschließlich abgeholt – wir liefern keine Wohnwagen.",
        },
        {
          q: "Was ist in der Wohnwagen-Miete enthalten?",
          a: "Im Mietpreis enthalten sind die voll ausgestattete Küche, eine 11-kg-Gasflasche, Strom- und Wasseranschlusskabel, Spiegelverlängerung und Vollkaskoversicherung. Mindestmietdauer 5 Tage, Servicepauschale 99 € einmalig (Einweisung, Gasflasche, Spiegelverlängerung, Strom-Adapter, Sanitärchemie, 2 Rollen Toilettenpapier), Endreinigung optional 99 €, Kaution 1.000 €. Die Selbstbeteiligung gegenüber der Versicherung beträgt 2.500 €, die Kaution selbst aber nur 1.000 €.",
        },
      ],
    },

    nutzfahrzeuge: {
      hookline:
        "Den 7,5-t Dreiseitenkipper (MAN TGL 8.220, Meiller D205, Automatik, Euro 6e) und den 3,5-t Pritschenwagen Dreiseitenkipper mit Doppelkabine (Opel Movano o. vgl., Klasse B) mietest du auf Anfrage an unserer Filiale Bonn – Abholung vor Ort, eine Lieferung bieten wir für Nutzfahrzeuge nicht an.",
      standortFakten:
        "Übergabe und Rückgabe an unserer Filiale Bonn, Drachenburgstraße 8, 53179 Bonn (Bad Godesberg/Mehlem). Geöffnet Mo–Fr ab 07:00 Uhr und samstags durchgehend von 08:00 bis 17:30 Uhr. Anfahrt direkt über B9, A555 (Bonn–Köln) und A565 (Bonner Autobahnring). Der 7,5-t MAN-Dreiseitenkipper mit Meiller-D205-Aufbau (220 PS, Automatik, 4,5 m³ Volumen, Hydraulikanschluss für Kippanhänger, Führerscheinklasse C1) und der 3,5-t Opel Movano Pritschenwagen-Dreiseitenkipper mit Doppelkabine (bis zu 7 Sitzplätze, 1.135 kg Nutzlast, 3,60 × 2,05 m Ladefläche, Anhängelast bis 2.500 kg, Führerscheinklasse B) werden auf Anfrage aus unserem Hauptsitz Krefeld disponiert. Mietkonditionen: 100 km/Tag inklusive, Diesel-Rückgabe vollgetankt (sonst 2,85 €/l), Kaution 1.000 €, Vollkasko-Selbstbeteiligung 2.500 €. Hinweis: Nutzfahrzeuge werden ausschließlich vor Ort abgeholt und zurückgegeben – eine Lieferung wie bei Baumaschinen ist hierfür nicht vorgesehen.",
      faqs: [
        {
          q: "Welchen Führerschein brauche ich für eure Kipper?",
          a: "Der 3,5-t Opel Movano Pritschenwagen-Dreiseitenkipper mit Doppelkabine ist mit der Führerscheinklasse B fahrbar – also dem normalen Pkw-Führerschein. Für den 7,5-t MAN-Dreiseitenkipper (MAN TGL 8.220 mit Meiller D205) brauchst du mindestens die Führerscheinklasse C1.",
        },
        {
          q: "Liefert ihr Kipper-Lkw und Pritschenwagen auch nach Bonn oder ins Ahrtal?",
          a: "Nein. Nutzfahrzeuge werden bei uns – genau wie Anhänger – grundsätzlich nicht geliefert. Übergabe und Rückgabe finden an unserer Filiale Bonn in der Drachenburgstraße 8 statt. Den Wagen selbst disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – am besten frühzeitig anfragen.",
        },
        {
          q: "Was kostet die Miete inkl. Kilometer und Diesel?",
          a: "Bei beiden Kippern sind 100 km/Tag im Mietpreis enthalten. Mehrkilometer kosten beim 7,5-Tonner 0,40 €/km netto und beim 3,5-Tonner 0,23 €/km netto. Die Rückgabe erfolgt vollgetankt mit Diesel (sonst 2,85 €/l); beim 7,5-Tonner zusätzlich AdBlue vollgetankt (sonst 1,85 €/l). Kaution 1.000 €, Vollkasko-Selbstbeteiligung 2.500 €.",
        },
      ],
    }
  },

  // =================================================================
  // KREFELD – Hauptsitz Anrather Straße 291, 47807 Krefeld-Fichtenhain
  // Öffnung: Mo–Fr 08:00–18:00, Sa 10:00–14:30 (früher nach Voranmeldung)
  // Einzugsgebiet: Krefeld, Düsseldorf, Mönchengladbach, Viersen,
  // Kempen, Willich, Neuss, Meerbusch, Korschenbroich
  // =================================================================
  krefeld: {
    anhaenger: {
      hookline:
        "Auto-, Kasten-, Planen-, Koffer-, Baumaschinen- und Aggregat-Anhänger mietest du an unserem Hauptsitz Krefeld – 24/7 an 365 Tagen im Jahr per SMS-Code-Schloss abholbar und zurückgebbar. Anhänger werden grundsätzlich abgeholt, eine Lieferung bieten wir hierfür nicht an.",
      standortFakten:
        "Abholung und Rückgabe an unserem Hauptsitz Krefeld, Anrather Straße 291, 47807 Krefeld-Fichtenhain – 24/7 an 365 Tagen im Jahr per SMS-Code-Schloss, auch nachts, sonntags und an Feiertagen, ohne Personalaufwand. Für persönliche Einweisung, Zubehör (Planen, Spanngurte) oder Beratung sind wir Mo–Fr 08:00–18:00 Uhr und samstags 10:00–14:30 Uhr vor Ort, samstags früher nach vorheriger Buchung möglich. Anfahrt direkt über die A57 (Krefeld–Düsseldorf) und die A40 (Ruhrschnellweg). Hinweis: Mietanhänger werden ausschließlich vor Ort abgeholt und zurückgegeben – eine Lieferung wie bei Baumaschinen ist für Anhänger und Nutzfahrzeuge nicht vorgesehen.",
      faqs: [
        {
          q: "Kann ich den Anhänger am Hauptsitz Krefeld auch nachts, sonntags oder an Feiertagen abholen und zurückgeben?",
          a: "Ja. An unserem Hauptsitz Anrather Straße 291 in Krefeld-Fichtenhain sind alle Mietanhänger 24/7 an 365 Tagen im Jahr per SMS-Code-Schloss abholbar und zurückgebbar – auch nachts, sonntags und an Feiertagen, ohne dass jemand vor Ort sein muss. Nach der Buchung bekommst du den Code per SMS. Für persönliche Einweisung oder Zubehör nutze zusätzlich unsere regulären Öffnungszeiten Mo–Fr 08:00–18:00 und Sa 10:00–14:30 (früher nach vorheriger Buchung möglich).",
        },
        {
          q: "Liefert ihr Anhänger auch nach Krefeld oder in die Umgebung?",
          a: "Nein. Anhänger und Nutzfahrzeuge werden bei uns grundsätzlich nicht geliefert – sie werden an unserem Hauptsitz Krefeld (Anrather Straße 291) abgeholt und dort wieder zurückgegeben. Dafür ist die Abholung und Rückgabe 24/7 an 365 Tagen im Jahr per SMS-Code-Schloss möglich, also völlig unabhängig von Öffnungszeiten.",
        },
        {
          q: "Welche Anhänger habt ihr am Hauptsitz Krefeld vor Ort?",
          a: "An unserem Hauptsitz Krefeld führen wir das komplette Anhänger-Sortiment direkt vor Ort – darunter Auto-, Kasten-, Planen-, Koffer-, Baumaschinen- und Aggregat-Anhänger in allen Größenklassen. Als Hauptsitz mit großem Mietpark ist die Verfügbarkeit hier am höchsten. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
      ],
    },

    // Weitere Kategorien folgen in den nächsten Sprints.
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
        "Anhänger für das Ruhrgebiet – 24/7 an 365 Tagen im Jahr per SMS-Code-Schloss abholbar und zurückgebbar an unserem Service-Standort Mülheim in der Bobcat-Filiale. Anhänger werden grundsätzlich abgeholt, eine Lieferung bieten wir hierfür nicht an.",
      standortFakten:
        "Abholung und Rückgabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr, eingebettet in die Bobcat-Filiale vor Ort – 24/7 an 365 Tagen im Jahr per SMS-Code-Schloss, auch nachts, sonntags und an Feiertagen. Persönliche Übergabe, Einweisung und Beratung nach Vereinbarung. Anfahrt direkt über A40 (Ruhrschnellweg) und A52. Hinweis: Mietanhänger und Nutzfahrzeuge werden ausschließlich vor Ort abgeholt und zurückgegeben – eine Lieferung wie bei Baumaschinen ist hierfür nicht vorgesehen.",
      faqs: [
        {
          q: "Kann ich den Anhänger in Mülheim auch nachts, sonntags oder an Feiertagen abholen und zurückgeben?",
          a: "Ja. An unserem Standort Ruhrorter Str. 122 in der Bobcat-Filiale Mülheim sind Mietanhänger 24/7 an 365 Tagen im Jahr per SMS-Code-Schloss abholbar und zurückgebbar – auch nachts, sonntags und an Feiertagen, ohne dass jemand vor Ort sein muss. Nach der Buchung bekommst du den Code per SMS. Persönliche Übergabe und Einweisung sind zusätzlich nach Vereinbarung möglich.",
        },
        {
          q: "Liefert ihr Anhänger auch ins Ruhrgebiet?",
          a: "Nein. Anhänger und Nutzfahrzeuge werden bei uns grundsätzlich nicht geliefert – sie werden am Service-Standort Mülheim (Ruhrorter Str. 122) abgeholt und dort wieder zurückgegeben. Dafür ist die Abholung und Rückgabe 24/7 an 365 Tagen im Jahr per SMS-Code-Schloss möglich, also unabhängig von Öffnungszeiten.",
        },
        {
          q: "Welche Anhänger habt ihr am Standort Mülheim vor Ort?",
          a: "An unserem Service-Standort Mülheim führen wir einen Teil des Anhänger-Sortiments direkt vor Ort und 24/7 abholbar – unter anderem Baumaschinen- und Plattform-Anhänger sowie weitere häufig gefragte Typen. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an. Modelle, die nicht vor Ort stehen, disponieren wir auf Anfrage aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden.",
        },
      ],
    },

    "heizung-trocknung": {
      hookline:
        "Heizlüfter, Heizpilze und Bautrockner für das Ruhrgebiet – Beratung, Übergabe und Rücknahme an unserem Service-Standort Mülheim in der Bobcat-Filiale.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Beratung, Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt; das Gerät selbst disponieren wir aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich. Liefer- und Übergabegebiet umfasst das gesamte Ruhrgebiet: Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen – relevant vor allem für Wasserschäden, Neubau-Trocknung und Außen-Events in der Region.",
      faqs: [
        {
          q: "Liefert ihr Bautrockner und Heizgeräte ins Ruhrgebiet?",
          a: "Ja. Ab unserem Service-Standort Mülheim liefern bzw. übergeben wir Bautrockner, Heizlüfter und Heizpilze ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52. Bei Wasserschäden disponieren wir nach Möglichkeit kurzfristig aus unserem Hauptsitz Krefeld, häufig taggleich.",
        },
        {
          q: "Stehen die Bautrockner direkt am Standort Mülheim?",
          a: "Ein Teil unseres Heiz- und Trocknungs-Sortiments steht direkt am Service-Standort Mülheim zur Übergabe bereit. Modelle, die nicht vor Ort sind, disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig taggleich. Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
      ],
    },

    "leitern-gerueste": {
      hookline:
        "Leitern und Rollgerüste für das Ruhrgebiet – Beratung, Übergabe und Rücknahme an unserem Service-Standort Mülheim in der Bobcat-Filiale, Lieferung von Rollgerüsten direkt zur Einsatzstelle.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Klapp- und Mehrzweckleitern lassen sich in der Regel im eigenen Pkw oder Kombi mitnehmen; Rollgerüste und größere Steh- bzw. Schiebeleitern liefern wir per Transport ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Die Geräte selbst disponieren wir aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich.",
      faqs: [
        {
          q: "Liefert ihr Rollgerüste nach Essen, Duisburg oder Oberhausen?",
          a: "Ja. Ab unserem Service-Standort Mülheim liefern wir Rollgerüste, große Steh- und Schiebeleitern ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52, der Tieflader-Transport wird direkt aus Krefeld organisiert, in der Regel am nächsten Werktag.",
        },
        {
          q: "Stehen die Leitern und Gerüste direkt am Standort Mülheim?",
          a: "Ein Teil unseres Leitern- und Gerüst-Sortiments steht direkt am Service-Standort Mülheim zur Übergabe bereit. Modelle, die nicht vor Ort sind – insbesondere größere Rollgerüst-Konfigurationen – disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden. Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
        {
          q: "Kann ich kleine Leitern in Mülheim einfach mit dem Pkw abholen?",
          a: "Ja. Klapp-, Steh- und Mehrzweckleitern passen in der Regel in jeden Kombi oder Pkw mit Dachträger und können nach Terminvereinbarung an der Ruhrorter Str. 122 in Mülheim übergeben werden. Für Rollgerüste und große Schiebeleitern empfehlen wir die Lieferung direkt zur Einsatzstelle.",
        },
      ],
    },

    verdichtung: {
      hookline:
        "Rüttelplatten, Stampfer und Walzen für das Ruhrgebiet – Beratung, Übergabe und Rücknahme an unserem Service-Standort Mülheim in der Bobcat-Filiale, Lieferung direkt zur Einsatzstelle.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Beratung, Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt; das Gerät selbst disponieren wir aus unserem Hauptsitz in Krefeld – in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich. Liefer- und Übergabegebiet umfasst das gesamte Ruhrgebiet: Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen – relevant für Pflasterarbeiten, GaLaBau, Grabenverfüllung und Tiefbau in dichter Innenstadtlage.",
      faqs: [
        {
          q: "Liefert ihr Rüttelplatten und Stampfer nach Essen, Duisburg oder Oberhausen?",
          a: "Ja. Ab unserem Service-Standort Mülheim liefern wir Rüttelplatten, Vibrationsstampfer und Walzen ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52, in der Regel am nächsten Werktag. Für größere Geräte organisieren wir den Transport direkt aus Krefeld.",
        },
        {
          q: "Stehen die Verdichtungsgeräte direkt am Standort Mülheim?",
          a: "Ein Teil unseres Verdichtungs-Sortiments steht direkt am Service-Standort Mülheim zur Übergabe bereit. Modelle, die nicht vor Ort sind – insbesondere große Tandemwalzen oder Spezialstampfer – disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig taggleich. Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
      ],
    },

    arbeitsbuehnen: {
      hookline:
        "Scheren-, Mast- und Anhängerbühnen für das Ruhrgebiet – Beratung, Übergabe und Rücknahme an unserem Service-Standort Mülheim in der Bobcat-Filiale, Lieferung selbstfahrender Bühnen direkt zur Einsatzstelle.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Selbstfahrende Scheren- und Mastbühnen liefern wir per Transport ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anhängerbühnen werden vor Ort am Standort Mülheim übergeben und dort wieder zurückgegeben. Die Geräte selbst disponieren wir aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich.",
      faqs: [
        {
          q: "Liefert ihr selbstfahrende Arbeitsbühnen nach Essen, Duisburg oder Oberhausen?",
          a: "Ja. Ab unserem Service-Standort Mülheim liefern wir selbstfahrende Scheren- und Mastbühnen ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52, der Transport wird direkt aus Krefeld organisiert, in der Regel am nächsten Werktag. Anhängerbühnen werden vor Ort an der Ruhrorter Str. 122 übergeben.",
        },
        {
          q: "Stehen die Arbeitsbühnen direkt am Standort Mülheim?",
          a: "Ein Teil unseres Arbeitsbühnen-Sortiments steht direkt am Service-Standort Mülheim zur Übergabe bereit. Modelle mit größerer Arbeitshöhe oder Spezialbühnen disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden. Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
      ],
    },

    werkzeuge: {
      hookline:
        "Bohr-, Säge-, Fräs- und Messwerkzeuge für das Ruhrgebiet – Beratung, Übergabe und Rücknahme an unserem Service-Standort Mülheim in der Bobcat-Filiale.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Die meisten Werkzeuge lassen sich im eigenen Pkw oder Kombi transportieren – für Sanierungs- und Renovierungsprojekte im Ruhrgebiet ist Lieferung auf Anfrage ebenfalls möglich. Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt; das Werkzeug selbst disponieren wir aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden.",
      faqs: [
        {
          q: "Stehen die Werkzeuge direkt am Standort Mülheim?",
          a: "Ein Teil unseres Werkzeug-Kernsortiments steht direkt am Service-Standort Mülheim zur Übergabe bereit. Spezialwerkzeuge, die nicht vor Ort sind, disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig taggleich. Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
        {
          q: "Liefert ihr Werkzeuge ins Ruhrgebiet oder kann ich sie selbst abholen?",
          a: "Beides ist möglich. Bohrhämmer, Sägen, Fräsen und Messtechnik passen in der Regel in jeden Pkw oder Kombi und können nach Terminvereinbarung an der Ruhrorter Str. 122 in Mülheim übergeben werden. Für größere Mengen oder Baustellen in Essen, Duisburg, Oberhausen, Bochum, Gelsenkirchen oder Hattingen organisieren wir auf Anfrage die Lieferung direkt zur Einsatzstelle.",
        },
      ],
    },

    aggregate: {
      hookline:
        "Stromaggregate von 2,8 bis 100 kVA für das Ruhrgebiet – Beratung, Übergabe und Rücknahme an unserem Service-Standort Mülheim in der Bobcat-Filiale, Lieferung großer Diesel-Aggregate direkt zur Einsatzstelle.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Kleine tragbare Aggregate (z. B. 2,8 kVA Ford FG4050 oder 7,5 kVA Kärcher PGG 8/3) passen in jeden Pkw oder Kombi und werden nach Terminvereinbarung übergeben. Größere Diesel-Aggregate (20, 50, 80, 100 kVA) liefern wir per Transport ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen – passend für Baustellen ohne Netzanschluss, Events, Notstrom und Wasserschaden-Sanierung. Die Geräte selbst disponieren wir aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich.",
      faqs: [
        {
          q: "Liefert ihr große Stromaggregate nach Essen, Duisburg oder Oberhausen?",
          a: "Ja. Diesel-Aggregate ab 20 kVA liefern wir ab unserem Service-Standort Mülheim ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52, der Transport wird direkt aus Krefeld organisiert, in der Regel am nächsten Werktag. Bei Notstrom-Bedarf disponieren wir nach Möglichkeit kurzfristig, häufig auch taggleich.",
        },
        {
          q: "Stehen die Aggregate direkt am Standort Mülheim?",
          a: "Ein Teil unseres Aggregate-Sortiments steht direkt am Service-Standort Mülheim zur Übergabe bereit. Modelle, die nicht vor Ort sind – insbesondere große Diesel-Stromerzeuger ab 50 kVA – disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden. Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
        {
          q: "Kann ich kleine Aggregate in Mülheim einfach mit dem Pkw abholen?",
          a: "Ja. Tragbare Aggregate wie der 2,8 kVA Ford FG4050 oder der 7,5 kVA Kärcher PGG 8/3 passen in jeden Pkw oder Kombi und können nach Terminvereinbarung an der Ruhrorter Str. 122 in Mülheim übergeben werden. Für Diesel-Stromerzeuger ab 20 kVA empfehlen wir die Lieferung direkt zur Einsatzstelle.",
        },
      ],
    },

    "kabel-stromverteiler": {
      hookline:
        "CEE-Kabel (16/32/63 A), Schukokabel, Kabeltrommeln und CEE-Unterverteiler für das Ruhrgebiet – Beratung, Übergabe und Rücknahme an unserem Service-Standort Mülheim in der Bobcat-Filiale, große Verteilerschränke mit Lieferung direkt zur Baustelle.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. CEE- und Schukokabel (3, 5, 10, 20, 50 m), Schuko-Kabeltrommeln und CEE-Adapter (16↔32, 32↔63) passen in jeden Pkw oder Kombi und werden nach Terminvereinbarung übergeben. Größere CEE-Unterverteiler und Verteilerschränke (z. B. 24 kVA, 44 kVA, 55 kVA Anschlussschrank) liefern wir per Transport ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen – passend zur Stromversorgung von Baustellen, Events und Notstrom-Szenarien. Die Geräte selbst disponieren wir aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich.",
      faqs: [
        {
          q: "Liefert ihr CEE-Verteilerschränke nach Essen, Duisburg oder Oberhausen?",
          a: "Ja. Anschluss- und Verteilerschränke (24 kVA, 44 kVA, 55 kVA) sowie passende CEE-Kabel liefern wir ab unserem Service-Standort Mülheim ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52, der Transport wird direkt aus Krefeld organisiert, in der Regel am nächsten Werktag.",
        },
        {
          q: "Stehen die Verteiler und Kabel direkt am Standort Mülheim?",
          a: "Ein Teil unseres Kabel- und Verteiler-Sortiments steht direkt am Service-Standort Mülheim zur Übergabe bereit – typischerweise CEE-/Schukokabel, Kabeltrommeln und kleinere CEE-Unterverteiler. Große Verteilerschränke (z. B. Anschlussverteilerschrank 44 kVA) disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden. Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
        {
          q: "Kann ich CEE-Kabel und Adapter in Mülheim einfach mit dem Pkw abholen?",
          a: "Ja. CEE-Kabel (16/32/63 A in Längen von 3 bis 50 m), Schukokabel, Schuko-Kabeltrommeln und Mennekes-Adapter 16↔32 sowie 32↔63 passen in jeden Pkw und können nach Terminvereinbarung an der Ruhrorter Str. 122 in Mülheim übergeben werden. Für größere Verteilerschränke empfehlen wir die Lieferung direkt zur Einsatzstelle.",
        },
      ],
    },

    gartenpflege: {
      hookline:
        "Vertikutierer, Häcksler, Erdbohrer, Akku-Kettensägen, Freischneider, Baumstumpffräse und Hochdruckreiniger für das Ruhrgebiet – Beratung, Übergabe und Rücknahme an unserem Service-Standort Mülheim in der Bobcat-Filiale.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Vertikutierer (elektrisch und benzinbetrieben), Akku-Kettensäge, Freischneider, Benzin-Bodenhacke, Benzin-Erdbohrer, Erdbohrer 4308, Häcksler Axt und LS95 sowie Hochdruckreiniger passen in der Regel in jeden Pkw, Kombi oder kleinen Anhänger und werden nach Terminvereinbarung übergeben. Größere Geräte wie die Baumstumpffräse F360 liefern wir per Transport ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen – passend für Grundstückspflege, Heckenrückschnitt, Rasen-Sanierung und Aufräumarbeiten nach Sturmschäden. Die Geräte selbst disponieren wir aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich.",
      faqs: [
        {
          q: "Liefert ihr Gartengeräte nach Essen, Duisburg oder Oberhausen?",
          a: "Ja. Größere Geräte wie die Baumstumpffräse F360 oder Gartengeräte-Pakete liefern wir ab unserem Service-Standort Mülheim ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52, der Transport wird direkt aus Krefeld organisiert, in der Regel am nächsten Werktag. Vertikutierer, Akku-Kettensägen, Freischneider und Erdbohrer holst du in der Regel selbst mit Pkw oder Kombi ab.",
        },
        {
          q: "Stehen die Gartengeräte direkt am Standort Mülheim?",
          a: "Ein Teil unseres Gartenpflege-Sortiments steht direkt am Service-Standort Mülheim zur Übergabe bereit. Modelle, die nicht vor Ort sind – insbesondere die Baumstumpffräse F360 – disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig taggleich. Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
        {
          q: "Kann ich Vertikutierer und Häcksler in Mülheim einfach mit dem Pkw abholen?",
          a: "Ja. Vertikutierer (elektrisch und Benzin), Häcksler Axt und LS95, Akku-Kettensäge, Freischneider, Benzin-Bodenhacke, Benzin-Erdbohrer und Erdbohrer 4308 passen in der Regel in jeden Pkw, Kombi oder kleinen Anhänger und können nach Terminvereinbarung an der Ruhrorter Str. 122 in Mülheim übergeben werden. Für die Baumstumpffräse F360 empfehlen wir die Lieferung direkt zur Einsatzstelle.",
        },
      ],
    },

    absperrtechnik: {
      hookline:
        "Verkehrszeichen, Bauzäune, Schrankenzäune, Warnbarken, Warnleuchten und das Halteverbotsschilder-Set für das Ruhrgebiet – Beratung, Übergabe und Rücknahme an unserem Service-Standort Mülheim in der Bobcat-Filiale.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Warnleuchten, Fußplatten, Klemmschellen, Warnbarken und kleinere Verkehrszeichen passen in der Regel in jeden Pkw oder Kombi und werden nach Terminvereinbarung übergeben. Größere Mengen an Bauzäunen, Schrankenzäunen, Verkehrszeichen und das 18-teilige Halteverbotsschilder-Set liefern wir auf Anfrage ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen – passend für Baustellen, Umzüge, Events und Verkehrsführung. Die Geräte selbst disponieren wir aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich.",
      faqs: [
        {
          q: "Liefert ihr Absperrtechnik nach Essen, Duisburg oder Oberhausen?",
          a: "Ja. Größere Mengen an Bauzäunen, Schrankenzäunen, Verkehrszeichen und Halteverbotsschilder-Sets liefern wir ab unserem Service-Standort Mülheim ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52, der Transport wird direkt aus Krefeld organisiert, in der Regel am nächsten Werktag. Warnleuchten, Fußplatten und Klemmschellen holst du in der Regel selbst mit Pkw ab.",
        },
        {
          q: "Steht die Absperrtechnik direkt am Standort Mülheim?",
          a: "Ein Teil unseres Absperrtechnik-Sortiments steht direkt am Service-Standort Mülheim zur Übergabe bereit – typischerweise Warnleuchten, Fußplatten, Klemmschellen, Warnbarken und das Halteverbotsschilder-Set. Größere Mengen an Bauzäunen, Mannesmanngittern oder spezielle Verkehrszeichen disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden. Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
        {
          q: "Kann ich Warnleuchten und das Halteverbotsschilder-Set in Mülheim einfach mit dem Pkw abholen?",
          a: "Ja. TL-Warnleuchten, Fußplatten K1 TL, Wemas-Klemmschellen, Warnbarken und das 18-teilige Halteverbotsschilder-Set passen in der Regel in jeden Pkw oder Kombi und können nach Terminvereinbarung an der Ruhrorter Str. 122 in Mülheim übergeben werden. Für größere Mengen an Bauzäunen oder Schrankenzäunen empfehlen wir die Lieferung direkt zur Einsatzstelle.",
        },
      ],
    },

    beleuchtung: {
      hookline:
        "LED Outdoorscheinwerfer, Moving Heads, LED-Beleuchtungssets, LED-Fluter, Showtec Sunstrip und Nebelmaschinen für das Ruhrgebiet – Beratung, Übergabe und Rücknahme an unserem Service-Standort Mülheim in der Bobcat-Filiale.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Einzelne LED-Outdoorscheinwerfer, Moving Heads und kleinere Beleuchtungssets passen in der Regel in jeden Pkw oder Kombi und werden nach Terminvereinbarung übergeben. Größere Sets wie das LED Outdoorscheinwerfer 6er-Set, das Party Ton & Licht-Set oder mehrere LED-Fluter RGBWAUV liefern wir auf Anfrage ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen – passend für Firmenevents, Hochzeiten, Geburtstage, Konzerte, Stadtfeste und Außenveranstaltungen. Die Geräte selbst disponieren wir aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich.",
      faqs: [
        {
          q: "Liefert ihr Beleuchtungstechnik nach Essen, Duisburg oder Oberhausen?",
          a: "Ja. Größere Beleuchtungssets wie das LED Outdoorscheinwerfer 6er-Set, das Party Ton & Licht-Set, LED-Fluter RGBWAUV und Showtec Sunstrip Active MKII liefern wir ab unserem Service-Standort Mülheim ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52, der Transport wird direkt aus Krefeld organisiert, in der Regel am nächsten Werktag. Einzelne Scheinwerfer und Moving Heads holst du in der Regel selbst mit Pkw ab.",
        },
        {
          q: "Steht die Beleuchtung direkt am Standort Mülheim?",
          a: "Ein Teil unseres Event-Beleuchtungs-Sortiments steht direkt am Service-Standort Mülheim zur Übergabe bereit – typischerweise LED Outdoorscheinwerfer TourLED 50 XCR, einzelne Moving Heads und kleinere Beleuchtungssets. Größere Lichtanlagen, Spezial-Effekte wie der ADJ Fog Fury Jett PRO oder das komplette Party Ton & Licht-Set disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden. Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
        {
          q: "Kann ich LED-Scheinwerfer und Moving Heads in Mülheim einfach mit dem Pkw abholen?",
          a: "Ja. LED Outdoorscheinwerfer TourLED 50 XCR, LED Moving Head Vector Spot Zoom 2.0, LED Beleuchtungsset single und duo, einzelne LED-Fluter und Showtec Sunstrip Active MKII passen in der Regel in jeden Pkw oder Kombi und können nach Terminvereinbarung an der Ruhrorter Str. 122 in Mülheim übergeben werden. Für größere Sets wie das LED Outdoorscheinwerfer 6er-Set oder das Party Ton & Licht-Set empfehlen wir die Lieferung direkt zur Veranstaltungsstelle.",
        },
      ],
    },

    beschallung: {
      hookline:
        "Soundboks Gen.3, PA-Systeme (2.0/2.1), D.A.S. Audio Line-Array, Funkmikrofone und Mischpulte für das Ruhrgebiet – Beratung, Übergabe und Rücknahme an unserem Service-Standort Mülheim in der Bobcat-Filiale.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Soundboks Gen.3 (15,4 kg, Bluetooth 5.0) und Batteryboks passen in jeden Pkw oder Kombi. Das 2.1 Soundsystem 1400W RMS (ca. 55 kg, bis 75 Personen) und das 2.0 Soundsystem 800W RMS (bis 50 Personen) werden nach Terminvereinbarung übergeben. Größere PA-Anlagen wie das D.A.S. Soundsystem 3500W RMS (bis 250 Personen), D.A.S. Audio Action 508A/Vantec oder Funkmikrofon-Sets liefern wir auf Anfrage ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Die Geräte selbst disponieren wir aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich.",
      faqs: [
        {
          q: "Liefert ihr PA-Systeme und Beschallung nach Essen, Duisburg oder Oberhausen?",
          a: "Ja. Größere PA-Anlagen wie das D.A.S. Soundsystem 3500W RMS (bis 250 Personen), D.A.S. Audio Action 508A/Vantec Line-Array, 2.1 Soundsystem 1400W RMS sowie Funkmikrofon-Sets liefern wir ab unserem Service-Standort Mülheim ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52, der Transport wird direkt aus Krefeld organisiert, in der Regel am nächsten Werktag. Soundboks und kleines Zubehör holst du in der Regel selbst mit Pkw ab.",
        },
        {
          q: "Steht die Beschallung direkt am Standort Mülheim?",
          a: "Ein Teil unseres Beschallungs-Sortiments steht direkt am Service-Standort Mülheim zur Übergabe bereit – typischerweise Soundboks Gen.3, Batteryboks und das 2.1 Soundsystem 1400W RMS. Größere PA-Anlagen wie das D.A.S. Soundsystem 3500W RMS, D.A.S. Vantec 12A/18A Subwoofer, Funkmikrofon-Sets oder das 4-Kanal-Mischpult disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden. Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
        {
          q: "Kann ich den Soundboks in Mülheim einfach mit dem Pkw abholen?",
          a: "Ja. Der Soundboks Gen.3 (15,4 kg, 126 dB, Bluetooth 5.0 mit TeamUP-Modus für bis zu 5 Geräte) und der Batteryboks Ersatz-Akku passen in jeden Pkw oder Kombi und können nach Terminvereinbarung an der Ruhrorter Str. 122 in Mülheim übergeben werden. Für größere PA-Systeme wie das D.A.S. Soundsystem 3500W RMS oder das 2.1 Soundsystem 1400W RMS empfehlen wir die Lieferung direkt zur Veranstaltungsstelle.",
        },
      ],
    },

    kommunikation: {
      hookline:
        "UHF-Funkgeräte, Funkmikrofone und Headset-Sender für das Ruhrgebiet – Beratung, Übergabe und Rücknahme an unserem Service-Standort Mülheim in der Bobcat-Filiale.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. UHF-Funkgeräte 6er Set (Retevis RT29, 10 W, 3200 mAh, bis 168 h Standby, bis 8 km Reichweite auf freiem Gelände), Handfunkmikrofon und digitaler Funkempfänger passen in jeden Pkw oder Kombi. Das Sennheiser Funkmikrofon XSW 1-835 (ca. 25 m Reichweite) und der Taschensender für Headsets werden nach Terminvereinbarung übergeben. Größere Funkgeräte-Sets oder zusätzliche Lautsprecher-Mikrofone liefern wir auf Anfrage ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Die Geräte selbst disponieren wir aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich.",
      faqs: [
        {
          q: "Liefert ihr Funkgeräte und Funkmikrofone nach Essen, Duisburg oder Oberhausen?",
          a: "Ja. UHF-Funkgeräte-Sets, Sennheiser Funkmikrofon XSW 1-835, digitale Funkempfänger und Headset-Taschensender liefern wir ab unserem Service-Standort Mülheim ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52, der Transport wird direkt aus Krefeld organisiert, in der Regel am nächsten Werktag. Kleine Sets holst du in der Regel selbst mit Pkw ab.",
        },
        {
          q: "Stehen die Funkgeräte direkt am Standort Mülheim?",
          a: "Ein Teil unseres Kommunikations-Sortiments steht direkt am Service-Standort Mülheim zur Übergabe bereit – typischerweise UHF-Funkgeräte 6er Set (Retevis RT29), Handfunkmikrofon und digitaler Funkempfänger. Größere Mengen oder spezielle Konfigurationen wie der Taschensender für Headsets disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden. Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
        {
          q: "Kann ich Funkgeräte in Mülheim einfach mit dem Pkw abholen?",
          a: "Ja. Das UHF-Funkgeräte 6er Set (Retevis RT29) mit Ladestation, Handfunkmikrofon, digitaler Funkempfänger und Sennheiser Funkmikrofon XSW 1-835 passen in jeden Pkw oder Kombi und können nach Terminvereinbarung an der Ruhrorter Str. 122 in Mülheim übergeben werden. Für größere Mengen oder komplette Event-Kommunikations-Pakete empfehlen wir die Lieferung direkt zur Veranstaltungsstelle.",
        },
      ],
    },

    "moebel-zelte": {
      hookline:
        "Party- / Eventzelte (3×3 bis 4×14 m), Party- / Eventzelte extra hoch (6×8 und 6×12 m), Bierzeltgarnituren, Stehtische, Stühle, Sonnenschirme und Getränkekühlschränke für das Ruhrgebiet – Beratung, Übergabe und Rücknahme an unserem Service-Standort Mülheim in der Bobcat-Filiale.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Bierzeltgarnitur-Sets, Hussen-Sets (weiß/schwarz), Stehtische, Stühle weiß, Sonnenschirm LEMVIG Ø 3 m, Kleiderständer mit Rollen und Zeltboden-Module passen in der Regel in jeden Kombi oder kleinen Transporter. Die Party- / Eventzelte 3×3, 4×4, 4×6, 4×8, 4×10 und 4×14 m (UV-beständige 500 g/m² PVC-Plane), die Party- / Eventzelte 6×8 m und 6×12 m extra hoch sowie Getränkekühlschränke (236 l) liefern wir auf Anfrage ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Die Möbel und Zelte selbst disponieren wir aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich.",
      faqs: [
        {
          q: "Liefert ihr Party- / Eventzelte und Party- / Eventzelte nach Essen, Duisburg oder Oberhausen?",
          a: "Ja. Die Party- / Eventzelte 3×3, 4×4, 4×6, 4×8, 4×10 und 4×14 m sowie die Party- / Eventzelte 6×8 m und 6×12 m extra hoch liefern wir ab unserem Service-Standort Mülheim ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52, der Transport wird direkt aus Krefeld organisiert, in der Regel am nächsten Werktag. Wichtig: Zelte trocken zurückgeben – andernfalls fällt eine Trocknungspauschale an.",
        },
        {
          q: "Stehen Möbel und Zelte direkt am Standort Mülheim?",
          a: "Ein Teil unseres Möbel- und Zelt-Sortiments steht direkt am Service-Standort Mülheim zur Übergabe bereit – typischerweise Bierzeltgarnitur-Sets, Hussen, Stehtische, Stühle und Kleiderständer. Größere Party- / Eventzelte (ab 4×8 m), Party- / Eventzelte 6×8/6×12 m extra hoch, Getränkekühlschränke und Sonnenschirme disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden. Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
        {
          q: "Kann ich Bierzeltgarnituren und Stehtische in Mülheim einfach mit dem Pkw abholen?",
          a: "Ja. Bierzeltgarnitur-Sets, Hussen-Sets, Stehtische mit Hussen (weiß/schwarz), Stühle weiß, Sonnenschirm LEMVIG Ø 3 m, Kleiderständer mit Rollen und einzelne Zeltboden-Module passen in der Regel in jeden Kombi oder kleinen Transporter und können nach Terminvereinbarung an der Ruhrorter Str. 122 in Mülheim übergeben werden. Für komplette Party- / Eventzelt- oder Party- / Eventzelt-Aufbauten empfehlen wir die Lieferung direkt zur Veranstaltungsstelle.",
        },
      ],
    },

    "geschirr-glaeser-besteck": {
      hookline:
        "Gläser (Passionata & Brunelli), Teller, Schüsseln, Besteck, Gastro-Spülmaschine und Buffet-Tellerwärmer für das Ruhrgebiet – Beratung, Übergabe und Rücknahme an unserem Service-Standort Mülheim in der Bobcat-Filiale.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Gläser-Sets (Longdrink, Wasser, Weißwein, Rotwein, Sekt, Champagner, Bier), Teller Deluxe und SIMPLY, Dessertteller, Schüsseln, Kaffeetassen, Aschenbecher, Besteck-Sets (Gabeln, Löffel, Messer), der 2-in-1-Buffet- und Tellerwärmer sowie die Gastro-Spülmaschine Frontlader passen in der Regel in jeden Kombi oder kleinen Transporter. Größere Mengen liefern wir auf Anfrage ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Die Artikel selbst disponieren wir aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich.",
      faqs: [
        {
          q: "Liefert ihr Geschirr, Gläser und Besteck nach Essen, Duisburg oder Oberhausen?",
          a: "Ja. Ab unserem Service-Standort Mülheim liefern wir Gläser-Sets, Teller, Dessertteller, Schüsseln, Kaffeetassen, Besteck, Buffet-Tellerwärmer und Gastro-Spülmaschinen ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52, der Transport wird direkt aus Krefeld organisiert, in der Regel am nächsten Werktag. Kleine Sets holst du in der Regel selbst mit Pkw ab.",
        },
        {
          q: "Stehen Geschirr, Gläser und Besteck direkt am Standort Mülheim?",
          a: "Ein Teil unseres Geschirr-, Glas- und Besteck-Sortiments steht direkt am Service-Standort Mülheim zur Übergabe bereit – typischerweise Gläser-Sets, Teller, Dessertteller, Schüsseln und Besteck. Größere Mengen, der Buffet-Tellerwärmer oder die Gastro-Spülmaschine disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden. Übergabe, Einweisung und Rückgabe finden vollständig in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
        {
          q: "Kann ich Geschirr und Besteck in Mülheim einfach mit dem Pkw abholen?",
          a: "Ja. Gläser-Sets, Teller, Dessertteller, Schüsseln, Kaffeetassen, Aschenbecher und Besteck-Sets passen in der Regel in jeden Kombi oder kleinen Transporter und können nach Terminvereinbarung an der Ruhrorter Str. 122 in Mülheim übergeben werden. Für größere Event-Bestellungen oder die Gastro-Spülmaschine empfehlen wir die Lieferung direkt zur Veranstaltungsstelle.",
        },
      ],
    },

    buehne: {
      hookline:
        "Nivtec Systempodeste (2×0,5 m, 2×0,75 m, 2×1 m), Teleskopfüße (40/80 cm), Verstellspindelfüße (60 cm) und Manfrotto Autopoles disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – Übergabe und Beratung an unserem Service-Standort Mülheim in der Bobcat-Filiale.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Bühnenequipment (Nivtec Systempodeste in 2×0,5 m, 2×0,75 m und 2×1 m, Teleskopfüße 40/80 cm, Verstellspindelfuß 60 cm sowie Manfrotto 032B Autopole schwarz) disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich. Lieferung ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen.",
      faqs: [
        {
          q: "Liefert ihr Bühnenpodeste nach Essen, Duisburg oder Oberhausen?",
          a: "Ja. Nivtec Systempodeste, Teleskopfüße, Verstellspindelfüße und Manfrotto Autopoles liefern wir ab unserem Service-Standort Mülheim ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52, der Transport wird direkt aus Krefeld organisiert, in der Regel am nächsten Werktag.",
        },
        {
          q: "Stehen Nivtec-Podeste direkt am Standort Mülheim?",
          a: "Bühnenequipment disponieren wir in der Regel auf Anfrage aus unserem Hauptsitz Krefeld nach Mülheim – üblicherweise innerhalb von 24 Stunden. Übergabe, Beratung und Rückgabe finden vollständig am Service-Standort Ruhrorter Str. 122 in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
      ],
    },

    "traversen-rigging": {
      hookline:
        "Milos M290 Traversen-System (Multicube, P4 QTU 500/1000/1500/2000, UBPQC Base) und Traversen-Cover weiß (2 m und 3 m) disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – Übergabe und Beratung an unserem Service-Standort Mülheim in der Bobcat-Filiale.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Milos M290 Traversen (Multicube black, P4 QTU 500/1000/1500/2000 black, UBPQC Base black) und die Traversen-Cover weiß in 2 m und 3 m disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich. Lieferung ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen.",
      faqs: [
        {
          q: "Liefert ihr Milos-Traversen nach Essen, Duisburg oder Oberhausen?",
          a: "Ja. Milos M290 Traversen-Komponenten (Multicube, P4 QTU 500/1000/1500/2000, UBPQC Base) und Traversen-Cover weiß (2 m, 3 m) liefern wir ab unserem Service-Standort Mülheim ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52, der Transport wird direkt aus Krefeld organisiert, in der Regel am nächsten Werktag.",
        },
        {
          q: "Stehen Milos-Traversen direkt am Standort Mülheim?",
          a: "Traversen-Equipment disponieren wir in der Regel auf Anfrage aus unserem Hauptsitz Krefeld nach Mülheim – üblicherweise innerhalb von 24 Stunden. Übergabe, Beratung und Rückgabe finden vollständig am Service-Standort Ruhrorter Str. 122 in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
      ],
    },

    spezialeffekte: {
      hookline:
        "ADJ Fog Fury Jett PRO Nebelmaschine, Kalt-Funkenfontänen (Spark/Sparkular) als Einzelgerät, 2er- und 4er-Set, TCM FX Turbo CO2 Jet und XL Profi Popcornmaschine disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – Übergabe und Beratung an unserem Service-Standort Mülheim in der Bobcat-Filiale.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Spezialeffekt-Geräte – ADJ Fog Fury Jett PRO, Kalt-Funkenfontänen Einzelgerät/2er-Set/4er-Set, TCM FX Turbo CO2 Jet und die XL Profi Popcornmaschine – disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich. Lieferung ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen – passend für Hochzeiten, Firmenfeiern, Bühnenshows und Stadtteilfeste.",
      faqs: [
        {
          q: "Liefert ihr Nebelmaschinen und Kalt-Funkenfontänen ins Ruhrgebiet?",
          a: "Ja. Die ADJ Fog Fury Jett PRO Nebelmaschine, Kalt-Funkenfontänen (Spark/Sparkular) als Einzelgerät, 2er- und 4er-Set, den TCM FX Turbo CO2 Jet sowie die XL Profi Popcornmaschine liefern wir ab unserem Service-Standort Mülheim ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52, der Transport wird direkt aus Krefeld organisiert, in der Regel am nächsten Werktag.",
        },
        {
          q: "Stehen Nebelmaschine und Sparkulars direkt am Standort Mülheim?",
          a: "Spezialeffekt-Geräte disponieren wir in der Regel auf Anfrage aus unserem Hauptsitz Krefeld nach Mülheim – üblicherweise innerhalb von 24 Stunden. Übergabe, Einweisung und Rückgabe finden vollständig am Service-Standort Ruhrorter Str. 122 in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
      ],
    },

    huepfburgen: {
      hookline:
        "HappyHop Hüpfburg Lamar 2,8×2,1 m, Hüpfburg Wasserpark 3×4 m, Hüpfburg Rollercoaster 4,9×4 m und Hüpfburg Clown 6,1×5,2 m disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – Lieferung ins gesamte Ruhrgebiet, Übergabe und Beratung am Service-Standort Mülheim.",
      standortFakten:
        "Übergabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Hüpfburgen – HappyHop Lamar 2,8×2,1 m, Wasserpark 3×4 m, Rollercoaster 4,9×4 m sowie Clown 6,1×5,2 m – disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld, in der Regel innerhalb von 24 Stunden, bei dringendem Bedarf häufig auch taggleich. Lieferung ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen – passend für Kindergeburtstage, Schulfeste, Vereinsfeiern und Stadtteilfeste.",
      faqs: [
        {
          q: "Liefert ihr Hüpfburgen nach Essen, Duisburg oder Oberhausen?",
          a: "Ja. Die HappyHop Hüpfburg Lamar 2,8×2,1 m, die Hüpfburg Wasserpark 3×4 m, die Hüpfburg Rollercoaster 4,9×4 m und die Hüpfburg Clown 6,1×5,2 m liefern wir ab unserem Service-Standort Mülheim ins gesamte Ruhrgebiet – Essen, Duisburg, Oberhausen, Mülheim, Bochum, Gelsenkirchen und Hattingen. Anfahrt über A40 und A52, der Transport wird direkt aus Krefeld organisiert, in der Regel am nächsten Werktag.",
        },
        {
          q: "Stehen die Hüpfburgen direkt am Standort Mülheim?",
          a: "Hüpfburgen disponieren wir in der Regel auf Anfrage aus unserem Hauptsitz Krefeld nach Mülheim – üblicherweise innerhalb von 24 Stunden. Übergabe, Aufbau-Hinweise und Rückgabe finden vollständig am Service-Standort Ruhrorter Str. 122 in Mülheim statt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an.",
        },
      ],
    },

    "wohnwagen-camping": {
      hookline:
        "Den Weinsberg CaraOne 480 QDK (familientauglich, bis 5 Personen, Dusche, WC, Truma-Heizung und Mover) mietest du auf Anfrage an unserem Service-Standort Mülheim – ab 30 €/Tag inkl. Vollkasko.",
      standortFakten:
        "Übergabe und Rückgabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Der Weinsberg CaraOne 480 QDK (Gesamtlänge mit Deichsel 7,07 m, zulässiges Gesamtgewicht 1.500 kg, 2 Erwachsene + 3 Kinder) wird auf Anfrage aus unserem Hauptsitz Krefeld disponiert. Mindestmietdauer 5 Tage, Servicepauschale 99 € einmalig (Einweisung, 11-kg-Gasflasche, Spiegelverlängerungen, Strom-Adapterkabel, Sanitärchemie, 2 Rollen Toilettenpapier), Endreinigung optional 99 €, Kaution 1.000 €, Teil- und Vollkasko enthalten (Selbstbeteiligung gegenüber Versicherung 2.500 €). Wohnwagen werden mit dem eigenen Zugfahrzeug (ab 1.500 kg Anhängelast) abgeholt – eine Lieferung bieten wir hierfür nicht an.",
      faqs: [
        {
          q: "Kann ich den Wohnwagen direkt am Service-Standort Mülheim übernehmen?",
          a: "Ja. Übergabe, Einweisung und Rückgabe des Weinsberg CaraOne 480 QDK finden nach Terminvereinbarung an unserem Service-Standort Ruhrorter Str. 122 in Mülheim statt. Den Wohnwagen selbst disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – frag uns am besten frühzeitig an, gerade für Ferienzeiten.",
        },
        {
          q: "Welches Zugfahrzeug brauche ich für den Weinsberg CaraOne 480 QDK?",
          a: "Der Weinsberg CaraOne 480 QDK hat ein zulässiges Gesamtgewicht von 1.500 kg, eine Aufbaulänge von 5,84 m und eine Gesamtlänge mit Deichsel von 7,07 m. Du brauchst also ein Zugfahrzeug mit mindestens 1.500 kg Anhängelast. Mover und Antischlingerkupplung sind serienmäßig dabei. Wohnwagen werden bei uns ausschließlich abgeholt – wir liefern keine Wohnwagen.",
        },
        {
          q: "Was ist in der Wohnwagen-Miete enthalten?",
          a: "Im Mietpreis enthalten sind die voll ausgestattete Küche, eine 11-kg-Gasflasche, Strom- und Wasseranschlusskabel, Spiegelverlängerung und Vollkaskoversicherung. Mindestmietdauer 5 Tage, Servicepauschale 99 € einmalig (Einweisung, Gasflasche, Spiegelverlängerung, Strom-Adapter, Sanitärchemie, 2 Rollen Toilettenpapier), Endreinigung optional 99 €, Kaution 1.000 €. Die Selbstbeteiligung gegenüber der Versicherung beträgt 2.500 €, die Kaution selbst aber nur 1.000 €.",
        },
      ],
    },

    nutzfahrzeuge: {
      hookline:
        "Den 7,5-t Dreiseitenkipper (MAN TGL 8.220, Meiller D205, Automatik, Euro 6e) und den 3,5-t Pritschenwagen Dreiseitenkipper mit Doppelkabine (Opel Movano o. vgl., Klasse B) mietest du auf Anfrage an unserem Service-Standort Mülheim – Abholung vor Ort, eine Lieferung bieten wir für Nutzfahrzeuge nicht an.",
      standortFakten:
        "Übergabe und Rückgabe an unserem Service-Standort Ruhrorter Str. 122, 45478 Mülheim an der Ruhr – nach Vereinbarung, eingebettet in die Bobcat-Filiale vor Ort. Online-Buchung 24/7 möglich. Anfahrt direkt über die A40 (Ruhrschnellweg) und die A52. Der 7,5-t MAN-Dreiseitenkipper mit Meiller-D205-Aufbau (220 PS, Automatik, 4,5 m³ Volumen, Hydraulikanschluss für Kippanhänger, Führerscheinklasse C1) und der 3,5-t Opel Movano Pritschenwagen-Dreiseitenkipper mit Doppelkabine (bis zu 7 Sitzplätze, 1.135 kg Nutzlast, 3,60 × 2,05 m Ladefläche, Anhängelast bis 2.500 kg, Führerscheinklasse B) werden auf Anfrage aus unserem Hauptsitz Krefeld disponiert. Mietkonditionen: 100 km/Tag inklusive, Diesel-Rückgabe vollgetankt (sonst 2,85 €/l), Kaution 1.000 €, Vollkasko-Selbstbeteiligung 2.500 €. Hinweis: Nutzfahrzeuge werden ausschließlich vor Ort abgeholt und zurückgegeben – eine Lieferung wie bei Baumaschinen ist hierfür nicht vorgesehen.",
      faqs: [
        {
          q: "Welchen Führerschein brauche ich für eure Kipper?",
          a: "Der 3,5-t Opel Movano Pritschenwagen-Dreiseitenkipper mit Doppelkabine ist mit der Führerscheinklasse B fahrbar – also dem normalen Pkw-Führerschein. Für den 7,5-t MAN-Dreiseitenkipper (MAN TGL 8.220 mit Meiller D205) brauchst du mindestens die Führerscheinklasse C1.",
        },
        {
          q: "Liefert ihr Kipper-Lkw und Pritschenwagen auch ins Ruhrgebiet?",
          a: "Nein. Nutzfahrzeuge werden bei uns – genau wie Anhänger – grundsätzlich nicht geliefert. Übergabe und Rückgabe finden an unserem Service-Standort Ruhrorter Str. 122 in Mülheim statt. Den Wagen selbst disponieren wir auf Anfrage aus unserem Hauptsitz Krefeld – am besten frühzeitig anfragen.",
        },
        {
          q: "Was kostet die Miete inkl. Kilometer und Diesel?",
          a: "Bei beiden Kippern sind 100 km/Tag im Mietpreis enthalten. Mehrkilometer kosten beim 7,5-Tonner 0,40 €/km netto und beim 3,5-Tonner 0,23 €/km netto. Die Rückgabe erfolgt vollgetankt mit Diesel (sonst 2,85 €/l); beim 7,5-Tonner zusätzlich AdBlue vollgetankt (sonst 1,85 €/l). Kaution 1.000 €, Vollkasko-Selbstbeteiligung 2.500 €.",
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
