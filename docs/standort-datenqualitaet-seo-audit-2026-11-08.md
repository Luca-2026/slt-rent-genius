# Standort-Datenqualität und SEO-Qualitätsaudit – 08.11.2026

Prüfumfang: Stammdaten (`src/data/locationData.ts`), Standortseiten, `mieten-in`-Landingpages,
Mietkategorieseiten, Produktdetailseiten (live auf www.slt-rental.de, clientseitig gerendert),
FAQ, Lieferung, Footer/Header, redaktionelle Daten (`productSEOData.ts`, `categoryExpertContent.ts`,
`localCategoryContent.ts`, `localSeoData.ts`, `moebelZelteContent.ts`, `moebelProductInfo.ts`,
`blogArticles.ts`), Sitemap und Canonical-Tags.

Referenz-Stammdaten (Quelle: `src/data/locationData.ts`):
- Krefeld (Hauptsitz): Anrather Straße 291, 47807 Krefeld – Mo–Fr 08:00–18:00, Sa 10:00–14:30, So geschlossen
- Bonn (Filiale): Drachenburgstraße 8, 53179 Bonn – Mo–Do 07:00–16:30, Fr 07:00–18:00, Sa/So geschlossen
- Mülheim an der Ruhr: Ruhrorter Str. 122, 45478 Mülheim – Online 24/7, Abholung nach Vereinbarung

## A. Durchgeführte Korrekturen

### 1. Falsche Bonner Hausnummer in Meta-Description der Regionalseite
- URL: `/mieten-in/bonn/`
- Alt: „Direkt am Standort Drachenburgstraße **5**." (`src/pages/LocalArea.tsx`)
- Neu: „Direkt am Standort Drachenburgstraße **8**."
- Begründung: Stammdaten + Impressum + JSON-LD nennen einheitlich Drachenburgstraße 8.

### 2. Falsche Bonner Hausnummer in Zelt-/Event-Expertentexten (2 Stellen)
- URLs: Kategorieseiten Zelte/Eventmobiliar (Bonn-Kontext)
- Alt: „Standort Bonn-Mehlem (Drachenburgstraße **1B**)" (`src/data/categoryExpertContent.ts`, Zeilen 3873, 3953)
- Neu: „Standort Bonn-Mehlem (Drachenburgstraße **8**)"
- Begründung: wie oben; 1B existiert in keiner Stammdatenquelle.

