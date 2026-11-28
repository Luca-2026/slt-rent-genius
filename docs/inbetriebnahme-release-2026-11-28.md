# Inbetriebnahme / verbindlicher Releaseabschluss

28.11.2026. Tatsächlicher sauberer Ausgang: `9fb040bf3df1a2c757bd0a1bb4de94854f04d5be`. Kein Website-Publish, keine Testbuchung oder Kunden-/Finanzaktion produktiv. Bestehende Aufträge, Bestände, Preise und Rechte nicht geändert.

## 1. Tatsächlich live: Verfügbarkeitsfix einschließlich atomarer Bestätigung

Kontrolliert angewendet mit offizieller Migration: `drizzle/migrations/0213_cms_quantity_atomic_availability_hotfix.sql`. **Die automatisch vergebene Journalnummer 0213 bezeichnet NICHT die ausdrücklich ausgeschlossene vorbereitete Finanzmigration**; deren Dateien in docs/prepared sind unverändert und wurden nicht angewendet. URL-History/Sync/Mengenüberführung ebenfalls inaktiv.

- 0215-Datums-/Statuskorrektur: Positionstage, inklusive Europe/Berlin; accepted einschließlich ohne AB vorsichtig belegt, bestätigte nicht stornierte/nicht abgelehnte Aufträge auch unter done; offene unbestätigte Angebote nicht gebucht. B2B-Holdstatus unverändert.
- `confirm_order` prüft CMS-Mengen vor dem bisherigen Already-allocated-Return. Bestehender Einzelgerätecode, Transporte und Kosten bleiben byte-identisch bis auf diesen eingefügten Aufruf.
- Statement-Transition-Trigger auf INSERT/UPDATE/DELETE der beiden bestehenden Tabellen rental_inquiries und b2b_reservations sichern auch Annahme, direkte Statusänderung, Verlängerung/Änderung und B2B gegen Umgehung. Kein neuer Server, keine neue Tabelle/Reservierungsinfrastruktur.
- Bestehende Produktzeilen sind die gemeinsame Sperrressource: alle betroffenen stabilen Produkt-UUIDs sortiert FOR UPDATE, danach neuer READ COMMITTED-Snapshot. Das serialisiert vorsichtshalber auch verschiedene Standortpools desselben Artikels; die tatsächlichen Standortmengen werden weiterhin getrennt berechnet. Live-Isolation READ COMMITTED, authenticated nur vorhandenes 8-s-Statementlimit. Höhere Isolation lehnt neue Mengenzusagen mit 40001 ab statt einen veralteten Snapshot als frei auszugeben.
- Tagesweise kumulierte Positionen; linked B2B-Inquiry/Reservierung sind dieselbe Buchung, größere Repräsentation je Tag zählt statt doppelt. Fremde Holds bleiben belegt. Eigene verknüpfte Reservierungen werden in der Anzeige ausgeschlossen. UUID-/Slugreferenzen berücksichtigt.
- Freigaben/Reduktionen und reine Preis-/Notizänderungen bleiben möglich, auch bei historischen Überbuchungen. Neue Mengen-/Tageszusagen in unbekannten Daten werden gesperrt. Bestehende ausdrücklich undatierte, period-free und untracked Arbeitsabläufe sowie separater Schilder-/Einzelgeräteengine bleiben außerhalb dieser Mengensicherung. Keine neue Verfügbarkeitsgarantie für diese unveränderten Sonderwege.
- Mehrere Artikel sperren in einem Statement in UUID-Reihenfolge. Allgemeine Mehrstatement-Transaktionen können weiterhin PostgreSQL-Deadlocks erhalten; eine abgebrochene Transaktion schafft keine Buchung. Keine Behauptung einer universellen Deadlockfreiheit.

### Live-Beleg #NWHAP2

Vor Aktivierung erneute lesende Rekonstruktion: CMS Bonn 1, fremde belegte Mengen nach alter SQL-Regel 2 → frei 0. CYPWN5 weiterhin offer_sent ohne AB, Anfrage 02.11.–04.12., beide Anhängerpositionen 30.11. NWHAP2 accepted ohne AB, eigener Anhänger 04.12.08:30–16:30, selbst ausgeschlossen.

Nach Aktivierung: **CMS Bonn 1, fremd gebucht 0, frei 1** nach der nun aktiven SQL-Regel. Das ist eine lesende Tabellen-/Positionsrekonstruktion, kein Mitarbeiter-Login oder ausgeführtes confirm_order. Geschützte Hilfsfunktionen wurden nicht durch neue Grants für Prüfzwecke geöffnet; ein lesender Hilfs-RPC war erwartungsgemäß verweigert. Geräte-/Scherenbühnenkonflikte bleiben im unveränderten Instanzpfad.

