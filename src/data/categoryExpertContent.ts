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
            "Privat – also auf dem eigenen, nicht öffentlich zugänglichen Grundstück – ist kein formaler Schein vorgeschrieben; eine sorgfältige Geräteeinweisung bekommst du bei der Übergabe in Krefeld. Sobald die Maschine gewerblich oder auf einer fremden Baustelle eingesetzt wird, fordert die DGUV-Regel 100-500 in Verbindung mit DGUV Grundsatz 308-009 einen Befähigungsnachweis ("Bedienerausweis Erdbaumaschinen"). Den stellen wir nicht aus – der Auftraggeber bzw. Arbeitgeber muss die Beauftragung dokumentieren. Wir prüfen das bei gewerblicher Vermietung im Buchungsprozess.",
        },
        {
          question: "Welche Anbaugeräte sind sinnvoll – und welche bekomme ich am Standort Krefeld?",
          answer:
            "Faustregel nach Aufgabe: Tieflöffel (400–600 mm) für Aushub und Pflanzgruben, Grabenräumlöffel (800–1.200 mm) für Profilierung und das saubere Ziehen von Gräben, Hydraulikhammer für Asphalt-, Beton- und Naturstein-Abbruch, Erdbohrer für Pfostengründungen und Zaunbau, Sortier- bzw. Greifschaufel für Abbruchmaterial und Rückbau. Am Hauptsitz Krefeld halten wir die gängigen Anbaugeräte zur Mit-Miete vor – die konkrete Aufnahmegröße (MS01, MS03, S30/40 etc.) findest du im Datenblatt der jeweiligen Maschine, damit Bagger und Anbaugerät garantiert zueinander passen.",
        },
        {
          question: "Wie schwer darf der Bagger sein, damit ich ihn mit dem PKW transportieren darf?",
          answer:
            "Maßgeblich sind FeV Anlage 9 und die zulässige Gesamtmasse von Zugfahrzeug + Anhänger. Mit Klasse B (alt: Klasse 3) sind 3.500 kg zulässige Gesamtmasse der Kombination nicht zu überschreiten. Mit B96 erhöht sich das auf 4.250 kg, mit BE auf 7.000 kg. Ein 1-Tonnen-Minibagger plus passender Baumaschinenanhänger liegt in der Regel im BE-Bereich. Wir verleihen am Hauptsitz Krefeld gebremste Baumaschinen- und Plateauanhänger – der jeweilige Eintrag "zulässige Stützlast" und "Gesamtgewicht" steht in jedem Anhänger-Datenblatt.",
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
            "Stampfer (Vibrationsstampfer, "Frosch", ca. 60–80 kg, schmale Platte) sind für bindige Böden in schmalen Gräben das Mittel der Wahl: hohe Schlagenergie, kleine Aufstandsfläche, Verdichtungstiefe bis ca. 70 cm in einer Schicht. Rüttelplatten verdichten flächig und sind bei rolligen Böden, Schotter und Pflaster überlegen. Für Hausanschluss- und Glasfasergräben mit Sand-Kies-Verfüllung greift man oft zu beiden Geräten: erst Stampfer am Rohr, dann Platte in der oberen Schicht. Beide Geräte führen wir am Hauptsitz Krefeld vor.",
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
            "Kleinere Vorwärts-Platten (≤ 130 kg) lassen sich zu zweit oder mit der Auffahrrampe in den Transporter heben. Ab ca. 200 kg ist eine Auffahrrampe oder ein Anhänger mit Auffahrbohlen Pflicht. Rüttelplatten dürfen für den Transport hochkant aufgerichtet werden – herstellerabhängig ist die Lage in der Bedienungsanleitung vorgeschrieben (meist "Lufthahn schließen / Kraftstoffhahn schließen"), sonst läuft Motoröl in den Brennraum. Bei Lieferung ab Hauptsitz Krefeld kümmern wir uns um eine ordnungsgemäße Ladungssicherung nach VDI 2700.",
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
            "Im privaten Bereich reicht oft die Faustregel: Wenn die Rüttelplatte nicht mehr einsinkt und der Boden "klingt", ist die Lage verdichtet. Im gewerblichen Tiefbau ist das nicht ausreichend. Standardverfahren ist der statische Plattendruckversuch nach DIN 18134 (Lastplatte 300 mm Durchmesser, zwei Belastungszyklen, Ergebnis Ev1 und Ev2). Daraus wird das Verformungsmodul Ev2 abgeleitet, das in den ZTV E-StB als Abnahmekriterium dient.",
            "Schneller, aber weniger normativ, sind dynamische Verfahren wie der leichte Fallgewichtsversuch (Evd, "Zorn-Gerät"). Für die meisten kommunalen Tiefbauarbeiten am Niederrhein wird das Ev2 verlangt. Den Plattendruckversuch führen Tiefbauunternehmen oder Sachverständige durch; wir vermieten ausschließlich die Verdichtungsmaschine. Für eine erfolgreiche Abnahme entscheidet weniger die Maschinengröße als das saubere Lagenweise-Einbauen und der richtige Wassergehalt.",
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
            "Auf Gelenkteleskop- und Auslegerbühnen ist die Verwendung eines Auffanggurts (EN 361) mit kurzer Verbindungsleine (EN 354) und Falldämpfer (EN 355) Pflicht – Anschlagpunkt ist der gekennzeichnete Ring im Korb. Grund: Bei plötzlichem Hindernis-Kontakt kann der Bediener aus dem Korb katapultiert werden ("Catapult Effect"). Bei Scherenbühnen ist eine PSAgA nicht zwingend vorgeschrieben, wenn die Bühne nicht verlassen wird und das Geländer intakt ist. Zusätzlich Helm mit Kinnriemen, S3-Schuhe, Warnschutz nach EN ISO 20471 im öffentlichen Verkehrsraum. PSAgA stellt der Arbeitgeber.",
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
            "Die plakative Zahl "14-Meter-Bühne" ist die maximale Arbeitshöhe und entspricht der Plattformhöhe + 2 m angenommener Greifhöhe. Praktisch nutzbar ist die Plattformhöhe. Wichtiger als die Höhenzahl ist die Hüllkurve (Reichweitendiagramm): Sie zeigt, wie weit die Plattform bei jeder Höhe nach vorne und zur Seite reichen kann.",
            "Typisch: Eine 22-m-Anhängerbühne erreicht bei voller Höhe etwa 9 m seitlich, bei 12 m Höhe dagegen rund 13 m. Außerdem reduziert sich die Korblast mit zunehmender Auslage von z. B. 250 kg auf 120 kg. Wer einen Schornstein über einem 5-m-Anbau erreichen will, muss diese Werte vorher abgleichen – die größte Höhe nützt nichts, wenn die seitliche Reichweite nicht passt. Wir beraten am Standort Krefeld anhand des konkreten Aufgabenbildes (Skizze, Foto) zur passenden Hüllkurve.",
          ],
        },
        {
          h3: "Sicherheit im Korb: Catapult-Effekt, PSAgA und Notabsenkung",
          paragraphs: [
            "Der mit Abstand häufigste tödliche Unfall mit Hubarbeitsbühnen ist der "Catapult Effect": Der Korb wird bei plötzlichem Aufprall (Hindernis, Stoß durch Fahrzeug) abrupt abgebremst, der ungesicherte Bediener wird über die Brüstung katapultiert. PSAgA mit kurzer Verbindungsleine (max. so lang, dass ein Fall über die Brüstung mechanisch unmöglich ist) verhindert das. Auf Gelenkteleskop- und Auslegerbühnen ist sie deshalb Pflicht.",
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
            "Drei Prüf-Ebenen sind zu unterscheiden: (1) Arbeitstägliche Sicht- und Funktionsprüfung durch den Bediener (Reifen, Hydraulik-Dichtigkeit, NOT-AUS, Notabsenkung, Sicherungsmittel) – Pflicht vor jeder Schicht. (2) Wiederkehrende Prüfung nach BetrSichV § 14 i. V. m. DGUV Grundsatz 308-002 mindestens jährlich durch eine befähigte Person – das ist die "UVV-Prüfung", die wir bei jedem Mietgerät dokumentiert mitliefern. (3) Außerordentliche Prüfung nach Reparaturen, Umbauten oder Schäden.",
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
            "DIN VDE 0100-704 fordert für Baustellen einen separaten Baustromverteiler mit Fehlerstromschutzschalter (RCD/FI) ≤ 30 mA für alle Steckdosen ≤ 32 A. Hausanschlusssteckdosen erfüllen das in Bestandsbauten oft nicht – dann ist ein mobiler PRCD-S vorgeschaltet Pflicht. Verlängerungskabel müssen für den Außeneinsatz geeignet (H07RN-F oder H05RN-F) und auf Beschädigung geprüft sein. Wir vermieten passende Baustromverteiler und PRCD-S in der Kategorie "Kabel & Stromverteiler".",
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
            "Die wichtigste Frage vor der Werkzeugmiete ist nicht "welche Marke" – Hilti, Bosch, Makita und Co. liegen technisch eng beieinander – sondern die Werkzeugklasse passend zum Material und zum Energiebedarf. Beton stemmen mit einem normalen Bohrhammer SDS-plus ist mühsam und überlastet das Schlagwerk; umgekehrt ist ein SDS-max-Kombihammer für Dübellöcher überdimensioniert und schwierig zu führen.",
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
            "Standard sind je nach Klasse: 230 V / 16 A Schuko (kleine Geräte), CEE 16 A 3-phasig (5-polig, blau für 230 V, rot für 400 V), CEE 32 A 3-phasig (rot, 400 V), CEE 63 A 3-phasig. Bei größeren Aggregaten (>20 kVA) zusätzlich Klemmleisten zum Festanschluss durch Elektrofachkraft. Die Verbindung zum Baustromverteiler oder zur Verteilung im Haus muss DIN-VDE-konform durch eine Elektrofachkraft erfolgen, sobald nicht steckerfertig verbunden wird. Wir vermieten alle gängigen CEE-Kabel und Adapter in der Kategorie "Kabel & Stromverteiler".",
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
            "Tagespreis je Modell tagesaktuell im Buchungsprozess. Zusätzlich: Diesel/Benzin (nach Rückgabe nach gefülltem Tank abgerechnet), bei Bedarf CEE-Verlängerungskabel, Adapter und Baustromverteiler aus der Kategorie "Kabel & Stromverteiler". Wochenmiete entspricht typischerweise rund 5 Tagessätzen, Monatsmiete rund 15 – lohnt sich also bei längeren Baustellen oder Veranstaltungswochen.",
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
            "Schallgedämmte Aggregate ("Soundproof") erreichen LWA = 65–75 dB(A), in 7 m also 45–55 dB(A) – das hält den Richtwert ein. Für Veranstaltungen in Innenstadt-Lagen (Krefelder Burgmarkt, Bonner Rheinaue, Mülheimer MüGa) bevorraten wir bevorzugt schallgedämmte Modelle. Bei mehrtägigem Betrieb kann zusätzlich ein Lärmschutzgehäuse (Schallschutzkabine) sinnvoll sein; das organisieren wir auf Anfrage.",
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
            "Faustregel nach Astdurchmesser: Bis ca. 35 mm reichen Walzenhäcksler (leise, sogenannte "Leise-Häcksler", ideal im Wohngebiet). Bis 45 mm sind Turbinen- bzw. Schneidwalzen-Geräte sinnvoll. Bis 75 mm und für Profi-Heckenrückschnitt greift man zu Benzin-Häckslern mit Hammerwerk. Im Krefelder Mietpark führen wir alle drei Klassen; der maximale Astdurchmesser steht in jedem Produktdatenblatt. Wichtig: Häcksler arbeiten an grünem Schnittgut deutlich besser als an trockenem – planbar nach dem Schnitt einsetzen.",
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
            "Bei Halbsperrung einer Straße über mehr als 50 m Länge ist nach RSA in der Regel eine mobile Lichtsignalanlage (LSA) Pflicht – bei kurzer Strecke kann auch eine Posten-Regelung oder eine Vorrang-Beschilderung (Z. 308 "Vorrang vor Gegenverkehr") genehmigt werden. Welche Lösung möglich ist, regelt die verkehrsrechtliche Anordnung. Wir vermieten mobile Ampelanlagen mit Akku- und Solar-Versorgung in Krefeld inkl. Auf- und Abbau auf Wunsch.",
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
            "Für nicht-öffentliche Privatfeiern in begrenzter Größe gibt es keinen formalen Befähigungsnachweis – der Vermieter weist in die Geräte ein. Sobald eine Versammlungsstätte nach SBauVO NRW Teil 5 betroffen ist (über 200 Besucher in Räumen, über 1.000 im Freien) oder eine gewerbliche Veranstaltung mit szenischer Darstellung stattfindet, greift die DGUV Vorschrift 17/18 – dann ist eine "Verantwortliche Person für Veranstaltungstechnik" erforderlich. Bei Firmenevents in Krefelder Locations klären wir gemeinsam mit dem Hausherrn, was nötig ist.",
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
            "In Locations mit Rauchwarnmeldern oder aufgeschalteter Brandmeldeanlage (BMA) muss die Anlage vor Einsatz von Nebel/Haze entweder freigegeben (Hausmeister/Wachdienst informiert) oder im betroffenen Bereich abgeschaltet werden – sonst droht Falschalarm und Feuerwehr-Einsatz auf Kosten des Veranstalters. Wir weisen darauf hin und stellen auf Wunsch Hinweis-Schilder "Künstlicher Nebel im Einsatz" bereit.",
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
            "Ein klassischer Fehler ist "zu viel Effekt, zu wenig Funktion": Wenn die Tanzfläche nur noch von Movings beleuchtet wird, sehen Gäste sich gegenseitig kaum. Faustregel: Funktionslicht macht ca. 60 % des Bedarfs aus, Atmosphäre 30 %, Effekt 10 %. Am Standort Krefeld stellen wir Pakete entsprechend zusammen statt nur Geräte zu zählen.",
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
            "Wir geben am Standort Krefeld zu jedem Stativ und jedem Truss-Set ein Datenblatt mit max. Last und Aufbauanleitung mit. Bei komplexen Hängungen liefern wir Truss aus dem Sortiment "Traversen & Rigging" passend dazu – inklusive Stahlseilen, Kettenzügen (manuell oder elektrisch) und Lastverteilung.",
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
            "Für Outdoor in Wohnnähe gilt die TA Lärm: tagsüber 60 dB(A), nachts 45 dB(A) Richtwert in allgemeinen Wohngebieten. Das ist sehr leise – bereits ein normales Gespräch erreicht 60 dB. Für Sommerfeste und Hochzeiten im Freien gibt es die Möglichkeit "seltener Ereignisse" (max. 10 pro Jahr und Ort). Wir empfehlen, dies frühzeitig mit dem Ordnungsamt Krefeld abzustimmen.",
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
            "Auch bei kleinen Events ist Monitoring wichtig: Trauredner braucht eigene Lautsprecher Richtung Publikum – nicht in den Rücken; ein Brautpaar mit Funkmikro hört sich selbst nicht, wenn der PA-Hauptklang weit entfernt steht. Lösungen: kleine Aktiv-Monitore (8–10\") als Sidefill, In-Ear-Monitorstrecken für Bands (DECT- oder UHF-basiert), reine Bestätigungs-Lautsprecher ("Confidence Speaker") am Rednerpult.",
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
            "Ab einer Absturzhöhe von 1 m fordert die DGUV-Vorschrift Geländer mit Höhe mindestens 1,10 m, Mittelholm, Fußleiste. Bei Bühnen mit 80 cm Höhe ist Geländer noch optional, ab 100 cm Pflicht. Im sichtbaren Frontbereich der Bühne (zum Publikum gerichtet) entfällt das Geländer üblicherweise – dort ist die Absturzkante klar erkennbar und Teil der "künstlerischen Nutzung". Seiten und Rückseite werden mit Geländer abgesichert.",
        },
        {
          question: "Ist eine Modulbühne ein "fliegender Bau" nach SBauVO NRW?",
          answer:
            ""Fliegende Bauten" sind nach SBauVO NRW Teil 5 bauliche Anlagen, die wiederholt aufgestellt werden und Personenzugang bieten. Unsere Standard-Modulbühnen bis ca. 6 × 4 m mit Höhen bis 80 cm und ohne Überdachung gelten in der Regel als "untergeordnete Aufstellung" und benötigen keine separate Ausführungsgenehmigung. Sobald Tribünen über 100 m² Fläche, Höhen über 1,5 m oder Überdachungen ins Spiel kommen, ist eine Prüfbuch-Pflicht und Sachverständigen-Abnahme möglich.",
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
            "Ja. Am Hauptsitz Krefeld führen wir Bühne, Beleuchtung, Beschallung, Traversen, Rigging, Stromverteilung und Eventzelte aus einem Lager. Das spart Logistik (eine Anlieferung, ein Ansprechpartner) und stellt sicher, dass technische Schnittstellen passen (Truss-Hängung über Bühne mit korrekter Höhe und Statik, Stromplan abgestimmt, Audio-Hängung außerhalb der Lichtstrahlen). Wir kalkulieren Pakete "Bühne + Technik" gerne als Komplettangebot.",
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
            "Privat (nicht-öffentlich, kein gewerblicher Kontext): ja, mit Geräteeinweisung an unserem Standort Krefeld. Gewerblich oder bei öffentlichen Veranstaltungen greift DGUV Vorschrift 17/18: Aufbau über Personenköpfe darf nur durch sachkundige Personen erfolgen ("Verantwortlicher für Veranstaltungstechnik" mit IHK-Abschluss oder vergleichbar). Für Hochzeiten und kleine Firmen-Events bauen wir auf Wunsch selbst auf oder vermitteln einen lokalen IHK-Veranstaltungsmeister im Raum Krefeld.",
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
            "Für Krefelder Setups planen wir Hängung in Lastpunkten – nicht "auf gut Glück". Schwere Geräte (Moving Heads, große Lautsprecher) hängen direkt unter einem Anschlagpunkt, leichte Wash-Lichter dazwischen. Das halbiert die effektive Biegelast und ist die professionelle Vorgehensweise.",
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
            "Manuelle Kettenzüge (Stirnradflaschenzug) heben mit Handkette – günstig, langsam, max. ca. 250 kg, für Trauerhöhungen und kleine Lasten. Elektro-Kettenzüge sind die Arbeitspferde der Veranstaltungsbranche: 250 kg, 500 kg, 1.000 kg WLL. Im Veranstaltungsbau über Personenköpfen muss der Kettenzug in der Ausführung "D8+" (mit zusätzlicher Sicherungsbremse, 10-facher Sicherheit) ausgeführt sein – "D8" reicht nur für Lasten, die nicht über Personen geführt werden.",
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
          question: "Reichweite – stimmen die "bis zu 10 km" auf der Verpackung?",
          answer:
            "Die Herstellerangaben "bis zu 10 km Reichweite" gelten unter Idealbedingungen (freie Sicht, See, Wüste, beide Geräte auf Berggipfeln). In der Praxis erreicht PMR446 in der Stadt 300–800 m, im Freien mit Bebauung 1–2 km, im Wald oder Tal entsprechend weniger. Für größere Reichweiten (Festival mit 1 km Länge, große Baustelle, Industrieanlage) braucht es Einzelzuteilung im Betriebsfunk – aufpreispflichtig, aber bis zu 5 W Sendeleistung erlaubt.",
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
          h3: "Headset-Qualität: warum "billig" auf Dauer teuer wird",
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
            "Für reine private Nutzung auf Privatgrund ohne öffentlichen Zugang sind die in Krefeld üblichen Garten-Partyzelte (bis 75 m²) regelmäßig genehmigungsfrei. Sobald die Veranstaltung öffentlich zugänglich ist oder das Zelt eine Grundfläche über 75 m² hat (§ 73 BauO NRW i. V. m. der Musterrichtlinie Fliegende Bauten), ist eine Ausführungsgenehmigung ("Prüfbuch nach DIN EN 13782/13814") erforderlich. Für unsere Mietzelte stellen wir auf Anfrage die Herstellerunterlagen (Standsicherheitsnachweis, Brandschutznachweis) zur Verfügung – die Genehmigung muss der Veranstalter beim Bauordnungsamt der Stadt Krefeld einholen.",
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
            "Ein "Fliegender Bau" im Sinne des § 73 BauO NRW ist ein Bau, der wiederholt aufgestellt und zerlegt wird – dazu zählen Partyzelte ab 75 m² Grundfläche, Bühnen ab 5 m Tiefe und alle Tribünen. Für solche Bauten verlangt die Musterrichtlinie über den Bau und Betrieb Fliegender Bauten (MFlBauR 2015) eine Ausführungsgenehmigung. Diese wird vom Hersteller einmal beantragt, in das Prüfbuch eingetragen und ist bundesweit gültig.",
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
            "Bei Versammlungsstätten nach SBauVO NRW Teil 5 (ab 200 Personen in Räumen, ab 1.000 Personen im Freien) müssen Planen, Vorhänge und Dekorationsmaterialien mindestens "schwer entflammbar" sein – das entspricht der alten DIN 4102-1 Klasse B1 bzw. der EU-Brandklasse C-s3,d0 nach DIN EN 13501-1. Maßgeblich ist der Nachweis über das Materialdatenblatt mit Prüfzeugnis.",
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
            "Kalk-Natron-Glas ist der Standard im Eventbereich: robust, spülmaschinenfest, lebensmittelecht, optisch ansprechend, günstig in der Wiederbeschaffung. Kristallglas (Bleikristall oder bleifreies "Crystal") ist optisch hochwertiger (höherer Brechungsindex, mehr Brillanz), aber empfindlicher und teurer – wird im Mietkreislauf selten eingesetzt. Polycarbonat (PC) ist bruchsicher, optisch sehr nah an Glas, lebensmittelecht – ideal für Pool, Garten, Kinder, Outdoor-Events ohne befestigte Flächen.",
            "Für klassische Krefelder Hochzeiten setzen wir Kalk-Natron-Echtglas ein – die gewohnte Optik und Haptik. Polycarbonat-Sets bieten wir für Außenbereiche und besondere Anlässe (Open-Air, Familienfeier mit Kindern, Yacht) an.",
          ],
        },
        {
          h3: "Besteck: 18/10, 18/0 und Stahlsorten im Vergleich",
          paragraphs: [
            ""18/10" bezeichnet die Legierung: 18 % Chrom (Korrosionsschutz) und 10 % Nickel (Glanz, Bearbeitbarkeit) – Werkstoff X5CrNi18-10, der Standard für Hotelbesteck. "18/0" ist nickelfrei, magnetisch, etwas matter – günstiger, aber für Bankett-Hochzeiten unüblich. Reine Edelstahlsorten ohne Chrom sind nicht spülmaschinenfest.",
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
            "Ja. Sämtliche von uns vermieteten Hüpfburgen erfüllen die DIN EN 14960 "Aufblasbare Spielgeräte – Sicherheitsanforderungen und Prüfverfahren". Diese Norm regelt u. a. Stoßdämpfung der Aufprallflächen, max. Fallhöhen, Materialfestigkeit, Verankerungspunkte, Anzahl und Größe der Notausgänge sowie das jährliche Prüfintervall. Wir lassen jede Hüpfburg jährlich durch einen Sachkundigen prüfen und führen das Prüfprotokoll mit.",
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
            "Klassische Veranstaltungs-Hüpfburgen sind nicht "aufblasen und zumachen" – sie werden über ein kontinuierlich laufendes Gebläse (Radiallüfter oder Axiallüfter) auf Druck gehalten, weil sie kein luftdichtes System sind (Nähte, Reißverschlüsse, Eingangsöffnung lassen ständig etwas Luft entweichen). Stoppt das Gebläse, fällt die Hüpfburg innerhalb von 20–60 Sekunden in sich zusammen – das ist gewollt (sicherer als plötzliches Aufreißen).",
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
            "Standard ist Tempo 80 km/h auf Autobahn und außerorts. Mit der "Tempo-100-Plakette" nach Anlage zu § 18 Abs. 5 StVO sind 100 km/h zulässig – dafür muss der Wohnwagen bestimmte Bedingungen erfüllen: max. 3,5 t zulässige Gesamtmasse, geeignete Reifen (Geschwindigkeitsindex mindestens L = 120 km/h), hydraulische Stoßdämpfer, Antischlingerkupplung oder ESC, Reifenalter max. 6 Jahre. Außerdem muss das Zugfahrzeug mit mindestens 1,1-facher Leermasse über der Wohnwagen-Gesamtmasse liegen. Wir geben bei der Übergabe den aktuellen Plakettenstatus an.",
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
            "Wohnwagen-Gespanne neigen ab ca. 90 km/h zur sogenannten "Pendelschwingung" – der Wohnwagen schaukelt seitlich, das Zugfahrzeug folgt mit. Ursache: ungleiche Beladung (zu viel Heck-Last), zu niedrige Stützlast, schlechte Reifen, Seitenwind. Gegenmaßnahmen: Schwere Last (z. B. Wasserkanister) im Wohnwagen über der Achse platzieren, Stützlast auf 4 % des Gesamtgewichts einstellen, Antischlingerkupplung (AKS) oder ESC nutzen, Geschwindigkeit anpassen.",
            "Antischlingerkupplungen (z. B. AL-KO AKS 3004) dämpfen die Pendelbewegung mechanisch und sind heute Standard bei modernen Wohnwagen. ESC (Elektronisches Schlingerstabilisierungs-System) erkennt beginnendes Pendeln und bremst gezielt einzelne Räder ab. Unsere Mietwohnwagen sind mit AKS und je nach Modell mit ESC ausgestattet.",
          ],
        },
        {
          h3: "Tempo 100 in Deutschland: die Plakette und ihre Anforderungen",
          paragraphs: [
            "Die "100-km/h-Plakette" wird von einer Prüforganisation (TÜV, DEKRA, GTÜ) ausgestellt, wenn der Wohnwagen alle Voraussetzungen erfüllt: max. 3,5 t zul. Gesamtmasse, Reifen mit Geschwindigkeitsindex L (120 km/h) oder höher und max. 6 Jahre alt, hydraulische Stoßdämpfer in Ordnung, AKS oder ESC vorhanden. Zusätzlich gilt: Leermasse des Zugfahrzeugs ≥ 1,1 × zul. Gesamtmasse des Wohnwagens (bei ESC entfällt diese Bedingung).",
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
