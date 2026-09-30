# Vermietportal: interne Ansichten überarbeiten

Bereits erledigt: Auf app.slt-rental.de heißt die Anmeldung „Vermietportal“ und zeigt das neue SLT-Logo. Wer von der normalen Website kommt, sieht weiter „B2B-Portal Login“.

Ziel: Admins und Mitarbeiter arbeiten in einem aufgeräumten Portal. Anfragen, Angebote und Rechnungen von Privat- und Geschäftskunden liegen an einer Stelle und lassen sich filtern. Nach jedem Schritt gibt es einen Test und einen Bericht, dann gibst du den nächsten Schritt frei. Danach folgt die Kundenansicht für Firmenkunden.

## Schritt 1 – Neues Menü (Navigation)
Eine feste Seitenleiste für Mitarbeiter, nach Aufgaben gruppiert. Auf dem Handy wird sie zu einem ausklappbaren Menü.

```text
Übersicht       Dashboard
Vorgänge        Anfragen (Miete) · Angebote · Reservierungen · Verkaufsanfragen
Abrechnung      Rechnungen & Gutschriften · Zahlungen offen
Kunden          Kundenkartei
Einsatz         Übergabe & Rücknahme (Protokolle) · Inventar & Schäden · Aufgaben
Verwaltung      Artikel/CMS · Mitarbeiter · Protokoll (Audit) · Feedback
```
- Jeder Eintrag bekommt eine eigene, direkt aufrufbare Adresse. Alte Adressen leiten weiter.
- Mitarbeiter sehen nur die Einträge, für die sie berechtigt sind (Rollen bleiben wie heute).

## Schritt 2 – Anfragen und Vorgänge zusammenführen
- „B2B-Vermietung“ (Reservierungen von Portal-Kunden) und die allgemeinen Mietanfragen landen in **einer Liste „Anfragen“**.
- Filter: **Privat / Geschäftskunde / B2B-Portalkunde**, Standort, Status, Zeitraum, zuständiger Mitarbeiter.
- Jede Zeile zeigt Kunde, Artikel, Zeitraum, Status und den nächsten Schritt (z. B. „Angebot senden“ oder „Zahlung prüfen“).
- Angebote und Rechnungen bekommen jeweils eine eigene Liste mit denselben Filtern „Privat/Geschäftskunde“.
- Bestehende Abläufe (Angebot, Überarbeitung, Auftragsbestätigung, Rechnung, Gutschrift) bleiben unverändert und werden nur neu eingeordnet.

## Schritt 3 – Kundenkartei
- Eine Kartei für alle Kunden: CRM-Kunden und B2B-Portalkunden zusammen, ohne Dubletten.
- Filter: Privat/Geschäftskunde, Portalkunde ja/nein, Standort, offener Betrag, letzte Anfrage.
- Kundenseite mit allen Anfragen, Angeboten, Rechnungen, Zahlungen und Protokollen dieses Kunden.

## Schritt 4 – Reiter „Übergabe & Rücknahme“
- Alle Übergabe- und Rücknahmeprotokolle an einer Stelle, mit Filtern nach Standort, Datum, Status (offen/unterschrieben) und Schäden.
- „Heute fällig“: anstehende Übergaben und Rücknahmen des Tages, direkt mit Start des geführten Ablaufs.

## Schritt 5 – Dashboard neu
- Oben die Arbeit des Tages: neue Anfragen, Angebote ohne Antwort, Zahlungen offen, Übergaben/Rücknahmen heute, fällige Wartungen.
- Kennzahlen nur aus echten Daten: Mietumsatz (aus versendeten Rechnungen abzüglich Gutschriften) je Monat und Standort, Privat vs. Geschäftskunden, offene Forderungen, Angebotsquote (gesendet → angenommen).
- Umsätze sehen nur Admins/Buchhaltung.

## Schritt 6 – Optik und Mobil
- Einheitliche Seitenköpfe, Tabellen und Filterleisten im bestehenden Farbschema (Blau/Orange).
- Auf dem Handy werden Tabellen zu Karten, und die wichtigsten Aktionen sind mit einem Tipp erreichbar.
- Durchklicken jeder Seite auf Desktop und Handy.

## Technische Details
- Neues gemeinsames Layout `StaffPortalLayout` mit Seitenleiste (shadcn Sidebar); Seiten aus den heutigen Tabs in `AdminDashboard` werden zu eigenen Routen unter `/b2b/intern/...`, alte Routen (`/b2b/admin`, `/b2b/mietanfragen`, `/b2b/kundendaten`, `/b2b/anfrage-rechnungen`) leiten weiter.
- Die zusammengeführte Anfragenliste liest `rental_inquiries` und `b2b_reservations` und normalisiert beides in einer gemeinsamen Zeilenstruktur. Es gibt keine Datenmigration; die bestehende Verknüpfung über `sync_b2b_reservation_to_inquiry` verhindert doppelte Einträge.
- Die Kundenkartei führt `crm_customers` und `b2b_profiles` zusammen (vorhandener Sync-Trigger `sync_b2b_profile_to_crm`).
- Die Dashboard-Kennzahlen kommen aus `inquiry_invoices` (+ Gutschriften) und `b2b_invoices`, gefiltert nach Rolle.
- Rechte bleiben wie bisher (`has_role`, `is_staff_member`), es entstehen keine neuen Tabellen, sofern kein Schritt es zwingend braucht.
