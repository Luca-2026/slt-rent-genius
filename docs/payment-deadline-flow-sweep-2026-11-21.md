# Zahlungsziel-Nachprüfung – 21.11.2026

## Regel
Ein individuelles Zahlungsziel muss in Bearbeitung, PDF, E-Mail, gespeicherter Fälligkeit, Listen und Erinnerungen gelten. Es darf weder still durch 14 Tage noch durch eine neue Vorkasse-/24-Stunden-Frist ersetzt werden. Bereits ausgestellte, bezahlte, erstattete oder geschlossene Belege bleiben unverändert.

## Gelesene Wege und Ergebnis

| Ort / Ablauf | Gelesene Quelle | Ergebnis |
|---|---|---|
| Miet- und Verkaufsrechnung, Schlussrechnung, Nachtrag, Storno- und Kautionsabrechnung | `InquiryDetailPanel.tsx`, `InquiryOfferForm.tsx`, `send-inquiry-invoice/index.ts`, `_shared/customer-payment-terms.ts` | Gemeinsamer Sender. Angebots-/Entwurfsbedingungen werden übernommen; individuelle Kalenderfrist ersetzt den früheren 14-Tage-Rückfall. Unklare individuelle Texte stoppen vor Nummernvergabe. Keine Rechnungsdaten verändert. |
| Abschlagsrechnung Miete und Verkauf | `InstallmentCard.tsx`, `_shared/installment-positions.ts`, `send-inquiry-invoice/index.ts` | Abweichung korrigiert: individuelle Bedingungen jetzt übernommen, sichtbar/editierbar und im Vorschau-/Versandauftrag enthalten. Jede Änderung erfordert eine neue Vorschau. |
| Portalrechnung neu und aus Entwurf | `AdminDashboard.tsx`, `AdminInvoicesTab.tsx`, `generate-invoice/index.ts` | Abweichung korrigiert: gespeicherte Zahl von Tagen bleibt beim Finalisieren erhalten. Ausdrückliche Angebotsbedingungen vor aktuellen Profileinstellungen; identischer Termin für PDF und gespeicherte Rechnung. Quelle bei Angebotsbezug serverseitig gelesen. |
| Portal-Rechnungs-PDF | `generate-invoice/pdf.ts` | Abweichung korrigiert: Kopf zeigt beliebiges gepflegtes Zahlungsziel, nicht nur 0/7/14/30 Tage. Zahlungskasten verwendet denselben Termin. |
| Rechnungs-E-Mails Erst-/Neuversand | `generate-invoice/index.ts`, `send-invoice-email/index.ts`, `send-inquiry-invoice/index.ts` | Erstversand verwendet aktuelle erzeugte PDF. Portal-Neuversand nennt gespeicherte Fälligkeit; Anfrage-Neuversand öffnet ursprüngliche PDF. Kein Überschreiben ausgestellter Belege. Versand nicht ausgeführt. |
| Miet-/Verkaufsangebote, Revisionen, AB-Änderungen | `InquiryOfferForm.tsx`, `send-inquiry-offer/index.ts`, `_shared/order-amendment.ts`, `send-order-confirmation/index.ts`, `OrderConfirmationCard.tsx`, `src/lib/orderConfirmation.ts` | Individueller Text bleibt erhalten. Leere ausdrückliche individuelle Bedingungen werden nicht mehr auf 14 Tage gesetzt. AB-Bedingungen verlangen Mitarbeiterbestätigung, nicht erfundene Vorkasse; PDF/E-Mail nennen individuelle Bedingungen. |
| Separates altes Portalangebot | `AdminCreateOfferDialog.tsx`, `generate-offer/index.ts` | Feste Auswahl in `[PAYMENT:…]` gespeichert; neue Rechnung liest diesen Nachweis statt blind das aktuelle Profil zu verwenden. Hier gibt es keinen individuellen Freitext-Editor. |
| Gemeinsame Angebots-/AB-/Rechnungs-PDF und Überweisungs-QR | `_shared/offer-pdf.ts`, `_shared/document-transfer.ts` | Individueller Rechnungstext/Fälligkeit konsistent. AB setzt individuelle Bedingungen nicht mehr automatisch vor Mietbeginn. QR erstellt keine eigene Frist; vorhandene Belege bleiben unverändert. |
| Kunden-/Mitarbeiter-Rechnungslisten | `Invoices.tsx`, `InquiryInvoices.tsx`, `AdminInvoicesTab.tsx` | Anfrage-Liste liest gespeicherte Fälligkeit. Portal-/Adminlabels jetzt aus gespeicherter Tageszahl statt allein `net_14`-Kennzeichnung. |
| Startseite, offene Forderungen, angenommene Angebote | `StaffHome.tsx`, `dashboardMetrics.ts`, `AcceptedOffersPayments.tsx` | Forderungen lesen gespeicherte Fälligkeit; individuelle Bedingungen jetzt als Rechnungskonditionen statt pauschal unbezahlte Vorkasse eingeordnet. |
| Kundenakte, historische PDF, Rückzahlungen/Gutschriften | `CustomerDocuments.tsx`, `customerDocuments.ts`, `_shared/invoice-with-refunds.ts`, `send-inquiry-credit-note/index.ts` | Öffnen liest vorhandene Belege; Zahlungsnachtrag lässt Originalseiten erhalten. Gutschriften haben keinen neuen Zahlungsanspruch. Keine historischen Termine neu berechnet. |
| Automatische Zahlungsnachfrage / Überfällig-Anzeige | `payment-reminder/index.ts`, `_shared/payment-followup.ts` | Automatik schließt individuelle Rechnungsbedingungen bereits aus. Manuelle Nachfrage verwendet jetzt den individuellen Text statt pauschal Zahlung vor Bestätigung zu verlangen. Keine Nachricht gesendet. |
| Automatische Abschlags-Erstellungserinnerung | `installment-reminder/index.ts`, `_shared/installments.ts` | Erinnert Mitarbeiter an das nächste Erstellungsdatum aus dem Abschlagsplan; setzt keine Kunden-Zahlungsfrist und bleibt unverändert. |
| Öffentliche Annahme/Zahlungslink | `offer-accept/index.ts`, `_shared/stripe-pay.ts`, `offer-pay/index.ts` | Annahme schloss individuelle Konditionen bereits von Vorkasse-Weiterleitung aus. Neue Zahlungslink-Angebote für individuelle Bedingungen jetzt ebenfalls ausgeschlossen. Alte Links/Zahlungen nicht verändert. |
| Portalassistenz | `b2b-chat/index.ts` | Profilfrist ausdrücklich als allgemein eingeordnet; konkrete Rechnungsfälligkeit hat Vorrang. Null-Tage-Wert nicht mehr auf 14 gesetzt. Kein Modellaufruf getestet. |
| Datenbank-Fälligkeit | Live-Definition `compute_invoice_due_date`, Trigger `trg_b2b_invoices_compute_due_date`, Migration 0201 | Abweichung korrigiert: neue/finalisierte Portalrechnung verwendet gespeicherte Tageszahl. Ausgestellte Datensätze werden bei späteren Updates nicht neu datiert. Keine Nachbearbeitung von Bestandsdaten, keine Rechteänderung. Anfrage-Rechnungen haben diesen Trigger nicht. |
| Datenbank-Überfälligkeit | Live-Definition `mark_overdue_invoices` | Liest `due_date`; keine eigene 14-Tage-Berechnung. Unverändert. |

