# Aufträge übersichtlich und Erstattungen eindeutig abwickeln

## Belegter Stand bei #UHSMCV

Die getrennten Schaltflächen und verstreuten Zahlungsanzeigen sind tatsächlich missverständlich. Die Prüfung direkt bei Stripe zeigt aber **keine doppelte Mieterstattung**:

- Benedikt: Storno am 14.11.2026 um 13:55 Uhr Berlin, individuelle Stornogebühr 0 €, Grund „Anhänger nicht bereit“.
- Benedikt: **29,75 € Mieterstattung** am 14.11. um 14:36 Uhr, erfolgreich.
- Luca: **100 € Kautionserstattung** am 15.11. um 11:19 Uhr, erfolgreich.
- Insgesamt **129,75 € erstattet**, entsprechend der ursprünglichen Zahlung. Rest: **0 €**. Stripe liefert genau diese beiden Erstattungen, keine weiteren.
- Keine Rechnung zum Auftrag gespeichert.

„Auftrag stornieren / abrechnen“ bleibt trotz Storno sichtbar. Nach dem Öffnen wird der gespeicherte Storno geladen; eine erneute verbindliche Stornierung wird dann nicht angeboten. Auch die gespeicherte Stornofunktion führt den Storno nicht doppelt aus. Die Beschriftung und der kurzzeitig noch ungeladene Zustand sind dennoch irreführend.

## 1. Eindeutige Auftragsübersicht ganz oben

Direkt neben Auftrags-ID und Status zeigen:

- Erhaltene Zahlung, verbleibende Forderung, bereits erstattete Kaution und Miete, noch auszuzahlender Betrag.
- „Storniert am … durch …“ mit Grund und festgelegter Stornogebühr.
- Eine sichtbare chronologische Historie: Mitarbeiter, Zeitpunkt, Aktion, Betrag, Zahlungsweg und Ergebnis. Zahlung, Erstattungsauftrag und bestätigte Auszahlung bleiben unterscheidbar.
- Historische Aktionen ohne belegten Erfasser ausdrücklich als unbekannt kennzeichnen; keine Namen aus der aktuellen Zuständigkeit ableiten.

Bei #UHSMCV steht unmittelbar sichtbar: **Vollständig erstattet · 129,75 € · offen 0 €**.

## 2. Storno und weitere Abrechnung klar trennen

- „Auftrag stornieren“ nur bei noch nicht stornierten Aufträgen.
- Nach Storno ausschließlich „Stornoabrechnung ansehen“; keine erneute Gebührenerfassung oder Bestätigung.
- Während der Stornostand geladen wird, keine ausführbare Stornoaktion.
- Unpassende Aktionen wie neue Angebote, Zahlungslinks und Rückgabeerinnerungen bei stornierten Aufträgen ausblenden; Dokumente und zulässige Abrechnung bleiben zugänglich.
- Rechnungserstellung und berechtigte Erstattung bleiben unabhängig von der Auftragsphase möglich, aber nicht unabhängig von Zahlungs- und Belegschutz.

## 3. Eine gemeinsame Aktion „Erstattung“

Die parallelen Einstiegspunkte für Stripe-Kaution, Mietguthaben und Stornoerstattung führen künftig in dieselbe Übersicht, statt getrennte Auszahlungen zu suggerieren.

Vor Bestätigung erscheinen getrennt:

1. Noch erstattbare Kaution.
2. Noch erstattbares Mietguthaben nach Stornogebühr beziehungsweise vereinbarter Korrektur.
3. Bereits erfolgte und noch laufende Rückzahlungen.
4. Ausgewählter Gesamtbetrag und ursprüngliches Zahlungsmittel.

Kaution und Mietguthaben können zusammen oder anteilig mit **einer Mitarbeiterbestätigung** beauftragt werden. Teilbeträge werden getrennt dokumentiert; der verbleibende Anspruch bleibt sichtbar. Es entsteht kein zusätzlicher Rabatt durch die Betragsauswahl.

Bei vollständig erstatteten Aufträgen gibt es keine neue Auszahlungsaktion. Bei ungeklärter Auszahlung nur „Status prüfen“, niemals eine zweite Auszahlung als Ausweichweg.

