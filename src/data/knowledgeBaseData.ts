// Knowledge Base data structure

export interface KBArticleSection {
  heading?: string;
  icon?: string; // lucide icon name
  type?: "info" | "warning" | "tip" | "legal";
  text?: string;
  items?: string[];
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
    articleCount: 0,
  },
  {
    id: "erdbewegung",
    title: "Erdbewegung",
    description: "Betriebsanleitungen für Minibagger, Radlader, Dumper und Anbaugeräte.",
    icon: "HardHat",
    articleCount: 0,
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
    articleCount: 0,
  },
  {
    id: "event-technik",
    title: "Eventtechnik",
    description: "Aufbauanleitungen für Beschallung, Beleuchtung, Bühne und Zelte.",
    icon: "PartyPopper",
    articleCount: 6,
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
    title: "24/7 Anhängermiete – So funktioniert das Codesystem",
    description: "Schritt-für-Schritt: SMS-Code erhalten, Schloss öffnen, Anhänger abholen und zurückgeben.",
    categoryId: "anhaenger",
    type: "anleitung",
    tags: ["codesystem", "24/7", "sms", "schloss", "selbstbedienung"],
    updatedAt: "2026-02-08",
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
    title: "Minibagger – Ersteinweisung & Bedienung",
    description: "Grundlagen der Minibagger-Bedienung: Steuerung, Sicherheitshinweise und typische Fehler.",
    categoryId: "erdbewegung",
    type: "anleitung",
    tags: ["minibagger", "einweisung", "steuerung", "bobcat", "xcmg"],
    updatedAt: "2026-02-08",
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
    description: "Einstellungen, Betriebsstoffe und optimale Verdichtungstechnik.",
    categoryId: "verdichtung",
    type: "anleitung",
    tags: ["rüttelplatte", "verdichtung", "pflaster", "erde"],
    updatedAt: "2026-02-08",
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
