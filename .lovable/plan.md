# Angebote bearbeiten + KI-Assistent für Änderungswünsche

Ziel: Ein versendetes Angebot lässt sich mit einem Klick als neue Fassung öffnen, anpassen und erneut senden. Darüber liegt ein KI-Assistent: Du fügst den Änderungswunsch des Kunden ein (E-Mail-Text, Notiz), die KI erstellt daraus einen fertigen Entwurf im Formular, du prüfst, passt ggf. an und gibst frei. Nichts geht ohne deine Freigabe raus.

Umsetzung in 4 Schritten. Nach jedem Schritt teste ich im echten Portal und hole deine Freigabe ein, bevor der nächste beginnt.

## Schritt 1 – Versendetes Angebot bearbeiten (Überarbeitung)
- In der Anfrage mit Status „Angebot gesendet" neuer Button **„Angebot überarbeiten"**.
- Das Formular öffnet sich vollständig vorbefüllt aus dem zuletzt versendeten Angebot: Positionen, Mengen, Zeiträume (auch abweichende), Pauschalpreise, Rabatte, Zusatzoptionen, Liefer-/Aufbaukosten, Kaution, Zahlungsbedingungen, Gültigkeit, Notizen, Lieferadresse.
- Beim Senden entsteht eine neue Fassung mit Bezug auf das Original, z. B. **ANG-A-2026-0036-2** („ersetzt Angebot ANG-A-2026-0036 vom …" auf PDF und in der E-Mail). Nummernkreis bleibt lückenlos.
- Bestandsprüfung/Überbuchungswarnung und automatische Entwurfssicherung gelten auch hier.

## Schritt 2 – Angebotsverlauf
- Jede versendete Fassung wird dauerhaft gespeichert (statt wie heute überschrieben).
- In der Anfrage: Liste aller Fassungen mit Datum, Betrag, Bearbeiter, PDF-Link; ältere Fassungen als „ersetzt" markiert.
- Die Rechnung übernimmt immer die zuletzt gültige Fassung.
- Nimmt der Kunde eine Fassung an, wird genau diese verwendet.

## Schritt 3 – KI-Assistent „Änderung einarbeiten"
- Im Angebotsformular (neu und Überarbeitung) ein Feld **„Änderungswunsch einfügen"**, z. B.: „Kunde möchte den Bagger 2 Tage länger, statt 3 nur 2 Stehtische, Lieferung dazu, 10 % Rabatt auf alles."
- Die KI kennt: aktuelles Angebot, Anfrage (Zeitraum, Standort, Kunde) und den Bonner/Krefelder/Mülheimer Katalog mit echten Artikeln und hinterlegten Preisen.
- Ergebnis ist **kein direkter Versand**, sondern ein Vorschlag, der ins Formular übernommen wird – mit einer klaren Änderungsliste zum Abhaken (alt → neu, farblich markiert), z. B. „Dauer Bagger 3 → 5 Tage", „Stehtisch Menge 3 → 2", „Rabatt 0 → 10 %".
- Du kannst einzelne Änderungen ablehnen, dann Feinheiten anpassen, dann wie gewohnt senden.
- Zuverlässigkeit:
  - Die KI darf nur feste Aktionen vorschlagen (Position ändern/hinzufügen/entfernen, Zeitraum, Rabatt, Kosten, Notiz) – keine freien Texte in Preisfelder.
  - Neue Artikel nur aus dem echten Katalog; Preise nur aus dem System. Findet sie keinen Preis oder ist etwas unklar, schreibt sie das als offene Frage dazu statt zu raten.
  - Summen rechnet immer das bestehende System, nie die KI.
  - Bei Fehler/Guthabenmangel klare Meldung, Formular bleibt unverändert.

## Schritt 4 – Gesamttest und Feinschliff
- Echte Durchläufe: Angebot senden → Kunde will Änderung → KI-Entwurf → prüfen → Fassung 2 senden → Annahme → Rechnung aus Fassung 2.
- Mehrere typische Änderungswünsche testen (Zeitraum, Menge, Zusatzartikel, Rabatt, Lieferung, unklare Wünsche).
- PDF, E-Mail, Verlauf, Tests und Typprüfung prüfen; Testdaten wieder entfernen.

## Technische Details
- Neue Tabelle `inquiry_offer_versions` (inquiry_id, inquiry_type, version, offer_number, parent_offer_number, payload jsonb, total_gross, file_url, created_by, created_at) mit GRANTs, RLS (Admin/Staff), unveränderlich nach Insert. Bestehende `offer_payload` werden als Fassung 1 übernommen.
- `send-inquiry-offer`: optionaler Parameter `revise_of`; erzeugt Suffix-Nummer, schreibt Fassung, aktualisiert `offer_payload` auf die neueste.
- `InquiryOfferForm`: Initialisierung aus Payload (gleiche Mapping-Funktion wie für Rechnungen, mit Tests).
- Neue Edge Function `offer-ai-revise`: Lovable AI (openai/gpt-6-astra, Responses API, gestreamt) mit strukturierter Ausgabe (Liste typisierter Änderungsaktionen, Zod-validiert), Katalogabgleich serverseitig; Rolle via JWT geprüft. Kosten fallen pro Anfrage aus dem Workspace-Guthaben an.
- Vitest für Payload→Formular-Mapping, Anwenden der Aktionen, Nummernsuffix.
