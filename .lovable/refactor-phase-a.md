# B2B-Portal Refactor — Phase A (Stabilität & Aufräumen)

Stand: 2026-05-28

## Sicherheitsprämisse

- **Keine Auth-Änderungen.** `useAuth`, Supabase-Clients, RLS-Policies, Edge Functions bleiben unangetastet.
- **Keine DB-Migrationen.** Kein Schema-, Trigger- oder Policy-Eingriff. Keine Tabellen-Drops, kein User-Delete.
- **Keine Datenbewegung.** Refactor ist rein Frontend/Strukturell. Kundenaccounts, Reservierungen, Rechnungen, Dokumente bleiben unverändert in der DB.
- **Backup nicht erforderlich**, weil DB nicht angefasst wird. Bei Bedarf können wir vor jeder DB-Phase zusätzlich einen SQL-Dump anstossen.
- Jeder Schritt wird einzeln deploybar gehalten — Rollback per Git-Revert jederzeit möglich.

## Phase A1 — Tab-State an URL koppeln (erledigt)

Datei: `src/pages/b2b/AdminDashboard.tsx`

- `useState("reservations")` durch `useSearchParams` ersetzt.
- Aktiver Tab wird als `?tab=...` in der URL geführt.
- Whitelist `VALID_TABS` verhindert ungültige Werte.
- Default bleibt "reservations" → keine Verhaltensänderung beim ersten Aufruf.
- Vorteile: Deep-Links, Reload-fest, geteilte URLs zeigen denselben Tab.
- Risiko: keines (kein Logik-Eingriff, kein Datenzugriff geändert).

Folgeschritt (optional, später): echte Sub-Routen `/b2b/admin/kunden`, `/b2b/admin/rechnungen` etc. Erst sinnvoll, wenn `AdminDashboard.tsx` weiter zerlegt ist.

## Phase A2 — MyReservations entrümpeln (Schritt 1 erledigt)

Neue Datei: `src/components/b2b/reservations/reservationUtils.tsx`

Extrahiert aus `src/pages/b2b/MyReservations.tsx`:

- Typen: `Reservation`, `Offer`, `ReservationGroup`
- Konstanten: `statusConfig`, `locationLabels`
- Pure Funktionen: `groupReservations`, `buildGroup`
- Neue Komponente: `<ReservationStatusBadge />` (für späteren Wiederverwendung in Admin-Views)

`MyReservations.tsx` importiert jetzt aus dem neuen Modul — alle bestehenden Verwendungsstellen (`statusConfig[r.status]`, `locationLabels[...]`, `groupReservations(...)`) funktionieren unverändert weiter.

### A2 Schritt 2 (erledigt)

Neue Datei: `src/components/b2b/reservations/MyReservationDialogs.tsx`

Drei in sich geschlossene Dialoge aus `MyReservations.tsx` extrahiert (~140 Zeilen JSX weniger im Hauptfile):

- `<AcceptOfferDialog>` — Angebot annehmen + Unterschrift
- `<ReturnDeviceDialog>` — Gerät freimelden
- `<DeleteReservationDialog>` — Pending-Anfrage löschen

Dialoge erhalten alle Daten + Handler per Props. Kein Supabase-Call, keine Auth-Logik, keine Business-Rule liegt im Dialog selbst — der Parent besitzt weiterhin den State und führt die Aktionen aus. Verhalten 1:1 identisch.

Nicht mehr benötigte Imports in `MyReservations.tsx` entfernt (`Dialog`, `AlertDialog`, `SignaturePad`, `XCircle`, `ThumbsUp`, `Pencil`).

Folgeschritte für A2 (separate Iteration):

1. `ReservationCard`/Gruppen-Card-JSX (Mobile + Desktop-Row) in eigene Komponente.
2. Stats-Kacheln + Filter-Toolbar in `MyReservationsHeader`.

## Verifikation nach jedem Schritt

- Build muss grün sein (TypeScript).
- Login B2B-Kunde → Mietvorgänge laden + zeigen Status korrekt.
- Login Admin → Tabs wechselbar, `?tab=customers` direkt aufrufbar.
- Edge Functions, Resend-Mailversand, Registrierung unangetastet.
