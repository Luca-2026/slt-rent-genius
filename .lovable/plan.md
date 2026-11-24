# Standortbezogene Umsatz- und Angebotsauswertung

## Ziel und Umfang
Die vorhandene **Umsatzauswertung** erweitern:
- Tages-, Wochen-, Monats-, Quartals- und Jahreswerte sowie frei gewählte Zeiträume.
- Drei getrennte Betrachtungen: **geschriebene Angebote**, **angenommene Angebote / Auftragsvolumen**, **fakturierter Nettoumsatz**.
- **Miete**, **Verkauf** und **Gesamt** auswählbar; Miete und Verkauf auch in der Gesamtansicht getrennt erkennbar.
- Aktive Niederlassungsleiter nur eigener Standort; Admins einschließlich Luca/Benedikt beide einzeln oder zusammen.
- Keine Deckungsbeitrags-, Bonus- oder Zielberechnung in dieser Umsetzung. Keine Änderungen an Einkaufsdaten, Gemeinkosten, Preisen oder bestehenden Belegen.

## 1. Geprüfter Bestand
- Vorhanden: Admin-Auswertung fakturierter Nettoumsätze, Miet-/Verkaufstrennung, Zeitraum-/Standort-/Kategorie-/Kundengruppenfilter und CSV. Tag/Woche und Angebotsauswertungen fehlen dort.
- Die Startseite hat eigene Umsatzsummen; ihre Brutto-Pipeline nach aktuellem Status ist keine historische Netto-Auswertung.
- Ralf ist aktiver Niederlassungsleiter in Bonn; Luca und Benedikt sind Admins. Die vorhandene Superadmin-Prüfung entspricht der Admin-Rolle; keine neue Rolle oder E-Mail-Freigabe einführen.
- Mitarbeiter-Leserechte sind teilweise standortübergreifend. Nur den Standortschalter auszublenden schützt die neue Auswertung nicht.
- Angebots-/Annahmenachweise und unveränderliche Auftragsänderungen existieren; Vollständigkeit der Altdaten noch prüfen.

## 2. Deine bestätigten Entscheidungen
1. **Geschriebene Angebote:** ausschließlich nachweislich versendete Angebote. Fertige unversendete Angebote, Formularentwürfe und PDF-Vorschauen zählen nicht.
2. **Datenumfang:** nur hier gespeicherte App-/B2B-Portal-Belege. Nicht erfasste externe Umsätze etwa aus Rentware ausdrücklich benennen; keine unbelegte Vollständigkeitsbehauptung.

## 3. Einheitliche fachliche Regeln
### Werte und Zeiträume
- Geldbeträge **netto**, centgenau aus den gespeicherten Dokumentwerten; keine pauschale Rückrechnung aller Bruttobeträge mit 19 %.
- Berliner Kalenderzeit, unabhängig von Gerätezeitzone: Tag 00–24 Uhr, Woche Montag–Sonntag, Kalendermonat, Kalenderquartal und Kalenderjahr.
- Aktuelle Perioden bis heute; vergangene Perioden und freie Von-/Bis-Auswahl mit sichtbaren Datumsgrenzen.
- Die drei Betrachtungen sind verschiedene Stufen desselben Geschäfts und werden **niemals zu einem Gesamtumsatz addiert**.

### Geschriebene Angebote – Angebotsvolumen
- Wert aus der versendeten Angebotsfassung, Datum aus dem nachgewiesenen Versand. `offer_sent_at` allein genügt nicht: dieser Zeitpunkt wird im aktuellen Ablauf bereits vor dem eigentlichen Versand gespeichert.
- Erneutes Versenden derselben Fassung zählt nicht erneut. Überarbeitungen dürfen das vollständige Angebotsvolumen nicht mehrfach addieren.
- Vorschlag für die Auswertung: erste nachweislich versendete Fassung als Basis, spätere versendete Überarbeitungen als Wertdifferenz zum Vorgänger am jeweiligen Versandtag.
- Ablehnung/Verfall löscht die historische Angebotsleistung nicht; der aktuelle Zustand bleibt in der Belegliste erkennbar.

