# Kunden-E-Mail-Reduzierung – 07.11.2026

## Eingespielte Änderungen

| Bisherige Zusatznachricht | Neue Regel |
| --- | --- |
| Mietanfrage-Eingangsbestätigung | Keine separate Kundenmail; Standortnachricht und gespeicherte Anfrage bleiben |
| B2B-Anfrage-Eingangsbestätigung | Keine separate Kundenmail; interne Standort-/B2B-Nachricht bleibt |
| Kaufanfrage/Gebrauchtmaschinen-Eingangsbestätigung | Keine separate Kundenmail; interne Anfrage bleibt |
| Online-Angebotsannahme „Danke / jetzt bezahlen“ | Keine zusätzliche Kundenmail; Annahme und direkte Zahlungsweiterleitung bleiben |
| Automatische Zahlungsnachfrage nach einer Stunde | Abgeschaltet; Mitarbeiter können weiterhin bewusst manuell erinnern |
| Angebotsnachfragen alle zwei Tage | Unterdrückt, auch bei später aktivierter Versandfreigabe; Fristen und interne Ablehnungsnachrichten bleiben |
| Kautionserstattung | Keine separate Kundenmail; Erstattungsbuchung und Rechnungsausweis bleiben |
| Stripe-Erstattung zu Rechnungskorrektur | Keine separate Bestätigung; Rechnung/Korrektur bleibt der Nachweis |

## Erhalten

- Angebot und Überarbeitungen, Auftragsbestätigung, Rechnungen einschließlich Abschlägen und Schlussrechnung, erforderliche Gutschriften/Rechnungskorrekturen, Übergabe- und Rücknahmeprotokolle.
- Halteverbots-Direktbuchungs-Auftragsbestätigung, inklusive eigener Standortbenachrichtigung und Genehmigungsanhang.
- Vor-Ort-Unterschriftenkopie des Angebots: Wer vor Ort unterschreibt, benötigt weiterhin seine Vertragskopie; dies ist eine Dokumentkopie, keine bloße Statusmail.
- Sicherheits-/Passwort-/Einladungslinks, Registrierung/Freischaltung/Kreditentscheidungen, erforderlicher Übergabe-Unterschriftslink, Standortwechsel und Nichtverfügbarkeits-/Ablehnungsinformationen.
- Bewusst durch Mitarbeiter versandte Zahlungserinnerungen und persönliche Mitteilungen.
- Interne Meldungen: Zahlungseingang, Anfrage, Ablehnung, Aufgaben, fällige Abschläge, Feedback und 18-Uhr-Tagesabschluss an die Buchhaltung.
- Feedbackhinweis innerhalb bestehender Rechnungs-E-Mail erzeugt keine zusätzliche Mail. Separater manueller Gutscheinversand war bereits stillgelegt (410).

Die Zahlungseingangs-E-Mails im Stripe-Webhook gehen an das Standortpostfach, nicht an produktive Kunden. Sie wurden daher ausdrücklich nicht abgeschaltet. Externe Rentware-/Stripe-eigene E-Mails sind nicht Bestandteil dieser App-Versandstellen und wurden nicht umkonfiguriert.

## Prüfung

- 65 fokussierte Tests in neun Dateien bestanden: Versandrichtlinie, echte Edge-Handler mit isolierten Auth-/Zahlungsadaptern, Angebotsnachfragen, Zahlung/Forderungsstand, Gutschrift-/Mietguthabenerstattungen, Rechnungsguthaben, Schilder-Standortnachricht.
- Tatsächlicher `offer-payment-admin`-Handler: erfolgreiche Gutschrifterstattung durch Adapter, Antwort `customer_mailed:false`, kein E-Mail-Aufruf.
- Tatsächlicher `payment-reminder`-Handler: Zeitplanaufruf ohne Kundenabfrage/-versand, interne Ablehnungsverarbeitung weiter aufgerufen.
- Bereits versandte/abgelehnte Angebote bleiben idempotent; interne Ablehnungsnachricht im Test weiterhin erfolgreich.
- Sieben geänderte Versandfunktionen erfolgreich eingespielt. Letzter Preview-Build fehlerfrei.
- Mitarbeiterhinweise zur Kaution angepasst: keine irreführende Zusage einer separaten Kundenmail. Diese Anzeigeänderung benötigt noch Websiteveröffentlichung; die Versandänderungen sind bereits eingespielt.

## Grenzen der Abnahme

Eigenes Konto über `--self` angemeldet: Browser zeigt Testfirma und „Kein Zugriff“, Mitarbeiter-dry-run der Live-Erinnerungsfunktion liefert 401. Deshalb keine vollständige Mitarbeiter-Live-Abnahme behauptet. Keine Rollenänderung, kein neuer Testauftrag, keine Rechnung, keine Kundenmail und keine Geldbewegung ausgelöst. Echter Provider-Erstattungsablauf und Postfacheingang wurden in dieser Runde nicht getestet.

Eine individuelle Zahl bisher versandter Mails je Kunde wurde nicht ausgewertet; die Reduzierung ist anhand tatsächlich vorhandener Versandpfade belegt, nicht aus einer erfundenen Durchschnittsanzahl abgeleitet.