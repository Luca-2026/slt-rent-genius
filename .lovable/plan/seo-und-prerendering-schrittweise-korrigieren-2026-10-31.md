# SEO und Prerendering schrittweise korrigieren

## Ziel und feste Grenzen

Alle acht Punkte des Prüfberichts bearbeiten und anschließend jeden Punkt einzeln mit Prüfbelegen berichten. Öffentliche Seiten sollen vor und nach dem Laden mit JavaScript denselben korrekten Inhalt und eindeutige Suchmaschinenangaben liefern.

- **Technische CMS-Daten bleiben unverändert:** keine Änderungen an Specs, Modellangaben, Artikelkennungen, Preisen, Preisstaffeln, Beständen oder Buchungsregeln. Bestehende Daten dürfen für die Auslieferung unverändert gelesen werden; vorhandene Brutto-/Netto-Darstellung bleibt erhalten.
- Keine Änderungen an Kunden, Aufträgen, Rechnungen, Zahlungsabläufen oder E-Mail-Versand. Keine TanStack-Migration.
- Öffentliche URLs und Canonicals bleiben auf **https://www.slt-rental.de**; B2B-Portal bleibt getrennt.
- Keine erfundenen Fakten, Bewertungen, Produktbilder oder Preise. Bestehende bewusst nicht indexierbare Zubehörseiten bleiben ausgeschlossen.
- Veröffentlichung erst nach ausdrücklicher Freigabe; ein vorbereiteter Fix ist noch kein nachgewiesener Live-Fix.

## Was bei Google zugesichert werden kann

Ziel sind **korrekte, vollständige und zum jeweiligen Inhalt passende Strukturdaten**, soweit echte Daten vorliegen. Eine Rich-Results-Anzeige für jedes Produkt oder jede Seite ist nicht garantierbar: Google entscheidet darüber selbst, und nicht jeder Seitentyp hat eine passende Darstellung.

- Produktdetails: Product und BreadcrumbList; echte Miet-/Verkaufsangebote nur mit belegtem, sichtbarem Preis, zutreffender Einheit und Bedingungen. Fehlende Preise bleiben fehlend; Mietangebote werden nicht als einmaliger Kaufpreis dargestellt.
- Standortseiten: zutreffende LocalBusiness-Daten; Ratgeber: Article, soweit tatsächlich ein Artikel vorliegt; Kategorien: passende CollectionPage/ItemList und BreadcrumbList statt eines künstlichen Einzelprodukts.
- **Standortbewertungen werden nicht als Bewertungen jedes einzelnen Produkts ausgegeben.** Produktbewertungen nur bei nachgewiesenem Bezug zum konkreten Produkt. Vorhandene echte Standortinformationen bleiben davon unberührt; Googles Grenzen für selbstbezogene Bewertungssterne werden dokumentiert.
- Bestehende zutreffende FAQs bleiben erhalten. FAQ-Rich-Results sind bei Google auf bestimmte Behörden-/Gesundheitsseiten begrenzt und deshalb kein zugesichertes Ergebnis für SLT Rental.
- Pflichtfelder, Empfehlungen und nicht anwendbare Anforderungen im Bericht getrennt ausweisen. Kein „alles grün“ durch erfundene Daten.

## Reihenfolge und Abnahme je Punkt

### 1. Metadaten eindeutig machen

Vorlagen- und Seitenangaben so zusammenführen, dass genau ein Titel, eine Beschreibung, eine Canonical und ein widerspruchsfreier Satz OG-/Twitter-/robots-Angaben ausgeliefert werden. Die spätere Aktualisierung darf keine alten Angaben zurücklassen. Zunächst technische Bereinigung ohne pauschale Textumschreibung.

**Nachweis:** Vorab-HTML sowie Browserzustand nach Seitenwechsel, einschließlich indexierbarer Seite, Zubehörseite und Fehlerseite.

### 2. Umlautpfade und Kategorieabweichungen beheben

Die drei Laubbläser-Seiten und die zwölf abweichenden CMS-Kategoriepfade untersuchen. Pfad-Encoding und Zuordnung korrigieren, ohne CMS-Slugs oder technische Daten zu ändern. Bei tatsächlich veralteten Kategorien belegte Weiterleitungsziele verwenden.

**Nachweis:** betroffene Adressen mit Besucher-/Googlebot-Kennung und JavaScript testen; keine Startseiten-Canonical oder Startseiten-H1 auf Produktpfaden.

### 3. CMS-Abdeckung vervollständigen

Veröffentlichte Artikelpfade und Kategorien aus der verbindlichen öffentlichen CMS-Quelle ableiten, statt nur bestehende statische Pfade zu überschreiben. Zubehör/noindex bewusst erhalten. Kategorieeinträge und Anzahlen mit veröffentlichten Artikeln abgleichen. CMS-Ausfälle dürfen nicht unbemerkt veraltete Inhalte als aktuellen Stand ausgeben.

**Nachweis:** jeder veröffentlichte Standort-/Artikelpfad wird als passende Seite oder nachvollziehbare Weiterleitung erzeugt; technische Daten vor/nach der Korrektur identisch. Nullwerte nicht durch erfundene Angaben auffüllen.

### 4. Fehlende Themenseiten und gezielte SEO-Texte

Hochzeitstechnik und Glasfaserausbau in die Vorab-Auslieferung, Sitemap und passende interne Verlinkung aufnehmen. Vorhandene belegte Inhalte verwenden.

