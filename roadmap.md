# Roadmap – SEO-/Content-Überarbeitung (Prompt 14.09.2026)

## Aktuell – WhatsApp-Kontakt Bonn
- [x] Ralf Döhler mit 01575 7151584 und direktem WhatsApp-Link bei Bonner Kontaktstellen ergänzt; Schreibweise projektweit korrigiert, Name zentral für alle Anzeigen.

## Aktuell – Privatkunden ohne Rechnungszahlung
- [x] Rechnungszahlung aus privaten Angeboten/Rechnungen und Startseitenanzeige entfernt; alte Entwürfe auf Vorauszahlung vorbelegt, bestehende Belege unverändert. 10 Tests bestanden; angemeldeter Portal-Test: Privatkunden-Rechnung nur „Sofort fällig ohne Abzug“, beide bereitgestellten Versandfunktionen weisen net_14 mit 400 ab, ohne Nummernvergabe/Versand. Build OK; Oberfläche live nach Veröffentlichung.

## Aktuell – angenommene Angebote und mobile Zahlungsanzeige
- [x] Alle 14 angenommenen Mietanfragen ohne Auftragsbestätigung sichtbar: 3 Online-Unterschriften und 11 im Portal erfasste Annahmen; kein Altersfilter. Angemeldeter Portal-Test bestätigt Anzahl, Anfrageöffnung und keinen Textüberlauf bei 320/390 px; 9 Tests bestanden, Build OK. Keine E-Mails/Zahlungen ausgelöst; Veröffentlichung bleibt gesondert.

## Aktuell – ungestörte Unterschriften
- [x] Warenkorb und Cookie-Hinweis auf Angebotsannahmeseiten und bei allen gemeinsamen Unterschriftsflächen ausblenden, ohne Cookie-Zustimmung zu setzen.
- [x] Vier Regressionstests bestanden; Angebotsseite Desktop/Handysimulation mit gespeicherter Touch-Unterschrift geprüft, echte Übergabe-/Rückgabe-Dialoge isoliert geöffnet/geschlossen; Hinweise verschwinden und kehren danach zurück. Keine Annahme, E-Mail oder Auftragsänderung ausgelöst; Veröffentlichung gesondert.

## Aktuell – Webseiten-Button im Vermietportal
- [x] Mitarbeiter- und Kundenlink direkt auf die öffentliche Website gesetzt; 24 Tests bestanden und angemeldeter Kunden-Klick öffnet https://www.slt-rental.de/; Veröffentlichung über Publish → Update bleibt gesondert.

## Aktuell – Kunden-Passwortlinks und technische Adresse
- [x] Kunden-/B2B-Passwortwege, Einladungen und Bestätigungen geprüft; verbleibende falsche Ziele auf Portal korrigiert
- [x] 22 Regressionstests bestanden; Kunden-Passwortformular im Browser mit abgefangenem Versand auf eigene Portal-Domain geprüft; Einladungs- und Bestätigungsfunktionen deployed; kein echter Versand/Passwortwechsel
- [ ] Kundenregistrierungs-Ziel über Publish → Update veröffentlichen; gültigen Kunden-Passwortlink nach Freigabe Ende zu Ende prüfen. Auth-Site-URL/Allowlist nicht direkt auslesbar.
- [x] Offizielle Domain-FAQ: technische Projektadresse nicht entfernbar; Unpublish betrifft ganze Veröffentlichung. Auth-Site-URL/Allowlist ohne verfügbaren Einstellungszugriff unbestätigt.

## Aktuell – eigene Domains und Mitarbeiter-Passwortlinks
- [x] Mitarbeiter-Einladungen, Admin-Passwortlinks, Auth-Mail-Links und weitere ausgehende technische Website-/Portal-Links auf eigene Domains umgestellt; sechs betroffene Funktionen deployed
- [x] Weiterleitung der exakten technischen veröffentlichten Domain vor der ersten Anzeige auf passende eigene Domain implementiert; Vorschau unverändert; benötigt Publish → Update, keine vollständige Abschaltung der Hosting-Adresse
- [x] 20 Tests bestanden; Browser: ungültiger Token abgewiesen/aus URL entfernt, neue Linkanforderung geöffnet, neue HTML-Ausgabe auf altem Host zu eigener Website/Portal weitergeleitet; keine Mitarbeiter-E-Mail oder Passwortänderung ausgelöst
- [ ] Frontend-Änderungen über Publish → Update veröffentlichen; anschließend gültigen Mitarbeiterlink durch den Mitarbeiter prüfen. Alte E-Mail bleibt unverändert; Auth-Site-URL/Allowlist nicht auslesbar und nicht verändert.

