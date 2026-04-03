import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, MapPin, Clock, Truck, ShieldCheck, HelpCircle } from "lucide-react";
import type { Product, LocationData } from "@/data/rentalData";

interface ProductSEOContentProps {
  product: Product;
  location: { id: string; name: string; shortName: string; address: string };
  categoryId: string;
  categoryTitle: string;
}

// Category-specific rental tips and use cases
const categoryContent: Record<string, {
  useCases: string[];
  tips: string[];
  faqs: { q: string; a: string }[];
}> = {
  anhaenger: {
    useCases: [
      "Umzüge und Wohnungsauflösungen",
      "Gartenabfälle und Grünschnitt transportieren",
      "Baumaterialien zur Baustelle bringen",
      "Möbeltransport und Sperrmüllentsorgung",
      "Motorrad- und Fahrzeugtransport",
    ],
    tips: [
      "Achten Sie auf das zulässige Gesamtgewicht Ihres Zugfahrzeugs.",
      "Ladungssicherung ist Pflicht – Spanngurte liegen bei oder können dazu gebucht werden.",
      "Unsere Anhänger sind 24/7 per SMS-Codesystem verfügbar – auch am Wochenende.",
      "Planen schützen Ihre Ladung bei Regen und verhindern das Herausfallen kleiner Teile.",
    ],
    faqs: [
      { q: "Brauche ich einen speziellen Führerschein?", a: "Für Anhänger bis 750 kg zGG reicht der Führerschein Klasse B. Für schwerere Anhänger benötigen Sie Klasse BE oder B96, je nach Gesamtgewicht des Gespanns." },
      { q: "Wie funktioniert das 24/7-Codesystem?", a: "Nach der Buchung erhalten Sie per SMS einen Zugangscode. Damit entsperren Sie das elektronische Schloss am Anhänger – rund um die Uhr, ohne Personalaufwand." },
      { q: "Kann ich den Anhänger auch am Wochenende mieten?", a: "Ja! Alle Anhänger sind dank des automatischen Codesystems 24/7 verfügbar – auch an Sonn- und Feiertagen." },
    ],
  },
  erdbewegung: {
    useCases: [
      "Aushubarbeiten für Fundamente und Keller",
      "Garten- und Landschaftsbau",
      "Kanalarbeiten und Leitungsbau",
      "Teichbau und Geländemodellierung",
      "Abbrucharbeiten mit Hydraulikhammer",
    ],
    tips: [
      "Für Minibagger ab 1t empfehlen wir eine kurze Einweisung – wir zeigen Ihnen gerne die Bedienung.",
      "Passendes Anbaugerät gleich mitbuchen: Tieflöffel, Kabellöffel oder Grabenräumlöffel.",
      "Bei empfindlichem Untergrund Gummiketten oder Kettenpolster verwenden.",
      "Kraftstoff (Diesel) ist nicht im Mietpreis enthalten – bitte vollgetankt zurückgeben.",
    ],
    faqs: [
      { q: "Brauche ich einen Baggerschein?", a: "Für private Arbeiten auf eigenem Grundstück ist kein Baggerschein nötig. Auf Baustellen kann je nach Auftraggeber ein Nachweis verlangt werden. Wir bieten eine kostenlose Einweisung bei Abholung." },
      { q: "Wie wird der Minibagger transportiert?", a: "Kleinere Bagger bis ca. 2,5t können auf einem unserer Baumaschinenanhänger transportiert werden. Größere Maschinen liefern wir per Tieflader direkt zu Ihnen." },
      { q: "Welcher Löffel passt zu meinem Projekt?", a: "Tieflöffel für Aushub und Gräben, Kabellöffel für schmale Leitungsgräben, Grabenräumlöffel für breite Planierarbeiten. Wir beraten Sie gerne." },
    ],
  },
  verdichtung: {
    useCases: [
      "Pflasterarbeiten und Wegebau",
      "Verdichtung von Schotter und Kies",
      "Fundamentvorbereitung",
      "Erdarbeiten im Garten- und Landschaftsbau",
      "Kanalbau und Leitungsgräben verfüllen",
    ],
    tips: [
      "Wählen Sie die Rüttelplatte nach Bodenbeschaffenheit: leichte Platten für Sand, schwere für Schotter.",
      "Für Pflasterarbeiten empfehlen wir eine Rüttelplatte mit Gummimatte als Schutz.",
      "Stampfer eignen sich besonders für schmale Gräben und schwer zugängliche Bereiche.",
    ],
    faqs: [
      { q: "Welche Rüttelplatte brauche ich?", a: "Für Pflasterarbeiten reicht eine leichte Platte (ca. 60–100 kg). Für Schotter und tiefere Verdichtung empfehlen wir Modelle ab 150 kg. Gerne beraten wir Sie telefonisch." },
      { q: "Kann ich die Rüttelplatte selbst transportieren?", a: "Leichte Rüttelplatten passen in viele Anhänger. Für schwere Modelle bieten wir Lieferung und Abholung an." },
    ],
  },
  arbeitsbuehnen: {
    useCases: [
      "Fassadenarbeiten und Malerarbeiten in der Höhe",
      "Baumschnitt und Grünpflege",
      "Montage von Beleuchtung und Werbeanlagen",
      "Dachrinnenreinigung und Dachinspektionen",
      "Hallenmontage und Lagerhaltung",
    ],
    tips: [
      "Prüfen Sie vorab die benötigte Arbeitshöhe und die Tragfähigkeit des Untergrunds.",
      "Für den Einsatz im öffentlichen Raum kann eine Genehmigung erforderlich sein.",
      "Elektro-Scherenbühnen eignen sich ideal für Innenräume – emissionsfrei und leise.",
    ],
    faqs: [
      { q: "Brauche ich einen Führerschein für Arbeitsbühnen?", a: "Für den Einsatz auf privatem Gelände ist in der Regel kein spezieller Schein nötig. Auf Baustellen wird oft eine Unterweisung nach DGUV verlangt. Wir bieten Einweisungen bei Abholung." },
      { q: "Kann die Bühne geliefert werden?", a: "Ja, wir liefern Arbeitsbühnen direkt zu Ihrem Einsatzort. Transportkosten berechnen wir nach Entfernung." },
    ],
  },
  werkzeuge: {
    useCases: [
      "Renovierung und Umbauarbeiten",
      "Fliesenlegen und Estricharbeiten",
      "Bohr- und Meißelarbeiten in Beton",
      "Holzbearbeitung und Montage",
      "Kernbohrungen für Durchführungen",
    ],
    tips: [
      "Akku-Werkzeuge sind flexibler – achten Sie auf ausreichend geladene Akkus.",
      "Für Betonarbeiten empfehlen wir SDS-Plus oder SDS-Max Bohrhämmer.",
      "Diamantbohrer eignen sich ideal für Kernbohrungen in Beton und Mauerwerk.",
    ],
    faqs: [
      { q: "Sind Verbrauchsmaterialien im Mietpreis enthalten?", a: "Standardmäßig nicht. Bohrer, Sägeblätter und Schleifscheiben können separat erworben werden. Einige Geräte werden mit Grundausstattung vermietet." },
    ],
  },
  beleuchtung: {
    useCases: [
      "Bühnenshows und Konzerte",
      "Hochzeiten und Firmenfeiern",
      "Messen und Ausstellungen",
      "Architekturbeleuchtung und Fassaden-Illumination",
      "Foto- und Videoproduktionen",
    ],
    tips: [
      "LED-Scheinwerfer sind energieeffizient und erzeugen kaum Wärme – ideal für Innenräume.",
      "Planen Sie die DMX-Steuerung frühzeitig – wir bieten passende Controller und Kabel.",
      "Für Outdoor-Events achten Sie auf IP-Schutzklasse (mindestens IP65).",
    ],
    faqs: [
      { q: "Wie viele Scheinwerfer brauche ich?", a: "Das hängt von der Fläche und Atmosphäre ab. Für eine Hochzeit mit 100 Gästen empfehlen wir ca. 8–12 LED Spots. Wir beraten Sie gerne individuell." },
    ],
  },
  beschallung: {
    useCases: [
      "Konzerte und Live-Musik",
      "Firmenveranstaltungen und Konferenzen",
      "Hochzeiten und private Feiern",
      "Open-Air-Events und Straßenfeste",
      "DJ-Events und Partys",
    ],
    tips: [
      "Kalkulieren Sie ca. 5–10 Watt pro Person für eine gute Beschallung.",
      "Für Sprachveranstaltungen reichen kleinere Systeme – für Live-Musik empfehlen wir PA-Systeme.",
      "Achten Sie auf ausreichend lange Kabelwege zwischen Mischpult und Lautsprechern.",
    ],
    faqs: [
      { q: "Welches Soundsystem passt zu meiner Veranstaltung?", a: "Für bis zu 50 Personen reicht ein kompaktes Aktivsystem. Ab 100 Personen empfehlen wir ein PA-System mit Subwoofer. Für große Events beraten wir individuell." },
    ],
  },
  "moebel-zelte": {
    useCases: [
      "Hochzeiten und Gartenpartys",
      "Firmenfeiern und Sommerfeste",
      "Vereinsfeste und Jubiläen",
      "Geburtstagsfeiern im Freien",
      "Messen und Ausstellungen im Außenbereich",
    ],
    tips: [
      "Partyzelte benötigen einen ebenen, festen Untergrund.",
      "Seitenwände schützen vor Wind und Regen – als Zubehör buchbar.",
      "Für Veranstaltungen mit mehr als 200 Gästen sprechen Sie uns wegen Sonderlösungen an.",
    ],
    faqs: [
      { q: "Kann ich das Zelt selbst aufbauen?", a: "Kleinere Partyzelte (bis 4x8m) können zu zweit aufgebaut werden. Für größere Zelte bieten wir einen Auf- und Abbauservice an." },
      { q: "Was passiert bei schlechtem Wetter?", a: "Unsere Partyzelte sind wind- und regenfest. Bei extremen Wetterlagen (Sturm) empfehlen wir den Abbau. Seitenwände erhöhen den Wetterschutz." },
    ],
  },
  "geschirr-glaeser-besteck": {
    useCases: [
      "Hochzeiten und festliche Bankette",
      "Catering und Buffets",
      "Firmenfeiern und Weihnachtsfeiern",
      "Vereinsfeste und Straßenfeste",
      "Private Feiern ab 20 Personen",
    ],
    tips: [
      "Kalkulieren Sie ca. 1,5 Gedecke pro Person als Sicherheitsreserve.",
      "Mieten Sie eine Spülmaschine dazu – spart Reinigungspauschale und Aufwand.",
      "Unsere Geschirr-Sets werden in praktischen 10er-Einheiten vermietet.",
    ],
    faqs: [
      { q: "Muss ich das Geschirr sauber zurückgeben?", a: "Nein, grob abgespült reicht. Alternativ bieten wir eine Reinigungspauschale an. Tipp: Mieten Sie eine Spülmaschine dazu – das spart die Pauschale." },
    ],
  },
  huepfburgen: {
    useCases: [
      "Kindergeburtstage",
      "Schul- und Kitafeste",
      "Straßen- und Stadtteilfeste",
      "Firmenfamilienfeste",
      "Vereinsfeste und Tag der offenen Tür",
    ],
    tips: [
      "Hüpfburgen benötigen eine ebene Fläche und eine Steckdose (230V) in der Nähe.",
      "Maximal zulässige Kinderzahl beachten – steht auf der Hüpfburg.",
      "Bei Regen oder starkem Wind die Hüpfburg nicht nutzen.",
      "Immer eine Aufsichtsperson einplanen.",
    ],
    faqs: [
      { q: "Ab welchem Alter dürfen Kinder auf die Hüpfburg?", a: "In der Regel ab 3 Jahren unter Aufsicht. Die maximale Anzahl gleichzeitig springender Kinder ist auf der Hüpfburg angegeben." },
      { q: "Was brauche ich für den Aufbau?", a: "Eine ebene Fläche (Rasen ideal) und eine 230V-Steckdose. Die Hüpfburg wird mit Gebläse betrieben und ist in wenigen Minuten aufgeblasen." },
    ],
  },
  aggregate: {
    useCases: [
      "Stromversorgung auf Baustellen ohne Netzanschluss",
      "Notstromversorgung bei Events und Veranstaltungen",
      "Outdoor-Events und Festivals",
      "Marktbeschicker und mobile Verkaufsstände",
      "Überbrückung bei Stromausfällen",
    ],
    tips: [
      "Berechnen Sie den Gesamtstrombedarf aller Verbraucher vor der Buchung.",
      "Für lärmempfindliche Umgebungen empfehlen wir schallgedämpfte Aggregate.",
      "Kraftstoffverbrauch hängt von der Last ab – planen Sie ausreichend Diesel ein.",
    ],
    faqs: [
      { q: "Wie groß muss mein Aggregat sein?", a: "Addieren Sie die Leistung aller Verbraucher und planen Sie 20% Reserve ein. Für eine typische Baustelle mit Werkzeugen reichen 7–15 kVA. Für Events mit Licht und Ton ab 30 kVA." },
    ],
  },
  "heizung-trocknung": {
    useCases: [
      "Bautrocknung nach Wasserschäden",
      "Estrichtrocknung bei Neubauten",
      "Beheizung von Zelten und Hallen",
      "Frostschutz auf Baustellen im Winter",
      "Trocknung nach Überschwemmungen",
    ],
    tips: [
      "Bautrockner sollten bei geschlossenen Fenstern und Türen betrieben werden für maximale Wirkung.",
      "Pro 50 m² Fläche empfehlen wir mindestens einen Bautrockner.",
      "Heizlüfter eignen sich für temporäre Beheizung – Heizpilze für den Außenbereich.",
    ],
    faqs: [
      { q: "Wie lange dauert eine Bautrocknung?", a: "Je nach Feuchtigkeit und Raumgröße zwischen 2 und 6 Wochen. Wir beraten Sie gerne zur richtigen Geräteanzahl." },
    ],
  },
  absperrtechnik: {
    useCases: [
      "Baustellensicherung im öffentlichen Raum",
      "Verkehrsführung bei Straßenarbeiten",
      "Absicherung von Veranstaltungen",
      "Halteverbotszonen einrichten",
      "Geländeabsperrung und Zugangskontrolle",
    ],
    tips: [
      "Für Halteverbotsschilder ist eine Genehmigung der Straßenverkehrsbehörde erforderlich.",
      "Bauzäune benötigen Standfüße – Kunststoff für befestigte Flächen, Beton für unbefestigte.",
      "Verkehrszeichen nach StVO aufstellen – wir beraten zur korrekten Beschilderung.",
    ],
    faqs: [
      { q: "Wer stellt die Halteverbotsschilder auf?", a: "Die Schilder müssen mindestens 72 Stunden vor Geltungsbeginn aufgestellt werden. Wir liefern die Schilder – die Beantragung der Genehmigung liegt beim Mieter." },
    ],
  },
  "traversen-rigging": {
    useCases: [
      "Bühnenbau für Konzerte und Events",
      "Messestandbau und Dekoration",
      "Beleuchtungs- und Tontechnik aufhängen",
      "Architektonische Installationen",
      "Festivalproduktionen",
    ],
    tips: [
      "Achten Sie auf die maximale Traglast der Traversen – insbesondere bei schweren Scheinwerfern.",
      "Traversen-Cover sorgen für ein professionelles Erscheinungsbild.",
      "Für bodenstehende Konstruktionen eignen sich Base-Plates.",
    ],
    faqs: [
      { q: "Welches Traversensystem verwenden Sie?", a: "Wir verwenden das verbreitete MILOS M290 System (Vierpunkt-Traverse). Alle Verbindungen sind kompatibel und schnell montiert." },
    ],
  },
  buehne: {
    useCases: [
      "Konzerte und Live-Auftritte",
      "Reden und Präsentationen bei Events",
      "Modenschauen und Produktpräsentationen",
      "Vereinsfeste und Stadtfeste",
      "Preisverleihungen und Galas",
    ],
    tips: [
      "Podeste können flexibel kombiniert werden – Standard: 2m x 1m Module.",
      "Teleskopfüße erlauben den Höhenausgleich bei unebenem Gelände.",
      "Für Outdoor-Events empfehlen wir ein Bühnendach als Wetterschutz.",
    ],
    faqs: [
      { q: "Wie groß sollte die Bühne sein?", a: "Für einen Redner reichen 2x1m. Für eine Band empfehlen wir mindestens 6x4m. Für große Produktionen beraten wir individuell." },
    ],
  },
  gartenpflege: {
    useCases: [
      "Grundstückspflege und Rasenmähen",
      "Heckenschnitt und Baumpflege",
      "Vertikutieren im Frühjahr",
      "Sturmschaden-Beseitigung",
      "Gartenneuanlage und Erdarbeiten",
    ],
    tips: [
      "Vertikutieren Sie im Frühjahr (März–Mai) für einen gesunden Rasen.",
      "Häcksler eignen sich ideal, um Schnittgut zu zerkleinern und als Mulch zu verwenden.",
      "Motorsensen erreichen auch schwer zugängliche Stellen.",
    ],
    faqs: [
      { q: "Welches Gerät für welche Arbeit?", a: "Rasenmäher für große Flächen, Motorsense für Ränder und Böschungen, Vertikutierer für Rasenpflege, Häcksler für Schnittgut-Verwertung. Wir beraten gerne." },
    ],
  },
  "leitern-gerueste": {
    useCases: [
      "Malerarbeiten in der Höhe",
      "Fassadenreinigung und -renovierung",
      "Dacharbeiten und Dachrinnenreinigung",
      "Montagearbeiten in Hallen",
      "Renovierung von Treppenhäusern",
    ],
    tips: [
      "Rollgerüste bieten mehr Sicherheit als Leitern – besonders bei längeren Arbeiten in der Höhe.",
      "Achten Sie auf die maximale Standhöhe und Plattformhöhe.",
      "Auf ebenem Untergrund aufstellen und Rollen arretieren.",
    ],
    faqs: [
      { q: "Welche Gerüsthöhe brauche ich?", a: "Messen Sie die gewünschte Arbeitshöhe und ziehen Sie ca. 2m ab (Körpergröße + Armreichweite). Beispiel: Für Arbeiten in 5m Höhe reicht ein Rollgerüst mit 3m Plattformhöhe." },
    ],
  },
  "kabel-stromverteiler": {
    useCases: [
      "Stromverteilung auf Baustellen",
      "Event-Verkabelung und Bühneninstallation",
      "Messestandversorgung",
      "Temporäre Stromversorgung für Außenbereiche",
    ],
    tips: [
      "Planen Sie ausreichend Kabellänge ein – lieber etwas mehr als zu wenig.",
      "Kabelbrücken schützen Kabel vor Überfahren und verhindern Stolperfallen.",
      "CEE-Stecker (rot/blau) für professionelle Stromversorgung verwenden.",
    ],
    faqs: [
      { q: "Was ist der Unterschied zwischen CEE 16A und CEE 32A?", a: "CEE 16A (blau) liefert bis zu 3,6 kW – für kleinere Verbraucher. CEE 32A (rot) liefert bis zu 22 kW (Drehstrom) – für Aggregate, Arbeitsbühnen und große Verbraucher." },
    ],
  },
  kommunikation: {
    useCases: [
      "Kommunikation auf Events und Festivals",
      "Baustellenkoordination",
      "Sicherheitsdienst und Ordnerpersonal",
      "Sportveranstaltungen",
    ],
    tips: [
      "UHF-Funkgeräte bieten zuverlässige Kommunikation auch in lauter Umgebung.",
      "Laden Sie die Akkus vollständig auf – Betriebszeit ca. 10–12 Stunden.",
    ],
    faqs: [
      { q: "Brauche ich eine Lizenz für Funkgeräte?", a: "Unsere PMR446-Funkgeräte sind lizenzfrei nutzbar. Für professionelle UHF-Geräte auf bestimmten Frequenzen kann eine BNetzA-Zuteilung nötig sein – wir beraten Sie." },
    ],
  },
  spezialeffekte: {
    useCases: [
      "Bühneneffekte bei Konzerten und Shows",
      "Hochzeiten (Nebel, Konfetti, Funken)",
      "Firmenfeiern und Produktlaunches",
      "Film- und Fotoproduktionen",
    ],
    tips: [
      "CO₂-Jets erzeugen einen spektakulären Nebeleffekt – funktioniert nur mit CO₂-Flaschen.",
      "Sparkular-Funkeneffekte sind kalt und sicher für den Innenbereich.",
      "Nebelmaschinen benötigen spezielles Nebelfluid – nicht im Mietpreis enthalten.",
    ],
    faqs: [
      { q: "Sind die Spezialeffekte sicher für Innenräume?", a: "Ja, unsere kalten Funkeneffekte (Sparkular) und Nebelmaschinen sind für den Innenbereich zugelassen. CO₂-Jets erfordern ausreichende Belüftung." },
    ],
  },
};