### Version / Rücknahme

Vor Aktivierung aktuelle Funktionskörper/ACLs gesichert; Migration prüft alte Hashes atomar und bricht bei Drift ab. Nachher Live-MD5 **identisch zur echten isolierten PostgreSQL-Zielversion**:

| Funktion | vorher | live nachher |
|---|---|---|
| check_availability | 8447786c3f1b8d69369711eaff8ae2c8 | f7ddf37f330f0e1dcb25bc8c6d9e728f |
| check_inventory_availability | c2928f57ab698b172fddcd38dfe59257 | e23b71d177d20ae0264c751f11327572 |
| confirm_order | 3b52f61a470ab435b638dce6c8859ead | 19a017ba3ea8e862080e6b4cc8de8d28 |

Signaturen und bestehende Ausführungs-ACLs unverändert, RLS/Policies/Rollen nicht verändert. Neue interne Helpers nicht für anon/authenticated aufgerufen, nur interne Definer/service_role. Lokale Rücknahme reproduziert exakt alle drei alten Hashes; erneute transaktionale Anwendung bestand. Rücknahme: `docs/prepared/0215_cms_atomic_rollback.sql`, über offiziellen Migrationsweg ohne äußere BEGIN/COMMIT (Tool verwaltet Transaktion); entfernt ausschließlich neue Trigger und stellt drei Funktionskörper wieder her. Keine Daten/Belege löschen. Inaktive private Hilfsfunktionen können stehenbleiben. Tool-SQL und isoliert geprüfte Gesamtdatei unterscheiden sich lediglich durch eine Leerzeile, keine Anweisung.

## 2. Tatsächlich aktiviert: kleine Edge-Korrekturen

Vier Quellen beziehungsweise transitive Versicherungsnutzer gezielt mit erfolgreichem offiziellem Deployment aktiviert: send-order-confirmation, send-inquiry-offer, sign-booking, sign-booking-worker. Keine offer-payment-admin-/Finance-Aktivierung.

CORS weiterhin offizieller SDK-Import, nun explizit `npm:@supabase/supabase-js@2.119.2/cors` statt lokal nicht exportiertem ungebundenem @2-Unterpfad; keine eigene CORS-Deklaration und keine übrige Clientversion geändert. Versicherung verwendet explizit typisierten per_unit/percent-Wert, gleiche fachliche Validierung. Zielquellen zuerst im temporären Spiegel, dann tatsächliche Quellen inklusive transitiver Nutzer Deno-geprüft.

Offiziell bestätigte eingereichte Pakethashes:
- send-order-confirmation: be3f91bec211d3aaa098b7a028132bdb63bb34ba036342166f2456f748f9902e
- send-inquiry-offer: f0532066b3ffb97674ba3e116661b992e8bc43ab741defcc14a6bdccefd3037e
- sign-booking: 2183a122383b9f47b045a1c0e8bd62a0cd045a6389e115828013b49e75f3a361
- sign-booking-worker: 6336d6084fdcda1309e45a6f974e83cb02b5f5b73600d19ae2d901c6cdb7e4e2

**Grenze:** Das Tool bestätigt erfolgreiche Aktivierung und eingereichte Source-SHA, liefert jedoch ausdrücklich keinen separat verifizierten Live-Runtime-Codehash/Versionswert. Projektinfo/lesende Logs liefern ihn ebenfalls nicht (letzte Abfrage leer). Deshalb nicht als unabhängigen Runtime-Versionsabgleich ausgeben. Keine Finanz-/Mailendpoints für Healthchecks aufgerufen. Rollbackquellen vor Änderung in docs/inbetriebnahme-evidence/edge-before; bei Rücknahme vier geänderte Dateien aus Ausgangscommit wiederherstellen und abhängige Funktionen kontrolliert neu deployen. Das ist Rücknahme der bisherigen Repositoryquellen, kein unbelegter Export einer alten Laufzeitversion.

## 3. #72EJQ5 unverändert

Lesend bestätigt: 713,32 € bezahlt, aktueller Mietbetrag 193,92 €, Kaution 500 €, rechnerisches Mietguthaben 19,40 €; insgesamt 519,40 € rechnerisch, sofern extern nichts ausgezahlt wurde. Weiterhin keine Kautionsabrechnung, Rechnung, Refundbasis oder kombinierte Auszahlung gespeichert. Keine tatsächliche Erstattung/Belegvorbereitung vorgenommen.

