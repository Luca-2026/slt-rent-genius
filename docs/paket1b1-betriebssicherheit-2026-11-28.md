# Paket 1B.1 – Betriebssicherheit und Regressionen

## Entscheidung

**Preview: bedingtes GO ausschließlich für weitere isolierte Abnahme. Produktion: NO-GO. Keine Veröffentlichung.** Die neun Ausgangsfehler sind reproduziert und die korrigierte Suite ist grün; das ist keine Garantie für alle Geschäftsprozesse. Zwei wesentliche Risiken bleiben: Standortbindung in älteren Erstattungswegen und fehlender nachgewiesener Bar-/Bank-Kautionsweg bei stornierten Aufträgen. Es gibt keine isolierte vollständige Auth-/Backend-/Provider-Umgebung für die reale Abschlussprüfung.

Keine produktiven Daten, Preise, Bestände, Rechte oder Secrets geändert. Keine Migration, Deployment, Anfrage, Buchung, Zahlung, Erstattung oder E-Mail ausgelöst. Synchronisierung bleibt deaktiviert, Export-Vollständigkeitsprüfung bleibt erhalten. Paket 1C nicht begonnen. Vorhandene Renty-/Rechner-/PDF-Änderungen bleiben bestehen.

## Baseline und Nachher

Ausgangsreferenz: `44fd42e737f00e7311b8dffc2baa92cef066efb2`, Bericht `docs/seo-paket1b-cms-publikation-2026-11-28.md`.

| Messung | Ergebnis | Beleg |
|---|---|---|
| Baseline, vollständige Suite | 220 Dateien bestanden / 3 fehlgeschlagen; 1629 Tests bestanden / 9 fehlgeschlagen; 18 unbehandelte Mockfehler; 0 skipped gemeldet | `/tmp/paket1b1/baseline.log` |
| Nachher, vollständige Suite | 227 Dateien bestanden; 1666 Tests bestanden, 0 fehlgeschlagen, 0 skipped gemeldet | `/tmp/paket1b1/after.log` |
| Wiederholung mit globaler HTTP-Sperre | 227 Dateien / 1666 Tests bestanden; keine gemeldeten unbehandelten Fehler | `/tmp/paket1b1/after-fenced.log` |
| Browser | 42 Prüfungen bei 390×844 und 1280×1800; keine Seitenfehler, keine verbotenen Anfragen | `/tmp/browser/paket1b1-regression/results.json` |
| Buildsignal | `2026-11-28T11:19:59Z: build OK` | `/tmp/observability/build-errors.log` |

Die Plattform führt Builds/Typprüfung aus; kein manuell gestarteter Produktionsbuild. Das Signal ist erfolgreich, aber kein Nachweis eines separat ausgeführten vollständigen Export-/Prerender-Release-Pipelines. Die zwischenzeitliche Typprüfung der neuen Server-Testdatei scheiterte an Deno/Stripe-Imports; Verschiebung nach `tests/` behob die unpassende Browser-Typprüfung, ohne Anwendungskonfiguration zu ändern.

### Reproduzierte Testausgaben

```text
Baseline: Test Files 3 failed | 220 passed (223)
          Tests 9 failed | 1629 passed (1638)
Nachher: Test Files 227 passed (227)
         Tests 1666 passed (1666)
Browser: PASS 42 checks; no real writes, no mail/payments; page errors []
```

Temporäre Originalausgaben liegen unter den genannten `/tmp`-Pfaden und sind nicht dauerhaft garantiert; wiederholbare Tests und diese Ergebniszusammenfassung bleiben im Repository.

## Die neun Fehler einzeln

