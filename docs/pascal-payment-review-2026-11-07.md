# Pascal Braun – Zahlungsprüfung 07.11.2026

## Tatsächliche Buchung
- Auftrag #9DFW9V, eingetragen von Benedikt: 133,47 € Banküberweisung.
- Reguläre Miete: 34,51 € brutto. Vereinbarter Rabatt: 0,87 € netto / 1,04 € brutto.
- Rabattierte Miete: 33,47 €, Kaution: 100 €. Gesamtsoll: 133,47 €.
- Kein zusätzliches Mietguthaben: der Rabatt ist bereits im bezahlten Soll enthalten. Eine weitere Erstattung von 1,04 € würde ihn doppelt gewähren. Bankkontoeingang selbst ist nicht unabhängig einsehbar; maßgeblich ist der gespeicherte Zahlungseingang.

## Fehler und Korrektur
Die Angebotsüberarbeitung entfernte den Bankrabatt für PDF und Zahlungslink und setzte die Zahlungswahl auf regulär. Die spätere Buchungsnormalisierung stellte die reduzierte Auftragssumme wieder her; der gespeicherte Link zeigte weiter 104 Cent angeblich fehlende Kaution. Kein Stripe-Zahlungseingang ist vorhanden.

Neue Überarbeitungen erhalten die gespeicherte Bankwahl bei reinen Bankzahlungen und berechnen PDF, Auftragssumme und Zahlungslink mit demselben Rabatt. Die Mitarbeiteranzeige richtet sich bei vollständig bankbezahlten Vorgängen nach dem aktuellen Saldo, nicht nach einem historischen Link. Checkout bei vollständig bankbezahltem Auftrag ist vor jedem Zahlungsartwechsel gesperrt. Historische Dokumente und Linkdaten bleiben erhalten.

## Nachweise
- Authentifizierte Mitarbeiteransicht zeigt „Vollständig per Überweisung bezahlt – keine Online-Zahlung offen“.
- Echte Rechnungsvorschau ohne Nummerierung/Schreiben/Versand: −0,87 € netto Rabatt, 33,47 € Rechnungsbetrag, 33,47 € Bankzahlung auf Miete, 0 € offen, 100 € Kaution separat.
- 13 fokussierte Tests bestanden, Vorschau-Build OK.
- send-inquiry-offer und offer-pay eingespielt; Website nicht veröffentlicht.
- Keine echte Auszahlung, Kundenmail, Rechnungserstellung oder gespeicherte Entwurfsänderung. Noch keine ausgestellte Rechnung/Kautionsabrechnung für diesen Auftrag gefunden. Eine tatsächliche Bankerstattung wurde deshalb nicht durchgeführt oder als abgeschlossen getestet.