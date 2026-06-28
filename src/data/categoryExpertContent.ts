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
            "Stampfer (Vibrationsstampfer, „Frosch“, ca. 60–80 kg, schmale Platte) sind für bindige Böden in schmalen Gräben das Mittel der Wahl: hohe Schlagenergie, kleine Aufstandsfläche, Verdichtungstiefe bis ca. 70 cm in einer Schicht. Rüttelplatten verdichten flächig und sind bei rolligen Böden, Schotter und Pflaster überlegen. Für Hausanschluss- und Glasfasergräben mit Sand-Kies-Verfüllung greift man oft zu beiden Geräten: erst Stampfer am Rohr, dann Platte in der oberen Schicht. Beide Geräte führen wir am Hauptsitz Krefeld vor.",
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
            "Kleinere Vorwärts-Platten (≤ 130 kg) lassen sich zu zweit oder mit der Auffahrrampe in den Transporter heben. Ab ca. 200 kg ist eine Auffahrrampe oder ein Anhänger mit Auffahrbohlen Pflicht. Rüttelplatten dürfen für den Transport hochkant aufgerichtet werden – herstellerabhängig ist die Lage in der Bedienungsanleitung vorgeschrieben (meist „Lufthahn schließen / Kraftstoffhahn schließen“), sonst läuft Motoröl in den Brennraum. Bei Lieferung ab Hauptsitz Krefeld kümmern wir uns um eine ordnungsgemäße Ladungssicherung nach VDI 2700.",
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
            "Im privaten Bereich reicht oft die Faustregel: Wenn die Rüttelplatte nicht mehr einsinkt und der Boden „klingt“, ist die Lage verdichtet. Im gewerblichen Tiefbau ist das nicht ausreichend. Standardverfahren ist der statische Plattendruckversuch nach DIN 18134 (Lastplatte 300 mm Durchmesser, zwei Belastungszyklen, Ergebnis Ev1 und Ev2). Daraus wird das Verformungsmodul Ev2 abgeleitet, das in den ZTV E-StB als Abnahmekriterium dient.",
            "Schneller, aber weniger normativ, sind dynamische Verfahren wie der leichte Fallgewichtsversuch (Evd, „Zorn-Gerät“). Für die meisten kommunalen Tiefbauarbeiten am Niederrhein wird das Ev2 verlangt. Den Plattendruckversuch führen Tiefbauunternehmen oder Sachverständige durch; wir vermieten ausschließlich die Verdichtungsmaschine. Für eine erfolgreiche Abnahme entscheidet weniger die Maschinengröße als das saubere Lagenweise-Einbauen und der richtige Wassergehalt.",
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // ARBEITSBÜHNEN (Scheren-, Gelenkteleskop-, Anhängerbühnen)
    // Quellen:
    //   - DGUV Grundsatz 308-008 „Ausbildung und Beauftragung
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
            "Auf Gelenkteleskop- und Auslegerbühnen ist die Verwendung eines Auffanggurts (EN 361) mit kurzer Verbindungsleine (EN 354) und Falldämpfer (EN 355) Pflicht – Anschlagpunkt ist der gekennzeichnete Ring im Korb. Grund: Bei plötzlichem Hindernis-Kontakt kann der Bediener aus dem Korb katapultiert werden („Catapult Effect“). Bei Scherenbühnen ist eine PSAgA nicht zwingend vorgeschrieben, wenn die Bühne nicht verlassen wird und das Geländer intakt ist. Zusätzlich Helm mit Kinnriemen, S3-Schuhe, Warnschutz nach EN ISO 20471 im öffentlichen Verkehrsraum. PSAgA stellt der Arbeitgeber.",
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
            "Die plakative Zahl „14-Meter-Bühne“ ist die maximale Arbeitshöhe und entspricht der Plattformhöhe + 2 m angenommener Greifhöhe. Praktisch nutzbar ist die Plattformhöhe. Wichtiger als die Höhenzahl ist die Hüllkurve (Reichweitendiagramm): Sie zeigt, wie weit die Plattform bei jeder Höhe nach vorne und zur Seite reichen kann.",
            "Typisch: Eine 22-m-Anhängerbühne erreicht bei voller Höhe etwa 9 m seitlich, bei 12 m Höhe dagegen rund 13 m. Außerdem reduziert sich die Korblast mit zunehmender Auslage von z. B. 250 kg auf 120 kg. Wer einen Schornstein über einem 5-m-Anbau erreichen will, muss diese Werte vorher abgleichen – die größte Höhe nützt nichts, wenn die seitliche Reichweite nicht passt. Wir beraten am Standort Krefeld anhand des konkreten Aufgabenbildes (Skizze, Foto) zur passenden Hüllkurve.",
          ],
        },
        {
          h3: "Sicherheit im Korb: Catapult-Effekt, PSAgA und Notabsenkung",
          paragraphs: [
            "Der mit Abstand häufigste tödliche Unfall mit Hubarbeitsbühnen ist der „Catapult Effect“: Der Korb wird bei plötzlichem Aufprall (Hindernis, Stoß durch Fahrzeug) abrupt abgebremst, der ungesicherte Bediener wird über die Brüstung katapultiert. PSAgA mit kurzer Verbindungsleine (max. so lang, dass ein Fall über die Brüstung mechanisch unmöglich ist) verhindert das. Auf Gelenkteleskop- und Auslegerbühnen ist sie deshalb Pflicht.",
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
            "Drei Prüf-Ebenen sind zu unterscheiden: (1) Arbeitstägliche Sicht- und Funktionsprüfung durch den Bediener (Reifen, Hydraulik-Dichtigkeit, NOT-AUS, Notabsenkung, Sicherungsmittel) – Pflicht vor jeder Schicht. (2) Wiederkehrende Prüfung nach BetrSichV § 14 i. V. m. DGUV Grundsatz 308-002 mindestens jährlich durch eine befähigte Person – das ist die „UVV-Prüfung“, die wir bei jedem Mietgerät dokumentiert mitliefern. (3) Außerordentliche Prüfung nach Reparaturen, Umbauten oder Schäden.",
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
            "DIN VDE 0100-704 fordert für Baustellen einen separaten Baustromverteiler mit Fehlerstromschutzschalter (RCD/FI) ≤ 30 mA für alle Steckdosen ≤ 32 A. Hausanschlusssteckdosen erfüllen das in Bestandsbauten oft nicht – dann ist ein mobiler PRCD-S vorgeschaltet Pflicht. Verlängerungskabel müssen für den Außeneinsatz geeignet (H07RN-F oder H05RN-F) und auf Beschädigung geprüft sein. Wir vermieten passende Baustromverteiler und PRCD-S in der Kategorie „Kabel & Stromverteiler“.",
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
            "Die wichtigste Frage vor der Werkzeugmiete ist nicht „welche Marke“ – Hilti, Bosch, Makita und Co. liegen technisch eng beieinander – sondern die Werkzeugklasse passend zum Material und zum Energiebedarf. Beton stemmen mit einem normalen Bohrhammer SDS-plus ist mühsam und überlastet das Schlagwerk; umgekehrt ist ein SDS-max-Kombihammer für Dübellöcher überdimensioniert und schwierig zu führen.",
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
            "Standard sind je nach Klasse: 230 V / 16 A Schuko (kleine Geräte), CEE 16 A 3-phasig (5-polig, blau für 230 V, rot für 400 V), CEE 32 A 3-phasig (rot, 400 V), CEE 63 A 3-phasig. Bei größeren Aggregaten (>20 kVA) zusätzlich Klemmleisten zum Festanschluss durch Elektrofachkraft. Die Verbindung zum Baustromverteiler oder zur Verteilung im Haus muss DIN-VDE-konform durch eine Elektrofachkraft erfolgen, sobald nicht steckerfertig verbunden wird. Wir vermieten alle gängigen CEE-Kabel und Adapter in der Kategorie „Kabel & Stromverteiler“.",
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
            "Tagespreis je Modell tagesaktuell im Buchungsprozess. Zusätzlich: Diesel/Benzin (nach Rückgabe nach gefülltem Tank abgerechnet), bei Bedarf CEE-Verlängerungskabel, Adapter und Baustromverteiler aus der Kategorie „Kabel & Stromverteiler“. Wochenmiete entspricht typischerweise rund 5 Tagessätzen, Monatsmiete rund 15 – lohnt sich also bei längeren Baustellen oder Veranstaltungswochen.",
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
            "Schallgedämmte Aggregate („Soundproof“) erreichen LWA = 65–75 dB(A), in 7 m also 45–55 dB(A) – das hält den Richtwert ein. Für Veranstaltungen in Innenstadt-Lagen (Krefelder Burgmarkt, Bonner Rheinaue, Mülheimer MüGa) bevorraten wir bevorzugt schallgedämmte Modelle. Bei mehrtägigem Betrieb kann zusätzlich ein Lärmschutzgehäuse (Schallschutzkabine) sinnvoll sein; das organisieren wir auf Anfrage.",
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
            "Faustregel nach Astdurchmesser: Bis ca. 35 mm reichen Walzenhäcksler (leise, sogenannte „Leise-Häcksler“, ideal im Wohngebiet). Bis 45 mm sind Turbinen- bzw. Schneidwalzen-Geräte sinnvoll. Bis 75 mm und für Profi-Heckenrückschnitt greift man zu Benzin-Häckslern mit Hammerwerk. Im Krefelder Mietpark führen wir alle drei Klassen; der maximale Astdurchmesser steht in jedem Produktdatenblatt. Wichtig: Häcksler arbeiten an grünem Schnittgut deutlich besser als an trockenem – planbar nach dem Schnitt einsetzen.",
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
            "Bei Halbsperrung einer Straße über mehr als 50 m Länge ist nach RSA in der Regel eine mobile Lichtsignalanlage (LSA) Pflicht – bei kurzer Strecke kann auch eine Posten-Regelung oder eine Vorrang-Beschilderung (Z. 308 „Vorrang vor Gegenverkehr“) genehmigt werden. Welche Lösung möglich ist, regelt die verkehrsrechtliche Anordnung. Wir vermieten mobile Ampelanlagen mit Akku- und Solar-Versorgung in Krefeld inkl. Auf- und Abbau auf Wunsch.",
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
