# AB-Änderung #UB8YX8

## Befund
- Gespeicherter Auftrag: Mietende 20.11.2026; unverändert seit Übergabe/AB am Morgen.
- Gemeinsamer Änderungsentwurf von Benedikt Nöchel vom 20.11.2026, 16:23 UTC: Mietende 23.11.17:00, Rückholung 24.11.10:00, 2 manuelle Miettage, Personenkorb. Kein bestätigter Auftragsspeicherlauf nachweisbar.
- Die Vereinbarungsnotiz war leer. Vor der Korrektur fordert die echte Vorschau eine Notiz (HTTP 400); nach Eingabe erfolgreich (200). Notiz und Vereinbarungszeit wurden bisher weder gespeichert noch wiederhergestellt. Daher gingen diese Voraussetzungen beim Wiederöffnen verloren.

## Korrektur
- Vereinbarungsnotiz/-zeit im selben Entwurf wie Positionen speichern und aus lokalen/kollegialen Entwürfen wiederherstellen.
- Erste tatsächliche Eingabe schreibt auch dann einen Server-Entwurf, wenn der anfängliche Verzögerungslauf noch nicht stattgefunden hat.
- Fehlende Vereinbarungsangaben werden vor der Vorschau erklärt; Pflichtnachweis, Vorschaupflicht und geschützte Auftragsspeicherung bleiben erhalten.
- Erfolgreiche Abschlüsse deaktivieren verzögerte Entwurfsschreibvorgänge.

## Prüfung und Grenzen
- 36 Tests: lokaler/Server-Notizrestore, erste Entwurfssicherung, fehlende Vereinbarung, bestehende Miet-/Verkaufs-, Rabatt- und DB-Änderungsregeln.
- Echter Luca-Zugang: vorhandenen Entwurf geöffnet; AB-PDF-Vorschau 200 mit Mietende 23.11., Rückholung 24.11., 2 Miettagen und 985,92 € brutto; Vereinbarungsnotiz nach Neuladen wiederhergestellt, mobile Ansicht 402 px ohne horizontalen Überlauf.
- Produktive Server-Entwurfsschreibvorgänge während der Nachprüfung abgefangen, lokale Wiederherstellung real geprüft. Benedikts Server-Entwurf unverändert zurückgelesen.
- Kein produktiver Auftragsabschluss, kein Mailversand, keine Preis-/Zahlungs-/Originalbelegänderung. Finale Speicherung/Versand nicht Ende zu Ende geprüft; Oberfläche nicht veröffentlicht. Tatsächlichen Verlängerungstermin beim Nutzer angefragt, keine Termine auf Verdacht übernommen.

## Nachprüfung verwandter Wege

Regel: Vereinbarte Auftragsänderungen einschließlich Notiz und Zeitpunkt müssen erhalten bleiben; neue ABs und Folgeansichten nutzen den gespeicherten Auftrag, nicht das alte Angebot oder einen unbestätigten Entwurf.

