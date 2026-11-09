# Kundendokumente – Ralf Döhler, 9. November 2026

## Ursache und Korrektur
Die SELECT-Regel für den privaten Ordner `b2b-invoices` enthielt Admin, Buchhaltung und Standortmitarbeiter, aber keine Niederlassungsleiter. Ralf ist aktiver Niederlassungsleiter. Die Kundenakte konnte die gespeicherten Dokumenteinträge lesen, aber beim Anklicken keinen frischen PDF-Link erzeugen. Mit Ralfs tatsächlicher Sitzung vor der Änderung reproduziert: `Object not found` beim Signieren des bestehenden Angebots.

Migration `0174_branch_manager_customer_document_read.sql` ergänzt ausschließlich lesenden Zugriff für angemeldete, aktive Niederlassungsleiter auf `b2b-invoices`. Keine öffentliche Freigabe, keine Änderung anderer Speicherordner, Schreibrechte, Kundenrollen, Dokumente, Buchungen oder Versandwege.

## Prüfung
- Anmeldung als Ralf Döhler; echte Kundenkartei geöffnet und Lars Larsen gesucht.
- Alle vier Dokumentbuttons angeklickt: AB-M-2026-11-0027, RP-2026-0017, LS-2026-0053, ANG-M-2026-11-0027. Je HTTP 200 und tatsächliche PDF-Datei; keine Fehlerbenachrichtigung.
- Drei Datenbanktests: aktiver Niederlassungsleiter darf PDFs lesen, normaler Kunde bleibt gesperrt, inaktiver Niederlassungsleiter erhält keine zusätzliche Freigabe; andere Ordner bleiben gesperrt.
- Insgesamt neun gezielte Tests bestanden, Vorschau build OK.
- Keine Rechnung erstellt, keine Auszahlung, keine Kundenmail; bestehende Dokumente nur gelesen. Berechtigung wirkt sofort ohne Websiteveröffentlichung.