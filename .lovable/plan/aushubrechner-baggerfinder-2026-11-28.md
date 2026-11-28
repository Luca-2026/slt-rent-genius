# Aushubrechner & Baggerfinder

## Ziel
Ein dritter Rechner neben Bautrockner- und Baustromrechner: Aushubmenge, Erdgewicht, Dumperfahrten und passende Erdbewegungsmaschinen je Standort, mit Übergabe in den bestehenden Warenkorb.

## Was gebaut wird
1. **Eigene Seite `/tools/aushubrechner`** mit Standortwahl (Krefeld, Bonn, Mülheim an der Ruhr), Ratgeber- und FAQ-Bereich, eigenem Google-Titel und eigener Beschreibung, Eintrag in Sitemap und Tool-Übersicht („Aushubrechner & Baggerfinder").
2. **Einbindung auf den drei Erdbewegungs-Kategorieseiten** als aufklappbarer Block vor der Artikelliste; Standort kommt aus der Seite.
3. **Einbindung auf allen Erdbewegungs-Artikelseiten** unter dem Buchungsbereich, mit passender Überschrift (Bagger / Dumper / Radlader / sonstige). Der angesehene Artikel wird geprüft, nicht automatisch empfohlen.
4. **Eingaben:** Projektart, mehrere Teilflächen (Rechteck, Fläche, Graben, Kreis, bekanntes Volumen), Bodenart, optional Zufahrtsbreite, Grabtiefe, Verbleib/Abfuhr; Expertenmodus für Dichte und Auflockerung.
5. **Ergebnis:** gewachsenes und aufgelockertes Volumen, Erdgewicht, Mehrvolumen, Dumperfahrten (Minimum aus Muldenvolumen und Nutzlast), grober Arbeitsaufwand als Spanne, Sicherheitshinweise; bei tiefen Gruben oder Fundamentnähe Verweis auf persönliche Beratung.
6. **Empfehlungen:** bis zu drei Maschinen (Empfehlung, kompakt, leistungsstark) nur aus euren Artikeldaten am gewählten Standort, Links immer auf den echten Artikel dieses Standorts, Preise aus dem CMS mit Privat/Geschäftskunden-Anzeige, „auf Anfrage" korrekt gekennzeichnet. Paket per Klick in den Warenkorb (kein zweiter Bestellweg).
7. **Teilen und Drucken:** Berechnung per Link teilen (nur Projektzahlen), Druckansicht, Zurücksetzen.

## Wichtige Grenzen (nichts wird erfunden)
- Viele Erdbewegungsartikel haben unvollständige technische Daten (z. B. Radlader Kramer 5045/5050, Hochauskipp-Dumper ohne Mulde/Nutzlast). Diese Artikel werden nur als „Eignung bitte prüfen lassen" gezeigt, ohne Fahrtenzahl oder Eignungsaussage. Eine Liste der fehlenden Daten bekommt ihr zur CMS-Pflege.
- Boden-Richtwerte (Dichte, Auflockerung) werden aus anerkannten Fachquellen recherchiert, mit Quelle dokumentiert und als Planungswerte gekennzeichnet.
- Keine Analytics-Ereignisse, solange keine eingewilligte Analytics-Lösung für die Website vorhanden ist; das prüfe ich zuerst und nehme sie nur auf, wenn vorhanden.
- Keine Änderungen an Preisen, Artikeln, Adressen, Buchungs- oder Zahlungsabläufen.

## Prüfung
Alle 8 Testfälle aus deiner Vorgabe als automatische Tests (12 m³ / 14,4 m³ / 19,2 t, Graben 6,4 m³, Kreis 18,85 m³, 85 cm Zufahrt, Bonn-Links, Standortwechsel, Artikelkontext, 48 Fahrten + Nutzlast-Grenzfall). Danach Browser-Prüfung auf Handy und Desktop, alle erzeugten Links ohne 404.

## Technische Details
- `src/lib/excavationCalculator.ts` (reine Formeln + Empfehlungsregeln, getestet), Parser für Spezifikations-Freitexte (Breite, Grabtiefe, Mulde, Nutzlast) mit „unbekannt" statt Schätzung.
- `src/components/rental/ExcavationCalculator.tsx`, Wiederverwendung von `CalculatorRecommendations` und `openRentalBundle`.
- Einträge in `toolsSeo.ts`, `seo-routes-rental.ts`, `ToolsPage.tsx`; Einbindung über Kategorie-/Artikel-Template anhand der Kategorie, keine Datenbankänderung.
