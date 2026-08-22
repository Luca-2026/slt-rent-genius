// Allgemeine Geschäfts- und Vermietbedingungen für Unternehmer (B2B)
// Quelle: vom Mandanten gelieferte Word-Datei, Stand Mai 2026.

export type LegalParagraph =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "h3"; text: string };

export type LegalSubsection = {
  id: string;
  number: string;
  title: string;
  body: LegalParagraph[];
};

export type LegalSection = {
  id: string;
  number: string;
  title: string;
  subsections: LegalSubsection[];
};

export const AGB_B2B_META = {
  title: "Allgemeine Geschäfts- und Vermietbedingungen für Unternehmer (B2B)",
  subtitle:
    "der SLT Technology Group GmbH & Co. KG und der eingetragenen Marke SLT-Rental",
  stand: "Stand: Mai 2026",
};

export const AGB_B2B_SECTIONS: LegalSection[] = [
  {
    id: "i",
    number: "I.",
    title: "Geltungsbereich und Vertragspartner",
    subsections: [
      {
        id: "i-1",
        number: "",
        title: "Geltungsbereich",
        body: [
          {
            type: "p",
            text: "Für sämtliche Mietverträge zwischen der SLT Technology Group GmbH & Co. KG („SLT“) und einem Unternehmer im Sinne von § 14 BGB, einer juristischen Person des öffentlichen Rechts oder einem öffentlich-rechtlichen Sondervermögen (im Folgenden „Mieter“) gelten ausschließlich diese Allgemeinen Geschäfts- und Vermietbedingungen (im Folgenden „AGB“).",
          },
          {
            type: "p",
            text: "Entgegenstehende Geschäftsbedingungen des Mieters werden nicht anerkannt, es sei denn, SLT stimmt deren Geltung ausdrücklich in Textform zu. Die AGB von SLT gelten auch dann, wenn SLT in Kenntnis entgegenstehender oder abweichender Bedingungen des Mieters die Leistung vorbehaltlos erbringt.",
          },
          {
            type: "p",
            text: "Für Verbraucher im Sinne von § 13 BGB gelten gesonderte Allgemeine Geschäfts- und Vermietbedingungen (B2C), die auf der Website www.slt-rental.de zum Abruf bereitstehen.",
          },
          {
            type: "p",
            text: "Ergänzungen oder Abweichungen von diesen AGB bedürfen der Textform. Die Vertragssprache ist Deutsch.",
          },
          {
            type: "p",
            text: "Sollten einzelne Bestimmungen dieser AGB unwirksam sein, berührt dies nicht die Wirksamkeit der übrigen Bestimmungen. Die unwirksame Bestimmung wird durch eine solche ersetzt, die dem wirtschaftlichen Zweck am nächsten kommt.",
          },
        ],
      },
    ],
  },
  {
    id: "ii",
    number: "II.",
    title: "Vertragsgegenstand und Vertragsschluss",
    subsections: [
      {
        id: "ii-2-1",
        number: "2.1",
        title: "Mietgegenstände",
        body: [
          {
            type: "p",
            text: "SLT vermietet Baumaschinen, Baustelleninfrastruktur, Anhänger, Kraftfahrzeuge, Party- und Eventequipment, Verkehrssicherungsmaterialien und weitere Ausrüstungen. Alle Darstellungen auf www.slt-rental.de, in Social Media oder Printmedien sind freibleibend und unverbindlich.",
          },
        ],
      },
      {
        id: "ii-2-2",
        number: "2.2",
        title: "Mietanfrage, B2B-Portal und Vertragsschluss",
        body: [
          {
            type: "p",
            text: "Mietanfragen können über das Kontaktformular auf der Website, per E-Mail oder telefonisch gestellt werden. SLT prüft die Verfügbarkeit und unterbreitet ein verbindliches Angebot unter Vorbehalt. Der Vertrag kommt erst mit Bestätigung durch SLT in Textform zustande.",
          },
          {
            type: "p",
            text: "Für Online-Buchungen über den Webshop auf www.slt-rental.de (Rentware-Integration) kommt der Vertrag mit Versand der automatisierten Buchungsbestätigung durch SLT zustande.",
          },
          {
            type: "p",
            text: "B2B-Kunden können sich zusätzlich im B2B-Portal von SLT registrieren und individuelle Konditionen anfragen. Ein Kreditlimit wird erst nach Bonitätsprüfung durch SLT vergeben; bis zur Vergabe gilt für Neukunden Vorkasse. SLT behält sich vor, Kreditlimits jederzeit anzupassen oder zu widerrufen, insbesondere bei Verschlechterung der Bonität, Zahlungsverzug oder erheblicher Erhöhung des bestehenden Forderungsvolumens.",
          },
        ],
      },
      {
        id: "ii-2-3",
        number: "2.3",
        title: "Identitätsnachweis und Dokumenten-Upload",
        body: [
          {
            type: "p",
            text: "SLT ist berechtigt, vor Übergabe der Mietsache die Vorlage eines Handelsregisterauszuges (nicht älter als sechs Monate), einer Gewerbeanmeldung sowie eines amtlichen Lichtbildausweises der vertretungsberechtigten Person zu verlangen. Bei Vermietung von Kraftfahrzeugen und Anhängern ist zusätzlich der Führerschein der den Mietgegenstand führenden Person vorzulegen, dessen Vorlage durch Sichtkontrolle dokumentiert wird.",
          },
          {
            type: "p",
            text: "Sofern aus dem vorgelegten Ausweisdokument der vertretungsberechtigten oder den Mietgegenstand führenden Person die aktuelle Meldeanschrift nicht hervorgeht, kann SLT zusätzlich eine aktuelle Meldebescheinigung (nicht älter als drei Monate) verlangen.",
          },
          {
            type: "p",
            text: "Bei Online-Buchungen über den Webshop oder bei kontaktloser Übergabe gemäß Ziff. 3.1a ist der Mieter verpflichtet, die nach den vorstehenden Sätzen erforderlichen Dokumente bereits im Online-Buchungsprozess als digitale Kopie hochzuladen. Die Übermittlung erfolgt über eine verschlüsselte Verbindung. Ohne vollständige Übermittlung der erforderlichen Dokumente wird die Buchung nicht freigegeben bzw. der Zugangscode nicht versandt.",
          },
          {
            type: "p",
            text: "Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b und lit. f DSGVO. Bei Nichtvorlage der erforderlichen Dokumente kann die Vermietung verweigert werden; ein Anspruch des Mieters auf Schadensersatz besteht in diesem Fall nicht.",
          },
        ],
      },
      {
        id: "ii-2-4",
        number: "2.4",
        title: "Preise",
        body: [
          {
            type: "p",
            text: "Alle Preise verstehen sich als Nettopreise zuzüglich der gesetzlich geltenden Mehrwertsteuer, sofern nicht anders ausgewiesen.",
          },
        ],
      },
      {
        id: "ii-2-5",
        number: "2.5",
        title: "Mietzinsfälligkeit",
        body: [
          {
            type: "p",
            text: "Nach Vertragsschluss ist SLT zur Bereitstellung und Vorhaltung der Mietartikel verpflichtet. Mit Beginn der Mietzeit entsteht der Anspruch auf Zahlung des vollständigen Mietzinses.",
          },
        ],
      },
      {
        id: "ii-2-6",
        number: "2.6",
        title: "Kaution",
        body: [
          {
            type: "p",
            text: "SLT ist berechtigt, für bestimmte Mietartikel eine Kaution zu verlangen. Die Kautionshöhe wird im Angebot oder Buchungsprozess ausgewiesen und ist vor Übergabe der Mietsache zu hinterlegen. Die Kaution wird unverzinst hinterlegt.",
          },
          {
            type: "p",
            text: "Die Rückzahlung der Kaution erfolgt innerhalb von zehn Werktagen nach ordnungsgemäßer Rückgabe und Prüfung des Mietgegenstandes, soweit keine offenen Ansprüche aus dem Mietverhältnis bestehen. Bei kontaktloser Rückgabe von Anhängern gemäß Ziff. 3.1a erfolgt die Schadens- und Vollständigkeitsprüfung durch einen Mitarbeiter von SLT innerhalb von 48 Stunden nach dem vereinbarten Mietende; die Frist zur Rückzahlung der Kaution beginnt mit dem Abschluss dieser Prüfung. Stellt SLT bei der Prüfung Schäden oder Fehlbestände fest, wird der Mieter hierüber in Textform informiert.",
          },
          {
            type: "p",
            text: "SLT ist berechtigt, mit fälligen Ansprüchen aus dem Mietverhältnis gegen die Kaution aufzurechnen.",
          },
        ],
      },
      {
        id: "ii-2-7",
        number: "2.7",
        title: "Vermietung an Dritte und Ausfuhr",
        body: [
          {
            type: "p",
            text: "Eine Vermietung, Weitergabe oder Abtretung der Mietgegenstände an Dritte sowie deren Ausfuhr aus der Bundesrepublik Deutschland ist ohne ausdrückliche schriftliche Genehmigung von SLT untersagt. Bei Zuwiderhandlung haftet der Mieter für sämtliche hieraus entstehenden Schäden, Kosten und Bußgelder.",
          },
        ],
      },
      {
        id: "ii-2-8",
        number: "2.8",
        title: "Haftungsreduzierung und Versicherung",
        body: [
          {
            type: "p",
            text: "Eine Haftungsreduzierung und/oder Versicherung kann im Buchungsprozess optional vereinbart werden. Für bestimmte Mietartikel besteht die Möglichkeit, eine entgeltliche Auslandshaftpflichtversicherung abzuschließen; die Versicherungsbedingungen sind auf Anfrage erhältlich.",
          },
        ],
      },
      {
        id: "ii-2-9",
        number: "2.9",
        title: "Transportleistungen",
        body: [
          {
            type: "p",
            text: "Transportleistungen (Anlieferung, Abholung, Hin- und Rücktransport) können gegen gesonderte Vergütung vereinbart werden. Die Transportkosten sind spätestens mit Mietbeginn fällig; mit Bezahlung gelten diese als vereinbart.",
          },
          {
            type: "p",
            text: "Sofern ein Hin- und Rücktransport beauftragt wurde, setzt SLT eine frei befahrbare und zugängliche Baustelle voraus. Sollte es zu Verzögerungen kommen, die nicht durch SLT zu vertreten sind (z.B. fehlende Zugänglichkeit, Wartezeiten), behält sich SLT vor, diese in Rechnung zu stellen. Teilabholungen werden gesondert in Rechnung gestellt.",
          },
        ],
      },
      {
        id: "ii-2-10",
        number: "2.10",
        title: "Barzahlungen",
        body: [
          {
            type: "p",
            text: "Barzahlungen werden bis zu einem Betrag von 1.000,00 EUR ohne Aufschlag entgegengenommen.",
          },
          {
            type: "p",
            text: "Für Barzahlungen über 1.000,00 EUR wird ein Bearbeitungsaufgeld in Höhe von 3 % des Zahlbetrages erhoben. Das Aufgeld deckt die mit der Bargeldannahme verbundenen Mehraufwände ab, insbesondere Zähl-, Sicherungs-, Versicherungs- und Einzahlungskosten.",
          },
          {
            type: "p",
            text: "Bei Barzahlungen ab 10.000,00 EUR ist SLT als Güterhändler im Sinne des § 1 Abs. 9 GwG zur Identifizierung des Vertragspartners gemäß § 10 Abs. 6a in Verbindung mit § 4 Abs. 5 Nr. 1 lit. c GwG verpflichtet, soweit dem Bargeschäft ein Verkauf von Mietsachen oder Neumaschinen zugrunde liegt. Bei reinen Mietverträgen führt SLT die Identifizierung freiwillig zur Geldwäscheprävention durch.",
          },
          {
            type: "p",
            text: "SLT behält sich vor, Barzahlungen ab 10.000,00 EUR ganz abzulehnen und auf bargeldlose Zahlung zu verweisen.",
          },
        ],
      },
      {
        id: "ii-2-11",
        number: "2.11",
        title: "Verzugszinsen und Inkassokosten",
        body: [
          {
            type: "p",
            text: "Bei Zahlungsverzug gelten Verzugszinsen von 9 Prozentpunkten über dem Basiszinssatz (§ 288 Abs. 2 BGB) sowie eine Verzugspauschale von 40,00 EUR (§ 288 Abs. 5 BGB). Der Mieter trägt zudem sämtliche durch den Verzug entstehenden Kosten (Mahngebühren, Inkassokosten, Rechtsanwaltsgebühren).",
          },
        ],
      },
    ],
  },
  {
    id: "iii",
    number: "III.",
    title: "Übergabe, Rückgabe und Zustand der Mietsache",
    subsections: [
      {
        id: "iii-3-1",
        number: "3.1",
        title: "Übergabeort und -zeit",
        body: [
          {
            type: "p",
            text: "Die Übergabe erfolgt zum vereinbarten Mietbeginn an einem der Geschäftssitze von SLT (Krefeld, Bonn oder Mülheim an der Ruhr), sofern nichts anderes in Textform vereinbart ist. Ein Versand oder eine Anlieferung erfolgt nach individueller Vereinbarung und gegen gesondertes Entgelt.",
          },
        ],
      },
      {
        id: "iii-3-1a",
        number: "3.1a",
        title: "Kontaktlose Übergabe von Anhängern",
        body: [
          {
            type: "p",
            text: "Anhänger können nach vorheriger Vereinbarung kontaktlos mittels Code-System übergeben und zurückgenommen werden. Der Zugangscode ist ausschließlich für den vereinbarten Mietzeitraum gültig.",
          },
          {
            type: "p",
            text: "Der Mieter ist verpflichtet, Verspätungen bzw. eine notwendige Verlängerung der Mietzeit rechtzeitig, mindestens 2 Stunden vor Mietende, in Textform gegenüber SLT anzuzeigen. Erfolgt keine rechtzeitige Mitteilung, bleibt SLT die Berechnung der zusätzlichen Mietzeit und etwaiger Mehraufwände vorbehalten.",
          },
          {
            type: "p",
            text: "Die Codes werden per E-Mail an die im Buchungsprozess angegebene Mobilfunknummer des Mieters versandt. Mit Eingabe seiner Mobilfunknummer im Buchungsprozess stimmt der Mieter dem Erhalt von E-Mail zum Zwecke der Abwicklung des Mietverhältnisses ausdrücklich zu.",
          },
        ],
      },
      {
        id: "iii-3-2",
        number: "3.2",
        title: "Zustandsprüfung bei Übergabe",
        body: [
          {
            type: "p",
            text: "Bei Übergabe hat der Mieter die Mietsache auf äußerlich erkennbare Mängel, Vollständigkeit und Funktion zu prüfen. Die Übernahme durch Unterzeichnung des Lieferscheins oder Übergabeprotokolls gilt als Anerkennung des äußerlich erkennbaren Zustandes. Die Haftung von SLT für verdeckte oder nicht ohne Weiteres erkennbare Mängel bleibt im Rahmen der Haftungsregelung in Ziff. 5.1 unberührt.",
          },
        ],
      },
      {
        id: "iii-3-3",
        number: "3.3",
        title: "Pflichten des Mieters beim Umgang mit der Mietsache",
        body: [
          {
            type: "p",
            text: "Der Mieter ist verpflichtet, die Mietsache samt Zubehör pfleglich und bestimmungsgemäß sowie gemäß den geltenden Sicherheits- und Betriebsvorschriften zu behandeln. Die Bedienungsanleitung ist einzuhalten und der Mietgegenstand ist bestimmungsgemäß einzusetzen.",
          },
        ],
      },
      {
        id: "iii-3-4",
        number: "3.4",
        title: "Meldepflicht bei Mängeln",
        body: [
          {
            type: "p",
            text: "Schäden, Funktionsstörungen oder Verluste sind SLT unverzüglich nach Feststellung, spätestens jedoch am folgenden Werktag, in Textform anzuzeigen. Bei akuter Gefahr für Personen oder Sachen ist eine sofortige Meldung erforderlich. Bei unterlassener oder verspäteter Anzeige haftet der Mieter für die hieraus adäquat-kausal entstehenden Folgeschäden.",
          },
        ],
      },
      {
        id: "iii-3-5",
        number: "3.5",
        title: "Rückgabeort und -zeit",
        body: [
          {
            type: "p",
            text: "Die Rückgabe hat zum vereinbarten Zeitpunkt, grundsätzlich an einem der Geschäftssitze von SLT (Krefeld, Bonn oder Mülheim an der Ruhr), in ordnungsgemäßem, vollständigem und sauberem Zustand zu erfolgen. Bei Rückholung durch SLT muss die Mietsache zu ebener Erde transportfähig bereitstehen.",
          },
          {
            type: "p",
            text: "Rückgaben außerhalb der Geschäftszeiten sind nur nach Vereinbarung in Textform möglich. Das Risiko für Verlust und Beschädigung bleibt bis zur tatsächlichen Rücknahme durch SLT beim Mieter.",
          },
        ],
      },
      {
        id: "iii-3-6",
        number: "3.6",
        title: "Rückgabevorgaben und Reinigung",
        body: [
          { type: "p", text: "Die Mietsache ist wie folgt zurückzugeben:" },
          {
            type: "list",
            items: [
              "a) Anhänger: besenrein",
              "b) Baumaschinen, Stromaggregate, Arbeitsbühnen: vollgetankt oder vollgeladen, frei von grobem Schmutz",
              "c) Zelte und Textilien: trocken, sortiert, gefaltet",
              "d) Geräte mit Akku: vollgeladen",
              "e) Kraftfahrzeuge: vollgetankt, gereinigt",
            ],
          },
          {
            type: "p",
            text: "Wird die Mietsache verspätet, unvollständig oder verschmutzt zurückgegeben, ist SLT berechtigt, den Mehraufwand (insbesondere Reinigung, Desinfektion und zusätzliche Mietgebühren) in Rechnung zu stellen.",
          },
          {
            type: "p",
            text: "Reinigung, Entsorgung und Transport werden – sofern nicht pauschal vereinbart – nach tatsächlichem Aufwand abgerechnet. Reparaturen, die auf vom Mieter zu vertretende Beschädigungen zurückzuführen sind, gehen zu dessen Lasten.",
          },
        ],
      },
      {
        id: "iii-3-7",
        number: "3.7",
        title: "Rückgabebestätigung",
        body: [
          {
            type: "p",
            text: "Die Rückgabe wird mit Abschlussprotokoll dokumentiert. Ohne Protokoll gilt die Rückgabe als nicht erfolgt und die Mietsache bleibt im Verantwortungsbereich des Mieters.",
          },
        ],
      },
      {
        id: "iii-3-8",
        number: "3.8",
        title: "Anlagen als Vertragsbestandteil",
        body: [
          {
            type: "p",
            text: "Anlagen (z.B. Stücklisten, Übergabeprotokolle, Aufmaße, Lieferscheine) werden Vertragsbestandteil.",
          },
        ],
      },
      {
        id: "iii-3-9",
        number: "3.9",
        title: "Be- und Entladung",
        body: [
          {
            type: "p",
            text: "Sofern Abholung und/oder Rücklieferung durch den Mieter oder durch einen von ihm beauftragten Spediteur/Frachtführer vereinbart ist, ist der Mieter für die ordnungsgemäße Be- und Entladung sowie die Einhaltung der einschlägigen Ladungssicherungsregelungen verantwortlich.",
          },
        ],
      },
      {
        id: "iii-3-10",
        number: "3.10",
        title:
          "Sicherheitsrelevante Kontrolle vor Fahrtantritt bei Anhängern und Kraftfahrzeugen",
        body: [
          {
            type: "p",
            text: "(1) Der Mieter ist verpflichtet, vor jedem Antritt einer Fahrt – sowohl bei Erstübernahme als auch bei jeder Folgefahrt während der Mietzeit – eine eigenverantwortliche Sichtprüfung der sicherheitsrelevanten Bauteile des Anhängers bzw. Kraftfahrzeugs durchzuführen. Diese Sichtprüfung umfasst insbesondere:",
          },
          {
            type: "list",
            items: [
              "a) Bremsanlage: Funktion der Auflaufbremse durch Probedruck am Zugholm, Funktion der Feststellbremse, Sichtprüfung des Abreißseils auf festen Sitz, Sichtkontrolle der Bremstrommeln und Bremsschläuche auf erkennbare Beschädigungen oder Leckagen;",
              "b) Kupplung und Anhängevorrichtung: sicherer Sitz der Kupplungsmuffe auf dem Kugelkopf, Funktion des Sicherungsmechanismus;",
              "c) Beleuchtung und elektrische Anlage: Funktion sämtlicher Leuchten (Brems-, Blink-, Schluss-, Rückfahr-, Nebelschlussleuchte) sowie ordnungsgemäßer Anschluss des Steckers;",
              "d) Reifen: Profiltiefe, Reifendruck, sichtbare Beschädigungen oder Risse;",
              "e) Stützrad: Funktion und Verriegelung;",
              "f) Ladungssicherung: sichere Verzurrung und gleichmäßige Lastverteilung gemäß zulässiger Anhängelast und Stützlast (siehe Anhängerschein/Typenschild).",
            ],
          },
          {
            type: "p",
            text: "(2) Bei festgestellten oder erkennbaren Mängeln, insbesondere bei Auffälligkeiten an der Bremsanlage (verlängerter Bremsweg, ungewöhnliche Geräusche, fehlender Bremswiderstand am Zugholm, undichte Bremsschläuche, fehlendes Abreißseil), ist die Fahrt zu unterlassen und SLT unverzüglich telefonisch zu kontaktieren:",
          },
          {
            type: "list",
            items: [
              "• Standort Krefeld und Mülheim an der Ruhr: 02151 4179904",
              "• Standort Bonn: 0228 50466061",
            ],
          },
          {
            type: "p",
            text: "Eine Weiterfahrt mit erkannten oder erkennbaren sicherheitsrelevanten Mängeln stellt eine grobe Verletzung der Sorgfaltspflichten des Mieters dar und kann zur Versagung von Versicherungsleistungen führen.",
          },
          {
            type: "p",
            text: "(3) Bei Inbetriebnahme eines Anhängers mit einer zulässigen Gesamtmasse über 750 kg ist der Mieter verpflichtet, sich vor Fahrtantritt vom ordnungsgemäßen Anziehen der Auflaufbremse durch Rückwärtsschieben des Gespanns zu überzeugen. Anhänger mit einer zulässigen Gesamtmasse über 3.500 kg dürfen ausschließlich von Personen geführt werden, die im Besitz der hierfür erforderlichen Fahrerlaubnis (Klasse BE, B96 bzw. C1E je nach Konfiguration) sind; die Vorlage des entsprechenden Führerscheins kann SLT vor Übergabe verlangen.",
          },
          {
            type: "p",
            text: "(4) Die in dieser Sicherheitsklausel begründeten Pflichten des Mieters lassen die Verkehrssicherungspflicht von SLT als Vermieter sowie die Halterhaftung gemäß § 7 StVG unberührt. SLT verpflichtet sich zur regelmäßigen Wartung, Hauptuntersuchung und Bremsenprüfung aller vermieteten Anhänger und Kraftfahrzeuge nach den jeweils geltenden gesetzlichen und berufsgenossenschaftlichen Vorschriften (insbesondere StVZO, DGUV Vorschrift 70).",
          },
          {
            type: "p",
            text: "(5) Der Mieter bestätigt durch Unterzeichnung des Übergabeprotokolls die Durchführung der Sichtprüfung gemäß vorstehender Absätze 1 bis 3 und die Kenntnisnahme dieser Sicherheitsbelehrung. Bei kontaktloser Übergabe gemäß Ziff. 3.1a erfolgt die Bestätigung der Kenntnisnahme im Rahmen des Online-Buchungsprozesses; die Sichtprüfung vor jedem Fahrtantritt verbleibt eine eigenverantwortliche Pflicht des Mieters.",
          },
        ],
      },
    ],
  },
  {
    id: "iv",
    number: "IV.",
    title: "Mietzeit, Mietende und verspätete Rückgabe",
    subsections: [
      {
        id: "iv-4-1",
        number: "4.1",
        title: "Mietdauer",
        body: [
          {
            type: "p",
            text: "Die Mietzeit sowie Abhol- und Rückgabezeiten ergeben sich aus dem Mietvertrag oder der Buchungsbestätigung.",
          },
        ],
      },
      {
        id: "iv-4-2",
        number: "4.2",
        title: "Mietpreisberechnung und Nutzungsdauer",
        body: [
          {
            type: "p",
            text: "Die Mietpreise basieren auf einer Tagesnutzungsdauer von 24 Stunden bzw. einer Wochennutzung von 168 Stunden. Für Maschinen mit Stundenzähler gelten 8 Betriebsstunden pro Tag bzw. 56 pro Woche. Jede angefangene Miet- oder Betriebsstunde wird als volle Stunde berechnet; jeder angefangene Miettag wird als voller Tag berechnet. Jede Überschreitung wird mit 1/8 des Tagespreises pro weiterer Stunde berechnet.",
          },
        ],
      },
      {
        id: "iv-4-3",
        number: "4.3",
        title: "Abmeldung und Freimeldung",
        body: [
          {
            type: "p",
            text: "Für Mietverträge, die nicht über den Onlineshop abgeschlossen werden, ist der im Angebot angegebene Mietzeitraum zunächst nur eine unverbindliche Planungsannahme. Der Mieter ist verpflichtet, das Mietende bzw. die Freimeldung der Mietartikel rechtzeitig und verbindlich in Textform per E-Mail an mieten@slt-rental.de anzuzeigen. Erfolgt keine Freimeldung in Textform, läuft die Miete bis zur tatsächlichen Rückgabe weiter und wird entsprechend in Rechnung gestellt.",
          },
        ],
      },
      {
        id: "iv-4-4",
        number: "4.4",
        title: "Verspätete Rückgabe",
        body: [
          {
            type: "p",
            text: "Bei verspäteter Rückgabe schuldet der Mieter den anteiligen Mietzins für die Zeit der Überschreitung; jeder angefangene Tag gilt als voller Miettag. Zusätzlich kann SLT einen pauschalierten Verzugsschaden in Höhe von 30 % des Tagesnettomietpreises pro verspätetem Tag verlangen. Dem Mieter bleibt der Nachweis vorbehalten, dass kein oder ein geringerer Schaden entstanden ist. SLT bleibt der Nachweis eines höheren konkreten Schadens vorbehalten.",
          },
        ],
      },
      {
        id: "iv-4-5",
        number: "4.5",
        title: "Zusätzliche Gebühren und Pauschalen",
        body: [
          { type: "p", text: "Zusätzlich zum Mietzins werden in Rechnung gestellt:" },
          {
            type: "list",
            items: [
              "a) während der Mietzeit anfallende Gebühren, Bußgelder, Verwarnungs- und Mautkosten;",
              "b) für die Bearbeitung und Weiterleitung behördlicher Bußgeld-/Mautvorgänge: eine Bearbeitungspauschale in Höhe von 25,00 EUR netto je Vorgang;",
              "c) für die Bearbeitung eines Schadensfalles: eine Bearbeitungspauschale in Höhe von 65,00 EUR netto je Schadensfall;",
              "d) Reinigungskosten ab 75,00 EUR netto, wenn die Rückgabevorgaben gemäß Ziff. 3.6 nicht erfüllt werden, im Übrigen nach tatsächlichem Aufwand.",
            ],
          },
          {
            type: "p",
            text: "Dem Mieter bleibt jeweils der Nachweis eines geringeren tatsächlichen Aufwands vorbehalten.",
          },
        ],
      },
    ],
  },
  {
    id: "v",
    number: "V.",
    title: "Haftung von SLT, Mängel, Rechte des Mieters",
    subsections: [
      {
        id: "v-5-1",
        number: "5.1",
        title: "Haftung von SLT",
        body: [
          {
            type: "p",
            text: "SLT haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit. Für leichte Fahrlässigkeit haftet SLT nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten); die Haftung ist in diesen Fällen auf den vertragstypischen, vorhersehbaren Schaden begrenzt.",
          },
          {
            type: "p",
            text: "Die verschuldensunabhängige Haftung von SLT für anfängliche Mängel nach § 536a Abs. 1 1. Alt. BGB wird ausgeschlossen, soweit nicht eine wesentliche Vertragspflicht verletzt wird oder die Mängel die Verkehrssicherheit von Kraftfahrzeugen, Anhängern oder Arbeitsmaschinen betreffen; insoweit haftet SLT nach den allgemeinen Vorschriften.",
          },
          {
            type: "p",
            text: "Eine Haftung nach dem Produkthaftungsgesetz sowie aus übernommenen Garantien bleibt unberührt.",
          },
          {
            type: "p",
            text: "Die vorstehenden Haftungsbeschränkungen gelten auch zugunsten der gesetzlichen Vertreter, Mitarbeiter und Erfüllungsgehilfen von SLT.",
          },
        ],
      },
      {
        id: "v-5-2",
        number: "5.2",
        title: "Mängelrechte des Mieters",
        body: [
          {
            type: "p",
            text: "Bei Mängeln der Mietsache hat der Mieter Anspruch auf Beseitigung des Mangels gemäß § 535 Abs. 1 Satz 2 BGB. SLT ist berechtigt, den Mangel nach eigener Wahl durch Reparatur oder durch Bereitstellung eines gleichartigen Ersatzgegenstandes zu beseitigen. Bei vollständiger Gebrauchsuntauglichkeit der Mietsache oder bei Versagen einer sicherheitsrelevanten Funktion (insbesondere Bremsen, Lenkung, Beleuchtung an Anhängern und Kraftfahrzeugen) steht dem Mieter das Recht zur außerordentlichen fristlosen Kündigung gemäß § 543 Abs. 2 Nr. 1 BGB zu. Die gesetzlichen Rechte des Mieters auf Mietminderung (§ 536 BGB) bleiben im Rahmen der vorstehenden Haftungsregelung unberührt.",
          },
        ],
      },
    ],
  },
  {
    id: "vi",
    number: "VI.",
    title: "Stornierung durch den Mieter",
    subsections: [
      {
        id: "vi-6-1",
        number: "6.1",
        title: "Stornierungsrecht",
        body: [
          {
            type: "p",
            text: "Der Mieter kann den Mietvertrag vor Mietbeginn jederzeit durch Erklärung in Textform gegenüber SLT kündigen („Stornierung“).",
          },
        ],
      },
      {
        id: "vi-6-2",
        number: "6.2",
        title: "Stornogebühren (pauschalierte Entschädigung)",
        body: [
          {
            type: "p",
            text: "Im Falle der Stornierung kann SLT eine pauschalierte Entschädigung verlangen, die sich – vorbehaltlich des Nachweisvorbehaltes nach Abs. 6.3 – wie folgt bemisst (in Prozent des vereinbarten Nettomietpreises):",
          },
          {
            type: "list",
            items: [
              "a) bis 14 Tage vor Mietbeginn: 30 %",
              "b) bis 7 Tage vor Mietbeginn: 50 %",
              "c) bis 3 Tage vor Mietbeginn: 70 %",
              "d) bis 48 Stunden vor Mietbeginn: 85 %",
              "e) bei späterer Stornierung oder Nichtabholung: 90 %",
            ],
          },
        ],
      },
      {
        id: "vi-6-3",
        number: "6.3",
        title: "Nachweisvorbehalt",
        body: [
          {
            type: "p",
            text: "Dem Mieter bleibt ausdrücklich der Nachweis vorbehalten, dass SLT kein oder nur ein wesentlich geringerer Schaden entstanden ist. SLT bleibt der Nachweis eines höheren, konkret entstandenen Schadens vorbehalten.",
          },
        ],
      },
      {
        id: "vi-6-4",
        number: "6.4",
        title: "Kostenfreie Stornierungsoption",
        body: [
          {
            type: "p",
            text: "Bei Buchung der kostenpflichtigen Option „Kostenfreie Stornierung“ kann der Mieter bis 72 Stunden vor Mietbeginn ohne Gebühren stornieren. Eine Stornierung nach diesem Zeitpunkt unterliegt den Stornogebühren nach Abs. 6.2.",
          },
        ],
      },
    ],
  },
  {
    id: "vii",
    number: "VII.",
    title: "Pflichten und Haftung des Mieters",
    subsections: [
      {
        id: "vii-7-1",
        number: "7.1",
        title: "Einhaltung von Vorschriften",
        body: [
          {
            type: "p",
            text: "Der Mieter verpflichtet sich, alle geltenden gesetzlichen und behördlichen Vorschriften (insbesondere Unfallverhütungsvorschriften, Straßenverkehrsordnung, Führerscheinpflicht, Betriebssicherheitsverordnung, DGUV-Vorschriften) einzuhalten und alle erforderlichen Erlaubnisse und Genehmigungen einzuholen.",
          },
          {
            type: "p",
            text: "Für Verstöße gegen gesetzliche Vorschriften haftet der Mieter vollumfänglich und stellt SLT von sämtlichen Ansprüchen Dritter frei.",
          },
        ],
      },
      {
        id: "vii-7-2",
        number: "7.2",
        title: "Versicherung der Mietsache",
        body: [
          {
            type: "p",
            text: "Die Versicherung der Mietsache obliegt dem Mieter, sofern keine Versicherung über SLT abgeschlossen wurde. Für einige Mietartikel (z.B. Anhänger mit Haftpflichtversicherung, Stromgeneratoren) besteht ein Versicherungsschutz; die Versicherungsbedingungen können auf Wunsch eingesehen werden.",
          },
        ],
      },
      {
        id: "vii-7-3",
        number: "7.3",
        title: "Unfall und Schadensfall – Meldepflicht",
        body: [
          {
            type: "p",
            text: "Bei Unfällen, Verlust, Diebstahl oder Beschädigungen hat der Mieter unverzüglich die Polizei und SLT zu verständigen und ein Schadensprotokoll vorzulegen. Ansprüche Dritter darf der Mieter nicht anerkennen, ohne SLT vorher in Kenntnis zu setzen.",
          },
        ],
      },
      {
        id: "vii-7-4",
        number: "7.4",
        title: "Nutzung durch Dritte und Auslandsfahrten",
        body: [
          {
            type: "p",
            text: "Die Nutzung der Mietsache durch Dritte sowie Auslandsfahrten sind nur nach vorheriger Genehmigung von SLT in Textform zulässig.",
          },
        ],
      },
      {
        id: "vii-7-5",
        number: "7.5",
        title: "Schlüssel und Zubehör",
        body: [
          {
            type: "p",
            text: "Schlüssel, Zubehör und mitgelieferte Dokumente sind sorgfältig zu verwahren und bei Rückgabe vollständig zu übergeben. Verlust wird dem Mieter zu den tatsächlichen Wiederbeschaffungskosten berechnet.",
          },
        ],
      },
      {
        id: "vii-7-6",
        number: "7.6",
        title: "Wartezeiten und Personalkosten",
        body: [
          {
            type: "p",
            text: "Sofern der Mieter die von SLT zur Verfügung gestellten Fachkräfte (Servicetechniker, Lieferfahrer, Eventtechniker) bei der Leistungserbringung warten lässt oder die vereinbarte Leistung nicht oder nicht rechtzeitig erbringen kann (insbesondere wegen fehlender Zugänglichkeit, nicht erteilter Genehmigungen, fehlender Ansprechpartner oder ähnlicher Umstände im Verantwortungsbereich des Mieters), berechnet SLT die hierdurch entstehenden Personalkosten auf Grundlage der jeweils gültigen internen Stundenverrechnungssätze. Die Stundenverrechnungssätze umfassen Bruttolohn, Lohnnebenkosten, kalkulatorische Dispositions- und Verwaltungsaufwände sowie etwaige Folgekosten aus verspäteten oder ausgefallenen Anschlussaufträgen. Die jeweils gültigen Sätze betragen aktuell:",
          },
          {
            type: "list",
            items: [
              "a) Lieferfahrer: 89,00 EUR netto/Std.",
              "b) Servicetechniker Verkehrstechnik / Eventtechnik: 95,00 EUR netto/Std.",
              "c) Servicetechniker Baumaschinen, Nutzfahrzeuge, Anhänger: 125,00 EUR netto/Std.",
            ],
          },
          {
            type: "p",
            text: "Anbruchstunden werden auf volle Viertelstunden aufgerundet. Dem Mieter bleibt der Nachweis vorbehalten, dass kein oder ein geringerer tatsächlicher Aufwand entstanden ist.",
          },
        ],
      },
      {
        id: "vii-7-7",
        number: "7.7",
        title: "Maschinenversicherung und Versicherungsbedingungen",
        body: [
          {
            type: "p",
            text: "Sofern der Mieter eine Maschinenversicherung über SLT abschließt, gelten die im Angebot genannten Selbstbeteiligungen je Schadensfall. Vom Versicherungsschutz können bestimmte Risiken (z.B. Glasbruch, Reifenschäden, Fahrten ohne behördlich erforderliche Erlaubnis) ausgeschlossen sein; die Einzelheiten ergeben sich aus den Versicherungsbedingungen, die dem Mieter auf Wunsch überlassen werden.",
          },
          {
            type: "p",
            text: "Schließt der Mieter eine eigene Versicherung ab, hat diese mindestens Schäden nach den jeweils geltenden Bedingungen (z.B. ABMG 2008) sowie Schäden durch Abhandenkommen zu decken. Der Versicherungsschutz ist SLT auf Verlangen nachzuweisen.",
          },
        ],
      },
      {
        id: "vii-7-8",
        number: "7.8",
        title: "GPS-Ortungssystem",
        body: [
          {
            type: "p",
            text: "(a) Funktion und Zweck: Bestimmte Mietgeräte (insbesondere höherwertige Baumaschinen, Arbeitsbühnen, Stromaggregate, Anhänger und Kraftfahrzeuge) sind mit einem GPS-Ortungssystem ausgestattet. Die Verarbeitung der Standort- und Betriebsdaten dient ausschließlich der Diebstahlprävention, der Wiederbeschaffung im Verlust- oder Diebstahlsfall sowie der technischen Fernüberwachung sicherheitsrelevanter Betriebszustände.",
          },
          {
            type: "p",
            text: "(b) Rechtsgrundlage: Die Verarbeitung erfolgt auf Grundlage des berechtigten Interesses gemäß Art. 6 Abs. 1 lit. f DSGVO. Eine permanente Echtzeit-Ortung erfolgt nicht; eine konkrete Standortabfrage wird nur bei Verdacht auf Diebstahl, unbefugte Ausfuhr aus Deutschland oder Verlust der Mietsache durchgeführt.",
          },
          {
            type: "p",
            text: "(c) Datenkategorien: Geographische Position (Längen-/Breitengrad), Zeitstempel, technische Betriebsdaten.",
          },
          {
            type: "p",
            text: "(d) Empfänger: Die Daten werden ausschließlich durch SLT und – im Verlustfall – durch beauftragte Sicherheitsdienstleister, Strafverfolgungsbehörden sowie Versicherungen verarbeitet.",
          },
          {
            type: "p",
            text: "(e) Speicherdauer: Standortdaten werden 90 Tage nach Mietende automatisch gelöscht, soweit keine konkreten Sicherungs- oder Beweissicherungsinteressen entgegenstehen.",
          },
          {
            type: "p",
            text: "(f) Betroffenenrechte: Den betroffenen Personen stehen die Rechte aus Art. 15–22 DSGVO zu. Beschwerden können bei der zuständigen Aufsichtsbehörde (Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen) eingelegt werden.",
          },
          {
            type: "p",
            text: "Weitere Hinweise zum Datenschutz finden sich in der Datenschutzerklärung unter www.slt-rental.de/datenschutz.",
          },
        ],
      },
    ],
  },
  {
    id: "viii",
    number: "VIII.",
    title: "Aufbau, Service und Transport",
    subsections: [
      {
        id: "viii-8-1",
        number: "8.1",
        title: "Verfügbarkeit des Aufbauorts",
        body: [
          {
            type: "p",
            text: "Bei Anmietung mit Service- oder Aufbaudienstleistungen ist der Mieter verpflichtet, einen geeigneten, freien und zugänglichen Aufbauort zur Verfügung zu stellen und alle erforderlichen Voraussetzungen für einen sicheren und schnellen Ablauf zu schaffen.",
          },
        ],
      },
      {
        id: "viii-8-2",
        number: "8.2",
        title: "Verzögerungen und Mehraufwand",
        body: [
          {
            type: "p",
            text: "Für Verzögerungen oder Mehraufwand, die nicht durch SLT zu vertreten sind (z.B. fehlende Zugänglichkeit, Wartezeiten, notwendiges zusätzliches Personal, erforderliche Rückfragen), trägt der Mieter die entstehenden Kosten.",
          },
          {
            type: "p",
            text: "SLT ist nicht verpflichtet, den Aufbauort vor Vertragsbeginn auf Eignung zu überprüfen. Die Verantwortung hierfür obliegt dem Mieter.",
          },
        ],
      },
      {
        id: "viii-8-3",
        number: "8.3",
        title: "Unvorhergesehene Arbeiten",
        body: [
          {
            type: "p",
            text: "Unvorhergesehene, vom vereinbarten Leistungsumfang nicht umfasste Arbeiten (z.B. zusätzliche Auf- und Abbauten, Wartezeiten, Nacharbeiten auf Wunsch des Mieters) werden nach Lohn- und Materialnachweis gesondert berechnet. Grundlage sind die jeweils gültigen Verrechnungssätze von SLT, die auf Anfrage eingesehen werden können.",
          },
        ],
      },
      {
        id: "viii-8-4",
        number: "8.4",
        title: "Reisekosten und Übernachtung",
        body: [
          {
            type: "p",
            text: "Reisekosten, Übernachtungs- und Verpflegungskosten von SLT-Mitarbeitern werden gesondert berechnet und sind vom Mieter zu tragen.",
          },
        ],
      },
    ],
  },
  {
    id: "ix",
    number: "IX.",
    title: "Besondere Bedingungen für Verkehrssicherung und Verkehrstechnik",
    subsections: [
      {
        id: "ix-9-1",
        number: "9.1",
        title: "Änderungen und Konkretisierungen",
        body: [
          {
            type: "p",
            text: "Bei Änderungen oder Konkretisierungen der verkehrsrechtlichen Anordnung oder der Ausführungsplanung ist SLT berechtigt, das Angebot entsprechend anzupassen. Im Auftragsfall erfolgt die Abrechnung nach tatsächlichen Massen und Lieferscheinen.",
          },
        ],
      },
      {
        id: "ix-9-2",
        number: "9.2",
        title: "Zuständigkeiten des Auftraggebers",
        body: [
          {
            type: "p",
            text: "Die Kontrolle auf Vollständigkeit der Beschilderung, Absperrung und Beleuchtung nach Arbeitsschluss, die Durchführung von Sonderregelungen für arbeitsfreie Zeiten, die ggf. mehrmalige tägliche Reinigung der Verkehrssicherungsmaterialien sowie die Absicherung der Kernbaustelle einschließlich erforderlicher Anrampungen obliegen dem Auftraggeber, soweit nicht ausdrücklich etwas anderes in Textform vereinbart ist.",
          },
          {
            type: "p",
            text: "Bei Arbeitsstellen längerer Dauer hat der Auftraggeber gemäß ZTV-SA tägliche Kontrollen mindestens zweimal täglich (bei Tagesanbruch und nach Eintritt der Dunkelheit) durchzuführen, an arbeitsfreien Tagen mindestens einmal täglich. Nach Unwetter oder Sturm sind Kontrollen unverzüglich vorzunehmen. Auf Wunsch können tägliche Kontrollfahrten durch SLT gesondert beauftragt werden.",
          },
        ],
      },
      {
        id: "ix-9-3",
        number: "9.3",
        title: "Eigentum und Abrechnung",
        body: [
          {
            type: "p",
            text: "Die zur Verfügung gestellten Verkehrssicherungs-Materialien bleiben Eigentum von SLT. Die Abrechnung der Miete erfolgt monatlich, wenn die Mietzeit einen Monat überschreitet, spätestens jedoch nach 90 Tagen. Die Miete verlängert sich automatisch bis zur Abmeldung in Textform durch den Auftraggeber. Die Abmeldung bzw. der Abbau ist mindestens 72 Stunden vor dem geplanten Abbautermin in Textform anzukündigen.",
          },
        ],
      },
      {
        id: "ix-9-4",
        number: "9.4",
        title: "Batteriewechsel",
        body: [
          {
            type: "p",
            text: "Der Batteriewechsel an Leuchten und anderen batteriegestützten Einrichtungen hat spätestens alle 14 Tage zu erfolgen. Der Auftraggeber kann den Batteriewechsel und die Baustellenkontrolle als zusätzliche Leistung beauftragen.",
          },
        ],
      },
      {
        id: "ix-9-5",
        number: "9.5",
        title: "Behördliche Auflagen und Sondermaterialien",
        body: [
          {
            type: "p",
            text: "Werden aufgrund behördlicher Auflagen oder Genehmigungsvorgaben zusätzliche Materialien oder Sperrmaßnahmen erforderlich, werden diese gesondert angeboten und berechnet.",
          },
        ],
      },
      {
        id: "ix-9-6",
        number: "9.6",
        title:
          "Haftung für Beschädigungen und Verluste der Verkehrssicherungsmaterialien",
        body: [
          {
            type: "p",
            text: "Beschädigungen oder Verluste der Mietmaterialien während der Mietdauer gehen zu Lasten des Auftraggebers, soweit sie nicht durch SLT zu vertreten sind. Hat SLT im Rahmen eines gesondert beauftragten Kontroll- oder Wartungsservices Kontrollpflichten vor Ort übernommen, haftet SLT für Schäden, die durch eine schuldhafte Verletzung dieser übernommenen Pflichten verursacht wurden, nach Maßgabe der Haftungsregelung in Ziff. 5.1.",
          },
        ],
      },
      {
        id: "ix-9-7",
        number: "9.7",
        title: "Gebühren und Amtsentgelte",
        body: [
          {
            type: "p",
            text: "Gebühren und Entgelte der Behörden sind – sofern nicht ausdrücklich anders angegeben – nicht Bestandteil des Angebots und werden gesondert abgerechnet.",
          },
        ],
      },
    ],
  },
  {
    id: "x",
    number: "X.",
    title: "Besondere Bedingungen für die Vermietung von Kraftfahrzeugen",
    subsections: [
      {
        id: "x-10-1",
        number: "10.1",
        title: "Haftpflichtversicherung",
        body: [
          {
            type: "p",
            text: "Für das gemietete Fahrzeug besteht eine Kfz-Haftpflichtversicherung mit einer maximalen Deckungssumme von 100 Mio. EUR für Personen- und Sachschäden und einer maximalen Deckungssumme von 12 Mio. EUR je geschädigter Person. Der Versicherungsschutz ist auf den europäischen Raum beschränkt.",
          },
        ],
      },
      {
        id: "x-10-2",
        number: "10.2",
        title: "Vollkaskoschutz und Diebstahlschutz",
        body: [
          {
            type: "p",
            text: "Der Mieter kann gegen gesondertes Entgelt einen Vollkaskoschutz (einschließlich Diebstahlschutz) mit einer vereinbarten Selbstbeteiligung abschließen. Durch Abschluss des Vollkaskoschutzes reduziert sich die Haftung des Mieters für Unfallschäden oder Verlust des Fahrzeugs auf die vereinbarte Selbstbeteiligung. Eine weitergehende Reduzierung der Selbstbeteiligung ist nach Maßgabe des jeweiligen Angebots möglich.",
          },
        ],
      },
      {
        id: "x-10-3",
        number: "10.3",
        title: "Ausfall von Versicherungsschutz",
        body: [
          {
            type: "p",
            text: "Bei vorsätzlicher oder grob fahrlässiger Schadenverursachung oder bei schwerwiegenden Verletzungen mietvertraglicher Pflichten kann der Anspruch auf Vollkasko- und Diebstahlschutz ganz oder teilweise entfallen.",
          },
        ],
      },
      {
        id: "x-10-4",
        number: "10.4",
        title: "Haftung ohne Vollkaskoschutz",
        body: [
          {
            type: "p",
            text: "Wird kein Vollkaskoschutz (inkl. Diebstahlschutz) vereinbart, haftet der Mieter für alle nicht nachweislich fremdverschuldeten Schäden am Mietfahrzeug bis zur Höhe des Wiederbeschaffungswerts zuzüglich weiterer ersatzfähiger Schäden (z.B. Wertminderung, Sachverständigenkosten, Abnutzungskosten).",
          },
        ],
      },
      {
        id: "x-10-5",
        number: "10.5",
        title: "Bearbeitungsentgelt für behördliche Anfragen",
        body: [
          {
            type: "p",
            text: "Für die Bearbeitung von behördlichen Auskunftsanfragen im Zusammenhang mit Verkehrs- und Ordnungswidrigkeiten, Gesetzesverstößen oder sonstigen Vorwürfen, kann SLT ein angemessenes Bearbeitungsentgelt verlangen. Die Höhe wird im jeweiligen Mietvertrag ausgewiesen.",
          },
        ],
      },
    ],
  },
  {
    id: "xi",
    number: "XI.",
    title: "Datenschutz, Gerichtsstand und Schlussbestimmungen",
    subsections: [
      {
        id: "xi-11-1",
        number: "11.1",
        title: "Datenschutz",
        body: [
          {
            type: "p",
            text: "Es gilt ergänzend die Datenschutzerklärung von SLT, abrufbar unter www.slt-rental.de/datenschutz. SLT verarbeitet im Rahmen der Geschäftsbeziehung auch personenbezogene Daten von zuständigen Ansprechpartnern der Geschäftspartner.",
          },
        ],
      },
      {
        id: "xi-11-2",
        number: "11.2",
        title: "Anwendbares Recht",
        body: [
          {
            type: "p",
            text: "Für alle Streitigkeiten aus oder im Zusammenhang mit dem Mietverhältnis gilt das Recht der Bundesrepublik Deutschland. Das UN-Kaufrecht ist ausgeschlossen.",
          },
        ],
      },
      {
        id: "xi-11-3",
        number: "11.3",
        title: "Gerichtsstand",
        body: [
          {
            type: "p",
            text: "Ausschließlicher Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit dem Mietverhältnis ist – soweit gesetzlich zulässig – der Sitz von SLT in Krefeld. SLT bleibt berechtigt, den Mieter auch an dessen allgemeinem Gerichtsstand zu verklagen.",
          },
        ],
      },
      {
        id: "xi-11-4",
        number: "11.4",
        title: "Erfüllungsort",
        body: [
          {
            type: "p",
            text: "Erfüllungsort für alle Leistungen aus diesem Vertrag ist der Sitz von SLT in Krefeld.",
          },
        ],
      },
      {
        id: "xi-11-5",
        number: "11.5",
        title: "Einweisung",
        body: [
          {
            type: "p",
            text: "Eine Einweisung in die Bedienung und Handhabung der Mietgegenstände wird nach Maßgabe der Verfügbarkeit durchgeführt.",
          },
        ],
      },
      {
        id: "xi-11-6",
        number: "11.6",
        title: "Auftragsbestätigung",
        body: [
          {
            type: "p",
            text: "Auftragsbestätigungen werden dem Mieter übermittelt und sollten geprüft werden. Das Schreiben gilt mit oder ohne Unterschrift als wirksam.",
          },
        ],
      },
      {
        id: "xi-11-7",
        number: "11.7",
        title: "Nebenabreden und Änderungen",
        body: [
          {
            type: "p",
            text: "Nebenabreden und Änderungen dieser AGB sowie des Mietvertrags bedürfen der Textform. Das gilt auch für die Aufhebung dieses Textformerfordernisses.",
          },
        ],
      },
      {
        id: "xi-11-8",
        number: "11.8",
        title: "Aufrechnungs- und Zurückbehaltungsrechte",
        body: [
          {
            type: "p",
            text: "Der Mieter ist nur dann zur Aufrechnung berechtigt, wenn seine Gegenansprüche rechtskräftig festgestellt, unbestritten oder von SLT anerkannt sind. Ein Zurückbehaltungsrecht steht dem Mieter nur insoweit zu, als sein Gegenanspruch auf demselben Mietverhältnis beruht.",
          },
        ],
      },
      {
        id: "xi-11-9",
        number: "11.9",
        title: "Salvatorische Klausel",
        body: [
          {
            type: "p",
            text: "Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sein oder werden, berührt dies nicht die Gültigkeit der übrigen Bestimmungen. Die unwirksame Bestimmung wird durch eine wirksame Regelung ersetzt, die dem wirtschaftlichen Zweck am nächsten kommt.",
          },
        ],
      },
    ],
  },
];
