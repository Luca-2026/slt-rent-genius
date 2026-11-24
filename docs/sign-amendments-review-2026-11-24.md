# Halteverbot-Nachträge und Buchungsfristen

## Verbindliche Regel
Ein bestätigter und vollständig bezahlter Schilderauftrag kann um separat bepreiste Zusatzartikel ergänzt werden. Die neue Auftragsbestätigung nennt die neuen Positionen und nur den offenen Mehrbetrag. Ursprüngliches Paket, Kaution, Zahlungseingänge und Originalbelege bleiben erhalten. Eine abgelaufene Reservierungsfrist des bereits bezahlten Originals darf den Nachtragslink nicht sperren; unbezahlte abgelaufene Buchungen dürfen nicht wieder aktiviert werden.

## Gefundene Ursachen
- `save_rental_order_amendment` sperrte ausdrücklich sämtliche Direktbuchungen.
- Die Direktbuchungsansicht ersetzte die manuelle AB-Karte auch nach Änderungen.
- `offer-pay` behandelte jede bezahlte Schilderbuchung als vollständig bezahlt, unabhängig vom aktuellen Restbetrag, und verwendete die alte Reservierungsfrist für neue Checkout-Sitzungen.
- Die AB-Mail enthielt keinen Restzahlungslink.
- Der Zahlungstrigger hätte zusätzliche Zahlungseingänge als Überzahlung des Originals zur Prüfung gestellt.
- `begin_rental_checkout` sperrte neue Sitzungen auch bei vollständig verbuchten, passenden historischen Providerbelegen.
- Originale Schilderpreise mit mehr als zwei Netto-Nachkommastellen führten beim vollständigen Neuberechnen zu Rundungsdrift; Nachträge addieren deshalb neue Nettobeträge/USt zum erhaltenen Original.
- Die generische Verteilung Miete-zuerst konnte bei Nachträgen den Mehrbetrag irrtümlich als Kaution bezeichnen. Schildernachträge erhalten ausschließlich Miet-/Zusatzleistungsanteil.

## Gelesene und geprüfte Wege
| Weg | Ergebnis |
|---|---|
| InquiryDetailPanel / InquiryOfferForm | Bearbeitung und Folgeschritt AB für Nachträge freigeschaltet; ursprüngliche Datumsfelder erhalten; Summe Original plus Zusatzpositionen. Echte Luca-Ansicht und Vorschau geprüft. |
| OrderConfirmationCard / send-order-confirmation | Bestehende Zahlungsprüfung mit ausdrücklicher Bestätigung des Restbetrags bleibt; Mail erzeugt/nutzt Restzahlungslink für Mietnachträge. PDF-Vorschau 200, finaler Mailversand ungeprüft. |
| save_rental_order_amendment | Nur bezahlte, bereits bestätigte Direktbuchungen; ursprüngliche Positionen/Vertragsfelder/Kaution unverändert; weitere Hauptsets separat buchen; neue Zusatzartikel durch bestehende Verfügbarkeitsprüfung. Isolierte SQL-Tests bestanden. |
| check_availability / check_inventory_availability / confirm_order | Code gelesen: eigener Auftrag aus Konflikten ausgenommen, Artikelbestand/Einzelgeräte geprüft; vorhandene Rechte und Belegung erhalten. Live-Speicher-/Belegungsabschluss nicht ausgeführt. |
| offer-pay / ZahlungOnline | Neue aktive Nachtragslinks bleiben nach Originalfrist bezahlbar; ursprüngliche unbezahlte Frist bleibt; Checkout nur Mehrbetrag, keine neue Kaution. Regeltests bestanden; echter neuer Provider-Checkout nicht ausgeführt. |
| offer-payment-admin / StripePaymentCard | Restzahlungsanlage/Anzeige berücksichtigt aktuelle Summe statt historischen paid-Link; Nachträge ohne doppelte Kaution. Code gelesen/geändert; produktive Linkanlage ungeprüft. |
| InquiryPaymentsCard / record-rental-payments | Code gelesen: bestehender geschützter Zahlungsweg; keine neue Direktbuchungsrabattzusage. Tests für Zahlungserfassung bestanden. |
| stripe-webhook / settle_rental_stripe_receipt_v2 | Code gelesen: centgenaue dauerhafte Providerbelege, idempotente Verbuchung und Rechnungsabgleich erhalten. Neuer echter Zahlungseingang ungeprüft. |
| sign_booking_payment_state / begin_rental_checkout | Bezahlte Originalreservierung bleibt bei Nachtragszahlung paid; nur passende verbuchte historische Providerbelege blockieren neue Sitzung nicht, ungeklärte Versuche weiterhin gesperrt. SQL-Tests bestanden. |
| SignBookingStatus / SignBookings | Originalbuchung als Original beschriftet; aktuelle offene Nachträge separat ausgewiesen, Originalstatus nicht verändert. Code gelesen/geändert. |
| calendarEntries / signBookingOverview | Originale start_date/end_date und neue rental_start/rental_end gemeinsam gelesen, ursprüngliche Termine nicht durch Zusatzpositionen verdrängt. Tests bestanden. |
| sign-booking-worker / expire_sign_bookings / sign_reserved_sets | Code gelesen: automatische Original-AB bleibt unabhängig; Ablaufjob betrifft nur reserved, nicht paid; Hauptset-Bestand bleibt an Originalbuchung gebunden. Keine Cron-/Bestandsdaten geändert. |
| payment-reminder / payment-followup | Code gelesen: automatische Direktbuchungsnachfragen bleiben ausgeschlossen; manuelle Restzahlung ohne neue Reservierungsfrist, Mehrbetrag nicht als Kaution. Bestehende Reminder-Texte außerhalb dieses Falls unverändert. |
| RentalPeriodStep / RentalRequestCart / SignBookingCheckout / sign-booking / guard_sign_booking_requirements / sign-booking-lead | Auf Lucas Antwort 96 auf 72 Stunden bei vorhandener Genehmigung geändert; 14 Werktage Mo–Sa ohne NRW-Feiertage für SLT-Genehmigung unverändert. Gemeinsamer Helfer treibt Kalender, Checkout und Hinweise; DB-Guard durch Migration 0211 geändert. 72-Stunden-Grenztest und SQL 71h Ablehnung/73h Annahme bestanden; produktiver Funktionskörper bestätigt 72h ohne 96h. |

