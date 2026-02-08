// Knowledge Base data structure
// Articles/videos will be added later by the team

export interface KBArticle {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  productIds?: string[]; // Links to rental product IDs
  type: "anleitung" | "video" | "faq" | "sicherheit";
  content?: string; // Markdown content (added later)
  videoUrl?: string; // YouTube/video embed URL (added later)
  pdfUrl?: string; // PDF download link (added later)
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
    articleCount: 0,
  },
  {
    id: "aggregate",
    title: "Aggregate & Stromversorgung",
    description: "Bedienung und Sicherheitsregeln für Stromerzeuger und Notstromgeräte.",
    icon: "Zap",
    articleCount: 0,
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
    articleCount: 0,
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
    description: "Ladungssicherung nach StVO: So beladen und sichern Sie Ihren Mietanhänger korrekt.",
    categoryId: "anhaenger",
    type: "anleitung",
    tags: ["ladungssicherung", "beladen", "zurrgurte", "stvo"],
    updatedAt: "2026-02-08",
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

  // Allgemein
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
