# Paket 1B.3 – Kaufmännische Abschlussprüfung und Release-Readiness

Stand: 28.11.2026, UTC. Ausgang: `ab8d397813507f235504c73eeed9bd16d69ba573`.
Endcommit: der Commit, der diesen Bericht und `docs/paket1b3-evidence/commit-reference.txt` enthält; dessen Hash ist nach Commit über `git log -1` eindeutig ermittelbar (kein selbstreferenzieller Hash im Bericht).

## Entscheidung

**Preview: GO ausschließlich für weitere isolierte Abnahme; kein vollständiges Finanzprozess-GO. Produktion: NO-GO.**

Die kaufmännische Prüfung ist nicht vollständig abschließbar: Kassenperioden-/Nachbuchungsregel fehlt, Storno-Barauszahlung ist deshalb nun ausdrücklich gesperrt; authentifizierte End-to-End-Abnahme mit isolierter Auth-/Provider-/Mailumgebung fehlt. Die vollständige Produktionskette Export/Prerender/Sitemap wurde in diesem Paket **nicht manuell ausgeführt**: die Arbeitsumgebung untersagt manuelle Projektbuilds und App-Typechecks, weil die automatische Prüfung diese übernimmt. Deren aktueller Eintrag meldet `build OK`, liefert aber keinen belegten vollständigen `bun run build`-Exportlauf. Dies ist ausdrücklich **kein Ersatz** für die verlangte Produktionsbuild-Abnahme und bleibt Freigabeblocker.

Keine Veröffentlichung, kein Deployment, keine produktive Migration/Schreiboperation, Zahlung, Erstattung, Buchung, Mail, Rechte-/Standortvergabe, Secret- oder Infrastrukturänderung. Produktiv wurden ausschließlich Funktionsdefinitionen, Berechtigungskataloge, Policies, Spalten und aggregierte Rollenzahlen gelesen. Keine personenbezogenen Daten in diesem Bericht. CMS/Preise/Steuern/Gebühren/SEO-Automatik unverändert.

## 1. Kassenbuch/DATEV – belegter Istprozess

```text
Gespeicherter Bareingang / Änderung payments
  -> log_cash_payments (0120 / aktuelle 0121-Definition)
  -> cash_journal: + Betrag; Entfernen -> append-only - Gegenbuchung
  -> cash_register_for_location: Bonn -> Bonn; Krefeld/Mülheim -> Krefeld
  -> deposit-refund-digest: letzte 24 h nach logged_at
  -> getrennte Kassen-CSV mit tatsächlichem payment_date
  -> datev-cash-csv: KOST1 = Auftrags-ID, Vorzeichen, Windows-1252

Normale manuelle Kautionsabrechnung (0198 settle_deposit)
  -> Cash/Bank bei Speicherung als paid; Stripe nur bei Providerbeleg paid
  -> Cash: INSERT deposit_settlements -> log_cash_deposit_payout
  -> negative Journalzeile -> derselbe Export
  -> Bank/Stripe: keine Bargeldzeile

Storno-Barweg aus 1B.2
  -> reserve_order_refund -> creating
  -> confirm_manual_order_refund -> succeeded + Auftragsevent
  -> KEIN cash_journal-Trigger und KEIN DATEV-Nachweis
  -> 1B.3: neuer Barauftrag/Bestätigung serverseitig und in UI gesperrt

Storno-Bankweg (nur reine Kaution)
  -> reservierter Anspruch -> tatsächliche Rückzahlung außerhalb der App
  -> Datum/Belegreferenz + aktueller Standort/Actor + Originalwegprüfung
  -> succeeded + Auftragsevent atomar; keine Auszahlung/Mail/Bargeldbuchung
```

### Befunde und Behandlung

