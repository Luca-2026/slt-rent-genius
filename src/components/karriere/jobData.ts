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
  minijob?: boolean;
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
    shortPitch: "Dein Minijob in Krefeld oder Bonn: 20 € brutto pro Stunde für Lieferungen, Rücknahmen und Materialpflege – mit flexibler Zeiteinteilung und vollständiger Einarbeitung.",
    locations: [DEFAULT_LOC_KREFELD, DEFAULT_LOC_BONN],
    employmentType: ["PART_TIME"],
    minijob: true,
    datePosted: "2026-10-02",
    validThrough: "2027-02-28",
    industry: "Vermietung & Logistik",
    salaryMin: 20,
    salaryMax: 20,
    salaryUnit: "HOUR",
    tasks: [
      "Auslieferung und Abholung von Baumaschinen, Anhängern und Eventtechnik ab Krefeld oder Bonn",
      "Sicheres Verladen und Sichern der Mietgegenstände",
      "Kurze Einweisung der Kunden vor Ort",
      "Rücknahme von Mietgegenständen am Standort und Dokumentation ihres Zustands",
      "Reinigung, Materialpflege und Vorbereitung von Mietgegenständen für den nächsten Einsatz",
      "Pflege und Sichtprüfung von Fahrzeug und Anhänger",
      "Passende Aufträge über unser digitales Vermiet-System übernehmen und den Ablauf dokumentieren",
    ],
    seoTitle: "Minijob Lieferfahrer (m/w/d) Bonn & Krefeld – 20 €/Std.",
    seoDescription: "Minijob in Bonn oder Krefeld: 20 € brutto/Std., Lieferungen, Rücknahmen und Materialpflege. Flexible Arbeitszeiten, Einarbeitung und Jahresbonus.",
    faqs: [
      { question: "Brauche ich Vorerfahrung mit Baumaschinen?", answer: "Nein. Wichtig sind Führerschein BE, handwerkliches Geschick und Motivation. Wir arbeiten dich vollständig in Transporte, Rücknahmen, Materialpflege und unser digitales Vermiet-System ein." },
      { question: "Wie viel darf ich im Minijob verdienen?", answer: "2026 liegt die Verdienstgrenze bei durchschnittlich 603 € brutto im Monat beziehungsweise 7.236 € bei zwölfmonatiger Beschäftigung. Ab 1. Januar 2027 sind es 633 € monatlich beziehungsweise 7.596 € jährlich. Bei 20 € brutto pro Stunde entsprechen 603 € rechnerisch 30,15 Stunden pro Monat ohne Bonus. Vorhersehbare Sonderzahlungen wie der Jahresbonus sind bei der Verdienstplanung zu berücksichtigen; deshalb stimmen wir Stundenumfang und Bonus gemeinsam ab." },
      { question: "Wie flexibel sind die Arbeitszeiten?", answer: "Du kannst dir deine Arbeitszeit nach Absprache flexibel einteilen und passende Aufträge über unser digitales Vermiet-System übernehmen. Vereinbarte Liefer- und Rücknahmetermine bleiben verbindlich." },
      { question: "Bekomme ich als Minijobber auch einen Bonus?", answer: "Ja. Wir schütten jährlich einen vom Unternehmenserfolg abhängigen Bonus aus – auch an Minijobber. Du gehörst als vollwertiges Mitglied zum Team und erhältst eine vollständige Einarbeitung. Die Bonushöhe hängt vom Unternehmenserfolg ab; bei der Planung beachten wir die geltende Minijob-Verdienstgrenze." },
    ],
    title: "Auslieferungsfahrer / Auslieferungsfahrerin (m/w/d) – Minijob",
    location: "Krefeld und Bonn",
    type: "Minijob",
    startDate: "ab sofort",
    description: "Für unsere Standorte Bonn und Krefeld suchen wir motivierte Auslieferungsfahrer und Auslieferungsfahrerinnen auf Minijob-Basis für 20 € brutto pro Stunde. Bei uns geht es nicht nur ums Fahren: Du lieferst Mietgegenstände wie Baumaschinen, Arbeitsbühnen und Eventtechnik aus, nimmst sie zurück und kümmerst dich um Reinigung, Materialpflege und die Vorbereitung für den nächsten Einsatz. Du bist ein vollwertiges Teammitglied und wirst vollständig eingearbeitet. Deine Arbeitszeit kannst du nach Absprache flexibel einteilen und passende Aufträge über unser digitales Vermiet-System übernehmen. Zusätzlich schütten wir jährlich einen unternehmensabhängigen Bonus aus – auch für Minijobber. Die Minijob-Verdienstgrenze beträgt 2026 durchschnittlich 603 € brutto monatlich (7.236 € bei zwölf Monaten), ab 2027 633 € monatlich (7.596 € jährlich). Vorhersehbare Bonuszahlungen berücksichtigen wir bei der gemeinsamen Stunden- und Verdienstplanung.",
    requirements: [
      "Führerschein der Klasse BE (Pflichtvoraussetzung)",
      "Handwerkliches Geschick, Motivation und Freude am Anpacken",
      "Technisches Verständnis und Verantwortungsbewusstsein",
      "Zuverlässigkeit und gepflegtes Auftreten",
      "Gute Deutschkenntnisse"
    ],
    benefits: [
      "20 € brutto pro Stunde auf Minijob-Basis",
      "Flexible Zeiteinteilung nach Absprache, passend zu vereinbarten Kundenterminen",
      "Auftragsübernahme über unser digitales Vermiet-System",
      "Jährlicher, vom Unternehmenserfolg abhängiger Bonus – auch für Minijobber",
      "Vollwertige Zugehörigkeit zum Team und vollständige Einarbeitung",
      "Abwechslungsreiche Tätigkeit in einem familiären Team",
      "Gemeinsame Stunden- und Bonusplanung innerhalb der geltenden Minijob-Verdienstgrenze"
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
        options: ["Minijob – feste Zeiten nach Absprache", "Minijob – flexible Zeiten nach Absprache"],
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
    id: "standortmitarbeiter-bonn",
    slug: "standortmitarbeiter-vermietung-bonn",
    title: "Standortmitarbeiter (m/w/d) für das Tagesgeschäft in Bonn",
    shortPitch: "Pack mit an in Bonn: Mietgegenstände herausgeben und zurücknehmen, Angebote erstellen und Auslieferungen übernehmen – mit modernen digitalen Tools und Aufstiegsmöglichkeiten.",
    location: "Bonn",
    locations: [DEFAULT_LOC_BONN],
    type: "Arbeitszeit nach Absprache",
    employmentType: ["OTHER"],
    startDate: "nach Absprache",
    datePosted: "2026-11-10",
    validThrough: "2027-02-28",
    industry: "Vermietung / Standortbetrieb",
    seoTitle: "Standortmitarbeiter Vermietung (m/w/d) Bonn | SLT Rental",
    seoDescription: "Standortmitarbeiter in Bonn gesucht: Mietgeräte ausgeben und zurücknehmen, Angebote erstellen, ausliefern. BE-Pflicht, Bonus und Aufstiegsmöglichkeiten.",
    description: "Für unseren Standort Bonn suchen wir einen motivierten Standortmitarbeiter (m/w/d), der das Tagesgeschäft übernimmt. Du bist für unsere Kunden da, gibst Mietgegenstände heraus, nimmst sie zurück, erstellst Angebote und übernimmst Auslieferungen. Dabei arbeitest du mit modernen digitalen Tools und unserem digitalen Vermiet-System. Ein Führerschein der Klasse BE ist Pflicht. Dich erwarten flache Hierarchien, ein cooles, junges Team, flexible Arbeitszeiten nach Absprache und die Möglichkeit, dich weiterzuentwickeln und aufzusteigen.",
    tasks: [
      "Herausgabe von Mietgegenständen und Einweisung unserer Kunden",
      "Rücknahme von Mietgegenständen, Zustandsprüfung und digitale Dokumentation",
      "Kundenberatung und Angebotserstellung im Tagesgeschäft",
      "Auslieferung und Abholung von Mietgegenständen einschließlich sicherer Verladung und Ladungssicherung",
      "Materialpflege und Vorbereitung der Mietgegenstände für den nächsten Einsatz",
      "Organisation und Bearbeitung der Aufträge mit unserem digitalen Vermiet-System",
    ],
    requirements: [
      "Führerschein der Klasse BE (Pflichtvoraussetzung)",
      "Motivation, handwerkliches Geschick und technisches Verständnis",
      "Freundlicher Kundenkontakt, Zuverlässigkeit und Verantwortungsbewusstsein",
      "Selbstständige Arbeitsweise und Freude an abwechslungsreichen Aufgaben",
      "Offenheit für moderne digitale Tools und Teamarbeit",
    ],
    benefits: [
      "Attraktive Bonusregelung mit jährlichem, vom Unternehmenserfolg abhängigem Bonus",
      "Flache Hierarchien und kurze Entscheidungswege",
      "Ein cooles, junges Team, in dem du vollwertig dazugehörst",
      "Vollständige Einarbeitung in Mietgegenstände, Abläufe und digitale Tools",
      "Moderne digitale Tools und unser digitales Vermiet-System",
      "Flexible Arbeitszeiten nach Absprache und abgestimmt auf das Tagesgeschäft",
      "Möglichkeiten zur Weiterentwicklung und zum Aufstieg",
    ],
    faqs: [
      { question: "An welchem Standort arbeite ich?", answer: "Die Stelle ist für unseren Standort Bonn ausgeschrieben. Dort übernimmst du das Tagesgeschäft rund um die Vermietung und die Betreuung unserer Kunden." },
      { question: "Welchen Führerschein brauche ich?", answer: "Der Führerschein Klasse BE ist Pflicht, da Auslieferungen und Abholungen mit Anhänger zu deinen Aufgaben gehören." },
      { question: "Wie flexibel sind die Arbeitszeiten?", answer: "Deine Arbeitszeiten stimmen wir gemeinsam ab. Dabei berücksichtigen wir das Tagesgeschäft und die vereinbarten Kunden- und Liefertermine." },
    ],
    specificFields: [
      { id: "preferredLocation", label: "Standort", type: "select", options: ["Bonn"], required: true },
      { id: "driversLicense", label: "Führerschein Klasse BE vorhanden?", type: "select", options: ["Ja", "Nein, aber in Planung", "Nein"], required: true },
      { id: "rentalExperience", label: "Erfahrung in Vermietung oder Kundenbetreuung", type: "select", options: ["Keine", "Unter 2 Jahre", "2–5 Jahre", "Über 5 Jahre"], required: false },
    ],
    askSalary: true,
    askEarliestStart: true,
    askDriversLicense: true,
    askExperience: true,
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
