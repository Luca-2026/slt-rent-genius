# B2B-Portal Refactor — Phase C (Skalierung & Komfort)

Stand: 2026-05-28

## Sicherheitsprämisse

- Keine Auth-Änderungen, keine DB-Migration in diesem Teil-Schritt.
- Keine RLS-Änderungen, keine Datenbewegung.
- Reine Frontend-Komfortlayer (Pagination + Mobile-Nav).

## C1 — Client-seitige Pagination (Teilumsetzung, erledigt)

Neue Datei: `src/components/b2b/admin/ClientPagination.tsx`

- Hook `usePagedList(items, pageSize)` → liefert `paged`, `page`, `setPage`,
  `totalPages`, `pageSize`, `total`. Resettet automatisch auf Seite 1, wenn
  sich die Länge der Eingabe (z. B. durch Filter im Parent) ändert.
- Komponente `PaginationBar` → blendet sich nur ein, wenn `total > pageSize`.
  Mobil-tauglich (Stack auf Mobile, Inline auf Desktop), Range-Anzeige
  „X–Y von Z".

Angewandt auf die zwei datenintensivsten Admin-Tabs:

- **`AdminInvoicesTab.tsx`** — 25 Rechnungen pro Seite. Sowohl Desktop-Table
  (Zeile ~354) als auch Mobile-Card-Liste (Zeile ~472) iterieren jetzt über
  `pagedInvoices`. PaginationBar direkt unter beiden Listen.
- **`AdminCustomersTab.tsx`** — 20 Kunden pro Seite. Iteration über
  `pagedProfiles` (basiert auf `filteredProfiles` → die bestehende
  Suche bleibt vorgeschaltet). PaginationBar am Ende der Liste.

Server-seitige Pagination (echte `range()`/Volltext-Suche, inklusive
Lieferscheine) bleibt für späteren Schritt offen — wäre ein Refactor des
Daten-Loadings im `AdminDashboard.tsx` und der Sub-Tabs.

## C4 — Mobile Burger-Menü (erledigt)

Datei: `src/components/b2b/B2BPortalLayout.tsx`

- Unterhalb `md` wird die horizontale Scroll-Leiste durch einen Burger-Button
  ersetzt, der den Label des aktiven Eintrags anzeigt.
- Klick öffnet ein `Sheet` (Drawer von links, 280px), das alle Nav-Items
  vertikal listet.
- Drawer schliesst sich automatisch bei Route-Wechsel
  (`useEffect` auf `location.pathname`).
- Desktop-Verhalten (`md+`) ist unverändert.

## Verifikation

- TypeScript-Check grün (Harness).
- Kunden-Login auf Mobil (393×697): Burger zeigt aktuelle Seite, Sheet
  öffnet sich mit allen 12 Einträgen, schliesst beim Navigieren.
- Admin: Rechnungs-Tab paginiert ab 26 Einträgen, Kunden-Tab ab 21.
- Keine DB-, Auth-, Edge-Function-Änderungen.

## Offen / Folgeschritte

- **C1+** Server-seitige Pagination und Volltextsuche (alle Admin-Tabs +
  Lieferscheine).
- **C2** Audit-Log-Tabelle + Trigger (eigene Migration).
- **C3** Resend-Webhook → `email_events` mit Statusanzeige im UI
  (Migration + Edge Function).
