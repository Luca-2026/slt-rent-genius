# Manuelle Rückgabeerinnerungen – 09.11.2026

## Ergebnis und Freigabegrenze
**Aktualisierung 11:24 UTC:** Rückgabeerinnerungen verwenden jetzt ausschließlich die vorhandenen direkten Resend-Zugangsdaten (`RESEND_API_KEY`, `RESEND_DOMAIN`), wie der bisherige Dokumentversand. Nur `send-transactional-email` neu eingespielt; keine globalen Versand-/Auth-Einstellungen, DNS-Einträge, anderen Versandfunktionen oder Zugangsdaten geändert. Keine neue Domainbestätigung erforderlich. Die ursprüngliche DNS-Empfehlung war für diesen bestehenden Resend-Versand falsch.

Beide Stufen im echten Mitarbeiterablauf als Luca über die Vorschau geöffnet und manuell gesendet. Resend hat beide E-Mails angenommen; gespeicherte Providerbelege und UI nach Neuladen bestätigen **Versendet**. Tatsächlicher Postfacheingang und eine Antwort aus dem Postfach bleiben **nicht einsehbar/unverifiziert**. Frontend-Toast geändert, nicht veröffentlicht; bestehende veröffentlichte Buttons nutzen bereits denselben aktualisierten Endpoint.

## Resend-Ende-zu-Ende-Prüfung
- Neuer registrierter Testauftrag **#ZWSYY3**, ID `a513e5b2-afd5-4287-a129-39769bd37a5e`, angenommen, Mietende 08.11.2026; kein reales Gerät, keine Gerätebelegung, keine Rechnung oder Zahlung. Keine historischen Testaufträge wieder geöffnet.
- Stufe 2 vor Erstversand deaktiviert. Stufe-1-Vorschau zeigt gespeicherte Testadresse und freundlichen Text; Versand per echtem Button an **luca@sandhoff.org**.
- Stufe 1 angenommen 09.11.2026 **12:21:45 Berlin**, Resend-ID `01a1c00a-f152-7b48-9f0c-45ba053a16e5`.
- Stufe 2 erst danach freigegeben, Versandbutton bis ausdrücklicher Unbeantwortet-Bestätigung deaktiviert. Bestätigung bewusst für diesen isolierten Test gesetzt; kein echtes Kundenverhalten unterstellt.
- Stufe 2 angenommen **12:21:49 Berlin**, Resend-ID `01a1c00b-019b-73ed-8b98-638dac580a33`.
- Beide Sendebelege: ausschließlich Testempfänger, `reply_to: bonn@slt-rental.de`, keine Mitarbeiterkopien. Nach Neuladen beide Stufen „Versendet“ und Buttons gesperrt. Screenshot `/tmp/browser/return-reminders/final.png`.
- Falscher Empfänger über echten angemeldeten Aufruf: HTTP 409. Testauftrag über geschützten Superadmin-Abschluss bereinigt; anschließender Versand HTTP 409 „Kein offener Mietauftrag“. Keine neue Sendung bei Prüfung nach Abschluss.
- 34 fokussierte Tests bestanden (5 Resend-Versandregeln, 11 Datenbankregeln, 16 Kundenmailregeln, 2 vorhandene Handlerprüfungen); letztes Buildsignal OK. Bestehenden Handler-Testadapter um importierte CORS-Abhängigkeit ergänzt, keine Änderung der Erstattungsfunktion.
- Weder die fehlgeschlagene Kundenmail an Wadim Werth noch andere Kundenmails automatisch wiederholt; gescheiterte Stufen bleiben gezielt manuell wiederholbar.
- Echte Tests als Luca/Admin, Niederlassungsleiter/gewöhnliche Mitarbeiter/inaktive Rollen isoliert mit produktiven DB-Funktionen geprüft; kein neuer tatsächlicher Versand mit Ralfs Sitzung behauptet.

## Schutz und Bedienung
- Admin/Superadmin darf standortübergreifend senden; aktive Niederlassungsleiter nur für eigene Niederlassung (Krefeld/Mülheim gemeinsam). Normale Mitarbeiter und Kunden sind serverseitig ausgeschlossen.
- Versand an die gespeicherte Kundenadresse, niemals frei eingegebene Empfänger. Erwartete Adresse wird vor Versand gegen den aktuellen Auftrag geprüft.
- Reply-To aus dem tatsächlichen Standort: bonn@, krefeld@ oder muelheim@slt-rental.de. Keine Mitarbeiterkopie an Testmails.
- Vorschau mit konkretem Empfänger und Text, expliziter Versandbutton, gespeicherte Stufe/Erfasser/Zeit, lesbarer Versandstatus und manuelle Statusaktualisierung.
- Stufe 2 erst nach belegtem erfolgreichem Versand von Stufe 1 und expliziter Bestätigung „unbeantwortet, nicht zurückgegeben, keine Verlängerung“. Ein Postfach wird nicht automatisch auf Antworten geprüft.
- Berlin-Frist aus operationalen Positionsdaten, kein Versand vor Mietende, ohne verbindliches Ende, bei widersprüchlichen Zeiträumen, vollständiger/staff-only Rückgabe oder manuellem Abschluss.
- Feste Stufenbelege, persistente Message-ID und Idempotenzschlüssel verhindern doppelte Wirkungen bei parallelen/retried Aufrufen.
- Zweite Stufe benennt möglichen Verdacht und mögliche rechtliche Schritte, keine als erwiesen behauptete Straftat.
- Resend-Erinnerungen benötigen weder die neue Lovable-Warteschlange noch deren Abmeldeseite; bestehende gespeicherte Empfängersperren werden weiterhin vor Versand berücksichtigt. Keine Infrastruktur oder Sperreinträge gelöscht.

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
- Postfacheingang beider bereits gesendeter Testmails und tatsächliche Antwort an Bonn durch Luca bestätigen; Inboxzugriff fehlt.
- Echte Versandabnahme als Ralf/Niederlassungsleiter nicht durchgeführt; Berechtigungen isoliert geprüft, tatsächlicher Button-Versand als Luca/Admin erfolgreich.
- Neue Toast-Texte in der Oberfläche noch nicht veröffentlicht; serverseitiger Resend-Versand ist sofort aktiv. Keine Domainbestätigung und kein /unsubscribe-Deployment für diesen Versand erforderlich.