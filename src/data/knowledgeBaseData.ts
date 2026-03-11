// Knowledge Base data structure

export interface KBArticleSection {
  heading?: string;
  icon?: string; // lucide icon name
  type?: "info" | "warning" | "tip" | "legal";
  text?: string;
  items?: string[];
  table?: { headers: string[]; rows: string[][] };
  subSections?: { heading: string; items: string[] }[];
}

export interface KBArticle {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  productIds?: string[]; // Links to rental product IDs
  type: "anleitung" | "video" | "faq" | "sicherheit";
  content?: string; // Simple text fallback
  sections?: KBArticleSection[]; // Rich structured content
  videoUrl?: string; // YouTube/video embed URL
  pdfUrl?: string; // PDF download link
  tags: string[];
  updatedAt: string;
}

export interface KBCategory {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  articleCount: number;
}

// Knowledge Base categories matching product categories
export const kbCategories: KBCategory[] = [
  {
    id: "anhaenger",
    title: "Anhänger",
    description: "Bedienungsanleitungen, Beladungstipps und Sicherheitshinweise für alle Anhänger-Typen.",
    icon: "Truck",
    articleCount: 4,
  },
  {
    id: "erdbewegung",
    title: "Erdbewegung",
    description: "Betriebsanleitungen für Minibagger, Radlader, Dumper und Anbaugeräte.",
    icon: "HardHat",
    articleCount: 2,
  },
  {
    id: "werkzeuge",
    title: "Werkzeuge",
    description: "Handhabung, Sicherheitshinweise und Tipps für Elektro- und Handwerkzeuge.",
    icon: "Wrench",
    articleCount: 0,
  },
  {
    id: "gartenpflege",
    title: "Gartenpflege",
    description: "Anleitungen für Rasenmäher, Vertikutierer, Häcksler und mehr.",
    icon: "TreePine",
    articleCount: 3,
  },
  {
    id: "aggregate",
    title: "Aggregate & Stromversorgung",
    description: "Bedienung und Sicherheitsregeln für Stromerzeuger und Notstromgeräte.",
    icon: "Zap",
    articleCount: 1,
  },
  {
    id: "arbeitsbuehnen",
    title: "Arbeitsbühnen",
    description: "Sicherheitsunterweisung und Bedienungsanleitung für Hebebühnen.",
    icon: "ArrowUpFromLine",
    articleCount: 0,
  },
  {
    id: "verdichtung",
    title: "Verdichtung",
    description: "Betriebsanleitungen für Rüttelplatten, Stampfer und Walzen.",
    icon: "Layers",
    articleCount: 1,
  },
  {
    id: "event-technik",
    title: "Eventtechnik",
    description: "Aufbauanleitungen für Beschallung, Beleuchtung, Bühne, Zelte und Hüpfburgen.",
    icon: "PartyPopper",
    articleCount: 7,
  },
  {
    id: "leitern-gerueste",
    title: "Leitern & Gerüste",
    description: "Aufbau- und Verwendungsanleitungen für Rollgerüste, Steh- und Kombileitern.",
    icon: "ArrowUpFromLine",
    articleCount: 9,
  },
  {
    id: "heizung-trocknung",
    title: "Heizung & Trocknung",
    description: "Bedienungsanleitungen für Bautrockner und Heizgeräte.",
    icon: "Thermometer",
    articleCount: 2,
  },
  {
    id: "allgemein",
    title: "Allgemeine Hinweise",
    description: "Mietablauf, Rückgabe, Transport und häufige Fragen.",
    icon: "Info",
    articleCount: 0,
  },
];

