# Eigenes Mietanfrage-System mit Kalender, Warenkorb und sofortiger Gutscheinprüfung

## Ziel und klare Abgrenzung
Für normale Websitekunden entsteht ein eigener, durchgängiger Anfrageprozess für **alle Nicht-Anhänger**. **Anhänger bleiben bei Rentware**, sofern ein gültiger Standortcode vorliegt. Ein Restcode an einer Maschine darf nicht mehr zur externen Buchung führen. Anhänger ohne gültigen Buchungsweg erhalten einen klaren Kontakt-/Anfrageweg, keine vorgetäuschte Online-Buchung.

Das eigene System erzeugt zunächst **unverbindliche Leads**, keine bestätigten Reservierungen, Zahlungen oder Gerätebelegungen. Ein Admin oder Mitarbeiter prüft die Anfrage und erstellt anschließend über den bestehenden Ablauf Angebot und Auftragsbestätigung. Echte Maschinenverfügbarkeit wird erst später eingebunden.

**Annahme für diesen Plan:** Anhänger bleiben vollständig im externen Buchungsweg; sie werden nicht gleichzeitig im eigenen Warenkorb verbindlich gebucht. Beide Warenkörbe bleiben getrennt, sehen aber konsistent aus.

## Was bereits vorhanden ist – und was noch fehlt
- Das eigene Anfrageformular besitzt Zeitraum, Menge, Kundenangaben, Lieferung, zusätzliche Artikel, Gutschein-Eingabe und eine erste CMS-Preisvorschau.
- Entwürfe sind derzeit pro Hauptartikel und Standort gespeichert, nicht als gemeinsamer Website-Warenkorb. Zusätzliche Artikel besitzen noch keinen unabhängigen Zeitraum.
- Die Gutscheinprüfung findet bislang im Mitarbeiterangebot statt. Die bestehende geschützte Prüfung setzt eine gespeicherte Anfrage oder ein B2B-Profil voraus; sie kann nicht einfach unverändert für anonyme Eingaben verwendet werden.
- Rentware wird über die öffentliche Seitenhülle geladen. Einige Artikel-/Listenansichten entscheiden noch anhand vorhandener Codes statt anhand der Artikelart. Auch ältere Such-/Katalogwege müssen berücksichtigt werden.
- CMS-Staffeln, Standortpreise und Versicherungsoptionen sind vorhanden. Die neue öffentliche Berechnung darf keine SEO-Ab-Preise oder frei eingegebenen Browserbeträge als Preisquelle verwenden.

## 1. Zuerst: Gutschein direkt am Eingabefeld prüfen
Diese Etappe separat umsetzen und prüfen, bevor der große Umbau beginnt.

- Beim vollständigen Code und nach kurzer Eingabepause sowie beim Verlassen des Feldes eine geschützte Prüfung auslösen; keine Anfrage pro Tastendruck.
- Unmittelbare Feldzustände: **„Wird geprüft“**, **„Bitte E-Mail zur Zuordnung eingeben“**, **„Für diese Anfrage anwendbar“** oder verständlicher Fehler. Bei fehlendem Zeitraum/Artikeln zunächst Status/Kundenbindung prüfen und die konkrete Rabattberechnung später ergänzen.
- Code und Kunden-E-Mail gemeinsam prüfen. Ohne Kundenidentität darf ein Code nicht als vollständig gültig bezeichnet werden. Im neuen Ablauf liegt die E-Mail direkt beim Gutscheinfeld in der abschließenden Zusammenfassung; im bisherigen Formular ist sie bereits vorhanden.
- Die anonyme Vorprüfung aus Code und E-Mail ist keine Identitätsbestätigung. Keine Kundendaten, fremden E-Mails oder internen IDs zurückgeben; Fehler bei unbekanntem Code/falscher Zuordnung gemeinsam formulieren. Endgültige Berechtigung bleibt im geschützten Angebots-/Annahmeprozess.
- Bei Änderung von Code, E-Mail, Artikeln, Standort, Menge oder Zeitraum die alte Prüfung verwerfen und erneut prüfen; verspätete Antworten dürfen neue Eingaben nicht überschreiben.
- Ungültiger eingegebener Code blockiert das Absenden, bis er korrigiert oder entfernt wird. Ein leeres Gutscheinfeld blockiert nie. Bei Dienstausfall keine falsche Gültigkeit anzeigen; Anfrage ohne Code bleibt möglich.
- Prüfung zeigt den konkreten 10-%-Rabatt nur auf berechtigte Mietpositionen. Versicherung, Zubehör, Haftungsfreistellung, Stundenlohn sowie bestehende ausgeschlossene Zusatzkosten bleiben unverändert; Sonderpreise/höhere Rabatte nicht stapeln.
- **Beim Prüfen weder reservieren noch einlösen.** Vor Lead-Speicherung erneut prüfen; vor Angebotsversand erneut prüfen und wie bisher reservieren, bei Annahme atomar einlösen. Zwischenzeitliche Einlösung verständlich behandeln.

