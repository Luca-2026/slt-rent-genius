# Paket 1B.2 – Finanzprozesse und Standortberechtigungen

## Entscheidung
**Preview: GO für weitere isolierte Abnahme. Produktion: NO-GO**, bis (a) Migration `drizzle/prepared/0213_finance_location_scope_and_manual_cancel_refund.sql` freigegeben und angewendet, (b) `offer-payment-admin` danach freigegeben deployt und (c) eine authentifizierte Abnahme mit echter Mitarbeiterrolle erfolgt ist. Nichts veröffentlicht, keine Edge Function deployt, keine Migration produktiv angewendet, keine Rechte vergeben, keine Zahlung/Erstattung/Mail ausgelöst. Produktivdaten nur lesend abgefragt (Rollenzählung, Funktionsdefinitionen).

## Rollen-/Standortmatrix (Quelle: user_roles, staff_profiles, SQL-Funktionen)
| Rolle | Lesen/Ausführen Kaution | Miet-/Gutschrifterstattung | Standort |
|---|---|---|---|
| admin (= is_super_admin) | ja | ja | alle (einzige explizite standortübergreifende Berechtigung) |
| niederlassungsleiter | ja | ja | nur aktive Profilstandorte |
| standort_mitarbeiter | ja | nein | nur aktive Profilstandorte |
| ohne can_edit_operations | nein | nein | – |
Mehrere aktive Profile werden alle berücksichtigt. Normalisierung wie `slt_normalize_location`: **Mülheim ist getrennt von Krefeld** (wie bisherige SQL-Regel in reserve/confirm/Stornierung). Produktiv lesend festgestellt: 3 Admins, 1 Niederlassungsleitung, 2 Standortmitarbeiter, davon **1 aktiver Standortmitarbeiter ohne Standort** – dieser verliert nach Deploy die bisher (ungebundene) Kautionserstattung, bis ein Admin den Standort zuordnet. Fachliche Entscheidung nötig: Sollen Krefeld-Mitarbeiter Mülheim-Aufträge erstatten dürfen (gemeinsame Kasse)? Derzeit nein, wie in der bestehenden SQL-Regel.

## Befunde und Änderungen
1. **Ältere Erstattungswege ohne Standortbindung** (`refund_deposit`, `sync_deposit_refunds`, `credit_refund_info/refund_credit_note`, `rental_credit_*`, `order_credit_*`). Neu `supabase/functions/_shared/finance-scope.ts`; Standort aus Auftrag/Beleg/Zahlungslink, nie aus Request; widersprüchlicher Beleg-/Auftragsstandort = nicht eindeutig → nur Admin. Prüfung vor jedem Lesen, Reservieren oder Provideraufruf (403 mit verständlicher Meldung).
2. **order-refund.ts fasste Krefeld+Mülheim zusammen** (weiter als SQL): jetzt gleiche Regel wie SQL.
3. **settle_deposit / mark_deposit_payout_done** prüften nur Operationsrecht: in 0213 (vorbereitet) zusätzlich `can_manage_rental_finance`.
4. **Storno Bar/Bank**: Datenmodell existierte (order_refund_requests, reserve_order_refund mit Methodenprüfung, Obergrenze order_refund_totals, Unique-Index „ein offener Auftrag“), war aber live komplett gesperrt. Jetzt nur für **stornierte Aufträge ohne Online-Zahlung mit einheitlich Bar oder einheitlich Bank, nur Kaution** live freigegeben: Rückzahlung wird als ausstehend angelegt, keine Provider-/Mailaktion. Bestätigung über `confirm_manual_order_refund` (0213): Belegreferenz 3–200 Zeichen, tatsächliches Datum (nicht Zukunft, nicht vor Auftrag), Bearbeiter serverseitig, idempotent bei gleichem Nachweis, Konflikt bei abweichendem, Ereignis im Auftragsverlauf. Mischzahlung, Mietanteil und Stripe bleiben gesperrt bzw. auf bisherigem Weg. Ohne angewendete Migration schlägt die Bestätigung sicher fehl („Datenbankfreigabe ausstehend“), es wird nichts bestätigt.
5. UI `OrderRefundOverview.tsx`: Dialogtext/Knopf für ausstehende Rückzahlung, Mietfeld gesperrt, keine Stornorechnungs-Vorbereitung bei reiner Kaution, Bestätigung mit Datum + Belegreferenz; normaler Kautionseditor bleibt im Storno ausgeblendet.

## Tests (tatsächliche Ausgaben)
```text
Baseline df77ac37: Test Files 227 passed (227) | Tests 1666 passed (1666)
Nachher:           Test Files 230 passed (230) | Tests 1695 passed (1695)
Browser:           PASS 42 checks; no real writes, no mail/payments; page errors []
Build (bun run build inkl. Export/Prerender/404/htaccess/Legacy): exit 0, sitemap 1129 <loc>
Typecheck App: ok. deno check offer-payment-admin: 11 Fehler, identisch zur Baseline (vorbestehend); neue Shared-Dateien fehlerfrei.
```
Neu: `tests/financeScopeRefund.test.ts` (13), `src/test/manualCancelRefundDb.test.ts` (6, PGlite mit 0213), `src/test/manualCancelRefundUI.test.tsx` (4), 5 Handler-Tests in `customerEmailHandlers.test.ts`. Abgedeckt: fremder Standort, fehlendes Operationsrecht, Entzug vor Bestätigung, manipulierter Standortparameter, Direktaufruf als authenticated, Mehrfachstandort, ohne Standort, Admin zentral, Bar/Bank, ohne erhaltene Kaution, Teil/Voll/bereits erstattet, Überbetrag, Misch, Stripe nie manuell, fehlender Beleg/Datum, Zukunftsdatum, RPC-Fehler, Doppelklick, Retry/verlorenes Ergebnis, kein Provider/Netz vor Autorisierung. Phasen-Tests (alle sieben Phasen) aus 1B.1 laufen unverändert grün.

## Nicht getestet
Echte Anmeldung/Rollen im Browser, angewendete Migration auf echter DB, deployte Function, Stripe-/Rentware-Sandbox, Kassenbuch-/DATEV-Auswirkung einer manuellen Kautionsrückzahlung (cash_journal wird vom Storno-Weg nicht berührt – fachlich zu prüfen), Stornogebühr nur über bestehende Totals-Regel (unverändert).

## Freigaben / Rollout
1. Migration 0213 prüfen und anwenden. 2. `offer-payment-admin` deployen (Reihenfolge: erst Migration). 3. Standort für den Mitarbeiter ohne Standort zuordnen. 4. Authentifizierte Abnahme Bonn/Krefeld/Mülheim.
Rollback: Function-Code auf df77ac37; 0213 rückgängig nur durch Wiederherstellen der vorherigen Funktionsdefinitionen (0162/0198/0190/0191), Spalte paid_out_on kann bleiben. Andere Arbeitspakete unberührt.
