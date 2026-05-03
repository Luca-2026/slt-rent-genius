// SEO content blocks for the "Möbel & Zelte" category page – unique per location.
// Used by src/pages/rental/CategoryProducts.tsx.

export interface MoebelZelteSection {
  h2: string;
  paragraphs: string[];
  table?: { headers: string[]; rows: string[][] };
}

export interface MoebelZelteContent {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  heroLead: string; // Block A
  bottomHeadline: string; // Block B opener H2
  sections: MoebelZelteSection[]; // Block B sections (after the opener)
  faqs: { question: string; answer: string }[]; // Block C
}

const sizeTable = {
  headers: ["Anlass", "Empfohlene Grundfläche", "Modell"],
  rows: [
    ["Kleine Geburtstagsfeier (10–20 Pers.)", "9–16 m²", "Partyzelt 3×3 oder 4×4"],
    ["Familienfest (30–40 Pers.)", "24–32 m²", "Partyzelt 4×6 oder 4×8"],
    ["Größere Feier (50–70 Pers.)", "40–48 m²", "Partyzelt 4×10 oder Eventzelt 6×8"],
    ["Hochzeit / Vereinsfest (80–120 Pers.)", "56–72 m²", "Partyzelt 4×14 oder Eventzelt 6×12"],
  ],
};

