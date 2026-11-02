# Gutscheine und Rabatte vor der Schlussrechnung

## Ergebnis der aktuellen Prüfung
- Rechnungs-E-Mails enthalten einen persönlichen Feedback-Link, sofern eine endgültige Mietrechnung und eine abgeschlossene Rückgabe vorliegen. Abschlags-/Proformarechnungen lösen diesen Ablauf nicht aus. Bei einem Fehler der Linkerzeugung kann die Rechnungsmail derzeit ohne Link weiterlaufen.
- Nach Feedback wird ein persönlicher 10-%-Gutschein angezeigt. Codes sind zufällig, eindeutig und kundenbezogen: insgesamt einmal je Kunde, einmal einlösbar. Aktivierung, Reservierung und Einlösung werden protokolliert; die Angebotsannahme löst die Einlösung atomar aus.
- Aktuell gespeichert: fünf Feedback-Einladungen, eine Abgabe und ein bereits eingelöster Gutschein; dessen Aktivierung, Reservierung und Einlösung stehen im Verlauf.
- Eingabe derzeit durch Mitarbeiter im Mietangebot; auf der öffentlichen Mietanfrage fehlt das Gutscheinfeld. Verwaltung unter „Feedback-Gutscheine“ im B2B-Portal.
- Das persönliche Formular akzeptiert aktuell schon einzelne Bewertungen oder einen Kommentar. Vollständiges Feedback wird noch nicht erzwungen.
- Versicherung, Service, Transport und weitere Zusatzkosten sind teilweise bereits ausgeschlossen; Zubehör, Haftungsfreistellung und Stundenlohn sind nicht ausreichend ausdrücklich abgesichert.
- Nach Rücknahme lassen sich Positionsrabatte bereits im neuen Rechnungsentwurf bearbeiten. Das unterschriebene Angebot bleibt dabei unverändert. Dies ist anhand des Codes geprüft, noch nicht erneut im vollständigen Kundenablauf.
- Die acht bestehenden Gutschein-Tests bestehen. Sie ersetzen keinen vollständigen Test des öffentlichen Kundenablaufs.

## 1. Gutscheincode auf der Website
- Optionales Feld „Gutscheincode“ direkt im eigenen Mietanfrageformular ergänzen.
- Code mit der Anfrage speichern und im Mitarbeiterangebot vorausfüllen, ohne bereits einen Rabatt zu versprechen oder den Code einzulösen.
- Vor Angebotsversand serverseitig Kundenbindung, Status und rabattfähige Positionen prüfen. Fehlermeldungen verständlich anzeigen.
- Keine neue native Buchung und keine Veränderung des externen Rentware-Buchungsfensters.

## 2. Vollständiges internes Feedback und Einmaligkeit
- Für den persönlichen Gutschein alle zehn Sternefragen verlangen; jede Sternezahl von eins bis fünf gleich behandeln. Freitext bleibt optional.
- Vollständigkeit im Formular und serverseitig prüfen; bestehende abgegebene Rückmeldungen und Gutscheine nicht rückwirkend verändern.
- Bestehende Einmalvergabe, Einmal-Einlösung und Verlauf erhalten. Keine automatische Gültigkeitsfrist einführen.
- Fehler bei der Feedback-Linkerzeugung sichtbar nachvollziehbar machen, ohne Rechnungsmails doppelt zu versenden.

## 3. Rabattfähige Positionen absichern
- Gutschein ausschließlich auf rabattfähige eigentliche Mietpositionen anwenden.
- Versicherung, Zubehör, Haftungsfreistellung und Stundenlohnsätze ausdrücklich ausschließen; bestehende Ausschlüsse für Transport, Rückgabekosten und Anhänger beibehalten.
- Versicherungs- und Zusatzbeträge dürfen durch den Gutschein nicht indirekt neu berechnet oder reduziert werden.
- Sonderpreise und höhere bestehende Rabatte erhalten; keine Rabattstapelung.

## 4. Nachträglicher Rabatt vor Rechnungserstellung
- Den vorhandenen Positionsrabatt im Schlussrechnungsentwurf nach Rücknahme prüfen und bei Bedarf korrigieren.
- Rabattänderungen müssen die aktuelle Vorschau aktualisieren und vor endgültiger Ausstellung nachvollziehbar sein.
- Zahlungen und eine bereits verbindliche Kautionsabrechnung nicht still verändern; widersprüchliche Verrechnungen vor Ausstellung erkennen.
- Bereits ausgestellte Rechnungen bleiben unverändert; Korrekturen nur über den bestehenden Gutschriftprozess. Unterschriebene Angebote ebenfalls unverändert lassen.
- Keine Automation, Prüfung oder Voraussetzung einer Google-Bewertung für Rabatt oder Cashback. Google untersagt Belohnungen für öffentliche Bewertungen. Ein unabhängiger Kulanzrabatt oder eine Belohnung für internes Feedback bleibt möglich.

## Tests und Abschlussbericht
- Kleine Regeltests je Ausschluss, für vollständiges Feedback, die zehn Prozent, Einmaligkeit und unveränderte Zusatzbeträge ergänzen und ausführen.
- Website-Eingabe bis Mitarbeiterangebot, persönliches Feedback bis Codeanzeige, erneute Abgabe und Zweiteinlösung prüfen.
- Mit freigegebenen Luca-Testdaten einen Rabatt nach Rückgabe im Rechnungsentwurf setzen und die endgültige Vorschau mit allen ursprünglichen Miet-, Versicherungs-, Zubehör- und Rückgabepositionen vergleichen.
- Keine echte Kundenrechnung, Auszahlung oder Kundenmail auslösen. Ein nummernvergebender Testversand erfolgt nur mit gesonderter Freigabe; Testmails ausschließlich an luca@sandhoff.org.
- Je Punkt berichten: umgesetzt, konkrete Testergebnisse, verbleibende Einschränkungen. Veröffentlichung erst nach Freigabe.

## Technische Umsetzung
- Vorhandene geschützte Gutschein-Funktionen und Ereignistabellen weiterverwenden; öffentlich eingereichten Wunschcode von der geprüften Angebotszuordnung trennen.
- Rabattberechtigung zentral über stabile Artikel-/Positionsmerkmale prüfen, mit konservativem Rückfall für ältere Daten; nicht nur anhand frei eingegebener Bezeichnungen.
- Einheitliche Rabattberechnung für Angebote und Rechnungsentwürfe; unveränderliche ausgestellte Dokumente und atomare Einlösung beibehalten.