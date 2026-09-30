# Übergabe-/Rückgabeprotokolle und „Laufende Mietvorgänge“

Umsetzung in vier Etappen. Jede Etappe wird einzeln getestet (automatische Tests + Durchklicken im Browser als Admin, Handy- und Desktop-Ansicht), erst danach geht es weiter.

## Etappe 1 – „Laufende Mietvorgänge“ nur im Mietzeitraum
- Laufend = Auftragsbestätigung verschickt, keine Rechnung **und** heute liegt zwischen Mietbeginn und Mietende (bzw. Übergabe erfolgt, Rückgabe noch nicht).
- Bestätigte Aufträge in der Zukunft (z. B. 20.–21.10.) bleiben unter „Mietanfragen“, neuer Filter „Bestätigt – Mietbeginn steht bevor“.
- Mietende überschritten, aber noch keine Rückgabe: bleibt „laufend“ mit rotem Hinweis „Rückgabe überfällig“ (geht nicht verloren).
- Menü-Zähler und Startseite nutzen dieselbe Regel.

## Etappe 2 – Übergabeprotokoll aus Mietanfrage und aus dem Protokoll-Reiter
- In der Mietanfrage (Auftrag mit Auftragsbestätigung): Button „Übergabeprotokoll erstellen“, danach „Rückgabeprotokoll erstellen“.
- Reiter „Übergabeprotokolle“: Button „Neues Übergabeprotokoll“ → Auswahl eines Mietauftrags (Auftragsbestätigung verschickt oder angenommen, noch kein Rückgabeprotokoll), mit Suche nach Kunde/Nummer/Datum.
- Gleiches im Reiter „Rückgabeprotokolle“ (Auswahl: Aufträge mit Übergabe, aber ohne Rückgabe).
- Artikel, Mengen, Kunde, Zeitraum und Standort kommen automatisch aus dem Auftrag.

## Etappe 3 – Formular und Fotos
- Geführter Ablauf bleibt (Ausweis, Zustand, Betriebsstunden, Tank, Sauberkeit, Schäden, Unterschrift), Layout übersichtlicher und am Handy bedienbar (große Tasten, Kamera direkt öffnen).
- Bis zu **15 Fotos** je Protokoll (allgemeine Zustandsfotos + Schadensfotos zusammen), Zähler „7 / 15“, Bilder werden vor dem Hochladen verkleinert.
- Jedes Foto bekommt einen **Zeitstempel** (Aufnahmezeit, sonst Hochladezeit), sichtbar im Formular und im PDF.
- Schäden: Beschreibung, Artikel, Fotos – je Schaden einzeln.
- Unterschrift von Kunde und Mitarbeiter per Finger am Handy; „Kunde nicht anwesend“ bleibt möglich (Unterschrift später per Link).

## Etappe 4 – PDF
- Neues, einheitliches Layout wie Angebot/Auftragsbestätigung: Kopf mit Logo, Protokollnummer, zugehöriger Auftrag/Auftragsbestätigung, Kunde, Standort, Zeitraum; Artikeltabelle; Zustand; Schäden mit Fotos und Zeitstempel; Fotoanhang (bis 15, Raster mit Zeitstempel); Unterschriften mit Name, Datum, Uhrzeit.
- Test: Protokoll mit 15 Fotos und 2 Schäden am Handy-Format erstellen, unterschreiben, PDF öffnen und Seite für Seite prüfen (nichts abgeschnitten, Fotos lesbar). Testdaten werden danach gelöscht; E-Mails nur an luca@sandhoff.org.

## Technische Details
- Statusregel in `src/lib/inquiryStatus.ts` (`isRunningRental` bekommt `today`, `rental_start`, `rental_end`, Übergabe-/Rückgabeflag) + Tests.
- Protokolle hängen bereits über `rental_inquiry_id` an der Mietanfrage; Dialoge `DeliveryNoteDialog`/`ReturnProtocolDialog` bekommen eine Variante mit Mietanfrage statt B2B-Angebot; neue Auftragsauswahl-Komponente.
- Foto-Limit und Zeitstempel als gemeinsames, getestetes Modul (`protocolShared`), Speicherung als `{url, taken_at}`; alte Einträge (reine URLs) bleiben lesbar.
- PDF in `generate-delivery-note` / `generate-return-protocol` neu gesetzt, danach deployt.
