# fonio-Anbindung: Anrufauswertung mit Prioritäten und Live-Daten für Lena

## Ergebnis der Recherche (nur belegte Fakten)
- **Die fonio-Schnittstelle mit API-Schlüssel kann keine Gespräche oder Transkripte abrufen.** Sie startet nur ausgehende Anrufe und verwaltet Konten. Quellen: offizielle Schnittstellenbeschreibung app.fonio.ai/api/docs; ein Integrationsanbieter bestätigt: „fonio.ai's API has no call-history endpoint“. Der Schlüssel wird für diesen Plan nicht gebraucht.
- **Nach dem Gespräch:** fonio kann pro Anruf eine Nachricht an eine Adresse von uns schicken (Einstellung „Nachverarbeitung → API Request“). Den Inhalt legst du bei fonio fest, zum Beispiel Transkript, Zusammenfassung, Anrufernummer und Aufnahme-Link. Absichern lässt sich das mit einem eigenen geheimen Schlüssel. Eine eingebaute Signatur von fonio gibt es laut Doku nicht.
- **Während des Gesprächs:** Lena kann eine Adresse von uns live abfragen (Werkzeug „API Request“). Dafür gilt eine Zeitgrenze von 5 Sekunden, die Antwort kommt im JSON-Format. Laut fonio ist das für Abfragen wie Bestände gedacht.
- **E-Mail mit Transkript** ist möglich, aber schlechter: Wir müssten Postfächer auslesen, die Übermittlung kommt später an und das Format ist unsauber.

**Empfehlung:** die direkte Übermittlung nach dem Gespräch statt E-Mail. Für Live-Preise und Bestände das Werkzeug „API Request“.

**Noch nicht belegt:** die genauen Feldnamen in der Nachricht nach dem Gespräch. Deshalb nehmen wir die Nachricht flexibel an und prüfen sie mit einem echten Testanruf, bevor wir sie fest auswerten.

## Teil A – Neuer Bereich „Anrufe“ im Portal
1. **Empfang:** Eine neue Adresse nimmt jede Nachricht von fonio an. Sie prüft den geheimen Schlüssel und speichert das Original unverändert. Kommt dieselbe Nachricht zweimal, wird sie nicht doppelt angelegt.
2. **KI-Vorauswertung pro Anruf:**
   - kurze Zusammenfassung
   - Anliegen: Mietanfrage, Angebot/Änderung, Reklamation/Schaden, Rückruf, Info, Sonstiges
   - Priorität „Sofort“, „Heute“, „Diese Woche“ oder „Info“, mit Begründung in einem Satz
   - Standort, genannte Artikel, Rückrufnummer und offene Punkte
   - Die KI erfindet nichts. Fehlendes bleibt leer.
3. **Abgleich mit der Kundenkartei:** Bekannte Anrufer werden über Telefonnummer oder E-Mail erkannt.
4. **Liste „Anrufe“:**
   - sortiert nach Priorität, dann nach Zeit
   - Filter nach Priorität, Anliegen, Standort und Status (offen, in Bearbeitung, erledigt)
   - Übernehmen durch einen Mitarbeiter, Priorität von Hand änderbar
5. **Detailansicht:** Zusammenfassung, Transkript, Link zur Aufnahme, Kunde und eine Notiz.
   - Der Knopf „Als Mietanfrage übernehmen“ nutzt den bestehenden KI-Import. Eine Anfrage entsteht nur, wenn du es willst.
6. **Startseite:** Anrufe mit „Sofort“ und „Heute“ erscheinen unter Handlungsbedarf. Im Menü steht ein Zähler.