| Befund | Ursache/Beleg/Codepfad | Behandlung |
|---|---|---|
| Kritisch: Storno-Barbestätigung ohne Kassenbewegung | Original-0213 schreibt nur Request/Event; Journaltrigger hängen an Zahlungen/Settlement-INSERT (`0120`, `0121`). Lokal reproduziert: +150 € vorhanden, bestätigte 40-€-Erstattung ohne -40 € | Neue Barreservierung und Bestätigung gesperrt. Keine erfundene Kontierung/Nachbuchungsregel; bestehende erfolgreiche Nachweise bleiben erhalten |
| Kein belegter manueller Journal-Erfassungs-/Abgleichweg | Code enthält keinen Mitarbeiter-Journal-INSERT; service-role kann technisch schreiben, das ist kein freigegebener kaufmännischer Prozess | Auch vorhandener synthetischer -40-€-Beleg schaltet die neue Bestätigung nicht frei; keine zweite Buchung |
| Keine Kassenperiodensperre nachgewiesen | Journal unveränderlich, aber keine geschlossene Periode/Datumssperre in geprüftem Schema/Code. Digest nach logged_at, Belegdatum nach payment_date | Konkrete Rückfrage gestellt: Wie behandelt Buchhaltung nachträglich bestätigte Barauszahlungen? Bis Antwort keine Barintegration |
| Normale Barabrechnung verlangt nicht denselben Nachweis wie neuer Bankweg | `0198`: Cash/Transfer werden bei Settlement-INSERT paid; Bartrigger prüft nicht payout_status, sondern Methode/Betrag | Bestandsschutz: normale Abläufe nicht umgestaltet; offene kaufmännische Abnahme, keine umfassende Freigabe |
| Zweite Completion über alten Settlementweg möglich | Combined Bankrefund und danach mark_deposit_payout_done/settle_deposit konnten denselben Kautionsanspruch dokumentieren; unabhängiger Review | Reviewed-SQL blockiert Settlement-Anlage/Completion bei aktiven Combined-Kautionsclaims; lokal getestet |
| Storno-Bank nicht in bisheriger Überweisungsübersicht | Digest liest nur deposit_settlements, nicht manuelle order_refund_requests | Keine Mailänderung in diesem Paket. Vor Rollout klären, welcher freigegebene Bankbeleg-/Abgleichprozess diese Nachweise übernimmt |

Bestehende DATEV-Felder bleiben exakt erhalten: `UStSatz 0,00`, BU/Gegenkonto leer, Belegtext Rental, Auftrags-ID in KOST1, optional Belegnummer. Dies beschreibt das vorhandene Exportformat und ist **keine steuerrechtliche Freigabe**. Keine neuen Konten oder Steuerregeln.

Mischzahlungen bleiben gesperrt, weil die Kautionsherkunft nicht eindeutig auf Bar/Bank aufgeteilt ist; kein pauschaler manueller Alternativweg freigegeben. Mietanteile bleiben im neuen manuellen Stornoweg gesperrt. Bestehende Miet-/Gutschrifterstattung bleibt Admin/Niederlassungsleitung vorbehalten: preInvoiceRefund/rentalCreditRefund/creditRefund mit bisheriger Vorschau-/Beleg-/Originalzahlungsgrenze, reine Bankzahlung oder Providerbeleg; bestehende Rechnungen/Abschläge benötigen Korrekturabrechnung. Stripe-Kaution behält Originalweg und Reconciliation; Combined-Live-Stripe bleibt gesperrt. Rentware-Vertrag/Abwicklung wurde nicht verändert oder als geprüft behauptet.

## 2. Alle elf ursprünglichen Deno-Fehler

Die Ausgangsprüfung wurde tatsächlich ausgeführt: **11 Fehler** (vollständige Ausgabe einschließlich Downloads: `paket1b3-evidence/baseline-deno.log`).