## Aktuell – falscher Portal-Starttext
- [x] Vorab-Text ausschließlich auf app.slt-rental.de vor der ersten Anzeige unterdrücken; Website-SEO und Portal-Anmeldung unverändert lassen
- [x] 7 Tests sowie erste Anzeige mit verzögertem App-Start auf Desktop/Mobil geprüft: Portal-Vorabtext unsichtbar, Website-Text sichtbar, Anmeldung unverändert; Veröffentlichung bleibt gesondert

## Aktuell – mobile Zahlungen und Stripe-Gutschrifterstattung
- [x] Zahlungsfelder mobil ohne Überschneidung; Stripe-Zeile mit verkürzter Referenz und ohne Eingabefelder im angemeldeten Admin-Test bei 390 px geprüft; DB schützt Originaleinträge
- [x] Zahlungscodes im gemeinsamen Geschäfts-PDF begrenzen und umbrechen; Angebot/Rechnung/Auftragsbestätigung mit 148-Zeichen-Referenz lokal erzeugt, alle 5 Seiten visuell geprüft
- [x] Gutschriften mit expliziter Stripe-Erstattung, persistenter Aufteilung, stabilen Idempotenzschlüsseln und Webhook-Status verbunden; Miet-/Kautions-Erstattungen getrennt berücksichtigt
- [x] 12 Tests für Referenzen, Erstattungsverrechnung, Wiederholung und Bestätigungsdialog bestanden; keine echte Zahlung, Erstattung oder E-Mail ausgelöst
- [ ] Echte Stripe-Erstattung inklusive Live-Webhook-Rückmeldung erst nach gesonderter Freigabe prüfen

## Aktuell – Umsatzsaldo und Kundensuche
- [x] Portalrechnung +16,81 netto und Gutschrift −16,81 saldieren: Startseite und Auswertung zeigen 0; 12 Fachtests bestanden, Admin-Anmeldung geprüft
- [x] Startseitensuche öffnet Harald Sassen und Portal-Testfirma direkt in Kundenbearbeitung; bestehende Admin-Rechte bleiben, keine Daten gespeichert

## Aktuell – konsistente Protokoll-Fußzeilen
- [x] B2B-Übergabe/Rückgabe: PDF-Anhang und HTML-Ansicht auf gemeinsame Angebotsfußzeile mit Auftragsstandort umgestellt; beide Funktionen deployed
- [x] 18 PDF-Muster (42 Seiten) und 6 HTML-Druckmuster (12 Seiten) geprüft; 6 neue Fußzeilentests und 7 PDF-Regressionstests bestanden; Kunden-Protokolllisten mit Login geprüft; Bericht ohne Versand erstellt

## Aktuell – ausdrückliche Ende-zu-Ende-Abnahme vom 03.10.2026
- [x] B2B-Testablauf: Kundenformular, Angebotsannahme in Oberfläche, Übergabe/Rückgabe/Rechnung/Gutschrift über echte Funktionen; Ansichten als Kunde/Admin Desktop/Mobil geprüft
- [x] ANG/RE/GS M/V: 240 eindeutige lückenlose Vergaben auf isolierter Kopie der aktuellen Zählerfunktionen; parallele komplette Live-Ausstellung nicht geprüft
- [x] Sechs echte Testmails ausschließlich an luca@sandhoff.org zugestellt; Rechnung/Gutschrift gespeichert, Vollgutschrift gleicht Testforderung aus; Belege bleiben
- [x] Einzelbericht in Files erstellt; 130 Tests bestanden; negative Gutschrift-USt./Status/bezahlt-Summe und Testmail-Kopien korrigiert
- [ ] Vollständige Abnahme aller Verkaufs-/Privatkunden-/Zahlungs-/Kameraabläufe benötigt weitere ausdrücklich begrenzte Tests; Bericht benennt Prüfgrenzen

## Vor Veröffentlichung – Nummernkreise und Rechnungsbestand
- [x] Rechnungsbearbeitung in gemeinsamer Übersicht; alter Admin-Link leitet dorthin, Verwaltung öffnet Dialog; Admin-Browsertest ohne Seitenfehler
- [x] 15 Testrechnungen, 3 zugehörige Testgutschriften und 29 alte Rechnungsdateien entfernt; Angebote und Protokolle erhalten; Löschtrigger wieder aktiv, einmalige Bereinigungsfunktion entfernt
- [x] Gemeinsame Gutschriftkreise GS-M/V ergänzt; Nummernpfade für ANG-M/V und RE-M/V geprüft, keine Nummer durch Tests verbraucht
- [x] Angebote und Rechnungen nach Vermietung/Verkauf in je zwei gemeinsamen Kreisen für Portal- und Privatkunden nummerieren; historische Nummern nicht umnummeriert
- [x] Admin-/Kundenansichten Desktop/Mobil geprüft; später ausdrücklich freigegebene echte B2B-Testversände durchgeführt, siehe aktuelle Abnahme
- [x] Vorhandene Rechnungen auf Versand, Zahlung und GoBD-Schutz geprüft; Nutzer hat am 03.10.2026 alle ausschließlich als Testbelege zur Löschung freigegeben
- [x] Abschlussprüfung: 130 Frontendtests und 7 PDF-Tests bestanden; angemeldete ungültige Gutschrift liefert 409 ohne Belegerstellung. Offen: produktive Ausstellung/Versand, parallele Nummernvergabe und vollständiger Kunden-End-to-End-Test nicht ausgeführt.

