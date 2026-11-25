// Einzige Quelle für Titel, Meta-Text, Überschriften und Erklärtexte der Rechner-Seiten.
// Wird von der Seite (Helmet) und vom statischen Prerender genutzt, damit beides übereinstimmt.
// Alle Aussagen entsprechen der Rechenlogik in src/lib/dryingCalculator.ts und src/lib/powerCalculator.ts.
export const TOOLS_INDEX_SEO = {
  path: "/tools",
  title: "Rechner & Tools für Bau und Trocknung | SLT Rental",
  description: "Kostenlose Online-Rechner für Bautrocknung und Baustrom: Gerätebedarf, Mietdauer und passende Mietgeräte in Krefeld, Bonn und Mülheim an der Ruhr.",
  h1: "Rechner & Tools für Baustelle und Trocknung",
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
} as const;
export type ToolSlug = keyof typeof TOOL_SEO;
