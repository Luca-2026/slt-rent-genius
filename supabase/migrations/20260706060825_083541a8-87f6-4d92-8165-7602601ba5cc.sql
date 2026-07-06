-- 1) Neues Produkt Hercu HP55 EKO T
INSERT INTO public.new_machines (
  slug, name, brand, model, category, article_number,
  short_description, description,
  price_gross, vat_rate, price_on_request,
  images, specifications, content, sort_order, is_active, is_featured, showroom_locations
) VALUES (
  'hercu-hp55-eko-t-erdrakete',
  'Hercu Erdrakete HP55 EKO T – Turbo-Bodendurchschlagsgerät Ø 55 mm',
  'Hercu',
  'HP55 EKO T',
  'Erdrakete',
  'HP55-EKO-T',
  'Kompakte Turbo-Erdrakete Ø 55 mm mit Kulissensteinen, 800 mm Länge, nur 10 kg – bis zu 50 % schneller als konventionelle Erdraketen, reversierbar.',
  E'Die Hercu HP55 EKO T (Turbo) ist die passende Wahl für die Herstellung von Bohrlöchern mit Ø 55 mm. Wie alle Hercu T-Modelle verfügt auch die HP55 EKO T über Kulissensteine – dadurch läuft die Maschine bis zu 50 % schneller als vergleichbare Erdraketen ohne dieses System.\n\nUm die Laufrichtung des Bodendurchschlagsgeräts zu ändern, wird die Luftzufuhr kurz unterbrochen und der Rückwärtslauf anschließend durch ein leichtes Ziehen am Druckluftschlauch aktiviert – kein Werkzeug, kein Ausbau nötig.\n\nAufgrund der qualitativ hochwertigen Verarbeitung sind die Hercu HP-Modelle gegenüber anderen Herstellern deutlich weniger wartungsanfällig und langfristig zuverlässig im täglichen Baustelleneinsatz.',
  3808.00, -- 3.200 € netto * 1,19
  19.00,
  false,
  ARRAY[
    '/product-images/hercu/hp55ekot-1.jpg',
    '/product-images/hercu/hp55ekot-2-grundausstattung.jpg',
    '/product-images/hercu/hp55ekot-3-stufenkopf.jpg',
    '/product-images/hercu/hp55ekot-4-schlauch-detail.jpg',
    '/product-images/hercu/hp55ekot-5-tracto-kupplung.jpg'
  ]::text[],
  jsonb_build_object(
    'Modell', 'Hercu HP55 EKO T (Turbo)',
    'Typ', 'Pneumatische Erdrakete / Bodendurchschlagsgerät',
    'Durchmesser', '55 mm',
    'Länge', '800 mm',
    'Gewicht', '10 kg',
    'Luftbedarf', '1,0 m³/min (bei 7 bar)',
    'Schlagfrequenz', '10,0 Hz',
    'Betriebsdruck', '7 bar',
    'Max. Betriebsdruck Rückwärtsgang', '5,0 bar',
    'Steuerungssystem', 'Kulissensteine (Hercu T-Serie)',
    'Rückwärtsgang', 'reversierbar über Zug am Druckluftschlauch',
    'Empf. Kompressor', 'mind. 2,0 m³/min Liefermenge / 8 bar',
    'Lieferumfang Solo', 'Erdrakete HP55 EKO T',
    'Lieferumfang Grundausstattung', 'HP55 EKO T + Druckluftschlauch + Bio-Erdraketenöl 5 L + Nebelöler 1,3 L'
  ),
  jsonb_build_object(
    'seoTitle', 'Hercu Erdrakete HP55 EKO T kaufen – Turbo Ø 55 mm, 800 mm',
    'seoDescription', 'Hercu HP55 EKO T Turbo-Erdrakete Ø 55 mm, 800 mm, 10 kg, mit Kulissensteinen und Rückwärtsgang. Preis ab 3.200 € netto beim autorisierten Hercu-Händler SLT Rental in NRW.',
    'seoKeywords', ARRAY['Hercu HP55 EKO T kaufen','Erdrakete kaufen','Bodendurchschlagsgerät 55 mm','Hercu Erdrakete kompakt','Erdrakete 55 mm 800 mm','Erdrakete Turbo','Erdrakete mit Rückwärtsgang','Erdrakete Kabelverlegung','Erdrakete Rohrverlegung','Hercu Händler NRW'],
    'intro', 'Die Hercu HP55 EKO T ist die kompakte Turbo-Erdrakete für Ø 55 mm Bohrungen – mit Kulissensteinen, nur 800 mm Länge und 10 kg Gewicht. Ideal für beengte Baustellen, Hausanschlüsse und wendige grabenlose Verlegung.',
    'priceFromLabel', 'ab',
    'priceNote', 'Ab-Preis netto zzgl. 19 % MwSt. Grundausstattung (Druckluftschlauch, Bio-Erdraketenöl 5 L, Nebelöler 1,3 L) optional gegen Aufpreis von 450 € netto.',
    'highlights', ARRAY[
      'Turbo-System mit Kulissensteinen – bis zu 50 % schneller als vergleichbare Erdraketen',
      'Kompakt & leicht: 800 mm Länge, nur 10 kg – ideal für beengte Einsatzorte',
      'Reversierbar: Rückwärtsgang per Zug am Druckluftschlauch, ohne Werkzeug',
      'Bohrloch Ø 55 mm für Kabel, Leerrohre und Datenleitungen',
      'Langlebige, hochwertige Verarbeitung – geringer Wartungsaufwand',
      'Betriebsdruck 7 bar, Luftbedarf 1,0 m³/min – kompatibel mit gängigen Baukompressoren'
    ],
    'imageAlts', ARRAY[
      'Hercu Erdrakete HP55 EKO T Ø 55 mm mit Druckluftschlauch – Seitenansicht',
      'Hercu HP55 EKO T Grundausstattung: Erdrakete, Druckluftschlauch, Nebelöler und Bio-Erdraketenöl',
      'Detailansicht Kopf der Hercu HP55 EKO T mit reversierbarem Anschluss',
      'Detail Druckluftschlauch mit Gewindeverschraubung für Hercu Erdrakete HP55 EKO T',
      'Druckluftschlauch für Hercu HP55 EKO T auf Wunsch mit Tracto-Kupplung erhältlich'
    ],
    'options', jsonb_build_array(
      jsonb_build_object(
        'name', 'Solo-Maschine',
        'price', 'ab 3.200 € netto',
        'note', 'Nur die Erdrakete Hercu HP55 EKO T – ohne Zubehör.'
      ),
      jsonb_build_object(
        'name', 'Solo-Maschine + Grundausstattung',
        'price', '+ 450 € netto',
        'note', 'Aufpreis 450 € netto zusätzlich zur Solo-Maschine. Enthält Druckluftschlauch, Bio-Erdraketenöl (5 L) sowie Nebelöler 1,3 L zur Druckluftschmierung von Erdraketen und Druckluftwerkzeugen ohne integrierten Schmierstoffgeber.'
      )
    ),
    'suitableFor', ARRAY[
      'Grabenlose Verlegung von Stromkabeln',
      'Verlegung von Leerrohren und Datenleitungen',
      'Hausanschlüsse (Strom, Wasser, Gas, Glasfaser)',
      'Unterquerung von Wegen, Straßen und Einfahrten',
      'Garten- und Landschaftsbau',
      'Beengte Baustellen mit wenig Platz für lange Erdraketen'
    ],
    'whyTitle', 'Warum die Hercu HP55 EKO T bei SLT Rental kaufen?',
    'whyItems', jsonb_build_array(
      jsonb_build_object('title', 'Autorisierter Hercu-Händler in NRW', 'desc', 'Direkter Draht zum Hersteller Hercu für Beratung, Ersatzteile und Garantieabwicklung.'),
      jsonb_build_object('title', 'Beratung durch Vermietprofis', 'desc', 'Wir vermieten Baumaschinen seit Jahren – wir kennen die Praxis, die Grenzen der Maschine und passende Kompressor-Kombinationen.'),
      jsonb_build_object('title', 'Vor Ort in Krefeld & Bonn', 'desc', 'Besichtigung, Übergabe und Einweisung persönlich vor Ort – kein anonymer Online-Kauf.'),
      jsonb_build_object('title', 'Service & Ersatzteile', 'desc', 'Wartung und Ersatzteilversorgung direkt über SLT Rental und Hercu.')
    ),
    'dealerInfo', jsonb_build_object(
      'text', 'SLT Rental ist autorisierter Vertriebs- und Servicepartner für Hercu Erdraketen in Nordrhein-Westfalen. Wir beraten Dich persönlich bei der Auswahl der passenden Erdrakete für Deine Baustellen-Anwendung.',
      'linkText', 'Mehr zum Hersteller Hercu',
      'linkUrl', 'https://www.hercu.de'
    ),
    'leadTime', 'Lieferbar innerhalb von ca. 5–10 Werktagen',
    'shipping', 'Lieferung deutschlandweit auf Anfrage · kostenfreie Abholung in Krefeld oder Bonn',
    'faq', jsonb_build_array(
      jsonb_build_object(
        'q', 'Worin unterscheidet sich die HP55 EKO T von der HP55 KRT und HP55 RT?',
        'a', 'Alle drei Modelle bohren Ø 55 mm und gehören zur Hercu Turbo-T-Serie mit Kulissensteinen. Die HP55 EKO T ist mit 800 mm Länge und 10 kg die kompakteste und leichteste Variante – ideal für beengte Baustellen und Hausanschlüsse. Die HP55 KRT (860 mm, 12 kg) verfügt zusätzlich über den beweglichen Stufenkopf, die HP55 RT (1.260 mm, 16 kg) ist deutlich länger und läuft dadurch besonders spurtreu über lange Distanzen.'
      ),
      jsonb_build_object(
        'q', 'Welchen Kompressor benötige ich für die Hercu HP55 EKO T?',
        'a', 'Die Erdrakete arbeitet bei einem Betriebsdruck von 7 bar mit einem Luftbedarf von 1,0 m³/min. Damit die Maschine dauerhaft mit Nenndruck laufen kann, empfehlen wir einen Baukompressor mit mindestens 2,0 m³/min Liefermenge und 8 bar Nutzdruck – so bleibt Reserve für Schlauchverluste und den Rückwärtsgang.'
      ),
      jsonb_build_object(
        'q', 'Wie funktioniert der Rückwärtsgang der HP55 EKO T?',
        'a', 'Der Rückwärtsgang wird pneumatisch am Kopf umgeschaltet: Die Luftzufuhr wird kurz unterbrochen, anschließend wird durch ein leichtes Ziehen am Druckluftschlauch die Reversierung aktiviert. Der Rückwärtsgang läuft mit maximal 5,0 bar. So kann die Maschine bei Hindernissen oder Verläufern kontrolliert zurückgeholt werden – ohne Ausgraben.'
      ),
      jsonb_build_object(
        'q', 'Was macht die Kulissensteine der Hercu T-Serie besonders?',
        'a', 'Die Kulissensteine sind das zentrale Steuerungselement der Turbo-Modelle: Sie ermöglichen einen präziseren Ablauf der Schlagbewegung und dadurch eine höhere Schlagenergie pro Zeiteinheit. In der Praxis bedeutet das gegenüber Erdraketen ohne dieses System einen deutlichen Zeitvorteil bei gleichen Bodenverhältnissen.'
      ),
      jsonb_build_object(
        'q', 'Was gehört zur optionalen Grundausstattung dazu?',
        'a', 'Die Grundausstattung umfasst zusätzlich zur HP55 EKO T einen passenden Druckluftschlauch, Bio-Erdraketenöl (5 L) sowie den Nebelöler 1,3 Liter. Der Nebelöler dient zur Schmierung von Druckluftwerkzeugen und Erdraketen, die über keinen integrierten Schmierstoffgeber verfügen – das schützt die Maschine vor vorzeitigem Verschleiß. Aufpreis für die Grundausstattung: 450 € netto.'
      ),
      jsonb_build_object(
        'q', 'Kann ich die HP55 EKO T auch mit Tracto-Kupplungen bekommen?',
        'a', 'Ja, auf Wunsch liefern wir den Druckluftschlauch für die HP55 EKO T mit Tracto-Kupplungen aus, sodass Du sie problemlos in Deinen bestehenden Fuhrpark mit Tracto-Technik-Anschlüssen integrieren kannst. Bitte in der Kaufanfrage kurz vermerken.'
      ),
      jsonb_build_object(
        'q', 'Wo kann ich die Hercu HP55 EKO T vor dem Kauf ansehen?',
        'a', 'Eine Vorführung ist an unseren Standorten Krefeld und Bonn möglich. Vereinbare am besten kurz vorab telefonisch einen Termin, damit die Maschine bereitsteht und wir Dich in Ruhe beraten können.'
      )
    )
  ),
  102,
  true,
  true,
  ARRAY['krefeld','bonn']::text[]
);

