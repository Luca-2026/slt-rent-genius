# 3 % Überweisungsrabatt für Mietaufträge

## Festgelegte Regeln
- Genau eine Variante: **3 % echter Überweisungsrabatt**, kein pauschaler Online-Zahlungsaufschlag.
- Rabatt auf Miete einschließlich Versicherung, Lieferung, Zubehör und sonstiger vereinbarter Zusatzleistungen, nach bereits vereinbarten Kunden-/Gutscheinrabatten.
- Kaution, Schadensersatz und städtische Gebühren bleiben unverändert.
- Rabatt nur bei vollständig per Überweisung bezahltem Mietbetrag; mehrere Überweisungen sind möglich, gemischte Zahlungen erhalten keinen anteiligen Rabatt.
- Der normale Preis bleibt der regulär beworbene Preis. Der Überweisungsrabatt und beide Zahlbeträge werden vor der Zahlungsentscheidung ausdrücklich gezeigt.
- Bereits versendete/angenommene Angebote und ausgestellte Rechnungen nicht rückwirkend ändern. Start mit neuen Mietangeboten und neuen Direktbuchungen; Änderungen bestehender Aufträge nur als ausdrücklich dokumentierte neue Vereinbarung.

## Umsetzung
1. **Einheitliche Rabattberechnung:** Rabattbasis, Netto/Umsatzsteuer/Brutto und Rundung zentral und centgenau berechnen. Ausgenommene Kosten eindeutig kennzeichnen, nicht anhand der Artikelbezeichnung erraten. Den vereinbarten Rabatt mit der Angebots-/Auftragsfassung speichern.
2. **Zahlungsentscheidung:** Kunden sehen regulären Online-Zahlbetrag und ermäßigten Überweisungsbetrag samt unveränderter Kaution. Die Wahl der ermäßigten Überweisung verbindlich speichern, bevor Bankdaten und QR-Code den ermäßigten Betrag ausgeben. Bestehende offene Online-Zahlungsfenster beim Wechsel sicher beenden; bereits laufende oder abgeschlossene Zahlungen nicht übergehen.
3. **Teilzahlungen und Zahlungsartwechsel:** Überweisungsanzahlungen und Restzahlungen beziehen sich auf dieselbe vereinbarte Rabattfassung. Bei Wechsel zu Online-, Bar- oder anderer Zahlung entfällt der Rabatt für den ganzen Mietbetrag; Restforderung und notwendige Belegkorrekturen vor der Zahlung ausweisen. Bereits ausgestellte Rechnungen nur über zulässige Korrekturbelege berichtigen.
4. **Mietanfragen und Auftragsbestätigung:** Mitarbeitermaske, Angebots-PDF, Annahmeseite, E-Mails, Zahlungsseite, Zahlungseingänge, AB-Vorschau und AB-Versand zeigen übereinstimmende Beträge. Das ursprüngliche angenommene Angebot und historische ABs bleiben erhalten.
5. **Rechnungen und Kaution:** Rabatt in Rechnung, Abschlag, Schlussrechnung und Umsatzsteuer korrekt übernehmen, niemals doppelt abziehen. Zahlungszuordnung, Restforderung, Kautionsabrechnung und Erstattung verwenden denselben rabattierten Mietbetrag; Kaution nicht vermindern.
6. **Weitere eigene Mietstrecken:** Separate B2B-Angebote und B2B-Rechnungen ebenfalls anbinden. Bei Halteverbotsschildern Rabattentscheidung bereits beim Buchungsabschluss übernehmen; Reservierung, vollständiger Zahlungseingang, Bestätigung und 24-Stunden-Frist bleiben konsistent. Normale öffentliche Warenkörbe zeigen die Option als Preisvorschau für das spätere verbindliche Angebot.
7. **Anhänger über Rentware:** Den gleichen Rabatt nur über eine unterstützte Rentware-Einstellung/API einrichten. Ohne Zugriff oder belegte Unterstützung keine lokale Rabattwerbung, die der externe Abschluss nicht einlöst; diese Teilstrecke ausdrücklich als noch nicht umgesetzt ausweisen.

## Prüfung und Freigabe
- Konkrete Regeln testen: 3 %, vollständige Überweisung auch in Teilbeträgen, kein Mischzahlungsrabatt, Zusatzleistungen einbezogen, Kaution/Schäden/städtische Gebühren ausgeschlossen, bestehende Belege unverändert.
- Centgrenzen, Gutschein-/Kundenrabatte, Anzahlungen, Änderungen, Abschläge/Schlussrechnung, doppelte Zahlungsnachrichten und Erstattungen prüfen.
- Mit einem freigegebenen Mitarbeiter-Testauftrag Speichern → Wiederöffnen → Angebot → Annahme → Zahlungsentscheidung → Zahlungserfassung → AB → Rechnung → Kautionsabrechnung durchspielen; PDF und sichtbaren Zahlbetrag vergleichen. Keine echten Kundenmails oder Live-Stripe-Zahlungen zu Prüfzwecken auslösen.
- Zahlungswahl und Preisübersichten auf Handy und Desktop prüfen.
- Eine automatische Freigabe aller Mietstrecken erst nach diesen Prüfungen; unterstützte Rentware-Einrichtung und rechtlich geprüfte Darstellung separat nachweisen.

## Technische Umsetzung
- Gemeinsame reine Rabattfunktion unter `supabase/functions/_shared/`, frontendseitig wiederverwenden; feste Version der Rabattvereinbarung im jeweiligen Dokument-/Auftragssnapshot.
- Geschützte, atomare Zahlungsentscheidung statt nur einer Rechenänderung in `ZahlungOnline` oder Stripe. Berechtigungen und bestehende Zahlungs-/Dokumentenschutzregeln erhalten.
- Hauptpfade: `send-inquiry-offer`, `offer-accept`, `offer-pay`, `send-order-confirmation`, `send-inquiry-invoice`, Zahlungsnachfragen, `settle_deposit`, Schilderreservierung/-Zahlungsstatus, `generate-offer` und `generate-invoice`.
- Stripe bleibt bei exaktem Centabgleich und idempotenter Zahlungsverbuchung. Kein Rabatt auf den kombinierten Miet-/Kautionsbetrag; kein fiktiver Zahlungseingang für den Rabatt.

## Ergebnis der Vorprüfung / offene Abhängigkeiten
- Ein pauschaler 5-%-Aufschlag wäre für übliche Verbraucherkarten rechtlich problematisch (§ 270a BGB); deshalb die Rabattvariante. Ein echter Rabatt ist von einer versteckten Zahlungsgebühr zu unterscheiden; dies ist keine anwaltliche Freigabe.
- Die tatsächlichen Stripe-Gebühren sind nicht verifiziert: der vorhandene Zugriff erlaubt den Kontoleseaufruf nicht. Die Umsetzung setzt die Schätzung von circa 5 % nicht als Tarif voraus.
- Der bisherige Mitarbeiter-Testzugang hat für wesentliche Mietabläufe keinen Zugriff; vollständige Abnahme benötigt einen dafür freigegebenen Mitarbeiter-Testzugang/-auftrag.
- Externe Anhängerzahlungen benötigen Rentware-Zugriff beziehungsweise eine bestätigte unterstützte Rabattkonfiguration.