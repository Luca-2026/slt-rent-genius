# Manuelle Rückgabeerinnerungen – 09.11.2026

## Ergebnis und Freigabegrenze
Zwei manuelle Stufen im Mietvorgang unter den Dokument-/Protokollaktionen. Kein automatischer Erinnerungsversand. Backend eingespielt, Oberfläche nicht veröffentlicht. Vollständige Versand-/Postfachabnahme ausdrücklich **nicht abgeschlossen**: notify.slt-rental.de ist unbestätigt; der echte Stufe-1-Versand wurde vom Versanddienst mit `403 domain_not_verified` abgewiesen. Stufe 2 bleibt deshalb richtigerweise gesperrt. Domainbestätigung unter Mehr → Emails nötig; anschließend beide echten Testmails erneut prüfen.

## Schutz und Bedienung
- Admin/Superadmin darf standortübergreifend senden; aktive Niederlassungsleiter nur für eigene Niederlassung (Krefeld/Mülheim gemeinsam). Normale Mitarbeiter und Kunden sind serverseitig ausgeschlossen.
- Versand an die gespeicherte Kundenadresse, niemals frei eingegebene Empfänger. Erwartete Adresse wird vor Versand gegen den aktuellen Auftrag geprüft.
- Reply-To aus dem tatsächlichen Standort: bonn@, krefeld@ oder muelheim@slt-rental.de. Keine Mitarbeiterkopie an Testmails.
- Vorschau mit konkretem Empfänger und Text, expliziter Versandbutton, gespeicherte Stufe/Erfasser/Zeit, lesbarer Versandstatus und manuelle Statusaktualisierung.
- Stufe 2 erst nach belegtem erfolgreichem Versand von Stufe 1 und expliziter Bestätigung „unbeantwortet, nicht zurückgegeben, keine Verlängerung“. Ein Postfach wird nicht automatisch auf Antworten geprüft.
- Berlin-Frist aus operationalen Positionsdaten, kein Versand vor Mietende, ohne verbindliches Ende, bei widersprüchlichen Zeiträumen, vollständiger/staff-only Rückgabe oder manuellem Abschluss.
- Feste Stufenbelege, persistente Message-ID und Idempotenzschlüssel verhindern doppelte Wirkungen bei parallelen/retried Aufrufen.
- Zweite Stufe benennt möglichen Verdacht und mögliche rechtliche Schritte, keine als erwiesen behauptete Straftat.
- Abmeldefußzeile gehört zu App-E-Mails und kann nicht für diese einzelne E-Mail weggelassen werden. Abmeldeseite /unsubscribe hinzugefügt; vorhandene Schutzanpassungen an Abmelde-/Suppressionfunktionen erhalten.

## Echter Mitarbeiterablauf
Angemeldet als Luca, ohne Rechteänderungen. Testauftrag **#NFWSJ2**, ID 75b0661f-cceb-459d-9962-0a6744cf5320; Testempfänger vom Nutzer bestätigt: **luca@sandhoff.org**.
1. Eigenen Testauftrag ohne reales Gerät/Mietbetrag/Rechnung angelegt.
2. Stufe-1-Button geöffnet: Empfänger und freundlicher Text im echten Dialog geprüft.
3. Manuell „Erinnerung senden“ geklickt; serverseitiger Claim und Warteschlange erfolgreich, Empfänger luca@sandhoff.org, Reply-To bonn@slt-rental.de.
4. Versanddienst lehnt wegen unbestätigter Domain ab; Vorschau nach Neuladen zeigt **Versand fehlgeschlagen**, nicht „versendet“.
5. Stufe 2 im UI gesperrt; direkter echter Aufruf 409 „Erste Erinnerung noch nicht erfolgreich versendet“. Dabei ursprünglich gefundener text/uuid-Vergleich behoben und denselben Aufruf erneut erfolgreich als fachliche Sperre geprüft.
6. Falsche Empfängeradresse ergibt 409 „Kundenadresse geändert. Bitte neu laden“.
7. Zweite Textvorschau über echten Endpoint geladen; tatsächliche Zustellung dieser Stufe bleibt offen.
8. Desktop 1280, Tablet 820 und Handy 390 geprüft; kein horizontaler Überlauf, keine Browser-Laufzeitfehler.
9. Testregister ergänzt, Testauftrag durch geschützten Superadmin-Abschluss ohne Rückgabeprotokoll bereinigt. Anschließender Versandversuch korrekt 409 „Kein offener Mietauftrag“.
10. Keine Rechnung, Gutschrift, Zahlung oder Erstattung entstanden. Testregister würde spätere Testrechnungen automatisch neutralisieren; kein echter Auftrag geändert.

## Tests
PGlite führt produktive Migrationen 0170–0172 aus, einschließlich echter text-Messaging-ID-Struktur. Einzelregeln für Rollen, Standortgrenzen, falsche Empfänger, operative Datumsüberschreibung, ungültige/unbefristete Perioden, Rückgabezustände, manuellen Abschluss, Stufenfolge, ausdrückliche Bestätigung, Doppelversand und manuelle Fehlerwiederholung. Zusätzlich bestehende Dashboard-/Superadmin-Abschlusstests. Keine Schein-Sent-Belege im Produktivsystem erzeugt.

## Noch offen
- Domainbestätigung durch DNS-Verantwortlichen; niedrige Versandmengen während der ersten 2–4 Wochen der neuen Domain.
- Nach Bestätigung neuer sauberer Testauftrag: Stufe 1 → tatsächlicher Versandnachweis → Empfang im Testpostfach → Stufe 2 mit ausdrücklicher Bestätigung → tatsächlicher Versandnachweis/Empfang, Reply-To durch Antwort prüfen.
- Niederlassungsleiter-Rechte isoliert in Datenbank getestet; tatsächlicher Mitarbeiter-Versand erfolgte mit Luca als Admin, nicht durch Rollenwechsel oder fremdes Mitarbeiterkonto.
- Öffentliches /unsubscribe braucht Veröffentlichung bzw. www-Deployment; vor produktiver Nutzung muss der Link erreichbar sein.