| Stelle | Gelesen / geprüft | Ergebnis |
| --- | --- | --- |
| Mietvorgangs-Vollseite `RentalInquiryDetail`, Verkaufs-Sheet `SalesInquiries`, `InquiryDetailPanel` | Code gelesen | Beide nutzen denselben Editor und das operative offer_payload; nach Änderungsspeicherung Wechsel zur AB-Prüfung, reload des Auftrags. |
| AB-Änderungseditor Miete/Verkauf, Angebotsneuanlage/-revision, normale/finale/Nachtragsrechnung `InquiryOfferForm` | Code und Tests | Gemeinsamer lokaler Entwurf wartete 1,2 Sekunden; jetzt unmittelbar sichern. Verwerfen setzt Bedienungsflag zurück, sonst konnte der Entwurf neu entstehen. Notiz/Zeit bleiben erhalten. |
| Gemeinsame Sicherung `offerDraftStorage` | Code und 3 Tests | Serverfehler wurden ignoriert, parallele saves/delete konnten in falscher Reihenfolge enden. Jetzt je Entwurf serialisiert, Fehler zurückgegeben und im Editor sichtbar. Keine Tabellen/Rechteänderung. |
| AB-Vorschau/-Versand/-Neuversand `OrderConfirmationCard`, `send-order-confirmation` | Vollständiger Code gelesen; echte Vorschau 200 | Nutzt aktuellen gespeicherten Auftrag, Revision/Saldo und aktuelle Vorschau. Zahlungsgates bleiben erhalten, keine automatische Mail durch Änderungsspeicherung. |
| Miet-Änderungshistorie `OrderRevisionHistory` | Code gelesen | Liest unveränderliche Revisionsnotizen und historische AB-PDFs; kein Schreiben auf Originalbelege. Verkaufs-AB hat keine entsprechende Historienanzeige, aber gespeicherte Revisionen bleiben erhalten. Kein zusätzlicher UI-Ausbau. |
| `buildOrderAmendment`, `buildSalesOrderAmendment` | Code und Tests | Normalisieren geänderte Positionen ohne Originalüberschreibung; Mietkalender/Versicherung getrennt von manueller Abrechnungsdauer; Verkauf ohne Mietdaten. |
| Live `save_rental_order_amendment`, `save_sales_order_amendment` | Definitionen vollständig gelesen; isolierte DB-Tests | Notiz/Zeit/Revision/Summen validiert, Original und Revisionen erhalten; Miete synchronisiert Reservierungen/Belegung, Verkauf nicht. |
| Live `check_availability`, `confirm_order` | Definitionen vollständig gelesen | Lesen operative Artikel/Zeiträume; Belegungsschutz bleibt unverändert. |
| Abschlagsdialog `InstallmentCard`, `send-inquiry-invoice`, `offerPayloadToLines` | Code gelesen | Aktuelle Auftragspositionen, Änderungsschutz und aktuelle Referenzen; existierende Rechnungen bleiben unverändert. Abschlagsdialog ist kein Auftragsänderungseditor. |
| Kalender, Listen und Startseite: `calendarEntries`, `RentalInquiryDetail`, `useInquiries`, Aufrufstellen `AvailabilityCalendar`/`StaffHome` | Code gelesen | Operative Zeiträume/Positionen vor Anfragefallback; gespeicherte Änderungen werden neu geladen. Unbestätigte Entwürfe belegen nichts. |
| Rückgabeprotokolle `generate-rental-protocol` | Relevanter Code gelesen | Neue Protokolle lesen aktuelle Auftragsdaten; existierende Protokolle werden nicht neu erstellt. |
| Rückgabeerinnerungen `ReturnReminderActions`, `send-transactional-email`, `return-reminder-content`, Live `claim_rental_return_reminder` | Relevanter Code/Live-Definition vollständig gelesen | Neue Sendvorbereitung nutzt aktuelles Mietende; vorhandene Versandnachweise bleiben eingefroren, geänderte Aufträge blockieren Wiederverwendung alter Erinnerung. Kein automatischer Verlängerungsschreibweg. |
| Abschlags-Erinnerungsjob `installment-reminder`, Zahlungs-Erinnerungswege `payment-reminder` | Code gelesen | Lesen aktuellen gespeicherten Plan/Saldo, keine Entwurfsübernahme oder Auftragsverlängerung. |
| Automatischer Ablauf `close_expired_rental_inquiries` | Live-Definition gelesen | Nur unbestätigte neue/in-Bearbeitung/Angebot-gesendet-Vorgänge; bestätigte Verlängerungen werden nicht geschlossen. |
| Interne Notizen/Status `useInquiryActions` | Code gelesen | Eigene ausdrückliche Speicherung mit Fehleranzeige, kein zweiter AB-Änderungsweg. |

Zusätzliche Abnahme: 48 Tests bestanden ohne unhandled errors; als Luca echte #UB8YX8-AB-Vorschau 200, unmittelbar nach Notizeingabe neu geladen und dieselbe Notiz zurückgelesen, 402px ohne Überlauf. Schreibzugriffe auf produktive Server-Entwürfe weiterhin abgefangen; keine echte Auftragsänderung oder Mail. Auftrag und Benedikts Server-Entwurf nicht verändert. Diese Codeprüfung ist keine End-to-End-Freigabe für Versand, produktive Server-Entwurfssicherung, native Safari oder andere Mitarbeiterkonten; Oberfläche weiterhin unveröffentlicht.