| Fehler | Ursache / ursprüngliches Verhalten | Korrektur / tatsächlicher Nachweis |
|---|---|---|
| 1: Schilderdauer | Test erwartete 100 Tage trotz freigegebener 180-Tage-Regel | `src/test/signDirectBooking.test.ts`: 180 zulässig, 181 unzulässig, explizite kürzere Artikelgrenzen erhalten. Gemeinsamer `SIGN_MAX_RENTAL_DAYS` und `validSignRentalRange`; Server-Zod nutzt denselben Wert. Keine neue Preis-/Geschäftsregel. |
| 2: Gutschrift-Mailhandler | Mock kannte tatsächliches `setRentalCheckoutStripe` nicht, VM fehlte `Error` | `src/test/customerEmailHandlers.test.ts`: echte Handler-Aufrufkette mit lokaler Schnittstelle; erfolgreiche, pending, failed, partial_failed und geworfene Refundantworten; Rollenablehnung. Kein Providerzugriff, keine separate Kundenmail, keine falsche Erfolgsantwort. |
| 3: neu | Alter Test erwartete entfernten direkten Kautionsknopf, ohne Zahlungsdaten/protected info | Öffnet echten zentralen Dialog mit bezahlter isolierter Stripe-Kaution und prüft Übergabe an Kautionseditor. |
| 4: in Bearbeitung | Gleiche unvollständige Fixture / veralteter Einstieg | Gleiche echte Dialogprüfung für diese Phase. |
| 5: Angebot gesendet | Gleiche unvollständige Fixture / veralteter Einstieg | Gleiche echte Dialogprüfung für diese Phase. |
| 6: angenommen | Gleiche unvollständige Fixture / veralteter Einstieg | Gleiche echte Dialogprüfung für diese Phase. |
| 7: abgelehnt | Gleiche unvollständige Fixture / veralteter Einstieg | Gleiche echte Dialogprüfung für diese Phase. |
| 8: erledigt | Gleiche unvollständige Fixture / veralteter Einstieg | Gleiche echte Dialogprüfung für diese Phase. |
| 9: storniert | Alter Test übersah bewusst separaten Originalzahlungsweg | Dialog übergibt `cancelled: true` an StripePaymentCard und montiert normalen Kautionseditor nicht. Dies beweist nur den Stripe-Einstieg; Bar/Bank bleibt unten ausdrücklich offen. |

Phasentests: `src/test/rentalWorkspace.test.tsx`, parametrisiert mit `INQUIRY_STATUSES`. Keine Tests gelöscht, übersprungen oder abgeschwächt; Dialog und tatsächliche Folgekomponenten/IDs statt bloßer Textselektoren geprüft. Rechnungstests prüfen Editorzugang, nicht finale Rechnungsbuchhaltung: deren Editor ist dort gemockt.

## Zwei belegte Funktionskorrekturen

`src/components/b2b/inquiries/DepositSettlementCard.tsx`:

1. Fehler von `mark_deposit_payout_done` wurden bisher ignoriert. Jetzt geprüft und geworfen: fehlgeschlagene Belegbestätigung führt nicht zu Erfolgsmeldung.
2. Wiederaufnahme eines Teilrefunds verwendete den dauerhaften 40-Euro-Auftrag, meldete aber die gesamte 100-Euro-Abrechnung als erstattet. Jetzt zeigt die Meldung exakt den tatsächlich beantragten Betrag.

`src/test/depositSettlementFlow.test.tsx`: neun lokale Tests für bestätigte/pending/fehlgeschlagene Refunds, fehlende Reconciliation, 40-Euro-Wiederaufnahme, vorhandene Providerbestätigung, fehlende Mitarbeiterberechtigung, Doppelklick und fehlgeschlagene Abschluss-RPC. Keine Betrags-/Steuer-/Buchhaltungsregel verändert.

`tests/creditRefundRecovery.test.ts`: dauerhafte Claim-/Idempotenz-Wiederaufnahme, verlorene Belegschreibung und Providerfehler/pending. `tests/orderRefundScope.test.ts`: Bonn→Krefeld abgelehnt, fehlende Operationsberechtigung abgelehnt, Admin standortübergreifend lesend, Live-Sammelerstattung weiterhin blockiert. Bestehende original-payment-cap, Reconciliation-, Kautionssplit-, DB-Evidence- und Rechnungs/Gutschrifttests liefen in der Gesamtsuite unverändert mit.

## Browser-/Integrationsmatrix

