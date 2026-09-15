# Etappe 5 – Einheitliche Artikelseiten-Vorlage

## Ziel
Alle Mietartikel erhalten dieselbe klare Reihenfolge und vollständig vorgerenderte Inhalte: Kurzbeschreibung, Preis, Verfügbarkeit, technische Daten, Einsatzbereiche, Standort, Alternativen, Zubehör, FAQ und passende Ratgeberlinks.

## Umsetzung

1. **Zentrale Artikelseiten-Daten ableiten**
   - Kurzen Artikelnamen, optionalen Marketingnamen und Modell getrennt behandeln, ohne vorhandene Stammdaten umzubenennen.
   - Seitentitel auf höchstens 60 Zeichen begrenzen; Standort und „| SLT Rental“ bleiben erhalten.
   - Meta-Beschreibungen aus gepflegten Daten übernehmen. Nur wenn sie fehlen, einen vollständigen Satz mit 120–155 Zeichen aus der Beschreibung bilden; nie mit „…“ abschneiden.

2. **Einheitliche sichtbare Reihenfolge**
   - Artikelseite in folgende Reihenfolge bringen: Kurzbeschreibung → Preis und Verfügbarkeit → technische Daten → Einsatzbeispiele → genau ein Standortabsatz → Alternativen → Zubehör/Dazubuchbares → FAQ → passender Ratgeber.
   - Doppelte Kurz- und Langbeschreibung unterdrücken, wenn beide inhaltlich gleich sind.
   - Bestehende Sonderhinweise, Videos, Downloads und Buchungsabläufe erhalten, aber außerhalb dieser Pflichtblöcke sinnvoll einordnen.

3. **Preis und Verfügbarkeit**
   - Vorhandene CMS-Preise als Brutto inkl. 19 % USt. anzeigen; keine Preise hochrechnen oder erfinden.
   - Wenn kein Preis vorliegt, sichtbar „Preis auf Anfrage“ ausgeben.
   - Den Status aus Etappe 4 verwenden und nur einen Verfügbarkeitshinweis samt passendem Buchungstext anzeigen.

4. **Technik, Alternativen und Zubehör**
   - Technische Daten ausschließlich aus den Stammdaten als Tabelle ausgeben; bei fehlenden Daten keinen Ersatz erfinden.
   - Höchstens vier Alternativen derselben Kategorie verlinken, bevorzugt direkte Nachbargrößen; manuell gepflegte Beziehungen behalten Vorrang.
   - Optionales Zubehör und dazubuchbare Artikel als echte interne Links ausgeben.
   - Führerschein-Hinweise nur aus vorhandenen Gewichts-/Fahrzeugdaten ableiten; unklare Fälle als TODO erfassen.

5. **FAQ, Ratgeber und strukturierte Daten**
   - Eine einzige sichtbare FAQ-Sektion aus Artikel-, CMS- oder Kategorie-Daten ausgeben, mindestens drei Fragen nur dort, wo belegte Antworten vorhanden sind.
   - Vorhandene passende Ratgeber- und Hilfeartikel verlinken.
   - Product, Offer, BreadcrumbList und FAQPage mit denselben sichtbaren Daten erzeugen; Offer nur mit realem Preis, `LeaseOut`, EUR, Verfügbarkeit und Standortgebiet.

6. **Prerendering und Prüfung**
   - Dieselben Pflichtblöcke und Links in das vorgerenderte HTML übernehmen, nicht nur in die interaktive Ansicht.
   - Tests und vollständigen Prerender-Build ausführen.
   - Stichproben für Krefeld, Bonn und Mülheim prüfen: Blockreihenfolge, Preis auf Anfrage, keine doppelte Beschreibung/FAQ, Bonn ohne Werkstatt-Aussage, Titel ≤60 Zeichen und vollständige Meta-Beschreibungen.
   - Etappe 5 in der Roadmap abschließen und alle fehlenden Stammdaten als TODO auflisten.

## Technische Details
- Die bestehende Rentware-Buchungslogik bleibt unverändert.
- Die zentrale Darstellung wird aus kleinen wiederverwendbaren Bausteinen aufgebaut; bestehende Design-Tokens und Buttons bleiben erhalten.
- Die bestehende Zubehör- und CMS-Beziehungslogik wird wiederverwendet.
- Keine erfundenen Preise, Maße, Führerscheinklassen, Verfügbarkeiten oder FAQ-Antworten.

## Ergebnis
Eine konsistente Artikelseite für alle Standorte, deren wichtigste Inhalte und internen Links bereits im statischen HTML stehen und deren sichtbare Angaben mit den strukturierten Daten übereinstimmen.
