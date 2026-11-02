# Zubehör und passende Anhänger direkt in der Buchungsstrecke

## Ausgangslage (geprüft)
- 387 veröffentlichte Artikel, davon 64 mit hinterlegten Zubehör-Vorschlägen (290 Zuordnungen): 37 von 276 im Bau-Bereich, 27 von 111 im Event-Bereich. 323 Artikel haben keine Vorschläge.
- Die bestehenden Vorschläge sind teilweise unlogisch, zum Beispiel:
  - Anbaugeräte schlagen andere Anbaugeräte vor und teilweise sich selbst (z. B. Hydraulikhammer SHB40).
  - Der 3,5-t-Minibagger hat keinen Anhänger. Das ist richtig, sollte aber nachvollziehbar begründet sein.
  - Beim 2-t-Minibagger fehlen Fahrmatten und Kraftstoff, bei den Dumpern fehlen Anhänger.
- In der Buchungsstrecke der Website werden diese Vorschläge bisher nicht gezeigt.

## Ablauf für Kunden
Neuer Schritt im Pop-up: **1 · Zeitraum → 2 · Optionen → 3 · Zubehör → Warenkorb**
- Passendes Zubehör erscheint als Karte mit Bild, Name, CMS-Preis für denselben Zeitraum und dem Button „Hinzufügen“.
- Hinzugefügtes Zubehör wird eine eigene Warenkorbposition mit dem Zeitraum des Hauptartikels. Der Zeitraum lässt sich einzeln ändern.
- Anhänger lassen sich hier als Zubehör in die Anfrage aufnehmen, ohne Rentware. Die Online-Buchung über Rentware auf den Anhängerseiten bleibt unverändert.
- Ein Hinweis zum Gewicht stellt sicher, dass der Anhänger zur Maschine passt. Beispiel: 2,7-t-Minibagger (2.750 kg) mit 3.500-kg-Baumaschinenanhänger (Nutzlast 2.785 kg) passt nur ohne schwere Anbaugeräte.
- Ohne CMS-Preis zeigt die Karte „Preis im Angebot“. Gutscheine gelten für Zubehör weiterhin nicht.

## Bewertung jedes einzelnen Artikels
Für jeden der 387 Artikel prüfe ich nach festen Regeln:
1. **Bagger und Lader:** Anbaugeräte passend zur Aufnahme (MS01, MS03, MS08, MS10) und zur Gewichtsklasse.
2. **Anhänger:** Nur wenn das Maschinengewicht unter der Nutzlast laut CMS liegt. Gesamtgewicht und Führerscheinhinweis kommen aus dem CMS.
3. **Anbaugeräte:** Vorschlag sind die passenden Trägermaschinen, keine weiteren Anbaugeräte und nie der Artikel selbst.
4. **Verbrauch und Schutz:** Kraftstoff nur bei Geräten mit Tank, Fahrmatten bei Ketten- und Radmaschinen.
5. **Event:** Nur Zubehör, das technisch zusammengehört (z. B. Kabel und Verteiler zu Aggregaten, Stative zu Lautsprechern).
6. **Kein Zubehör:** Wenn nichts sinnvoll passt, bleibt die Liste bewusst leer und wird begründet.

Es wird nichts erfunden: Gewichte, Nutzlasten und Aufnahmen stammen nur aus dem CMS. Fehlt ein Wert, kommt der Artikel auf eine Rückfrageliste.

**Ergebnis vor jeder Änderung:** ein Prüfbericht mit allen 387 Artikeln (aktuell, Vorschlag, Begründung, Rückfragen) zur Freigabe. Erst danach werden die Zuordnungen im CMS gespeichert und protokolliert. Technische Daten, Preise und Texte bleiben unverändert.

## Reihenfolge
1. Prüfbericht für alle Artikel erstellen und von dir freigeben lassen.
2. Freigegebene Zuordnungen im CMS speichern.
3. Zubehör-Schritt im Pop-up bauen und Preise serverseitig aus dem CMS prüfen.
4. Test auf Mobil, Tablet und Desktop, unter anderem mit 2-t-, 2,7-t- und 3,5-t-Bagger und einem Event-Artikel.

## Technische Details
- Quelle der Vorschläge: `b2b_managed_products.suggested_accessory_slugs` (bereits vorhanden, bereits im Angebotseditor genutzt).
- Gewichtsprüfung in einer getesteten Funktion: Maschinengewicht (`weight_kg`) gegen die Nutzlast aus `specifications`. Ohne lesbare Nutzlast gibt es keinen Anhänger-Vorschlag.
- Zubehör läuft über dieselbe Preisprüfung `public-rental-quote` wie der Hauptartikel. Das Rentware-Gating für Anhängerseiten bleibt unverändert.
- Die Änderungen der Zuordnungen werden in `migration_price_log` oder einem gleichwertigen Protokoll festgehalten.
