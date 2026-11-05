# Nachträgliche Rabatte und sichere Erstattungen

## Ziel
Nachträgliche Mietrabatte werden im aktuellen Auftrag, in neuen Auftragsbestätigungen und Rechnungen korrekt berechnet und sichtbar ausgewiesen. Bereits ausgestellte Dokumente bleiben unverändert; für sie wird eine Rechnungskorrektur erstellt.

## Umsetzung
1. **Rabatte zuverlässig übernehmen:** Den Rabatt im AB- und Rechnungseditor ändern, speichern, wieder öffnen und mit der PDF-Vorschau vergleichen. Den festgestellten Unterschied bei bereits vereinbartem Überweisungsrabatt beheben: Dieser muss nach einer Preisänderung neu berechnet werden, statt mit seinem alten Eurobetrag stehen zu bleiben. Weitere Abweichungen nur nach reproduziertem Fehler korrigieren; Kundenkartei-Rabatte nicht ungefragt rückwirkend anwenden.
2. **Beträge getrennt darstellen:** Neuer Mietpreis, nachträglicher Rabatt, tatsächlich erhaltene Zahlungen, Rechnungskorrektur, Kaution, bereits erfolgte Erstattungen und verbleibende Nachzahlung beziehungsweise Erstattung werden getrennt ausgewiesen. Erhaltene Zahlungen werden durch einen Rabatt niemals verändert oder ein zweites Mal berücksichtigt.
3. **Erstattung und zusätzliche Auszahlung trennen:** Stripe erstattet höchstens das noch erstattbare Guthaben der ursprünglichen Zahlung. Ein darüber hinaus zugesagter Betrag wird als separate Überweisung erfasst, mit Grund und eigener Freigabe; eine Zusage oder Freigabe ist noch keine erfolgte Zahlung. Keine neue Bankanbindung: Die tatsächliche Überweisung erfolgt weiterhin außerhalb der App und wird mit Zahlungsnachweis bestätigt.
4. **Freigabe durch Benedikt oder Luca:** Übersteigt der gesamte beantragte Erstattungs-/Auszahlungsbetrag die ursprüngliche Stripe-Zahlung, ist eine ausdrückliche Freigabe durch einen dieser beiden berechtigten Mitarbeiter erforderlich. Betrag, Empfänger und Grund gehören zur Freigabe; Änderungen machen sie ungültig. Anfrage, Entscheidung und Auszahlung bleiben nachvollziehbar. Keine automatische Auszahlung.
5. **Prüfen und absichern:** Regressionstests für manuelle Rabattänderungen, Zurücksetzen auf null, Kombination mit 3-%-Überweisungsrabatt, Umsatzsteuer/Kaution und Dokumentübernahme. Zusätzlich Freigabesicherheit, doppelte Klicks, parallele Erstattungen, ausstehende Stripe-Erstattungen und Wiederholung nach Fehlern prüfen.

## Technische Details
- Bestehenden geschützten Auftragsänderungsweg und unveränderliche Beleg-/Zahlungssnapshots beibehalten.
- Gemeinsame Preis- und Saldenberechnung für Editor, Server und PDFs verwenden; Abschläge und Kautionsabrechnung gesondert berücksichtigen.
- Zusätzliche Auszahlungsanträge und Ereignisse mit geschützten Datenbankfunktionen, expliziten Zugriffsrechten und atomaren Zustandswechseln speichern. Bestehende Stripe-Erstattungsgrenzen nicht lockern.
- Die vorhandene Funktion `is_super_admin` erlaubt aktuell **allen Admins** Zugriff. Deshalb für diese finanzielle Freigabe eine separate geschützte Berechtigung für die verifizierten Konten von Benedikt/Luca verwenden, ohne andere Adminrechte zu ändern oder E-Mail-Listen als laufende Berechtigungsprüfung einzubauen.
- Den zusätzlichen Betrag nicht als gewöhnlichen Mietrabatt mit erfundener steuerlicher Behandlung darstellen: Mietpreisreduktion und zusätzliche Ausgleichszahlung getrennt dokumentieren.

## Ende-zu-Ende-Abnahme
Mit einem ausdrücklich markierten Mitarbeiter-Testauftrag: Rabatt ändern → speichern → erneut öffnen → AB-PDF → Rechnung beziehungsweise Rechnungskorrektur → Erstattungsantrag → unberechtigte Freigabe abweisen → berechtigte Freigabe → Zahlungsstatus erneut lesen.

Die bisher verfügbare Anmeldung hatte keinen Mitarbeiterzugriff. Falls das weiterhin gilt, ist die echte Mitarbeiter-Abnahme blockiert und wird nicht als bestanden gemeldet. Echte Kundenaufträge, Kundenmails und Geldbewegungen werden für Tests nicht ohne gesonderte Freigabe ausgelöst; Stripe-Ausführung wird zunächst mit isolierten Testfällen geprüft.