### Angenommene Angebote – Auftragsvolumen
- Tatsächliche Kundenannahme zählt, einschließlich belegter Vor-Ort-Annahme oder bindender Kundenübergabe; nicht allein ein aktueller Status oder verstrichener Mietbeginn.
- Ursprünglich angenommener Nettoauftragswert zum Annahmezeitpunkt. Vereinbarte spätere Änderungen werden als positive/negative Differenz am dokumentierten Vereinbarungszeitpunkt erfasst, statt frühere Monate still umzuschreiben.
- Ein später abgerechneter oder erledigter Auftrag bleibt als historischer Auftragseingang erhalten. Ein belegter Auftragsstorno reduziert dieses Volumen am Stornotag; fehlende Nachweise nicht erfinden.
- Unbefristete Angebote ohne eindeutig gespeicherten Gesamtwert werden mit Anzahl und Hinweis ausgewiesen, nicht auf zwölf Monate hochgerechnet und nicht als 0-€-Auftrag dargestellt.

### Fakturierter Nettoumsatz
- Ausgestellte Rechnungen nach Rechnungsdatum, unabhängig davon, ob bereits bezahlt. Entwürfe, Kautionen und reine Zahlungseingänge zählen nicht als Umsatz.
- Miet-/Verkaufs-Anfragerechnungen und B2B-Portal-Rechnungen gemeinsam, aber je Beleg nur einmal.
- Gutschriften mit negativem Netto zum eigenen Belegdatum. Originalrechnungen bleiben erhalten; `credited_amount` oder Erstattungen nicht zusätzlich ein zweites Mal abziehen.
- Abschläge zählen bei Ausstellung; Schlussrechnungen nur mit ihrem gespeicherten Netto nach Abschlagsabzug. Keine erneute Addition des vollen Auftragswerts.
- Mietumsatz zählt vollständig als Umsatz, ohne Verkaufs-Einkaufs-/Gemeinkostenabzug. Liefer-/Service-/Zusatzleistungen werden nachvollziehbar in der zugehörigen Geschäftsart ausgewiesen.
- Umsatz, Anzahl und Belegliste verwenden exakt dieselbe Auswahl. Rechnungen und Gutschriften als Belegarten separat erkennbar, statt Gutschriften als normale Rechnungsanzahl auszugeben.

### Standorte
- Zwei organisatorische Auswertungsstandorte: **Bonn** und **Krefeld einschließlich Mülheim an der Ruhr**, entsprechend der bestehenden Konsolidierung. Physischer Gerätebestand bleibt unverändert getrennt.
- Zuordnung nach dem dokumentierten ausstellenden/abwickelnden Standort, nicht nach Mitarbeiter, Kundenadresse oder Gerätestandort.
- Bestehende Rechnungs-Standortangaben haben Vorrang; Portal-Belege zuerst anhand belegbarer Ausstellungs-/Angebotszuordnung prüfen. Ein später geänderter Kundenstammstandort darf historische Belege nicht verschieben.
- Fehlender oder widersprüchlicher Standort wird nicht geraten: für Admins separat als „Nicht zugeordnet / prüfen“, für Niederlassungsleiter nicht sichtbar und nicht zur eigenen Summe gerechnet.

## 4. Bedienung und Darstellung
- Menüpunkt **Umsatzauswertung** auch für berechtigte Leiter; Zeitraum mit Vor/Zurück, Geschäftsart und drei getrennte Kennzahlen.
- Standortwahl nur für Admins; Leiter sehen fest ihren eigenen Standort.
- Zeitverlauf und Belegliste: Datum, Auftrags-ID, Dokumentnummer, Art, Zustand, Netto; Details nur mit Dokumentrechten.
- Vorhandene Kategorie-/Artikel-/Kundengruppenfilter und CSV erhalten; fehlende Zuordnungen kennzeichnen.
- Mobil: Kennzahlen zuerst, weitere Filter eingeklappt, Namen umbrechen; keine Überlappung oder Seitenüberläufe.
- Laden, Leerstand, unvollständige Daten und Fehler unterscheiden; Fehler niemals als 0 € darstellen.
- Startseiten-Umsätze an dieselbe Berechnung anschließen, Leiter standortbeschränkt; sonstige Aufgaben/Rechte unverändert.

