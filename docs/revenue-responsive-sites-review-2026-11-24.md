# Umsatzansicht: getrennte Standorte und mobile Filter

## Änderungen
- Standortauswahl direkt sichtbar, linksbündig und mobil vollbreit; Zeitraum und Datumsnavigation bleiben innerhalb der verfügbaren Breite.
- Krefeld, Mülheim an der Ruhr und Bonn separat in Auswertung, Belegliste, Standortübersicht, CSV und Startseitenumsatz auswählbar.
- Additive Migration 0209 speichert den tatsächlichen Auswertungsstandort getrennt vom organisatorischen Berechtigungsbereich. Bestehende Belegbeträge, gemeinsame Kasse und Betreuung bleiben unverändert.
- Historische Standorte werden nur aus vorhandenen Quelldaten mit passender organisatorischer Zuordnung übernommen. Nicht belegte Standorte bleiben unzugeordnet; keine Schätzung. Nach Anwendung: kein Ereignis mit bekanntem organisatorischem Bereich ohne Einzelstandort.
- Admins und Superadmins erhalten alle Standorte; Ralf bleibt auf Bonn beschränkt. Auch Superadmin ohne zusätzliche Adminrolle isoliert geprüft.

## Tatsächliche Prüfung
- Lucas und Benedikts eigene Mitarbeiterkonten auf der Startseite verifiziert, anschließend alle drei Standorte und versendete/angenommene Angebote sowie fakturierte Umsätze bedient.
- November 2026 bis 24.11.: fakturiert netto Bonn 4.251,28 €, Krefeld 20.352,31 €, Mülheim an der Ruhr 145,00 €; zusammen 24.748,59 €, unverändert zur vorherigen Gesamtsumme.
- Mülheim-CSV heruntergeladen und zurückgelesen: eine November-Rechnung, Standort Mülheim an der Ruhr, 145,00 € netto. Startseite separat gefiltert: Monat 145,00 €, Quartal/Jahr 225,00 €.
- Ralfs eigene Mitarbeiteridentität verifiziert: alle drei Auswertungsstufen ausschließlich Bonn; keine Standortauswahl. Manipulierte URLs für Krefeld und Mülheim liefern 403 / 42501. Acht erfolgreiche Berichte auf Standortbereich, Belege und Standortübersichten geprüft.
- Lucas, Benedikts und Ralfs Ansichten bei 360/402/820/1280 px geprüft: keine horizontale Überschreitung; Standortauswahl mit Geschäftsart linksbündig. Auch freie Datumsauswahl bei allen Größen bedient. Screenshots geprüft; keine Browser-Laufzeitfehler.
- 53 Tests in vier Testdateien bestanden: Standorte, Bestandsbeleg-Übernahme ohne Betragsänderung, Superadminzugriff, Ralf-Schutz, Angebote/Rechnungen, Zeiträume und vorhandene Umsatzregressionen.
- Automatische Vorschauprüfung: build OK. Keine Kundenmail, Zahlung, Rechnung oder Auftragsänderung ausgelöst.

## Grenzen
- Native iPhone-Safari nicht verfügbar; mobile Größen wurden mit Chromium geprüft.
- Historische Angebots-Betragslücken bleiben sichtbar und werden nicht erfunden. Externe Umsätze und Deckungsbeiträge/Bonus sind weiterhin ausgeschlossen.
- Oberfläche nicht veröffentlicht; die additive Standortzuordnung ist bereits aktiv.