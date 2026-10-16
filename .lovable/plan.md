# Kautionsabrechnung je Mietauftrag

## Ziel
Nach der Rückgabe sieht der Sachbearbeiter auf einen Blick: wie viel Kaution vorliegt, welche Kosten abgezogen werden, und ob der Kunde Geld zurückbekommt oder nachzahlen muss. Ein Klick erledigt die Abrechnung.

## Regeln
- Jede Zahlung zählt zuerst auf die Miete. Erst was darüber hinausgeht, ist Kaution.
  - Beispiel Janko Samuel (#GNSC9U): 500 € bar, davon 230,86 € Miete (damit bezahlt) und 269,14 € Kaution.
- Nach der Rückgabe werden die Kosten aus dem Rückgabeprotokoll automatisch vorgeschlagen und mit der Kaution verrechnet: Nachtanken, Reinigung (20 € netto je 15 Min), Schäden und sonstige Zusatzkosten.
- Der Sachbearbeiter kann weitere Abzüge mit Grund ergänzen oder einen vorgeschlagenen Abzug mit Grund entfernen.
- Ergebnis:
  - Rest größer als 0: Erstattung an den Kunden
  - Rest kleiner als 0: Nachzahlung, die als offener Betrag mit Zahlungslink und QR-Code angezeigt wird
- Alle Mitarbeiter am Standort dürfen abrechnen. Erstattungen über Stripe bleiben bei Admin und Niederlassungsleitung, gehen nie über den gezahlten Betrag hinaus und immer auf die ursprüngliche Zahlungsart.
- Die Kaution ist kein Umsatz. Umsatz sind nur Miete und die abgezogenen Kosten.

## Was der Sachbearbeiter sieht
Eine neue Karte „Kautionsabrechnung“ in der Mietanfrage, rechts im Dokumentbereich neben „Auftragsbestätigung erstellen“:

```text
Gezahlt gesamt                      500,00 €
 davon Miete                       −230,86 €
 = Kaution vorhanden                269,14 €
Abzüge aus Rückgabeprotokoll
 Reinigung 15 Min                   −23,80 €
 Nachtanken 4 l                      −x,xx €
[+ Abzug hinzufügen]
--------------------------------------------
Erstattung an Kunden                245,34 €
Auszahlung über: (Bar / Überweisung / Stripe)
[Abrechnen]
```

## Was „Abrechnen“ erledigt
1. Erstellt die Rechnung über die abgezogenen Kosten mit der normalen Rechnungsnummer und der Auftrags-ID. Sie gilt als bezahlt durch „Kaution verrechnet“.
2. Erfasst die Erstattung je nach Auszahlungsweg:
   - Bar oder Überweisung: wird mit Datum und Namen eingetragen
   - Stripe: wird zur Freigabe durch Admin oder Niederlassungsleitung vorgemerkt
3. Schickt dem Kunden eine E-Mail mit der Abrechnung als PDF und der Auftrags-ID im Betreff, in Du- oder Sie-Form je nach Kundenakte.
4. Jeder Schritt wird protokolliert. Danach ist die Abrechnung gesperrt. Korrekturen gehen nur noch über eine Gutschrift (GoBD).

## Startseite
Rückgaben mit Protokoll, aber noch ohne Abrechnung erscheinen als Hinweis „Kaution abrechnen“, gefiltert nach Standort.

## Nicht enthalten
- Bereits versendete Rechnungen und Protokolle bleiben unverändert.
- Keine Testversände an echte Kunden, nur an luca@sandhoff.org.

## Technische Details
- Rechenregel als getestete Funktion `src/lib/depositSettlement.ts` (Spiegel in `_shared/deposit-settlement.ts`): Aufteilung Miete/Kaution, Abzüge aus `b2b_return_extra_charges` + `damages_total` des Rückgabeprotokolls (`rental_inquiry_id`), Ergebnis Erstattung/Nachzahlung, auf den Cent gerundet. Tests: Zahlung zuerst auf Miete, Reinigung 23,80 € je 15 Min, Erstattung nie negativ ausgezahlt, Nachzahlung bei Fehlbetrag.
- Neue Tabelle `deposit_settlements` (inquiry_id unique, Beträge, Abzüge jsonb, Auszahlungsweg, Status draft/settled, Erfasser serverseitig) mit GRANT + RLS über `can_edit_operations`. Unveränderlich nach Status settled (Trigger).
- SECURITY-DEFINER-Funktion `settle_deposit(_inquiry_id, _deductions, _payout_method)` prüft Berechtigung, rechnet serverseitig neu (409 bei Abweichung zum Client), setzt Extra-Charges auf billed, schreibt `rental_inquiry_events`.
- Edge Function `settle-deposit`: erzeugt Rechnung über den bestehenden Rechnungskreis (Miete) und das Abrechnungs-PDF, versendet mit `codedSubject` und `_shared/salutation.ts`. Stripe-Erstattung über das bestehende `offer-payment-admin` (Rollenprüfung unverändert).
- Umsatz: `countsAsRevenue` zählt Kaution nicht; die Abzugsrechnung zählt normal.