-- 2) HP55 KRT: 3.600 € netto → 4.284 € brutto; Optionstexte + priceNote auf netto
UPDATE public.new_machines
SET price_gross = 4284.00,
    content = jsonb_set(
      jsonb_set(
        content,
        '{options}',
        jsonb_build_array(
          jsonb_build_object(
            'name', 'Solo-Maschine',
            'price', 'ab 3.600 € netto',
            'note', 'Nur die Erdrakete Hercu HP55 KRT – ohne Zubehör.'
          ),
          jsonb_build_object(
            'name', 'Solo-Maschine + Grundausstattung',
            'price', '+ 450 € netto',
            'note', 'Aufpreis 450 € netto zusätzlich zur Solo-Maschine. Enthält Druckluftschlauch, Bio-Erdraketenöl (5 L) sowie Nebelöler 1,3 L zur Druckluftschmierung von Erdraketen und Druckluftwerkzeugen ohne integrierten Schmierstoffgeber.'
          )
        )
      ),
      '{priceNote}',
      '"Ab-Preis netto zzgl. 19 % MwSt. Grundausstattung (Druckluftschlauch, Bio-Erdraketenöl 5 L, Nebelöler 1,3 L) optional gegen Aufpreis von 450 € netto."'::jsonb
    )
WHERE slug = 'hercu-hp55-krt-erdrakete';