**Semrush-Recherche vor jeder Textoptimierung:** deutscher Markt, Hauptbegriff, Varianten, Suchabsicht und passende Standortbegriffe je betroffenem Produkt/Thema. Ergebnisse in einem Rechercheblatt dokumentieren. Bereits vorliegende Stichproben ersetzen keine produktbezogene Recherche. Bei fehlenden Daten keine Nullnachfrage oder geringe Konkurrenz behaupten. Keine automatische Umschreibung aller 387 Artikel.

**Nachweis:** jede geänderte SEO-Textfassung hat zugehörige Recherche und Faktenquelle; Titel/H1/Meta, Canonical und Inhalt stimmen auf beiden Themenseiten überein.

### 5. Fehlerseiten und Indexierungsregeln

Echte nicht vorhandene Seiten von Ladezuständen unterscheiden. Fehlerseiten konsistent mit noindex ausgeben; keine widersprüchlichen Indexierungsanweisungen. Für echte HTTP-404-Auslieferung zuerst die Möglichkeiten des tatsächlich verwendeten Hostings prüfen.

**Nachweis:** ungültiger allgemeiner Pfad, ungültiger Artikelpfad und gültiger langsam ladender Artikel. Ein im Browser sichtbares „404“ bei HTTP 200 wird nicht als vollständig behoben gemeldet.

### 6. Fehlende Bildreferenzen korrigieren

Die vier nachgewiesenen Bild-404s anhand vorhandener realer Projektbilder ersetzen beziehungsweise deren öffentliche Pfade korrigieren. Produktbilder unter stabilen öffentlichen Produktbildpfaden verwenden; keine neuen oder erfundenen Produktabbildungen. OG-Bilder müssen erreichbar und in passender Größe vorliegen; Original-CMS-Bildwerte nicht umschreiben.

**Nachweis:** alle referenzierten Dateien erreichbar, zutreffender Inhaltstyp und richtiges Motiv; Prüfung der 14 betroffenen Seiten.

### 7. HTTPS, www und Weiterleitungen

Hauptdomain, abschließenden Schrägstrich und belegte Altpfade konsistent behandeln, ohne Portal-, Zahlungs- oder Signaturlinks zu verändern. Bestehende Apache-Regeln nur dann als Lösung werten, wenn das aktuelle Hosting sie tatsächlich ausführt.

**Nachweis:** HTTP-Antworten mit Status, Weiterleitungskette und Ziel. Nicht aus dem Projekt steuerbare Hosting-Einstellungen als konkreten offenen Punkt benennen; keine JavaScript-Weiterleitung als HTTP 301 ausgeben.

### 8. Strukturdaten und abschließende Vollprüfung

Vorab- und Browser-Strukturdaten auf dieselbe belegte Quelle ausrichten. Fehlerhafte Preiszuordnung, Einheiten, Produktbewertungs-Zuordnung und Bildpfade ausschließlich in der SEO-Ausgabe korrigieren, nicht im CMS. Jede Seite nach ihrem tatsächlichen Seitentyp prüfen.

**Nachweis:** automatisierte Pflichtfeld-/Konsistenzprüfung aller erzeugten Seiten plus Google Rich Results Test für jeden tatsächlich verwendeten Schemafall, soweit zugänglich. Google-Teststatus, eigene Prüfung und tatsächliche Google-Anzeige getrennt berichten. Abschließend alle bekannten öffentlichen Seiten erneut mit Besucher-/Googlebot-Kennung und betroffene Seiten im Browser prüfen.

## Berichte und Freigaben

Für **jeden Punkt**: Ausgangsfehler, umgesetzte Änderung, betroffene URLs/Anzahl, konkrete Testresultate, CMS-Unverändert-Nachweis und verbleibende Einschränkungen. Neue versionierte Zusammenfassung und filterbare Einzeltabelle; bisheriger Prüfbericht bleibt erhalten.

Status je Punkt: **vorbereitet**, **geprüft**, **live nachgewiesen** oder **offen mit benanntem Grund**. Nach Freigabe zur Veröffentlichung vollständige Live-Nachprüfung; vorher keine Aussage, dass die veröffentlichten Seiten bereits korrigiert sind.

## Technische Umsetzung

- Bestehende React/Vite-/Prerender-Struktur beibehalten; primäre Stellen: `scripts/exportRoutes.ts`, `scripts/prerender-rental.mjs`, `src/data/seo-routes-rental.ts`, `src/data/schemas-rental.ts`, `src/components/SEO.tsx` und bestehende Hosting-Regeln.
- Kleine gemeinsame Helfer für Metadaten, Pfade, unveränderte CMS-Zuordnung und Strukturdaten; fokussierte Regressionstests im vorhandenen Testsystem.
- Technische CMS-Felder vor/nach dem Ablauf read-only vergleichen. Keine Datenbankmigration, CMS-Massenänderung oder Änderung der Preisberechnung.
- Seiten-Erstellung/Prüfung nicht nur am Prerender-Marker festmachen: tatsächliche H1, Canonical, Datenquelle und Status abgleichen.
- Bestehende automatische Projektprüfungen nutzen; keine manuellen Produktions-Builds außerhalb des vorgesehenen Ablaufs. Falls die vollständige erzeugte Ausgabe vor Veröffentlichung nicht zugänglich ist, diese Grenze explizit berichten.

## Grundlagen für Rich Results

- [Google Product Snippets: Anforderungen](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)
- [Google: Strukturdaten garantieren keine Anzeige](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google: Bewertungen müssen sich auf den bewerteten Gegenstand beziehen](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- [Google: FAQ-Darstellung eingeschränkt](https://developers.google.com/search/blog/2023/08/howto-faq-changes)