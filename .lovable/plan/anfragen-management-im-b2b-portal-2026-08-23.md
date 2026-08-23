# Anfragen-Management im B2B-Portal

Ziel: Alle Miet- und Kaufanfragen laufen künftig nicht mehr nur per E-Mail ein, sondern landen zusätzlich als bearbeitbarer Vorgang im Portal. Zwei neue Reiter zwischen „B2B-Vermietung“ und „Interne Verwaltung“: **Mietanfragen** und **Verkaufsanfragen**.

## Was der Nutzer sieht

**Navigation**
- Neuer Reiter „Mietanfragen“ (`/b2b/mietanfragen`) mit Badge für offene Anfragen.
- Neuer Reiter „Verkaufsanfragen“ (`/b2b/verkaufsanfragen`) mit Badge.
- Sichtbar für Admins und Standortmitarbeitende (beide dürfen bearbeiten).

**Mietanfragen-Liste**
- Tabelle/Karten mit: Eingang, Status, Standort, Artikel, Zeitraum, Kunde, Bearbeiter.
- Filter: Status (Neu / In Bearbeitung / Angebot gesendet / Angenommen / Abgelehnt / Erledigt), Standort, Suche.
- Live-Aktualisierung (Realtime), damit sofort sichtbar ist, wenn ein Kollege eine Anfrage übernimmt.

**Detail-Dialog einer Mietanfrage**
- Alle Kundendaten, Zeitraum, Lieferwunsch, Nachricht, Anhänge – schreibgeschützt.
- „Übernehmen“-Button (setzt Bearbeiter + Status „In Bearbeitung“, verhindert Doppelbearbeitung).
- Interne Notizen und Statusverlauf.
- Angebotsbereich: Positionen (aus der Anfrage vorbelegt) mit Menge, Preis, Rabatt, Liefer-/Rückgabekosten, Kaution, Zusatzleistungen, Gültigkeit.
- Button „Angebot senden“: erzeugt PDF über die bestehende Angebots-Pipeline und mailt es an den Kunden. Text enthält den Hinweis: Annahme durch kurze Bestätigung per E-Mail an die Standortadresse (krefeld@ / bonn@ / muelheim@slt-rental.de) – Job wird danach manuell in Rentware angelegt.
- Buttons „Angenommen“ / „Abgelehnt“ / „Erledigt“ zum Abschluss.

**Verkaufsanfragen-Liste**
- Gleiche Struktur, Quellen: Neuartikel-Kaufanfragen, Gebraucht-Anfragen (inkl. Suchanfragen) und Kaufanfragen aus Mietartikeln.
- Detail-Dialog mit allen Formularfeldern, Übernehmen, Notizen, Statuspflege und „Angebot senden“ (freie Positionen, da kein Mietzeitraum).

**E-Mails bleiben**
- Alle bestehenden Benachrichtigungen an die Standort-Postfächer laufen unverändert weiter. Zusätzlich enthält die interne Mail einen Direktlink zum Vorgang im Portal.

## Technische Umsetzung

**Datenbank (eine Migration)**
- `public.rental_inquiries`: Herkunft (`source`: product_booking, wedding, category, contact), Standort, Artikel (Name, ID, Kategorie), Zeitraum inkl. Uhrzeiten, Lieferdaten, Kundendaten, Nachricht, Anhang-Pfade, `status`, `assigned_to`, `assigned_name`, `assigned_at`, `internal_notes`, `offer_id`, `email_sent`, Timestamps + updated_at-Trigger.
- `public.sales_inquiries`: `kind` (neu / gebraucht / mietartikel-kauf), Produktdaten (Marke, Modell, Artikelnummer, Menge, Zubehör), Liefer-/Rechnungsdaten, Finanzierungswunsch, Kundendaten, gleiche Workflow-Felder.
- GRANTs: `authenticated` (SELECT/INSERT/UPDATE), `service_role` ALL, kein `anon`-Zugriff.
- RLS: Lesen/Ändern nur für `has_role(auth.uid(),'admin')` oder `is_staff_member(auth.uid())`. Insert erfolgt ausschließlich über Edge Functions mit Service-Role.
- Audit-Trigger (`audit_row_change`) für beide Tabellen, damit nachvollziehbar bleibt, wer was geändert hat.

**Edge Functions**
- `send-inquiry-email`, `send-purchase-inquiry`, `send-used-inquiry` schreiben vor dem Mailversand per Service-Role-Client einen Datensatz und hängen den Portal-Link in die interne Mail. Der Insert läuft als eigener try/catch: schlägt er fehl, geht die Mail trotzdem raus (und umgekehrt), damit keine Anfrage verloren geht.
- Neue Function `send-inquiry-offer`: validiert Eingaben (Zod), prüft Admin-/Staff-Rolle über das JWT, erzeugt das Angebots-PDF mit der bestehenden `generate-offer`-PDF-Logik, versendet es an den Kunden (CC Standortpostfach), speichert Datei-URL/Angebotsnummer am Vorgang und setzt den Status auf „Angebot gesendet“.

**Frontend**
- `src/pages/b2b/RentalInquiries.tsx` und `src/pages/b2b/SalesInquiries.tsx` + Detail-Dialoge unter `src/components/b2b/inquiries/`.
- Routen in `App.tsx`, Nav-Einträge in `B2BPortalLayout.tsx` (admin- und staff-Navigation), Zähler analog `useStaffWork` über neuen Hook `useOpenInquiries`.
- Statuslogik und Labels zentral in `src/lib/inquiryStatus.ts`.

**Tests / Validierung**
- Unit-Tests (Vitest) für Statusübergänge, Positions-/Summenberechnung inkl. MwSt. und die Mapping-Funktion Formular → Datensatz.
- Deno-Test für die PDF-Erzeugung der neuen Angebots-Function (analog `pdf_test.ts`).
- End-to-End-Check mit Playwright: Anfrage über das Produktformular absenden → Datensatz erscheint im Portal → Übernehmen → Preis eintragen → Angebot senden → Status korrekt.
- Anschließend Security-Linter auf die neuen Tabellen.

## Reihenfolge
1. Migration (Tabellen, GRANTs, RLS, Trigger).
2. Edge Functions erweitern (Insert + Portal-Link), Deploy.
3. Portal-Reiter mit Liste, Filter, Realtime, Detail-Dialog.
4. Angebots-Versand-Function inkl. PDF.
5. Tests, E2E-Durchlauf, Linter-Check, Reporting.
