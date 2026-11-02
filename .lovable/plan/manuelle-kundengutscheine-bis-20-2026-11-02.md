# Manuelle Kundengutscheine bis 20 %

## Bestehender Feedbackstatus
„Wartet auf Feedback“ bedeutet: Ein persönlicher Feedback-Link wurde angelegt, aber noch kein vollständig ausgefülltes internes Feedback abgegeben. Es ist noch kein aktiver Feedback-Gutschein. Der bestehende einmalige 10-%-Feedback-Gutschein bleibt unverändert.

## Neue Funktion
- In „Gutscheine“ erhalten Admins und Niederlassungsleiter eine Aktion „Gutschein erstellen“.
- Kunde auswählen, Rabatt größer 0 bis maximal 20 % und internen Vergabegrund angeben. Ohne Feedback einen individuellen, kundenbezogenen Code erzeugen; einmal einlösbar, ohne automatisch gesetzte Ablauffrist.
- Den tatsächlichen Rabattsatz, Herkunft „Manuell“, Kundenbezug und Status anzeigen. Code vollständig sichtbar zum Abtippen, mit Kopieraktion und einer Teilen-Aktion für die Übergabe über eigene Nachrichtenprogramme.
- Erstellung, Sperrung, Reservierung und Einlösung mit Zeitpunkt und Verantwortlichem nachvollziehbar halten.
- Eingabe im bestehenden Website-Mietanfragefeld und geschützte Übernahme ins Angebot unterstützen. Versicherungen, Zubehör, Haftungsfreistellung, Stundenlohn und sonstige ausgeschlossene Zusatzkosten bleiben unverändert. Keine Änderung ausgestellter Rechnungen oder unterschriebener Angebote.

## Übermittlung an Kunden
Code oder Nachricht kopieren sowie über die geräteeigene Teilen-Funktion übermitteln. **Kein automatischer Gutscheinwerbeversand über den App-E-Mail-Dienst**, da dieser Werbeinhalte nicht erlaubt. Ein direkter Werbe-E-Mail-Versand benötigt einen separaten geeigneten Versanddienst und dessen Freigabe; er ist nicht Bestandteil dieses Schritts. Keine Kundenmail im Test auslösen.

## Technische Umsetzung
- Manuelle Vergabe von Feedbackaktivierung und deren Einmal-pro-Kunde-Regel trennen; bestehende Feedbackcodes erhalten.
- Bestehende Gutscheinprüfung, Reservierung und atomare Einlösung wiederverwenden und für variable Rabattsätze absichern. Serverseitig Admin/Niederlassungsleitung und Obergrenze prüfen; keine Berechtigungen aus Browserdaten ableiten.
- Datenänderungen additiv über eine Migration, ohne bestehende Gutscheine oder Geschäftsbelege zu löschen.

## Prüfung
- Konkrete Tests: 20 % erlaubt, mehr als 20 % und nichtpositive Werte abgewiesen; unberechtigte Rollen abgewiesen; falscher Kunde und zweite Einlösung abgewiesen; ausgeschlossene Positionen unverändert.
- Mobil, Tablet und Desktop: Erstellung, sichtbarer Code, Kopieren/Teilen und Statusanzeige prüfen.
- Angemeldeten Durchlauf mit freigegebenem Mitarbeiter-Testkonto durchführen. Lucas derzeitiger Testfirma-Zugang hat keine Mitarbeiterrechte; keine Rechte künstlich vergeben. Ohne passenden Zugang bleibt diese Live-Abnahme ausdrücklich offen.