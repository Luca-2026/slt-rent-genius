# Persönliches Feedback und einmalige 10-%-Gutscheine

## Ziel
Nach einer abgeschlossenen Miete erhält der Kunde einen persönlichen Zugang zum vorhandenen Feedbackformular. Nach Abgabe seines internen Feedbacks wird ein **10-%-Gutschein für die nächste Miete** aktiviert – **insgesamt einmal pro Kunde**, unabhängig von der Sternezahl. Eine Google-Bewertung ist weder erforderlich noch Voraussetzung.

## Versandgrenze
Lovable unterstützt keine Gutscheinwerbung oder Wiederbuchungsangebote in Rechnungs-E-Mails. Deshalb werden weder der Werbetext noch automatische Gutschein-E-Mails eingebaut. Ein neutraler persönlicher Feedback-Link kann der Rechnung beigefügt werden; die Belohnung und der aktivierte Code erscheinen auf der Feedback-Bestätigungsseite und, bei Portalkunden, im B2B-Portal. Rechnungsversand und seine bestehenden Anhänge bleiben erhalten; kein Wechsel des vorhandenen E-Mail-Systems.

## Ablauf
1. **Persönliche Einladung:** Für eine echte abgeschlossene Miete mit ausgestellter Miet-/Schlussrechnung wird ein sicherer Feedback-Link erstellt. Vorschauen, Abschläge, Gutschriften und erneute Versände erzeugen keine weiteren Einladungen. Beim Wiederholungsversand wird derselbe Link verwendet.
2. **Feedback:** Der Link ordnet Auftrag und Kunden automatisch zu. Kundendaten können nicht durch geänderte Formularfelder umgebogen werden. Mindestens eine beantwortete Bewertungsfrage oder ein inhaltlicher Kommentar ist erforderlich. Erneutes Absenden erzeugt keinen zweiten Gutschein.
3. **Aktivierung:** Erst nach erfolgreich gespeicherter Rückmeldung wird ein nicht übertragbarer 10-%-Code erzeugt. Kunden mit bereits erhaltenem Gutschein bekommen keinen neuen. Alte anonyme Rückmeldungen und manuelle Codes werden nicht automatisch zu berechtigten Gutscheinen umgewandelt.
4. **B2B-Portal:** Ein Bereich „Gutscheine“ zeigt Kunde, Auftrag, Feedbackdatum, Code, Status und Einlöseauftrag. Status: wartet auf Feedback, aktiv, reserviert, eingelöst oder gesperrt. Berechtigte Mitarbeiter sehen Gutscheine für ihre Kunden; Sperrungen und begründete Korrekturen sind nachvollziehbar protokolliert.
5. **Nächste Miete:** Mitarbeiter können den Code im Mietangebot anwenden. Der Kunde muss mit dem ursprünglichen Kunden übereinstimmen. Die Berechnung und Reservierung werden beim Angebotsversand geprüft, die endgültige Einlösung erfolgt bei Annahme. Überarbeitungen dürfen keinen zweiten Rabatt erzeugen. Ungenutzte Reservierungen werden nach Ablauf/Freigabe des Angebots sicher gelöst; angenommene Angebote bleiben unveränderte Belege.

## Vorgeschlagene Rabattregeln
- 10 % auf die Netto-Mietartikelpositionen der nächsten Miete, centgenau berechnet.
- Nicht auf Lieferung, Abholung, Versicherungen, Reinigung, Kraftstoff, Schäden, Kaution oder Verkaufsartikel.
- Keine Kombination mit Kundenrabatten oder Sonderpreisen: je Position gilt der günstigere berechtigte Preis, nicht mehrfacher Rabatt.
- Anhänger bleiben entsprechend der bisherigen Vorgabe von Sonderkonditionen ausgenommen.
- Keine automatische Gültigkeitsfrist, solange keine Frist festgelegt wurde; Gutschein kann begründet gesperrt werden.

## Schutz gegen Missbrauch
- Zufällige, lange persönliche Zugangsschlüssel; keine öffentliche Freigabe über Rechnungsnummer, E-Mail oder Auftrags-ID allein.
- Kundenbindung über vorhandene Kundenakte bzw. B2B-Firma; normalisierte Rechnungs-E-Mail zusätzlich zum Abgleich. Fehlende oder widersprüchliche Kundenidentitäten müssen vor Freigabe geklärt werden.
- Vergabe, Aktivierung und Einlösung werden zentral geprüft; parallele Anfragen können nicht doppelt aktivieren oder einlösen.
- Kein öffentlicher Zugriff auf Gutscheinlisten oder Kundendaten; Kunden sehen nur ihre eigenen Gutscheine.
- Begrenzung von Fehlversuchen, Protokollierung von Vergabe/Reservierung/Einlösung/Sperrung und nachvollziehbare Wiederholungsversände.
- Bestehender manueller Gutscheinablauf wird in die neue Verwaltung überführt; die bisherigen Google-Pflicht- und Cashback-Texte werden entfernt. Gutschein-Werbeversand wird nicht weiter aus dem Portal ausgelöst.
- Kein Versprechen absoluter Betrugsfreiheit: bewusst mehrfach angelegte Kundenidentitäten können nicht ohne zusätzliche Identitätsprüfung vollständig ausgeschlossen werden; solche Fälle werden zur Klärung markiert.

## Technische Umsetzung
- Geschützte Einladung-, Gutschein- und Ereignisdaten mit eindeutiger Kundenzuordnung und zentralen, atomaren Vergabe-/Reservierungs-/Einlösefunktionen; bestehende Rollenrechte verwenden.
- Persönliches Feedback serverseitig validieren und zusammen mit der Gutscheinaktivierung speichern. Öffentlicher Altablauf bleibt ohne automatische Gutscheinberechtigung.
- Gemeinsame Rabattberechnung für Vorschau, Angebotsversand, Annahme und Rechnung; Originalpreise, Gutscheinabzug und Zuordnung im Angebotssnapshot festhalten.
- Mietanfragen und B2B-Portal-Mietangebote abdecken. Rentware bleibt extern: dort keine automatische Einlösung behaupten; Anwendung erfolgt in unseren Angeboten.
- Neutrale Feedback-Verknüpfung in den bestehenden Miet-Rechnungsversandwegen, ohne Werbung und ohne produktive Testversände.

## Prüfung und Abschlussbericht
- Tests mit konkreten 10-%-Beträgen und Ausschlüssen.
- Negative Tests: Feedback fehlt, fremder Kunde, manipulierte Angaben, doppelte Vergabe, parallele Einlösung, abgelaufenes/reserviertes Angebot, Wiederholungsversand und alte manuelle Codes.
- Vollständiger Test mit Luca: Einladung → internes Feedback → aktivierter Code → nächste Mietangebotsvorschau → kontrollierte einmalige Einlösung; ausschließlich Testkonto, keine fremden Buchungen oder Kunden-E-Mails.
- Bericht mit geprüften Schritten, Ergebnissen und verbleibenden Grenzen; produktive Einlösungen/Versände nur nach gesonderter Freigabe.