## 2. Einheitlicher Buchungsweg und Warenkorbsymbol
- Zentral festlegen, ob ein Artikel Anhänger oder Nicht-Anhänger ist: über echte Hauptkategorie/Artikelmerkmale, niemals allein über Rentware-Code oder Namenssuche.
- Artikelansichten, Kategorien, Suche, Empfehlungen und ältere Kataloge verwenden dieselbe Entscheidung.
- Nicht-Anhänger: „Jetzt mieten“ öffnet den eigenen Kalender. Anhänger: bestehender Rentware-Kalender und dessen Checkout.
- Eigener Warenkorb im gleichen sichtbaren Stil wie das bisherige Symbol: Form, Größe, Farbe, Mengenanzeige und Position vor Umsetzung am realen externen Symbol vergleichen. Symbol erhält eindeutigen Namen und eine stabile Position ohne Überlagerung von Navigation/Chat.
- Auf eigenen Miet- und allgemeinen Website-Seiten den eigenen Anfrage-Warenkorb zeigen. Auf Anhänger-Buchungsseiten übernimmt Rentware diesen Platz; ein vorhandener eigener Anfragebestand bleibt über einen getrennt beschrifteten Zugang erreichbar, ohne zwei identische Symbole übereinander.
- Rentware-Skript nur für tatsächliche Anhängerfunktionen laden, nicht pauschal bei Scrollen auf jeder Seite. Bereits geladene externe Komponenten bei Seitenwechsel korrekt ausblenden, ohne externe Buchungen zu verlieren.
- B2B-Portal, Unterschriften und bisherige geschützte Abläufe bleiben ohne störenden Warenkorb.

## 3. Neuer Kundenablauf

### Schritt A – Zeitraum und Menge
- Monatskalender mit Abholung und Rückgabe, Datum mit Wochentag sowie Uhrzeit; Mobil kompakt und gut scrollbar, Tablet/Desktop mit mehr Kalenderfläche.
- Standortbezogene Abholzeiten verwenden; ungültige Zeitfolge auch bei gleichem Datum abweisen. Nicht verfügbare Daten nicht als „frei“ darstellen.
- Vorläufiger Hinweis: **„Verfügbarkeit wird nach deiner Anfrage bestätigt.“** Vor-Ort-Bestand und konkrete Zeitraumverfügbarkeit ausdrücklich unterscheiden.
- Bau-/Event-, Wochenend- und Nutzungstagsregeln aus dem bestehenden geprüften Preismodul übernehmen, keine neue Tageszählung erfinden. Spezialfälle wie Monatsmiete ohne Enddatum ausdrücklich darstellen und nur aktivieren, wenn der CMS-Tarif und Mindestlaufzeit unterstützt werden.

### Schritt B – Preis und Optionen
- Sobald Zeitraum und Menge feststehen, Mietpreis aus veröffentlichten CMS-Preisen am gewählten Standort berechnen. Tatsächlich gespeicherte Staffeln einschließlich manueller Werte verwenden.
- Preisaufbau: Menge × berechnete Mietdauer/Tarif, Versicherungen, gewählte Zusatzoptionen, gegebenenfalls Lieferung und Gutscheinrabatt. Kaution separat, nicht als Mietumsatz.
- Privatkunden brutto, Geschäftskunden netto mit passendem Steuerhinweis; genau eine Umrechnung. Einheit passend zum Preisschema: Miettage/Kalendertage/Monate/Stück etc.
- Ohne belastbaren CMS-Preis: **„Preis auf Anfrage“**. Bekannte Positionen als bekannte Zwischensumme zeigen, unbepreiste nicht als null Euro oder vollständigen Gesamtpreis ausgeben.
- Nur am Artikel im CMS vorhandene Versicherungen/Haftungsfreistellungen anbieten. Pflichtdeckung nicht abwählbar; alternative Stufen als eindeutige Auswahl, kombinierbare Extras als Checkboxen.
- Selbstbeteiligung, Zeitraum und Euro-Aufpreis sichtbar. Versicherungsstufen beziehen sich auf die Standardversicherung; Mietrabatte reduzieren Versicherungen nicht.
- Keine neuen Versicherungstarife, Zubehörpreise oder Gratisleistungen erfinden. Fehlende Konfiguration kennzeichnen statt einen Standard-Preset als echte CMS-Tatsache auszugeben.

