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

Folgeschritte für A2 (separate Iteration, damit jedes Diff klein bleibt):

1. `ReservationCard`/Gruppen-Card-JSX in eigene Komponente.
2. Rückgabe-Dialog (`returnDialogOpen` + Signaturpad) in `ReturnRequestDialog` ausgliedern.
3. Filter-/Header-Bereich in `MyReservationsToolbar`.

Risiko aktuell: keines. Reine Code-Bewegung, keine Logikänderung, keine API-Calls geändert.

## Verifikation nach jedem Schritt

- Build muss grün sein (TypeScript).
- Login B2B-Kunde → Mietvorgänge laden + zeigen Status korrekt.
- Login Admin → Tabs wechselbar, `?tab=customers` direkt aufrufbar.
- Edge Functions, Resend-Mailversand, Registrierung unangetastet.