export function ProductSEOContent({ product, location, categoryId, categoryTitle }: ProductSEOContentProps) {
  const content = useMemo(() => categoryContent[categoryId], [categoryId]);

  if (!content) return null;

  const productName = product.name;
  const locationName = location.name;

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-6">
      {/* Use Cases */}
      <div>
        <h2 className="text-base font-semibold text-headline mb-3">
          Wofür {productName} mieten?
        </h2>
        <p className="text-sm text-muted-foreground mb-3">
          {productName} aus der Kategorie {categoryTitle} eignet sich ideal für folgende Einsatzbereiche in {locationName} und Umgebung:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {content.useCases.map((uc, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-foreground">{uc}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Rental Tips */}
      <div className="border-t border-border pt-4">
        <h2 className="text-base font-semibold text-headline mb-3">
          Tipps zur Miete
        </h2>
        <ul className="space-y-2">
          {content.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Service Highlights */}
      <div className="border-t border-border pt-4">
        <h2 className="text-base font-semibold text-headline mb-3">
          Ihr Vorteil bei SLT Rental {location.shortName}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Standort {location.shortName}</span>
              <p className="text-muted-foreground text-xs mt-0.5">{location.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Flexible Mietdauer</span>
              <p className="text-muted-foreground text-xs mt-0.5">Tagesmiete, Wochenmiete oder Langzeitmiete möglich</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Truck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Lieferung möglich</span>
              <p className="text-muted-foreground text-xs mt-0.5">Wir liefern direkt zu Ihrem Einsatzort in der Region</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Tiefpreisgarantie</span>
              <p className="text-muted-foreground text-xs mt-0.5">Günstigeren Preis gefunden? Wir unterbieten ihn!</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      {content.faqs.length > 0 && (
        <div className="border-t border-border pt-4">
          <h2 className="text-base font-semibold text-headline mb-3 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            Häufige Fragen zu {categoryTitle}
          </h2>
          <div className="space-y-3">
            {content.faqs.map((faq, i) => (
              <details key={i} className="group">
                <summary className="text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors list-none flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5 flex-shrink-0">›</span>
                  <span>{faq.q}</span>
                </summary>
                <p className="text-sm text-muted-foreground mt-1.5 ml-5 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