## 4. Schutz gegen doppelte Auszahlung

- Nicht nur die ursprüngliche Gesamtzahlung schützen, sondern zusätzlich den verbleibenden Kautions- und Mietanspruch jeweils separat.
- Bereits reservierte, laufende und erfolgreiche Erstattungen aus allen vorhandenen Wegen gemeinsam berücksichtigen; Stripe-Belege nicht nochmals als separate Auszahlung zählen.
- Eine gemeinsame, dauerhaft gespeicherte Erstattungsanforderung verhindert doppelte Aufträge durch Doppelklick, zwei Mitarbeiter oder Neuladen.
- Nach Zeitüberschreitung dieselbe Anforderung fortsetzen und Providerstatus prüfen.
- Alte Auszahlungswege müssen denselben Schutz nutzen; bloßes Ausblenden von Buttons genügt nicht.
- Rückzahlung nur auf den ursprünglichen Zahlungsweg. Bereits bestätigte Auszahlungen und Originalzahlungen werden nicht nachträglich verändert.

## 5. Rechnung und Nachweise

- Rechnung weist erhaltene Zahlung, Stornogebühr, Kaution und tatsächlich bestätigte Erstattungen getrennt aus.
- Keine eigene Mietguthaben-PDF; vorhandene Belege bleiben erhalten.
- Bestehende Rechnungen und Abschläge nicht durch eine zweite Forderung umgehen. Der gemeinsame Erstattungsdialog zeigt erforderliche Korrekturschritte und nutzt nur fachlich freigegebene Ansprüche.
- #UHSMCV wird nicht nochmals ausgezahlt oder automatisch fakturiert. Der bestehende Zahlungsstand wird nur korrekt angezeigt.

## Technische Umsetzung

- Gemeinsame serverseitig berechnete Erstattungsübersicht und reservierter Gesamtauftrag mit getrennten Teilansprüchen; vorhandene Zahlungs- und Erstattungsregister weiterverwenden, keine zweite Buchhaltung.
- Bestehende Vollbetrags-Mietansprüche vorsichtig um nachvollziehbare Teilanforderungen ergänzen; historische Ansprüche und Providerzuordnungen unverändert erhalten.
- Einheitliche Sperrreihenfolge, zentrale Standortrechte und stabile Wiederholungskennungen für alle Auszahlungswege.
- Eine einzelne Stripe-Zahlung möglichst mit einer zusammengefassten Rückzahlung bedienen; bei mehreren Originalzahlungen können mehrere Providertransaktionen erforderlich sein. Eine Mitarbeiterbestätigung ist dann **keine Garantie gleichzeitiger Providerabschlüsse**. Teilabschlüsse werden ausdrücklich angezeigt und sicher fortgesetzt.
- Historie aus vorhandenen Auftrags-, Zahlungs-, Dokument- und Erstattungsnachweisen zusammenführen; spätere Statusabgleiche ändern nicht den ursprünglichen Auszahlungszeitpunkt oder Erfasser.

## Prüfung und Freigabe

- Konkreter Regressionstest #UHSMCV: 29,75 € Miete und 100 € Kaution bereits erfolgreich → beide Restansprüche 0 €, keine weitere Auszahlung.
- Kaution und Miete zusammen, einzeln und teilweise; Stornogebühr und bezahlter Optionsaufpreis; keine Zahlung, Teilzahlung, verschiedene Zahlungswege, Rechnungs- und Vorrechnungsweg.
- Doppelklick, zwei Mitarbeiter gleichzeitig, Neuladen, verzögerte Providerbestätigung, fehlgeschlagener Teilbetrag und externe Erstattungen.
- Echter Mitarbeiterablauf: Übersicht → Vorschau → Bestätigung → Wiederöffnen → Historie und Rechnung. Neue Geldbewegungen ausschließlich in einer verifizierten isolierten Testumgebung; kein Kundengeld für Tests.
- Veröffentlichung erst nach dokumentierter Prüfung. Eine nicht verfügbare sichere Zahlungs-Testumgebung wird als Freigabeblocker genannt.