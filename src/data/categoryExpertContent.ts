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
//    benannt, im Frontend NICHT als "Quelle: …" gerendert,
//    sondern fachlich-natürlich formuliert.
// 3. Standortspezifika nur, wenn sie in einem anderen Standort
//    nicht stimmen würden (Liefergebiet, Öffnungszeiten,
//    Hauptsitz/Filiale/Service-Standort).
// 4. Keine Preisversprechen, die im Buchungsprozess nicht
//    hinterlegt sind. "Ab"-Preise nur, wenn sie aus rentalData
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
    //   - DGUV Grundsatz 308-009 "Ausbildung und Beauftragung
    //     von Bedienern von Erdbaumaschinen"
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
            "Privat – also auf dem eigenen, nicht öffentlich zugänglichen Grundstück – ist kein formaler Schein vorgeschrieben; eine sorgfältige Geräteeinweisung bekommst du bei der Übergabe in Krefeld. Sobald die Maschine gewerblich oder auf einer fremden Baustelle eingesetzt wird, fordert die DGUV-Regel 100-500 in Verbindung mit DGUV Grundsatz 308-009 einen Befähigungsnachweis (\"Bedienerausweis Erdbaumaschinen\"). Den stellen wir nicht aus – der Auftraggeber bzw. Arbeitgeber muss die Beauftragung dokumentieren. Wir prüfen das bei gewerblicher Vermietung im Buchungsprozess.",
        },
        {
          question: "Welche Anbaugeräte sind sinnvoll – und welche bekomme ich am Standort Krefeld?",
          answer:
            "Faustregel nach Aufgabe: Tieflöffel (400–600 mm) für Aushub und Pflanzgruben, Grabenräumlöffel (800–1.200 mm) für Profilierung und das saubere Ziehen von Gräben, Hydraulikhammer für Asphalt-, Beton- und Naturstein-Abbruch, Erdbohrer für Pfostengründungen und Zaunbau, Sortier- bzw. Greifschaufel für Abbruchmaterial und Rückbau. Am Hauptsitz Krefeld halten wir die gängigen Anbaugeräte zur Mit-Miete vor – die konkrete Aufnahmegröße (MS01, MS03, S30/40 etc.) findest du im Datenblatt der jeweiligen Maschine, damit Bagger und Anbaugerät garantiert zueinander passen.",
        },
        {
          question: "Wie schwer darf der Bagger sein, damit ich ihn mit dem PKW transportieren darf?",
          answer:
            "Maßgeblich sind FeV Anlage 9 und die zulässige Gesamtmasse von Zugfahrzeug + Anhänger. Mit Klasse B (alt: Klasse 3) sind 3.500 kg zulässige Gesamtmasse der Kombination nicht zu überschreiten. Mit B96 erhöht sich das auf 4.250 kg, mit BE auf 7.000 kg. Ein 1-Tonnen-Minibagger plus passender Baumaschinenanhänger liegt in der Regel im BE-Bereich. Wir verleihen am Hauptsitz Krefeld gebremste Baumaschinen- und Plateauanhänger – der jeweilige Eintrag \"zulässige Stützlast\" und \"Gesamtgewicht\" steht in jedem Anhänger-Datenblatt.",
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

    // -------------------------------------------------------------
    // VERDICHTUNG (Rüttelplatten, Stampfer, Walzen)
    // Quellen:
    //   - DIN 18134 (Plattendruckversuch / Verformungsmodul Ev2)
    //   - ZTV E-StB 17 (Zusätzliche Technische Vertragsbedingungen
    //     Erdbau – Verdichtungsanforderungen, Proctordichte)
    //   - DGUV Information 212-024 (Hand-Arm-Vibration)
    //   - 2002/44/EG bzw. LärmVibrationsArbSchV (Tages-
    //     expositionswerte A(8) Hand-Arm: Auslöse 2,5 m/s²,
    //     Grenz 5 m/s²)
    //   - TA Lärm Nr. 6.1 (Immissionsrichtwerte Wohngebiete
    //     tags 55 dB(A), Mischgebiete 60 dB(A))
    //   - BGR 500 Kap. 2.9 (Betreiben von Bauaufzügen und
    //     handgeführten Verdichtungsmaschinen)
    // -------------------------------------------------------------
    verdichtung: {
      faqs: [
        {
          question: "Welche Rüttelplatte brauche ich für Pflaster, Schotter oder Asphalt?",
          answer:
            "Faustregel nach Aufgabe und Schütthöhe: Bis ca. 15 cm Schütthöhe und für Verbundpflaster reichen Vorwärts-Rüttelplatten mit 60–80 kg Dienstgewicht und 10–15 kN Zentrifugalkraft. Für Schotter-Tragschichten bis 25 cm und Tiefbau-Verfüllungen werden reversierbare Platten mit 130–250 kg und 25–40 kN eingesetzt. Bei Asphalt empfiehlt sich eine Platte mit Wassertank zur Belag-Kühlung. Im Datenblatt jedes Geräts geben wir Zentrifugalkraft, Arbeitsbreite, max. Verdichtungstiefe und Steigfähigkeit an – das ist der entscheidende Vergleichswert, nicht der Preis.",
        },
        {
          question: "Rüttelplatte oder Stampfer – wann nehme ich was?",
          answer:
            "Stampfer (Vibrationsstampfer, \"Frosch\", ca. 60–80 kg, schmale Platte) sind für bindige Böden in schmalen Gräben das Mittel der Wahl: hohe Schlagenergie, kleine Aufstandsfläche, Verdichtungstiefe bis ca. 70 cm in einer Schicht. Rüttelplatten verdichten flächig und sind bei rolligen Böden, Schotter und Pflaster überlegen. Für Hausanschluss- und Glasfasergräben mit Sand-Kies-Verfüllung greift man oft zu beiden Geräten: erst Stampfer am Rohr, dann Platte in der oberen Schicht. Beide Geräte führen wir am Hauptsitz Krefeld vor.",
        },
        {
          question: "Welche Verdichtungsgrade verlangen Tiefbauämter typischerweise?",
          answer:
            "Maßgeblich sind ZTV E-StB und die Ausschreibung des jeweiligen Bauträgers. Üblich sind Proctordichten von DPr ≥ 97 % für Planum und Tragschichten, DPr ≥ 100 % für Frostschutzschichten unter Verkehrsflächen, sowie ein Verformungsmodul Ev2 ≥ 45 MN/m² (Wohnstraßen) bzw. ≥ 100 MN/m² (Hauptstraßen, Industrieflächen). Der Nachweis erfolgt per Plattendruckversuch nach DIN 18134. Die Verdichtungsleistung der Mietgeräte ist im Datenblatt angegeben – die normative Eignung muss der Bauleiter im konkreten Projekt freigeben.",
        },
        {
          question: "Was gilt rechtlich bei Lärm- und Vibrationsbelastung des Bedieners?",
          answer:
            "Die LärmVibrationsArbSchV (Umsetzung der EU-Richtlinie 2002/44/EG) legt für Hand-Arm-Vibration zwei Schwellen fest: Auslösewert A(8) = 2,5 m/s² (ab da Unterweisung und Maßnahmenkonzept), Grenzwert A(8) = 5,0 m/s² (darf in keinem Fall überschritten werden). Schwere Stampfer liegen typischerweise bei 7–15 m/s² Schwingungswert – die zulässige Tagesexposition ist damit auf wenige Stunden begrenzt. Im Datenblatt jedes Verdichtungsgeräts ist der Schwingungswert nach EN ISO 5349 angegeben, sodass der Arbeitgeber die zulässige Einsatzzeit berechnen kann.",
        },
        {
          question: "Darf ich am Wochenende oder abends in Krefeld verdichten?",
          answer:
            "Die Baulärm-Verordnung des Bundes (AVV Baulärm) und die TA Lärm regeln die Immissionsrichtwerte. In allgemeinen Wohngebieten gelten tags (07:00–20:00) 55 dB(A), nachts 40 dB(A), in Mischgebieten 60/45 dB(A). Sonntags und an gesetzlichen Feiertagen ist Baulärm grundsätzlich untersagt; werktags zwischen 20:00 und 07:00 ebenfalls. Für unaufschiebbare Arbeiten kann die Stadt Krefeld (Umweltamt) Ausnahmen erteilen. Rüttelplatten und Stampfer erzeugen typischerweise 100–108 dB(A) Schallleistung – die Einhaltung der Richtwerte gelingt in der Praxis nur tagsüber.",
        },
        {
          question: "Welche persönliche Schutzausrüstung ist bei Verdichtungsarbeiten Pflicht?",
          answer:
            "Pflicht im gewerblichen Einsatz: S3-Sicherheitsschuhe, Warnschutzkleidung nach EN ISO 20471, Gehörschutz (Rüttelplatten überschreiten den oberen Auslösewert von 85 dB(A) deutlich), Schutzbrille bei Pflasterarbeiten sowie vibrationsdämpfende Handschuhe nach EN ISO 10819 (TR Wert) zur Reduktion der Hand-Arm-Vibration. Auf Verkehrsflächen kommt Warnkleidung Klasse 2/3 dazu. Wir vermieten ausschließlich die Maschine; PSA stellt der Arbeitgeber bzw. Bauherr.",
        },
        {
          question: "Wie transportiere ich Rüttelplatten – darf ich sie liegend laden?",
          answer:
            "Kleinere Vorwärts-Platten (≤ 130 kg) lassen sich zu zweit oder mit der Auffahrrampe in den Transporter heben. Ab ca. 200 kg ist eine Auffahrrampe oder ein Anhänger mit Auffahrbohlen Pflicht. Rüttelplatten dürfen für den Transport hochkant aufgerichtet werden – herstellerabhängig ist die Lage in der Bedienungsanleitung vorgeschrieben (meist \"Lufthahn schließen / Kraftstoffhahn schließen\"), sonst läuft Motoröl in den Brennraum. Bei Lieferung ab Hauptsitz Krefeld kümmern wir uns um eine ordnungsgemäße Ladungssicherung nach VDI 2700.",
        },
        {
          question: "Was kostet eine Rüttelplatte in Krefeld – und ab wann lohnt sich Wochenmiete?",
          answer:
            "Tagespreise sind pro Modell tagesaktuell im Buchungsprozess hinterlegt. Wie bei allen Mietgeräten gilt: Eine Wochenmiete entspricht typischerweise rund fünf Tagessätzen, eine Monatsmiete rund fünfzehn. Damit lohnt sich die Wochenmiete schon ab 2–3 zusammenhängenden Einsatztagen. Betriebsstoffe (Benzin/Diesel) werden nach Rückgabe nach gefülltem Tank abgerechnet.",
        },
        {
          question: "Welche Verdichtungstiefe schaffe ich mit welcher Plattenklasse?",
          answer:
            "Annähernde Praxiswerte (rolliger Boden, eine Lage): Vorwärts-Platten bis 80 kg erreichen 15–20 cm verdichtete Schichtdicke, reversierbare 130–250 kg-Klasse 25–40 cm, schwere reversierbare Platten ab 400 kg bis zu 60 cm. Stampfer erreichen in bindigem Boden 50–70 cm pro Lage. Die exakten Werte variieren mit Bodenart, Feuchte und Vorverdichtung – die Datenblatt-Angabe ist als Maximum bei optimalem Wassergehalt zu verstehen.",
        },
        {
          question: "Brauche ich für eine Walze einen Führerschein?",
          answer:
            "Handgeführte Walzen (Walzenbreite ≤ ca. 800 mm, ohne Sitz) sind führerscheinfrei. Sitzwalzen mit Eigengewicht über 600 kg fallen unter die DGUV Grundsatz 308-009 (Befähigung für Erdbaumaschinen) und benötigen im gewerblichen Einsatz einen entsprechenden Bedienerausweis. Im öffentlichen Verkehrsraum gelten zusätzlich die Anforderungen der StVZO; selbstfahrende Walzen mit über 20 km/h bauartbedingter Höchstgeschwindigkeit benötigen eine Zulassung. Am Standort Krefeld führen wir handgeführte Walzen und Anhängewalzen – das jeweilige Datenblatt nennt die zulassungsrelevanten Daten.",
        },
      ],
      expertSections: [
        {
          h3: "Bodenkunde verstehen: rollige vs. bindige Böden am Niederrhein",
          paragraphs: [
            "Die Wahl des Verdichtungsgeräts beginnt mit der Bodenart. Am Niederrhein – einschließlich des Krefelder Stadtgebiets – dominieren glaziale und fluviatile Sand-Kies-Gemische, lokal überdeckt von lössartigem Schluff. Rollige Böden (Sande, Kiese) lassen sich am besten durch Vibration verdichten: Hier sind Rüttelplatten und Vibrationswalzen erste Wahl. Bindige Böden (Schluffe, Tone, Lehme) reagieren auf Vibration kaum, brauchen stattdessen hohe Schlagenergie auf kleiner Fläche – die Domäne des Stampfers.",
            "Der optimale Wassergehalt (wopt) ist der zweite Schlüsselfaktor. Zu trockener Sand-Kies lässt sich nicht ausreichend verdichten, zu nasser Lehm wird beim Verdichten plastisch und verliert seine Tragfähigkeit. Im Zweifel hilft eine einfache Probe: Eine Handvoll Boden formt sich bei optimalem Wassergehalt zu einem Ball, der bei leichtem Druck bricht. Wer es genau wissen muss, lässt vor dem Einbau einen Proctorversuch im Bodenlabor durchführen – Pflicht bei größeren Tiefbauprojekten.",
          ],
        },
        {
          h3: "Schichtweise verdichten: warum die Schütthöhe alles entscheidet",
          paragraphs: [
            "Der häufigste Verarbeitungsfehler ist eine zu hohe Schüttlage. Wer 50 cm Sand auf einmal einbaut und mit einer 130-kg-Platte überfährt, erzielt im besten Fall die oberen 25 cm – darunter bleibt der Boden locker, sackt nach und Pflaster, Bordsteine oder Fundamente sacken später mit. Die Faustregel: maximal die im Datenblatt angegebene Verdichtungstiefe der Maschine, im Zweifel weniger.",
            "Im Hausanschluss- und Glasfaserbau bewährt sich folgendes Vorgehen: 10 cm Sandbett unter dem Rohr verdichten (leichte Platte), Rohr verlegen, seitlich und 30 cm über dem Rohr ausschließlich mit Stampfer in 15-cm-Lagen verfüllen (keine Vibration direkt am Rohr), darüber dann in 25–30-cm-Lagen mit reversibler Rüttelplatte aufbauen. Die obere Tragschicht erhält eine eigene Verdichtung mit Plattendruckversuch-tauglicher Maschine, falls eine Ev2-Prüfung verlangt wird.",
          ],
        },
        {
          h3: "Hand-Arm-Vibration: warum die Einsatzzeit oft die Maschine bestimmt",
          paragraphs: [
            "Stampfer und schwere Rüttelplatten gehören zu den vibrationsintensivsten Handgeführten Maschinen überhaupt. Die LärmVibrationsArbSchV begrenzt die tägliche Hand-Arm-Vibrationsexposition A(8) auf 5,0 m/s²; bereits ab 2,5 m/s² sind Schutzmaßnahmen Pflicht. Ein 70-kg-Stampfer mit einem Schwingungswert von 11 m/s² darf rechnerisch nur ca. 1,7 Stunden Direktkontaktzeit pro Tag bedient werden, bevor der Grenzwert erreicht ist.",
            "Praktisch heißt das: Bei längeren Verdichtungsarbeiten lohnt sich der Wechsel auf eine schwerere, aber vibrationsärmere Maschine oder die Aufteilung auf zwei Bediener. Moderne Geräte mit entkoppelten Führungsbügeln senken die Vibrationsexposition deutlich – wir bevorraten am Standort Krefeld bevorzugt aktuelle Modelle mit gedämpften Führungsholmen. Der konkrete Schwingungswert nach EN ISO 5349 steht in jeder Maschinen-Bedienungsanleitung.",
          ],
        },
        {
          h3: "Lärmschutz auf Krefelder Baustellen: was tagsüber wirklich erlaubt ist",
          paragraphs: [
            "Die AVV Baulärm setzt für Baustellen in Wohngebieten einen Immissionsrichtwert von 55 dB(A) tags an. Eine reversibel Rüttelplatte mittlerer Klasse erzeugt ca. 105 dB(A) Schallleistung – im Abstand von 10 m am Immissionsort kommen davon etwa 75 dB(A) an. Das überschreitet den Richtwert um 20 dB(A); zulässig ist das nur, weil Baulärm in der AVV als zeitlich begrenzte Belastung anders bewertet wird (Beurteilungspegel mit Zeitabschnitten).",
            "Stadt Krefeld und benachbarte Gemeinden ahnden in der Praxis vor allem Verstöße gegen das Verbot werktags zwischen 20:00 und 07:00 sowie sonntags und feiertags. Wer in dicht bebautem Wohngebiet (z. B. Krefeld-Kempener Feld, Bockum, Uerdingen) verdichtet, sollte die Anwohner vorab informieren und – wenn möglich – Schallschutzhauben einsetzen. Wir geben bei der Übergabe in Krefeld Hinweise zur konkreten Lärm­emission der gewählten Maschine.",
          ],
        },
        {
          h3: "Verdichtungsfortschritt messen: vom Augenmaß bis zum Plattendruckversuch",
          paragraphs: [
            "Im privaten Bereich reicht oft die Faustregel: Wenn die Rüttelplatte nicht mehr einsinkt und der Boden \"klingt\", ist die Lage verdichtet. Im gewerblichen Tiefbau ist das nicht ausreichend. Standardverfahren ist der statische Plattendruckversuch nach DIN 18134 (Lastplatte 300 mm Durchmesser, zwei Belastungszyklen, Ergebnis Ev1 und Ev2). Daraus wird das Verformungsmodul Ev2 abgeleitet, das in den ZTV E-StB als Abnahmekriterium dient.",
            "Schneller, aber weniger normativ, sind dynamische Verfahren wie der leichte Fallgewichtsversuch (Evd, \"Zorn-Gerät\"). Für die meisten kommunalen Tiefbauarbeiten am Niederrhein wird das Ev2 verlangt. Den Plattendruckversuch führen Tiefbauunternehmen oder Sachverständige durch; wir vermieten ausschließlich die Verdichtungsmaschine. Für eine erfolgreiche Abnahme entscheidet weniger die Maschinengröße als das saubere Lagenweise-Einbauen und der richtige Wassergehalt.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // ARBEITSBÜHNEN (Scheren-, Gelenkteleskop-, Anhängerbühnen)
    // Quellen:
    //   - DGUV Grundsatz 308-008 "Ausbildung und Beauftragung
    //     von Bedienern von Hubarbeitsbühnen" (IPAF-konform)
    //   - DGUV Information 208-019 (Hubarbeitsbühnen –
    //     Sicherer Einsatz)
    //   - BetrSichV (Prüfung vor Inbetriebnahme, jährliche
    //     UVV-Prüfung nach DGUV Grundsatz 308-002)
    //   - EN 280 (Konstruktion und Prüfung fahrbarer
    //     Hubarbeitsbühnen)
    //   - StVZO (Anhängerbühnen / Anhänger-Klassen)
    //   - PSA-Benutzungsverordnung; EN 361 (Auffanggurt),
    //     EN 354/355 (Verbindungsmittel mit Falldämpfer)
    // -------------------------------------------------------------
    arbeitsbuehnen: {
      faqs: [
        {
          question: "Welche Arbeitsbühne brauche ich – Schere, Gelenkteleskop oder Anhängerbühne?",
          answer:
            "Maßgeblich ist die kombinierte Frage nach Arbeitshöhe, seitlicher Reichweite und Untergrund. Scherenbühnen (elektrisch, kompakt, bis ca. 14 m) sind ideal für Innenarbeiten, Hallen und Logistik – senkrechter Lift, keine seitliche Auslage. Gelenkteleskopbühnen (selbstfahrend oder LKW-aufgebaut, bis 25 m und mehr) brauchst du, sobald über Hindernisse hinweg gearbeitet wird (Dachvorsprünge, Bäume, Schaufenster). Anhängerbühnen (12–22 m) sind die flexibelste Lösung für Handwerker: Mit einem 3,5-t-Anhängerführerschein (BE) selbst transportierbar. Am Standort Krefeld bevorraten wir alle drei Bauformen.",
        },
        {
          question: "Brauche ich einen Bedienerausweis für eine Arbeitsbühne?",
          answer:
            "Im gewerblichen Einsatz verlangt die DGUV Grundsatz 308-008 (umgesetzt durch BetrSichV und DGUV Vorschrift 1) eine theoretische und praktische Ausbildung plus schriftliche Beauftragung durch den Unternehmer. Verbreitet ist der IPAF-Ausweis (PAL-Card), unterteilt in 1a (vertikal, z. B. Scherenbühnen), 1b (vertikal, Anhängerbühne), 3a (selbstfahrend, vertikal), 3b (selbstfahrend, Ausleger). Privat (Eigenheim, kein gewerblicher Kontext) ist kein Schein vorgeschrieben – wir empfehlen trotzdem die Einweisung bei Übergabe und prüfen bei gewerblicher Buchung die Qualifikation.",
        },
        {
          question: "Wie hoch komme ich wirklich – Arbeitshöhe vs. Plattformhöhe?",
          answer:
            "Marketing-Angaben sind oft die Arbeitshöhe = Plattformhöhe + 2 m (Körpergröße/Greifhöhe). Für die Planung relevant ist die Plattformhöhe (Standfläche im Korb). Eine 14-m-Arbeitsbühne hat eine Plattformhöhe von ca. 12 m. Außerdem gilt: Die seitliche Reichweite reduziert sich mit der Höhe – bei voller Höhe ist der Korb meist nur über der Standfläche der Maschine, nicht 6 m daneben. Im Datenblatt jeder Bühne ist die Reichweiten-Tabelle (Hüllkurve) angegeben; das ist der entscheidende Wert für die Auswahl.",
        },
        {
          question: "Was ist eine UVV-Prüfung – und brauche ich sie als Mieter?",
          answer:
            "Nach BetrSichV § 14 und DGUV Grundsatz 308-002 müssen Hubarbeitsbühnen mindestens jährlich von einer befähigten Person (Sachkundige/r) auf Sicherheit geprüft werden. Diese UVV-Prüfung dokumentieren wir; das aktuelle Prüfprotokoll und die Prüfplakette sind an jeder Maschine vorhanden. Du als Mieter musst zusätzlich vor jeder Schicht eine arbeitstägliche Sicht- und Funktionsprüfung durchführen (Notabsenkung, NOT-AUS, Sicherungsmittel, Reifen, hydraulische Dichtigkeit). Mängel sofort melden – Weiterbenutzung ist untersagt.",
        },
        {
          question: "Welche Persönliche Schutzausrüstung gegen Absturz ist Pflicht?",
          answer:
            "Auf Gelenkteleskop- und Auslegerbühnen ist die Verwendung eines Auffanggurts (EN 361) mit kurzer Verbindungsleine (EN 354) und Falldämpfer (EN 355) Pflicht – Anschlagpunkt ist der gekennzeichnete Ring im Korb. Grund: Bei plötzlichem Hindernis-Kontakt kann der Bediener aus dem Korb katapultiert werden (\"Catapult Effect\"). Bei Scherenbühnen ist eine PSAgA nicht zwingend vorgeschrieben, wenn die Bühne nicht verlassen wird und das Geländer intakt ist. Zusätzlich Helm mit Kinnriemen, S3-Schuhe, Warnschutz nach EN ISO 20471 im öffentlichen Verkehrsraum. PSAgA stellt der Arbeitgeber.",
        },
        {
          question: "Darf ich mit der Bühne aussteigen, um auf ein Dach zu treten?",
          answer:
            "Grundsätzlich nein. EN 280 und DGUV Information 208-019 erlauben das Verlassen der Plattform nur in Ausnahmefällen und nur, wenn (a) der Hersteller dies in der Bedienungsanleitung explizit zulässt, (b) eine schriftliche Gefährdungsbeurteilung des Arbeitgebers vorliegt, (c) der Bediener während des Aussteigens durchgehend in einem geeigneten Anschlagpunkt am Bauwerk gesichert ist und (d) die Bühne kraftschlüssig am Bauwerk anliegt. In der Praxis ist das Aussteigen Sonderfall – für reine Dacharbeiten ist meist eine Anhänger- oder LKW-Bühne mit ausreichend hoher Plattform die bessere Wahl.",
        },
        {
          question: "Wie standsicher ist die Bühne – darf ich auf jedem Untergrund aufstellen?",
          answer:
            "Die maximal zulässige Hang-/Querneigung ist im Datenblatt angegeben (typisch 3–5° für selbstfahrende Bühnen, weniger bei voll ausgefahrenem Ausleger). Stützen sind auf tragfähigem Untergrund aufzustellen; bei weichem Untergrund (Rasen, frische Verfüllung) sind Stützplatten Pflicht, um den Bodendruck zu verteilen. Den maximalen Bodendruck pro Stütze nennt das Datenblatt – damit lässt sich die nötige Stützplattenfläche berechnen. Auf Pflaster, Gehwegen und über Kellerdecken gilt: vorher Tragfähigkeit beim Bauherrn erfragen.",
        },
        {
          question: "Wie transportiere ich eine Anhängerbühne von Krefeld zur Baustelle?",
          answer:
            "Anhängerbühnen mit zulässiger Gesamtmasse ≤ 3.500 kg fallen in die Führerscheinklasse BE. Die Stützlast (typisch 75–100 kg) muss eingehalten werden, die Anhängerkupplung des Zugfahrzeugs muss freigegeben sein. Wir prüfen bei Übergabe das Zugfahrzeug optisch (Kupplung, Beleuchtung) und geben eine Einweisung zum Aufrichten der Stützen, zum Stromanschluss und zur Notabsenkung. Auf Wunsch liefern wir die Bühne im Niederrhein-Liefergebiet per eigenem Transport.",
        },
        {
          question: "Was kostet eine Arbeitsbühne in Krefeld – und welche Mietdauer ist sinnvoll?",
          answer:
            "Tagespreise sind je Modell tagesaktuell im Buchungsprozess hinterlegt. Wochenmiete (≈ 5 Tagessätze) lohnt sich ab 2–3 Einsatztagen, Monatsmiete (≈ 15 Tagessätze) ab ca. 8 Einsatztagen. Diesel wird nach gefülltem Tank abgerechnet, Strom-Scherenbühnen werden geladen zurückgegeben. Für Dauereinsätze (z. B. Fassaden-Sanierung) ist die Monatsmiete oft günstiger als eine LKW-Bühne mit Bediener.",
        },
        {
          question: "Wie laut sind Arbeitsbühnen – kann ich sie in Wohngebieten einsetzen?",
          answer:
            "Elektrische Scherenbühnen sind nahezu lautlos (< 70 dB(A)) und auch in Innenräumen einsetzbar – idealerweise mit Non-Marking-Bereifung. Dieselbetriebene Gelenkteleskopbühnen liegen je nach Lastpunkt bei 80–95 dB(A) am Bediener und unterliegen damit der AVV Baulärm (Wohngebiet tags 55 dB(A) Immissionsrichtwert). In Krefelder Wohngebieten lohnt sich die Wahl einer Hybrid- oder rein elektrischen Bühne, wenn die Arbeit länger als ein halber Tag dauert.",
        },
      ],
      expertSections: [
        {
          h3: "Bauformen verstehen: warum drei Bühnen-Typen drei Anwendungen abdecken",
          paragraphs: [
            "Scherenbühnen heben die Plattform rein vertikal über ein Scheren-Hubwerk – sie sind die effizienteste Lösung, wenn die Arbeit direkt über der Maschinenfläche stattfindet (Lager, Hallen, Beleuchtungsmontage, Logistik). Vorteil: hohe Tragkraft (200–700 kg), große Plattform für mehrere Personen plus Material, leiser elektrischer Antrieb. Nachteil: keine seitliche Reichweite, eingeschränkt im Außenbereich (Bodenfreiheit).",
            "Gelenkteleskopbühnen kombinieren einen Knickarm mit einem Teleskopausleger – sie können über Hindernisse hinwegfahren, in Aussparungen hineinreichen und auf engem Raum hohe Reichweiten erzielen. Domäne: Fassade, Baumpflege, Lichtanlagen, Industrie-Wartung. Anhängerbühnen schließlich vereinen mittlere Höhen (12–22 m) mit der Mobilität eines Pkw-Anhängers – sie sind das Handwerker-Werkzeug schlechthin, weil sie ohne LKW-Logistik selbst auf die Baustelle gebracht werden können.",
          ],
        },
        {
          h3: "Hüllkurve und Tragfähigkeit: was die Marketing-Höhe verschweigt",
          paragraphs: [
            "Die plakative Zahl \"14-Meter-Bühne\" ist die maximale Arbeitshöhe und entspricht der Plattformhöhe + 2 m angenommener Greifhöhe. Praktisch nutzbar ist die Plattformhöhe. Wichtiger als die Höhenzahl ist die Hüllkurve (Reichweitendiagramm): Sie zeigt, wie weit die Plattform bei jeder Höhe nach vorne und zur Seite reichen kann.",
            "Typisch: Eine 22-m-Anhängerbühne erreicht bei voller Höhe etwa 9 m seitlich, bei 12 m Höhe dagegen rund 13 m. Außerdem reduziert sich die Korblast mit zunehmender Auslage von z. B. 250 kg auf 120 kg. Wer einen Schornstein über einem 5-m-Anbau erreichen will, muss diese Werte vorher abgleichen – die größte Höhe nützt nichts, wenn die seitliche Reichweite nicht passt. Wir beraten am Standort Krefeld anhand des konkreten Aufgabenbildes (Skizze, Foto) zur passenden Hüllkurve.",
          ],
        },
        {
          h3: "Sicherheit im Korb: Catapult-Effekt, PSAgA und Notabsenkung",
          paragraphs: [
            "Der mit Abstand häufigste tödliche Unfall mit Hubarbeitsbühnen ist der \"Catapult Effect\": Der Korb wird bei plötzlichem Aufprall (Hindernis, Stoß durch Fahrzeug) abrupt abgebremst, der ungesicherte Bediener wird über die Brüstung katapultiert. PSAgA mit kurzer Verbindungsleine (max. so lang, dass ein Fall über die Brüstung mechanisch unmöglich ist) verhindert das. Auf Gelenkteleskop- und Auslegerbühnen ist sie deshalb Pflicht.",
            "Jede Bühne hat eine Notabsenkung am Maschinenrumpf (Ausfall des Bedieners im Korb) und Notbedienelemente im Korb (Ausfall der Hauptsteuerung). Beide werden in unserer Einweisung in Krefeld konkret am Modell gezeigt. Bei Stromausfall oder Hydraulik-Notfall darf nur eine zweite, eingewiesene Person die Notabsenkung bedienen – nie der Bediener im Korb selbst (außer bei Vollausstattung mit Notbedienteil im Korb). Ein zweiter Helfer am Boden ist auf Außenbaustellen deshalb dringend empfohlen.",
          ],
        },
        {
          h3: "Stützen aufbauen: Bodendruck und Tragfähigkeit nüchtern rechnen",
          paragraphs: [
            "Die häufigste Schadensursache bei Anhänger- und LKW-Bühnen ist nicht die Mechanik, sondern der Untergrund. Wer eine Stütze einer 18-m-Bühne mit z. B. 4,5 t Stützlast auf einen Asphaltrand setzt, kann den Belag eindrücken oder eine Kellerdecke überlasten. Berechnungsformel: Bodendruck (kN/m²) = Stützlast (kN) ÷ Aufstandsfläche (m²). Bei einer 4,5-t-Stütze (44 kN) und einem Stützenteller von 30 × 30 cm = 0,09 m² ergibt das knapp 500 kN/m² – das hält gewachsener Boden, aber kein frisch verfüllter Graben und keine Tiefgaragendecke.",
            "Stützplatten (Holz oder Kunststoff, 50 × 50 cm oder größer) verteilen die Last und sind im Außeneinsatz Pflicht, sobald der Untergrund nicht nachweislich tragfähig ist. Wir geben pro Maschine den Bodendruck mit aus; bei kritischen Untergründen (Tiefgaragen, alte Innenstadtpflasterungen in Krefeld-Uerdingen) lohnt die kurze Rückfrage beim Bauherrn nach der Tragfähigkeit.",
          ],
        },
        {
          h3: "Pflicht zur Prüfung: vor jedem Einsatz, einmal jährlich, einmal nach Reparatur",
          paragraphs: [
            "Drei Prüf-Ebenen sind zu unterscheiden: (1) Arbeitstägliche Sicht- und Funktionsprüfung durch den Bediener (Reifen, Hydraulik-Dichtigkeit, NOT-AUS, Notabsenkung, Sicherungsmittel) – Pflicht vor jeder Schicht. (2) Wiederkehrende Prüfung nach BetrSichV § 14 i. V. m. DGUV Grundsatz 308-002 mindestens jährlich durch eine befähigte Person – das ist die \"UVV-Prüfung\", die wir bei jedem Mietgerät dokumentiert mitliefern. (3) Außerordentliche Prüfung nach Reparaturen, Umbauten oder Schäden.",
            "Als Mieter trägst du die Verantwortung für (1) und musst Mängel sofort melden – Weiterbenutzung ist nach Auftreten eines sicherheitsrelevanten Defekts ausgeschlossen. Wir sorgen für (2) und (3); die Prüfplakette ist sichtbar an der Maschine, das Prüfprotokoll erhältst du auf Anforderung digital. Damit ist der gesetzliche Rahmen für deinen Einsatz vollständig abgedeckt.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // WERKZEUGE (Bohrhämmer, Trennschleifer, Stemmhammer,
    //   Säbelsägen, Akku-Werkzeug, Kernbohrer, Estrichgeräte)
    // Quellen:
    //   - DGUV Information 209-068 (Sicherer Umgang mit
    //     handgeführten Maschinen) – Allgemeine Schutzregeln
    //   - TRGS 559 / TRGS 900 (Quarzhaltiger Staub –
    //     Arbeitsplatzgrenzwert A-Staub 1,25 mg/m³,
    //     alveolengängig 0,05 mg/m³ für Quarz)
    //   - DGUV Regel 109-002 (Arbeitsplatzlüftung,
    //     Staubabsaugung)
    //   - LärmVibrationsArbSchV (Hand-Arm-Vibration A(8)
    //     Auslöse 2,5 m/s², Grenz 5,0 m/s²)
    //   - DGUV Information 212-024 (PSA gegen Vibration)
    //   - DIN VDE 0100-704 (Baustellen – Stromversorgung,
    //     30 mA-RCD Pflicht)
    // -------------------------------------------------------------
    werkzeuge: {
      faqs: [
        {
          question: "Welcher Bohrhammer ist der richtige – SDS-plus oder SDS-max?",
          answer:
            "SDS-plus deckt Bohrdurchmesser bis ca. 30 mm und Meißelarbeiten leichter Art ab – die typische Größe für Dübellöcher in Beton und Mauerwerk, Hausanschluss-Durchbrüche bis 20 mm. SDS-max ist für Bohrungen ab 25 mm und schwere Stemmarbeiten ausgelegt (Beton-Abbruch, Estrich entfernen). Faustregel: Wand-/Deckendurchbrüche, Vollziegel, ausgehärteter Beton ab 25 mm Bohrloch ⇒ SDS-max. Wir führen am Standort Krefeld beide Aufnahmen plus reinen Stemmhammer (E-Hammer) für reine Abbruch-Arbeiten.",
        },
        {
          question: "Brauche ich für Kernbohrungen Wasser – und wie sichere ich Elektrik?",
          answer:
            "Diamant-Kernbohrungen ab ca. 50 mm Durchmesser werden im Nassschnitt geführt (Kühlung der Bohrkrone, Bindung des Schleifschlamms). Trockenbohrungen sind nur mit speziellen Trocken-Kronen + Industriesauger zulässig und auf kleinere Durchmesser begrenzt. Stromversorgung auf Baustellen muss nach DIN VDE 0100-704 über einen Baustromverteiler mit 30-mA-FI/RCD laufen. Nassbohren am Hausanschluss in nasser Umgebung ohne RCD ist lebensgefährlich. Wir vermieten Bohrständer mit Vakuumplatte und Wasser-Ringspülung; eine geeignete CEE-Versorgung muss bauseits gestellt werden.",
        },
        {
          question: "Wie schütze ich mich vor Quarzstaub beim Trennen, Bohren, Stemmen?",
          answer:
            "Quarzhaltiger Staub (Beton, Mörtel, Kalksandstein, Pflaster) ist nach TRGS 906 krebserzeugend (Kat. 1A). Der Arbeitsplatzgrenzwert für alveolengängigen Quarzstaub liegt bei 0,05 mg/m³ – in der Praxis nur mit Staubabsaugung der Schutzklasse M oder H einzuhalten. Pflichten: Nassbearbeitung wo möglich, Absaugung direkt am Werkzeug (Schutzhaube am Trennschleifer, M-/H-Sauger am Bohrhammer), Atemschutz FFP3 wo Absaugung nicht ausreicht. Wir vermieten Industriesauger Klasse M und H und passende Absaughauben.",
        },
        {
          question: "Welche PSA ist bei Trennschleifer, Bohrhammer und Stemmer Pflicht?",
          answer:
            "Standardpaket für gewerblichen Einsatz: Schutzbrille mit Seitenschutz (EN 166), Gehörschutz (Trennschleifer und Stemmer liegen bei 105–115 dB(A) Schallleistung), Atemschutz FFP3 bei staubender Bearbeitung, S3-Sicherheitsschuhe, vibrationsdämpfende Handschuhe nach EN ISO 10819, bei Trennschleifer-Einsatz im öffentlichen Verkehrsraum zusätzlich Warnschutz Klasse 2. Trennscheiben dürfen nur mit der vom Hersteller freigegebenen Maximaldrehzahl betrieben werden – die Aufdruck-Drehzahl muss ≥ der Werkzeugdrehzahl sein.",
        },
        {
          question: "Trennschleifer mit Diamantscheibe oder Verbund-Trennscheibe?",
          answer:
            "Diamant-Trennscheiben sind für mineralische Werkstoffe (Beton, Stein, Pflaster, Asphalt) konzipiert, halten sehr lange und sind unempfindlich gegen Verkanten. Verbund-Trennscheiben (Korund/Korund-Bindung) sind für Metall ausgelegt und dürfen nicht für Beton verwendet werden (Bruchgefahr). Umgekehrt ebenso: Eine Diamantscheibe zerstört sich schnell beim Trennen von Stahl. Wir geben für jeden Mietsäge/Trennschleifer eine Empfehlung der passenden Scheibe – Mietkunden bringen die Trennscheibe meist mit oder kaufen sie direkt bei uns.",
        },
        {
          question: "Wie lange darf ich täglich mit einem Stemmhammer arbeiten (Vibration)?",
          answer:
            "Die LärmVibrationsArbSchV begrenzt die tägliche Hand-Arm-Vibrations­exposition A(8) auf 5,0 m/s² Grenzwert, 2,5 m/s² Auslösewert. Ein typischer Elektro-Stemmhammer (5–10 kg) liegt bei 9–15 m/s² Schwingungsemissionswert. Beispielrechnung: Bei 12 m/s² Schwingungswert ist der Grenzwert nach ca. 1,4 Stunden Direktkontaktzeit erreicht. Praktisch heißt das: Stemm-Aufgaben auf zwei Bediener verteilen, vibrationsärmere Modelle wählen (z. B. mit aktivem Vibrationsdämpfungssystem AVS), oder die Aufgabe auf mehrere Tage strecken. Der Schwingungsemissionswert nach EN ISO 5349 steht in der Bedienungsanleitung.",
        },
        {
          question: "Was ist beim Baustellenstrom in Krefeld zu beachten?",
          answer:
            "DIN VDE 0100-704 fordert für Baustellen einen separaten Baustromverteiler mit Fehlerstromschutzschalter (RCD/FI) ≤ 30 mA für alle Steckdosen ≤ 32 A. Hausanschlusssteckdosen erfüllen das in Bestandsbauten oft nicht – dann ist ein mobiler PRCD-S vorgeschaltet Pflicht. Verlängerungskabel müssen für den Außeneinsatz geeignet (H07RN-F oder H05RN-F) und auf Beschädigung geprüft sein. Wir vermieten passende Baustromverteiler und PRCD-S in der Kategorie \"Kabel & Stromverteiler\".",
        },
        {
          question: "Was kostet die Werkzeug-Miete in Krefeld – ab wann lohnt der Kauf?",
          answer:
            "Tagessätze sind je Werkzeug tagesaktuell im Buchungsprozess hinterlegt. Wochenmiete entspricht typischerweise rund 5 Tagessätzen. Für sehr häufig genutzte Standard-Werkzeuge (kleiner Akku-Bohrschrauber) ist der Kauf meist sinnvoller; für Spezialwerkzeug (SDS-max-Hammer, Kernbohrgerät, Estrich-Glättmaschine) ist die Miete fast immer günstiger – diese Geräte amortisieren sich erst nach vielen Einsätzen.",
        },
        {
          question: "Welche Verbrauchsmittel (Bohrer, Scheiben, Kronen) gehören dazu?",
          answer:
            "Bei Mietwerkzeugen sind Verbrauchs­mittel nicht inklusive. Standard-Bohrer SDS-plus, Trenn­scheiben (Diamant und Stahl), Diamant-Kernbohrkronen und Estrich-Mischpaddel können wir am Standort Krefeld direkt mitliefern – das spart einen Extra-Stopp. Bei Kernbohrungen verschleißt die Krone abhängig von Beton-Härte und Bewehrungsgrad; die anteilige Abnutzung berechnen wir transparent in Bohrmetern.",
        },
        {
          question: "Darf ich Mietwerkzeug auch an Privatkunden oder zwischen Standorten weitergeben?",
          answer:
            "Die Untervermietung oder Weitergabe an Dritte ist gemäß unseren AGB ausgeschlossen – das ist auch versicherungstechnisch wichtig. Innerhalb eines Unternehmens darf das Werkzeug von eingewiesenen Mitarbeitern bedient werden. Bei standortübergreifenden Großprojekten lassen sich Mietgeräte direkt an die Baustelle (Niederrhein, Köln-Bonn, Ruhrgebiet) liefern – wir koordinieren das aus dem Hauptsitz Krefeld.",
        },
      ],
      expertSections: [
        {
          h3: "Werkzeugauswahl nach Material: nicht die Marke, sondern die Aufgabe entscheidet",
          paragraphs: [
            "Die wichtigste Frage vor der Werkzeugmiete ist nicht \"welche Marke\" – Hilti, Bosch, Makita und Co. liegen technisch eng beieinander – sondern die Werkzeugklasse passend zum Material und zum Energiebedarf. Beton stemmen mit einem normalen Bohrhammer SDS-plus ist mühsam und überlastet das Schlagwerk; umgekehrt ist ein SDS-max-Kombihammer für Dübellöcher überdimensioniert und schwierig zu führen.",
            "Pragmatische Auswahl: Dübellöcher ⇒ Akku- oder Netz-Bohrhammer SDS-plus mit 2–3 J Schlagenergie. Mauerdurchbrüche bis 80 mm ⇒ SDS-max-Kombihammer mit 8–12 J. Reines Stemmen großer Flächen ⇒ Elektro-Stemmhammer ohne Drehfunktion mit 15–25 J. Beton-Trennen bis 7 cm Tiefe ⇒ Trennschleifer 230 mm. Tiefere Schnitte oder Kantenarbeit ⇒ Diamant-Mauernutfräse oder Wandsäge. Kernbohrungen 50–300 mm ⇒ Diamant-Kernbohrgerät mit Bohrständer. Wir bevorraten in Krefeld alle Klassen und beraten anhand des konkreten Aufgabenbildes.",
          ],
        },
        {
          h3: "Quarzstaub: warum FFP3 allein nicht reicht und Absaugung Pflicht ist",
          paragraphs: [
            "Quarzstaub (kristallines Siliziumdioxid) ist seit Jahren als krebserzeugend Kategorie 1A eingestuft (TRGS 906). Er entsteht bei jeder spanenden Bearbeitung von Beton, Mörtel, Kalksandstein, Pflaster und vielen Natursteinen. Der Arbeitsplatzgrenzwert für die alveolengängige Fraktion liegt bei 0,05 mg/m³ – ein Wert, der mit reiner Atemschutzmaske nicht eingehalten werden kann, weil die Maske den Bediener schützt, nicht die Umgebung und nicht andere Personen auf der Baustelle.",
            "Stand der Technik nach TRGS 559: Staubabsaugung direkt am Werkzeug (Industriesauger Klasse M für Quarzstaub mit Restschmutz, Klasse H für reinen Krebsstaub und Asbestnachbehandlung), wo möglich Nassbearbeitung (Wasserzufuhr am Trennschleifer, am Kernbohrer ohnehin Standard), Atemschutz FFP3 als letzte Schutzebene. Wir vermieten passende M- und H-Sauger sowie Trenn-Saubereinhausungen und beraten zur konkreten Werkzeug-Sauger-Kombination.",
          ],
        },
        {
          h3: "Vibration und Lärm: warum Werkzeugwahl auch Arbeitszeit-Frage ist",
          paragraphs: [
            "Handgeführte Schlagwerkzeuge zählen neben Stampfern zu den vibrationsintensivsten Geräten. Ein typischer SDS-max-Stemmhammer hat einen Schwingungswert von 10–15 m/s² nach EN ISO 5349. Der Grenzwert der LärmVibrationsArbSchV ist A(8) = 5,0 m/s² – mit dem Stemmhammer ist dieser Wert nach 1–2 Stunden Direktkontaktzeit pro Tag erreicht. Längere Einsatzzeiten sind rechtlich nicht zulässig.",
            "Lösungsansätze: Werkzeuge mit aktivem Vibrationsschutz (AVS, je nach Hersteller verschieden bezeichnet) reduzieren den Wert auf 5–8 m/s². Verteilung der Aufgabe auf zwei Bediener verdoppelt die zulässige Gesamtzeit. Für extrem große Abbruchflächen lohnt der Wechsel auf einen Bagger mit Hydraulikhammer – das ist nicht nur schneller, sondern entzieht den Menschen vollständig der Vibrationsexposition. Wir kombinieren in Krefeld auf Wunsch Werkzeug- und Erdbewegungs-Miete.",
          ],
        },
        {
          h3: "Akku oder Netz oder Verbrenner: was passt zu welcher Baustelle",
          paragraphs: [
            "Aktuelle 36–54-V-Akkupakete (Bosch ProCORE, Hilti Nuron, Makita XGT, Milwaukee MX FUEL) leisten in der Spitze annähernd das, was bisher Netzgeräte vorbehalten war – inklusive Stemmhämmer und Kernbohrer. Sie sind die richtige Wahl, wenn (a) kein Baustellenstrom verfügbar ist, (b) die Mobilität entscheidet (Dach, Höhe), (c) Lärm im Wohngebiet kritisch ist.",
            "Netzgeräte sind weiterhin überlegen bei Dauer­einsatz (kein Akku-Tausch, höhere Leistung über Stunden), bei sehr großen Kernbohrungen und beim Estrich-Mischen. Verbrenner-Werkzeuge (Trennschleifer mit Zweitaktmotor) sind im Tiefbau und auf Baustellen ohne Strom unschlagbar mobil, dürfen wegen Abgas und Lärm aber nicht in Innenräumen oder Tiefgaragen eingesetzt werden. Wir führen am Standort Krefeld alle drei Klassen und prüfen vor Übergabe Akku-Ladung bzw. Tankfüllung.",
          ],
        },
        {
          h3: "Mietwerkzeug-Logik: Verbrauchsmittel, Rückgabezustand, Garantieausschluss",
          paragraphs: [
            "Anders als bei Baumaschinen ist bei Werkzeugen die Trennlinie zwischen Maschine und Verschleißteil unscharf. Trennscheiben, Bohrer, Kernkronen, Schleifscheiben, Mischpaddel und Verbrauchsbeutel der Sauger sind nicht in der Miete enthalten. Wir geben pro Werkzeug eine Empfehlung der passenden Verbrauchsmittel und liefern sie direkt mit – das spart den Materialeinkauf vor Beginn der Arbeit.",
            "Bei der Rückgabe in Krefeld prüfen wir den Funktionszustand. Erwarteter Verschleiß (Trennscheibe abgenutzt, Bohrer-Spitzen-Wear) ist eingepreist; mechanische Schäden durch Fehlbedienung (verkanteter Trennschleifer, defekter Schalter durch Sturz, durchgebranntes Schlagwerk) gehen zu Lasten des Mieters. Eine Sichtprüfung vor Abholung im Beisein des Mieters dokumentiert den Ausgangszustand. Die Bedienungsanleitung liegt jedem Werkzeug bei – wir empfehlen, sich vor Erstgebrauch mindestens die Sicherheitskapitel anzusehen.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // AGGREGATE (Stromerzeuger, Notstromaggregate, Erdraketen,
    //   Schweißstromaggregate)
    // Quellen:
    //   - DIN VDE 0100-551 / VDE 0100-728 (Stromerzeuger,
    //     Schutzmaßnahmen IT-/TN-System auf Baustellen)
    //   - DGUV Information 203-032 (Auswahl und Betrieb
    //     elektrischer Anlagen und Betriebsmittel auf
    //     Baustellen)
    //   - DIN VDE 0100-704 (Baustellen – RCD-Pflicht)
    //   - 32. BImSchV (Geräte- und Maschinenlärm-Verordnung,
    //     Außenbereich, Lautstärke-Kennzeichnung LWA)
    //   - DIN EN ISO 8528 (Stromerzeugungs-Aggregate –
    //     Leistungsklassen ESP/PRP/LTP/COP)
    //   - TA Luft (Abgasanforderungen Stage V für mobile
    //     Maschinen ≥ 19 kW)
    // -------------------------------------------------------------
    aggregate: {
      faqs: [
        {
          question: "Welche kVA-Klasse brauche ich für meine Anwendung?",
          answer:
            "Faustregel nach Verbraucher: Werkzeug bis 2.000 W (Bohrhammer, Säge) ⇒ 3–5 kVA Inverter. Kreissägen, kleine Schweißgeräte, ein Bautrockner ⇒ 6–8 kVA. Bühnen-Veranstaltung mit Licht, Ton und Catering ⇒ 10–20 kVA. Hausanschluss-Notstrom für Wohnhaus ⇒ 8–15 kVA je nach Verbraucher. Baustellen mit mehreren parallelen Werkzeugen, Kompressoren und Heizungen ⇒ ab 30 kVA. Wichtig: Motoren mit Anlaufstrom (Kompressor, Bohrhammer Start) benötigen Reserve – Anlaufstrom-Faktor 3–7 gegenüber Dauerstrom einplanen. Wir geben in jedem Aggregat-Datenblatt die Dauerleistung (PRP) und Maximalleistung (LTP) nach ISO 8528 an.",
        },
        {
          question: "Diesel oder Benzin – und ab wann lohnt sich Diesel?",
          answer:
            "Benzin-Inverter (typisch 2–4 kVA) sind leise, kompakt, ideal für Camping, Marktstände und kurze Einsätze. Ab ca. 5 kVA dominiert Diesel: niedrigerer Verbrauch, langlebiger Motor, höhere Drehmomentreserve bei Anlaufstrom. Für Baustellen-Dauerbetrieb ab Halbtagseinsatz ist Diesel immer wirtschaftlicher. Ab 19 kW Motorleistung gilt EU-Stage V – moderne Aggregate erfüllen die Norm mit Partikelfilter und SCR-Kat. Im Mietpark Krefeld stehen wir auf Stage-V-konforme Diesel-Aggregate, sodass auch in Umweltzonen Köln, Düsseldorf und Bonn der Einsatz möglich ist.",
        },
        {
          question: "Was ist der Unterschied zwischen IT-Netz und TN-S-Netz beim Aggregat?",
          answer:
            "Stromerzeuger werden in zwei Schutzmaßnahmen-Konzepten betrieben: IT-System (Isoliertes Netz, kein PE-Anschluss zum Erdpotenzial) mit Schutztrennung – sicher bei Einsatz nur weniger isolierter Verbraucher, aber kein RCD wirksam. TN-S-System mit hartgeerdetem Sternpunkt und 30-mA-RCD/FI – Pflicht bei Mehrfachverbrauchern, Verteilerbetrieb auf Baustellen, jedem Anschluss von Baustromverteilern. Im Mietpark Krefeld kennzeichnen wir die Aggregate eindeutig (IT oder TN-S), und wir vermieten passende Verteiler. Bitte vor Einsatz prüfen, welches Konzept zur Verbraucher-Situation passt.",
        },
        {
          question: "Wie laut darf ein Aggregat in einem Krefelder Wohngebiet sein?",
          answer:
            "Die 32. BImSchV (Geräte- und Maschinenlärm-Verordnung) regelt den Einsatz im Freien. In reinen Wohngebieten ist der Betrieb lärmintensiver Geräte sonntags und werktags 20:00–07:00 untersagt. Tagsüber gilt die TA Lärm: Immissionsrichtwert 55 dB(A) am Nachbarn. Moderne schallgedämmte Aggregate erreichen 60–68 dB(A) in 7 m Abstand – im Wohngebiet damit grenzwertig. Inverter-Aggregate für Camping/Markt sind mit ca. 55–62 dB(A) deutlich leiser. Auf der LWA-Plakette steht die garantierte Schallleistung; davon kann man grob 20 dB für die Schallimmission in 7 m abziehen.",
        },
        {
          question: "Wie groß muss der Tank sein, um durchzulaufen?",
          answer:
            "Tankinhalt × Stunden Dauerlauf bei 75 % Last ist die relevante Kennzahl. Beispiel: 30-kVA-Diesel hat einen Verbrauch von ca. 5,5 l/h bei 75 % Last; mit 100-l-Tank läuft er ca. 18 Stunden durch. Notstrom-Aggregate für Wohnhaus laufen mit Standardtank (50–60 l) typischerweise 12–24 Stunden. Bei Veranstaltungen über mehrere Tage werden Zusatz-Tankcontainer (200, 400, 1.000 l) genutzt. Wir bieten am Standort Krefeld passende Zusatz-Tanks; Befüllung organisiert der Mieter beim örtlichen Diesel-Lieferanten.",
        },
        {
          question: "Welche Steckdosen-Belegung hat ein Aggregat – und wie verbinde ich es?",
          answer:
            "Standard sind je nach Klasse: 230 V / 16 A Schuko (kleine Geräte), CEE 16 A 3-phasig (5-polig, blau für 230 V, rot für 400 V), CEE 32 A 3-phasig (rot, 400 V), CEE 63 A 3-phasig. Bei größeren Aggregaten (>20 kVA) zusätzlich Klemmleisten zum Festanschluss durch Elektrofachkraft. Die Verbindung zum Baustromverteiler oder zur Verteilung im Haus muss DIN-VDE-konform durch eine Elektrofachkraft erfolgen, sobald nicht steckerfertig verbunden wird. Wir vermieten alle gängigen CEE-Kabel und Adapter in der Kategorie \"Kabel & Stromverteiler\".",
        },
        {
          question: "Stage V – was bedeutet das für Innenstadt-Einsätze (Köln, Düsseldorf, Bonn)?",
          answer:
            "Seit 2019 (gestaffelt nach Leistung) gilt für mobile Maschinen ≥ 19 kW die EU-Abgasstufe Stage V mit Partikelfilter und SCR-Katalysator. In bestimmten Umweltzonen und bei kommunalen Ausschreibungen wird der Stage-V-Status gefordert. Wir bevorraten in der oberen Leistungsklasse ausschließlich Stage-V-Aggregate, sodass Einsätze in den Umweltzonen am Niederrhein und in Köln-/Düsseldorf-Innenstadt rechtssicher möglich sind. Für jeden Mietvorgang können wir auf Wunsch das Stage-V-Konformitätszertifikat des Herstellers digital bereitstellen.",
        },
        {
          question: "Wie sichere ich ein Aggregat gegen Diebstahl auf der Baustelle?",
          answer:
            "Aggregate ab 8 kVA stehen typischerweise in stabilen Rahmen mit Kranöse und Anhängevorrichtung. Praxis-bewährt: anketten an feste Bauteile (Container, Trafostation), beleuchten, Tankdeckel abschließen (verhindert Tankraub), nachts bei Bedarf in Bauwagen einlagern. Wir bieten optionale GPS-Tracker auf Anfrage. Für die Versicherung gilt: Diebstahlschaden vom Mieter zu tragen, soweit keine separate Versicherung abgeschlossen wurde – wir bieten optionale Geräteversicherung im Buchungsprozess.",
        },
        {
          question: "Was kostet ein Stromerzeuger in Krefeld – und welche Kosten kommen dazu?",
          answer:
            "Tagespreis je Modell tagesaktuell im Buchungsprozess. Zusätzlich: Diesel/Benzin (nach Rückgabe nach gefülltem Tank abgerechnet), bei Bedarf CEE-Verlängerungskabel, Adapter und Baustromverteiler aus der Kategorie \"Kabel & Stromverteiler\". Wochenmiete entspricht typischerweise rund 5 Tagessätzen, Monatsmiete rund 15 – lohnt sich also bei längeren Baustellen oder Veranstaltungswochen.",
        },
        {
          question: "Bietet ihr auch Baustrom-Anträge und temporäre Stromversorgung an?",
          answer:
            "Ja. Wir übernehmen Baustromanträge zum Festpreis bei den örtlichen Netzbetreibern (SWK Krefeld, NEW, RheinEnergie, Stadtwerke Düsseldorf und Co.) inklusive Anschluss­zähler, temporärem Verteiler und Zähler-Rückbau. Das ist oft die wirtschaftliche Alternative zum Diesel-Aggregat, sobald die Baustelle über drei Wochen läuft. Anfragen direkt am Standort Krefeld – wir kalkulieren die Pauschale nach Standort, gewünschter Anschlussleistung und Dauer.",
        },
      ],
      expertSections: [
        {
          h3: "Dauerleistung, Maximalleistung, Anlaufstrom: warum eine Zahl nicht reicht",
          paragraphs: [
            "Stromerzeuger werden nach DIN EN ISO 8528 in vier Leistungsklassen angegeben: ESP (Notstrom, begrenzte Stunden/Jahr), PRP (Prime Power, Dauerleistung), LTP (Limited Time Power, Spitzenleistung kurzzeitig), COP (Continuous Power, 100 % Dauerbetrieb). In Mietkatalogen ist meist die PRP genannt – das ist die Leistung, die das Aggregat im wechselnden Lastbetrieb dauerhaft abgeben kann (typisch 75 % der LTP).",
            "Entscheidender als die nominelle kVA-Zahl ist die Reserve für Anlaufströme. Ein 2,2-kW-Bohrhammer zieht im Anlauf kurzzeitig 6–8 kW; ein Kompressor 1,5 kW im Dauerbetrieb braucht 7–8 kW Spitze. Wer das nicht einrechnet, bringt das Aggregat im Anlaufmoment in die Übertemperatur-Abschaltung. Faustregel: Summe der Dauerleistungen verdoppeln, plus 30 % für gleichzeitig anlaufende Verbraucher. Wir geben am Standort Krefeld zu jedem Anwendungsfall (Werkzeug-Set, Veranstaltung, Notstrom) eine konkrete Empfehlung der passenden Aggregat-Klasse.",
          ],
        },
        {
          h3: "Schutzkonzept IT vs. TN-S: die wichtigste Frage vor dem Anschluss",
          paragraphs: [
            "Tragbare Stromerzeuger werden überwiegend im IT-Netz betrieben (kein PE-Bezug zur Erde, isolierte Schutztrennung) – das ist sicher bei direktem Anschluss eines einzigen, isolierten Verbrauchers (z. B. ein Bohrhammer am Aggregat). Sobald aber ein zweites Gerät über einen Baustromverteiler hinzu kommt, ist die IT-Schutztrennung aufgehoben: Im IT-Netz wirkt kein RCD/FI – Personen­schutz nicht mehr gewährleistet.",
            "Für Mehrfach-Verbrauch und Baustellenbetrieb muss das Aggregat als TN-S-Netz mit hartgeerdetem Sternpunkt und vorgeschaltetem 30-mA-RCD betrieben werden (DIN VDE 0100-704). Wir kennzeichnen am Mietpark eindeutig, welches Aggregat IT- oder TN-S-tauglich ist; im Zweifel beraten wir am Telefon. Falscher Anschluss ist nicht nur ein Versicherungsthema, sondern Lebensgefahr – die Investition in den richtigen Verteiler ist Pflicht.",
          ],
        },
        {
          h3: "Lärmschutz auf Veranstaltungen und in Wohnquartieren",
          paragraphs: [
            "Aggregate sind nach 32. BImSchV mit der garantierten Schallleistung LWA (in dB) zu kennzeichnen. Ein typisches offenes Baustellen-Aggregat 20 kVA liegt bei LWA = 95–100 dB(A); die Immissions­wirkung in 7 m beträgt grob LWA − 20 dB = 75–80 dB(A) – im Wohngebiet (TA Lärm 55 dB(A) tags) deutlich zu laut für nahe Anwohner.",
            "Schallgedämmte Aggregate (\"Soundproof\") erreichen LWA = 65–75 dB(A), in 7 m also 45–55 dB(A) – das hält den Richtwert ein. Für Veranstaltungen in Innenstadt-Lagen (Krefelder Burgmarkt, Bonner Rheinaue, Mülheimer MüGa) bevorraten wir bevorzugt schallgedämmte Modelle. Bei mehrtägigem Betrieb kann zusätzlich ein Lärmschutzgehäuse (Schallschutzkabine) sinnvoll sein; das organisieren wir auf Anfrage.",
          ],
        },
        {
          h3: "Stage V und Umweltzonen: was Innenstadt-Einsätze in NRW heute fordern",
          paragraphs: [
            "Die EU-Verordnung 2016/1628 hat für mobile Maschinen ≥ 19 kW seit 2019/2020 (gestaffelt nach Leistungsklassen) Stage V als Abgasstufe verbindlich eingeführt. Stage V verlangt Diesel-Partikelfilter und SCR-Kat (AdBlue) und reduziert Stickoxide und Feinstaub auf einen Bruchteil der Vorgängerstufe IIIA/IV. In Umweltzonen-Ausschreibungen und bei kommunalen Bauvorhaben wird die Stufe zunehmend nachgefragt; eine generelle gesetzliche Einsatzbeschränkung außerhalb der Umweltzonen besteht für Bestandsmaschinen aktuell nicht.",
            "Im Mietpark Krefeld bevorzugen wir in der mittleren und großen Leistungsklasse Stage-V-konforme Aggregate, sodass Einsätze in den Umweltzonen Köln, Düsseldorf, Bonn und Ruhrgebiet jederzeit möglich sind. Auf Wunsch stellen wir das CE-/EU-Stage-V-Zertifikat des Herstellers digital bereit – das wird in größeren Ausschreibungen häufig nachgefordert.",
          ],
        },
        {
          h3: "Kraftstoff-Logistik: Tankgröße, Verbrauch, AdBlue, Lagerung",
          paragraphs: [
            "Diesel-Verbrauch von Bau-Aggregaten lässt sich grob mit 0,2 l je kWh elektrische Energie ansetzen. Ein 20-kVA-Aggregat bei 75 % Auslastung (15 kW) verbraucht ca. 3 l/h, ein 100-kVA-Aggregat bei 75 % (75 kW) ca. 15 l/h. Bei großen Veranstaltungen oder mehrtägigem Notstrom werden Zusatztanks (200, 400, 1.000 l doppelwandig nach AwSV) eingesetzt; ab 1.000 l Lagerung gelten verschärfte wasserrechtliche Pflichten.",
            "AdBlue (Harnstofflösung für SCR-Katalysator) wird bei Stage-V-Aggregaten zusätzlich verbraucht, typisch 3–5 % vom Dieselverbrauch. Tank befindet sich am Aggregat und ist getrennt zu befüllen. Wir liefern Aggregate volltank, die Rückgabe erfolgt nach gefülltem Tank – Diesel- und AdBlue-Verbrauch wird nach Verbrauch oder pauschal nach gefülltem Tank in Krefeld abgerechnet, je nach Mietvereinbarung. Bei Großverbrauch lohnt die direkte Belieferung der Baustelle durch einen örtlichen Diesel-Tankwagen.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // GARTENPFLEGE (Häcksler, Vertikutierer, Motorhacken,
    //   Holzspalter, Heckenscheren, Kettensägen, Wurzelfräsen)
    // Quellen: 32. BImSchV (Geräte-/Maschinenlärm in Wohngebieten),
    //   DGUV Information 214-059 (Motorsägen), DGUV 112-194 (PSA),
    //   LärmVibrationsArbSchV, BNatSchG § 39 (Vegetationsperiode
    //   1. März – 30. September), Baumschutzsatzung der Stadt
    //   Krefeld (Schutz von Bäumen ab 80 cm Stammumfang).
    // -------------------------------------------------------------
    gartenpflege: {
      faqs: [
        {
          question: "Welcher Häcksler passt zu meinem Gartenrückschnitt?",
          answer:
            "Faustregel nach Astdurchmesser: Bis ca. 35 mm reichen Walzenhäcksler (leise, sogenannte \"Leise-Häcksler\", ideal im Wohngebiet). Bis 45 mm sind Turbinen- bzw. Schneidwalzen-Geräte sinnvoll. Bis 75 mm und für Profi-Heckenrückschnitt greift man zu Benzin-Häckslern mit Hammerwerk. Im Krefelder Mietpark führen wir alle drei Klassen; der maximale Astdurchmesser steht in jedem Produktdatenblatt. Wichtig: Häcksler arbeiten an grünem Schnittgut deutlich besser als an trockenem – planbar nach dem Schnitt einsetzen.",
        },
        {
          question: "Vertikutieren oder Aerifizieren – was brauche ich wann?",
          answer:
            "Vertikutierer schneiden senkrecht in die Grasnarbe (3–5 mm tief) und entfernen Rasenfilz und Moos – die Standardpflege im März/April und im September. Aerifizierer stechen 5–10 cm tiefe Hohldorne in den Boden und entlasten verdichtete Rasenflächen (typisch bei Spielrasen, Hundewiese). Auf normalem Hausrasen reicht Vertikutieren plus Nachsaat; Aerifizieren ist nur bei spürbarer Verdichtung nötig. Beide Geräte führen wir in Elektro- und Benzin-Ausführung am Standort Krefeld.",
        },
        {
          question: "Welche Lärmregelung gilt für Gartengeräte in Krefelder Wohngebieten?",
          answer:
            "Die 32. BImSchV erlaubt den Einsatz lärmintensiver Geräte (Rasenmäher, Vertikutierer, Häcksler, Motorsensen) in reinen und allgemeinen Wohngebieten werktags 07:00–20:00. Für besonders laute Geräte (z. B. Laubbläser, Freischneider) gilt zusätzlich ein Verbot zwischen 13:00–15:00 in Wohngebieten. Sonntags und an gesetzlichen Feiertagen ist der Betrieb ganztägig untersagt. Elektrische Geräte und Akku-Geräte (mit EU-Lärm-Zeichen unter dem Grenzwert) sind von einigen Einschränkungen ausgenommen.",
        },
        {
          question: "Brauche ich einen Motorsägenschein, um eine Kettensäge bei euch zu mieten?",
          answer:
            "Privat im eigenen Garten ist kein Schein gesetzlich vorgeschrieben; wir empfehlen aber dringend, ohne Erfahrung keine Kettensäge zu führen – die Verletzungsschwere ist hoch. Im gewerblichen Einsatz oder im Wald gilt DGUV Information 214-059 plus DGUV Grundsatz 308-009: dort ist ein Motorsägenkurs (z. B. AS Baum I/II) Pflicht. Wir vermieten gewerblich nur an Kunden mit entsprechendem Nachweis. PSA – Schnittschutzhose Klasse 1, Schnittschutzschuhe, Helm mit Visier und Gehörschutz, Schnittschutzhandschuhe – muss der Mieter bzw. Arbeitgeber selbst stellen.",
        },
        {
          question: "Holzspalter: liegend oder stehend, Spaltdruck wie viel?",
          answer:
            "Liegende Spalter (5–8 t) sind für Holz bis ca. 1 m Länge und 30 cm Durchmesser ausgelegt – die Standardlösung für Kaminholz aus dem Hausgarten. Stehende Spalter (10–25 t) brauchst du für Meterholz, harte Hölzer (Eiche, Buche, knorriges Obst-Stammholz) und Stammdurchmesser über 30 cm. Der angegebene Spaltdruck (t) ist die maximale Kraft – als Faustregel reicht 1 t Spaltdruck je 10 cm Stammdurchmesser bei weichen Hölzern, das Doppelte bei Hartholz mit Astansätzen. Wir führen am Standort Krefeld liegende und stehende Spalter.",
        },
        {
          question: "Wurzelfräse mieten – wie tief und wie breit komme ich?",
          answer:
            "Klassische handgeführte Wurzelfräsen erreichen 25–30 cm Frästiefe bei einer Breite von 25–30 cm. Sie verarbeiten den Wurzelstock in Späne; der Stock muss vor dem Fräsen ebenerdig abgesägt werden. Für sehr große Stöcke (Stammdurchmesser über 60 cm) lohnt sich eher der Bagger mit Wurzelreißer aus der Erdbewegungs-Kategorie. Achtung: Vor jedem Fräseinsatz Lage von Strom-, Gas-, Wasser- und Telekomleitungen über die Sparten-Auskunft prüfen – Wurzeln verlaufen oft entlang von Versorgungstrassen.",
        },
        {
          question: "Was muss ich vor dem Fällen eines Baumes in Krefeld beachten?",
          answer:
            "Die Stadt Krefeld hat eine Baumschutzsatzung: Bäume ab 80 cm Stammumfang (gemessen in 1 m Höhe) sind grundsätzlich geschützt – Fällung oder starker Rückschnitt brauchen eine Genehmigung des Fachbereichs Grünflächen. Während der Vegetationsperiode (1. März bis 30. September) untersagt § 39 BNatSchG bundesweit Fällarbeiten und starken Rückschnitt von Hecken und Gehölzen. Form- und Pflegeschnitt bleibt zulässig. Wir vermieten die Geräte – die Genehmigungsfrage musst du als Auftraggeber mit der Stadt klären.",
        },
        {
          question: "Aufsitzmäher oder selbstfahrender Mäher für große Flächen?",
          answer:
            "Bis ca. 1.500 m² reicht ein selbstfahrender Hand-Mäher mit 50 cm Schnittbreite. Ab 2.000 m² lohnt sich ein Aufsitzmäher mit 80–110 cm Schnittbreite (Mähleistung 2.500–4.500 m²/h). Bei Steigungen über 15° sind nur hangtaugliche Spezialmäher oder Balkenmäher zugelassen. Wir bevorraten am Standort Krefeld Hand- und Aufsitzmäher; für Sondereinsätze (Hangmahd, Wildwiese) bieten wir Balkenmäher und Schlegelmäher als Anbaugerät.",
        },
        {
          question: "Was kostet die Gartenpflege-Miete in Krefeld?",
          answer:
            "Tagessätze sind je Modell tagesaktuell im Buchungsprozess hinterlegt. Wochenmiete entspricht typischerweise rund 5 Tagessätzen, ideal für Frühjahrs- oder Herbstpflege übers Wochenende plus Folgetag. Kraftstoff wird nach gefülltem Tank abgerechnet; Akku-Geräte werden geladen zurückgegeben. Für Vereine und Hausverwaltungen kalkulieren wir auf Anfrage Saison- und Rahmenmieten am Hauptsitz Krefeld.",
        },
        {
          question: "Welche PSA brauche ich bei Häcksler, Freischneider, Heckenschere?",
          answer:
            "Häcksler: Schutzbrille, Gehörschutz, eng anliegende Kleidung (keine losen Ärmel – Einzugsgefahr), feste Handschuhe. Freischneider bzw. Motorsense: zusätzlich Beinschutz/Schnittschutzhose, Visier, S3-Schuhe. Heckenschere (motorisiert): Schnittfeste Handschuhe, Schutzbrille, Gehörschutz; bei Höhenarbeit zusätzlich Sturzschutz. Kettensäge: vollständige PSA-Kombi (Schnittschutzhose Klasse 1, Helm mit Visier, Schnittschutzschuhe). PSA stellt der Bediener bzw. Arbeitgeber – wir vermieten ausschließlich die Maschine.",
        },
      ],
      expertSections: [
        {
          h3: "Schnittgut, Verdichtung, Vegetationsperiode: Pflege im Jahreszyklus",
          paragraphs: [
            "Gartenpflege ist saisonal getaktet. Frühjahr (März/April): Vertikutieren, Aerifizieren bei verdichteten Flächen, Nachsaat, erster Rückschnitt von Sommerblühern. Sommer: regelmäßige Mahd, Heckenformschnitt nur als Form- und Pflegeschnitt (§ 39 BNatSchG). Herbst (September/Oktober): zweiter Vertikutiergang, Laub aufnehmen, Häckseln von Strauchrückschnitt. Winter (1. Oktober – 28. Februar) ist die einzige Phase, in der Bäume und Hecken radikal zurückgeschnitten oder gefällt werden dürfen – Fällgenehmigungen der Stadt Krefeld vorausgesetzt.",
            "Diese Taktung bestimmt auch die Mietnachfrage: Vertikutierer und Häcksler sind im April und September stark gebucht, Holzspalter und Wurzelfräsen vor allem im Spätherbst und Winter. Eine frühzeitige Reservierung lohnt sich – wir geben am Standort Krefeld telefonisch verbindliche Verfügbarkeits-Auskunft.",
          ],
        },
        {
          h3: "Lärmschutz und gute Nachbarschaft im Krefelder Wohngebiet",
          paragraphs: [
            "Die 32. BImSchV unterscheidet zwei Gerätekategorien. Erste Gruppe (Häcksler, Rasenmäher, Vertikutierer, Heckenscheren) darf in reinen und allgemeinen Wohngebieten werktags 07:00–20:00 betrieben werden. Zweite Gruppe – besonders laute Geräte wie Freischneider, Laubbläser, Laubsammler mit Verbrennungsmotor – unterliegt in Wohngebieten zusätzlich einer Mittagsruhe-Regel und darf werktags von 13:00 bis 15:00 nicht laufen. Sonntags und an gesetzlichen Feiertagen sind beide Gruppen ganztägig untersagt.",
            "Akku- und Elektrogeräte sind von einem Teil dieser Einschränkungen ausgenommen, sofern sie die EU-Geräuschgrenzwerte unterschreiten und mit dem entsprechenden EU-Umwelt-Symbol gekennzeichnet sind. Wer in dicht bebauten Krefelder Quartieren (Bockum, Cracau, Hülser Berg) arbeitet, fährt mit Akku-Häckslern und elektrischen Rasenmähern deutlich konfliktärmer.",
          ],
        },
        {
          h3: "Baumschutz: was die Krefelder Baumschutzsatzung wirklich verlangt",
          paragraphs: [
            "Die Stadt Krefeld schützt über ihre Baumschutzsatzung Bäume mit einem Stammumfang ab 80 cm in 1 m Höhe (Ausnahme: Obstbäume und einige Nadelgehölze). Fällung, Wurzelschäden ab bestimmter Größe oder ein Rückschnitt, der mehr als 30 % der Krone abnimmt, brauchen eine Ausnahmegenehmigung des Fachbereichs Grünflächen. Bei genehmigter Fällung wird in der Regel eine Ersatzpflanzung verlangt.",
            "Bundesweit gilt zusätzlich § 39 BNatSchG: vom 1. März bis 30. September ist das Fällen von Bäumen außerhalb des Waldes sowie das radikale Zurückschneiden von Hecken und Gehölzen untersagt – zum Schutz brütender Vögel. Form- und Pflegeschnitt bleibt zulässig. Bei Verstößen drohen Bußgelder bis 50.000 Euro. Wir empfehlen, vor jeder größeren Fäll- oder Rückschnitt-Aktion in Krefeld kurz beim Fachbereich Grünflächen nachzufragen.",
          ],
        },
        {
          h3: "Häcksler im Detail: Walze, Turbine, Hammerwerk – und warum es leise geht",
          paragraphs: [
            "Walzenhäcksler ziehen das Schnittgut langsam zwischen eine konische Walze und eine Druckplatte – leise und ohne Vorschnitt durch Klingen. Vorteil: Sehr leise (typisch 90–95 dB(A) LWA), wenig Schnittgut-Auswurf, Astdurchmesser bis 35–45 mm. Nachteil: langsamer Durchsatz, kein Häckselbild für Mulch.",
            "Turbinen- und Schneidwalzen-Häcksler arbeiten mit rotierenden Klingen plus Einzugswalze – schneller Durchsatz, feineres Schnittgut, dafür lauter (98–105 dB(A) LWA) und höherer Stromverbrauch. Hammerwerk-Häcksler (typisch Benzin, 100–108 dB(A) LWA) zerschlagen das Holz – maximaler Durchsatz und größte Astdurchmesser, aber definitiv kein Wohngebiet-Gerät. Für die Krefelder Innenstadt-Pflege ist der Walzenhäcksler die einzig nachbarschaftsverträgliche Lösung.",
          ],
        },
        {
          h3: "Kettensägen-Arbeit: warum Privat-Einsatz die meisten Unfälle erzeugt",
          paragraphs: [
            "Statistisch tritt der überwiegende Anteil schwerer Kettensägen-Unfälle nicht beim Forst-Profi auf, sondern bei privaten Brennholz-Aktionen. Ursachen: fehlende PSA, Schnitt auf Hüfthöhe statt Knie, kein Fluchtweg geplant, Schnitt in Spannungsholz ohne Kenntnis der Spannungsverhältnisse. Die DGUV Information 214-059 dokumentiert konkrete Arbeitstechniken (Fällrichtung, Fallkerb, Bruchleiste, Splintschnitt), die im Privatumfeld oft ignoriert werden.",
            "Unsere Empfehlung für Krefelder Mietkunden: Vor dem ersten Einsatz einen Tageskurs Motorsäge für Brennholz absolvieren – verschiedene Anbieter in NRW. Mindestens aber: nie alleine sägen, immer mit Schnittschutzhose Klasse 1, nie über Schulterhöhe sägen, bei Spannungsholz die Schnittrichtung umkehren (Druckseite anschneiden, Zugseite trennen). Wir liefern die Säge geprüft und scharf – das Sicherheitswissen liegt beim Bediener.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // LEITERN & GERÜSTE
    // Quellen: DGUV Information 201-011 (Leitern/Tritte),
    //   DGUV 201-029 (Gerüste), TRBS 2121 Teile 1+2,
    //   DIN EN 131 (Leitern, Pflicht-Stabilisator ab 3 m
    //   Anlegeleiterlänge), DIN EN 1004 (fahrbare
    //   Arbeitsgerüste, max. 8 m Plattformhöhe außen /
    //   12 m innen), BetrSichV § 14 (Prüfung).
    // -------------------------------------------------------------
    "leitern-gerueste": {
      faqs: [
        {
          question: "Leiter oder Fahrgerüst – wo liegt die rechtliche Grenze?",
          answer:
            "TRBS 2121 Teil 1 schreibt vor: Anlegeleitern dürfen als Arbeitsplatz nur bis 5 m Standhöhe und nur für kurze Arbeiten (Faustregel: bis 2 Stunden, geringer Kraftaufwand) verwendet werden. Über 5 m oder bei längeren Arbeiten ist ein Gerüst zwingend. Fahrgerüste nach EN 1004 sind in mehreren Höhenklassen verfügbar; sie bieten eine sichere Arbeitsplattform mit Geländer und sind die richtige Wahl für Anstrich, Putz, Trockenbau und Wartung. Wir führen am Standort Krefeld Anlegeleitern bis 7 m und Fahrgerüste bis 12 m Arbeitshöhe.",
        },
        {
          question: "Wie hoch darf ich mit einem Fahrgerüst arbeiten?",
          answer:
            "DIN EN 1004 begrenzt fahrbare Arbeitsgerüste auf 8 m Plattformhöhe im Freien und 12 m Plattformhöhe in Innenräumen (Standard-Lastklasse). Höhere Gerüste sind Standgerüste oder erfordern spezielle Statik-Nachweise. Bei Aufbau im Freien sind Verbreiterungen oder Ausleger bei höheren Aufbauten Pflicht, um die Standsicherheit gegen Windlasten zu gewährleisten. Die zulässige Aufbauhöhe inkl. Verbreiterungs-Vorgaben ist in der Aufbauanleitung jedes Gerüsts dokumentiert – wir übergeben sie mit dem Gerüst.",
        },
        {
          question: "Brauche ich für den Gerüstaufbau eine Qualifikation?",
          answer:
            "Für fahrbare Arbeitsgerüste nach EN 1004 verlangt TRBS 2121 Teil 2 keinen formalen Gerüstbau-Befähigungsschein, aber eine fachliche Eignung und Unterweisung – der Aufbau muss nach der Aufbau- und Verwendungsanleitung (AuV) erfolgen und kontrolliert werden. Für Standgerüste (System- und Stangengerüste) ist die Befähigung zum Gerüstbauer (Helfer plus Anleitung durch eine geeignete Person) Voraussetzung. Wir vermieten ausschließlich fahrbare Arbeitsgerüste mit klarer AuV; der Aufbau bleibt Sache des Mieters bzw. Arbeitgebers.",
        },
        {
          question: "Was hat sich mit der EN 131 (2018) bei Anlegeleitern geändert?",
          answer:
            "Seit der Überarbeitung der EN 131 sind Anlegeleitern ab 3 m Leiterlänge nur noch mit einer fußseitigen Verbreiterung (sogenannter Stabilisator) zulässig. Außerdem wird unterschieden zwischen Leitern für gewerbliche Nutzung (Kennzeichnung Professional) und für Heimwerker (Non-Professional) – im gewerblichen Einsatz ist die Verwendung von Heimwerker-Leitern nicht zulässig. Wir bevorraten am Standort Krefeld ausschließlich EN-131-konforme Profi-Leitern; die Konformitäts-Plakette ist sichtbar angebracht.",
        },
        {
          question: "Welche PSA gegen Absturz ist auf Gerüst oder Leiter Pflicht?",
          answer:
            "Auf Fahrgerüsten mit dreiteiligem Seitenschutz (Geländerholm, Zwischenholm, Bordbrett) ist eine PSAgA grundsätzlich nicht zwingend – die Plattform gilt als kollektiv gesicherter Arbeitsplatz. PSAgA wird Pflicht beim Auf- und Umbau oberhalb 3 m, wenn der Seitenschutz noch nicht montiert ist. Auf Leitern ist die Verwendung von PSAgA praktisch nicht möglich (kein geeigneter Anschlagpunkt). Konsequenz: Wenn auf der Leiter gearbeitet wird, muss die Standhöhe und Arbeitsdauer streng nach TRBS 2121 begrenzt werden – oder ein Gerüst eingesetzt werden.",
        },
        {
          question: "Wie weit muss eine Anlegeleiter angestellt werden?",
          answer:
            "DGUV Information 201-011 nennt als Faustregel: 1 : 4 (Anstellwinkel ca. 65–75°). Praktische Probe: Bediener stellt sich aufrecht mit den Füßen an die Leitersohle, streckt die Arme waagerecht aus – die Handflächen sollten gerade die Sprossen erreichen. Außerdem muss die Leiter mindestens 1 m über die Austrittsstelle (z. B. Dachrand) hinausragen, der Untergrund muss tragfähig und rutschsicher sein, und die Sprossen müssen waagerecht stehen. Bei nassem oder vereistem Boden ist Rutschsicherung Pflicht.",
        },
        {
          question: "Wer prüft Leitern und Gerüste – und wie oft?",
          answer:
            "Nach BetrSichV § 14 und DGUV Information 201-011/201-029 sind Leitern und Gerüste mindestens jährlich von einer befähigten Person zu prüfen (sichtbare Prüfplakette). Wir dokumentieren das für unseren Mietpark in Krefeld; das aktuelle Prüfprotokoll liegt der Maschine bei bzw. ist auf Anforderung verfügbar. Zusätzlich muss der Nutzer vor jeder Schicht eine Sicht- und Funktionsprüfung durchführen (Sprossen, Holme, Beschläge, Rollen, Seitenschutz). Mängel sofort melden – wir tauschen das Gerät kostenfrei.",
        },
        {
          question: "Treppengerüst, wenn die Aufstellfläche schräg ist?",
          answer:
            "Bei Aufstellung in Treppenhäusern oder auf abschüssigem Gelände gleicht ein Treppengerüst die Höhenunterschiede über höhenverstellbare Füße einer Seite aus. Standard-Fahrgerüste sind dafür nicht zugelassen, da die maximale Höhendifferenz der Spindelfüße schnell überschritten wird und die Standsicherheit kippt. Wir führen am Standort Krefeld Treppengerüste und beraten zur passenden Bauform – wichtig ist eine kurze Beschreibung der Treppe (Stufenhöhe, Stufentiefe, Breite).",
        },
        {
          question: "Was kostet eine Gerüst- oder Leiter-Miete in Krefeld?",
          answer:
            "Tagespreise sind je Modell hinterlegt. Wochenmiete entspricht ca. 5 Tagessätzen, Monatsmiete ca. 15. Fahrgerüste werden in der Praxis meist wochenweise gemietet – die Auf- und Abbauzeit lohnt sich erst ab mehreren Tagen Einsatz. Für lange Sanierungsprojekte kalkulieren wir auf Anfrage Sondertarife. Lieferung im Niederrhein-Liefergebiet ist optional buchbar.",
        },
        {
          question: "Darf ich ein Fahrgerüst mit Material auf der Plattform verfahren?",
          answer:
            "Nein. EN 1004 und TRBS 2121 Teil 2 untersagen das Verfahren des Gerüsts, wenn sich Personen oder loses Material auf der Plattform befinden. Vor jedem Umsetzen müssen Personen absteigen, lose Werkzeuge gesichert oder abgenommen werden, und der Fahrweg muss eben, tragfähig und hindernisfrei sein. Nach dem Umsetzen müssen die Rollen wieder festgestellt und ggf. die Spindelfüße neu nivelliert werden, bevor die Plattform betreten wird.",
        },
      ],
      expertSections: [
        {
          h3: "TRBS 2121: warum die Leiter heute strenger reguliert ist als das Gerüst",
          paragraphs: [
            "Die Technische Regel für Betriebssicherheit 2121 hat in ihrer aktuellen Fassung die Verwendung von Leitern als Arbeitsplatz deutlich eingeschränkt. Anlegeleitern und Stehleitern dürfen nur noch dann als Arbeitsplatz genutzt werden, wenn die Gefährdungsbeurteilung ergibt, dass andere Arbeitsmittel (Gerüst, Hubarbeitsbühne) wegen geringer Standhöhe (< 2 m) oder sehr kurzer Arbeitsdauer (< 2 Stunden) nicht verhältnismäßig sind. Über 5 m Standhöhe sind Leitern als Arbeitsplatz grundsätzlich nicht mehr zugelassen.",
            "Konsequenz für die Baustellen­praxis in Krefeld: Wer eine Fassade streicht, eine Dachrinne reinigt oder eine Klimaanlage in 4 m Höhe wartet, sollte sich gegen die Leiter und für ein Fahrgerüst entscheiden – nicht nur wegen der Sicherheit, sondern weil ein Unfallereignis bei Leitern-Nutzung über 3 m oder bei Arbeiten über 2 Stunden im gewerblichen Kontext fast immer als Verstoß gegen TRBS 2121 gewertet wird. Das Fahrgerüst kostet in der Miete unwesentlich mehr und löst diese rechtliche Frage komplett.",
          ],
        },
        {
          h3: "Fahrgerüste aufbauen: Auf- und Verwendungsanleitung sauber lesen",
          paragraphs: [
            "Jedes nach EN 1004 zertifizierte Fahrgerüst hat eine projektspezifische Auf- und Verwendungsanleitung (AuV). Sie regelt: maximale Aufbauhöhe je nach Aufstellort (Innen/Außen), Notwendigkeit von Verbreiterungen ab bestimmter Höhe, Position der Ballastgewichte, Vorgehen bei Wind > 6 Bft (Abbau-Pflicht), Lastklasse der Plattform (typisch Klasse 3 = 200 kg/m²).",
            "Der häufigste Aufbau-Fehler ist das Weglassen der Diagonalstreben oder der Verbreiterungen, weil die Plattform nur kurz gebraucht wird. Beides ist konstruktiv vorgesehen und nicht optional – ohne Diagonale verliert das Gerüst sofort die Längs-Steifigkeit, ohne Verbreiterung bei Aufbau ab ca. 6 m im Freien die Kippsicherheit. Wir geben jedem Mietgerüst die AuV mit; bei Erstmietern erklären wir den Aufbau am Standort Krefeld vor Abholung Schritt für Schritt.",
          ],
        },
        {
          h3: "Anlegeleiter richtig stellen: 1 : 4, Sicht, Überstand, Rutschsicherung",
          paragraphs: [
            "Vier Fehler dominieren bei Anlegeleiter-Unfällen: falscher Anstellwinkel (zu steil rutscht der Fuß weg, zu flach kippt die Leiter), fehlender Überstand über die Austrittsstelle (kein sicheres Übersteigen), nasser/glatter Untergrund ohne Sicherung, sowie Stellung vor Türen, die jederzeit aufschlagen können.",
            "Korrekt: Anstellwinkel 65–75° (1 : 4, also bei 4 m Leiterhöhe steht der Fuß 1 m von der Wand weg), Überstand am Dach- oder Geländeraustritt mindestens 1 m, Untergrund tragfähig und sauber, bei Glätte mit Bohlen oder Anti-Rutsch-Matten gesichert, bei Türen mit Warnposten oder verschlossen. EN 131-Profi-Leitern haben heute serienmäßig einen fußseitigen Stabilisator ab 3 m Länge – er ist Pflicht und darf nicht entfernt werden.",
          ],
        },
        {
          h3: "Höhenrettung: warum schon ab 3 m ein Notfall-Konzept gebraucht wird",
          paragraphs: [
            "Die BetrSichV verlangt für Arbeitsplätze mit Absturzgefahr ab 3 m Höhe eine Höhenrettungs-Vorhaltung. Das ist nicht zwingend ein Rettungs-Geschirr im Sinne der Feuerwehr – ausreichend ist meist die Verfügbarkeit einer geeigneten Rettungsmaßnahme (PSAgA-System mit Rettungsabseilen, Hubarbeitsbühne im Standby, sofort erreichbare Feuerwehr im urbanen Krefelder Umfeld).",
            "Für die Praxis im Mietkontext bedeutet das: Wer auf einem Fahrgerüst arbeitet, hat über den dreiteiligen Seitenschutz einen kollektiven Schutz – das Höhenrettungs-Konzept reduziert sich auf den Verfahrweg und den Auf- und Abbau. Wer hingegen mit PSAgA arbeitet (Dacharbeit, Industrie), braucht zwingend ein Rettungskonzept inkl. eingewiesener Helfer – sonst verstößt der Arbeitgeber gegen § 6 ArbSchG. Wir liefern die Geräte; das Rettungskonzept liegt beim Arbeitgeber.",
          ],
        },
        {
          h3: "Material, Korrosion, Holz vs. Aluminium: was hält wirklich",
          paragraphs: [
            "Aluminium-Leitern und -Gerüste sind heute Standard – leicht, korrosionsbeständig, lange Lebensdauer. Holz-Leitern (Sprossenleiter aus Esche oder Akazie) kommen noch in der Elektrotechnik vor, weil Holz nicht leitet – wir halten am Standort Krefeld auf Anfrage Holzleitern für Arbeiten in der Nähe spannungsführender Anlagen vor.",
            "Aluminium ist nicht spannungsfrei – jede Leiter, jedes Gerüst aus Alu muss bei Arbeiten im Bereich freier Leiter oder Oberleitung mit Schutzabstand zur Spannung verwendet werden (DGUV Vorschrift 3, Tabelle 1: 1 m bei Niederspannung, 3 m bei Mittelspannung, 4 m bei Hochspannung bis 110 kV). Im Niederrhein-Umfeld betrifft das vor allem Bahn-Oberleitungen (Westbahnstrecke, Krefelder Hauptbahnhof) und Hochspannungs-Freileitungen – hier ist vorab die Spannungsfreiheit beim Netzbetreiber zu erfragen.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // HEIZUNG & TROCKNUNG
    // Quellen: WTA-Merkblatt 6-2 (Bauteiltrocknung),
    //   DGUV Information 213-056 (CO-Gefahren mobiler
    //   Gas-/Verbrennungs-Heizungen), TRGI 2018 (mobile
    //   Gasheizgeräte), DIN VDE 0100-704 (Baustellen-
    //   Stromversorgung mit RCD), DIN EN 16798-1 (Innen-
    //   raumluftqualität, rel. Feuchte), CM-Methode (Estrich-
    //   Belegreife: Zement-Estrich ≤ 2,0 CM-% unbeheizt /
    //   ≤ 1,8 CM-% beheizt; Anhydrit-Estrich ≤ 0,5 / 0,3 CM-%).
    // -------------------------------------------------------------
    "heizung-trocknung": {
      faqs: [
        {
          question: "Wasserschaden – wie viele Bautrockner brauche ich für welchen Raum?",
          answer:
            "Faustregel nach WTA: Pro 30–50 m³ Raumvolumen ein Kondenstrockner mittlerer Leistung (ca. 30–50 l/24h Entzugsleistung). Bei stark durchfeuchtetem Estrich und Wänden lohnt der Einsatz eines Adsorptionstrockners, der auch unter 5 °C arbeitet. Trocknungsdauer: rohe Wandtrocknung 2–4 Wochen, Estrichtrocknung über Dämmschicht 4–8 Wochen. Den Trocknungsfortschritt kontrolliert man mit einem CM-Feuchtemessgerät – wir vermieten am Standort Krefeld Trockner-Sets samt Hygrometer.",
        },
        {
          question: "Kondenstrockner oder Adsorptionstrockner – wann was?",
          answer:
            "Kondenstrockner arbeiten am wirtschaftlichsten zwischen 15 und 30 °C bei relativer Feuchte > 40 % – die Standardlösung nach Wasserschäden in geheizten Räumen. Adsorptionstrockner (Silikagel- oder Zeolith-Trockner) arbeiten auch bei 5 °C oder darunter und bei niedriger Feuchte; sie sind die richtige Wahl in unbeheizten Rohbauten, Kellern und in der Schlussphase einer Trocknung. Wir bevorraten beide Bauformen am Hauptsitz Krefeld.",
        },
        {
          question: "Wann brauche ich Estrich-Dämmschicht-Trocknung mit Druck oder Vakuum?",
          answer:
            "Wenn Wasser unter den Estrich (in die Dämmschicht) eingedrungen ist, reicht reine Raumluft-Trocknung nicht – die Dämmung trocknet nur extrem langsam ab. Standard ist dann das Druck- oder Vakuum-Verfahren: Über Kernbohrungen wird Trocknungs-Luft in die Dämmschicht gepresst oder feuchte Luft abgesaugt. Wir vermieten passende Seitenkanalverdichter, Vakuumpumpen, HEPA-Filter und Schläuche; die Kernbohrungen werden vom Sanierer oder per Mietkernbohrer aus unserer Werkzeug-Kategorie erstellt.",
        },
        {
          question: "Welche Stromversorgung braucht ein Heizgebläse oder Bautrockner?",
          answer:
            "Kondenstrockner (typ. 800–1.500 W) laufen an einer regulären Schuko-Steckdose. Adsorptionstrockner (1,5–4 kW) brauchen je nach Leistung 230 V/16 A oder bereits eine CEE-16-A-Versorgung. Elektro-Heizlüfter ab 5 kW und Wärmepumpen-Trockner laufen über CEE 16 A oder CEE 32 A (400 V). Diesel-Heizgebläse brauchen nur eine 230-V-Speisung für Brenner und Gebläse (geringer Verbrauch). Auf Baustellen ist die Einspeisung über einen Baustromverteiler mit 30-mA-RCD nach DIN VDE 0100-704 Pflicht.",
        },
        {
          question: "Gasheizer in Innenräumen – was ist erlaubt?",
          answer:
            "Direktbefeuerte Gasheizer (Propan) sind in geschlossenen Räumen nur erlaubt, wenn ausreichende Verbrennungsluft-Zufuhr und Abluft sichergestellt sind (TRGI 2018, DGUV Information 213-056). Die Abgase enthalten CO, CO₂ und Wasserdampf – ohne Frischluftzufuhr besteht akute Lebensgefahr durch CO-Vergiftung. Sicherer ist die Aufstellung der Gasheizung außerhalb mit Warmluft-Schlauch nach innen (indirekt befeuert) oder der Einsatz von Diesel-Indirektheizern mit Abgasführung ins Freie. Wir empfehlen bei jedem Innenraum-Einsatz CO-Warner mit – Standard bei jeder gewerblichen Bautrocknung.",
        },
        {
          question: "Wieviel Diesel, Strom oder Gas verbraucht ein Heizgebläse?",
          answer:
            "Faustwerte je 10 kW Heizleistung: Diesel ca. 1 l/h; Strom 10 kWh/h; Propan ca. 0,8 kg/h. Für eine 100-kW-Halle bedeutet das: 10 l Diesel pro Stunde – ein 200-l-Tank reicht knapp einen Tag. Eine elektrische Lösung in der gleichen Größenklasse braucht 100 kWh/h, was eine entsprechende Netz-Anschlussleistung voraussetzt. Im Wintereinsatz auf Rohbau-Baustellen am Niederrhein ist Diesel-Indirekt-Heizung deshalb fast immer wirtschaftlicher als Elektro.",
        },
        {
          question: "Wie warm darf bzw. soll ich beim Trocknen heizen?",
          answer:
            "Die Trocknungsgeschwindigkeit steigt mit der Temperatur, da warme Luft mehr Feuchte aufnimmt. WTA empfiehlt 18–25 °C bei Kondens-Trocknern (höhere Temperatur überfordert das Gerät – Vereisung bzw. Abschaltung). Adsorptionstrockner arbeiten auch unter 10 °C. Bei beheizten Räumen mit Wandfliesen, Tapeten oder empfindlichen Bauteilen sollte die Temperatur nicht über 30 °C steigen, sonst entstehen Spannungsrisse. Wir geben mit jedem Trockner eine Bedienungsanleitung mit konkreter Empfehlung pro Gerät.",
        },
        {
          question: "Was kostet eine Trocknungs-Aktion in Krefeld – und übernimmt die Versicherung das?",
          answer:
            "Tagespreise je Gerät tagesaktuell im Buchungsprozess; bei längeren Trocknungen (typisch 14–28 Tage) sind Wochen- und Monatsmieten deutlich günstiger. Wasserschäden werden in der Regel von der Wohngebäude- bzw. Hausratversicherung übernommen – die Versicherer haben mit den meisten Sanierungsfirmen Direktabrechnung. Wenn du selbst sanierst, lass den Mietvertrag und die Strom-Messprotokolle aufheben; viele Versicherer erstatten die Mietkosten direkt auf Vorlage des Vertrags.",
        },
        {
          question: "Wie sicher ist der Stromverbrauch eines Trockners im Wohnhaus?",
          answer:
            "Wir bauen in jeden Mietvorgang einen kalibrierten Stromzähler ein (Hutschienen- oder Steckdosen-Zähler). So lässt sich der Stromverbrauch sauber dokumentieren und der Versicherung in Rechnung stellen. Faustwert: Ein Kondenstrockner mit 1 kW läuft 14 Tage = 336 Stunden = ca. 250 kWh (Trockner laufen nicht durchgehend, weil sie über Hygrostat geregelt sind). Bei 0,35 €/kWh Hausstrompreis entspricht das ca. 90 € – fast immer ein erstattungsfähiger Posten.",
        },
        {
          question: "Wie laut sind Bautrockner – kann ich nachts schlafen?",
          answer:
            "Kondenstrockner liegen typisch bei 50–60 dB(A) in 1 m Abstand – vergleichbar mit einer Spülmaschine. In Schlafräumen empfehlen wir, das Gerät in einen Nebenraum zu stellen (offene Tür; den Türritz mit Handtuch verschließen verbietet sich – die Luft muss zirkulieren). Adsorptionstrockner sind ähnlich laut, Heizgebläse deutlich lauter (70–85 dB(A)). Im Wohngebiet gilt nachts der TA-Lärm-Richtwert 40 dB(A) am offenen Fenster der Nachbarn – Heizgebläse im Außenbereich nachts in Wohngebieten sind faktisch nicht zulässig.",
        },
      ],
      expertSections: [
        {
          h3: "Bauteilfeuchte verstehen: wann ist trocken wirklich trocken?",
          paragraphs: [
            "Bauteile haben eine charakteristische Ausgleichsfeuchte, die zur Raumluft passt. Zement-Estrich gilt nach Calciumcarbid-Methode (CM) als belegreif bei ≤ 2,0 CM-% (unbeheizt) bzw. ≤ 1,8 CM-% (beheizt) – das entspricht ca. 4,5–5 Gew.-% Wassergehalt. Anhydrit-Estrich darf maximal 0,5 CM-% (unbeheizt) bzw. 0,3 CM-% (beheizt) haben. Holz: Möbel-Trockenholz 9–12 Gew.-%, frisches Schnittholz bis 80 %. Mauerwerk: Faustregel 5 Vol.-% rel. Feuchte (Darrgewicht-Methode).",
            "Diese Messwerte sind die einzige verlässliche Belegreife-Aussage – die rein subjektive Einschätzung täuscht regelmäßig, weil die Oberfläche zuerst abtrocknet, das Bauteil aber innen noch Wasser führt. Wir vermieten in Krefeld neben Trocknern auch CM-Messgeräte und Holzfeuchte-Messer; ohne Messung keine Belegreife.",
          ],
        },
        {
          h3: "Strom, Diesel, Gas: die Heizart entscheidet die Kosten",
          paragraphs: [
            "Im Rohbau-Wintereinsatz auf der Krefelder Baustelle stellt sich oft die Frage nach der wirtschaftlichsten Wärmequelle. Strom ist die einfachste, aber teuerste Lösung – 0,30–0,40 €/kWh netto. Diesel-Indirekt-Heizung liegt bei ca. 0,11 €/kWh (Heizöl-Äquivalent), Propan-Gas bei 0,12 €/kWh – beide brauchen aber Abgasführung bzw. Aufstellung außerhalb des Trocknungs-Raums.",
            "Praxis-Faustregel: Räume bis 30 m³ und kurze Einsätze (Tage) ⇒ Elektro-Heizgebläse oder Kondenstrockner; Hallen, Rohbauten und mehrwöchige Trocknung ⇒ Diesel-Indirektheizung. Für Innenausbau-Baustellen mit empfindlichen Materialien und hohen Anforderungen an saubere Luft empfehlen wir Wärmepumpentrockner – sie kombinieren Trocknung und milde Heizung in einem Gerät und sind elektrisch genügsam.",
          ],
        },
        {
          h3: "Estrich-Dämmschicht-Trocknung: warum Druck- oder Vakuum-Verfahren oft Pflicht ist",
          paragraphs: [
            "Bei eingedrungener Feuchte in die Estrich-Dämmschicht (Mineralwolle, PUR/PIR, EPS) reicht reine Raumlufttrocknung nicht – die Feuchte sitzt unter einer dampfsperrigen Schicht und kommt nur sehr langsam an die Oberfläche. Standardvorgehen: Über Kernbohrungen (typisch 30–50 mm, Abstände 1,5–2 m) wird mit Seitenkanalverdichtern getrocknete Luft in die Dämmschicht gepresst (Druck-Verfahren) oder feuchte Luft abgesaugt (Vakuum-Verfahren, sauberer im Wohnbau).",
            "Beim Vakuum-Verfahren ist ein HEPA-Filter zwingend, weil ggf. Schimmelsporen und Mineralfaser-Stäube mit ausgetragen werden. Wir liefern in Krefeld komplette Sets aus Seitenkanalverdichter, HEPA-Filter, Schläuchen, Bohrlochrosetten und Kondensatabscheidern. Vor Beginn muss die Bohrlokation auf elektrische Heizleitungen geprüft werden – Wärmebildkamera oder Bestandsplan.",
          ],
        },
        {
          h3: "CO-Gefahr: warum Gasheizungen im Innenraum strikt zu sichern sind",
          paragraphs: [
            "Direktbefeuerte Gasheizer setzen pro kg verbranntem Propan ca. 1,6 kg Wasser, 3 kg CO₂ und – bei unvollständiger Verbrennung – signifikante Mengen CO frei. CO ist geruchlos, blockiert die Sauerstoffaufnahme im Blut und ist bei Konzentrationen ab ca. 400 ppm akut tödlich. DGUV Information 213-056 fordert deshalb beim Einsatz von Gas-, Diesel- und Holzkohle-Verbrennungs­geräten in geschlossenen Räumen zwingend CO-Warner und ausreichende Frischluftzufuhr.",
            "Sicherer Standardweg: indirekt befeuerte Heizgebläse (Brennraum außerhalb des Aufenthaltsraums, Wärmetauscher, Abgas ins Freie) oder reine Elektro-Heizung. In Krefelder Wintereinsätzen empfehlen wir grundsätzlich indirekt befeuerte Diesel-Heizgebläse – sie sind wirtschaftlich, sicher und für Hallen, Rohbauten und Baustellen-Trocknung die erprobte Standardlösung.",
          ],
        },
        {
          h3: "Trocknung mit System: Messen, Heizen, Lüften, Dokumentieren",
          paragraphs: [
            "Wirksame Bauteiltrocknung folgt einem viertaktigen Ablauf: (1) Schadensbild aufnehmen – wo steht Wasser, welche Bauteile sind betroffen, wie weit hat es sich verteilt? (2) Trockner und Heizung dimensionieren – Raumvolumen, Schadensumfang, Außentemperatur. (3) Trocknung mit Hygrostat-Steuerung und regelmäßiger Kontrolle der CM-Werte (alle 7 Tage). (4) Dokumentation aller Mess- und Verbrauchswerte für die Versicherung.",
            "Wir vermieten in Krefeld komplette Trocknungs-Pakete: Trockner, Heizgebläse, Hygro-Datenlogger, CM-Messgerät, Strom-Subzähler und Schläuche/Filter. Für gewerbliche Trocknungsbetriebe bieten wir auf Anfrage Rahmenmieten mit Bevorzugungsverfügbarkeit – das ist im Winter (Heizungsausfall-Saison Januar–März) regelmäßig der Engpass.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // ABSPERR- & VERKEHRSTECHNIK
    // Quellen: StVO § 45 Abs. 6 (verkehrsrechtliche Anordnung),
    //   RSA 21 (Richtlinien für die Sicherung von Arbeitsstellen
    //   an Straßen, Regelpläne A–D), DIN EN 12352 (Warnleuchten
    //   TL 1/2/7/8/9), DIN EN 13422 (mobile vertikale
    //   Verkehrszeichen – Stand-/Windsicherheit), StVZO § 53.
    //   Stadt Krefeld: Halteverbots-Aufstellung in der Regel
    //   mind. 72 h vor Geltungsbeginn; verkehrsrechtliche
    //   Anordnung beim Fachbereich Tiefbau/Verkehr.
    // -------------------------------------------------------------
    absperrtechnik: {
      faqs: [
        {
          question: "Wie melde ich ein Halteverbot in Krefeld an?",
          answer:
            "Im öffentlichen Verkehrsraum (Straße, Bürgersteig, Parkstreifen) brauchst du eine verkehrsrechtliche Anordnung nach StVO § 45 Abs. 6, ausgestellt vom Fachbereich Tiefbau bzw. der Straßenverkehrsbehörde der Stadt Krefeld. Der Antrag erfolgt online oder schriftlich, typische Bearbeitungszeit 7–14 Tage. Die Schilder müssen mindestens 72 Stunden vor Geltungsbeginn aufgestellt werden (sonst ist das parkende Fahrzeug nicht abschleppbar). Wir vermieten Halteverbotsschilder als Set inkl. Fußplatte und übernehmen auf Wunsch Antrag, Aufstellung und Abbau als Komplettpaket nach Aufwand.",
        },
        {
          question: "Reicht ein Halteverbot, oder brauche ich auch eine RSA-konforme Absicherung?",
          answer:
            "Sobald in den Verkehrsraum eingegriffen wird (Spurverengung, Bürgersteig­sperrung, Halbsperrung der Fahrbahn), reicht das Halteverbotsschild nicht – die RSA 21 verlangt einen geprüften Regelplan (A–D je nach Straßenklasse und Eingriff) mit konkreter Anordnung von Vorwarnung, Verengung, Leitbaken, Warnleuchten und Absperrung. Die Genehmigung erteilt die Straßenverkehrsbehörde, oft mit Auflage einer fachkundigen Aufsicht (AS-Kurs Arbeitsstellen an Straßen). Wir vermieten alle RSA-Komponenten und vermitteln auf Anfrage Aufstellbetriebe mit AS-Schein.",
        },
        {
          question: "Welche Warnleuchten muss ich abends und nachts setzen?",
          answer:
            "DIN EN 12352 unterscheidet Warnleuchten nach Typ: TL 1 (Dauerlicht, geringe Intensität) als Markierungsleuchte, TL 2 (blinkend, mittlere Intensität) zur Hindernis-Warnung, TL 7/8 (hohe Intensität, gerichtet) zur Vorwarnung im Hauptverkehr. Auf innerörtlichen Baustellen mit geringer Geschwindigkeit reicht meist TL 2 gelb-blinkend; auf Hauptstraßen und Bundesstraßen sind höhere Klassen Pflicht. Die RSA gibt den Mindest-Typ je Regelplan vor. Wir bevorraten am Standort Krefeld TL-Warnleuchten als Akku-LED-Variante mit langer Laufzeit.",
        },
        {
          question: "Brauche ich eine mobile Ampelanlage, oder reichen Baken?",
          answer:
            "Bei Halbsperrung einer Straße über mehr als 50 m Länge ist nach RSA in der Regel eine mobile Lichtsignalanlage (LSA) Pflicht – bei kurzer Strecke kann auch eine Posten-Regelung oder eine Vorrang-Beschilderung (Z. 308 \"Vorrang vor Gegenverkehr\") genehmigt werden. Welche Lösung möglich ist, regelt die verkehrsrechtliche Anordnung. Wir vermieten mobile Ampelanlagen mit Akku- und Solar-Versorgung in Krefeld inkl. Auf- und Abbau auf Wunsch.",
        },
        {
          question: "Wieviel Wind hält ein Verkehrsschild auf Fußplatte aus?",
          answer:
            "DIN EN 13422 fordert für mobile Verkehrszeichen eine Standsicherheit gegen Windlasten entsprechend der Windlastzone. Standard-Fußplatten 15 kg sichern Schilder bis ca. 100 km/h Wind in geschützter Lage; auf freier Strecke oder bei Schildgrößen über 600 mm sind 25 kg Fußplatten oder Doppel-Beschwerung Pflicht. Auf Brücken und exponierten Lagen können Ballast-Schwellen oder Verankerung nötig sein. Wir geben am Standort Krefeld zu jedem Schild die passende Beschwerung mit.",
        },
        {
          question: "Wer haftet, wenn jemand über einen Leitkegel fährt oder gegen ein Absperrgitter läuft?",
          answer:
            "Grundsätzlich haftet der Verantwortliche der Verkehrssicherung – das ist die natürliche oder juristische Person, die in der verkehrsrechtlichen Anordnung als Verantwortlicher für die Arbeitsstelle benannt ist. Diese Person muss die RSA-Konformität sicherstellen und während der gesamten Geltungsdauer Sicht-/Funktionsprüfungen durchführen (Schilder umgefallen? Warnleuchten erloschen? Absperrgitter verschoben?). Wir vermieten Material; die Verantwortung trägt der Auftraggeber bzw. die ausführende Firma.",
        },
        {
          question: "Veranstaltung in Krefeld absichern – was bietet ihr für Straßenfeste, Märkte, Marathons?",
          answer:
            "Für temporäre Veranstaltungs-Absperrungen bieten wir Mojo- und Crowd-Control-Gitter (typ. 2,5 m × 1,1 m, verzinkt), Fußplatten-Schilder, Leitbaken, mobile Ampelanlagen und TL-Warnleuchten. Größere Veranstaltungen (Marathon, Karnevalszug) brauchen zusätzlich Sperr-Pakete mit hunderten Gittern und Logistik vor Ort – das kalkulieren wir am Hauptsitz Krefeld nach Veranstaltungsplan und Strecke individuell.",
        },
        {
          question: "Wie schnell kann ich Halteverbot, Baken und Leitkegel in Krefeld bekommen?",
          answer:
            "Bei verfügbarem Material und einfacher Selbstabholung sind Halteverbots-Sets und Standard-Absperr-Material am Standort Krefeld in der Regel taggleich verfügbar (Mo–Fr 08:00–18:00, Sa 10:00–14:30). Für die verkehrsrechtliche Anordnung der Stadt Krefeld musst du jedoch mit 7–14 Tagen Vorlauf rechnen. Bei Komplett-Auftrag (Antrag + Material + Aufstellung) ist die Genehmigung der Engpass; wir empfehlen 3 Wochen Vorlauf.",
        },
        {
          question: "Was kostet ein Halteverbotsschild-Set in Krefeld?",
          answer:
            "Das Halteverbotsschild-Set (2 Schilder Z. 283 + Zusatzschilder + Fußplatten) ist im Buchungsprozess mit tagesaktuellem Preis hinterlegt. Komplettpakete inkl. verkehrsrechtlicher Anordnung, Aufstellung 72 h vorab und Abbau kalkulieren wir nach Aufwand – telefonische Anfrage am Standort Krefeld. Faustregel: Eine vollständige Halteverbots-Aktion ist preislich deutlich günstiger als das Abschleppen eines Falschparkers am Umzugstag.",
        },
        {
          question: "Brauche ich beim Aufstellen der Schilder Warnschutzkleidung?",
          answer:
            "Ja. Sobald im Verkehrsraum gearbeitet wird, ist Warnschutz Klasse 2 nach EN ISO 20471 Pflicht (innerorts), auf Hauptstraßen und außerorts Klasse 3. Helm ist auf Arbeitsstellen mit Absturz- oder Anprallgefahr Pflicht. Die persönliche Schutzausrüstung muss der Aufsteller bzw. dessen Arbeitgeber stellen – wir vermieten ausschließlich das Verkehrssicherungs-Material.",
        },
      ],
      expertSections: [
        {
          h3: "RSA 21 verstehen: Regelpläne sind keine Empfehlung, sondern Vorschrift",
          paragraphs: [
            "Die Richtlinien für die Sicherung von Arbeitsstellen an Straßen (RSA 21, in NRW eingeführt) sind das verbindliche Regelwerk für jede Verkehrssicherung im öffentlichen Verkehrsraum. Sie unterscheiden vier Hauptkategorien: Innerörtliche Straßen (Teil A), Außerorts auf Landstraßen (Teil B), Autobahnen und ähnlich ausgebaute Straßen (Teil C), Sonderbauformen (Teil D). Für jede Kategorie gibt es Regelpläne (z. B. A I/8 – halbseitige Sperrung innerorts) mit konkreter Vorgabe zu Schildern, Leitkegeln, Warnleuchten und mobilen Ampeln.",
            "Die Straßenverkehrsbehörde der Stadt Krefeld prüft jede Anordnung gegen die RSA und entscheidet, welcher Regelplan zum Eingriff passt. Vom Aufsteller wird verlangt, dass das Material dem Regelplan entspricht, korrekt platziert ist und während der gesamten Geltungsdauer funktionsfähig bleibt. Bei Großbaustellen ist ein verkehrsrechtlich Verantwortlicher mit AS-Schein (Arbeitsstellen an Straßen) Pflicht.",
          ],
        },
        {
          h3: "Halteverbot in Krefeld: vom Antrag bis zum Abschleppen",
          paragraphs: [
            "Wer in Krefeld eine Umzugs- oder Bauzonen-Parkfläche braucht, durchläuft folgenden Ablauf: (1) Antrag auf verkehrsrechtliche Anordnung bei der Stadt Krefeld (Fachbereich Verkehr) – online oder schriftlich, mit Skizze und Zeitfenster, Bearbeitungszeit 7–14 Tage. (2) Genehmigung mit konkreter Anordnung zur Beschilderung (Anzahl, Position, Geltungszeit). (3) Aufstellung der Schilder mindestens 72 Stunden vor Geltungsbeginn – früher ist erlaubt, später macht das Abschleppen rechtlich angreifbar.",
            "Im Geltungszeitraum dürfen falsch parkende Fahrzeuge umgesetzt oder abgeschleppt werden – die Stadt Krefeld beauftragt einen ihrer Vertrags-Abschleppdienste. Der Auftraggeber des Halteverbots muss in der Regel das Abschleppen telefonisch beim städtischen Verkehrsaußendienst auslösen. Wir vermieten in Krefeld passende Schilder-Sets; auf Wunsch übernehmen wir auch Antrag, Aufstellung und Abbau als Komplettpaket.",
          ],
        },
        {
          h3: "Warnleuchten und Beleuchtung: warum die Wahl der TL-Klasse wichtig ist",
          paragraphs: [
            "DIN EN 12352 klassifiziert Warnleuchten nach Lichtstärke und Funktion: L1 (Dauerlicht zur Markierung von Verkehrseinrichtungen), L2 (Blinklicht, gelb, mittlere Intensität – Standard auf innerörtlichen Baustellen), L7/L8 (gerichtetes, hochintensives Blinklicht für Hauptverkehrsstraßen und Autobahnen), L9 (Lauflicht-Pfeilanzeige für Spurverengungen). Der Regelplan der RSA gibt den Mindest-Typ pro Verkehrssituation vor.",
            "Akku-LED-Warnleuchten haben Dauer­leuchtzeiten von 100–400 Stunden und sind heute der Standard – Kerzen- und Gaslampen sind seit Langem unzulässig. Wir bevorraten am Standort Krefeld TL2- und TL7/8-Leuchten mit großem Akku-Pufferspeicher; bei mehrwöchigen Baustellen lohnt die Solar-Variante.",
          ],
        },
        {
          h3: "Stand- und Windsicherheit: warum Fußplatten kein Detail sind",
          paragraphs: [
            "DIN EN 13422 prüft mobile Verkehrszeichen unter definiertem Windkanal – ein Schild 800 × 800 mm auf 15 kg Fußplatte ist für Windlastzonen 1–2 in geschützter Lage zugelassen, in Zone 4 oder auf Brücken nicht ausreichend. Krefeld liegt in Windlastzone 1; in der Innenstadt mit Bebauung um die Schilder herum reichen 15-kg-Platten meist. Auf der Rheinbrücke Uerdingen, auf Krefelder Autobahnzubringern oder bei Schildgrößen ab 900 × 900 mm sind 25-kg-Platten oder Doppel-Beschwerung Pflicht.",
            "Umgestoßene Schilder sind nicht nur eine Sicherheits­frage, sondern Versicherungs- und Haftungsfrage: Wer im öffentlichen Verkehrsraum ein Schild aufstellt, ist für dessen ordnungsgemäßen Stand verantwortlich – auch nachts, auch bei Wind, auch wenn ein Fahrzeug es umfährt. Mehrfach-tägliche Sichtkontrolle ist im Regelplan oft Auflage. Wir liefern auf Wunsch die richtige Fußplatten-Konfiguration zum konkreten Aufstellort.",
          ],
        },
        {
          h3: "Veranstaltungs-Absperrung in Krefeld: vom Gitter-Set zur Strecken-Logistik",
          paragraphs: [
            "Veranstaltungs-Absperrung unterscheidet sich von Baustellen-Absperrung: Hier geht es um Crowd-Control (Trennung von Zuschauern und Akteuren), Notfall-Fluchtwege (Versammlungsstättenverordnung) und Verkehrslenkung um die Veranstaltung herum. Standard-Komponenten: Mojo-Barrieren (2,5 m × 1,1 m, ineinander gehängt), Bauzaun-Felder mit Vlies-Sichtschutz, Leitbaken zur Verkehrslenkung, Notfall-Tore.",
            "Für Krefelder Großveranstaltungen kalkulieren wir vom Hauptsitz aus Material und Logistik. Wichtig: die Streckenlogistik (Anlieferung, Aufbau in Zeitfenstern, Abbau direkt nach Veranstaltungsende) ist meist aufwändiger als das Material selbst. Wir beraten am Standort Krefeld telefonisch nach Streckenplan – Vorlauf 4–6 Wochen ist für mittlere und große Veranstaltungen sinnvoll.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // NUTZFAHRZEUGE (Transporter 3,5 t mit Plane, Koffer,
    //   Pritsche, Möbelkoffer)
    // Quellen: StVZO § 32/§ 34 (Maße, Achs-/Gesamtlasten),
    //   FeV Anlage 9 (Klasse B bis 3.500 kg zGG, B96 4.250 kg,
    //   BE 7.000 kg, C1 ab 3.501 kg), StVO § 22 (Ladungs-
    //   sicherung) i. V. m. VDI 2700, EU-Verordnung 561/2006
    //   (Lenk-/Ruhezeiten ab 3,5 t gewerblich), Umweltzonen
    //   in NRW: grüne Plakette für Krefeld, Düsseldorf, Köln,
    //   Bonn und das Ruhrgebiet.
    // -------------------------------------------------------------
    nutzfahrzeuge: {
      faqs: [
        {
          question: "Welcher Transporter ist der richtige – Kasten, Pritsche, Plane, Koffer?",
          answer:
            "Faustregel nach Ladung: Möbel und sperrige Güter ⇒ Kasten mit Mittel- oder Hochdach. Lange Profile, Holz, Baumaterial ⇒ Pritsche mit Plane (Be- und Entladung von drei Seiten, Länge bis 4,3 m). Witterungsempfindliche Ware in genormten Mengen ⇒ Koffer (Kistenladung, Treppensteig-Rolli möglich). Möbel- bzw. Umzugs-Transport ⇒ Möbelkoffer mit Hebebühne. Wir führen am Standort Krefeld alle Bauformen in 3,5-t-Klasse mit Führerschein B.",
        },
        {
          question: "Was darf ich mit Führerschein B fahren?",
          answer:
            "Klasse B berechtigt zum Führen von Kraftfahrzeugen bis 3.500 kg zulässige Gesamtmasse (zGG) mit bis zu 9 Sitzplätzen einschließlich Fahrer. Zugkombinationen mit Anhänger sind bis 3.500 kg zGG (Zugfahrzeug + Anhänger) zulässig; mit B96 bis 4.250 kg, mit BE bis 7.000 kg. Alle unsere 3,5-t-Mietfahrzeuge fallen unter Klasse B. Sobald das Mietfahrzeug ein zGG über 3.500 kg hat (7,5-Tonner), ist Klasse C1 erforderlich – die wir vor Übergabe prüfen.",
        },
        {
          question: "Welche Umweltplakette haben eure Transporter – darf ich in Innenstädte?",
          answer:
            "Unsere 3,5-t-Mietflotte erfüllt mindestens Schadstoffklasse 6 (Euro 6) und trägt die grüne Umweltplakette – damit ist die Einfahrt in alle Umweltzonen in NRW (Krefeld, Düsseldorf, Köln, Bonn, Ruhrgebiet) zulässig. Diesel-Fahrverbote für ältere Klassen (Euro 4/5) gelten in einzelnen Großstädten – mit unseren Mietfahrzeugen bist du davon nicht betroffen. Bei Umzügen in Hamburger, Berliner oder Stuttgarter Umweltzonen gelten teils strengere Auflagen; bitte vor Anmietung Zielort prüfen.",
        },
        {
          question: "Welche Ladungssicherung ist beim Transporter Pflicht?",
          answer:
            "StVO § 22 und VDI 2700 fordern, dass die Ladung nicht verrutschen, umfallen, hin- und herrollen, herabfallen oder vermeidbaren Lärm erzeugen kann. Praktische Umsetzung: Zurrgurte mit ausreichender LC (Lashing Capacity – steht auf jedem Gurt-Label, typisch 1.500 daN bzw. 2.500 daN), Anti-Rutsch-Matten zur Reibungserhöhung (μ = 0,6 nach vorne), formschlüssige Verladung (Stirnwand-Stütze, Ladestäbe). Wir geben mit jedem Fahrzeug ausreichend Zurrgurte und Antirutsch-Matten mit. Bei Kontrollen durch die Polizei oder das BAG sind nicht gesicherte Ladungen ein Bußgeld-Tatbestand.",
        },
        {
          question: "Wie viel Höhe und Länge messen eure Transporter?",
          answer:
            "Standard-Kasten L2H2 (mittellang, mittelhoch): ca. 5,4 m × 2,0 m × 2,5 m (L × B × H), Laderaum ca. 3,2 m × 1,7 m × 1,8 m. L3H2 (lang, mittel): ca. 5,9 m × 2,0 m × 2,5 m, Laderaum ca. 3,7 m × 1,8 m. Möbelkoffer 3,5 t: ca. 7,0 m × 2,3 m × 3,2 m, Laderaum ca. 4,3 m × 2,1 m × 2,2 m. Die genauen Maße jedes Fahrzeugs stehen im Datenblatt. Wichtig: Tiefgaragen-Einfahrten haben oft Höhenbegrenzungen unter 2,0 m – Koffer und Hochdach-Kasten passen dort nicht.",
        },
        {
          question: "Wie funktioniert die Tankregelung – Diesel voll abgeben oder nicht?",
          answer:
            "Standard: Fahrzeug wird volltank übergeben und volltank zurückgenommen. Bei nicht volltank zurückgegebenen Fahrzeugen berechnen wir die fehlende Diesel-Menge plus Service-Pauschale. AdBlue bei modernen Euro-6-Diesel-Transportern reicht typisch mehrere tausend km – nachfüllen ist nur bei sehr langen Mieten nötig (1-Liter-Flasche an jeder Tankstelle). Wir geben bei Übergabe in Krefeld den Tankstand und Kilometerstand schriftlich aus.",
        },
        {
          question: "Was kostet ein Transporter in Krefeld – Stundenmiete oder Tagesmiete?",
          answer:
            "Tagespreise sind je Fahrzeug tagesaktuell im Buchungsprozess hinterlegt. Für kurze Umzüge bieten wir auf Anfrage Stunden- bzw. Halbtagesmiete (4 Stunden + Kilometer). Standard ist die 24-Stunden-Miete inkl. einer Kilometerpauschale (typisch 100–200 km frei, jeder weitere Kilometer Aufpreis). Wochen­miete und Monatsmiete sind für Handwerker- und Gewerbekunden attraktiv – die effektive Tagesmiete sinkt deutlich.",
        },
        {
          question: "Bin ich versichert, wenn etwas passiert?",
          answer:
            "Alle unsere Mietfahrzeuge sind haftpflicht- und vollkasko-versichert (mit Selbstbeteiligung in unseren Mietbedingungen ausgewiesen). Auf Wunsch lässt sich die Selbstbeteiligung gegen Aufpreis reduzieren (Premium-Schutz). Nicht versichert sind grobe Fahrlässigkeit (Alkohol, Fahren ohne gültige Fahrerlaubnis, Überschreiten zulässiger Beladung, Höhenschaden durch Kollision mit Garageneinfahrt – Klassiker bei Hochdach-Kastenwagen). Bei Schaden: Polizei rufen (auch bei Selbstunfall ohne Personenschaden), Unfallbericht mit Fotos, sofort am Standort Krefeld melden.",
        },
        {
          question: "Darf ich mit dem Mietfahrzeug ins Ausland fahren?",
          answer:
            "EU-Ausland und EWR (Schweiz, Norwegen, Liechtenstein) sind in der Regel ohne Aufpreis abgedeckt; bitte bei Anmietung anzeigen, damit die internationale Versicherungs-Bestätigung (grüne Karte) mitgegeben wird. Fahrten in Länder außerhalb des EWR (Türkei, Russland, Marokko) bedürfen der vorherigen Genehmigung und sind teils ausgeschlossen. Für gewerblichen Güterverkehr (Werkverkehr Ausland) gelten zusätzliche Genehmigungspflichten (CEMT, bilateral) – diese liegen beim Mieter.",
        },
        {
          question: "Was muss ich bei der Rückgabe in Krefeld beachten?",
          answer:
            "Fahrzeug volltank, im sauberen Zustand außen und innen (besenrein im Laderaum), inklusive aller Zurrgurte, Sackkarren und Decken, im Rückgabe­zeitfenster zurückbringen. Außerhalb der Öffnungszeiten ist eine Schlüsseleinwurf-Box am Hauptsitz Krefeld verfügbar – die Schaden- und Tankprüfung erfolgt dann am nächsten Werktag mit Foto-Dokumentation. Verspätete Rückgabe wird stundenweise berechnet; wir bitten um kurze Vorabinfo per Telefon, wenn der Zeitplan kippt.",
        },
      ],
      expertSections: [
        {
          h3: "Fahrzeugauswahl: Volumen vs. Nutzlast vs. Beladbarkeit",
          paragraphs: [
            "Die richtige Transporter-Wahl folgt drei Größen, die selten gleichzeitig optimal sind. Volumen (m³) ist entscheidend für sperrige, leichte Ladung (Umzug, Verpackungen, Polster). Nutzlast (kg) ist die kritische Größe für schwere Ladung (Fliesen, Estrich, Werkzeug, Eisen). Beladbarkeit (Heckklappe vs. Schiebetür vs. Hebebühne) entscheidet über die Verladegeschwindigkeit.",
            "Ein 3,5-t-Kastenwagen L3H2 bringt ca. 12 m³ Volumen und 1.000–1.300 kg Nutzlast – ideal für Umzüge mit normalem Hausrat. Ein Möbelkoffer 3,5 t mit Hebebühne bietet 18–22 m³ Volumen, aber nur 700–950 kg Nutzlast (Aufbaugewicht zieht ab) – Vorsicht beim Transport schwerer Möbel (Klaviere, Aktenschränke). Eine 3,5-t-Pritsche mit Plane hat oft die höchste Nutzlast (1.200–1.500 kg), dafür schmaleres Volumen. Wir beraten am Standort Krefeld nach konkretem Beladungsbild.",
          ],
        },
        {
          h3: "Ladungssicherung in der Praxis: VDI 2700 für Mietkunden",
          paragraphs: [
            "VDI 2700 ist die anerkannte Regel der Technik zur Ladungssicherung. Sie verlangt eine Sicherung der Ladung mit 0,8 g nach vorne (Bremsverzögerung), 0,5 g nach hinten und 0,5 g seitlich. Praxis: Eine Palette mit 500 kg auf der Ladefläche kann beim Bremsen mit 400 daN gegen die Stirnwand drücken – Stirnwand-Anschlag plus zwei Zurrgurte (LC 2.500 daN, Niederzurrung) sind Standard.",
            "Häufige Fehler: zu wenige Gurte, falsche Befestigungspunkte (Trittstufen sind keine Zurrpunkte), keine Anti-Rutsch-Matten unter der Ladung (Reibwert von 0,3 ohne Matte auf 0,6 mit Matte – verdoppelt die Sicherungswirkung), lose Restladung im Laderaum, die zur Stirnwand fliegt. Wir geben in Krefeld zu jedem Transporter mindestens 4 Zurrgurte LC 2.500 daN und Anti-Rutsch-Matten mit; bei Spezial-Ladung beraten wir vor Übergabe.",
          ],
        },
        {
          h3: "Umweltzonen und Diesel-Politik in NRW: was Mieter wissen müssen",
          paragraphs: [
            "Alle Umweltzonen in NRW (Krefeld, Düsseldorf, Köln, Bonn, gesamtes Ruhrgebiet, Wuppertal, Aachen, Münster) verlangen mindestens die grüne Plakette (Schadstoffklasse 4). Diesel-Fahrverbote für Euro 4/5 wurden in einigen Städten zwischenzeitlich geprüft, sind aber zum Stand 2026 in NRW weitgehend aufgehoben. Unsere Mietflotte erfüllt Euro 6/6d und ist damit für alle aktuellen und absehbaren Verschärfungen freigegeben.",
            "Im benachbarten Ausland (Niederlande, Belgien) gelten teils andere Regelungen: Antwerpen, Gent, Rotterdam und Amsterdam haben Milieu­zone-Systeme mit kfz-spezifischer Registrierung. Bei Fahrten in diese Städte ist eine Vorab-Registrierung des Kennzeichens nötig (kostenlos, online). Wir weisen bei Anmietung darauf hin, wenn das Zielgebiet eine Sonderregelung hat.",
          ],
        },
        {
          h3: "Eigenmiete oder Speditionsauftrag: wann lohnt sich was?",
          paragraphs: [
            "Selbstmiete eines Transporters lohnt sich bei (a) regelmäßigem Bedarf eigener Crew (Handwerksbetrieb), (b) sensiblen Ladungen mit Eigenverantwortung (eigene Möbel, Material-Pendel zwischen Baustelle und Lager), (c) kurzen, eng getakteten Touren in der Region. Spediteur-Beauftragung ist sinnvoll bei (a) Einzeltransporten über lange Strecken, (b) schwerer Ladung mit Kran- oder Hubarbeit am Zielort, (c) Spezial-Transporten (Gefahrgut, Lebensmittel-Kühlung mit ATP-Zulassung).",
            "Für Krefelder Handwerker und Bauunternehmen ist die Kombination aus eigener Transporter-Miete für Standard-Touren plus Speditions-Bestellung für Sondertransporte oft die wirtschaftlichste Lösung. Wir kalkulieren am Standort Krefeld auf Anfrage Rahmenmieten für regelmäßigen Bedarf.",
          ],
        },
        {
          h3: "Schadensfälle vermeiden: die fünf häufigsten Mietfahrzeug-Schäden",
          paragraphs: [
            "(1) Höhenschaden an Tiefgaragen-, Bahnunterführungs- oder Drive-In-Einfahrten: Klassiker bei Hochdach-Kasten und Möbel­koffer. Vor jeder Einfahrt Höhenbegrenzung lesen – die Höhe steht am Türrahmen des Fahrzeugs.",
            "(2) Schaden an der Hebebühne durch Überlast oder Schieflast – Hebebühnen-Nennlast und Lastverteilung beachten. (3) Kratzer und Beulen an A- und B-Säulen durch enge Innenstadt-Pollerstrecken (Krefelder Altstadt). (4) Ladungsverschiebung beim Bremsen mit Folge­schaden am Kofferinnenraum – Ladungssicherung ist Selbstschutz. (5) Tankverwechslung Diesel/AdBlue – AdBlue gehört nicht in den Diesel­tank und umgekehrt; bei Verwechslung sofort Motor nicht starten und uns telefonisch in Krefeld informieren. Mit etwas Aufmerksamkeit bei Übergabe und Tour-Planung sind alle fünf Schäden vermeidbar.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // BELEUCHTUNG (LED-PAR, Moving Heads, Fluter, Stative, DMX)
    // Quellen: DIN VDE 0100-711 (Elektrische Anlagen in Räumen
    //   für Veranstaltungen, Ausstellungen und Stände),
    //   DGUV Vorschrift 3 (Prüfung elektrischer Betriebsmittel),
    //   DGUV Information 215-310 (Laser-Einrichtungen),
    //   DIN EN 60529 (IP-Schutz), USITT DMX512-A (ANSI E1.11),
    //   SBauVO NRW Teil 5 (Versammlungsstätten).
    // -------------------------------------------------------------
    beleuchtung: {
      faqs: [
        {
          question: "Welche Lichttechnik brauche ich für eine Hochzeit, einen Geburtstag oder ein Firmenevent in Krefeld?",
          answer:
            "Faustregel nach Gästezahl: Bis 50 Personen reichen 4–6 LED-PARs für Wash-Licht plus 2 Effektgeräte (Derby/Moving Head) auf einem T-Bar-Stativ. Bis 150 Personen kalkuliert man 8–12 LED-PARs, 2–4 Moving Heads und ein kleines DMX-Pult. Ab 200 Personen wird Traversenaufbau mit getrennten Wash-/Spot-/Effekt-Ebenen üblich. Am Hauptsitz Krefeld stellen wir Pakete aus dem Eventtechnik-Sortiment passgenau zusammen – inklusive DMX-Verkabelung und Stromplan.",
        },
        {
          question: "Was ist DMX512 und brauche ich ein Lichtpult zur Steuerung?",
          answer:
            "DMX512 (ANSI E1.11) ist das Standard-Steuerprotokoll für Veranstaltungslicht: ein Universum überträgt 512 Steuerkanäle über eine XLR-Linie. Jeder Scheinwerfer belegt je nach Modus 4–16 Kanäle. Für kleine Setups reicht ein Stand-alone-Modus oder eine Master/Slave-Verkettung; ab 6–8 Geräten lohnt ein DMX-Pult oder eine Software-Lösung (z. B. mit USB-DMX-Interface). Wir geben jedes Gerät mit Kanal-Belegung und einer Beispiel-Patch-Liste mit.",
        },
        {
          question: "Welche Scheinwerfer sind outdoor-tauglich – worauf achte ich bei IP-Schutz?",
          answer:
            "Outdoor-Einsatz verlangt mindestens IP65 nach DIN EN 60529 (staubdicht, strahlwassergeschützt). IP44 reicht für überdachte Bühnen, nicht aber bei freier Bewitterung. Wichtig: Auch die Steckverbindungen müssen entsprechend abgedichtet sein (TRUE1-IP65 oder vergossene Verbindung). Im Eventtechnik-Sortiment am Standort Krefeld kennzeichnen wir outdoor-fähige Geräte explizit. Bei Regen-Risiko ergänzen wir Regenhauben für Stativaufbauten und planen Stromverteilung mit FI-Schutzschalter.",
        },
        {
          question: "Wie viel Strom zieht ein typisches Lichtpaket – passt das an eine normale Haushaltssteckdose?",
          answer:
            "Eine Schuko-Steckdose (16 A / 230 V) liefert maximal ca. 3.680 W, abgesichert über den B16-Automaten meist real 3.000–3.300 W. Ein LED-PAR zieht je nach Leistung 30–180 W, ein moderner LED-Moving-Head 150–400 W. Beispiel: 8 LED-PARs (à 100 W) + 4 Moving Heads (à 250 W) = ca. 1.800 W – passt auf eine Phase. Sobald Nebelmaschine (1.500 W) oder Hazer dazukommen, ist eine zweite Steckdose auf einer separaten Sicherung Pflicht. Bei größeren Setups planen wir Drehstrom (CEE16/CEE32) mit Lichtverteiler ein.",
        },
        {
          question: "Wer darf Veranstaltungslicht in NRW eigentlich aufbauen und betreiben?",
          answer:
            "Für nicht-öffentliche Privatfeiern in begrenzter Größe gibt es keinen formalen Befähigungsnachweis – der Vermieter weist in die Geräte ein. Sobald eine Versammlungsstätte nach SBauVO NRW Teil 5 betroffen ist (über 200 Besucher in Räumen, über 1.000 im Freien) oder eine gewerbliche Veranstaltung mit szenischer Darstellung stattfindet, greift die DGUV Vorschrift 17/18 – dann ist eine \"Verantwortliche Person für Veranstaltungstechnik\" erforderlich. Bei Firmenevents in Krefelder Locations klären wir gemeinsam mit dem Hausherrn, was nötig ist.",
        },
        {
          question: "Was ist der Unterschied zwischen Wash-, Beam-, Spot- und Effekt-Licht?",
          answer:
            "Wash-Light flutet Flächen mit weichem, weitem Strahl (LED-PAR, Wash-Moving) – das Grund-Stimmungslicht. Beam ist ein extrem enger, paralleler Strahl (5–8°), der scharfe Lichtsäbel in den Raum zeichnet – wirkt nur mit Nebel/Haze. Spot ist ein Mittelding mit Gobo-Projektion (Logos, Muster). Effekt-Geräte (Derby, Flowereffekt) erzeugen multidirektionale Lichtmuster für Tanzflächen. Eine gute Show kombiniert alle vier Schichten – wir beraten am Standort Krefeld nach Location-Typ und Stilrichtung.",
        },
        {
          question: "Sind die Geräte VDE-/E-Check-geprüft?",
          answer:
            "Ja. Sämtliche elektrische Mietgeräte werden gemäß DGUV Vorschrift 3 in regelmäßigen Intervallen geprüft (ortsveränderliche Betriebsmittel: typisch alle 6–24 Monate je Einsatzbedingung). Die Prüfplakette mit Datum klebt sichtbar am Gerät bzw. am Netzkabel. Für gewerbliche Veranstalter heißt das: Du erfüllst die Betreiberpflicht auf der Veranstaltung mit unseren Geräten ohne zusätzliche Prüfung. Auf Anfrage stellen wir das Prüfprotokoll bereit.",
        },
        {
          question: "Wie ist die Logistik – Selbstabholung oder Lieferung in Krefeld und Umgebung?",
          answer:
            "Selbstabholung an der Anrather Straße 291 ist während der Öffnungszeiten Mo–Fr 08:00–18:00, Sa 10:00–14:30 möglich – kleinere Pakete passen in den Kombi/Bus. Für komplette Lichtsetups mit Stativen, Truss und Verkabelung empfehlen wir Lieferung mit unserem Transporter im Lieferradius Krefeld, Meerbusch, Willich, Düsseldorf, Mönchengladbach, Neuss. Auf- und Abbau führen wir auf Anfrage durch – Preise je nach Aufwand auf Angebot.",
        },
        {
          question: "Brauche ich für Nebel- oder Hazermaschinen eine Brandmelde-Abschaltung?",
          answer:
            "In Locations mit Rauchwarnmeldern oder aufgeschalteter Brandmeldeanlage (BMA) muss die Anlage vor Einsatz von Nebel/Haze entweder freigegeben (Hausmeister/Wachdienst informiert) oder im betroffenen Bereich abgeschaltet werden – sonst droht Falschalarm und Feuerwehr-Einsatz auf Kosten des Veranstalters. Wir weisen darauf hin und stellen auf Wunsch Hinweis-Schilder \"Künstlicher Nebel im Einsatz\" bereit.",
        },
        {
          question: "Sind Laser auf Privat- und Firmenevents erlaubt?",
          answer:
            "Showlaser fallen unter DGUV Information 215-310 und die OStrV (Optische-Strahlung-Verordnung). Für Laser ab Klasse 3B/4 ist ein Laserschutzbeauftragter mit Sachkundenachweis Pflicht, eine Anzeige bei der zuständigen Berufsgenossenschaft sowie eine schriftliche Gefährdungsbeurteilung. Aus diesem Grund führen wir am Standort Krefeld bewusst keine offenen Show-Laser im freien Verleih – für Effektlicht setzen wir auf moderne LED-Beams mit Haze, die optisch vergleichbar wirken und ohne Sondergenehmigung betrieben werden dürfen.",
        },
      ],
      expertSections: [
        {
          h3: "Lichtdesign-Grundlagen: drei Ebenen, ein Konzept",
          paragraphs: [
            "Professionelles Veranstaltungslicht arbeitet in drei Ebenen: (1) Funktionslicht – damit Gäste den Raum nutzen können, gemessen in Lux am Boden (DIN EN 12464-1 nennt 100–300 lx für Verkehrsflächen, 50–100 lx für Lounge-Bereiche). (2) Atmosphärenlicht – farbiges Wash über Wände, Dancefloor und Decke, schafft Stimmung und Raumtiefe. (3) Effektlicht – Beams, Moving Heads, Strobe für Akzente in der Show.",
            "Ein klassischer Fehler ist \"zu viel Effekt, zu wenig Funktion\": Wenn die Tanzfläche nur noch von Movings beleuchtet wird, sehen Gäste sich gegenseitig kaum. Faustregel: Funktionslicht macht ca. 60 % des Bedarfs aus, Atmosphäre 30 %, Effekt 10 %. Am Standort Krefeld stellen wir Pakete entsprechend zusammen statt nur Geräte zu zählen.",
          ],
        },
        {
          h3: "Stromplanung: Phasen, Sicherungen, FI – was wirklich passieren kann",
          paragraphs: [
            "Veranstaltungsstrom wird in NRW nach DIN VDE 0100-711 betrieben: jeder Stromkreis mit FI-Schutzschalter (RCD 30 mA), ortsveränderliche Verteiler mit Personenschutz, Kabel mit ausreichendem Querschnitt (H07RN-F 3×1,5 mm² bis 16 A, 3×2,5 mm² für längere Strecken ab 25 m). Häufiger Praxis-Fehler: vier Mehrfachsteckdosen hintereinandergehängt – die Sicherung im Haus löst aus, das Bühnenlicht ist tot.",
            "Bei größeren Setups planen wir mit CEE-Drehstrom (16 A bzw. 32 A, 5-polig). Drei Phasen × 16 A × 230 V = ca. 11 kW pro CEE16-Verteiler. Wir berechnen die Belastung vorab und liefern bei Bedarf Drehstrom-Verteiler mit FI/LS-Kombinationen mit. Wo der vorhandene Hausanschluss nicht ausreicht, koppeln wir ein Stromaggregat aus unserem Aggregate-Sortiment in Krefeld an.",
          ],
        },
        {
          h3: "Hängung, Stative und Statik: Sicherheit über Köpfen",
          paragraphs: [
            "Sobald Scheinwerfer über Personen hängen, gilt die DGUV Vorschrift 17/18 sowie DIN EN 17206 (Veranstaltungstechnik – Maschinerie). Punktlasten an Hallendecken benötigen einen Nachweis durch den Hausherrn (Riggingplan, Lastenliste). Auf Stativen darf die Hersteller-Höchstlast nicht überschritten werden – ein klassisches T-Bar-Stativ trägt typisch 30–50 kg bei 3 m Höhe. Jeder hängende Scheinwerfer ist mit einem Safety (Stahlseil) gegen Absturz zu sichern, dimensioniert auf das 6-fache Eigengewicht.",
            "Wir geben am Standort Krefeld zu jedem Stativ und jedem Truss-Set ein Datenblatt mit max. Last und Aufbauanleitung mit. Bei komplexen Hängungen liefern wir Truss aus dem Sortiment \"Traversen & Rigging\" passend dazu – inklusive Stahlseilen, Kettenzügen (manuell oder elektrisch) und Lastverteilung.",
          ],
        },
        {
          h3: "LED vs. Entladungslampen: warum 2026 fast alles LED ist",
          paragraphs: [
            "Klassische Entladungslampen (HMI, MSR, MSD) sind nahezu vollständig durch LED-Lichtquellen verdrängt. Gründe: Lebensdauer (LED 30.000–50.000 h vs. 1.000–3.000 h Entladung), kein Lampenwechsel im Mietkreislauf, niedriger Stromverbrauch (Faktor 3–5), Dimmbarkeit ohne Farbverschiebung und kein UV-Anteil. Nachteil LED: hochwertige Farbwiedergabe (CRI 90+) ist teurer; bei Hauttönen und Foto-/Video-Mitschnitt auf CRI achten.",
            "Unsere aktuelle Mietflotte am Standort Krefeld besteht zu nahezu 100 % aus LED-Geräten – das schont Strombilanz und reduziert Hitzeentwicklung in der Location (gerade in Sommer-Locations ohne Klima ein echter Faktor). Bei Anfragen mit Foto-/Video-Verwertung empfehlen wir explizit Geräte mit hohem CRI bzw. TLCI.",
          ],
        },
        {
          h3: "Programmierung und Steuerung: vom Stand-alone bis zum Show-Pult",
          paragraphs: [
            "Für kleine Pakete reichen Stand-alone-Modi: Sound-to-Light über das eingebaute Mikrofon, vorgefertigte Programme, Master/Slave-Verkettung. Vorteil: kein Bediener nötig. Nachteil: keine Synchronisation auf konkrete Songs oder Programmpunkte. Sobald ein Live-Programm (Reden, Bandauftritte, Choreographien) bespielt werden soll, lohnt ein DMX-Pult oder Software (z. B. mit Tablet und USB-DMX-Bridge), das auf Knopfdruck Stimmungen (Cues) abruft.",
            "Für unsere Mietkunden in Krefeld erstellen wir auf Wunsch eine Patch-Liste und einfache Programmiervorlage. Wer einen Operator stellen muss, dem empfehlen wir, einen lokalen Lichttechniker zu beauftragen – wir können in der Region Krefeld/Düsseldorf vermitteln.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // BESCHALLUNG (PA, Aktivlautsprecher, Pulte, Mikros, Funk)
    // Quellen: TA Lärm, DIN 15905-5 (Schutz gegen Gehörschäden
    //   durch hohe Schallpegel bei Veranstaltungen, LAeq max.
    //   99 dB(A)/30 min), DIN VDE 0100-711, BNetzA-Frequenzplan
    //   PMSE (Mittenband 470–608 MHz Allgemeinzuteilung,
    //   614–694 MHz Einzelzuteilung, 863–865 MHz und
    //   1785–1805 MHz anmeldefrei).
    // -------------------------------------------------------------
    beschallung: {
      faqs: [
        {
          question: "Welche Lautsprecherleistung brauche ich für meine Veranstaltungsgröße?",
          answer:
            "Faustregel für Sprache und Hintergrundmusik in Innenräumen: 5–10 W pro Person, für Live-Musik und Tanzfläche 15–25 W pro Person. Outdoor verdoppelt sich der Bedarf, weil kein Raum reflektiert. Beispiele: 50 Personen Geburtstag indoor mit Tanz → 1× Aktiv-Top 12\" mit ca. 800 W RMS plus passender Sub. 150 Personen Hochzeit indoor mit Live-Band → Stereo-Set Tops 15\" + 2 Subs. 300 Personen Open Air → kompaktes PA-System mit 4 Tops + 4 Subs. Wir kalkulieren am Hauptsitz Krefeld pro Anfrage konkret.",
        },
        {
          question: "Was ist der Unterschied zwischen Aktiv- und Passivlautsprechern?",
          answer:
            "Aktivlautsprecher haben die Endstufe und das Filter-Setup intern verbaut – einfacher Aufbau (Strom + Signal), aber teurer pro Stück und Strom an jedem Standort nötig. Passivlautsprecher brauchen eine externe Endstufe und ein Controller-Preset (DSP/Frequenzweiche) – flexibler und günstiger bei größeren Setups, aber komplexer im Aufbau. Für 90 % der Privat- und Firmenkunden am Standort Krefeld empfehlen wir Aktiv-Setups – schneller aufgebaut, weniger Fehlerquellen.",
        },
        {
          question: "Brauche ich einen Subwoofer – und wie viele?",
          answer:
            "Für reine Sprache (Vortrag, Trauung, Hochzeitsrede) reichen Tops ohne Sub. Für Musik mit elektronischem Anteil (Pop, House, HipHop) ist mindestens ein Sub Pflicht, sonst fehlt der Druck. Faustregel: ein Sub pro zwei Tops, oder Sub-Leistung etwa gleich Tops-Leistung in Watt RMS. Bei zwei Subs lohnt End-Fire- oder Cardio-Aufstellung, damit Bass nach vorne fokussiert und nicht hinter die Bühne strahlt. Wir beraten am Standort Krefeld konkret nach Musikrichtung.",
        },
        {
          question: "Was muss ich zur Lautstärke und zum Lärmschutz in Krefeld wissen?",
          answer:
            "Bei Veranstaltungen mit Publikum gilt DIN 15905-5: max. LAeq 99 dB(A) gemittelt über 30 Minuten, gemessen an der lautesten zugänglichen Stelle. Wer höher fährt, muss Schallpegelmessung dokumentieren und Gehörschutz auslegen. Im Freien gilt zusätzlich die TA Lärm: tags (06–22 Uhr) in Misch-/Wohngebieten ca. 60 dB(A), nachts 45 dB(A) Immissionsrichtwert. Für seltene Ereignisse (max. 10 pro Jahr und Ort) gibt es Ausnahmen – bei Open-Air-Events ist eine Anzeige beim Ordnungsamt Krefeld ratsam.",
        },
        {
          question: "Funkmikrofon mieten – gibt es Frequenzregeln in NRW?",
          answer:
            "Ja. Die BNetzA hat den UHF-Frequenzplan klar geregelt. Anmeldefreie Bereiche für drahtlose Mikrofone: 863–865 MHz (10 mW, sehr begrenzt) und 1785–1805 MHz (DECT-Bereich). Anmeldepflichtig (kostenpflichtige Frequenzzuteilung): Mittenband 470–608 MHz und Duplexbereich 614–694 MHz. Unsere Mietsysteme am Standort Krefeld arbeiten ab Werk auf koordinierbaren Frequenzblöcken – wir wählen pro Einsatz freie Kanäle und übergeben Geräte vorprogrammiert.",
        },
        {
          question: "Wie viele Mikrofone passen gleichzeitig in eine Funkstrecke?",
          answer:
            "Pro 8-MHz-TV-Kanal lassen sich typisch 6–10 koordinierte Funkstrecken parallel betreiben, je nach Hersteller und Frequenzbreite. Praxis: für eine Standardhochzeit reichen 2 Strecken (1× Trauredner, 1× Brautpaar/Wechsel). Konferenz mit Podiumsdiskussion: 4–8 Strecken plus Reserve. Über 12 parallele Strecken ist eine professionelle Frequenzkoordination Pflicht (Intermodulationsberechnung) – dafür greifen wir auf koordinierte Frequenzblöcke unserer Geräte zurück.",
        },
        {
          question: "Welches Mischpult brauche ich – analog, digital oder Tablet-gesteuert?",
          answer:
            "Kleinevents bis 8 Eingänge (1–2 Mikrofone, 1 Stereo-Zuspielung) → kompaktes Analogpult oder kleines Digitalpult mit Tablet-Steuerung. Mittelevents bis 16 Eingänge (Band + Sprecher + DJ) → Digitalpult der 16–32-Kanal-Klasse, idealerweise mit Tablet-Mix vom Saal aus. Große Events mit Live-Band und Monitoring → 32+-Kanal Digitalpult mit separatem Monitormix. Wir führen am Standort Krefeld digitale Pulte – Tablet-Steuerung ist heute Standard, weil der Mix-Punkt im Saal mobil gewählt werden kann.",
        },
        {
          question: "Stromversorgung der PA – Schuko oder CEE?",
          answer:
            "Kleine Aktiv-Sets (2 Tops, 1 Sub) laufen bequem an Schuko (16 A / 3.500 W). Größere Setups mit 4 Tops + 4 Subs und Pult ziehen leicht 4.000–6.000 W – das gehört auf CEE16 (Drehstrom, 11 kW). Wichtig: Audio und Licht möglichst auf getrennte Phasen, sonst können Brummschleifen über die Stromversorgung entstehen. Wir liefern auf Wunsch passende Stromverteiler aus unserem Kabel- & Stromverteiler-Sortiment in Krefeld mit.",
        },
        {
          question: "Wie kommt Audio von der Bühne zum Mischpult – Multicore oder digital?",
          answer:
            "Analog: Multicore-Kabel mit 8/16/24 Eingängen plus Stagebox-Anschluss – robust, kein Latenzproblem, aber schwer und teuer pro Meter. Digital: ein einzelnes CAT5e/CAT6-Kabel (Ethercon) überträgt 32–64 Kanäle bidirektional, sehr leichte Verlegung. Heute Standard auf digitalen Pulten. Bei Outdoor-Events achten wir auf wasserdichte Steckverbindungen und Kabelschutz an Wegekreuzungen (Kabelbrücken aus unserem Absperrtechnik-Sortiment).",
        },
        {
          question: "Können wir die PA selbst aufbauen oder kommt jemand mit?",
          answer:
            "Pakete bis ca. 4 Tops/2 Subs übergeben wir am Hauptsitz Krefeld inklusive Verkabelungs-Schema und kurzer Einweisung – das schaffen technikaffine Mieter problemlos selbst. Bei größeren Setups, Bands mit Monitormix, mehreren Funkstrecken oder zeitkritischen Veranstaltungen empfehlen wir Aufbau und Operator aus unserem Netzwerk lokaler Veranstaltungstechniker im Raum Krefeld/Düsseldorf – Vermittlung über uns.",
        },
      ],
      expertSections: [
        {
          h3: "PA-Dimensionierung: Watt sind nicht gleich Lautstärke",
          paragraphs: [
            "Die Watt-Angabe auf Lautsprechern ist nur ein grober Indikator. Maßgeblich für die wahrgenommene Lautstärke ist der maximale Schalldruck (SPL @ 1 m, in dB), der sich aus Wirkungsgrad und Belastbarkeit ergibt. Ein 800-W-Top mit 134 dB max. SPL kann lauter spielen als ein 1.200-W-Top mit 128 dB. Mit jeder Verdopplung der Entfernung sinkt der Schalldruck im Freifeld um 6 dB – ein Top mit 134 dB @ 1 m liefert in 16 m noch 110 dB.",
            "Praxis für Krefelder Locations: in halligen Sälen (Industriehallen, Glaspavillons) lieber kleinere Lautsprecher kürzer zum Publikum – mehr Leistung erhöht hier vor allem den Hall, nicht die Sprachverständlichkeit. In gedämpften Räumen (Hotel-Ballsaal mit Teppich) lohnt Power, weil der Raum schluckt. Wir berücksichtigen die Locations beim Packvorschlag.",
          ],
        },
        {
          h3: "Lärmschutz in der Praxis: TA Lärm und DIN 15905-5",
          paragraphs: [
            "Für Innenveranstaltungen ist DIN 15905-5 der zentrale Maßstab: maximal LAeq 99 dB(A) über 30 Minuten am lautesten zugänglichen Publikumsplatz. Wer höher fährt, braucht Pegelbegrenzung, Schallpegel-Aufzeichnung und ausgelegten Gehörschutz für Gäste. Für Krefelder Hallen-Veranstaltungen mit reiner Sprache reichen 75–80 dB(A) deutlich – Tanz und Live-Band bewegen sich typisch zwischen 90 und 97 dB(A).",
            "Für Outdoor in Wohnnähe gilt die TA Lärm: tagsüber 60 dB(A), nachts 45 dB(A) Richtwert in allgemeinen Wohngebieten. Das ist sehr leise – bereits ein normales Gespräch erreicht 60 dB. Für Sommerfeste und Hochzeiten im Freien gibt es die Möglichkeit \"seltener Ereignisse\" (max. 10 pro Jahr und Ort). Wir empfehlen, dies frühzeitig mit dem Ordnungsamt Krefeld abzustimmen.",
          ],
        },
        {
          h3: "Funkmikrofone: Frequenzplanung und PMSE in Deutschland",
          paragraphs: [
            "Drahtlose Mikrofone arbeiten im UHF-Bereich. Die BNetzA verwaltet PMSE (Programme Making and Special Events) und hat den Frequenzplan in mehrere Bereiche geteilt: Mittenband 470–608 MHz (Allgemeinzuteilung mit max. 50 mW, Co-Existenz mit DVB-T2), Duplexlücke 614–694 MHz (anmeldepflichtige Einzelzuteilung), DECT-Bereich 1785–1805 MHz (kostenfrei, ortsfest) und 863–865 MHz (sehr begrenzt).",
            "Praktische Folge für Mieter: einzelne Mikrofone laufen anmeldefrei auf 1785–1805 MHz oder im Mittenband. Bei 4+ parallelen Strecken empfehlen wir koordinierte Geräte aus dem Mittenband. Bei Veranstaltungen mit großer DVB-T2-Belegung in der Region (Sender Langenberg) führen wir vor Übergabe einen Scan der freien Kanäle durch.",
          ],
        },
        {
          h3: "Verkabelung, Erdung und Brummschleifen vermeiden",
          paragraphs: [
            "Brummen auf der PA ist meist ein Erdungsproblem (Ground Loop): zwei Stromkreise mit unterschiedlichem Schutzleiter-Potenzial, verbunden über die Audio-Masse. Lösungen: alle Audio-Geräte auf dieselbe Phase und denselben Schutzleiter (im Idealfall einen Strang aus einem CEE-Verteiler), symmetrische Audio-Verbindungen (XLR statt Klinke unsymmetrisch) und im Notfall DI-Boxen mit Groundlift.",
            "Niemals den Schutzleiter abklemmen – das ist lebensgefährlich und verstößt gegen DIN VDE 0100. Wir liefern für Krefelder Setups grundsätzlich nur Verkabelung mit korrekter Erdung. Bei Mischmoderation aus Hausstrom und Bühnenstrom ergänzen wir DI-Boxen, um saubere Pegelübergänge zu garantieren.",
          ],
        },
        {
          h3: "Monitoring und Stagesound: warum kleine Veranstaltungen davon profitieren",
          paragraphs: [
            "Auch bei kleinen Events ist Monitoring wichtig: Trauredner braucht eigene Lautsprecher Richtung Publikum – nicht in den Rücken; ein Brautpaar mit Funkmikro hört sich selbst nicht, wenn der PA-Hauptklang weit entfernt steht. Lösungen: kleine Aktiv-Monitore (8–10\") als Sidefill, In-Ear-Monitorstrecken für Bands (DECT- oder UHF-basiert), reine Bestätigungs-Lautsprecher (\"Confidence Speaker\") am Rednerpult.",
            "Für Krefelder Hochzeiten und Firmen-Events stellen wir auf Anfrage Monitor-Pakete zusammen, die mit dem Haupt-PA-Setup zusammenarbeiten. Bei reinen Konferenz-Setups setzen wir oft auf Decken- bzw. Wand-Lautsprecher der Location und ergänzen mit mobilen Stativ-Lautsprechern für flexible Bereiche.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // BÜHNE (Modulpodeste, Treppen, Geländer, Verkleidung)
    // Quellen: DIN EN 13200-1/-5 (Zuschaueranlagen),
    //   SBauVO NRW Teil 5 (Versammlungsstätten),
    //   DGUV Vorschrift 17/18, DIN EN 17206,
    //   DIN 18065 (Treppen), DIN 18040-1 (Barrierefreiheit),
    //   DIN EN 1991-1-4 (Windlast), DIN 4102-1 (Brandschutz B1).
    // -------------------------------------------------------------
    buehne: {
      faqs: [
        {
          question: "Welche Bühnengröße brauche ich für meine Veranstaltung?",
          answer:
            "Faustregel: Solo-Sprecher mit Stehpult und Wand-Beamer → 2 × 2 m reichen. DJ mit Lichteffekten → 3 × 2 m. Band mit 4 Musikern und Drumrise → 6 × 4 m. 5–8-köpfige Band mit Backline → 8 × 5 m. Für jede Person auf der Bühne kalkuliert man ca. 1,5 m² Aufstellfläche plus Bewegungsraum. Wir konfigurieren am Hauptsitz Krefeld modulare Bühnenpodeste flexibel in 20-cm-Höhenrastern (40, 60, 80, 100 cm).",
        },
        {
          question: "Welche Belastbarkeit haben die Bühnenpodeste?",
          answer:
            "Standard-Modulbühnenpodeste aus dem professionellen Veranstaltungsbau sind nach DIN EN 13200 für 5 kN/m² (500 kg/m²) Verkehrslast ausgelegt – das ist die Anforderung an Stehplätze für Publikum. Für reine Sprecher- oder Tanzbühnen mit max. 3 Personen pro Quadratmeter ist das mehr als ausreichend. Schwere Last (z. B. Flügel, schwere Backline) verteilt man auf mindestens 2 Felder. Die genaue Belastbarkeit pro Podest steht im Datenblatt.",
        },
        {
          question: "Brauche ich eine Treppe oder Rampe?",
          answer:
            "Ab 60 cm Bühnenhöhe ist eine Treppe verpflichtend (DGUV 17/18). Standard-Bühnentreppen haben ca. 18 cm Steigung und 28 cm Auftritt – das entspricht DIN 18065 für Notwendigtreppen. Eine Rollstuhlrampe nach DIN 18040 (max. 6 % Steigung – heißt für 60 cm Höhe 10 m Rampenlänge) ist bei öffentlichen Veranstaltungen empfohlen. Bei Hochzeits- und Firmen-Bühnen liefern wir Treppe als Standard mit, Rampe auf explizite Anfrage.",
        },
        {
          question: "Ab welcher Bühnenhöhe brauche ich Absturzsicherung/Geländer?",
          answer:
            "Ab einer Absturzhöhe von 1 m fordert die DGUV-Vorschrift Geländer mit Höhe mindestens 1,10 m, Mittelholm, Fußleiste. Bei Bühnen mit 80 cm Höhe ist Geländer noch optional, ab 100 cm Pflicht. Im sichtbaren Frontbereich der Bühne (zum Publikum gerichtet) entfällt das Geländer üblicherweise – dort ist die Absturzkante klar erkennbar und Teil der \"künstlerischen Nutzung\". Seiten und Rückseite werden mit Geländer abgesichert.",
        },
        {
          question: "Ist eine Modulbühne ein \"fliegender Bau\" nach SBauVO NRW?",
          answer:
            "\"Fliegende Bauten\" sind nach SBauVO NRW Teil 5 bauliche Anlagen, die wiederholt aufgestellt werden und Personenzugang bieten. Unsere Standard-Modulbühnen bis ca. 6 × 4 m mit Höhen bis 80 cm und ohne Überdachung gelten in der Regel als \"untergeordnete Aufstellung\" und benötigen keine separate Ausführungsgenehmigung. Sobald Tribünen über 100 m² Fläche, Höhen über 1,5 m oder Überdachungen ins Spiel kommen, ist eine Prüfbuch-Pflicht und Sachverständigen-Abnahme möglich.",
        },
        {
          question: "Bühne für Outdoor – wie schütze ich gegen Regen und Wind?",
          answer:
            "Standard-Modulbühnenpodeste sind wetterfest, die Oberfläche ist rutschhemmend. Bei Outdoor-Einsatz braucht es jedoch eine Überdachung gegen Regen – entweder als Pavillon, Eventzelt oder Bühnendach mit Traversen. Wind ist der kritische Faktor: ein offenes Bühnendach mit 4 × 4 m Fläche kann bei 80 km/h Wind mehrere Tonnen Auftrieb erzeugen. Wir prüfen die Statik (Standort-Windlast nach DIN EN 1991-1-4) vor Outdoor-Aufbauten und liefern Ballast bzw. Erdanker mit.",
        },
        {
          question: "Wie lange dauert Aufbau und Abbau einer Bühne?",
          answer:
            "Eine 4 × 3 m Bühne (12 m²) bauen zwei eingewiesene Personen in ca. 45–60 Minuten auf, inkl. Höheneinstellung und Treppenmontage. 6 × 4 m (24 m²) mit Verkleidung dauert ca. 90 Minuten. Abbau geht typisch in 70 % der Aufbauzeit. Werkzeug (Inbus, Steckschlüssel) ist im Mietpaket enthalten. Auf Wunsch übernehmen wir Aufbau und Abbau am Veranstaltungsort im Raum Krefeld/Düsseldorf/Mönchengladbach – Stundensatz nach Aufwand.",
        },
        {
          question: "Kann man die Bühnenfläche verkleiden – und in welchen Farben?",
          answer:
            "Ja. Standard-Verkleidung ist schwarzer, schwer entflammbarer Bühnenmolton (B1 nach DIN 4102-1, in NRW nach SBauVO Teil 5 verpflichtend für Versammlungsstätten). Wir bieten Molton in Standard-Schwarz; andere Farben (weiß, rot, blau) auf Sondervorlauf. Befestigung erfolgt mit Velcro-Bändern an den Bühnenelementen – schnell und werkzeuglos. Für Hochzeiten und Markenevents lassen sich auch bedruckte Frontverkleidungen (Banner mit Logo) ergänzen.",
        },
        {
          question: "Welcher Untergrund ist für eine Bühne geeignet?",
          answer:
            "Indoor: jeder ebene Hartboden (Parkett, PVC, Beton, Estrich). Bei Teppichböden ggf. Lastverteilungsplatten, weil die punktuelle Last der Bühnenfüße den Teppich eindrücken kann. Outdoor: ebener Rasen, Pflaster, Asphalt. Bei Rasenuntergrund verteilt man die Last mit Holzbohlen unter den Füßen, sonst sinken die Stützen ein. Bei stark geneigtem Gelände gleichen wir mit höhenverstellbaren Füßen aus (Bereich ca. ±10 cm pro Fuß).",
        },
        {
          question: "Bühne plus Licht plus Ton – bekomme ich das aus einer Hand in Krefeld?",
          answer:
            "Ja. Am Hauptsitz Krefeld führen wir Bühne, Beleuchtung, Beschallung, Traversen, Rigging, Stromverteilung und Eventzelte aus einem Lager. Das spart Logistik (eine Anlieferung, ein Ansprechpartner) und stellt sicher, dass technische Schnittstellen passen (Truss-Hängung über Bühne mit korrekter Höhe und Statik, Stromplan abgestimmt, Audio-Hängung außerhalb der Lichtstrahlen). Wir kalkulieren Pakete \"Bühne + Technik\" gerne als Komplettangebot.",
        },
      ],
      expertSections: [
        {
          h3: "Modulbühnen-Systeme: Funktionsweise und Grenzen",
          paragraphs: [
            "Professionelle Modulbühnen bestehen aus einer Aluminium-Rahmen-Konstruktion mit aufgelegter Holzwerkstoff-Platte (typisch 18-mm-Birkenmultiplex mit rutschhemmender Beschichtung). Standardraster ist 1 × 1 m, 2 × 1 m oder 2 × 2 m. Höheneinstellung erfolgt mit höhenverstellbaren Standbeinen, typisch in 20-cm-Schritten von 20 cm bis 100 cm; für Tribünen und Show-Bühnen sind 120 cm und mehr möglich.",
            "Die Belastbarkeit folgt DIN EN 13200-1 (Zuschaueranlagen): 5 kN/m² Verkehrslast für Stehplätze, 7,5 kN/m² für rhythmische Belastung (Tanzfläche, springendes Publikum bei Konzerten). Für Tanzflächen empfehlen wir Tanzbodenauflage (PVC oder Laminat) auf der Bühne – schont die Bühnenoberfläche und sieht repräsentativer aus.",
          ],
        },
        {
          h3: "Versammlungsstätten in NRW: SBauVO Teil 5 in der Praxis",
          paragraphs: [
            "Die Sonderbauverordnung NRW Teil 5 (SBauVO NRW) gilt für Versammlungsstätten ab 200 Besucher in geschlossenen Räumen oder 1.000 Besucher im Freien. Sie regelt Rettungswege, Fluchttüren, Brandschutz, Bestuhlungspläne, Anzahl der notwendigen Aufsichtspersonen und – relevant für Bühnen – die brandschutztechnischen Anforderungen an Bühnenmaterialien (mindestens B1 schwer entflammbar nach DIN 4102-1).",
            "Praktische Folge für Krefelder Veranstalter: Für private Hochzeiten unter 200 Gästen in privatem Rahmen greift die VStättVO nicht. Sobald eine kommerzielle Veranstaltung in einer öffentlich zugänglichen Halle stattfindet (Konzerte, Märkte, Messen), prüfen wir die Anforderungen mit dem Veranstalter – Bühnenmolton und alle Verkleidungen aus unserem Lager sind B1-zertifiziert; die Zertifikate liegen vor.",
          ],
        },
        {
          h3: "Statische Sicherheit: was hält wirklich was?",
          paragraphs: [
            "Bühnenpodeste werden in Deutschland nach DIN EN 13200 typgeprüft. Jedes Modul hat eine Bauartzulassung mit konkreter Belastungsangabe; wir führen ausschließlich Systeme, deren Zulassung vorliegt. Bei Sonderlasten (Flügel mit 350 kg auf 1,5 × 1 m Standfläche) erstellen wir vorab eine Lastverteilung mit Spreader-Platten. Bei mehrstöckigen Tribünen oder Bühnen mit Dachkonstruktion wird ein Statiker hinzugezogen – das ist im Mietpaket nicht enthalten.",
            "Auf Vor- und Hauptbühnen bei Konzerten kalkuliert man dynamische Belastungen (springendes Publikum) doppelt zur statischen Last. Eine Bühnenfront mit 6 × 4 m und 100 Personen Tanzfläche darüber bedeutet ca. 10 kN/m² Spitze – das schaffen Modulbühnensysteme bei richtiger Stützweite.",
          ],
        },
        {
          h3: "Aufbau-Reihenfolge: Praxis-Workflow für saubere Bühnen",
          paragraphs: [
            "Empfohlene Reihenfolge für 4 × 3 m Bühne mit 80 cm Höhe: (1) Standfläche prüfen, eben und ausreichend tragfähig. (2) Eckpodeste setzen und Höhenfüße einstellen mit Libelle. (3) Mittlere Podeste einsetzen, Verbindungsklammern verriegeln. (4) Komplette Fläche prüfen (kein Wackeln, keine Spalte). (5) Treppe(n) montieren und sichern. (6) Geländer Seiten- und Rückseite. (7) Molton-Verkleidung. (8) Erst danach Technik (Licht, Ton, Backline) aufbauen.",
            "Häufiger Fehler bei Eigenaufbau: Technik wird vor Geländer aufgebaut, dann wird das Geländer wegen Platzmangel weggelassen – und beim Aufbau eines Mikroständers stürzt jemand rückwärts. Wir empfehlen die Reihenfolge konsequent. Bei Großevents im Raum Krefeld übernimmt unser Team oder ein vermittelter lokaler Partner den Aufbau auf Wunsch komplett.",
          ],
        },
        {
          h3: "Rollstuhlzugänglichkeit und Barrierefreiheit",
          paragraphs: [
            "Für barrierefreie Bühnen gilt DIN 18040-1 (öffentlich zugängliche Gebäude): Rampenneigung max. 6 %, beidseitiger Handlauf, Zwischenpodeste alle 6 m Länge, rutschfester Belag. Bei 60 cm Bühnenhöhe heißt das 10 m Rampenlänge – ein ernst zu nehmender Platzbedarf. Alternative für Locations mit Platznot: niedrige Bühne (40 cm) mit kürzerer Rampe, oder Hublift bei festen Bühnenanlagen.",
            "Bei Krefelder Trauungen, Reden und Preisverleihungen, wo Rollstuhlzugang nötig sein kann, empfehlen wir die niedrigere Bühnenvariante. Unsere Rampen sind 1 m breit; DIN 18040 fordert für reine Bühnenrampen 1,20 m Begegnungsverkehr nicht zwingend. Im Zweifel beraten wir und bieten projektspezifische Lösungen.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // TRAVERSEN & RIGGING (Alu-Truss, Kettenzüge, Tower, Ballast)
    // Quellen: DIN EN 17206 (Veranstaltungstechnik – Maschinerie),
    //   DGUV Vorschrift 17/18, DGUV Regel 115-002, DIN EN 818-7
    //   (Rundstahlketten Güte 8), DIN EN 1492-2 (Rundschlingen),
    //   DIN EN 13414 (Anschlagseile), DIN EN 1991-1-4 (Windlast),
    //   BGV C1/D8/D8+ (Hebezeuge im Veranstaltungsbau).
    // -------------------------------------------------------------
    "traversen-rigging": {
      faqs: [
        {
          question: "Welche Traversengröße brauche ich für mein Setup?",
          answer:
            "Faustregel nach Spannweite: bis 4 m Spannweite und max. 50 kg Last → 220er Truss (22 × 22 cm, oft als F32 bekannt) reicht. 4–8 m oder höhere Lasten (Lichtbatterie, Lautsprecher) → 290er Truss (F34, 29 × 29 cm). Ab 8 m Spannweite oder schwerer Hängelasten → 390er Truss (F44, 39 × 39 cm) bzw. Box-Truss. Am Hauptsitz Krefeld führen wir die gängigen Größen und stellen passend zu Last und Spannweite zusammen.",
        },
        {
          question: "Wie hoch darf ich Traversen aufbauen – Tower und Ground-Support?",
          answer:
            "Aluminium-Truss-Tower mit Kettenzug oder Steigerverfahren erreichen typisch 4–8 m Aufbauhöhe (Standard-Mietsysteme). Höhere Tower (12+ m) sind statisch geprüfte Spezialkonstruktionen, die mit Verstrebungen und schwerem Ballast (typisch 250 kg pro Tower) gesichert werden – Indoor möglich, Outdoor windkritisch. Wir liefern am Standort Krefeld Tower bis ca. 5 m mit Heberahmen für Einzelpersonen-Aufbau; höhere Setups mit Aufbau-Service.",
        },
        {
          question: "Brauche ich Kettenzüge oder reicht statische Hängung?",
          answer:
            "Statische Hängung (fix montiert, nicht beweglich): einfacher, billiger, ausreichend für Setups, die einmal hängen und nicht in der Höhe verändert werden. Kettenzüge (manuell oder elektrisch): nötig, wenn Truss am Boden bestückt und dann hochgefahren wird (Standard bei Konzerten), oder wenn Höhen während der Show angepasst werden. Elektrokettenzüge der 250/500/1.000 kg-Klasse sind im professionellen Veranstaltungsbau Standard. Wir vermieten beides – Kettenzüge erfordern Sachkunde-Nachweis nach DGUV 17 für gewerbliche Mieter.",
        },
        {
          question: "Wie viel Last kann ich an eine Truss hängen?",
          answer:
            "Die zulässige Hängelast hängt von Truss-Typ, Spannweite und Hängepunkt-Konfiguration ab. Beispiel 290er Box-Truss bei 6 m Spannweite und 2 Hängepunkten (1/4-Punkt-Aufhängung): ca. 250–400 kg gleichverteilte Last (UDL), je nach Hersteller. Punktlasten sind kritischer – ein 50-kg-Moving Head in der Mitte einer 6 m Truss kann die zulässige Belastung schon überschreiten. Wir geben für jedes Truss-Modul ein Datenblatt mit Belastungskurven heraus.",
        },
        {
          question: "Welche Sicherheitsausrüstung gehört zu jeder Truss-Hängung?",
          answer:
            "Pflichtausrüstung: Anschlagmittel mit ausreichender Tragfähigkeit (Rundschlinge oder Stahlseil, geprüft nach DIN EN 1492-2/13414), Schäkel mit ausreichendem WLL (Working Load Limit, typisch 1.000 kg oder 1.500 kg), Stahlseil-Safety als sekundäre Sicherung (6-fache Tragfähigkeit des Geräts), Lastverteiler bei mehreren Punkten. Wir geben am Standort Krefeld zu jedem Truss-Paket geprüfte Anschlagmittel mit Prüfplakette (jährliche Sichtprüfung dokumentiert) mit.",
        },
        {
          question: "Outdoor-Tower – wie viel Wind ist okay?",
          answer:
            "Standard-Aluminium-Tower mit Ballastfundament (250–500 kg pro Tower) sind typisch bis Windgeschwindigkeit 8 m/s (29 km/h, Windstärke 5 Bft) auslegbar. Bei höheren Windgeschwindigkeiten muss das System abgesenkt oder demontiert werden. Bei Outdoor-Bühnen mit Plane (Banner, Dach) erhöht sich die Windlast quadratisch – ein 4 × 6 m Banner bei 50 km/h Wind erzeugt mehrere Tonnen Druck. Wir kalkulieren Windlast nach DIN EN 1991-1-4 und liefern entsprechend dimensionierten Ballast oder empfehlen Erdanker.",
        },
        {
          question: "Darf ich Truss in Eigenaufbau machen?",
          answer:
            "Privat (nicht-öffentlich, kein gewerblicher Kontext): ja, mit Geräteeinweisung an unserem Standort Krefeld. Gewerblich oder bei öffentlichen Veranstaltungen greift DGUV Vorschrift 17/18: Aufbau über Personenköpfe darf nur durch sachkundige Personen erfolgen (\"Verantwortlicher für Veranstaltungstechnik\" mit IHK-Abschluss oder vergleichbar). Für Hochzeiten und kleine Firmen-Events bauen wir auf Wunsch selbst auf oder vermitteln einen lokalen IHK-Veranstaltungsmeister im Raum Krefeld.",
        },
        {
          question: "Welche Kupplungssysteme gibt es – passt alles zusammen?",
          answer:
            "Globale Branchenstandards sind: F32/F34/F44-Reihe (Konusverbindung mit Stiften und Sicherungssplint, herstellerübergreifend kompatibel innerhalb der Größe), Spigot-Verbindungen und Box-Truss-Konus. Innerhalb einer Truss-Größe sind die meisten Marken kompatibel – wir mischen aber bewusst nicht Hersteller, weil Toleranzen variieren können. Am Standort Krefeld führen wir geschlossene Sets eines Herstellers für reibungslosen Aufbau.",
        },
        {
          question: "Was kostet Aufbau und Abbau einer Trusskonstruktion?",
          answer:
            "Stundensatz unseres Veranstaltungstechnik-Teams bzw. vermittelter lokaler Partner im Raum Krefeld liegt typisch bei 60–95 € netto pro Stunde, je nach Qualifikation (Helfer / Sachkundiger / Meister). Eine Standard-Trusskonstruktion 6 × 4 m mit 4 Towern und Mid-Beam baut ein 2-Personen-Team in ca. 90 Minuten auf. Bei Großevents kalkulieren wir Material-, Personal- und Anfahrtskosten transparent in einem Komplettangebot.",
        },
        {
          question: "Gibt es eine Versicherung für hängendes Material?",
          answer:
            "Wir versichern unsere Mietsachen über eine Maschinen-/Inhaltsversicherung. Für Sach- und Personenschäden auf der Veranstaltung ist eine Veranstalterhaftpflichtversicherung des Mieters Pflicht – jeder gewerbliche Veranstalter hat das ohnehin, für Privatpersonen ist eine erweiterte Haftpflicht oder eine Eventversicherung sinnvoll. Wir weisen darauf bei Buchung von Trusskonstruktionen explizit hin.",
        },
      ],
      expertSections: [
        {
          h3: "Truss-Statik verstehen: UDL, CPL und 1/3-Punkt-Regel",
          paragraphs: [
            "Herstellerdatenblätter für Truss geben drei zentrale Werte an: UDL (Uniformly Distributed Load, gleichverteilte Last über die ganze Länge), CPL (Center Point Load, eine Punktlast in der Mitte) und 1/3-Point oder 1/4-Point-Loading (zwei oder drei symmetrische Punkte). Beispiel 290er Box-Truss, 6 m Spannweite: UDL ca. 350 kg, CPL ca. 150 kg, 1/3-Punkt-Lasten 2 × 175 kg. Die Hängung an zwei Punkten im 1/4-Bereich ist statisch deutlich günstiger als ein einziger Punkt mittig.",
            "Für Krefelder Setups planen wir Hängung in Lastpunkten – nicht \"auf gut Glück\". Schwere Geräte (Moving Heads, große Lautsprecher) hängen direkt unter einem Anschlagpunkt, leichte Wash-Lichter dazwischen. Das halbiert die effektive Biegelast und ist die professionelle Vorgehensweise.",
          ],
        },
        {
          h3: "Anschlagmittel: Rundschlinge, Stahlseil, Schäkel",
          paragraphs: [
            "Rundschlingen (Polyester, farbcodiert nach Tragfähigkeit: violett 1 t, grün 2 t, gelb 3 t, grau 4 t, rot 5 t, braun 6 t) sind das Standard-Anschlagmittel im Veranstaltungsbau. Sie sind leicht, schonen die Decke und sind nach DIN EN 1492-2 normiert. Wichtig: nicht über scharfe Kanten ziehen (Trägerflansch) – sonst Faserbruch. Stahlseile (DIN EN 13414) sind robuster gegen Kanten und Hitze, aber schwerer.",
            "Schäkel: omega- oder dee-förmig, in Güteklasse 6 oder 8, mit WLL-Aufprägung am Bügel. Niemals lose Schrauben oder Eigenbau-Lösungen verwenden. Wir liefern am Standort Krefeld nur geprüfte Anschlagmittel mit aktueller Prüfplakette (jährliche Sichtprüfung dokumentiert nach DGUV Grundsatz 309-007).",
          ],
        },
        {
          h3: "Kettenzüge: manuell vs. elektrisch, D8 und D8+",
          paragraphs: [
            "Manuelle Kettenzüge (Stirnradflaschenzug) heben mit Handkette – günstig, langsam, max. ca. 250 kg, für Trauerhöhungen und kleine Lasten. Elektro-Kettenzüge sind die Arbeitspferde der Veranstaltungsbranche: 250 kg, 500 kg, 1.000 kg WLL. Im Veranstaltungsbau über Personenköpfen muss der Kettenzug in der Ausführung \"D8+\" (mit zusätzlicher Sicherungsbremse, 10-facher Sicherheit) ausgeführt sein – \"D8\" reicht nur für Lasten, die nicht über Personen geführt werden.",
            "Im Krefelder Mietsortiment führen wir je nach Setup-Größe geprüfte D8-Hebezeuge mit aktueller Sachverständigenprüfung. Für gewerbliche Veranstalter mit Personenhängung empfehlen wir D8+-Geräte und Vermittlung eines IHK-Sachkundigen für den Aufbau.",
          ],
        },
        {
          h3: "Outdoor und Windlast: DIN EN 1991-1-4 praxisnah",
          paragraphs: [
            "DIN EN 1991-1-4 berechnet Windlast als q = ½·ρ·v². Für 50 km/h Wind (14 m/s) ergibt sich Staudruck von ca. 120 N/m². Ein 4 × 6 m Banner bei 50 km/h heißt also 24 m² × 120 N/m² = 2.880 N (≈ 290 kg) seitliche Belastung – ohne Ballast oder Verankerung kippt der Tower. Bei 80 km/h (Sturmböe Bft 9) sind es 730 N/m² – das Vierfache.",
            "Standard-Ballast aus Beton wiegt 25 kg pro Modul, Standard-Tower brauchen 8–16 Module (200–400 kg pro Standfuß) für Bühnendächer. Alternative: Erdanker (Schrauben oder Erdspieße) für Rasen-/Erdboden. Bei harten Untergründen (Asphalt, Beton) ist Ballast die einzige Option. Bei Windwarnung über Bft 8 wird das System abgebaut oder abgesenkt.",
          ],
        },
        {
          h3: "Prüfung und Doku: was Veranstalter vorhalten müssen",
          paragraphs: [
            "Gewerbliche Veranstalter müssen nach DGUV V17/V18 für jede Veranstaltungstechnik vorhalten: Gefährdungsbeurteilung (Arbeitsschutzgesetz § 5), Herstellerdatenblätter der Mietsachen, Sachkundenachweis der eingesetzten Personen, Aufbau-/Abbauplan, Prüfprotokolle der Anschlagmittel. Wir liefern als Vermieter am Standort Krefeld Datenblätter und Prüfplaketten – die Gefährdungsbeurteilung erstellt der Veranstalter (Beratung möglich).",
            "Für Privat-Events (Hochzeit, Geburtstag, geschlossener Kreis) gelten diese Pflichten nicht – hier reicht eine sachgerechte Einweisung an unserem Standort. Sobald die Veranstaltung öffentlich, gewerblich oder über 200 Besucher in der Halle umfasst, greift SBauVO NRW Teil 5 und die Pflichten gelten vollständig.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // KOMMUNIKATION (Funkgeräte, Headsets, Intercom)
    // Quellen: BNetzA-Allgemeinzuteilung PMR446 (Vfg. 28/2017,
    //   anmelde-/gebührenfrei, 446,0–446,2 MHz, 16 Kanäle,
    //   max. 500 mW), Allgemeinzuteilung dPMR446/DMR446
    //   (Vfg. 33/2014), Betriebsfunk im 410–470 MHz Bereich
    //   (Einzelzuteilung), DECT 1880–1900 MHz (anmeldefrei).
    //   BOS-Funk ausschließlich für Behörden – KEINE Vermietung.
    // -------------------------------------------------------------
    kommunikation: {
      faqs: [
        {
          question: "Welche Funkgeräte sind in Deutschland anmeldefrei – PMR446 erklärt",
          answer:
            "PMR446 ist der Standard für anmeldefreie Handfunkgeräte in Deutschland und der EU. BNetzA-Allgemeinzuteilung Vfg. 28/2017: 16 Kanäle im Bereich 446,0–446,2 MHz, max. 500 mW Sendeleistung, fest angebaute Antenne. Damit erreicht man im Außenbereich (freie Sicht) typisch 2–4 km, in der Stadt mit Bebauung 300–800 m, in Gebäuden 1–3 Etagen. Reicht für Veranstaltungsabsprache, Baustellenkoordination, kleine Festivals. Am Standort Krefeld führen wir PMR446-Geräte als Standard – sofortiger Einsatz ohne Anmeldung möglich.",
        },
        {
          question: "Wie viele Funkgeräte brauche ich – pro Person oder mehrere Gruppen?",
          answer:
            "Faustregel: 1 Gerät pro Funktion. Für Veranstaltungsleitung, Bühne, Einlass, Bar, Catering empfiehlt sich je ein eigenes Gerät – ggf. auch je ein eigener Kanal. PMR446 hat 16 Kanäle (mit CTCSS/DCS-Codes weitere virtuelle Trennung). Bei Hochzeiten und kleinen Firmen-Events kommt man mit 4–6 Geräten aus, bei Festivals und Großhochzeiten 10–20+. Wir konfigurieren und übergeben am Standort Krefeld vorprogrammiert mit dem gleichen Kanal.",
        },
        {
          question: "Headset oder Hand-PTT – was ist praktischer?",
          answer:
            "Headset (Bügel- oder Nackenbügel) mit PTT-Taste am Kabel ist Standard für Personal mit beiden Händen voll (Sicherheitsdienst, Bühnencrew, Service). Hand-PTT mit Lautsprecher reicht für Veranstaltungsleitung und Außenbereich. Profi-Headsets mit Geräuschunterdrückung (Noise Cancelling) sind für laute Locations (Bühne nahe Lautsprecher) sinnvoll – wir empfehlen je Einsatz und Lärmumgebung am Standort Krefeld.",
        },
        {
          question: "Reichweite – stimmen die \"bis zu 10 km\" auf der Verpackung?",
          answer:
            "Die Herstellerangaben \"bis zu 10 km Reichweite\" gelten unter Idealbedingungen (freie Sicht, See, Wüste, beide Geräte auf Berggipfeln). In der Praxis erreicht PMR446 in der Stadt 300–800 m, im Freien mit Bebauung 1–2 km, im Wald oder Tal entsprechend weniger. Für größere Reichweiten (Festival mit 1 km Länge, große Baustelle, Industrieanlage) braucht es Einzelzuteilung im Betriebsfunk – aufpreispflichtig, aber bis zu 5 W Sendeleistung erlaubt.",
        },
        {
          question: "Was ist der Unterschied zwischen analog und digital (DMR)?",
          answer:
            "Analoge PMR446-Geräte: einfach, robust, kompatibel mit allen anderen analogen PMR446-Geräten herstellerübergreifend. Reichweite und Sprachqualität nehmen mit zunehmendem Abstand allmählich ab. Digital (dPMR/DMR im 446-Band, BNetzA Vfg. 33/2014): bessere Sprachqualität bis zur Reichweitengrenze (dann abrupter Abbruch), mehr Funktionen (Display, Textnachrichten, Verschlüsselung), zwei Sprachkanäle pro Frequenz möglich. Am Standort Krefeld führen wir beide Varianten.",
        },
        {
          question: "Kann ich Funkgeräte über mehrere Etagen oder im Keller nutzen?",
          answer:
            "Beton- und Stahlwände dämpfen Funksignale stark; ein PMR446-Gerät übersteht typisch 1–3 Stahlbeton-Etagen, im Tiefkeller je nach Bauweise gar nicht. Lösungen: (a) DECT-Intercom für gebäudeinterne Kommunikation (1880–1900 MHz, anmeldefrei, mit Repeater bis 50+ Etagen möglich), (b) Mobilfunk-PTT-Lösungen (4G/5G-basiert, deutschlandweit, monatliche SIM-Gebühr), (c) Betriebsfunk-Anlage mit Repeater im Gebäude (Einzelzuteilung BNetzA, kostenpflichtig).",
        },
        {
          question: "Akku-Laufzeit – reicht das für einen Tag?",
          answer:
            "Standard-PMR446-Geräte mit Li-Ion-Akku halten typisch 8–12 Stunden im normalen Mischbetrieb (Senden/Empfangen 5/5/90: 5 % senden, 5 % empfangen, 90 % stand-by). Bei intensiver Nutzung (Sicherheitsdienst, ständige Kommunikation) eher 6–8 Stunden. Für Mehrtageseinsätze geben wir Ersatz-Akkus oder Mehrfach-Lader (4er- oder 6er-Ladeschalen) mit. Akkus werden vor Ausgabe vollgeladen übergeben.",
        },
        {
          question: "Brauche ich für Funkgeräte auf einer Baustelle in Krefeld eine Genehmigung?",
          answer:
            "Für PMR446-Geräte: nein. Allgemeinzuteilung BNetzA, anmelde- und gebührenfrei, in ganz Deutschland und der EU zulässig. Für Betriebsfunk-Geräte (höhere Leistung, eigene Frequenz): ja, Einzelzuteilung bei der BNetzA mit jährlicher Gebühr und Standortbindung. Für BOS-Funk (Feuerwehr, Polizei, Rettungsdienst): ausschließlich autorisierte Organisationen; wir vermieten keinen BOS-Funk. Für Baustellenalltag in Krefeld sind PMR446-Geräte die Standardlösung.",
        },
        {
          question: "Wie ist die Sprachqualität bei lauter Umgebung (Konzert, Baustelle)?",
          answer:
            "Mit Standard-Headset und PTT-Mikro vor dem Mund ist Sprache bis ca. 90 dB(A) Umgebungsgeräusch verständlich. In sehr lauten Umgebungen (Front-of-House Konzert, Bohrhammereinsatz) empfiehlt sich ein Profi-Headset mit Boom-Mikrofon und aktiver Noise-Cancellation oder ein Kehlkopfmikrofon (kontaktmikrofonisch direkt am Kehlkopf, nimmt Umgebungsgeräusche nicht auf). Solche Spezialheadsets vermieten wir am Standort Krefeld auf Anfrage.",
        },
        {
          question: "Werden die Geräte vor Ausgabe geprüft und gereinigt?",
          answer:
            "Ja. Jedes Gerät durchläuft vor Ausgabe einen Funktionscheck (Sende-/Empfangstest, Akkuspannung, Tastenfunktion). Headset-Ohr-Auflagen und Mikro-Windschutz werden gereinigt bzw. ausgetauscht – hygienisch wichtig bei Personenwechsel. Programmierung auf den gewünschten Kanal erfolgt vor Übergabe; wir notieren den verwendeten Kanal auf dem Übergabeschein, damit die ganze Crew startklar ist.",
        },
      ],
      expertSections: [
        {
          h3: "PMR446 vs. Betriebsfunk vs. LTE-PTT: was lohnt wann?",
          paragraphs: [
            "PMR446: anmelde- und gebührenfrei, max. 500 mW, Reichweite stadttypisch 300–800 m, ideal für Veranstaltungen, kleine Baustellen, Outdoor-Events. Betriebsfunk (Einzelzuteilung BNetzA, 410–430 MHz oder 440–470 MHz): bis 5 W Sendeleistung, ca. 5-fache Reichweite, jährliche Frequenzgebühr (typisch 100–500 € je nach Standort und Anzahl), ortsgebunden – lohnt für stationäre Betriebe (Industriestandort, Großlager).",
            "LTE-PTT (Push-to-Talk über Mobilfunk): deutschland- bzw. weltweit Reichweite, monatliche SIM-Gebühr pro Gerät (ca. 10–25 € pro Gerät und Monat), Abhängigkeit von Mobilfunkabdeckung. Lohnt für verteilte Teams (Außendienst, Servicetechniker). Im Mietkreislauf am Standort Krefeld führen wir PMR446 als Standard; Betriebsfunk und LTE-PTT auf Projektbasis nach Absprache.",
          ],
        },
        {
          h3: "CTCSS, DCS und virtuelle Kanaltrennung",
          paragraphs: [
            "PMR446 hat 16 physikalische Kanäle. Damit auf einem Kanal mehrere Gruppen parallel sprechen können, ohne sich gegenseitig zu hören, gibt es CTCSS (Continuous Tone-Coded Squelch System, 38 sub-audible Tonsignale) und DCS (Digital Coded Squelch, 83 digitale Codes). Beide Verfahren öffnen die Lautsprecher nur, wenn der passende Sub-Code mitgesendet wird. Achtung: das schützt nur den Empfang – andere Gruppen können dich trotzdem hören und stören.",
            "Praktische Folge für Krefelder Veranstaltungen: bei einer Großhochzeit mit getrennten Teams (Catering, Service, Sicherheit) belegen wir 3 verschiedene Kanäle, nicht 3 Sub-Codes auf einem Kanal – das reduziert Funkchaos und Störungen erheblich.",
          ],
        },
        {
          h3: "Headset-Qualität: warum \"billig\" auf Dauer teuer wird",
          paragraphs: [
            "Konsumer-Headsets aus dem 10–30-€-Segment haben dünne Kabel, instabile PTT-Mechanik und schlechte Mikrofone. Auf einer Veranstaltung mit 8 Stunden Dauereinsatz fallen sie typischerweise aus (Kabelbruch am Stecker), und das schwache Mikro überträgt Umgebungslärm statt Sprache. Profi-Headsets im 80–200-€-Segment haben verstärkte Kabel, Metall-PTT und Geräuschdämpfung.",
            "Wir vermieten am Standort Krefeld nur Profi-Headsets – die langfristig günstigere Wahl, weil keine Ausfälle während der Veranstaltung. Bei besonders kritischen Setups (TV-Produktion, Konferenz mit Simultandolmetschern) führen wir auch echte Intercom-Systeme mit kabelgebundener oder DECT-Anbindung.",
          ],
        },
        {
          h3: "Reichweiten in der Praxis: Beispiele aus Krefeld",
          paragraphs: [
            "Beispiel 1: Hochzeit in einem Park-Pavillon (200 × 100 m Gelände): PMR446 reicht problemlos vom Eingang bis zur Tanzfläche, Headsets für 6 Personen empfohlen. Beispiel 2: Firmen-Event in einer 5-stöckigen Krefelder Industriehalle: Betonwände dämpfen massiv, PMR446 bis 2 Etagen brauchbar – für die ganze Halle empfehlen wir DECT-Intercom mit Repeater oder LTE-PTT.",
            "Beispiel 3: Sicherheitsfunk auf einem Stadtfest in der Krefelder Innenstadt (500 × 300 m, dichte Bebauung, viele Funkquellen): PMR446 funktioniert, aber wir empfehlen vorab einen Testtag mit den finalen Geräte-Positionen. Bei Großevents (mehr als 5.000 Besucher) lohnt sich Einzelzuteilung Betriebsfunk – wir vermitteln bei Bedarf.",
          ],
        },
        {
          h3: "DECT-Intercom: die unterschätzte Lösung für Hallen und Gebäude",
          paragraphs: [
            "DECT (Digital Enhanced Cordless Telecommunications) arbeitet im 1880–1900-MHz-Band, ist anmeldefrei und in jedem Schnurlostelefon enthalten. Profi-Intercom-Systeme nutzen denselben Standard mit erweiterten Funktionen (Konferenz-Modus, Privacy-Channel, Headset-Anbindung). Vorteile: stabile Sprachqualität, gute Gebäudedurchdringung mit Repeater, Verschlüsselung ab Werk.",
            "Für Krefelder Konferenz-Locations, Hotelsäle und Industriehallen ist DECT-Intercom oft die professionellere Wahl als PMR446 – einfacher Aufbau (Basisstation an Steckdose, Headsets pairen sich automatisch), bis zu 8 simultane Gespräche pro Basisstation, Reichweite 50 m indoor, 300 m outdoor pro Basis. Wir führen DECT-Intercom-Sets am Standort Krefeld und beraten zum passenden Setup.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // MÖBEL & ZELTE (Partyzelte, Pagodenzelte, Bierzeltgarnituren,
    //   Stehtische, Stühle, Tische, Zubehör)
    // Quellen: DIN EN 13782 (Fliegende Bauten – Zelte, Sicherheits-
    //   anforderungen), DIN EN 13814 (Fliegende Bauten und
    //   Anlagen für Veranstaltungsplätze und Vergnügungsparks),
    //   SBauVO NRW Teil 5 (Versammlungsstätten), Musterrichtlinie
    //   über den Bau und Betrieb Fliegender Bauten (MFlBauR 2015),
    //   DIN EN 1991-1-4 (Windlasten), DIN 4102-1 / EN 13501-1
    //   (Brandverhalten – B1/Cs3d0), DGUV Information 215-313
    //   (Veranstaltungs- und Produktionsstätten).
    // -------------------------------------------------------------
    "moebel-zelte": {
      faqs: [
        {
          question: "Welche Zeltgröße brauche ich für wie viele Gäste in Krefeld?",
          answer:
            "Faustregel: Bei Stehempfang (Stehtische, kein bestuhlter Bereich) rechnet man ca. 0,5–0,8 m² pro Person, beim Sitzdinner an Bierzeltgarnituren ca. 0,8–1,0 m², bei Bankett-Bestuhlung mit runden Tischen ca. 1,2–1,5 m². Für 60 Personen Sitzdinner ist damit ein 5 × 10 m Partyzelt (50 m²) bereits zu klein – realistisch sind 6 × 12 m. Wir beraten am Hauptsitz Krefeld zur passenden Größe inklusive Tanzfläche, Buffet- und Bar-Bereich.",
        },
        {
          question: "Sind Partyzelte ab einer bestimmten Größe genehmigungspflichtig?",
          answer:
            "Für reine private Nutzung auf Privatgrund ohne öffentlichen Zugang sind die in Krefeld üblichen Garten-Partyzelte (bis 75 m²) regelmäßig genehmigungsfrei. Sobald die Veranstaltung öffentlich zugänglich ist oder das Zelt eine Grundfläche über 75 m² hat (§ 73 BauO NRW i. V. m. der Musterrichtlinie Fliegende Bauten), ist eine Ausführungsgenehmigung (\"Prüfbuch nach DIN EN 13782/13814\") erforderlich. Für unsere Mietzelte stellen wir auf Anfrage die Herstellerunterlagen (Standsicherheitsnachweis, Brandschutznachweis) zur Verfügung – die Genehmigung muss der Veranstalter beim Bauordnungsamt der Stadt Krefeld einholen.",
        },
        {
          question: "Wie windstabil sind die Zelte – ab welcher Windgeschwindigkeit muss abgebaut werden?",
          answer:
            "Klassische Partyzelte (PE-Plane, Steckgestänge) sind nach Herstellerangabe in der Regel bis Windstärke 5 Bft (ca. 38 km/h / 10,7 m/s) zugelassen. Professionelle Pagoden- und Profizelte mit Aluminium-Tragwerk und PVC-Plane gemäß DIN EN 13782 sind bei korrekter Verankerung deutlich höher belastbar – die exakten Werte stehen im Prüfbuch des jeweiligen Zeltes. Verbindlich für die Auslegung ist DIN EN 1991-1-4 (Eurocode 1). Bei Sturmwarnung des DWD ist der Veranstalter verpflichtet, das Zelt zu räumen und ggf. abzubauen.",
        },
        {
          question: "Wie wird ein Partyzelt fachgerecht verankert?",
          answer:
            "Auf Rasen/Erdreich werden Heringe mit mindestens 50 cm Länge je Eckpunkt eingeschlagen, bei größeren Zelten zusätzliche Sturmabspannungen. Auf Pflaster oder Asphalt kann nicht in den Boden geschlagen werden – hier arbeiten wir mit Ballastgewichten (Beton- oder Wassertanks), üblich sind 50–80 kg pro Eckpunkt für Standard-Partyzelte, bei Profizelten nach Standsicherheitsnachweis deutlich mehr (oft 150–300 kg). Wir liefern Heringe standardmäßig mit; Ballastgewichte können auf Anfrage organisiert werden.",
        },
        {
          question: "Welche Brandschutzanforderungen gelten für Zeltplanen und Möbel?",
          answer:
            "Bei genehmigungspflichtigen Fliegenden Bauten muss die Plane mindestens schwer entflammbar nach DIN 4102-1 Klasse B1 bzw. EN 13501-1 Klasse C-s3,d0 sein – Nachweis über das Prüfbuch des Herstellers. Für Tischdecken und Dekomaterialien in Versammlungsstätten nach SBauVO NRW Teil 5 gilt dieselbe Anforderung. Unsere vermieteten Profizelte erfüllen B1; klassische Garten-Partyzelte (privat genutzt) sind regelmäßig nicht zertifiziert – das ist bei rein privater Nutzung außerhalb von Versammlungsstätten zulässig.",
        },
        {
          question: "Wie viele Bierzeltgarnituren brauche ich für meine Veranstaltung?",
          answer:
            "Eine Standard-Bierzeltgarnitur (Tisch 220 × 50 cm + 2 Bänke à 220 × 25 cm) bietet 8–10 Sitzplätze (4–5 je Bank). Für 60 Gäste sind also 6–8 Garnituren realistisch. Für reine Bewirtungsbereiche (Bier-/Wein-Stehausschank) reichen Stehtische à 4–6 Personen. Wir empfehlen am Standort Krefeld immer 10–15 % Reserveplätze einzuplanen, weil sich Gruppen ungleich verteilen.",
        },
        {
          question: "Welche Stuhl- und Tischformate sind für ein Bankett oder eine Hochzeit üblich?",
          answer:
            "Für Bankett werden meist runde Tische mit 160 cm Durchmesser eingesetzt (8–10 Personen pro Tisch) oder rechteckige Bankett-Tische 180/200 × 80 cm (6–8 Personen). Als Bestuhlung sind Bankett-Stühle (gepolstert, stapelbar) oder Chiavari-Stühle (klassisch, holzfarben) Standard. Wir führen am Hauptsitz Krefeld Bankett-Stühle und Tische in haushaltsüblichen Mengen; Sonderformate (Lounge-Möbel, Loungesessel, Theken-Sets) auf Anfrage.",
        },
        {
          question: "Wie ist der Auf- und Abbau organisiert – mit oder ohne Personal?",
          answer:
            "Zelte bis 5 × 10 m können geübte Selbstbauer mit 3–4 Personen in 1,5–2 Stunden aufbauen. Ab 6 × 12 m und für alle Pagoden- und Profizelte empfehlen wir den Aufbauservice durch unser Team – aus Sicherheits- und Standsicherheitsgründen (Standsicherheitsnachweis erfordert fachgerechten Aufbau). Möbel werden in der Regel auf Paletten geliefert; Auf- und Abbau der Möbel übernimmt üblicherweise der Veranstalter. Aufbauservice kalkulieren wir nach Aufwand und Anfahrt – Anfrage über unser Buchungsformular am Standort Krefeld.",
        },
        {
          question: "Was ist beim Heizen oder Beleuchten im Zelt zu beachten?",
          answer:
            "Heizpilze und Gas-Heizstrahler sind in geschlossenen Zelten nicht zulässig (CO-Gefahr, DGUV 213-056). Für beheizte Zelte gibt es Direktluft-Heizgeräte mit Außenaufstellung und Warmluftschlauch ins Zelt; in unserer Kategorie Heizung & Trocknung verfügbar. Beleuchtung über Niedervolt-LED oder vorschriftsmäßig installierte 230-V-Anlagen nach DIN VDE 0100-711. Offene Flammen (Kerzen, Fackeln) im B1-Zelt nur mit feuersicherer Halterung und Abstand zu Planen – siehe SBauVO NRW Teil 5.",
        },
        {
          question: "Bis wann muss ich Zelt und Möbel reservieren – besonders in der Hochsaison?",
          answer:
            "Für die Hauptsaison Mai–September empfehlen wir am Standort Krefeld eine Vorlaufzeit von mindestens 4–6 Wochen, für Großzelte und komplette Hochzeits-Setups 8–12 Wochen. Spontane Termine sind möglich, aber Verfügbarkeit dann eingeschränkt. Tagesaktuelle Verfügbarkeit zeigen wir im Buchungsprozess pro Artikel; verbindliche Reservierung erst nach Auftragsbestätigung.",
        },
      ],
      expertSections: [
        {
          h3: "Fliegende Bauten in NRW: Prüfbuch, Genehmigung und Veranstalterpflichten",
          paragraphs: [
            "Ein \"Fliegender Bau\" im Sinne des § 73 BauO NRW ist ein Bau, der wiederholt aufgestellt und zerlegt wird – dazu zählen Partyzelte ab 75 m² Grundfläche, Bühnen ab 5 m Tiefe und alle Tribünen. Für solche Bauten verlangt die Musterrichtlinie über den Bau und Betrieb Fliegender Bauten (MFlBauR 2015) eine Ausführungsgenehmigung. Diese wird vom Hersteller einmal beantragt, in das Prüfbuch eingetragen und ist bundesweit gültig.",
            "Der Veranstalter muss das Prüfbuch am Aufstellungsort vorhalten und die jeweilige Gebrauchsabnahme bei der zuständigen Bauaufsicht (in Krefeld: Fachbereich Bauaufsicht) anzeigen bzw. bei größeren Zelten beantragen. Wir stellen für unsere genehmigungspflichtigen Mietzelte das Prüfbuch des Herstellers zur Verfügung – die Anzeige bzw. Genehmigung beim Bauamt Krefeld bleibt Aufgabe des Veranstalters.",
          ],
        },
        {
          h3: "Standsicherheit und Windlasten nach DIN EN 1991-1-4",
          paragraphs: [
            "Krefeld liegt in der Windzone 2 nach DIN EN 1991-1-4/NA mit einer Bezugsgeschwindigkeit von 25 m/s (= 90 km/h) im Binnenland. Die Standsicherheitsnachweise unserer Profizelte berücksichtigen diese Last; klassische Garten-Partyzelte sind hingegen typischerweise nur bis 38 km/h Wind ausgelegt (Herstellerangabe). Für die Praxis bedeutet das: bei aufziehender Schlechtwetterlage rechtzeitig DWD-Warnungen prüfen und im Zweifel das Zelt vorsorglich räumen.",
            "Verankerung ist ein zweiter sicherheits­relevanter Punkt. Auf Rasen reichen Standard-Heringe; auf versiegelten Flächen müssen Ballaste eingesetzt werden, deren Masse aus dem Standsicherheitsnachweis hervorgeht. Verankerungspunkte und Ballastlasten sind nicht verhandelbar – sie sichern Personen, nicht nur das Zelt.",
          ],
        },
        {
          h3: "Brandverhalten: B1, Cs3d0 und die SBauVO NRW",
          paragraphs: [
            "Bei Versammlungsstätten nach SBauVO NRW Teil 5 (ab 200 Personen in Räumen, ab 1.000 Personen im Freien) müssen Planen, Vorhänge und Dekorationsmaterialien mindestens \"schwer entflammbar\" sein – das entspricht der alten DIN 4102-1 Klasse B1 bzw. der EU-Brandklasse C-s3,d0 nach DIN EN 13501-1. Maßgeblich ist der Nachweis über das Materialdatenblatt mit Prüfzeugnis.",
            "Unsere Profi-Pagodenzelte und großen Partyzelte erfüllen diese Klasse und werden mit Datenblatt geliefert. Für Tischdecken und Dekoration empfehlen wir, beim Stoff- oder Dekoanbieter ein B1-Zertifikat einzufordern – der Veranstalter haftet im Brandfall mit.",
          ],
        },
        {
          h3: "Bestuhlungs- und Flächenplanung: realistische Quadratmeter pro Person",
          paragraphs: [
            "Die häufigste Fehleinschätzung bei Eigenplanung von Hochzeiten und Firmenfeiern ist eine zu enge Bestuhlung. Verbindliche Orientierungswerte aus der Versammlungsstätten-Praxis: Stehempfang 0,5 m²/Person, Reihenbestuhlung (Trauung, Vortrag) 0,8 m²/Person, Bankett mit runden Tischen 1,2–1,5 m²/Person, Tanzfläche zusätzlich 0,5–0,8 m²/tanzendem Gast.",
            "Hinzu kommen Funktionsflächen: Buffet 1,5–2 m² pro lfd. Meter Buffetkante, Bar 4–6 m² je Theke, DJ/Band-Bühne 6–15 m² je nach Setup. Wir kalkulieren das im Beratungsgespräch am Hauptsitz Krefeld konkret für deine Gästezahl und Eventform.",
          ],
        },
        {
          h3: "Lieferung im Niederrhein-Raum: was wir abdecken",
          paragraphs: [
            "Vom Hauptsitz Krefeld-Fichtenhain (Anrather Straße 291) liefern wir Zelte und Eventmöbel im gesamten Niederrhein- und Düsseldorf-Korridor: Krefeld, Meerbusch, Willich, Tönisvorst, Kempen, Viersen, Mönchengladbach, Neuss, Düsseldorf-Linksrheinisch und Duisburg-Süd. Für größere Setups (komplette Hochzeit, Firmenjubiläum, Tagung) kalkulieren wir Anlieferung, Aufbau, Abbau und Rückführung als Paket – das spart dir Logistik und stellt sicher, dass die Standsicherheit gegeben ist.",
            "Selbstabholung von Bierzeltgarnituren, Stehtischen, Stühlen und Kleinzelten ist möglich; benötigt wird ein passender Anhänger oder Transporter (auf Wunsch auch mietbar, siehe Kategorie Anhänger). Größere Zelte ab 5 × 10 m vermieten wir aus Sicherheitsgründen nur mit Lieferung und Aufbau durch unser Team.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // GESCHIRR, GLÄSER & BESTECK (Porzellan, Trinkgläser, Sektgläser,
    //   Champagnergläser, Besteck-Sets, Servierplatten)
    // Quellen: VO (EG) 852/2004 (Lebensmittelhygiene), Lebensmittel-
    //   hygiene-VO (LMHV), DIN 10510/10512 (gewerbliche Geschirr-
    //   spülung), DIN 10516 (Reinigung im Lebensmittelbereich),
    //   BfR-Empfehlung XXXVI (Materialien für Lebensmittelkontakt),
    //   VO (EG) 1935/2004 (Lebensmittelkontakt), Bedarfsgegenstände-
    //   verordnung (BedGgstV).
    // -------------------------------------------------------------
    "geschirr-glaeser-besteck": {
      faqs: [
        {
          question: "Wie viele Teller, Gläser und Besteck-Sets brauche ich pro Gast?",
          answer:
            "Für ein klassisches Drei-Gänge-Menü rechnet man pro Gast: 3 Teller (Vorspeise/flach, Hauptgang, Dessert), 1 Suppentasse, 3 Bestecksätze (Vorspeise, Hauptgang, Dessert) und 3 Gläser (Wasser, Wein, Sekt/Bier). Für Buffet ohne fixe Gänge eher 2–3 Teller pro Gast (Mehrfachnutzung). Für Sektempfang vor dem Essen 1,5–2 Sektgläser pro Gast einplanen. Wir empfehlen am Standort Krefeld eine Reserve von 10–15 % – Gläser gehen statistisch häufiger zu Bruch als Geschirr.",
        },
        {
          question: "Wird das Geschirr gespült geliefert oder muss ich selbst spülen?",
          answer:
            "Unser Mietgeschirr wird gewerblich nach DIN 10510/10512 gespült und geliefert – einsatzbereit verpackt in Stiegen. Nach der Veranstaltung gibst du es grob entleert (Speisereste abgeklopft) zurück; das Nachspülen übernehmen wir. Auf Wunsch kannst du gegen Aufpreis selbst nachspülen – dann muss das Geschirr trocken und schmutzfrei zurückkommen. Konditionen pro Artikelgruppe im Buchungsprozess hinterlegt.",
        },
        {
          question: "Welches Glas für welches Getränk – die kurze Eventliste",
          answer:
            "Faustregel: Sekt/Champagner → Sektflöte (Tulip) 17–20 cl, Wein weiß → Weißweinkelch 28–35 cl, Wein rot → Burgunderglas 45–60 cl, Wasser → Becher oder Wasserkelch 22–28 cl, Bier → Pils-Tulpe 30 cl (Norddeutsch) bzw. Stange 20 cl (Rheinland), Longdrink → 30–40 cl Tumbler. Für Krefelder Hochzeiten halten wir die Standardformate als Sets vor; spezielle Champagner- und Cocktailgläser auf Anfrage.",
        },
        {
          question: "Aus welchem Material sind die Mietgläser – Echtglas oder Polycarbonat?",
          answer:
            "Standardmäßig vermieten wir Echtglas (Kalk-Natron-Glas) – optisch und haptisch das Original und für Hochzeiten/Bankette die richtige Wahl. Für Outdoor-Events ohne befestigte Flächen, in Schwimmbädern oder bei Kinder-Events können Polycarbonat-Gläser sinnvoll sein (bruchsicher, lebensmittelecht, optisch sehr nah an Glas). Wir beraten am Standort Krefeld zur passenden Variante.",
        },
        {
          question: "Was passiert bei Bruch oder Verlust?",
          answer:
            "Bruch in haushaltsüblicher Höhe (typisch 1–3 % bei Gläsern) ist in der Mietkalkulation eingerechnet und kostenfrei. Über diesen Anteil hinausgehender Bruch oder Verlust wird zum Wiederbeschaffungspreis abgerechnet – die Stückpreise sind transparent in den AGB hinterlegt. Wir empfehlen, Gläser und Besteck nach dem Event in den Lieferstiegen sortiert zurückzustellen, das vereinfacht die Zählung erheblich.",
        },
        {
          question: "Sind die Materialien für den Lebensmittelkontakt zugelassen?",
          answer:
            "Ja. Sämtliches Geschirr, Besteck und alle Gläser entsprechen der EU-Rahmenverordnung (EG) 1935/2004 sowie der deutschen Bedarfsgegenstände-Verordnung (BedGgstV). Edelstahlbesteck ist üblicherweise aus 18/10 (X5CrNi18-10), Porzellan ist hartgebranntes Hotelporzellan, Gläser sind aus Kalk-Natron-Glas. Auf Anfrage stellen wir das Konformitätsdokument des Herstellers bereit.",
        },
        {
          question: "Welche Mengen führen wir am Standort Krefeld vor Ort?",
          answer:
            "Am Hauptsitz Krefeld halten wir die gängigen Sortimente für Veranstaltungen bis ca. 200 Personen direkt vor Ort vor (Hotelporzellan, Wein-/Wasser-/Sektgläser, 18/10-Besteck-Sets, Servierplatten, Kannen, Tabletts). Für Großevents über 200 Personen disponieren wir größere Stückzahlen mit ein paar Tagen Vorlauf. Konkrete Verfügbarkeit pro Artikelgruppe im Buchungsprozess.",
        },
        {
          question: "Wie wird Geschirr transportiert und gelagert?",
          answer:
            "Wir liefern Geschirr in stapelbaren Profi-Stiegen (Geschirrkörben), Gläser in Glas-Gitterkisten (jedes Glas in eigener Fachzelle, bruchsicher). Diese Behältnisse bleiben während der Mietzeit beim Kunden und werden zur Abholung wieder befüllt. Vorteil: kein Auspacken nötig, direkter Einsatz – nach dem Event einfach grob entleeren und zurück in die Stiege/Kiste stellen.",
        },
        {
          question: "Kann ich Geschirr und Möbel im Paket mieten?",
          answer:
            "Ja – wir stellen für Krefelder Veranstaltungen häufig komplette Setups zusammen: Zelt + Bierzeltgarnituren + Geschirr + Gläser + Besteck + Servierware aus einer Hand. Vorteil: ein Liefer-/Abholtermin, eine Rechnung, ein Ansprechpartner. Im Beratungsgespräch kalkulieren wir das Paket für deine konkrete Gästezahl und -form (Stehempfang, Bankett, Buffet, Brunch).",
        },
        {
          question: "Wie früh sollte ich Geschirr für eine Hochzeit reservieren?",
          answer:
            "Für Hochzeiten in der Hauptsaison (Mai–September, plus Dezember) empfehlen wir die Reservierung 6–10 Wochen vor dem Termin. Für die genaue Stückzahl reicht eine Vorab-Schätzung – die finale Menge stimmen wir typischerweise 10–14 Tage vor dem Termin ab, wenn die finale Gästezahl steht.",
        },
      ],
      expertSections: [
        {
          h3: "Mengenplanung für Hochzeiten und Bankette – konkrete Beispielrechnung",
          paragraphs: [
            "Beispiel 80-Personen-Hochzeit mit Sektempfang, Drei-Gänge-Menü und Abendbuffet: 80 × 2 Sektgläser (Empfang + Reserve) = 160 Sektflöten. 80 × 1 Wasserglas + 80 × 1 Weinglas weiß + 80 × 1 Weinglas rot = 240 Stielgläser. Für das Menü 80 × 3 Teller (Vorspeise, Haupt, Dessert) + 80 × 1 Suppentasse = 320 Teile Porzellan. Besteck: 80 × 3 Sätze (Vorspeise, Haupt, Dessert) à 3 Teile = 720 Besteckteile.",
            "Plus 10–15 % Reserve, plus Servierware (Salatschüsseln, Platten, Saucieren, Brotkörbe), plus Kaffeegedeck (Tasse, Untertasse, Kaffeelöffel, Kuchenteller, Kuchengabel) für die Tortenphase. Solche Setups stellen wir am Standort Krefeld auf Basis dieser Faustregeln zusammen – inklusive Buffer für Mehrgang-Wechsel ohne Spülpause.",
          ],
        },
        {
          h3: "Hygiene und Spülstandards: DIN 10510/10512 in der Praxis",
          paragraphs: [
            "Gewerbliches Geschirrspülen in Deutschland ist über DIN 10510 (Gläserspülen) und DIN 10512 (Geschirrspülen) geregelt. Beide Normen schreiben Mindesttemperaturen und Wasserhärte-/Reinigerwerte vor: Klarspülung bei 80–85 °C, Reinigung bei 55–65 °C, definierte Dosierung von Reiniger und Klarspüler. Damit wird die mikrobiologische Reinheit nach VO (EG) 852/2004 sichergestellt – verbindlich für jeden gewerblichen Mietkreislauf.",
            "Unser Spülprozess erfüllt diese Normen. Für dich heißt das praktisch: keine Nachspül-Pflicht vor Rückgabe, kein Risiko hinsichtlich Hygiene gegenüber deinen Gästen. Wer Reste antrocknen lässt, riskiert allerdings Aufpreise für Sonderreinigung – grob entleeren bleibt wichtig.",
          ],
        },
        {
          h3: "Materialkunde Glas: Kalk-Natron vs. Kristallglas vs. Polycarbonat",
          paragraphs: [
            "Kalk-Natron-Glas ist der Standard im Eventbereich: robust, spülmaschinenfest, lebensmittelecht, optisch ansprechend, günstig in der Wiederbeschaffung. Kristallglas (Bleikristall oder bleifreies \"Crystal\") ist optisch hochwertiger (höherer Brechungsindex, mehr Brillanz), aber empfindlicher und teurer – wird im Mietkreislauf selten eingesetzt. Polycarbonat (PC) ist bruchsicher, optisch sehr nah an Glas, lebensmittelecht – ideal für Pool, Garten, Kinder, Outdoor-Events ohne befestigte Flächen.",
            "Für klassische Krefelder Hochzeiten setzen wir Kalk-Natron-Echtglas ein – die gewohnte Optik und Haptik. Polycarbonat-Sets bieten wir für Außenbereiche und besondere Anlässe (Open-Air, Familienfeier mit Kindern, Yacht) an.",
          ],
        },
        {
          h3: "Besteck: 18/10, 18/0 und Stahlsorten im Vergleich",
          paragraphs: [
            "\"18/10\" bezeichnet die Legierung: 18 % Chrom (Korrosionsschutz) und 10 % Nickel (Glanz, Bearbeitbarkeit) – Werkstoff X5CrNi18-10, der Standard für Hotelbesteck. \"18/0\" ist nickelfrei, magnetisch, etwas matter – günstiger, aber für Bankett-Hochzeiten unüblich. Reine Edelstahlsorten ohne Chrom sind nicht spülmaschinenfest.",
            "Wir vermieten am Standort Krefeld ausschließlich 18/10-Besteck in Hotelqualität. Vorteil: spülmaschinenfest auch bei härterem Wasser (Krefelder Trinkwasser liegt bei 17–19 °dH), kein Anlaufen, langlebig – auch nach 100 Spülgängen sieht das Besteck noch hochwertig aus.",
          ],
        },
        {
          h3: "Lagerung, Transport und Bruchquoten in der Mietpraxis",
          paragraphs: [
            "Wir liefern Gläser in Glas-Gitterkisten (50er- und 25er-Einsätze, je nach Glasform), Porzellan in Geschirrkörben mit Trennzwischenlagen. Diese Verpackung minimiert Bruch im Transport. Während der Veranstaltung sind die häufigsten Bruchquellen: Servieren auf Schräglage, harte Untergründe (Steinplatten, Stahltische), Kinder und – statistisch nachweisbar – die letzte Stunde nach Mitternacht.",
            "Statistisch entstehen bei normalen Krefelder Hochzeitsabläufen Bruchquoten von 1–3 % bei Gläsern, < 1 % bei Porzellan, ≈ 0 % bei Besteck. Diese Werte sind in unserem Mietpreis eingerechnet; nur Bruch deutlich darüber wird gesondert berechnet. Tipp: leere Gläser zeitnah einsammeln lassen – das senkt die Bruchquote spürbar.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // SPEZIALEFFEKTE (Nebelmaschinen, Hazer, CO2-Effekte,
    //   Konfetti-/Streamer-Shooter, Bubble Maker, Pyro-Effekte)
    // Quellen: 1. BImSchV (Bundesimmissionsschutz – Anlagen),
    //   DGUV Information 215-313 (Veranstaltungs- und Produktions-
    //   stätten für szenische Darstellung), DGUV Regel 113-004
    //   (Behälter, Silos und enge Räume – Sauerstoffmangel CO2),
    //   ASR A3.6 (Raumlüftung), VStättVO/SBauVO NRW Teil 5,
    //   1. SprengV i. V. m. SprengG (Pyrotechnik – Befähigungs-
    //   schein nach § 20 SprengG, Klasse T1/T2), DIN 56950
    //   (Veranstaltungstechnik – Maschinerie), DIN EN 12198
    //   (Gefährdungen durch Strahlung), DGUV Information 215-310
    //   (Laser-Einrichtungen für Show- und Projektionszwecke).
    // -------------------------------------------------------------
    spezialeffekte: {
      faqs: [
        {
          question: "Sind Nebelmaschinen und Hazer in geschlossenen Räumen erlaubt?",
          answer:
            "Ja, sofern die eingesetzten Nebelfluide herstellerseitig für Veranstaltungseinsatz freigegeben sind (Wasser-Glykol-Basis bzw. Wasser-Glycerin-Basis, lebensmittelechte Komponenten) und die Raumlüftung gemäß ASR A3.6 (Arbeitsstättenregel Lüftung) sichergestellt ist. DGUV Information 215-313 gibt konkrete Hinweise zur szenischen Nebelnutzung. Wichtig: Brandmelder müssen für die Dauer des Nebeleinsatzes durch eine Brandsicherheitswache überbrückt werden – das stimmen wir am Standort Krefeld mit dem Veranstalter ab.",
        },
        {
          question: "Wo liegt der Unterschied zwischen Nebel, Haze und Dunst?",
          answer:
            "Nebel (Fog) ist eine dichte, sichtbare Wolke – ideal für Effekt-Cues, Bühnenbilder, Tanzeinlagen. Haze ist ein feiner, langanhaltender Schwebenebel, der Licht- und Laserstrahlen sichtbar macht (Stadium- und Konzert-Standard). Dunst ist Übergang zwischen Haze und sehr feinem Nebel. Wir führen am Standort Krefeld klassische Nebelmaschinen (DMX-gesteuert), Profi-Hazer (Wasserbasis) und kleine Bodennebel-Geräte für die jeweilige Anwendung.",
        },
        {
          question: "Welche Sicherheitsabstände gelten bei CO2-Effekten?",
          answer:
            "CO2-Effekte (Jets, Cryo-Guns, Stage-Cooler) arbeiten mit flüssigem Kohlendioxid aus Druckflaschen. Hauptgefahr ist Sauerstoffverdrängung in geschlossenen Räumen (CO2 ist schwerer als Luft) sowie Kälteverbrennungen am Strahlrohr (–78 °C). DGUV Regel 113-004 gibt Grenzwerte vor: ab 4 Vol.-% CO2 Lebensgefahr. Praktisch bedeutet das: CO2-Effekte nur in gut belüfteten Räumen oder Außenbereichen, Sicherheitsabstand 3 m zum Publikum, kein Einsatz in Tiefgaragen, Bühnenkellern und Räumen unter Erdniveau ohne Zwangsbelüftung.",
        },
        {
          question: "Brauche ich für Pyrotechnik auf einer Veranstaltung einen Befähigungsschein?",
          answer:
            "Ja. Pyrotechnische Effekte der Kategorie T1 (Bühnenpyrotechnik mit geringer Gefahr) und T2 (für nur fachkundige Personen) dürfen nur von Personen mit Befähigungsschein nach § 20 SprengG abgebrannt werden. Klasse F (Feuerwerk) ist davon getrennt geregelt. Wir vermieten Standard-Eventeffekte (Nebel, Haze, CO2, Konfetti, Streamer, Bubble) ohne Befähigungsschein-Pflicht; klassische Pyrotechnik (Bühnenfontänen, Funkenfontänen, Komet-Effekte) vermieten wir nur an Kunden mit nachgewiesenem Befähigungsschein oder vermitteln einen lizenzierten Pyrotechniker.",
        },
        {
          question: "Wie funktionieren Konfetti- und Streamer-Shooter – Druckluft oder CO2?",
          answer:
            "Handgeräte (Party-Popper, Hand-Shooter bis ca. 50 cm Wurfweite) sind mechanisch federgespannt. Stationäre Bühnen-Shooter arbeiten mit Druckluft (Kompressor) oder elektrisch gezündeten Druckkartuschen. Profi-Stadium-Shooter werden über CO2-Druckflaschen versorgt und erreichen Wurfweiten bis 20 m. Wir führen am Standort Krefeld den klassischen Veranstaltungsbedarf (Hand- und Standgeräte für Hochzeit und Firmenfeier); Bühnen-Stadium-Shooter auf Projektbasis.",
        },
        {
          question: "Welche Konfetti- und Streamer-Materialien sind umweltverträglich?",
          answer:
            "Klassisches Konfetti ist Papier (FSC-zertifiziert, biologisch abbaubar) oder Metallfolie (Mylar – glänzend, aber nicht biologisch abbaubar). Für Outdoor-Veranstaltungen, Hochzeiten in Naturgebieten und Open-Air-Events empfehlen wir Papierkonfetti aus FSC-Zellstoff – wirft sich gut, regnet schön, ist biologisch abbaubar. Foliekonfetti nur in Innenräumen einsetzen (Aufräumaufwand und Umweltbelastung).",
        },
        {
          question: "Welche Brandmelder-Konsequenzen haben Nebel und Haze?",
          answer:
            "Optische Rauchmelder (Standard in Hotels, Sälen, Industriehallen) sprechen auf Nebel und Haze an. Bei Veranstaltungen mit Nebeleinsatz muss die Brandmeldeanlage temporär durch eine Brandsicherheitswache (Feuerwehr-Mitarbeiter oder zertifizierter Sicherheits­wachdienst nach DGUV Vorschrift 17) ersetzt werden. Diese Wache muss vorab beim Betreiber/Bauamt angemeldet werden. Für Krefelder Veranstaltungsstätten ist das Routine; wir geben bei Buchung Hinweise.",
        },
        {
          question: "Wie laut sind CO2-Jets und Konfetti-Shooter – ist Gehörschutz nötig?",
          answer:
            "Druckluft-CO2-Jets erzeugen kurzzeitig 110–125 dB(C) Spitzenpegel. Nach DIN 15905-5 sind Spitzenpegel > 137 dB(C) ohne Gehörschutz für das Publikum unzulässig – die typischen Bühnen-CO2-Jets liegen darunter, aber Personen direkt am Effekt sollten Gehörschutz tragen. Konfetti-Shooter mit Druckluft liegen bei 100–110 dB(C), eher unkritisch.",
        },
        {
          question: "Sind Seifenblasen-Maschinen für Innenräume und Kinder geeignet?",
          answer:
            "Ja, sofern Profi-Bubble-Fluid auf Wasser-Tensid-Basis ohne reizende Zusatzstoffe verwendet wird (lebensmittelechte Tenside, nach REACH unbedenklich). Achtung: Seifenblasen hinterlassen einen rutschigen Film auf glatten Böden (Parkett, Steinplatten, Fliesen) – Sturzgefahr! Wir empfehlen den Einsatz nur über Teppichflächen oder im Außenbereich, oder mit nachträglicher Wischreinigung. Für Kinder-Events sind Bubbles ein beliebter Effekt; das Fluid ist hautverträglich.",
        },
        {
          question: "Wie steuere ich Effekte zentral – DMX, MIDI oder manuell?",
          answer:
            "Profi-Effektgeräte (Nebelmaschine, Hazer, CO2-Jet, Konfetti-Shooter) sind über DMX512 ansteuerbar – derselbe Standard wie Beleuchtung. Damit lassen sich Effekt-Cues zeitgenau mit dem Lichtprogramm synchronisieren. Bei kleineren Hochzeits-Setups reicht oft die mitgelieferte Funkfernbedienung (manueller Trigger durch DJ oder Hochzeitsplaner). Wir konfigurieren am Standort Krefeld auf Wunsch vor und übergeben einsatzbereit.",
        },
      ],
      expertSections: [
        {
          h3: "Nebelfluid-Kunde: Wasser-Glykol, Wasser-Glycerin und die Unterschiede",
          paragraphs: [
            "Profi-Nebelfluide bestehen aus deionisiertem Wasser plus einem Trägermedium – meist Propylenglykol (PG), Glycerin oder ein Gemisch. PG-Fluide erzeugen dichten, schnell wieder verschwindenden Nebel (gut für Effekt-Cues), Glycerin-Fluide produzieren feinen, langanhaltenden Haze (gut für Licht- und Lasersichtbarkeit). Wichtig: Nur Fluide einsetzen, die der Maschinenhersteller freigegeben hat – falsche Fluide verstopfen die Heizung und können bei Pyrolyse reizende Aldehyde freisetzen.",
            "DGUV Information 215-313 enthält Hinweise zu maximalen Konzentrationen und Lüftungsraten bei längerem Nebelbetrieb (mehrere Stunden). Bei Konzert- und Festival-Setups arbeiten Profi-Crews mit Messgeräten und Lüftungsmanagement. Für klassische Krefelder Hochzeitsdiscos bleibt der Nebeleinsatz weit unter den kritischen Grenzwerten.",
          ],
        },
        {
          h3: "CO2-Effekte: Sauerstoffverdrängung und Lüftungsplanung",
          paragraphs: [
            "Flüssiges CO2 expandiert bei Austritt ca. 800-fach. Eine 10-kg-Flasche liefert damit theoretisch 5 m³ gasförmiges CO2 – in einem unbelüfteten 25-m²-Raum (etwa 60 m³ Volumen) entstünde rechnerisch eine Konzentration von ca. 8 Vol.-%, was deutlich über der DGUV-Grenze von 4 Vol.-% liegt. In der Praxis verteilt sich das Gas natürlich; trotzdem gilt: CO2-Effekte nur in Räumen mit nachweislicher Lüftung (Frischluftrate nach ASR A3.6) oder im Außenbereich.",
            "Konkret nicht geeignet: Tiefgaragen, Bühnenkeller, Räume unter Erdniveau ohne Zwangsbelüftung, kleine Backstage-Bereiche. Geeignet: Säle mit RLT-Anlage, Hallen ab ca. 1.000 m³, Außenbühnen. Wir beraten am Standort Krefeld vor der Buchung anhand der konkreten Location.",
          ],
        },
        {
          h3: "Pyrotechnik in NRW: Befähigungsschein, Anzeige und Versicherung",
          paragraphs: [
            "Bühnenpyrotechnik (Funkenfontänen, Wasserfälle, Bühnenflammen, Knall-/Lichtblitzeffekte der Kategorie T1/T2) unterliegt dem Sprengstoffgesetz. Wer Pyrotechnik abbrennt, braucht einen Befähigungsschein nach § 20 SprengG (Lehrgang + Prüfung bei IHK oder anerkanntem Träger). Zusätzlich ist eine Anzeige beim Ordnungsamt der Stadt Krefeld bzw. der jeweiligen Gemeinde nötig (in der Regel 14 Tage vor dem Termin).",
            "Wir vermieten Standard-Eventeffekte (Nebel, Haze, CO2, Konfetti, Streamer, Bubble) ohne Befähigungsschein-Pflicht. Für klassische Pyrotechnik vermitteln wir lizenzierte Pyrotechniker in unserem Netzwerk – inklusive Versicherung, Anzeige und Brandsicherheits-Konzept.",
          ],
        },
        {
          h3: "Effekt-Cueing und DMX: Synchronisation mit Licht und Sound",
          paragraphs: [
            "Profi-Effektgeräte haben DMX512-Eingang (XLR 5-polig) und belegen 1–4 DMX-Kanäle (Trigger, Intensität, Dauer, manchmal Pan/Tilt). Damit lassen sie sich nahtlos in ein bestehendes Lichtsteuerpult (z. B. GrandMA, Avolites, Chamsys) integrieren und mit Lichtcues und Musikstellen exakt synchronisieren. Beispiel: Schlusschor einer Hochzeit – auf den letzten Beat zünden 4 Konfetti-Shooter simultan mit Lichtwechsel auf Weiß.",
            "Für kleinere Setups reicht die DMX-fähige App auf Tablet (z. B. LightKey, MagicQ) oder die mitgelieferte Funkfernbedienung. Wir übergeben am Standort Krefeld auf Wunsch programmiert und mit Bedien-Briefing.",
          ],
        },
        {
          h3: "Effekt-Wahl nach Anlass: was zu Hochzeit, Firmenfeier und Bühne passt",
          paragraphs: [
            "Hochzeit: klassisch Nebel für den ersten Tanz, Bubble-Maker für Sektempfang im Freien, Konfetti-Hand-Shooter beim Ja-Wort oder Tortenanschnitt, Papier-Konfetti-Kanonen beim Brautstrauß-Wurf. Romantisch, gut planbar, niedrige Sicherheits-Hürde. Firmenfeier (Saal, Disco): Haze + bewegtes Licht, ein bis zwei Konfetti-Shooter zu Highlight-Momenten (Mitarbeiter-Award, Auftritt der Geschäftsleitung).",
            "Live-Konzert/Bühne: Haze als Dauereffekt für Lasersichtbarkeit, CO2-Jets zu Refrain-Endpunkten, Konfetti-Stadium-Shooter zum Encore. Hier arbeiten wir mit Profi-Crew aus unserem Netzwerk. Festival-Outdoor: pyrotechnische Effekte (Befähigungsschein!), große CO2-Anlagen, Stadium-Shooter. Alles aus einem Netzwerk – Anfrage am Standort Krefeld.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // HÜPFBURGEN (Aufblasbare Spielgeräte)
    // Quellen: DIN EN 14960 (Aufblasbare Spielgeräte – Sicherheits-
    //   anforderungen und Prüfverfahren – aktuell Teil 1:2019),
    //   ProdSG (Produktsicherheitsgesetz), 1. ProdSV
    //   (Erste Produktsicherheitsverordnung), DGUV Information
    //   202-022 (Sicherheit bei Schul- und Gemeindeveranstaltungen),
    //   GS-Zeichen nach § 21 ProdSG, BGR/GUV-R für Aufsichts-
    //   personal.
    // -------------------------------------------------------------
    huepfburgen: {
      faqs: [
        {
          question: "Sind unsere Hüpfburgen nach DIN EN 14960 geprüft?",
          answer:
            "Ja. Sämtliche von uns vermieteten Hüpfburgen erfüllen die DIN EN 14960 \"Aufblasbare Spielgeräte – Sicherheitsanforderungen und Prüfverfahren\". Diese Norm regelt u. a. Stoßdämpfung der Aufprallflächen, max. Fallhöhen, Materialfestigkeit, Verankerungspunkte, Anzahl und Größe der Notausgänge sowie das jährliche Prüfintervall. Wir lassen jede Hüpfburg jährlich durch einen Sachkundigen prüfen und führen das Prüfprotokoll mit.",
        },
        {
          question: "Bis zu welcher Windstärke darf eine Hüpfburg betrieben werden?",
          answer:
            "DIN EN 14960 schreibt vor, dass aufblasbare Spielgeräte ab Windstärke 5 Beaufort (ca. 38 km/h, 10,8 m/s) außer Betrieb genommen werden müssen. In der Praxis bedeutet das: bei aufziehendem Wind den DWD-Wetterbericht prüfen, im Zweifel rechtzeitig schließen. Bei plötzlich auftretenden Böen über 38 km/h Hüpfburg sofort räumen und Gebläse abschalten (Hüpfburg fällt kontrolliert in sich zusammen) – nicht gegen den Wind aufgeblasen lassen.",
        },
        {
          question: "Wie wird eine Hüpfburg sicher verankert?",
          answer:
            "Auf Rasen: Erdnägel mit mindestens 380 mm Länge und 16 mm Durchmesser, eingeschlagen schräg vom Gerät weg, an allen Verankerungspunkten der Hüpfburg (typisch 6–12 Punkte je nach Größe). Auf festem Untergrund (Asphalt, Pflaster): Ballastsäcke oder Wassertanks mit der vom Hersteller im Prüfbuch dokumentierten Mindestlast – je nach Hüpfburggröße 80–300 kg pro Punkt. Wir liefern passende Erdnägel mit; Ballastgewichte können auf Anfrage organisiert werden.",
        },
        {
          question: "Wer haftet während der Veranstaltung – Vermieter oder Veranstalter?",
          answer:
            "Während des Betriebs übernimmt der Veranstalter die Verkehrssicherungspflicht. Das bedeutet: Aufsicht durch eine erwachsene Person, Einhaltung der vom Hersteller vorgegebenen Maximalpersonenzahl, Trennung von Kindern unterschiedlicher Altersgruppen (DIN EN 14960 empfiehlt getrennte Slots für 0–3, 3–6, 6–12 Jahre, weil das Verletzungsrisiko bei Mischung steigt). Wir stellen Hüpfburg geprüft, eingewiesen und verankert bereit; die laufende Aufsicht liegt beim Veranstalter.",
        },
        {
          question: "Wie viele Kinder dürfen gleichzeitig in eine Hüpfburg?",
          answer:
            "Die Maximalpersonenzahl ist im Prüfbuch und auf einem dauerhaft am Gerät angebrachten Schild ausgewiesen – sie ergibt sich aus DIN EN 14960 und der Größe/Stabilität der Hüpfburg. Klassische 4 × 4 m Hüpfburgen sind typischerweise für 6–8 Kinder gleichzeitig zugelassen, größere Anlagen entsprechend mehr. Wichtig: Personenzahl gilt für eine Altersgruppe – Kinder unterschiedlicher Größe niemals gleichzeitig hineinlassen.",
        },
        {
          question: "Wie ist der Aufbau – kommt das Gebläse mit, brauche ich Strom vor Ort?",
          answer:
            "Im Mietumfang enthalten sind: Hüpfburg, Gebläse, Befestigungs-Erdnägel, Sicherheitsanleitung mit Prüfbuch-Auszug. Du brauchst vor Ort: ebene Aufstellfläche (mind. 1 m Sicherheitsabstand rundum, möglichst Rasen), 230-V-Steckdose im Umkreis von ca. 25 m (Gebläse zieht je nach Größe 750–1.500 W, dauerhafter Betrieb über die gesamte Mietzeit). Aufbauzeit für eine klassische Hüpfburg 4 × 4 m: ca. 15–20 Minuten.",
        },
        {
          question: "Kann ich die Hüpfburg auf Asphalt oder Pflaster aufstellen?",
          answer:
            "Ja, mit Einschränkungen. Auf festem Untergrund kann der Boden der Hüpfburg durch scharfe Steine oder Splitter beschädigt werden – wir empfehlen das Auslegen einer Schutzplane (kann auf Anfrage mitgeliefert werden). Verankerung erfolgt dann über Ballastgewichte statt Erdnägel. Bitte bei Buchung am Standort Krefeld angeben, dann liefern wir die passende Ausrüstung mit.",
        },
        {
          question: "Sind Schuhe, Brillen und Essen in der Hüpfburg erlaubt?",
          answer:
            "Nein. DIN EN 14960 und alle Hüpfburg-Hersteller geben vor: keine Schuhe (beschädigen Springfläche, Sturzgefahr durch Stollen/Sohlen), keine Brillen (Verletzungsgefahr), keine harten Gegenstände, kein Essen und Trinken (Erstickungsgefahr beim Hüpfen), keine Haustiere. Diese Regeln gehören auf ein gut sichtbares Hinweisschild am Eingang – wir liefern entsprechende Hinweise mit.",
        },
        {
          question: "Was passiert bei Regen – darf die Hüpfburg nass werden?",
          answer:
            "Hüpfburgen mit Dach sind regenresistent – das Material (PVC-beschichtetes Polyester) verträgt Wasser problemlos. Allerdings wird die Hüpffläche bei Nässe extrem rutschig (Verletzungsgefahr). Wir empfehlen: bei einsetzendem Regen Hüpfburg räumen und ggf. abdecken. Nach dem Trocknen wieder freigeben. Hüpfburgen ohne Dach sollten bei Regen geschlossen werden.",
        },
        {
          question: "Brauche ich für eine private Geburtstagsparty eine Genehmigung?",
          answer:
            "Auf eigenem privaten Grundstück nicht. Auf öffentlichen Flächen (Park, Spielplatz, Schulhof) ist eine Sondernutzungsgenehmigung der Stadt Krefeld bzw. der jeweiligen Kommune erforderlich. Bei größeren öffentlichen Veranstaltungen gelten zusätzlich Vorschriften zur Veranstaltungssicherheit (Sanitätsdienst, Brandschutz, Versicherung). Wir beraten am Standort Krefeld zur typischen Vorgehensweise.",
        },
      ],
      expertSections: [
        {
          h3: "DIN EN 14960 in der Praxis: was eine geprüfte Hüpfburg wirklich auszeichnet",
          paragraphs: [
            "Die DIN EN 14960 (in Deutschland verbindlich für aufblasbare Spielgeräte) definiert konkrete Anforderungen: stoßdämpfende Aufprallflächen mit definierter Polsterdicke, Begrenzungswände in Mindesthöhe abhängig von der Spielhöhe, sauber abgesteppte Nähte mit doppelter Naht-Sicherung, Verankerungspunkte mit Mindestlasten, Notausgänge in Mindestbreite (üblich 60 cm bei Tunnel-Modulen), klare Kennzeichnung der zulässigen Personenzahl und Altersgruppe.",
            "Jede Hüpfburg, die wir am Standort Krefeld vermieten, ist nach dieser Norm gebaut, hat eine jährliche Sachkundigen-Prüfung und ein mitgeführtes Prüfbuch. Auf Wunsch zeigen wir das Prüfprotokoll bei der Übergabe – wichtig für gewerbliche Veranstalter, die das im eigenen Sicherheitskonzept dokumentieren.",
          ],
        },
        {
          h3: "Verankerung: warum ein vergessener Erdnagel zur Katastrophe führen kann",
          paragraphs: [
            "Ein nicht oder unzureichend verankerte Hüpfburg ist bei aufkommendem Wind eine ernste Gefahr. Es gibt dokumentierte Unfälle (siehe BAuA-Unfallstatistik), bei denen Hüpfburgen über mehrere hundert Meter durch die Luft geschleudert wurden – mit teils tödlichen Folgen für die Kinder darin. Ursache war regelmäßig: fehlende oder zu kurze Verankerung, fehlende Ballastlasten auf Asphalt, oder Weiterbetrieb bei zu hohem Wind.",
            "Wir investieren in vollständige Verankerungssets (alle Erdnägel passend zur Hüpfburg, Spannschlaufen, ggf. Bügel für Ballast) und weisen bei jeder Übergabe in Krefeld auf die Windregel hin. Bitte unbedingt einhalten – die Sicherheit der Kinder ist nicht verhandelbar.",
          ],
        },
        {
          h3: "Aufsichtspflicht und Altersgruppen-Trennung",
          paragraphs: [
            "Während des Betriebs muss eine erwachsene Aufsichtsperson ständig anwesend sein – sie achtet auf Maximalpersonenzahl, Schuh- und Brillenfreiheit, Trennung der Altersgruppen und greift ein, wenn Kinder Quatsch machen. DGUV Information 202-022 empfiehlt eine Aufsichtsperson für maximal eine Hüpfburg gleichzeitig.",
            "Praktisch: Kinder bis 3 Jahre nur mit Eltern in der Hüpfburg, 3–6 Jahre eigene Zeitfenster, 6–12 Jahre eigene Zeitfenster, Jugendliche/Erwachsene nur in Geräten, die explizit dafür geprüft sind (XXL-Hüpfburgen). Bei Krefelder Kindergeburtstagen mit gemischten Altersgruppen empfehlen wir 15-min-Slots je Altersgruppe – das hält das Verletzungsrisiko niedrig und alle haben Spaß.",
          ],
        },
        {
          h3: "Gebläse-Technik: warum es dauerhaft laufen muss",
          paragraphs: [
            "Klassische Veranstaltungs-Hüpfburgen sind nicht \"aufblasen und zumachen\" – sie werden über ein kontinuierlich laufendes Gebläse (Radiallüfter oder Axiallüfter) auf Druck gehalten, weil sie kein luftdichtes System sind (Nähte, Reißverschlüsse, Eingangsöffnung lassen ständig etwas Luft entweichen). Stoppt das Gebläse, fällt die Hüpfburg innerhalb von 20–60 Sekunden in sich zusammen – das ist gewollt (sicherer als plötzliches Aufreißen).",
            "Praktisch heißt das: Stromversorgung muss dauerhaft anliegen. Stromausfall im Mehrfachverteiler vermeiden, Kabel sicher verlegen (Stolperfalle!), bei Open-Air ggf. Generator vorhalten. Wir vermieten bei Bedarf passende Verkabelung und Stromverteiler dazu (Kategorie Kabel & Stromverteiler).",
          ],
        },
        {
          h3: "Modellauswahl: passende Hüpfburg für Anlass und Altersgruppe",
          paragraphs: [
            "Für klassische Kindergeburtstage (4–10 Jahre, 6–10 Kinder): Standard-Hüpfburg 3 × 3 m oder 4 × 4 m mit Dach. Für Stadtfeste, Schulfeste, Vereinsfeste: größere Modelle 5 × 5 m oder Kombigeräte mit Rutsche, Hindernisparcours, Slide. Für Kleinkind-Bereiche (1–4 Jahre): niedrige Hüpfburgen ohne Stufen, mit weicher Polsterung. Für Jugend- und Erwachsenenfeste: XXL-Hindernisparcours, Fußballarena, Bullriding-Matten.",
            "Wir führen am Standort Krefeld die gängigen Modelle für private Kindergeburtstage und Vereinsfeste; XXL-Geräte und Spezialformate auf Projektbasis und teils über Partner. Bei Buchung Alter und Anzahl der Kinder angeben – wir schlagen die passende Konfiguration vor.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // WOHNWAGEN & CAMPING (Wohnwagen, Vorzelte, Camping-Möbel,
    //   Camping-Zubehör, Vorzelt-Aufbau)
    // Quellen: StVZO § 32 (Abmessungen), § 34 (Achslast/Gesamt-
    //   gewicht), FeV Anlage 9 (Klassen B/B96/BE/C1E), 100-km/h-
    //   Verordnung (Anlage zu § 18 Abs. 5 StVO), DIN EN 1645
    //   (Wohnwagen – Anforderungen), DIN EN 1949 (Flüssiggas-
    //   anlagen in Caravans/Motor­caravans), G 607 (DVGW-Arbeits-
    //   blatt für Flüssiggasanlagen in Freizeitfahrzeugen),
    //   StVZO § 19 Abs. 3 (ABE/EBE bei Anbauten), Bundesverband
    //   Caravaning Industrie (CIVD).
    // -------------------------------------------------------------
    "wohnwagen-camping": {
      faqs: [
        {
          question: "Welchen Führerschein brauche ich, um einen Wohnwagen zu ziehen?",
          answer:
            "Maßgeblich ist FeV Anlage 9 sowie das zulässige Gesamtgewicht von Zugfahrzeug und Wohnwagen zusammen. Klasse B (alt: Klasse 3): bis 3.500 kg Kombi-Gesamtmasse. Klasse B96: bis 4.250 kg Kombi-Gesamtmasse (eine kurze Schulung + theoretische und praktische Übung, keine Prüfung). Klasse BE: bis 7.000 kg Kombi-Gesamtmasse (Theorie- + Praxisprüfung). Konkret: ein klassischer 1.500-kg-Wohnwagen hinter einem 2-Tonnen-PKW liegt in der Regel im B96-Bereich. Wir beraten am Standort Krefeld zum passenden Wohnwagen für deinen Führerschein.",
        },
        {
          question: "Was ist die zulässige Stützlast – und warum wichtig?",
          answer:
            "Die Stützlast ist das Gewicht, das die Anhängerdeichsel auf die Anhängerkupplung des Zugfahrzeugs überträgt. Sie steht in den Fahrzeugpapieren des Zugfahrzeugs (Feld O.1) und auf dem Wohnwagen (Typenschild). Faustregel: 4 % des Wohnwagen-Gesamtgewichts (bei 1.500-kg-Wohnwagen also ca. 60 kg), maximal aber die niedrigste der drei Angaben (PKW, Kupplung, Wohnwagen). Falsche Stützlast – egal ob zu hoch oder zu niedrig – führt zu schlechter Fahrstabilität (Schlingern). Wir prüfen die Stützlast bei der Übergabe gemeinsam.",
        },
        {
          question: "Darf ich mit dem Wohnwagen 100 km/h auf der Autobahn fahren?",
          answer:
            "Standard ist Tempo 80 km/h auf Autobahn und außerorts. Mit der \"Tempo-100-Plakette\" nach Anlage zu § 18 Abs. 5 StVO sind 100 km/h zulässig – dafür muss der Wohnwagen bestimmte Bedingungen erfüllen: max. 3,5 t zulässige Gesamtmasse, geeignete Reifen (Geschwindigkeitsindex mindestens L = 120 km/h), hydraulische Stoßdämpfer, Antischlingerkupplung oder ESC, Reifenalter max. 6 Jahre. Außerdem muss das Zugfahrzeug mit mindestens 1,1-facher Leermasse über der Wohnwagen-Gesamtmasse liegen. Wir geben bei der Übergabe den aktuellen Plakettenstatus an.",
        },
        {
          question: "Wie funktioniert die Gasanlage – und muss sie geprüft sein?",
          answer:
            "Wohnwagen haben Flüssiggas-Anlagen (Propan/Butan) für Heizung, Kochen und Kühlschrank. Nach DVGW-Arbeitsblatt G 607 ist eine Gasprüfung alle 2 Jahre durch einen Sachkundigen Pflicht. Ohne gültige Prüfplakette ist der Betrieb der Anlage nicht zulässig – auf vielen Campingplätzen wird die Plakette kontrolliert. Unsere Mietwohnwagen sind geprüft, die Plakette klebt am Gaskasten. Bei jeder Anmietung erklären wir Gasflaschenwechsel, Hauptabsperrhahn und Verhalten im Störungsfall.",
        },
        {
          question: "Wie viele Gasflaschen gehen mit – wie lange reichen sie?",
          answer:
            "Standard sind 2 × 11-kg-Propanflaschen im Gaskasten (eine in Betrieb, eine als Reserve). Reichweite hängt stark vom Verbrauch ab: Kochen 2 ×/Tag + Kühlschrank 24 h auf Gas + Heizung kalt-saisonal: ca. 7–10 Tage pro Flasche. Im Sommer ohne Heizung: 3–4 Wochen pro Flasche. Wir geben den Wohnwagen mit vollen Flaschen heraus; Verbrauch wird bei Rückgabe nach Gewicht abgerechnet oder die Flaschen werden gegen volle getauscht (DVFG-Flaschenpool deutschlandweit).",
        },
        {
          question: "Brauche ich für den Wohnwagen-Standort eine Genehmigung?",
          answer:
            "Auf einem ausgewiesenen Campingplatz natürlich nicht. Auf eigenem privaten Grundstück (z. B. im eigenen Garten) ist ein Wohnwagen rechtlich ein Bauwerk, sobald er länger als 4 Wochen am selben Ort steht – dann gilt BauO NRW. Für kürzere Aufenthalte (Besuch über Wochenende, Hochzeit) ist das in der Regel unproblematisch. Auf öffentlichen Flächen oder am Straßenrand gilt die StVO – mehr als 14 Tage am Stück ist nicht zulässig.",
        },
        {
          question: "Was ist beim Vorzelt-Aufbau zu beachten?",
          answer:
            "Vorzelt wird seitlich in die Kederleiste des Wohnwagens eingezogen. Aufbau dauert für ein Standard-Vorzelt mit 2 Personen ca. 60–90 Minuten; für moderne Air-Vorzelte (mit Luftschläuchen statt Gestänge) 20–30 Minuten. Verankerung: Heringe am Boden, bei Sturmprognose zusätzliche Sturmleinen einsetzen. Bei aufgebautem Vorzelt darf der Wohnwagen nicht gefahren werden! Wir beraten am Standort Krefeld zur passenden Vorzelt-Größe für deinen Wohnwagen (Umlaufmaß).",
        },
        {
          question: "Wie wird der Wohnwagen winterfest gemacht – und ist das Mietsache?",
          answer:
            "Vor Übernahme im Winter prüfen wir: Frischwasser- und Abwassertanks entleert, Boiler entleert, Toiletten-Spülwasser entleert, Heizung funktionsfähig. Während des Einsatzes im Winter: dauerhaft heizen oder bei Nichtbenutzung wieder vollständig entwässern. Frostschäden am Boiler oder den Wasserleitungen sind teuer und nicht von der normalen Mietkaution gedeckt. Bei Wintermiete erklären wir am Standort Krefeld den Frostschutz im Detail.",
        },
        {
          question: "Brauche ich eine Versicherung für den gemieteten Wohnwagen?",
          answer:
            "Während der Miete ist der Wohnwagen im Rahmen unserer Geschäftskonditionen versichert (KFZ-Haftpflicht und Vollkasko gemäß Mietvertrag); die Selbstbeteiligung ist im Mietvertrag ausgewiesen. Inhaltsversicherung für deine eigenen Sachen im Wohnwagen ist ggf. über die private Hausratversicherung abgedeckt (Außenversicherung) – das musst du im Einzelfall mit deinem Versicherer klären. Auf dem Campingplatz greift teils eine zusätzliche Versicherung des Platzbetreibers (haftungsbeschränkt).",
        },
        {
          question: "Was kostet eine Wohnwagen-Miete am Standort Krefeld typischerweise?",
          answer:
            "Die Tagespreise sind im Buchungsprozess pro Modell tagesaktuell hinterlegt. Generell sinkt der effektive Tagessatz bei längerer Miete deutlich: Wochenmiete entspricht etwa 5 Tagessätzen, Zwei-Wochen-Miete (Urlaub) etwa 9 Tagessätzen. Hauptsaison (Juni–August, Weihnachten) ist nachgefragt – früh buchen lohnt sich. Konkrete Verfügbarkeit für deinen Wunschzeitraum siehst du im Buchungsformular.",
        },
      ],
      expertSections: [
        {
          h3: "Zulässiges Gesamtgewicht: die Mathematik dahinter",
          paragraphs: [
            "Bei jedem Gespann ist die zulässige Gesamtmasse der Kombination der zentrale Wert. Beispiel: Zugfahrzeug VW Tiguan mit 2.500 kg zul. Gesamtgewicht, Wohnwagen mit 1.300 kg zul. Gesamtgewicht. Summe: 3.800 kg. Damit ist man mit Klasse B (Grenze 3.500 kg) nicht mehr fahrberechtigt – B96 (bis 4.250 kg) oder BE (bis 7.000 kg) sind nötig. Ein häufiger Fehler: man rechnet mit dem Leergewicht statt dem zulässigen Gesamtgewicht – das ist rechtlich falsch.",
            "Zusätzlich relevant: Anhängelast des Zugfahrzeugs (Feld O.1 in den Fahrzeugpapieren) muss mindestens dem zul. Gesamtgewicht des Wohnwagens entsprechen. Anhängelast ist herstellerseitig je nach Motorisierung und Getriebe unterschiedlich. Wir prüfen das bei der Buchungsanfrage am Standort Krefeld gemeinsam.",
          ],
        },
        {
          h3: "Fahrdynamik: Schlingerneigung und wie man sie verhindert",
          paragraphs: [
            "Wohnwagen-Gespanne neigen ab ca. 90 km/h zur sogenannten \"Pendelschwingung\" – der Wohnwagen schaukelt seitlich, das Zugfahrzeug folgt mit. Ursache: ungleiche Beladung (zu viel Heck-Last), zu niedrige Stützlast, schlechte Reifen, Seitenwind. Gegenmaßnahmen: Schwere Last (z. B. Wasserkanister) im Wohnwagen über der Achse platzieren, Stützlast auf 4 % des Gesamtgewichts einstellen, Antischlingerkupplung (AKS) oder ESC nutzen, Geschwindigkeit anpassen.",
            "Antischlingerkupplungen (z. B. AL-KO AKS 3004) dämpfen die Pendelbewegung mechanisch und sind heute Standard bei modernen Wohnwagen. ESC (Elektronisches Schlingerstabilisierungs-System) erkennt beginnendes Pendeln und bremst gezielt einzelne Räder ab. Unsere Mietwohnwagen sind mit AKS und je nach Modell mit ESC ausgestattet.",
          ],
        },
        {
          h3: "Tempo 100 in Deutschland: die Plakette und ihre Anforderungen",
          paragraphs: [
            "Die \"100-km/h-Plakette\" wird von einer Prüforganisation (TÜV, DEKRA, GTÜ) ausgestellt, wenn der Wohnwagen alle Voraussetzungen erfüllt: max. 3,5 t zul. Gesamtmasse, Reifen mit Geschwindigkeitsindex L (120 km/h) oder höher und max. 6 Jahre alt, hydraulische Stoßdämpfer in Ordnung, AKS oder ESC vorhanden. Zusätzlich gilt: Leermasse des Zugfahrzeugs ≥ 1,1 × zul. Gesamtmasse des Wohnwagens (bei ESC entfällt diese Bedingung).",
            "Praktisch: Eine 100-km/h-Plakette spart auf langen Strecken Zeit und macht das Mitschwimmen im Verkehr entspannter. Achtung: Im Ausland (Österreich, Schweiz, Italien, Spanien) gelten unabhängig von der deutschen Plakette die jeweiligen Tempolimits für Gespanne (typisch 80–100 km/h). Wir geben am Standort Krefeld den Plakettenstatus der jeweiligen Mietfahrzeuge an.",
          ],
        },
        {
          h3: "Gasanlage und G 607: Sicherheit, die nicht verhandelbar ist",
          paragraphs: [
            "Die Gasanlage im Wohnwagen wird nach DIN EN 1949 gebaut und nach DVGW-Arbeitsblatt G 607 alle 2 Jahre geprüft (Sachkundigenprüfung mit Druckdichtigkeitstest und Sichtprüfung der Schläuche und Verschraubungen). Eine ungültige Gasprüfung ist nicht nur ein Verstoß – sie ist ein echtes Sicherheitsrisiko (CO-Vergiftung, Gasexplosion). Auf vielen Campingplätzen, vor allem in Frankreich, Italien, Niederlande und Deutschland, wird die Plakette kontrolliert; ohne gültige Plakette wird kein Anschluss freigegeben.",
            "Unsere Vermietflotte ist geprüft. Bei längerer Miete (mehrere Monate) achten wir auf das Ablaufdatum und tauschen ggf. die Plakette frisch. Bitte bei Übergabe in Krefeld nicht vergessen, den Gasanschluss-Schlüssel und das Manometer kurz erklären zu lassen – falsches Aufdrehen kostet Druck und im schlimmsten Fall Sicherheit.",
          ],
        },
        {
          h3: "Camping-Strom: 230 V Caravan, CEE-Stecker und FI-Schutz",
          paragraphs: [
            "Campingplätze stellen 230-V-Strom über CEE-Außensteckdosen (blau, 3-polig, 16 A) bereit. Im Wohnwagen ist ein Stromverteiler mit FI-Schutzschalter (RCD, 30 mA) verbaut – Pflicht nach DIN VDE 0100-721. Anschluss erfolgt über ein 25-m-CEE-Kabel (im Vermietumfang enthalten). Wichtig: das Kabel vollständig abrollen vor dem Einschalten, sonst kann sich die Trommel überhitzen (Induktion).",
            "Verbraucher im Wohnwagen: Boiler (1.500–2.000 W), Klimaanlage (800–1.500 W), Kühlschrank (300 W auf Strom), Steckdosen (kombiniert max. 16 A = 3.680 W). Bei Mehrverbraucher-Betrieb kann der FI auslösen oder die Platzsicherung (oft nur 6 A oder 10 A pro Stellplatz). Wir erklären am Standort Krefeld die typischen Stromverbräuche und wie man sie managt.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // ANHÄNGER (PKW-Anhänger, Plateau-/Baumaschinen-/Auto-
    //   transport-/Kofferanhänger, Motorradanhänger)
    // Quellen: StVZO §§ 30a, 32, 34, 43 (Abmessungen, Achslast,
    //   Gesamtgewicht, Anhängerkupplungen); FeV Anlage 9
    //   (Klassen B / B96 / BE); StVO § 22 (Ladungssicherung);
    //   DIN EN 12195-1 (Berechnung von Zurrkräften);
    //   VDI 2700 ff. (Ladungssicherung auf Straßenfahrzeugen);
    //   100-km/h-Verordnung (Anlage zu § 18 Abs. 5 StVO);
    //   §§ 29, 19 StVZO (HU, ABE).
    // -------------------------------------------------------------
    anhaenger: {
      faqs: [
        {
          question: "Welchen Führerschein brauche ich für einen Anhänger?",
          answer:
            "Maßgeblich ist FeV Anlage 9 in Verbindung mit der zulässigen Gesamtmasse (zGM) von Zugfahrzeug und Anhänger. Mit Klasse B (alt: Klasse 3, vor 1999) sind ungebremste Anhänger bis 750 kg zGM ohne Weiteres erlaubt; gebremste Anhänger nur, wenn die Kombination 3.500 kg zGM nicht überschreitet. Klasse B96 (eintägige Schulung, keine Prüfung) erweitert auf 4.250 kg zGM. Klasse BE deckt Anhänger bis 3.500 kg zGM und Kombinationen bis 7.000 kg ab. Wir vermieten am Hauptsitz Krefeld die volle Bandbreite – die zGM steht im Datenblatt jedes Anhängers und wir prüfen die Führerscheinklasse bei der Übergabe.",
        },
        {
          question: "Welcher Anhängertyp ist für meinen Transport richtig?",
          answer:
            "Faustregel: Plateauanhänger (offene Ladefläche, mit/ohne Bordwände) für sperriges Material wie Holz, Möbel, Gartenabfälle. Baumaschinenanhänger mit Auffahrrampen und niedriger Ladekante für Minibagger, Rüttelplatten und Stapler. Kofferanhänger für witterungsempfindliches Gut wie Werkzeug, Umzugsmaterial, Messetechnik. Autotransportanhänger mit Seilwinde für PKW-Überführungen. Motorradanhänger mit Schiene und Wippe für Motorräder bis ca. 350 kg. Am Standort Krefeld halten wir alle Bauarten vor; bei der Buchung filterst du nach Nutzlast und Innenmaß.",
        },
        {
          question: "Was bedeutet zulässige Stützlast – und warum ist sie kritisch?",
          answer:
            "Die Stützlast ist das Gewicht, das die Anhängerdeichsel auf die Anhängerkupplung des Zugfahrzeugs überträgt. Sie steht im Fahrzeugschein des Zugfahrzeugs (Feld 13) und auf dem Anhänger (Typenschild). Maßgeblich ist immer der niedrigste der drei Werte (PKW, Kupplung, Anhänger). Typische Werte: 50–100 kg bei PKW-Anhängern, bis 150 kg bei stärkeren SUV-/Transporter-Gespannen. Eine zu geringe Stützlast (Heck-Last beim Anhänger) führt zum Schlingern, eine zu hohe Stützlast überlastet die Hinterachse. Wir prüfen die Beladung gemeinsam bei der Übergabe in Krefeld.",
        },
        {
          question: "Wie sichere ich Ladung korrekt nach § 22 StVO und VDI 2700?",
          answer:
            "§ 22 StVO und § 23 StVO verlangen, dass die Ladung verkehrssicher verstaut und gegen Verrutschen, Umfallen, Hin- und Herrollen, Herabfallen und vermeidbaren Lärm gesichert ist. VDI 2700 ff. und DIN EN 12195-1 sind der anerkannte Stand der Technik. Praxis: Formschluss (Ladung an die Bordwand) ist die beste Sicherung. Zurrgurte müssen für die geforderten Zurrkräfte ausgelegt sein (Etikett am Gurt: LC-Wert). Faustregel beim Niederzurren: pro 500 kg Ladung mindestens 2 Gurte mit STF ≥ 350 daN über die Ladung. Wir geben Zurrgurte zu den Mietanhängern mit aus und beraten zur Sicherung – die Verantwortung für die Ladungssicherung bleibt aber beim Fahrer und Halter (Bußgeld bis 75 €, bei Unfall Mitschuld).",
        },
        {
          question: "Darf ich mit dem Anhänger 100 km/h auf der Autobahn fahren?",
          answer:
            "Standard ist Tempo 80 km/h auf Autobahn und außerorts. Mit der Tempo-100-Plakette nach Anlage zu § 18 Abs. 5 StVO sind 100 km/h erlaubt, wenn der Anhänger und das Gespann die Voraussetzungen erfüllen: Anhänger ≤ 3,5 t zGM, geeignete Reifen (Index L = 120 km/h, max. 6 Jahre alt), hydraulische Stoßdämpfer in Ordnung, Antischlingerkupplung (AKS), und die Leermasse des Zugfahrzeugs muss mindestens das 1,1-fache der zGM des Anhängers betragen (bei Pkw bzw. Wohnmobil bis 3,5 t). Den Plakettenstatus geben wir an jedem Mietanhänger an.",
        },
        {
          question: "Wie alt dürfen Reifen am Mietanhänger sein und wann werden sie getauscht?",
          answer:
            "Die DOT-Nummer auf der Reifenflanke nennt Produktionswoche und -jahr. Für Anhänger mit Tempo-100-Zulassung dürfen Reifen max. 6 Jahre alt sein (Stichtag bei Erteilung der Plakette). Unabhängig davon gilt: bei sichtbarer Alterung (Risse, Sprödigkeit) tauschen, spätestens nach 10 Jahren. Mindestprofiltiefe ist gesetzlich 1,6 mm, praxistauglich tauschen wir ab 3 mm. Unsere Vermietflotte am Standort Krefeld wird turnusmäßig geprüft – DOT und Profiltiefe sind Teil der Übergabe-Checkliste.",
        },
        {
          question: "Was muss ich vor jeder Fahrt am Anhänger prüfen?",
          answer:
            "Sechs-Punkte-Check vor jedem Antritt: 1) Kupplungskugel sauber eingerastet, Verriegelung sichtbar geschlossen; 2) Abreißseil bzw. Sicherungsstift eingehängt; 3) 13- bzw. 7-poliger Stecker eingesteckt, Funktionsprüfung Blinker, Brems-, Schlusslicht; 4) Stützrad vollständig hochgekurbelt und arretiert; 5) Ladung formschlüssig und niedergezurrt, Plane gespannt; 6) Reifen visuell prüfen (Druck, Profil, sichtbare Schäden). Wir erklären diesen Ablauf bei der Übergabe in Krefeld und stellen eine Kurz-Anleitung als PDF zur Verfügung.",
        },
        {
          question: "Wie funktioniert die Auflaufbremse – und was ist beim Rückwärtsfahren zu beachten?",
          answer:
            "Gebremste Anhänger haben eine mechanische Auflaufbremse: Beim Bremsen schiebt der Anhänger gegen das Zugfahrzeug, die Deichsel staucht sich, ein Gestänge betätigt die Trommelbremsen. Beim Rückwärtsfahren würde derselbe Mechanismus die Bremse betätigen – moderne Anhänger haben deshalb eine automatische Rückfahrautomatik, die das verhindert. Vor dem Rangieren also kurz vorrollen lassen, dann rückwärts. Bei älteren Anhängern muss der Rückfahrhebel manuell arretiert werden. Wir erklären den jeweiligen Mechanismus am konkreten Modell in Krefeld.",
        },
        {
          question: "Brauche ich für den Anhänger eine eigene Versicherung?",
          answer:
            "In Deutschland ist der Anhänger über die KFZ-Haftpflicht des Zugfahrzeugs mitversichert, solange er angekuppelt ist (BGH-Rechtsprechung, sogenannte „Bulgarien-Entscheidung\" hat das nochmals bestätigt). Eigene Schäden am gemieteten Anhänger deckt der Mietvertrag mit ausgewiesener Selbstbeteiligung; eine zusätzliche Haftungsreduzierung kann optional gebucht werden. Im Ausland gelten teils abweichende Regeln (z. B. Italien, Niederlande – eigene Anhänger-Versicherung), prüfe das vor Grenzübertritt mit deinem Versicherer.",
        },
        {
          question: "Wie lange darf ich einen Anhänger am Straßenrand abstellen?",
          answer:
            "§ 12 Abs. 3b StVO: Anhänger ohne Zugfahrzeug dürfen auf öffentlichen Straßen längstens zwei Wochen abgestellt werden; danach drohen Verwarn- bzw. Bußgeld und Abschleppkosten. Auf Autobahnen, Kraftfahrstraßen und in eingeschränkten Halteverbots-Zonen gilt das Abstellverbot ohnehin sofort. In reinen Wohngebieten dulden viele Kommunen kürzere Zeiten; die Stadt Krefeld weist im Zweifel über das Ordnungsamt aus. Auf privatem Grund (Hof, eigene Stellfläche) gilt diese Regel nicht.",
        },
      ],
      expertSections: [
        {
          h3: "Führerscheinklassen B, B96 und BE: was du wirklich ziehen darfst",
          paragraphs: [
            "Die häufigste Fehlannahme: „Mit Klasse B darf ich alles bis 3.500 kg ziehen.\" Das stimmt nur halb. Klasse B erlaubt ungebremste Anhänger bis 750 kg zGM ohne weitere Bedingung. Gebremste Anhänger über 750 kg zGM sind nur erlaubt, solange die Summe aus zGM Zugfahrzeug + zGM Anhänger 3.500 kg nicht überschreitet – das schließt einen 1.300-kg-Baumaschinenanhänger hinter einem 2.300-kg-PKW bereits aus.",
            "Klasse B96 ist eine eintägige Schulung (ca. 7 Stunden, davon mind. 2,5 h Praxis) ohne Prüfung und erweitert die Kombi-Grenze auf 4.250 kg. BE ist eine vollwertige Führerschein-Klasse (Theorie ist nicht erforderlich, Praxisprüfung mit Anhänger), erlaubt Anhänger bis 3.500 kg zGM und Gespanne bis 7.000 kg. Für die meisten Bau- und Umzugs-Mieten in Krefeld empfehlen wir BE; die Kombination eines klassischen Baumaschinenanhängers (ab 2.000 kg zGM) mit einem 1-Tonnen-Minibagger liegt zwangsläufig im BE-Bereich.",
          ],
        },
        {
          h3: "Ladungssicherung nach VDI 2700: vom Reibwert bis zum Zurrgurt",
          paragraphs: [
            "Die VDI-Richtlinie 2700 (Ladungssicherung auf Straßenfahrzeugen) ist der anerkannte Stand der Technik und wird im Schadens- bzw. Bußgeldfall regelmäßig herangezogen. Grundprinzip: Sicherung gegen Verrutschen nach vorn mit mindestens 0,8 g, nach hinten und zur Seite mit mindestens 0,5 g. Übersetzt: Beim scharfen Bremsen wirken bis zu 80 % der Ladungsmasse als horizontale Kraft – eine 1.000 kg schwere Maschine drückt mit bis zu 800 kg auf die Bordwand bzw. die Zurrgurte.",
            "In der Praxis empfehlen wir den Mix aus Formschluss (Ladung dicht an die Bordwand, Lücken mit Antirutschmatten füllen) und Niederzurren (Zurrgurte mit STF ≥ 350 daN, kreuzweise über die Ladung). Diagonalzurren ist nochmals effizienter, erfordert aber Zurrösen am Boden des Anhängers. Wir geben pro Anhänger eine fachgerechte Anzahl Zurrgurte und Antirutschmatten mit aus; das Etikett am Gurt zeigt die zulässige Zurrkraft (LC) und die Standard-Spannkraft (STF) – das sind die Werte, die im Streitfall zählen.",
          ],
        },
        {
          h3: "Auflaufbremse, Antischlingerkupplung und ESC: was die Technik leistet",
          paragraphs: [
            "Gebremste Anhänger nutzen die Auflaufbremse: Eine in der Deichsel verbaute Dämpferpatrone übersetzt die Schubkraft des bremsenden Anhängers in einen Bremsdruck auf die Trommelbremsen der Achsen. Das System ist mechanisch, wartungsarm und seit Jahrzehnten erprobt – die regelmäßige Inspektion betrifft vor allem die Trommeln, Bremsbacken und die Kugelaufnahme. Beim Rückwärtsfahren verhindert eine Rückfahrautomatik (Klinke an der Bremsbacke), dass die Auflaufbewegung als Bremsung interpretiert wird.",
            "Antischlingerkupplungen (z. B. AL-KO AKS) erzeugen Reibung zwischen Kupplungskugel und Spannbacken und dämpfen damit Pendelschwingungen. Sie sind Pflicht für jede Tempo-100-Plakette und in unseren Anhänger ab 1.500 kg zGM standardmäßig verbaut. Elektronische Stabilitätsprogramme (ESC, z. B. AL-KO ATC) erkennen beginnendes Pendeln über einen Sensor in der Deichsel und bremsen den Anhänger gezielt ab – das verkürzt die Pendelphase deutlich und ist die wirksamste Einzelmaßnahme gegen Anhänger-Unfälle bei Seitenwind.",
          ],
        },
        {
          h3: "TÜV, ABE und Prüfintervalle: was du als Mieter wissen musst",
          paragraphs: [
            "Anhänger bis 750 kg zGM sind alle zwei Jahre HU-pflichtig (§ 29 StVZO). Anhänger über 750 kg zGM ebenfalls alle zwei Jahre, schwere Anhänger (über 3,5 t) jährlich. Die HU-Plakette sitzt am Kennzeichen. Bei jedem Vermietvorgang ab Krefeld stellen wir sicher, dass die HU gültig ist – bei abgelaufener HU dürfen wir nicht vermieten und tun das auch nicht.",
            "Die ABE bzw. EBE des Anhängers ist die Grundlage für die Zulassung. Eigenmächtige Umbauten (zusätzliche Lampen, andere Bordwände, andere Reifen ohne Freigabe) führen zum Erlöschen der Betriebserlaubnis (§ 19 Abs. 2 StVZO) – mit gravierenden versicherungs- und bußgeldrechtlichen Folgen. Bitte den Mietanhänger unverändert verwenden; Sonderwünsche (z. B. zusätzliche Spanngurt-Ösen, andere Plane) bitte vorab mit uns klären.",
          ],
        },
        {
          h3: "Krefeld als Anhänger-Standort: Hauptsitz, A57, A40 und das Liefergebiet",
          paragraphs: [
            "Unser Hauptsitz in der Anrather Straße 291 (Krefeld-Fichtenhain) liegt unmittelbar am Autobahnkreuz A57 (Köln–Krefeld–Nimwegen) und A44 mit kurzer Anbindung an die A40 (Ruhrschnellweg). Aus dieser Lage erreichst du das gesamte Niederrhein-Liefergebiet (Krefeld, Meerbusch, Willich, Tönisvorst, Kempen, Viersen, Mönchengladbach, Neuss, Düsseldorf-Linksrheinisch, Duisburg-Süd) und das angrenzende Ruhrgebiet ohne Stadtdurchquerung – ideal für Anhänger-Selbstabholung.",
            "Im Mietpark Krefeld halten wir Plateau-, Baumaschinen-, Koffer-, Auto­transport- und Motorrad­anhänger jeweils in mehreren Größen vor – Verfügbarkeit zeigt jedes Produkt direkt an. Reguläre Übergabezeiten Mo–Fr 08:00–18:00, Sa 10:00–14:30. Frühere Samstags-Abholungen organisieren wir nach Vorbuchung – gerade für Wochenendprojekte mit Rückgabe am Montag eine sinnvolle Option. Die Zurrgurt-Ausstattung, ein Satz Antirutschmatten und ein Adapter 7-/13-polig sind im Mietpreis enthalten.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // KABEL & STROMVERTEILER (CEE-Kabel, Gummischlauchleitungen
    //   H07RN-F, Stromverteiler 16/32/63/125 A, Baustrom-
    //   Anschluss-Schrank, FI-Schutzschalter, Adapter)
    // Quellen: DIN VDE 0100-704 (Errichten von Niederspannungs-
    //   anlagen – Baustellen), DIN VDE 0100-410 (Schutz gegen
    //   elektrischen Schlag), DIN VDE 0100-540 (Auswahl und
    //   Errichtung elektrischer Betriebsmittel – Erdung),
    //   DIN VDE 0701-0702 (Wiederholungsprüfung elektrischer
    //   Geräte), DGUV Vorschrift 3 (Elektrische Anlagen und
    //   Betriebsmittel), DGUV Information 203-006 (Auswahl
    //   und Betrieb elektrischer Anlagen auf Bau- und Montage-
    //   stellen), TAB NS Nord (Technische Anschluss-
    //   bedingungen Niederspannung), § 8 NAV (Netzanschluss-
    //   verordnung).
    // -------------------------------------------------------------
    "kabel-stromverteiler": {
      faqs: [
        {
          question: "Was bedeutet CEE – und welche Größen brauche ich auf der Baustelle?",
          answer:
            "CEE steht für „Commission on the Rules for the Approval of the Electrical Equipment\" – heute geregelt in IEC 60309. Die blauen 3-poligen CEE-Stecker (230 V, 16 A) versorgen Wohnwagen, Marktstände und kleine Werkzeuge. Die roten 5-poligen CEE-Stecker (400 V) gibt es in den Stromstärken 16 A (bis 11 kW), 32 A (bis 22 kW), 63 A (bis 43 kW) und 125 A (bis 86 kW). Faustregel: Kleine Werkzeuge und Beleuchtung mit 16/32 A blau bzw. rot, Mischer und mittlere Maschinen mit 32 A rot, Kräne, Hebebühnen und Schweißgeräte mit 63 A. Wir halten am Standort Krefeld alle Größen plus passende Adapter vor.",
        },
        {
          question: "Welcher Kabelquerschnitt für welche Länge und Last?",
          answer:
            "Maßgeblich ist die Strombelastbarkeit nach DIN VDE 0298-4 und der zulässige Spannungsabfall (max. 3 % nach DIN VDE 0100-520). Praxisrichtwerte für H07RN-F-Gummischlauchleitungen: 3 × 2,5 mm² für 16 A bis ca. 50 m, 5 × 2,5 mm² für 16 A drei­phasig bis ca. 70 m, 5 × 4 mm² für 32 A bis ca. 65 m, 5 × 6 mm² für 32 A bis ca. 100 m, 5 × 10 mm² oder 5 × 16 mm² für 63 A. Bei längeren Strecken auf den nächstgrößeren Querschnitt gehen – sonst sinkt die Spannung ab, Motoren werden heiß und Sicherungen lösen aus. Wir konfigurieren bei der Buchung in Krefeld die passende Kombination.",
        },
        {
          question: "Welche Schutzklasse müssen Baustellen-Kabel und -Verteiler haben?",
          answer:
            "Auf Bau- und Montagestellen schreibt DIN VDE 0100-704 vor: Leitungen mindestens vom Typ H07RN-F oder gleichwertig (öl-, säure-, abriebfest), Stecker und Kupplungen mindestens IP44 (spritzwassergeschützt). Stromverteiler („Bau­strom­verteiler\") müssen mindestens IP44, in Außenbereichen typischerweise IP54 oder IP65 sein und mit RCD (FI-Schutz­schalter) ≤ 30 mA für alle 230-V- und Dreh­strom-Abgänge bis 32 A ausgerüstet sein. Unsere Verteiler erfüllen mindestens IP44 mit allpoligem FI 30 mA; größere Verteiler (63/125 A) zusätzlich mit selektivem FI 300 mA in der Vorstufe.",
        },
        {
          question: "Brauche ich einen FI-Schutzschalter – und wie oft wird er geprüft?",
          answer:
            "Ja, auf Baustellen ist ein RCD mit Nennfehlerstrom ≤ 30 mA für alle Stromkreise mit Steckvorrichtungen bis 32 A nach DIN VDE 0100-704 Abschnitt 411.3.3 zwingend vorgeschrieben. Der FI-Schalter muss vor jeder Schicht über die Prüftaste getestet werden; eine Wiederholungsprüfung der gesamten Anlage erfolgt nach DGUV V3 mindestens jährlich (bei Baustellen-Verteilern teils alle 3 Monate). Unsere Mietverteiler durchlaufen vor jeder Vermietung eine DGUV-V3-Prüfung – das Prüfprotokoll mit Datum und Prüfer-Kennung klebt am Verteiler.",
        },
        {
          question: "Bietet ihr Baustrom-Anschluss mit Antragstellung?",
          answer:
            "Ja, das ist ein eigener Service: Wir übernehmen die komplette Bau­strom-Anmeldung beim zuständigen Netzbetreiber (in Krefeld z. B. SWK Netze, im Umland Westnetz/Westenergie), liefern und installieren den genormten Bau­anschluss­schrank mit Wandlermesszählerplatz nach TAB NS Nord, übernehmen den Stromzähler-Wechsel mit dem Netzbetreiber und holen den Schrank nach Bau­ende wieder ab. Pauschal­preis je nach Region und Anschluss­leistung – Angebot über unseren Service-Standort Krefeld telefonisch oder per Anfrageformular.",
        },
        {
          question: "Wie schließe ich Kabel und Verteiler auf der Baustelle korrekt an?",
          answer:
            "Reihenfolge nach DIN VDE 0100-704: Zuerst Verteiler an festen, ebenen Untergrund stellen oder am Bau­stützpunkt aufhängen (Stand­standsfest, kein Wassersack). Speisekabel von der Einspeise­stelle (Bau­strom­schrank oder Gebäudeanschluss) zum Verteiler verlegen, dabei Quetsch- und Scherstellen vermeiden (keine quer über Verkehrswege, sonst Kabel­brücken einsetzen). Stecker erst nach Verlegung einstecken. Vor Inbetriebnahme: Funktion FI-Test, Spannungs­prüfung an jeder Steckdose, Drehfeld­prüfung bei Drehstrom (rechts­drehend für Motoren). Wir geben am Standort Krefeld eine Übergabe-Einweisung an Verteilern größer 32 A.",
        },
        {
          question: "Was tun, wenn der FI-Schutzschalter ständig auslöst?",
          answer:
            "Häufige Ursachen: feuchter oder defekter Verbraucher (Bohrhammer mit Wassereintritt), beschädigtes Kabel mit Erdschluss, zu viele Verbraucher mit Ableit­strömen am selben Stromkreis (Summen­ableit­strom > 30 mA). Vorgehen: Alle Verbraucher abstecken, FI einschalten – hält er, einzeln nachstecken bis der Auslöser identifiziert ist. Hält der FI auch ohne Verbraucher nicht, ist der Verteiler selbst betroffen (Wasser im Gehäuse, defekter Schalter). Bitte solche Verteiler nicht „brücken\" oder den FI dauerhaft drücken – das ist lebensgefährlich. Tausch-Verteiler bekommst du am Standort Krefeld kurzfristig.",
        },
        {
          question: "Kann ich Kabeltrommeln voll abgerollt lassen – oder müssen sie ganz abgerollt werden?",
          answer:
            "Kabeltrommeln müssen für die volle Nennlast vollständig abgerollt werden, sonst überhitzt das Kabel auf der Trommel durch induktive Wärmestauung (Spulen­effekt). Aufgerollt darf nur ein Bruchteil der Nennlast entnommen werden – typische Herstellerangabe: ca. 30 % der Trommel­last bei vollem Aufrollen. Konkret: Eine 25-m-Trommel mit 16 A Nennstrom (3.680 W) darf aufgerollt nur ca. 1.000 W abgeben, sonst schmilzt die Isolierung. Auf der Trommel ist das im Etikett vermerkt. Wir verleihen am Standort Krefeld bevorzugt H07RN-F-Leitungen als lose Ringe – die haben dieses Problem nicht.",
        },
        {
          question: "Welche Verteilergröße brauche ich für mein Event oder meine Baustelle?",
          answer:
            "Faustregel über die Anschluss­leistung: kleines Event (DJ + Licht + Catering-Hütte): 32 A rot reicht (22 kW). Mittleres Event (Bühne + PA + Licht + Catering): 63 A rot (43 kW). Großevent mit Tour-Bühne und Foodtruck-Reihe: 125 A rot (86 kW). Baustelle: Anzahl der Stromkreise zählen – Mischer, Tauchsäge, Hubarbeitsbühne, Bauwagen-Heizung. Pro 16-A-Abgang plant man konservativ einen Verbraucher mit Anlauf­strom (z. B. Mischer). Wir konfigurieren am Standort Krefeld den passenden Verteiler­stamm (32 A → 4× 16 A + 2× 32 A o. ä.) und legen die nötigen Verlängerungen passend dazu.",
        },
        {
          question: "Was kostet die Kabel- und Verteiler-Miete in Krefeld?",
          answer:
            "Die Tagespreise sind pro Artikel im Buchungs­prozess hinterlegt. Längere Mieten werden überproportional günstiger: Wochenmiete entspricht ca. 5 Tagessätzen, Monatsmiete ca. 15 Tagessätzen. Für Baustrom-Anschluss mit Antrag und Schrank-Aufstellung gibt es einen separaten Pauschal­preis je nach Region und Anschluss­leistung. Telefonische Beratung dazu über die Krefelder Standort­nummer.",
        },
      ],
      expertSections: [
        {
          h3: "DIN VDE 0100-704: warum Baustellen ein eigenes Regelwerk haben",
          paragraphs: [
            "Bau- und Montagestellen sind elektrotechnisch besondere Umgebungen: viele wechselnde Nutzer, oft Feuchtigkeit, mechanische Beanspruchung, häufiges Stecken und Trennen, parallele Gewerke. DIN VDE 0100-704 fasst die daraus resultierenden Anforderungen zusammen und ist verbindlich für jede Bau­strom-Verteilung. Kernpunkte: Speisung der Bau­strom­verteilung aus einem TN-S-System mit separatem Schutzleiter (kein PEN auf Bau­stellen ab 32 A), RCD ≤ 30 mA für Steckdosen­kreise bis 32 A, RCD ≤ 500 mA als Vorstufe für größere Abgänge, Schutzart mindestens IP44, mechanische Schutzart IK08.",
            "Praktisch heißt das für den Mieter: Stecker, Kupplungen und Verteiler müssen das CEE-System nach IEC 60309 erfüllen, Leitungen müssen H07RN-F oder gleichwertig sein (klassisches PVC-Kabel ist auf Bau­stellen unzulässig), und der Verteiler muss eine gültige DGUV-V3-Prüfung haben. Unsere Krefelder Vermietflotte erfüllt diese Anforderungen durchgängig – das spart dir die Diskussion mit dem SiGeKo bzw. der BG BAU auf der Baustelle.",
          ],
        },
        {
          h3: "Spannungsabfall und Kabelquerschnitt: warum man oft eine Nummer größer wählt",
          paragraphs: [
            "Jede Leitung hat einen Widerstand; bei großer Länge oder hoher Stromstärke fällt entlang der Leitung Spannung ab. DIN VDE 0100-520 verlangt für Verbraucher­stromkreise einen Spannungs­abfall von max. 3 % zwischen Einspeisung und Verbraucher. Bei 400 V Drehstrom sind das 12 V – nach 100 m mit 5 × 2,5 mm² und 32 A reicht das nicht mehr aus. Effekt: Motoren laufen mit Untertemperatur, ziehen mehr Strom, werden heiß; Frequenz­umrichter melden „Unterspannung\" und schalten ab; LED-Scheinwerfer flimmern.",
            "Praxis­regel: pro 50 m Länge bei 32 A eine Querschnitt­stufe größer wählen (statt 5 × 4 mm² besser 5 × 6 mm²). Bei 63 A rechnen wir grundsätzlich mit 5 × 10 mm² für die ersten 50 m und 5 × 16 mm² ab 50 m. Bei Großevents oder lang gezogenen Bau­stellen lohnt sich oft ein zweiter Verteiler näher am Verbraucher – kürzeres Niederlast­kabel statt eines langen Speise­kabels. Wir rechnen den passenden Mix in Krefeld bei der Buchung gemeinsam mit dir durch.",
          ],
        },
        {
          h3: "FI-Schutz, RCD-Typen und warum „Typ A\" oft nicht reicht",
          paragraphs: [
            "FI-Schutzschalter (RCD) erkennen Fehlerströme zum Schutzleiter und schalten bei ≤ 30 mA innerhalb von 40 ms ab – das schützt Personen vor Herzkammer­flimmern. Es gibt vier wichtige Typen: AC (nur sinusförmige Wechselfehler­ströme, in Deutschland seit 1985 nicht mehr zulässig), A (sinusförmige + pulsierende Gleichströme; Standard in Wohn- und Bau­installationen), F (zusätzlich Misch­frequenzen, für einphasige Frequenz­umrichter), B (zusätzlich glatte Gleichfehler­ströme, für drei­phasige Frequenz­umrichter, PV-Wechselrichter und Lade­säulen).",
            "Auf modernen Baustellen mit Frequenz­umrichter-Maschinen (variable Geschwindigkeit, sanftes Anlaufen) oder mit Ladegeräten für E-Geräte/E-Autos reicht ein Typ-A-FI nicht aus – glatte Gleichfehler­ströme „blenden\" einen Typ-A-FI und verhindern dessen Auslösung. Hier muss Typ B (oder mindestens Typ F) verwendet werden. Unsere großen Verteiler (63/125 A) sind je nach Modell mit Typ B nachrüstbar; bei Frequenz­umrichter-Geräten weisen wir bei der Buchung in Krefeld explizit auf den nötigen FI-Typ hin.",
          ],
        },
        {
          h3: "Baustromanschluss: vom Antrag beim Netzbetreiber bis zum fertigen Anschlussschrank",
          paragraphs: [
            "Ein Bau­strom­anschluss ist kein Mietgerät, sondern ein temporärer Netz­anschluss nach § 8 NAV (Niederspannungs-Anschluss­verordnung). Ablauf: 1) Konzessions­vertrag mit dem örtlichen Netzbetreiber (in Krefeld z. B. SWK Netze, in Mönchen­gladbach NEW Netz, im Umland Westnetz). 2) Antragsformular mit Lageplan, gewünschter Leistung (kW) und Standort des Anschluss­schranks. 3) Netzbetreiber prüft die Anschluss­möglichkeit (Hausanschluss­kasten in der Nähe, Tiefbau­arbeiten nötig?). 4) Schrank-Aufstellung mit Wandler­mess­zählerplatz nach TAB NS Nord. 5) Zähler­setzen durch den Netzbetreiber, Inbetrieb­nahme. 6) Nach Bau­ende: Demontage, Rück­bau, Endabrechnung.",
            "Wir übernehmen das als Komplettpaket: Antrag, Schrank, Schrank-Stellung, Koordination des Zähler­wechsels, Rückbau. Du erhältst einen Festpreis je nach Region und Anschluss­leistung. Das ist gerade für Bauherren attraktiv, die ohne Elektro-Hintergrund nicht mit dem Netzbetreiber verhandeln wollen – telefonische Beratung über die Krefelder Standort­nummer.",
          ],
        },
        {
          h3: "Steckverbindersystem CEE und IEC 60309: Farben, Polzahl, Schutzart",
          paragraphs: [
            "Das CEE-System nach IEC 60309 ist international standardisiert und über Farbe, Polzahl, Stromstärke und Schutzart eindeutig codiert – Fehlsteckungen sind dadurch praktisch ausgeschlossen. Blau steht für 230 V (50 Hz), Rot für 400 V (50 Hz), Gelb für 110 V (Niedrigvoltsystem, z. B. UK-Bau), Schwarz für 500 V (Industrie), Grün für 24/50 V (Schutzkleinspannung). Die Polzahl gibt Auskunft über die Strom­art: 3-polig (L + N + PE) = einphasig 230 V; 4-polig (L1 + L2 + L3 + PE) = Drehstrom ohne Neutral­leiter; 5-polig (L1 + L2 + L3 + N + PE) = Drehstrom mit Neutral­leiter (Standard im Bau).",
            "Stromstärken sind durch die Stecker­geometrie unverwechselbar: 16 A, 32 A, 63 A und 125 A haben unterschiedliche Außen­durchmesser und Stiftbilder. Adapter zwischen den Stufen sind erlaubt, wenn sie das jeweilige Schutzkonzept (FI, Überstrom­schutz) nicht aufheben. Wir verleihen am Standort Krefeld den kompletten Adapter­satz (16/32 A blau auf 16 A Schuko, 32 A rot auf 16 A rot, 63 A rot auf 32 A rot etc.) – damit baust du dir die passende Verteiler­kette ohne Fremd­material zusammen.",
          ],
        },
      ],
    },
  },

  // ================================================================
  // BONN – Filiale Drachenburgstraße 8, 53179 Bonn-Mehlem
  // Öffnungszeiten: Mo–Fr 07:00–18:00, Sa 08:00–17:30
  // Liefergebiet: Bonn, Köln-Süd, Wachtberg, Bad Honnef,
  // Königswinter, Sankt Augustin, Bad Neuenahr-Ahrweiler,
  // Rhein-Sieg-Kreis. Direkte Anbindung an B9, A555 (Bonn–Köln),
  // A565 (Bonner Autobahn) und A59.
  // ================================================================
  bonn: {
    // -------------------------------------------------------------
    // ERDBEWEGUNG (Minibagger, Midibagger, Dumper, Anbaugeräte)
    // Quellen: DGUV V1, DGUV Regel 100-500, DGUV Grundsatz 308-009,
    //   DIN 4124, StVZO § 34, FeV Anlage 9, LAGA M20 /
    //   Ersatzbaustoffverordnung 2023, § 127 TKG, Baumschutz-
    //   satzung Bonn (Schutz öffentlicher und privater Bäume
    //   ab 80 cm Stammumfang), Hochwasserschutz im Rheinauen-
    //   bereich (Bezirksregierung Köln).
    // -------------------------------------------------------------
    erdbewegung: {
      faqs: [
        {
          question: "Welche Baggergröße brauche ich für mein Projekt in Bonn und der Rheinschiene?",
          answer:
            "Für die typischen Bonner Hanglagen (Venusberg, Bad Godesberg, Königswinter, Wachtberg) gilt: Vorgarten- und Hofprojekte mit schmalen Durchgängen (ab ca. 80 cm) brauchen Minibagger der 1-Tonnen-Klasse. GaLaBau-Projekte mit Stützmauern, Terrassen und Pflasterunterbau sind mit 1,5–2,5 t gut bedient. Bei Hausanschluss-, Kanal- und Glasfasergräben über 1,25 m Tiefe greift DIN 4124 (Verbau bzw. Böschung) – hier sind 2,5–5 t Standard. Am Standort Bonn-Mehlem (Drachenburgstraße 8) führen wir das Kernsortiment direkt vor Ort; Spezialmaschinen liefern wir aus unserem Hauptsitz Krefeld nach.",
        },
        {
          question: "Brauche ich einen Baggerschein für die Miete in Bonn?",
          answer:
            "Privat auf eigenem, nicht öffentlich zugänglichem Grundstück nicht. Sobald die Maschine gewerblich oder auf einer fremden Baustelle eingesetzt wird, verlangt DGUV Regel 100-500 in Verbindung mit DGUV Grundsatz 308-009 einen schriftlichen Befähigungsnachweis (\"Bedienerausweis Erdbaumaschinen\"). Diese Beauftragung muss der Arbeitgeber bzw. Auftraggeber dokumentieren – wir stellen sie nicht aus. Bei der Übergabe in Bonn bekommst du eine sorgfältige Geräteeinweisung am konkreten Modell.",
        },
        {
          question: "Welche Anbaugeräte halte ich am Standort Bonn vor – und welche kommen aus Krefeld?",
          answer:
            "Vor Ort in Bonn-Mehlem haben wir die gängigen Tief- und Grabenräumlöffel (300–1.200 mm), Hydraulikhämmer, Erdbohrer und Sortiergreifer für das lokale Kernsortiment. Sonderausstattung wie Verdichterlöffel, schmale Mikrobagger-Anbauten oder spezielle Schnellwechsler-Adapter (S30, S40) liefern wir aus dem Hauptsitz Krefeld an – in der Regel innerhalb von 24 Stunden. Bei der Buchung sehen wir die Standort-Verfügbarkeit live; im Zweifel ruf vorab unter 0228 504 660 61 an.",
        },
        {
          question: "Wie schwer darf der Bagger sein, damit ich ihn mit dem PKW transportieren darf?",
          answer:
            "Maßgeblich ist FeV Anlage 9. Klasse B (alt: Klasse 3): bis 3.500 kg Kombi-Gesamtmasse. B96: bis 4.250 kg. BE: bis 7.000 kg. Ein 1-Tonnen-Minibagger plus gebremster Baumaschinenanhänger liegt typischerweise im BE-Bereich. Wir vermieten am Standort Bonn auch passende Plateau- und Baumaschinenanhänger; Stützlast und zulässiges Gesamtgewicht stehen im jeweiligen Datenblatt.",
        },
        {
          question: "Welche Mindestabstände gelten beim Ausheben von Baugruben und Gräben?",
          answer:
            "DIN 4124 ist verbindlich: Gräben bis 1,25 m Tiefe dürfen bei standfestem Boden senkrecht ausgehoben werden. Tiefer muss verbaut oder geböscht werden (nicht-bindiger Boden ≤ 45°, bindiger Boden ≤ 60°, Fels bis 80°). An Verkehrsflächen, Gebäuden und Nachbargrenzen gelten zusätzliche Sicherheitsabstände. Vor dem Aushub Bestandspläne (Strom, Gas, Wasser, Telekom, Glasfaser) bei den Netzbetreibern bzw. der Sparten-Auskunft anfordern – die Erkundigungspflicht liegt beim Bauherrn. In Bonn sind das u. a. SWB Energie und Wasser sowie westliche Vorwahlnetze.",
        },
        {
          question: "Brauche ich für Erdarbeiten in Bonn eine Genehmigung?",
          answer:
            "Auf privatem Grund für reine Erdarbeiten in der Regel nicht. Sobald öffentlicher Verkehrsraum betroffen ist (Gehweg, Straße, Bordstein), brauchst du eine Aufgrabungsgenehmigung des Tiefbauamtes der Stadt Bonn bzw. – bei verkehrslenkenden Maßnahmen – eine verkehrsrechtliche Anordnung des Straßenverkehrsamtes. In Bonn ist außerdem die Baumschutzsatzung zu beachten: Bäume ab 80 cm Stammumfang (in 1 m Höhe gemessen) auf öffentlichen und privaten Flächen sind geschützt; Eingriffe im Wurzelbereich bedürfen einer Genehmigung. In Rheinauen-Bereichen (z. B. Mehlem, Plittersdorf) kommen Hochwasserschutzauflagen der Bezirksregierung Köln hinzu.",
        },
        {
          question: "Wie wird Bauaushub im Bonner Raum fachgerecht entsorgt?",
          answer:
            "Aushub wird nach LAGA M20 bzw. der seit August 2023 geltenden Mantelverordnung (Ersatzbaustoffverordnung + BBodSchV-Novelle) in die Einbauklassen Z0, Z1.1, Z1.2 und Z2 eingestuft. Z0 ist unbelastet und frei verwertbar, Z2 nur eingeschränkt. Annahmestellen im Raum Bonn / Rhein-Sieg verlangen vor Anlieferung in der Regel eine deklarationsanalytische Untersuchung. Bei größeren Mengen empfiehlt sich ein zertifizierter Entsorgungsfachbetrieb nach § 56 KrWG. Wir vermieten den Bagger – die Entsorgung organisierst du separat.",
        },
        {
          question: "Was kostet ein Minibagger am Standort Bonn?",
          answer:
            "Tagespreise sind pro Modell tagesaktuell im Buchungsprozess hinterlegt. Wochenmiete entspricht typischerweise ca. 5 Tagessätzen, Monatsmiete ca. 15 Tagessätzen. Treibstoff wird nach Rückgabe nach vollem Tank abgerechnet, AdBlue bei Maschinen mit Abgasnachbehandlung analog. Lieferpauschalen werden anhand der PLZ im Bonner Liefergebiet (Bonn, Köln-Süd, Wachtberg, Bad Honnef, Königswinter, Sankt Augustin, Bad Neuenahr-Ahrweiler) transparent kalkuliert.",
        },
        {
          question: "Wie läuft die Übergabe in Bonn-Mehlem konkret ab?",
          answer:
            "Abholung in der Drachenburgstraße 8 (53179 Bonn) – verkehrsgünstig direkt an der B9, mit kurzem Weg zur A562 und A565. Reguläre Übergabezeiten Mo–Fr 07:00–18:00 (früherer Start als die anderen Standorte) und Sa 08:00–17:30. Bei der Übergabe Geräteeinweisung am konkreten Modell, gemeinsame Sichtprüfung und schriftliches Übergabeprotokoll. Bei Lieferung auf die Baustelle erfolgt die Einweisung vor Ort durch unseren Fahrer.",
        },
        {
          question: "Welche PSA muss der Bediener tragen?",
          answer:
            "Im gewerblichen Bereich verlangt die DGUV: S3-Sicherheitsschuhe, Warnschutzkleidung nach EN ISO 20471 (mindestens Klasse 2 im öffentlichen Verkehrsraum), Schutzhelm nach EN 397; bei Hammer- und Abbrucharbeiten zusätzlich Gehörschutz und Schutzbrille. PSA stellt der Arbeitgeber bzw. Bauherr – wir vermieten ausschließlich die Maschine.",
        },
      ],
      expertSections: [
        {
          h3: "Bonner Topografie: warum die Baggerwahl hier besonders sorgfältig sein muss",
          paragraphs: [
            "Bonn ist eine der topografisch anspruchsvollsten Mietregionen am Rhein. Im Süden steigt das Gelände steil zum Venusberg, im Osten zum Siebengebirge (Königswinter, Bad Honnef), im Westen liegen die Hänge des Vorgebirges. Für Hanglagen sind Maschinen mit niedrigem Schwerpunkt und Gummiketten Pflicht; das herstellerseitig zulässige Längsgefälle (typisch 15–20° für Minibagger, 25° für Midibagger) steht in jedem Datenblatt. Beim Arbeiten quer zum Hang ist der zulässige Querneigungswinkel deutlich geringer – im Zweifel die Maschine bergauf bzw. bergab arbeiten lassen.",
            "In den Rheinauen (Mehlem, Plittersdorf, Beuel) ist der Untergrund oft weich und schlick­haltig; hier punkten breite Gummiketten gegenüber Stahlketten und der Schwertransport per Tieflader wird wichtig, weil mancher Wirtschaftsweg im Hochwasserschutz­bereich gewichts­beschränkt ist. Wir kennen die typischen Engstellen im Bonner Süden und beraten zur passenden Maschinenklasse am Telefon (0228 504 660 61).",
          ],
        },
        {
          h3: "Sicherheit & Bedienerqualifikation: DGUV-Pflichten in der Praxis",
          paragraphs: [
            "Im gewerblichen Einsatz gelten DGUV V1 und DGUV Regel 100-500 (Kapitel 2.12). Die Qualifikation regelt DGUV Grundsatz 308-009: theoretische und praktische Ausbildung plus schriftliche Beauftragung durch den Unternehmer – personen- und maschinengebunden. Ein Bediener mit Schein auf Minibagger darf nicht automatisch einen Midibagger fahren. Bei Tätigkeiten in der Nähe von Freileitungen, im Gleisbereich (z. B. Stadtbahnlinien Bonn-Bad Godesberg, Linie 16/63/66) oder im Bahnnähebereich kommen zusätzliche Schulungs- und Sicherungs­pflichten dazu.",
            "Häufigste Schadens­ursache bei Mietbaggern ist nach unserer Erfahrung nicht Maschinenversagen, sondern fehlende Erkundung der Untergrund-Sparten und unzureichende Sicherung der Baugrubenränder nach DIN 4124. Wir empfehlen jedem Erstmieter, sich bei der Übergabe in Bonn die volle Einweisung geben zu lassen – inklusive Standsicherheit am Grabenrand und sicherem Anbaugerätewechsel.",
          ],
        },
        {
          h3: "Anbaugeräte: die richtige Kombination für Tiefbau, GaLaBau und Sanierung",
          paragraphs: [
            "Drei Löffel plus ein Spezialwerkzeug – damit ist die Mehrzahl der Bonner Baustellen ausgerüstet. Der schmale Tieflöffel (300–400 mm) zieht saubere Versorgungsgräben für Hausanschlüsse, der mittlere Tieflöffel (500–600 mm) ist der Allrounder für Pflanz- und Pfostengruben, der breite Grabenräumlöffel (800–1.200 mm, zahnlos) profiliert Böschungen und räumt Gräben sauber aus.",
            "Als viertes Werkzeug wählt man je nach Aufgabe: Hydraulikhammer für Asphalt-, Beton- und Naturstein-Abbruch (besonders relevant in Bonner Altstadt-Sanierungen, wo häufig Basaltpflaster und alte Betonfundamente liegen), Erdbohrer mit Schneckenwendel 150–300 mm für Pfostengründungen und Zaunbau, Sortiergreifer für Rückbau. Achte auf die Schnellwechsler-Aufnahme (MS01, MS03, S30/S40) – wir prüfen die Kombination im Bestellprozess und legen passende Adapter bei.",
          ],
        },
        {
          h3: "Transport in der Bonner Region: B9, A555, A565 und enge Innenstadt",
          paragraphs: [
            "Vom Standort Bonn-Mehlem aus erreichen wir das gesamte Liefergebiet kurz: über die B9 nach Bad Godesberg und in die Bonner Innenstadt, über die A562/A565 nach Beuel und Sankt Augustin, über die A555 (Köln–Bonn) ins südliche Köln-Stadtgebiet, über die A59 ins Siebengebirge nach Königswinter und Bad Honnef. Im engen Bonner Innenstadtbereich (Altstadt, Südstadt, Poppelsdorf) lohnt sich oft die Tieflader-Lieferung statt der Selbstabholung – schmale Einbahnstraßen und enge Pollerregelungen machen das Anhängerrangieren mühsam.",
            "Für gewichtsbeschränkte Wege im Hochwasserschutz­bereich (Rheinauen, Drachenfels-Zufahrten) bieten wir leichte Tieflader an. Die Liefer­pauschale kalkulieren wir transparent über die PLZ im Buchungsprozess; für Gewerbekunden organisieren wir auf Wunsch feste Zeitfenster (z. B. vor 08:00 Anlieferung in der Bonner Südstadt).",
          ],
        },
        {
          h3: "Bonn als zweiter SLT-Standort: lokales Sortiment plus 24-Stunden-Nachlieferung aus Krefeld",
          paragraphs: [
            "Die Filiale Bonn (Drachenburgstraße 8, 53179 Bonn-Mehlem) führt das nachgefragte Kernsortiment vor Ort: Minibagger 1,0–2,5 t, Plateauanhänger, Rüttelplatten, Stromaggregate, Bauwerkzeug, GaLaBau-Geräte und das wichtigste Eventequipment. Spezialmaschinen aus dem erweiterten Programm liefern wir aus dem Hauptsitz Krefeld – in der Regel innerhalb von 24 Stunden, oft schon am Folgetag.",
            "Reguläre Öffnungszeiten Mo–Fr 07:00–18:00 (eine Stunde früher als Krefeld), Sa 08:00–17:30 (länger als Krefeld). Damit kannst du auch nach Feierabend oder samstags abholen und zurückgeben – ideal für Wochenend­projekte zwischen Köln-Süd, Bonn und Ahrtal. Beratung zur Maschinenwahl und zum Tieflader-Transport telefonisch unter 0228 504 660 61.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // VERDICHTUNG (Rüttelplatten, Stampfer, Walzen)
    // Quellen: DIN 18134 (Plattendruckversuch / Ev2), ZTV E-StB 17
    //   (Verdichtungsanforderungen, Proctordichte), DGUV
    //   Information 212-024 (Hand-Arm-Vibration), LärmVibrations-
    //   ArbSchV (A(8) Auslöse 2,5 m/s², Grenz 5,0 m/s²),
    //   TA Lärm Nr. 6.1 (Immissionsrichtwerte: Wohngebiete tags
    //   55 dB(A), Mischgebiete 60 dB(A)), Lärmschutzauflagen
    //   in geschützten Bonner Lagen (Rheinaue, Bad Godesberger
    //   Kurpark, Siebengebirge – Naturpark seit 1958).
    // -------------------------------------------------------------
    verdichtung: {
      faqs: [
        {
          question: "Welche Rüttelplatte für Pflaster, Schotter oder Asphalt am Bonner Bauprojekt?",
          answer:
            "Faustregel über das Betriebsgewicht: Bis ca. 100 kg für Bettungssand und kleine Verbundsteinflächen (Garten, Terrasse). 100–200 kg für Standard-Pflaster, Bordsteinverlegung und kleine Wegeflächen. 200–400 kg für Schotter-Tragschichten und Hofflächen. Über 400 kg (Reversierplatten) für Frostschutz­schichten und größere Asphalt- bzw. Tragschichtarbeiten. Stampfer (Vibrationsstampfer 60–80 kg) sind für schmale Gräben und Leitungsverfüllungen erste Wahl. Den passenden Geräteklasse zeigen wir bei der Buchung im Bonner Mietpark direkt an.",
        },
        {
          question: "Welche Verdichtung verlangt die ZTV E-StB für Hausanschluss- und Pflastergräben?",
          answer:
            "ZTV E-StB 17 (Zusätzliche Technische Vertragsbedingungen Erdbau) verlangt für Verfüllungen lagenweisen Einbau (typisch 20–30 cm je Lage) und Verdichtung auf Proctordichten von 97 % (frostfreie Tragschicht) bis 100 % (Straßenoberbau). Für Hausanschluss-Gräben unter Verkehrsflächen ist 100 % DPr Standard. Nachweis erfolgt über Plattendruckversuch nach DIN 18134 (Ev2-Werte je nach Schichtaufbau 45–120 MN/m²). Wir vermieten geeignete Stampfer und Reversierplatten; den Plattendruckversuch beauftragt der Bauherr separat beim Prüfingenieur.",
        },
        {
          question: "Wie laut sind Rüttelplatten – darf ich in Bonner Wohngebieten frei verdichten?",
          answer:
            "Maßgeblich ist die TA Lärm. Tags (06:00–22:00) gelten in reinen Wohngebieten 50 dB(A), in allgemeinen Wohngebieten 55 dB(A), in Mischgebieten 60 dB(A) als Immissionsrichtwert. Eine 200-kg-Rüttelplatte erreicht in 7 m Abstand typisch 80–85 dB(A) – einzelne Tageseinsätze auf privaten Baustellen sind als anlagenbezogene Geräusche zulässig, kontinuierlicher Mehrtagesbetrieb in dichter Wohnbebauung kann Auflagen auslösen. In sensiblen Bonner Lagen (Kurbereich Bad Godesberg, Rheinaue als Naherholungsgebiet) lohnt eine Vorabklärung mit dem Ordnungsamt der Stadt Bonn.",
        },
        {
          question: "Wie viel Hand-Arm-Vibration ist beim Stampfen zulässig?",
          answer:
            "Die LärmVibrationsArbSchV setzt für Hand-Arm-Vibration einen Auslösewert von A(8) = 2,5 m/s² und einen Expositions­grenzwert von A(8) = 5,0 m/s² fest. Ein Vibrationsstampfer erreicht typisch 5–10 m/s² am Griff – das bedeutet, dass der zulässige Achtstunden-Mittelwert oft schon nach 1–2 Stunden reiner Verdichtungs­arbeit erreicht ist. Praxis: Wechselrotation im Team, vibrationsdämpfende Handschuhe (EN ISO 10819), regelmäßige Pausen. Der Vibrations­kennwert (\"a_hv\" in m/s²) steht im Handbuch jedes Geräts.",
        },
        {
          question: "Brauche ich für eine Rüttelplatte Diesel, Benzin oder Hybrid?",
          answer:
            "Kleine Vorwärts-Rüttelplatten bis ca. 150 kg fahren in der Regel mit Benzin (Honda-Motor, EU-Stufe V); mittelschwere Reversier­platten ab ca. 200 kg sind oft als Diesel- oder Benziner-Variante verfügbar; schwere Reversierplatten über 400 kg sind meist Diesel. In Innenräumen und Bonner Tiefgaragen empfehlen wir – sofern verfügbar – elektrische bzw. Akku-Stampfer wegen der CO-Belastung. Die Antriebsart steht in jedem Produktdatenblatt.",
        },
        {
          question: "Wie viel Quadratmeter schaffe ich pro Stunde mit welcher Maschine?",
          answer:
            "Richtwerte aus der Praxis: 100-kg-Vorwärts­platte ca. 200 m²/h Verbundpflaster, 200-kg-Reversier­platte ca. 400 m²/h Pflaster bzw. 250 m²/h Schotter, 400-kg-Reversierplatte ca. 600 m²/h Schotter. Stampfer (60–80 kg) im Graben: ca. 30–50 lfm Graben (40 cm Breite) pro Stunde inklusive lagenweisem Einbau. Diese Werte sinken in Bonner Schräglagen und bei beengter Zugänglichkeit deutlich – im Zweifel eine Größe größer wählen.",
        },
        {
          question: "Wann ist ein Verdichtungsnachweis Pflicht und wie wird er erbracht?",
          answer:
            "Bei jeder Verfüllung im öffentlichen Verkehrsraum (Aufgrabung der Stadt Bonn), bei Hausanschluss-Gräben unter befahrenen Flächen und bei Verfüllungen unter Bauwerken (Fundamente, Bodenplatten) verlangt die ZTV E-StB einen Verdichtungs­nachweis. Standardverfahren ist der Plattendruckversuch nach DIN 18134 (Ev2-Wert) oder der Proctorversuch im Labor. Wir vermieten das Verdichtungs­gerät; den Plattendruck­versuch führt ein zertifiziertes Prüflabor durch.",
        },
        {
          question: "Was passiert bei Über- oder Unterverdichtung?",
          answer:
            "Unterverdichtung führt zu späteren Setzungen – Pflasterflächen sacken nach, Hausanschluss-Gräben unter dem Bürgersteig brechen ein. Überverdichtung bei bindigen Böden (Lehm, Ton, wie sie im Bonner Vorgebirge häufig sind) zerstört die Bodenstruktur und führt zu Wasserstau und Frosthebung. Faustregel: bei nicht-bindigem Boden (Sand, Kies) lieber zwei Übergänge mehr; bei bindigem Boden auf die Proctorkurve achten und bei optimalem Wassergehalt verdichten. Im Zweifel die Bodenmechanik des Bauvorhabens prüfen lassen.",
        },
        {
          question: "Können wir Walzen für größere Bonner Flächen mieten – und welche Klasse?",
          answer:
            "Ja, für Hofflächen, Wege und kleine Asphaltflächen vermieten wir Tandem­vibrationswalzen ab ca. 700 kg bis 2,5 t Betriebsgewicht. Bandagenbreiten 600–1.000 mm. Schwere Walzen über 4 t organisieren wir auf Anfrage aus dem Hauptsitz Krefeld. Für Asphalt-Heißeinbau (Decken­schicht) sind statische Walzen mit ausreichend Eigengewicht Standard. Beratung zur Wahl unter 0228 504 660 61.",
        },
        {
          question: "Was kostet die Verdichtungsmiete in Bonn und wie sind die Tarife gestaffelt?",
          answer:
            "Tagespreise pro Modell sind im Buchungsprozess tagesaktuell hinterlegt. Wochenmiete entspricht ca. 5 Tagessätzen, Monatsmiete ca. 15 Tagessätzen. Treibstoff (Benzin/Diesel) wird nach Rückgabe nach gefülltem Tank abgerechnet. Lieferpauschalen kalkulieren wir transparent nach PLZ im Bonner Liefergebiet.",
        },
      ],
      expertSections: [
        {
          h3: "Verdichtungsmechanik: warum die Maschine zum Boden passen muss",
          paragraphs: [
            "Verdichtung funktioniert über zwei Mechanismen: dynamische Stoßenergie (Stampfer) und schnelle Schwingungen (Rüttelplatten, Walzen). Stampfer wirken tief und schmal – ideal für Leitungsgräben und schmale Streifenfundamente. Rüttelplatten wirken flächig, aber weniger tief – ideal für Pflasterbettungen und Tragschichten. Walzen kombinieren statisches Eigengewicht mit Vibration und sind die Wahl für große Flächen.",
            "Bindige Böden (Lehm, Ton – im Bonner Vorgebirge weit verbreitet) reagieren anders als nicht-bindige (Sand, Kies, Rheinkies). Bei bindigem Material kommt es auf den optimalen Wassergehalt nach Proctor an; zu trocken oder zu nass verdichtet sich der Boden kaum. Bei nicht-bindigem Material sind mehrere Übergänge mit derselben Maschine zielführender als ein Übergang mit zu schwerer Walze. Wir beraten am Standort Bonn zur passenden Kombination, idealerweise mit Bodenkenntnis vom Vorgewerk.",
          ],
        },
        {
          h3: "ZTV E-StB und DIN 18134: was die Norm im Bauvertrag verlangt",
          paragraphs: [
            "Die ZTV E-StB ist die maßgebliche Vertragsgrundlage für Erdbauarbeiten im öffentlichen Bereich – sie wird auch in vielen privaten Bauverträgen referenziert. Verlangt werden Verdichtungsgrade (Proctordichte DPr) je nach Schichtfunktion: 97 % für Damm- und Frostschutzschichten, 100 % für Tragschichten und Verfüllungen unter Verkehrsflächen. Der Nachweis erfolgt entweder über statische Plattendruckversuche nach DIN 18134 (Ev2-Wert mit den Grenzwerten z. B. 45 MN/m² für Frostschutzschicht F1 und 120 MN/m² für STSuB) oder über die dynamische Plattendruckmessung nach TP BF-StB Teil B 8.3.",
            "Praxis: Vor dem Pflastern einer Hofeinfahrt in Bonn-Bad Godesberg oder einer Tiefgaragenzufahrt in Beuel verlangen viele Auftraggeber den Plattendruckversuch. Wir vermieten die nötige Verdichtungsmaschinerie; die Prüfung selbst erfolgt durch ein anerkanntes Prüflabor (häufig in Kombination mit der Bauüberwachung). Den Geräteumfang stimmen wir am Standort Bonn auf das Vertragsleistungsverzeichnis ab.",
          ],
        },
        {
          h3: "Lärm und Vibration: was TA Lärm und LärmVibrationsArbSchV vorgeben",
          paragraphs: [
            "Die TA Lärm regelt die Immissionsrichtwerte am nächsten schutzbedürftigen Aufpunkt: Wohngebiet tags 55 dB(A), Mischgebiet 60 dB(A), Kerngebiet 65 dB(A); nachts (22–06 Uhr) jeweils 15 dB(A) niedriger. Punktuelle Bauverdichtung an Werktagen tagsüber ist in der Regel zulässig, dauerhafter Mehrtagesbetrieb in sensibler Wohnlage (z. B. Bonner Südstadt, Bad Godesberger Villenviertel) kann eine Schalltechnische Untersuchung auslösen.",
            "Beim Bediener greift die LärmVibrationsArbSchV mit Auslösewerten von 80 dB(A) (Lärm) und 2,5 m/s² (Hand-Arm-Vibration) und Grenzwerten von 85 dB(A) bzw. 5,0 m/s². Bei modernen Stampfern und Reversierplatten ist Gehörschutz schon ab dem ersten Einsatz Standard, Vibrationsschutzhandschuhe nach EN ISO 10819 dämpfen die Belastung weiter. Wir geben die Vibrations­kennwerte jeder Maschine im Datenblatt an – wichtig für die Gefährdungsbeurteilung des Auftraggebers.",
          ],
        },
        {
          h3: "Maschinenwahl: vom 60-kg-Stampfer bis zur 2,5-t-Tandemwalze",
          paragraphs: [
            "Die richtige Maschine spart Zeit und schont den Untergrund. Mikro-Klasse (Stampfer 60–80 kg): Leitungs- und Hausanschluss-Gräben, Pfostengründungen, Verfüllung unter Bordsteinen. Vorwärts-Rüttelplatten 80–150 kg: Garten- und Terrassenpflaster bis ca. 30 m². Reversier­platten 200–400 kg: Hofflächen, Pflasterstraßen, Schotter-Tragschichten bis ca. 200 m². Schwere Reversier­platten ab 400 kg und Tandem­walzen 700 kg–2,5 t: Asphalt­einbauten, große Tragschichten, Wege­bau im Außenbereich.",
            "Im Bonner Mietpark führen wir das gesamte Spektrum bis zur 2,5-t-Tandemwalze. Schwerere Walzen (über 4 t) und Spezialgeräte wie Polygonwalzen organisieren wir aus dem Hauptsitz Krefeld nach. Die Verfügbarkeit jeder Klasse zeigen wir live im Buchungssystem an.",
          ],
        },
        {
          h3: "Bonn-spezifisch: Rheinauen, Hanglagen, Naturpark Siebengebirge",
          paragraphs: [
            "Die Bonner Topografie und der Landschaftsschutz prägen viele Verdichtungs­einsätze in der Region. In den Rheinauen (Mehlem, Plittersdorf, Beuel-Süd) ist der Untergrund oft weich und schluffig; hier punktet eine breite Bandage und ein langsamer Walzgang gegenüber Hochfrequenz­vibration. Im Siebengebirge (Königswinter, Bad Honnef – seit 1958 Naturpark) gelten erhöhte Anforderungen an Lärmschutz und Wegebreite; oft ist die Anlieferung per kleinem Tieflader die einzige praktikable Option.",
            "In Bad Godesberg und Poppelsdorf liegen viele Verbundpflaster­flächen in privaten Vorgärten, oft mit Wurzelausläufern alter Bestandsbäume (Baumschutzsatzung Bonn ab 80 cm Stammumfang). Eine zu schwere Rüttelplatte kann hier Wurzelschäden verursachen – im Zweifel eine Nummer kleiner wählen. Wir kennen die typischen Anforderungen und beraten unter 0228 504 660 61 zur passenden Maschinenklasse.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // ARBEITSBÜHNEN (Scherenbühnen, Gelenkteleskopbühnen,
    //   Anhängerbühnen, Mastbühnen, LKW-Arbeitsbühnen)
    // Quellen: BetrSichV, DGUV Grundsatz 308-008 (Ausbildung
    //   Bediener Hubarbeitsbühnen, IPAF-konform), DGUV
    //   Information 208-019, DIN EN 280 (Anforderungen an
    //   Hubarbeitsbühnen), DIN EN 1495 (Hängegerüste),
    //   StVO § 45 (verkehrsrechtliche Anordnung), TRBS 2121
    //   Teil 1 (Gefährdung durch Absturz – Bereit­stellung und
    //   Benutzung von Hubarbeitsbühnen), Sondernutzung Stadt Bonn
    //   (Gebührensatzung, Aufstellung im öffentlichen Verkehrs­raum).
    // -------------------------------------------------------------
    arbeitsbuehnen: {
      faqs: [
        {
          question: "Welche Arbeitsbühne brauche ich für welche Arbeitshöhe?",
          answer:
            "Arbeitshöhe = Plattformhöhe + 2 m (anerkannte Faustregel der Branche). Innen-Scherenbühnen elektrisch erreichen typischerweise 6–14 m Arbeitshöhe, sind kompakt (Durchfahrtsbreite 0,8–1,2 m) und für Hallen und Bürogebäude ideal. Anhängerbühnen 12–20 m Arbeitshöhe, einfach mit BE-Führerschein zur Baustelle zu bringen. Gelenkteleskopbühnen 14–28 m mit horizontaler Reichweite bis 17 m – Standard für Fassaden- und Dacharbeiten. LKW-Arbeitsbühnen ab 22 m, auf Wunsch mit Bedienpersonal. Die exakte Arbeitshöhe steht im Datenblatt jeder Bonner Mietbühne.",
        },
        {
          question: "Brauche ich einen Bedienerschein für die Hubarbeitsbühne?",
          answer:
            "Im gewerblichen Einsatz ja – DGUV Grundsatz 308-008 verlangt eine Ausbildung nach IPAF (oder gleichwertig), bestehend aus Theorie, Praxis und Sicht-/Befähigungsnachweis. Die Beauftragung erfolgt schriftlich durch den Unternehmer, getrennt nach Bühnenklassen (1a, 1b, 3a, 3b nach IPAF). Privat auf eigenem Grundstück ist kein formaler Schein vorgeschrieben; trotzdem ist eine gründliche Einweisung Pflicht. Bei der Übergabe in Bonn-Mehlem bekommst du eine Geräteeinweisung am konkreten Modell.",
        },
        {
          question: "Welche PSA gegen Absturz ist auf Arbeitsbühnen Pflicht?",
          answer:
            "TRBS 2121 Teil 1 und DGUV Information 208-019: Auf Gelenkteleskop- und LKW-Arbeitsbühnen ist ein Auffanggurt mit kurzem Verbindungsmittel (max. 1,8 m), angeschlagen am vorgesehenen Anschlagpunkt der Plattform, vorgeschrieben. Auf Scherenbühnen mit allseitig geschlossenem Geländer (≥ 1,10 m) ist PSAgA in der Regel nicht zusätzlich nötig, wird aber von vielen Bauherren bei Einsatz im Verkehrsraum verlangt. Wir liefern auf Wunsch die Auffanggurte mit – die Verantwortung für die Nutzung liegt beim Arbeitgeber.",
        },
        {
          question: "Was ist die maximale Wind­geschwindigkeit für den Einsatz im Freien?",
          answer:
            "Hersteller geben in der Betriebsanleitung eine maximal zulässige Windgeschwindigkeit an – typischerweise 12,5 m/s (rund 45 km/h, Windstärke 6 \"starker Wind\"). Bei stärkerem Wind muss die Bühne in Transportstellung gefahren und die Arbeit eingestellt werden. Praxisrelevant gerade in den Bonner Rheinauen und am Siebengebirge, wo Böen am Hang oft deutlich stärker als der vorhergesagte Mittelwind sind. Ein Handanemometer am Korb ist gute Praxis; den maximal zulässigen Wert findest du im Datenblatt jeder Mietbühne.",
        },
        {
          question: "Welche Auflagen gelten für die Aufstellung im öffentlichen Verkehrsraum in Bonn?",
          answer:
            "Für Aufstellung auf Bürgersteig oder Fahrbahn ist eine Sondernutzungserlaubnis sowie eine verkehrsrechtliche Anordnung nach § 45 StVO bei der Stadt Bonn (Straßenverkehrsamt) erforderlich. Vorlauf in der Regel 5–10 Werktage; bei Aufstellung in Hauptverkehrsstraßen (z. B. Reuterstraße, Adenauerallee, B9) länger. Eine Beschilderung nach RSA 21 (Richtlinien für die Sicherung von Arbeitsstellen) ist Pflicht. Wir vermieten die Bühne; Antrag und Beschilderung organisiert der Bauherr bzw. ein beauftragtes Verkehrssicherungs-Unternehmen.",
        },
        {
          question: "Wie schwer ist die Bühne – und ist mein Untergrund tragfähig?",
          answer:
            "Anhängerbühnen 700–2.000 kg, Selbstfahrer-Gelenkbühnen 4–12 t, LKW-Arbeitsbühnen 7,5–26 t. Auf gepflasterten Innenhöfen, Tiefgaragendecken und Rasenflächen sind die Punkt­lasten der Stützen kritisch – oft 5–15 t pro Stütze. Lastverteilplatten (mind. 50 × 50 cm, robust) sind Pflicht. Bei Tiefgaragen-Aufstellung den Statikplan des Gebäudes prüfen lassen. Wir geben die Achs- und Stützlasten in jedem Bühnen-Datenblatt an und beraten am Standort Bonn zur Aufstellung.",
        },
        {
          question: "Kann ich die Anhängerbühne mit einem normalen PKW ziehen?",
          answer:
            "Anhängerbühnen wiegen typisch 700–1.800 kg. Bis 750 kg zGM reicht Klasse B. Über 750 kg muss die Kombination aus Zugfahrzeug und Anhängerbühne unter 3.500 kg zGM bleiben (Klasse B); mit B96 bis 4.250 kg, mit BE bis 7.000 kg. Eine 15-m-Anhängerbühne mit ca. 1.500 kg zGM hinter einem 2.000-kg-Pkw liegt im BE-Bereich. Wir prüfen die Führerscheinklasse bei der Übergabe in Bonn.",
        },
        {
          question: "Wie sind die Mietdauern und Preisstufen kalkuliert?",
          answer:
            "Tagespreise pro Modell sind tagesaktuell im Buchungsprozess hinterlegt. Wochenmiete entspricht ca. 5 Tagessätzen, Monatsmiete ca. 15 Tagessätzen. Bei Selbstfahrer-Bühnen wird Diesel/Strom nach Rückgabe abgerechnet; Elektro-Scherenbühnen werden vollgeladen herausgegeben und sind im Innenbereich nahezu lautlos. Längere Mieten (Sanierungs- und Renovierungsprojekte 2–4 Wochen) sind so meist die günstigere Variante.",
        },
        {
          question: "Was ist beim Einsatz auf Bonner Tiefgaragen­decken zu beachten?",
          answer:
            "Tiefgaragen­decken sind in der Regel auf 5 kN/m² Verkehrslast ausgelegt – das entspricht ca. 500 kg/m². Eine LKW-Arbeitsbühne mit 5–8 t Stützlast überschreitet das punktuell deutlich. Pflicht ist die Abstimmung mit dem Tragwerksplaner bzw. dem Statik-Gutachten des Gebäudes (\"Bauwerksbuch\"). Lastverteilung über mind. 1 × 1 m große, biege­steife Lastverteiler. In Bonner Mehrfamilien­häusern mit Tiefgarage (Bad Godesberg, Beuel-Süd) ist das ein häufiges Thema – wir beraten zur passenden Kleinst-Scheren­bühne, die mit der Verkehrslast verträglich ist.",
        },
        {
          question: "Wie funktioniert die Übergabe in Bonn-Mehlem zeitlich?",
          answer:
            "Reguläre Übergabezeiten Mo–Fr 07:00–18:00, Sa 08:00–17:30. Für Selbstfahrer-Gelenkbühnen und LKW-Arbeitsbühnen empfehlen wir Selbstabholung mit eigenem Tieflader oder Lieferung durch uns – das spart Risiko beim Ent- und Aufladen. Bei der Übergabe Geräteeinweisung, gemeinsame Sichtprüfung mit Funktions­test (Heben, Senken, Notabsenkung) und schriftliches Protokoll.",
        },
      ],
      expertSections: [
        {
          h3: "Bühnentypen im Überblick: Scheren, Gelenk-Teleskop, Anhänger, LKW",
          paragraphs: [
            "Vier Bauarten decken nahezu alle Höhenarbeiten ab. Scherenbühnen fahren rein vertikal, haben eine große Plattformfläche und kommen meist elektrisch in Innenräumen oder dieselbetrieben im Außenbereich vor (typisch 6–15 m Arbeitshöhe). Gelenkteleskopbühnen kombinieren vertikales Heben mit horizontalem Ausleger und sind die Wahl, wenn Hindernisse überfahren werden müssen (z. B. Vordächer, Markisen, Fahrzeuge) – 14–28 m Arbeitshöhe sind Standard.",
            "Anhängerbühnen sind die mobilste Variante: mit BE-Führerschein an die Baustelle bringen, Stützen ausfahren, in 5 Minuten einsatzbereit. Reichweiten 12–20 m, ideal für Baumschnitt, Werbeanlagen­montage und kleinere Fassadenarbeiten. LKW-Arbeitsbühnen ab 22 m Arbeitshöhe sind die Lösung für Hochhaus-Fassaden, Glasdach-Reinigung und Industriebau – auf Wunsch liefern wir vom Standort Bonn aus mit Bedienpersonal, weil die Aufstellung in Innenstadt-Sondernutzung oft anspruchsvoll ist.",
          ],
        },
        {
          h3: "IPAF-Schein und Bedienerqualifikation: was DGUV 308-008 verlangt",
          paragraphs: [
            "DGUV Grundsatz 308-008 verlangt eine theoretische und praktische Ausbildung des Bedieners, schriftliche Beauftragung durch den Unternehmer und eine Wiederholung mindestens alle 12 Monate (Unterweisung). In Deutschland hat sich der IPAF-Schein („PAL-Karte\") als Standard etabliert; er gliedert sich nach Bühnenklassen 1a (statisch vertikal), 1b (statisch ausladend), 3a (mobil vertikal), 3b (mobil ausladend). Wer mit einer Gelenkteleskopbühne arbeitet, braucht 3b.",
            "Privat auf dem eigenen Grundstück ist kein formaler Schein vorgeschrieben. Trotzdem ist eine gründliche Einweisung Pflicht – und in unserem Interesse, denn die meisten Schadensbilder entstehen aus Fehlbedienung (zu enge Annäherung an Stromleitungen, falsche Lastverteilung der Stützen, zu hohe Korblast). Bei der Übergabe in Bonn-Mehlem nehmen wir uns die Zeit für diese Einweisung.",
          ],
        },
        {
          h3: "Aufstellung und Stützlast: Tragfähigkeit des Untergrunds",
          paragraphs: [
            "Selbstfahrer-Gelenkbühnen verteilen ihr Gewicht über vier Stützen oder vier Räder. Eine 14-m-Gelenkbühne mit ca. 6 t Gesamtgewicht kann pro Stütze 6–8 t Punktlast erzeugen, weil die Last bei voller Ausladung asymmetrisch wirkt. Auf gepflasterten Innenhöfen, Verbundpflaster und Tiefgaragendecken muss diese Last über Lastverteilplatten (Holz, mind. 50 × 50 cm, dick genug zur Biegesteifigkeit) reduziert werden. Auf weichem Untergrund (Wiese, Schotter) sind größere Platten oder Bohlen Pflicht.",
            "In Tiefgaragen ist das Statik-Gutachten des Gebäudes maßgeblich; viele Garagen erlauben max. 2,5–3 t Achslast. Hier kommt nur eine kleine Scherenbühne (ca. 2 t) infrage. Wir beraten am Standort Bonn zur passenden Kombination aus Bühnenklasse und Lastverteilung – das ist gerade bei Sanierungs- und Renovierungsprojekten in Bonner Mehrfamilien­häusern ein häufiges Thema.",
          ],
        },
        {
          h3: "Sondernutzung im öffentlichen Verkehrsraum: was die Stadt Bonn verlangt",
          paragraphs: [
            "Wer eine Arbeitsbühne auf Bürgersteig oder Fahrbahn aufstellt, nutzt öffentlichen Verkehrsraum sondernutzungspflichtig (Straßen- und Wegegesetz NRW, Sondernutzungssatzung Stadt Bonn). Antrag beim Straßenverkehrsamt Bonn, in der Regel 5–10 Werktage Vorlauf, in stark befahrenen Bonner Hauptverkehrsstraßen (Reuterstraße, B9, Adenauerallee) eher länger. Die Verkehrsrechtliche Anordnung nach § 45 StVO regelt die Beschilderung; Standard ist RSA 21.",
            "Praktisch bedeutet das: Vor dem Mietbeginn den Antrag stellen, die Genehmigung dem Aufstellplatz beilegen, Beschilderung (Verkehrszeichen, Absperrgitter, Halteverbots-Schilder bei Bedarf) entweder selbst stellen oder ein zertifiziertes Verkehrssicherungs-Unternehmen beauftragen. Wir vermieten Halteverbotsschilder und Absperrmaterial am selben Standort in Bonn – das spart einen Lieferanten.",
          ],
        },
        {
          h3: "Bonner Einsatzfelder: vom Baumpflege-Schnitt im Siebengebirge bis zur Bürofassade in der Südstadt",
          paragraphs: [
            "Im Bonner Liefergebiet (Bonn, Köln-Süd, Wachtberg, Bad Honnef, Königswinter, Sankt Augustin, Bad Neuenahr-Ahrweiler, Rhein-Sieg-Kreis) decken wir vier typische Einsatzfelder ab. Baumpflege und Obstbau im Siebengebirge und im Vorgebirge: kompakte Anhängerbühnen 12–17 m, oft mit Allrad-Selbstfahrt zur Aufstellung auf weichem Untergrund. Fassaden- und Dacharbeiten in Bonner Mehrfamilienhäusern: 15–22-m-Gelenkteleskopbühnen mit langer horizontaler Reichweite, um Vorgartenpflanzungen zu überfahren.",
            "Werbeanlagen- und Beleuchtungs­montage in der Bonner Innenstadt: schmale Gelenkbühnen mit kurzem Schwenkradius, oft in Verbindung mit Sondernutzung. Industriebau und Versorgungs­technik im Bonner Norden (Beuel, Pützchen, Sankt Augustin): Scherenbühnen 12–14 m für Hallen-Innenarbeiten an Beleuchtung, Lüftung und Brandmelde­anlagen. Reguläre Öffnungszeiten Mo–Fr 07:00–18:00, Sa 08:00–17:30 – Beratung unter 0228 504 660 61.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // WERKZEUGE (Bohrhammer, Trennschleifer, Kernbohrer,
    //   Schlagschrauber, Tauchsäge, Sauger, Akkugeräte)
    // Quellen: Maschinenrichtlinie 2006/42/EG (CE), DGUV V3
    //   (Elektrische Betriebsmittel), DIN VDE 0701-0702
    //   (Wiederholungsprüfung), LärmVibrationsArbSchV, DIN EN
    //   60745 (Handgeführte Elektrowerkzeuge), DGUV Information
    //   209-017 (Lärm am Arbeitsplatz), TRGS 559 (Mineralischer
    //   Staub – Quarzgrenzwert 0,05 mg/m³ A-Staub), TRGS 900
    //   (Allgemeiner Staubgrenzwert 1,25 mg/m³ A-Staub).
    // -------------------------------------------------------------
    werkzeuge: {
      faqs: [
        {
          question: "Welcher Bohrhammer für welchen Anwendungsfall?",
          answer:
            "Klassifizierung nach Schlagenergie: bis 3 J für Mauerwerk und kleine Beton­bohrungen bis ca. 20 mm; 3–8 J für klassische Sanitär- und Elektroinstallation (Beton bis 32 mm, leichte Meißelarbeiten); 8–25 J Kombihammer für Stemm- und Abbruch­arbeiten in Beton; ab 25 J Abbruchhammer für massiven Beton- und Mauerwerk-Abbruch. SDS-plus bis ca. 32 mm, SDS-max ab 35 mm Bohr­durchmesser. Wir vermieten am Standort Bonn das volle Spektrum von Bohrhammern bis 25 J Schlagenergie.",
        },
        {
          question: "Welche Schutzklasse müssen Bau-Elektrowerkzeuge haben – und brauchen sie eine DGUV-V3-Prüfung?",
          answer:
            "Auf Baustellen verlangt DGUV V3 in Verbindung mit DIN VDE 0701-0702 für ortsveränderliche elektrische Betriebsmittel eine Wiederholungsprüfung – die Intervalle hängen von der Beanspruchung ab (Faustregel: alle 3–6 Monate auf der Baustelle, jährlich im Werkstattbetrieb). Schutzklasse I (Schutzleiter) oder II (Schutzisoliert, doppeltes Quadrat) sind Pflicht. Unsere Mietwerkzeuge sind DGUV-V3-geprüft, die Prüfplakette mit Datum und Prüfer-Kennung ist sichtbar am Gerät.",
        },
        {
          question: "Wie laut ist mein Werkzeug – und wann brauche ich Gehörschutz?",
          answer:
            "Auslösewerte nach LärmVibrationsArbSchV: ab 80 dB(A) Tagesexposition Gehörschutz bereitzustellen, ab 85 dB(A) zwingend zu tragen. Praxiswerte: Bohrhammer 95–105 dB(A), Trennschleifer 100–110 dB(A), Diamantkernbohrgerät 90–100 dB(A), Tauchsäge 95–105 dB(A). Bei nahezu allen Bau-Elektrowerkzeugen ist Gehörschutz Pflicht. Der LpA-Wert (Schalldruckpegel am Bediener) steht im Datenblatt jedes Geräts.",
        },
        {
          question: "Welche Stäube entstehen – und welcher Sauger gehört dazu?",
          answer:
            "Beim Bohren und Schneiden mineralischer Werkstoffe (Beton, Mauerwerk, Naturstein) entsteht Quarzfeinstaub – ein KMR-Stoff der Kategorie 1A nach TRGS 906. Der Arbeitsplatzgrenzwert (AGW) nach TRGS 900 für allgemeinen A-Staub liegt bei 1,25 mg/m³; für alveolengängigen Quarzstaub gilt nach TRGS 559 ein deutlich strengerer Akzeptanz­wert von 0,05 mg/m³. Praxis: H-Klasse-Sauger nach DIN EN 60335-2-69 mit Bürstensystem an Bohr­hammer und Trenn­schleifer; M-Klasse für Holz- und Gipsfein­staub. Wir vermieten passende H- und M-Sauger sowie Adapter; bitte bei der Buchung in Bonn das passende Set kombinieren.",
        },
        {
          question: "Kernbohren in Beton – welche Maschine und welche Befestigung?",
          answer:
            "Diamantkernbohrgeräte ab 1.500 W trocken oder nass; Durchmesser 30–200 mm Standard, bis 350 mm mit größeren Maschinen. Bohrtiefe pro Krone typischerweise 300–500 mm; größere Tiefen mit Verlängerung. Befestigung: bei kleinen Maschinen Handführung mit Seitengriff, ab ca. 60 mm Bohr­durchmesser Bohrständer mit Schwerlast­dübel (M12/M16) oder Vakuumplatte (auf glattem, dichtem Beton). Nass­bohren mit Schmutzwasser-Sauger ist Standard wegen Staub und Kühlung. Wir geben im Bonner Mietpark Bohr­ständer und passende Kronen mit aus.",
        },
        {
          question: "Welche Akkugeräte halte ich am Standort Bonn vor?",
          answer:
            "Wir setzen primär auf 18-V- und 36-V-Systeme der etablierten Hersteller (DeWalt, Makita, Hilti) – Akkubohrer, Akku-Schlagschrauber, Akku-Bohrhammer, Akku-Tauchsäge, Akku-Trennschleifer 125/230 mm. Vorteil gegenüber kabelgebundenen Geräten: keine Stolperfallen, ideal in Bonner Altbau­sanierungen ohne Bau­stromanschluss, leiser im Innenausbau. Wir geben Reserve­akkus und Ladegerät grundsätzlich mit aus – Mietzeit ist nicht durch die Akku­laufzeit limitiert.",
        },
        {
          question: "Welche PSA ist beim Werkzeug-Einsatz Pflicht?",
          answer:
            "Branchenüblich auf der Baustelle: S3-Sicherheitsschuhe, Schutzbrille (EN 166), Gehörschutz (EN 352, ab Trenn-, Bohr- und Stemmarbeiten), Atemschutz FFP2/FFP3 (EN 149) bei mineralischem Staub, Schutzhandschuhe (EN 388) gegen mechanische Risiken, Helm (EN 397) im Bau­umfeld. PSA stellt der Arbeitgeber bzw. Bauherr – wir vermieten ausschließlich das Werkzeug. Eine PSA-Ausstattungsliste je Werkzeug findest du im Datenblatt.",
        },
        {
          question: "Wie lange darf ich mit einem Hand-Werkzeug am Tag arbeiten?",
          answer:
            "Begrenzend ist Hand-Arm-Vibration nach LärmVibrationsArbSchV. Auslöse 2,5 m/s² A(8), Grenzwert 5,0 m/s² A(8). Beispiel: Ein Bohrhammer mit 11 m/s² am Griff erreicht den Auslösewert bereits nach ca. 25 Minuten reiner Vibration, den Grenzwert nach ca. 100 Minuten. In der Praxis bedeutet das: Wechselrotation im Team und vibrationsdämpfende Handschuhe (EN ISO 10819). Der Vibrationskennwert (a_hv) steht in jedem Geräte­datenblatt.",
        },
        {
          question: "Was kostet die Werkzeug-Miete in Bonn und gibt es Wochenend-Tarife?",
          answer:
            "Tagespreise pro Gerät sind tagesaktuell im Buchungsprozess hinterlegt. Wochenmiete entspricht ca. 5 Tagessätzen, Wochenend-Miete (Freitag-Abholung / Montag-Rückgabe) wird in vielen Fällen wie 1 Tag berechnet – siehe Wochenend-Tarif im Buchungsprozess. Verbrauchsmaterial (Bohrkronen, Trennscheiben, Bohrer) wird nach Verbrauch abgerechnet bzw. ist im Mietpreis je nach Artikel enthalten.",
        },
        {
          question: "Was passiert bei Verlust oder Beschädigung?",
          answer:
            "Bei normalem Verschleiß (stumpfe Bohrer, gebrauchte Schleifscheiben) erfolgt keine Berechnung – das ist in der Tagesmiete einkalkuliert. Bei Beschädigung durch Fehlbedienung (Sturz, Wassereintritt, Überlastung) bzw. Verlust wird das Gerät zum Tageswert ersetzt. Eine optionale Haftungs­reduzierung kann bei der Buchung gewählt werden – Details im Mietvertrag. Wir prüfen jedes Gerät bei Rückgabe gemeinsam mit dir.",
        },
      ],
      expertSections: [
        {
          h3: "Werkzeugauswahl nach Aufgabe: warum die richtige Klasse Zeit und Geld spart",
          paragraphs: [
            "Ein zu kleines Werkzeug zwingt zu mehrfachem Ansetzen, beansprucht die Mechanik überproportional und verlängert die Mietdauer. Ein zu großes Werkzeug ist schwer, vibrationsstark und für feine Arbeiten ungeeignet. Faustregel: Bohrlochdurchmesser unter 12 mm und Tiefe unter 100 mm → leichter Bohrhammer bis 3 J. 12–20 mm und bis 250 mm Tiefe → mittlerer Bohrhammer 3–8 J. Über 20 mm oder Stemm­arbeit → Kombi­hammer ab 8 J. Beton-Abbruch und Stemmen großer Wandöffnungen → Abbruch­hammer ab 25 J oder elektrischer Stemm­hammer.",
            "Im Bonner Mietpark führen wir alle Klassen. Bei der Buchung filterst du nach Schlagenergie, Werkzeug­aufnahme (SDS-plus/SDS-max) und Antriebsart (kabelgebunden 230 V, 36-V-Akku, Druckluft). Im Zweifel rufen wir kurz zur Anwendung zurück und empfehlen die passende Maschine – das spart auf der Baustelle in Bad Godesberg oder Beuel oft Stunden.",
          ],
        },
        {
          h3: "Staubschutz und H/M-Sauger: TRGS 559 und der Quarz-Grenzwert",
          paragraphs: [
            "Quarzfeinstaub aus Beton-, Mauerwerk- und Naturstein­bearbeitung ist nach TRGS 906 als KMR-Stoff Kategorie 1A klassifiziert (krebserzeugend beim Menschen). TRGS 559 setzt einen Akzeptanzkonzentrations­wert von 0,05 mg/m³ für alveolengängigen Quarzstaub und einen Toleranz­wert von 0,1 mg/m³ – beides deutlich strenger als der allgemeine A-Staub-Grenzwert von 1,25 mg/m³ nach TRGS 900.",
            "Praktisch heißt das: Bei jeder Bohr-, Trenn-, Stemm- oder Schleifarbeit an mineralischen Werkstoffen muss eine wirksame Staubminderung erfolgen – entweder durch Nassbearbeitung oder durch Absaugung an der Entstehungsstelle. Geeignete Sauger sind H-Klasse-Sauger nach DIN EN 60335-2-69 (Abscheidegrad ≥ 99,995 % für Partikel ≥ 0,3 µm). M-Klasse genügt für Holz- und Gipsstaub, aber nicht für Quarz. Wir vermieten beide Klassen und kombinieren das passende Sauger-Werkzeug-Set bei der Buchung in Bonn-Mehlem.",
          ],
        },
        {
          h3: "Lärm und Vibration: was die LärmVibrationsArbSchV in Stunden bedeutet",
          paragraphs: [
            "Die LärmVibrationsArbSchV setzt zwei Schwellen: Auslösewerte (ab denen Schutz­maßnahmen Pflicht sind) und Grenzwerte (die nicht überschritten werden dürfen). Lärm: Auslöse 80 dB(A) LEX,8h, Grenz 85 dB(A) LEX,8h. Hand-Arm-Vibration: Auslöse 2,5 m/s² A(8), Grenz 5,0 m/s² A(8).",
            "Konkret für ein typisches Bonner Sanierungsprojekt: Trennschleifer mit 105 dB(A) erreicht in 8 Stunden eine Tages­exposition von 105 dB(A) – Faktor 100 über dem Grenzwert. Reduktion auf 30 Minuten reine Schleifzeit pro Tag bringt rund 90 dB(A) LEX,8h – immer noch über dem Grenzwert, also Gehörschutz Pflicht. Bei der Vibration: Bohrhammer mit 11 m/s² erreicht in 100 Minuten den Grenzwert. Wechselrotation im Team und vibrationsdämpfende Handschuhe (EN ISO 10819) sind die wirksamen Maßnahmen.",
          ],
        },
        {
          h3: "DGUV V3 und Prüfintervalle: warum die Prüfplakette zählt",
          paragraphs: [
            "DGUV Vorschrift 3 in Verbindung mit DIN VDE 0701-0702 schreibt für jedes elektrische Betriebsmittel eine Wiederholungsprüfung vor. Auf Bau- und Montagestellen mit hoher Beanspruchung sind Intervalle von 3 Monaten (handgeführte Werkzeuge im täglichen Einsatz) bis 6 Monaten (sporadisch genutzte Geräte) Standard. Prüfumfang: Sichtprüfung (Kabel, Stecker, Gehäuse), Schutzleiter­widerstand (≤ 0,3 Ω), Isolationswiderstand (≥ 0,3 MΩ), Funktionsprüfung.",
            "Unsere gesamte Mietwerkzeug-Flotte in Bonn ist DGUV-V3-geprüft, jede Plakette ist mit Datum und Prüfer-Kennung versehen. Auf der Baustelle wird die gültige Plakette vom Sicherheits- und Gesundheits­schutz­koordinator (SiGeKo) bzw. der Bauleitung kontrolliert. Mit unserer Vermietflotte hast du den Nachweis automatisch in der Hand – das ist ein konkreter Mehrwert gegenüber Hobby-Werkzeug aus dem Privatbestand.",
          ],
        },
        {
          h3: "Bonn-spezifisch: Altbau-Sanierung, Tiefgaragen, Sondergewerbe",
          paragraphs: [
            "Bonn hat einen hohen Anteil an Gründerzeit- und Nachkriegs­bauten (Südstadt, Poppelsdorf, Beuel-Mitte), in denen Wand­stärken, Mörtelqualität und Bewehrungs­dichte stark variieren. Für die Sanierung empfiehlt sich oft ein Mix aus mittlerem Bohrhammer (3–6 J) für die meisten Bohrungen plus einer Reserve in Form eines stärkeren Kombihammers für unerwartet harte Sturzbeton-Lagen. Wir halten in Bonn beide Klassen vor.",
            "In Tiefgaragen­sanierungen und Gewerbe­standorten (Bonner Norden, Sankt Augustin) sind Akku- und elektrische Geräte wegen der CO-Belastung von Verbrennungs­motoren erste Wahl. Für Trennschnitte in Beton bietet sich Nass-Trenntechnik an, weil der Wasserschleier sowohl die Staub­belastung als auch die Lärmemission reduziert. Beratung zum passenden Werkzeug-Set unter 0228 504 660 61.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // AGGREGATE (Stromerzeuger, Schweißaggregate, Kompressoren,
    //   Pumpen, Heizölaggregate)
    // Quellen: DIN VDE 0100-551 (Niederspannungs-Stromerzeugungs-
    //   anlagen), DIN VDE 0100-410 (Schutz gegen elektrischen
    //   Schlag), 32. BImSchV (Geräte- und Maschinenlärmschutz-
    //   verordnung, Anhang Bauarten), DIN EN ISO 8528 (Strom-
    //   erzeugungsaggregate mit Verbrennungsmotoren), DGUV V3,
    //   AVV Wassergefährdende Stoffe (Aufstellung und Betank-
    //   ung von Dieselaggregaten), AwSV (Anlagen­verordnung
    //   wassergefährdender Stoffe).
    // -------------------------------------------------------------
    aggregate: {
      faqs: [
        {
          question: "Welches Stromaggregat brauche ich für welche Leistung?",
          answer:
            "Faustregel über die Scheinleistung (kVA): Kleine Baustellen mit Bohrhammer + Trennschleifer + Beleuchtung: 3–5 kVA. Mittlere Bauwagen-Versorgung oder Hauptmaschine: 6–13 kVA. Bühne, Catering oder mittelgroße Eventversorgung: 20–40 kVA. Großevent oder mehrere Hochleistungsmaschinen parallel: 60–100 kVA und mehr. Wichtig: Anlaufstrom von Motoren und Pumpen kann das 3–5-fache des Nennstroms betragen – Aggregat eine Nummer größer wählen. Wir halten am Standort Bonn das volle Spektrum von 3 bis 100+ kVA vor.",
        },
        {
          question: "Wie ist das Aggregat geerdet – und brauche ich ein zusätzliches IT-/TN-System?",
          answer:
            "Stromaggregate werden nach DIN VDE 0100-551 als IT-System (Isolation Terre, Netz nicht direkt geerdet) oder TN-System (Netz mit geerdetem Sternpunkt) betrieben. Aggregate unter 10 kVA mit interner Schutztrennung dürfen IT betrieben werden, mit FI-Schutz für jeden Abgang. Größere Aggregate werden als TN-S betrieben und müssen über einen Erdungsstab (Tiefe mind. 1,5 m im gewachsenen Boden) geerdet werden – Erdungswiderstand möglichst ≤ 4 Ω. Wir geben Erdungsspieß und Erdungsleitung passend zur Aggregat-Größe mit aus.",
        },
        {
          question: "Welche Geräuschemission haben Dieselaggregate – und gibt es Schallschutz-Hauben?",
          answer:
            "Maßgeblich ist die 32. BImSchV (Geräte- und Maschinenlärmschutz­verordnung). Stromerzeuger sind in Anhang aufgeführt; Tagesbetrieb in Wohngebieten ist eingeschränkt zulässig, in Wohngebieten zwischen 20–07 Uhr verboten. Unsere modernen schallgedämmten Aggregate erreichen 65–75 dB(A) in 7 m Abstand – das ist im Mischgebiet tagsüber problemlos einsetzbar, in reinen Wohngebieten je nach Standort eng. Für sensible Einsätze (Events in Bonner Innenstadt, Krankenhausnähe) bieten wir besonders leise Stage-V-Aggregate (\"Whisper\"-Klasse) mit ca. 55 dB(A) in 7 m.",
        },
        {
          question: "Wie wird ein Dieselaggregat sicher aufgestellt und betankt?",
          answer:
            "Aufstellung auf ebener, tragfähiger Fläche; Schutzabstand zu brennbaren Materialien mind. 2 m; Abgasrohrführung so, dass keine Abgase in Innenräume gelangen. Betankung nach AVV/AwSV nur in dichten Auffangwannen bzw. mit doppelwandiger Aggregat-Bauweise. Unsere Aggregate ab 20 kVA sind als Bauaggregat mit integrierter, dichter Auffangwanne nach AwSV ausgeführt – sie können ohne zusätzliche Vorkehrung auf wasserdurchlässigem Untergrund (Schotter, gewachsener Boden) betrieben werden.",
        },
        {
          question: "Wie wechseln Aggregate zwischen 230 V Schuko, CEE 16, 32 und 63 A?",
          answer:
            "Aggregate ab 5 kVA haben in der Regel mehrere Steckdosen parallel: 2× Schuko 230 V/16 A, 1× CEE 16 A blau (230 V), und je nach Größe CEE 16/32/63 A rot (400 V). Größere Aggregate (>20 kVA) typischerweise nur noch CEE 32 A bzw. 63 A rot. Verteiler mit Adaptern auf Schuko/Caravan-Steckdosen ergänzen wir aus unserer Kategorie \"Kabel & Stromverteiler\" – im Buchungsprozess kannst du beides kombinieren.",
        },
        {
          question: "Sind die Aggregate für sensible Verbraucher (Server, LED-Pixel) geeignet?",
          answer:
            "Standardaggregate erzeugen Spannungen mit ±5–10 % Spannungs­toleranz und ±2,5 % Frequenztoleranz – das ist für Bauwerkzeuge und Beleuchtung unkritisch. Für sensible Verbraucher (Medizintechnik, Server, hochwertige Eventtechnik mit LED-Pixel und Funk-Strecken) bieten wir Inverter- bzw. Stage-V-Aggregate mit deutlich saubererer Sinusspannung (THD < 5 %) und engerer Toleranz. Bitte bei der Buchung in Bonn angeben, welche Verbraucher angeschlossen werden.",
        },
        {
          question: "Welchen Kraftstoffverbrauch muss ich einplanen?",
          answer:
            "Richtwerte (Diesel) je nach Last: 5-kVA-Aggregat bei 70 % Last ca. 1,5 l/h, 13-kVA-Aggregat ca. 3 l/h, 40-kVA-Aggregat ca. 9 l/h, 100-kVA-Aggregat ca. 22 l/h. Bei Volllast 30–50 % mehr, bei 25 % Last 30–40 % weniger. Die Tankgröße ist bei unseren Bauaggregaten so dimensioniert, dass ein 8-Stunden-Schichtbetrieb ohne Nachtanken möglich ist (typisch 60–250 l Tankinhalt). AdBlue bei Stage-V-Aggregaten analog – im Datenblatt jedes Aggregats.",
        },
        {
          question: "Welche Versicherung greift bei einem Defekt am angeschlossenen Verbraucher?",
          answer:
            "Wir liefern geprüfte, technisch einwandfreie Aggregate (DIN VDE 0100-551 / DGUV V3); im seltenen Fall eines Aggregat-Defekts (Spannungs­überhöhung, Frequenz­drift) prüfen wir gemeinsam den Ablauf. Schäden an angeschlossenen Verbrauchern werden im Einzelfall geprüft – häufige Schadens­ursache ist nicht das Aggregat, sondern fehlende Erdung, falsche Belastung (Schieflast) oder unzulässige Kabel­querschnitte. Eine separate Maschinen­bruch­versicherung für hochwertige eigene Verbraucher empfiehlt sich.",
        },
        {
          question: "Vermieten wir auch Pumpen, Kompressoren und Schweißaggregate?",
          answer:
            "Ja. Schmutzwasserpumpen 1–5\" für Baugruben­entwässerung, Tauchpumpen für Keller­überflutung (auch leihweise im Notfall), Druckluft­kompressoren 5–10 bar für Druckluft­werkzeuge und Sandstrahlen, fahrbare Schweißaggregate (Inverter-WIG/MAG) für Bau­schweißarbeiten. Verfügbarkeit am Standort Bonn zeigt jedes Produkt direkt an; Spezial­ausführungen liefern wir aus dem Hauptsitz Krefeld nach.",
        },
        {
          question: "Was kostet die Aggregat-Miete in Bonn und gibt es Kraftstoff-Pakete?",
          answer:
            "Tagespreise pro Aggregat sind tagesaktuell im Buchungsprozess hinterlegt; Diesel wird nach Rückgabe nach vollem Tank abgerechnet. Wochenmiete entspricht ca. 5 Tagessätzen, Monatsmiete ca. 15 Tagessätzen. Für mehrwöchige Bau­einsätze bieten wir auf Wunsch ein Kraftstoff-Logistikpaket (Tankwagen-Befüllung vor Ort) – Anfrage unter 0228 504 660 61.",
        },
      ],
      expertSections: [
        {
          h3: "Leistungsauslegung: kVA, Wirkleistung und Anlaufstrom",
          paragraphs: [
            "Stromaggregate werden in Scheinleistung kVA angegeben, Verbraucher meist in Wirkleistung kW. Faustregel: kVA ≈ kW × 1,1–1,4, abhängig vom Leistungsfaktor (cos φ). Reine Heiz- und Glühlampen-Lasten haben cos φ ≈ 1, Motoren und Frequenzumrichter cos φ ≈ 0,8. Zusätzlich kritisch: der Anlaufstrom von Motoren kann das 3-fache (Sanftanlauf), 5-fache (Stern-Dreieck-Anlauf) oder 7-fache (Direktanlauf) des Nennstroms erreichen – ein Aggregat muss diesen Spitzen kurzzeitig liefern können, ohne dass die Spannung einbricht.",
            "Praxis: Für eine Hubarbeitsbühne mit 7,5-kW-Hubmotor empfehlen wir mindestens 20 kVA Aggregatleistung, obwohl die Dauerleistung nur 7,5 kW beträgt. Wir rechnen das bei der Buchung in Bonn gemeinsam mit dir durch – bitte die größten Einzelverbraucher mit kW und Anlauf­art (Direkt, Stern-Dreieck, Sanft, Frequenz­umrichter) angeben.",
          ],
        },
        {
          h3: "Erdung und Schutzkonzept: warum DIN VDE 0100-551 zählt",
          paragraphs: [
            "DIN VDE 0100-551 regelt die Erdung von Niederspannungs-Stromerzeugungs­anlagen. Kleinaggregate bis 10 kVA mit interner Schutztrennung (Trafo im Aggregat) sind als IT-System ausgelegt – jeder Abgang braucht einen RCD (FI) ≤ 30 mA als Personen­schutz. Ab ca. 10 kVA wird das Aggregat als TN-S betrieben, der Sternpunkt wird mit einem Erdungsstab geerdet; ein RCD ist auch hier auf jedem 230-V-Abgang Pflicht.",
            "Auf der Baustelle in Bonn bedeutet das praktisch: Erdungsstab 1,5 m Tiefe in den gewachsenen Boden (nicht im verdichteten Bauschutt), Erdungsleitung mit Querschnitt ≥ 16 mm² Cu, Verbindung am Aggregat-PE. Erdungswiderstand mit einem Erdungsmessgerät messen (idealerweise ≤ 4 Ω). Wir geben Erdungsspieß und passende Leitung mit aus; der Nachweis der Erdung gehört zur DGUV-V3-Pflicht für die Bau-Elektrik.",
          ],
        },
        {
          h3: "Geräusch- und Schadstoffemissionen: 32. BImSchV, Stage V und der Gewinn an Sauberkeit",
          paragraphs: [
            "Die 32. BImSchV begrenzt die Geräuschemission von im Freien betriebenen Geräten – Stromerzeuger sind im Anhang gelistet. Konformitäts­bewertete Aggregate tragen das CE-Kennzeichen plus die garantierte LWA-Angabe in dB(A). Unsere schallgedämmten Bauaggregate liegen typisch bei 95–98 dB(A) LWA, Stage-V-„Whisper\"-Aggregate bei 85–90 dB(A) LWA. In 7 m Abstand entspricht das 65–75 dB(A) bzw. 55–65 dB(A).",
            "Schadstoff­seitig löst die EU-Stage-V (Verordnung 2016/1628) seit 2020 die alte Stufe IV ab und reduziert Partikel- und NOx-Emissionen drastisch (Partikelfilter, AdBlue-SCR). Praxis: In Innenstadtbereichen und Eventlocations mit Anwohner­nähe (Bonner Innenstadt, Beuel-Süd, Bad Godesberger Kurbereich) ist Stage V die richtige Wahl – wir halten am Standort Bonn beide Generationen vor und beraten zur passenden Stufe.",
          ],
        },
        {
          h3: "Gewässerschutz und Betankung: AVV/AwSV in der Praxis",
          paragraphs: [
            "Dieselaggregate fallen unter die AwSV (Anlagen­verordnung wasser­gefährdender Stoffe). Wichtige Schwellenwerte: Aggregate mit Tankinhalt > 220 l sind anlagenbezogen einzustufen; Aufstellung auf wassergefährdetem Boden (Wasserschutzgebiet, Überschwemmungsgebiet) erfordert zusätzliche Auffangwannen. Unsere Bauaggregate ab 20 kVA sind doppelwandig mit integrierter Auffangwanne ausgeführt – das deckt die typischen Bonner Baustellen­anforderungen ab.",
            "Bei der Betankung gelten: Kein Betanken bei laufendem Motor, Abstand zu Zündquellen, Betankung mit Pistolen­ventil oder Trichter, keine offenen Kanister auf der Aggregat-Oberseite. Für mehrwöchige Mieten organisieren wir auf Wunsch eine Tankwagen-Befüllung vor Ort durch unseren Logistik-Partner – das vermeidet Kanister­transporte mit dem Pkw (gefahrgut­rechtlich begrenzt auf 240 l).",
          ],
        },
        {
          h3: "Bonn-spezifisch: vom Hochwasser-Notbetrieb bis zum Stage-V-Eventaggregat in der Innenstadt",
          paragraphs: [
            "Im Bonner Liefergebiet decken Aggregate vier typische Einsatzfelder ab. Notstrom bei Hochwasser (Ahrtal, Rheinauen): mobile Aggregate 5–20 kVA, kurzfristig verfügbar – wir halten Reserve-Aggregate für solche Lagen bereit. Baustromversorgung in Bonner Tiefbau- und GaLaBau-Projekten: 13–40 kVA als Standard-Bauaggregat, schallgedämmt. Eventversorgung in der Bonner Innenstadt (Münsterplatz, Marktplatz, Hofgarten): Stage-V-Whisper-Aggregate 40–60 kVA wegen Wohnnähe und Tagungsbetrieb.",
            "Industriestrom für temporäre Gewerbeprojekte (Sankt Augustin, Beuel-Nord): 60–100+ kVA mit CEE-32/63-A-Verteilern. Beratung zur passenden Größe und Schadstoff­klasse telefonisch unter 0228 504 660 61. Reguläre Öffnungszeiten Mo–Fr 07:00–18:00, Sa 08:00–17:30 – für Notfälle (Hochwasser, Stromausfall) erreichst du uns auch außerhalb der Öffnungszeiten über die Standortnummer.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // GARTENPFLEGE (Häcksler, Vertikutierer, Kettensäge,
    //   Wurzelfräse, Holzspalter, Mäher)
    // Quellen: 32. BImSchV (Geräte- und Maschinenlärmschutz),
    //   § 39 BNatSchG (Vegetationsperiode 1.3.–30.9.),
    //   DGUV Information 214-059 + Grundsatz 308-009 (Motorsäge),
    //   Baumschutzsatzung Bonn (Schutz ab 80 cm Stammumfang
    //   in 1 m Höhe, Genehmigung beim Amt für Umwelt und
    //   Stadtgrün), Schutzgebiete Rheinaue / Siebengebirge.
    // -------------------------------------------------------------
    gartenpflege: {
      faqs: [
        {
          question: "Welcher Häcksler passt zu Bonner Gartenrückschnitt im Wohngebiet?",
          answer:
            "Für die dicht bewohnten Bonner Quartiere (Südstadt, Poppelsdorf, Bad Godesberg, Beuel-Mitte) sind Walzenhäcksler (Leise-Häcksler) bis ca. 35–45 mm Astdurchmesser klar erste Wahl – sie liegen typisch bei 90–95 dB(A) LWA und arbeiten nachbarschaftsverträglich. Für stärkeres Schnittgut (45–75 mm) gibt es Turbinen- und Hammerwerk-Häcksler, die aber im Wohnumfeld konfliktträchtig sind. Wir bevorraten am Standort Bonn-Mehlem das gängige Walzen- und Turbinensortiment; größere Profi-Häcksler liefern wir bei Bedarf binnen 24 Stunden aus Krefeld nach.",
        },
        {
          question: "Vertikutieren oder Aerifizieren – was brauche ich wann?",
          answer:
            "Vertikutierer schneiden senkrecht in die Grasnarbe (3–5 mm tief) und entfernen Rasenfilz und Moos – Standardpflege im März/April und September. Aerifizierer stechen 5–10 cm tiefe Hohldorne in den Boden und entlasten verdichtete Flächen (Spielrasen, Hundewiese, Sportplatz). Auf normalem Hausrasen reicht Vertikutieren plus Nachsaat; Aerifizieren ist nur bei spürbarer Verdichtung nötig. Beide Geräte führen wir in Elektro- und Benzin-Ausführung am Standort Bonn-Mehlem.",
        },
        {
          question: "Welche Lärmregelung gilt für Gartengeräte in Bonner Wohngebieten?",
          answer:
            "Die 32. BImSchV erlaubt den Einsatz lärmintensiver Geräte (Rasenmäher, Vertikutierer, Häcksler, Motorsensen) in reinen und allgemeinen Wohngebieten werktags 07:00–20:00. Besonders laute Geräte (Laubbläser, Freischneider mit Verbrennungsmotor) unterliegen in Wohngebieten zusätzlich einer Mittagsruhe-Regel und dürfen werktags 13:00–15:00 nicht laufen. Sonntags und an gesetzlichen Feiertagen ganztägig untersagt. Akku- und Elektrogeräte mit EU-Umwelt-Kennzeichen sind von einem Teil dieser Einschränkungen ausgenommen – im Kurpark-Umfeld Bad Godesberg und in der Bonner Südstadt empfehlen wir konsequent Akku-Geräte.",
        },
        {
          question: "Brauche ich einen Motorsägenschein, um eine Kettensäge in Bonn zu mieten?",
          answer:
            "Privat im eigenen Garten ist kein Schein gesetzlich vorgeschrieben; ohne Erfahrung raten wir aber dringend ab – die Verletzungsschwere ist hoch. Im gewerblichen Einsatz oder im Wald gilt DGUV Information 214-059 plus DGUV Grundsatz 308-009: dort ist ein Motorsägenkurs (z. B. AS Baum I/II) Pflicht. Wir vermieten gewerblich nur an Kunden mit entsprechendem Nachweis. PSA – Schnittschutzhose Klasse 1, Schnittschutzschuhe, Helm mit Visier und Gehörschutz, Schnittschutzhandschuhe – muss der Bediener bzw. Arbeitgeber selbst stellen.",
        },
        {
          question: "Holzspalter: liegend oder stehend, welcher Spaltdruck?",
          answer:
            "Liegende Spalter (5–8 t) eignen sich für Holz bis ca. 1 m Länge und 30 cm Durchmesser – die Standardlösung für Kaminholz aus dem Hausgarten in Beuel, Bad Godesberg oder Wachtberg. Stehende Spalter (10–25 t) brauchst du für Meterholz, harte Hölzer (Eiche, Buche, knorriges Obstholz) und Stammdurchmesser über 30 cm. Faustregel: 1 t Spaltdruck je 10 cm Stammdurchmesser bei Weichholz, das Doppelte bei Hartholz mit Astansätzen. Wir führen am Standort Bonn-Mehlem liegende Spalter im Kernsortiment; große stehende Spalter kommen bei Bedarf aus Krefeld.",
        },
        {
          question: "Wurzelfräse mieten – wie tief und wie breit komme ich?",
          answer:
            "Klassische handgeführte Wurzelfräsen erreichen 25–30 cm Frästiefe bei 25–30 cm Breite. Sie verarbeiten den Wurzelstock in Späne; der Stock muss vorab ebenerdig abgesägt werden. Für sehr große Stöcke (Durchmesser über 60 cm) lohnt sich eher der Bagger mit Wurzelreißer aus unserer Erdbewegungs-Kategorie. Wichtig in Bonn: Vor jedem Fräseinsatz Lage von Strom-, Gas-, Wasser- und Telekomleitungen über die Sparten-Auskunft (u. a. SWB Energie und Wasser) prüfen – Wurzeln verlaufen oft parallel zu Versorgungstrassen.",
        },
        {
          question: "Was muss ich vor dem Fällen eines Baumes in Bonn beachten?",
          answer:
            "Die Stadt Bonn hat eine Baumschutzsatzung: Bäume ab 80 cm Stammumfang (gemessen in 1 m Höhe) sind auf öffentlichen und privaten Flächen geschützt – Fällung oder starker Rückschnitt brauchen eine Ausnahmegenehmigung des Amtes für Umwelt und Stadtgrün. Während der Vegetationsperiode (1. März – 30. September) verbietet § 39 BNatSchG bundesweit zusätzlich Fällarbeiten und starken Rückschnitt von Hecken und Gehölzen außerhalb des Waldes; Form- und Pflegeschnitt bleiben zulässig. In der Rheinaue und im Naturpark Siebengebirge gelten verschärfte Schutzregeln. Wir vermieten die Geräte – die Genehmigungsfrage musst du mit der Stadt klären.",
        },
        {
          question: "Aufsitzmäher oder Handmäher für größere Flächen?",
          answer:
            "Bis ca. 1.500 m² reicht ein selbstfahrender Handmäher mit 50 cm Schnittbreite. Ab 2.000 m² lohnt sich ein Aufsitzmäher mit 80–110 cm Schnittbreite (Mähleistung 2.500–4.500 m²/h). Bei Steigungen über 15° – relevant in Hanglagen wie Venusberg, Siebengebirge oder Wachtberger Vorhöhen – sind nur hangtaugliche Spezialmäher oder Balkenmäher zugelassen. Standardgeräte führen wir vor Ort in Bonn-Mehlem; Hangmäher und Schlegelmäher koordinieren wir aus Krefeld.",
        },
        {
          question: "Was kostet die Gartenpflege-Miete in Bonn?",
          answer:
            "Tagessätze sind je Modell tagesaktuell im Buchungsprozess hinterlegt. Wochenmiete entspricht typischerweise rund 5 Tagessätzen – ideal für Frühjahrs- oder Herbstpflege übers Wochenende plus Folgetag. Kraftstoff wird nach gefülltem Tank abgerechnet; Akku-Geräte werden geladen zurückgegeben. Für Vereine, Hausverwaltungen und Friedhofsbetriebe im Bonner Raum kalkulieren wir Saison- und Rahmenmieten – telefonisch unter 0228 504 660 61.",
        },
        {
          question: "Welche PSA brauche ich bei Häcksler, Freischneider, Heckenschere?",
          answer:
            "Häcksler: Schutzbrille, Gehörschutz, eng anliegende Kleidung (Einzugsgefahr), feste Handschuhe. Freischneider/Motorsense: zusätzlich Beinschutz/Schnittschutzhose, Visier, S3-Schuhe. Motor-Heckenschere: schnittfeste Handschuhe, Schutzbrille, Gehörschutz; bei Höhenarbeit zusätzlich Sturzschutz. Kettensäge: vollständige PSA-Kombi (Schnittschutzhose Klasse 1, Helm mit Visier, Schnittschutzschuhe). PSA stellt der Bediener bzw. Arbeitgeber – wir vermieten ausschließlich die Maschine.",
        },
      ],
      expertSections: [
        {
          h3: "Saisonzyklus: warum Bonner Gartenpflege im April und September verdichtet ist",
          paragraphs: [
            "Gartenpflege folgt einem klaren Jahresrhythmus. Frühjahr (März/April): Vertikutieren, Aerifizieren bei verdichteten Flächen, Nachsaat, erster Rückschnitt von Sommerblühern. Sommer: regelmäßige Mahd, Heckenformschnitt nur als Form- und Pflegeschnitt (§ 39 BNatSchG). Herbst (September/Oktober): zweiter Vertikutiergang, Laub aufnehmen, Häckseln des Strauchrückschnitts. Winter (1. Oktober – 28. Februar) ist die einzige Phase, in der Bäume und Hecken radikal zurückgeschnitten oder gefällt werden dürfen – Bonner Fällgenehmigung vorausgesetzt.",
            "Diese Taktung bestimmt die Mietnachfrage: Vertikutierer und Häcksler sind im April und September stark gebucht, Holzspalter und Wurzelfräsen vor allem im Spätherbst und Winter. Wir empfehlen, in diesen Zeitfenstern 1–2 Wochen vorab am Standort Bonn-Mehlem zu reservieren – telefonische Bestätigung unter 0228 504 660 61.",
          ],
        },
        {
          h3: "Lärmschutz und gute Nachbarschaft im Bonner Wohngebiet",
          paragraphs: [
            "Die 32. BImSchV unterscheidet zwei Gerätekategorien. Erste Gruppe (Häcksler, Rasenmäher, Vertikutierer, Heckenscheren): werktags 07:00–20:00 in reinen und allgemeinen Wohngebieten. Zweite Gruppe – besonders laute Geräte mit Verbrennungsmotor wie Freischneider, Laubbläser, Laubsammler – unterliegt zusätzlich der Mittagsruhe und darf werktags 13:00–15:00 nicht laufen. Sonntags und an gesetzlichen Feiertagen sind beide Gruppen ganztägig untersagt.",
            "In Bonn betrifft das vor allem die dicht bebauten Quartiere Südstadt, Poppelsdorf, Endenich, Bad Godesberg sowie das Bundesviertel rund um Tagungs- und Konferenzbetrieb. Akku- und Elektrogeräte mit EU-Lärm-Kennzeichen unterschreiten die Grenzwerte und sind von einem Teil der Einschränkungen ausgenommen – wer in der Bonner Innenstadt oder im Kurparkumfeld arbeitet, fährt mit Akku-Häckslern und elektrischen Rasenmähern deutlich konfliktärmer.",
          ],
        },
        {
          h3: "Bonner Baumschutzsatzung: was beim Fällen wirklich verlangt wird",
          paragraphs: [
            "Die Stadt Bonn schützt über ihre Baumschutzsatzung Bäume mit einem Stammumfang ab 80 cm in 1 m Höhe (Ausnahmen für bestimmte Obstbäume und einige Nadelgehölze). Fällung, größerer Wurzeleingriff oder Rückschnitt, der mehr als 30 % der Krone abnimmt, brauchen eine Ausnahmegenehmigung des Amtes für Umwelt, Verbraucherschutz und Lokale Agenda (Stadtgrün). Bei genehmigter Fällung wird in der Regel eine Ersatzpflanzung verlangt.",
            "Bundesweit kommt § 39 BNatSchG hinzu: vom 1. März bis 30. September keine Fällarbeiten und kein Radikalschnitt von Hecken und Gehölzen – zum Schutz brütender Vögel. Bußgelder bei Verstößen reichen bis 50.000 Euro. In Schutzgebieten – Rheinaue, Naturpark Siebengebirge, Kottenforst – gelten strengere Auflagen, oft auch außerhalb der Vegetationsperiode. Vor jeder größeren Aktion empfehlen wir eine kurze Vorab-Anfrage beim Stadtgrün-Amt.",
          ],
        },
        {
          h3: "Häcksler im Detail: Walze, Turbine, Hammerwerk – und warum es im Bundesviertel leise sein muss",
          paragraphs: [
            "Walzenhäcksler ziehen das Schnittgut langsam zwischen eine konische Walze und eine Druckplatte – sehr leise (90–95 dB(A) LWA), wenig Auswurf, Astdurchmesser bis 35–45 mm. Standardlösung für Wohngebiet und Bundesviertel mit Tagungsbetrieb. Nachteil: langsamer Durchsatz, kein Häckselbild für Mulch.",
            "Turbinen- und Schneidwalzen-Häcksler arbeiten mit rotierenden Klingen plus Einzugswalze – schneller Durchsatz, feineres Schnittgut, dafür lauter (98–105 dB(A) LWA) und höherer Stromverbrauch. Hammerwerk-Häcksler (typisch Benzin, 100–108 dB(A) LWA) zerschlagen das Holz – maximaler Durchsatz und größte Astdurchmesser, aber kein Wohngebiets-Gerät. Für die Bonner Innenstadt-Pflege ist der Walzenhäcksler die einzig nachbarschaftsverträgliche Lösung; größere Häckslereinsätze planen wir lieber außerhalb der Mittagsruhe.",
          ],
        },
        {
          h3: "Kettensägen-Arbeit am Hang: warum Venusberg und Siebengebirge besondere Vorsicht verlangen",
          paragraphs: [
            "Statistisch tritt der überwiegende Anteil schwerer Kettensägen-Unfälle nicht beim Forst-Profi auf, sondern bei privaten Brennholz-Aktionen. Ursachen: fehlende PSA, Schnitt auf Hüfthöhe statt Knie, kein Fluchtweg geplant, Schnitt in Spannungsholz ohne Kenntnis der Spannungsverhältnisse. In Bonner Hanglagen (Venusberg, Drachenfels, Wachtberg, Bad Honnef) kommt die Hangneigung dazu – Stamm und Bediener rutschen, Fallrichtung wird unkalkulierbar.",
            "Unsere Empfehlung für Bonner Mietkunden: Vor dem ersten Einsatz einen Tageskurs Motorsäge für Brennholz absolvieren – Anbieter im Rheinland und in der Eifel. Mindestens aber: nie alleine sägen, immer mit Schnittschutzhose Klasse 1, nie über Schulterhöhe sägen, bei Hang oberhalb des Stammes positionieren, bei Spannungsholz die Schnittrichtung umkehren (Druckseite anschneiden, Zugseite trennen). Wir liefern die Säge geprüft und scharf – das Sicherheitswissen liegt beim Bediener.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // LEITERN & GERÜSTE
    // Quellen: DGUV Information 201-011 (Leitern/Tritte),
    //   DGUV 201-029 (Gerüste), TRBS 2121 Teile 1+2,
    //   DIN EN 131 (Leitern, Pflicht-Stabilisator ab 3 m),
    //   DIN EN 1004 (fahrbare Arbeitsgerüste, max. 8 m außen /
    //   12 m innen), BetrSichV § 14, DGUV V3 Schutzabstände.
    // -------------------------------------------------------------
    "leitern-gerueste": {
      faqs: [
        {
          question: "Leiter oder Fahrgerüst – wo liegt die rechtliche Grenze?",
          answer:
            "TRBS 2121 Teil 1 schreibt vor: Anlegeleitern dürfen als Arbeitsplatz nur bis 5 m Standhöhe und nur für kurze Arbeiten (Faustregel: bis 2 Stunden, geringer Kraftaufwand) genutzt werden. Über 5 m oder bei längeren Arbeiten ist ein Gerüst zwingend. Fahrgerüste nach EN 1004 sind in mehreren Höhenklassen verfügbar und bieten eine sichere Plattform mit Geländer – die richtige Wahl für Anstrich, Putz, Trockenbau und Wartung. Wir führen am Standort Bonn-Mehlem Anlegeleitern und Fahrgerüste bis ca. 8 m Arbeitshöhe vor Ort; höhere Gerüste (bis 12 m) liefern wir aus Krefeld nach.",
        },
        {
          question: "Wie hoch darf ich mit einem Fahrgerüst arbeiten?",
          answer:
            "DIN EN 1004 begrenzt fahrbare Arbeitsgerüste auf 8 m Plattformhöhe im Freien und 12 m Plattformhöhe in Innenräumen (Standard-Lastklasse). Höhere Aufbauten sind Standgerüste oder erfordern spezielle Statik-Nachweise. Im Freien sind ab bestimmter Aufbauhöhe Verbreiterungen oder Ausleger Pflicht, um die Standsicherheit gegen Windlasten zu gewährleisten. Die zulässige Aufbauhöhe inklusive Verbreiterungs-Vorgaben steht in der Aufbau- und Verwendungsanleitung (AuV) jedes Gerüsts – wir übergeben sie in Bonn mit jedem Mietgerät.",
        },
        {
          question: "Brauche ich für den Gerüstaufbau eine Qualifikation?",
          answer:
            "Für fahrbare Arbeitsgerüste nach EN 1004 verlangt TRBS 2121 Teil 2 keinen formalen Gerüstbau-Befähigungsschein, aber eine fachliche Eignung und Unterweisung – der Aufbau muss nach der AuV erfolgen und kontrolliert werden. Für Standgerüste (System- und Stangengerüste) ist die Befähigung zum Gerüstbauer Voraussetzung. Wir vermieten ausschließlich fahrbare Arbeitsgerüste mit AuV; der Aufbau bleibt Sache des Mieters bzw. Arbeitgebers.",
        },
        {
          question: "Was hat sich mit der EN 131 (2018) bei Anlegeleitern geändert?",
          answer:
            "Seit der Überarbeitung der EN 131 sind Anlegeleitern ab 3 m Leiterlänge nur noch mit einer fußseitigen Verbreiterung (Stabilisator) zulässig. Außerdem wird zwischen gewerblicher Nutzung (Kennzeichnung Professional) und Heimwerker (Non-Professional) unterschieden – im gewerblichen Einsatz sind Heimwerker-Leitern nicht zulässig. Wir bevorraten am Standort Bonn-Mehlem ausschließlich EN-131-konforme Profi-Leitern; die Konformitäts-Plakette ist sichtbar angebracht.",
        },
        {
          question: "Welche PSA gegen Absturz ist auf Gerüst oder Leiter Pflicht?",
          answer:
            "Auf Fahrgerüsten mit dreiteiligem Seitenschutz (Geländerholm, Zwischenholm, Bordbrett) ist eine PSAgA grundsätzlich nicht zwingend – die Plattform gilt als kollektiv gesicherter Arbeitsplatz. PSAgA wird Pflicht beim Auf- und Umbau oberhalb 3 m, solange der Seitenschutz noch nicht montiert ist. Auf Leitern ist die Verwendung von PSAgA praktisch nicht möglich (kein geeigneter Anschlagpunkt) – deshalb sind Standhöhe und Arbeitsdauer streng nach TRBS 2121 zu begrenzen oder ein Gerüst einzusetzen.",
        },
        {
          question: "Wie weit muss eine Anlegeleiter angestellt werden?",
          answer:
            "DGUV Information 201-011 gibt die Faustregel 1 : 4 (Anstellwinkel ca. 65–75°) vor. Praktische Probe: Bediener stellt sich aufrecht an die Leitersohle und streckt die Arme waagerecht aus – die Handflächen sollten die Sprossen erreichen. Außerdem muss die Leiter mindestens 1 m über die Austrittsstelle (z. B. Dachrand) hinausragen, der Untergrund muss tragfähig und rutschsicher sein, die Sprossen waagerecht. Bei nassem oder vereistem Boden ist Rutschsicherung Pflicht.",
        },
        {
          question: "Wer prüft Leitern und Gerüste – und wie oft?",
          answer:
            "Nach BetrSichV § 14 und DGUV Information 201-011/201-029 sind Leitern und Gerüste mindestens jährlich von einer befähigten Person zu prüfen (sichtbare Prüfplakette). Wir dokumentieren das für unseren Mietpark in Bonn; das aktuelle Prüfprotokoll liegt der Maschine bei bzw. ist auf Anforderung verfügbar. Zusätzlich muss der Nutzer vor jeder Schicht eine Sicht- und Funktionsprüfung durchführen (Sprossen, Holme, Beschläge, Rollen, Seitenschutz). Mängel sofort melden – wir tauschen das Gerät kostenfrei.",
        },
        {
          question: "Treppengerüst für Bonner Altbauten und schräge Aufstellflächen?",
          answer:
            "In Bonner Altbauten (Südstadt, Bad Godesberg) und auf abschüssigem Gelände gleicht ein Treppengerüst Höhenunterschiede über höhenverstellbare Füße einer Seite aus. Standard-Fahrgerüste sind dafür nicht zugelassen, da die Spindelfüße schnell überschritten werden. Wir führen Treppengerüste und beraten zur passenden Bauform – wichtig ist eine kurze Beschreibung der Treppe (Stufenhöhe, Stufentiefe, Breite). Telefonisch unter 0228 504 660 61.",
        },
        {
          question: "Was kostet eine Gerüst- oder Leiter-Miete in Bonn?",
          answer:
            "Tagespreise je Modell sind im Buchungsprozess hinterlegt. Wochenmiete entspricht ca. 5 Tagessätzen, Monatsmiete ca. 15. Fahrgerüste werden in der Praxis meist wochenweise gemietet – die Auf- und Abbauzeit lohnt erst ab mehreren Tagen Einsatz. Für lange Sanierungsprojekte kalkulieren wir auf Anfrage Sondertarife. Lieferung im Bonner Raum (Bonn, Köln-Süd, Sankt Augustin, Königswinter, Bad Honnef, Wachtberg) ist optional buchbar.",
        },
        {
          question: "Darf ich ein Fahrgerüst mit Material auf der Plattform verfahren?",
          answer:
            "Nein. EN 1004 und TRBS 2121 Teil 2 untersagen das Verfahren des Gerüsts, wenn Personen oder loses Material auf der Plattform sind. Vor jedem Umsetzen müssen Personen absteigen, lose Werkzeuge gesichert oder abgenommen werden, und der Fahrweg muss eben, tragfähig und hindernisfrei sein. Nach dem Umsetzen Rollen wieder feststellen und ggf. Spindelfüße neu nivellieren, bevor die Plattform betreten wird.",
        },
      ],
      expertSections: [
        {
          h3: "TRBS 2121: warum die Leiter heute strenger reguliert ist als das Gerüst",
          paragraphs: [
            "Die Technische Regel für Betriebssicherheit 2121 hat die Verwendung von Leitern als Arbeitsplatz deutlich eingeschränkt. Anlegeleitern und Stehleitern dürfen nur noch genutzt werden, wenn die Gefährdungsbeurteilung ergibt, dass andere Arbeitsmittel (Gerüst, Hubarbeitsbühne) wegen geringer Standhöhe (< 2 m) oder sehr kurzer Arbeitsdauer (< 2 Stunden) nicht verhältnismäßig sind. Über 5 m Standhöhe sind Leitern als Arbeitsplatz grundsätzlich nicht mehr zugelassen.",
            "Konsequenz für die Bonner Baustellenpraxis: Wer eine Bad Godesberger Villenfassade streicht, eine Dachrinne im Plittersdorf reinigt oder eine Klimaanlage in 4 m Höhe wartet, sollte sich gegen die Leiter und für ein Fahrgerüst entscheiden – nicht nur wegen der Sicherheit, sondern weil ein Unfall bei Leiter-Nutzung über 3 m oder bei Arbeiten über 2 Stunden im gewerblichen Kontext fast immer als TRBS-Verstoß gewertet wird. Das Fahrgerüst kostet in der Miete unwesentlich mehr.",
          ],
        },
        {
          h3: "Fahrgerüst aufbauen: Auf- und Verwendungsanleitung sauber lesen",
          paragraphs: [
            "Jedes nach EN 1004 zertifizierte Fahrgerüst hat eine projektspezifische Auf- und Verwendungsanleitung (AuV). Sie regelt: maximale Aufbauhöhe je Aufstellort (Innen/Außen), Notwendigkeit von Verbreiterungen ab bestimmter Höhe, Position der Ballastgewichte, Vorgehen bei Wind > 6 Bft (Abbau-Pflicht), Lastklasse der Plattform (typisch Klasse 3 = 200 kg/m²).",
            "Der häufigste Aufbau-Fehler ist das Weglassen der Diagonalstreben oder der Verbreiterungen, weil die Plattform nur kurz gebraucht wird. Beides ist konstruktiv vorgesehen und nicht optional – ohne Diagonale verliert das Gerüst sofort die Längs-Steifigkeit, ohne Verbreiterung bei Aufbau ab ca. 6 m im Freien die Kippsicherheit. Wir geben jedem Mietgerüst die AuV mit; bei Erstmietern erklären wir den Aufbau am Standort Bonn-Mehlem vor Abholung Schritt für Schritt.",
          ],
        },
        {
          h3: "Anlegeleiter richtig stellen: 1 : 4, Sicht, Überstand, Rutschsicherung",
          paragraphs: [
            "Vier Fehler dominieren bei Anlegeleiter-Unfällen: falscher Anstellwinkel (zu steil rutscht der Fuß weg, zu flach kippt die Leiter), fehlender Überstand über die Austrittsstelle, nasser/glatter Untergrund ohne Sicherung, sowie Stellung vor Türen, die aufschlagen können.",
            "Korrekt: Anstellwinkel 65–75° (1 : 4 – bei 4 m Leiterhöhe steht der Fuß 1 m von der Wand weg), Überstand am Austritt mindestens 1 m, Untergrund tragfähig und sauber, bei Glätte mit Bohlen oder Antirutsch-Matten gesichert, bei Türen mit Warnposten oder verschlossen. EN-131-Profi-Leitern haben serienmäßig einen fußseitigen Stabilisator ab 3 m Länge – Pflicht und nicht entfernbar.",
          ],
        },
        {
          h3: "Höhenrettung: warum schon ab 3 m ein Notfallkonzept gebraucht wird",
          paragraphs: [
            "Die BetrSichV verlangt für Arbeitsplätze mit Absturzgefahr ab 3 m Höhe eine Höhenrettungs-Vorhaltung. Das ist nicht zwingend ein Rettungs-Geschirr im Sinne der Feuerwehr – ausreichend ist meist die Verfügbarkeit einer geeigneten Rettungsmaßnahme (PSAgA-System mit Rettungsabseilen, Hubarbeitsbühne im Standby, sofort erreichbare Feuerwehr im städtischen Bonner Umfeld).",
            "Praxis im Mietkontext: Wer auf einem Fahrgerüst arbeitet, hat über den dreiteiligen Seitenschutz einen kollektiven Schutz – das Höhenrettungs-Konzept reduziert sich auf Verfahrweg und Auf-/Abbau. Wer mit PSAgA arbeitet (Dacharbeit, Industrie), braucht zwingend ein Rettungskonzept inklusive eingewiesener Helfer – sonst Verstoß gegen § 6 ArbSchG. Wir liefern die Geräte; das Rettungskonzept liegt beim Arbeitgeber.",
          ],
        },
        {
          h3: "Material, Korrosion, Holz vs. Aluminium: was im Bonner Bahnumfeld zählt",
          paragraphs: [
            "Aluminium-Leitern und -Gerüste sind heute Standard – leicht, korrosionsbeständig, lange Lebensdauer. Holz-Leitern (Sprossenleiter aus Esche oder Akazie) kommen noch in der Elektrotechnik vor, weil Holz nicht leitet – wir halten am Standort Bonn auf Anfrage Holzleitern für Arbeiten in der Nähe spannungsführender Anlagen vor.",
            "Aluminium ist nicht spannungsfrei – jede Leiter, jedes Gerüst aus Alu muss bei Arbeiten im Bereich freier Leiter oder Oberleitung mit Schutzabstand zur Spannung verwendet werden (DGUV V3, Tabelle 1: 1 m bei Niederspannung, 3 m bei Mittelspannung, 4 m bei Hochspannung bis 110 kV). Im Bonner Umfeld betrifft das Stadtbahn-Oberleitungen (Linien 16/63/66), die Bahnstrecke linke und rechte Rheinstrecke sowie Hochspannungs-Freileitungen im Rhein-Sieg-Raum – vorab Spannungsfreiheit beim Netzbetreiber erfragen.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // HEIZUNG & TROCKNUNG
    // Quellen: WTA-Merkblatt 6-2, DGUV Information 213-056
    //   (CO-Gefahren), TRGI 2018, DIN VDE 0100-704
    //   (Baustellenstrom mit RCD), DIN EN 16798-1, CM-Methode
    //   (Belegreife). Bonn-Spezifika: Hochwasserlagen Rheinaue/
    //   Ahrtal, Altbau-Sanierung Südstadt/Bad Godesberg.
    // -------------------------------------------------------------
    "heizung-trocknung": {
      faqs: [
        {
          question: "Wasserschaden in Bonn – wie viele Bautrockner brauche ich?",
          answer:
            "Faustregel nach WTA: Pro 30–50 m³ Raumvolumen ein Kondenstrockner mittlerer Leistung (ca. 30–50 l/24h Entzugsleistung). Bei stark durchfeuchtetem Estrich und Wänden lohnt der Einsatz eines Adsorptionstrockners, der auch unter 5 °C arbeitet. Trocknungsdauer: rohe Wandtrocknung 2–4 Wochen, Estrichtrocknung über Dämmschicht 4–8 Wochen. Den Fortschritt kontrolliert man mit einem CM-Feuchtemessgerät – wir vermieten am Standort Bonn-Mehlem Trockner-Sets samt Hygrometer und können nach Hochwasserlagen (Rheinaue, Ahrtal) auch in größerer Stückzahl liefern.",
        },
        {
          question: "Kondenstrockner oder Adsorptionstrockner – wann was?",
          answer:
            "Kondenstrockner arbeiten am wirtschaftlichsten zwischen 15 und 30 °C bei relativer Feuchte > 40 % – Standard nach Wasserschäden in geheizten Räumen. Adsorptionstrockner (Silikagel/Zeolith) arbeiten auch bei 5 °C oder darunter und bei niedriger Feuchte; richtige Wahl in unbeheizten Rohbauten, Kellern und in der Schlussphase einer Trocknung. Wir bevorraten beide Bauformen vor Ort in Bonn; bei großen Schadenslagen liefern wir kurzfristig aus Krefeld nach.",
        },
        {
          question: "Wann brauche ich Estrich-Dämmschicht-Trocknung mit Druck oder Vakuum?",
          answer:
            "Wenn Wasser in die Dämmschicht unter dem Estrich eingedrungen ist, reicht Raumluft-Trocknung nicht – die Dämmung trocknet nur extrem langsam ab. Standard ist dann das Druck- oder Vakuum-Verfahren: Über Kernbohrungen wird Trocknungsluft in die Dämmschicht gepresst oder feuchte Luft abgesaugt. Wir vermieten Seitenkanalverdichter, Vakuumpumpen, HEPA-Filter und Schläuche; die Kernbohrungen erstellt der Sanierer oder per Mietkernbohrer aus unserer Werkzeug-Kategorie.",
        },
        {
          question: "Welche Stromversorgung braucht ein Heizgebläse oder Bautrockner?",
          answer:
            "Kondenstrockner (800–1.500 W) laufen an einer regulären Schuko-Steckdose. Adsorptionstrockner (1,5–4 kW) brauchen je nach Leistung 230 V/16 A oder bereits CEE 16 A. Elektro-Heizlüfter ab 5 kW und Wärmepumpen-Trockner laufen über CEE 16 A oder CEE 32 A (400 V). Diesel-Heizgebläse brauchen nur eine 230-V-Speisung für Brenner und Gebläse. Auf Baustellen ist die Einspeisung über einen Baustromverteiler mit 30-mA-RCD nach DIN VDE 0100-704 Pflicht – Versorger im Bonner Raum ist u. a. SWB Energie und Wasser.",
        },
        {
          question: "Gasheizer in Innenräumen – was ist erlaubt?",
          answer:
            "Direktbefeuerte Gasheizer (Propan) sind in geschlossenen Räumen nur erlaubt, wenn ausreichende Verbrennungsluft-Zufuhr und Abluft sichergestellt sind (TRGI 2018, DGUV Information 213-056). Die Abgase enthalten CO, CO₂ und Wasserdampf – ohne Frischluftzufuhr besteht akute Lebensgefahr durch CO-Vergiftung. Sicherer ist die Aufstellung der Gasheizung außerhalb mit Warmluft-Schlauch (indirekt befeuert) oder der Einsatz von Diesel-Indirektheizern mit Abgasführung ins Freie. Wir empfehlen bei jedem Innenraum-Einsatz CO-Warner mit – Standard bei jeder gewerblichen Bautrocknung in Bonn.",
        },
        {
          question: "Wieviel Diesel, Strom oder Gas verbraucht ein Heizgebläse?",
          answer:
            "Faustwerte je 10 kW Heizleistung: Diesel ca. 1 l/h; Strom 10 kWh/h; Propan ca. 0,8 kg/h. Für eine 100-kW-Halle bedeutet das: 10 l Diesel pro Stunde – ein 200-l-Tank reicht knapp einen Tag. Eine Elektrolösung in der gleichen Größe braucht 100 kWh/h und entsprechende Netz-Anschlussleistung. Im Bonner Wintereinsatz auf Rohbau-Baustellen ist Diesel-Indirekt-Heizung deshalb fast immer wirtschaftlicher als Elektro.",
        },
        {
          question: "Wie warm darf bzw. soll ich beim Trocknen heizen?",
          answer:
            "Die Trocknungsgeschwindigkeit steigt mit der Temperatur, weil warme Luft mehr Feuchte aufnimmt. WTA empfiehlt 18–25 °C bei Kondens-Trocknern (höhere Temperatur überfordert das Gerät – Vereisung bzw. Abschaltung). Adsorptionstrockner arbeiten auch unter 10 °C. In beheizten Räumen mit Wandfliesen, Tapeten oder empfindlichen Bauteilen (typisch Bonner Altbauten in der Südstadt) sollte die Temperatur nicht über 30 °C steigen, sonst Spannungsrisse. Wir geben mit jedem Trockner eine Bedienungsanleitung mit konkreter Empfehlung mit.",
        },
        {
          question: "Was kostet eine Trocknungsaktion in Bonn – und übernimmt die Versicherung das?",
          answer:
            "Tagespreise je Gerät tagesaktuell im Buchungsprozess; bei längeren Trocknungen (typisch 14–28 Tage) sind Wochen- und Monatsmieten deutlich günstiger. Wasserschäden werden in der Regel von der Wohngebäude- bzw. Hausratversicherung übernommen – Versicherer haben mit den meisten Sanierungsfirmen Direktabrechnung. Wenn du selbst sanierst, lass den Mietvertrag und die Strom-Messprotokolle aufheben; viele Versicherer erstatten die Mietkosten auf Vorlage des Vertrags. Bei großflächigen Schadenslagen im Ahrtal arbeiten wir mit lokalen Sanierungsbetrieben zusammen.",
        },
        {
          question: "Wie sicher ist der Stromverbrauch eines Trockners im Wohnhaus?",
          answer:
            "Wir bauen auf Wunsch in jeden Mietvorgang einen kalibrierten Stromzähler ein (Hutschienen- oder Steckdosenzähler). So lässt sich der Verbrauch sauber dokumentieren und der Versicherung in Rechnung stellen. Faustwert: Ein Kondenstrockner mit 1 kW läuft 14 Tage = 336 Stunden = ca. 250 kWh (Trockner laufen nicht durchgehend, weil über Hygrostat geregelt). Bei 0,35 €/kWh Hausstrompreis entspricht das ca. 90 € – fast immer erstattungsfähig.",
        },
        {
          question: "Wie laut sind Bautrockner – kann ich nachts schlafen?",
          answer:
            "Kondenstrockner liegen typisch bei 50–60 dB(A) in 1 m Abstand – vergleichbar mit einer Spülmaschine. In Schlafräumen empfehlen wir, das Gerät in einen Nebenraum zu stellen (offene Tür; den Türritz mit Handtuch verschließen verbietet sich – die Luft muss zirkulieren). Adsorptionstrockner sind ähnlich laut, Heizgebläse deutlich lauter (70–85 dB(A)). Im Bonner Wohngebiet gilt nachts der TA-Lärm-Richtwert 40 dB(A) am offenen Fenster der Nachbarn – Heizgebläse im Außenbereich nachts in Wohngebieten sind faktisch nicht zulässig.",
        },
      ],
      expertSections: [
        {
          h3: "Bauteilfeuchte verstehen: wann ist trocken wirklich trocken?",
          paragraphs: [
            "Bauteile haben eine charakteristische Ausgleichsfeuchte, die zur Raumluft passt. Zement-Estrich gilt nach CM-Methode als belegreif bei ≤ 2,0 CM-% (unbeheizt) bzw. ≤ 1,8 CM-% (beheizt) – ca. 4,5–5 Gew.-% Wassergehalt. Anhydrit-Estrich darf maximal 0,5 CM-% (unbeheizt) bzw. 0,3 CM-% (beheizt) haben. Holz: Möbel-Trockenholz 9–12 Gew.-%, frisches Schnittholz bis 80 %. Mauerwerk: Faustregel 5 Vol.-% rel. Feuchte (Darrgewicht-Methode).",
            "Diese Messwerte sind die einzige verlässliche Belegreife-Aussage – die subjektive Einschätzung täuscht regelmäßig, weil die Oberfläche zuerst abtrocknet, das Bauteil aber innen noch Wasser führt. Wir vermieten in Bonn neben Trocknern auch CM-Messgeräte und Holzfeuchte-Messer; ohne Messung keine Belegreife.",
          ],
        },
        {
          h3: "Strom, Diesel, Gas: die Heizart entscheidet die Kosten",
          paragraphs: [
            "Im Rohbau-Wintereinsatz auf der Bonner Baustelle stellt sich oft die Frage nach der wirtschaftlichsten Wärmequelle. Strom ist die einfachste, aber teuerste Lösung – 0,30–0,40 €/kWh netto. Diesel-Indirekt-Heizung liegt bei ca. 0,11 €/kWh (Heizöl-Äquivalent), Propan bei 0,12 €/kWh – beide brauchen Abgasführung bzw. Aufstellung außerhalb des Trocknungsraums.",
            "Praxisregel: Räume bis 30 m³ und kurze Einsätze ⇒ Elektro-Heizgebläse oder Kondenstrockner; Hallen, Rohbauten und mehrwöchige Trocknung ⇒ Diesel-Indirektheizung. Für Innenausbau-Baustellen mit empfindlichen Materialien (Bonner Villenviertel, denkmalgeschützte Altbauten) empfehlen wir Wärmepumpentrockner – Trocknung und milde Heizung in einem Gerät, elektrisch genügsam.",
          ],
        },
        {
          h3: "Estrich-Dämmschicht-Trocknung: warum Druck/Vakuum oft Pflicht ist",
          paragraphs: [
            "Bei eingedrungener Feuchte in die Estrich-Dämmschicht (Mineralwolle, PUR/PIR, EPS) reicht reine Raumlufttrocknung nicht – die Feuchte sitzt unter einer dampfsperrigen Schicht. Standardvorgehen: Über Kernbohrungen (typisch 30–50 mm, Abstände 1,5–2 m) wird mit Seitenkanalverdichtern getrocknete Luft in die Dämmschicht gepresst (Druck-Verfahren) oder feuchte Luft abgesaugt (Vakuum-Verfahren, sauberer im Wohnbau).",
            "Beim Vakuum-Verfahren ist ein HEPA-Filter zwingend, weil ggf. Schimmelsporen und Mineralfaser-Stäube mit ausgetragen werden. Wir liefern in Bonn komplette Sets aus Seitenkanalverdichter, HEPA-Filter, Schläuchen, Bohrlochrosetten und Kondensatabscheidern. Vor Beginn ist die Bohrlokation auf elektrische Heizleitungen zu prüfen – Wärmebildkamera oder Bestandsplan.",
          ],
        },
        {
          h3: "CO-Gefahr: warum Gasheizungen im Innenraum strikt zu sichern sind",
          paragraphs: [
            "Direktbefeuerte Gasheizer setzen pro kg verbranntem Propan ca. 1,6 kg Wasser, 3 kg CO₂ und – bei unvollständiger Verbrennung – signifikante Mengen CO frei. CO ist geruchlos, blockiert die Sauerstoffaufnahme im Blut und ist ab ca. 400 ppm akut tödlich. DGUV Information 213-056 fordert beim Einsatz von Gas-, Diesel- und Holzkohle-Verbrennungsgeräten in geschlossenen Räumen zwingend CO-Warner und ausreichende Frischluftzufuhr.",
            "Sicherer Standardweg: indirekt befeuerte Heizgebläse (Brennraum außerhalb, Wärmetauscher, Abgas ins Freie) oder reine Elektro-Heizung. In Bonner Wintereinsätzen empfehlen wir grundsätzlich indirekt befeuerte Diesel-Heizgebläse – wirtschaftlich, sicher und für Hallen, Rohbauten und Baustellen-Trocknung erprobte Standardlösung.",
          ],
        },
        {
          h3: "Hochwasser Ahrtal/Rheinaue: was eine professionelle Trocknungslogistik leisten muss",
          paragraphs: [
            "Nach den Hochwasserereignissen im Ahrtal 2021 hat sich gezeigt, wie schnell und massiv Trocknungsleistung in der Region nachgefragt wird. Wirksame Bauteiltrocknung folgt einem viertaktigen Ablauf: (1) Schadensbild aufnehmen – wo steht Wasser, welche Bauteile betroffen, wie weit verteilt? (2) Trockner und Heizung dimensionieren – Raumvolumen, Schaden, Außentemperatur. (3) Trocknung mit Hygrostat-Steuerung und regelmäßiger CM-Kontrolle (alle 7 Tage). (4) Dokumentation aller Mess- und Verbrauchswerte für die Versicherung.",
            "Wir vermieten am Standort Bonn-Mehlem komplette Trocknungspakete: Trockner, Heizgebläse, Hygro-Datenlogger, CM-Messgerät, Strom-Subzähler, Schläuche/Filter. Für gewerbliche Trocknungsbetriebe im Rhein-Sieg-Raum und Ahrtal bieten wir Rahmenmieten mit Bevorzugungsverfügbarkeit – im Winter (Heizungsausfall-Saison Januar–März) und nach Hochwasserlagen regelmäßig der Engpass. Anfragen unter 0228 504 660 61.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // ABSPERR- & VERKEHRSTECHNIK
    // Quellen: StVO § 45 Abs. 6, RSA 21, DIN EN 12352 (TL 1/2/7/8/9),
    //   DIN EN 13422 (Standsicherheit), StVZO § 53.
    //   Bonn: Halteverbote über das Straßenverkehrsamt der Stadt
    //   Bonn (Aufstellung in der Regel mind. 72 h vor
    //   Geltungsbeginn); RSA-konforme Anordnungen über das
    //   Tiefbauamt; Veranstaltungs-Absperrung u. a. für Rheinaue,
    //   Münsterplatz, Marktplatz, Beuel.
    // -------------------------------------------------------------
    absperrtechnik: {
      faqs: [
        {
          question: "Wie melde ich ein Halteverbot in Bonn an?",
          answer:
            "Im öffentlichen Verkehrsraum (Straße, Bürgersteig, Parkstreifen) brauchst du eine verkehrsrechtliche Anordnung nach StVO § 45 Abs. 6, ausgestellt vom Straßenverkehrsamt der Stadt Bonn. Antrag online oder schriftlich, typische Bearbeitungszeit 7–14 Tage. Die Schilder müssen mindestens 72 Stunden vor Geltungsbeginn aufgestellt werden – sonst ist das parkende Fahrzeug nicht abschleppbar. Wir vermieten Halteverbots-Sets inkl. Fußplatte am Standort Bonn-Mehlem und übernehmen auf Wunsch Antrag, Aufstellung und Abbau als Komplettpaket nach Aufwand.",
        },
        {
          question: "Reicht ein Halteverbot, oder brauche ich RSA-konforme Absicherung?",
          answer:
            "Sobald in den Verkehrsraum eingegriffen wird (Spurverengung, Bürgersteig­sperrung, Halbsperrung der Fahrbahn), reicht das Halteverbotsschild nicht – die RSA 21 verlangt einen geprüften Regelplan (A–D je nach Straßenklasse und Eingriff) mit Vorwarnung, Verengung, Leitbaken, Warnleuchten und Absperrung. Genehmigung erteilt das Straßenverkehrsamt, oft mit Auflage einer fachkundigen Aufsicht (AS-Schein). Wir vermieten alle RSA-Komponenten und vermitteln auf Anfrage Aufstellbetriebe mit AS-Schein.",
        },
        {
          question: "Welche Warnleuchten muss ich abends und nachts setzen?",
          answer:
            "DIN EN 12352 unterscheidet Warnleuchten nach Typ: TL 1 (Dauerlicht, gering) als Markierungsleuchte, TL 2 (blinkend, mittlere Intensität) zur Hindernis-Warnung, TL 7/8 (hohe Intensität, gerichtet) zur Vorwarnung im Hauptverkehr. Auf innerörtlichen Bonner Baustellen mit geringer Geschwindigkeit reicht meist TL 2 gelb-blinkend; auf Hauptstraßen (B9, B56) und Bundesstraßen sind höhere Klassen Pflicht. Die RSA gibt den Mindest-Typ je Regelplan vor. Wir bevorraten in Bonn TL-Warnleuchten als Akku-LED-Variante mit langer Laufzeit.",
        },
        {
          question: "Brauche ich eine mobile Ampelanlage, oder reichen Baken?",
          answer:
            "Bei Halbsperrung einer Straße über mehr als 50 m Länge ist nach RSA in der Regel eine mobile Lichtsignalanlage (LSA) Pflicht – bei kurzer Strecke kann auch Posten-Regelung oder Vorrang-Beschilderung (Z. 308) genehmigt werden. Welche Lösung möglich ist, regelt die verkehrsrechtliche Anordnung. Wir vermieten mobile Ampelanlagen mit Akku- und Solar-Versorgung in Bonn inkl. Auf- und Abbau auf Wunsch.",
        },
        {
          question: "Wieviel Wind hält ein Verkehrsschild auf Fußplatte aus?",
          answer:
            "DIN EN 13422 fordert für mobile Verkehrszeichen Standsicherheit entsprechend der Windlastzone. Standard-Fußplatten 15 kg sichern Schilder bis ca. 100 km/h Wind in geschützter Lage; auf freier Strecke oder bei Schildgrößen über 600 mm sind 25 kg Fußplatten oder Doppel-Beschwerung Pflicht. Auf Bonner Rheinbrücken (Friedrich-Ebert-Brücke, Konrad-Adenauer-Brücke, Kennedybrücke) und auf der freien B9 an der Rheinaue können Ballast-Schwellen oder Verankerung nötig sein. Wir geben am Standort Bonn die passende Beschwerung mit.",
        },
        {
          question: "Wer haftet, wenn jemand über einen Leitkegel fährt oder gegen ein Absperrgitter läuft?",
          answer:
            "Verantwortlich ist die in der verkehrsrechtlichen Anordnung benannte Person für die Arbeitsstelle. Sie muss RSA-Konformität sicherstellen und während der gesamten Geltungsdauer Sicht-/Funktionsprüfungen durchführen (Schilder umgefallen? Warnleuchten erloschen? Absperrgitter verschoben?). Wir vermieten Material; die Verantwortung trägt der Auftraggeber bzw. die ausführende Firma.",
        },
        {
          question: "Veranstaltung in Bonn absichern – was bietet ihr für Rheinaue, Münsterplatz, Marathons?",
          answer:
            "Für temporäre Veranstaltungs-Absperrungen bieten wir Mojo- und Crowd-Control-Gitter (typ. 2,5 m × 1,1 m, verzinkt), Fußplatten-Schilder, Leitbaken, mobile Ampelanlagen und TL-Warnleuchten. Größere Veranstaltungen (Rhein in Flammen Rheinaue, Bonn Marathon, Pützchens Markt in Beuel, Beethovenfest) brauchen Sperr-Pakete mit hunderten Gittern und Vor-Ort-Logistik – das kalkulieren wir nach Veranstaltungsplan individuell. Vorlauf 4–6 Wochen ist sinnvoll.",
        },
        {
          question: "Wie schnell kann ich Halteverbot, Baken und Leitkegel in Bonn bekommen?",
          answer:
            "Bei verfügbarem Material und Selbstabholung sind Halteverbots-Sets und Standard-Absperrmaterial am Standort Bonn-Mehlem in der Regel taggleich verfügbar (Mo–Fr 07:00–18:00, Sa 08:00–17:30). Für die verkehrsrechtliche Anordnung der Stadt Bonn rechne mit 7–14 Tagen Vorlauf. Bei Komplett-Auftrag (Antrag + Material + Aufstellung) ist die Genehmigung der Engpass; wir empfehlen 3 Wochen Vorlauf.",
        },
        {
          question: "Was kostet ein Halteverbotsschild-Set in Bonn?",
          answer:
            "Das Halteverbotsschild-Set (2 Schilder Z. 283 + Zusatzschilder + Fußplatten) ist im Buchungsprozess tagesaktuell hinterlegt. Komplettpakete inkl. verkehrsrechtlicher Anordnung, Aufstellung 72 h vorab und Abbau kalkulieren wir nach Aufwand – telefonisch unter 0228 504 660 61. Faustregel: Eine vollständige Halteverbots-Aktion ist deutlich günstiger als das Abschleppen eines Falschparkers am Umzugstag.",
        },
        {
          question: "Brauche ich beim Aufstellen der Schilder Warnschutzkleidung?",
          answer:
            "Ja. Sobald im Verkehrsraum gearbeitet wird, ist Warnschutz Klasse 2 nach EN ISO 20471 Pflicht (innerorts), auf Hauptstraßen und außerorts Klasse 3. Helm ist auf Arbeitsstellen mit Absturz- oder Anprallgefahr Pflicht. Die PSA muss der Aufsteller bzw. dessen Arbeitgeber stellen – wir vermieten ausschließlich das Verkehrssicherungs-Material.",
        },
      ],
      expertSections: [
        {
          h3: "RSA 21 verstehen: Regelpläne sind keine Empfehlung, sondern Vorschrift",
          paragraphs: [
            "Die Richtlinien für die Sicherung von Arbeitsstellen an Straßen (RSA 21, in NRW eingeführt) sind das verbindliche Regelwerk für jede Verkehrssicherung im öffentlichen Raum. Sie unterscheiden vier Hauptkategorien: Innerörtliche Straßen (Teil A), Außerorts auf Landstraßen (Teil B), Autobahnen und ähnlich ausgebaute Straßen (Teil C), Sonderbauformen (Teil D). Für jede Kategorie gibt es Regelpläne (z. B. A I/8 – halbseitige Sperrung innerorts) mit konkreter Vorgabe zu Schildern, Leitkegeln, Warnleuchten und mobilen Ampeln.",
            "Das Straßenverkehrsamt der Stadt Bonn prüft jede Anordnung gegen die RSA und entscheidet, welcher Regelplan zum Eingriff passt. Vom Aufsteller wird verlangt, dass das Material dem Regelplan entspricht, korrekt platziert ist und während der gesamten Geltungsdauer funktionsfähig bleibt. Bei Großbaustellen ist ein verkehrsrechtlich Verantwortlicher mit AS-Schein Pflicht.",
          ],
        },
        {
          h3: "Halteverbot in Bonn: vom Antrag bis zum Abschleppen",
          paragraphs: [
            "Wer in Bonn eine Umzugs- oder Bauzonen-Parkfläche braucht, durchläuft folgenden Ablauf: (1) Antrag auf verkehrsrechtliche Anordnung beim Straßenverkehrsamt der Stadt Bonn – online oder schriftlich, mit Skizze und Zeitfenster, Bearbeitungszeit 7–14 Tage. (2) Genehmigung mit konkreter Anordnung zur Beschilderung (Anzahl, Position, Geltungszeit). (3) Aufstellung mindestens 72 Stunden vor Geltungsbeginn – früher erlaubt, später macht das Abschleppen rechtlich angreifbar.",
            "Im Geltungszeitraum dürfen falsch parkende Fahrzeuge umgesetzt oder abgeschleppt werden – die Stadt Bonn beauftragt einen Vertrags-Abschleppdienst. Der Auftraggeber muss in der Regel das Abschleppen telefonisch beim städtischen Verkehrsaußendienst auslösen. Wir vermieten in Bonn passende Schilder-Sets; auf Wunsch übernehmen wir Antrag, Aufstellung und Abbau als Komplettpaket.",
          ],
        },
        {
          h3: "Warnleuchten und Beleuchtung: warum die Wahl der TL-Klasse wichtig ist",
          paragraphs: [
            "DIN EN 12352 klassifiziert Warnleuchten nach Lichtstärke und Funktion: L1 (Dauerlicht zur Markierung), L2 (Blinklicht gelb, mittlere Intensität – Standard auf innerörtlichen Baustellen), L7/L8 (gerichtetes, hochintensives Blinklicht für Hauptstraßen und Autobahnen), L9 (Lauflicht-Pfeilanzeige für Spurverengungen). Der Regelplan der RSA gibt den Mindest-Typ vor.",
            "Akku-LED-Warnleuchten haben Dauerleuchtzeiten von 100–400 Stunden und sind heute Standard – Kerzen- und Gaslampen seit Langem unzulässig. Wir bevorraten am Standort Bonn-Mehlem TL2- und TL7/8-Leuchten mit großem Akku-Pufferspeicher; bei mehrwöchigen Baustellen lohnt die Solar-Variante.",
          ],
        },
        {
          h3: "Stand- und Windsicherheit: warum Fußplatten kein Detail sind",
          paragraphs: [
            "DIN EN 13422 prüft mobile Verkehrszeichen unter definiertem Windkanal – ein Schild 800 × 800 mm auf 15-kg-Fußplatte ist für Windlastzonen 1–2 in geschützter Lage zugelassen, in Zone 4 oder auf Brücken nicht ausreichend. Bonn liegt in Windlastzone 1; in der Innenstadt mit Bebauung um die Schilder reichen 15-kg-Platten meist. Auf den Bonner Rheinbrücken, auf der Konrad-Adenauer-Brücke oder auf der freien Rheinaue-Promenade sowie bei Schildgrößen ab 900 × 900 mm sind 25-kg-Platten oder Doppel-Beschwerung Pflicht.",
            "Umgestoßene Schilder sind nicht nur eine Sicherheitsfrage, sondern Versicherungs- und Haftungsfrage: Wer im öffentlichen Verkehrsraum ein Schild aufstellt, ist für dessen ordnungsgemäßen Stand verantwortlich – auch nachts, auch bei Wind. Mehrfach-tägliche Sichtkontrolle ist im Regelplan oft Auflage. Wir liefern auf Wunsch die richtige Fußplatten-Konfiguration zum konkreten Aufstellort.",
          ],
        },
        {
          h3: "Veranstaltungs-Absperrung in Bonn: von Mojo-Gitter bis Streckenlogistik",
          paragraphs: [
            "Veranstaltungs-Absperrung unterscheidet sich von Baustellen-Absperrung: Hier geht es um Crowd-Control (Trennung von Zuschauern und Akteuren), Notfall-Fluchtwege (Versammlungsstättenverordnung) und Verkehrslenkung um die Veranstaltung herum. Standard-Komponenten: Mojo-Barrieren (2,5 m × 1,1 m, ineinander gehängt), Bauzaun-Felder mit Vlies-Sichtschutz, Leitbaken zur Verkehrslenkung, Notfall-Tore.",
            "Für Bonner Großveranstaltungen – Rhein in Flammen in der Rheinaue, Pützchens Markt in Beuel, Bonn Marathon, Beethovenfest, Stadtteilfeste in Bad Godesberg – kalkulieren wir vom Standort Bonn-Mehlem aus Material und Logistik. Wichtig: die Streckenlogistik (Anlieferung, Aufbau in Zeitfenstern, Abbau direkt nach Veranstaltungsende) ist meist aufwändiger als das Material selbst. Vorlauf 4–6 Wochen ist für mittlere und große Veranstaltungen sinnvoll. Beratung unter 0228 504 660 61.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // NUTZFAHRZEUGE (Transporter 3,5 t mit Plane, Koffer,
    //   Pritsche, Möbelkoffer)
    // Quellen: StVZO § 32/§ 34, FeV Anlage 9 (Klasse B bis
    //   3.500 kg, B96 4.250 kg, BE 7.000 kg, C1 ab 3.501 kg),
    //   StVO § 22 + VDI 2700, EU-VO 561/2006 (Lenk-/Ruhezeiten
    //   ab 3,5 t gewerblich). Umweltzonen NRW: grüne Plakette
    //   in Bonn, Köln und im gesamten Rhein-Ruhr-Raum.
    // -------------------------------------------------------------
    nutzfahrzeuge: {
      faqs: [
        {
          question: "Welcher Transporter ist der richtige – Kasten, Pritsche, Plane, Koffer?",
          answer:
            "Faustregel: Möbel und sperrige Güter ⇒ Kasten mit Mittel- oder Hochdach. Lange Profile, Holz, Baumaterial ⇒ Pritsche mit Plane (Be- und Entladung von drei Seiten, Länge bis 4,3 m). Witterungsempfindliche Ware in genormten Mengen ⇒ Koffer (Kistenladung, Treppensteig-Rolli möglich). Umzug ⇒ Möbelkoffer mit Hebebühne. Wir führen am Standort Bonn-Mehlem die gängigen Bauformen in 3,5-t-Klasse mit Führerschein B; spezielle Aufbauten kommen bei Bedarf aus Krefeld.",
        },
        {
          question: "Was darf ich mit Führerschein B fahren?",
          answer:
            "Klasse B berechtigt zum Führen von Kraftfahrzeugen bis 3.500 kg zulässige Gesamtmasse (zGG) mit bis zu 9 Sitzplätzen einschließlich Fahrer. Zugkombinationen bis 3.500 kg zGG (Zugfahrzeug + Anhänger); mit B96 bis 4.250 kg, mit BE bis 7.000 kg. Unsere 3,5-t-Mietfahrzeuge fallen unter Klasse B. Sobald das Mietfahrzeug ein zGG über 3.500 kg hat (7,5-Tonner), ist Klasse C1 erforderlich – wir prüfen das vor Übergabe.",
        },
        {
          question: "Welche Umweltplakette haben eure Transporter – darf ich in Bonner Innenstadt und Bad Godesberg?",
          answer:
            "Unsere 3,5-t-Mietflotte erfüllt mindestens Schadstoffklasse 6 (Euro 6) und trägt die grüne Umweltplakette – damit ist die Einfahrt in alle Umweltzonen in NRW (Bonn, Köln, Düsseldorf, Ruhrgebiet) zulässig. Diesel-Fahrverbote für ältere Euro-4/5-Klassen gelten in einzelnen Großstädten – mit unseren Mietfahrzeugen bist du davon nicht betroffen. Bei Umzügen in andere deutsche Großstädte (Hamburg, Berlin, Stuttgart) gelten teils strengere Auflagen; bitte Zielort vorab prüfen.",
        },
        {
          question: "Welche Ladungssicherung ist beim Transporter Pflicht?",
          answer:
            "StVO § 22 und VDI 2700 fordern, dass die Ladung nicht verrutschen, umfallen, hin- und herrollen, herabfallen oder vermeidbaren Lärm erzeugen kann. Praxis: Zurrgurte mit ausreichender LC (Lashing Capacity – steht auf jedem Gurt-Label, typisch 1.500/2.500 daN), Anti-Rutsch-Matten (μ = 0,6 nach vorne), formschlüssige Verladung (Stirnwand-Stütze, Ladestäbe). Wir geben mit jedem Bonner Mietfahrzeug ausreichend Zurrgurte und Antirutsch-Matten mit. Bei Polizei- oder BAG-Kontrollen sind nicht gesicherte Ladungen ein Bußgeldtatbestand.",
        },
        {
          question: "Wie viel Höhe und Länge messen eure Transporter?",
          answer:
            "Standard-Kasten L2H2 (mittellang, mittelhoch): ca. 5,4 m × 2,0 m × 2,5 m (L × B × H), Laderaum ca. 3,2 m × 1,7 m × 1,8 m. L3H2 (lang, mittel): ca. 5,9 m × 2,0 m × 2,5 m, Laderaum ca. 3,7 m × 1,8 m. Möbelkoffer 3,5 t: ca. 7,0 m × 2,3 m × 3,2 m, Laderaum ca. 4,3 m × 2,1 m × 2,2 m. Genaue Maße im Datenblatt. Wichtig in Bonner Innenstadt: Tiefgaragen (z. B. Marktgarage, Münsterplatz, Kaiserplatz) haben oft Höhenbegrenzungen unter 2,0 m – Koffer und Hochdach-Kasten passen dort nicht.",
        },
        {
          question: "Wie funktioniert die Tankregelung – Diesel voll abgeben oder nicht?",
          answer:
            "Standard: Fahrzeug wird volltank übergeben und volltank zurückgenommen. Bei nicht volltank zurückgegebenen Fahrzeugen berechnen wir die fehlende Menge plus Service-Pauschale. AdBlue bei modernen Euro-6-Diesel-Transportern reicht typisch mehrere tausend km – Nachfüllen nur bei sehr langen Mieten nötig (1-Liter-Flasche an jeder Tankstelle). Wir geben bei Übergabe in Bonn Tankstand und Kilometerstand schriftlich aus.",
        },
        {
          question: "Was kostet ein Transporter in Bonn – Stundenmiete oder Tagesmiete?",
          answer:
            "Tagespreise je Fahrzeug sind tagesaktuell im Buchungsprozess hinterlegt. Für kurze Umzüge bieten wir auf Anfrage Stunden- bzw. Halbtagesmiete (4 Stunden + Kilometer). Standard ist 24-Stunden-Miete inkl. Kilometerpauschale (typisch 100–200 km frei, jeder weitere Kilometer Aufpreis). Wochen- und Monatsmieten sind für Bonner Handwerker- und Gewerbekunden attraktiv – die effektive Tagesmiete sinkt deutlich.",
        },
        {
          question: "Bin ich versichert, wenn etwas passiert?",
          answer:
            "Alle Mietfahrzeuge sind haftpflicht- und vollkasko-versichert (Selbstbeteiligung in unseren Mietbedingungen ausgewiesen). Auf Wunsch reduzierte SB gegen Aufpreis (Premium-Schutz). Nicht versichert sind grobe Fahrlässigkeit (Alkohol, Fahren ohne gültige Fahrerlaubnis, Überschreiten zulässiger Beladung, Höhenschaden durch Kollision mit Garageneinfahrt – Klassiker bei Hochdach-Kastenwagen in Bonner Tiefgaragen). Bei Schaden: Polizei rufen (auch bei Selbstunfall ohne Personenschaden), Unfallbericht mit Fotos, sofort am Standort Bonn unter 0228 504 660 61 melden.",
        },
        {
          question: "Darf ich mit dem Mietfahrzeug ins Ausland fahren?",
          answer:
            "EU-Ausland und EWR (Schweiz, Norwegen, Liechtenstein) sind in der Regel ohne Aufpreis abgedeckt; bitte bei Anmietung anzeigen, damit die internationale Versicherungs-Bestätigung (grüne Karte) mitgegeben wird. Für die nahegelegenen Bonner Zielmärkte Belgien und Luxemburg gilt das ohne Einschränkung. Fahrten in Länder außerhalb des EWR (Türkei, Russland, Marokko) bedürfen vorheriger Genehmigung und sind teils ausgeschlossen.",
        },
        {
          question: "Was muss ich bei der Rückgabe in Bonn beachten?",
          answer:
            "Fahrzeug volltank, sauber außen und innen (besenrein im Laderaum), inklusive aller Zurrgurte, Sackkarren und Decken, im Rückgabezeitfenster zurückbringen. Außerhalb der Öffnungszeiten (Mo–Fr 07:00–18:00, Sa 08:00–17:30) ist eine Schlüsseleinwurf-Box am Standort Bonn-Mehlem verfügbar – Schaden- und Tankprüfung erfolgen dann am nächsten Werktag mit Foto-Dokumentation. Verspätete Rückgabe wird stundenweise berechnet; kurze Vorabinfo per Telefon, wenn der Zeitplan kippt.",
        },
      ],
      expertSections: [
        {
          h3: "Fahrzeugauswahl: Volumen vs. Nutzlast vs. Beladbarkeit",
          paragraphs: [
            "Die richtige Transporter-Wahl folgt drei Größen, die selten gleichzeitig optimal sind. Volumen (m³) ist entscheidend für sperrige, leichte Ladung (Umzug, Verpackungen, Polster). Nutzlast (kg) ist die kritische Größe für schwere Ladung (Fliesen, Estrich, Werkzeug, Eisen). Beladbarkeit (Heckklappe vs. Schiebetür vs. Hebebühne) entscheidet über die Verladegeschwindigkeit.",
            "Ein 3,5-t-Kastenwagen L3H2 bringt ca. 12 m³ Volumen und 1.000–1.300 kg Nutzlast – ideal für Umzüge mit normalem Hausrat in Bonner Quartieren wie Südstadt, Poppelsdorf oder Bad Godesberg. Ein Möbelkoffer 3,5 t mit Hebebühne bietet 18–22 m³, aber nur 700–950 kg Nutzlast – Vorsicht beim Transport schwerer Möbel (Klaviere, Aktenschränke). Eine 3,5-t-Pritsche mit Plane hat oft die höchste Nutzlast (1.200–1.500 kg), dafür schmaleres Volumen. Wir beraten am Standort Bonn-Mehlem nach konkretem Beladungsbild.",
          ],
        },
        {
          h3: "Ladungssicherung in der Praxis: VDI 2700 für Mietkunden",
          paragraphs: [
            "VDI 2700 fordert formschlüssige oder kraftschlüssige Sicherung. Formschlüssig heißt: die Ladung steht direkt an der Stirnwand oder ist mit Sperrbalken/Ladegittern zwischen den Rungen blockiert – die einfachste und sicherste Methode. Kraftschlüssig (Zurrgurte über die Ladung) funktioniert nur, wenn die Reibung zwischen Ladegut und Ladefläche ausreicht – deshalb Antirutsch-Matten unter jede schwere Last.",
            "Beispiel: Eine Palette mit 800 kg auf glatter Holz-Ladefläche braucht ohne Antirutsch-Matte mindestens 4 Zurrgurte (jeweils LC 2.500 daN) im Niederzurr-Verfahren; mit Antirutsch-Matte (μ = 0,6) reichen 2 Gurte. Schwere, hohe Lasten zusätzlich mit Direktzurrung (diagonal nach unten) sichern, sonst kippt die Last beim Bremsen. Wir geben in Bonn zu jedem Transporter ein VDI-2700-Merkblatt mit – auf Wunsch erläutern wir die Sicherung vor Abfahrt persönlich.",
          ],
        },
        {
          h3: "Umweltzonen und Innenstadt-Logistik in Bonn",
          paragraphs: [
            "Die Bonner Umweltzone deckt im Wesentlichen das Stadtgebiet zwischen Beuel, Bonn-Zentrum, Bad Godesberg und der Rheinaue ab. Einfahrt nur mit grüner Umweltplakette (Schadstoffklasse 4) – unsere Euro-6-Mietflotte erfüllt diese Anforderung selbstverständlich. Diesel-Fahrverbote für ältere Klassen bestehen in Bonn derzeit nicht; in Köln-Süd (Liefergebiet aus Bonn) gilt aber stadtweit eine grüne Zone.",
            "Im engen Bonner Innenstadtbereich (Altstadt, Münsterplatz, Marktplatz, Bad Godesberger Theaterplatz) gibt es Liefer-Zeitfenster (typisch 06:00–11:00 und 18:00–22:00), Poller und Fußgängerzonen mit Lieferverkehrserlaubnis. Wer hier abladen will, plant die Tour entsprechend. Tiefgaragen-Höhenbegrenzungen sind in der Bonner City fast überall unter 2,0 m – Möbelkoffer und Hochdach-Kasten passen nicht; Standardkasten L2H1 ist die Innenstadt-Lösung.",
          ],
        },
        {
          h3: "Lenk- und Ruhezeiten: ab wann gilt EU-Verordnung 561/2006?",
          paragraphs: [
            "EU-Verordnung 561/2006 (Lenk- und Ruhezeiten plus Tachograph-Pflicht) gilt für Fahrzeuge mit zGG über 3,5 t im gewerblichen Güterverkehr. Unsere 3,5-t-Mietfahrzeuge bleiben unterhalb dieser Grenze – kein digitaler Tachograph, keine Lenkzeitregelung über das StVG hinaus. Für gewerbliche Mieter heißt das: maximale Tagesarbeitszeit nach Arbeitszeitgesetz (8 h, in Ausnahmen 10 h), keine 4,5-h-Lenkzeit-Pause-Pflicht.",
            "Wer hingegen einen 7,5-Tonner mietet (Klasse C1), fällt unter die Verordnung: Tageslenkzeit 9 h (zweimal pro Woche 10 h), Wochenlenkzeit max. 56 h, alle 4,5 h eine 45-Minuten-Pause, tägliche Ruhezeit 11 h. Außerdem Tachograph-Pflicht (digitale Fahrerkarte) und Berufskraftfahrer-Qualifikation (BKrFQG, Modul 95). Bei Bonner Mietkunden, die zwischen 3,5-t- und 7,5-t-Fahrzeug schwanken, ist das oft das entscheidende Argument für den 3,5-Tonner.",
          ],
        },
        {
          h3: "Standort Bonn-Mehlem: kurze Wege zur B9, A555, A565 und ins Rheinland",
          paragraphs: [
            "Die Filiale Bonn-Mehlem (Drachenburgstraße 8) liegt verkehrsgünstig direkt an der B9 mit kurzer Anbindung an A562, A565, A555 (Köln–Bonn) und A59 (Siebengebirge). Damit sind Köln-Süd, Bad Godesberg, Beuel, Sankt Augustin, Königswinter, Bad Honnef und das Ahrtal aus dem Stand erreichbar. Reguläre Öffnungszeiten Mo–Fr 07:00–18:00, Sa 08:00–17:30 – eine Stunde früher als andere Standorte beim Start, samstags länger geöffnet.",
            "Für Bonner Handwerker- und Umzugsbetriebe bieten wir Rahmenmieten mit festen Wochentarifen und Bevorzugungsverfügbarkeit – samstägliche Umzugslogistik und Wochen-Touren in den Köln-Bonn-Raum sind Kernanwendungen. Telefonische Beratung zur richtigen Fahrzeuggröße, Tachograph-Pflicht und Versicherungs-Konstellation unter 0228 504 660 61.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // BELEUCHTUNG (LED-PARs, Moving Heads, Effekte, DMX)
    // Quellen: ANSI E1.11 (DMX512), DIN EN 60529 (IP-Schutz),
    //   SBauVO NRW Teil 5, DGUV Vorschrift 17/18, DIN EN 17206,
    //   DIN VDE 0100-711 (Veranstaltungsstrom), DGUV 215-310
    //   (Laser). Bonner Locations: WCCB, Beethovenhalle, La Redoute,
    //   Maritim, Telekom-Forum, Post-Tower-Foyer, Stadthalle Bad
    //   Godesberg.
    // -------------------------------------------------------------
    beleuchtung: {
      faqs: [
        {
          question: "Welche Lichttechnik brauche ich für Hochzeit, Geburtstag oder Firmenevent in Bonn?",
          answer:
            "Faustregel nach Gästezahl: Bis 50 Personen reichen 4–6 LED-PARs für Wash-Licht plus 2 Effektgeräte (Derby/Moving Head) auf einem T-Bar-Stativ. Bis 150 Personen 8–12 LED-PARs, 2–4 Moving Heads, kleines DMX-Pult. Ab 200 Personen Traversenaufbau mit getrennten Wash-/Spot-/Effekt-Ebenen. Am Standort Bonn-Mehlem stellen wir Pakete passgenau zusammen – inkl. DMX-Verkabelung und Stromplan; spezialisierte Showtechnik kommt bei Bedarf binnen 24 Stunden aus Krefeld nach.",
        },
        {
          question: "Was ist DMX512 und brauche ich ein Lichtpult zur Steuerung?",
          answer:
            "DMX512 (ANSI E1.11) ist das Standard-Steuerprotokoll für Veranstaltungslicht: ein Universum überträgt 512 Steuerkanäle über XLR. Jeder Scheinwerfer belegt je Modus 4–16 Kanäle. Für kleine Setups reicht Stand-alone oder Master/Slave-Verkettung; ab 6–8 Geräten lohnt ein DMX-Pult oder Software-Lösung (USB-DMX-Interface). Wir geben jedes Gerät mit Kanalbelegung und Beispiel-Patchliste mit.",
        },
        {
          question: "Welche Scheinwerfer sind outdoor-tauglich – worauf achte ich beim IP-Schutz?",
          answer:
            "Outdoor-Einsatz (Rheinaue, Hofgarten, Garten-Events Bad Godesberg) verlangt mindestens IP65 nach DIN EN 60529 (staubdicht, strahlwassergeschützt). IP44 reicht für überdachte Bühnen, nicht bei freier Bewitterung. Auch Steckverbindungen müssen abgedichtet sein (TRUE1-IP65 oder vergossen). Im Eventtechnik-Sortiment kennzeichnen wir outdoor-fähige Geräte explizit und ergänzen bei Regenrisiko Regenhauben für Stative.",
        },
        {
          question: "Wie viel Strom zieht ein typisches Lichtpaket – passt das an eine Schuko?",
          answer:
            "Eine Schuko-Steckdose (16 A / 230 V) liefert max. ca. 3.680 W, real über B16-Automat 3.000–3.300 W. Ein LED-PAR zieht 30–180 W, ein moderner LED-Moving-Head 150–400 W. Beispiel: 8 LED-PARs (à 100 W) + 4 Moving Heads (à 250 W) = ca. 1.800 W – passt auf eine Phase. Kommt Nebelmaschine (1.500 W) oder Hazer dazu, ist eine zweite Steckdose auf separater Sicherung Pflicht. Bei größeren Setups planen wir CEE16/CEE32 mit Lichtverteiler.",
        },
        {
          question: "Wer darf Veranstaltungslicht in Bonn aufbauen und betreiben?",
          answer:
            "Für nicht-öffentliche Privatfeiern in begrenzter Größe gibt es keinen formalen Befähigungsnachweis – wir weisen ein. Sobald eine Versammlungsstätte nach SBauVO NRW Teil 5 betroffen ist (über 200 Besucher in Räumen, über 1.000 im Freien) oder eine gewerbliche Veranstaltung mit szenischer Darstellung stattfindet, greift DGUV V17/V18 – dann ist eine \"Verantwortliche Person für Veranstaltungstechnik\" erforderlich. Bei Events in Bonner Locations (WCCB, Beethovenhalle, La Redoute, Maritim) klären wir mit dem Hausherrn, was nötig ist.",
        },
        {
          question: "Was ist der Unterschied zwischen Wash-, Beam-, Spot- und Effekt-Licht?",
          answer:
            "Wash-Light flutet Flächen mit weichem, weitem Strahl (LED-PAR, Wash-Moving) – Grund-Stimmungslicht. Beam ist ein extrem enger, paralleler Strahl (5–8°), wirkt nur mit Nebel/Haze. Spot ist ein Mittelding mit Gobo-Projektion (Logos, Muster). Effekt-Geräte (Derby, Flowereffekt) erzeugen multidirektionale Lichtmuster für Tanzflächen. Eine gute Show kombiniert alle vier Schichten – wir beraten am Standort Bonn nach Location-Typ und Stilrichtung.",
        },
        {
          question: "Sind die Geräte VDE-/E-Check-geprüft?",
          answer:
            "Ja. Sämtliche elektrische Mietgeräte werden gemäß DGUV V3 in regelmäßigen Intervallen geprüft (ortsveränderliche Betriebsmittel: typisch alle 6–24 Monate). Die Prüfplakette mit Datum klebt sichtbar am Gerät bzw. am Netzkabel. Für gewerbliche Veranstalter heißt das: Betreiberpflicht auf der Veranstaltung mit unseren Geräten ohne zusätzliche Prüfung. Prüfprotokolle stellen wir auf Anfrage bereit.",
        },
        {
          question: "Wie ist die Logistik – Selbstabholung oder Lieferung im Bonner Raum?",
          answer:
            "Selbstabholung in der Drachenburgstraße 8 ist Mo–Fr 07:00–18:00 und Sa 08:00–17:30 möglich – kleinere Pakete passen in Kombi/Bus. Für komplette Lichtsetups mit Stativen, Truss und Verkabelung empfehlen wir Lieferung im Liefergebiet Bonn, Köln-Süd, Sankt Augustin, Wachtberg, Königswinter, Bad Honnef, Bad Neuenahr-Ahrweiler. Auf- und Abbau führen wir auf Anfrage durch – Preise nach Aufwand.",
        },
        {
          question: "Brauche ich für Nebel oder Hazer eine Brandmelde-Abschaltung?",
          answer:
            "In Bonner Locations mit Rauchwarnmeldern oder aufgeschalteter Brandmeldeanlage (BMA) – typisch WCCB, Beethovenhalle, Hotelballsäle, Bundesbehörden – muss die Anlage vor Einsatz von Nebel/Haze freigegeben (Hausmeister/Wachdienst informiert) oder im betroffenen Bereich abgeschaltet werden – sonst Falschalarm und Feuerwehreinsatz auf Kosten des Veranstalters. Wir weisen darauf hin und stellen Hinweisschilder \"Künstlicher Nebel im Einsatz\" bereit.",
        },
        {
          question: "Sind Laser auf Privat- und Firmenevents erlaubt?",
          answer:
            "Showlaser fallen unter DGUV Information 215-310 und die OStrV. Für Laser ab Klasse 3B/4 sind ein Laserschutzbeauftragter mit Sachkundenachweis, eine Anzeige bei der Berufsgenossenschaft sowie eine schriftliche Gefährdungsbeurteilung Pflicht. Aus diesem Grund führen wir am Standort Bonn bewusst keine offenen Show-Laser im freien Verleih – für Effektlicht setzen wir auf moderne LED-Beams mit Haze, optisch vergleichbar und ohne Sondergenehmigung.",
        },
      ],
      expertSections: [
        {
          h3: "Lichtdesign-Grundlagen: drei Ebenen, ein Konzept",
          paragraphs: [
            "Professionelles Veranstaltungslicht arbeitet in drei Ebenen: (1) Funktionslicht – damit Gäste den Raum nutzen können, gemessen in Lux am Boden (DIN EN 12464-1 nennt 100–300 lx für Verkehrsflächen, 50–100 lx für Lounge-Bereiche). (2) Atmosphärenlicht – farbiges Wash über Wände, Dancefloor, Decke; schafft Stimmung und Raumtiefe. (3) Effektlicht – Beams, Moving Heads, Strobe für Akzente in der Show.",
            "Klassischer Fehler: \"zu viel Effekt, zu wenig Funktion\" – wenn die Tanzfläche nur noch von Movings beleuchtet wird, sehen Gäste sich kaum. Faustregel: Funktionslicht 60 %, Atmosphäre 30 %, Effekt 10 %. Am Standort Bonn-Mehlem stellen wir Pakete entsprechend zusammen statt nur Geräte zu zählen.",
          ],
        },
        {
          h3: "Stromplanung in Bonner Locations: Phasen, Sicherungen, FI",
          paragraphs: [
            "Veranstaltungsstrom wird nach DIN VDE 0100-711 betrieben: jeder Stromkreis mit FI-Schutzschalter (RCD 30 mA), ortsveränderliche Verteiler mit Personenschutz, Kabel mit ausreichendem Querschnitt (H07RN-F 3×1,5 mm² bis 16 A, 3×2,5 mm² ab 25 m). Häufiger Praxisfehler: vier Mehrfachsteckdosen hintereinandergehängt – Sicherung im Haus löst aus, Bühnenlicht ist tot.",
            "Bei größeren Setups planen wir CEE-Drehstrom (16 A / 32 A, 5-polig). Drei Phasen × 16 A × 230 V = ca. 11 kW pro CEE16-Verteiler. Wir berechnen Belastung vorab und liefern bei Bedarf Drehstrom-Verteiler mit FI/LS-Kombination mit. Wo der vorhandene Hausanschluss in Bonner Altbauten oder Garten-Locations nicht reicht (typisch Trauung im Rheinauen-Pavillon), koppeln wir ein Stromaggregat aus unserem Aggregate-Sortiment an.",
          ],
        },
        {
          h3: "Hängung, Stative und Statik: Sicherheit über Köpfen",
          paragraphs: [
            "Sobald Scheinwerfer über Personen hängen, gelten DGUV V17/V18 und DIN EN 17206. Punktlasten an Hallendecken brauchen einen Nachweis durch den Hausherrn (Riggingplan, Lastenliste). Auf Stativen darf die Hersteller-Höchstlast nicht überschritten werden – ein klassisches T-Bar-Stativ trägt 30–50 kg bei 3 m Höhe. Jeder hängende Scheinwerfer wird mit einem Safety (Stahlseil) gegen Absturz gesichert, dimensioniert auf das 6-fache Eigengewicht.",
            "Wir geben am Standort Bonn zu jedem Stativ und jedem Truss-Set Datenblatt mit max. Last und Aufbauanleitung mit. Bei komplexen Hängungen liefern wir Truss aus \"Traversen & Rigging\" passend dazu – inkl. Stahlseilen, Kettenzügen (manuell oder elektrisch) und Lastverteilung.",
          ],
        },
        {
          h3: "LED vs. Entladungslampen: warum 2026 fast alles LED ist",
          paragraphs: [
            "Klassische Entladungslampen (HMI, MSR, MSD) sind nahezu vollständig durch LED verdrängt. Gründe: Lebensdauer (LED 30.000–50.000 h vs. 1.000–3.000 h Entladung), kein Lampenwechsel im Mietkreislauf, niedriger Stromverbrauch (Faktor 3–5), Dimmbarkeit ohne Farbverschiebung, kein UV-Anteil. Nachteil LED: hochwertige Farbwiedergabe (CRI 90+) ist teurer; bei Hauttönen und Foto-/Video-Mitschnitt auf CRI achten.",
            "Unsere aktuelle Mietflotte am Standort Bonn besteht zu nahezu 100 % aus LED – schont Strombilanz und reduziert Hitzeentwicklung (in Sommer-Locations ohne Klima ein echter Faktor). Bei Anfragen mit Foto-/Video-Verwertung (Bonner Konferenzen, Pressefotos im Bundesviertel) empfehlen wir explizit Geräte mit hohem CRI bzw. TLCI.",
          ],
        },
        {
          h3: "Programmierung und Steuerung: vom Stand-alone bis zum Show-Pult",
          paragraphs: [
            "Für kleine Pakete reichen Stand-alone-Modi: Sound-to-Light über eingebautes Mikrofon, vorgefertigte Programme, Master/Slave. Vorteil: kein Bediener nötig. Nachteil: keine Synchronisation auf konkrete Songs oder Programmpunkte. Sobald ein Live-Programm (Reden, Bandauftritte, Choreographien) bespielt werden soll, lohnt ein DMX-Pult oder Software (Tablet plus USB-DMX-Bridge), das auf Knopfdruck Stimmungen (Cues) abruft.",
            "Für Bonner Mietkunden erstellen wir auf Wunsch Patchliste und einfache Programmiervorlage. Wer einen Operator stellen muss, dem empfehlen wir, einen lokalen Lichttechniker zu beauftragen – wir vermitteln im Raum Bonn/Köln/Sankt Augustin.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // BESCHALLUNG (PA, Aktivlautsprecher, Pulte, Mikros, Funk)
    // Quellen: TA Lärm, DIN 15905-5 (LAeq max. 99 dB(A)/30 min),
    //   DIN VDE 0100-711, BNetzA-Frequenzplan PMSE (Mittenband
    //   470–608 MHz, 614–694 MHz, 863–865 MHz, 1785–1805 MHz).
    //   Bonner Lärmschutz: Rheinaue, Hofgarten, Bundesviertel
    //   mit Hotel- und Konferenznähe.
    // -------------------------------------------------------------
    beschallung: {
      faqs: [
        {
          question: "Welche Lautsprecherleistung brauche ich für meine Veranstaltungsgröße in Bonn?",
          answer:
            "Faustregel: Sprache/Hintergrundmusik indoor 5–10 W/Person; Live-Musik und Tanzfläche 15–25 W/Person. Outdoor verdoppelt sich der Bedarf, weil kein Raum reflektiert. Beispiele: 50 Personen Geburtstag indoor mit Tanz → 1× Aktiv-Top 12\" mit ca. 800 W RMS plus passender Sub. 150 Personen Hochzeit indoor mit Live-Band → Stereo-Set Tops 15\" + 2 Subs. 300 Personen Open Air in der Rheinaue → kompaktes PA-System mit 4 Tops + 4 Subs. Wir kalkulieren am Standort Bonn-Mehlem pro Anfrage konkret.",
        },
        {
          question: "Was ist der Unterschied zwischen Aktiv- und Passivlautsprechern?",
          answer:
            "Aktivlautsprecher haben Endstufe und Filter intern – einfacher Aufbau (Strom + Signal), teurer pro Stück, Strom an jedem Standort nötig. Passivlautsprecher brauchen externe Endstufe und Controller-Preset (DSP/Frequenzweiche) – flexibler und günstiger bei größeren Setups, aber komplexer im Aufbau. Für 90 % der Privat- und Firmenkunden in Bonn empfehlen wir Aktiv-Setups – schneller aufgebaut, weniger Fehlerquellen.",
        },
        {
          question: "Brauche ich einen Subwoofer – und wie viele?",
          answer:
            "Für reine Sprache (Vortrag, Trauung, Hochzeitsrede) reichen Tops ohne Sub. Für Musik mit elektronischem Anteil (Pop, House, HipHop) ist mindestens ein Sub Pflicht, sonst fehlt der Druck. Faustregel: ein Sub pro zwei Tops, Sub-Leistung etwa gleich Tops-Leistung in Watt RMS. Bei zwei Subs lohnt End-Fire- oder Cardio-Aufstellung, damit Bass nach vorne fokussiert und nicht hinter die Bühne strahlt (in Bonner Hotel-Ballsälen mit Wohnnachbarschaft besonders wichtig).",
        },
        {
          question: "Was muss ich zur Lautstärke und zum Lärmschutz in Bonn wissen?",
          answer:
            "Bei Veranstaltungen mit Publikum gilt DIN 15905-5: max. LAeq 99 dB(A) gemittelt über 30 Minuten, gemessen an der lautesten zugänglichen Stelle. Wer höher fährt, muss Schallpegelmessung dokumentieren und Gehörschutz auslegen. Im Freien gilt zusätzlich die TA Lärm: tags (06–22 Uhr) Misch-/Wohngebiete ca. 60 dB(A), nachts 45 dB(A) Immissionsrichtwert. In Bonn besonders relevant: Rheinaue, Hofgarten, Münsterplatz und Bundesviertel mit Hotel- und Tagungsnähe. Für Ausnahmen \"seltene Ereignisse\" (max. 10/Jahr) ist eine Anzeige beim Ordnungsamt der Stadt Bonn ratsam.",
        },
        {
          question: "Funkmikrofon mieten – gibt es Frequenzregeln in Bonn?",
          answer:
            "Ja. Die BNetzA hat den UHF-Frequenzplan klar geregelt. Anmeldefrei: 863–865 MHz (10 mW, sehr begrenzt) und 1785–1805 MHz (DECT-Bereich). Anmeldepflichtig (kostenpflichtige Frequenzzuteilung): Mittenband 470–608 MHz und Duplexlücke 614–694 MHz. Unsere Mietsysteme am Standort Bonn arbeiten auf koordinierbaren Frequenzblöcken – wir wählen pro Einsatz freie Kanäle und übergeben Geräte vorprogrammiert. Im Bonner Raum ist der Sender Langenberg (DVB-T2) zu beachten.",
        },
        {
          question: "Wie viele Mikrofone passen gleichzeitig in eine Funkstrecke?",
          answer:
            "Pro 8-MHz-TV-Kanal lassen sich typisch 6–10 koordinierte Funkstrecken parallel betreiben, je nach Hersteller und Frequenzbreite. Praxis: Hochzeit 2 Strecken (Trauredner, Brautpaar/Wechsel). Konferenz mit Podiumsdiskussion: 4–8 Strecken plus Reserve. Über 12 parallele Strecken ist professionelle Frequenzkoordination Pflicht (Intermodulationsberechnung) – wir greifen auf koordinierte Frequenzblöcke unserer Geräte zurück.",
        },
        {
          question: "Welches Mischpult brauche ich – analog, digital oder Tablet-gesteuert?",
          answer:
            "Kleinevents bis 8 Eingänge (1–2 Mikrofone, 1 Stereo-Zuspielung) → kompaktes Analogpult oder kleines Digitalpult mit Tablet. Mittelevents bis 16 Eingänge (Band + Sprecher + DJ) → Digitalpult der 16–32-Kanal-Klasse, idealerweise Tablet-Mix vom Saal aus. Große Events mit Live-Band und Monitoring → 32+-Kanal Digitalpult mit separatem Monitormix. Wir führen am Standort Bonn digitale Pulte – Tablet-Steuerung ist heute Standard.",
        },
        {
          question: "Stromversorgung der PA – Schuko oder CEE?",
          answer:
            "Kleine Aktiv-Sets (2 Tops, 1 Sub) laufen an Schuko (16 A / 3.500 W). Größere Setups mit 4 Tops + 4 Subs und Pult ziehen leicht 4.000–6.000 W – das gehört auf CEE16 (Drehstrom, 11 kW). Wichtig: Audio und Licht auf getrennte Phasen, sonst Brummschleifen über Stromversorgung. Wir liefern auf Wunsch passende Stromverteiler aus unserem Kabel- & Stromverteiler-Sortiment am Standort Bonn mit.",
        },
        {
          question: "Wie kommt Audio von der Bühne zum Mischpult – Multicore oder digital?",
          answer:
            "Analog: Multicore-Kabel mit 8/16/24 Eingängen plus Stagebox – robust, kein Latenzproblem, aber schwer und teuer pro Meter. Digital: ein CAT5e/CAT6-Kabel (Ethercon) überträgt 32–64 Kanäle bidirektional, sehr leichte Verlegung. Heute Standard auf digitalen Pulten. Bei Outdoor-Events (Rheinaue, Hofgarten) achten wir auf wasserdichte Steckverbindungen und Kabelschutz an Wegekreuzungen (Kabelbrücken aus unserem Absperrtechnik-Sortiment).",
        },
        {
          question: "Können wir die PA selbst aufbauen oder kommt jemand mit?",
          answer:
            "Pakete bis ca. 4 Tops/2 Subs übergeben wir am Standort Bonn-Mehlem inkl. Verkabelungsschema und kurzer Einweisung – technikaffine Mieter schaffen das problemlos selbst. Bei größeren Setups, Bands mit Monitormix, mehreren Funkstrecken oder zeitkritischen Veranstaltungen empfehlen wir Aufbau und Operator aus unserem Netzwerk lokaler Veranstaltungstechniker im Raum Bonn/Köln/Sankt Augustin – Vermittlung über uns.",
        },
      ],
      expertSections: [
        {
          h3: "PA-Dimensionierung: Watt sind nicht gleich Lautstärke",
          paragraphs: [
            "Die Watt-Angabe ist nur ein grober Indikator. Maßgeblich für die wahrgenommene Lautstärke ist der maximale Schalldruck (SPL @ 1 m in dB), der sich aus Wirkungsgrad und Belastbarkeit ergibt. Ein 800-W-Top mit 134 dB max. SPL kann lauter spielen als ein 1.200-W-Top mit 128 dB. Mit jeder Verdopplung der Entfernung sinkt der Schalldruck im Freifeld um 6 dB – ein Top mit 134 dB @ 1 m liefert in 16 m noch 110 dB.",
            "Praxis für Bonner Locations: in halligen Sälen (Stadthallen, Glaspavillons, Industriekonvertierungen in Beuel-Nord) lieber kleinere Lautsprecher kürzer zum Publikum – mehr Leistung erhöht hier vor allem den Hall, nicht die Sprachverständlichkeit. In gedämpften Räumen (Bonner Hotelballsäle mit Teppich, Maritim, Marriott World Conference Hotel) lohnt Power, weil der Raum schluckt.",
          ],
        },
        {
          h3: "Lärmschutz in der Praxis: TA Lärm und DIN 15905-5 in der Bonner Innenstadt",
          paragraphs: [
            "Für Innenveranstaltungen ist DIN 15905-5 der zentrale Maßstab: max. LAeq 99 dB(A) über 30 Minuten am lautesten Publikumsplatz. Wer höher fährt, braucht Pegelbegrenzung, Schallpegel-Aufzeichnung und ausgelegten Gehörschutz für Gäste. Für Bonner Hallen-Events mit Sprache reichen 75–80 dB(A) deutlich – Tanz und Live-Band bewegen sich typisch zwischen 90 und 97 dB(A).",
            "Outdoor in Wohnnähe (Rheinaue, Hofgarten, Stadtgarten Bad Godesberg): TA Lärm tagsüber 60 dB(A), nachts 45 dB(A) Richtwert in allgemeinen Wohngebieten – sehr leise, ein normales Gespräch erreicht 60 dB. Für Sommerfeste und Hochzeiten im Freien gibt es \"seltene Ereignisse\" (max. 10/Jahr und Ort). Wir empfehlen frühzeitige Abstimmung mit dem Ordnungsamt der Stadt Bonn.",
          ],
        },
        {
          h3: "Funkmikrofone: Frequenzplanung und PMSE in Bonn",
          paragraphs: [
            "Drahtlose Mikrofone arbeiten im UHF-Bereich. Die BNetzA verwaltet PMSE (Programme Making and Special Events): Mittenband 470–608 MHz (Allgemeinzuteilung max. 50 mW, Co-Existenz mit DVB-T2), Duplexlücke 614–694 MHz (anmeldepflichtige Einzelzuteilung), DECT-Bereich 1785–1805 MHz (kostenfrei, ortsfest), 863–865 MHz (sehr begrenzt).",
            "Praktische Folge für Bonner Mieter: einzelne Mikrofone laufen anmeldefrei auf 1785–1805 MHz oder im Mittenband. Bei 4+ parallelen Strecken empfehlen wir koordinierte Geräte aus dem Mittenband. Bei Veranstaltungen in DVB-T2-Belegung Senders Langenberg führen wir vor Übergabe einen Scan der freien Kanäle durch. Im Bundesviertel und beim Plenarsaal-Umfeld gibt es zusätzlich diplomatische und behördliche Funkbelegung – wir scannen vor Ort.",
          ],
        },
        {
          h3: "Verkabelung, Erdung und Brummschleifen vermeiden",
          paragraphs: [
            "Brummen auf der PA ist meist ein Erdungsproblem (Ground Loop): zwei Stromkreise mit unterschiedlichem Schutzleiter-Potenzial, verbunden über Audio-Masse. Lösungen: alle Audio-Geräte auf dieselbe Phase und denselben Schutzleiter (idealerweise einen Strang aus einem CEE-Verteiler), symmetrische Audio-Verbindungen (XLR statt unsymmetrische Klinke), DI-Boxen mit Groundlift.",
            "Niemals den Schutzleiter abklemmen – lebensgefährlich und verstößt gegen DIN VDE 0100. Wir liefern für Bonner Setups grundsätzlich nur Verkabelung mit korrekter Erdung. Bei Mischmoderation aus Hausstrom und Bühnenstrom ergänzen wir DI-Boxen für saubere Pegelübergänge.",
          ],
        },
        {
          h3: "Monitoring und Stagesound: warum auch kleine Events davon profitieren",
          paragraphs: [
            "Auch bei kleinen Events ist Monitoring wichtig: Trauredner braucht eigene Lautsprecher Richtung Publikum – nicht in den Rücken; ein Brautpaar mit Funkmikro hört sich selbst nicht, wenn der PA-Hauptklang weit entfernt steht. Lösungen: kleine Aktiv-Monitore (8–10\") als Sidefill, In-Ear-Monitorstrecken für Bands (DECT/UHF), reine Bestätigungs-Lautsprecher (Confidence Speaker) am Rednerpult.",
            "Für Bonner Hochzeiten und Firmen-Events (typisch La Redoute Bad Godesberg, Steigenberger, Telekom-Forum) stellen wir Monitor-Pakete zusammen, die mit dem Haupt-PA-Setup zusammenarbeiten. Bei reinen Konferenz-Setups setzen wir oft auf Decken-/Wand-Lautsprecher der Location und ergänzen mit mobilen Stativ-Lautsprechern für flexible Bereiche.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // BÜHNE (Modulpodeste, Treppen, Geländer, Verkleidung)
    // Quellen: DIN EN 13200-1/-5, SBauVO NRW Teil 5,
    //   DGUV V17/V18, DIN EN 17206, DIN 18065, DIN 18040-1,
    //   DIN EN 1991-1-4, DIN 4102-1 (B1).
    // -------------------------------------------------------------
    buehne: {
      faqs: [
        {
          question: "Welche Bühnengröße brauche ich für meine Veranstaltung?",
          answer:
            "Faustregel: Solo-Sprecher mit Stehpult und Wand-Beamer → 2 × 2 m. DJ mit Lichteffekten → 3 × 2 m. Band mit 4 Musikern und Drumrise → 6 × 4 m. 5–8-köpfige Band mit Backline → 8 × 5 m. Pro Person auf der Bühne ca. 1,5 m² Aufstellfläche plus Bewegungsraum. Wir konfigurieren am Standort Bonn-Mehlem modulare Bühnenpodeste flexibel in 20-cm-Höhenrastern (40, 60, 80, 100 cm); größere Bühnen-Sets aus Krefeld binnen 24 Stunden.",
        },
        {
          question: "Welche Belastbarkeit haben die Bühnenpodeste?",
          answer:
            "Standard-Modulbühnenpodeste sind nach DIN EN 13200 für 5 kN/m² (500 kg/m²) Verkehrslast ausgelegt – Anforderung an Stehplätze für Publikum. Für reine Sprecher- oder Tanzbühnen mit max. 3 Personen pro Quadratmeter mehr als ausreichend. Schwere Last (Flügel, schwere Backline) auf mindestens 2 Felder verteilen. Belastbarkeit pro Podest steht im Datenblatt.",
        },
        {
          question: "Brauche ich eine Treppe oder Rampe?",
          answer:
            "Ab 60 cm Bühnenhöhe ist eine Treppe verpflichtend (DGUV 17/18). Standard-Bühnentreppen haben ca. 18 cm Steigung und 28 cm Auftritt – entspricht DIN 18065 für Notwendigtreppen. Eine Rollstuhlrampe nach DIN 18040 (max. 6 % Steigung – heißt für 60 cm Höhe 10 m Rampenlänge) ist bei öffentlichen Veranstaltungen empfohlen. Bei Hochzeits- und Firmen-Bühnen liefern wir Treppe als Standard mit, Rampe auf explizite Anfrage.",
        },
        {
          question: "Ab welcher Bühnenhöhe brauche ich Absturzsicherung/Geländer?",
          answer:
            "Ab 1 m Absturzhöhe fordert die DGUV-Vorschrift Geländer mit Höhe mindestens 1,10 m, Mittelholm, Fußleiste. Bei 80 cm Bühne ist Geländer optional, ab 100 cm Pflicht. Im sichtbaren Frontbereich der Bühne (zum Publikum) entfällt das Geländer üblicherweise – Absturzkante klar erkennbar und Teil der künstlerischen Nutzung. Seiten und Rückseite werden mit Geländer abgesichert.",
        },
        {
          question: "Ist eine Modulbühne ein \"fliegender Bau\" nach SBauVO NRW?",
          answer:
            "Fliegende Bauten sind nach SBauVO NRW Teil 5 bauliche Anlagen, die wiederholt aufgestellt werden und Personenzugang bieten. Unsere Standard-Modulbühnen bis ca. 6 × 4 m mit Höhen bis 80 cm und ohne Überdachung gelten in der Regel als untergeordnete Aufstellung und brauchen keine separate Ausführungsgenehmigung. Tribünen über 100 m², Höhen über 1,5 m oder Überdachungen können prüfbuchpflichtig und sachverständigenpflichtig werden.",
        },
        {
          question: "Bühne für Outdoor in der Rheinaue – wie schütze ich gegen Regen und Wind?",
          answer:
            "Standard-Modulbühnenpodeste sind wetterfest, rutschhemmend. Outdoor braucht eine Überdachung gegen Regen – Pavillon, Eventzelt oder Bühnendach mit Traversen. Wind ist der kritische Faktor: ein offenes Bühnendach 4 × 4 m kann bei 80 km/h mehrere Tonnen Auftrieb erzeugen. Wir prüfen die Statik (Standort-Windlast nach DIN EN 1991-1-4) vor Outdoor-Aufbauten in Bonner Hochwasser- und Freiluftlagen (Rheinaue, Hofgarten, Drachenfels-Plateau) und liefern Ballast bzw. Erdanker mit.",
        },
        {
          question: "Wie lange dauert Aufbau und Abbau einer Bühne?",
          answer:
            "Eine 4 × 3 m Bühne (12 m²) bauen zwei eingewiesene Personen in ca. 45–60 Minuten auf, inkl. Höheneinstellung und Treppenmontage. 6 × 4 m (24 m²) mit Verkleidung dauert ca. 90 Minuten. Abbau typisch 70 % der Aufbauzeit. Werkzeug (Inbus, Steckschlüssel) ist im Mietpaket enthalten. Auf Wunsch übernehmen wir Aufbau und Abbau am Veranstaltungsort im Raum Bonn/Köln/Sankt Augustin – Stundensatz nach Aufwand.",
        },
        {
          question: "Kann man die Bühnenfläche verkleiden – in welchen Farben?",
          answer:
            "Ja. Standard ist schwarzer, schwer entflammbarer Bühnenmolton (B1 nach DIN 4102-1, in NRW nach SBauVO Teil 5 verpflichtend für Versammlungsstätten). Wir bieten Molton in Standard-Schwarz; andere Farben (weiß, rot, blau) auf Sondervorlauf. Befestigung mit Velcro – schnell und werkzeuglos. Für Bonner Markenevents (Telekom, Post, Bundesbehörden) lassen sich bedruckte Frontverkleidungen (Banner mit Logo) ergänzen.",
        },
        {
          question: "Welcher Untergrund ist für eine Bühne geeignet?",
          answer:
            "Indoor: jeder ebene Hartboden (Parkett, PVC, Beton, Estrich). Bei Teppich ggf. Lastverteilungsplatten, weil punktuelle Last die Bühnenfüße eindrücken. Outdoor: ebener Rasen, Pflaster, Asphalt. Bei Rasen (typisch Hofgarten, Rheinaue) Last mit Holzbohlen unter den Füßen verteilen, sonst sinken die Stützen ein. Bei stark geneigtem Gelände (Drachenfels, Bonner Hänge) gleichen wir mit höhenverstellbaren Füßen aus (Bereich ca. ±10 cm pro Fuß).",
        },
        {
          question: "Bühne plus Licht plus Ton – bekomme ich das aus einer Hand in Bonn?",
          answer:
            "Ja. Am Standort Bonn-Mehlem führen wir Bühne, Beleuchtung, Beschallung, Traversen, Rigging, Stromverteilung und Eventzelte aus einem Lager (mit Nachlieferung Krefeld bei Spezialequipment). Das spart Logistik (eine Anlieferung, ein Ansprechpartner) und stellt sicher, dass technische Schnittstellen passen (Truss-Hängung über Bühne mit korrekter Höhe und Statik, Stromplan abgestimmt, Audio-Hängung außerhalb der Lichtstrahlen). Komplettangebote unter 0228 504 660 61.",
        },
      ],
      expertSections: [
        {
          h3: "Modulbühnen-Systeme: Funktionsweise und Grenzen",
          paragraphs: [
            "Professionelle Modulbühnen bestehen aus einer Aluminium-Rahmen-Konstruktion mit aufgelegter Holzwerkstoff-Platte (typisch 18-mm-Birkenmultiplex mit rutschhemmender Beschichtung). Standardraster 1 × 1 m, 2 × 1 m oder 2 × 2 m. Höheneinstellung über höhenverstellbare Standbeine in 20-cm-Schritten von 20 cm bis 100 cm; für Tribünen und Show-Bühnen sind 120 cm und mehr möglich.",
            "Belastbarkeit folgt DIN EN 13200-1: 5 kN/m² Verkehrslast für Stehplätze, 7,5 kN/m² für rhythmische Belastung (Tanzfläche, springendes Publikum bei Konzerten). Für Tanzflächen empfehlen wir Tanzbodenauflage (PVC oder Laminat) – schont die Bühnenoberfläche und sieht repräsentativer aus.",
          ],
        },
        {
          h3: "Versammlungsstätten in NRW: SBauVO Teil 5 in der Praxis",
          paragraphs: [
            "Die Sonderbauverordnung NRW Teil 5 gilt für Versammlungsstätten ab 200 Besucher in geschlossenen Räumen oder 1.000 Besucher im Freien. Sie regelt Rettungswege, Fluchttüren, Brandschutz, Bestuhlungspläne, Aufsichtspersonen und – relevant für Bühnen – die brandschutztechnischen Anforderungen an Bühnenmaterialien (mindestens B1 schwer entflammbar nach DIN 4102-1).",
            "Praktische Folge für Bonner Veranstalter: Für private Hochzeiten unter 200 Gästen in privatem Rahmen greift die VStättVO nicht. Sobald eine kommerzielle Veranstaltung in einer öffentlich zugänglichen Halle stattfindet (Konzerte in der Beethovenhalle, Messen im WCCB, Stadtteilfeste), prüfen wir die Anforderungen mit dem Veranstalter – Bühnenmolton und alle Verkleidungen aus unserem Lager sind B1-zertifiziert; die Zertifikate liegen vor.",
          ],
        },
        {
          h3: "Statische Sicherheit: was hält wirklich was?",
          paragraphs: [
            "Bühnenpodeste werden in Deutschland nach DIN EN 13200 typgeprüft. Jedes Modul hat eine Bauartzulassung mit konkreter Belastungsangabe; wir führen ausschließlich Systeme, deren Zulassung vorliegt. Bei Sonderlasten (Flügel mit 350 kg auf 1,5 × 1 m – typisch für Beethovenstadt) erstellen wir vorab eine Lastverteilung mit Spreader-Platten. Bei mehrstöckigen Tribünen oder Bühnen mit Dachkonstruktion wird ein Statiker hinzugezogen – das ist im Mietpaket nicht enthalten.",
            "Auf Vor- und Hauptbühnen bei Konzerten kalkuliert man dynamische Belastungen (springendes Publikum) doppelt zur statischen Last. Eine Bühnenfront 6 × 4 m mit 100 Personen Tanzfläche bedeutet ca. 10 kN/m² Spitze – das schaffen Modulbühnensysteme bei richtiger Stützweite.",
          ],
        },
        {
          h3: "Aufbau-Reihenfolge: Praxis-Workflow für saubere Bühnen",
          paragraphs: [
            "Empfohlene Reihenfolge für 4 × 3 m Bühne mit 80 cm Höhe: (1) Standfläche prüfen, eben und tragfähig. (2) Eckpodeste setzen und Höhenfüße mit Libelle einstellen. (3) Mittlere Podeste einsetzen, Verbindungsklammern verriegeln. (4) Komplette Fläche prüfen (kein Wackeln, keine Spalte). (5) Treppe(n) montieren und sichern. (6) Geländer Seiten- und Rückseite. (7) Molton-Verkleidung. (8) Erst danach Technik (Licht, Ton, Backline) aufbauen.",
            "Häufiger Fehler bei Eigenaufbau: Technik wird vor Geländer aufgebaut, dann fehlt der Platz und das Geländer wird weggelassen – beim Aufbau eines Mikroständers stürzt jemand rückwärts. Wir empfehlen die Reihenfolge konsequent. Bei Großevents im Raum Bonn übernimmt unser Team oder ein vermittelter lokaler Partner den Aufbau auf Wunsch komplett.",
          ],
        },
        {
          h3: "Rollstuhlzugänglichkeit und Barrierefreiheit",
          paragraphs: [
            "Für barrierefreie Bühnen gilt DIN 18040-1: Rampenneigung max. 6 %, beidseitiger Handlauf, Zwischenpodeste alle 6 m Länge, rutschfester Belag. Bei 60 cm Bühnenhöhe heißt das 10 m Rampenlänge – ein ernst zu nehmender Platzbedarf. Alternative für Locations mit Platznot: niedrige Bühne (40 cm) mit kürzerer Rampe, oder Hublift bei festen Bühnenanlagen.",
            "Bei Bonner Trauungen, Reden und Preisverleihungen in öffentlichen Locations (Beethovenhalle, WCCB, Plenarsaal-Umfeld) empfehlen wir die niedrigere Bühnenvariante. Unsere Rampen sind 1 m breit; DIN 18040 fordert für reine Bühnenrampen 1,20 m Begegnungsverkehr nicht zwingend. Im Zweifel beraten wir und bieten projektspezifische Lösungen.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // TRAVERSEN & RIGGING (Alu-Truss, Kettenzüge, Tower, Ballast)
    // Quellen: DIN EN 17206, DGUV V17/V18, DGUV Regel 115-002,
    //   DIN EN 818-7, DIN EN 1492-2, DIN EN 13414,
    //   DIN EN 1991-1-4, BGV C1/D8/D8+.
    // -------------------------------------------------------------
    "traversen-rigging": {
      faqs: [
        {
          question: "Welche Traversengröße brauche ich für mein Setup?",
          answer:
            "Faustregel nach Spannweite: bis 4 m und max. 50 kg Last → 220er Truss (22 × 22 cm, F32) reicht. 4–8 m oder höhere Lasten (Lichtbatterie, Lautsprecher) → 290er Truss (F34, 29 × 29 cm). Ab 8 m oder schwerer Hängelasten → 390er Truss (F44) bzw. Box-Truss. Am Standort Bonn-Mehlem führen wir die gängigen Größen für das Eventgeschäft; Sondergrößen liefern wir aus Krefeld nach.",
        },
        {
          question: "Wie hoch darf ich Traversen aufbauen – Tower und Ground-Support?",
          answer:
            "Aluminium-Truss-Tower mit Kettenzug oder Steigerverfahren erreichen typisch 4–8 m Aufbauhöhe (Standard-Mietsysteme). Höhere Tower (12+ m) sind statisch geprüfte Spezialkonstruktionen mit schwerem Ballast (typisch 250 kg pro Tower) – Indoor möglich, Outdoor windkritisch. Wir liefern in Bonn Tower bis ca. 5 m mit Heberahmen für Einzelpersonen-Aufbau; höhere Setups mit Aufbauservice.",
        },
        {
          question: "Brauche ich Kettenzüge oder reicht statische Hängung?",
          answer:
            "Statische Hängung (fix, nicht beweglich): einfacher, billiger, ausreichend für Setups, die einmal hängen. Kettenzüge (manuell oder elektrisch): nötig, wenn Truss am Boden bestückt und dann hochgefahren wird (Standard bei Konzerten) oder Höhen während der Show verändert werden. Elektrokettenzüge der 250/500/1.000 kg-Klasse sind im professionellen Veranstaltungsbau Standard. Wir vermieten beides – Kettenzüge erfordern Sachkundenachweis nach DGUV 17 für gewerbliche Mieter.",
        },
        {
          question: "Wie viel Last kann ich an eine Truss hängen?",
          answer:
            "Die zulässige Hängelast hängt von Truss-Typ, Spannweite und Hängepunkt-Konfiguration ab. Beispiel 290er Box-Truss bei 6 m und 2 Hängepunkten (1/4-Punkt): ca. 250–400 kg gleichverteilte Last (UDL), je nach Hersteller. Punktlasten sind kritischer – ein 50-kg-Moving Head mittig auf 6 m Truss kann die zulässige Belastung schon überschreiten. Wir geben für jedes Truss-Modul ein Datenblatt mit Belastungskurven heraus.",
        },
        {
          question: "Welche Sicherheitsausrüstung gehört zu jeder Truss-Hängung?",
          answer:
            "Pflicht: Anschlagmittel mit ausreichender Tragfähigkeit (Rundschlinge oder Stahlseil, geprüft nach DIN EN 1492-2/13414), Schäkel mit ausreichendem WLL (typisch 1.000 oder 1.500 kg), Stahlseil-Safety als Sekundärsicherung (6-fache Tragfähigkeit des Geräts), Lastverteiler bei mehreren Punkten. Wir geben am Standort Bonn zu jedem Truss-Paket geprüfte Anschlagmittel mit Prüfplakette (jährliche Sichtprüfung dokumentiert) mit.",
        },
        {
          question: "Outdoor-Tower in Bonn – wie viel Wind ist okay?",
          answer:
            "Standard-Aluminium-Tower mit Ballast (250–500 kg pro Tower) sind typisch bis Windgeschwindigkeit 8 m/s (29 km/h, Bft 5) auslegbar. Bei höheren Werten muss das System abgesenkt oder demontiert werden. Bei Outdoor-Bühnen mit Plane/Banner erhöht sich die Windlast quadratisch – ein 4 × 6 m Banner bei 50 km/h erzeugt mehrere Tonnen Druck. Wir kalkulieren Windlast nach DIN EN 1991-1-4 und liefern entsprechend dimensionierten Ballast oder empfehlen Erdanker; in der Bonner Rheinaue auf weichem Untergrund sind Erdanker oft die bessere Wahl.",
        },
        {
          question: "Darf ich Truss in Eigenaufbau machen?",
          answer:
            "Privat (nicht öffentlich, nicht gewerblich): ja, mit Geräteeinweisung am Standort Bonn. Gewerblich oder bei öffentlichen Veranstaltungen greift DGUV V17/V18: Aufbau über Personenköpfe darf nur durch sachkundige Personen erfolgen (Verantwortlicher für Veranstaltungstechnik mit IHK-Abschluss). Für Hochzeiten und kleine Firmen-Events bauen wir auf Wunsch selbst auf oder vermitteln einen lokalen IHK-Veranstaltungsmeister im Raum Bonn/Köln.",
        },
        {
          question: "Welche Kupplungssysteme gibt es – passt alles zusammen?",
          answer:
            "Branchenstandards: F32/F34/F44-Reihe (Konusverbindung mit Stiften und Sicherungssplint, herstellerübergreifend kompatibel innerhalb der Größe), Spigot-Verbindungen, Box-Truss-Konus. Innerhalb einer Truss-Größe sind die meisten Marken kompatibel – wir mischen bewusst nicht Hersteller, weil Toleranzen variieren. Am Standort Bonn führen wir geschlossene Sets eines Herstellers für reibungslosen Aufbau.",
        },
        {
          question: "Was kostet Aufbau und Abbau einer Trusskonstruktion?",
          answer:
            "Stundensatz unseres Veranstaltungstechnik-Teams bzw. vermittelter lokaler Partner im Raum Bonn liegt typisch bei 60–95 € netto pro Stunde, je nach Qualifikation (Helfer / Sachkundiger / Meister). Eine Standardkonstruktion 6 × 4 m mit 4 Towern und Mid-Beam baut ein 2-Personen-Team in ca. 90 Minuten auf. Bei Großevents kalkulieren wir Material-, Personal- und Anfahrtskosten transparent in einem Komplettangebot.",
        },
        {
          question: "Gibt es eine Versicherung für hängendes Material?",
          answer:
            "Wir versichern unsere Mietsachen über eine Maschinen-/Inhaltsversicherung. Für Sach- und Personenschäden auf der Veranstaltung ist eine Veranstalterhaftpflichtversicherung des Mieters Pflicht – jeder gewerbliche Veranstalter hat das ohnehin, für Privatpersonen ist eine erweiterte Haftpflicht oder Eventversicherung sinnvoll. Bei Buchung von Trusskonstruktionen weisen wir explizit darauf hin.",
        },
      ],
      expertSections: [
        {
          h3: "Truss-Statik verstehen: UDL, CPL und 1/3-Punkt-Regel",
          paragraphs: [
            "Herstellerdatenblätter für Truss geben drei zentrale Werte an: UDL (Uniformly Distributed Load, gleichverteilt), CPL (Center Point Load, eine Punktlast in der Mitte) und 1/3-Point oder 1/4-Point-Loading (zwei oder drei symmetrische Punkte). Beispiel 290er Box-Truss, 6 m Spannweite: UDL ca. 350 kg, CPL ca. 150 kg, 1/3-Punkt-Lasten 2 × 175 kg. Hängung an zwei Punkten im 1/4-Bereich ist statisch deutlich günstiger als ein einziger Punkt mittig.",
            "Für Bonner Setups planen wir Hängung in Lastpunkten – nicht \"auf gut Glück\". Schwere Geräte (Moving Heads, große Lautsprecher) hängen direkt unter einem Anschlagpunkt, leichte Wash-Lichter dazwischen. Das halbiert die effektive Biegelast und ist die professionelle Vorgehensweise.",
          ],
        },
        {
          h3: "Anschlagmittel: Rundschlinge, Stahlseil, Schäkel",
          paragraphs: [
            "Rundschlingen (Polyester, farbcodiert: violett 1 t, grün 2 t, gelb 3 t, grau 4 t, rot 5 t, braun 6 t) sind das Standard-Anschlagmittel im Veranstaltungsbau. Leicht, deckenschonend, normiert nach DIN EN 1492-2. Wichtig: nicht über scharfe Kanten ziehen (Trägerflansch) – sonst Faserbruch. Stahlseile (DIN EN 13414) sind robuster gegen Kanten und Hitze, aber schwerer.",
            "Schäkel: omega- oder dee-förmig, in Güteklasse 6 oder 8, mit WLL-Aufprägung am Bügel. Niemals lose Schrauben oder Eigenbau-Lösungen verwenden. Wir liefern am Standort Bonn nur geprüfte Anschlagmittel mit aktueller Prüfplakette (jährliche Sichtprüfung nach DGUV Grundsatz 309-007 dokumentiert).",
          ],
        },
        {
          h3: "Kettenzüge: manuell vs. elektrisch, D8 und D8+",
          paragraphs: [
            "Manuelle Kettenzüge (Stirnradflaschenzug) heben mit Handkette – günstig, langsam, max. ca. 250 kg, für Trauerhöhungen und kleine Lasten. Elektro-Kettenzüge sind die Arbeitspferde der Veranstaltungsbranche: 250 kg, 500 kg, 1.000 kg WLL. Über Personenköpfen muss der Kettenzug in der Ausführung D8+ ausgeführt sein (zusätzliche Sicherungsbremse, 10-fache Sicherheit) – D8 reicht nur für Lasten, die nicht über Personen geführt werden.",
            "Im Bonner Mietsortiment führen wir je nach Setup-Größe geprüfte D8-Hebezeuge mit aktueller Sachverständigenprüfung. Für gewerbliche Veranstalter mit Personenhängung empfehlen wir D8+-Geräte und Vermittlung eines IHK-Sachkundigen für den Aufbau.",
          ],
        },
        {
          h3: "Outdoor und Windlast in der Rheinaue: DIN EN 1991-1-4 praxisnah",
          paragraphs: [
            "DIN EN 1991-1-4 berechnet Windlast als q = ½·ρ·v². Für 50 km/h Wind (14 m/s) ergibt sich Staudruck von ca. 120 N/m². Ein 4 × 6 m Banner bei 50 km/h heißt 24 m² × 120 N/m² = 2.880 N (≈ 290 kg) seitliche Belastung – ohne Ballast oder Verankerung kippt der Tower. Bei 80 km/h (Bft 9) sind es 730 N/m² – das Vierfache.",
            "Standard-Ballast aus Beton wiegt 25 kg pro Modul, Standard-Tower brauchen 8–16 Module (200–400 kg pro Standfuß) für Bühnendächer. Alternative: Erdanker für Rasen/Erdboden – in der Rheinaue, im Hofgarten oder auf Schulhöfen meist möglich. Bei harten Untergründen (Asphalt Münsterplatz, Pflaster Marktplatz) ist Ballast die einzige Option. Bei Windwarnung über Bft 8 wird das System abgebaut oder abgesenkt.",
          ],
        },
        {
          h3: "Prüfung und Doku: was Veranstalter vorhalten müssen",
          paragraphs: [
            "Gewerbliche Veranstalter müssen nach DGUV V17/V18 für jede Veranstaltungstechnik vorhalten: Gefährdungsbeurteilung (ArbSchG § 5), Herstellerdatenblätter der Mietsachen, Sachkundenachweis der eingesetzten Personen, Aufbau-/Abbauplan, Prüfprotokolle der Anschlagmittel. Wir liefern als Vermieter Datenblätter und Prüfplaketten – die Gefährdungsbeurteilung erstellt der Veranstalter (Beratung möglich).",
            "Für Privat-Events (Hochzeit, Geburtstag, geschlossener Kreis) gelten diese Pflichten nicht – eine sachgerechte Einweisung am Standort reicht. Sobald die Veranstaltung öffentlich, gewerblich oder über 200 Besucher in der Halle umfasst, greift SBauVO NRW Teil 5 und die Pflichten gelten vollständig.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // KOMMUNIKATION (Funkgeräte, Headsets, Intercom)
    // Quellen: BNetzA-Allgemeinzuteilung PMR446 (Vfg. 28/2017),
    //   dPMR446/DMR446 (Vfg. 33/2014), Betriebsfunk 410–470 MHz
    //   (Einzelzuteilung), DECT 1880–1900 MHz. BOS-Funk
    //   ausschließlich für Behörden – KEINE Vermietung.
    // -------------------------------------------------------------
    kommunikation: {
      faqs: [
        {
          question: "Welche Funkgeräte sind in Deutschland anmeldefrei – PMR446 erklärt",
          answer:
            "PMR446 ist der Standard für anmeldefreie Handfunkgeräte in Deutschland und der EU. BNetzA-Allgemeinzuteilung Vfg. 28/2017: 16 Kanäle im Bereich 446,0–446,2 MHz, max. 500 mW Sendeleistung, fest angebaute Antenne. Reichweite im Außenbereich (freie Sicht) typisch 2–4 km, in der Stadt 300–800 m, in Gebäuden 1–3 Etagen. Reicht für Veranstaltungsabsprache, Baustellenkoordination, kleine Festivals. Am Standort Bonn führen wir PMR446-Geräte als Standard – sofortiger Einsatz ohne Anmeldung.",
        },
        {
          question: "Wie viele Funkgeräte brauche ich – pro Person oder mehrere Gruppen?",
          answer:
            "Faustregel: 1 Gerät pro Funktion. Für Veranstaltungsleitung, Bühne, Einlass, Bar, Catering je ein eigenes Gerät – ggf. auch je ein eigener Kanal. PMR446 hat 16 Kanäle (mit CTCSS/DCS weitere virtuelle Trennung). Bei Hochzeiten und kleinen Firmen-Events kommt man mit 4–6 Geräten aus, bei Festivals und Großhochzeiten 10–20+. Wir konfigurieren und übergeben am Standort Bonn vorprogrammiert mit dem gleichen Kanal.",
        },
        {
          question: "Headset oder Hand-PTT – was ist praktischer?",
          answer:
            "Headset (Bügel- oder Nackenbügel) mit PTT-Taste am Kabel ist Standard für Personal mit beiden Händen voll (Sicherheitsdienst, Bühnencrew, Service). Hand-PTT mit Lautsprecher reicht für Veranstaltungsleitung und Außenbereich. Profi-Headsets mit Noise Cancelling sind für laute Locations (Bühne nahe Lautsprecher) sinnvoll – wir empfehlen je Einsatz und Lärmumgebung in Bonn.",
        },
        {
          question: "Reichweite – stimmen die \"bis zu 10 km\" auf der Verpackung?",
          answer:
            "Die Herstellerangaben gelten unter Idealbedingungen (freie Sicht, See, Wüste, beide auf Bergen). Praxis: PMR446 in der Stadt 300–800 m, im Freien mit Bebauung 1–2 km, im Wald oder Tal entsprechend weniger. Für größere Reichweiten (Bonn Marathon mit Streckenlänge 42 km, Festival mit 1 km Länge, Industrieanlage) braucht es Einzelzuteilung im Betriebsfunk – aufpreispflichtig, aber bis 5 W Sendeleistung erlaubt.",
        },
        {
          question: "Was ist der Unterschied zwischen analog und digital (DMR)?",
          answer:
            "Analoge PMR446-Geräte: einfach, robust, herstellerübergreifend kompatibel. Reichweite und Sprachqualität nehmen mit zunehmendem Abstand allmählich ab. Digital (dPMR/DMR im 446-Band, BNetzA Vfg. 33/2014): bessere Sprachqualität bis zur Reichweitengrenze (dann abrupter Abbruch), mehr Funktionen (Display, Textnachrichten, Verschlüsselung), zwei Sprachkanäle pro Frequenz möglich. Am Standort Bonn führen wir beide Varianten.",
        },
        {
          question: "Kann ich Funkgeräte über mehrere Etagen oder im Keller nutzen?",
          answer:
            "Beton- und Stahlwände dämpfen Funksignale stark; PMR446 übersteht typisch 1–3 Stahlbetonetagen, im Tiefkeller je nach Bauweise gar nicht. Lösungen: (a) DECT-Intercom für gebäudeinterne Kommunikation (1880–1900 MHz, anmeldefrei, mit Repeater 50+ Etagen möglich), (b) Mobilfunk-PTT (4G/5G, deutschlandweit, monatliche SIM), (c) Betriebsfunk mit Repeater im Gebäude (Einzelzuteilung BNetzA, kostenpflichtig). Im Post-Tower, Telekom-Forum oder WCCB ist DECT-Intercom oft die saubere Lösung.",
        },
        {
          question: "Akku-Laufzeit – reicht das für einen Tag?",
          answer:
            "Standard-PMR446 mit Li-Ion-Akku hält 8–12 Stunden im Mischbetrieb (5 % senden, 5 % empfangen, 90 % stand-by). Bei intensiver Nutzung (Sicherheitsdienst, Dauerkommunikation) 6–8 Stunden. Für Mehrtageseinsätze geben wir Ersatzakkus oder Mehrfach-Lader (4er-/6er-Schalen) mit. Akkus werden vor Ausgabe vollgeladen übergeben.",
        },
        {
          question: "Brauche ich für Funkgeräte auf einer Baustelle in Bonn eine Genehmigung?",
          answer:
            "Für PMR446: nein. Allgemeinzuteilung BNetzA, anmelde- und gebührenfrei, in ganz Deutschland und der EU zulässig. Für Betriebsfunk (höhere Leistung, eigene Frequenz): ja, Einzelzuteilung bei der BNetzA mit jährlicher Gebühr und Standortbindung. Für BOS-Funk (Feuerwehr, Polizei, Rettungsdienst): ausschließlich autorisierte Organisationen – wir vermieten keinen BOS-Funk. Für Baustellenalltag in Bonn sind PMR446-Geräte die Standardlösung.",
        },
        {
          question: "Wie ist die Sprachqualität bei lauter Umgebung (Konzert, Baustelle)?",
          answer:
            "Mit Standard-Headset und PTT-Mikro vor dem Mund ist Sprache bis ca. 90 dB(A) Umgebungsgeräusch verständlich. In sehr lauten Umgebungen (Front-of-House Konzert in der Beethovenhalle, Bohrhammereinsatz) empfiehlt sich Profi-Headset mit Boom-Mikrofon und aktiver Noise-Cancellation oder Kehlkopfmikrofon (nimmt Umgebungsgeräusche nicht auf). Solche Spezialheadsets vermieten wir am Standort Bonn auf Anfrage.",
        },
        {
          question: "Werden die Geräte vor Ausgabe geprüft und gereinigt?",
          answer:
            "Ja. Jedes Gerät durchläuft vor Ausgabe einen Funktionscheck (Sende-/Empfangstest, Akkuspannung, Tastenfunktion). Headset-Ohrauflagen und Mikro-Windschutz werden gereinigt bzw. ausgetauscht – hygienisch wichtig bei Personenwechsel. Programmierung auf den gewünschten Kanal erfolgt vor Übergabe; wir notieren den Kanal auf dem Übergabeschein, damit die ganze Crew startklar ist.",
        },
      ],
      expertSections: [
        {
          h3: "PMR446 vs. Betriebsfunk vs. LTE-PTT: was lohnt wann?",
          paragraphs: [
            "PMR446: anmelde- und gebührenfrei, max. 500 mW, Reichweite stadttypisch 300–800 m, ideal für Veranstaltungen, kleine Baustellen, Outdoor-Events in der Rheinaue oder im Hofgarten. Betriebsfunk (Einzelzuteilung BNetzA, 410–430 MHz oder 440–470 MHz): bis 5 W, ca. 5-fache Reichweite, jährliche Frequenzgebühr (typisch 100–500 € je Standort), ortsgebunden – lohnt für stationäre Betriebe (Industriestandorte in Beuel-Nord, Großlager Sankt Augustin).",
            "LTE-PTT (Push-to-Talk über Mobilfunk): deutschland-/weltweite Reichweite, monatliche SIM-Gebühr pro Gerät (ca. 10–25 €), Abhängigkeit von Mobilfunkabdeckung. Lohnt für verteilte Teams (Außendienst, Servicetechniker, Marathon-Streckenposten). Im Mietkreislauf am Standort Bonn führen wir PMR446 als Standard; Betriebsfunk und LTE-PTT auf Projektbasis.",
          ],
        },
        {
          h3: "CTCSS, DCS und virtuelle Kanaltrennung",
          paragraphs: [
            "PMR446 hat 16 physikalische Kanäle. Damit auf einem Kanal mehrere Gruppen parallel sprechen können, ohne sich gegenseitig zu hören, gibt es CTCSS (38 sub-audible Tonsignale) und DCS (83 digitale Codes). Beide öffnen den Lautsprecher nur, wenn der passende Sub-Code mitgesendet wird. Achtung: das schützt nur den Empfang – andere Gruppen können dich trotzdem hören und stören.",
            "Praktische Folge für Bonner Veranstaltungen: bei einer Großhochzeit mit getrennten Teams (Catering, Service, Sicherheit) belegen wir 3 verschiedene Kanäle, nicht 3 Sub-Codes auf einem Kanal – reduziert Funkchaos und Störungen erheblich.",
          ],
        },
        {
          h3: "Headset-Qualität: warum \"billig\" auf Dauer teuer wird",
          paragraphs: [
            "Konsumer-Headsets aus dem 10–30-€-Segment haben dünne Kabel, instabile PTT-Mechanik und schlechte Mikrofone. Auf einer 8-Stunden-Veranstaltung fallen sie typisch aus (Kabelbruch am Stecker), und das schwache Mikro überträgt Umgebungslärm statt Sprache. Profi-Headsets im 80–200-€-Segment haben verstärkte Kabel, Metall-PTT und Geräuschdämpfung.",
            "Wir vermieten am Standort Bonn nur Profi-Headsets – die langfristig günstigere Wahl, weil keine Ausfälle während der Veranstaltung. Bei besonders kritischen Setups (TV-Produktion, Konferenz mit Simultandolmetschern – typisch in WCCB und Plenarsaal) führen wir auch echte Intercom-Systeme mit kabelgebundener oder DECT-Anbindung.",
          ],
        },
        {
          h3: "Reichweiten in der Praxis: Beispiele aus Bonn",
          paragraphs: [
            "Beispiel 1: Hochzeit in einem Park-Pavillon der Rheinaue (200 × 100 m Gelände): PMR446 reicht problemlos vom Eingang bis zur Tanzfläche, Headsets für 6 Personen empfohlen. Beispiel 2: Firmen-Event im Post-Tower (41 Etagen): Betonwände dämpfen massiv, PMR446 bis 2 Etagen brauchbar – für das ganze Gebäude empfehlen wir DECT-Intercom mit Repeater oder LTE-PTT.",
            "Beispiel 3: Sicherheitsfunk auf einem Stadtfest in der Bonner Innenstadt (Münsterplatz, Marktplatz, 500 × 300 m, dichte Bebauung, viele Funkquellen): PMR446 funktioniert, aber wir empfehlen vorab einen Testtag mit den finalen Geräte-Positionen. Bei Großevents (Bonn Marathon, Rhein in Flammen, Pützchens Markt) lohnt sich Einzelzuteilung Betriebsfunk – wir vermitteln bei Bedarf.",
          ],
        },
        {
          h3: "DECT-Intercom: die unterschätzte Lösung für Bonner Tagungs-Locations",
          paragraphs: [
            "DECT (Digital Enhanced Cordless Telecommunications) arbeitet im 1880–1900-MHz-Band, ist anmeldefrei und in jedem Schnurlostelefon enthalten. Profi-Intercom-Systeme nutzen denselben Standard mit erweiterten Funktionen (Konferenz-Modus, Privacy-Channel, Headset-Anbindung). Vorteile: stabile Sprachqualität, gute Gebäudedurchdringung mit Repeater, Verschlüsselung ab Werk.",
            "Für Bonner Konferenz-Locations (WCCB, Maritim, Telekom-Forum, Universitätsclub), Hotelsäle und Industriehallen ist DECT-Intercom oft die professionellere Wahl als PMR446 – einfacher Aufbau (Basisstation an Steckdose, Headsets pairen automatisch), bis 8 simultane Gespräche pro Basisstation, Reichweite 50 m indoor, 300 m outdoor pro Basis. Wir führen DECT-Intercom-Sets am Standort Bonn und beraten zum passenden Setup unter 0228 504 660 61.",
          ],
        },
      ],
    },
  },

  // Mülheim und weitere Bonn-Tranchen folgen analog.
};

export function getCategoryExpertContent(
  locationId: string | undefined,
  categoryId: string | undefined,
): ExpertContent | null {
  if (!locationId || !categoryId) return null;
  return categoryExpertContent[locationId]?.[categoryId] ?? null;
}