## 5. Technische Umsetzung nach Freigabe
1. **Lesender Datenabgleich:** Belegarten, Annahmewege, Fassungen, Standorte und Datumsnachweise prüfen. Lücken dokumentieren; keine Rückdatierung oder Originaländerung.
2. **Geschützte Serverabfrage:** Identität, Rolle und aktiven Mitarbeiterstandort serverseitig prüfen. Admins beide Standorte, Leiter nur eigenen; alle anderen gesperrt. Ohne Leiterstandort kein Zugriff.
3. **Standortschutz auf allen Ausgaben:** Summen, Diagramm, Optionen, Belegliste und CSV identisch beschränken; fremde Standortparameter ablehnen. Keine fremden Daten im Browser oder privilegierten Schlüssel im Frontend. Operative Mitarbeiterrechte unverändert lassen.
4. **Zentrale Normalisierung:** Geschäftsart, Betrachtung, Datum, Netto, Dokument/Vorgang, historischer Standort und Herkunft. Portal-/Anfrage-Doppelungen nur anhand tatsächlicher Verknüpfungen ausschließen.
5. **Ereignisnachweise:** unveränderliche Belege/Revisionen bevorzugen. Fehlende Historie nicht schätzen; künftige Ereignisse bei Bedarf atomar im bestehenden Versand-/Annahme-/Änderungsablauf festhalten. Neue Tabellen gegebenenfalls mit Grants, RLS, geschützten Schreibwegen und ohne anonyme Leserechte.
6. **Vollständigkeit:** Datenbankaggregation, paginierte Listen, Tests oberhalb des Standard-Abfragelimits; Indizes nach tatsächlichem Bedarf.
7. **Oberfläche, Navigation und Startseite anbinden** und technische Regeln aktualisieren. Einkaufsdaten, Team und Audit bleiben Admin-only.

## 6. Rundumcheck und Abnahme
### Automatisierte Fach- und Sicherheitstests
- Rollenmatrix: Admin/Superadmin beide Standorte, aktive Leiter nur eigenen; Mitarbeiter/Kunden/inaktive Leiter/anonyme Zugriffe gesperrt.
- Manipulierte Standortparameter, direkte Abfragen, CSV und fremde Details; keine fremden Summen/Optionen.
- Alle fünf Zeiträume, Berliner Mitternacht, Kalenderwechsel und Sommerzeit, inklusive Datumsgrenzen.
- Miete/Verkauf/Gesamt, Doppelzählung, Revision/Neuversand, Annahme nach späterer Fakturierung, Storno, Teil-/Vollgutschrift, Abschlag/Schlussrechnung.
- Belegsumme = Kennzahl = Zeitverlauf = Export, centgenau. Unbekannt ist nicht 0.

### Echte Mitarbeiterabläufe
- Als **Ralf** anmelden: Bonn-Werte, alle Zeiträume und Betrachtungen, Geschäftsartwechsel, Belegöffnung, CSV und Neuladen prüfen; direkter Versuch auf Krefeld muss scheitern.
- Als **Luca und Benedikt** beide Standorte einzeln/zusammen gegen Belege nachrechnen.
- Schreib-/Ereignistests ausschließlich mit kontrollierten Testdaten; keine echten Kundenangebote versenden oder produktive Rechnungen für Statistiktests ausstellen.

### Handy, Tablet und Web
- 360/390/430 px, Tablet und Desktop: lange Namen, große Beträge, viele/keine Belege und Fehlerzustände.
- Filter, Datumswahl, Zurücknavigation, Diagramm, Liste, Export und Dokumentöffnung bedienen; Überschneidungen, abgeschnittene Zahlen und Seitenüberlauf ausschließen.
- Testbericht mit Konten, Abläufen, Zahlenabgleich und Bildern; ungeprüfte Fälle einschließlich nativem iPhone-Safari ausdrücklich nennen.
- Veröffentlichung erst nach dokumentierter Abnahme, nicht allein nach Implementierung.

## Ergebnis und bewusste Grenzen
Standortgeschützte Angebots-/Auftrags-/Rechnungswerte für Miete/Verkauf. Deckungsbeitrag und Bonus bleiben außen vor; **Verkauf netto − Einkauf netto × (1 + Gemeinkosten-% / 100)** bleibt unverändert. Datenlücken offen benennen, niemals schätzen.

**Freigabe:** Keine Anwendung, Rechte oder Geschäftsdaten geändert. Umfang geklärt; Umsetzung erst nach deiner Freigabe.