## Aktuell – mobile Übergabe- und Rückgabeprotokolle
- [x] Entwürfe je Auftrag und Protokollart einschließlich Fotos nach Browserwechsel wiederherstellen
- [x] Optionalen Kilometerstand, Betriebsstunden und Tankfüllstand je Artikel in Übergabe/Rückgabe und PDF-Datenpfad integriert; automatische Validierung geprüft
- [ ] PDF-Layout mit echten Testdaten visuell auf Desktop und Handy prüfen
- [ ] Fotoaufnahme/-auswahl und Abschluss mit Fotos auf echtem Gerät prüfen; Fehler sichtbar machen

## Phase 1 – Prerender-Vollständigkeit (erledigt)
- [x] Alle Routen datengetrieben (1.285 Routen, keine handgepflegte Liste)
- [x] Build-Log: Routen je Typ, noindex-Zahl, Liste fehlgeschlagener Routen
- [x] Bonn-Hub mit 23 Kategorie-Links
- [x] sitemap.xml (1.281 URLs, lastmod wo vorhanden, ohne noindex), robots.txt verweist darauf

## Phase 2 – Hub-/Listenseiten serverseitig (erledigt)
- [x] /, /mieten/, /mieten/bonn/, /standorte/, /hilfe/, /ratgeber/, /ueber-uns/ mit Links/Texten im HTML
- [ ] Offen: /hilfe/<artikel>/ existiert als URL nicht (Hilfe ist eine Seite) – eigene Artikel-URLs wären neue Routen

## Phase 3 – Kategorie-Datenmodell (erledigt)
- [x] displayName/seoName/Plural, Singular-Grammatik, eigene Einleitungen
- [x] Sortierung, falsch einsortierte Produkte, Duplikate 301, Kommunikation = Funkgeräte, Zubehör noindex, Verkaufsartikel „kaufen"

## Phase 4 – Standortbausteine & Verfügbarkeit (erledigt)
- [x] 3 zentrale Textbausteine (src/data/locationBlocks.ts), Status je Produkt/Standort, genau ein Standort- und ein Verfügbarkeitsabsatz, Dedupe „Krefeld und Krefeld", Abholregel für Anhänger/Nutzfahrzeuge/Wohnwagen
- [ ] Offen: echte Öffnungszeiten für Mülheim fehlen in den Stammdaten

## Phase 5 – Produkt-Template (erledigt)
- [x] name/longName/model, Title ≤60, vollständige Meta-Descriptions ohne Auslassungspunkte, Preiszeile brutto (netto in Klammern), Pflichtblöcke im Prerender-HTML, Alternativen/Zubehör/Ratgeber als Links, Product/Offer/FAQ/Breadcrumb-JSON-LD
- [x] Neu vorgerendert: 1.085 Produkt-, 69 Kategorie- und 119 weitere Routen; insgesamt 1.273 Routen, 0 Fehler, 1.069 Sitemap-URLs
- [x] Mindestens drei belegte FAQ und Führerschein-Hinweise für die betroffenen Artikel ergänzt (Phase 6)

## Phase 6 – Einzelne Produktseiten (teilweise erledigt)
- [x] Führerschein-Hinweise für Anhänger, 7,5-t-Kipper, 3,5-t-Pritschenkipper und Wohnwagen zentral gepflegt
- [x] FAQ-Kaskade für sichtbare Seite, Prerender-HTML und FAQPage-JSON-LD vereinheitlicht; belegte Stammdaten ergänzen fehlende Fragen
- [x] Neu vorgerendert: 1.085 Produkt-, 69 Kategorie- und 119 weitere Routen; insgesamt 1.273 Routen, 0 Fehler, 1.069 Sitemap-URLs
- [ ] Offen: weitere Einzelkorrekturen aus dem Gesamtauftrag (Bobcat, Slug/Name-Abgleich, Verkehrszeichen, Beschallung)

## Phase 7 – Redirects & URL-Hygiene
- [ ] Regelbasierte 301, Trailing Slash, Ortsseiten, Microsite-Ziel

