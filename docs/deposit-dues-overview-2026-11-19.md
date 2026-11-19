# Kautionsübersicht 19.11.2026

- Die Startseitenblöcke „Angenommene Angebote · Zahlungseingang“ und „angenommen und vollständig bezahlt“ entfallen. Die Kennzahl „Bestätigung offen“ sowie eigenständige Abschlussaufgaben bleiben erhalten.
- Eine konsolidierte Übersicht „Kaution zu erstatten“ ersetzt auch die bisherige reine Abrechnungsliste. Sie zeigt Kunde/Auftrags-ID, Artikel, Restbetrag und unterscheidet Abrechnung offen (ausdrücklich vorläufiger Rest), Auszahlung offen und Erstattung in Bearbeitung.
- Startseite und Mietvorgangsfilter `status=deposit_refund` lesen dieselbe Regel. Der Standort wird vom Startseitenlink übernommen; private/gewerbliche Kundenfilter und Rückkehrzustand bleiben bestehen. Kein Auftragsstatus schließt eine belegte offene Auszahlung aus.
- Bestätigt ausgezahlte oder vollständig verrechnete Kautionen verschwinden. Erfolgreiche Teilerstattungen reduzieren den Rest; ungeklärte Versuche bleiben sichtbar, nicht als bezahlt. Kombinierte Auszahlungen berücksichtigen erfolgreiche Teilzuordnungen und identische Providerbelege ohne doppelte Zählung. Keine Server-Auszahlungslogik geändert.
- Noch nicht abgerechnete Rückgaben berechnen eine gekennzeichnete Vorschau aus erhaltenen Zahlungen (zuerst Miete), vereinbarter Kaution und dokumentierten Rückgabekosten; laufende/bevorstehende Mieten ohne Rückgabe erzeugen keine Erstattungsaufgabe. Abgeschlossene manuelle Rückgaben und Stornos mit Kautionsrest bleiben auffindbar.
- Authentifizierte Leseabfragen, Seitenpakete und bestehende Datenrechte, fünfminütige Auffrischung plus vorhandene Live-Ereignisse; Ladefehler sichtbar statt einer behaupteten leeren Liste. Keine neue Tabelle/Funktion/Rechteänderung.

## Prüfung
33 Tests bestanden: neue neun konkrete Kautions-/Filterfälle sowie bestehende Abrechnung, Startseitenkennzahlen und Initialfilter. Build OK.

Als Luca auf Desktop 1280×1800, iPad 820×1180 und iPhone 390×844 geprüft: Bonn enthält #C38CW3 (100 € vorläufig), #FKR7UQ (20 € Auszahlung offen), #PWUZQQ (100 € Auszahlung offen). Der Filterlink zeigt genau dieselben drei Auftrags-IDs. #FKR7UQ aus der Liste geöffnet und nach Neuladen wieder angezeigt. Keine horizontalen Überläufe; abschließende Mobilbilder ohne Cookie-Überdeckung geprüft.

Keine Auszahlung, Kundenmail, Beleg- oder Auftragsänderung ausgelöst. Benedikts eigene Sitzung und tatsächliche neue Geldbewegung nicht geprüft; die bestehenden Auszahlungssperren/-berechtigungen bleiben unverändert. Oberfläche noch nicht veröffentlicht.