-- Passe auch seoDescription (Preis) an
UPDATE public.new_machines
SET content = jsonb_set(content, '{seoDescription}',
  '"Hercu HP55 KRT Turbo-Erdrakete Ø 55 mm mit Kulissensteinen, Stufenkopf und Rückwärtsgang. Preis ab 3.600 € netto beim autorisierten Hercu-Händler SLT Rental in NRW."'::jsonb)
WHERE slug = 'hercu-hp55-krt-erdrakete';

-- 3) HP55 RT: 3.700 € netto → 4.403 € brutto
UPDATE public.new_machines
SET price_gross = 4403.00,
    content = jsonb_set(
      jsonb_set(
        content,
        '{options}',
        jsonb_build_array(
          jsonb_build_object(
            'name', 'Solo-Maschine',
            'price', 'ab 3.700 € netto',
            'note', 'Nur die Erdrakete Hercu HP55 RT – ohne Zubehör.'
          ),
          jsonb_build_object(
            'name', 'Solo-Maschine + Grundausstattung',
            'price', '+ 450 € netto',
            'note', 'Aufpreis 450 € netto zusätzlich zur Solo-Maschine. Enthält Druckluftschlauch, Bio-Erdraketenöl (5 L) sowie Nebelöler 1,3 L zur Druckluftschmierung von Erdraketen und Druckluftwerkzeugen ohne integrierten Schmierstoffgeber.'
          )
        )
      ),
      '{priceNote}',
      '"Ab-Preis netto zzgl. 19 % MwSt. Grundausstattung (Druckluftschlauch, Bio-Erdraketenöl 5 L, Nebelöler 1,3 L) optional gegen Aufpreis von 450 € netto."'::jsonb
    )
WHERE slug = 'hercu-hp55-rt-erdrakete';

UPDATE public.new_machines
SET content = jsonb_set(content, '{seoDescription}',
  '"Hercu HP55 RT Turbo-Erdrakete Ø 55 mm, 1.260 mm Länge, mit Kulissensteinen und Rückwärtsgang. Preis ab 3.700 € netto beim autorisierten Hercu-Händler SLT Rental in NRW."'::jsonb)
WHERE slug = 'hercu-hp55-rt-erdrakete';