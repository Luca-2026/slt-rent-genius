// Widerrufsbelehrung für den Verkauf von Neu- und Gebrauchtmaschinen an Verbraucher im Fernabsatz
// Quelle: vom Mandanten gelieferte Word-Datei (SLT-Rental_Widerrufsbelehrung_Maschinenverkauf.docx), Stand Mai 2026.

import type { LegalSection } from "./agb-b2b";

export const WIDERRUF_META = {
  title:
    "Widerrufsbelehrung für den Verkauf von Neu- und Gebrauchtmaschinen an Verbraucher im Fernabsatz",
  subtitle: "der SLT Technology GmbH und Co. KG und der eingetragenen Marke SLT Rental",
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
            text: "Diese Widerrufsbelehrung gilt ausschließlich für Verbraucher im Sinne des § 13 BGB, die mit der SLT Technology GmbH und Co. KG („SLT Rental“) einen Kaufvertrag über eine Neu- oder Gebrauchtmaschine (z.B. Bagger, Radlader, Arbeitsbühne, Stromaggregat, Anhänger, Kraftfahrzeug, sonstige Geräte) unter ausschließlicher Verwendung von Fernkommunikationsmitteln (insbesondere E-Mail, Post, Telefon) oder außerhalb der Geschäftsräume von SLT Rental abschließen.",
          },
          {
            type: "p",
            text: "Unternehmern im Sinne von § 14 BGB steht das nachstehende Widerrufsrecht nicht zu.",
          },
          {
            type: "p",
            text: "Diese Belehrung gilt nicht für Mietverträge. Bei Mietverträgen besteht aufgrund der Bereichsausnahme nach § 312g Abs. 2 Nr. 9 BGB kein Widerrufsrecht; die Einzelheiten ergeben sich aus den Allgemeinen Geschäfts- und Vermietbedingungen für Verbraucher (B2C-AGB), abrufbar unter www.slt-rental.de.",
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
            text: "Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von Waren, die nicht vorgefertigt sind und für deren Herstellung eine individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist oder die eindeutig auf die persönlichen Bedürfnisse des Verbrauchers zugeschnitten sind (§ 312g Abs. 2 Nr. 1 BGB).",
          },
          {
            type: "p",
            text: "Hiervon erfasst sind insbesondere Maschinen mit kundenspezifischer Sonderausstattung, Sonderlackierung oder individueller Konfiguration, die auf konkrete Anforderung des Käufers hin beschafft oder umgerüstet werden. Bei Standard-Lagermaschinen ohne individuelle Konfiguration besteht das Widerrufsrecht.",
          },
          {
            type: "p",
            text: "Im Einzelfall weist SLT bereits im Angebot ausdrücklich darauf hin, wenn ein Widerrufsausschluss nach § 312g Abs. 2 Nr. 1 BGB greift.",
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
            text: "Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Ware in Besitz genommen haben bzw. hat.",
          },
          {
            type: "p",
            text: "Bei einem Vertrag über mehrere Waren, die der Verbraucher im Rahmen einer einheitlichen Bestellung bestellt hat und die getrennt geliefert werden, beginnt die Frist erst, wenn die letzte Ware geliefert worden ist.",
          },
          {
            type: "p",
            text: "Um Ihr Widerrufsrecht auszuüben, müssen Sie uns",
          },
          {
            type: "list",
            items: [
              "SLT Technology Group GmbH & Co. KG, Hauptsitz Krefeld",
              "E-Mail: kaufanfrage@slt-rental.de",
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
          {
            type: "p",
            text: "Wir können die Rückzahlung verweigern, bis wir die Ware wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Ware zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.",
          },
          {
            type: "p",
            text: "Sie haben die Ware unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Ware vor Ablauf der Frist von vierzehn Tagen absenden.",
          },
        ],
      },
      {
        id: "folgen-ruecksendekosten",
        number: "4.2",
        title: "Rücksendekosten",
        body: [
          {
            type: "p",
            text: "Sie tragen die unmittelbaren Kosten der Rücksendung der Ware.",
          },
          {
            type: "p",
            text: "Bei Maschinen, die aufgrund ihrer Beschaffenheit nicht normal mit der Post zurückgesandt werden können (Baumaschinen, Arbeitsbühnen, Anhänger, Kraftfahrzeuge, Stromaggregate ab einem bestimmten Gewicht oder Volumen), erfolgt die Rücksendung typischerweise per Spedition oder Selbstabholung am Aufstellort. Die hierdurch entstehenden Speditionskosten sind je nach Maschinengröße und Entfernung erheblich und können – bezogen auf eine durchschnittliche Lieferentfernung innerhalb Deutschlands – zwischen 250,00 EUR und 2.500,00 EUR brutto betragen. SLT informiert Sie über die geschätzten Rücksendekosten im jeweiligen Einzelfall vor Vertragsschluss.",
          },
          {
            type: "p",
            text: "Alternativ kann SLT auf Wunsch des Verbrauchers die Rückholung gegen Erstattung der tatsächlichen Speditionskosten organisieren.",
          },
        ],
      },
      {
        id: "folgen-wertersatz",
        number: "4.3",
        title: "Wertersatz bei Wertverlust der Ware",
        body: [
          {
            type: "p",
            text: "Sie müssen für einen etwaigen Wertverlust der Ware nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Ware nicht notwendigen Umgang mit ihnen zurückzuführen ist.",
          },
          {
            type: "p",
            text: "Bei Maschinen umfasst die zulässige Prüfung insbesondere die äußerliche Inaugenscheinnahme, die Funktionsprüfung in einem Maße, wie sie auch beim stationären Händler möglich gewesen wäre, sowie eine kurze Probefahrt im Stand bzw. eine kurze Erprobung der Grundfunktionen ohne tatsächlichen Arbeitseinsatz.",
          },
          {
            type: "p",
            text: "Ein Wertverlust, der zu einer Wertersatzpflicht führen kann, entsteht insbesondere durch:",
          },
          {
            type: "list",
            items: [
              "die Aufnahme eines regulären Arbeitseinsatzes (z.B. tatsächliche Erdarbeiten mit einem Bagger, Hub- und Arbeitsstunden mit einer Arbeitsbühne, Transportfahrten mit einem Anhänger im öffentlichen Straßenverkehr außerhalb einer kurzen Probefahrt);",
              "das Hinzufügen oder Entfernen von Anbauteilen, sofern dies nicht zur reinen Funktionsprüfung erforderlich war;",
              "über die übliche Funktionsprüfung hinausgehende Betriebsstunden, die im Stundenzähler erfasst werden;",
              "Beschädigungen an Lack, Hydraulik, Reifen oder mechanischen Bauteilen, die nicht auf einen sachgerechten Transport zurückzuführen sind.",
            ],
          },
          {
            type: "p",
            text: "Der konkrete Wertersatz wird auf Grundlage einer sachverständigen Bewertung des Wertunterschieds zwischen dem Übergabezustand und dem Rückgabezustand bemessen. Dem Verbraucher bleibt der Nachweis vorbehalten, dass kein oder ein geringerer Wertverlust eingetreten ist.",
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
            text: "Das Widerrufsrecht erlischt auch bei sonst widerruflichen Verträgen vorzeitig, wenn die in § 312g Abs. 2 BGB genannten Ausschlussgründe eintreten. Bei Maschinenverkäufen kann dies insbesondere der Fall sein bei:",
          },
          {
            type: "list",
            items: [
              "kundenspezifisch konfigurierten oder umgerüsteten Maschinen (§ 312g Abs. 2 Nr. 1 BGB);",
              "versiegelten Waren, deren Versiegelung nach der Lieferung entfernt wurde, sofern sie aus Gründen des Gesundheitsschutzes oder der Hygiene nicht zur Rückgabe geeignet sind (§ 312g Abs. 2 Nr. 3 BGB).",
            ],
          },
          {
            type: "p",
            text: "Auf einen etwaigen Ausschluss des Widerrufsrechts weist SLT im jeweiligen Angebot ausdrücklich hin.",
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
            text: "Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Ware (Maschine):",
          },
          {
            type: "list",
            items: [
              "Bezeichnung / Typ der Maschine: __________________________",
              "Seriennummer / Fahrzeug-Identifikationsnummer (sofern bekannt): __________________________",
              "Bestellt am (*) / erhalten am (*): __________________________",
              "Kaufpreis: __________________________",
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
