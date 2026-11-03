# Direktbuchung für Halteverbotsschilder-Sets

## Ergebnis
- Ausschließlich Halteverbotsschilder-Sets in Krefeld und Bonn können direkt im bestehenden Warenkorb gebucht werden. Je Standort sind bereits zehn Sets hinterlegt; andere Artikel und Mülheim an der Ruhr bleiben im Anfrageprozess.
- Zwei wählbare Pakete: Standard für 49 € brutto und Rundum-sorglos für 199 € brutto. Leistungen des Sorglos-Pakets laut Artikelseite: Antrag, Aufstellung, Aufstellprotokoll und Abbau; städtische Gebühren sind zusätzlich.
- Bereits erteilte Genehmigungen können vertraulich als PDF oder Bild hochgeladen und dem Auftrag zugeordnet werden. Beim Sorglos-Paket werden Aufstelladresse und Nutzungszeitraum erfasst.
- Zahlungslink unmittelbar nach Buchungsabschluss im Warenkorb: Stripe oder Überweisung. Bei Überweisung erfasst ein Mitarbeiter den tatsächlichen Eingang; erst dann folgt automatisch die Zahlungs-/Buchungsbestätigung.
- Unbezahlte Reservierungen bestehen exakt 24 Stunden ab Abschluss und werden danach automatisch freigegeben. Die Historie bleibt erhalten. Vollständige Zahlung einschließlich hinterlegter Kaution ist Voraussetzung für die endgültige Bestätigung.

## Vor endgültiger Preisfreigabe klären
- Die bestehende Artikelseite nennt 1–10 Miettage. Diesen Zeitraum für die neuen 49/199-€-Pakete bestätigen; einen längeren Zeitraum ohne gepflegten Folgetarif nicht automatisch verkaufen.
- Kaution für diese Sets festlegen, gegebenenfalls ausdrücklich 0 €. Unbekannte Kaution nicht stillschweigend als 0 behandeln.
- Umgang mit den zusätzlich anfallenden städtischen Gebühren im Sorglos-Paket festlegen: Ohne bereits erteilte Genehmigung oder verlässlich bestimmbaren Gebührenbetrag ist kein endgültiger Gesamtpreis möglich. Solche Fälle zunächst als Anfrage behandeln, statt zusätzliche Kosten zu erfinden oder Zahlung als vollständig auszugeben.

## Umsetzung
1. Paketpreise und Leistungen zentral in der Artikelpflege hinterlegen; Preise auf der Artikelseite und im Warenkorb daraus lesen. Brutto-Endpreise centgenau erhalten, Netto-/Steueraufteilung einheitlich berechnen.
2. Bestandsreservierung für den gesamten tatsächlichen Belegungszeitraum einschließlich Aufstellung und Abbau einführen. Gleichzeitige Buchungen, bestehende bestätigte Aufträge und offene Reservierungen gemeinsam berücksichtigen.
3. Warenkorb um Paketauswahl, Genehmigungsupload, Bedingungen und verbindlichen Abschluss erweitern. Gemischte Warenkörbe bleiben im bisherigen Anfrageprozess; kein unbeabsichtigter Direktverkauf anderer Artikel.
4. Buchung, unveränderlichen Preis-/Leistungssnapshot, Auftrags-ID und Zahlungslink sicher und wiederholbar speichern. Bereits angelegte Buchung nach Neuladen wieder anzeigen; wiederholtes Absenden erzeugt keinen zweiten Auftrag.
5. Vorhandenes Stripe weiterverwenden, keine zweite Zahlungsanbindung. Zahlung erst nach verifizierter Stripe-Meldung oder geschützter Mitarbeitererfassung bestätigen; keine Bestätigung allein durch Rückkehr von Stripe.
6. Nach vollständiger Zahlung automatisch Bestätigung und vorhandene Dokumentstrecke auslösen. Versand während der Abnahme ausschließlich an luca@sandhoff.org; produktive Automatisierung bleibt bis gesonderter Freigabe deaktiviert.
7. Abgelaufene unbezahlte Reservierungen atomar freigeben und Zahlungslinks sperren. Verspätete Zahlung nicht auf inzwischen anderweitig belegte Sets bestätigen; als Klärungsfall dokumentieren, keine eigenmächtige Erstattung.

## Technische Details
- Eng begrenzte serverseitige Freigabe anhand des tatsächlichen Artikel-Slugs und Standorts; Preise, Mengen, Fristen und Dokumentzuordnung niemals vom Browser übernehmen.
- Additive Datenänderungen mit expliziten Zugriffsrechten, geschützten atomaren Reservierungs-/Zahlungsfunktionen und eindeutigen Wiederholungsschlüsseln. Bestehende Mitarbeiter-Bestandsprüfung muss dieselben Reservierungen berücksichtigen.
- Private Dokumentablage mit begrenzten Dateitypen/-größen, kurzlebigen geschützten Uploadberechtigungen und Mitarbeiterzugriff; keine öffentlichen Genehmigungslinks.
- Bestehende Stripe-Zahlungs- und Erstattungsregeln sowie GoBD-Snapshots erhalten. Neue 24-Stunden-Freigabe nur für diese Direktbuchungen; allgemeine Angebots-Nachfragen nicht ändern.

## Ende-zu-Ende-Abnahme
- Beide Standorte und beide preislich vollständig geklärten Pakete: auswählen → Genehmigung hochladen → Abschluss → Auftrags-ID/Zahlungslink → Stripe-Testzahlung beziehungsweise Mitarbeitererfassung → gespeicherte Zahlung und Bestätigung im B2B-Portal zurücklesen.
- Zehn verfügbare Sets, elftes Set abweisen; letzte freie Sets gleichzeitig anfragen, keine Überbuchung. Standortkapazitäten unabhängig testen.
- Doppeltes Absenden, Neuladen, doppelte Zahlungsnachricht, falscher Betrag, Teilzahlung, Zahlungsabbruch und verspätete Zahlung testen.
- Nach 24 Stunden ohne Zahlung automatische Freigabe prüfen; vollständig bezahlte Buchungen bleiben belegt.
- Genehmigung nur berechtigt zugänglich, andere Artikel unverändert; Warenkorb auf Handy und Desktop prüfen.
- Kein echter Geldfluss, keine Kundenmails und keine Veröffentlichung während der Testabnahme. Nicht prüfbare Schritte ausdrücklich benennen.