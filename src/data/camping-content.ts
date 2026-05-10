// Content + JSON-LD for the new flat /camping URLs.
// Kept as a separate data file so the same content powers both the
// React pages (runtime) and the build-time prerender (Node).

export const CAMPING_CATEGORY = {
  path: "/camping",
  title: "Wohnwagen & Camper mieten in NRW – Krefeld, Bonn, Mülheim",
  description:
    "Wohnwagen mieten in Krefeld, Bonn und Mülheim an der Ruhr. Familientaugliche Caravans mit Dusche und WC ab 50 €/Tag. Jetzt unverbindlich anfragen bei SLT Rental.",
  h1: "Camping & Wohnwagen mieten in NRW",
  intro: [
    "Du planst einen Familienurlaub, ein verlängertes Festival-Wochenende oder einen spontanen Trip ins Grüne? Bei SLT Rental mietest du moderne Wohnwagen direkt aus dem Rhein-Ruhr-Gebiet – einfach, transparent und ohne lange Wege. Unsere Caravans stehen an drei Standorten in Nordrhein-Westfalen bereit: Krefeld am Niederrhein, Bonn am Rhein und Mülheim an der Ruhr.",
    "Damit erreichst du uns aus dem gesamten Ballungsraum schnell. Wer einen Wohnwagen mieten in Krefeld möchte, ist auch aus Düsseldorf, Duisburg, Mönchengladbach oder Neuss in unter 30 Minuten bei uns. Für Wohnwagen mieten in Bonn liegen Köln, Leverkusen, Sankt Augustin und das Bergische Land in unmittelbarer Nähe. Am Standort Wohnwagen mieten in Mülheim an der Ruhr decken wir das mittlere Ruhrgebiet bis Essen, Oberhausen, Duisburg und Bottrop ab.",
    "Unser aktueller Flotten-Star ist der Weinsberg CaraOne 480 QDK – ein familientauglicher Caravan mit bis zu 5 Schlafplätzen, vollwertiger Nasszelle mit Dusche und WC, Truma-Heizung und Mover für einfaches Rangieren. Im Mietpreis enthalten sind die voll ausgestattete Küche, eine 11-kg-Gasflasche, Strom- und Wasseranschlusskabel, Spiegelverlängerung sowie die Vollkaskoversicherung.",
    "Die Mindestmietdauer beträgt 5 Tage, die Endreinigung pauschal 149 €, die Tagesmiete startet ab 50 € pro Tag. Sende uns eine unverbindliche Mietanfrage – wir melden uns innerhalb von 24 Stunden mit einem konkreten Angebot für deinen Wunschtermin.",
  ],
} as const;

export const CARAONE_PRODUCT = {
  path: "/camping/weinsberg-caraone-480-qdk",
  slug: "weinsberg-caraone-480-qdk",
  name: "Weinsberg CaraOne 480 QDK",
  title: "Weinsberg CaraOne 480 QDK mieten ab 50 €/Tag – SLT Rental NRW",
  description:
    "Weinsberg CaraOne 480 QDK Wohnwagen mieten in Krefeld, Bonn und Mülheim. 5 Schlafplätze, Dusche, WC, Heizung. Ab 50 €/Tag. Mindestmietdauer 5 Tage. Jetzt anfragen.",
  h1: "Weinsberg CaraOne 480 QDK – Wohnwagen mieten in Krefeld, Bonn & Mülheim",
  intro: [
    "Du suchst einen familientauglichen Wohnwagen zum Mieten in NRW? Der Weinsberg CaraOne 480 QDK ist unser Allround-Caravan für bis zu 5 Personen – kompakt genug für jedes Zugfahrzeug ab 1.500 kg Anhängelast, komfortabel ausgestattet mit Dusche, WC und Heizung.",
    "Verfügbar an unseren Standorten in Krefeld, Bonn und Mülheim an der Ruhr. Ideal für Familienurlaube, Festival-Trips, Campingplätze an der Mosel, in den Niederlanden oder am Gardasee.",
  ],
  pricePerDay: "ab 50 € / Tag",
  cleaningFee: "149 € Endreinigung",
  minRentalDuration: "5 Tage",
  deposit: "800 €",
} as const;

