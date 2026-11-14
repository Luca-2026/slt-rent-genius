# Stornierungen: Ist-Zustand und geplanter Ablauf

## Ergebnis der Prüfung

**Es gibt derzeit keinen durchgängigen AGB-basierten Auftragsstorno.** Rechnungsstorno, Vorgangsstatus, Zahlungen und Gerätebelegung sind getrennte Abläufe. Die AGB-Fristen werden in den geprüften Abläufen nicht automatisch in eine Stornoforderung umgerechnet.

- **Mietvorgänge:** Es gibt „Abgelehnt“ und „Erledigt“, aber keinen eigenen Status „Storniert“. Der normale Statuswechsel schreibt nur den Status; er berechnet weder Gebühren noch Erstattungen und führt keinen gemeinsamen Stornoabschluss aus.
- **Rechnungen:** „Stornieren / Gutschrift“ erstellt eine vollständige oder teilweise Rechnungskorrektur mit Bezug auf die ursprüngliche Rechnung. Das ist nicht gleichbedeutend mit einer Vertragsstornierung. Vorhandene Erstattungswege sind getrennte, manuell ausgelöste Aktionen.
- **B2B-Portal:** Reservierungen kennen „Storniert“ als Status/Filter. In der geprüften Kundenansicht ist jedoch kein AGB-Stornodialog vorhanden; noch offene Anfragen haben stattdessen eine Löschaktion.
- **Stornooption:** Vorhanden ist ein einmaliger Aufpreis von 5 % auf den Mietpreis, ohne Versicherung und Kaution. Die Option verspricht Gebührenfreiheit bis 72 Stunden vor Mietbeginn; eine zentrale Ausführung dieses Anspruchs fehlt.
- **Halteverbot:** Unbezahlte 24-Stunden-Reservierungen laufen automatisch ab. Das ist kein Kundenstorno. Bezahlte Schilderbuchungen werden unabhängig vom Vorgangsstatus als belegt gezählt; ein bloßes „Abgelehnt“ oder „Erledigt“ gibt sie deshalb nicht zuverlässig frei.
- **Einzelgeräte:** Die geprüften Statuswechsel lösen keinen gemeinsamen Freigabevorgang für die verbindlichen Gerätezuordnungen aus. Allgemeine Mengenprüfung und Einzelgerätezuordnung müssen zusammen behandelt werden.

Geprüft wurden Quellcode, aktuelle Datenbankfunktionen und lokale AGB-PDFs. Es wurde kein echter Auftrag storniert, kein Geld erstattet und keine Kundenmail versendet. Die im Versand verwendeten AGB aus dem Dokumentenspeicher sowie externe Rentware-Stornos sind noch nicht inhaltlich verifiziert.

## Maßgebliche AGB-Staffeln

Website-AGB, Stand Mai 2026, Abschnitt VI, und die lokalen getrennten B2C-/B2B-PDFs stimmen bei den folgenden Staffeln überein:

| Vorlauf vor vereinbartem Mietbeginn | Privatkunde: Anteil am Bruttomietpreis | Geschäftskunde: Anteil am Nettomietpreis |
|---|---:|---:|
| Mindestens 14 Tage | 25 % | 30 % |
| Mindestens 7, aber weniger als 14 Tage | 40 % | 50 % |
| Mindestens 3, aber weniger als 7 Tage | 60 % | 70 % |
| Mindestens 48, aber weniger als 72 Stunden | 75 % | 85 % |
| Weniger als 48 Stunden oder Nichtabholung | 85 % | 90 % |

Diese eindeutige Intervallzuordnung ist die geplante Auslegung der AGB-Formulierung „bis … vor Mietbeginn“. Vor Automatisierung sind insbesondere die Tagesgrenzen und die Zeitberechnung rechtlich zu bestätigen. Stundenfristen werden minutengenau gerechnet; Berliner Vertragszeiten und Sommerzeit müssen berücksichtigt werden.

**Mit vereinbarter Stornooption:** Bei mindestens 72 Stunden Vorlauf entfällt die pauschalierte Stornoforderung. Danach gilt die normale Staffel. **Luca hat entschieden: Der bezahlte 5-%-Optionsaufpreis bleibt einbehalten.** Keine rückwirkende Aufnahme der Option nach Eingang des Stornos.

**Kein pauschaler Automatismus:** Die AGB erlauben den Nachweis eines geringeren oder fehlenden Schadens sowie eines höheren konkreten Schadens. Kulanz und solche Nachweise müssen deshalb mit Begründung berücksichtigt werden können. Kaution ist kein Mietpreis und keine Stornogebührenbasis.

### Widerspruch in älteren Unterlagen

