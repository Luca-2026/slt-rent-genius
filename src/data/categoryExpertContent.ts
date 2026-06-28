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
            "Stampfer (Vibrationsstampfer, „Frosch", ca. 60–80 kg, schmale Platte) sind für bindige Böden in schmalen Gräben das Mittel der Wahl: hohe Schlagenergie, kleine Aufstandsfläche, Verdichtungstiefe bis ca. 70 cm in einer Schicht. Rüttelplatten verdichten flächig und sind bei rolligen Böden, Schotter und Pflaster überlegen. Für Hausanschluss- und Glasfasergräben mit Sand-Kies-Verfüllung greift man oft zu beiden Geräten: erst Stampfer am Rohr, dann Platte in der oberen Schicht. Beide Geräte führen wir am Hauptsitz Krefeld vor.",
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
            "Kleinere Vorwärts-Platten (≤ 130 kg) lassen sich zu zweit oder mit der Auffahrrampe in den Transporter heben. Ab ca. 200 kg ist eine Auffahrrampe oder ein Anhänger mit Auffahrbohlen Pflicht. Rüttelplatten dürfen für den Transport hochkant aufgerichtet werden – herstellerabhängig ist die Lage in der Bedienungsanleitung vorgeschrieben (meist „Lufthahn schließen / Kraftstoffhahn schließen"), sonst läuft Motoröl in den Brennraum. Bei Lieferung ab Hauptsitz Krefeld kümmern wir uns um eine ordnungsgemäße Ladungssicherung nach VDI 2700.",
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
            "Im privaten Bereich reicht oft die Faustregel: Wenn die Rüttelplatte nicht mehr einsinkt und der Boden „klingt", ist die Lage verdichtet. Im gewerblichen Tiefbau ist das nicht ausreichend. Standardverfahren ist der statische Plattendruckversuch nach DIN 18134 (Lastplatte 300 mm Durchmesser, zwei Belastungszyklen, Ergebnis Ev1 und Ev2). Daraus wird das Verformungsmodul Ev2 abgeleitet, das in den ZTV E-StB als Abnahmekriterium dient.",
            "Schneller, aber weniger normativ, sind dynamische Verfahren wie der leichte Fallgewichtsversuch (Evd, „Zorn-Gerät"). Für die meisten kommunalen Tiefbauarbeiten am Niederrhein wird das Ev2 verlangt. Den Plattendruckversuch führen Tiefbauunternehmen oder Sachverständige durch; wir vermieten ausschließlich die Verdichtungsmaschine. Für eine erfolgreiche Abnahme entscheidet weniger die Maschinengröße als das saubere Lagenweise-Einbauen und der richtige Wassergehalt.",
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
            "Auf Gelenkteleskop- und Auslegerbühnen ist die Verwendung eines Auffanggurts (EN 361) mit kurzer Verbindungsleine (EN 354) und Falldämpfer (EN 355) Pflicht – Anschlagpunkt ist der gekennzeichnete Ring im Korb. Grund: Bei plötzlichem Hindernis-Kontakt kann der Bediener aus dem Korb katapultiert werden („Catapult Effect"). Bei Scherenbühnen ist eine PSAgA nicht zwingend vorgeschrieben, wenn die Bühne nicht verlassen wird und das Geländer intakt ist. Zusätzlich Helm mit Kinnriemen, S3-Schuhe, Warnschutz nach EN ISO 20471 im öffentlichen Verkehrsraum. PSAgA stellt der Arbeitgeber.",
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
            "Die plakative Zahl „14-Meter-Bühne" ist die maximale Arbeitshöhe und entspricht der Plattformhöhe + 2 m angenommener Greifhöhe. Praktisch nutzbar ist die Plattformhöhe. Wichtiger als die Höhenzahl ist die Hüllkurve (Reichweitendiagramm): Sie zeigt, wie weit die Plattform bei jeder Höhe nach vorne und zur Seite reichen kann.",
            "Typisch: Eine 22-m-Anhängerbühne erreicht bei voller Höhe etwa 9 m seitlich, bei 12 m Höhe dagegen rund 13 m. Außerdem reduziert sich die Korblast mit zunehmender Auslage von z. B. 250 kg auf 120 kg. Wer einen Schornstein über einem 5-m-Anbau erreichen will, muss diese Werte vorher abgleichen – die größte Höhe nützt nichts, wenn die seitliche Reichweite nicht passt. Wir beraten am Standort Krefeld anhand des konkreten Aufgabenbildes (Skizze, Foto) zur passenden Hüllkurve.",
          ],
        },
        {
          h3: "Sicherheit im Korb: Catapult-Effekt, PSAgA und Notabsenkung",
          paragraphs: [
            "Der mit Abstand häufigste tödliche Unfall mit Hubarbeitsbühnen ist der „Catapult Effect": Der Korb wird bei plötzlichem Aufprall (Hindernis, Stoß durch Fahrzeug) abrupt abgebremst, der ungesicherte Bediener wird über die Brüstung katapultiert. PSAgA mit kurzer Verbindungsleine (max. so lang, dass ein Fall über die Brüstung mechanisch unmöglich ist) verhindert das. Auf Gelenkteleskop- und Auslegerbühnen ist sie deshalb Pflicht.",
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
            "Drei Prüf-Ebenen sind zu unterscheiden: (1) Arbeitstägliche Sicht- und Funktionsprüfung durch den Bediener (Reifen, Hydraulik-Dichtigkeit, NOT-AUS, Notabsenkung, Sicherungsmittel) – Pflicht vor jeder Schicht. (2) Wiederkehrende Prüfung nach BetrSichV § 14 i. V. m. DGUV Grundsatz 308-002 mindestens jährlich durch eine befähigte Person – das ist die „UVV-Prüfung", die wir bei jedem Mietgerät dokumentiert mitliefern. (3) Außerordentliche Prüfung nach Reparaturen, Umbauten oder Schäden.",
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
            "DIN VDE 0100-704 fordert für Baustellen einen separaten Baustromverteiler mit Fehlerstromschutzschalter (RCD/FI) ≤ 30 mA für alle Steckdosen ≤ 32 A. Hausanschlusssteckdosen erfüllen das in Bestandsbauten oft nicht – dann ist ein mobiler PRCD-S vorgeschaltet Pflicht. Verlängerungskabel müssen für den Außeneinsatz geeignet (H07RN-F oder H05RN-F) und auf Beschädigung geprüft sein. Wir vermieten passende Baustromverteiler und PRCD-S in der Kategorie „Kabel & Stromverteiler".",
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
            "Die wichtigste Frage vor der Werkzeugmiete ist nicht „welche Marke" – Hilti, Bosch, Makita und Co. liegen technisch eng beieinander – sondern die Werkzeugklasse passend zum Material und zum Energiebedarf. Beton stemmen mit einem normalen Bohrhammer SDS-plus ist mühsam und überlastet das Schlagwerk; umgekehrt ist ein SDS-max-Kombihammer für Dübellöcher überdimensioniert und schwierig zu führen.",
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
            "Standard sind je nach Klasse: 230 V / 16 A Schuko (kleine Geräte), CEE 16 A 3-phasig (5-polig, blau für 230 V, rot für 400 V), CEE 32 A 3-phasig (rot, 400 V), CEE 63 A 3-phasig. Bei größeren Aggregaten (>20 kVA) zusätzlich Klemmleisten zum Festanschluss durch Elektrofachkraft. Die Verbindung zum Baustromverteiler oder zur Verteilung im Haus muss DIN-VDE-konform durch eine Elektrofachkraft erfolgen, sobald nicht steckerfertig verbunden wird. Wir vermieten alle gängigen CEE-Kabel und Adapter in der Kategorie „Kabel & Stromverteiler".",
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
            "Tagespreis je Modell tagesaktuell im Buchungsprozess. Zusätzlich: Diesel/Benzin (nach Rückgabe nach gefülltem Tank abgerechnet), bei Bedarf CEE-Verlängerungskabel, Adapter und Baustromverteiler aus der Kategorie „Kabel & Stromverteiler". Wochenmiete entspricht typischerweise rund 5 Tagessätzen, Monatsmiete rund 15 – lohnt sich also bei längeren Baustellen oder Veranstaltungswochen.",
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
            "Schallgedämmte Aggregate („Soundproof") erreichen LWA = 65–75 dB(A), in 7 m also 45–55 dB(A) – das hält den Richtwert ein. Für Veranstaltungen in Innenstadt-Lagen (Krefelder Burgmarkt, Bonner Rheinaue, Mülheimer MüGa) bevorraten wir bevorzugt schallgedämmte Modelle. Bei mehrtägigem Betrieb kann zusätzlich ein Lärmschutzgehäuse (Schallschutzkabine) sinnvoll sein; das organisieren wir auf Anfrage.",
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
