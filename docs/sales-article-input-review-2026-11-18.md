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

## Nachprüfung der übrigen Verkaufswege
Regel: Eine Verkaufsartikel-Eingabe verändert nur das gewählte Feld; andere Felder bleiben weiter editierbar. Bewusstes Kopieren oder Auswählen eines Artikels ist davon zu unterscheiden.

| Stelle | Gelesener Umfang / Ergebnis |
| --- | --- |
| Neu-/Gebrauchtartikel: Basis, Technik/Bilder, SEO | Vollständige gemeinsame SalesArticleEditorDialog-Maske gelesen; einzelne Feldsetter erhalten den übrigen Zustand. Autosave deaktiviert keine Artikelfeld-Eingabe. |
| Lokale Entwürfe, Wiederöffnen, Hintergrund-Tab, Speichern | Initialisierung, Entwurfs- und Speicherabschnitte erneut gelesen; Wiederherstellung nur bei Öffnen/Artikelwechsel, Bestätigung nur für den abgesendeten Zustand. useArticleAutosave im vorigen Prüflauf vollständig gelesen und getestet. |
| Kopieren, Bearbeiten, Sichtbarkeit, Löschen | AdminSalesCatalogTab vollständig gelesen; getrennte Bearbeitungsdaten, Kopie über structuredClone mit eigener Identität. salesArticleEditing erneut vollständig gelesen; kein Überschreiben des Originals. |
| Technische Daten sortieren | SortableRows vollständig gelesen; nur explizites Verschieben ändert die Reihenfolge, Textfelder werden nicht gesperrt. |
| KI-Vorschläge | Client-Aufruf erneut gelesen, admin-generate-sales-content vollständig gelesen; nur nach bewusstem KI-Klick wird das ausgewählte Inhaltsfeld übernommen, keine Artikel-Stammdaten und keine Tabellenwrites durch die Funktion. |
| Verkaufsangebot / AB-Änderungseditor: Auswahl und Wiederherstellung | SalesProductCombobox vollständig, salesbezogene Auswahl-/Anreicherungsabschnitte von InquiryOfferForm gelesen; Suchtexte ändern nichts bis zur expliziten Auswahl. Auswahl übernimmt die betreffende Angebotsposition, schreibt keine Verkaufsartikeltabelle. Kein vollständiger Dokumentversandtest. |
| Öffentliche Neuartikel-Listen, Herstellerliste, Detail, Gebrauchtliste/Detail, beide Startseitenvorschauen | Alle jeweiligen Tabellen-Leseabschnitte jetzt gelesen; ausschließlich select, keine Schreiboperation auf Artikel. Die übrigen Seitenabschnitte wurden in dieser Nachprüfung nicht vollständig gelesen. |
| Verkaufsauswertung | Tabellen-Leseabschnitt gelesen; ausschließlich select, keine Artikelfeldänderung. |
| Hintergrund-Seitenerstellung | Verkaufsartikel-Leseabschnitte in scripts/exportRoutes.ts gelesen; GET-Lesezugriffe, kein Schreiben. |
| Öffentliche Kauf-/Gebrauchtanfrage-Sender | Speicherung der getrennten Hersteller-/Modell-/Kategorieangaben und Tabellenoperationen gelesen; Schreiben über inquiry-store, nicht in Verkaufsartikeltabellen. Keine neue Anfrage versendet. |
| Aktive Datenbankfunktionen/-Trigger | Live-Abfrage nach allen public-Funktionskörpern mit new_machines/used_machines und allen nichtinternen Triggern beider Tabellen: keine solche Funktion, lediglich Neuartikel-Trigger aktualisiert updated_at; keine Feldkopie oder Feldsperre. |

Keine weitere belegte Abweichung zur beschriebenen Eingaberegel gefunden. Mietmasken sind bewusst nicht geändert oder als nachgeprüft bezeichnet. Bezahlte/versendete/erstattete/abgeschlossene Bestandsdaten, Rechte, Einstellungen und Beispieldaten bleiben unverändert.