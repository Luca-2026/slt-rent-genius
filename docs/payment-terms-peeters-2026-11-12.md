# Zahlungsziel Blumen Stefan Peeters – 12.11.2026

## Belegt
- Auftrag #AYH2A6, Angebot ANG-M-2026-11-0003: `payment_terms=net_14`.
- Kundenprofil Blumen Stefan Peeters GmbH: Standard net_14 / 14 Tage; der konkrete Mietvorgang hat keine direkte B2B-Profilverknüpfung. Das Angebot selbst enthält die verbindliche Frist.
- RE-M-2026-11-0016 vom 09.11.2026: `payment_terms=vorkasse`, `payment_due_days=0`, fällig 09.11.2026, 533,95 € offen. Bei 14 Tagen wäre die Fälligkeit 23.11.2026.
- Ursache im Mitarbeitereditor: Rechnungsmodus übernahm aus dem Angebot nur Kundenreferenzen, nicht die Zahlungsbedingungen; ohne diese startete er ausdrücklich mit Vorkasse. Der Rechnungssender übernahm diese falsche Vorbelegung.

## Änderung und Prüfung
- Rechnungs-/Schlussrechnungsmodus erhält Zahlungsbedingungen und individuellen Text aus dem Angebot; Miet- und Verkaufsmodus nutzen denselben Editor. Vorhandene bewusste Entwurfs-/Mitarbeiterentscheidungen bleiben erhalten.
- Rechnungssender erbt bei fehlender expliziter Auswahl die gespeicherte Angebotsvereinbarung. Privatkunden erhalten dadurch kein Rechnungszahlungsrecht.
- 20 Tests bestanden: Miet-/Verkaufs-Rechnungsanforderung net_14, 14 Tage im Sender, individuelle Bedingungen, explizite Auswahl net_7 und Privatkundenschutz sowie bestehende Editorregeln.
- Mit Lucas echtem Mitarbeiterzugang den konkreten Auftrag geöffnet, „Rechnung erstellen“ gewählt: Zahlungsbedingung sichtbar 14 Tage. Tatsächlicher PDF-Vorschauabruf HTTP 200, Request net_14. PDF bestätigt „Zahlung innerhalb von 14 Tagen nach Rechnungsstellung (netto)“ und für eine heutige Vorschau 26.11.2026.
- Sender eingespielt; aktuelles Buildsignal OK. Oberfläche noch nicht veröffentlicht.

## Grenzen / vorhandene Belege
- Keine Rechnung erstellt, keine Kundenmail, keine Zahlung; die ausgestellte RE-M-2026-11-0016 und ihr Original-PDF wurden nicht still verändert. Eine belegte Zahlungszielberichtigung dieses Originals ist noch erforderlich; die neue Vorschau ist kein Ersatzbeleg.
- Zwei weitere gespeicherte Abweichungen gefunden: #83MKFB / RE-M-2026-10-0016 Angebot net_7, Rechnung vorkasse; #37GN3W / RE-M-2026-11-0022 Angebot net_14, Rechnung net_7. Nicht belegt, ob diese historischen Abweichungen bewusst gewählt wurden; nicht automatisch umgeschrieben.
- Geprüft: Vorschau im echten Auftrag. Nicht durchgeführt: endgültige neue Rechnungsstellung/Versand oder historische Berichtigung.