### Schritt C – In den Anfrage-Warenkorb
- Artikel mit Menge, Standort, eigenem Zeitraum und gewählten Optionen hinzufügen.
- „Weitere Artikel auswählen“ führt zurück zu den Artikelseiten; alle bisherigen Positionen bleiben erhalten.
- Derselbe Artikel kann für unterschiedliche Zeiträume als separate Position vorkommen. Nur identische Konfigurationen gezielt zusammenfassen.
- Zeitraum für weitere Artikel übernehmen können, aber jede Position unabhängig ändern. Änderungen berechnen ihre Preise/Optionen neu und lösen Gutschein-Neuprüfung aus.

### Schritt D – Zusammenfassung und Kontaktdaten
- Positionen mit Bild, Zeitraum, Menge, Mietpreis und Optionen; Bearbeiten/Entfernen jederzeit möglich. Erforderliche Angaben vor Absenden prüfen.
- Kontaktdaten, vollständige Adresse und Lieferung wie im bestehenden Anfrageprozess, ohne Registrierungszwang.
- Gutscheinprüfung direkt im Feld; Rabatt und ausgeschlossene Beträge sichtbar nachvollziehbar.
- Abschlussaktion **„Mietanfrage senden“**, nicht „Kostenpflichtig buchen“. Kein direkter Zahlungsvorgang und kein Rechnungszahlungsangebot an Privatkunden.
- Empfangsbestätigung mit Auftrags-ID, allen Positionen/Zeiträumen und Hinweis auf ausstehende Mitarbeiterbestätigung.

## 4. Zwischenspeicherung und verschiedene Zeiträume
- Gemeinsamer Website-Warenkorb über Seitenwechsel, Dialogschließen, Neuladen und weitere Artikel hinweg. Speichern bei jeder relevanten Änderung, nicht erst beim Absenden.
- Produkt, Standort, Mengen, Zeiträume und Optionsschlüssel speichern; gespeicherte Preise sind nie verbindliche Wahrheiten. Beim Öffnen/Absenden CMS-Stand neu laden, Preisänderungen zeigen.
- Keine Kontaktdaten oder Gutscheincodes unnötig dauerhaft im Warenkorb speichern. Keine neue willkürliche Ablauffrist; veraltete/past liegende Zeiträume zur Korrektur markieren.
- Speicherformat versionieren, beschädigte Daten sicher abfangen; bei gesperrtem Gerätespeicher nutzbarer Sitzungsspeicher mit ehrlichem Hinweis.
- Erst nach bestätigter Lead-Speicherung gesendete Positionen entfernen. Bei Fehler bleiben sie erhalten. Mehrfachklick/Wiederholung darf keine doppelten Leads erzeugen.

## 5. Mitarbeiterseite und bestehende Abläufe
- Mehrere Positionen und unterschiedliche Zeiträume vollständig im Lead speichern und in Mitarbeiteransicht, Angebotsvorbelegung und interner Benachrichtigung anzeigen.
- Globale Start-/Enddaten nur als Zusammenfassung kennzeichnen; keine längere pauschale Belegung sämtlicher Artikel daraus ableiten. Preise, Protokolle und Verfügbarkeitsprüfung nutzen den jeweiligen Positionszeitraum.
- Bei unterschiedlichen Abhol-/Rückgabeterminen die Grenzen der heutigen Protokolle prüfen; erforderlichenfalls positionsbezogene Termine/Rückgaben ergänzen, bevor diese Funktion freigegeben wird.
- Mitarbeiter prüft Preis/Bestand und kann das bestehende Angebot erstellen. Reale Gerätezuweisung und Bestätigung ausschließlich über vorhandene geschützte Verfügbarkeits-/Bestätigungsfunktionen.
- Keine Änderungen an ausgestellten Rechnungen, angenommenen Angeboten, Kautionsabrechnungen oder echten Kundenaufträgen.

