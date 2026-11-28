# Abschluss-Releasecheck: #72EJQ5 / Verfügbarkeit 0215

Stand: 28.11.2026, Ausgang und tatsächlich angetroffener HEAD `c441630b1936cfcf5b18075990fcf8cd5cfa780a`, Arbeitsbaum zu Beginn sauber. Keine Veröffentlichung, Live-SQL-Anwendung, Edge-Aktivierung, Provideraktion oder produktive Datenänderung. 0213/0214 und deren Rücknahmen bleiben unverändert und inaktiv.

## A. #72EJQ5 – ausschließlich lesende Rekonstruktion

| Nachweis | Ergebnis |
|---|---|
| Zahlungshistorie und append-only Zahlungsevent | Ein Bankeingang 713,32 €, Zahlungsdatum 27.11.; gespeichert 27.11. 23:07:44 UTC. Kein Stripe-Zahlungseingang belegt. Externer Kontoauszug wurde nicht geprüft. |
| Ursprüngliches angenommenes Angebot | ANG-M-2026-11-0164, 219,91 € brutto Miete, 500 € vereinbarte Kaution. Snapshot: 168 € Artikel netto + 16,80 € Versicherung netto. |
| Aktueller operativer Auftrag | accepted, AB-M-2026-11-0164, AB-Zeit 27.11. 09:03 UTC; aktuelle Revision 1: 193,92 € brutto. AB-Zeit liegt vor der Revision, daher kein Nachweis einer bereits versandten aktualisierten AB. PDF-Inhalte wurden nicht geöffnet. |
| Rabattgrund | Änderungsereignis 28.11. 15:03 UTC: Kunde hat Hydraulikschlauch getauscht. Jetzt 10 % Positionsrabatt: 168 → 151,20 € netto. Versicherung bleibt 16,80 €, vereinbarter Überweisungsrabatt −5,04 € netto. Netto 162,96 €, USt 30,96 €, brutto 193,92 €. |
| Rückgabe | RP-2026-0044 unterschrieben 28.11. 14:57 UTC; Schäden und Zusatzkosten jeweils 0 €. |
| Rechnungen / Gutschriften / finale Belege | Keine `inquiry_invoices` zum Auftrag, somit keine originale/finale Rechnung oder Gutschrift in diesem Belegstamm. Kein Rechnungs-Skonto zusätzlich belegt. |
| Kautionsabrechnung / Refund-Basis | Keine `deposit_settlements`, keine `rental_refund_bases`. |
| Zahlungslink | Ein superseded Link: 219,91 € Miete + 500 € Kaution; kein paid_at/paid_cents. Ein Link ist kein Zahlungseingang. |
| Erstattungsnachweise | Keine zugeordneten deposit_refunds, rental_order_refunds, credit_note_refunds, order_refund_requests oder rental_additional_payouts. Gespeichert bestätigt: Kaution 0 €, Miete 0 €; gespeichert in Bearbeitung: jeweils 0 €. Nicht gespeicherte externe Überweisungen können nicht ausgeschlossen werden. |

**Rechnerischer Anspruch anhand gespeicherter Fakten:** 713,32 − 193,92 = 519,40 €, getrennt 500 € Kaution + 19,40 € Mietguthaben, sofern keine externe Auszahlung erfolgt ist. Kein bereits endgültig belegfreigegebener Gesamtsaldo: Kautionsabrechnung und Mietbelegbasis fehlen. Die aktuelle Live-Funktion `order_refund_totals` liefert vor diesen Prozessen 500 € Kautionsanspruch, Mietanspruch 0 €, Sperrgrund „Kaution zuerst abrechnen“. Das bedeutet nicht, dass das rechnerische Mietguthaben nicht existiert.

19,40 € sind nicht allein 10 % von einem beliebigen Bruttobetrag: Der tatsächliche Bankeingang lässt 213,32 € Mietanteil oberhalb der Kaution; dessen Differenz zum neuen Bruttomietbetrag 193,92 € beträgt 19,40 €. Gegenüber dem ursprünglichen Bruttomietbetrag 219,91 € beträgt die Korrektur 25,99 €, der Bankeingang liegt jedoch 6,59 € unter ursprünglichem Gesamtangebot. Diese Differenz ist bereits im Zahlungseingang enthalten und darf nicht noch einmal erstattet werden.