## Nachweise
- 123 Tests in 16 Testdateien in der abschließenden Runde bestanden, einschließlich 72-Stunden-Grenze und SQL-Schutz; vorherige überlappende Runden nicht dazuaddiert.
- Echte Mitarbeiteranmeldung als Luca `l.sandhoff@slt-rental.de`, bezahlter Auftrag #9DDFU8; gepflegtes VZ 1060-31 gewählt, Vorschau HTTP 200.
- Vorschau: Original 39,00 €, Zusatzartikel nach gepflegtem Miettarif 19,04 €, zusammen 58,04 €; Kaution 100,00 €, vorhandener Zahlungseingang 139,00 €, ausschließlich 19,04 € offen. Zwei PDF-Seiten visuell und textlich geprüft.
- Bearbeitung bei 360 / 402 / 820 / 1280 px ohne horizontalen Überlauf und ohne Browser-Laufzeitfehler.
- Produktive Draft-Schreibversuche abgefangen; endgültige Speicherung/Versand abgefangen. Danach #9DDFU8 unverändert: Revision 0, 39,00 €, ein Zahlungseingang, Originalbuchung paid/13900 Cent. Keine Kundenmail oder Zahlung ausgelöst.
- Öffentliche Schilder-Paketauswahl mit vorhandener Genehmigung geöffnet: 72 Stunden und frühester Aufstelltag 27.11.2026 sichtbar, 360/402/820/1280 px ohne Überlauf; Screenshots visuell geprüft. Keine Adresse/Genehmigung/Buchung zu Testzwecken abgesendet; der vollständige öffentliche Kalenderabschluss bleibt ungeprüft.
- Migrationen 0210/0211 eingespielt; send-order-confirmation, offer-pay, offer-payment-admin, payment-reminder und sign-booking bereitgestellt. Aktuelles Seitenprotokoll build OK.

## Grenzen
Kein vollständiger produktiver Speicher → Mail → neuer Stripe-Checkout → Webhook → Zurücklesen-Lauf, um echte Kundenbelege/Geld nicht zu verändern. Benedikts eigene Sitzung, nativer iPhone-Safari, Postfacheingang und öffentliche Nachtragsseite mit einem neu ausgestellten echten Link ungeprüft. Oberfläche nicht veröffentlicht. Vorhandene Genehmigung jetzt 72 Stunden; SLT-Antrag 14 Werktage und Zahlungsreservierung 24 Stunden unverändert. Bereits abgerechnete Kautionen und abgeschlossene Aufträge bleiben geschützt; Hauptsets/Vertragsverlängerungen sind nicht Gegenstand dieses Zusatzartikel-Nachtrags.