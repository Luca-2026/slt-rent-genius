// Standort × Kategorie spezifischer EXPERTEN-Content für Kategorieseiten.
// --------------------------------------------------------------------
// Wird in src/pages/rental/CategoryProducts.tsx gerendert:
//   * `faqs` ersetzen die bisherigen kurzen categoryFaqs (8–10 statt 2–5)
//   * `expertSections` werden als zusätzlicher Long-Form-Block UNTER
//     dem FAQ-Block ausgegeben (sichtbar + indexierbar)
//
// LEITLINIEN (verbindlich):
// 1. NIEMALS Fakten erfinden. Jede technische/rechtliche Aussage
//    muss auf einer Quelle beruhen, die nachprüfbar ist (DGUV,
//    DIN, StVZO/StVO, LAGA, TA-Lärm, BG-BAU, Herstellerangabe,
//    locationData.ts). Wenn nicht belegbar → weglassen.
// 2. Quellen werden im Code-Kommentar über jedem Abschnitt
//    benannt, im Frontend NICHT als „Quelle: …“ gerendert,
//    sondern fachlich-natürlich formuliert.
// 3. Standortspezifika nur, wenn sie in einem anderen Standort
//    nicht stimmen würden (Liefergebiet, Öffnungszeiten,
//    Hauptsitz/Filiale/Service-Standort).
// 4. Keine Preisversprechen, die im Buchungsprozess nicht
//    hinterlegt sind. „Ab“-Preise nur, wenn sie aus rentalData
//    bzw. dem Shop belegbar sind.

export interface ExpertFaq {
  question: string;
  answer: string;
}

export interface ExpertSection {
  h3: string;
  paragraphs: string[];
}

export interface ExpertContent {
  /** Ersetzt categoryFaqs[category.id] für (location, category). 8–10 Einträge. */
  faqs: ExpertFaq[];
  /** Long-Form-Block UNTER dem FAQ. 4–6 Abschnitte. */
  expertSections: ExpertSection[];
}

type ExpertContentMap = Record<string, Record<string, ExpertContent>>;

