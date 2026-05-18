## Was du zurecht kritisiert hast

1. **„Zentrallager Bonn"** ist falsch. Bonn ist eine **Filiale** mit eigenem Mietpark, kein Zentrallager. Nur Krefeld ist Hauptsitz/Hauptlager.
2. **„Welche Rüttelplatte für Pflasterarbeiten in Bonn typisch"** ist keine Bonn-Frage, die Antwort gilt in Krefeld, Köln oder Hamburg genauso. Das ist Pseudo-Lokalisierung und schadet eher.
3. **Doppelte FAQs**: Verdichtung hat bereits einen FAQ-Block aus `ProductSEOContent` mit zwei Fragen. Mein neuer Block hat einen zweiten – auf der Seite stehen jetzt zwei „Häufige Fragen"-Sektionen.

## Leitlinien (gelten ab jetzt für alle Standorte/Kategorien)

- **Terminologie:** Nur Krefeld = „Hauptlager / Hauptsitz". Bonn = „Filiale Bonn / unser Standort Bonn". Mülheim = „Service-Standort Mülheim". Das Wort „Zentrallager" kommt ausschließlich vor, wenn wir die **Disposition aus Krefeld** beschreiben („Lieferung aus dem Hauptlager Krefeld") – nie als Bezeichnung für Bonn oder Mülheim.
- **Lokal = wirklich lokal:** Eine Frage / ein Satz gehört nur dann auf die Bonn-Seite, wenn die Antwort in Bonn **anders** ist als an anderen Standorten. Tests vorm Schreiben:
  - Würde derselbe Satz auf der Krefeld-Seite genauso stimmen? → Wenn ja, raus.
  - Stützt sich der Inhalt auf nachprüfbare Fakten (Adresse, Öffnungszeiten, Liefergebiet, Telefon, A-Anbindung)? → Wenn nein, raus.
- **Keine doppelten Blöcke:** Eine FAQ-Sektion pro Seite. Standort-FAQs werden in den bestehenden FAQ-Block **integriert**, nicht parallel gerendert.
- **NEVER invent data:** Keine Anekdoten („Sanierungen im Ahrtal"), keine Behauptungen über Projekte, die wir nicht belegen können.

## Was wirklich Bonn-spezifisch ist (recherchiert aus `locationData.ts`)

Hier die nachprüfbaren Fakten, die echte Differenzierung erlauben:

| Merkmal | Krefeld | **Bonn** | Mülheim |
|---|---|---|---|
| Adresse | Anrather Str. 291, Krefeld-Fichtenhain | **Drachenburgstr. 8, 53179 Bonn-Mehlem (linksrheinisch, Bad Godesberg)** | Ruhrorter Str. 122, Mülheim |
| Öffnung Mo–Fr | 08:00–18:00 | **07:00–18:00 (eine Stunde früher!)** | nach Vereinbarung |
| Samstag | 10:00–14:30 (nach Buchung) | **08:00–17:30 (regulär offen!)** | – |
| A-Anbindung | A44 | **A565, A555, B9** | A40, A52 |
| Einzugsgebiet | Niederrhein, Düsseldorf, MG, Duisburg-West | **Bonn, Rhein-Sieg, Ahrtal, Köln-Süd** | Ruhrgebiet |
| 24/7-Anhänger | ja | **ja, an der Drachenburgstraße** | ja |

Daraus lassen sich echte Bonn-FAQs ableiten, die in Krefeld so **nicht** stimmen:

- „Habt ihr in Bonn auch samstags offen?" → Ja, Sa 08:00–17:30 (vs. Krefeld nur nach Voranmeldung).
- „Wo genau ist der Standort Bonn?" → Drachenburgstr. 8, 53179 Bonn (Bad Godesberg, südlich des Bonner Stadtzentrums, direkt an der B9, schnelle Anfahrt aus Rhein-Sieg, Ahrtal und Köln-Süd).
- „Kann ich Anhänger in Bonn auch außerhalb der Öffnungszeiten abholen?" → Ja, 24/7 per SMS-Code an der Drachenburgstr.
- „Liefert ihr ins Ahrtal / nach Bad Honnef / Königswinter / Wachtberg?" → Ja, Lieferung im Rhein-Sieg-Kreis und linksrheinisch bis Ahrweiler/Sinzig.

Alles andere („welche Plattengröße für Pflaster") gehört in den **kategorischen** FAQ-Block, nicht in den Standort-Block.

## Umsetzungsschritte

1. **Wording-Fix in `productAvailability.ts`:**
   - Entferne „Zentrallager" für nicht-Krefeld-Standorte.
   - `available-warehouse` (Krefeld): „Verfügbar in unserem Hauptlager Krefeld".
   - `available-local` (Bonn/Mülheim mit Rentware-Code): „Vor Ort an unserer Filiale {Name} verfügbar" (Bonn) bzw. „Vor Ort am Standort {Name} verfügbar" (Mülheim).
   - `on-request`: „Lieferung aus unserem Hauptlager Krefeld" (statt „Zentrallager").

2. **`LocalCategoryContentBlock` umbauen:**
   - **FAQ-Sektion komplett entfernen.** Die lokalen FAQs werden nur noch in den FAQPage-JSON-LD geschrieben (für Google) und in den **bestehenden** FAQ-Block visuell eingehängt (siehe Schritt 4).
   - Sichtbar bleibt: **ein** Standort-Block mit Hookline (1 Satz) + harte Standort-Fakten (Adresse, Öffnungszeiten, A-Anbindung, Liefergebiet). Keine Use-Case-Prosa.

3. **`localCategoryContent.ts` neu strukturieren:**
   - Felder umbauen: `standortFakten` (statt `useCase`/`deliveryNote`/`hookline`) als kompakter Faktenblock.
   - `faqs` bleiben, aber nur **wirklich** lokale Fragen (siehe Tabelle oben).
   - Bonn-Verdichtung-Inhalt neu schreiben mit echten Fakten und realen Fragen. Generische „Welche Plattengröße"-FAQs ersatzlos streichen – die sind im Kategorie-FAQ.

4. **FAQ-Integration in `ProductSEOContent`:**
   - `ProductSEOContent` bekommt einen optionalen Prop `additionalFaqs`, der die Standort-FAQs an die Kategorie-FAQs anhängt.
   - `ProductDetail.tsx` reicht `getLocalCategoryContent(...).faqs` durch.
   - Damit: **eine** sichtbare FAQ-Sektion, mit allen Fragen drin. JSON-LD bleibt synchron.

5. **SSR-Intro in `seo-routes-rental.ts`:**
   - Statt `useCase` jetzt `standortFakten` in den Hero-Intro schreiben.
   - Verfügbarkeits-Statement bleibt.

6. **Visuelle QA nach Umsetzung:**
   - `/mieten/bonn/verdichtung/bonn-ruettelplatte-vp25/` öffnen.
   - Prüfen: kein „Zentrallager", nur **eine** FAQ-Sektion, Standort-Block enthält Adresse + Öffnungszeiten + A-Anbindung.
   - Krefeld-Vergleichs-URL: `/mieten/krefeld/verdichtung/ruettelplatte-vp25-50/` darf keinen Bonn-Block zeigen.

## Was ich danach nicht tue

- Keine erfundenen Bezüge auf Bonner Stadtteile, Projekte, „typische Einsätze".
- Keine zweite FAQ-Sektion.
- Keine Sätze, die in Krefeld genauso stimmen würden.

## Erst nach deinem OK

Setze ich Schritt 1–5 in Code um, danach gehen wir an Mülheim/Verdichtung (gleiche Logik, andere Fakten: Service-Standort, Disposition aus Krefeld 24 h, A40/A52, Ruhrgebiet-Einzugsgebiet).
