# Verkaufsartikel-Eingabe – Prüfung 18.11.2026

## Ergebnis
- Die gemeldete automatische Befüllung mehrerer Felder und Beschränkung auf ein Eingabefeld wurde im verfügbaren Chromium nicht reproduziert – weder vor noch nach der Anpassung.
- Hersteller, Modell, Kategorie und Referenznummer haben getrennte Zustände. Die Verkaufsmaske schreibt keine Eingabe automatisch in andere Stammdatenfelder; lediglich der leere URL-Slug zeigt einen Vorschlag aus Hersteller/Modell.
- Felder werden beim automatischen Speichern nicht gesperrt; ein Katalog-Neuladen setzt die geöffnete Maske nicht zurück.

## Gezielte Änderung
Die Verkaufsmaske fordert den Browser jetzt ausdrücklich auf, keine gespeicherten Kontakt-/Adressdaten automatisch einzusetzen. Hersteller, Modell, Kategorie, Referenznummer und Anzeigename haben zusätzlich eindeutig artikelbezogene Feldnamen. Bewusst ausgewählte Hersteller-/Kategorievorschläge bleiben erhalten. Enter sendet das Formular nicht ungewollt ab.

Browser können Autovervollständigungswünsche ignorieren. Ein Safari-spezifischer Fehler oder ein gespeichertes Autofill-Profil ist nicht nachgewiesen; die Änderung ist eine gezielte Absicherung, keine belegte vollständige Ursachenklärung.

## Prüfung
- 24 Tests bestanden: getrennte Neu-/Gebrauchtartikel-Felder, Eltern-Neuladen, erneute Eingabe nach Autosave, leeres Modell, Schließen/Entwurf, Kopien und Katalog.
- Als Luca in der tatsächlichen Mitarbeiteransicht: unveröffentlichten Test-Neuartikel anlegen, mehrere Felder langsam tippen, währenddessen automatisch speichern, ausdrücklich speichern/schließen, neu laden, Artikel öffnen und gespeichertes Modell lesen.
- Wiederholt bei 1280×1800, 820×1180 und 402×725 Pixeln. Alle Testartikel anschließend entfernt; bestehende Verkaufsartikel nicht verändert.
- Ein Cookie-Hinweis verdeckte beim ersten Tablet-Durchlauf den Speichern-Knopf; nach Ablehnen wurde der vollständige Ablauf erfolgreich wiederholt. Cookie-Verhalten nicht geändert.
- Vorschau meldet Build OK.

## Grenzen
Keine native iOS-/Safari-Sitzung mit Lucas gespeicherten Autovervollständigungsdaten verfügbar. Bildschirmgrößen wurden in Chromium geprüft, nicht auf physischen Geräten. Keine Mietartikel, Rechte, Einstellungen, Kundendokumente oder Zahlungen geändert. Nicht veröffentlicht.