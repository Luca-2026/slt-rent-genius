// USE_CASE_LIBRARY für SEO-Textgenerierung
// Kuratierte, faktentreue Use Cases pro Subkategorie.
// Die KI-Generierung darf NUR aus dieser Liste schöpfen, KEINE freien Use-Case-Erfindungen.
//
// Keys = `category`-Feld aus den Product-Definitionen (rentalData.ts / krefeldProducts.ts / bonnProducts.ts).
// Falls hier ein Produkt-Category-Wert fehlt, fällt der Generator auf einen leeren Use-Case-Block zurück.

export type UseCasePool = {
  bauProfi: string[];
  privatGarten: string[];
  eventGastronomie: string[];
};

export const USE_CASE_LIBRARY: Record<string, UseCasePool> = {
  // ============ ERDBEWEGUNG ============
  minibagger: {
    bauProfi: [
      "Aushub von Streifen- und Punktfundamenten",
      "Anlegen von Drainage- und Versorgungsleitungsgräben",
      "Erdarbeiten für Pool- und Teichbau",
      "Rückbau und Geländemodellierung auf engen Baustellen",
      "Vorbereitung von Pflasterarbeiten und Wegebau",
    ],
    privatGarten: [
      "Anlegen eines Gartenteichs",
      "Aushub für Terrassen- und Pflasterarbeiten",
      "Wurzelentfernung beim Baumfällen",
      "Geländemodellierung im Privatgarten",
    ],
    eventGastronomie: [],
  },
  dumper: {
    bauProfi: [
      "Materialtransport auf weitläufigen Baustellen",
      "Bauschuttabfuhr in beengten Innenstadtbaustellen",
      "Erdmassen-Transport bei Aushubarbeiten",
    ],
    privatGarten: [
      "Transport von Mutterboden, Kies oder Schotter im Garten",
      "Materialbewegung bei größeren Privatprojekten",
    ],
    eventGastronomie: [],
  },
  radlader: {
    bauProfi: [
      "Materialhandling von Schüttgütern",
      "Beladung von LKW und Containern",
      "Schneeräumung im Winterdienst",
    ],
    privatGarten: ["Großflächige Materialbewegung bei Hofumgestaltung"],
    eventGastronomie: [],
  },
  knicklader: {
    bauProfi: [
      "Materialhandling auf engen Baustellen",
      "Wendige Beladung in Hofstellen und Reithallen",
      "Stapelarbeiten in landwirtschaftlichen Betrieben",
    ],
    privatGarten: ["Wendige Materialbewegung im Hofbereich"],
    eventGastronomie: [],
  },

  // Bagger-Anbaugeräte
  tiefloeffel: {
    bauProfi: [
      "Standard-Aushub bei Erdarbeiten",
      "Grabarbeiten für Fundamente und Leitungen",
    ],
    privatGarten: ["Aushub im Privatgarten mit gemietetem Bagger"],
    eventGastronomie: [],
  },
  grabenraeumloeffel: {
    bauProfi: [
      "Profilierung von Gräben und Böschungen",
      "Räumung von Mutterboden und Aushubmaterial",
      "Planieren von Flächen vor Pflasterarbeiten",
    ],
    privatGarten: ["Geländemodellierung und Profilierung im Garten"],
    eventGastronomie: [],
  },
  kabelloeffel: {
    bauProfi: [
      "Schmale Gräben für Kabel- und Leitungsverlegung",
      "Tiefbau-Arbeiten bei Strom- und Datenleitungen",
    ],
    privatGarten: ["Verlegung von Strom- oder Wasserleitungen im Garten"],
    eventGastronomie: [],
  },
  hydraulikhammer: {
    bauProfi: [
      "Abbruch von Beton- und Mauerwerk",
      "Aufbrechen von Asphalt- und Pflasterflächen",
      "Felsabbruch bei Tiefbauarbeiten",
    ],
    privatGarten: ["Abbruch alter Fundamente oder Pflasterflächen"],
    eventGastronomie: [],
  },
  sortiergreifer: {
    bauProfi: [
      "Sortieren und Verladen von Bauschutt",
      "Handling von Steinen, Wurzeln oder Baumstämmen",
    ],
    privatGarten: ["Räumen und Verladen von Garten-Aushub"],
    eventGastronomie: [],
  },

  // ============ ANHÄNGER ============
  planen: {
    bauProfi: [
      "Witterungsgeschützter Transport von Werkzeugen und Materialien",
      "Transport empfindlicher Bauteile",
      "Verschließbarer Transport für längere Strecken",
    ],
    privatGarten: [
      "Möbeltransport beim Umzug",
      "Transport von Garten- und Heimwerker-Material",
      "Witterungsgeschützter Transport von Sportgeräten",
    ],
    eventGastronomie: [
      "Transport von Veranstaltungstechnik und Equipment",
      "Materialtransport bei Festen und Veranstaltungen",
    ],
  },
  koffer: {
    bauProfi: [
      "Diebstahlgeschützter Werkzeugtransport",
      "Mobiles Lager für längere Bauprojekte",
    ],
    privatGarten: [
      "Sicherer Transport von Wertgegenständen beim Umzug",
      "Transport empfindlicher Gegenstände",
    ],
    eventGastronomie: [
      "Mobiles Equipment-Lager bei Tour-Events",
      "Transport hochwertiger Veranstaltungstechnik",
    ],
  },
  autotransport: {
    bauProfi: [
      "Transport von Baumaschinen und Geräten zwischen Baustellen",
      "Überführung von Fahrzeugen und Maschinen",
    ],
    privatGarten: [
      "Transport von Oldtimern und privaten Fahrzeugen",
      "Überführung von Motorrädern oder Quads",
    ],
    eventGastronomie: ["Transport von Show-Fahrzeugen zu Events"],
  },
  motorrad: {
    bauProfi: [],
    privatGarten: [
      "Transport von Motorrädern zu Touren oder Werkstattterminen",
      "Überführung von 1–3 Maschinen mit Auflahrrampen",
    ],
    eventGastronomie: ["Transport von Show-Bikes zu Veranstaltungen"],
  },
  baumaschine: {
    bauProfi: [
      "Sicherer Transport von Minibaggern und Kompaktgeräten",
      "Verlastung von Baumaschinen zur nächsten Einsatzstelle",
    ],
    privatGarten: ["Transport gemieteter Baumaschinen zum Privatprojekt"],
    eventGastronomie: [],
  },
  kasten: {
    bauProfi: [
      "Offener Materialtransport ohne Witterungsschutz",
      "Transport von Schüttgut im kleinen Maßstab",
    ],
    privatGarten: [
      "Garten- und Hofarbeiten mit kleinem Materialvolumen",
      "Bauschuttabfuhr bei Heimwerker-Projekten",
    ],
    eventGastronomie: [],
  },
  laubgitter: {
    bauProfi: ["Transport sperriger leichter Materialien wie Verschnitt oder Verpackungen"],
    privatGarten: [
      "Transport von Grünschnitt und Gartenabfällen",
      "Laubabfuhr im Herbst",
    ],
    eventGastronomie: [],
  },
  urlaub: {
    bauProfi: [],
    privatGarten: [
      "Transport von Reisegepäck, Fahrrädern und Sportgeräten",
      "Zusatzladefläche für Camping- und Urlaubsausrüstung",
    ],
    eventGastronomie: [],
  },
  anhaengerbuehne: {
    bauProfi: [
      "Höhenarbeiten ohne LKW-Aufbau – einfach mit PKW ziehen",
      "Mobile Arbeitsbühne für Wartung und Montage",
    ],
    privatGarten: ["Baumpflege oder Fassadenarbeiten am Eigenheim"],
    eventGastronomie: [],
  },

  // ============ ARBEITSBÜHNEN ============
  scherenbuehne: {
    bauProfi: [
      "Montagearbeiten in Hallen und Lagern",
      "Wartung von Beleuchtung und Decken",
      "Renovierungsarbeiten in Innenräumen",
    ],
    privatGarten: [],
    eventGastronomie: ["Aufbau von Hallenbeleuchtung und -dekoration"],
  },
  gelenkbuehne: {
    bauProfi: [
      "Erreichbarkeit hinter Hindernissen",
      "Fassadenarbeiten mit Auslage über Vorbauten",
    ],
    privatGarten: [],
    eventGastronomie: [],
  },
  mastbuehne: {
    bauProfi: [
      "Punktuelle Arbeiten in größeren Höhen",
      "Wartungsarbeiten an schwer erreichbaren Stellen",
    ],
    privatGarten: [],
    eventGastronomie: [],
  },

  // ============ AGGREGATE / STROM ============
  aggregat: {
    bauProfi: [
      "Stromversorgung auf Baustellen ohne Netzanschluss",
      "Notstrom in Bauphase und Sanierung",
      "Antrieb leistungsstarker Werkzeuge und Pumpen",
    ],
    privatGarten: [
      "Stromversorgung bei Garten- und Außenarbeiten",
      "Notstrom für temporäre Anlässe",
    ],
    eventGastronomie: [
      "Stromversorgung bei Outdoor-Veranstaltungen",
      "Backup-Strom bei Festen und Märkten",
      "Versorgung von Foodtrucks und Event-Infrastruktur",
    ],
  },
  stromverteiler: {
    bauProfi: ["Stromverteilung auf Großbaustellen", "Sichere Mehrfach-Abnahme von Aggregaten"],
    privatGarten: [],
    eventGastronomie: [
      "Stromverteilung bei Outdoor-Events",
      "Versorgung von Bühnen, Foodtrucks und Ständen",
    ],
  },
  anschlussschrank: {
    bauProfi: ["Bau-Anschlussschrank zur Versorgung von Maschinen und Werkzeugen"],
    privatGarten: [],
    eventGastronomie: ["Zentrale Stromabnahme bei Veranstaltungen"],
  },
  "cee-kabel": {
    bauProfi: [
      "Verlängerung der Stromversorgung auf der Baustelle",
      "Sichere Drehstrom-Verbindungen",
    ],
    privatGarten: [],
    eventGastronomie: ["Verbindung von Aggregat zu Stromverteiler bei Outdoor-Events"],
  },
  "schuko-kabel": {
    bauProfi: ["Verlängerung von Standard-Stromabnahmen auf der Baustelle"],
    privatGarten: ["Stromverlängerung bei Garten- und Heimwerker-Arbeiten"],
    eventGastronomie: ["Versorgung kleinerer Verbraucher bei Veranstaltungen"],
  },
  "powercon-kabel": {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: [
      "Verbindung von Bühnentechnik (Beleuchtung, Lautsprecher)",
      "Verkettung von PowerCon-Geräten bei Konzerten und Shows",
    ],
  },
  kabelbruecke: {
    bauProfi: ["Sichere Kabelführung über befahrene Baustellenbereiche"],
    privatGarten: [],
    eventGastronomie: [
      "Sichere Kabelführung über Besucherwege",
      "Schutz von Kabeln bei Outdoor-Events",
    ],
  },
  kabeltrommel: {
    bauProfi: ["Mobile Stromversorgung im Baustellenbereich"],
    privatGarten: ["Verlängerungs-Lösung für Garten und Hof"],
    eventGastronomie: ["Flexible Verkabelung bei kleineren Events"],
  },
  netzwerkkabel: {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: [
      "Datenübertragung zwischen Bühnen-Equipment",
      "Verbindung von Lichtsteuerungen und Mischpulten",
    ],
  },
  "hdmi-kabel": {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: ["Verbindung von Video-Equipment auf Bühnen und bei Präsentationen"],
  },
  adapter: {
    bauProfi: ["Anpassung unterschiedlicher Stromanschlüsse auf der Baustelle"],
    privatGarten: [],
    eventGastronomie: ["Anschluss-Anpassung bei wechselnder Event-Infrastruktur"],
  },
  erdung: {
    bauProfi: ["Schutzerdung von temporären Stromanlagen"],
    privatGarten: [],
    eventGastronomie: ["Erdung von Aggregaten bei Outdoor-Events"],
  },

  // ============ VERDICHTUNG ============
  ruettelplatte: {
    bauProfi: [
      "Verdichtung von Pflasterbettungen",
      "Bodenverdichtung bei Wege- und Straßenbau",
    ],
    privatGarten: [
      "Pflasterarbeiten im Privatgarten",
      "Verdichtung von Schotter- und Kiesflächen",
    ],
    eventGastronomie: [],
  },
  "ruettelplatte-reversierbar": {
    bauProfi: [
      "Verdichtung von Pflasterbettungen mit Vor- und Rückwärtsfahrt",
      "Bodenverdichtung in beengten Bereichen",
    ],
    privatGarten: ["Komfortable Verdichtung bei Privatprojekten"],
    eventGastronomie: [],
  },
  stampfer: {
    bauProfi: [
      "Verdichtung in schmalen Gräben und Schächten",
      "Punktuelle Bodenverdichtung bei Leitungsverlegung",
    ],
    privatGarten: ["Verdichtung in schmalen Bereichen am Haus"],
    eventGastronomie: [],
  },
  walze: {
    bauProfi: [
      "Verdichtung größerer Flächen im Wege- und Straßenbau",
      "Asphaltverdichtung bei Sanierungen",
    ],
    privatGarten: [],
    eventGastronomie: [],
  },
  rasenwalze: {
    bauProfi: [],
    privatGarten: [
      "Andrücken von neu verlegten Rollrasen",
      "Verdichtung von Rasen-Saatflächen",
    ],
    eventGastronomie: [],
  },
  betonruettler: {
    bauProfi: ["Verdichtung von Frischbeton in Schalungen"],
    privatGarten: ["Beton-Verdichtung bei Eigenheim-Fundamenten"],
    eventGastronomie: [],
  },
  zwangsmischer: {
    bauProfi: ["Mischung größerer Mengen Mörtel oder Beton auf der Baustelle"],
    privatGarten: ["Mörtel- oder Beton-Mischung bei Eigenheim-Projekten"],
    eventGastronomie: [],
  },

  // ============ WERKZEUGE ============
  bohrhammer: {
    bauProfi: [
      "Bohrarbeiten in Beton und Mauerwerk",
      "Befestigungsarbeiten im Hochbau",
    ],
    privatGarten: ["Renovierungsarbeiten am Eigenheim", "Befestigung größerer Wandhalterungen"],
    eventGastronomie: [],
  },
  bohrschrauber: {
    bauProfi: ["Schraub- und Bohrarbeiten auf der Baustelle"],
    privatGarten: ["Heimwerker-Arbeiten und Möbelmontage"],
    eventGastronomie: ["Auf- und Abbau von Bühnen- und Eventtechnik"],
  },
  schlagschrauber: {
    bauProfi: ["Lösen und Anziehen festsitzender Schraubverbindungen"],
    privatGarten: ["Reifenwechsel und Werkstattarbeiten"],
    eventGastronomie: [],
  },
  abbruchhammer: {
    bauProfi: [
      "Abbruch von Mauerwerk und Beton",
      "Aufbrechen von Estrich und Fliesen",
    ],
    privatGarten: ["Abbruch alter Wände und Bodenbeläge bei Renovierung"],
    eventGastronomie: [],
  },
  saebelsaege: {
    bauProfi: ["Trennarbeiten in Holz, Metall und Verbundmaterialien"],
    privatGarten: ["Garten- und Renovierungsarbeiten mit unterschiedlichen Materialien"],
    eventGastronomie: [],
  },
  multicutter: {
    bauProfi: ["Präzise Trenn- und Schleifarbeiten an schwer zugänglichen Stellen"],
    privatGarten: ["Renovierungsarbeiten an Türen, Fenstern und Bodenbelägen"],
    eventGastronomie: [],
  },
  kreissaege: {
    bauProfi: ["Zuschnitt von Holz und Plattenmaterial auf der Baustelle"],
    privatGarten: ["Heimwerker-Zuschnitt im Garten und in der Werkstatt"],
    eventGastronomie: [],
  },
  trennschleifer: {
    bauProfi: [
      "Trennen von Stein, Beton und Metall",
      "Pflaster- und Plattenzuschnitt",
    ],
    privatGarten: ["Pflaster- und Steinarbeiten am Eigenheim"],
    eventGastronomie: [],
  },
  winkelschleifer: {
    bauProfi: ["Trenn- und Schleifarbeiten auf der Baustelle"],
    privatGarten: ["Metall- und Steinbearbeitung in der Werkstatt"],
    eventGastronomie: [],
  },
  fliesenschneider: {
    bauProfi: ["Präziser Zuschnitt von Wand- und Bodenfliesen"],
    privatGarten: ["Fliesenarbeiten bei Bad- oder Küchenrenovierung"],
    eventGastronomie: [],
  },
  fugenschneider: {
    bauProfi: ["Schneiden von Dehnungsfugen in Asphalt und Beton"],
    privatGarten: [],
    eventGastronomie: [],
  },
  kernbohrer: {
    bauProfi: [
      "Kernbohrungen für Rohr- und Leitungsdurchführungen",
      "Diamantbohrungen in Beton und Mauerwerk",
    ],
    privatGarten: ["Durchbruch für Lüftungs- oder Abwasserrohre"],
    eventGastronomie: [],
  },
  fraese: {
    bauProfi: ["Materialabtrag und Oberflächenbearbeitung"],
    privatGarten: [],
    eventGastronomie: [],
  },
  baumstumpffraese: {
    bauProfi: ["Entfernung von Baumstümpfen bei Garten- und Landschaftsbau"],
    privatGarten: ["Beseitigung störender Baumstümpfe im Privatgarten"],
    eventGastronomie: [],
  },
  bodenhacke: {
    bauProfi: [],
    privatGarten: [
      "Boden-Vorbereitung für Neubepflanzung",
      "Auflockern verdichteter Gartenflächen",
    ],
    eventGastronomie: [],
  },
  pumpe: {
    bauProfi: [
      "Wasserhaltung in Baugruben",
      "Lenzpumpen-Einsatz bei Wasserschäden",
    ],
    privatGarten: ["Entwässerung von Kellern und überfluteten Bereichen"],
    eventGastronomie: [],
  },
  hochdruckreiniger: {
    bauProfi: ["Reinigung von Maschinen und Baustellenoberflächen"],
    privatGarten: ["Reinigung von Hof, Pflaster und Fassade"],
    eventGastronomie: [],
  },
  kompressor: {
    bauProfi: ["Druckluftversorgung für Werkzeuge auf der Baustelle"],
    privatGarten: ["Druckluft für Werkstatt- und Reifenarbeiten"],
    eventGastronomie: [],
  },
  druckluftwerkzeug: {
    bauProfi: ["Anwendungen mit pneumatischem Antrieb auf der Baustelle"],
    privatGarten: [],
    eventGastronomie: [],
  },
  staubsauger: {
    bauProfi: ["Staubabsaugung bei Bohr- und Schleifarbeiten"],
    privatGarten: ["Werkstatt-Reinigung nach Heimwerker-Arbeiten"],
    eventGastronomie: [],
  },
  laser: {
    bauProfi: [
      "Nivellierung und Ausrichtung auf der Baustelle",
      "Linien- und Punktübertragung im Innenausbau",
    ],
    privatGarten: ["Ausrichtung bei Renovierungs- und Umbauarbeiten"],
    eventGastronomie: [],
  },
  ortungsgeraet: {
    bauProfi: [
      "Ortung von Leitungen vor Bohr- und Stemmarbeiten",
      "Vermeidung von Schäden an Strom- und Wasserleitungen",
    ],
    privatGarten: ["Sicheres Bohren in Wänden bei Renovierung"],
    eventGastronomie: [],
  },
  nageler: {
    bauProfi: ["Befestigungsarbeiten im Holzbau"],
    privatGarten: ["Holzarbeiten und Renovierungsprojekte"],
    eventGastronomie: ["Bühnenbau und temporäre Holzkonstruktionen"],
  },
  heissluftfoehn: {
    bauProfi: ["Schweißen von Folien, Schrumpfen, Lackentfernung"],
    privatGarten: ["Renovierungsarbeiten und Lackentfernung"],
    eventGastronomie: [],
  },
  ladegeraet: {
    bauProfi: ["Mehrfach-Ladung von Akkus auf der Baustelle"],
    privatGarten: [],
    eventGastronomie: [],
  },
  akkupack: {
    bauProfi: ["Stromversorgung kabelloser Werkzeuge"],
    privatGarten: ["Ersatz-Akku für Heimwerker-Geräte"],
    eventGastronomie: [],
  },
  steinbearbeitung: {
    bauProfi: ["Bearbeitung von Stein und Naturwerkstoffen"],
    privatGarten: ["Pflaster- und Steinarbeiten am Eigenheim"],
    eventGastronomie: [],
  },
  zubehoer: {
    bauProfi: ["Ergänzung zu Werkzeugen und Maschinen für Spezialeinsätze"],
    privatGarten: ["Erweiterung der Heimwerker-Ausstattung"],
    eventGastronomie: [],
  },
  set: {
    bauProfi: ["Komplette Werkzeug-Ausstattung für definierte Arbeiten"],
    privatGarten: ["Set-Lösung für einmalige Heimwerker-Projekte"],
    eventGastronomie: [],
  },

  // ============ GARTENPFLEGE ============
  haecksler: {
    bauProfi: ["Verarbeitung von Schnittgut bei Landschaftspflege"],
    privatGarten: ["Verarbeitung von Heckenschnitt und Astwerk"],
    eventGastronomie: [],
  },
  vertikutierer: {
    bauProfi: ["Rasenpflege bei gewerblichen Außenanlagen"],
    privatGarten: ["Auflockerung und Belüftung des Rasens im Frühjahr"],
    eventGastronomie: [],
  },
  heckenschere: {
    bauProfi: ["Heckenschnitt bei Landschaftspflege"],
    privatGarten: ["Saisonaler Heckenschnitt am Eigenheim"],
    eventGastronomie: [],
  },
  kettensaege: {
    bauProfi: ["Baumfällarbeiten und Holzverarbeitung"],
    privatGarten: ["Baumpflege und Brennholz-Aufbereitung"],
    eventGastronomie: [],
  },
  freischneider: {
    bauProfi: ["Pflege wilder Wuchsbereiche bei Landschaftsbau"],
    privatGarten: ["Freischneiden von Brennnesseln und hohem Bewuchs"],
    eventGastronomie: [],
  },
  laubbläser: {
    bauProfi: ["Laubbeseitigung in gewerblichen Außenanlagen"],
    privatGarten: ["Herbstliche Laubbeseitigung im Garten"],
    eventGastronomie: ["Schnelle Reinigung von Veranstaltungsflächen"],
  },
  unkrautbrenner: {
    bauProfi: ["Unkrautbeseitigung auf Pflasterflächen"],
    privatGarten: ["Chemiefreie Unkrautbeseitigung im Hof"],
    eventGastronomie: [],
  },
  roderechen: {
    bauProfi: ["Räumarbeiten bei Garten- und Landschaftsbau"],
    privatGarten: ["Räumen von Schnittgut und Pflanzenresten"],
    eventGastronomie: [],
  },
  erdrakete: {
    bauProfi: [
      "Grabenlose Verlegung von Strom- und Wasserleitungen",
      "Untertunnelung von Wegen und Einfahrten",
    ],
    privatGarten: ["Zuleitung zu Gartenhaus oder Carport ohne Aufgrabung"],
    eventGastronomie: [],
  },
  erdbohrer: {
    bauProfi: ["Bohrungen für Pfostengründungen und kleine Fundamente"],
    privatGarten: ["Pfosten für Zäune, Carports und Gartenhäuser"],
    eventGastronomie: ["Verankerung von Zelten und temporären Konstruktionen"],
  },

  // ============ ABSPERRTECHNIK ============
  bauzaun: {
    bauProfi: [
      "Absperrung von Baustellen",
      "Sicherung gegen unbefugten Zugang",
    ],
    privatGarten: ["Temporäre Absicherung bei privaten Bauprojekten"],
    eventGastronomie: ["Abgrenzung von Veranstaltungsbereichen"],
  },
  absperrgitter: {
    bauProfi: ["Verkehrssicherung im Baustellenbereich"],
    privatGarten: [],
    eventGastronomie: [
      "Besucherführung bei Veranstaltungen",
      "Absperrung von Festbereichen",
    ],
  },
  absperrtechnik: {
    bauProfi: ["Verkehrssicherung im Baustellenbereich"],
    privatGarten: [],
    eventGastronomie: ["Absperrung und Besucherführung bei Events"],
  },
  schrankenzaun: {
    bauProfi: ["Mobile Absperrung im öffentlichen Raum"],
    privatGarten: [],
    eventGastronomie: ["Klar erkennbare Absperrung bei Events"],
  },
  warnbarke: {
    bauProfi: ["Verkehrswarnung im Baustellenbereich"],
    privatGarten: [],
    eventGastronomie: [],
  },
  warnleuchte: {
    bauProfi: ["Sichtbarkeit von Absperrungen bei Nacht"],
    privatGarten: [],
    eventGastronomie: ["Sicherheits-Beleuchtung bei Outdoor-Events"],
  },
  verkehrszeichen: {
    bauProfi: ["Verkehrslenkung im Baustellenbereich gemäß RSA"],
    privatGarten: [],
    eventGastronomie: ["Temporäre Beschilderung bei Veranstaltungen"],
  },

  // ============ BELEUCHTUNG ============
  bauleuchte: {
    bauProfi: ["Baustellenbeleuchtung bei verlängerten Arbeitszeiten"],
    privatGarten: ["Außenbeleuchtung bei Garten- und Heimwerker-Arbeiten"],
    eventGastronomie: [],
  },
  beleuchtung: {
    bauProfi: ["Baustellenbeleuchtung in Innen- und Außenbereichen"],
    privatGarten: ["Stimmungsbeleuchtung bei Gartenpartys"],
    eventGastronomie: [
      "Bühnenbeleuchtung bei Konzerten und Shows",
      "Akzentbeleuchtung bei Hochzeiten und Galas",
    ],
  },
  scheinwerfer: {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: [
      "Bühnenbeleuchtung bei Live-Auftritten",
      "Akzent- und Effektbeleuchtung bei Events",
    ],
  },
  "led-fluter": {
    bauProfi: ["Großflächige Baustellenbeleuchtung"],
    privatGarten: ["Beleuchtung größerer Außenflächen"],
    eventGastronomie: ["Beleuchtung von Veranstaltungsflächen"],
  },
  "led-bar": {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: ["Bühnen- und Effektbeleuchtung", "Lineare Akzentbeleuchtung"],
  },
  "moving-head": {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: [
      "Dynamische Lichtshows bei Konzerten",
      "Effektlicht bei DJ-Sets und Galas",
    ],
  },
  blinder: {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: ["Effektbeleuchtung bei Live-Konzerten und Shows"],
  },

  // ============ BESCHALLUNG ============
  lautsprecher: {
    bauProfi: [],
    privatGarten: ["Hintergrundbeschallung bei Gartenpartys"],
    eventGastronomie: [
      "Beschallung von Konzerten und Bühnenshows",
      "Sprachbeschallung bei Tagungen",
    ],
  },
  subwoofer: {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: [
      "Bassverstärkung bei DJ-Sets und Konzerten",
      "Vollbereichs-Beschallung bei Festen",
    ],
  },
  "pa-system": {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: [
      "Komplett-Beschallung für mittlere und große Veranstaltungen",
      "Live-Konzerte und Bühnenshows",
    ],
  },
  mikrofon: {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: [
      "Sprachverstärkung bei Tagungen und Reden",
      "Gesangs- und Instrumentenmikrofonierung bei Live-Auftritten",
    ],
  },
  mischpult: {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: [
      "Tonmischung bei Live-Events",
      "Steuerung mehrerer Audioquellen bei Veranstaltungen",
    ],
  },
  stagebox: {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: ["Signalverteilung zwischen Bühne und Mischpult bei Live-Events"],
  },
  "dj-equipment": {
    bauProfi: [],
    privatGarten: ["Musikbeschallung bei Privatfeiern"],
    eventGastronomie: [
      "DJ-Sets bei Hochzeiten und Firmenfeiern",
      "Clubevents und Partys",
    ],
  },
  "bluetooth-speaker": {
    bauProfi: [],
    privatGarten: ["Mobile Musikbeschallung im Garten"],
    eventGastronomie: ["Hintergrundbeschallung bei kleineren Veranstaltungen"],
  },

  // ============ BÜHNE / TRAVERSEN ============
  podest: {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: [
      "Bühnenpodeste für Konzerte und Reden",
      "Erhöhung von Tisch- oder Präsentationsbereichen",
    ],
  },
  "buehnen-zubehoer": {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: ["Ergänzungen für Bühnenkonstruktionen bei Events"],
  },
  traverse: {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: [
      "Aufhängung von Beleuchtung und Lautsprechern",
      "Truss-Konstruktionen für Festivals und Open-Air-Events",
      "Eingangs- und Werbeportale",
    ],
  },
  traversenverbinder: {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: ["Verbindung von Traversensystemen bei Bühnenbau"],
  },
  "traversen-zubehoer": {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: ["Ergänzendes Zubehör für Traversen-Konstruktionen bei Events"],
  },
  autopole: {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: [
      "Foto-Hintergrund-Aufhängung bei Studio- und Event-Setups",
      "Mobile Stützen für Hintergründe und Vorhänge",
    ],
  },

  // ============ HEIZUNG / TROCKNUNG ============
  bautrockner: {
    bauProfi: [
      "Bautrocknung nach Wasserschäden",
      "Estrichtrocknung bei Neubauten",
    ],
    privatGarten: ["Trocknung nach Wasserschäden im Eigenheim"],
    eventGastronomie: [],
  },
  heizluefter: {
    bauProfi: [
      "Beheizung von Baustellen in der kalten Jahreszeit",
      "Trocknungs-Unterstützung bei Sanierung",
    ],
    privatGarten: ["Temporäre Beheizung bei Renovierungsarbeiten"],
    eventGastronomie: ["Beheizung von Festzelten in der kalten Jahreszeit"],
  },
  heizpilz: {
    bauProfi: [],
    privatGarten: ["Wärmequelle bei Garten- und Terrassenfeiern"],
    eventGastronomie: [
      "Außenbereichs-Beheizung bei Gastronomie und Events",
      "Wärmeerzeugung im Eingangs- und Raucherbereich",
    ],
  },
  kuehlgeraet: {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: [
      "Kühlung von Veranstaltungsräumen im Sommer",
      "Klimatisierung von Backstage- und Cateringbereichen",
    ],
  },

  // ============ MÖBEL / ZELTE ============
  zelt: {
    bauProfi: ["Witterungsschutz für temporäre Baustelleneinrichtungen"],
    privatGarten: [
      "Geburtstagsfeiern und Familienfeste",
      "Gartenpartys und Sommerfeste",
    ],
    eventGastronomie: [
      "Hochzeiten und Großveranstaltungen",
      "Firmenfeiern und Tagungen",
      "Märkte und Outdoor-Events",
    ],
  },
  moebel: {
    bauProfi: [],
    privatGarten: [
      "Sitzgelegenheiten bei privaten Festen",
      "Stehtische bei Gartenpartys",
    ],
    eventGastronomie: [
      "Bestuhlung von Festzelten und Veranstaltungsflächen",
      "Stehtische und Lounge-Möbel bei Events",
    ],
  },
  husse: {
    bauProfi: [],
    privatGarten: ["Eleganter Look bei privaten Feiern"],
    eventGastronomie: [
      "Stuhl- und Tischhussen für Hochzeiten und Galas",
      "Einheitliches Erscheinungsbild bei Tagungen",
    ],
  },
  garderobe: {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: [
      "Garderobe bei Veranstaltungen und Tagungen",
      "Gästekomfort bei Hochzeiten und Firmenfeiern",
    ],
  },
  warmhaltegeraet: {
    bauProfi: [],
    privatGarten: ["Warmhalten von Speisen bei Familienfesten"],
    eventGastronomie: ["Speisen-Warmhaltung bei Catering-Einsätzen und Buffets"],
  },

  // ============ GESCHIRR / GLÄSER / BESTECK ============
  teller: {
    bauProfi: [],
    privatGarten: ["Familienfeiern und Geburtstage"],
    eventGastronomie: [
      "Hochzeiten und Festveranstaltungen",
      "Catering-Einsätze und Tagungen",
    ],
  },
  schuessel: {
    bauProfi: [],
    privatGarten: ["Salat- und Beilagen-Schüsseln bei Privatfeiern"],
    eventGastronomie: ["Buffet-Service bei Veranstaltungen"],
  },
  glaeser: {
    bauProfi: [],
    privatGarten: ["Wein-, Sekt- oder Wassergläser bei privaten Feiern"],
    eventGastronomie: [
      "Stilvolle Bewirtung bei Hochzeiten und Galas",
      "Tagungs- und Konferenz-Service",
    ],
  },
  besteck: {
    bauProfi: [],
    privatGarten: ["Besteck-Set für Familienfeste"],
    eventGastronomie: [
      "Komplettes Besteck-Service bei Hochzeiten",
      "Catering-Besteck für Tagungen und Events",
    ],
  },
  tassen: {
    bauProfi: [],
    privatGarten: ["Kaffee- und Teetassen bei Familienfeiern"],
    eventGastronomie: [
      "Kaffee-Service bei Tagungen",
      "Heißgetränke-Service bei Veranstaltungen",
    ],
  },
  spuelmaschine: {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: ["Catering-Spülung bei größeren Veranstaltungen"],
  },

  // ============ HÜPFBURGEN / SPEZIAL ============
  huepfburg: {
    bauProfi: [],
    privatGarten: [
      "Kindergeburtstage im Privatgarten",
      "Familienfeste mit Kindern",
    ],
    eventGastronomie: [
      "Stadtfeste und Gemeindeveranstaltungen",
      "Schulfeste und Vereinsfeste",
    ],
  },
  nebel: {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: [
      "Nebeleffekte bei Konzerten und Shows",
      "Atmosphärische Effekte bei Hochzeiten und Galas",
    ],
  },
  funken: {
    bauProfi: [],
    privatGarten: [],
    eventGastronomie: [
      "Wow-Momente bei Hochzeiten und Galas",
      "Effekt-Highlights bei Show-Acts",
    ],
  },

  // ============ KOMMUNIKATION ============
  funkgeraet: {
    bauProfi: [
      "Funkverbindung auf Großbaustellen",
      "Kommunikation in unzugänglichen Gebäudeteilen",
    ],
    privatGarten: [],
    eventGastronomie: [
      "Crew-Kommunikation bei Großveranstaltungen",
      "Sicherheits-Kommunikation bei Events",
    ],
  },

  // ============ LEITERN / GERÜSTE ============
  stehleiter: {
    bauProfi: ["Universal-Einsatz auf der Baustelle"],
    privatGarten: ["Renovierungs- und Wartungsarbeiten am Eigenheim"],
    eventGastronomie: ["Auf- und Abbau bei Veranstaltungen"],
  },
  kombileiter: {
    bauProfi: ["Vielseitiger Einsatz als Anlege-, Steh- oder Bockleiter"],
    privatGarten: ["Flexible Leiter für Renovierungs- und Außenarbeiten"],
    eventGastronomie: [],
  },
  geruestteil: {
    bauProfi: [
      "Aufbau von Rollgerüsten für Innen- und Außenarbeiten",
      "Höhenarbeiten bei Maler-, Putz- und Montagearbeiten",
    ],
    privatGarten: ["Renovierungsarbeiten am Eigenheim in der Höhe"],
    eventGastronomie: [],
  },
  plattform: {
    bauProfi: ["Sichere Arbeitsplattform bei Höhenarbeiten"],
    privatGarten: ["Stabile Arbeitsplattform für Renovierungsarbeiten"],
    eventGastronomie: [],
  },
};
