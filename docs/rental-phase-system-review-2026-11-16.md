# Mietphasen: systemweite Nachprüfung, 16.11.2026

## Regel
Ein bestätigter Mietauftrag ist erst laufend, wenn die Übergabe vom Kunden unterschrieben ist. Geplante Start-/Endtermine und Mitarbeiterunterschriften allein reichen nicht. Erledigte Bestandsdatensätze werden nicht umgeschrieben.

## Gefundene und korrigierte Abweichungen
- Kalender/Startseite: Übergabe-Häkchen nur bei `status=signed`, nicht bei beliebigem vorhandenen Protokoll bzw. Zeitstempel.
- Alte Portalverwaltung: Aktiv-Badge verlangt eine Kundenübergabe; bestehende Rückgabe bleibt beendet. Die Übersicht enthält weiterhin bestätigte und aktive Altfälle, daher neutraler Titel.
- Kundenübersicht: aktive Mieten aus signierten Übergaben, direkt oder über das Angebot verknüpft; keine Startdatum-Abfrage als Aktivnachweis.
- Kunden-Mietliste: bestätigte/alte aktive Einträge werden ausschließlich für die Anzeige nach Signatur eingeordnet; Freimeldung nur nach Kundenübergabe.
- Alte Übergabefunktion: bei Kundenabwesenheit kein Aktiv-Schreiben; eigenständige Angebote starten als bestätigt; erledigte/stornierte Gruppenmitglieder werden nicht reaktiviert.
- Portal-Chat: bestätigte Aufträge ohne Kundenübergabe werden nicht als laufend gemeldet.
- Freimeldung: geschützte serverseitige Kundenübergabeprüfung ergänzt.
- Abschlusswidget: überschrittenes Mietende ohne Kundenübergabe erzeugt keine beendete Miete. Bestandsstatus `done`, vorhandene Rückgabe und manueller Abschluss behalten ihre Abschlussbedeutung.
- Rückgabeerinnerungen: Kundenübergabe vor Vorschau/Versand erforderlich; beide Stufen auch in der Datenbank geschützt. Historie bleibt lesbar; Rollenprüfung unverändert.

## Gelesen, bewusst unverändert
- Live-Funktionen `bind_signed_rental_handover`, `complete_delivery_signature`, `confirm_order`, `close_expired_rental_inquiries`, `close_rental_inquiry_on_invoice`.
- Bestands-/Schilderfunktionen `sign_reserved_sets`, `check_inventory_availability`, `guard_sign_inventory`, Storno-Freigabe und weitere aktive Zahlungs-/Angebotslink-Funktionen: `active` bezeichnet dort Reservierung/Link, nicht laufende Miete.
- Aktive Cron-Jobs einschließlich Anfrageabschluss, Zahlungs-/Angebotsnachfragen, Abschlagserinnerung und Kassenabschluss: keine datumsgesteuerte Aktivierung eines bestätigten Mietauftrags. Anfrageabschluss betrifft nur unbestätigte Anfragen; tatsächlicher Zeitplan wurde nicht geändert.
- Vereinbarte Mietdauer, Preise, Voraus-/Folgerechnungen, Gerätebelegung und geplante Kalendertermine bleiben datumsgesteuert; die Signaturregel ändert keine Vertrags- oder Verfügbarkeitsberechnung.
- Rückgaben bei Kundenabwesenheit bleiben mit Mitarbeiterunterschrift operativ abgeschlossen; das ist kein Nachweis eines Mietbeginns.
- Phasenunabhängige Rechnung/Kaution sowie bestehende Sonderbestätigung für Rückgabe ohne Übergabe bleiben erhalten.

## Prüfungen
- 89 Tests in acht Dateien bestanden, einschließlich beider Erinnerungsstufen und unveränderter Standort-/Rollenregeln im isolierten PostgreSQL-Test.
- Laufende Datenbank bestätigt die neue Erinnerungssperre.
- Echte Luca-Mitarbeiteransicht: Startseite, bevorstehende/laufende Mietvorgänge, Kalender und alte Portalverwaltung laden ohne Browserfehler.
- Alle zehn Mietfilter gegen 348 echte Aufträge/41 kundenseitig signierte Übergaben geprüft; bevorstehend 15, laufend 10. Andere aktuelle Zähler können sich durch parallele Mitarbeiterarbeit verändern.
- Echter verspäteter Auftrag #K9T6M2 bleibt nach Refresh bevorstehend auf Desktop, Tablet und Mobilgerät; kein horizontaler Überlauf.
- Im echten Detail von #K9T6M2 sind beide Rückgabeerinnerungen deaktiviert; kein Versand ausgelöst.
- Vorschau kompiliert ohne Fehler. Vier geänderte Serverfunktionen bereitgestellt.

## Grenzen
Keine Bestandsdatenbereinigung, Rechnung, Auszahlung, neue Unterschrift oder Kundenmail ausgelöst. Neuer Signatur-/Freimeldeablauf und Portal-Chat wurden nicht mit einem echten Kundenkonto vollständig ausgeführt; deren Regeln sind durch Codeprüfung und gemeinsame Logiktests abgesichert, nicht durch einen neuen realen Mietabschluss. Oberfläche nicht veröffentlicht. Keine vollständige Veröffentlichungsfreigabe für unbeteiligte, früher offene Zahlungstests.