## Technische Umsetzung
- Gemeinsamer Anfrage-Warenkorb mit versioniertem Speicher, globalem Zugriff und eigener Anzeige; Kalender/Optionen als fokussierte Schritte statt weiterer Überladung des bisherigen Dialogs.
- Öffentliche, begrenzte Serverprüfung für CMS-Preisberechnung und Gutschein-Vorprüfung; nur veröffentlichte Produkte und erlaubte Optionsschlüssel, keine vom Browser gelieferten Preise/Profil-IDs vertrauen. Anfragen begrenzen und Eingaben validieren.
- Bestehende Preismodule und Add-on-Regeln wiederverwenden; Browser-/Serverberechnung auf identische Ergebnisse prüfen, alternative ältere Helfer mit Rabattbasis nicht ungeprüft verwenden.
- `requested_items` um optionale Positionszeiträume/Standort/Tarif und Optionsauswahl erweitern; ältere Anfragen verwenden ihren bestehenden Gesamtzeitraum. Betroffene Parser, Angebotsformulare, Protokolle und Belegdarstellungen vollständig nachziehen.
- Nicht-schreibende Gutschein-Vorprüfung von geschützter Reservierung/Einlösung trennen. Eventuelle Datenbankänderungen ausschließlich über den vorgesehenen Migrationsweg mit passenden Zugriffsrechten.
- Lead-Erstellung serverseitig erneut berechnen, sicher speichern und mit eindeutiger Wiederholungskennung versehen; E-Mail-Fehler dürfen keinen zweiten Lead erzeugen.
- Technische Entscheidungen in `AGENTS.md` festhalten; CMS-Fakten/SEO-Produktdaten nicht verändern.

## Umsetzung in freigabefähigen Etappen
1. **Gutschein-Feldprüfung:** bisheriges Formular erweitern, Fehler-/Änderungsfälle und Nicht-Einlösung testen.
2. **Buchungsgrenze und Warenkorb:** zentrale Anhängerentscheidung, globale Speicherung, Symbol, Seitenwechsel; Rentware unverändert funktionsfähig halten.
3. **Kalender, Preise und Optionen:** ein Artikel Ende zu Ende, CMS-Preisgleichheit und Pflicht-/Wahloptionen.
4. **Mehrere Artikel/Zeiträume:** Positionsbearbeitung plus vollständige Mitarbeiter-/Angebots-/Protokollkompatibilität; erst dann freigeben.
5. **Lead-Abschluss und Abnahme:** echte freigegebene Testanfrage bis Mitarbeiteransicht, Angebotsvorschau und Empfangsbestätigung; anschließend kontrolliert veröffentlichen.
6. **Später separat:** echter öffentlicher Verfügbarkeitskalender je Maschine. Nicht Teil dieser Erstumstellung; fehlende Bestandsdaten vorher bereinigen.

## Tests und Bericht pro Etappe
- Mobil 402×725/kleinere Geräte, Tablet 768×1024 in beiden Ausrichtungen und Desktop 1280×1800; Kalender, Tastatur, Scrollen, Symbol, Dialoge und Textüberläufe.
- Warenkorb: Seitenwechsel, Reload, mehrere Zeiträume desselben Artikels, Änderungen/Löschen, Speicherausfall, CMS-Preisänderung und erfolgloses Absenden.
- Regeln: Staffelgrenzen, Wochenende, Berliner Zeit/DST, Mengen/Sets, Standortpreise, Event/Monatsfälle, fehlende Preise, brutto/netto und centgenaue Summen.
- Optionen/Gutscheine: Pflichtversicherung, exklusive Stufen, unveränderte nicht rabattfähige Beträge; falscher Code/Kunde, bereits eingelöst/reserviert, Dienstfehler, parallele Antworten, keine Reservierung durch Vorprüfung.
- Lead: richtige Zuordnung, Auftrags-ID, Positionszeiträume, keine Doppelanfrage, keine Gerätebelegung/Bestätigung durch Warenkorb; Anhänger bleiben extern buchbar.
- Je Etappe Bericht: umgesetzt, konkret geprüft, Testergebnis, offene Punkte. Keine produktive Anfrage, Rechnung, Buchung oder Mail ohne Freigabe; Testmails ausschließlich an luca@sandhoff.org. Neuer Test mit Mitarbeiterzugang für die interne Abnahme erforderlich.

**Dieser Plan startet noch keine Umsetzung oder Veröffentlichung.** Die sofortige Gutscheinprüfung wird als erste eigenständige Etappe umgesetzt, danach der Warenkorb-Umbau.