### Ursache und minimale Korrektur

Vorher: `result.refund` war korrekt auf die Kaution begrenzt, aber generisch beschriftet. Der zentrale Dialog unterdrückte die vorhandene Mietguthabenaktion bei `rent_available=0`; genau das passiert ohne vorbereitete Belegbasis. Nach Kautionsabrechnung konnte der Einstieg verschwinden. Außerdem bezeichnete die Bankauswahl eine nur veranlasste Überweisung so, als werde nur ein offener Auftrag gespeichert; `settle_deposit` bestätigt Bank/Bar tatsächlich sofort als bezahlt.

Jetzt: Kautionserstattung ausdrücklich getrennt; gemeinsamer Stand zeigt offene, bestätigte und reservierte Beträge centgenau, soweit vollständig nachgewiesen. Ohne Belegbasis/Abrechnung kein irreführender finaler Gesamtbetrag. Mietguthabenaktion bleibt auch bei null serverseitigem Rest und nach Kautionsauszahlung erreichbar, mit bisherigen Rollenprüfungen. Direkter Einstieg in die bestehende Schlussrechnungsvorschau; kein automatisches Schreiben einer Basis. Pending sperrt neue Auszahlung, Status/Nachweis bleiben zugänglich. Fehler beim Laden von Belegen/RPC zeigen keinen erfolgreichen Abschluss. Bankkautionsabrechnung verlangt einen Referenznachweis und erklärt die sofortige Bestätigung; „nur veranlasst“ nicht als ausgezahlt bestätigen.

**Bestehender Mitarbeiterprozess:** endgültige Rechnungsvorschau öffnen, endgültige Positionen prüfen, dort bewusst „Erstattungsgrundlage vorbereiten“; anschließend Mietguthaben separat vorbereiten und erst nach tatsächlicher Überweisung mit Banknachweis bestätigen. Kaution separat abrechnen und nur tatsächlich erfolgte Bankauszahlung bestätigen. Schlussrechnung erst nach erforderlichen bestätigten Rückzahlungen. Mietguthaben weiterhin nur Admin/Niederlassungsleitung; keine neuen Ausführungsrechte. Kein neuer Beleg-/Kontierungs-/Kassenprozess; Bar-Storno bleibt gesperrt. Eine offene normale Bankkaution hat im bestehenden RPC keinen eigenständigen „nur veranlasst“-Status: nicht vorzeitig abrechnen. 0213 wurde dafür nicht angewendet.

## B. Hotfix 0215

Aktuelle Live-Funktionskörper entsprechen **exakt** der Rücknahme für beide ersetzten Funktionen. Signaturen und CREATE OR REPLACE bleiben kompatibel, bestehende ACLs erhalten; authenticated/service_role, kein anon/Public-EXECUTE für diese beiden Funktionen. Wiederholter lesender Hash: check_availability `8447786c3f1b8d69369711eaff8ae2c8`, check_inventory_availability `c2928f57ab698b172fddcd38dfe59257`; confirm_order `3b52f61a470ab435b638dce6c8859ead` unverändert.

