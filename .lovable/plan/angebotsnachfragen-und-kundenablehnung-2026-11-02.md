# Angebotsnachfragen und Kundenablehnung

## Bestandsprüfung
- Die Zahlungserinnerung existiert: einmalig eine Stunde nach Annahme bei noch offener Vorkasse/Anzahlung. Der bestehende Zeitplan prüft stündlich. Diese Zahlungsregeln bleiben unverändert.
- Für noch nicht angenommene Mietangebote gibt es bisher keine regelmäßige Nachfrage und keine Kundenablehnung mit Grund.
- Angebotslinks berücksichtigen bisher die Angebotsgültigkeit, aber nicht zuverlässig den früheren Mietbeginn.
- Bestehende Angebots-E-Mails laufen über den vorhandenen Versanddienst. Die zusätzliche Lovable-E-Mail-Domain ist noch nicht verifiziert; keine Umstellung des bestehenden Versands in dieser Aufgabe.

## Geplante Änderungen
1. **Angebotsnachfrage alle zwei Tage:** Erste Nachfrage 48 Stunden nach erfolgreichem Angebotsversand, danach alle 48 Stunden, nur zur aktuellen, noch nicht angenommenen Fassung. Kurz und sachlich, mit Angebot öffnen/annehmen und ablehnen. Keine Werbung und keine Zahlungsaufforderung für unangenommene Angebote.
2. **Automatischer Verfall:** Das frühere Ende aus Angebotsgültigkeit und geplantem Mietbeginn ist maßgeblich. Bei Erreichen der Grenze keine weitere Nachfrage und keine Annahme/Ablehnung mehr. Die Anfrage bleibt mit dokumentiertem Ablaufgrund erhalten; kein Löschen, keine Stornierung bereits angenommener Aufträge. Bei unbefristeter Miete gilt ebenfalls der Beginn, nicht ein erfundenes Enddatum. Ohne Beginn gilt die Angebotsgültigkeit.
3. **Ablehnungsbutton in Angebots-E-Mail und Nachfragen:** Öffnet die persönliche Angebotsseite direkt im Ablehnungsmodus. Erst eine ausdrückliche Bestätigung lehnt ab, nicht der Linkaufruf durch Kunde oder E-Mail-Prüfdienst.
4. **Ablehnungsgrund:** Auswahl beispielsweise „Preis zu hoch“, „Nicht mehr benötigt“, „Termin passt nicht“ und „Sonstiger Grund“, mit optionalem Freitext. Grund, Zeitpunkt und Angebotsfassung werden nachvollziehbar gespeichert; Annahme und Ablehnung schließen sich gegenseitig aus.
5. **Tiefpreisgarantie:** Bei „Preis zu hoch“ sofort ein Hinweis mit Link zur vorhandenen SLT-Rental-Tiefpreisgarantie. Kein automatischer Rabatt, keine Zusage ohne Prüfung der bestehenden Bedingungen; Kunde kann zur Annahme zurückkehren oder trotzdem ablehnen.
6. **Teamnachricht:** Nach erfolgreicher Ablehnung eine E-Mail an den zuständigen Standort mit Grund und direktem Auftragslink. Testfirma-Nachrichten ausschließlich an luca@sandhoff.org. Versandfehler bleiben nachvollziehbar und wiederholbar, ohne die Ablehnung doppelt zu speichern.

## Technische Umsetzung
- Gemeinsame, getestete Frist-/Nachfrageregeln für öffentliche Angebotsseite und Erinnerungsauswahl; vorhandene Berliner Zeitberechnung verwenden.
- Den bestehenden stündlichen Zahlungs-Erinnerungsaufruf um die fälligen Angebotsnachfragen ergänzen, keinen zusätzlichen Dauerzeitplan anlegen. Nachfragen kommen spätestens beim nächsten Stundenlauf nach Fälligkeit; die öffentliche Seite sperrt ab der exakten Frist. Der gespeicherte Ablauf wird beim nächsten Lauf nachgezogen.
- Geschützte atomare Datenbankübergänge und Versandprotokoll mit Berechtigungen: aktuelle Fassung prüfen, Doppelversand vermeiden, konkurrierende Annahme/Ablehnung/Fristablauf absichern. Kunden dürfen Status oder Versandziele nicht frei ändern.
- Neue Angebotsfassung beendet Nachfragen zur alten Fassung; Zahlungserinnerung nach Annahme bleibt separat.

## Abnahme
- Regeltests für exakt 48 Stunden, wiederholte Nachfragen, Mietbeginn/Gültigkeit, Berliner Datum/Uhrzeit, angenommene/abgelehnte/überarbeitete Angebote, gleichzeitige Entscheidungen und Versandwiederholung.
- Browserprüfung der Angebotsseite auf Handy, Tablet und Desktop: Preisgrund → Garantiehinweis → bestätigte Ablehnung; Reload zeigt gespeicherten Status, spätere Annahme wird abgewiesen.
- Separater eindeutig gekennzeichneter Luca-Testvorgang: echte Angebots-, Nachfrage- und Ablehnungs-E-Mails ausschließlich an luca@sandhoff.org. Keine echten Kundenangebote ändern. Versandannahme durch den Dienst und gespeicherten Verlauf prüfen; tatsächlichen Eingang im Postfach nur als bestätigt melden, wenn überprüfbar.
- Vollständige Mitarbeiter-Abnahme benötigt ein berechtigtes Mitarbeiterkonto: Lucas derzeitiger Testfirma-Zugang wurde bei Mietanfragen mit „Kein Zugriff“ geprüft. Keine Rollen ohne Freigabe ändern; falls weiterhin blockiert, die verbleibende Abnahme ausdrücklich ausweisen.
- Bericht mit getesteten Schritten, Ergebnissen und offenen Grenzen; keine Websiteveröffentlichung ohne ausdrücklichen Auftrag.