| Nr. | Originalzeile offer-payment-admin | Fehler | Ursache / Status |
|---|---:|---|---|
| 1 | 15 | TS2307 npm SDK `/cors` nicht exportiert | Import kann Moduleinstieg verhindern. Lokale vorhandenen Standards entsprechende CORS-Header, ohne SDK-Upgrade; behoben |
| 2 | 206 | TS2339 link_id | Nicht verengte Aktionsunion; behoben |
| 3 | 216 | TS2339 request_id | Nicht verengte Aktionsunion; behoben |
| 4 | 218 | TS2339 amount_cents | Nicht verengte Aktionsunion; behoben |
| 5 | 221 | TS2339 request_id | Nicht verengte Aktionsunion; behoben |
| 6 | 222 | TS2339 request_id | Nicht verengte Aktionsunion; behoben |
| 7 | 224 | TS2339 amount_cents | Nicht verengte Aktionsunion; behoben |
| 8 | 226 | TS2339 reason | Nicht verengte Aktionsunion; behoben |
| 9 | 246 | TS2339 amount_cents | Nicht verengte Aktionsunion; behoben |
| 10 | 248 | TS2339 reason | Nicht verengte Aktionsunion; behoben |
| 11 | 250 | TS2339 request_id | Nicht verengte Aktionsunion; behoben |

`startsWith` wurde durch explizite diskriminierte Aktionen ersetzt, Restweg fordert ausdrücklich `refund_deposit`; unbekannte Aktionen erreichen nie den Provider. Die bisherigen zehn Unionfehler bewiesen keinen ausgeführten falschen Refund, verhinderten aber belastbare statische Prüfung. Tatsächliches Zod-Schema in neuen Handlerprüfungen statt permissivem Schema-Mock. Keine any/as-unknown-/ts-ignore-Umgehung hinzugefügt; alte untypisierte Shared-APIs wurden nicht fachfremd umgebaut. `finance-scope` verwendet tatsächlichen gepinnten SDK-Typ; App-Deklaration verweist auf installierten SDK-Typ, Deno prüft eigenständig den echten Remote-SDK. Ein zwischenzeitlicher neuer TS2589 aus einem strukturellen Adapter wurde verworfen, nicht unterdrückt.

Final tatsächlich Deno exit 0 mit transitiven Abhängigkeiten: offer-payment-admin, deposit-refund-digest, stripe-webhook, send-inquiry-invoice; zusätzlich Shared Entry Points separat geprüft. Keine API-/SDK-Versionen geändert. Vollständige Finalausgabe `final-deno.log`.

## 3. Standortrechte und Auswirkungen

| Rolle | Kaution lesen/ausführen | Miete/Gutschrift ausführen | Standort |
|---|---|---|---|
| admin / vorhandener Superadmincheck | ja, Operationsrecht | ja | alle; kein Profilstandort erforderlich |
| niederlassungsleiter | ja, Operationsrecht + aktives Profil | ja, Operationsrecht + aktives Profil | eigene aktive Zuordnungen |
| standort_mitarbeiter | ja, Operationsrecht + aktives Profil | nein | eigene aktive Zuordnungen |
| fehlendes Operationsrecht / keine passende aktive Zuordnung | nein | nein | keine |
| service-role | technische DB-Ausführung, nicht Kundenrolle | nur vertrauenswürdiger Serverpfad | manuelle RPC verlangt zusätzlich gespeicherten Auftrag und geprüften Actor |

Keine zusätzliche explizite Cross-Location-Grantquelle neben Admin im untersuchten Rollenmodell gefunden. Mehrere vorhandene aktive Profilzeilen werden berücksichtigt; dies erzeugt kein neues Rollenmodell und beweist keine Unterstützung ihrer administrativen Anlage. Krefeld/Mülheim bleiben bei **Berechtigungen getrennt**, bei der **Kasse** bewusst zusammen.

Aggregierte lesende Prüfung: 3 Admins (1 ohne aktiven Standort, kraft Adminrolle zulässig), 1 Niederlassungsleitung (0 ohne Standort), 2 Standortmitarbeiter (**1 ohne aktiven Standort**). Keine Zuordnung durchgeführt.