## Phase 8 – Strukturierte Daten & Technik
- [ ] LocalBusiness, ItemList/Article/FAQ, Kategorie-OG-Bilder, Canonical, Performance

## Phase 9 – Abnahme
- [ ] 12 curl-Stichproben, Qualitätschecks, 69 Kategorieseiten Zählabgleich, Redirect-Tests, Sitemap-Check, TODO-Liste

## Rechnungslegung & Gutschriften – End-to-End-Abnahme
- [x] Angebotssnapshot, Zahlung vor Rechnungsstellung, Endrechnung und Positionsspeicherung geprüft
- [x] Voll- und Teilgutschrift inklusive Restforderung und Erstattung geprüft
- [x] PDF-Layouts mit kurzen, langen und mehrseitigen Beispielen visuell geprüft
- [x] E-Mail-Versand und Fehlerfälle geprüft; Dokumente werden vor Versand vollständig gespeichert

## Bestandsprüfung im Angebotsprozess (erledigt)
- Bestand je Standort (CMS-Menge, sonst Einzelartikel) gegen Belegungen im Zeitraum
- Hinweis pro Position + Bestätigungsdialog vor Versand, Versand bleibt möglich
- Getestet im Portal: Überbuchung, Bestätigung, Versand (ANG-A-2026-0036), Testdaten entfernt

- [x] Renty: Mietanfragen im Chat aufnehmen, ins Portal + Standort-Mail, 22 Use Cases getestet
- [ ] Renty: echten Live-Test mit echter Kundenadresse durch das Team (Mail im Standortpostfach prüfen)

## Stripe-Zahlung (Zahlungslink + Kautionserstattung)
- [x] Tabellen, Zahlungslink-Seite /zahlung/:token, Webhook, Kautionserstattung (voll/teilweise), Karte in Mietanfrage/Verkaufsanfrage
- [ ] Webhook-Signaturschlüssel (STRIPE_WEBHOOK_SECRET) vom User eintragen + Endpunkt im Stripe-Dashboard anlegen
- [ ] Testzahlung (Testkarte) Ende zu Ende prüfen, sobald Webhook-Secret da ist
- [ ] Neuer Build auf Serverprofis hochladen (Seite /zahlung/ ist sonst auf www nicht erreichbar)
- [ ] PayPal-Direktanbindung: aktuell nicht umgesetzt (Stripe kann PayPal als Zahlart im Stripe-Dashboard aktivieren)
- [ ] Portal-Subdomain app.slt-rental.de in Lovable verbinden (DNS bei Serverprofis setzen, SSL abwarten, Publish), damit das Vermietportal über Lovable läuft

## Standortwechsel bei Mietanfragen (erledigt 2026-10-05)
- [x] Standort nachträglich ändern (auch nach Angebotsversand): DB-Funktion change_rental_inquiry_location + Karte im Anfrage-Panel mit Verfügbarkeitsprüfung am Zielstandort, Warnung bei versendetem Angebot, automatischer Sprung in die Angebotsüberarbeitung
- [x] 16/16 E2E-Prüfpunkte + 12 Unit-Tests bestanden; Bericht: /mnt/documents/Pruefbericht_Standortaenderung_2026-10-05.md

## Kunden-Info bei Standortwechsel (erledigt 2026-10-05)
- [x] Edge Function send-location-notice (E-Mail „in X nicht verfügbar, in Y schon", Rechte wie Standortwechsel, Testkunden-Routing, Notiz-Nachweis)
- [x] Dialog: Haken „Kunde per E-Mail informieren" + Vorschautext + persönliche Notiz
- [x] E2E beide Varianten (verfügbar/unklar) + 401-Schutz geprüft; Bericht: /mnt/documents/Pruefbericht_Standort_Kundeninfo_2026-10-05.md
- [x] Rückgabe an anderem Standort mit optionalem Netto-Aufpreis (Angebot, Rechnung, Auftragsbestätigung, Umsatz) – Vorschau-PDF geprüft
- [ ] Offen: Rückgabestandort im Übergabe-/Rückgabeprotokoll und Bestandsprüfung am Rückgabestandort (noch nicht umgesetzt)

## Dezente Bonner Kontaktgestaltung (2026-10-08)
- [x] Lange WhatsApp-Hinweise durch kompakte Kontaktaktion ersetzt; in Standortkarten neben Mitarbeiter-E-Mail ohne zusätzliche Zeile.
- [x] Startseitenkarten bei 320, 390, 768, 1117 und 1280 px geprüft: kein Seitenüberlauf, Desktop-Karten gleich hoch, korrekter WhatsApp-Link, keine Laufzeitfehler.
