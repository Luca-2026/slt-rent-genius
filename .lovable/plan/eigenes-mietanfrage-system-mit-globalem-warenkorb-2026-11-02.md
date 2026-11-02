# Eigenes Mietanfrage-System mit globalem Warenkorb

## Ziel
Nicht-Anhänger erhalten eine eigene, durchgängige Anfrage-Strecke als Pop-up. Anhänger bleiben in der externen Rentware-Buchung. Zunächst werden ausschließlich unverbindliche Anfragen erzeugt: Verfügbarkeit und Auftrag bestätigt ein berechtigter Mitarbeiter.

## 1. Kalender und CMS-Preisvorschau
- „Jetzt mieten“ öffnet auf der Produktseite den Kalender mit Standort, Menge, Abholung und Rückgabe einschließlich Uhrzeit.
- Abhol- und Rückgabezeiten gegen die tatsächlichen Standortöffnungszeiten prüfen.
- Preise ausschließlich aus veröffentlichten CMS-Daten und den bestehenden Preisregeln berechnen; Privatkunden brutto, Geschäftskunden netto.
- Ohne hinterlegte Preise „Preis auf Anfrage“ anzeigen; fehlende Preise nicht als kostenlos darstellen.
- Anschließend verpflichtende Versicherungen und wählbare CMS-Optionen anzeigen. Unvollständige Versicherungseinstellungen nicht mit erfundenen Preisen ergänzen.
- Zusätzliche Artikel und Lieferwunsch ermöglichen; noch nicht berechnete Lieferkosten ausdrücklich aus der Zwischensumme ausnehmen.

## 2. Globales Pop-up und Warenkorb
- Das eigene Warenkorbsymbol oben rechts auf öffentlichen Nicht-Anhängerseiten einschließlich Startseite anbieten.
- Kalender, Optionen, Warenkorb und Kontaktformular in derselben Pop-up-Strecke öffnen; beim Seitenwechsel fortsetzen können.
- Jede Position speichert Artikel, Standort, Menge, eigenen Zeitraum und Optionen. Unterschiedliche Zeiträume je Artikel unterstützen.
- Positionen bearbeiten und entfernen; weitere Artikel über andere Produktseiten hinzufügen.
- Rentware-Symbol und externe Buchungsstrecke ausschließlich für Anhänger verwenden; auch alte Kategoriepfade prüfen.

## 3. Sichtbare 15-Minuten-Frist
- Beim ersten hinzugefügten Artikel eine absolute Ablaufzeit von 15 Minuten setzen.
- Countdown im Warenkorb sichtbar anzeigen; niemals mehr als 15:00 darstellen.
- Seitenwechsel, erneutes Laden und zusätzliche Artikel verlängern die bestehende Frist nicht.
- Nach Ablauf sämtliche ungesendeten Positionen automatisch entfernen und den abgelaufenen Zustand verständlich anzeigen.
- In dieser Phase reserviert der Warenkorb keine Geräte. Der Countdown darf daher keine aktuelle Gerätefreigabe oder Verfügbarkeitsgarantie suggerieren.

## 4. Gutscheincode direkt im Eingabefeld
- Nach Eingabe von Code und Kunden-E-Mail unmittelbar eine geschützte Vorprüfung durchführen; Ergebnis direkt am Feld anzeigen.
- Prüfung ohne Reservierung oder Einlösung. Allgemeine Fehlermeldungen und begrenzte Prüfversuche verhindern die Offenlegung fremder Gutscheine.
- Ausschlüsse für Versicherungen, Zubehör, Haftungsfreistellung, Stundenlohn und weitere Zusatzkosten erhalten.
- Vorläufige Rabattbeträge nur für tatsächlich berechtigte Mietpositionen anzeigen.
- Vor Angebotsversand erneut serverseitig prüfen; die bestehende atomare Einmal-Einlösung bei Angebotsannahme bleibt maßgeblich.

## 5. Lead-Anfrage und Mitarbeiterbearbeitung
- Kontakt- und Lieferdaten mit allen Positionen und deren Zeiträumen an die bestehende Mietanfrage-Bearbeitung übergeben.
- Artikel, Optionen und Preise serverseitig erneut prüfen; Browserbeträge niemals ungeprüft übernehmen.
- Wiederholtes Absenden gegen doppelte Anfragen absichern.
- Mitarbeiter können die Anfrage prüfen und daraus ein Angebot erstellen; keine automatische Auftragsbestätigung oder Gerätebelegung.
- Bestehende Angebote, Rechnungen und CMS-Fakten unverändert lassen.