**Admin-Anleitung vor Rollout:** SLT Rental App → Verwaltung → Mitarbeiter; vorhandenen Standortmitarbeiter mit leerem/fehlendem aktivem Standort ermitteln → Profil bearbeiten → tatsächlichen bestätigten Standort auswählen → speichern → neu öffnen und aktive Zuordnung prüfen. Keine Rolle ändern. UI `AdminStaffTab.tsx` nutzt admin-manage-staff/update_profile; Endpoint prüft authentifizierten Admin in user_roles. Mehrere Zuordnungen nicht durch erfundene UI-Schritte anlegen; Bedarf separat mit vorhandener Datenstruktur/Administration prüfen. Danach eigene/fremde Standortabnahme. Berechtigungsverlust ohne Standort ist beabsichtigte sichere Sperre, kein automatisches Rechtemapping.

### Weitere Sicherheitsbefunde

- `order-refund` liest jetzt nur Standortmetadaten vor Autorisierung, dann Zahlungen. IDs müssen zum gespeicherten Auftrag passen; Actor stammt aus geprüfter Bearer-Sitzung.
- invoiceLocation: doppelte Miet-/Verkaufsverknüpfung und fehlender maßgeblicher Auftragsstandort ergeben null; kein Ausweichen auf Belegstandort. Widerspruch bleibt Prüfbedarf; Admin behält zentrale Befugnis.
- Providerretry prüft Rolle/Standort erneut unmittelbar vor weiterem Providerwerk. **Keine Atomizität mit gleichzeitigem externen Rechteentzug behauptet**; bereits gestartete Provideroperation kann nicht durch DB-Transaktion zurückgerufen werden. Authentifizierter/Staging-Entzugstest fehlt.
- Ältere direkte SELECT-Policies waren staff-/operationsweit: deposit_settlements/refunds, rental_refund_bases/order_refunds, credit_note_refunds, cash_journal. Reviewed-Artefakt beschränkt exakt diese Finanzledger über gespeicherte Verknüpfungen; kein pauschaler Rollen-/Auftragsrechteumbau. Bereits bestehende umfassendere Auftrags-/Belegleserechte außerhalb dieser Ledger bleiben Gegenstand separater Prüfung, **keine vollständige Mandantenisolation behauptet**.
- Ein aktueller sicherer Betriebsentscheid darf nicht nur an einer UI-Sperre hängen: Barweg zusätzlich Edge und reviewed RPC gesperrt; Legacy-Service-RPC liefert expliziten Kompatibilitätsfehler.

## 4. Unabhängiger Migrationsreview und Prepared-Artefakte

Zwei unabhängige rein lesende Reviews: zuerst Original-0213, dann überarbeiteter Ersatz. Zweiter Review fand doppelte Settlement-/Combined-Completion; diese wurde danach korrigiert und mit lokalem Test belegt. Letzte Korrektur erhielt keine dritte unabhängige Reviewrunde; vor produktiver Freigabe erneut reviewen.

**Original `drizzle/prepared/0213...sql` unverändert, nicht anwenden.** Der Dateischutz verweigerte dessen Änderung; deshalb überprüfbarer Ersatz außerhalb automatischer Historie: `docs/prepared/0213_finance_reviewed.sql`, **statt**, nicht zusätzlich zum Original verwenden. Kein Journal-/Snapshot-/Migrationshistorieneintrag geändert. Produktionsanwendung ausschließlich separat freigeben und in kontrolliertem Migrationsprozess übernehmen.

Reviewpunkte:

- Original bei Wiederholung lokal reproduzierbar `guard: Ankerstelle nicht gefunden`; Settlementpatch fügt sonst doppelte Checks an. Ersatz erkennt vorhandene Patches, prüft Anker und ist lokal wiederholbar.
- Ersatz bewahrt echte 0198-settle_deposit-Definition/Arithmetik; keine historische 0198-Datenkorrektur ausgeführt. Lokaler Fixture-Stub wird für echte Funktionsprüfung entfernt; dies ist ausschließlich Testeinrichtung, kein produktives DROP.
- Keine neuen Tabellen/Enum/Rollen/Spaltentypen, kein Backfill unbekannter Auszahlungsdaten. Nullable paid_out_on bleibt bei historischen Erfolgen unbekannt; keine erfundene Tageszahl aus completed_at.
- Qualifizierte public-Objekte, SECURITY DEFINER mit festem search_path, beschränkte Execute-Grants. Dynamisches SQL besteht ausschließlich aus servergelesener Funktionsdefinition und konstanten Ersetzungen, nicht Nutzereingaben.
- Auftragssperre vor Request-/Settlement-Sperre, lock_timeout 2s. Ganze Anwendung in **einer Transaktion**; kein halb angewendeter Zustand bei Ankerfehlern. Echter mehrverbindungsfähiger PostgreSQL-Konkurrenztest fehlt; PGlite-`Promise.all` ist gequeue-ter Retrytest, kein Beweis paralleler Servertransaktionen.
- Aktueller Auftrag/Standort, Status, Datum/Beleglänge, ursprüngliche reine Bankzahlung, kein Mietanteil, Kautionsgrenze und anderweitig verbrauchter Anspruch werden vor Bestätigung geprüft. Erfolg und Event sind atomar; Fehlerbelegtest zeigt Rollback.
- Legacy confirm_order_refund_manual-Signatur bleibt, verweigert aber ohne tatsächliches Datum jede neue Bestätigung; alte Clients müssen kompatibel ausrollen. Historische Erfolge bleiben lesbar, werden nicht neu bestätigt.
- RLS-Helper benutzt endliche bekannte Verknüpfungstypen, keine freien Tabellen/SQL-Namen; Journalstandort aus Quellbeleg, nicht zusammengefasster Kasse. Tatsächlicher authenticated SELECT mit SET ROLE lokal getestet; übrige Ledgerpfade zusätzlich statisch reviewed, keine vollständige individuelle RLS-Matrix behauptet.

**Rollback:** `docs/prepared/0213_finance_safe_rollback.sql` lokal getestet. Sperrt manuelle Bestätigungen, erhält alle Requests, Auszahlungstage, Events, Journalzeilen und Standort-/Leseschutz. Keine DROP/DELETE/Undo von Geldbewegungen, keine Wiederfreigabe des alten unsicheren RPC. Rückkehr zur alten UI/Edge nur unter gesperrten neuen Schreibaktionen, nicht blind auf 1B.1 (würde Standortchecks entfernen). Vollständige Wiederherstellung der originalen Funktionsdefinitionen ist nur für eine isolierte Backupkopie zulässig; Produktivkorrektur als additive Forward-Fix nach Freigabe, Belege behalten.

## 5. Tatsächliche Testmatrix

| Prüfung | Ergebnis | Beleg/Grenze |
|---|---|---|
| Baseline Vollsuite | **1695 bestanden, 230 Dateien** | baseline-tests.log, selbst auf Ausgangscode ausgeführt |
| Baseline Browser | **42 bestanden** | baseline-browser.json/log; Warnungen TargetClosedError beim Browserabbau, keine pageerror/echten Writes |
| Original Deno | **11 fehlgeschlagen** | baseline-deno.log, einzeln oben |
| Nachher Vollsuite, erster vollständiger Lauf | 1726 bestanden, 1 fehlgeschlagen | after-tests.log; frühere Autorisierungsfehlermeldung verändert; Code auf bestehende Fehlermeldungsgrenze korrigiert, Test nicht abgeschwächt |
| Finale Vollsuite | **1727 bestanden, 233 Dateien; 0 Fehler/Skips** | final-tests.log; +32 Tests gegenüber Baseline |
| Neue Finanz-DB | **15 Tests bestanden im Finalgesamtstand** | financeReleaseDb: Originaldefekt/Wiederholung, Beleg/Datum, Bank Teil/Voll/mehrere Zahlungen, Retry, Journal-/Auditfehler, Rechte, Doppelclaim, Rollback |
| Neue SDK-/Autoritätsprüfung | **5 bestanden** | financeAuthority: echter SDK mit ausschließlich synthetischem Transport |
| Neuer echter Handler/Zod | **10 bestanden** | financeHandlerValidation: Aktionen, IDs, Cent, fehlendes Datum; Provider verboten |
| Neue UI-Bar-Sperrprüfungen | **2 zusätzlich bestanden** | manualCancelRefundUI: neue und bereits offene Barfälle |
| Bestehende sieben Phasen/Refund/Rechnung/CMS/Renty/Rechner/SEO | bestanden als Teil Vollsuite | kein Test gelöscht/skipped; vorhandene Isolations-/Mockgrenzen gelten |
| Nachher Browser | **42 bestanden** | after-browser.json/log; 390/1280 px, drei Standorte, Bagger+Dumper, Mengen/Reload/Deduplizierung, alle Rechner, Angebotsabschluss nur vor Versand |
| PDF | **3 lokale PDFs, je 2 A4-Seiten; Preise enthalten** | pdf-check.txt, Browserassertion identischer Rechner-/Berichtsbetrag; keine Kunden-PDFs |
| Deno relevant + transitiv | **exit 0** | final-deno.log; vier reale Entry Points |
| Automatische App-Prüfung | aktueller **build OK** | automatic-app-check.log; zwischenzeitliche Typfehler ebenfalls vollständig enthalten, danach behoben |
| Manuell angeforderter voller Produktionsbuild/Export/Prerender/Sitemap | **nicht ausgeführt** | Umgebungsregel; kein erfundener aktueller Sitemap-Count |
| Authentifizierte E2E Finanz/CMS/B2B/Stripe/Rentware | **nicht getestet** | keine nachweislich sichere bestehende isolierte Auth-/Providerumgebung |
| Gesperrte Kassenperiode, tatsächlicher DATEV-Import/Kassenabschluss | **nicht getestet / Regel offen** | keine belegte Periodensperre; synthetische CSV-Prüfung ist kein Steuerberater-/Import-GO |
| Echte Parallelität, Rechteentzug während Providertransfer | **nicht getestet** | gequeue-te PGlite-Retries nicht ausreichend |