Das zusätzliche PDF `public/downloads/AGB_Vermietbedingungen.pdf` enthält eine andere Staffel: 20 Tage / 7 Tage / 3 Tage / 48 Stunden mit 30 / 50 / 70 / 90 / 100 %. Das B2B-Dashboard verlinkt eine gleichnamige Datei aus dem Dokumentenspeicher; deren Inhalt ist noch zu prüfen.

**Geplant:** Für neue Verträge die passenden getrennten AGB eindeutig verwenden und abweichende Download-Verweise nach Prüfung ersetzen. Historische Verträge behalten ihre tatsächlich vereinbarte Fassung. Bei fehlendem Nachweis keine aktuelle Staffel stillschweigend auf Altaufträge anwenden.

## Geplante Umsetzung

### 1. Storno, Ablehnung und Mietende sauber trennen

- Neue Aktion **„Auftrag stornieren“** im Mietvorgang; statt Löschen oder „Erledigt“ als Ersatz für Stornos.
- Unverbindliche Anfrage ohne Vertrag: mit Abschlussgrund schließen, keine automatische Stornoforderung. Vertragsschluss anhand Bestätigung und vorhandener Nachweise prüfen, nicht nur anhand eines Status oder einer Zahlung.
- Bestätigte Miete vor Mietbeginn: AGB-Storno mit Vorschau.
- Nichtabholung: eigene bestätigte Entscheidung mit AGB-Staffel; keine automatische Einstufung als Nichtabholung nur wegen eines fehlenden Übergabeprotokolls.
- Bereits übergebenes Gerät oder laufende Miete: Kündigung/Freimeldung und Rückgabeabwicklung statt rückwirkendem Vor-Mietbeginn-Storno. Gerät bleibt bis zur tatsächlichen Rückgabe belegt.
- Undatierte oder unbefristete Aufträge, strittiger Vertragsschluss und Teilstornos: manuelle Prüfung; keine erfundenen Fristen oder pauschale Neuberechnung unveränderter Positionen.

### 2. Nachvollziehbare Stornovorschau

Der Mitarbeiter erfasst Eingang der Erklärung, Textform-Nachweis und Grund. Maßgeblich ist der dokumentierte Eingang, nicht der spätere Bearbeitungszeitpunkt.

Die Vorschau zeigt:
- vereinbarten Mietbeginn und Vorlauf;
- Kundenart, vereinbarte AGB-Fassung und gewählte Staffel;
- Mietpreis-Basis und daraus ermittelte Forderung;
- Stornooption und einbehaltenen Optionsaufpreis;
- bereits ausgeführte Leistungen getrennt von nicht ausgeführten Leistungen;
- erhaltene Zahlungen, Kaution, bereits erfolgte Erstattungen;
- verbleibende Kundenforderung oder Erstattungsbetrag.

Kulanz oder abweichender nachgewiesener Schaden brauchen eine Begründung und gesonderte Freigabe. Keine pauschale Aufschlagberechnung auf Kaution, Versicherung, Transport und Personal. Bereits erbrachte Leistungen und ersparte Kosten werden geprüft, damit nichts doppelt verlangt wird.

### 3. Zahlungen und Dokumente korrekt abwickeln

- Bestehende Angebote, ABs, Rechnungen und Originalzahlungen unverändert erhalten.
- Ohne Rechnung: abgestimmten Stornobeleg mit Vorschau erzeugen.
- Mit Rechnung oder Abschlägen: passende Rechnungskorrekturen und gegebenenfalls separate Stornoforderung erstellen; Abschläge, Zahlungen und frühere Gutschriften einmalig berücksichtigen.
- Die umsatzsteuerliche Behandlung einer pauschalierten Entschädigung muss vor Umsetzung mit dem Steuerberater geklärt werden. **Nicht automatisch 19 % aufschlagen und nicht automatisch alles als nicht steuerbar behandeln.** Mietpreis-Basis und steuerliche Behandlung sind getrennte Fragen.
- Erstattungen bleiben manuell und über die bestehenden geschützten Wege auf das ursprüngliche Zahlungsmittel; gemeinsame Obergrenze aller Rückzahlungen bleibt erhalten.
- Kaution getrennt ausweisen; keine automatische Kautionsauszahlung. Offene Erstattungen sichtbar halten, auch wenn der Auftrag bereits storniert ist.
- Rechnungserstellung und Kautionserstattung nicht allein am Auftragsstatus sperren; bestehende finanzielle Schutzprüfungen bleiben bestehen.
- Eine klare Stornobestätigung mit Auftrags-ID, Beträgen und tatsächlichem Zahlungsstand versenden. Offene Rückzahlungen niemals als erledigt bestätigen; keine zusätzliche Mietguthaben-PDF.

