# Paket: Geräte-Belegung, Verfügbarkeit und Transporte

Vorab: Im System sind heute 0 Einzelgeräte angelegt. Absage nutzt den bestehenden Status „Abgelehnt“.

## Ablauf
1. Snapshot der betroffenen Tabellen (Anfragen, Einzelgeräte, Mietartikel-Bestände) als CSV in deinen Dateien.
2. Platzhalter-Geräte: Vorschlagsliste je Artikel und Standort (Anzahl laut CMS-Bestand, Inventarnummer z. B. `KR-MINIBAGGER-6T-01`, ohne Seriennummer) als Bericht. Angelegt wird erst nach deiner Freigabe.
3. Datenbank und Oberfläche bauen (unten).
4. Altaufträge: Trockenlauf mit vollständiger Ergebnisliste, echter Lauf erst nach deiner Freigabe.
5. Prüfung der „Fertig, wenn“-Punkte mit Testaufträgen (Testkunde Luca Sandhoff); die Testdaten werden danach wieder entfernt.

## Migrationen (eine Migration)
- Erweiterung `btree_gist`
- Tabelle `b2b_instance_allocations` mit Index (instance_id, from_at, to_at) und Exclusion-Constraint gegen überschneidende Zeiträume je Gerät; Rechte: lesen für Mitarbeiter, schreiben nur über die Funktionen
- Tabelle `b2b_transport_orders` (Status open/done/cancelled); lesen und „Erledigt“ setzen per can_edit_operations
- Tabelle `rental_inquiry_events` (inquiry_id, event, details jsonb, user_id, created_at): Protokoll aller Entscheidungen
- Spalte `rental_inquiries.availability_pending boolean DEFAULT false`
- Funktionen (SECURITY DEFINER):
  - `check_availability(inquiry_id) → jsonb`: je Position freie Geräte am Standort und je anderem Standort; Fallback CMS-Stückzahl mit `source = "quantities"`
  - `confirm_order(inquiry_id, decisions jsonb)`: alles in einer Transaktion (Belegungen, bei „order_from“ Transportauftrag + Gerätestandort umsetzen + optional Position „Überführung [Gerät]“, Ereignisprotokoll); Rücksprache setzt `availability_pending`, Absage setzt „Abgelehnt“
  - `backfill_allocations(dry_run boolean) → jsonb`: nur Admin, nur bestätigte Aufträge mit Mietende ab heute, ändert keine Standorte und legt keine Transporte an
  - Rechte: can_edit_operations, außer Backfill (nur Admin)

## Dateien
- Neu: `src/pages/b2b/TransportOrders.tsx`: Liste, Filter Status/Standort, Knopf „Erledigt“
- Neu: `src/components/b2b/inquiries/AvailabilityDecisionDialog.tsx`: Warnung je Position mit „Von [Standort] ordern“ (Überführungskosten, „in Auftrag einpreisen“), „Rücksprache mit Kunde“, „Absagen“
- Neu: `src/lib/rentalPeriod.ts`: Format „Mo, 20.10.2026, 08:00“, Zeitraum aus Anfrage bzw. abweichenden Positionsdaten (mit Test)
- Neu: `src/test/rentalPeriod.test.ts`, `src/test/availabilityDecisions.test.ts`
- Geändert: `OrderConfirmationCard.tsx` (vor dem Versand Prüfung → ggf. Dialog → `confirm_order` → danach wie heute die Auftragsbestätigungs-E-Mail)
- Geändert: `RentalInquiries.tsx` und `RentalInquiryDetail.tsx` (Mietbeginn/-ende mit Wochentag und Uhrzeit, Badge „Verfügbarkeit klären“)
- Geändert: `App.tsx` und Portal-Menü (Menüpunkt „Transporte“)
- Geändert: `supabase/functions/send-order-confirmation/index.ts`: nur noch ein kleiner Schutz, damit die Bestätigung bei bereits gesetzter Belegung nicht doppelt bucht; der Text bleibt unverändert
- `AGENTS.md`: Regel „Belegung nur über confirm_order; Doppelbelegung verhindert die Datenbank“

## Nicht angefasst
Angebots-Editor, Preise, PDFs, Website, Übergabeprotokolle, Rentware. Bereits bestätigte Aufträge bleiben gültig; ein Rücktransport wird nicht automatisch angelegt.