## Durchgeführte Prüfungen

- Lucas echter Mitarbeiterzugang bei #6ZHACN: gespeicherter Entwurf enthält 3 Kalendertage; vor Korrektur echte Vorschau HTTP 200 mit 05.12.2026, nach Korrektur erneut HTTP 200 mit 24.11.2026 im Kopf und Zahlungshinweis.
- Beide Originalentwürfe mit unveränderten Zeitstempeln zurückgelesen; weiterhin null ausgestellte Rechnungen für diesen Auftrag. Keine Mail, Zahlung, Erstattung oder neue Kundenannahme ausgelöst.
- Isolierte Datenbanktests: neue Rechnung und Entwurfsfinalisierung mit 3 Tagen ergeben 24.11.2026; bestehende offene/bezahlte/überfällige/stornierte Rechnungen behalten ihr Datum.
- Miet-/Verkaufs-Abschlagseditor getestet: individueller Text übernommen und bearbeiteter Text in Vorschauauftrag enthalten.
- Portal-PDF direkt erzeugt: Kopf 3 Tage netto, Zahlungshinweis 24.11.2026; kein 14-Tage-Label.
- Zahlungslink-Tests bestanden. Fachtests für Fristen, Vorschaupflicht, Privatkunden, Erinnerungen und AB-Prüfung bestanden; aktueller Vorschau-Build ohne Fehler.

## Grenzen

- Echter endgültiger Rechnungs-/AB-/Abschlags-/E-Mail-Versand und Postfacheingang nicht ausgeführt; keine produktiven Belege nur zum Testen angelegt.
- Kein angenommener Mietauftrag mit individuellen Konditionen vorhanden: Abschlagsweg mit isoliertem Test geprüft, nicht als produktiver Kundenabschluss.
- Portal-Neuanlage und -Finalisierung mit Datenbank-/PDF-Tests und Code geprüft, nicht mit einer neu ausgestellten echten Rechnung Ende zu Ende.
- Zwei vorhandene Portal-PDF-Referenztests scheitern an 24 Layoutabweichungen; gleicher Fehler mit dem unveränderten vorherigen PDF-Code bestätigt. Referenz nicht ungeprüft ersetzt; vollständige Layoutfreigabe fehlt.
- Native Safari und separate andere Mitarbeiterkonten nicht geprüft. Neue Oberfläche noch nicht veröffentlicht; bereitgestellte Rechnungsfunktionen sind wirksam.