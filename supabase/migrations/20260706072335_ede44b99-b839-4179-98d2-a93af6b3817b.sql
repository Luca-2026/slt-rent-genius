
-- === Neumaschine: SLT Easy-Floor Eventboden ===
INSERT INTO public.new_machines (
  slug, brand, model, name, article_number, category,
  short_description, description,
  specifications, content, images,
  showroom_locations,
  price_gross, vat_rate, price_on_request, is_featured, is_active, sort_order
) VALUES (
  'slt-easyfloor-eventboden',
  'SLT',
  'Easy-Floor Eventboden anthrazit',
  'SLT Easy-Floor Eventboden anthrazit – recycelter Kunststoff-Mix, Klick-System',
  'SLT-EF-100x86',
  'Eventboden',
  'Nachhaltiger Eventboden aus 100 % recyceltem Kunststoff-Mix – ineinander verhakbares Klick-System für lückenlose Boden- und Fahrflächen. 1000 × 860 mm, 15 kg, extrem robust, leicht stapelbar, wetterfest, anthrazit.',
  'Der SLT Easy-Floor Eventboden ist eine hochbelastbare Bodenplatte aus recyceltem Kunststoff-Mix und wurde entwickelt für den professionellen Einsatz auf Events, Baustellen, im Zeltbau, bei Konzerten, Messen, Festivals, Hochzeiten und als temporäre Fahrfläche für Fahrzeuge oder Maschinen. Durch das seitliche Klick-/Hakensystem werden die Platten formschlüssig miteinander verbunden – dadurch entstehen im Handumdrehen begehbare und befahrbare Großflächen ohne Verrutschen und ohne Stolperkanten. Die Platte misst 1000 × 860 mm bei einer Nutzfläche von 0,80 m² und einer Stärke von nur 23 mm; mit 15 kg pro Stück ist sie werkzeuglos von einer Person verlegbar. Die Oberseite ist als griffige, geschmeidige Struktur ausgeführt, die Unterseite mit Rutsch-Nubs versehen. Farbe: anthrazit. 100 % Recyclingmaterial, wartungsarm, wetterfest, UV- und frostbeständig, leicht zu reinigen und platzsparend stapelbar.',
  jsonb_build_object(
    'Material', 'Recycelter Kunststoff-Mix (100 %)',
    'Abmessung', '1000 mm × 860 mm',
    'Nutzfläche', '0,80 m² pro Platte',
    'Mattenstärke', '23 mm',
    'Gewicht', '15 kg / Stück',
    'Farbe', 'anthrazit',
    'Verbindungssystem', 'Seitliches Klick-/Hakensystem (Eigensystem)',
    'Oberseite', 'Rutschhemmend, geschmeidige Nutzstruktur',
    'Unterseite', 'Anti-Rutsch-Nubs',
    'Nachhaltigkeit', '100 % Recyclingmaterial – ressourcenschonend produziert'
  ),
  jsonb_build_object(
    'seoTitle', 'Eventboden kaufen: SLT Easy-Floor – recycelter Kunststoff, Klick-System | SLT Rental',
    'seoDescription', 'SLT Easy-Floor Eventboden anthrazit aus recyceltem Kunststoff-Mix. 1000×860 mm, 15 kg, ineinander verhakbar. Ab 19,99 € brutto/Stück, Mengenrabatt ab 21 & 60 Stück. Direktversand per Spedition.',
    'seoKeywords', jsonb_build_array(
      'Eventboden kaufen','Eventbodenmatten','Bodenschutzmatten kaufen','Fahrplatten Kunststoff',
      'Kunststoffplatten Baustelle','Bodenplatten Event','Zeltboden kaufen','Recycling Bodenplatten',
      'Bodenplatten mieten kaufen','Rasenschutzmatten','Bodenschutz Veranstaltung','begehbare Bodenplatten',
      'befahrbare Bodenplatten','LKW Fahrplatten Kunststoff','Rasenschonmatten','SLT Easy-Floor'
    ),
    'highlights', jsonb_build_array(
      '100 % recycelter Kunststoff-Mix – nachhaltig produziert',
      'Klick-/Hakensystem: Platten werden formschlüssig verhakt – kein Verrutschen',
      'Extrem robust: geeignet für Fußgänger, Fahrzeuge & Maschinen',
      'Nur 15 kg / Stück – von einer Person verlegbar',
      'Leicht stapelbar & platzsparend zu lagern',
      'Rutschhemmende Oberfläche & Anti-Rutsch-Unterseite',
      'Wetterfest, UV- & frostbeständig – ganzjährig einsetzbar',
      'Pflegeleicht: mit Wasser abspritzbar, besenrein zurück',
      'Skalierbar: von 1 m² bis zu mehreren hundert m² Fläche'
    ),
    'suitableFor', jsonb_build_array(
      'Zelt- & Eventboden für Festzelte, Hochzeiten, Messen',
      'Temporäre Fahrwege für PKW, Transporter, Anhänger',
      'Bodenschutz auf Rasen, Pflaster & empfindlichen Untergründen',
      'Baustellenzufahrten & Lagerflächen',
      'Konzert- & Festivalbereiche (FOH, Backstage, Publikum)',
      'Traglufthallen, Party- & Cateringzelte',
      'Reitplatzabdeckungen, Weide- & Parkflächen'
    ),
    'whyIntro', 'Warum der SLT Easy-Floor gegenüber klassischen Fahrplatten aus Holz oder Vollkunststoff überzeugt:',
    'whyItems', jsonb_build_array(
      jsonb_build_object('title','Nachhaltig','desc','100 % recycelter Kunststoff-Mix – jede Platte spart Neuplastik und Rohstoffe.'),
      jsonb_build_object('title','Ineinander verhakbar','desc','Das seitliche Klick-System erzeugt eine geschlossene, stabile Fläche ohne Schrauben oder Kleber.'),
      jsonb_build_object('title','Leichter als Holz & Vollkunststoff','desc','Nur 15 kg pro Platte – schnell verlegt und wieder abgebaut, auch ohne Stapler.'),
      jsonb_build_object('title','Extrem langlebig','desc','Wetter-, UV- und frostbeständig; keine Aufquellung wie bei Holz, keine Splitterbildung.')
    ),
    'priceTiers', jsonb_build_array(
      jsonb_build_object('minQty',1,'priceGross',19.99,'label','ab 1 Stück – 19,99 € brutto / Stück'),
      jsonb_build_object('minQty',21,'priceGross',18.95,'label','ab 21 Stück – 18,95 € brutto / Stück'),
      jsonb_build_object('minQty',60,'priceGross',17.95,'label','ab 60 Stück – 17,95 € brutto / Stück')
    ),
    'shipping', 'Versand per Spedition (Palette): ab 21 Stück 49 € · ab 60 Stück 79 € · größere Mengen auf Anfrage · kostenfreie Abholung in Krefeld oder Bonn',
    'imageAlts', jsonb_build_array(
      'SLT Easy-Floor Eventboden – zwei Platten mit Nutz- und Noppenseite in anthrazit',
      'SLT Easy-Floor Eventboden – Detail der rutschhemmenden Nutzstruktur',
      'SLT Easy-Floor Eventboden – Unterseite mit Anti-Rutsch-Nubs',
      'SLT Easy-Floor Eventboden – Verlegung als Zelt- und Fahrbelag',
      'SLT Easy-Floor Eventboden – Einsatz als temporäre Fahrfläche'
    ),
    'demoLocations', jsonb_build_array('krefeld','bonn'),
    'faq', jsonb_build_array(
      jsonb_build_object('q','Woraus besteht der SLT Easy-Floor Eventboden?','a','Aus 100 % recyceltem Kunststoff-Mix. Die Platten werden aus Post-Consumer-Rezyklaten hergestellt und sind zu 100 % wiederverwertbar.'),
      jsonb_build_object('q','Welche Maße und welches Gewicht hat eine Platte?','a','Jede Platte misst 1000 × 860 mm bei 23 mm Stärke, wiegt 15 kg und bietet eine Nutzfläche von 0,80 m² pro Stück.'),
      jsonb_build_object('q','Wie werden die Platten miteinander verbunden?','a','Über ein seitliches Klick-/Hakensystem. Die Platten werden formschlüssig ineinander verhakt und bilden dadurch eine geschlossene, verrutschsichere Fläche – ohne Schrauben, ohne Kleber, ohne Werkzeug.'),
      jsonb_build_object('q','Kann man mit Fahrzeugen darüber fahren?','a','Ja. Der Easy-Floor ist als befahrbare Bodenplatte für PKW, Transporter, Anhänger und leichte Baustellenfahrzeuge geeignet.'),
      jsonb_build_object('q','Was kostet der Versand?','a','Ab 21 Stück 49 € per Spedition auf Palette, ab 60 Stück 79 €. Größere Mengen auf Anfrage. Kostenlose Abholung in unseren Standorten Krefeld und Bonn.'),
      jsonb_build_object('q','Gibt es Mengenrabatte?','a','Ja. Ab 21 Stück 18,95 € brutto / Stück, ab 60 Stück 17,95 € brutto / Stück. Für Projektmengen erstellen wir gerne ein individuelles Angebot.'),
      jsonb_build_object('q','Ist die Bodenplatte wetter- und UV-beständig?','a','Ja. Der recycelte Kunststoff-Mix ist wetter-, UV- und frostbeständig und für den ganzjährigen Außeneinsatz konzipiert.'),
      jsonb_build_object('q','Wie reinigt man die Matten?','a','Mit Wasser abspritzen oder besenrein abkehren. Grobe Verschmutzungen können mit einem Hochdruckreiniger entfernt werden.'),
      jsonb_build_object('q','Kann man die Matten stapeln?','a','Ja, die Platten sind flach stapelbar und lassen sich auf einer Standard-Europalette platzsparend transportieren und lagern.'),
      jsonb_build_object('q','Kann ich die Bodenmatten auch mieten?','a','Ja. Denselben Boden bieten wir standortübergreifend als Zelt- und Fahrbelag zur Miete an – z. B. für Hochzeiten, Festivals und Baustellen.')
    )
  ),
  ARRAY[
    '/product-images/eventboden/easy-floor-1.png',
    '/product-images/eventboden/easy-floor-2.png',
    '/product-images/eventboden/easy-floor-3.webp',
    '/product-images/zeltboden-extra-1.jpeg',
    '/product-images/zeltboden-extra-2.jpeg'
  ],
  ARRAY['krefeld','bonn'],
  19.99, 19, false, true, true, 55
);

