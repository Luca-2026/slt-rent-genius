export interface FeedbackQuestion {
  key: string;
  title: string;
  hint: string;
  textLabel: string;
}

/** 10 Fragen zum Mietprozess – je Sternebewertung + Freitextfenster. */
export const FEEDBACK_QUESTIONS: FeedbackQuestion[] = [
  {
    key: "q1_buchung",
    title: "1. Wie einfach war die Buchung bzw. Anfrage?",
    hint: "Online-Buchung, Verfügbarkeit, Formular",
    textLabel: "Was lief gut, was war umständlich?",
  },
  {
    key: "q2_beratung",
    title: "2. Wie zufrieden warst du mit Beratung und Erreichbarkeit?",
    hint: "Telefon, E-Mail, WhatsApp",
    textLabel: "Wie hast du unsere Beratung erlebt?",
  },
  {
    key: "q3_preis",
    title: "3. Wie transparent und fair waren Preise und Konditionen?",
    hint: "Mietpreis, Kaution, Kraftstoff, Versicherung",
    textLabel: "Gab es Punkte, die unklar waren?",
  },
  {
    key: "q4_abholung",
    title: "4. Wie lief die Abholung bzw. Lieferung?",
    hint: "Pünktlichkeit, Wartezeit, 24/7-Abholung",
    textLabel: "Was ist dir bei Abholung/Lieferung aufgefallen?",
  },
  {
    key: "q5_zustand",
    title: "5. Wie war der Zustand des Mietartikels?",
    hint: "Sauberkeit, Technik, Vollständigkeit",
    textLabel: "Gab es Mängel oder fehlendes Zubehör?",
  },
  {
    key: "q6_einweisung",
    title: "6. Wie hilfreich war die Einweisung bzw. Bedienungserklärung?",
    hint: "Erklärung vor Ort, Anleitungen, Sicherheitshinweise",
    textLabel: "Was hat dir bei der Einweisung gefehlt?",
  },
  {
    key: "q7_miete",
    title: "7. Wie lief die Miete selbst?",
    hint: "Leistung des Geräts, Eignung für dein Projekt",
    textLabel: "Hat das Gerät zu deinem Einsatz gepasst?",
  },
  {
    key: "q8_support",
    title: "8. Wie gut waren wir bei Rückfragen oder Problemen erreichbar?",
    hint: "Während der Mietzeit, auch am Wochenende",
    textLabel: "Wie haben wir reagiert?",
  },
  {
    key: "q9_ruecknahme",
    title: "9. Wie lief die Rückgabe und Abwicklung?",
    hint: "Rücknahme, Protokoll, Schadensklärung",
    textLabel: "Was können wir bei der Rückgabe verbessern?",
  },
  {
    key: "q10_rechnung",
    title: "10. Wie zufrieden warst du mit Rechnung und Zahlung?",
    hint: "Verständlichkeit, Zeitpunkt, Zahlungsarten",
    textLabel: "Anmerkungen zur Rechnung?",
  },
];

export const FEEDBACK_QUESTION_SHORT: Record<string, string> = {
  q1_buchung: "Buchung",
  q2_beratung: "Beratung",
  q3_preis: "Preis/Transparenz",
  q4_abholung: "Abholung/Lieferung",
  q5_zustand: "Zustand Gerät",
  q6_einweisung: "Einweisung",
  q7_miete: "Mietverlauf",
  q8_support: "Erreichbarkeit",
  q9_ruecknahme: "Rückgabe",
  q10_rechnung: "Rechnung",
};