Zwischenzeitliche neue Tests waren wegen fehlgeschlagener beforeAll-Einrichtung vom Runner als skipped angezeigt (fehlender Fixture-Returntyp/UUID-Default). Kein Skip im Testcode hinzugefügt; Einrichtung korrigiert und sämtliche Tests final ausgeführt. vollständige Zwischenoutputs in release-first/second/third.log. Baseline-React-act-Warnungen bleiben sichtbar, nicht als fachliche Fehler ausgegeben. Externe Unit-Test-fetch-Sperre bleibt; SDK-Mocks nutzen eigenen synthetischen Transport; Browser fängt sämtliche externen REST/Functions/Auth/Provider/Analytics ab und blockiert WebSockets. Renty deterministische Tools in Vollsuite; kein echtes KI-/Kundengespräch geführt.

Screenshots wurden visuell gelesen: mobile Paketübernahme, Bonner Rechner, mobiler Baustrom. Browserartefakte liegen temporär `/tmp/browser/paket1b3-*` / `/tmp/browser/paket1b1-regression`; keine Behauptung dauerhafter Screenshotarchivierung. Dauerhaft liegen JSON- und vollständige Textausgaben im Evidence-Verzeichnis. Die Bibliotheks-/Buildausgaben enthalten keine gelesenen Produktionskundenwerte.

## 6. Sicherer gestufter Releaseplan – ausschließlich Plan, nicht aktiviert

