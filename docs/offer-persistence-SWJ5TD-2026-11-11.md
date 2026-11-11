# Angebotsversand #SWJ5TD – 11.11.2026

## Befund
- Im Auftrag ist ANG-M-2026-10-0099-2 mit 538,33 € brutto gespeichert.
- Annahmelinks belegen Versandzeitpunkte für ANG-M-2026-10-0099-3 (213,46 € brutto, zuzüglich 150 € Kaution): 13:52:38, 16:36:31 und 16:37:33 UTC.
- Der Sender verschickte bisher zuerst die E-Mail und speicherte anschließend den Auftrag. Ein Speicherfehler wurde nur protokolliert; die Antwort meldete trotzdem Erfolg.
- Der Schilder-Bestandsschutz zählt für den gesamten Anfragezeitraum 10 andere Sets bei Bestand 10. Eine Ablehnung ist deshalb plausibel; ein damaliger Fehlerlog ist nicht vorhanden. Der Bestandsschutz wurde nicht umgangen oder verändert.
- Keine Zahlung und kein Zahlungsereignis sind gespeichert. Luca bestätigt Überweisung; Betrag, Datum und Banknachweis fehlen. Kein Zahlungseingang wurde erfunden oder eingebucht.

## Korrektur
- Vollständige Angebotsfassung vor Annahme-/Zahlungslinks und Kundenmail speichern.
- Optimistische Prüfung von updated_at verhindert Versand bei zwischenzeitlicher Auftragsänderung.
- Speicherfehler liefert 409 mit konkretem Grund und stoppt den Ablauf vor Linkablösung und Versand.
- Versandstatus wird gespeichert. Nicht akzeptierter E-Mail-Versand liefert einen ausdrücklich gespeicherten, aber nicht versendeten Zustand mit Hinweis auf unveränderten Neuversand.
- PDF-Bereitstellungsfehler stoppen den Versand; bestehende Kundenmail-/Auth-Einstellungen unverändert.

## Prüfung
- 30 Tests bestanden: Speichersperre bei Bestandsschutz, keine nachfolgenden Link-/Versandaktionen, konkurrierende Änderung, Reihenfolge sowie bestehende Schilderreservierung und unveränderter Neuversand.
- Vorschau-Build ohne Fehler.
- send-inquiry-offer eingespielt; letzte bestätigte Quellfassung: af9066d407bc0f79ef4c4d4a6ef9e5600fa19f10b17bb34320b1ec5a7cd1e7a9.
- Browserprüfung mit eigenem gemintetem Zugang: Kundenkonto „Testfirma“, Umleitung auf eigene Mietvorgänge. Daher kein Mitarbeiter-Ende-zu-Ende-Versandtest möglich; keine vollständige Funktionsfreigabe.

## Unverändert / offen
- #SWJ5TD, historische PDFs/Annahmelinks, Zahlungen und Bestand nicht verändert.
- Wiederherstellung der bereits versendeten dritten Fassung braucht belegte Angebotspositionen und Klärung der Bestandskollision; keine erneute Kundenmail auf Verdacht.
- Überweisung erst anhand tatsächlichen Betrags/Datums erfassen.
- Echter Mitarbeiterablauf Speichern → Versand → Zurücklesen ist noch offen.