export const categoryExpertContent: ExpertContentMap = {
  // ================================================================
  // KREFELD – Hauptsitz Anrather Str. 291, 47807 Krefeld-Fichtenhain
  // Öffnungszeiten: Mo–Fr 08:00–18:00, Sa 10:00–14:30
  // Liefergebiet: Krefeld, Meerbusch, Willich, Tönisvorst, Kempen,
  // Viersen, Mönchengladbach, Neuss, Düsseldorf-Linksrheinisch,
  // Duisburg-Süd
  // ================================================================
  krefeld: {
    // -------------------------------------------------------------
    // ERDBEWEGUNG (Minibagger, Midibagger, Dumper, Anbaugeräte)
    // Quellen für Fakten:
    //   - DGUV Vorschrift 1 (Grundsätze der Prävention)
    //   - DGUV Grundsatz 308-009 „Ausbildung und Beauftragung
    //     von Bedienern von Erdbaumaschinen“
    //   - DGUV Regel 101-004 (Hydraulikschläuche)
    //   - DIN 4124 (Baugruben und Gräben – Böschungen,
    //     Verbau, Arbeitsraumbreiten)
    //   - StVZO § 34 (Achslast/Gesamtgewicht), FeV Anlage 9
    //     (Klassen B / B96 / BE)
    //   - LAGA M20 (Anforderungen an die stoffliche Verwertung
    //     mineralischer Abfälle – Einbauklassen Z0–Z2)
    //   - § 127 TKG (Mitteilungspflicht / Erkundigungspflicht
    //     vor Erdarbeiten; in NRW über infrest / BIL bzw. die
    //     Sparten-Auskunft des Netzbetreibers)
    // -------------------------------------------------------------
    erdbewegung: {
      faqs: [
        {
          question: "Welche Baggergröße brauche ich für mein Projekt in Krefeld und Umgebung?",
          answer:
            "Als grobe Orientierung: Für Vorgarten- und Innenhof-Projekte mit schmalen Durchgängen (ab ca. 80 cm Durchfahrt) reichen Minibagger der 1-Tonnen-Klasse. Für klassische GaLaBau-Aufgaben (Terrassen, Teiche, Pflasterunterbau) sind 1,5–2,5 t üblich. Bei Hausanschluss-, Kanal- und Glasfaserprojekten mit Grabentiefen über 1,25 m greift man typischerweise zu 2,5–5 t (Midibagger), weil ab dieser Grabentiefe gemäß DIN 4124 ein Verbau oder eine Böschung notwendig wird und die nutzbare Aushubtiefe der Maschine das entscheidet. Am Hauptsitz Krefeld führen wir das komplette Spektrum vor Ort – die maximale Grabtiefe und Reichweite sind an jedem Bagger im Produktdatenblatt angegeben.",
        },
        {
          question: "Brauche ich einen Baggerschein, um einen Minibagger zu mieten?",
          answer:
            "Privat – also auf dem eigenen, nicht öffentlich zugänglichen Grundstück – ist kein formaler Schein vorgeschrieben; eine sorgfältige Geräteeinweisung bekommst du bei der Übergabe in Krefeld. Sobald die Maschine gewerblich oder auf einer fremden Baustelle eingesetzt wird, fordert die DGUV-Regel 100-500 in Verbindung mit DGUV Grundsatz 308-009 einen Befähigungsnachweis („Bedienerausweis Erdbaumaschinen“). Den stellen wir nicht aus – der Auftraggeber bzw. Arbeitgeber muss die Beauftragung dokumentieren. Wir prüfen das bei gewerblicher Vermietung im Buchungsprozess.",
        },
        {
          question: "Welche Anbaugeräte sind sinnvoll – und welche bekomme ich am Standort Krefeld?",
          answer:
            "Faustregel nach Aufgabe: Tieflöffel (400–600 mm) für Aushub und Pflanzgruben, Grabenräumlöffel (800–1.200 mm) für Profilierung und das saubere Ziehen von Gräben, Hydraulikhammer für Asphalt-, Beton- und Naturstein-Abbruch, Erdbohrer für Pfostengründungen und Zaunbau, Sortier- bzw. Greifschaufel für Abbruchmaterial und Rückbau. Am Hauptsitz Krefeld halten wir die gängigen Anbaugeräte zur Mit-Miete vor – die konkrete Aufnahmegröße (MS01, MS03, S30/40 etc.) findest du im Datenblatt der jeweiligen Maschine, damit Bagger und Anbaugerät garantiert zueinander passen.",
        },
        {
          question: "Wie schwer darf der Bagger sein, damit ich ihn mit dem PKW transportieren darf?",
          answer:
            "Maßgeblich sind FeV Anlage 9 und die zulässige Gesamtmasse von Zugfahrzeug + Anhänger. Mit Klasse B (alt: Klasse 3) sind 3.500 kg zulässige Gesamtmasse der Kombination nicht zu überschreiten. Mit B96 erhöht sich das auf 4.250 kg, mit BE auf 7.000 kg. Ein 1-Tonnen-Minibagger plus passender Baumaschinenanhänger liegt in der Regel im BE-Bereich. Wir verleihen am Hauptsitz Krefeld gebremste Baumaschinen- und Plateauanhänger – der jeweilige Eintrag „zulässige Stützlast“ und „Gesamtgewicht“ steht in jedem Anhänger-Datenblatt.",
        },
        {
          question: "Welche Mindestabstände gelten beim Ausheben von Baugruben und Gräben?",
          answer:
            "DIN 4124 ist hier verbindlich: Gräben bis 1,25 m Tiefe dürfen ohne Verbau senkrecht ausgehoben werden, sofern der Boden standfest ist. Tiefer als 1,25 m muss verbaut oder geböscht werden (in nicht-bindigem Boden mit ≤ 45°, in bindigem Boden mit ≤ 60°, in Fels bis 80°). An Verkehrsflächen, Gebäuden und Nachbargrenzen sind zusätzliche Sicherheitsabstände nötig. Wir empfehlen, vor dem Aushub Bestandspläne (Strom, Gas, Wasser, Telekom, Glasfaser) über die jeweiligen Netzbetreiber bzw. die zentrale Sparten-Auskunft anzufordern – die Erkundigungspflicht liegt beim Bauherrn.",
        },
        {
          question: "Brauche ich für Erdarbeiten in Krefeld eine Genehmigung?",
          answer:
            "Auf privatem Grund für reine Erdarbeiten in der Regel nicht. Sobald du jedoch in öffentlichen Verkehrsraum eingreifst (Bürgersteig, Straße, Bordstein), brauchst du eine Aufgrabungsgenehmigung der Stadt Krefeld bzw. – bei verkehrsrechtlichen Maßnahmen – eine verkehrsrechtliche Anordnung. Bei Aushubmengen über bestimmten Schwellen oder bei Eingriffen in geschützte Bereiche (Bäume nach Baumschutzsatzung, Wasserschutzgebiet, Bodendenkmal) können zusätzlich Genehmigungen nötig sein. Konkrete Auskunft erteilt das Tiefbauamt bzw. das Bauordnungsamt der Stadt Krefeld.",
        },
        {
          question: "Wie wird Bauaushub am Niederrhein fachgerecht entsorgt?",
          answer:
            "Aushub wird nach LAGA M20 bzw. der Mantelverordnung (Ersatzbaustoffverordnung / BBodSchV-Novelle, in Kraft seit August 2023) in Einbauklassen Z0, Z1.1, Z1.2 und Z2 eingestuft. Z0 ist unbelasteter, frei verwertbarer Boden, Z2 nur eingeschränkt verwertbar. Annahmestellen am Niederrhein verlangen vor Anlieferung in der Regel eine deklarationsanalytische Untersuchung. Bei größeren Mengen empfiehlt sich die Beauftragung eines zertifizierten Entsorgungsfachbetriebs (§ 56 KrWG). Den Bagger mieten wir – die Entsorgung muss der Bauherr separat organisieren.",
        },
        {
          question: "Was kostet ein Minibagger in Krefeld – und sparen Wochen-/Monatsmieten wirklich?",
          answer:
            "Der Tagespreis ist im Buchungsprozess pro Modell tagesaktuell hinterlegt. Generell sinkt der effektive Tagessatz deutlich, je länger gemietet wird: Eine Wochen­miete entspricht typischerweise etwa fünf, eine Monatsmiete etwa fünfzehn Tagessätzen. Das lohnt sich gegenüber der Tagesmiete bereits ab 2–3 zusammen­hängenden Einsatztagen. Treibstoff (Diesel) wird nach Rückgabe nach gefülltem Tank abgerechnet, AdBlue bei Maschinen mit Abgasnachbehandlung analog.",
        },
        {
          question: "Wie läuft die Übergabe und Einweisung am Hauptsitz Krefeld konkret ab?",
          answer:
            "Bei Abholung in der Anrather Straße 291 erhältst du eine Geräteeinweisung am konkreten Modell: Bedienelemente, Sicherheitsabschaltung, Tankposition, Anbaugerätewechsel und Tieflader-Verzurrung. Wir prüfen Maschine und Anbaugeräte gemeinsam mit dir und dokumentieren den Zustand im Übergabeprotokoll. Reguläre Übergabezeiten: Mo–Fr 08:00–18:00, Sa 10:00–14:30. Frühere Samstagsabholungen organisieren wir auf Vorbuchung. Bei Lieferung an die Baustelle erfolgt die Einweisung vor Ort.",
        },
        {
          question: "Welche persönliche Schutzausrüstung muss der Bediener tragen?",
          answer:
            "Auf gewerblichen Baustellen schreibt die DGUV branchenüblich vor: S3-Sicherheitsschuhe, Warnschutzkleidung nach EN ISO 20471 (mind. Klasse 2 im öffentlichen Verkehrsraum), Schutzhelm nach EN 397 sowie bei Hammer-/Abbruch­arbeiten zusätzlich Gehörschutz und Schutzbrille. Diese PSA stellt der Arbeitgeber bzw. Bauherr – wir vermieten ausschließlich die Maschine.",
        },
      ],
      expertSections: [
        {
          h3: "Bagger richtig dimensionieren: von der Mikro-Klasse bis zum 5-Tonnen-Midi",
          paragraphs: [
            "Die Wahl der Baggerklasse entscheidet maßgeblich über Tempo, Sicherheit und Kosten eines Projekts. Bei zu kleiner Maschine verlängert sich die Mietdauer überproportional, bei zu großer Maschine fehlt es an Wendigkeit, der Bodendruck steigt und der Transport wird aufwendig. Wir gruppieren die Erdbaumaschinen aus dem Krefelder Mietpark in vier praxisnahe Klassen.",
            "Die Mikro-Klasse bis ca. 1,2 t (Knickgelenk-Bagger, schmaler als 80 cm) ist ideal für Innenhöfe, schmale Tore und Vorgärten. Die Mini-Klasse 1,5–2,5 t deckt den klassischen Garten- und Landschaftsbau ab: Teiche, Terrassenunterbau, Pflanzgruben, kleine Hausanschlüsse. Die Mittelklasse 2,5–3,5 t ist die Allzweckwaffe für Hausanschlüsse, Kanal-, Wasser- und Glasfasergräben bis rund 2,5 m Grabtiefe. Ab 4–5 t spricht man von Midibaggern – sie kombinieren hohe Reißkraft mit noch transportabler Größe und sind die richtige Wahl für Tiefbau, Fundamentaushub und größere Aushubmengen.",
            "Wichtig ist immer das Verhältnis aus Grabtiefe, Reichweite und Bodendruck. Auf gepflasterten Flächen oder im Innenhof sind Gummiketten Pflicht; bei nassem Lehmboden zählt jedes Kilogramm Eigengewicht. Im Datenblatt jeder Maschine sind diese Kennzahlen hinterlegt – im Zweifel ruf uns am Standort Krefeld an, wir empfehlen die passende Klasse anhand deines konkreten Aushubvolumens.",
          ],
        },
        {
          h3: "Sicherheit & Bedienerqualifikation: Was DGUV und BG BAU fordern",
          paragraphs: [
            "Der Betrieb von Erdbaumaschinen unterliegt im gewerblichen Bereich der DGUV Vorschrift 1 sowie der DGUV Regel 100-500 (Kapitel 2.12). Für die Qualifikation des Bedieners gilt DGUV Grundsatz 308-009: Verlangt wird eine theoretische und praktische Ausbildung sowie eine schriftliche Beauftragung durch den Unternehmer. Die Beauftragung ist personen- und maschinengebunden – ein Bediener, der nur an Mini­baggern ausgebildet wurde, darf nicht ohne weiteres einen Midibagger fahren.",
            "Im privaten Bereich (eigenes Grundstück, kein gewerblicher Kontext) ist keine formale Qualifikation vorgeschrieben. Trotzdem empfehlen wir jedem Erstnutzer, sich bei der Übergabe in Krefeld die volle Einweisung geben zu lassen – insbesondere zu Themen wie Standsicherheit am Grabenrand, sicherer Anbaugerätewechsel (Hydraulikschnellkuppler, druckloses Ablegen) und Notabschaltung. Die häufigsten Schadensbilder bei Mietbaggern entstehen erfahrungsgemäß nicht durch Maschinenversagen, sondern durch fehlende Erkundung der Untergrund-Sparten und durch unzureichende Sicherung der Baugrubenränder nach DIN 4124.",
          ],
        },
        {
          h3: "Anbaugeräte: die richtige Kombination spart Zeit und Verschleiß",
          paragraphs: [
            "Ein Bagger ist nur so produktiv wie sein Anbaugerät. In der Vermietpraxis bewährt sich für die meisten Baustellen ein Set aus drei Löffeln plus einem Spezialwerkzeug. Der schmale Tieflöffel (300–400 mm) zieht saubere Versorgungsgräben, der mittlere Tieflöffel (500–600 mm) ist der Allrounder für Pflanz- und Pfostengruben, der breite Grabenräumlöffel (800–1.200 mm, ohne Zähne) profiliert Böschungen, zieht Erdmieten ab und räumt Gräben sauber aus.",
            "Als viertes Werkzeug wählt man je nach Projekt: Hydraulikhammer für Beton- und Asphaltabbruch, Erdbohrer mit Schneckenwendel 150–300 mm für Pfosten- und Zaungründungen, Sortiergreifer für Rückbau und Materialhandling, in Sonderfällen ein Verdichterlöffel für die Grabenverfüllung. Achte bei der Buchung in Krefeld auf die Anbaugröße der Maschine – Schnellwechsler-Aufnahmen wie MS01, MS03 oder S30/S40 sind nicht untereinander kompatibel. Wir prüfen das im Bestellprozess und legen die passenden Adapter bei.",
          ],
        },
        {
          h3: "Transport zur Baustelle: was du mit B, B96 oder BE bewegen darfst",
          paragraphs: [
            "Die maßgebliche Größe ist die zulässige Gesamtmasse (zGM) der Fahrzeug-Anhänger-Kombination. Klasse B erlaubt eine Kombination bis 3.500 kg zGM und einen Anhänger über 750 kg nur, wenn dessen zGM die Leermasse des Zugfahrzeugs nicht übersteigt. Mit B96 (eintägige Schulung, kein zusätzlicher Prüfungs-Termin) sind 4.250 kg zGM zulässig. BE deckt Anhänger bis 3.500 kg zGM ab, der Zug darf dann bis zu 7.000 kg gesamt wiegen.",
            "Praktisch heißt das: Ein klassischer 1-Tonnen-Minibagger plus passender Plateau- bzw. Baumaschinenanhänger ist mit einem Mittelklasse-Pkw und BE problemlos zu bewegen. Sobald die Maschine deutlich über 1,3 t wiegt oder das Zugfahrzeug leichter ist, wird es eng – dann lohnt es sich, den Bagger durch uns per Tieflader liefern zu lassen. Wir bieten ab Hauptsitz Krefeld Tieflader-Transporte in das gesamte Niederrhein-Liefergebiet (Krefeld, Meerbusch, Willich, Tönisvorst, Kempen, Viersen, Mönchengladbach, Neuss, Düsseldorf-Linksrheinisch, Duisburg-Süd) und kalkulieren die Lieferpauschale transparent im Buchungsprozess.",
          ],
        },
        {
          h3: "Krefeld, Niederrhein, Glasfaserausbau: warum die Standortwahl zählt",
          paragraphs: [
            "Unser Hauptsitz in der Anrather Straße 291 (Krefeld-Fichtenhain) liegt direkt zwischen der A57 (Köln–Krefeld–Nimwegen) und der A40 (Ruhrschnellweg). Aus dieser Lage erreichen wir das Niederrhein-Liefergebiet typischerweise am nächsten Werktag, in vielen Fällen taggleich. Für den Glasfaserausbau – einer der derzeit stärksten Treiber für Erdbewegungs-Mieten am Niederrhein – kombinieren wir Minibagger mit Erdraketen aus unserer Aggregate-Kategorie und passenden Verdichtungsgeräten, sodass ein kompletter Hausanschluss aus einem Mietpool kommt.",
            "Als Hauptsitz mit dem größten Mietpark der drei SLT-Standorte ist die Verfügbarkeit hier am höchsten – inklusive Reserve-Maschinen, falls eine kurzfristig ausfällt. Den konkreten Verfügbarkeits-Status zeigen wir an jedem Produkt direkt an, samstags öffnen wir regulär bis 14:30, frühere Abholungen organisieren wir nach Vorbuchung. Beratungsanfragen zu Maschinen­auswahl, Anbaugeräten oder Tieflader-Transport beantworten wir telefonisch unter der Krefelder Standortnummer.",
          ],
        },
      ],
    },

    // Weitere Krefeld-Kategorien werden in den nächsten Tranchen
    // nach demselben Muster ergänzt (Tranche 1 Rest: verdichtung,
    // arbeitsbuehnen, werkzeuge, aggregate).
  },

  // Bonn und Mülheim folgen analog in späteren Tranchen.
};

export function getCategoryExpertContent(
  locationId: string | undefined,
  categoryId: string | undefined,
): ExpertContent | null {
  if (!locationId || !categoryId) return null;
  return categoryExpertContent[locationId]?.[categoryId] ?? null;
}