-- === Gebrauchtartikel: SLT Easy-Floor Top-Used ===
-- price_net = 16 € brutto / 1.19 = 13.4454 (Anzeige rundet auf 13 € netto; Brutto 16 € steht in Beschreibung)
INSERT INTO public.used_machines (
  slug, category, manufacturer, model, year, hours,
  price_net, price_on_request,
  description, specifications, content, images,
  status, reference_number, location, is_featured
) VALUES (
  'slt-easyfloor-eventboden-used',
  'eventboden',
  'SLT',
  'Easy-Floor Eventboden anthrazit (Top-Used, einmal genutzt)',
  2025, NULL,
  13.4454, false,
  'Top-Used-Angebot: SLT Easy-Floor Eventboden aus 100 % recyceltem Kunststoff-Mix, einmalig auf einem Event eingesetzt und geprüft – optisch und funktional wie neu. 1000 × 860 mm, 15 kg, ineinander verhakbares Klick-System, anthrazit. Nur 16 € brutto / Stück ab 1 Stück – solange Vorrat reicht.',
  jsonb_build_object(
    'Material', 'Recycelter Kunststoff-Mix (100 %)',
    'Abmessung', '1000 mm × 860 mm',
    'Nutzfläche', '0,80 m² pro Platte',
    'Mattenstärke', '23 mm',
    'Gewicht', '15 kg / Stück',
    'Farbe', 'anthrazit',
    'Zustand', 'Einmal auf Event eingesetzt – geprüft, gereinigt, wie neu',
    'Preis', '16,00 € brutto / Stück ab 1 Stück'
  ),
  jsonb_build_object(
    'seoKeywords', jsonb_build_array(
      'Eventboden gebraucht kaufen','Bodenschutzmatten gebraucht','Fahrplatten Kunststoff gebraucht',
      'Zeltboden gebraucht','Bodenplatten günstig','SLT Easy-Floor gebraucht','Rasenschutzmatten gebraucht'
    ),
    'highlights', jsonb_build_array(
      'Nur einmal auf einem Event eingesetzt – geprüft & gereinigt',
      '100 % recycelter Kunststoff-Mix – nachhaltig',
      'Klick-System: formschlüssig ineinander verhakbar',
      'Nur 15 kg / Stück – von einer Person verlegbar',
      'Extrem robust: begeh- und befahrbar',
      'Ab 1 Stück erhältlich – ideal für kleine wie große Flächen',
      'Nur 16 € brutto / Stück – solange Vorrat reicht'
    ),
    'whyIntro', 'Warum sich dieses Top-Used-Angebot lohnt:',
    'whyItems', jsonb_build_array(
      jsonb_build_object('title','Deutlich günstiger als neu','desc','16 € brutto statt 19,99 € brutto – rund 20 % Ersparnis gegenüber dem Neupreis.'),
      jsonb_build_object('title','Optisch & technisch wie neu','desc','Jede Platte wurde nach dem Einsatz auf Beschädigungen geprüft und gereinigt.'),
      jsonb_build_object('title','Sofort verfügbar','desc','Direkt ab Lager Krefeld – Abholung kostenfrei, Versand ab 49 € per Spedition.'),
      jsonb_build_object('title','Nachhaltig','desc','Aus 100 % Recyclingmaterial – die Wiederverwendung spart zusätzlich Ressourcen.')
    ),
    'shipping', 'Versand per Spedition (Palette) ab 49 € · kostenfreie Abholung in Krefeld',
    'showroomLocations', jsonb_build_array('krefeld'),
    'imageAlts', jsonb_build_array(
      'SLT Easy-Floor Eventboden gebraucht – Top-Used-Angebot anthrazit',
      'SLT Easy-Floor Eventboden gebraucht – Nutzstruktur',
      'SLT Easy-Floor Eventboden gebraucht – Unterseite mit Anti-Rutsch-Nubs'
    )
  ),
  ARRAY[
    '/product-images/eventboden/easy-floor-1.png',
    '/product-images/eventboden/easy-floor-2.png',
    '/product-images/eventboden/easy-floor-3.webp',
    '/product-images/zeltboden-extra-1.jpeg'
  ],
  'available',
  'SLT-EF-USED-2025',
  'krefeld',
  true
);