### 4. Bestand und Aufgaben gemeinsam aktualisieren

Mit Bestätigung des Stornos werden Vorgang, verknüpfte Reservierungen, Schilderbuchung, künftige Gerätezuordnungen, Transportaufträge und operative Aufgaben konsistent aktualisiert. Zahlungs- und Annahmelinks dürfen danach keine neue Verpflichtung auslösen; Angebotsnachfragen und Rückgabeerinnerungen entfallen, soweit nicht mehr erforderlich.

Finanzielle Restaufgaben bleiben sichtbar. Storno, Zahlungseingang und Rückzahlung dürfen bei gleichzeitigen Aktionen nicht zu Doppelbuchungen führen. Spät eingehende Zahlungen werden nachvollziehbar zur Prüfung gestellt, nicht verworfen oder zur automatischen Wiedereröffnung genutzt.

### 5. Sonderwege kontrolliert anbinden

- Halteverbot: bereits ausgeführte Aufstellung, Abholung und Genehmigungsleistungen einzeln prüfen; bezahlte Sets tatsächlich freigeben, nicht nur den Mietvorgang schließen.
- Anhänger/Rentware: zunächst den dortigen Storno-, Zahlungs- und Bestätigungsablauf verifizieren; keine doppelte Erstattung oder parallel berechnete Stornoforderung.
- Verkauf: keine Mietstornoprozente anwenden. Verbraucher-Fernabsatzwiderruf gesondert behandeln; vorhandene Belehrung nennt 14 Tage ab Warenempfang und besondere Rückzahlungs-/Rücksenderegeln.
- Die pauschale Aussage „kein Widerrufsrecht bei allen Mieten“ nicht ungeprüft zur Entscheidungsautomatik machen. Insbesondere Halteverbot, separat vermietete Werkzeuge und undatierte/unbefristete Mieten rechtlich prüfen.

## Technische Leitplanken

- Gemeinsame, versionierte Stornoregeln für Vorschau und serverseitige Bestätigung; Vertragsfassung und Berechnungsbasis als unveränderlichen Nachweis speichern.
- Geschützter, wiederholbarer Bestätigungsvorgang mit Versionsprüfung und einheitlicher Sperrreihenfolge; keine Wiederholungsschleifen bei Konflikten.
- Rechte aus den bestehenden zentralen Mitarbeiter-/Standortprüfungen übernehmen; Kunden dürfen keine Forderungen, Zahlungseingänge oder Erstattungsfreigaben selbst setzen.
- Bestehende Rechnungs- und Rückzahlungsfunktionen wiederverwenden; keine zweite Zahlungsbuchhaltung.
- Neuen Zustand „Storniert“ in Listen, Suche, Kalender, Belegung und Auswertung einheitlich berücksichtigen, ohne historische Umsätze und Korrekturen zu verlieren.

## Prüfung vor Freigabe

1. Konkrete Tests jeder B2C-/B2B-Staffel genau an der Grenze sowie unmittelbar davor und danach; mindestens 14 Tage, 7 Tage, 72 Stunden und 48 Stunden. Berliner Sommerzeit gesondert prüfen.
2. Option bei exakt 72 Stunden: keine pauschalierte Stornoforderung, bezahlter 5-%-Aufpreis bleibt; unmittelbar danach normale Staffel.
3. Ohne Zahlung, teilbezahlt, vollständig bezahlt; mit/ohne Kaution, Rechnung, Abschlägen und früheren Rückzahlungen.
4. Kulanz, Schadensnachweis, laufende Miete, Nichtabholung und fehlende Vertrags-/Datumsnachweise.
5. Geräte-, Schilder- und Transportfreigabe tatsächlich über Verfügbarkeitsprüfung zurücklesen.
6. Doppelbestätigung und gleichzeitiger Zahlungseingang ohne doppelte Forderung oder Rückzahlung; fremder Standort ohne Berechtigung abgewiesen.
7. Vollständiger Ablauf mit echter Mitarbeiterrolle und gekennzeichnetem Testauftrag: Vorschau → Storno → Belege → Zahlungsstand → Listen/Kalender. Testrechnungen vollständig neutralisieren; keine echten Kunden oder Auszahlungen für Tests verwenden.

**Reihenfolge:** Zuerst Vertragsfassungen und steuerliche/rechtliche Sonderfälle klären, dann Mitarbeiter-Storno umsetzen, anschließend Halteverbot/Portal und externe Anhängerabläufe anbinden. Bestehende Kundenaufträge nicht automatisch nachträglich stornieren oder neu berechnen.

**Noch nicht umgesetzt:** Dieser Plan ändert keine Aufträge, AGB, Preise, Zahlungen oder Berechtigungen.