1. **Kaufmännische Entscheidung:** nachträgliche Barauszahlung/geschlossene Perioden, vorhandene manuelle Buchungen und deren eindeutiger Original-/Beleg-/Actor-Abgleich; DATEV-Verantwortliche müssen bestehenden Import/Zuordnung bestätigen. Storno-Banknachweise im Abgleichprozess bestätigen. Kein neues Konto vorschlagen.
2. **Backup/Wiederherstellung vor Aktivierung:** Quellcommit, DB-Schema/Daten, private Dokumente/Storage und Funktionsdefinitionen extern sichern; Wiederherstellung in isolierter Kopie tatsächlich testen. Keine automatische Rücksetzung produktiver Finanzdaten.
3. **Admin-Zuordnung:** fehlenden Standort des einen Standortmitarbeiters durch berechtigten Admin bestätigen; kein Agent entscheidet Standort oder Rolle. Cross-location Krefeld/Mülheim nicht ohne eigene Geschäftsfreigabe ändern.
4. **Staging bereitstellen:** eigener isolierter DB-/Storage-/Authbestand mit synthetischen Admin/Niederlassungsleitung/Standortmitarbeiter/ohne Standort/mehrfachen Zuordnungen, sieben Auftragsphasen, Bar/Bank/Misch/Stripe und Altrequests. Provider getrennt in Testmodus, Mail nur sicherer Sink, Rentware-Testvertrag/Stub; keine Live-Schlüssel/Produktionskunden kopieren.
5. **Lokaler/PostgreSQL-Review:** Ersatzartefakt gegen tatsächliches repräsentatives Schema samt Policies/Grants, alte Clients, PostgreSQL-mehrverbindungsfähige Locks/Retries/Revocation, Fehlerrollback prüfen; unabhängigen Review nach letzter Doppelclaimkorrektur einholen. Vollständigen Produktionsbuild mit Export/Prerender/Sitemap im erlaubten CI tatsächlich ausführen und Ausgaben archivieren.
6. **Authentifizierte Abnahme:** pro Rolle/Standort einloggen, fremden Auftrag direkt und über manipulierte IDs testen; Bank 40/60 € bestätigen und Reload/Audit lesen; Originalbeleg/Datum prüfen; Bar gesperrt, Misch/Miete nicht freigegeben; RPC-/Journalfehler keine Erfolgsmeldung; Stripe Testoriginal/Teilrefund/Timeout/Reconciliation ohne Doppeltransfer; CMS speichern/reload ausschließlich Staging; B2B-/Rentware nur Testkonten. DATEV synthetischen Export durch Buchhaltung importprüfen, nicht produktiv doppelt importieren.
7. **Separate Freigaben:** Datenbankänderung, kompatible Edge und UI ausdrücklich gemeinsam freigeben. Bis dahin alle Produktivänderungen gesperrt. Nicht Original-0213 zusätzlich anwenden. Wartungs-/Write-Sperre für manuelle Refunds während Umstellung; DB-Transaktion zuerst, dann geprüfte Edge, dann UI; Legacy-Clients erhalten klare Sperre statt erfundener Daten.
8. **Smoke/Monitoring:** eigener/fremder Standort, historische PDFs/Nachweise, offene Requests, korrekte Kasse/Audit, Bankstatus und unveränderte Originalzahlungen; keine automatische Testauszahlung/Mail. Fehler/ungeklärte Claims sofort Schreibsperre, vorhandenen Nachweis prüfen, niemals neue Auszahlung als Retryersatz.
9. **Rollback:** sperrendes geprüftes Artefakt statt Datenlöschung, Sicherheitschecks/RLS erhalten, kompatible frühere UI ohne neue Schreibaktionen. Geldbewegungen/Providerbelege nur reconcile, nie durch DB-Rollback für nicht passiert erklären.

### Noch erforderliche Entscheidungen/Freigaben

- Buchhaltung/Steuerberater: Behandlung nachträglicher Barauszahlungen und geschlossener Kassenperioden; autoritativer Abgleich vorhandener Journal-/externer Belege; Bank-Stornonachweise im bestehenden Abstimmungsprozess.
- Admin: tatsächliche Standortzuordnung für einen Standortmitarbeiter; mehrere Zuordnungen nur über bestätigten bestehenden Verwaltungsweg.
- Sichere isolierte Staging-/Auth-/Stripe-/Rentware-/Mailumgebung plus echte Mitarbeiterabnahme und PostgreSQL-Konkurrenzprüfung.
- Voller Produktionsbuild/SEO-Exportlauf im zugelassenen CI; separate Migration-/Edge-/UI-Freigabe sowie abschließender unabhängiger Review.

**Rückkehr zu 1C:** fachlich möglich als gesonderte CMS-Datenintegritätsarbeit ohne Aktivierung dieser Finanzänderungen; kein implizites Produktions-GO und kein 1C-Auftrag in diesem Paket umgesetzt. Finanzfreigabeblocker bleiben sichtbar.