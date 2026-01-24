export interface JobSpecificField {
  id: string;
  label: string;
  type: "checkbox" | "select" | "text" | "textarea";
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

export interface JobListing {
  id: string;
  title: string;
  location: string;
  type: string;
  startDate: string;
  description: string;
  requirements: string[];
  benefits: string[];
  specificFields: JobSpecificField[];
  // Wizard customization
  askSalary: boolean;
  askEarliestStart: boolean;
  askDriversLicense?: boolean;
  askEducation?: boolean;
  askExperience?: boolean;
}

export const jobListings: JobListing[] = [
  {
    id: "lieferfahrer",
    title: "Aushilfe / Lieferfahrer (m/w/d) für Vermietgegenstände",
    location: "Krefeld",
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
    title: "Ausbildung Kaufmann / Kauffrau für Büromanagement (m/w/d)",
    location: "Krefeld oder Bonn",
    type: "Ausbildung",
    startDate: "01.08.2026",
    description: "Starte deine berufliche Zukunft bei SLT Rental! In deiner Ausbildung lernst du alle kaufmännischen Abläufe kennen – von der Angebotserstellung über die Kundenbetreuung bis zur Buchhaltung. Du arbeitest mit modernen digitalen Tools und bekommst Einblicke in spannende Projekte rund um Vermietung und Verkauf von Baumaschinen.",
    requirements: [
      "Mindestens mittlere Reife oder (Fach-)Abitur",
      "Interesse an kaufmännischen Prozessen und Organisation",
      "Gute Kommunikationsfähigkeit und Lernbereitschaft",
      "Zuverlässigkeit und Teamgeist"
    ],
    benefits: [
      "Abwechslungsreiche Ausbildung mit Verantwortung",
      "Hohe Übernahmechancen nach erfolgreichem Abschluss",
      "Moderne Arbeitsplätze und angenehmes Arbeitsumfeld"
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
        label: "Bevorzugter Standort",
        type: "select",
        options: ["Krefeld", "Bonn", "Egal"],
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
    title: "Baumaschinentechniker / Servicetechniker (m/w/d)",
    location: "Krefeld",
    type: "Vollzeit",
    startDate: "ab sofort",
    description: "Zur Verstärkung unseres Werkstattteams suchen wir einen erfahrenen Baumaschinentechniker (m/w/d). Du bist verantwortlich für Wartung, Reparatur und Instandhaltung unserer Baumaschinen und Mietgeräte. Deine Arbeit sorgt dafür, dass unsere Kunden stets zuverlässige Technik im Einsatz haben.",
    requirements: [
      "Abgeschlossene technische Ausbildung, z. B. als Land- und Baumaschinenmechatroniker",
      "Erfahrung in Wartung und Reparatur von Maschinen",
      "Selbstständige und sorgfältige Arbeitsweise",
      "Teamfähigkeit und Engagement"
    ],
    benefits: [
      "Unbefristeter Arbeitsplatz mit Entwicklungsmöglichkeiten",
      "Moderne Werkstatt mit hochwertiger Ausstattung",
      "Leistungsgerechte Vergütung und Weiterbildungsmöglichkeiten"
    ],
    specificFields: [
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
    title: "Vertriebsmitarbeiter (m/w/d) im Verkauf von Baumaschinen & Zubehör",
    location: "Homeoffice oder Büro in Bonn / Krefeld",
    type: "Vollzeit",
    startDate: "01.02.2026",
    description: "Zur Erweiterung unseres Vertriebsteams suchen wir einen engagierten Vertriebsmitarbeiter (m/w/d) für den Verkauf von Baumaschinen und Zubehör. Als offizieller Zoomlion-Vertragshändler in NRW bieten wir ein starkes Produktportfolio mit hervorragendem Preis-Leistungs-Verhältnis. Sie beraten Kunden kompetent, entwickeln Lösungen und begleiten den gesamten Verkaufsprozess.",
    requirements: [
      "Erfahrung im technischen Vertrieb, idealerweise im Bereich Baumaschinen oder Industrieprodukte",
      "Sicheres Auftreten und Verhandlungsgeschick",
      "Eigenständige, zielorientierte Arbeitsweise",
      "Gute MS-Office- und CRM-Kenntnisse"
    ],
    benefits: [
      "Attraktives Fixgehalt mit leistungsbezogener Vergütung",
      "Firmenwagen zur privaten Nutzung",
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
  }
];
