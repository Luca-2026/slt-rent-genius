# Bonner Anhänger-Konflikt beheben und Teilrelease

## Diagnose (rein lesend geprüft)
- Artikel: „3500 kg Baumaschinenanhänger", Slug `baumaschinen-3500`, ID `22e0dac9-…`, veröffentlicht. CMS-Bestand `quantities`: Bonn 1, Krefeld 2, Mülheim 0. Keine Einzelgeräte angelegt, keine Reservierungen am 04.12.
- Aktueller Auftrag #NWHAP2 (angenommen, 04.12. 08:30–16:30) ist korrekt ausgenommen, blockiert sich also nicht selbst.
- Ursache: Das Angebot #CYPWN5 (nur versendet, keine AB) blockiert. Es hat Positionsdaten 30.11. bis 30.11., die Anfrage selbst läuft aber vom 02.11. bis 04.12. `check_inventory_availability` liest nur `rental_inquiries.start_date/end_date` und ignoriert `item.rental_start/rental_end`. Außerdem zählt es Status `in_progress`/`offer_sent` mit. Beide Anhänger-Positionen von #CYPWN5 ergeben zusammen „belegt 2“, also frei = max(1 − 2, 0) = 0.
- Nach der vorhandenen Regel ist der Bonner Anhänger am 04.12. frei: Belegung zählt nur bei versendeter AB, und die Positionszeit endet am 30.11. Ralf hat recht.
- Warum kein Ordern-Button: In `AvailabilityDecisionDialog.tsx` listet `orderableLocations` nur `other_locations`. `check_availability` füllt dieses Feld nur bei `src = 'instances'`. Bei CMS-Bestand bleibt es leer, deshalb erscheint der Hinweistext.

## Fix (kleinster sicherer Weg, noch nicht umgesetzt)
1. `check_inventory_availability`, Zweig `inquiry_lines`: Zeitraum über `slt_item_period(i, item)` bestimmen, also mit Positionsdaten und Anfrage als Rückfall, und mit Zeitstempeln statt reinem Datum vergleichen. Nur `accepted` mit `order_confirmed_at` als Belegung zählen. Offene Angebote nur als Hinweis in `conflicts` zurückgeben, nicht in `booked`.
2. In `check_availability` (Zweig quantities) `other_locations` für Krefeld/Bonn mit derselben Funktion berechnen. Mülheim läuft über `slt_stock_location`, also nicht doppelt.
3. Dialog: Ordern auch bei `source = 'quantities'` anbieten, wenn am anderen Standort frei ≥ benötigt. Die Entscheidung speichert wie bisher `order_from` mit Überführung, ohne künstliche Einzelgeräte. `confirm_order` prüft serverseitig erneut, also kein Überbuchen.
4. Abgrenzung: „Von X ordern“ ist eine Überführung aus dem Bestand eines anderen Standorts. Zeitraum- oder Standortwechsel des Auftrags läuft weiter über `change_rental_inquiry_location` bzw. das AB-Bearbeiten. Ein Umbuchen einzelner Geräte bleibt nur bei Einzelgeräten möglich.

Testfälle (PGlite): Positionszeitraum statt Anfragezeitraum; offenes Angebot blockiert nicht, bestätigte AB schon; eigener Auftrag ausgenommen; Mülheim/Krefeld gemeinsam; Grenze 1 von 1; anderer Standort mit Bestand zeigt Ordern, ohne Bestand nicht; `confirm_order` lehnt Überbuchung ab.

## Release (Teilveröffentlichung)
- Lovable veröffentlicht immer den ganzen aktuellen Frontend-Stand. Einzelne Commits oder Branches lassen sich nicht auswählen. Die UI aus 1B.2, 1B.3 und 1C ist also im Build enthalten.
- Datenbank: 0213 und 0214 liegen nur in `docs/prepared` bzw. `drizzle/prepared` und werden durch die Veröffentlichung nicht angewendet. Die URL-Historie ist per `CMS_URL_HISTORY_ENABLED=false` aus.
- Storno-Erstattung in der UI erscheint nur, wenn der Server `manual_cancel_refund_available` liefert. Ohne Migration bleibt sie also fail-closed.
- Edge-Funktionen werden bei Lovable unabhängig vom Veröffentlichen ausgerollt. Ob der Code aus 1B.2/1B.3 bereits live läuft, kann ich von hier nicht bestätigen. Das muss vor der Veröffentlichung geprüft werden.
- Ergebnis: Bedingtes GO. Es gibt keine echte Isolation, aber alle Finanz- und History-Teile sind serverseitig gesperrt. Vorher erforderlich: CI-Vollbuild mit Export/Prerender/Sitemap, kritische Smokes (Startseite, drei Standorte, Artikelseite, Warenkorb-Abschluss ohne Absenden, Rechner/PDF, Mitarbeiter-Login, Auftragsdetail mit Erstattungskarte bei normalem und storniertem Auftrag) und die Prüfung des Edge-Stands. Falls einer davon fehlschlägt: NO-GO. Sicherer Ausweg ist dann, die betroffenen Commits per Revert zurückzunehmen, statt einen Branch auszuwählen.
