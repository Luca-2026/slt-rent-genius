# Verfügbarkeitskalender & Tagesübersicht für Geräte

## Ziel
Ein neuer Menüpunkt „Kalender" im B2B-Portal mit zwei Ansichten:

1. **Tages-/Wochenübersicht** – Was muss wann raus, was kommt wann zurück:
   - Wochenansicht (Mo–So), vor/zurück blättern, „Heute"-Knopf
   - Je Tag zwei Blöcke: **Übergaben** (Mietbeginn) und **Rückgaben** (Mietende)
   - Je Eintrag: Uhrzeit, Gerät/Artikel, Kunde, Auftrags-ID (#CODE), Standort, Status (Protokoll unterschrieben?)
   - Klick auf einen Eintrag öffnet die Mietanfrage
   - Standortfilter (Krefeld / Bonn / Mülheim), Standard = Standort des Mitarbeiters

2. **Verfügbarkeitsliste** – je Gerät auf einen Blick:
   - Tabelle aller Einzelgeräte: Inventarnummer, Artikel, Standort, Status
   - Aktuelle/nächste Belegung mit Zeitraum und Auftrags-ID
   - Filter: Standort, Status, Artikel-Suche
   - Zeitraum-Wahl (Von–Bis) zeigt, welche Geräte in dem Zeitraum frei sind (über die vorhandene DB-Funktion `slt_free_instances`)

## Datenquellen (alle vorhanden, keine neue Tabelle)
- `b2b_instance_allocations` (Geräte-Belegungen mit Zeitraum)
- `rental_inquiries` (Mietbeginn/-ende, Kunde, Auftrags-ID, Status)
- `b2b_delivery_notes` / `b2b_return_protocols` (Übergabe/Rückgabe unterschrieben?)
- `b2b_product_instances` (Gerätestammdaten)

## Dateien
- Neu: `src/pages/b2b/AvailabilityCalendar.tsx` (Wochenübersicht + Verfügbarkeitsliste als Tabs)
- Neu: `src/components/b2b/calendar/WeekGrid.tsx`, `DayEntryCard.tsx`, `InstanceAvailabilityTable.tsx`
- Neu: `src/lib/calendarEntries.ts` – baut aus Anfragen/Belegungen die Tageseinträge (reine Funktion, getestet)
- Neu: `src/test/calendarEntries.test.ts`
- Geändert: `App.tsx` (Route `/b2b/kalender`), Portal-Menü (Punkt „Kalender")
- `AGENTS.md`: Regel „Kalender liest nur – Belegungen weiterhin nur über confirm_order"

## Bewusst nicht dabei
Kein Drag & Drop, keine Umbuchung im Kalender (Belegungen bleiben Aufgabe der Auftragsbestätigung), keine Änderung an Website/Preisen.