// Placeholder articles – will be filled with real content later
export const kbArticles: KBArticle[] = [
  // Anhänger
  {
    id: "anhaenger-beladen",
    title: "Anhänger richtig beladen & sichern",
    description: "Ladungssicherung nach § 22 StVO: So beladen und sichern Sie Ihren Mietanhänger korrekt – Schritt für Schritt.",
    categoryId: "anhaenger",
    type: "sicherheit",
    tags: ["ladungssicherung", "beladen", "zurrgurte", "stvo", "§22", "spanngurte", "antirutschmatte"],
    updatedAt: "2026-02-20",
    sections: [
      {
        type: "legal",
        icon: "Scale",
        heading: "Rechtliche Grundlage – § 22 StVO",
        text: "Nach § 22 StVO muss die Ladung so verstaut und gesichert sein, dass sie selbst bei Vollbremsung oder plötzlichem Ausweichen nicht verrutschen, umfallen, herabfallen oder vermeidbaren Lärm erzeugen kann. Der Fahrzeugführer ist verpflichtet, die Ladung vor Fahrtantritt zu kontrollieren und Mängel zu beseitigen. Das zulässige Gesamtgewicht und die Achslasten des Anhängers dürfen nicht überschritten werden.",
      },
      {
        type: "warning",
        icon: "AlertTriangle",
        heading: "Warum Ladungssicherung so wichtig ist",
        text: "Wer einen Mietanhänger nutzt, trägt als Fahrer die volle Verantwortung für eine korrekte Ladungssicherung. Fehlende oder falsche Sicherung führt zu:",
        items: [
          "Instabilem Fahrverhalten und Schlingern des Gespanns",
          "Längeren Bremswegen und erhöhter Unfallgefahr",
          "Schäden an der Ladung durch Verrutschen oder Herabfallen",
          "Bußgeldern, Punkten in Flensburg und strafrechtlichen Konsequenzen",
          "Haftung für Schäden an Dritten",
        ],
      },
      {
        icon: "ClipboardCheck",
        heading: "Schritt 1: Anhänger vorbereiten",
        items: [
          "Anhänger auf ebenem, geradem Untergrund abstellen und mit Unterlegkeilen gegen Wegrollen sichern",
          "Technischen Zustand prüfen: Reifen, Beleuchtung, Kupplung, Stützrad und Sicherungsseil",
          "Zulässige Gesamtmasse und maximale Zuladung in den Fahrzeugpapieren nachschlagen",
          "Zulässige Anhängelast und Stützlast Ihres Zugfahrzeugs im Fahrzeugschein prüfen",
        ],
      },
      {
        icon: "Package",
        heading: "Schritt 2: Richtig beladen – Gewichtsverteilung",
        items: [
          "Schwere Gegenstände über oder möglichst nahe der Achse platzieren – nicht weit vorne oder hinten",
          "Schwerpunkt der Ladung auf der Längsmittellinie des Anhängers halten – links und rechts gleichmäßig beladen",
          "Schweres nach unten, Leichtes nach oben – für einen tiefen Gesamtschwerpunkt",
          "Stützlast möglichst ausnutzen, aber keinesfalls überschreiten",
          "Ladung darf nicht über die Bordwände ragen – bei Überständen rote Fahne oder Beleuchtung anbringen",
        ],
      },
      {
        icon: "Link",
        heading: "Schritt 3: Ladung sicher befestigen",
        subSections: [
          {
            heading: "Formschluss – Bewegungsraum verhindern",
            items: [
              "Ladung so dicht wie möglich an Bordwände, Stirnwand oder Zwischenwände stellen",
              "Keile und Unterlegklötze für runde Gegenstände (Fässer, Rohre) verwenden",
              "Freie Räume mit Füllmaterial ausstopfen",
            ],
          },
          {
            heading: "Kraftschluss – Niederzurren mit Spanngurten",
            items: [
              "Spanngurte mit ausreichender Zugfestigkeit (LC/STF auf dem Etikett prüfen) verwenden",
              "Gurte nur an den dafür vorgesehenen Zurrpunkten des Anhängers befestigen",
              "Niederzurren: Gurte über die Ladung spannen, in Zurrpunkten einhängen und mit Ratschen vorspannen",
              "Direktzurren/Diagonalzurren: Gurte direkt von der Ladung zu den Zurrpunkten (bei schweren Gütern)",
              "Lose oder leichte Ladung (Grünschnitt, Kartons) mit Netzen oder Planen abdecken",
              "Verschlissene oder eingerissene Gurte sofort austauschen",
            ],
          },
        ],
      },
      {
        icon: "Eye",
        heading: "Schritt 4: Kontrolle vor Fahrtbeginn",
        items: [
          "Sitz der Kupplung, Verriegelung des Kugelkopfes und Sicherungsseil prüfen",
          "Alle Zurrgurte gespannt, Verriegelungen geschlossen, Netze/Planen fest fixiert?",
          "Sichtkontrolle: Beleuchtung, Kennzeichen, Bremslichter, Blinker, Stützrad hochgekurbelt?",
          "Kurze Bremsprobe auf freier Fläche – bei Schlingern oder starkem Nicken Beladung prüfen",
          "Nach den ersten Kilometern Gurte nachspannen, da sich die Ladung setzen kann",
        ],
      },
      {
        icon: "Car",
        heading: "Schritt 5: Fahrhinweise mit beladenem Anhänger",
        items: [
          "Mit reduzierter Geschwindigkeit fahren und größere Abstände einhalten",
          "Vorausschauend und sanft bremsen – keine harten Bremsvorgänge",
          "In Kurven gleichmäßig und nicht ruckartig lenken",
          "Bei Seitenwind besonders vorsichtig fahren",
          "Bei beginnendem Schlingern: langsam Gas wegnehmen, leicht bremsen, nicht ruckartig lenken",
        ],
      },
      {
        type: "tip",
        icon: "Lightbulb",
        heading: "Praxis-Tipps",
        items: [
          "Genug Zeit zum Beladen und Sichern einplanen – keine Hektik",
          "Passende Zurrgurte, Antirutschmatten und Netze bei uns ausleihen oder mitbringen",
          "Nach wenigen Kilometern die Gurte nachspannen, da sich die Ladung setzen kann",
        ],
      },
      {
        type: "legal",
        icon: "AlertCircle",
        heading: "Haftungshinweis",
        text: "Der Mieter und Fahrzeugführer ist für die ordnungsgemäße Beladung und Sicherung der Ladung nach § 22 StVO verantwortlich. Bitte beachten Sie die Angaben in den Fahrzeugpapieren zu zulässiger Anhängelast, Stützlast und Gesamtgewicht. Bei Verstößen gegen die Ladungssicherungsvorschriften haftet der Fahrer – ggf. zusätzlich Halter oder Verlader – für Bußgelder, Punkte und entstandene Schäden.",
      },
    ],
  },
  {
    id: "anhaenger-codesystem",
    title: "Kontaktlose Anhängermiete: So funktioniert das Codesystem",
    description: "SMS-Code empfangen, Schloss öffnen, Anhänger abholen und zurückbringen – ganz ohne persönlichen Kontakt.",
    categoryId: "anhaenger",
    type: "anleitung",
    tags: ["codesystem", "24/7", "sms", "schloss", "selbstbedienung", "kontaktlos", "code"],
    updatedAt: "2026-02-20",
    sections: [
      {
        type: "info",
        icon: "Smartphone",
        heading: "Was ist das Codesystem?",
        text: "Das kontaktlose Mietsystem ermöglicht es Ihnen, Ihren Anhänger bequem und sicher ohne persönlichen Kontakt abzuholen und zurückzubringen. Der SMS-Code dient als digitaler Schlüssel für das Zahlenschloss an der Deichsel.",
      },
      {
        icon: "MessageSquare",
        heading: "Code-Empfang und Gültigkeit",
        items: [
          "Der SMS-Code wird automatisch bis spätestens 30 Minuten vor Mietbeginn an Ihre hinterlegte Telefonnummer versendet.",
          "Er ist ausschließlich während des Mietzeitraums gültig und verliert danach seine Funktion.",
          "Bewahren Sie die SMS sicher auf – es wird kein Ersatzcode ausgestellt.",
        ],
      },
      {
        icon: "Unlock",
        heading: "Anhänger entsperren – Schritt für Schritt",
        items: [
          "Stellen Sie sicher, dass Sie sich am richtigen Anhänger befinden (Kennzeichen mit Buchung abgleichen).",
          "Geben Sie den 4- oder 6-stelligen Code aus der SMS auf dem Zahlenschloss ein.",
          "Bestätigen Sie die Eingabe durch Drücken der Schloss-Taste (meist mit Schloss-Symbol markiert).",
          "Ziehen Sie kräftig am Schlossbügel oder der Deichsel – das Schloss öffnet sich.",
          "Entfernen Sie das Schloss vollständig und starten Sie Ihre Miete.",
        ],
      },
      {
        type: "tip",
        icon: "Lightbulb",
        heading: "Tipp",
        text: "Testen Sie die Funktion bei Bedarf mehrmals, um ein einwandfreies Öffnen zu gewährleisten.",
      },
      {
        icon: "Lock",
        heading: "Anhänger wieder sperren und abstellen",
        items: [
          "Nach Mietende: Code eingeben, Schloss-Taste drücken und Bügel einrasten lassen.",
          "Schließen Sie das Schloss fest und ziehen Sie kräftig daran, um die Verriegelung zu prüfen.",
          "Stellen Sie den Anhänger innerhalb des Mietzeitraums auf dem vereinbarten Platz ab.",
          "Der Code bleibt bis zum Ende der Mietzeit aktiv – er kann für erneute Sperrungen verwendet werden.",
        ],
      },
      {
        type: "warning",
        icon: "AlertTriangle",
        heading: "Wichtige Hinweise und Sicherheit",
        items: [
          "Code verloren? Kontaktieren Sie uns umgehend per Telefon oder E-Mail. Außerhalb der Öffnungszeiten ist keine Soforthilfe möglich.",
          "Teilen Sie den Code niemals mit Dritten – Sie haften für Missbrauch.",
          "Bei technischen Problemen mit dem Schloss (keine Reaktion) melden Sie dies sofort und nutzen Sie den Notfallkontakt in Ihrer Buchungsbestätigung.",
        ],
      },
      {
        icon: "HelpCircle",
        heading: "Häufige Fragen (FAQ)",
        subSections: [
          {
            heading: "Was tun, wenn der Code nicht ankommt?",
            items: [
              "Prüfen Sie Spam-Ordner oder Mobilfunkempfang.",
              "Fordern Sie bei Bedarf einen Neuversand über unseren Kundenservice an.",
            ],
          },
          {
            heading: "Funktioniert der Code bei Regen?",
            items: [
              "Ja, das Schloss ist wetterbeständig.",
              "Trockene Finger erleichtern jedoch die Eingabe.",
            ],
          },
          {
            heading: "Kann ich den Anhänger vor Mietbeginn abholen?",
            items: [
              "Nein – der Code ist erst ab dem gebuchten Mietstart gültig.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "anhaenger-fuehrerschein",
    title: "Welcher Führerschein für welchen Anhänger?",
    description: "Klasse B, B96 oder BE? Alle Infos zu Führerscheinklassen, Anhängelasten und Voraussetzungen für Ihr Zugfahrzeug.",
    categoryId: "anhaenger",
    type: "anleitung",
    tags: ["führerschein", "klasse b", "b96", "be", "anhängelast", "stützlast", "zugfahrzeug", "zgm", "gesamtmasse", "tempo 100"],
    updatedAt: "2026-03-02",
    sections: [
      {
        type: "info",
        icon: "Car",
        heading: "1. Welcher Führerschein für welchen Anhänger?",
        text: "Ob Sie einen kleinen Kastenanhänger oder einen schweren Transportanhänger ziehen dürfen, hängt von Ihrer Führerscheinklasse ab. Hier finden Sie eine Übersicht der wichtigsten Klassen.",
      },
      {
        icon: "Car",
        heading: "Klasse B (Standard-Pkw-Führerschein)",
        text: "Mit Führerschein Klasse B dürfen Sie:",
        items: [
          "Pkw bis 3.500 kg zulässiger Gesamtmasse (zGM) fahren.",
          "Einen Anhänger bis 750 kg zGM immer mitführen (Gespann dann max. 4.250 kg).",
          "Einen Anhänger über 750 kg zGM mitführen, wenn die Kombination aus Pkw + Anhänger zusammen nicht mehr als 3.500 kg zGM hat.",
        ],
        subSections: [
          {
            heading: "Typische Beispiele",
            items: [
              "Leichter Kastenanhänger bis 750 kg hinter fast jedem Pkw.",
              "Größerer Anhänger (z. B. 1.300 kg zGM) nur, wenn das Zugfahrzeug entsprechend leicht ist, damit die Summe ≤ 3.500 kg bleibt.",
            ],
          },
        ],
      },
      {
        icon: "Car",
        heading: "Klasse B96 (Erweiterung zu B)",
        text: "B96 ist keine eigene Klasse, sondern eine Erweiterung der Klasse B für schwerere Gespanne. Mit B96 dürfen Sie:",
        items: [
          "Pkw bis 3.500 kg zGM fahren.",
          "Einen Anhänger über 750 kg zGM ziehen.",
          "Die Kombination Pkw + Anhänger darf mehr als 3.500 kg, aber höchstens 4.250 kg zGM haben.",
        ],
        subSections: [
          {
            heading: "Voraussetzung",
            items: [
              "Vorhandene Klasse B und eine Fahrerschulung (keine klassische Prüfung) in einer Fahrschule.",
              "Eintrag der Schlüsselzahl \u201E96\u201C im Führerschein.",
            ],
          },
        ],
      },
      {
        icon: "Car",
        heading: "Klasse BE (Anhängerführerschein)",
        text: "Mit Führerschein Klasse BE dürfen Sie:",
        items: [
          "Zugfahrzeug der Klasse B (Pkw bis 3.500 kg zGM) fahren.",
          "Einen Anhänger mit zGM bis zu 3.500 kg ziehen.",
          "Gespann bis max. 7.000 kg zGM (3.500 kg Pkw + 3.500 kg Anhänger).",
        ],
        subSections: [
          {
            heading: "Voraussetzung",
            items: [
              "Vorher Klasse B.",
              "Zusätzliche Ausbildung und praktische Prüfung in der Fahrschule.",
            ],
          },
        ],
      },
      {
        type: "info",
        icon: "ClipboardCheck",
        heading: "Übersichtstabelle: Führerschein vs. Anhänger",
        table: {
          headers: ["Führerschein", "Pkw zGM", "Anhänger zGM", "Kombination zGM", "Typische Nutzung"],
          rows: [
            ["B", "bis 3,5 t", "bis 750 kg (immer)", "bis 4,25 t", "Kleine Mietanhänger"],
            ["B", "bis 3,5 t", "> 750 kg", "max. 3,5 t", "Leichte gebremste Anhänger"],
            ["B96", "bis 3,5 t", "> 750 kg", "> 3,5 t bis 4,25 t", "Wohnwagen, größere Anhänger"],
            ["BE", "bis 3,5 t", "bis 3,5 t", "bis 7,0 t", "Schwere Transportanhänger"],
          ],
        },
      },
      {
        type: "tip",
        icon: "Lightbulb",
        heading: "Hinweis",
        text: "Prüfen Sie im Zweifel Ihren Fahrzeugschein und Führerschein oder fragen Sie bei uns nach, bevor Sie einen Anhänger buchen.",
      },
      {
        type: "info",
        icon: "Car",
        heading: "2. Voraussetzungen für das Zugfahrzeug",
        text: "Für Ihr Zugfahrzeug sind vor allem drei Werte wichtig: zulässige Anhängelast, Stützlast und zulässige Gesamtmasse.",
      },
      {
        icon: "ClipboardCheck",
        heading: "Zulässige Anhängelast",
        items: [
          "In der Zulassungsbescheinigung Teil I (Fahrzeugschein) finden Sie die maximal zulässige gebremste und ungebremste Anhängelast (Feld O.1 / O.2).",
          "Die tatsächliche Anhängelast (tatsächliches Gewicht des Anhängers inkl. Ladung) darf diesen Wert nicht überschreiten.",
          "Die tatsächliche Anhängelast soll in der Regel nicht größer sein als das zulässige Gesamtgewicht des Zugfahrzeugs (1:1-Prinzip).",
        ],
      },
      {
        icon: "Package",
        heading: "Stützlast",
        text: "Die Stützlast ist die Kraft, mit der der Anhänger auf die Anhängerkupplung des Zugfahrzeugs drückt.",
        items: [
          "Gesetzlich muss die Stützlast bei einachsigen Anhängern mindestens 4 % des tatsächlichen Anhängergewichts und mindestens 25 kg betragen.",
          "Die tatsächliche Stützlast darf weder die maximal zulässige Stützlast des Fahrzeugs noch die der Kupplung überschreiten.",
          "Praxis-Beispiel: Anhänger 1.300 kg tatsächliches Gewicht → Mindeststützlast ca. 52 kg. Bei einer zulässigen Stützlast von 75 kg sind 60–70 kg sinnvoll.",
        ],
      },
      {
        icon: "Eye",
        heading: "Weitere technische Voraussetzungen",
        items: [
          "Das Zugfahrzeug muss über eine geeignete, zugelassene Anhängerkupplung verfügen (Eintragung in Fahrzeugpapieren beachten).",
          "Die Steckdose (7- oder 13-polig) muss funktionsfähig sein, damit Beleuchtung, Blinker und ggf. Rückfahr-/Nebelschlussleuchte des Anhängers arbeiten.",
          "Die Bremsanlage des Fahrzeugs muss für die zusätzliche Last ausgelegt sein.",
        ],
      },
      {
        type: "info",
        icon: "Car",
        heading: "Tempo-100-Zulassung (optional)",
        items: [
          "Zugfahrzeug muss mit ABS ausgestattet sein.",
          "Anhängerreifen max. 6 Jahre alt und mindestens für 120 km/h (Geschwindigkeitsindex L) zugelassen.",
          "Anhänger (gebremst) benötigt Achsstoßdämpfer; das Verhältnis Anhänger- zu Fahrzeugmasse darf je nach Ausstattung einen bestimmten Faktor nicht überschreiten.",
          "Tempo-100-Plakette und Eintragung/Bestätigung durch Prüforganisation und Zulassungsstelle sind erforderlich.",
        ],
      },
      {
        type: "legal",
        icon: "AlertCircle",
        heading: "Haftungshinweis",
        text: "Der Mieter ist dafür verantwortlich, dass er über den passenden Führerschein verfügt und sein Zugfahrzeug die technischen Voraussetzungen für den gemieteten Anhänger erfüllt. Prüfen Sie vor Mietantritt Ihren Fahrzeugschein (Feld O.1/O.2), die zulässige Stützlast und die Eintragung der Anhängerkupplung.",
      },
    ],
  },
  {
    id: "anhaenger-rueckwaertskipper",
    title: "Rückwärtskipper bedienen",
    description: "Anleitung zur Kippfunktion: Hydraulik, Sicherheitsstützen und Entladung.",
    categoryId: "anhaenger",
    type: "anleitung",
    tags: ["kipper", "hydraulik", "entladen"],
    updatedAt: "2026-02-08",
  },

  // Erdbewegung
  {
    id: "minibagger-einweisung",
    title: "Minibagger sicher bedienen – Anleitung für Privatnutzer",
    description: "Sicherheitshinweise, Einweisung und Grundfunktionen: So arbeiten Sie sicher mit einem Miet-Minibagger.",
    categoryId: "erdbewegung",
    productIds: ["bobcat-e10z", "bobcat-e19", "xcmg-xe20e", "xcmg-xe27e", "bonn-bobcat-e10", "bonn-xcmg-xe20e", "bonn-xcmg-xe27e"],
    type: "sicherheit",
    tags: ["minibagger", "einweisung", "sicherheit", "bedienung", "joystick", "psa", "graben", "bagger"],
    updatedAt: "2026-03-02",
    sections: [
      {
        type: "warning",
        icon: "AlertTriangle",
        heading: "Wichtiger Hinweis vorweg",
        items: [
          "Minibagger sind keine Spielzeuge, sondern Arbeitsmaschinen mit erheblichem Gefährdungspotenzial.",
          "Unerfahrene Nutzer dürfen nur nach verständlicher Einweisung in Bedienung und Sicherheit arbeiten und müssen die Betriebsanleitung des Geräts beachten.",
          "Kinder und unbeteiligte Personen haben im Arbeitsbereich nichts zu suchen.",
        ],
      },
      {
        icon: "ClipboardCheck",
        heading: "Persönliche Schutzausrüstung & Vorbereitung",
        text: "Tragen Sie mindestens: Sicherheitsschuhe, eng anliegende Arbeitskleidung, Arbeitshandschuhe, Schutzhelm und ggf. Warnweste und Schutzbrille.",
        items: [
          "Schmuck, lose Kleidung, Kapuzenbänder etc. vermeiden – sie können sich in beweglichen Teilen verfangen.",
          "Arbeitsbereich prüfen: Untergrund, Gefälle, Gräben, Hindernisse, unterirdische Leitungen (Gas, Strom, Wasser), Bäume, Mauern.",
          "Gefahrenbereich markieren und sichern, Mindestabstand zu Personen einhalten (niemand im Schwenkbereich des Oberwagens).",
        ],
      },
      {
        icon: "Car",
        heading: "Einsteigen, Starten, Grundfunktionen",
        items: [
          "Auf- und Absteigen immer über Trittstufen und Haltegriffe, nie springen – immer Drei-Punkt-Kontakt (zwei Hände + ein Fuß oder umgekehrt).",
          "Vor dem Start: Hydraulikschläuche, Laufwerk, Anbaugeräte, Flüssigkeitsstände und offensichtliche Schäden kontrollieren.",
          "Im Sitz Platz nehmen, Sicherheitsgurt anlegen (falls vorhanden), Sicherheitsbügel/-hebel nach Vorschrift senken.",
          "Motor nach Herstellerangabe starten, zunächst im Standgas laufen lassen und mit den Joysticks und Pedalen in Ruhe vertraut machen.",
        ],
        subSections: [
          {
            heading: "Grundbedienung (typisch, kann je nach Modell variieren)",
            items: [
              "Linker Joystick: Drehen (Schwenken) des Oberwagens links/rechts, Ausleger vor/zurück.",
              "Rechter Joystick: Stiel (Löffelstiel) einziehen/ausfahren, Löffel (Schaufel) öffnen/schließen.",
              "Fahrpedale/Handhebel: Geradeaus fahren, Kurven durch unterschiedliche Ansteuerung der Ketten.",
              "Schild: Mit separatem Hebel hoch/runter – dient zum Abstützen und Nivellieren.",
            ],
          },
        ],
      },
      {
        type: "tip",
        icon: "Lightbulb",
        heading: "Hinweis",
        text: "Die Beschriftung und Belegung der Bedienelemente wird immer am konkreten Mietgerät bei der Einweisung vor Ort erklärt und gezeigt.",
      },
      {
        icon: "Eye",
        heading: "Sicheres Arbeiten (Grundregeln)",
        items: [
          "Immer langsam und mit niedriger Drehzahl beginnen, Bewegungen zunächst ruckfrei üben.",
          "Untergrund möglichst eben wählen; als Anfänger kein oder nur sehr geringes Gefälle nutzen; Steigungen über ca. 10–15 % vermeiden.",
          "Beim Fahren Schaufel und Schild leicht über dem Boden (ca. 20–30 cm) halten, damit Sie im Notfall abstützen können.",
          "Hang nur langsam gerade rauf/runter fahren, seitliches Fahren am Hang vermeiden (Kippgefahr).",
          "Oberwagen nicht mit voll gefüllter Schaufel weit ausgefahren über die Seite schwenken – Schwerpunkt möglichst nah an der Maschine halten.",
          "Nie unter überhängenden Lasten arbeiten oder Personen im Graben stehen lassen, während oben gebaggert wird.",
        ],
        subSections: [
          {
            heading: "Einfache Grabtechnik für Einsteiger",
            items: [
              "Schaufel vor der Maschine ansetzen, Zähne auf den Boden aufsetzen.",
              "Stiel langsam einziehen und gleichzeitig den Ausleger leicht heben, bis die Schaufel gefüllt ist.",
              "Schaufel schließen, dann Oberwagen langsam zur Ablagestelle schwenken.",
              "Über dem Ablageort Schaufel öffnen, Material abkippen, dann Schaufel wieder zum Körper holen.",
            ],
          },
        ],
      },
      {
        type: "warning",
        icon: "AlertTriangle",
        heading: "Typische Verbote und No-Gos",
        items: [
          "Keine Personen mit dem Löffel anheben oder transportieren – keine Mitfahrten auf Schild, Ausleger oder Ketten.",
          "Nicht im Bereich unterirdischer Leitungen baggern ohne vorherige Klärung/Planauskunft.",
          "Minibagger nicht in tiefem Wasser einsetzen – Wasserlinie darf die Unterkante der Ketten nicht überschreiten.",
          "Motor nicht in geschlossenen Räumen ohne ausreichende Belüftung laufen lassen (Gefahr von Abgasvergiftung).",
        ],
      },
      {
        icon: "Package",
        heading: "Parken, Abstellen, Transport",
        items: [
          "Nach Arbeitsende Bagger auf ebenem Untergrund abstellen.",
          "Schaufel und Schild komplett absenken, alle Anbaugeräte drucklos auf dem Boden absetzen.",
          "Motor im Leerlauf kurz abkühlen lassen, dann abstellen und Zündschlüssel abziehen.",
          "Sicherheitshebel/Bügel hochklappen, Maschine gegen unbefugte Benutzung sichern.",
          "Beim Transport auf Anhänger: Minibagger mittig und niedrig positionieren, an den vorgesehenen Zurrpunkten mit Gurten sichern.",
        ],
      },
      {
        type: "legal",
        icon: "AlertCircle",
        heading: "Haftungshinweis",
        text: "Unsere Minibagger sind für Privatkunden geeignet – eine Einweisung vor Ort ist Pflicht. Beachten Sie stets die Betriebsanleitung und unsere Sicherheitsmerkblätter. Arbeiten Sie grundsätzlich langsam, vorausschauend und niemals in der Nähe von spielenden Kindern. Bei Unsicherheit oder schwierigen Bedingungen (starke Hanglage, Leitungen im Boden, Arbeiten an Gebäuden) empfehlen wir dringend die Beauftragung eines Fachunternehmens.",
      },
    ],
  },
  {
    id: "radlader-bedienung",
    title: "Radlader sicher bedienen",
    description: "Bedienungsanleitung für den Kramer 5045 Radlader inkl. Anbaugeräte-Wechsel.",
    categoryId: "erdbewegung",
    type: "anleitung",
    tags: ["radlader", "kramer", "schaufel", "gabel"],
    updatedAt: "2026-02-08",
  },

  // Werkzeuge
  {
    id: "bohrhammer-akku",
    title: "Akku-Bohrhammer richtig einsetzen",
    description: "Bohrfutter wechseln, Meißelfunktion nutzen und Akku-Tipps für maximale Laufzeit.",
    categoryId: "werkzeuge",
    type: "anleitung",
    tags: ["bohrhammer", "akku", "bosch", "meißel", "bohrfutter"],
    updatedAt: "2026-02-08",
  },
  {
    id: "trennschleifer-sicherheit",
    title: "Trennschleifer – Sicherheitshinweise",
    description: "PSA-Anforderungen, Schneidtechniken und Wartung des Stihl TS420.",
    categoryId: "werkzeuge",
    type: "sicherheit",
    tags: ["trennschleifer", "stihl", "psa", "sicherheit", "schneiden"],
    updatedAt: "2026-02-08",
  },

  // Gartenpflege
  {
    id: "haecksler-ls95-video",
    title: "Häcksler LS-95 GX – Produktvideo & Bedienung",
    description: "Video zum Buschholzhäcksler LS 95/CH mit Kohler Motor: Funktionsweise, Einzug und Messerwechsel.",
    categoryId: "gartenpflege",
    productIds: ["haecksler-ls95-gx", "bonn-haecksler-ls95gx"],
    type: "video",
    videoUrl: "https://www.youtube.com/watch?v=ZRLLsGXfL6I",
    tags: ["häcksler", "ls-95", "kohler", "buschholz", "video", "gartenpflege"],
    updatedAt: "2026-02-11",
  },
  {
    id: "baumstumpffraese-f360-video",
    title: "Baumstumpffräse F-360 – Produktvideo",
    description: "Video zur Baumstumpffräse F-360 mit Honda GX-390 Motor: Einsatz, Schwenkbereich und Fräsleistung.",
    categoryId: "gartenpflege",
    productIds: ["baumstumpffraese-f360", "bonn-baumstumpffraese-f360"],
    type: "video",
    videoUrl: "https://www.youtube.com/shorts/rqARqFtQB7k",
    tags: ["baumstumpffräse", "f-360", "honda", "fräse", "video", "gartenpflege"],
    updatedAt: "2026-02-11",
  },
  {
    id: "baumstumpffraese-f360-anleitung",
    title: "Baumstumpffräse F-360 – Betriebsanleitung (PDF)",
    description: "Betriebsanleitung für die Baumstumpffräse F-360: Sicherheitshinweise, Bedienung, Wartung und technische Daten.",
    categoryId: "gartenpflege",
    productIds: ["baumstumpffraese-f360", "bonn-baumstumpffraese-f360"],
    type: "anleitung",
    pdfUrl: "/downloads/baumstumpffraese-f360-anleitung.pdf",
    tags: ["baumstumpffräse", "f-360", "anleitung", "pdf", "betriebsanleitung", "gartenpflege"],
    updatedAt: "2026-02-11",
  },

  // Eventtechnik
  {
    id: "soundboks-gen3-video-produktvideo",
    title: "Soundboks Gen.3 – Produktvideo",
    description: "Offizielles Produktvideo des Soundboks Gen.3: Funktionsweise, TeamUP-Modus und Einsatzmöglichkeiten.",
    categoryId: "event-technik",
    productIds: ["soundboks-gen3"],
    type: "video",
    videoUrl: "https://youtu.be/HEQiWWrrjM8",
    tags: ["soundboks", "gen3", "bluetooth", "lautsprecher", "outdoor", "video", "beschallung"],
    updatedAt: "2026-02-20",
  },
  {
    id: "soundboks-gen3-video-teamup",
    title: "Soundboks Gen.3 – TeamUP & SKAA Technologie",
    description: "So verbinden Sie bis zu 5 Soundboks Gen.3 kabellos im TeamUP-Modus mit SKAA-Technologie.",
    categoryId: "event-technik",
    productIds: ["soundboks-gen3"],
    type: "video",
    videoUrl: "https://youtu.be/u6BDAf2W4x8",
    tags: ["soundboks", "gen3", "teamup", "skaa", "bluetooth", "verbinden", "video"],
    updatedAt: "2026-02-20",
  },
  {
    id: "soundboks-gen3-anleitung",
    title: "Soundboks Gen.3 – Bedienungsanleitung (PDF)",
    description: "Offizielle Bedienungsanleitung für den Soundboks Gen.3: Inbetriebnahme, Bluetooth-Kopplung, TeamUP-Modus, Akku und technische Daten.",
    categoryId: "event-technik",
    productIds: ["soundboks-gen3"],
    type: "anleitung",
    pdfUrl: "/manuals/soundboks-gen3-bedienungsanleitung.pdf",
    tags: ["soundboks", "gen3", "anleitung", "pdf", "bedienungsanleitung", "beschallung"],
    updatedAt: "2026-02-20",
  },

  // Arbeitsbühnen
  {
    id: "mastbuehne-zmp09-video",
    title: "Mastbühne Zoomlion ZMP09 – Produktvideo",
    description: "Video zur elektrischen Mastbühne ZMP09 mit 11,20 m Arbeitshöhe: Funktionsweise, Bedienung und Einsatzbeispiele.",
    categoryId: "arbeitsbuehnen",
    productIds: ["mastbuehne-11m"],
    type: "video",
    videoUrl: "https://www.youtube.com/watch?v=9n7ZX-l6Nhg",
    tags: ["mastbühne", "zoomlion", "zmp09", "arbeitsbühne", "video", "11m", "elektro"],
    updatedAt: "2026-02-11",
  },

  // Verdichtung
  {
    id: "ruettelplatte-bedienung",
    title: "Rüttelplatte – Bedienung & Verdichtungstipps",
    description: "Einsteiger-Anleitung: Rüttelplatte sicher starten, bewegen und richtig verdichten – Schritt für Schritt erklärt.",
    categoryId: "verdichtung",
    productIds: [
      "ruettelplatte-vp16-44",
      "ruettelplatte-vp25-50",
      "ruettelplatte-hvp30-50",
      "ruettelplatte-hvp38-60",
      "bonn-ruettelplatte-vp16",
      "bonn-ruettelplatte-vp25",
      "bonn-ruettelplatte-hvp30",
      "bonn-ruettelplatte-hvp38",
    ],
    type: "anleitung",
    tags: ["rüttelplatte", "verdichtung", "pflaster", "erde", "schotter", "terrasse", "einfahrt"],
    updatedAt: "2026-03-11",
    sections: [
      {
        icon: "Info",
        heading: "1. Was eine Rüttelplatte macht",
        text: "Eine Rüttelplatte verdichtet losen Boden, Schotter oder Pflastersplitt, damit später nichts absackt oder Wellen bekommt. Du brauchst sie z.\u00a0B. für Terrasse, Einfahrt, Gartenwege oder unter Fundamente.",
      },
      {
        type: "warning",
        icon: "ShieldCheck",
        heading: "2. Sicherheit: Bevor du startest",
        items: [
          "Trage Sicherheitsschuhe, Gehörschutz, Arbeitshandschuhe und Schutzbrille.",
          "Arbeite nur auf festem, nicht glattem Untergrund – nicht auf Eis oder steilen Hängen.",
          "Schau dir die Maschine an: Nichts darf locker, kaputt oder undicht sein, alle Abdeckungen müssen dran sein.",
          "Lies einmal die Bedienungsanleitung des genauen Geräts durch – dort stehen alle Besonderheiten.",
        ],
      },
      {
        icon: "Fuel",
        heading: "3. Betriebsstoffe ganz einfach erklärt",
        subSections: [
          {
            heading: "Kraftstoff",
            items: [
              "Benzingeräte: Nur normalen, passenden Kraftstoff laut Typenschild/Handbuch verwenden.",
              "Dieselgeräte: Nur Diesel tanken.",
            ],
          },
          {
            heading: "Öl & Luftfilter",
            items: [
              "Vor dem ersten Einsatz Ölstand mit dem Stab kontrollieren – bei zu wenig Öl nicht starten.",
              "Luftfilter: Sichtprüfung – stark verschmutzt = reinigen oder tauschen, sonst läuft der Motor schlecht.",
            ],
          },
        ],
      },
      {
        type: "tip",
        icon: "Lightbulb",
        heading: "Tipp: Mietgeräte",
        text: "Wenn du mietest, sind Tank und Öl meistens schon passend gefüllt – im Zweifel bei uns nachfragen.",
      },
      {
        icon: "PlayCircle",
        heading: "4. Schritt-für-Schritt: Rüttelplatte starten",
        items: [
          "Stell die Maschine auf ebenen Boden und klapp ggf. das Transportrad hoch.",
          "Benzinhahn öffnen (falls vorhanden).",
          "Motor-Schalter auf \u201EON\u201C stellen.",
          "Choke auf \u201EStart\u201C (nur bei kaltem Motor nötig).",
          "Am Starterseil kräftig ziehen, bis der Motor läuft.",
          "Choke nach kurzer Zeit wieder öffnen, Motor 1–2 Minuten warmlaufen lassen.",
          "Gashebel langsam höher stellen, bis die Platte spürbar vibriert, aber noch gut kontrollierbar bleibt.",
        ],
      },
      {
        type: "tip",
        icon: "Lightbulb",
        heading: "Anfänger-Tipp",
        text: "Immer mit mittlerer bis niedriger Leistung anfangen – nicht Vollgas.",
      },
      {
        icon: "Move",
        heading: "5. So bewegst du die Rüttelplatte",
        items: [
          "Halte den Lenkbügel mit beiden Händen, Arme leicht gestreckt, Körper neben oder etwas hinter der Maschine.",
          "Vorwärts laufende Platte: Du schiebst sie in Laufrichtung.",
          "Reversierbare Geräte können per Hebel vorwärts oder rückwärts fahren.",
          "Fahre in ruhigen, geraden Bahnen – nicht ruckartig ziehen oder drücken.",
          "Wenn du stoppen willst, nimm Gas weg – die Maschine wird langsamer und „steht" dann praktisch auf der Stelle.",
        ],
      },
      {
        icon: "Layers",
        heading: "6. Richtige Verdichtungstechnik (für Anfänger)",
        subSections: [
          {
            heading: "In Schichten arbeiten",
            items: [
              "Schotter oder Kies max. 10–20 cm dick aufbringen, dann abrütteln.",
              "Nächste Schicht drauf, wieder rütteln – so arbeitest du dich Schicht für Schicht hoch.",
            ],
          },
          {
            heading: "Bahnen fahren",
            items: [
              "Fläche in parallelen Bahnen abfahren.",
              "Jede neue Bahn etwas über die vorige überlappen, damit keine Streifen locker bleiben.",
            ],
          },
          {
            heading: "Kreuzweise rütteln",
            items: [
              "Für wichtige Flächen (Terrasse, Einfahrt) mindestens zwei Durchgänge: einmal längs, einmal quer.",
            ],
          },
          {
            heading: "Randbereiche",
            items: [
              "Dort, wo du mit der Platte nicht hinkommst (z.\u00a0B. direkt an der Mauer), nimmst du einen Handstampfer.",
            ],
          },
        ],
      },
      {
        type: "tip",
        icon: "CheckCircle",
        heading: "Verdichtungs-Test",
        text: "Wenn die Platte beim Rütteln kaum noch sichtbare Spuren hinterlässt und der Boden nicht mehr nachgibt, ist er meist ausreichend verdichtet.",
      },
      {
        icon: "Grid3x3",
        heading: "7. Pflastersteine rütteln (nur das Wichtigste)",
        items: [
          "Schutzmatte montieren: Immer eine Gummi- oder Kunststoffmatte unter die Rüttelplatte bauen, bevor du Betonpflaster rüttelst – sonst gibt es Kratzer oder Kantenbrüche.",
          "Nur Betonpflaster rütteln – keinen Naturstein oder sehr empfindliche Platten.",
          "Fugen mit Sand oder Splitt füllen, Material einkehren, erst danach rütteln.",
          "Platte langsam und gleichmäßig über die Fläche führen – nicht lange auf einer Stelle stehen bleiben.",
        ],
      },
      {
        icon: "Power",
        heading: "8. Ausschalten und nach der Arbeit",
        items: [
          "Gashebel auf Leerlauf zurückstellen.",
          "Motor über den Aus-Schalter abstellen.",
          "Benzinhahn schließen (falls vorhanden).",
          "Maschine kurz abkühlen lassen, dann groben Schmutz mit Besen oder Bürste entfernen.",
          "Transportrad ausklappen und Maschine sauber und trocken abstellen.",
        ],
      },
    ],
  },

  // Leitern & Gerüste
  {
    id: "krause-rollgeruest-stabilo-anleitung",
    title: "Krause Rollgerüst STABILO Serie 10 – Aufbau- & Verwendungsanleitung (PDF)",
    description: "Offizielle Aufbau- und Verwendungsanleitung für das KRAUSE Fahrgerüst STABILO Serie 10 mit 10,4 m Arbeitshöhe: Sicherheitshinweise, Aufbauschema, GuardMatic-System und technische Daten.",
    categoryId: "leitern-gerueste",
    productIds: ["rollgeruest-krause-breitaufbau-10-4m"],
    type: "anleitung",
    pdfUrl: "/manuals/krause-fahrgeruest-stabilo-serie-10-anleitung.pdf",
    tags: ["krause", "rollgerüst", "stabilo", "serie 10", "aufbau", "anleitung", "pdf", "10,4m", "fahrgerüst", "leitern-gerueste"],
    updatedAt: "2026-02-20",
  },
  {
    id: "krause-rollgeruest-stabilo-anleitung-11-4m",
    title: "Krause Rollgerüst STABILO Serie 10 – Aufbau- & Verwendungsanleitung 11,4 m (PDF)",
    description: "Offizielle Aufbau- und Verwendungsanleitung für das KRAUSE Fahrgerüst STABILO Serie 10 mit 11,4 m Arbeitshöhe: Sicherheitshinweise, Aufbauschema, GuardMatic-System und technische Daten.",
    categoryId: "leitern-gerueste",
    productIds: ["rollgeruest-krause-breitaufbau-11-4m"],
    type: "anleitung",
    pdfUrl: "/manuals/krause-fahrgeruest-stabilo-serie-10-anleitung-11-4m.pdf",
    tags: ["krause", "rollgerüst", "stabilo", "serie 10", "aufbau", "anleitung", "pdf", "11,4m", "fahrgerüst", "leitern-gerueste"],
    updatedAt: "2026-02-20",
  },
  {
    id: "krause-rollgeruest-stabilo-anleitung-6-4m",
    title: "Krause Rollgerüst STABILO Serie 10 – Aufbau- & Verwendungsanleitung 6,4 m (PDF)",
    description: "Offizielle Aufbau- und Verwendungsanleitung für das KRAUSE Fahrgerüst STABILO Serie 10 mit 6,4 m Arbeitshöhe: Sicherheitshinweise, Aufbauschema, GuardMatic-System und technische Daten.",
    categoryId: "leitern-gerueste",
    productIds: ["rollgeruest-krause-breitaufbau-6-4m"],
    type: "anleitung",
    pdfUrl: "/manuals/krause-fahrgeruest-stabilo-serie-10-anleitung-6-4m.pdf",
    tags: ["krause", "rollgerüst", "stabilo", "serie 10", "aufbau", "anleitung", "pdf", "6,4m", "fahrgerüst", "leitern-gerueste"],
    updatedAt: "2026-02-20",
  },
  {
    id: "krause-rollgeruest-stabilo-anleitung-8-4m",
    title: "Krause Rollgerüst STABILO Serie 10 – Aufbau- & Verwendungsanleitung 8,4 m (PDF)",
    description: "Offizielle Aufbau- und Verwendungsanleitung für das KRAUSE Fahrgerüst STABILO Serie 10 mit 8,4 m Arbeitshöhe: Sicherheitshinweise, Aufbauschema, GuardMatic-System und technische Daten.",
    categoryId: "leitern-gerueste",
    productIds: ["rollgeruest-krause-breitaufbau-8-4m"],
    type: "anleitung",
    pdfUrl: "/manuals/krause-fahrgeruest-stabilo-serie-10-anleitung-8-4m.pdf",
    tags: ["krause", "rollgerüst", "stabilo", "serie 10", "aufbau", "anleitung", "pdf", "8,4m", "fahrgerüst", "leitern-gerueste"],
    updatedAt: "2026-02-20",
  },
  {
    id: "krause-rollgeruest-stabilo-anleitung-9-4m",
    title: "Krause Rollgerüst STABILO Serie 10 – Aufbau- & Verwendungsanleitung 9,4 m (PDF)",
    description: "Offizielle Aufbau- und Verwendungsanleitung für das KRAUSE Fahrgerüst STABILO Serie 10 mit 9,4 m Arbeitshöhe: Sicherheitshinweise, Aufbauschema, GuardMatic-System und technische Daten.",
    categoryId: "leitern-gerueste",
    productIds: ["rollgeruest-krause-breitaufbau-9-4m"],
    type: "anleitung",
    pdfUrl: "/manuals/krause-fahrgeruest-stabilo-serie-10-anleitung-9-4m.pdf",
    tags: ["krause", "rollgerüst", "stabilo", "serie 10", "aufbau", "anleitung", "pdf", "9,4m", "fahrgerüst", "leitern-gerueste"],
    updatedAt: "2026-02-20",
  },
  {
    id: "krause-rollgeruest-stabilo-anleitung-5-4m",
    title: "Krause Rollgerüst STABILO Serie 10 – Aufbau- & Verwendungsanleitung 5,4 m (PDF)",
    description: "Offizielle Aufbau- und Verwendungsanleitung für das KRAUSE Fahrgerüst STABILO Serie 10 mit 5,4 m Arbeitshöhe: Sicherheitshinweise, Aufbauschema, GuardMatic-System und technische Daten.",
    categoryId: "leitern-gerueste",
    productIds: ["rollgeruest-krause-breitaufbau-5-4m"],
    type: "anleitung",
    pdfUrl: "/manuals/krause-fahrgeruest-stabilo-serie-10-anleitung-5-4m.pdf",
    tags: ["krause", "rollgerüst", "stabilo", "serie 10", "aufbau", "anleitung", "pdf", "5,4m", "fahrgerüst", "leitern-gerueste"],
    updatedAt: "2026-02-20",
  },
  {
    id: "krause-rollgeruest-stabilo-anleitung-7-4m",
    title: "Krause Rollgerüst STABILO Serie 10 – Aufbau- & Verwendungsanleitung 7,4 m (PDF)",
    description: "Offizielle Aufbau- und Verwendungsanleitung für das KRAUSE Fahrgerüst STABILO Serie 10 mit 7,4 m Arbeitshöhe: Sicherheitshinweise, Aufbauschema, GuardMatic-System und technische Daten.",
    categoryId: "leitern-gerueste",
    productIds: ["rollgeruest-krause-breitaufbau-7-4m"],
    type: "anleitung",
    pdfUrl: "/manuals/krause-fahrgeruest-stabilo-serie-10-anleitung-7-4m.pdf",
    tags: ["krause", "rollgerüst", "stabilo", "serie 10", "aufbau", "anleitung", "pdf", "7,4m", "fahrgerüst", "leitern-gerueste"],
    updatedAt: "2026-02-20",
  },
  {
    id: "krause-rollgeruest-4-4m-video",
    title: "Krause Rollgerüst Breitaufbau 4,4 m – Aufbau & Bedienung (Video)",
    description: "Video-Anleitung zum Aufbau und zur Bedienung des Krause Rollgerüsts Breitaufbau mit 4,4 m Arbeitshöhe und 2,00 × 1,50 m Arbeitsfläche.",
    categoryId: "leitern-gerueste",
    productIds: ["rollgeruest-krause-breitaufbau-4-4m"],
    type: "video",
    videoUrl: "https://www.youtube.com/watch?v=5tqZPFwN02c",
    tags: ["krause", "rollgerüst", "4,4m", "breitaufbau", "aufbau", "video", "fahrgerüst", "leitern-gerueste"],
    updatedAt: "2026-02-20",
  },
  {
    id: "krause-rollgeruest-3-3m-video",
    title: "Krause Rollgerüst 3,3 m – Aufbau & Bedienung (Video)",
    description: "Video-Anleitung zum Aufbau und zur Bedienung des Krause Rollgerüsts mit 3,3 m Arbeitshöhe und 2,00 × 1,20 m Arbeitsfläche.",
    categoryId: "leitern-gerueste",
    productIds: ["rollgeruest-krause-3-3m"],
    type: "video",
    videoUrl: "https://www.youtube.com/watch?v=5tqZPFwN02c",
    tags: ["krause", "rollgerüst", "3,3m", "aufbau", "video", "fahrgerüst", "leitern-gerueste"],
    updatedAt: "2026-02-20",
  },


  // Heizung & Trocknung
  {
    id: "allegra-bautrockner-kt553-anleitung",
    title: "Allegra Bautrockner KT553/KT554 – Bedienungsanleitung (PDF)",
    description: "Offizielle Bedienungsanleitung für den Allegra Bautrockner KT553/KT554: Inbetriebnahme, Sicherheitshinweise, Schlauchanschluss, MID-Stromzähler und technische Daten.",
    categoryId: "heizung-trocknung",
    productIds: ["bautrockner-kt553"],
    type: "anleitung",
    pdfUrl: "/manuals/allegra-bautrockner-kt553-anleitung.pdf",
    tags: ["allegra", "bautrockner", "kt553", "kt554", "entfeuchtung", "trocknung", "anleitung", "pdf", "stromzähler", "mid"],
    updatedAt: "2026-02-20",
  },
  {
    id: "allegra-bautrockner-kt200-anleitung",
    title: "Allegra Bautrockner KT200 – Bedienungsanleitung (PDF)",
    description: "Offizielle Bedienungsanleitung für den Allegra Bautrockner KT200: Inbetriebnahme, Sicherheitshinweise, Schlauchanschluss, MID-Stromzähler und technische Daten.",
    categoryId: "heizung-trocknung",
    productIds: ["bautrockner-kt200"],
    type: "anleitung",
    pdfUrl: "/manuals/allegra-bautrockner-kt200-anleitung.pdf",
    tags: ["allegra", "bautrockner", "kt200", "entfeuchtung", "trocknung", "anleitung", "pdf", "stromzähler", "mid"],
    updatedAt: "2026-02-20",
  },

  {
    id: "mietablauf-erklaert",
    title: "Der Mietablauf bei SLT Rental",
    description: "Von der Reservierung bis zur Rückgabe: So läuft eine Miete bei uns ab.",
    categoryId: "allgemein",
    type: "faq",
    tags: ["mietablauf", "reservierung", "rückgabe", "übergabe"],
    updatedAt: "2026-02-08",
  },
  {
    id: "transport-lieferung",
    title: "Transport & Lieferung – Was ist zu beachten?",
    description: "Selbstabholung vs. Lieferung, Laderampe, Zufahrt und Transportversicherung.",
    categoryId: "allgemein",
    type: "faq",
    tags: ["transport", "lieferung", "abholung", "lkw"],
    updatedAt: "2026-02-08",
  },
  {
    id: "schaden-melden",
    title: "Schaden melden – Was tun bei Beschädigung?",
    description: "Vorgehensweise bei Schäden, Dokumentation und Versicherungsfragen.",
    categoryId: "allgemein",
    type: "faq",
    tags: ["schaden", "beschädigung", "versicherung", "meldung"],
    updatedAt: "2026-02-08",
  },
  // Eventtechnik – Pioneer CDJ 2000 NXS
  {
    id: "pioneer-cdj2000-nxs-anleitung",
    title: "Pioneer CDJ 2000 NXS – Bedienungsanleitung",
    description: "Offizielle Bedienungsanleitung (DE) für den Pioneer CDJ-2000 NXS Multiplayer.",
    categoryId: "event-technik",
    productIds: ["pioneer-cdj2000-nxs"],
    type: "anleitung",
    pdfUrl: "/manuals/pioneer-cdj2000-nxs-bedienungsanleitung.pdf",
    tags: ["pioneer", "cdj", "2000", "nxs", "multiplayer", "dj", "anleitung"],
    updatedAt: "2026-02-20",
  },
  // Eventtechnik – D.A.S. Audio Vantec 18A
  {
    id: "das-vantec-18a-anleitung",
    title: "D.A.S. Audio Vantec 18A – Bedienungsanleitung",
    description: "Offizielle Bedienungsanleitung für den aktiven 18\" Subwoofer D.A.S. Audio Vantec 18A.",
    categoryId: "event-technik",
    productIds: ["das-vantec-18a"],
    type: "anleitung",
    pdfUrl: "/manuals/das-vantec-18a-bedienungsanleitung.pdf",
    tags: ["das", "das audio", "vantec", "18a", "subwoofer", "anleitung"],
    updatedAt: "2026-02-20",
  },
  // Eventtechnik – Sennheiser Funkmikrofon XSW 1
  {
    id: "sennheiser-xsw1-anleitung",
    title: "Sennheiser XSW 1-835 – Bedienungsanleitung",
    description: "Offizielle Bedienungsanleitung für das Sennheiser Funkmikrofon-Set XSW 1-835.",
    categoryId: "event-technik",
    productIds: ["funkmikrofon"],
    type: "anleitung",
    pdfUrl: "/manuals/sennheiser-xsw1-bedienungsanleitung.pdf",
    tags: ["sennheiser", "xsw", "funkmikrofon", "mikrofon", "anleitung"],
    updatedAt: "2026-02-20",
  },

  // Aggregate
  {
    id: "doosan-g20-g50-g80-g100-betriebsanleitung",
    title: "Doosan G20 / G50 / G80 / G100 – Betriebsanleitung (PDF)",
    description: "Offizielle Betriebsanleitung für die Doosan Diesel-Stromaggregate der G-Serie (G20, G30, G40): Sicherheitshinweise, Inbetriebnahme, Bedienung, Wartung und technische Daten.",
    categoryId: "aggregate",
    productIds: ["aggregat-20kva", "aggregat-50kva", "aggregat-80kva", "aggregat-100kva", "bonn-aggregat-20kva"],
    type: "anleitung",
    pdfUrl: "/manuals/doosan-g20-g30-g40-betriebsanleitung.pdf",
    tags: ["doosan", "g20", "g50", "g80", "g100", "aggregat", "stromerzeuger", "betriebsanleitung", "anleitung", "pdf", "diesel", "stage-v"],
    updatedAt: "2026-02-20",
  },

  // Hüpfburgen
  {
    id: "huepfburg-aufbau-sicherheit",
    title: "Hüpfburg aufbauen, nutzen & abbauen – Sicherheitsanleitung",
    description: "Schritt-für-Schritt-Anleitung für den sicheren Auf- und Abbau sowie Betrieb von Hüpfburgen. Inkl. Checkliste und Haftungshinweis.",
    categoryId: "event-technik",
    productIds: [
      "huepfburg-lamar", "huepfburg-wasserpark", "huepfburg-rollercoaster-1",
      "huepfburg-clown", "huepfburg-rollercoaster-2",
      "bonn-huepfburg-lamar", "bonn-huepfburg-wasserpark",
    ],
    type: "sicherheit",
    tags: ["hüpfburg", "aufbau", "abbau", "sicherheit", "kinder", "gebläse", "verankerung", "din en 14960", "bouncy castle"],
    updatedAt: "2026-03-05",
    sections: [
      {
        type: "warning",
        icon: "AlertTriangle",
        heading: "Wichtiger Hinweis",
        text: "Hüpfburgen sind spaßige Mietgeräte, erfordern aber präzisen Auf- und Abbau sowie strenge Sicherheitsregeln, um Unfälle zu vermeiden. Bitte lesen Sie diese Anleitung vollständig, bevor Sie die Hüpfburg in Betrieb nehmen.",
      },
      {
        icon: "MapPin",
        heading: "1. Standortwahl und Vorbereitung",
        items: [
          "Wählen Sie eine ebene Fläche ohne Gefälle (max. 5 %), idealerweise Rasen, Asphalt oder Beton – Schotter vermeiden, da er den Boden beschädigt.",
          "Räumen Sie Steine, Äste, Glas oder andere spitze Gegenstände weg und legen Sie die mitgelieferte Unterlegplane aus.",
          "Schaffen Sie eine Sicherheitszone: Mind. 1,8 m an den Seiten, 3,5 m am Eingang und freien Luftraum über der Burg (keine Bäume, Leitungen).",
        ],
      },
      {
        icon: "ClipboardCheck",
        heading: "2. Aufbau – Schritt für Schritt",
        items: [
          "Rollen Sie die Hüpfburg auf der Plane aus und schließen Sie alle Reiß- und Klettverschlüsse fest.",
          "Verbinden Sie den Lufteinfüllschlauch mit dem Gebläse und fixieren Sie ihn mit Spanngurten – vermeiden Sie Knicke.",
          "Stecken Sie das Gebläse in eine separate Steckdose (16 A / 220 V) und schalten Sie es ein; die Burg bläht sich in 3–5 Minuten auf.",
          "Sobald prall aufgeblasen, sofort an allen Ösen verankern: Erdnägel (45°-Winkel) in weichen Untergrund oder Wassersäcke auf hartem Boden.",
          "Letzte Kontrolle: Burg stabil, Gebläse läuft durchgehend, keine Risse oder lockere Teile.",
        ],
      },
      {
        type: "tip",
        icon: "Lightbulb",
        heading: "Tipp",
        text: "Bei Windstärke > 4 (Böen > 20 km/h) die Hüpfburg abbauen oder zusätzlich sichern.",
      },
      {
        icon: "Eye",
        heading: "3. Nutzungshinweise während des Betriebs",
        items: [
          "Ständige Aufsicht durch Erwachsene – keine Ausnahme!",
          "Schuhe ausziehen, keine spitzen Gegenstände, Essen oder Getränke mitnehmen.",
          "Maximale Kinderzahl und Gewichtsbeschränkung laut Herstellerangabe beachten – keine Erwachsenen auf der Burg.",
          "Bei Regen pausieren (Rutschgefahr), bei Blitz oder starkem Wind sofort räumen und Gebläse abschalten.",
        ],
      },
      {
        icon: "Package",
        heading: "4. Abbau – Schritt für Schritt",
        items: [
          "Alle Kinder entfernen, Gebläse ausschalten und Stecker ziehen. 5–10 Minuten warten, bis die Luft entwichen ist.",
          "Alle Verankerungen (Nägel, Seile) lösen und beiseitelegen.",
          "Hüpfburg eng zur Einfüllseite rollen (2 Personen ideal: einer rollt, einer drückt Luft raus). Schläuche hineindrücken und mit Gurtband sichern.",
          "Burg sauber machen (nicht über den Boden schleifen), falten und transportbereit verpacken.",
        ],
      },
      {
        type: "info",
        icon: "ClipboardCheck",
        heading: "5. Sicherheits-Checkliste",
        table: {
          headers: ["Prüfpunkt", "Muss so sein", "Bei Problem …"],
          rows: [
            ["Untergrund", "Eben, sauber, Plane darunter", "Neu positionieren"],
            ["Verankerung", "Alle Punkte fixiert, stabil", "Nachsichern / abbauen"],
            ["Gebläse", "Läuft kontinuierlich, kein Knick", "Prüfen / stromfrei machen"],
            ["Aufsicht", "Immer Erwachsener dabei", "Betrieb sofort stoppen"],
            ["Wind", "< Windstärke 5, keine Böen", "Abbauen"],
          ],
        },
      },
      {
        type: "legal",
        icon: "AlertCircle",
        heading: "Haftungshinweis für Mieter",
        text: "Der Mieter haftet für ordnungsgemäßen Auf-/Abbau und Nutzung nach Herstelleranleitung sowie DIN EN 14960. Schäden durch Fehlanwendung (z. B. ungesicherter Aufbau, Überladung) gehen zu Mieterkosten. Bei Unsicherheit: Rufen Sie uns an!",
      },
    ],
  },
];

// Helper: Get articles for a category
export function getArticlesForCategory(categoryId: string): KBArticle[] {
  return kbArticles.filter((a) => a.categoryId === categoryId);
}

// Helper: Search articles
export function searchArticles(query: string): KBArticle[] {
  if (!query.trim()) return [];
  const term = query.toLowerCase().trim();
  return kbArticles.filter(
    (a) =>
      a.title.toLowerCase().includes(term) ||
      a.description.toLowerCase().includes(term) ||
      a.tags.some((t) => t.toLowerCase().includes(term))
  );
}

// Helper: Get type label
export function getArticleTypeLabel(type: KBArticle["type"]): string {
  switch (type) {
    case "anleitung": return "Anleitung";
    case "video": return "Video";
    case "faq": return "FAQ";
    case "sicherheit": return "Sicherheit";
  }
}

// Helper: Get type color classes
export function getArticleTypeColor(type: KBArticle["type"]): string {
  switch (type) {
    case "anleitung": return "bg-primary/10 text-primary";
    case "video": return "bg-accent/10 text-accent-foreground";
    case "faq": return "bg-muted text-muted-foreground";
    case "sicherheit": return "bg-destructive/10 text-destructive";
  }
}
