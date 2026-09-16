# Rechnungen aus Miet- und Verkaufsanfragen

Ziel: Nach Mietende (oder bei Verkauf nach Lieferung) lässt sich aus einer Anfrage eine Rechnung erzeugen, die im gleichen Layout wie das Angebot als PDF an den Kunden geht – inklusive sauberer Nachträge bei Mietverlängerung und fortlaufender Nummer `RE-JJJJ-MM-0001`.

## Ablauf im Portal

1. Anfrage → Angebot erstellen und versenden (bleibt unverändert).
2. Beim Versand wird der Angebotsinhalt (Positionen, Zeiträume, Transport, Auf-/Abbau, Kaution, Zahlungsbedingungen, Lieferadresse) als Momentaufnahme an der Anfrage gespeichert.
3. Nach Mietende: Button „Rechnung erstellen“ in der Anfrage. Das Rechnungsformular ist mit genau diesen Angebotsdaten vorbefüllt, Positionen und Zeiträume sind noch änderbar.
4. Rechnung wird erst als Entwurf gespeichert; erst beim Versand bekommt sie ihre endgültige Nummer und wird unveränderlich.
5. Der Kunde erhält die Rechnung als PDF per E-Mail, das Standortpostfach immer in Kopie.
6. Verlängert der Kunde die Miete, wird zur bestehenden Rechnung ein **Nachtrag** erzeugt: eigene Rechnungsnummer, Verweis „Nachtrag zu Rechnung RE-…“ in Kopf und E-Mail, nur die zusätzlichen Tage/Positionen.

## Neuer Reiter „Rechnungen“

Neue Seite `/b2b/anfrage-rechnungen` direkt neben Mietanfragen und Verkaufsanfragen (nur Mitarbeitende/Admins):

- Liste aller Rechnungen mit Nummer, Kunde, Anfrage, Datum, Fälligkeit, Betrag, Status (Entwurf, offen, überfällig, bezahlt, storniert), Nachtrags-Kennzeichnung.
- Suche und Statusfilter, PDF öffnen, erneut versenden, als bezahlt markieren, stornieren, Nachtrag anlegen.
- Entwürfe sind löschbar, versendete Rechnungen nicht (nur Storno) – das entspricht den GoBD-Regeln, die im Portal bereits für die Kundenrechnungen gelten.

## Rechnungsnummern

Format `RE-2026-09-0001`. Zähler startet je Kalendermonat neu bei 0001, wird in der Datenbank vergeben (keine Lücken durch abgebrochene Entwürfe, weil die Nummer erst beim Finalisieren gezogen wird).

## Technische Umsetzung

- **Datenbank**
  - Neue Tabelle `inquiry_invoices`: Bezug auf `rental_inquiries` bzw. `sales_inquiries`, `parent_invoice_id` für Nachträge, Kundendaten-Snapshot, Netto/USt/Brutto, Transport-, Auf-/Abbau- und Kautionsbeträge, Zahlungsbedingungen, Rechnungs-/Fälligkeitsdatum, Status, PDF-Pfad, Versandzeitpunkt.
  - Neue Tabelle `inquiry_invoice_items` (Position, Menge, Einheit, Zeitraum, Einzelpreis, Rabatt, Summe, Zusatzoptionen).
  - Zählertabelle `invoice_number_counters` (Jahr, Monat, letzter Wert) plus Funktion `generate_inquiry_invoice_number()`.
  - RLS: Lesen/Schreiben nur für Mitarbeitende und Admins (`is_staff_member`), Löschen nur bei Entwürfen und nur für Admins; `GRANT` für `authenticated` und `service_role`.
  - Trigger sperrt Änderungen an finalisierten Rechnungen (analog `enforce_invoice_immutability`).
  - Neue Spalte `offer_payload jsonb` auf `rental_inquiries` und `sales_inquiries` für die Angebots-Momentaufnahme.
- **Edge Functions**
  - `_shared/offer-pdf.ts` bekommt einen optionalen `documentType` (`offer` | `invoice` | `supplement`) mit passenden Überschriften, Rechnungsdatum/Leistungszeitraum, Fälligkeit und Nachtragsverweis – Layout, Schriften und Blöcke bleiben identisch.
  - Neue Function `send-inquiry-invoice`: Staff-Auth, Summenprüfung über die bestehende `offer-math.ts`, Nummernvergabe, PDF-Erzeugung, Upload in `b2b-invoices`, Versand per Resend an den Kunden mit Standort in CC, Doppelversand-Schutz (2-Minuten-Fenster wie beim Angebot), Persistenz in `inquiry_invoices`.
  - `send-inquiry-offer` schreibt zusätzlich `offer_payload` zurück.
- **Frontend**
  - `InquiryInvoiceForm.tsx` auf Basis von `InquiryOfferForm.tsx` (gleiche Positionslogik inkl. Zeitraum-Übernahme), zusätzlich Rechnungsdatum, Leistungszeitraum und Zahlungsziel.
  - `InquiryDetailPanel.tsx`: Aktionen „Rechnung erstellen“ und „Nachtrag erstellen“, Anzeige bereits erzeugter Rechnungen zur Anfrage.
  - Neue Seite `InquiryInvoices.tsx`, Route in `App.tsx`, Navigationspunkt in `B2BPortalLayout.tsx`.
  - Hook `useInquiryInvoices`.
- **Prüfungen**: Typecheck, bestehende Tests, PDF-Regressionstest für das neue Rechnungslayout.

## Offene Punkte

- Mahnwesen/Zahlungserinnerungen sind nicht Teil dieses Schritts.
- Anbindung an die Buchhaltung (DATEV/Steuerbüro-Export) wird separat betrachtet.
