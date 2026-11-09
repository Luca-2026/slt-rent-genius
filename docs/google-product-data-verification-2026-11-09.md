# Google-Produktdaten – Prüfung vom 09.11.2026

## Meldung und Umfang

Quelle: Diagramm-19.csv, Metadaten-18.csv, Tabelle-17.csv und Screenshot vom 09.11.2026.
Google meldet: „Entweder offers, review oder aggregateRating müssen angegeben werden“.
Die Tabelle enthält 85 URL-Einträge, einschließlich Varianten mit/ohne abschließenden Slash und unterschiedlichen Kategorien.

## Nachgewiesene Ursache

- Alle 85 Live-Adressen lieferten HTTP 200; 62 enthielten ein Product ohne offers/review/aggregateRating, 20 kein Product und drei kein solches unvollständiges Product.
- Bei den drei im Screenshot genannten Artikeln sind die öffentlichen CMS-Preisfelder tatsächlich leer: MS01 Grabenräumlöffel, Rückwärtskippanhänger und Planenanhänger XXL. Es handelt sich nicht um einen verlorenen, nachgewiesenen Preis.
- Die gemeinsame Preisfunktion schloss echte Event-Paketpreise grundsätzlich aus. Dadurch hatten auch Artikel mit gepflegten Preisen kein Offer.
- Standortbewertungen wurden bewusst nicht als Produktbewertungen ausgegeben; sie dürfen nicht als Ersatz verwendet werden.

## Korrektur

1. Client und statische Suchmaschinen-Ausgabe geben Product nur mit echtem Offer aus. Preislose Artikel bleiben vollständig erreichbar; Standort- und Breadcrumb-Daten bleiben erhalten.
2. Gepflegte Event-Grundpreise werden als Mietpaket für 1–3 Kalendertage ausgegeben, nicht als Tagespreis. Der Paketbetrag wird einmal von netto auf brutto umgerechnet.
3. Die statische Exportquelle übernimmt den Event-Grundpreis zusätzlich zum Paketkennzeichen aus dem CMS.
4. Keine CMS-Daten, Preise, technischen Angaben, Bewertungen oder Buchungsregeln geändert.

## Prüfbelege

- 12 Tests in vier Dateien erfolgreich: Preisumrechnung, Monats-/Tageseinheiten, Paketpreis/-laufzeit, fehlende Preise, Product-Ausgabe, SEO-URLs und Head-Ausgabe.
- Die drei Screenshot-Seiten im echten Vorschau-Browser: Produktseite/H1 vorhanden, kein unvollständiges Product.
- LED-Lichterkette: echtes Offer mit 7,14 € brutto aus 6,00 € netto, eligibleDuration 1–3 DAY, PriceSpecification ohne falsche Tagespreiseinheit.
- Vier Beispielseiten im Browser geprüft, keine Laufzeitfehler; aktuelle Vorschau-Kompilierung erfolgreich.
- Alle 85 veröffentlichten URL-Einträge lesend geprüft. Ein zusätzlicher Browserdurchlauf aller 85 Vorschauseiten wurde wegen Laufzeit/Überlastung abgebrochen; keine vollständige Browserabnahme aller 85 behauptet.
- Der vollständige Produktions-Prerender/Export wurde nicht manuell ausgeführt; die gemeinsame statische Schemafunktion ist durch Tests geprüft.

## Veröffentlichung und Google

Noch nicht veröffentlicht. Die Korrektur muss auch auf dem tatsächlich unter www.slt-rental.de ausgelieferten Stand einschließlich statischer Produktseiten veröffentlicht werden. Falls diese Domain separat gehostet/deployed wird, reicht eine Veröffentlichung der App-Domain allein nicht.
Erst anschließend in Search Console „Fehlerbehebung überprüfen“ starten. Googles erneute Prüfung und Rich-Result-Anzeige sind noch nicht bestätigt. Preislose Artikel erhalten bewusst kein Product-Rich-Result; ihre normalen Seiten bleiben bestehen.