## 6. Spätere Verfügbarkeit und Direktbuchung
- Verfügbarkeit erst aktivieren, wenn Gerätebestand und Kapazitäten konsistent hinterlegt sind.
- Echte Haltefristen serverseitig anlegen: Gerät oder Artikelkapazität, Zeitraum, Menge und Ablaufzeit atomar prüfen und reservieren.
- Gleichzeitige Überbuchungen verhindern; abgelaufene Haltefristen serverseitig freigeben, unabhängig davon, ob der Browser geöffnet bleibt.
- Bestehende bestätigte Aufträge und Belegungen einbeziehen. Parallele Lead-Anfragen sind aktuell keine verbindlichen Reservierungen.
- Danach ausgewählte Artikel für sichere Direktbuchungen freigeben; den Angebotsprozess langfristig auf Geschäftskunden und große Projekte konzentrieren.

## Abnahme und Reporting
- Mobil, Tablet und Desktop: Kalender, Uhrzeitfelder, Optionen, Warenkorbsymbol, Scrollbarkeit, Kontaktformular und Fehlermeldungen sichtbar prüfen.
- Mehrere Artikel mit unterschiedlichen Zeiträumen, Seitenwechsel, erneutes Laden, Bearbeitung, Entfernung und tatsächlichen Timerablauf testen.
- CMS-Preisgleichheit, Versicherungssätze, Steueranzeige und Gutschein-Ausschlüsse mit konkreten Regeltests absichern.
- Gutscheine: gültig, ungültig, fremde E-Mail, bereits eingelöst und fehlende Berechtigung prüfen; Tippen darf keinerlei Einlösung auslösen.
- Mit separat freigegebener Luca-Testanfrage den vollständigen Weg bis zur Mitarbeiteransicht prüfen, einschließlich Positionszeiträumen und Schutz vor doppeltem Absenden. Testmails ausschließlich an luca@sandhoff.org.
- Je Etappe berichten: umgesetzt, konkrete Testergebnisse, verbleibende Einschränkungen und Veröffentlichungsstatus. Kein uneingeschränktes grünes Licht ohne vollständige Abnahme.

## Aktueller Zwischenstand
Ein erster Stand wurde bereits umgesetzt und einige serverseitige Änderungen wurden bereitgestellt, bevor diese Planergänzung ausdrücklich freigegeben war. Die Website wurde nicht veröffentlicht; keine echte Anfrage wurde im beschriebenen Browsertest abgeschickt.

Browser-Stichproben bestätigten Kalender, eine CMS-Preisantwort, Warenkorb-Rückkehr auf der Startseite und die Sperre eines ungültigen Codes. Das ist noch keine vollständige Abnahme. Die gezeigte Mobilaufnahme enthält einen überlagernden Cookie-Hinweis; der gezeigte Countdown von 15:01 und die Versicherungsstufen benötigen eine erneute Sichtprüfung des überarbeiteten Standes. Sicherheit der öffentlichen Vorprüfung, Preisgleichheit, vollständiger Lead-Ablauf und Timerablauf bleiben gesondert zu prüfen.

Weitere Umsetzung und Veröffentlichungsfreigabe erfolgen erst nach Zustimmung zum Plan.

## Technische Umsetzung
- Gemeinsamer öffentlicher Warenkorb mit validiertem Speicherformat und absoluter Ablaufzeit; globale Dialogsteuerung über die gemeinsame Website-Anordnung.
- Öffentliche Preis- und Gutscheinendpunkte mit Eingabevalidierung, begrenzten Prüfversuchen und minimalen Antworten; keine Offenlegung privater Kunden- oder Gutscheindaten.
- Bestehende zentrale Mietpreis-, Zusatzkosten- und Gutscheinregeln wiederverwenden statt paralleler Preislogik.
- Positionszeiträume abwärtskompatibel an Mitarbeiteransicht und Angebotsvorbelegung übergeben.
- Eindeutige Anfragekennung serverseitig absichern; konkurrierende Wiederholungen müssen dasselbe Ergebnis zurückliefern.
- Spätere Gerätehaltefristen an die vorhandene transaktionale Belegungsprüfung anbinden; Browser-Zeitgeber niemals als Bestandskontrolle verwenden.