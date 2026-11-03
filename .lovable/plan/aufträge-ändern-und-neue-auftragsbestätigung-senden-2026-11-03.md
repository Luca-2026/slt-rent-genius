# Aufträge ändern und neue Auftragsbestätigung senden

## Ergebnis
Bei angenommenen Mietangeboten eine zusätzliche Aktion **„Auftrag ändern / neue AB“** anbieten. Preise, Artikel, Mengen und Mietzeiträume lassen sich bearbeiten, ohne ein neues Angebot zu senden oder erneut online unterschreiben zu lassen. **„Neues Angebot“ und „Angebot überarbeiten“ bleiben erhalten.**

## Ablauf
1. Aktuellen Auftragsstand in die vorhandene Bearbeitungsmaske übernehmen; neue Artikel mit den gepflegten Preisen vorbelegen. Bestehende Sonderpreise nicht unbemerkt ersetzen.
2. Änderungen vornehmen und die mündliche/telefonische Vereinbarung mit Datum und kurzer Pflichtnotiz dokumentieren. Mitarbeiter und Erfassungszeit automatisch festhalten.
3. Neue AB als PDF prüfen. Nach weiteren Änderungen ist eine neue Vorschau erforderlich.
4. Geräteverfügbarkeit für geänderte Artikel und Zeiträume erneut prüfen. Konflikte ausdrücklich lösen; keine Doppelbelegung und keine stillschweigende Übernahme alter Gerätezuordnungen.
5. Geänderten Auftrag speichern und die neue, als Änderung erkennbare AB ausdrücklich senden. Keine Angebots-E-Mail, keine neue Angebotsannahme. Eine gescheiterte E-Mail bleibt wiederholbar, ohne weitere Auftragsfassung anzulegen.

## Belege und Zahlungen
- Ursprüngliches angenommenes Angebot, Unterschrift, frühere ABs und ausgestellte Rechnungen bleiben unverändert und abrufbar.
- Neue AB erhält eine eigene Fassung und nennt die unveränderte Auftrags-ID sowie ihren Bezug zum bisherigen Auftrag.
- Aktueller Auftrag, Kalender, Gerätebelegung, Protokolle und neue Rechnungsentwürfe verwenden denselben geänderten Stand.
- Bisherige Zahlungen bleiben erhalten; neue Auftragssumme, Kaution und Restbetrag werden centgenau ausgewiesen.
- Bei geänderter Zahlungssumme alte offene Zahlungslinks sicher außer Betrieb nehmen und einen neuen Link für den Restbetrag erzeugen; bereits erfolgte Zahlungen niemals erneut verlangen.
- Bestehende Zahlungsregeln nicht lockern: Die Änderung erlaubt nicht automatisch eine AB ohne die erforderliche Zahlung. Ein offener Betrag wird angezeigt und kann bezahlt werden, ohne ein neues Angebot zu benötigen.
- Bereits ausgestellte Rechnungen nicht überschreiben: erforderliche Gutschriften, Ergänzungs- oder neue Rechnungen bleiben gesonderte Belege. Bereits abgerechnete Kautionen nicht rückwirkend verändern.

## Technische Umsetzung
- Ergänzende, geschützte Auftragsfassungen mit unveränderlichen Inhalts-/Preis-/Zeitraumsständen und dokumentierter Vereinbarung; vorhandenes Originalangebot nicht überschreiben.
- Gemeinsame Ermittlung des gültigen Auftragsstands für AB, Zahlung, Kalender, Protokoll und künftige Rechnung.
- Vorhandene Angebotsmaske und Preisberechnung wiederverwenden, aber Änderung und Angebotsversand als getrennte Aktionen behandeln.
- Auftragsänderungen und Gerätezuordnungen kontrolliert und atomar speichern; konkurrierende Änderungen mit Konfliktantwort ablehnen.
- AB-PDFs versioniert speichern, Versand und Wiederholung an die geprüfte Fassung binden.
- Mitarbeiterberechtigung serverseitig prüfen; keine Erweiterung bestehender Rollenrechte.

## Abnahme
- Regeln für Originalerhalt, Preise, geänderte Mietdauer/Artikel, Restzahlung, Kaution, Konflikte und Wiederholungen automatisiert testen.
- Browserablauf auf PC, Tablet und Handy: angenommener Auftrag → Änderung → Vorschau → neue AB → Auftrag erneut öffnen und alle Beträge/Zeiträume zurücklesen.
- Testversand ausschließlich an **luca@sandhoff.org**; keine echten Kundenaufträge ändern und keine echte Online-Zahlung auslösen.
- PDF/E-Mail und Gerätebelegung am gespeicherten Testauftrag prüfen; sicherstellen, dass kein neues Angebot versendet wurde.
- Vollständige Mitarbeiter-Abnahme benötigt einen berechtigten Testzugang. Lucas aktueller Testfirma-Zugang zeigt „Kein Zugriff“ auf Mitarbeiter-Mietanfragen; falls weiterhin so, diese Einschränkung ausdrücklich berichten statt vollständige Abnahme behaupten.

## Umfang
Zunächst die Mietanfragen-Strecke mit vorhandener AB-Funktion. Keine pauschale Freigabe zur nachträglichen Änderung ausgestellter Rechnungen und keine automatische Erstattung oder Belastung.