## Teil B – Live-Daten für Lena während des Gesprächs
Eine abgesicherte Adresse, die Lena per „API Request“ fragt. Sie kann zwei Dinge:
- **Artikelsuche mit Preisen:** Lena nennt Artikel und Standort, die Antwort enthält die passenden CMS-Artikel mit Tages-, Wochenend-, Wochen- und Monatspreis. Es gelten nur gepflegte Preise. Fehlt ein Preis, heißt die Antwort „Preis auf Anfrage“.
- **Verfügbarkeit:** Lena nennt Artikel, Standort und Zeitraum. Die Antwort berechnet sich aus dem Bestand abzüglich der bestätigten Aufträge, mit derselben Logik wie im Portal. Es gibt nur „verfügbar“, „knapp“ oder „ausgebucht“, keine internen Stückzahlen. Ergänzend sagt Lena: „unverbindlich, Bestätigung folgt“.
- Die Antworten sind kurz und schnell, also deutlich unter 5 Sekunden. Einkaufspreise und Kundendaten gibt die Adresse nie heraus.
- **Rentware:** keine Buchung, keine Reservierung, die Buchungslogik bleibt unverändert.

## Was du bei fonio einträgst (Anleitung bekommst du von mir)
- unter Nachverarbeitung → API Request: unsere Empfangsadresse und den geheimen Schlüssel
- unter Werkzeuge → API Request: unsere Live-Adresse für Lena, dazu ein kurzer Prompt-Baustein, wann Lena fragt

## Tests (vor jeder Erfolgsmeldung)
- Empfang: falscher Schlüssel wird abgewiesen, doppelte Nachricht wird nur einmal gespeichert, leere oder zu große Nachricht ergibt eine saubere Meldung
- KI-Auswertung: 6 echte Beispiel-Transkripte, Priorität und Anliegen Feld für Feld geprüft
- Live-Adresse: Preise gegen CMS-Werte, Verfügbarkeit gegen bekannte Aufträge, Antwortzeit gemessen
- Ende-zu-Ende: echter Testanruf bei fonio, der Anruf erscheint mit Priorität in der Liste
- automatische Tests für Priorisierung, Preis- und Verfügbarkeitsantwort

## Reihenfolge
A1–A2 bauen, dann ein echter Testanruf, um die Feldnamen zu prüfen. Danach A3–A6, zuletzt Teil B.

## Technische Details
- Tabelle `phone_calls`: Rohdaten jsonb, external_id unique, Transkript, Zusammenfassung, intent, priority, priority_reason, location, customer_id, status, assigned_to, notes. RLS nur für Mitarbeiter, Schreiben nur über die Edge Function. GRANTs wie vorgeschrieben.
- Edge Function `fonio-call-webhook`: prüft einen geheimen Header (`FONIO_WEBHOOK_SECRET` per generate_secret, den der Nutzer bei fonio einträgt; als gemeinsames Geheimnis per add_secret oder angezeigt). Speichert sofort, die Auswertung läuft danach über `openai/gpt-6-astra` auf der Responses API, gestreamt und mit strikter JSON-Ausgabe. 402/403/429 nach Gateway-Regeln; bei Fehlern bleibt der Anruf als „nicht ausgewertet“ mit einem Knopf „Erneut auswerten“.
- Edge Function `fonio-live-lookup`: eigener geheimer Header (`FONIO_TOOL_SECRET`), GET/POST mit `action=search|availability`. Nutzt die bestehende Katalog-Zuordnung aus `parse-inquiry-text/match.ts`, gibt sie als gemeinsames Modul `_shared/` frei. Die Verfügbarkeitslogik wird gemeinsam mit `inventoryAvailability.ts` genutzt, ohne KI-Aufruf, damit die 5 s sicher eingehalten werden.
- Prioritätsregeln als getestetes Modul `src/lib/callPriority.ts`: Die KI schlägt vor, feste Regeln greifen zusätzlich, etwa Schaden/Reklamation mindestens „Heute“ und Mietbeginn innerhalb von 48 h dann „Sofort“.
- UI: Seite `/b2b/anrufe`, StaffNav-Eintrag, StaffHome-Block, Übergabe an `AiInquiryImportDialog` mit vorbefülltem Transkript.
