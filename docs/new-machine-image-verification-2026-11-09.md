# Neumaschinen: Google-Meldung „image fehlt“

## Quelle
Metadaten-19.csv, Tabelle-18.csv, Diagramm-20.csv und Screenshot vom 09.11.2026. Google nennt 20 Produkte auf derselben Übersichtsadresse `/verkauf/neumaschinen`.

## Ursache
Die Übersicht gab ihre 20 Listeneinträge als vollständige Product-Objekte mit Angeboten, aber ohne image aus. Zusätzlich enthielt der Händlerknoten vier generische Product-Angebote für ganze Produktgruppen ohne konkrete Produktbilder oder Preise.
Die eigentlichen Artikelseiten besitzen bereits Bildangaben aus den echten Maschinenbildern.

## Korrektur
- Übersicht als CollectionPage mit ItemList und Verweisen auf die einzelnen Artikelseiten dargestellt.
- Keine vollständigen Product-/Offer-Knoten mehr auf der Übersichtsseite; generische Händler-Angebote entfernt, vorhandener OfferCatalog erhalten.
- Detailseiten behalten Product, echte Bilder und Angebote unverändert.
- Detailverweise mit abschließendem Slash und kodiertem Slug.
- Keine Bilder generiert, keine CMS-Fakten, Preise oder sichtbaren Artikel geändert.

## Prüfung
- Veröffentlichte Übersichtsadresse: HTTP 200. Im direkt ausgelieferten HTML keine Product-/ItemList-Knoten gefunden; der beanstandete Fehler entsteht in der clientseitig ergänzten Ausgabe.
- Echter Vorschau-Browser: 20 Listeneinträge, eine CollectionPage und null Product-Knoten auf der Übersicht.
- Alle 20 verlinkten Artikelseiten geöffnet: jede enthält Product mit image und Offer. Kein Laufzeitfehler.
- Sichtbare Bilder der Übersicht und einer Artikelseite per Screenshot kontrolliert.
- Zehn bestehende Prüfungen für Verkaufskatalog/Bilder und SEO-Head erfolgreich; Vorschau-Kompilierung erfolgreich.

## Noch erforderlich
Die Änderung ist nicht veröffentlicht. Den korrigierten Stand auf www.slt-rental.de bereitstellen; danach in Search Console „Fehlerbehebung überprüfen“ starten. Googles erneute Prüfung und tatsächliche Rich-Result-Anzeige sind noch nicht bestätigt.