Alle öffentlichen Browsertests laufen gegen `http://localhost:8080`, mit synthetischem Katalog und lokalen Angebotsberechnungen. Keine Aussage über echte aktuelle Artikelpreise/Bestände. Alle externen HTTP-/WebSocket-Aufrufe abgefangen; Quotes benutzen lokal dieselbe `publicRentalQuote`-Funktion. Keine Kontaktformulare abgesendet.

| Prozess | Ergebnis / Grenze |
|---|---|
| CMS Entwurf → publik → Standort/Preis/Technik ändern → deaktivieren | PASS isolierte PGlite-DB: `src/test/cmsPublicationLifecycleDb.test.ts`; öffentlicher View schließt private Felder aus, stabile ID, nicht berechtigter Save unverändert. Reale CMS-Maske/Auth/Live-View: NICHT GETESTET. |
| Login, echte Rollen, B2B/Mandantentrennung | NICHT Ende-zu-Ende GETESTET; lokale Schutztests PASS, ältere Refund-Standortbindung siehe Blocker. Keine echten Sessions verwendet. |
| Privat-/Geschäftskundenpreise | Bestehende Umrechnungs-/Quote-Unittests PASS; Browser verwendet Privatpreis. Vollständiger B2B-Preisflow: NICHT GETESTET. |
| Aushub → Bagger+Dumper → gemeinsamer Zeitraum | PASS alle drei Standorte, mobil/desktop, Paket enthält beide Artikel, Wochenendzeitraum, Menge ändern, Reload, vorhandener Warenkorb/dedup. |
| Anfrage bis Kontaktschritt | PASS alle drei Standorte/mobil/desktop; Schaltfläche vorhanden, nicht abgesendet. Keine tatsächliche Request-/Booking-Bestätigung. |
| Rentware/Stripe realer Sandbox-Abschluss | NICHT GETESTET; lokales Mockverhalten und Zahlungs-/Refundregressionen PASS. |
| Kaution/Refund/Gutschrift/Mail | PASS lokale Komponenten/Handler/DB/Providerfixtures; keine echten Provider-/Postfacheingänge, kein vollständiger authentifizierter Browserabschluss. |
| Aushubwerte/Links/Bilder | PASS 40×30: 12/14,4 m³ und 19,2 t; E10Z 80 cm prüfbedürftig, 40 cm passt nicht, lokale Produktlinks und geladene Bilder. |
| Standortwechsel/Expertenwerte | PASS erhalten; 390/1280 px. |
| Aushub-PDF/Preis | PASS je Standort: gleiche Rechner-/Berichtsumme, 2 A4-Seiten (595×842 pt), beide synthetischen Artikel, Logo, kein Website-Navi/Footer/FAQ/Cookieblock. Preisvergleich lokal gegen shared Quote, nicht gegen live Service. |
| Trocknung/Baustrom | PASS UI-Smokes beider Breiten, Trocknerempfehlung, editierbare kW/Entfernung/Mietdauer; deterministische Rechner-/Preistests PASS. Kein vollständiger Bundle-/Preis-/PDF-End-to-End-Test für diese beiden Tools. |
| Renty | Deterministische Tool-/Kontext-/Linktests in Gesamtsuite PASS; echtes Live-LLM-Gespräch NICHT GETESTET. |
| Navigation/Home/Standort/Kategorie/Produkt/Tools/Kontakt | PASS H1, sichtbare Seiten und kein horizontaler Overflow beider Breiten. Kein vollständiger Keyboard/WCAG-Audit. |
| SEO/OG/Legacy aus Paket 1 | Bestehende Metadaten-/Legacytests PASS; kein erneuter Live-vs-Preview-Crawl oder vollständiger statischer SEO-Abnahmelauf. Historische Auditbefunde dadurch NICHT geschlossen. |

Browserverifikation: `390-bonn-cart.png`, `390-muelheim-before-submit.png`, `1280-krefeld-calculator.png` unter `/tmp/browser/paket1b1-regression/` sichtbar geprüft. Dort liegen 42 Ergebniseinträge und drei Report-PDFs. Playwright meldet nach bestandenem Lauf beim Browser-Schließen zusätzliche `TargetClosedError`-Futurewarnungen; diese nicht als Appfehler versteckt, keine `pageerror`-Einträge.