Isolierter Bonner Fall: alte SQL-Fassung frei 0, vorbereiteter Hotfix frei 1, Selbstblock ausgeschlossen; echtes belegtes Gerät weiterhin frei 0. Angenommene Aufträge ohne AB bleiben vorsichtshalber belegt (u.a. #NWHAP2). Abnahme hat zusätzlich bestätigt: 59 done-Aufträge haben eine AB. Vorbereitetes 0215 bewahrt deshalb bestätigte, nicht stornierte/nicht abgelehnte Aufträge auch außerhalb accepted. Unverbindliche Angebote ohne AB belegen nicht, B2B pending/offer_sent/confirmed/active unverändert. Gleiche überlappende aktuelle CMS-Mengenpositionen werden nun zusammen geprüft.

**Zeitregel:** bewusst konservativer inklusiver Berliner Kalendertag, keine stundengenaue Mengenlogik behauptet. Live `slt_item_period` übernimmt Positionsdaten, aber Uhrzeit aus Anfrage; diese bestehende Grenze bleibt unverändert. Tagesüberlappungen können zu vorsichtigen Ablehnungen führen.

**0215-Anwendung: NO-GO ohne weiteren Nachweis.** `confirm_order` überspringt CMS-Mengen weiterhin und sperrt nur die aktuelle Anfrage, keinen gemeinsamen Mengenbestand. Bestehende Konkurrenz-/Überbuchungslücke wird nicht durch eine neue Buchungsarchitektur ersetzt. Das Herausnehmen unverbindlicher Angebote setzt künstlich blockierten Bestand frei; ohne atomare erneute Mengenprüfung kann das praktische Rennen um das letzte Gerät häufiger auftreten. Daher keine unbedingte Freigabe dieses SQL, keine Mengenüberführung. Sicherheitsfix für doppelte aktuelle Positionen verbessert die Anzeige, ersetzt aber keine atomare Bestätigung. PostgreSQL-Parallelitätsabnahme/gesondert freigegebene Sicherung erforderlich. #NWHAP2 wurde produktiv nicht korrigiert.

## C. Edge-Kompatibilität und Aktivierung

Lovable dokumentiert automatische Aktivierung beim Bearbeiten verwalteter Funktionsdateien, unabhängig vom Website-Publish. Deshalb **keine einzige Datei unter supabase/functions geändert**. Minimalfixes nur in `docs/prepared/0216_edge_typecheck_fixes.patch`; geprüft in temporärer Spiegelkopie:
- send-order-confirmation TS2307: nicht exportierter npm-CORS-Unterpfad; durch vorhandenes Projekt-CORS-Muster ersetzt.
- insurance-validation TS2322: optionaler price_type wird durch includes nicht typisiert; explizite per_unit/percent-Narrowing, keine Abschwächung der Prüfung.
- Zusätzlich derselbe belegte CORS-Importfehler in sign-booking/sign-booking-worker, ebenfalls nur vorbereitet.

Sechs bisherige Einstiege plus send-order-confirmation, offer-accept, sign-booking, sign-booking-worker in dieser Kopie Deno-grün. Die tatsächlichen unmodifizierten Quellen behalten die oben genannten Fehler. Keine Live-Version daraus ableiten.

Projektinfo liefert keine Deployment-Version/Codehash; gefilterte Logs für offer-payment-admin/send-order-confirmation liefern keinen Nachweis. Keine echten Endpoints zur Erstattungs-/Belegprüfung aufgerufen. Produktive RPCs lesend nachgewiesen; `confirm_manual_order_refund` fehlt weiterhin, somit keine 0213-Aktivierung. Vorliegende neue Finance-Quellen sind serverseitig live-gated; ihre tatsächliche produktive Fassung und alte/neue Client-Kompatibilität sind **nicht vollständig belegt**. Keine automatische Sperrgarantie allein aus UI-Prüfung ableiten.

Betreiberprüfung in **Lovable → Mehr → Backend → Functions**: offer-payment-admin, send-inquiry-invoice, send-order-confirmation und Buchungseinstiege öffnen; Deploymentzeit und angezeigten Quellstand/Versionskennung mit freigegebener Fassung vergleichen (soweit die Oberfläche dies anbietet). Falls kein Quellhash sichtbar ist, braucht es eine separat freigegebene, kontrollierte Aktivierung mit dokumentiertem Quellhash und anschließend isolierter/lesender Kompatibilitätsabnahme, nicht einen echten Refund als Healthcheck. Kein externer Backend-Dashboardzugang vorausgesetzt.

## D. Tatsächlich ausgeführte Abnahme

| Prüfung | Ergebnis / Grenze |
|---|---|
| Vollsuite vorher | 238 Dateien / 1.769 Tests, 0 Fehler |
| Vollsuite nach Korrektur | 240 Dateien / 1.791 Tests, 0 Fehler; abschließender Wiederholungslauf nach Einbindung exakter Live-RPC-Evidence siehe full-suite.log |
| Neue Finanzregeln | 713,32/193,92/500/19,40, bereits ausgezahlte 500/19,40, Teilbetrag, pending, fehlende Basis/Evidence, Abzüge, ungültige Cents; UI fehlende Basis/fortbestehender Einstieg/Berechtigung/RPC-Fehler; serverseitige getrennte Abrechnung und Live-RPC-Salden isoliert |
| Bestehende Finanzregressionen | Bank/Stripe/Bar/Mischzahlung, Storno/Bar-Sperre, gemeinsame Kapazität, Doppelclick, gescheiterte Belege/RPC bleiben in vollständiger Suite grün. Keine echte Provider-/Bankabnahme. |
| 0215 isoliert | 13 PGlite-Fälle: Bonn vorher/nachher, accepted ohne AB, confirmed done, Statusgrenzen, Doppelpositionen, getrennte Tage, Mitternacht, B2B, Einzelgeräte, Berechtigung |
| Vorhandene Browser-Skripte im Repository | e2e/isolated-public-regression.py: 42 PASS; e2e/isolated-catalog-recovery.py: 12 PASS; page errors jeweils leer. Nach Browserclose treten Skript-Aufräumwarnungen TargetClosedError auf, kein fehlgeschlagener Prüfschritt. |
| Neue Browser-Erstattungsstrecke | 390×844 und 1280×1800: fehlende Basis → bestehender Vorschau-Einstieg → synthetische Basis → Bankauftrag vorbereiten → Nachweis → 19,40 bestätigt; nur lokale Modul-/Rollen-/Datenfixtures, keine externen Requests oder Seitenfehler. Screenshots geprüft. **Keine echte Authentifizierung**, kein echter Bankeingang/Refund. |
| Deno | 10 reale Einstiege inkl. transitiver Abhängigkeiten in vorbereiteter Kopie bestanden; Produktivdateien nicht verändert/aktiviert |
| App-Prüfung | Automatischer App-Check zuletzt build OK. Kein vollständiger Produktionsbuild manuell gestartet. |
| Produktionsbuild Export/Prerender/Sitemap | **Nicht erneut ausgeführt:** in dieser Sitzung keine erlaubte CI vorhanden; manuelle Projektbuilds sind durch geltende Arbeitsregeln untersagt. Frühere 1.337/1.129-Ausgaben sind kein aktueller Freigabenachweis. |
| Nicht getestet | echte Mitarbeiter-Anmeldung/Providerintegration; PostgreSQL-Parallelität; aktueller produktiver Edge-Quellhash; vollständiger neuer CI-Export/Prerender/Sitemap; echte Bank-/DATEV-Buchung |

## Entscheidung und minimale nächste Schritte

**Website-Publish jetzt: NO-GO für eine belastbare Abschlussfreigabe.** UI-Fix und isolierte Regression sind grün, aber aktueller CI-Vollbuild und produktiver Edge-Kompatibilitätsnachweis fehlen. Betreiber zuerst zulässigen CI-Lauf für `bun run build` mit Export/Prerender/Sitemap abschließen und dessen vollständige Ausgaben prüfen; Deploymentstände belegen und normal/storniert sowie Rollen/Standorte in sicher isolierter Auth-Umgebung abnehmen. Anschließend gesonderte Publishentscheidung; hier wird nicht veröffentlicht.

**0215 separat: NO-GO** bis konkurrierende CMS-Mengenbestätigungen abgesichert/nachgewiesen sind; keine Überführung aktivieren. Danach gesonderte SQL-Freigabe; in Transaktion beide Funktionen ersetzen, Signaturen/ACL vergleichen, #NWHAP2 lesend prüfen, bei Abweichung exakte Rücknahme für beide Funktionen. SQL/Rollback sind nicht automatisch Teil einer Veröffentlichung.

**0216 separat:** nur vorbereitete Typ-/Importkorrekturen, Aktivierungsfreigabe erforderlich. Bei Freigabe kontrolliert aus geprüfter Fassung aktivieren; Versicherungsshared beeinflusst weitere importierende Funktionen. Rücknahme ursprüngliche unveränderte Quellen aus Ausgangscommit, nicht Belegdaten. Frontend-Rücknahme gezielt betroffene Dateien aus Ausgangscommit, ohne Finanz-/Historydateien anzutasten.

Nicht releasekritische SEO-/Historyoptimierungen zurückgestellt. Bestehende 1B.3-Kassenperioden-, Standortzuordnungs- und Providerumgebungsblocker bleiben sichtbar; 0213/0214 nicht Bestandteil dieser Freigabe.