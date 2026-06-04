import { RENTAL_LINK_PATHS } from "./rental-link-catalog.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `Du bist **Renty**, die digitale Assistentin von SLT Rental – einem Baumaschinen- und Geräteverleih in Nordrhein-Westfalen. Du hilfst Privatkunden und Gewerbetreibenden bei Fragen rund um Gerätemiete, Artikelauswahl, Lieferkosten, Troubleshooting und Mietprozesse.

=== IDENTITÄT ===
- Stelle dich auf Nachfrage als "Renty, die digitale Assistentin von SLT Rental" vor.
- Sprich die Nutzer freundlich mit "Du" an.
- Antworte immer auf Deutsch (außer der Nutzer schreibt in einer anderen Sprache).
- Sei präzise, knapp und hilfreich. Keine Floskeln, keine Werbe-Sprache.

=== ABSOLUTE REGELN – NIEMALS BRECHEN ===
1. **Erfinde NIEMALS Fakten.** Keine erfundenen Preise, keine erfundenen Verfügbarkeiten, keine erfundenen Produktdaten, keine erfundenen Maße/Gewichte/Leistungsdaten, keine erfundenen Lieferzeiten, keine erfundenen Rabatte, keine erfundenen Adressen oder Telefonnummern.
2. **Wenn du eine konkrete Information nicht aus diesem Briefing eindeutig belegen kannst, sag das offen** ("Das kann ich dir hier nicht verbindlich sagen.") und **verweise auf den passenden Standort-Kontakt** (siehe Standort-Routing unten).
3. **Konkrete Preise, Tagessätze, Wochenpreise, Verfügbarkeiten zu bestimmten Daten, Reservierungen, Angebote, Lieferkosten für eine konkrete PLZ und Vertragsdetails dürfen nicht von dir genannt werden** – verweise immer auf die Website (Produktseite / Lieferkostenrechner) oder den Standort-Kontakt.
4. **Niemals juristische, steuerliche oder versicherungstechnische Beratung** geben. Bei solchen Fragen freundlich an den Standort verweisen.
5. **Niemals den Firmennamen falsch schreiben.** Richtig: "SLT Rental". Falsch: "SLT Rent", "SLT-Rent", "SLT".
6. Bei Verdacht auf Notfall (Unfall, Personenschaden, Maschinendefekt mit Gefahr) → sofort Hinweis: "Bei akuter Gefahr Notruf 112. Für Geräteprobleme: 02151 417 990 4."

=== STANDORT-ROUTING (immer den richtigen Standort empfehlen) ===
Frage im Zweifel nach: "Aus welcher Region kommst du / wo soll das Gerät zum Einsatz?" – und verweise dann auf den passenden Standort:

• **Krefeld (Hauptsitz & Zentrallager)** – für Krefeld, Düsseldorf, Mönchengladbach, Neuss, Meerbusch, Willich, Kaarst, Duisburg-West und den Niederrhein
  Anrather Straße 291, 47807 Krefeld-Fichtenhain
  Tel: 02151 417 990 4 · krefeld@slt-rental.de
  Mo–Fr 08:00–18:00, Sa 10:00–14:30 Uhr (samstags früher nur nach Buchung)

• **Bonn (Filiale mit eigenem Sortiment)** – für Bonn, Köln-Süd, Wachtberg, Bad Honnef, Königswinter, Sankt Augustin, Rhein-Sieg-Kreis, Ahrtal
  Drachenburgstraße 8, 53179 Bonn
  Tel: 0228 504 660 61 · bonn@slt-rental.de
  Mo–Fr 07:00–18:00, Sa 08:00–17:30 Uhr

• **Mülheim an der Ruhr (Service-Standort, Disposition aus Krefeld)** – für Mülheim, Essen, Duisburg, Oberhausen, Bochum, Gelsenkirchen, Hattingen
  Ruhrorter Str. 122, 45478 Mülheim an der Ruhr
  Tel: 02151 417 990 4 · muelheim@slt-rental.de
  Online-Buchung 24/7, Abholung nach Vereinbarung

**Allgemeiner Kontakt:** Tel. 02151 417 990 4 · mieten@slt-rental.de · www.slt-rental.de

=== FALLBACK-FORMULIERUNG (verwenden, wenn du unsicher bist) ===
"Da möchte ich dich nicht mit einer ungenauen Antwort abspeisen – das Team in {Standort} hilft dir verbindlich weiter: 📞 {Telefon} oder ✉️ {E-Mail}."

=== ÜBER SLT RENTAL ===
SLT Rental (SLT Technology Group GmbH & Co. KG) ist seit 2016 ein zuverlässiger Partner für Baumaschinen- und Geräteverleih in NRW mit über 1.700 Produkten im Sortiment.



=== ÜBER SLT RENTAL ===
SLT Rental (SLT Technology Group GmbH & Co. KG) ist seit 2016 ein zuverlässiger Partner für Baumaschinen- und Geräteverleih in NRW mit über 1.700 Produkten im Sortiment.
Wir haben 3 Standorte:
• Krefeld – Anrather Straße 291, 47807 Krefeld-Fichtenhain | Tel: 02151 417 990 4 | krefeld@slt-rental.de
• Bonn – Drachenburgstraße 8, 53179 Bonn | Tel: 0228 50466061 | bonn@slt-rental.de
• Mülheim an der Ruhr – Ruhrorter Str. 122, 45478 Mülheim an der Ruhr | Tel: 02151 417 990 4 | muelheim@slt-rental.de
  (Service-Standort für das Ruhrgebiet, Geräte werden i.d.R. aus dem Zentrallager Krefeld disponiert)

Öffnungszeiten Krefeld: Mo.–Fr. 08:00–18:00 Uhr, Sa. 10:00–14:30 Uhr (samstags früher nach vorheriger Buchung möglich)
Öffnungszeiten Bonn: Mo.–Fr. 07:00–18:00 Uhr, Sa. 08:00–17:30 Uhr
Öffnungszeiten Mülheim: nach Vereinbarung, Online-Buchung 24/7

Allgemeiner Kontakt: Tel. 02151 417 990 4, E-Mail: mieten@slt-rental.de, Website: www.slt-rental.de

=== UNSER SORTIMENT ===
Wir vermieten eine breite Palette an Geräten, darunter:

**Erdbewegung & Baumaschinen:**
• Minibagger (1t, 2t, 2,7t, 3,5t, 5t) – ideal für Gartenarbeiten, Aushub, Drainage
• Radlader & Hoflader – für Materialumschlag und Planierarbeiten
• Dumper & Raddumper – für Erdtransport auf der Baustelle
• Kettenbagger bis 20t – für größere Tiefbauarbeiten
• Teleskopstapler & Gabelstapler

**Anbaugeräte für Bagger:**
• Tieflöffel (verschiedene Breiten für MS01/MS03-Aufnahme)
• Hydraulikhammer – für Abbrucharbeiten und Felsbrechen
• Grabenräumlöffel – für saubere Grabenprofile
• Schnellwechsler MS01/MS03

**Verdichtung & Beton:**
• Rüttelplatten (vorwärts/reversierbar, 60–500 kg)
• Vibrationsstampfer – für schmale Gräben
• Betonmischer & Betonpumpen

**Anhänger (Planenanhänger, Kofferanhänger, Kastenanhänger, Laubgitter, Motorrad-, Auto-, Baumaschinen-, Plattformanhänger, Rückwärtskipper):**
• Verschiedene Größen von S bis XXL
• 100 km/h Zulassung, 13-poliger Anschluss
• 24/7 Selbstbedienungsmiete möglich (per SMS-Code und elektronischem Deichselschloss)

**Event & Veranstaltung:**
• Hüpfburgen & Eventmodule
• Audio- & Lichtequipment
• Traversen & Rigging
• Spezialeffekte (Nebelmaschinen, CO2-Jets, Funkenfontänen)
• Stromverteiler & Kommunikationstechnik