## Offene Risiken / minimaler nächster Auftrag

### P1 – Standortbindung älterer finanzieller Wege

Codebefund, kein produktiver Exploit: `supabase/functions/offer-payment-admin/index.ts:141–190` validiert Rollen, ruft `creditRefund(service, credit_note_id, user.id, execute)` auf und liest bezahlte Links mit Serviceclient. Anders als `_shared/order-refund.ts` ist dort keine eindeutige Auftragsstandortprüfung sichtbar. `credit-refund.ts` nutzt Akteur-ID für Nachweis, nicht Standortbindung. `settle_deposit` (Migration 0198) prüft Operationsberechtigung, nicht explizit Standort.

Erforderlich: fachlich festlegen, ob jeder Standortmitarbeiter auch Fremdstandort-Kautionen bearbeiten darf oder ausschließlich eigene; Gutschrift-Erstattungen gesondert bestätigen. Danach geschützte serverseitige Standortprüfung aller Geschwisterpfade und lokale Cross-Location-Negativtests. Keine vorschnelle UI- oder Rechteumgehung. In diesem Paket unverändert, keine Migration/Rechteänderung.

### P1 – Stornierte Bar-/Bank-Kaution

`OrderRefundOverview.tsx:115–116` lässt bei `cancelled` den Kautionseditor weg; StripePaymentCard deckt Original-Stripe-Zahlungen ab. Sammelerstattung ist live bewusst deaktiviert. Ein sicherer Bar-/Bank-Rückzahlungsabschluss ist auf diesem sichtbaren Weg nicht nachgewiesen. Nicht durch pauschales Einblenden normaler Abrechnung gelöst: Stornogebühr, erhaltene Zahlung und Beleg müssen korrekt getrennt bleiben.

Erforderlich: erwarteten manuellen Originalzahlungs-/Belegweg für Stornofälle bestätigen und separat implementieren/testen. Kein Produktions-GO bis geklärt.

### P2 – fehlende sichere Vollumgebung

Vollständige CMS-/Auth-/B2B-/Providerabschlussprüfung benötigt eine isolierte Testumgebung mit test-only Datensätzen, blockierter realer Mail und nicht-produktivem Zahlungsprovider. Ohne diese Umgebung weder finale Ausstellung noch Auszahlung behaupten. Keine neuen Secrets im Auftrag angelegt.

## Wiederholung und Rollback

```sh
bunx vitest run
bunx vitest run src/test/signDirectBooking.test.ts src/test/customerEmailHandlers.test.ts src/test/rentalWorkspace.test.tsx src/test/depositSettlementFlow.test.tsx src/test/cmsPublicationLifecycleDb.test.ts tests/creditRefundRecovery.test.ts tests/orderRefundScope.test.ts
python3 e2e/isolated-public-regression.py
```

Browser benötigt laufenden lokalen Preview auf Port 8080, vorhandenes Playwright/Chromium, Bun; keine echten Zugangsdaten. Ausgaben `/tmp/browser/paket1b1-regression`. `src/test/setup.ts` sperrt ungemocktes fetch für Unit-Tests.

Geänderte Bestanddateien: `DepositSettlementCard.tsx`, `customerEmailHandlers.test.ts`, `rentalWorkspace.test.tsx`, `signDirectBooking.test.ts`, `setup.ts`, append-only `roadmap.md`. Neue Dateien: `cmsPublicationLifecycleDb.test.ts`, `depositSettlementFlow.test.tsx`, `tests/creditRefundRecovery.test.ts`, `tests/orderRefundScope.test.ts`, zwei isolierte E2E-Skripte und dieser Bericht. AGENTS-Ergänzung wegen Dateigrößenbudget nicht gespeichert; vorhandene Regeln nicht gekürzt.

Rollback ausschließlich dieser Änderungen aus der Ausgangsreferenz; neue Tests/Skripte entfernen. Keine Daten-/Migrationsrücknahme nötig. Nicht pauschal das Repository zurücksetzen: Renty/Rechner/PDF-Bestand und andere Arbeiten erhalten.