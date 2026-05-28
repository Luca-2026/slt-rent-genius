# B2B-Portal Refactor — Phase B (Sichtbarkeit & Übersicht)

Stand: 2026-05-28

## Sicherheitsprämisse (unverändert zu Phase A)

- Keine Auth-Änderungen, keine DB-Migrationen, keine Datenbewegung.
- Reine Frontend-Erweiterungen (zusätzliche Read-Queries via bestehender RLS).
- Bestandskunden, Reservierungen, Rechnungen unangetastet.

## B1 — Kunden-Dashboard KPI-Kacheln + Nächste Schritte (erledigt)

Neue Datei: `src/components/b2b/dashboard/DashboardKpis.tsx`

Wird in `src/pages/b2b/Dashboard.tsx` direkt unter dem Standort-/Status-Block und
über der bestehenden Tile-Grid eingehängt (nur für `status === 'approved'`).

4 KPI-Kacheln (2×2 mobil, 4er-Reihe ab `lg`):

1. **Aktive Mieten** — `b2b_reservations` mit `status = confirmed` und
   `start_date <= today <= end_date`. Verlinkt auf Mietvorgänge.
2. **Rückgaben in 7 Tagen** — `b2b_reservations` mit `status = confirmed` und
   `end_date` zwischen heute und heute+7. Verlinkt auf Mietvorgänge.
3. **Offene Rechnungen** — Summe `gross_amount` für Rechnungen mit
   `status in ('open','overdue')`. Bei Überfälligkeit Accent in Destructive.
4. **Freies Kreditlimit** — `credit_limit - used_credit` direkt aus dem
   bereits geladenen Profil (kein zusätzlicher Request).

Darunter Block **„Nächste Schritte"** — wird nur gerendert, wenn mindestens eine
Aktion ansteht:

- N Angebote zu prüfen (`b2b_offers.status = sent`)
- N Übergabeprotokolle zu unterschreiben (`status = pending_customer_signature`)
- N Rückgabeprotokolle zu unterschreiben
- N überfällige Rechnungen (`status = overdue`, Destructive-Variante)

Jede Zeile ist ein Link in den passenden Portal-Bereich. RLS sorgt dafür, dass
nur Daten des eigenen Profils gezählt werden — keine zusätzliche Server-Logik.

## B2 — Admin-Dashboard Übersichts-KPIs (erledigt)

Datei: `src/components/b2b/admin/AdminStatsOverview.tsx` (Props-Signatur ersetzt)

Statt der bisherigen Allzeit-Zähler (Kunden gesamt, Anfragen gesamt, Rechnungen
gesamt, Allzeit-Umsatz) jetzt vier handlungsrelevante KPIs:

1. **Umsatz Monat** — Summe `gross_amount` bezahlter Rechnungen, deren
   `invoice_date` im laufenden Kalendermonat liegt.
2. **Offene Forderungen** — Summe `gross_amount` aller Rechnungen mit
   `status in ('open','overdue')`. Sub-Zeile zeigt Anzahl überfällig vs. offen,
   Accent in Destructive bei Überfälligkeit.
3. **Mieten in Pipeline** — Anzahl Reservierungen mit `status = confirmed` und
   `end_date >= today`. Sub-Zeile zeigt unbearbeitete Anfragen.
4. **Neue Registrierungen** — Profile mit `created_at` in den letzten 30 Tagen.
   Sub-Zeile hebt ausstehende Freischaltungen hervor.

Berechnung in `AdminDashboard.tsx` direkt aus bereits geladenen Arrays
(`profiles`, `invoices`, `reservations`) — keine zusätzliche Round-Trip-Last.

## B3 — Globale Admin-Suche (erledigt)

Neue Datei: `src/components/b2b/admin/AdminGlobalSearch.tsx`

Wird in `AdminDashboard.tsx` direkt unter den KPI-Kacheln über den Quick-Action-
Buttons eingebunden. Client-seitige Fuzzy-Suche auf den bereits geladenen
Datensätzen:

- **Kunden** — `company_name`, `contact_first_name + last_name`, `tax_id`
- **Rechnungen** — `invoice_number`, `customer_company`
- **Angebote** — `offer_number`
- **Anfragen/Reservierungen** — `product_name`, ID-Prefix

Treffer-Liste (max. 12) als Popover unter dem Input. Klick setzt
`?tab=<bereich>` über `useSearchParams` (kompatibel zur Phase-A1-Tab-Sync),
damit die richtige Tab-Ansicht aktiv wird. Schwellwert: ab 2 Zeichen.

Bewusst kein zusätzlicher Supabase-Call — die Suche nutzt ausschließlich Daten,
die der Admin-Dashboard ohnehin lädt. Lieferscheine bleiben für später (werden
erst in `AdminDeliveryNotesTab` nachgeladen) und kommen mit C1
(Server-Pagination/Suche) als Volltext-Suche dazu.

## Verifikation

- TypeScript-Check grün (Harness).
- Kunden-Login: Dashboard zeigt 4 KPI-Kacheln + Next-Steps-Block (nur falls
  Aktionen anstehen).
- Admin-Login: KPIs spiegeln Monatsumsatz, Pipeline und 30-Tage-Registrierungen
  wider; Such-Input findet Kunden/Rechnungen/Angebote/Anfragen und springt
  in den korrekten Tab.
- Keine Edge-Function-, DB- oder Auth-Änderungen.

## Offen / Folgephasen

- **C1** Server-seitige Pagination + Suche für alle Admin-Tabs (Volltext, auch
  Lieferscheine).
- **C2** Audit-Log-Tabelle + Trigger.
- **C3** Resend-Webhook → `email_events` mit Status im UI.
- **C4** Mobile-Burger-Menü statt horizontaler Scroll-Leiste.
