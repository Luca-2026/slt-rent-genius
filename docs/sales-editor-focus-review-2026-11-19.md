# Verkaufsartikel: Feldsperre – Prüfbericht vom 19.11.2026

## Ergebnis
Die gemeldete Feldsperre wurde diesmal tatsächlich nachgestellt und gezielt behoben. Neue Verkaufsartikel lassen sich im geprüften Ablauf anlegen, speichern, nach dem Neuladen wieder öffnen und weiterbearbeiten. Die Änderung betrifft ausschließlich die Verkaufsartikelmaske.

## Nachgewiesene Ursache
Die Felder waren nicht durch fehlende Rechte deaktiviert. Beim Wechsel von „Kategorie“ zu „Modell“ sprang der Cursor aus dem Feld auf das gesamte Bearbeitungsfenster; anschließendes Tippen kam deshalb nicht im Modellfeld an.

Die KI-Schaltflächen wurden bei jeder Änderung und beim Start des automatischen Speicherns entfernt und neu aufgebaut. Der Feldwechsel löste gleichzeitig die automatische Speicherung aus. Die Fokussteuerung des Fensters reagierte auf die entfernten Schaltflächen und zog den Cursor aus dem neuen Feld. Die Diagnose wurde über Mausereignisse, aktive Eingabeelemente, entfernte Elemente und den Aufruf der Fokussteuerung belegt.

Die bisherige Abschaltung der Browser-Autovervollständigung konnte diesen anderen Fehler nicht beseitigen. Auch eine zunächst geprüfte Änderung allein an der Speicheranzeige reichte nicht; sie ist nicht Bestandteil der finalen Korrektur.

## Korrektur
Die KI-Schaltflächen behalten nun ihre Identität und werden beim Tippen und Speichern nicht neu aufgebaut. Automatische Speicherung, Modell als optionales Feld, vorhandene Pflichtfelder und Berechtigungen bleiben unverändert. Der gemeinsame Speichermechanismus und die Mietartikelmaske wurden nicht geändert.

## Tatsächliche Ende-zu-Ende-Prüfung
Angemeldet mit Lucas vorhandenem Mitarbeiter-/Admin-Konto, nicht in einer Demo oder nur mit simulierten Speicherantworten. Echte, ausdrücklich benannte Testartikel wurden gespeichert und anschließend wieder entfernt.

| Ansicht | Neuartikel | Gebrauchtartikel |
|---|---|---|
| Desktop, 1280 × 1800 | erfolgreich | erfolgreich |
| Tabletgröße, 820 × 1180 | erfolgreich | erfolgreich |
| Handygröße, 390 × 844 | erfolgreich | erfolgreich |

Jeder der sechs Abläufe wurde zweimal erfolgreich durchgeführt:

1. Verkaufsartikel anlegen; vor Speicherung unveröffentlicht/ausgeblendet einstellen.
2. Hersteller und Kategorie per Klick und Tastatureingabe ausfüllen.
3. Ins Modellfeld klicken und „RA1“ mit Pausen von 850 ms zwischen den Zeichen eingeben, sodass zwischen den Zeichen automatisch gespeichert wird.
4. Prüfen: Cursor bleibt im Modellfeld und jeder Buchstabe bleibt erhalten.
5. Referenznummer ergänzen; Modell wieder leeren.
6. Technische Daten mit Bezeichnung und Wert eintragen; Reiter wechseln; Beschreibung ergänzen.
7. Ohne Modell und ohne Verkaufspreis speichern und schließen.
8. Seite neu laden, Artikel suchen und wieder öffnen; gespeicherte Werte kontrollieren.
9. Referenznummer ändern, technische Daten zurücklesen und erneut speichern.
10. Erneut neu laden und den geänderten Wert zurücklesen; Testartikel löschen.

Keine unbehandelten Browserfehler und kein horizontaler Seitenüberlauf in diesen Abläufen. Die endgültigen Desktop-/Tablet-/Handyansichten wurden zusätzlich nach Ende der Öffnungsanimation visuell geprüft.

## Weitere Prüfungen
- 40 automatisierte Tests bestanden: Feldwechsel und Cursor, Artikelentwürfe, automatische Speicherung, Kopierfunktion, modellfreie Artikel, Verkaufskatalog und Verkaufspreisberechnung.
- Die beiden neuen Regressionstests prüfen den kritischen Fokusverlust für Neu- und Gebrauchtartikel.
- Letzter verfügbarer automatischer Build-Eintrag: erfolgreich.
- Abschlusskontrolle: keine Testartikel dieser Prüfung mehr vorhanden. Vorhandene Verkaufsartikel, Mietartikel, Belege, Rechte und Einstellungen unverändert.

## Prüfgrenzen und Veröffentlichung
## Ergänzende Verkaufs-Nachprüfung
Regel: Verkaufsartikelfelder müssen beim Tippen, Feldwechsel und automatischen Speichern bedienbar bleiben; die Eingaben dürfen dabei nicht verloren gehen.

Die folgenden Stellen wurden in dieser Nachprüfung im Code gelesen. „Code gelesen“ ist kein zusätzlicher vollständiger Live-Test:

| Stelle / Ablauf | Befund zur gemeldeten Feldsperre |
|---|---|
| Neu- und Gebrauchtartikel: Basis, Technik/Bilder, Highlights, SEO und FAQ | Alle sechs KI-Schaltflächen verwenden die korrigierte stabile Komponente. Eingabefelder bleiben unabhängig vom laufenden Autosave bedienbar. |
| Kopieren und bestehende Artikel bearbeiten | Derselbe korrigierte Editor; eigene Kopier-ID, keine erneute Initialisierung durch Listenaktualisierungen. |
| Artikelübersicht: Suche, Kategorie, Öffnen, Sichtbarkeit, Löschen | Suche ist ein stabiles Eingabefeld außerhalb des Dialogs; keine zusätzliche Artikelbearbeitungsmaske. Listenkarte enthält keine Texteingabe. |
| Technische Daten / Zeilensortierung | Stabil definierte Zeilenkomponente; Ziehen nur am Griff, Texteingaben werden nicht durch laufendes Speichern deaktiviert. |
| Entwurf, Schließen, Wiederöffnen, Online-Wiederholung | Formularentwurf und serialisierte Speicherung vorhanden; kein weiterer Fokuswechsel im Speichermechanismus. Einkaufspreise werden bewusst nicht im allgemeinen lokalen Formularentwurf gespeichert. |
| Bild-Upload und KI-Vorschläge | Nur die jeweilige Aktion ist während ihres Aufrufs gesperrt; übrige Texteingaben bleiben bedienbar. Kein erneuter echter Upload/KI-Aufruf. |
| Manuelle Verkaufsanfrage und Verkaufsartikel-Auswahl | Eigener Dialog und Suchauswahl mit stabilen Eingabefeldern; keine Artikel-Autosave-Feldsperre. |
| Verkaufsangebot / AB-Überarbeitung: Katalogsuche und Positionsbeschreibung | Gemeinsame Verkaufsartikelauswahl; Beschreibungsfeld direkt gerendert, Abschnittskomponente außerhalb des Formulars definiert. Kein zusätzliches Modell-Pflichtfeld im Auswahlweg. Nur relevante Verkaufsauswahl-/Eingabeblöcke gelesen, kein vollständiger neuer Dokumentabschluss. |
| Öffentliche Neuartikel-Detailanfrage, Gebrauchtartikel-/allgemeine Suchanfrage | Eigene Dialoge ohne Artikel-Autosave; direkte Eingabefelder. Lokale Fehlermeldungskomponenten zeigen bei gültiger Eingabe keine Elemente und entsprechen nicht der nachgewiesenen Ursache durch ständig entfernte KI-Buttons. |
| Allgemeine Neumaschinen-Kaufanfrage | Anders aufgebautes Seitenformular mit direkt gerenderten Eingaben; Kategorie bewusst erst nach Markenwahl auswählbar, Modell optional. Keine automatische Artikelspeicherung. |
| Öffentliche Verkaufslisten, Detailseiten, Startseitenvorschauen | Quellen und Eingabestellen ermittelt: Artikel werden dort gelesen bzw. für Anfragen ausgewählt, nicht als CMS-Artikel bearbeitet. Keine zweite Artikelmaske. Keine erneute vollständige Prüfung aller Seitentexte oder Dokumente. |
| Anfrage-Speicherfunktionen und gemeinsamer inquiry-store | Speichern eigene Verkaufsanfragen, nicht die Artikelmaske; kein clientseitiger Cursorzugriff. |
| Live-Datenbankfunktionen und Artikeltrigger | Katalogabfrage: keine Public-Funktion referenziert new_machines/used_machines. Die beiden vorhandenen app-eigenen Trigger für Neuartikel und Einkaufskosten aktualisieren nur updated_at; kein Bearbeitungszwang oder Fokuszugriff. |
| Hintergrundjobs | Keine direkte Cron-Referenz auf Neu-/Gebrauchtartikel oder Verkaufsartikelkosten; im Funktionscode keine direkte Verwendung dieser Artikeltabellen. Indirekte Dokument-/Mailjobs wurden nicht insgesamt als funktionsgeprüft erklärt. |

Keine weitere Stelle mit derselben belegten Feldsperrenursache gefunden; deshalb keine zusätzlichen Verhaltens-, Daten- oder Rechteänderungen. Die ursprünglichen Prüfgrenzen unten bleiben bestehen.

## Verbleibende Prüfgrenzen und Veröffentlichung
- Geprüft wurde Chromium mit den drei genannten Bildschirmgrößen, nicht natives Safari auf einem echten iPhone/iPad.
- Andere Mitarbeiterkonten wurden nicht separat angemeldet; bestehende Rechte wurden nicht verändert.
- Bild-Upload, KI-Generierung und anschließender Angebots-/Rechnungsversand waren nicht Gegenstand dieser Feldsperrenprüfung und wurden nicht neu ausgeführt.
- Die Korrektur ist in der Vorschau vorhanden, aber noch nicht veröffentlicht. Die bisher veröffentlichte Version wurde nicht als korrigiert bestätigt.