Die bestehende getrennte Erstattungsübersicht und Banknachweis-/Pendinglogik sind unangetastet. Mietguthaben über vorhandene finale Vorschau/Basis, keine neue 0213-Finanzfunktion. Fehlende confirm_manual_order_refund bleibt fehlend; vorbereitete Storno-Manuellfunktion wurde nicht aktiviert. Normale Bank-/Stripe-/Barpfade und bisherige Stornosperren wurden nicht umgeschrieben. Isolierte Suite prüft diese Pfade; aktueller produktiver offer-payment-admin-Quellhash ist nicht unabhängig belegbar. Rollenprüfung in Fixtures ist kein tatsächliches Mitarbeiter-Login.

## 4. Tatsächliche Abschlussprüfungen

| Prüfung | Ergebnis |
|---|---|
| Baseline | 1.791/1.791 Tests |
| Finale tatsächliche Quellen | **1.796/1.796**, 241 Dateien, 0 Fehler |
| PGlite Fachlogik | 18 Verfügbarkeits-/Guardfälle; kein Parallelitätsnachweis behauptet |
| Echtes PostgreSQL 17 | **24 Fälle**, unabhängige psycopg2-Verbindungen: genau ein Erfolg bei letztem Artikel, B2B gegen Bestätigung und parallelen Verlängerungen; Doppelpositionen, Pools, Hold, Storno, Retry, Berechtigung, Devices/Transportkosten, Rollback; ausschließlich lokale synthetische Daten |
| Vorhandene Browserchecks | **42 + 12 PASS**, Seitenfehler leer; bekannte Aufräumwarnungen nach Browserclose bleiben ausdrücklich als Skriptwarnungen dokumentiert |
| Refundbrowser | Bestehender isolierter Ablauf bei 390×844/1280×1800 bestanden, Screenshots geprüft, keine externen Requests/Schreibaktionen |
| Deno tatsächliche Zielquellen | **11 Entrypoints PASS**, einschließlich der vorherigen zehn und send-inquiry-offer als weiterem transitiven Versicherungsnutzer |
| App-Check | Automatischer App-Check build OK |
| Offizieller Hosted-Buildstatus | Ausgangscommit 9fb040bf erfolgreich, in_sync, fertig 15:26:27 UTC; registriert br_089b291c-9aba-4799-adc4-32c7ea21a308 |
| Vollständiger aktueller Produktionsbuild Export/Prerender/Sitemap | **Nicht gesondert nachgewiesen.** Keine manuelle Build-Ausführung erlaubt; offizieller Katalog bietet Status/Diagnose, keinen auslösbaren separaten CI-Build. Erfolgreicher Preview-Status ersetzt keinen belegten Komplett-Exportbericht. |

Keine Frontend-Runtime-/Preis-/CMS-/Warenkorb-/Rechner-/PDF-/Rentydatei in diesem Auftrag geändert, nur automatisch generierte Typen. Vorhandene Verbesserungen erhalten. Keine neue Infrastruktur/Secrets/Dienste. Nicht getestet: echte isolierte Mitarbeiterauthentifizierung/Providerantworten; bewusst keine Produktivkonten oder echte Geschäftsaktionen.

## Verbindliche Publishentscheidung

**NO-GO für die verlangte vollständig nachgewiesene Abschlussfreigabe.** Die konkreten Verfügbarkeits- und kleinen Edgefixes sind jetzt tatsächlich aktiviert, keine weiteren vorbereiteten Inbetriebnahmepakete nötig. Nur zwei Nachweise fehlen: aktueller vollständiger Export-/Prerender-/Sitemap-Build und unabhängiger Live-Runtime-Versionsabgleich der vier Deployments.

**Konkreter nächster Eigentümerschritt im Editor:** Nach Abschluss den automatisch gestarteten Build der gespeicherten Abschlussversion abwarten; dann gezielt „Prüfe ausschließlich den Build der Abschlussversion und die vier aktivierten Deploymentversionen für die finale Publishfreigabe“ senden. Keine weitere allgemeine Audit-/Finanzrunde. Das ist erforderlich, weil der offizielle Buildstatus in diesem Turn noch den Ausgangscommit meldet und der neue Hosted-Build erst nach Übergabe des Commits startet. Falls die Plattform weiterhin keinen vollständigen Exportbericht/Runtimehash liefert, bleibt genau diese Beleggrenze offen; nicht zum Ersatz echte Buchung/Erstattung oder Mail auslösen. Es gibt hier keinen nachgewiesenen separaten Editor-Knopf, der ausschließlich den vollständigen Produktionsbuild ohne Publish auslöst; einen solchen nicht erfinden.

Website nicht veröffentlicht. Nichtreleasekritische alte SEO-/History-/DATEV-/Stagingthemen bleiben getrennt und werden nicht als Anlass für neue Pakete benutzt.