export const moebelZelteContent: Record<string, MoebelZelteContent> = {
  // ============================== KREFELD ==============================
  krefeld: {
    metaTitle: "Möbel & Zelte mieten Krefeld – mit Aufbauservice | SLT",
    metaDescription:
      "Partyzelt mieten Krefeld: Bierzeltgarnituren, Stehtische, Eventzelte 6×8 & 6×12. Mit Tiefpreisgarantie und optionalem Aufbauservice. Jetzt online anfragen.",
    keywords:
      "Möbel und Zelte mieten Krefeld, Partyzelt mieten Krefeld, Festzelt mieten Krefeld, Bierzeltgarnitur mieten Krefeld, Bierzeltgarnitur Set mieten Krefeld, Bierzeltgarnitur mit Hussen Krefeld, Bierbankgarnitur mieten Krefeld, Festzeltgarnitur mieten Krefeld, Biertische und Bänke mieten Krefeld, Stehtisch mieten Krefeld, Stehtisch mit Husse mieten Krefeld, Bistrotisch mieten Krefeld, Cocktailtisch mieten Krefeld, Eventzelt mieten Krefeld, Hochzeitszelt mieten Krefeld, Zeltverleih Krefeld, Tische und Stühle mieten Krefeld",
    heroLead:
      "Vom Schützenfest in Fischeln über die Vereinsfeier in Bockum bis zur Hochzeit im eigenen Garten in Uerdingen: Bei SLT Rental am Niederrhein finden Sie das passende Mobiliar und die richtigen Zelte aus einer Hand. Partyzelte von 3×3 bis 4×14 m, Eventzelte mit 2,6 m Durchgangshöhe, Bierzeltgarnituren mit oder ohne Hussen, Stehtische, Stapelstühle und Sonnenschirme – sauber, geprüft und auf Wunsch inklusive Aufbauservice vor Ort.",
    bottomHeadline: "Möbel und Zelte mieten in Krefeld – Komplettausstattung für Feste am Niederrhein",
    sections: [
      {
        h2: "Welche Zeltgröße passt zu welchem Anlass?",
        paragraphs: [
          "Als Faustformel rechnen Sie pro sitzender Person etwa 0,8 bis 1,0 m² Zeltfläche, mit Tanzfläche und Buffet eher 1,5 m². Für eine kleine Geburtstagsrunde reichen 9 bis 16 m². Eine klassische Schützen- oder Familienfeier mit 40 Personen ist mit 32 bis 40 m² gut abgedeckt – das modulare Partyzelt 4×10 m bietet hier den Vorteil, dass es sich aus den Modulen 4×6 und 4×4 zusammensetzt und mit Regenrinne ausgestattet ist.",
        ],
        table: sizeTable,
      },
      {
        h2: "Bierzeltgarnitur mieten in Krefeld – das Rückgrat jeder Feier am Niederrhein",
        paragraphs: [
          "Ein Bierzeltgarnitur-Set – im Sprachgebrauch oft auch Festzeltgarnitur, Bierbankgarnitur oder schlicht Biertisch mit Bänken genannt – besteht bei uns aus einem klappbaren Tisch (50 × 220 cm) und zwei dazu passenden Bänken (25 × 220 cm). Pro Garnitur planen Sie acht bis zehn Sitzplätze ein, je nachdem wie eng zusammengerückt wird. Das Holz ist abwischbar, die Beine klappen ohne Werkzeug ein, und das Set lässt sich von zwei Personen in unter einer Minute aufstellen. Damit sind Bierzeltgarnituren in Krefeld die Standardlösung für Schützenfeste, Karnevalssitzungen, runde Geburtstage und Vereinsabende.",
          "Wer Biertische und Bänke mieten möchte, ohne dass es nach Vereinsheim aussieht, kombiniert das Set mit unserem Hussen-Set in Weiß: zwei Bankhussen plus eine Tischhusse, gewaschen zurückzugeben. Das macht aus der Standard-Bierzeltgarnitur in wenigen Minuten eine Tischlandschaft, die auch bei Hochzeiten in Bockum, Verberg oder Forstwald oder bei Firmen-Sommerfesten in Fichtenhain gut aussieht.",
          "Typische Konstellation für ein Bauernschützenfest in Krefeld-Oppum oder Linn: drei bis vier Bierzeltgarnituren mit Hussen unter einem Eventzelt 6×12 m, dazu ein Getränkekühlschrank mit Glastür für die Theke und ein paar Stehtische am Eingang. Praktisch ist die Bierzeltgarnitur auch als Buffettisch: zwei Garnituren parallel gestellt ergeben eine 4,4 m lange Buffetzeile, die mit weißer Tischhusse sofort nach Catering aussieht.",
        ],
      },
      {
        h2: "Eventzelte mit 2,6 m Durchgangshöhe – wenn es repräsentativer werden soll",
        paragraphs: [
          "Für Hochzeiten, Firmenjubiläen oder Karnevalssitzungen empfehlen wir die Eventzelte 6×8 m (48 m²) und 6×12 m (72 m²). Beide bieten 2,6 m lichte Durchgangshöhe – das wirkt deutlich großzügiger als ein klassisches Partyzelt und lässt Stehtische, Sektempfang und Live-Band ohne gefühlte Decke über dem Kopf zu. Im Lieferumfang sind Seiten- und Stirnwände enthalten.",
          "Das Eventzelt 6×12 m ist zusätzlich nach EN 13501-1 schwer entflammbar zertifiziert. Damit eignet es sich für Veranstaltungen mit erhöhten Brandschutzauflagen, etwa bei Vereinsjubiläen mit größerer Personenzahl oder Firmenevents auf gemieteten Außenflächen in Krefeld-Fichtenhain.",
        ],
      },
      {
        h2: "Stehtisch mieten in Krefeld – mit Husse in Weiß oder Schwarz",
        paragraphs: [
          "Unsere Stehtische sind klappbar (Ø 80 cm, Höhe 110 cm), haben Metallbeine und eine pflegeleichte Kunststoffplatte. Damit zählen sie zur Kategorie der klassischen Bistrotische bzw. Cocktailtische und sind das Standard-Möbel für Sektempfang, Stehkaffee oder Mingle-Bereiche. Pro Stehtisch planen Sie vier bis sechs stehende Personen ein.",
          "Die passende Stretch-Husse ist in Weiß oder Schwarz verfügbar – Weiß für Hochzeiten, Trauerfeiern und repräsentative Empfänge, Schwarz für Firmenevents, Produktpräsentationen und After-Work-Anlässe. Die Hussen sitzen faltenfrei, müssen nicht extra gebügelt werden und werden gewaschen zurückgegeben.",
          "Klassische Krefelder Einsätze: Sektempfang vor der Schützenhalle in Fischeln, Empfangsbereich beim Vereinsjubiläum in Bockum, Cocktail-Insel beim Firmenfest im Europark Fichtenhain oder Stehkaffee bei der Trauung im Standesamt Uerdingen. Wer mehr als zehn Stehtische plant, sollte über Lieferung statt Selbstabholung nachdenken – wir kalkulieren die Kosten transparent im Buchungsschritt.",
        ],
      },
      {
        h2: "Pavillons, Partyzelte und das modulare 4×10-System",
        paragraphs: [
          "Die Partyzelte sind mit einer 500 g/m² PVC-Plane ausgestattet, rasterfaserverstärkt, UV-beständig und mit Dachspannern gegen Wassersäcke ausgerüstet. Das Modul-System 4×10 m und 4×14 m setzt sich aus einzelnen 4×4- und 4×6-Modulen zusammen – damit sind Aufbauten in L-Form oder in Reihe an verwinkelten Garten- und Hofsituationen in Bockum, Verberg oder Traar machbar.",
        ],
      },
      {
        h2: "Lieferung, Aufbau und Abholung in Krefeld und Umgebung",
        paragraphs: [
          "Wir liefern in das gesamte Krefelder Stadtgebiet – darunter Fischeln, Bockum, Uerdingen, Hüls und Forstwald – sowie in die umliegenden Städte am Niederrhein. Die Lieferkosten kalkulieren wir transparent im Buchungsschritt anhand der Entfernung. Auf Wunsch übernehmen wir den kompletten Aufbau- und Abbauservice; Selbstabholer holen das Material auf der Anrather Straße ab.",
          "Zelte werden trocken zurückgegeben. Bei feucht angeliefertem Material berechnen wir eine Trocknungspauschale (60–150 €), damit das nächste Fest wieder sauberes Equipment bekommt. Bierzeltgarnitur-Hussen geben Sie bitte gewaschen zurück, der Zeltboden besenrein. Preise sind über die Tiefpreisgarantie abgesichert; B2B-Konditionen für Veranstalter und Caterer auf Anfrage.",
        ],
      },
    ],
    faqs: [
      {
        question: "Welches Zelt eignet sich für ein Schützen- oder Vereinsfest in Krefeld?",
        answer:
          "Für klassische Schützen- und Vereinsfeste mit 60 bis 100 Personen empfehlen wir das Eventzelt 6×12 m (72 m², 2,6 m Durchgangshöhe, schwer entflammbar nach EN 13501-1) in Kombination mit Bierzeltgarnitur-Sets. Für kleinere Vereinsabende reicht ein Partyzelt 4×8 oder das modulare 4×10.",
      },
      {
        question: "Welche Zeltgrößen sind in Krefeld verfügbar?",
        answer:
          "Wir vermieten Partyzelte in 9, 16, 24, 32, 40 und 56 m² sowie Eventzelte mit 48 m² (6×8) und 72 m² (6×12). Damit decken wir Anlässe vom Garten-Geburtstag bis zum Vereinsjubiläum mit über 100 Gästen ab.",
      },
      {
        question: "Bietet SLT Rental einen Aufbau- und Abbauservice an?",
        answer:
          "Ja. Aufbau und Abbau sind in Krefeld optional buchbar und werden im Buchungsprozess als Zusatzleistung ausgewiesen. Wer selbst aufbauen möchte, bekommt das Material vorbereitet zur Selbstabholung an unserem Standort in Krefeld-Fichtenhain.",
      },
      {
        question: "In welche Krefelder Stadtteile liefert SLT Rental?",
        answer:
          "Wir liefern in das gesamte Stadtgebiet – darunter Fischeln, Bockum, Uerdingen, Oppum, Hüls, Linn, Forstwald, Traar und Verberg. Die genauen Lieferkosten berechnet der Lieferkostenrechner im Buchungsschritt anhand der Adresse.",
      },
      {
        question: "Sind die Zelte feuerfest?",
        answer:
          "Das Eventzelt 6×12 m ist nach EN 13501-1 schwer entflammbar zertifiziert. Bei den weiteren Zelten teilen wir die jeweils gültige Brandschutz-Klassifizierung gerne auf Anfrage mit, damit Sie die Vorgaben des Veranstaltungsorts oder Ordnungsamts einhalten.",
      },
      {
        question: "Was kostet ein Partyzelt in Krefeld?",
        answer:
          "Die Preise hängen von Zeltgröße, Mietdauer und Lieferweg ab. Den tagesaktuellen Mietpreis sehen Sie direkt im Buchungsprozess; auf Mietartikel gilt unsere Tiefpreisgarantie. B2B-Kunden erhalten gesondert kalkulierte Konditionen auf Anfrage.",
      },
      {
        question: "Müssen die Zelte trocken zurückgegeben werden?",
        answer:
          "Ja, bitte geben Sie die Zelte trocken zurück. Bei feuchter Rückgabe fällt eine Trocknungspauschale zwischen 60 und 150 € an, damit das Material zuverlässig getrocknet und für die nächste Veranstaltung bereitgestellt werden kann.",
      },
    ],
  },

  // ============================== BONN ==============================
  bonn: {
    metaTitle: "Möbel & Zelte mieten Bonn – inkl. Lieferung & Aufbau | SLT",
    metaDescription:
      "Eventzelte, Bierzeltgarnituren mit Hussen und Stehtische mieten in Bonn. Für Gartenhochzeit, Sommerfest und Empfang – B2B-Konditionen verfügbar. Jetzt anfragen.",
    keywords:
      "Möbel und Zelte mieten Bonn, Partyzelt mieten Bonn, Hochzeitszelt mieten Bonn, Eventzelt mieten Bonn, Bierzeltgarnitur mit Hussen Bonn, Stehtisch mit Husse Bonn, Mietmöbel Bonn, Zeltverleih Bonn",
    heroLead:
      "Ob Gartenhochzeit in Bad Godesberg, Sommerfest einer Bundesbehörde am Rhein oder Sektempfang in Endenich: Über die Filiale in Bonn bekommen Sie bei SLT Rental das passende Equipment für repräsentative wie private Anlässe. Vom 6×8 m Eventzelt mit 2,6 m Durchgangshöhe über Bierzeltgarnituren mit weißen Hussen bis hin zu Stehtischen, Stapelstühlen und Sonnenschirmen – im Rheinland aus einer Hand mietbar.",
    bottomHeadline: "Möbel und Zelte mieten in Bonn – Eventausstattung für Rhein und Vorgebirge",
    sections: [
      {
        h2: "Eventzelte mit 2,6 m Durchgangshöhe – die Basis für Hochzeit und Empfang",
        paragraphs: [
          "Das Eventzelt 6×8 m (48 m²) ist die Standardlösung für Gartenhochzeiten in Bad Godesberg, Beuel oder Endenich. Mit 2,6 m lichter Durchgangshöhe und kompletten Seiten- und Stirnwänden lässt es genug Raum für Tafeltische, eine kleine Tanzfläche und einen DJ-Bereich. Für größere Feiern mit 80 bis 120 Gästen liefern wir das Eventzelt 6×12 m (72 m²), nach EN 13501-1 schwer entflammbar zertifiziert.",
          "Beispielszene: Sektempfang im Garten in Bad Godesberg mit acht Stehtischen unter weißen Stretch-Hussen, anschließend Hochzeitsdinner unter dem 6×8 m Eventzelt mit Bierzeltgarnituren in der weißen Hussen-Variante – funktional, aber durchaus elegant.",
        ],
      },
      {
        h2: "Bierzeltgarnituren – das Rückgrat jeder Feier im Rheinland",
        paragraphs: [
          "Ein Bierzeltgarnitur-Set besteht aus einem Tisch (50 × 220 cm) und zwei Bänken (25 × 220 cm). Mit dem weißen Hussen-Set (zwei Bankhussen plus eine Tischhusse) wird aus dem Werkstattmobiliar eine ruhige, repräsentative Tischlandschaft – passend zu Sommerfesten von NGOs, UN-Organisationen und Bundesbehörden ebenso wie zu Schützenfesten im Bonner Norden.",
          "Hussen geben Sie bitte gewaschen zurück. Das spart Aufbereitungspauschalen und sorgt dafür, dass das nächste Hochzeitspaar wieder ein einwandfrei vorbereitetes Set bekommt.",
        ],
      },
      {
        h2: "Welche Zeltgröße passt zu welchem Anlass?",
        paragraphs: [
          "Faustformel: 0,8 bis 1,0 m² pro sitzender Person, mit Tanzfläche und Buffet eher 1,5 m². Eine Hochzeit mit 60 Gästen sitzt komfortabel im Eventzelt 6×8 m, eine Firmenfeier mit 100 Personen passt unter das Eventzelt 6×12 m. Für kleine Gartenrunden reichen die Partyzelte 3×3 bis 4×8.",
        ],
        table: sizeTable,
      },
      {
        h2: "Stehtische für Empfänge, Sektrunden und Mingle-Bereiche",
        paragraphs: [
          "Klappbar, Metallbeine, Kunststoffplatte – plus Stretch-Husse Ø 80 cm in Weiß oder Schwarz (Höhe 110 cm). Das ist die Kombination, die wir für Sektempfänge vor Tagungsräumen, für Open-Air-Receptions in der Rheinaue oder für Foyer-Mingle-Bereiche bei Firmensommerfesten am häufigsten ausliefern.",
        ],
      },
      {
        h2: "Sonnenschirme, Zeltboden und ergänzendes Mobiliar",
        paragraphs: [
          "Für Garten- und Außenbereiche bieten wir den Sonnenschirm LEMVIG (Ø 3 m) mit FSC-zertifizierter Hartholzstange, UV-beständiger Polyesterbespannung und Neigungsfunktion. Ein passender Ständer mit mindestens 35 kg ist nicht im Lieferumfang enthalten – bitte separat planen.",
          "Bei feuchten Wiesen oder unebenen Untergründen empfehlen wir den Zeltboden in Anthrazit (0,86 m² pro Element, Nut-und-Feder-System, ca. 15 t/m² belastbar, recycelter Kunststoff-Mix). Rückgabe besenrein. Ergänzend mietbar: Getränkekühlschrank 236 l mit Glastür und LED-Beleuchtung sowie der ausziehbare Kleiderständer auf Rollen für Garderobenbereiche bei Tagungen und Empfängen.",
        ],
      },
      {
        h2: "Lieferung, Aufbau und Abholung in Bonn und Umgebung",
        paragraphs: [
          "Wir liefern in alle Bonner Stadtbezirke – darunter Bad Godesberg, Beuel, Hardtberg sowie Stadtteile wie Endenich, Poppelsdorf, Pützchen, Duisdorf und Tannenbusch – ebenso in die umliegenden Kommunen entlang der Rhein-Sieg-Achse. Die Lieferkosten ergeben sich aus der Entfernung und werden im Buchungsschritt transparent kalkuliert.",
          "Aufbau und Abbau sind optional buchbar; Selbstabholer holen das Material an unserer Bonner Filiale ab. Zelte trocken zurückgeben (sonst Trocknungspauschale 60–150 €), Hussen gewaschen, Zeltboden besenrein. Auf alle Mietartikel gilt unsere Tiefpreisgarantie; B2B-Konditionen für Eventagenturen und Caterer auf Anfrage.",
        ],
      },
    ],
    faqs: [
      {
        question: "Welches Zelt passt zu einer Hochzeit im Garten in Bonn?",
        answer:
          "Für Gartenhochzeiten in Bad Godesberg, Beuel oder Endenich empfehlen wir das Eventzelt 6×8 m (48 m², 2,6 m Durchgangshöhe). Für 80 bis 120 Gäste das Eventzelt 6×12 m mit 72 m² – schwer entflammbar nach EN 13501-1.",
      },
      {
        question: "Sind die Bierzeltgarnituren mit Hussen verfügbar?",
        answer:
          "Ja. Zu jedem Bierzeltgarnitur-Set buchen Sie optional das weiße Hussen-Set hinzu: zwei Bankhussen plus eine Tischhusse. Damit wirkt die Tischlandschaft passend zu Hochzeiten, Empfängen und Firmensommerfesten im Rheinland. Bitte gewaschen zurückgeben.",
      },
      {
        question: "Welche Zeltgrößen kann ich in Bonn mieten?",
        answer:
          "Verfügbar sind Partyzelte mit 9, 16, 24, 32, 40 und 56 m² Grundfläche sowie Eventzelte mit 48 m² (6×8) und 72 m² (6×12). Damit decken wir Anlässe von der Gartenfeier bis zum Bundesbehörden-Sommerfest ab.",
      },
      {
        question: "Bietet SLT Rental Aufbauservice in Bonn an?",
        answer:
          "Ja, Aufbau und Abbau lassen sich optional dazubuchen. Wer selbst aufbauen möchte, bekommt das Material vorbereitet zur Abholung an unserer Bonner Filiale in der Drachenburgstraße.",
      },
      {
        question: "In welche Bonner Stadtbezirke liefert SLT Rental?",
        answer:
          "Wir liefern unter anderem nach Bonn-Zentrum, Bad Godesberg, Beuel und Hardtberg sowie in Endenich, Poppelsdorf, Pützchen, Duisdorf und Tannenbusch. Die Lieferkosten kalkuliert der Lieferkostenrechner im Buchungsschritt anhand der Adresse.",
      },
      {
        question: "Sind die Eventzelte feuerfest?",
        answer:
          "Das Eventzelt 6×12 m ist nach EN 13501-1 schwer entflammbar zertifiziert. Für die übrigen Zelte erhalten Sie die jeweils gültige Brandschutz-Klassifizierung auf Anfrage – wichtig, falls die Veranstaltungsfläche entsprechende Auflagen vorsieht.",
      },
      {
        question: "Brauche ich für ein Zelt in der Rheinaue eine Genehmigung?",
        answer:
          "Genehmigungen für Aufstellungen auf öffentlichem Grund (z. B. Rheinaue, Münsterplatz, Theaterplatz Bad Godesberg) erteilt die Stadt Bonn bzw. der jeweilige Veranstalter. SLT Rental liefert das Equipment; um die Genehmigung kümmern sich Veranstalter und Standortbetreiber selbst.",
      },
      {
        question: "Was kostet ein Partyzelt in Bonn?",
        answer:
          "Der Mietpreis variiert nach Zeltgröße, Mietdauer und Lieferweg. Sie sehen ihn tagesaktuell im Buchungsprozess; auf alle Mietartikel gilt unsere Tiefpreisgarantie. Für Eventagenturen und gewerbliche Kunden gelten gesonderte B2B-Konditionen auf Anfrage.",
      },
    ],
  },

  // ============================== MÜLHEIM ==============================
  muelheim: {
    metaTitle: "Möbel & Zelte mieten Mülheim an der Ruhr | SLT Rental",
    metaDescription:
      "Partyzelte, Eventzelte und Bierzeltgarnituren mieten in Mülheim an der Ruhr. Tiefpreisgarantie, optionaler Aufbauservice, Lieferung im Ruhrgebiet. Online anfragen.",
    keywords:
      "Möbel und Zelte mieten Mülheim an der Ruhr, Partyzelt mieten Mülheim, Festzelt mieten Mülheim, Bierzeltgarnitur mieten Mülheim, Eventzelt mieten Mülheim, Hochzeitszelt mieten Mülheim, Stehtisch mieten Mülheim, Zeltverleih Mülheim",
    heroLead:
      "Ob Hochzeit im Garten an der Ruhr in Saarn, Familienfeier in Speldorf oder Vereinsjubiläum in Broich: Über die Filiale in Mülheim an der Ruhr stellt SLT Rental Zelte, Tische und Stühle für das westliche Ruhrgebiet bereit. Modulare Partyzelte von 3×3 bis 4×14 m, Eventzelte mit 2,6 m Durchgangshöhe, Bierzeltgarnituren mit oder ohne Hussen sowie Stehtische und Stapelstühle – an der Ruhrtalstadt aus einer Hand mietbar.",
    bottomHeadline: "Möbel und Zelte mieten in Mülheim an der Ruhr – Eventausstattung für das westliche Ruhrgebiet",
    sections: [
      {
        h2: "Modulare Partyzelte 4×10 und 4×14 – flexibel an der Ruhr",
        paragraphs: [
          "Viele Gärten in Saarn, Mintard oder Selbeck sind verwinkelt, leicht hängig oder grenzen direkt an die Ruhraue. Hier spielen die modularen Partyzelte 4×10 m (56 m²) und 4×14 m (eigentlich 4×6 + 2× 4×4 = 56 m²) ihre Stärke aus: einzelne Module lassen sich versetzt aufbauen, das 4×10 m ist mit Regenrinne ausgestattet, sodass auch zwei aneinandergesetzte Zelte trocken bleiben.",
          "Beispielszene: Familienfeier Richtung Ruhraue mit modularem 4×10 m Partyzelt, vier Bierzeltgarnituren mit weißen Hussen, vier Stehtischen für den Aperitif und einem Sonnenschirm LEMVIG für die Kaffeezone am Nachmittag.",
        ],
      },
      {
        h2: "Eventzelte mit 2,6 m Durchgangshöhe für Schloss-, Stadthallen- und MüGa-Anschluss-Anlässe",
        paragraphs: [
          "Für repräsentativere Anlässe – etwa Hochzeiten in der Nachbarschaft von Schloss Broich, Vereinsjubiläen in der Stadthalle oder Sommerempfänge mit Blick zum MüGa-Park – setzen wir die Eventzelte 6×8 m (48 m²) und 6×12 m (72 m²) ein. Beide bieten 2,6 m lichte Durchgangshöhe; das 6×12 m ist nach EN 13501-1 schwer entflammbar zertifiziert.",
        ],
      },
      {
        h2: "Welche Zeltgröße passt zu welchem Anlass?",
        paragraphs: [
          "Faustformel: 0,8 bis 1,0 m² pro sitzender Person, mit Tanzfläche und Buffet eher 1,5 m². Eine Geburtstagsfeier mit 30 Gästen sitzt im Partyzelt 4×6 oder 4×8 komfortabel; eine Familien- oder Vereinsfeier mit 70 Personen ist im 4×10 oder 6×8 gut aufgehoben; Hochzeiten ab 100 Gästen wandern in das Eventzelt 6×12 m.",
        ],
        table: sizeTable,
      },
      {
        h2: "Bierzeltgarnituren – das Rückgrat jeder Feier an der Ruhr",
        paragraphs: [
          "Ein Bierzeltgarnitur-Set: ein Tisch 50 × 220 cm plus zwei Bänke 25 × 220 cm. Robust, schnell aufgebaut, leicht zu reinigen – und damit das Standard-Mobiliar für Vereinsfeste, runde Geburtstage und Open-Air-Anlässe entlang der Ruhr. Optional ergänzbar um das weiße Hussen-Set (zwei Bankhussen + eine Tischhusse, gewaschen zurückzugeben), wenn es etwas eleganter wirken soll.",
        ],
      },
      {
        h2: "Stehtische, Sonnenschirme und Zeltboden",
        paragraphs: [
          "Stehtische klappbar mit Metallbeinen und Kunststoffplatte, dazu die Stretch-Husse Ø 80 cm in Weiß oder Schwarz (Höhe 110 cm) – die übliche Empfangs-Konfiguration für Sektrunden vor Trauungen, für Empfänge bei Industrie-Events und für Mingle-Bereiche bei Sommerpartys.",
          "Für sonnige Stunden im Garten gibt es den Sonnenschirm LEMVIG (Ø 3 m, FSC-zertifizierte Hartholzstange, UV-beständige Polyesterbespannung, Neigungsfunktion); ein Ständer ab 35 kg ist nicht im Lieferumfang. Bei weichem Boden empfiehlt sich der Zeltboden Anthrazit (0,86 m² pro Element, Nut-und-Feder-System, recycelter Kunststoff-Mix, ca. 15 t/m² belastbar; besenrein zurückgeben).",
        ],
      },
      {
        h2: "Lieferung, Aufbau und Abholung in Mülheim und im Ruhrgebiet",
        paragraphs: [
          "Wir liefern in alle Mülheimer Stadtteile – darunter Speldorf, Saarn, Broich, Styrum, Heißen, Mintard und Selbeck – sowie in das westliche Ruhrgebiet. Die Lieferkosten kalkuliert der Lieferkostenrechner im Buchungsschritt transparent anhand der Adresse.",
          "Aufbau und Abbau sind optional buchbar; Selbstabholer holen das Material an unserer Filiale auf der Ruhrorter Straße ab. Zelte trocken zurückgeben (Trocknungspauschale 60–150 € sonst), Hussen gewaschen, Zeltboden besenrein. Auf alle Mietartikel greift die Tiefpreisgarantie; B2B-Konditionen für Veranstalter, Caterer und Industrie-Dienstleister auf Anfrage.",
        ],
      },
    ],
    faqs: [
      {
        question: "Welches Zelt eignet sich für eine Feier in einem Garten an der Ruhr?",
        answer:
          "Für Gartenfeiern in Saarn, Mintard oder Speldorf empfehlen wir die modularen Partyzelte 4×10 m oder 4×14 m – sie passen sich verwinkelten Grundstücken an. Bei repräsentativeren Anlässen das Eventzelt 6×8 m mit 2,6 m Durchgangshöhe.",
      },
      {
        question: "Welche Zeltgrößen sind in Mülheim an der Ruhr verfügbar?",
        answer:
          "Verfügbar sind Partyzelte mit 9, 16, 24, 32, 40 und 56 m² sowie Eventzelte mit 48 m² (6×8) und 72 m² (6×12). Damit lassen sich Geburtstage, Vereinsfeste und Hochzeiten unterschiedlicher Größenordnung im westlichen Ruhrgebiet abdecken.",
      },
      {
        question: "Bietet SLT Rental einen Aufbauservice in Mülheim an?",
        answer:
          "Ja. Aufbau und Abbau sind optional buchbar und werden im Buchungsprozess als Zusatzleistung ausgewiesen. Selbstabholer holen das Mobiliar vorbereitet an der Mülheimer Filiale auf der Ruhrorter Straße ab.",
      },
      {
        question: "In welche Mülheimer Stadtteile liefert SLT Rental?",
        answer:
          "Wir liefern unter anderem nach Speldorf, Saarn, Broich, Styrum, Heißen, Mintard, Selbeck, Dümpten und Holthausen. Die genauen Lieferkosten berechnet der Lieferkostenrechner im Buchungsschritt anhand der Adresse.",
      },
      {
        question: "Sind die Eventzelte feuerfest?",
        answer:
          "Das Eventzelt 6×12 m ist nach EN 13501-1 schwer entflammbar zertifiziert. Bei den weiteren Zelten teilen wir die jeweils gültige Brandschutz-Klassifizierung auf Anfrage mit – relevant, falls der Veranstaltungsort entsprechende Auflagen vorsieht.",
      },
      {
        question: "Brauche ich für ein Zelt im Bereich MüGa oder am Wasserbahnhof eine Genehmigung?",
        answer:
          "Aufstellungen im Bereich MüGa-Park, Wasserbahnhof oder anderen öffentlichen Flächen werden über die Stadt Mülheim an der Ruhr bzw. den jeweiligen Veranstalter genehmigt. SLT Rental liefert das Equipment; die Genehmigung holt der Veranstalter selbst ein.",
      },
      {
        question: "Was kostet ein Partyzelt in Mülheim an der Ruhr?",
        answer:
          "Der Preis hängt von Zeltgröße, Mietdauer und Lieferweg ab. Den tagesaktuellen Mietpreis zeigt der Buchungsprozess transparent an; auf alle Mietartikel gilt unsere Tiefpreisgarantie. Gewerbliche Kunden erhalten gesondert kalkulierte B2B-Konditionen auf Anfrage.",
      },
    ],
  },
};
