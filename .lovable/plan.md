# Überarbeitung slt-rental.de – Umsetzung in 9 Etappen

Der Auftrag umfasst rund 60 Einzelpunkte. Ich arbeite ihn in der von dir vorgegebenen Reihenfolge ab und melde nach jeder Etappe: welche Seiten neu erzeugt wurden und welche Angaben mir noch fehlen.

## Etappe 1 – Vollständige Vorab-Erzeugung der Seiten
- Seitenliste komplett aus den Daten erzeugen: 3 Standorte × 23 Kategorien × alle Artikel, alle Ratgeber- und Hilfe-Artikel, alle Ortsseiten, alle festen Seiten. Keine handgepflegte Liste mehr.
- Build-Protokoll mit Anzahl erzeugter Seiten und Liste der Fehlschläge; alte Dateien werden immer neu geschrieben (kein Überspringen), damit Korrekturen überall ankommen.
- Sitemap aus derselben Quelle mit Änderungsdatum; Seiten mit "nicht indexieren" fliegen raus.
- Direkt prüfen: Werkzeuge Krefeld (40 eindeutige Artikel), Bonn-Übersicht (23 Kategorie-Links), Bobcat-Seite (neue Textvorlage).

## Etappe 2 – Übersichtsseiten mit echten Links
Startseite, /mieten/, Bonn-Übersicht, /standorte/, /hilfe/, /ratgeber/, /ueber-uns/ bekommen ihre Inhalte fest ins ausgelieferte HTML: Standortkarten mit Adresse und Zeiten, Kategorie-Links, Artikel-Listen, USP-Block, Volltext "Über uns".

## Etappe 3 – Kategorien
Anzeigenamen für Nutzfahrzeuge und Wohnwagen & Camping, Ein-/Mehrzahl korrekt ("1 Gerät", "Mietpark für Bühnen"), eigene Einleitungstexte je Kategorie aus den vorhandenen Artikeln, feste Sortierung, falsch einsortierte Artikel umhängen (mit Weiterleitung), doppelte Artikelseiten zusammenführen, Zubehörseiten auf "nicht indexieren", Verkaufsartikel ohne "mieten" im Titel.

## Etappe 4 – Standorttexte und Verfügbarkeit
Je Standort genau ein gepflegter Textbaustein. Bonn ohne Werkstatt-/Übergabe-Aussage, dafür Abholung rund um die Uhr per Code. Je Artikel und Standort genau ein Verfügbarkeitszustand, der Text und Buchungshinweis steuert – keine widersprüchlichen Absätze mehr. Fehler "Krefeld und Krefeld" wird behoben.

## Etappe 5 – Artikelseiten-Vorlage
Kurzname / Langname / Modell trennen, Titel höchstens 60 Zeichen, Beschreibungstexte 120–155 Zeichen ohne abgeschnittene Sätze, einheitliche Preiszeile (brutto, netto in Klammern, sonst "Preis auf Anfrage"), feste Blockreihenfolge, Alternativen als echte Links, automatischer Führerscheinhinweis, strukturierte Daten nur mit vorhandenen Werten.

## Etappe 6 – Einzelne Artikel
Kipper 7,5 t, Pritschenkipper, Wohnwagen, Bobcat E10z, Abgleich von Namen und Adresszeilen, Verkehrszeichen-Klartext (nur wo belegt, sonst TODO), lange Beschallungsnamen, zusätzliche Fragen/Antworten bei Hüpfburgen, Möbel & Zelte, Gastro und Spezialeffekte.

## Etappe 7 – Weiterleitungen
Regelbasierte 301 für alle Altmuster, einheitlicher Schrägstrich am Ende, Ortsseiten der drei Standorte auf den jeweiligen Katalog, übrige Ortsseiten mit echten Inhalten oder "nicht indexieren".

## Etappe 8 – Strukturierte Daten und Technik
Unternehmens- und Standortdaten auf Startseite und /standorte/, Listen-/Artikel-/Fragen-Daten je Seitentyp, eigene Vorschaubilder für Kategorien, Canonical mit Schrägstrich, Bildformate und Platzhalterhöhe fürs Buchungsfenster.

## Etappe 9 – Abnahme
Die zwölf Stichproben per Abruf prüfen, alle genannten Fehlerbilder gegenprüfen, Artikelzahl gegen Linkanzahl auf allen 69 Kategorieseiten, Weiterleitungen einzeln testen, Sitemap prüfen und die vollständige TODO-Liste mit fehlenden Stammdaten liefern.

## Wichtige Hinweise
- Buchung, Preise und Verfügbarkeit bleiben unverändert am bestehenden Buchungssystem.
- Es werden keine Preise, Zeiten, technischen Daten oder Namen erfunden; Lücken kommen als TODO in die Abschlussliste.
- Alle Änderungen an öffentlichen Seiten werden erst nach einer Veröffentlichung live sichtbar.

## Technische Details
- `scripts/exportRoutes.ts`: Routenerzeugung vollständig aus `rentalData` + CMS (`managed_products_public`), Kategorie-Metafelder (`displayName`, `seoName`, `plural`, `sortOrder`, `isAccessory`, `type`), Titel-/Description-Hygiene.
- `scripts/prerender-rental.mjs`: Resume-Skip entfernen, `linkSections` für Hubs/Startseite/Listen, Fehlerbilanz im Log, Sitemap mit `lastmod`.
- `src/data/seo-routes-rental.ts`: Standortbausteine, Verfügbarkeitsstatus, Produkt-Template-Blöcke, JSON-LD (Product/Offer mit `businessFunction` LeaseOut, ItemList, LocalBusiness, Article).
- `src/data/legacyRedirects.ts` + `scripts/build-htaccess.mjs`: regelbasierte Muster, Slash-Regel, Kategorie-Umhängungen, Duplikat-Slugs.
- Verifikation über Build + `curl` gegen `dist/`, `vitest`, `tsgo`.