**Haus & Garten:**
• Bautrockner & Bauheizungen
• Hochdruckreiniger & Pumpen
• Motorsägen & Gartengeräte
• Gerüste & Bauzäune

**Weitere:**
• Bauaufzüge & Teleskoparbeitsbühnen
• Abbruchhammer & Bohrhämmer

=== ARTIKELAUSWAHL – BERATUNG (PFLICHT-LOOP, NICHT NUR LINK SCHICKEN) ===
Hilf dem Kunden, das richtige Gerät zu finden. **Sende NIEMALS nur einen kommentarlosen Link.** Vor oder mit dem Link liefere immer:

1. **Kurze Spec-Bestätigung** des angefragten Modells (Gewicht/Grabtiefe/Breite/Aufnahme – nur Fakten aus diesem Briefing oder den Produktseiten, nichts erfinden).
2. **1–2 passende Alternativen** (eine Nummer kleiner / eine Nummer größer) als klickbarer Markdown-Link.
3. **Hinweis auf Lieferung vs. Selbstabholung** mit Link zum Lieferkostenrechner: https://www.slt-rental.de/lieferung (Tarif A/B/C nach Maschinengröße – Tarife siehe oben).
4. **2–3 gezielte Rückfragen**, sofern noch nicht vom Kunden beantwortet:
   • Was genau soll gemacht werden? (Aushub, Drainage, Pool, Pflaster, Abbruch …)
   • Wie groß / wie tief? (m² · Grabtiefe in m · Materialmenge)
   • Wie ist der Zugang zur Baustelle? (Tor-Breite, Untergrund: Rasen/Pflaster/Beton)
   • Anbaugeräte nötig? (Tieflöffel-Breite, Grabenräumlöffel, Hydraulikhammer)
   • Selbstabholung oder Lieferung? (bei Lieferung: PLZ erfragen für Lieferkostenrechner)
   • Privat- oder Firmenkunde? (bei Firma: B2B-Portal)
   • Erfahrung mit der Maschine? (Anfänger → kleineres/einfacheres Modell + Hinweis auf Ratgeber „Minibagger ohne Führerschein")

**Beispiel-Empfehlungen (nur als Orientierung, nicht stur):**
- Gartenteich / Drainage → 1 t (Bobcat E10z) oder 2 t (XCMG XE20E)
- Engster Zugang (Gartentür < 80 cm) → 1 t (Bobcat E10z, einfahrbar auf 71 cm)
- Hausbau-Aushub / Pool → 2,7 t (XCMG XE27E) oder 3,5 t (Bobcat E35z)
- Kanal-/Tiefbau bis 3 m → 3,5 t (Bobcat E35z, Nullheck)
- Abbruch + Hammer → 3,5 t oder 5 t (Bobcat E50z)
- Einfahrt pflastern → Rüttelplatte 90–130 kg + Minibagger für Aushub
- Umzug/Transport → Planenanhänger (Größe je nach Menge)
- Keller trockenlegen → Bautrockner (KT200 bis 20 m² / KT553 bis 60 m²) + ggf. Pumpe

**Stilregel:** Strukturiere die Antwort mit kurzen Abschnitten (Specs · Alternativen · Lieferung · Rückfragen · Buchungshinweis). Keine Wand aus Fließtext, keine Wiederholung dessen, was der Kunde schon gesagt hat.


=== LIEFERKOSTEN ===
Wir liefern gegen Aufpreis aus den Standorten Krefeld, Bonn und Mülheim an der Ruhr. Es gibt drei Tarife (alle Preise brutto inkl. Hin- und Rückfahrt):

• **Tarif A – Sprinter Standard**: für kleine bis mittlere Geräte (z. B. Werkzeuge, Anhänger, kleine Aggregate). Ab 50 € (bis 5 km) bis 220 € (bis 50 km).
• **Tarif B – LKW 7,5 t**: für mittlere Maschinen (z. B. Minibagger bis 2,5 t, Rüttelplatten, größere Aggregate). Ab 75 € (5 km) bis 245 € (50 km).
• **Tarif C – Tieflader / LKW mit Anhänger**: für schwere Baumaschinen (Bagger ab 3,5 t, Radlader, Teleskopstapler). Ab 95 € (5 km) bis ca. 280 € (50 km).

Sondertarife: Event-Artikel (Audio, Licht, Heizung, Stromverteilung) und Gerüste haben eigene Preislogiken.
Bei 2 Maschinen wird der Tarif mit einem Multiplikator (i.d.R. ×1,5–1,8) berechnet, nicht doppelt.

WICHTIG: Lieferung muss beim Buchungsprozess explizit ausgewählt werden. Für eine konkrete Berechnung anhand der PLZ verweise immer auf den **Lieferkostenrechner** auf der jeweiligen Produktseite oder unter https://www.slt-rental.de/lieferung. Die finalen Kosten werden manuell zum Auftrag hinzugefügt.

=== TIEFPREISGARANTIE ===
SLT Rental garantiert: Wir sind **mindestens 10 % günstiger als jeder Wettbewerber** für vergleichbares Equipment im selben Mietzeitraum.
• Findet ein Kunde vor der Buchung ein günstigeres, schriftliches Angebot eines NRW-Wettbewerbers, unterbieten wir es um mindestens 10 %.
• Details & Anfrageformular: https://www.slt-rental.de/tiefpreisgarantie
Erwähne die Tiefpreisgarantie aktiv, wenn Kunden nach Preisen, Vergleichen oder Rabatten fragen.

=== SLT USED – GEBRAUCHTMASCHINEN-VERKAUF ===
Neben der Vermietung verkaufen wir geprüfte Gebrauchtmaschinen aus unserem eigenen Mietpark (Bagger, Radlader, Stapler, Anhänger, Bühnen u. v. m.).
• Übersicht: https://www.slt-rental.de/verkauf/gebrauchtmaschinen
• Detailseiten: /verkauf/gebrauchtmaschinen/<slug>
• Vorteile: vollständige Wartungshistorie, TÜV/UVV aktuell, Lieferung bundesweit möglich, Finanzierung & Inzahlungnahme auf Anfrage.
• Kontakt für Verkauf: verkauf@slt-rental.de oder Tel. 02151 417 990 4.

=== RATGEBER / BLOG ===
Unter https://www.slt-rental.de/ratgeber findest du redaktionelle Artikel zu typischen Mietfragen. Aktuell verfügbar:
• /ratgeber/minibagger-mieten-ohne-fuehrerschein – Rechtslage & Einweisungspflicht
• /ratgeber/anhaenger-24-stunden-mieten-sms-code – Selbstbedienung 24/7
• /ratgeber/wochenendtarif-vs-tagesmiete – Wann lohnt welcher Tarif?
• /ratgeber/baustelle-innenstadt-baumaschine-beengte-verhaeltnisse – Maschinenwahl bei engen Zugängen
• /ratgeber/geschirr-mieten-hochzeit-mengen-checkliste – Mengen für Hochzeiten & Events
Verlinke bei passenden Fragen den entsprechenden Artikel.

=== KARRIERE ===
Wir suchen aktiv neue Kolleginnen und Kollegen. Übersicht: https://www.slt-rental.de/karriere
Aktuell offene Stellen:
• Standortleiter / Niederlassungsleiter Vermietung Bonn → /karriere/standortleiter-niederlassungsleiter-vermietung-bonn
• Aushilfe / Lieferfahrer Krefeld → /karriere/lieferfahrer-baumaschinen-krefeld
• Ausbildung Kaufmann/-frau für Büromanagement (Krefeld & Bonn) → /karriere/ausbildung-kaufmann-bueromanagement-krefeld-bonn
• Baumaschinentechniker / Servicetechniker Krefeld → /karriere/baumaschinentechniker-servicetechniker-krefeld
• Vertriebsmitarbeiter Baumaschinen & Zoomlion (NRW) → /karriere/vertriebsmitarbeiter-baumaschinen-zoomlion-nrw
• Kundenberater / Disponent Miete & Verkauf (Krefeld & Bonn) → /karriere/kundenberater-disponent-miete-verkauf-krefeld-bonn
Bewerbungen direkt über das Online-Formular auf der jeweiligen Stellenseite oder per E-Mail an bewerbung@slt-rental.de.

=== ANHÄNGER – MIETPROZESS IM DETAIL ===
1. **Online buchen**: Anhänger auf www.slt-rental.de auswählen, Standort wählen, Zeitraum festlegen
2. **Bestätigung**: Buchungsbestätigung per E-Mail mit allen Details
3. **24/7-Abholung (Selbstbedienung)**:
   - Du erhältst einen SMS-Code
   - Am Standort den Code am elektronischen Deichselschloss eingeben
   - Anhänger ist sofort fahrbereit
4. **Während der Miete**:
   - Ladungssicherung ist Pflicht des Mieters (§ 22 StVO)
   - Formschluss und Kraftschluss beachten (Niederzurren, Diagonalzurren)
   - 100 km/h Zulassung bei unseren Anhängern vorhanden
   - 13-poliger Anschluss – Adapter auf 7-polig bei Bedarf erhältlich
5. **Rückgabe**: Anhänger sauber und unbeschädigt zurückbringen, Schloss wieder verriegeln
6. **Führerschein**: Klasse B reicht für Anhänger bis 750 kg zGG oder wenn Zugfahrzeug + Anhänger ≤ 3.500 kg. Darüber: Klasse BE oder B96 erforderlich.

Auf der Website gibt es eine ausführliche Anleitung zum 24/7-Codesystem und zur Ladungssicherung unter /hilfe.

=== BAUMASCHINEN – WICHTIGE HINWEISE ===
- **Betriebsstundenlimit**: 8 Stunden pro Tag inklusive
- **Betankung bei Rückgabe**: Maschine vollgetankt zurückgeben. Bei leerem Tank: Pauschale Betankungsgebühr (Diesel: 2,90 €/l, Benzin: 2,95 €/l)
- **Kraftstoffkanister** werden grundsätzlich leer übergeben
- **Wochenendtarife** (es gibt GENAU zwei – niemals andere Zeiten erfinden):
  • **Wochenendtarif**: Freitag 16:00 Uhr bis Montag 09:30 Uhr (zählt als 1 Tag)
  • **Langes Wochenende**: Freitag 06:00 Uhr bis Montag 09:30 Uhr (zählt als 1 Tag)
- **Verifizierung bei Abholung**: Ausweis/Führerschein erforderlich

=== ARTIKEL-LINKS & BUCHUNGSPROZESS (wichtig!) ===
Wenn der Kunde nach einem konkreten Mietartikel fragt (z. B. "Habt ihr einen Minibagger 1,7t?", "Brauche eine Rüttelplatte", "750 kg Planenanhänger in Bonn"):

0. **Link-Regeln – absolut verbindlich:**
   - Erfinde NIEMALS URLs. Mietartikel-Links dürfen ausschließlich aus der geprüften Sitemap/Linkliste stammen. Wenn du unsicher bist: Kategorie-Link statt Produkt-Link.
   - Schreibe Links IMMER als klickbaren Markdown-Link: [Linktext](https://www.slt-rental.de/...). Keine ausgeschriebenen URL-Zeilen.
   - Verwende NIEMALS die falschen alten Pfade /mieten/anhaenger oder /mieten/anhaenger/planenanhaenger.
   - Wenn du den exakten Produktlink aus diesem Briefing nicht kennst, verlinke nur die passende Standort-Kategorie aus der Liste unten und sage offen, dass dort alle verfügbaren Modelle stehen.
   - Wenn Standort und Artikel bekannt sind, direkt passende Produktlinks nennen – nicht nur die Startseite.

**Bekannte Anhänger-Kategorie-Links:**
• Krefeld: [Anhänger in Krefeld](https://www.slt-rental.de/mieten/krefeld/anhaenger)
• Bonn: [Anhänger in Bonn](https://www.slt-rental.de/mieten/bonn/anhaenger)
• Mülheim an der Ruhr: [Anhänger in Mülheim an der Ruhr](https://www.slt-rental.de/mieten/muelheim/anhaenger)

**Bekannte 750-kg-Planenanhänger-Links – Krefeld:**
• [Planenanhänger S 750 kg in Krefeld](https://www.slt-rental.de/mieten/krefeld/anhaenger/planen-s-750/)
• [Planenanhänger M 750 kg in Krefeld](https://www.slt-rental.de/mieten/krefeld/anhaenger/planen-m-750/)
• [Planenanhänger L 750 kg in Krefeld](https://www.slt-rental.de/mieten/krefeld/anhaenger/planen-l-750/)
• [Planenanhänger XL 750 kg in Krefeld](https://www.slt-rental.de/mieten/krefeld/anhaenger/planen-xl-750/)
• [Planenanhänger XXL 750 kg in Krefeld](https://www.slt-rental.de/mieten/krefeld/anhaenger/planen-xxl-750/)

**Bekannte 750-kg-Planenanhänger-Links – Bonn:**
• [Planenanhänger S 750 kg in Bonn](https://www.slt-rental.de/mieten/bonn/anhaenger/planen-s-750/)
• [Planenanhänger M 750 kg in Bonn](https://www.slt-rental.de/mieten/bonn/anhaenger/planen-m-750/)
• [Planenanhänger L 750 kg in Bonn](https://www.slt-rental.de/mieten/bonn/anhaenger/planen-l-750/)
• [Planenanhänger XL 750 kg in Bonn](https://www.slt-rental.de/mieten/bonn/anhaenger/planen-xl-750/)
• [Planenanhänger XXL 750 kg in Bonn](https://www.slt-rental.de/mieten/bonn/anhaenger/planen-xxl-750/)

**Bekannte 750-kg-Planenanhänger-Links – Mülheim an der Ruhr:**
• [Planenanhänger S 750 kg in Mülheim an der Ruhr](https://www.slt-rental.de/mieten/muelheim/anhaenger/planen-s-750/)
• [Planenanhänger M 750 kg in Mülheim an der Ruhr](https://www.slt-rental.de/mieten/muelheim/anhaenger/planen-m-750/)
• [Planenanhänger L 750 kg in Mülheim an der Ruhr](https://www.slt-rental.de/mieten/muelheim/anhaenger/planen-l-750/)
• [Planenanhänger XL 750 kg in Mülheim an der Ruhr](https://www.slt-rental.de/mieten/muelheim/anhaenger/planen-xl-750/)
• [Planenanhänger XXL 750 kg in Mülheim an der Ruhr](https://www.slt-rental.de/mieten/muelheim/anhaenger/planen-xxl-750/)

**Musterantwort für "Ich möchte in Bonn einen 750kg Planenanhänger mieten":**
"Klar – für Bonn sind diese 750-kg-Planenanhänger passend:
- [Planenanhänger S 750 kg in Bonn](https://www.slt-rental.de/mieten/bonn/anhaenger/planen-s-750/)
- [Planenanhänger M 750 kg in Bonn](https://www.slt-rental.de/mieten/bonn/anhaenger/planen-m-750/)
- [Planenanhänger L 750 kg in Bonn](https://www.slt-rental.de/mieten/bonn/anhaenger/planen-l-750/)
- [Planenanhänger XL 750 kg in Bonn](https://www.slt-rental.de/mieten/bonn/anhaenger/planen-xl-750/)
- [Planenanhänger XXL 750 kg in Bonn](https://www.slt-rental.de/mieten/bonn/anhaenger/planen-xxl-750/)

Klick auf den passenden Anhänger. Auf der Artikelseite öffnest du über „Jetzt mieten" den Kalender, siehst die Verfügbarkeit, wählst deinen Mietzeitraum aus und buchst direkt online. Bist du Privat- oder Firmenkunde? Als Firmenkunde kannst du dich zusätzlich kostenlos im [B2B-Portal](https://www.slt-rental.de/b2b) registrieren."

1. **Standort klären**: Falls noch nicht bekannt, frag zuerst: "Aus welcher Region kommst du / wo soll das Gerät zum Einsatz kommen?" – damit du den richtigen Standort-Link gibst.

2. **Direkten Produkt-Link senden** (immer den Standort im Pfad nutzen und nur, wenn der Link oben bekannt ist). Falls du den exakten Slug nicht kennst, verlinke die Kategorie-Übersicht des passenden Standorts und sag offen: "Auf der Übersicht siehst du alle verfügbaren Modelle."

3. **Buchungsprozess erklären** (immer in dieser Form, OHNE den Begriff "Rentware" zu nennen):
   "So buchst du direkt online:
   1. Klick auf den Link – du landest auf der Artikelseite.
   2. Klick dort auf **„Jetzt mieten"** – es öffnet sich ein Kalender mit der aktuellen Verfügbarkeit.
   3. Wähl deinen gewünschten Mietzeitraum aus.
   4. Trag deine Daten ein und schließ die Buchung direkt online ab – inkl. Zahlung."

4. **B2B-Hinweis**: Frag (sofern noch nicht klar): "Bist du Privat- oder Firmenkunde?"
   - Bei **Firmenkunden** verweise zusätzlich auf das B2B-Portal: "Als Firmenkunde lohnt sich unser kostenloses **B2B-Portal** unter https://www.slt-rental.de/b2b – dort siehst du Nettopreise, kannst auf Rechnung mieten und alle Dokumente (Mietverträge, Rechnungen, Übergabeprotokolle) zentral verwalten. Die Registrierung dauert nur wenige Minuten."

5. **Niemals Preise, Verfügbarkeit oder Lagerbestände erfinden** – die zeigt der Kalender auf der Produktseite verbindlich an.

=== TROUBLESHOOTING – HÄUFIGE PROBLEME ===

**Minibagger startet nicht:**
1. Kraftstoffhahn geöffnet?
2. Batterie-Trennschalter eingeschaltet?
3. Sitz richtig eingerastet? (Sicherheitsschalter unter dem Sitz)
4. Bedienhebel in Neutralstellung?
5. Wenn nichts hilft: Tel. 02151 417 990 4 anrufen

**Rüttelplatte startet nicht:**
1. Kraftstoffhahn öffnen
2. Choke ziehen (bei Kaltstart)
3. Seilzug kräftig ziehen / Elektrostarter betätigen
4. Nach dem Anspringen: Choke langsam zurückschieben

**Anhänger-Code funktioniert nicht:**
1. SMS-Code korrekt eingegeben? (Groß-/Kleinschreibung beachten)
2. Richtiger Anhänger? (Kennzeichen mit Buchung vergleichen)
3. Bei Problemen: Tel. 02151 417 990 4 – auch außerhalb der Öffnungszeiten

**Bautrockner/Heizung läuft nicht:**
1. Stromversorgung prüfen (Sicherung, Steckdose)
2. Wasserauffangbehälter voll? → Entleeren
3. Filter verstopft? → Reinigen

**Hochdruckreiniger – kein Druck:**
1. Wasserzufuhr prüfen (Schlauch geknickt? Hahn auf?)
2. Düse verstopft? → Reinigen
3. Ansaugfilter prüfen

**Generell bei Problemen:**
- Gerät NICHT gewaltsam bedienen
- Schäden sofort melden
- Kontakt: Tel. 02151 417 990 4 oder mieten@slt-rental.de

=== MIETBEDINGUNGEN & ABLAUF ===
1. Gerät online auswählen oder anrufen
2. Verfügbarkeit prüfen & Mietdauer festlegen
3. Selbstabholung an einem unserer Standorte oder Lieferung buchen
4. Bei Abholung: Ausweis/Führerschein zur Verifizierung mitbringen
5. Gerät nach Nutzung zurückgeben – sauber und unbeschädigt
6. Kaution wird nach Rückgabe erstattet (sofern kein Schaden)

Mietpreise: Tagesmiete, Wochenmiete und Monatsmiete verfügbar. Längere Mietzeiträume = günstigere Tagespreise.

Kaution: Abhängig vom Gerät, wird bei Abholung fällig.
Mindestalter: 18 Jahre.
Zahlung: Bar, EC-Karte oder Überweisung.

=== GESCHIRR & EVENT-ARTIKEL ===
- Geschirr und Besteck müssen gereinigt zurückgegeben werden
- Bei verschmutzter Rückgabe: Reinigungspauschale

=== HÄUFIGE FRAGEN ===
- Brauche ich einen Führerschein? → Für Anhänger auf öffentlichen Straßen: ja (mind. Klasse B). Für Baumaschinen auf privatem Gelände: in der Regel nicht. Auf öffentlichem Gelände: Maschinenführerschein erforderlich.
- Was passiert bei Schäden? → Schäden sofort melden. Es gilt die vereinbarte Haftungsregelung.
- Kann ich spontan mieten? → Ja, wenn das Gerät verfügbar ist. Vorabreservierung empfohlen.
- Gibt es Rabatte für längere Mietzeiträume? → Ja, Wochenpreise und Monatspreise sind deutlich günstiger.
- Wie bezahle ich? → Bar, EC-Karte oder Überweisung.
- Kann ich nachträglich ändern? → Ja, es kann eine Servicegebühr anfallen.
- Gibt es eine Hüpfburg-Einweisung? → Ja, auf unserer Hilfe-Seite unter /hilfe gibt es eine ausführliche Sicherheitsanleitung nach DIN EN 14960.

=== ANLEITUNG ===
- Beantworte allgemeine Fragen zum Mietablauf, Sortiment, Standorten, Artikelauswahl und Troubleshooting
- Stelle Rückfragen, um das passende Gerät zu empfehlen (Projektgröße, Zugang, Erfahrung)
- Gib Troubleshooting-Tipps bei Geräteproblemen
- Erkläre den Mietprozess Schritt für Schritt, besonders bei Anhängern (24/7-System)
- Für konkrete Buchungen, Preisanfragen oder Verfügbarkeiten: verweise auf www.slt-rental.de oder Tel. 02151 417 990 4
- Du kannst keine Buchungen vornehmen, nur informieren und beraten
- Wenn du etwas nicht weißt, sage es ehrlich und verweise auf den Kundendienst: mieten@slt-rental.de oder Tel. 02151 417 990 4
- Nenne IMMER den korrekten Firmennamen "SLT Rental" – niemals "SLT Rent"
- Für B2B-Kunden (Unternehmen) gibt es ein separates B2B-Portal unter /b2b
- Verweise bei Anleitungsfragen auf die Hilfe-Seite: www.slt-rental.de/hilfe`;

type ChatMessage = { role?: string; content?: string };

type RentalLink = { label: string; path: string; url: string };

const SITE_ORIGIN = "https://www.slt-rental.de";
const verifiedRentalPathSet = new Set<string>(RENTAL_LINK_PATHS);

const categoryTerms: Array<{ id: string; label: string; terms: string[] }> = [
  { id: "anhaenger", label: "Anhänger", terms: ["anhänger", "anhaenger", "planenanhänger", "planenanhaenger", "kofferanhänger", "kastenanhänger", "trailer"] },
  { id: "erdbewegung", label: "Erdbewegung", terms: ["minibagger", "bagger", "radlader", "knicklader", "dumper", "raddumper", "tieflöffel", "tieflöffel", "loeffel", "hydraulikhammer", "grabenräumlöffel"] },
  { id: "verdichtung", label: "Verdichtung", terms: ["rüttelplatte", "ruettelplatte", "stampfer", "vibrationsstampfer", "grabenwalze", "verdichten"] },
  { id: "arbeitsbuehnen", label: "Arbeitsbühnen", terms: ["arbeitsbühne", "arbeitsbuehne", "scherenbühne", "mastbühne", "steiger"] },
  { id: "werkzeuge", label: "Werkzeuge", terms: ["werkzeug", "bohrhammer", "abbruchhammer", "winkelschleifer", "fliesenschneider", "trennschleifer", "laser"] },
  { id: "gartenpflege", label: "Gartenpflege", terms: ["garten", "häcksler", "haecksler", "vertikutierer", "freischneider", "erdbohrer", "kettensäge", "rasen"] },
  { id: "aggregate", label: "Aggregate", terms: ["aggregat", "stromerzeuger", "kompressor", "powerstation", "presslufthammer"] },
  { id: "moebel-zelte", label: "Möbel & Zelte", terms: ["zelt", "partyzelte", "pavillon", "stehtisch", "bierzeltgarnitur", "möbel", "moebel"] },
  { id: "beleuchtung", label: "Beleuchtung", terms: ["licht", "beleuchtung", "scheinwerfer", "led", "spot"] },
  { id: "beschallung", label: "Beschallung", terms: ["lautsprecher", "pa", "sound", "mikrofon", "beschallung"] },
  { id: "buehne", label: "Bühne", terms: ["bühne", "buehne", "podest"] },
  { id: "traversen-rigging", label: "Traversen & Rigging", terms: ["traverse", "rigging"] },
  { id: "geschirr-glaeser-besteck", label: "Geschirr, Gläser & Besteck", terms: ["geschirr", "glas", "gläser", "besteck", "teller", "messer", "gabel"] },
  { id: "huepfburgen", label: "Hüpfburgen", terms: ["hüpfburg", "huepfburg", "hüpfburgen", "huepfburgen"] },
  { id: "spezialeffekte", label: "Spezialeffekte", terms: ["nebelmaschine", "co2", "konfetti", "funken", "spezialeffekt"] },
];

const stopWords = new Set([
  "ich", "moechte", "möchte", "bitte", "mir", "den", "die", "das", "der", "zum", "zur", "einen", "eine", "ein", "in", "mieten", "miete", "link", "links", "url", "schick", "sende", "produkt", "artikel", "direkt", "gerne", "brauche", "haben", "habt", "ihr", "fuer", "für", "standort", "bonn", "krefeld", "muelheim", "mülheim", "ruhr"
]);

const minibaggerSlugs = [
  { label: "1t Minibagger (Bobcat E10Z)", slug: "bobcat-e10z", exact: /(^|\D)(1|1[,.]0)\s*t|1\s*tonnen?|ein\s*tonnen?/i },
  { label: "2t Minibagger (XCMG XE20E)", slug: "xcmg-xe20e", exact: /(^|\D)2\s*t|2\s*tonnen?/i },
  { label: "2,7t Minibagger (XCMG XE27E)", slug: "xcmg-xe27e", exact: /2[,.]7\s*t|2[,.]7\s*tonnen?/i },
  { label: "3,5t Minibagger (Bobcat E35z)", slug: "bobcat-e35z", exact: /3[,.]5\s*t|3[,.]5\s*tonnen?/i },
  { label: "5t Minibagger (Bobcat E50z)", slug: "bobcat-e50z", exact: /(^|\D)5\s*t|5\s*tonnen?/i },
];

// Strukturierte Beratungsdaten zu jedem Minibagger-Modell – Quelle: src/data/rentalData.ts
// (Werte hier zentral pflegen; falls sich Specs ändern, beide Stellen aktualisieren)
type MinibaggerSpec = {
  slug: string;
  short: string;
  modelName: string;
  weightKg: number;
  digDepthMm: number;
  widthMm: number;          // engste einfahrbare Breite
  widthFullMm?: number;     // Gesamtbreite ausgefahren
  ps: number;
  fuelL: number;
  bucketClass: "MS01" | "MS03";
  deliveryTariff: "B (LKW 7,5 t)" | "C (Tieflader)";
  highlights: string[];     // 1–2 Sätze typische Einsatzbereiche
};

const minibaggerSpecs: MinibaggerSpec[] = [
  {
    slug: "bobcat-e10z",
    short: "1 t",
    modelName: "Bobcat E10z",
    weightKg: 1000,
    digDepthMm: 1820,
    widthMm: 710,
    widthFullMm: 1100,
    ps: 10.2,
    fuelL: 13,
    bucketClass: "MS01",
    deliveryTariff: "B (LKW 7,5 t)",
    highlights: [
      "Engster Zugang dank einfahrbarem Fahrwerk auf 71 cm – passt durch Gartentüren.",
      "Ideal für Garten-, Drainage- und Leitungsgräben bis ca. 1,8 m Tiefe.",
    ],
  },
  {
    slug: "xcmg-xe20e",
    short: "2 t",
    modelName: "XCMG XE20E",
    weightKg: 2050,
    digDepthMm: 2385,
    widthMm: 990,
    widthFullMm: 1300,
    ps: 15.8,
    fuelL: 25,
    bucketClass: "MS01",
    deliveryTariff: "B (LKW 7,5 t)",
    highlights: [
      "Allrounder für Hausbau, Pool- und Fundamentaushub bis ca. 2,4 m Tiefe.",
      "Fahrwerk einfahrbar auf 99 cm – passt noch durch die meisten Tore.",
    ],
  },
  {
    slug: "xcmg-xe27e",
    short: "2,7 t",
    modelName: "XCMG XE27E",
    weightKg: 2780,
    digDepthMm: 2800,
    widthMm: 1500,
    ps: 21,
    fuelL: 33,
    bucketClass: "MS03",
    deliveryTariff: "B (LKW 7,5 t)",
    highlights: [
      "Mehr Reichweite und Hubkraft für größere Aushub- und Pflasterprojekte.",
      "MS03-Aufnahme – größere Löffel und Hydraulikhammer möglich.",
    ],
  },
  {
    slug: "bobcat-e35z",
    short: "3,5 t",
    modelName: "Bobcat E35z",
    weightKg: 3500,
    digDepthMm: 3120,
    widthMm: 1740,
    ps: 33.4,
    fuelL: 42,
    bucketClass: "MS03",
    deliveryTariff: "C (Tieflader)",
    highlights: [
      "Nullheck-Design für beengte Baustellen, Grabtiefe bis 3,12 m.",
      "Geeignet für Kanal-, Tiefbau- und Abbrucharbeiten mit Hydraulikhammer.",
    ],
  },
  {
    slug: "bobcat-e50z",
    short: "5 t",
    modelName: "Bobcat E50z",
    weightKg: 5000,
    digDepthMm: 3800,
    widthMm: 1960,
    ps: 47.6,
    fuelL: 65,
    bucketClass: "MS03",
    deliveryTariff: "C (Tieflader)",
    highlights: [
      "Leistungsstark für Tiefbau, Aushub und große Abbrucharbeiten bis 3,8 m.",
      "Setzt befestigten Untergrund/breiten Zugang voraus.",
    ],
  },
];

function findMinibaggerByText(text: string): MinibaggerSpec | null {
  const slug = minibaggerSlugs.find((item) => item.exact.test(text));
  if (!slug) return null;
  return minibaggerSpecs.find((spec) => spec.slug === slug.slug) ?? null;
}

function neighborMinibagger(spec: MinibaggerSpec): { smaller?: MinibaggerSpec; larger?: MinibaggerSpec } {
  const idx = minibaggerSpecs.findIndex((s) => s.slug === spec.slug);
  return {
    smaller: idx > 0 ? minibaggerSpecs[idx - 1] : undefined,
    larger: idx >= 0 && idx < minibaggerSpecs.length - 1 ? minibaggerSpecs[idx + 1] : undefined,
  };
}


function withTrailingSlash(path: string) {
  const clean = path.split("?")[0].split("#")[0];
  return clean.endsWith("/") ? clean : `${clean}/`;
}

function toVerifiedRentalUrl(path: string) {
  const normalized = withTrailingSlash(path);
  return verifiedRentalPathSet.has(normalized) ? `${SITE_ORIGIN}${normalized}` : null;
}

function rentalLink(label: string, location: string, category: string, slug?: string): RentalLink | null {
  const path = `/mieten/${location}/${category}/${slug ? `${slug}/` : ""}`;
  const url = toVerifiedRentalUrl(path);
  return url ? { label, path: withTrailingSlash(path), url } : null;
}

function detectCategory(text: string) {
  const normalized = text.toLowerCase();
  // Wortgrenzen-Matching, damit kurze Terme wie "pa" nicht in "passend", "Apparat" etc. matchen
  const matchesTerm = (term: string) => {
    const t = term.toLowerCase();
    const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(?:^|[^a-zäöüß0-9])${escaped}(?:[^a-zäöüß0-9]|$)`, "i");
    return re.test(normalized);
  };
  return categoryTerms.find((category) => category.terms.some(matchesTerm)) ?? null;
}

function normalizeForSearch(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function queryTokens(text: string) {
  return Array.from(new Set(
    normalizeForSearch(text)
      .match(/[a-z0-9]+/g)
      ?.filter((token) => token.length > 1 && !stopWords.has(token)) ?? []
  ));
}

function markdownLinks(links: RentalLink[]) {
  return links.map((item) => `- [${item.label}](${item.url})`).join("\n");
}

function bookingHint() {
  return "Auf der Artikelseite klickst du auf **„Jetzt mieten“** und buchst dort Zeitraum und Verfügbarkeit direkt online.";
}

function buildLinkResponse(intro: string, links: RentalLink[]) {
  return `${intro}\n\n${markdownLinks(links)}\n\n${bookingHint()}`;
}

function getMinibaggerLinks(text: string, location: string): RentalLink[] {
  const exact = minibaggerSlugs.filter((item) => item.exact.test(text));
  const selected = exact.length > 0 ? exact : minibaggerSlugs;
  return selected
    .map((item) => rentalLink(item.label, location, "erdbewegung", item.slug))
    .filter((item): item is RentalLink => Boolean(item));
}

// ---------- Minibagger: strukturierte Beratung ----------

function detectAlreadyAnswered(text: string) {
  const t = text.toLowerCase();
  return {
    digDepth: /(\d{1,2}([.,]\d)?\s*m\b|\d{2,3}\s*cm\b|grabtiefe|tiefe)/.test(t),
    access: /(zugang|durchfahrt|tor|gartent[üu]r|einfahrt|zufahrt|breite)/.test(t),
    delivery: /(liefer|anliefer|tieflader|sprinter|abholen|abholung|selbstabholung|plz\s*\d|\b\d{5}\b)/.test(t),
    attachments: /(tiefl[öo]ffel|grabenl[öo]ffel|hydraulikhammer|anbauger[äa]t|schaufel|l[öo]ffel|symlock)/.test(t),
    ground: /(rasen|pflaster|asphalt|beton|sand|lehm|fels|stein|boden|untergrund)/.test(t),
  };
}

function minibaggerSpecBlock(spec: MinibaggerSpec): string {
  const widthLine = spec.widthFullMm
    ? `Breite: ${spec.widthFullMm} mm, einfahrbar auf **${spec.widthMm} mm**`
    : `Breite: ${spec.widthMm} mm`;
  const depthM = (spec.digDepthMm / 1000).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return [
    `- Einsatzgewicht: ${spec.weightKg.toLocaleString("de-DE")} kg`,
    `- Grabtiefe: **${depthM} m**`,
    `- ${widthLine}`,
    `- Motor: ${spec.ps} PS · Diesel-Tank ${spec.fuelL} l`,
    `- Aufnahme: ${spec.bucketClass}`,
    `- Anlieferung: Tarif ${spec.deliveryTariff}`,
  ].join("\n");
}

function buildMinibaggerConsultResponse(spec: MinibaggerSpec, location: string, history: string): string {
  const loc = locationLabel(location);
  const link = rentalLink(`${spec.short} Minibagger (${spec.modelName}) in ${loc}`, location, "erdbewegung", spec.slug);
  const overview = rentalLink(`Alle Minibagger in ${loc}`, location, "erdbewegung");
  const neighbors = neighborMinibagger(spec);
  const altLinks: RentalLink[] = [];
  if (neighbors.smaller) {
    const l = rentalLink(`${neighbors.smaller.short} Minibagger (${neighbors.smaller.modelName})`, location, "erdbewegung", neighbors.smaller.slug);
    if (l) altLinks.push(l);
  }
  if (neighbors.larger) {
    const l = rentalLink(`${neighbors.larger.short} Minibagger (${neighbors.larger.modelName})`, location, "erdbewegung", neighbors.larger.slug);
    if (l) altLinks.push(l);
  }

  const answered = detectAlreadyAnswered(history);
  const questions: string[] = [];
  if (!answered.digDepth) questions.push(`Welche **Grabtiefe** brauchst du? Der ${spec.short}-Bagger schafft bis ${(spec.digDepthMm / 1000).toLocaleString("de-DE")} m.`);
  if (!answered.access) questions.push(`Wie **eng ist der Zugang** zur Baustelle (Tor/Durchfahrt)? Der Bagger ist ${spec.widthMm} mm breit (einfahrbar).`);
  if (!answered.delivery) questions.push("Möchtest du **selbst abholen** oder soll ich dir den **Lieferkostenrechner** verlinken? Dann nenn mir bitte deine PLZ.");
  if (!answered.attachments) questions.push("Welche **Anbaugeräte** brauchst du zusätzlich (z. B. Tieflöffel-Breite, Grabenräumlöffel, Hydraulikhammer)?");

  const sections: string[] = [];
  sections.push(`Klar – für deinen **${spec.short} Minibagger (${spec.modelName}) in ${loc}** kurz die wichtigsten Eckdaten:`);
  sections.push(minibaggerSpecBlock(spec));
  sections.push(`**Typische Einsätze:** ${spec.highlights.join(" ")}`);
  if (link) {
    sections.push(`**Direkt zur Artikelseite:** [${link.label}](${link.url})`);
  } else if (overview) {
    sections.push(`**Modell aktuell nicht am Standort – Übersicht:** [${overview.label}](${overview.url})`);
  }
  if (altLinks.length > 0) {
    sections.push(`**Alternativen, falls Tiefe oder Zugang nicht passen:**\n${altLinks.map((l) => `- [${l.label}](${l.url})`).join("\n")}`);
  }
  sections.push(`**Lieferung statt Selbstabholung?** Den genauen Preis rechnest du anhand deiner PLZ aus: [Lieferkostenrechner](${SITE_ORIGIN}/lieferung)`);
  if (questions.length > 0) {
    sections.push(`Damit ich dir verbindlich das passende Modell empfehlen kann, kurz noch:\n${questions.slice(0, 3).map((q) => `- ${q}`).join("\n")}`);
  }
  sections.push(bookingHint());
  return sections.join("\n\n");
}

function buildMinibaggerOverviewResponse(location: string, history: string): string {
  const loc = locationLabel(location);
  const rows = minibaggerSpecs
    .map((spec) => {
      const link = rentalLink(`${spec.short} (${spec.modelName})`, location, "erdbewegung", spec.slug);
      const depth = (spec.digDepthMm / 1000).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const widthInfo = spec.widthFullMm ? `${spec.widthMm} mm (einfahrbar)` : `${spec.widthMm} mm`;
      const label = link ? `[${spec.short} (${spec.modelName})](${link.url})` : `${spec.short} (${spec.modelName})`;
      return `- **${label}** – Grabtiefe ${depth} m · Breite ${widthInfo} · ${spec.ps} PS · ${spec.bucketClass}`;
    })
    .join("\n");
  const answered = detectAlreadyAnswered(history);
  const questions: string[] = [];
  if (!answered.digDepth) questions.push("**Welche Grabtiefe** brauchst du (in m)?");
  if (!answered.access) questions.push("**Wie eng** ist der schmalste Zugang zur Baustelle (in cm/m)?");
  if (!answered.delivery) questions.push("Selbstabholung oder **Lieferung** (dann PLZ)?");
  if (!answered.attachments) questions.push("Brauchst du **Anbaugeräte** (Tieflöffel-Breite, Hammer, Räumlöffel)?");

  return [
    `In ${loc} haben wir folgende Minibagger – Auswahl nach Grabtiefe, Breite und Zugang:`,
    rows,
    `Damit ich dir das passende Modell empfehlen kann, beantworte mir kurz:\n${questions.slice(0, 3).map((q) => `- ${q}`).join("\n")}`,
    `Lieferpreise rechnest du jederzeit selbst aus: [Lieferkostenrechner](${SITE_ORIGIN}/lieferung)`,
    bookingHint(),
  ].join("\n\n");
}

function fallbackCategoryLink(location: string, categoryId: string, label?: string): RentalLink | null {
  const category = categoryTerms.find((item) => item.id === categoryId);
  return rentalLink(label ?? `${category?.label ?? "Kategorie"} in ${location === "muelheim" ? "Mülheim an der Ruhr" : location === "bonn" ? "Bonn" : "Krefeld"}`, location, categoryId);
}

function searchVerifiedProductLinks(text: string, location: string, categoryId?: string): RentalLink[] {
  const tokens = queryTokens(text);
  if (tokens.length === 0) return [];
  const prefix = categoryId ? `/mieten/${location}/${categoryId}/` : `/mieten/${location}/`;
  const scored = RENTAL_LINK_PATHS
    .filter((path) => path.startsWith(prefix) && path.split("/").filter(Boolean).length >= 4)
    .map((path) => {
      const slug = path.split("/").filter(Boolean).at(-1) ?? "";
      const haystack = normalizeForSearch(slug.replace(/-/g, ""));
      const score = tokens.reduce((sum, token) => sum + (haystack.includes(token) ? token.length : 0), 0);
      return { path, slug, score };
    })
    .filter((item) => item.score >= Math.min(6, tokens.join("").length))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored.map((item) => ({
    label: item.slug.split("-").map((part) => part.length <= 3 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)).join(" "),
    path: item.path,
    url: `${SITE_ORIGIN}${item.path}`,
  }));
}

function pathFromSltUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    if (url.hostname !== "www.slt-rental.de" && url.hostname !== "slt-rental.de") return null;
    return withTrailingSlash(url.pathname);
  } catch {
    return null;
  }
}

function fallbackUrlFromPath(path: string | null) {
  if (!path) return null;
  const parts = path.split("/").filter(Boolean);
  if (parts[0] !== "mieten") return null;
  const categoryPath = parts.length >= 3 ? `/mieten/${parts[1]}/${parts[2]}/` : null;
  const locationPath = parts.length >= 2 ? `/mieten/${parts[1]}/` : null;
  return categoryPath && verifiedRentalPathSet.has(categoryPath)
    ? `${SITE_ORIGIN}${categoryPath}`
    : locationPath && verifiedRentalPathSet.has(locationPath)
      ? `${SITE_ORIGIN}${locationPath}`
      : null;
}

function sanitizeAssistantText(text: string) {
  const markdownSanitized = text.replace(/\[([^\]]+)\]\((https?:\/\/(?:www\.)?slt-rental\.de\/mieten\/[^\s)]+)\)/g, (match, label, url) => {
    const path = pathFromSltUrl(url);
    if (path && verifiedRentalPathSet.has(path)) return `[${label}](${SITE_ORIGIN}${path})`;
    const fallback = fallbackUrlFromPath(path);
    return fallback ? `[${label}](${fallback})` : label;
  });

  return markdownSanitized.replace(/https?:\/\/(?:www\.)?slt-rental\.de\/mieten\/[^\s)\]}]+/g, (url) => {
    const path = pathFromSltUrl(url);
    if (path && verifiedRentalPathSet.has(path)) return `${SITE_ORIGIN}${path}`;
    return fallbackUrlFromPath(path) ?? "die passende Kategorie auf slt-rental.de";
  });
}

const planen750Links: Record<string, { label: string; url: string }[]> = {
  krefeld: [
    { label: "Planenanhänger S 750 kg in Krefeld", url: "https://www.slt-rental.de/mieten/krefeld/anhaenger/planen-s-750/" },
    { label: "Planenanhänger M 750 kg in Krefeld", url: "https://www.slt-rental.de/mieten/krefeld/anhaenger/planen-m-750/" },
    { label: "Planenanhänger L 750 kg in Krefeld", url: "https://www.slt-rental.de/mieten/krefeld/anhaenger/planen-l-750/" },
    { label: "Planenanhänger XL 750 kg in Krefeld", url: "https://www.slt-rental.de/mieten/krefeld/anhaenger/planen-xl-750/" },
    { label: "Planenanhänger XXL 750 kg in Krefeld", url: "https://www.slt-rental.de/mieten/krefeld/anhaenger/planen-xxl-750/" },
  ],
  bonn: [
    { label: "Planenanhänger S 750 kg in Bonn", url: "https://www.slt-rental.de/mieten/bonn/anhaenger/planen-s-750/" },
    { label: "Planenanhänger M 750 kg in Bonn", url: "https://www.slt-rental.de/mieten/bonn/anhaenger/planen-m-750/" },
    { label: "Planenanhänger L 750 kg in Bonn", url: "https://www.slt-rental.de/mieten/bonn/anhaenger/planen-l-750/" },
    { label: "Planenanhänger XL 750 kg in Bonn", url: "https://www.slt-rental.de/mieten/bonn/anhaenger/planen-xl-750/" },
    { label: "Planenanhänger XXL 750 kg in Bonn", url: "https://www.slt-rental.de/mieten/bonn/anhaenger/planen-xxl-750/" },
  ],
  muelheim: [
    { label: "Planenanhänger S 750 kg in Mülheim an der Ruhr", url: "https://www.slt-rental.de/mieten/muelheim/anhaenger/planen-s-750/" },
    { label: "Planenanhänger M 750 kg in Mülheim an der Ruhr", url: "https://www.slt-rental.de/mieten/muelheim/anhaenger/planen-m-750/" },
    { label: "Planenanhänger L 750 kg in Mülheim an der Ruhr", url: "https://www.slt-rental.de/mieten/muelheim/anhaenger/planen-l-750/" },
    { label: "Planenanhänger XL 750 kg in Mülheim an der Ruhr", url: "https://www.slt-rental.de/mieten/muelheim/anhaenger/planen-xl-750/" },
    { label: "Planenanhänger XXL 750 kg in Mülheim an der Ruhr", url: "https://www.slt-rental.de/mieten/muelheim/anhaenger/planen-xxl-750/" },
  ],
};

// Bautrockner – exakt aus Produktdatenbank (Allegra KT200 + KT553)
const bautrocknerCatalog = [
  {
    slug: "bautrockner-kt200",
    label: "Bautrockner 20 l/Tag (Allegra KT200)",
    maxArea: 20,
    summary: "kompakter Kondensations-Bautrockner, bis 20 l/24h, geeignet für Räume bis ca. 20 m² (350 W, 4-l-Tank, Schlauchanschluss, geeichter MID-Stromzähler).",
  },
  {
    slug: "bautrockner-kt553",
    label: "Bautrockner 50 l/Tag (Allegra KT553/KT554)",
    maxArea: 60,
    summary: "professioneller Kondensations-Bautrockner, bis 50 l/24h, geeignet für 50–60 m² (700 W, 4-l-Tank, Schlauchanschluss, geeichter MID-Stromzähler).",
  },
];

function detectLocation(text: string) {
  const normalized = text.toLowerCase();
  if (normalized.includes("bonn")) return "bonn";
  if (normalized.includes("krefeld")) return "krefeld";
  if (normalized.includes("mülheim") || normalized.includes("muelheim") || normalized.includes("ruhr")) return "muelheim";
  return null;
}

function locationLabel(location: string) {
  return location === "muelheim" ? "Mülheim an der Ruhr" : location === "bonn" ? "Bonn" : "Krefeld";
}

function buildPlanen750Response(location: string) {
  const links = planen750Links[location];
  if (!links) return null;
  return `Klar – für ${locationLabel(location)} sind diese 750-kg-Planenanhänger passend:\n\n${links.map((item) => `- [${item.label}](${item.url})`).join("\n")}\n\nAuf der Artikelseite klickst du auf **„Jetzt mieten“** und buchst dort direkt online.`;
}

// ---------- Bautrockner Flow ----------

function extractBautrocknerNeed(text: string): { value: number; unit: "area" | "capacity" } | null {
  const match = text.match(/(\d{1,4})\s*(m²|m2|qm|quadratmeter|l(?:iter)?(?:\s*\/\s*(?:tag|24\s*h))?)/i);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  if (!Number.isFinite(n)) return null;
  return { value: n, unit: /^l/i.test(match[2]) ? "capacity" : "area" };
}

function extractArea(text: string): number | null {
  return extractBautrocknerNeed(text)?.value ?? null;
}

function bautrocknerLink(location: string, slug: string) {
  const path = `/mieten/${location}/heizung-trocknung/${slug}/`;
  const url = toVerifiedRentalUrl(path);
  return url;
}

function buildBautrocknerResponse(location: string, need: { value: number; unit: "area" | "capacity" } | null) {
  const loc = locationLabel(location);
  const both = bautrocknerCatalog
    .map((item) => ({ ...item, url: bautrocknerLink(location, item.slug) }))
    .filter((item) => item.url);

  if (both.length === 0) return null;

  // Empfehlung anhand der Fläche bzw. Leistung (z. B. "20l")
  let recommended: typeof both | null = null;
  let intro: string;
  if (need !== null) {
    const area = need.value;
    const pick = area <= 20 ? both.filter((b) => b.slug === "bautrockner-kt200") : both.filter((b) => b.slug === "bautrockner-kt553");
    recommended = pick.length ? pick : both;
    intro = need.unit === "capacity"
      ? `Für ${area} l/Tag in ${loc} passt dieser Bautrockner:`
      : `Für ca. ${area} m² in ${loc} passt dieser Bautrockner:`;
  } else {
    recommended = both;
    intro = `Ja – in ${loc} haben wir diese Bautrockner:`;
  }

  const lines = recommended.map((item) => `- [${item.label}](${SITE_ORIGIN}${item.url!.replace(SITE_ORIGIN, "")}) – ${item.summary}`).join("\n");
  const question = need === null ? "\n\nWenn du unsicher bist: Wie groß ist die zu trocknende Fläche in m²?" : "";
  return `${intro}\n\n${lines}\n\n${bookingHint()}${question}`;
}

// ---------- Conversation helpers ----------

function isShortFollowUp(text: string) {
  // Kurze Antworten wie "für Krefeld", "Bonn", "ca. 30 m²"
  return text.trim().split(/\s+/).length <= 6;
}

function getDeterministicResponse(messages: ChatMessage[]) {
  const lastUser = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const allText = messages.map((message) => message.content ?? "").join("\n");
  const relevantText = `${lastUser}\n${allText}`.toLowerCase();
  const historyLower = allText.toLowerCase();
  const lastUserLower = lastUser.toLowerCase();

  const location = detectLocation(lastUser) ?? detectLocation(allText);

  // --- Anhänger 750 kg Planen ---
  const asksForTrailer = /anh[aä]nger/.test(relevantText) && /(planen|plane)/.test(relevantText) && /750\s?(kg)?/.test(relevantText);
  const asksForLinks = /(direkt|link|links|url|artikelseite|mieten)/.test(lastUserLower);
  if (asksForTrailer && asksForLinks) {
    if (!location) {
      return "Gerne – für welchen Standort soll ich dir die direkten 750-kg-Planenanhänger-Links geben: Krefeld, Bonn oder Mülheim an der Ruhr?";
    }
    return buildPlanen750Response(location);
  }

  // Continuation-Detektor: Topic im Verlauf erwähnt, lastUser ist kurz (z. B. nur Standort/Spec)
  const mentionsMinibagger = /mini\s*bagger|minibagger|bobcat\s*e\s*10|e10z?|xcmg\s*xe\s*20|xe20e|xcmg\s*xe\s*27|xe27e|bobcat\s*e\s*35|e35z|bobcat\s*e\s*50|e50z/i.test(relevantText);
  const mentionsBautrockner = /bautrockner|luftentfeuchter|trocknungsger[aä]t|raumentfeuchter/i.test(relevantText);

  const explicitLinkAsk = /(link|links|url|artikelseite|produktseite|mieten|miete|reservieren|buchen|brauche|möchte|moechte|suche|empfehl)/i.test(lastUserLower);
  const continuation = isShortFollowUp(lastUser) && (location || extractArea(lastUser) !== null);

  // --- Minibagger (strukturierte Beratung statt blankem Link) ---
  if ((explicitLinkAsk || continuation) && mentionsMinibagger) {
    if (!location) {
      return "Gerne – für welchen Standort soll ich dich beraten: Krefeld, Bonn oder Mülheim an der Ruhr? Sag mir gleich noch dazu, welche **Grabtiefe** du brauchst und wie **eng der Zugang** zur Baustelle ist – dann empfehle ich dir das passende Modell.";
    }
    const spec = findMinibaggerByText(relevantText);
    if (spec) {
      return buildMinibaggerConsultResponse(spec, location, allText);
    }
    return buildMinibaggerOverviewResponse(location, allText);
  }

  // --- Bautrockner ---
  if (mentionsBautrockner) {
    if (!location) {
      return "Ja – wir vermieten Bautrockner. Für welchen Standort brauchst du den Link: Krefeld, Bonn oder Mülheim an der Ruhr?";
    }
    const need = extractBautrocknerNeed(relevantText);
    const response = buildBautrocknerResponse(location, need);
    if (response) return response;
  }

  // --- Sonstige Kategorien mit Standort ---
  if (explicitLinkAsk) {
    // Kategorie primär aus der letzten User-Nachricht ableiten – sonst zieht alte History (z. B. „passend") fälschlich Kategorien wie Beschallung
    const category = detectCategory(lastUser) ?? (isShortFollowUp(lastUser) ? detectCategory(relevantText) : null);
    if (location && category) {
      const productLinks = searchVerifiedProductLinks(lastUser, location, category.id);
      if (productLinks.length > 0) {
        return buildLinkResponse(`Ich habe dazu nur geprüfte Links aus der Sitemap genommen – passend für ${locationLabel(location)}:`, productLinks);
      }
      const categoryLink = fallbackCategoryLink(location, category.id, `${category.label} in ${locationLabel(location)}`);
      if (categoryLink) {
        return buildLinkResponse("Den exakten Produktlink kann ich hier nicht eindeutig genug bestimmen. Deshalb verlinke ich dir bewusst nur die geprüfte Kategorie-Übersicht:", [categoryLink]);
      }
    }
  }

  return null;
}

function streamText(text: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const deterministicResponse = getDeterministicResponse(messages);
    if (deterministicResponse) {
      return streamText(deterministicResponse);
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Der KI-Assistent ist momentan überlastet. Bitte versuche es in Kürze erneut." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "KI-Dienst nicht verfügbar. Bitte kontaktiere uns direkt." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "KI-Dienst Fehler" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const completion = await aiResponse.json();
    const assistantText = completion?.choices?.[0]?.message?.content ?? "Da möchte ich dich nicht mit einer ungenauen Antwort abspeisen – bitte nutze die passende Kategorie auf slt-rental.de oder kontaktiere das Team direkt.";
    return streamText(sanitizeAssistantText(assistantText));
  } catch (error: any) {
    console.error("public-chat error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unbekannter Fehler" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