### 3. Krefelder Adresse/PLZ/Öffnungszeiten auf Bonn- und Mülheim-Produktseiten
- Betroffene URLs (live verifiziert): u. a. `/mieten/bonn/erdbewegung/minibagger-1t`,
  `/mieten/bonn/erdbewegung/minibagger-2t`, `/mieten/muelheim/erdbewegung/minibagger-1t`
  und alle weiteren Produktseiten, die Krefeld-gepflegte SEO-Texte wiederverwenden
  (16 Vorkommen „Anrather Straße 291", 5 Krefeld-Öffnungszeiten-Blöcke in `productSEOData.ts`).
- Alt (Beispiel Meta-Description Bonn): „1t Minibagger Bobcat E10Z in Bonn mieten … Abholung
  **Anrather Straße 291**." – FAQ: „Wo hole ich den Minibagger in Bonn ab? Am SLT-Hauptsitz,
  Anrather Straße 291, 47807 Krefeld …"
- Neu: Die Lokalisierungsfunktion `localizeProductText` (`src/data/productPageContent.ts`)
  ersetzt jetzt neben Stadtnamen auch Straße, PLZ-Ort und Öffnungszeiten anhand der Stammdaten
  und wandelt „SLT-Hauptsitz" außerhalb Krefelds in „SLT-Standort <Name>" um.
- Wichtig: Wahre Querverweise („…wird aus unserem Hauptsitz Krefeld disponiert") bleiben
  ausdrücklich erhalten (geschützt vor der Ersetzung) – standortübergreifende Dienstleistungen
  wurden nicht entfernt.
- Verifikation: 6 neue Tests (`src/test/localizeProductText.test.ts`), alle grün.

### 4. Falsche Standort-E-Mail für Mülheim im Header
- Alt: Mülheim-Eintrag mit `krefeld@slt-rental.de` (`src/components/layout/Header.tsx`)
- Neu: `muelheim@slt-rental.de`
- Begründung: Stammdaten (`locationData.ts`) und Footer nennen einheitlich muelheim@slt-rental.de.

## B. Offene Standortkonflikte

1. **Regionsbegriff „Niederrhein" auf Bonn-/Mülheim-Seiten** (38 Vorkommen in `productSEOData.ts`).
   Beispiel: „Lieferung am Niederrhein" in der Meta-Description der Bonn-2t-Minibagger-Seite.
   Der Niederrhein ist das Krefelder Einzugsgebiet; für Bonn wäre Rhein-Sieg/Bonner Raum, für
   Mülheim das Ruhrgebiet korrekt. Nicht automatisch ersetzt, weil die Formulierungen grammatikalisch
   variieren („am Niederrhein", „Niederrhein-Umkreis", „Niederrhein-Gebiet") und eine pauschale
   Ersetzung Satzfehler riskiert. **Empfehlung:** redaktionelle Korrektur der betroffenen
   Krefeld-Texte um standortneutrale Liefergebiets-Formulierungen – oder gepflegte Bonn-/Mülheim-Varianten.
2. **URL aus dem Audit-Beispiel** `/mieten/bonn/erdbewegung/bobcat-e10z/` existiert nicht (404,
   „Produkt nicht gefunden"). Die tatsächliche Bonn-Seite heißt `…/minibagger-1t`. Der gemeldete
   Fehler trat dort real auf und ist mit Korrektur 3 behoben. Falls die alte URL extern verlinkt
   ist, wäre eine Weiterleitung sinnvoll – nur nach Freigabe (URL-Änderungen sind ausgeschlossen).

## C. Keyword-Kannibalisierung (potenziell, ohne Search-Console-Daten)

| URL 1 | URL 2 | Keywords | Suchintention | Risiko | Empfehlung |
|---|---|---|---|---|---|
| `/mieten/krefeld/` | `/mieten-in/krefeld/` | „Baumaschinen mieten Krefeld", „Anhänger mieten Krefeld" | **Identisch**: Title beider Seiten „Baumaschinen & Anhänger mieten in Krefeld \| SLT Rental", H1 nahezu gleich | **Hoch** | Eindeutige Rollen definieren: `/mieten/krefeld/` = Kategorie-Hub (transaktional), `/mieten-in/krefeld/` = regionale Landingpage (lokal-informativ, Stadtteile/Liefergebiet). Title/H1 differenzieren. |
| `/mieten/bonn/` | `/mieten-in/bonn/` | „Baumaschinen mieten Bonn" | Stark überlappend: „Baumaschinen & Equipment mieten in Bonn" vs. „Baumaschinen, Anhänger & Event-Equipment mieten in Bonn" | **Mittel–hoch** | Wie Krefeld: Titel/H1 klar trennen, interne Verlinkung mit unterschiedlichen Ankertexten. |
| `/mieten/muelheim/` | `/mieten-in/muelheim-an-der-ruhr/` | „Baumaschinen mieten Mülheim" | Überlappend, aber Description der Landingpage ist stärker lokal (Bobcat, Ruhrgebiet) | Mittel | Gleiche Differenzierung anstreben. |
| `/standorte/bonn/` | `/mieten/bonn/`, `/mieten-in/bonn/` | „SLT Rental Bonn", Adresse, Öffnungszeiten | **Unterschiedlich**: Standort-Info (Adresse/Zeiten/Kontakt) vs. Mietkatalog – keine Kannibalisierung | Niedrig | Keine Maßnahme. |
| `/standorte/krefeld/`, `/standorte/muelheim/` | jeweilige Mietseiten | Standortname + Adresse | Unterschiedliche Intention | Niedrig | Keine Maßnahme. |

Hinweis: Ohne Search-Console-Rankingdaten handelt es sich um **potenzielle** Kannibalisierung,
nicht um nachgewiesene Rankingkonkurrenz. Keine Seiten wurden gelöscht, umbenannt oder weitergeleitet.

## D. Canonical-Audit

| URL | Aktueller Canonical | Erwarteter Canonical | Bewertung | Empfehlung |
|---|---|---|---|---|
| `/` | `https://www.slt-rental.de/` | identisch | OK | – |
| `/standorte/`, `/standorte/{krefeld,bonn,muelheim}/` | selbstreferenziell, www, je genau 1 Tag | identisch | OK | – |
| `/mieten/{krefeld,bonn,muelheim}/` | selbstreferenziell | identisch | OK | – |
| `/mieten/bonn/erdbewegung/` (Kategorie) | selbstreferenziell | identisch | OK | – |
| Produktseiten (z. B. `/mieten/bonn/erdbewegung/minibagger-1t/`) | selbstreferenziell, kein Cross-Standort-Canonical | identisch | OK | – |
| `/mieten-in/{alle 30+ Regionen}/` | selbstreferenziell | identisch | OK | – |
| `/mieten-in/muelheim/` (ungültiger Slug, nicht in Sitemap/Verlinkung) | zeigt auf `/standorte/` | – | Auffälligkeit | Ungültige Slugs rendern die Standortübersicht mit fremdem Canonical statt 404. Nicht indexierbar-schädlich (Canonical zeigt weg), aber sauberer wäre ein 404. **Nur nach Freigabe** (technische Änderung). |

Konsistenz www/non-www: Alle geprüften Canonicals verwenden einheitlich `https://www.slt-rental.de`.
Keine mehrfachen Canonical-Tags, keine Cross-Standort-Canonicals gefunden. Sämtliche Canonical-Tags
wurden **nicht verändert**.

## E. Weitere Auffälligkeiten

1. **Öffnungszeiten heute konsistent**: `/standorte/`, `/standorte/bonn/`, FAQ und alle geprüften
   Kategorie-/Produkttexte entsprechen den Stammdaten (Bonn Mo–Do 07:00–16:30, Fr 07:00–18:00,
   Sa geschlossen; Krefeld Mo–Fr 08–18, Sa 10–14:30). Der im Brief genannte Widerspruch
   `/standorte/` vs. `/standorte/bonn/` ist im aktuellen Stand **nicht mehr vorhanden** –
   beide Seiten lesen dieselbe zentrale Quelle. Die 24/7-Anhängerabholung wird überall korrekt
   als Code-Abholung, nicht als Filialöffnung, bezeichnet.
2. **Mülheim-Telefonnummer** = Krefelder Nummer (02151 417 99 04) in allen Quellen einheitlich –
   konsistent, vermutlich gewollt (Konsolidierung), daher nicht geändert.
3. `localizeProductText` ersetzt Stadtnamen pauschal; wahre Querverweise auf den Hauptsitz
   Krefeld werden jetzt geschützt (s. A3).

## F. Abschlusskontrolle

- Keine Änderungen an Layout, Design, Navigation, Buchungsabläufen, Warenkorb, Preisen,
  Zahlungsprozessen, Datenbank, APIs oder Routing.
- Keine URLs geändert, gelöscht oder weitergeleitet; keine neuen Seiten.
- Keine Canonical-Tags, robots.txt, Sitemap oder Indexierungsregeln verändert.
- Keine SEO-Titel/Meta-Descriptions manuell umgeschrieben (die korrigierten Descriptions
  entstehen allein durch die sachliche Adresskorrektur in der Lokalisierungsfunktion).
- Geänderte Dateien: `src/pages/LocalArea.tsx`, `src/data/categoryExpertContent.ts`,
  `src/data/productPageContent.ts`, `src/components/layout/Header.tsx`,
  neu: `src/test/localizeProductText.test.ts`.
- Tests: 1.072 bestanden (3 PGlite-Suiten brachen im Vollauf wegen paralleler Zeitüberschreitung,
  einzeln alle grün: 30/30); Typecheck/Build: OK.
- Nicht vollständig geprüft: alle ~400 Produkt-SEO-Einträge wurden stichprobenartig und über
  Mustersuche (Adressen, PLZ, Zeiten, Stadtnamen) statt einzeln zeilenweise geprüft; CMS-gepflegte
  Texte in der Datenbank (seoFaqs, seoMetaDescription je Artikel) waren nicht Gegenstand, da sie
  redaktionell im CMS gepflegt werden.
- Nicht veröffentlicht: Die Korrekturen liegen im Code und werden mit dem nächsten Publish wirksam.
