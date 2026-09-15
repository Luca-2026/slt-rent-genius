# Etappe 6 – Führerschein-Hinweise und vollständige FAQs

## Ziel
Die Artikelseiten für Anhänger, die beiden Kipper und den Wohnwagen erhalten klare, produktspezifische Führerschein-Hinweise. Die sichtbaren FAQs, das vorgerenderte HTML und die strukturierten FAQ-Daten verwenden anschließend dieselben belegten Inhalte.

## Umsetzung
1. **Zentrale, belegte Fahrberechtigungslogik ergänzen**
   - Anhänger bis 750 kg: Klasse B.
   - Schwerere Anhänger: keine pauschale Einzelklasse behaupten; B, B96 oder BE abhängig von den zulässigen Gesamtmassen des gesamten Gespanns.
   - 3,5-t Pritschenkipper: Klasse B.
   - 7,5-t MAN-Kipper: Klasse C1; vorhandenen Bestandsschutz für alte Klasse 3 vorsichtig ausweisen.
   - Wohnwagen mit 1.500 kg zulässigem Gesamtgewicht: B, B96 oder BE abhängig vom Zugfahrzeug und der zulässigen Gesamtmasse der Kombination.
   - Den Hinweis ergänzen, vor Fahrtantritt Führerschein, Anhängelast und Fahrzeugpapiere zu prüfen.

2. **Einheitlichen Hinweis auf Artikelseiten anzeigen**
   - Einen eigenen Abschnitt „Führerschein und Zugfahrzeug“ nach den technischen Daten einfügen.
   - Nur bei Anhängern, Nutzfahrzeug-Kippern und Wohnwagen anzeigen.
   - Angaben aus vorhandenen Produktdaten ableiten; bei fehlender belastbarer Grundlage keine konkrete Klasse erfinden.

3. **FAQ-Abdeckung vervollständigen**
   - Vorhandene Produkt-, Kategorie- und Standort-FAQs dedupliziert zusammenführen.
   - Für die betroffenen Artikel mindestens drei belegte Fragen bereitstellen.
   - Führerscheinfrage produktspezifisch formulieren; Gewichte, Mietbedingungen, Abholung und Ausstattung nur aus bestehenden Stammdaten übernehmen.
   - Widersprüchliche Standort- oder Lieferaussagen nicht übernehmen.

4. **SEO-Ausgabe angleichen**
   - Führerschein-Hinweis und dieselbe FAQ-Liste in das vorgerenderte HTML aufnehmen.
   - FAQPage-JSON-LD exakt aus den sichtbaren FAQs erzeugen.
   - CMS-FAQs weiterhin priorisieren und nur mit fehlenden, belegten Fragen ergänzen.

5. **Prüfung**
   - Betroffene Seiten für Krefeld, Bonn und Mülheim an der Ruhr neu vorgerendern.
   - Stichproben für 750-kg-Anhänger, schweren Anhänger, beide Kipper und Wohnwagen prüfen.
   - Sichtbare FAQ-Zahl gegen JSON-LD vergleichen und sicherstellen, dass Führerschein-Hinweise keine pauschal falsche Aussage enthalten.
   - Tests und vollständige Seitenerzeugung ausführen; Routenanzahl, Fehler und offene TODOs in `roadmap.md` dokumentieren.

## Technische Details
- Eine gemeinsame Hilfsfunktion liefert Führerscheintext und belegte Ergänzungs-FAQs für React-Seite, Routenkatalog, Prerendering und JSON-LD.
- Bestehende URLs und Rentware-Buchungslogik bleiben unverändert.
- Keine neuen Preise, Maße, Öffnungszeiten oder technischen Daten werden erfunden.