export const CARAONE_FAQS: { q: string; a: string }[] = [
  {
    q: "Was kostet es, den Weinsberg CaraOne 480 QDK bei SLT Rental zu mieten?",
    a: "Die Tagesmiete beginnt bei 50 € pro Tag. Hinzu kommen 149 € Endreinigungsgebühr und eine Kaution von 800 €. Die Mindestmietdauer beträgt 5 Tage. Längere Mietzeiträume und Saisonpreise sind auf Anfrage möglich.",
  },
  {
    q: "Wo kann ich in NRW einen Wohnwagen mieten?",
    a: "SLT Rental bietet die Anmietung des Weinsberg CaraOne 480 QDK an drei Standorten in Nordrhein-Westfalen: Krefeld (Hauptsitz), Bonn und Mülheim an der Ruhr. Damit decken wir den gesamten Großraum Düsseldorf, Köln, Bonn, Duisburg, Essen und die linksrheinischen Niederrhein-Regionen ab.",
  },
  {
    q: "Welchen Führerschein brauche ich, um den Wohnwagen zu ziehen?",
    a: "Der Weinsberg CaraOne 480 QDK hat ein zulässiges Gesamtgewicht von 1.500 kg. Je nach Zugfahrzeug-Gewicht reicht die Führerscheinklasse B mit Schlüssel 96 (B96) oder die Klasse BE. Reine B-Führerscheine genügen nur, wenn das Zugfahrzeug entsprechend leicht ist – wir prüfen das vor der Buchung gemeinsam mit dir.",
  },
  {
    q: "Für wie viele Personen ist der Wohnwagen geeignet?",
    a: "Der CaraOne 480 QDK bietet bis zu 5 Schlafplätze: ein Querbett im Bug, ein Etagenbett im Heck und die Mittelsitzgruppe lässt sich zum Doppelbett umbauen. Ideal für Familien mit zwei oder drei Kindern oder für eine Gruppe von bis zu vier Erwachsenen.",
  },
  {
    q: "Hat der Wohnwagen eine Dusche und Toilette?",
    a: "Ja. Der Weinsberg CaraOne 480 QDK verfügt über eine vollwertige Nasszelle mit Warmwasser-Dusche, Waschbecken und einem Thetford-Cassetten-WC. Damit bist du auch auf einfachen Stell- oder Naturplätzen ohne Sanitäranlagen unabhängig.",
  },
  {
    q: "Wie lange muss ich den Wohnwagen mindestens mieten?",
    a: "Die Mindestmietdauer beträgt 5 Tage. Damit decken wir typische Wochenend- plus Brückentag-Zeiträume ebenso ab wie eine kurze Familienreise. Längere Mietdauern (Wochen- oder Monatspreise) sind auf Anfrage verfügbar.",
  },
  {
    q: "Sind Haustiere im Wohnwagen erlaubt?",
    a: "Hunde sind nach Absprache und mit Aufpreis für die Endreinigung erlaubt. Bitte gib in der Mietanfrage Größe und Anzahl deiner Tiere an, damit wir die Buchung entsprechend bestätigen können.",
  },
  {
    q: "Was ist im Mietpreis enthalten und was kostet extra?",
    a: "Im Tagespreis enthalten sind die voll ausgestattete Küche, eine 11-kg-Gasflasche, Strom- und Wasseranschlusskabel, Spiegelverlängerung, eine ausführliche Einweisung sowie die Vollkaskoversicherung. Optional buchbar sind Vorzelt, Campingtisch und -stühle, Fahrradträger und Sat-Anlage.",
  },
  {
    q: "Kann ich auch in Düsseldorf, Köln oder Duisburg einen Wohnwagen mieten?",
    a: "Wir bedienen den gesamten Ballungsraum Rhein-Ruhr von unseren drei Standorten Krefeld, Bonn und Mülheim aus. Düsseldorf und Duisburg liegen in direkter Nachbarschaft zu Krefeld bzw. Mülheim, Köln und Leverkusen sind schnell von Bonn aus zu erreichen. Die Übergabe erfolgt am nächstgelegenen SLT-Standort.",
  },
  {
    q: "Wann ist der Wohnwagen verfügbar und wie buche ich?",
    a: "Die aktuelle Verfügbarkeit erfragst du bequem über unser Anfrageformular. Wir melden uns innerhalb von 24 Stunden mit einem konkreten Angebot. Hauptsaison (Juli–August, Schulferien NRW) ist erfahrungsgemäß früh ausgebucht – wir empfehlen eine Anfrage 8–12 Wochen vor Reisestart.",
  },
];

const BASE_URL = "https://www.slt-rental.de";

// JSON-LD blocks – consumed by both runtime <SEO> and build-time prerender.
export function buildCampingCategorySchemas(): Record<string, unknown>[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Camping & Wohnwagen mieten in NRW",
      description: CAMPING_CATEGORY.description,
      url: `${BASE_URL}${CAMPING_CATEGORY.path}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Startseite", item: `${BASE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Camping", item: `${BASE_URL}/camping` },
      ],
    },
  ];
}

export function buildCaraOneProductSchemas(): Record<string, unknown>[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Weinsberg CaraOne 480 QDK Wohnwagen Vermietung",
      category: "Wohnwagen / Caravan",
      brand: { "@type": "Brand", name: "Weinsberg" },
      model: "CaraOne 480 QDK",
      description:
        "Familientauglicher Wohnwagen mit Dusche, WC und 5 Schlafplätzen zur Vermietung in Nordrhein-Westfalen (Krefeld, Bonn, Mülheim an der Ruhr).",
      image: [
        `${BASE_URL}/images/camping/weinsberg-caraone-480-qdk-1.jpg`,
        `${BASE_URL}/images/camping/weinsberg-caraone-480-qdk-2.jpg`,
      ],
      offers: {
        "@type": "Offer",
        price: "50.00",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "50.00",
          priceCurrency: "EUR",
          unitCode: "DAY",
          referenceQuantity: { "@type": "QuantitativeValue", value: "1", unitCode: "DAY" },
        },
        availability: "https://schema.org/InStock",
        areaServed: [
          { "@type": "City", name: "Krefeld" },
          { "@type": "City", name: "Bonn" },
          { "@type": "City", name: "Mülheim an der Ruhr" },
        ],
        seller: {
          "@type": "Organization",
          name: "SLT Technology Group GmbH & Co. KG",
          url: BASE_URL,
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: CARAONE_FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Startseite", item: `${BASE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Camping", item: `${BASE_URL}/camping` },
        {
          "@type": "ListItem",
          position: 3,
          name: "Weinsberg CaraOne 480 QDK",
          item: `${BASE_URL}${CARAONE_PRODUCT.path}`,
        },
      ],
    },
  ];
}
