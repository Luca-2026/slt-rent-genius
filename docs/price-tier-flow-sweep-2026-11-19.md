# Preisstaffeln – ergänzende Ablaufprüfung

## Regel
Gepflegte Preisstaffeln müssen auf den ausführlichen Artikelansichten für den gewählten Standort verfügbar sein; Privatkunden sehen brutto, Geschäftskunden netto. Berechnungen nutzen die gepflegte Staffel, keine erfundenen Werte. Listen und Suchergebnisse bleiben kompakte Einstiegspreisansichten; ausgestellte Belege bleiben ihre unveränderlichen Vereinbarungsnachweise.

## Gelesene Wege und Ergebnis
| Weg | Gelesener Nachweis | Ergebnis |
| --- | --- | --- |
| Website Artikel Desktop/Tablet/Handy | ProductDetail, ProductPriceBlock/RentalPriceTiers | Mobile Einbindung im vorherigen Schritt ergänzt. Weitere Abweichung: Standortflag ging in Produktabbildung verloren; korrigiert. |
| B2B-Portal Artikel Desktop/Tablet/Handy | B2BProductDetail/B2BInquiryCard | Nur Tages-/Wochenendpreis, keine Staffel; gemeinsame Netto-Staffel ergänzt. |
| Kategorien/Artikelkarten | ProductCard | Einstiegspreise, explizite Wochen-/Eventdarstellung; Detailslink zur vollständigen Staffel. Keine gleiche ausgeblendete Detailstaffel. |
| B2B-Katalog | B2BProductCard | Kompakte Listenpreise/Rabatthinweis, Detailslink; keine vollständige Staffel vorgesehen. |
| Standortsuche | ProductSearch | Zeigt Namen/Beschreibungen, keine Preisstaffel; keine betroffene Darstellung. |
| Startseitensuche/Artikelsuche | ProductSearchDialog, MietartikelSearch, productSearch | Einstiegspreis und Weiterleitung zur Detailansicht; keine Detailstaffel. |
| CMS-Laden/Cache | useManagedProducts, managedProductsCache, ManagedProductsProvider | Staffelwerte bleiben erhalten. prices_same_all_locations fehlte in öffentlicher View/Produktabbildung; additiv ergänzt. |
| Warenkorb/Zeitraum/Optionen | RentalRequestCart, public-rental-quote | Berechnung über Standortpreise/computeRentalLinePrice; Server liest alle Staffeln. Keine gleiche mobile Sichtbarkeitslücke. |
| Öffentliche Anfrage | send-inquiry-email | Quote wird serverseitig erneut aus CMS geladen. Keine Preisänderung an Artikeln. |
| B2B-Anfrage | B2BReservationDialog | Reservierungsanfrage ohne finale automatische Preiszusage, Zusatzleistungen sind Anfragendaten. |
| Mitarbeiterangebot/AB-Änderung | InquiryOfferForm loadRentalPricing/applyRentalPricing/Staffelauswahl | Liest alle Staffelspalten und Standortflag; manuelle Preise geschützt. |
| Angebotsversand/PDF | send-inquiry-offer Preisplausibilität, offer-pdf Positionsdarstellung | Gespeicherte Preise und Positionssnapshots; Prüfung nur Hinweis, keine automatische Änderung versendeter Belege. |
| Abschläge/Rechnungen | gemeinsamer installment-positions/installments und send-inquiry-invoice aus vorherigem Schritt | Vereinbarte Positionspreise, keine neue Katalogbepreisung bestehender Aufträge. |
| CMS-Preisfelder/Speichern | ManagedPriceFields, managedPriceSave, InventoryEditorDialog save | Alle Bau/Event/Wochenfelder; Änderungen werden gegen Baseline selektiv geschrieben, unveränderte Preise ausgelassen. |
| Datenbank-Preisquellen | Live managed_products_public/public_product_prices Viewdefinitionen | Alle Staffeln vorhanden; fehlendes gemeinsames Standortflag additiv in View ergänzt. Vorhandene Datensätze/Zugriffsrechte unverändert. |
| Datenbank-Speicherfunktion/Trigger | Live save_managed_article, parse_price_text, guard_internal_offer_article, audit_row_change, update_updated_at_column | Atomare gezielte Preispatches; Trigger keine automatische Staffelbereinigung. |
| Hintergrundjobs | Cron-Einträge mit price/managed/installment, installment-reminder | Gefundener Abschlagserinnerungsjob liest vereinbarten Planbetrag; verändert keine Artikelpreise. |
| Statische Website/Suchmaschinen | exportRoutes Preisübernahme, prerender-rental Preis-/Verfügbarkeitsblock | Einstiegspreis/Schema aus gepflegten Daten, keine vollständige interaktive Staffel; nach Laden React-Detailansicht maßgeblich. Kein Export oder Build manuell ausgeführt. |

## Korrekturen
- B2BInquiryCard nutzt dieselbe RentalPriceTiers mit erzwungener Geschäfts-/Nettoanzeige, auf beiden Ansichten.
- Product.pricesSameAllLocations wird vom öffentlichen CMS-Datensatz übernommen und productManagedPrices übergeben.
- Migration 0199 ergänzt nur die bereits vorhandene nicht sensible Preiszuordnungsinformation in managed_products_public. Keine Datenänderung, keine geänderten Rechte oder Einstellungen; Live-Feld zurückgelesen.

## Prüfung
- 134 Tests bestanden: zwei neue konkrete Standortquellentests plus bestehende Bau/Event/Wochen-, Quote-, Umrechnungs-, Speicher- und Anhängertests.
- Automatische Prüfung Build OK.
- Echter Luca-Zugang B2B-Artikel 1t-Minibagger Bonn: Desktop 1280×1800, Tablet 768×1024, Handy 402×725 zeigen Staffel ab 3 Miettagen 81 € netto; keine Browserfehler. Dies prüft Anzeige, nicht B2B-Kundenrabattentscheidungen mit einem Kundenkonto.
- Vorheriger öffentlicher Minibaggernachweis: Handy zeigt 107,10 / 96,39 / 85,68 / 64,26 € brutto; Datenbank war gesund und Preisabfrage HTTP 200.

## Grenzen beibehalten
Warum die konkrete Morgensitzung anders aussah, bleibt ungeklärt. Exakte zweite Screenshotmaschine und nativer iPhone-Safari nicht separat geprüft. Weitere Wege sind oben ausdrücklich als Codeprüfung ausgewiesen, nicht alle erneut Ende zu Ende ausgeführt. Kein neuer Anfrage-/Angebots-/Rechnungs-/Zahlungs-/Mailabschluss. Bestehende bezahlte, versendete, erstattete und geschlossene Belege unverändert. Oberflächenkorrekturen unveröffentlicht; ergänzte öffentliche Preiszuordnungsinformation bereits verfügbar.