# Lieferschein #SFJ6FB – Prüfung vom 18.11.2026

## Nachgewiesene Ursache
- Verkaufsauftrag 84bea3cc-39ee-4773-8072-15410d1e4856 ist erledigt, ohne order_confirmed_at, Angebotsannahme oder AB-Nummer.
- Angebot ANG-V-2026-11-0007, Rechnung RE-V-2026-11-0004 vom 15.11. über 4.188,99 €, vollständiger Bankeingang am 18.11. vorhanden.
- Die sichtbare Aktion und der Dienst verlangten bisher beide zwingend den AB-Zeitstempel. Als Luca vor der Änderung tatsächlich ausgegraut reproduziert. Historischer Grund für fehlende AB/Statuswechsel nicht belegt; kein Mitarbeiterfehler behauptet.

## Begrenzte Korrektur
- Gemeinsame Freigabe für bestätigte Verkaufsaufträge oder erledigte Verkäufe mit ausgestellter, nicht gekürzter voller/Schlussrechnung zum selben Angebot. Keine Freigabe allein durch erledigt, Zahlung, Abschlag, Gutschrift, Entwurf, Storno oder abweichendes Angebot.
- Ohne AB stammen Waren und Kunden-/Adressdaten aus der verknüpften Rechnung; deren ID/Nummer ist im neuen unveränderlichen Lieferschein-Snapshot dokumentiert.
- Sperrgrund sichtbar; keine automatische AB, Annahme, Wiedereröffnung, Rechnungs-, Zahlungs-, Bestands- oder Rechteänderung.

## Tatsächliche Ablaufprüfung
- 19 Regel-/Waren-/Unveränderlichkeitstests bestanden, Vorschau build OK, sales-delivery-note eingespielt.
- Echter Luca-Zugang: LS-2026-0082 für #SFJ6FB erstellt; Original-PDF HTTP 200, Auftrag/Angebot/Kunde und je 1 Stück BAUMAX KDe550 sowie Anhängerkupplung geprüft. Empfangsfelder leer, receipt_method/received_at weiterhin null.
- Nach Neuladen auf Desktop 1280×1800, iPad 820×1180 und iPhone 402×725 sichtbar; digitale und Papierdialoge geöffnet, ohne Kundenempfang zu bestätigen.
- Registrierter interner Testauftrag #5U673T: LS-2026-0084 mit explizit gespeicherter Agent-Testsignatur abgeschlossen, LS-2026-0085 mit simuliertem Test-Papier-PDF abgeschlossen; beide nach Neuladen aus Oberfläche und Daten gelesen. LS-2026-0083 bleibt als ununterschriebener Testversuch erhalten.
- Erste Signaturprüfung übersah den expliziten Unterschrift-speichern-Schritt; wiederholt erfolgreich. Erster Papier-Test hatte eine zukünftige Empfangszeit und wurde korrekt abgelehnt; mit vergangenem Datum gespeichert.

## Grenzen
- Keine reale Kundenunterschrift, Lieferung, Zahlung oder Mail ausgelöst. Kundenauftrag bleibt erledigt ohne AB; vorhandene Belege unverändert.
- Physischer Druck, nativer Safari und Benedikts eigene Sitzung nicht geprüft. Rechte unverändert, serverseitiger bestehender can_edit_operations-Schutz erhalten.
- Oberfläche nicht veröffentlicht. Kleine Handyaufnahmen teilweise durch Cookiehinweis verdeckt; Interaktionen und Neuladezustand waren erfolgreich.