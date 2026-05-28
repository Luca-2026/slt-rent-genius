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

### A2 Schritt 3 (erledigt)

Neue Datei: `src/components/b2b/reservations/MyReservationRow.tsx`

Drei rein-präsentationale Bausteine aus `MyReservations.tsx` extrahiert:

- `<ReservationRow>` — Desktop-Tabellenzeile für eine einzelne Reservierung (inkl. Sub-Row-Variante für aufgeklappte Sammelanfragen).
- `<ReservationMobileCard>` — Mobile-Karte für eine einzelne Reservierung.
- `<OfferActions>` — gemeinsamer Block (Angebotsnummer, Preis, PDF-Button, Annehmen-Button, Bestätigt-Badge), wird sowohl von Row als auch Card als auch der Gruppen-Header-Zeile in der Desktop-Tabelle genutzt.

Alle drei Komponenten besitzen keinen State, keinen Supabase-Call und keine Auth-Logik. Daten und Handler kommen ausschließlich per Props. Verhalten 1:1 identisch.

### A2 Schritt 4 (erledigt)

Neue Datei: `src/components/b2b/reservations/MyReservationsHeader.tsx`

Zwei Komponenten aus `MyReservations.tsx` extrahiert:

- `<MyReservationsStats>` — 5-Kachel-Stat-Grid (Gesamt · Ausstehend · Angebote · Bestätigt · Abgeschlossen).
- `<MyReservationsFilterBar>` — Status-Filter `<Select>` + Aktualisieren-Button.

State (Filterwert, Loading-Flag, Counts) bleibt im Parent. Reine Anzeige + Callback-Props. Sichtbarer Output ist exakt derselbe.

### Ergebnis

`src/pages/b2b/MyReservations.tsx`:

- vor Phase A2: **929 Zeilen**
- nach Schritt 1 + 2: **699 Zeilen**
- nach Schritt 3 + 4: **~430 Zeilen** (nur noch Datenebene + Layout-Zusammenbau der extrahierten Bausteine)

Imports im Hauptfile auf das Nötige reduziert (`Table*`, `Collapsible*`, Layout-Icons). Keine doppelten Render-Helfer mehr, kein toter Code.

Folgeschritte (Phase A3 / A4):

- A3: `AdminCreateOfferDialog.tsx` (1211 Zeilen) in Wizard-Schritte zerlegen.
- A4: Reservation-Status als TypeScript-Enum + zentrale Mapping-Funktion.

## Verifikation nach jedem Schritt

- Build muss grün sein (TypeScript).
- Login B2B-Kunde → Mietvorgänge laden + zeigen Status korrekt.
- Login Admin → Tabs wechselbar, `?tab=customers` direkt aufrufbar.
- Edge Functions, Resend-Mailversand, Registrierung unangetastet.
