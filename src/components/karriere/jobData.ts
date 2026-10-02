export interface JobSpecificField {
  id: string;
  label: string;
  type: "checkbox" | "select" | "text" | "textarea";
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

export interface JobLocationDetail {
  city: string;
  postalCode: string;
  street: string;
  region?: string;
}

export interface JobListing {
  id: string;
  /** URL slug, defaults to id */
  slug: string;
  title: string;
  /** Short headline shown under H1 on detail page */
  shortPitch?: string;
  location: string;
  /** Structured locations for JSON-LD (one or many) */
  locations: JobLocationDetail[];
  type: string;
  /** Schema.org employmentType: FULL_TIME | PART_TIME | CONTRACTOR | TEMPORARY | INTERN | VOLUNTEER | PER_DIEM | OTHER */
  employmentType: ("FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "TEMPORARY" | "INTERN" | "OTHER")[];
  startDate: string;
  /** ISO date when posted (defaults to today at runtime if missing) */
  datePosted?: string;
  /** ISO date until which the posting is valid */
  validThrough?: string;
  description: string;
  /** Optional concrete day-to-day tasks list */
  tasks?: string[];
  requirements: string[];
  benefits: string[];
  /** Optional salary range in EUR per year */
  salaryMin?: number;
  salaryMax?: number;
  salaryUnit?: "YEAR" | "MONTH" | "HOUR";
  /** Allow remote work */
  remote?: boolean;
  /** SEO meta override */
  seoTitle?: string;
  seoDescription?: string;
  /** Industry / department */
  industry?: string;
  /** FAQ specifically for this role */
  faqs?: { question: string; answer: string }[];
  specificFields: JobSpecificField[];
  // Wizard customization
  askSalary: boolean;
  askEarliestStart: boolean;
  askDriversLicense?: boolean;
  askEducation?: boolean;
  askExperience?: boolean;
}

const DEFAULT_LOC_KREFELD: JobLocationDetail = {
  city: "Krefeld",
  postalCode: "47807",
  street: "Anrather Straße 291",
  region: "NRW",
};
const DEFAULT_LOC_BONN: JobLocationDetail = {
  city: "Bonn",
  postalCode: "53179",
  street: "Drachenburgstraße 8",
  region: "NRW",
};

export const jobListings: JobListing[] = [
  {
    id: "lieferfahrer",
    slug: "lieferfahrer-vermietung-krefeld-bonn",
    shortPitch: "Werde Teil unseres Logistik-Teams und liefere Baumaschinen, Anhänger & Equipment direkt zu unseren Kunden in NRW – in Krefeld oder Bonn.",
    locations: [DEFAULT_LOC_KREFELD, DEFAULT_LOC_BONN],
    employmentType: ["FULL_TIME", "PART_TIME"],
    datePosted: "2026-10-02",
    validThrough: "2027-02-28",
    industry: "Vermietung & Logistik",
    salaryMin: 14,
    salaryMax: 18,
    salaryUnit: "HOUR",
    tasks: [
      "Auslieferung und Abholung von Baumaschinen, Anhängern und Eventtechnik ab Krefeld oder Bonn",
      "Sicheres Verladen und Sichern der Mietgegenstände",
      "Kurze Einweisung der Kunden vor Ort",
      "Pflege und Sichtprüfung von Fahrzeug und Anhänger",
    ],
    seoTitle: "Lieferfahrer / Aushilfe (m/w/d) Krefeld & Bonn – SLT Rental",
    seoDescription: "Aushilfe / Lieferfahrer in Krefeld und Bonn gesucht. Baumaschinen & Anhänger ausliefern, BE-Führerschein erforderlich. Jetzt bei SLT Rental bewerben.",
    faqs: [
      { question: "Brauche ich Vorerfahrung mit Baumaschinen?", answer: "Nein. Wichtig sind Führerschein BE und technisches Interesse – wir arbeiten dich ein." },
      { question: "Ist eine Anstellung in Teilzeit möglich?", answer: "Ja, Vollzeit und Teilzeit sind möglich. Auch Aushilfen / Minijob auf Anfrage." },
    ],
    title: "Aushilfe / Lieferfahrer (m/w/d) für Vermietgegenstände",
    location: "Krefeld und Bonn",
    type: "Vollzeit / Aushilfe",
    startDate: "ab sofort",
    description: "Zur Unterstützung unseres Teams suchen wir eine motivierte Aushilfe für die Auslieferung und Abholung von Vermietgegenständen wie Baumaschinen, Arbeitsbühnen und Eventtechnik. Du bist verantwortlich für den sicheren Transport und sorgst für einen freundlichen Kundenkontakt vor Ort.",
    requirements: [
      "Führerschein der Klasse BE (Pflichtvoraussetzung)",
      "Technisches Verständnis und Verantwortungsbewusstsein",
      "Zuverlässigkeit und gepflegtes Auftreten",
      "Gute Deutschkenntnisse"
    ],
    benefits: [
      "Flexible Arbeitszeiten",
      "Abwechslungsreiche Tätigkeit in einem familiären Team",
      "Faire Vergütung und gute Einarbeitung"
    ],
    specificFields: [
      {
        id: "preferredLocation",
        label: "Für welchen Standort bewirbst du dich?",
        type: "select",
        options: ["Krefeld", "Bonn", "Krefeld oder Bonn"],
        required: true
      },
      {
        id: "driversLicense",
        label: "Führerschein Klasse BE vorhanden?",
        type: "select",
        options: ["Ja", "Nein, aber in Planung", "Nein"],
        required: true
      },
      {
        id: "availability",
        label: "Gewünschte Arbeitszeit",
        type: "select",
        options: ["Vollzeit", "Teilzeit", "Aushilfe / Minijob", "Flexibel"],
        required: true
      },
      {
        id: "transportExperience",
        label: "Erfahrung im Transport-/Lieferbereich",
        type: "select",
        options: ["Keine", "Unter 1 Jahr", "1-3 Jahre", "Über 3 Jahre"],
        required: false
      }
    ],
    askSalary: false,
    askEarliestStart: true,
    askDriversLicense: true
  },
  {
    id: "ausbildung-buero",
    slug: "ausbildung-kaufmann-bueromanagement-krefeld-bonn",
    shortPitch: "Starte deine Ausbildung mit modernsten KI-Tools, einem familiären Team und besten Übernahmechancen.",
    locations: [DEFAULT_LOC_KREFELD, DEFAULT_LOC_BONN],
    employmentType: ["FULL_TIME"],
    datePosted: "2026-10-02",
    validThrough: "2027-02-28",
    industry: "Kaufmännische Ausbildung",
    salaryMin: 950,
    salaryMax: 1300,
    salaryUnit: "MONTH",
    tasks: [
      "Mitarbeit in Auftragsabwicklung, Angebotserstellung und Buchhaltung",
      "Kundenkommunikation per Telefon und E-Mail",
      "Arbeit mit modernen ERP-, CRM- und KI-Tools",
      "Wechsel zwischen den Abteilungen Vermietung, Verkauf und Verwaltung",
    ],
    seoTitle: "Ausbildung Büromanagement (m/w/d) 2027 in Krefeld oder Bonn – SLT Rental",
    seoDescription: "Ausbildung zur Kauffrau/zum Kaufmann für Büromanagement bei SLT Rental in Krefeld oder Bonn. Start 01.01.2027, KI-Tools, beste Übernahmechancen.",
    faqs: [
      { question: "Wann startet die Ausbildung?", answer: "Der Ausbildungsstart ist der 01.01.2027. Ein späterer Einstieg ist nach Absprache möglich." },
      { question: "Welche Schulnoten erwartet ihr?", answer: "Wichtiger als Noten sind Motivation und Lernbereitschaft. Mittlere Reife oder höher sollte vorhanden sein." },
    ],
    title: "Ausbildung Kaufmann / Kauffrau für Büromanagement (m/w/d)",
    location: "Krefeld oder Bonn",
    type: "Ausbildung",
    startDate: "01.01.2027",
    description: "Starte deine berufliche Zukunft bei SLT Rental – einem der innovativsten Vermietungsunternehmen in NRW! In deiner Ausbildung lernst du alle kaufmännischen Abläufe kennen – von der Angebotserstellung über die Kundenbetreuung bis zur Buchhaltung. Dabei arbeitest du mit modernsten digitalen Tools und KI-gestützten Anwendungen, die unsere Prozesse effizienter machen. Du bekommst Einblicke in spannende Projekte rund um Vermietung und Verkauf von Baumaschinen und wirst gezielt im Umgang mit Künstlicher Intelligenz geschult – ein klarer Wettbewerbsvorteil für deine Karriere.",
    requirements: [
      "Mindestens mittlere Reife oder (Fach-)Abitur",
      "Interesse an kaufmännischen Prozessen, Digitalisierung und modernen Technologien",
      "Offenheit für neue Tools und KI-gestützte Arbeitsweisen",
      "Gute Kommunikationsfähigkeit und Lernbereitschaft",
      "Zuverlässigkeit und Teamgeist"
    ],
    benefits: [
      "Abwechslungsreiche Ausbildung mit Verantwortung ab Tag 1",
      "Gezielte Schulungen in KI-Tools und digitalen Geschäftsprozessen",
      "Hohe Übernahmechancen nach erfolgreichem Abschluss",
      "Moderne, digitale Arbeitsplätze und angenehmes Arbeitsumfeld"
    ],
    specificFields: [
      {
        id: "education",
        label: "Höchster Schulabschluss",
        type: "select",
        options: ["Hauptschulabschluss", "Mittlere Reife", "Fachabitur", "Abitur"],
        required: true
      },
      {
        id: "preferredLocation",
        label: "Für welchen Standort bewirbst du dich?",
        type: "select",
        options: ["Krefeld", "Bonn", "Krefeld oder Bonn"],
        required: true
      },
      {
        id: "practicalExperience",
        label: "Praktikumserfahrung im kaufmännischen Bereich?",
        type: "select",
        options: ["Ja", "Nein"],
        required: false
      },
      {
        id: "whyApprenticeship",
        label: "Warum interessierst du dich für diese Ausbildung?",
        type: "textarea",
        placeholder: "Erzähle uns, warum du diese Ausbildung machen möchtest...",
        required: true
      }
    ],
    askSalary: false,
    askEarliestStart: false,
    askEducation: true
  },
  {
    id: "servicetechniker",
    slug: "baumaschinentechniker-servicetechniker-krefeld-bonn",
    shortPitch: "Halte unsere Flotte von Mini- und Kompaktbaggern, Anhängern und Eventtechnik in Topform – moderne Werkstatt, faires Gehalt. In Krefeld oder Bonn, Vollzeit oder als Minijob.",
    locations: [DEFAULT_LOC_KREFELD, DEFAULT_LOC_BONN],
    employmentType: ["FULL_TIME", "PART_TIME"],
    datePosted: "2026-10-02",
    validThrough: "2027-02-28",
    industry: "Baumaschinentechnik / Werkstatt",
    salaryMin: 38000,
    salaryMax: 52000,
    salaryUnit: "YEAR",
    tasks: [
      "Wartung, Reparatur und Instandsetzung von Bau- und Mietmaschinen",
      "Fehlerdiagnose an Hydraulik-, Elektrik- und Motorsystemen",
      "Vorbereitung und Endkontrolle der Geräte vor Vermietung",
      "Dokumentation der Servicearbeiten",
    ],
    seoTitle: "Servicetechniker Baumaschinen (m/w/d) Krefeld & Bonn – SLT Rental",
    seoDescription: "Baumaschinentechniker (m/w/d) in Krefeld und Bonn gesucht – Vollzeit oder Minijob (22 €/Std.). Kfz-Mechaniker werden angelernt. Jetzt bei SLT Rental bewerben.",
    faqs: [
      { question: "Welche Hersteller bedient ihr?", answer: "Schwerpunkt LiuGong, Bobcat, Yanmar sowie diverse Anhänger- und Eventtechnik-Hersteller." },
      { question: "Kann ich auch als Minijob einsteigen?", answer: "Ja. Die Stelle bieten wir auch als geringfügig entlohnte Beschäftigung mit 22 € brutto pro Stunde an. Voraussetzung ist Erfahrung in der Wartung von Baumaschinen oder im Service an Anhängern – als Kfz-Mechaniker wirst du bei uns angelernt." },
      { question: "Gibt es Bereitschaftsdienste?", answer: "Nein. Wir arbeiten in geregelten Werkstattzeiten – planbar und familienfreundlich." },
    ],
    title: "Baumaschinentechniker / Servicetechniker (m/w/d)",
    location: "Krefeld und Bonn",
    type: "Vollzeit / Minijob",
    startDate: "ab sofort",
    description: "Zur Verstärkung unseres Werkstattteams suchen wir einen erfahrenen Baumaschinentechniker (m/w/d). Du bist verantwortlich für Wartung, Reparatur und Instandhaltung unserer Baumaschinen und Mietgeräte. Deine Arbeit sorgt dafür, dass unsere Kunden stets zuverlässige Technik im Einsatz haben. Die Stelle besetzen wir in Krefeld und in Bonn – in Vollzeit oder als geringfügig entlohnte Beschäftigung (Minijob) mit 22 € brutto pro Stunde.",
    requirements: [
      "Abgeschlossene technische Ausbildung, z. B. als Land- und Baumaschinenmechatroniker oder Kfz-Mechaniker",
      "Erfahrung in der Wartung von Baumaschinen oder im Service an Anhängern – Kfz-Mechaniker werden angelernt",
      "Selbstständige und sorgfältige Arbeitsweise",
      "Teamfähigkeit und Engagement"
    ],
    benefits: [
      "Vollzeit oder Minijob (geringfügig entlohnt, 22 € brutto pro Stunde)",
      "Unbefristeter Arbeitsplatz mit Entwicklungsmöglichkeiten",
      "Moderne Werkstatt mit hochwertiger Ausstattung",
      "Leistungsgerechte Vergütung und Weiterbildungsmöglichkeiten"
    ],
    specificFields: [
      {
        id: "preferredLocation",
        label: "Für welchen Standort bewirbst du dich?",
        type: "select",
        options: ["Krefeld", "Bonn", "Krefeld oder Bonn"],
        required: true
      },
      {
        id: "employmentModel",
        label: "Gewünschtes Arbeitsmodell",
        type: "select",
        options: ["Vollzeit", "Minijob (22 € brutto/Std.)", "Flexibel"],
        required: true
      },
      {
        id: "qualification",
        label: "Berufsabschluss",
        type: "select",
        options: [
          "Land- und Baumaschinenmechatroniker",
          "KFZ-Mechatroniker",
          "Industriemechaniker",
          "Andere technische Ausbildung"
        ],
        required: true
      },
      {
        id: "experienceYears",
        label: "Berufserfahrung im Bereich Baumaschinen",
        type: "select",
        options: ["Keine", "Unter 2 Jahre", "2-5 Jahre", "Über 5 Jahre"],
        required: true
      },
      {
        id: "specializations",
        label: "Besondere Kenntnisse (optional)",
        type: "text",
        placeholder: "z.B. Hydraulik, Elektrik, bestimmte Hersteller...",
        required: false
      }
    ],
    askSalary: true,
    askEarliestStart: true,
    askExperience: true
  },
  {
    id: "vertrieb",
    slug: "vertriebsmitarbeiter-baumaschinen-zoomlion-nrw",
    shortPitch: "Verkaufe als LiuGong-Händler in NRW – mit Firmenwagen, Homeoffice-Option und KI-gestützten Vertriebstools.",
    locations: [DEFAULT_LOC_KREFELD, DEFAULT_LOC_BONN],
    employmentType: ["FULL_TIME"],
    datePosted: "2026-10-02",
    validThrough: "2027-02-28",
    industry: "Vertrieb / Sales",
    salaryMin: 40000,
    salaryMax: 55000,
    salaryUnit: "YEAR",
    remote: true,
    tasks: [
      "Beratung und Verkauf von Baumaschinen und Zubehör (Schwerpunkt LiuGong)",
      "Eigenständige Bearbeitung des gesamten Verkaufsprozesses inkl. Angebot, Abschluss & Übergabe",
      "Aufbau und Pflege von Kundenbeziehungen in NRW",
      "Nutzung von CRM und KI-gestützten Vertriebstools",
    ],
    seoTitle: "Vertriebsmitarbeiter Baumaschinen (m/w/d) NRW – SLT Rental",
    seoDescription: "Vertriebsmitarbeiter (m/w/d) für LiuGong-Baumaschinen in NRW gesucht. Firmenwagen, Homeoffice, KI-gestützte Tools. Jetzt bei SLT Rental bewerben.",
    faqs: [
      { question: "Wo ist mein Einsatzgebiet?", answer: "Schwerpunkt Nordrhein-Westfalen mit den Standorten Krefeld und Bonn als Basis." },
      { question: "Gibt es einen Firmenwagen?", answer: "Ja, inklusive privater Nutzung." },
    ],
    title: "Vertriebsmitarbeiter (m/w/d) im Verkauf von Baumaschinen & Zubehör",
    location: "Homeoffice oder Büro in Bonn / Krefeld",
    type: "Vollzeit",
    startDate: "01.02.2026",
    description: "Zur Erweiterung unseres Vertriebsteams suchen wir einen engagierten Vertriebsmitarbeiter (m/w/d) für den Verkauf von Baumaschinen und Zubehör. Als LiuGong-Händler in NRW bieten wir ein starkes Produktportfolio mit hervorragendem Preis-Leistungs-Verhältnis. Sie nutzen KI-gestützte Vertriebstools und moderne CRM-Systeme, um Kunden kompetent zu beraten, datenbasierte Lösungen zu entwickeln und den gesamten Verkaufsprozess effizient zu begleiten. Durch den Einsatz von Künstlicher Intelligenz und digitalen Prozessen heben wir uns klar vom Wettbewerb ab.",
    requirements: [
      "Erfahrung im technischen Vertrieb, idealerweise im Bereich Baumaschinen, Industrieprodukte oder Vermietung",
      "Sicheres Auftreten und Verhandlungsgeschick",
      "Affinität zu digitalen Tools, KI-Anwendungen und datengetriebenem Vertrieb",
      "Eigenständige, zielorientierte Arbeitsweise",
      "Gute MS-Office- und CRM-Kenntnisse (z. B. HubSpot, Salesforce)"
    ],
    benefits: [
      "Attraktives Fixgehalt von 40.000 € – 55.000 € p. a. zzgl. attraktiver Boni und leistungsbezogener Vergütung",
      "Firmenwagen zur privaten Nutzung",
      "Schulungen in KI-gestützten Vertriebstools und modernen Technologien",
      "Betriebliche Altersvorsorge",
      "Flexible Arbeitsmöglichkeiten (Homeoffice oder Büro)"
    ],
    specificFields: [
      {
        id: "salesExperience",
        label: "Erfahrung im technischen Vertrieb",
        type: "select",
        options: ["Keine", "Unter 2 Jahre", "2-5 Jahre", "Über 5 Jahre"],
        required: true
      },
      {
        id: "industryKnowledge",
        label: "Branchenkenntnisse",
        type: "select",
        options: [
          "Baumaschinen",
          "Baubranche allgemein",
          "Andere technische Branche",
          "Keine spezifischen"
        ],
        required: true
      },
      {
        id: "workPreference",
        label: "Bevorzugte Arbeitsweise",
        type: "select",
        options: ["Überwiegend Homeoffice", "Überwiegend Büro", "Mix aus beidem"],
        required: true
      },
      {
        id: "crmExperience",
        label: "CRM-Erfahrung (optional)",
        type: "text",
        placeholder: "z.B. Salesforce, HubSpot, Pipedrive...",
        required: false
      }
    ],
    askSalary: true,
    askEarliestStart: true,
    askExperience: true
  },
  {
    id: "kundenberater-disponent",
    slug: "kundenberater-disponent-miete-verkauf-krefeld-bonn",
    shortPitch: "Sei erste Anlaufstelle für unsere Kunden – berate, kalkuliere und disponiere Baumaschinen, Anhänger & Equipment.",
    locations: [DEFAULT_LOC_KREFELD, DEFAULT_LOC_BONN],
    employmentType: ["FULL_TIME"],
    datePosted: "2026-10-02",
    validThrough: "2027-02-28",
    industry: "Kundenberatung / Disposition",
    salaryMin: 36000,
    salaryMax: 48000,
    salaryUnit: "YEAR",
    tasks: [
      "Beratung von Kunden vor Ort, am Telefon und per E-Mail",
      "Erstellung von Angeboten und Mietverträgen",
      "Disposition der Maschinen und Lieferungen zwischen den Standorten",
      "Schnittstelle zwischen Werkstatt, Vertrieb und Logistik",
    ],
    seoTitle: "Kundenberater / Disponent Vermietung (m/w/d) Krefeld & Bonn – SLT Rental",
    seoDescription: "Kundenberater / Disponent (m/w/d) für Miete & Verkauf in Krefeld oder Bonn gesucht. Faire Vergütung, modernes Team. Jetzt bei SLT Rental bewerben.",
    faqs: [
      { question: "An welchem Standort werde ich eingesetzt?", answer: "Du kannst dich für Krefeld oder Bonn entscheiden. Standortübergreifende Vertretung kann nach Absprache vorkommen." },
      { question: "Gibt es Wochenenddienste?", answer: "Samstag rotierend (8:00–14:30 Uhr) im Team. Sonntag bleibt frei." },
    ],
    title: "Kundenberater / Disponent im Bereich Miete und Verkauf (m/w/d)",
    location: "Krefeld und Bonn",
    type: "Vollzeit",
    startDate: "ab sofort",
    description: "Zur Verstärkung unseres Teams suchen wir ab sofort einen Kundenberater / Disponenten (m/w/d) für unsere Standorte in Krefeld und Bonn. Du berätst unsere Kunden im Tagesgeschäft rund um die Vermietung und den Verkauf von Baumaschinen, Baugeräten, Werkzeugen und Zubehör. Dabei übernimmst du die komplette Auftragsabwicklung – von der Kalkulation über die Angebotserstellung bis zur Koordination der Lieferungen.",
    requirements: [
      "Abgeschlossene kaufmännische oder technische Ausbildung",
      "Einschlägige Berufserfahrung aus einer ähnlichen Tätigkeit sowie technisches Verständnis",
      "Branchenkenntnisse aus dem Bereich Baumaschinen/-geräte oder Bau & Eventausstattung sind von Vorteil",
      "Ausgeprägte Serviceorientierung sowie Kommunikationsstärke",
      "EDV-Kenntnisse (MS-Office)"
    ],
    benefits: [
      "Vollzeit oder Minijob (geringfügig entlohnt, 22 € brutto pro Stunde)",
      "Unbefristeter Arbeitsplatz mit Entwicklungsmöglichkeiten",
      "Abwechslungsreiche Tätigkeit in einem wachsenden Unternehmen",
      "Moderne Arbeitsplätze und angenehmes Teamumfeld",
      "Leistungsgerechte Vergütung"
    ],
    specificFields: [
      {
        id: "preferredLocation",
        label: "Für welchen Standort bewirbst du dich?",
        type: "select",
        options: ["Krefeld", "Bonn", "Krefeld oder Bonn"],
        required: true
      },
      {
        id: "qualification",
        label: "Art der Ausbildung",
        type: "select",
        options: ["Kaufmännische Ausbildung", "Technische Ausbildung", "Studium", "Andere"],
        required: true
      },
      {
        id: "industryExperience",
        label: "Branchenerfahrung Baumaschinen / Bau / Event",
        type: "select",
        options: ["Keine", "Unter 2 Jahre", "2-5 Jahre", "Über 5 Jahre"],
        required: true
      },
      {
        id: "salesExperience",
        label: "Erfahrung in Vermietung oder Verkauf",
        type: "select",
        options: ["Keine", "Unter 2 Jahre", "2-5 Jahre", "Über 5 Jahre"],
        required: false
      }
    ],
    askSalary: true,
    askEarliestStart: true,
    askExperience: true
  }
];
