# Bestände automatisch pflegen: Transfers, Schäden, Reparaturen

## Ziel

1. Material, das in der Dispo zwischen Krefeld, Bonn und Mülheim bewegt wird, verändert automatisch die Bestandsmengen der Standorte.
2. Schäden aus Übergabe- und Rücknahmeprotokollen landen automatisch in der Schadensübersicht im Backend und können dort als repariert markiert oder gelöscht werden.
3. Beim Erfassen wählst du je Schaden aus, was passieren soll: Reparatur nötig (Aufgabe wird angelegt), Bestand reduzieren (z. B. Glasbruch) oder nur dokumentieren (z. B. Kratzer am Bagger).

## 1. Standort-Transfers buchen Bestand um

- In der Dispo wird der Artikel künftig fest mit dem Katalogartikel verknüpft (freier Text bleibt möglich, bucht dann aber keinen Bestand um – mit sichtbarem Hinweis).
- Sobald ein Transfer auf **erledigt** gesetzt wird: Menge am Abgangsstandort abziehen, am Zielstandort hinzurechnen.
- Wird „erledigt" zurückgenommen oder der Transfer gelöscht, wird die Umbuchung automatisch rückgängig gemacht.
- Jede Buchung wird protokolliert, sodass in der Dispo sichtbar ist: „Bestand umgebucht: Krefeld −3, Bonn +3".
- Wenn am Abgangsstandort kein oder zu wenig Bestand gepflegt ist, erscheint eine Warnung; die Buchung setzt den Bestand nie unter 0.

## 2. Schadensübersicht im Backend

- Neue zentrale Schadensliste (erweitert die bestehende Übersicht) mit: Artikel, Standort, Kategorie, Beschreibung, Fotos, Datum, Kunde/Protokoll, Status.
- Status: **offen**, **in Reparatur**, **repariert**. Schäden lassen sich als repariert markieren oder ganz löschen (z. B. Fehleintrag).
- Filter nach Standort, Artikel, Status und Zeitraum; Fotos direkt aufrufbar.
- Schäden können dort auch ohne Protokoll manuell angelegt werden (z. B. Werkstattfund).

## 3. Einstufung beim Erfassen

Im Schadensschritt der Übergabe-/Rücknahmemaske und in der Schadensübersicht gibt es je Schaden zwei Schalter:

- **Reparatur nötig** → es wird automatisch eine Aufgabe in der Reparaturliste des jeweiligen Standorts angelegt („Reparaturen Krefeld" usw., wird bei Bedarf automatisch erstellt). Aufgabe enthält Artikel, Schadensbeschreibung und Link zum Protokoll.
- **Bestand reduzieren** → die Bestandsmenge des Artikels am Standort sinkt sofort um die betroffene Stückzahl. Wird der Schaden als repariert markiert (oder gelöscht), wird die Menge wieder zurückgebucht.

Beide Schalter sind unabhängig: Glasbruch = nur Bestand reduzieren, Kratzer am Bagger = keins von beidem, defekte Hydraulik = Reparatur ohne Bestandsabzug.

Wird die Reparatur-Aufgabe abgehakt, wird der Schaden automatisch auf „repariert" gesetzt (und ein eventueller Bestandsabzug zurückgebucht).

## Technische Umsetzung

- Migration: `staff_material_transfers` um `product_slug` und `stock_applied` erweitern; Datenbankfunktion `apply_material_transfer_stock(transfer_id, apply boolean)` bucht `b2b_managed_products.quantities` atomar um, Trigger reagiert auf Statuswechsel und Löschung.
- Migration: neue Tabelle `b2b_inventory_damages` (product_slug, product_name, location, category, description, photo_urls, quantity, needs_repair, reduces_stock, status, todo_item_id, source protocol-/damage-Referenz, resolved_at) inkl. GRANTs und RLS (Staff lesen/schreiben, Admin verwalten); Bestandsabzug über Funktion `apply_damage_stock(damage_id, apply)`.
- Trigger/Funktion `ensure_repair_todo(damage_id)`: legt bei `needs_repair` eine Liste `Reparaturen <Standort>` an, falls nicht vorhanden, und erzeugt ein `staff_todo_items`-Item; beim Abhaken wird der Schaden aufgelöst.
- Edge Functions `generate-delivery-note` und `generate-return-protocol`: Schäden zusätzlich mit Standort, Artikel-Slug und den beiden Schaltern in `b2b_inventory_damages` spiegeln.
- Frontend: `MaterialDispoTab` (Slug-Verknüpfung + Buchungshinweis), `DamagesStep` (Schalter je Schaden), `AdminDamageOverview` (neue Liste inkl. Statuswechsel, Löschen, manuelles Anlegen), Hook für Schadensdaten.
- Tests: Einheitentests für Buchungslogik (Transfer hin/zurück, Bestand nie negativ, Schadensabzug + Rückbuchung) plus Portal-Durchlauf Rücknahme mit Schaden → Aufgabe → Reparatur → Bestand.
