// Einzige Quelle für Titel, Meta-Text, Überschriften und Erklärtexte der Rechner-Seiten.
// Wird von der Seite (Helmet) und vom statischen Prerender genutzt, damit beides übereinstimmt.
// Alle Aussagen entsprechen der Rechenlogik in src/lib/dryingCalculator.ts und src/lib/powerCalculator.ts.
export const TOOLS_INDEX_SEO = {
  path: "/tools",
  title: "Rechner & Tools: Aushub, Baustrom, Trocknung | SLT Rental",
  description: "Kostenlose Online-Rechner für Erdaushub, Baustrom und Bautrocknung: Erdmenge, Gerätebedarf und passende Mietgeräte in Krefeld, Bonn und Mülheim an der Ruhr.",
  h1: "Rechner & Tools für Erdaushub, Baustelle und Trocknung",
  intro: "Kostenlose Rechner mit Richtwerten für deine Planung – mit passenden Mietgeräten an deinem Standort zum direkten Anfragen.",
};

export const TOOL_SEO = {
  "bautrockner-rechner": {
    title: "Bautrockner-Rechner: Anzahl & Dauer berechnen | SLT Rental",
    description: "Raummaße eingeben und Anzahl der Bautrockner, Trocknungsdauer und Mietpreis-Richtwert erhalten. Turbolüfter verkürzen die Trocknung um ca. 15 %.",
    h1: "Bautrockner-Rechner: Wie viele Bautrockner brauche ich?",
    intro: "Berechne kostenlos, wie viele Bautrockner du für deinen Raum brauchst, wie lange die Trocknung ungefähr dauert und was die Miete kostet.",
    sections: [
      { h2: "So rechnet der Bautrockner-Rechner", text: "Aus Länge und Breite ergibt sich die Raumfläche. Bis 20 m² genügt ein kleiner Bautrockner, darüber empfehlen wir je angefangene 50 m² einen großen Bautrockner." },
      { h2: "Wie lange dauert die Trocknung?", text: "Als Richtwert rechnen wir mit 14 bis 21 Tagen bei feuchten Räumen und 21 bis 28 Tagen nach stehendem Wasser. Die tatsächliche Dauer hängt von Bausubstanz, Temperatur und Durchfeuchtung ab." },
      { h2: "Turbolüfter verkürzen die Trocknung", text: "Ein Turbolüfter je Bautrockner sorgt für Luftumwälzung im Raum und verkürzt die Trocknungszeit um ca. 15 %." },
    ],
  },
  "baustromrechner": {
    title: "Baustromrechner: Verteiler & Aggregat berechnen | SLT Rental",
    description: "Verbraucher eintragen, Leistungsbedarf in kVA und Ampere berechnen und passenden Baustromverteiler, CEE-Kabel und Stromaggregat mieten.",
    h1: "Baustromrechner: Strombedarf der Baustelle berechnen",
    intro: "Trage deine Geräte ein und erhalte Leistungsbedarf, passenden Baustromverteiler, CEE-Kabel und bei Bedarf ein Stromaggregat zur Miete.",
    sections: [
      { h2: "So rechnet der Baustromrechner", text: "Die Leistung aller Verbraucher wird addiert, als wären alle Geräte gleichzeitig in Betrieb. Mit einem Leistungsfaktor von 0,8 ergibt sich die Scheinleistung in kVA, daraus der Strom bei 400 V." },
      { h2: "Baustromverteiler, CEE-Kabel und Aggregat", text: "Der Rechner schlägt den kleinsten ausreichenden Baustromverteiler und CEE-Kabel in den am Standort verfügbaren Längen vor. Ohne Netzanschluss empfiehlt er das kleinste ausreichende Stromaggregat." },
      { h2: "Hinweis zur Sicherheit", text: "Die Ergebnisse sind Richtwerte. Anschluss und Prüfung der Baustromversorgung gehören in die Hände einer Elektrofachkraft." },
    ],
  },
  "aushubrechner": {
    title: "Aushubrechner: Erdaushub & Baggerbedarf berechnen | SLT Rental",
    description: "Berechne Erdaushub in m³, Erdgewicht und Transportbedarf. Finde passende Bagger, Dumper und Mietmaschinen in Krefeld, Bonn und Mülheim.",
    h1: "Aushubrechner – Erdaushub, Erdmenge und Baggerbedarf berechnen",
    intro: "Berechne kostenlos, wie viel Erde bei deinem Bauprojekt anfällt, welche Baumaschinen du benötigst und wie du deinen Erdaushub effizient bewegst.",
    sections: [
      { h2: "Wie berechnet man Erdaushub?", text: "Fläche mal Aushubtiefe ergibt das Volumen im gewachsenen Zustand. Beispiel: 40 m² Terrasse mit 30 cm Tiefe ergeben 12 m³. Ein Graben von 20 m Länge, 40 cm Breite und 80 cm Tiefe ergibt 6,4 m³, ein runder Pool mit 4 m Durchmesser und 1,5 m Tiefe rund 18,85 m³." },
      { h2: "Wie viel wiegt ein Kubikmeter Erde?", text: "Gewachsener Boden wiegt je nach Art und Feuchte etwa 1,4 bis 1,9 Tonnen pro Kubikmeter. Ohne bekannte Bodenart rechnet der Rechner mit einem allgemeinen Planungswert von 1,6 t/m³ – 12 m³ entsprechen dann etwa 19,2 Tonnen." },
      { h2: "Was ist der Auflockerungsfaktor?", text: "Ausgehobene Erde nimmt mehr Platz ein als im Boden. Bei 20 % Auflockerung werden aus 12 m³ gewachsenem Boden 14,4 m³ loses Material. Das Gewicht bleibt dabei gleich – nur das Volumen wächst." },
      { h2: "Welchen Minibagger benötige ich?", text: "Entscheidend sind Zufahrtsbreite, Grabtiefe und Menge. Der Rechner plant 20 cm Bewegungsspielraum zur schmalsten Maschinenbreite ein und nutzt nur 80 % der angegebenen Grabtiefe. Für größere Mengen empfiehlt er schwerere Maschinen, weil sie schneller arbeiten." },
      { h2: "Wie viele Dumperfahrten sind erforderlich?", text: "Je Fahrt zählt der kleinere Wert aus Muldenvolumen mal Füllgrad und Nutzlast geteilt durch die Dichte des losen Materials. Das aufgelockerte Volumen geteilt durch diese Menge ergibt die Fahrten, aufgerundet." },
      { h2: "Was ist bei Baugruben und Abtransport zu beachten?", text: "Ab 1,25 m Tiefe sind nach DIN 4124 Böschung oder Verbau vorgeschrieben. Vor dem Graben Leitungspläne einholen, Abstand zu Fundamenten halten und Erdaushub ordnungsgemäß entsorgen. Bei komplexen Erdarbeiten beraten wir dich persönlich." },
      { h2: "Warum einen Minibagger mieten?", text: "Du bekommst die passende Maschinengröße genau für die Dauer deines Projekts, ohne Anschaffung, Wartung und Lagerung – bei SLT Rental in Krefeld, Bonn und Mülheim an der Ruhr." },
    ],
  },
} as const;
export type ToolSlug = keyof typeof TOOL_SEO;

/** Pfad des freigegebenen Aushubrechner-Vorschaubilds (1200×630) – erst eintragen, wenn die Datei im Projekt liegt. */
export const AUSHUB_OG_IMAGE_PATH = "/images/og/aushubrechner-1200x630.png";
/** Eigene Vorschaubilder je Rechner (absolut); fehlt ein Eintrag, gilt das Standardbild. */
export const TOOL_OG_IMAGES: Partial<Record<keyof typeof TOOL_SEO, { url: string; alt: string }>> = {};
