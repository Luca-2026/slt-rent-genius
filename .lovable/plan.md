# Übergabe- und Rücknahmeprotokoll: geführter Ablauf

## Ziel
Der Mitarbeiter durchläuft bei Herausgabe und Rückgabe eine geführte Maske (wie in den Screenshots), am Handy bedienbar und am Desktop/iPad genauso gut. Ergebnis ist ein rechtssicheres Protokoll als PDF, das der Kunde per E-Mail bekommt und das im Portal jederzeit herunterladbar ist.

## Was es heute schon gibt
- Übergabe- und Rücknahmeprotokoll mit Nummer, Unterschrift von Kunde und Mitarbeiter, AGB-Bestätigung, Mängeltext, Fotos, Betriebsstunden, Tankfüllstand, Sauberkeit 1–5
- PDF-Erzeugung, E-Mail-Versand, Download und Übersichtslisten im Portal

## Was neu gebaut wird

### 1. Geführter Ablauf statt langem Formular
Beide Protokolle laufen künftig als Schrittliste mit Fortschritt und Häkchen je Schritt:
1. Artikel prüfen (Liste, Menge, Seriennummer)
2. Gerätedaten (nur bei Maschinen: Betriebsstunden, Tankfüllstand, Sauberkeit 1–5)
3. Schäden erfassen (optional)
4. Zahlungen/Zusatzkosten (bei Rücknahme)
5. Personalausweis abgeglichen (Pflicht-Häkchen)
6. Unterschrift Kunde + Mitarbeiter
7. Abschließen

Am Handy jeweils ein Schritt pro Bildschirm mit fixem Button unten; ab Tablet zweispaltig mit Schrittliste links. Abschließen bleibt gesperrt, solange Pflichtschritte fehlen; fehlende Schritte werden benannt.

### 2. Personalausweis-Abgleich
Pflicht-Häkchen „Personalausweis des Mieters abgeglichen" mit optionalem Feld für Ausweisart/letzte Ziffern (keine Ausweiskopie). Erscheint im PDF als bestätigter Vorgang mit Zeitstempel und Mitarbeitername.

### 3. Schäden strukturiert erfassen
Pro Schaden: betroffener Artikel, Kategorie (Kratzer, Delle, Schlag, Lack, Glas, Reifen, Verschmutzung, Technischer Defekt, Fehlendes Zubehör, Sonstiges), Beschreibung, mehrere Fotos, optional Betrag in Euro. Funktioniert bei Übergabe (vorhandene Vorschäden) und bei Rückgabe (neue Schäden). Fotos landen im geschützten Dokumentenspeicher, nur für Personal und den betroffenen Kunden sichtbar.

### 4. Maschinen sicher erkennen
Statt der heutigen Stichwortliste (bagger, dumper …) wird die Kategorie aus dem Artikelstamm genutzt (Erdbewegung, Verdichtung, Stromerzeuger, Nutzfahrzeuge/Anhänger …), Stichwörter bleiben als Rückfall. Nur dann erscheinen Betriebsstunden und Tankfüllstand; Sauberkeit 1–5 wird für alle Artikel abgefragt.

### 5. Zusatzkosten bei Rücknahme → Rechnung
Eigener Block „Zusatzkosten" mit Vorlagen (Reinigung, fehlender Kraftstoff, Betriebsstunden über Inklusivkontingent, verspätete Rückgabe, fehlendes Zubehör) plus freie Position, jeweils mit Menge und Preis. Diese Positionen und bezifferte Schäden werden beim Erstellen der Rechnung aus der zugehörigen Anfrage automatisch als Positionen vorgeschlagen (abwählbar/änderbar), damit sie sauber in der Rechnung ausgewiesen sind.

### 6. PDF und Versand
Die PDFs bekommen zusätzliche Abschnitte: Ausweisabgleich, Schadensliste mit Kategorie und Betrag, Zusatzkosten mit Summe, Gerätedaten Übergabe/Rückgabe im Vergleich, sowie den AGB-Bezug (Zustands-, Rückgabe- und Haftungsregeln aus den B2B-AGB). Im Abschlussbildschirm gibt es „Protokoll an Kunden senden" und „PDF herunterladen"; beides bleibt zusätzlich in den Übersichtslisten verfügbar.

### 7. Start aus angenommenem Angebot
Ist ein Angebot angenommen, erscheint in der Miet-/Verkaufsanfrage der Button „Übergabeprotokoll starten" und nach Mietende „Rücknahmeprotokoll starten", damit der Ablauf nicht nur über Reservierungen erreichbar ist.

## Technische Umsetzung
- Neue Tabellen `b2b_protocol_damages` (Protokollbezug, Typ, Artikel, Kategorie, Beschreibung, Fotopfade, Betrag) und `b2b_return_extra_charges` (Protokoll, Bezeichnung, Menge, Einzelpreis, in Rechnung übernommen) inkl. GRANT + RLS (Personal schreibt, Kunde liest eigene).
- Neue Spalten: `id_checked`, `id_check_type`, `id_checked_at` auf `b2b_delivery_notes` und `b2b_return_protocols`; `extra_charges_total`, `damages_total` auf `b2b_return_protocols`.
- Fotos in privatem Bucket `protocol-photos` mit signierten Links im PDF-Generator.
- Neue gemeinsame Wizard-Komponenten unter `src/components/b2b/protocols/` (Schrittleiste, Schadensschritt, Zusatzkostenschritt, Ausweisschritt, Unterschriftsschritt); `DeliveryNoteDialog.tsx` und `ReturnProtocolDialog.tsx` werden darauf umgestellt, bestehende Felder und Entwurfsspeicherung bleiben erhalten.
- `generate-delivery-note` und `generate-return-protocol` um die neuen Abschnitte erweitern; Rechnungsformular liest offene Zusatzkosten/Schäden der Anfrage.

## Prüfung
Jeder Schritt wird im echten Portal durchgespielt: Elektronikartikel ohne Gerätedaten, Bagger mit Betriebsstunden und Tank, Rückgabe mit zwei Schäden inkl. Fotos und Zusatzkosten, danach Rechnung mit übernommenen Positionen. PDF-Layout wird als Bild geprüft (ein- und mehrseitig), Bedienung am Handy (390 px) und am Desktop.
