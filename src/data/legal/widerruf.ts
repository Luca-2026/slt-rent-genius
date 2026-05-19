// Widerrufsbelehrung für Verbraucher
// Quelle: vom Mandanten gelieferte Word-Datei, Stand Mai 2026.

import type { LegalSection } from "./agb-b2b";

export const WIDERRUF_META = {
  title: "Widerrufsbelehrung für Verbraucher",
  subtitle: "der SLT Technology Group GmbH & Co. KG / SLT-Rental",
  stand: "Stand: Mai 2026",
};

export const WIDERRUF_SECTIONS: LegalSection[] = [
  {
    id: "anwendungsbereich",
    number: "1.",
    title: "Anwendungsbereich",
    subsections: [
      {
        id: "anwendungsbereich",
        number: "",
        title: "Anwendungsbereich",
        body: [
          {
            type: "p",
            text: "Diese Widerrufsbelehrung gilt ausschließlich für Verbraucher im Sinne des § 13 BGB, die mit der SLT Technology Group GmbH & Co. KG („SLT“) einen Vertrag über Fernkommunikationsmittel (z.B. Webshop, E-Mail, Telefon) oder außerhalb der Geschäftsräume von SLT abschließen.",
          },
          {
            type: "p",
            text: "Unternehmern im Sinne von § 14 BGB steht das nachstehende Widerrufsrecht nicht zu.",
          },
        ],
      },
    ],
  },
  {
    id: "ausnahmen",
    number: "2.",
    title: "Ausnahmen vom Widerrufsrecht",
    subsections: [
      {
        id: "ausnahmen",
        number: "",
        title: "Ausnahmen vom Widerrufsrecht",
        body: [
          {
            type: "p",
            text: "Das Widerrufsrecht besteht gemäß § 312g Abs. 2 Nr. 9 BGB nicht bei Verträgen zur Erbringung von Dienstleistungen in den Bereichen Beherbergung zu anderen als Wohnzwecken, Beförderung von Waren, Kraftfahrzeugvermietung sowie weitere Dienstleistungen im Zusammenhang mit Freizeitbetätigungen, wenn der Vertrag für die Erbringung einen spezifischen Termin oder Zeitraum vorsieht.",
          },
          {
            type: "p",
            text: "Bei SLT-Rental sind hiervon insbesondere folgende Sortimente erfasst, bei denen das Widerrufsrecht ausgeschlossen ist:",
          },
          {
            type: "list",
            items: [
              "Vermietung von Kraftfahrzeugen und Anhängern für einen bestimmten Zeitraum;",
              "Vermietung von Party-, Event- und Freizeitequipment für einen bestimmten Termin oder Zeitraum (z.B. Zelte, Bühnen, Mobiliar, Beschallung für Veranstaltungen).",
            ],
          },
          {
            type: "p",
            text: "Das Widerrufsrecht besteht weiter nicht bei Verträgen zur Lieferung von Waren, die nicht vorgefertigt sind und für deren Herstellung eine individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist oder die eindeutig auf die persönlichen Bedürfnisse des Verbrauchers zugeschnitten sind (§ 312g Abs. 2 Nr. 1 BGB). Hiervon können insbesondere Verkäufe von individuell konfigurierten Neumaschinen erfasst sein.",
          },
          {
            type: "p",
            text: "Für alle übrigen, durch Fernabsatz oder außerhalb der Geschäftsräume geschlossenen Verträge (insbesondere kurzfristige Vermietung von Baumaschinen, Werkstattgeräten, Arbeitsbühnen, Containern und Stromaggregaten an Verbraucher sowie der Verkauf von vorgefertigten Standard-Neumaschinen an Verbraucher) gilt das nachstehende Widerrufsrecht.",
          },
        ],
      },
    ],
  },
  {
    id: "widerrufsrecht",
    number: "3.",
    title: "Widerrufsrecht",
    subsections: [
      {
        id: "widerrufsrecht",
        number: "",
        title: "Widerrufsrecht",
        body: [
          {
            type: "p",
            text: "Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.",
          },
          {
            type: "p",
            text: "Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses bei Dienstleistungs- und Mietverträgen bzw. ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat, bei Kaufverträgen.",
          },
          {
            type: "p",
            text: "Um Ihr Widerrufsrecht auszuüben, müssen Sie uns",
          },
          {
            type: "list",
            items: [
              "SLT Technology Group GmbH & Co. KG, Hauptsitz Krefeld",
              "E-Mail: widerruf@slt-rental.de",
              "Telefon: 02151 4179904",
            ],
          },
          {
            type: "p",
            text: "mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.",
          },
          {
            type: "p",
            text: "Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.",
          },
        ],
      },
    ],
  },
  {
    id: "folgen",
    number: "4.",
    title: "Folgen des Widerrufs",
    subsections: [
      {
        id: "folgen-allgemein",
        number: "4.1",
        title: "Allgemeine Folgen",
        body: [
          {
            type: "p",
            text: "Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.",
          },
          {
            type: "p",
            text: "Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.",
          },
        ],
      },
      {
        id: "folgen-warenlieferung",
        number: "4.2",
        title: "Zusätzliche Folgen bei Warenlieferung (Verkauf)",
        body: [
          {
            type: "p",
            text: "Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.",
          },
          {
            type: "p",
            text: "Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.",
          },
          {
            type: "p",
            text: "Sie tragen die unmittelbaren Kosten der Rücksendung der Waren. Bei Waren, die aufgrund ihrer Beschaffenheit nicht normal mit der Post zurückgesandt werden können (z.B. Baumaschinen, Arbeitsbühnen, Container), informieren wir Sie über die geschätzten Kosten der Rücksendung im Einzelfall vor Vertragsschluss.",
          },
          {
            type: "p",
            text: "Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.",
          },
        ],
      },
      {
        id: "folgen-dienstleistungen",
        number: "4.3",
        title: "Zusätzliche Folgen bei Dienstleistungen und Mietverträgen",
        body: [
          {
            type: "p",
            text: "Haben Sie verlangt, dass die Dienstleistungen oder die Vermietung während der Widerrufsfrist beginnen sollen, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrages unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.",
          },
        ],
      },
    ],
  },
  {
    id: "erloeschen",
    number: "5.",
    title: "Hinweise zum vorzeitigen Erlöschen des Widerrufsrechts",
    subsections: [
      {
        id: "erloeschen",
        number: "",
        title: "Hinweise zum vorzeitigen Erlöschen des Widerrufsrechts",
        body: [
          {
            type: "p",
            text: "Das Widerrufsrecht erlischt bei Dienstleistungs- und Mietverträgen vorzeitig, wenn SLT die Dienstleistung vollständig erbracht hat und mit der Ausführung der Dienstleistung erst begonnen hat, nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben haben und gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger Vertragserfüllung durch SLT verlieren (§ 356 Abs. 4 BGB).",
          },
          { type: "p", text: "– Ende der Widerrufsbelehrung –" },
        ],
      },
    ],
  },
  {
    id: "muster",
    number: "6.",
    title: "Muster-Widerrufsformular",
    subsections: [
      {
        id: "muster",
        number: "",
        title: "Muster-Widerrufsformular",
        body: [
          {
            type: "p",
            text: "(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)",
          },
          { type: "h3", text: "An:" },
          {
            type: "list",
            items: [
              "SLT Technology Group GmbH & Co. KG",
              "Hauptsitz Krefeld",
              "E-Mail: widerruf@slt-rental.de",
            ],
          },
          {
            type: "p",
            text: "Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*) / die Erbringung der folgenden Dienstleistung (*) / die Vermietung des folgenden Mietgegenstandes (*):",
          },
          {
            type: "list",
            items: [
              "Mietgegenstand / Ware / Dienstleistung: __________________________",
              "Bestellt am (*) / erhalten am (*): __________________________",
              "Name des/der Verbraucher(s): __________________________",
              "Anschrift des/der Verbraucher(s): __________________________",
              "Datum: __________________________",
              "Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): __________________________",
            ],
          },
          { type: "p", text: "(*) Unzutreffendes streichen." },
        ],
      },
    ],
  },
];
