# Verkaufs-Lieferschein: Layoutprüfung 19.11.2026

## Umsetzung
- Bestehendes SLT-Logo, Markenblau, orange Abschnittsmarkierungen, Warentabelle und gemeinsame Unternehmens-/Standortfußzeile.
- DIN A4, Satzspiegel links 25 mm/rechts 20 mm; Form-B-Anschriftenfeld 85 mm breit, Absendergrundlinie 57 mm, Empfänger ab 67 mm von oben innerhalb der 90-mm-Unterkante.
- Falzmarken 105/210 mm, Lochmarke 148,5 mm. Anschrift getrennt in Straße und PLZ/Ort statt zusammenhängendem Text gespeichert; Legacy-Snapshots weiterhin lesbar.
- Keine stillschweigende Ausgabe ohne Logo; erneuter Versuch bei nicht verfügbarem Markenbild. Überlange Anschriften werden nicht abgeschnitten, sondern mit Hinweis abgelehnt.
- Bereits ausgestellte PDFs und Unterschriften unverändert. Änderungen greifen bei neu erstellten PDFs; Papieruploads bleiben Originalnachweise.

## Prüfungen und gefundene Probleme
- Erste Sichtprüfung: normale Artikelzeilen wurden an Seitenwechseln getrennt. Korrigiert: normale Zeilen bleiben zusammen; nur überlange Artikel dürfen über mehrere Seiten laufen.
- Danach alle sieben Seiten des langen Dokuments sowie kurze und digital signierte Prüfdokumente als Bilder geprüft: keine weiteren Überlagerungen, abgeschnittenen Texte oder fehlenden Logos gefunden. Testsignatur war ein künstliches PNG, keine Kundenunterschrift.
- PDF-Geometrie mit pdfplumber vermessen: Logos vorhanden, Texte innerhalb des Satzspiegels, postalische Anschrift innerhalb des Fensterfelds. Kein Snapshot-/Stylingtest angelegt; zwei Tests prüfen Waren-/Auftragsfakten, unveränderte Quelldaten und vollständige mehrseitige Warenübernahme.
- 2 Deno-Tests und 21 bestehende Vitest-Tests erfolgreich. Build OK.
- Funktion sales-delivery-note eingespielt. Echter Mitarbeiterzugang Luca: am registrierten Testverkauf #5U673T LS-2026-0086 erstellt; Original-PDF HTTP 200 heruntergeladen, visuell geprüft und nach Neuladen in der Oberfläche zurückgelesen. Testauftrag hat bewusst keine echte Postanschrift; echte Fenstergeometrie mit vollständigen synthetischen Anschriften geprüft.
- Kein Kundengeld, keine Mail, kein realer Verkauf/Empfang, keine Rechte/Einstellungen oder bestehenden Belege verändert.

## Grenzen
Physischer Ausdruck, Faltung und tatsächlicher Umschlag wurden nicht geprüft. Druck bei 100 %/Originalgröße erforderlich; Druckerskalierung oder abweichende Umschlagfenster können die Position verändern. Kein neuer digitaler Kundenabschluss oder Papierupload in dieser Runde; bestehende Empfangsregeln getestet.