INSERT INTO public.new_machines (
  slug, name, brand, model, category, article_number,
  short_description, description,
  price_gross, vat_rate, price_on_request,
  images, specifications, content, sort_order, is_active, is_featured, showroom_locations
) VALUES (
  'hercu-hp55-rt-erdrakete',
  'Hercu Erdrakete HP55 RT – Turbo-Bodendurchschlagsgerät Ø 55 mm',
  'Hercu',
  'HP55 RT',
  'Erdrakete',
  'HP55-RT',
  'Turbo-Erdrakete Ø 55 mm mit beweglichem Stufenkopf und Kulissensteinen – bis zu 50 % schneller als konventionelle Erdraketen, mit steuerbarem Rückwärtsgang. Länge 1.260 mm, 16 kg.',
  E'Die Hercu HP55 RT (Turbo) ist die passende Wahl für die schnelle Herstellung von Bohrlöchern mit Ø 55 mm. Wie alle Hercu T-Modelle verfügt auch die HP55 RT über Kulissensteine – dadurch läuft die Maschine bis zu 50 % schneller als vergleichbare Erdraketen ohne dieses System.\n\nDurch ihren beweglichen Stufenkopf erreicht die HP55 RT eine höhere Durchschlagskraft sowie eine bessere Zielgenauigkeit gegenüber herkömmlichen Erdraketen. Um die Laufrichtung des Bodendurchschlagsgeräts zu ändern, wird die Luftzufuhr kurz unterbrochen und der Rückwärtslauf anschließend durch ein leichtes Ziehen am Druckluftschlauch aktiviert – kein Werkzeug, kein Ausbau nötig.\n\nAufgrund der qualitativ hochwertigen Verarbeitung sind die Hercu HP-Modelle gegenüber anderen Herstellern deutlich weniger wartungsanfällig und langfristig zuverlässig im täglichen Baustelleneinsatz.',
  3700.00,
  19.00,
  false,
  ARRAY[
    '/product-images/hercu/hp55rt-1.jpg',
    '/product-images/hercu/hp55rt-2-grundausstattung.jpg',
    '/product-images/hercu/hp55rt-3-stufenkopf.jpg',
    '/product-images/hercu/hp55rt-4-schlauch-detail.jpg'
  ]::text[],
  jsonb_build_object(
    'Modell', 'Hercu HP55 RT (Turbo)',
    'Typ', 'Pneumatische Erdrakete / Bodendurchschlagsgerät',
    'Durchmesser', '55 mm',
    'Länge', '1.260 mm',
    'Gewicht', '16 kg',
    'Luftbedarf', '1,0 m³/min (bei 6 bar)',
    'Schlagfrequenz', '7,4 Hz',
    'Betriebsdruck', '6 bar',
    'Max. Betriebsdruck Rückwärtsgang', '6,0 bar',
    'Kopfform', 'beweglicher Stufenkopf',
    'Steuerungssystem', 'Kulissensteine (Hercu T-Serie)',
    'Rückwärtsgang', 'reversierbar über Zug am Druckluftschlauch',
    'Empf. Kompressor', 'mind. 2,0 m³/min Liefermenge / 7 bar',
    'Lieferumfang Solo', 'Erdrakete HP55 RT',
    'Lieferumfang Grundausstattung', 'HP55 RT + Druckluftschlauch + Bio-Erdraketenöl 5 L + Nebelöler 1,3 L'
  ),
  jsonb_build_object(
    'seoTitle', 'Hercu Erdrakete HP55 RT kaufen – Turbo Ø 55 mm, 1.260 mm',
    'seoDescription', 'Hercu HP55 RT Turbo-Erdrakete Ø 55 mm, 1.260 mm Länge, mit Kulissensteinen, Stufenkopf und Rückwärtsgang. Preis ab 3.700 € brutto beim autorisierten Hercu-Händler SLT Rental in NRW.',
    'seoKeywords', ARRAY['Hercu HP55 RT kaufen','Erdrakete kaufen','Bodendurchschlagsgerät 55 mm','Hercu Erdrakete','Erdrakete 55 mm 1260 mm','Erdrakete Turbo','Erdrakete mit Rückwärtsgang','Erdrakete Stufenkopf','Erdrakete Kabelverlegung','Erdrakete Rohrverlegung','Hercu Händler NRW'],
    'intro', 'Die Hercu HP55 RT ist die Turbo-Erdrakete für Ø 55 mm Bohrungen in der langen 1.260-mm-Ausführung – mit beweglichem Stufenkopf, Kulissensteinen und steuerbarem Rückwärtsgang. Ideal für grabenlose Kabel- und Rohrverlegung im Erdreich.',
    'priceFromLabel', 'ab',
    'priceNote', 'Ab-Preis inkl. 19 % MwSt. Grundausstattung (Druckluftschlauch, Bio-Erdraketenöl 5 L, Nebelöler 1,3 L) optional gegen Aufpreis von 450 € brutto.',
    'highlights', ARRAY[
      'Turbo-System mit Kulissensteinen – bis zu 50 % schneller als vergleichbare Erdraketen',
      'Beweglicher Stufenkopf für höhere Durchschlagskraft und bessere Zielgenauigkeit',
      'Reversierbar: Rückwärtsgang per Zug am Druckluftschlauch, ohne Werkzeug',
      'Bohrloch Ø 55 mm, lange Bauform 1.260 mm für ruhigen Geradeauslauf',
      'Langlebige, hochwertige Verarbeitung – geringer Wartungsaufwand',
      'Betriebsdruck 6 bar, Luftbedarf 1,0 m³/min – kompatibel mit gängigen Baukompressoren',
      'Ideal für grabenlose Verlegung von Kabeln, Leerrohren und Hausanschlüssen'
    ],
    'imageAlts', ARRAY[
      'Hercu Erdrakete HP55 RT Ø 55 mm mit Druckluftschlauch – Seitenansicht',
      'Hercu HP55 RT Grundausstattung: Erdrakete, Druckluftschlauch, Nebelöler und Bio-Erdraketenöl',
      'Detailansicht Stufenkopf der Hercu HP55 RT mit reversierbarem Anschluss',
      'Detail Druckluftschlauch mit Gewindeverschraubung für Hercu Erdrakete HP55 RT'
    ],
    'options', jsonb_build_array(
      jsonb_build_object(
        'name', 'Solo-Maschine',
        'price', 'ab 3.700 € brutto',
        'note', 'Nur die Erdrakete Hercu HP55 RT – ohne Zubehör.'
      ),
      jsonb_build_object(
        'name', 'Solo-Maschine + Grundausstattung',
        'price', '+ 450 € brutto',
        'note', 'Aufpreis 450 € brutto zusätzlich zur Solo-Maschine. Enthält Druckluftschlauch, Bio-Erdraketenöl (5 L) sowie Nebelöler 1,3 L zur Druckluftschmierung von Erdraketen und Druckluftwerkzeugen ohne integrierten Schmierstoffgeber.'
      )
    ),
    'suitableFor', ARRAY[
      'Grabenlose Verlegung von Stromkabeln',
      'Verlegung von Leerrohren und Datenleitungen',
      'Hausanschlüsse (Strom, Wasser, Gas, Glasfaser)',
      'Unterquerung von Wegen, Straßen und Einfahrten',
      'Garten- und Landschaftsbau',
      'Gewerblicher Tiefbau und Kabelverlegung'
    ],
    'whyTitle', 'Warum die Hercu HP55 RT bei SLT Rental kaufen?',
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
        'q', 'Worin unterscheidet sich die HP55 RT von der HP55 KRT?',
        'a', 'Beide Modelle bohren Ø 55 mm und gehören zur Hercu Turbo-T-Serie mit Kulissensteinen und beweglichem Stufenkopf. Die HP55 RT ist mit 1.260 mm Länge und 16 kg deutlich länger und schwerer – die längere Bauform sorgt für einen besonders ruhigen Geradeauslauf im Boden und eignet sich damit sehr gut für längere Bohrstrecken.'
      ),
      jsonb_build_object(
        'q', 'Welchen Kompressor benötige ich für die Hercu HP55 RT?',
        'a', 'Die Erdrakete arbeitet bei einem Betriebsdruck von 6 bar mit einem Luftbedarf von 1,0 m³/min. Damit die Maschine dauerhaft mit Nenndruck laufen kann, empfehlen wir einen Baukompressor mit mindestens 2,0 m³/min Liefermenge und 7 bar Nutzdruck – so bleibt Reserve für Schlauchverluste und den Rückwärtsgang.'
      ),
      jsonb_build_object(
        'q', 'Wie funktioniert der Rückwärtsgang der HP55 RT?',
        'a', 'Der Rückwärtsgang wird pneumatisch am Kopf umgeschaltet: Die Luftzufuhr wird kurz unterbrochen, anschließend wird durch ein leichtes Ziehen am Druckluftschlauch die Reversierung aktiviert. Der Rückwärtsgang läuft mit maximal 6,0 bar. So kann die Maschine bei Hindernissen oder Verläufern kontrolliert zurückgeholt werden – ohne Ausgraben.'
      ),
      jsonb_build_object(
        'q', 'Was bringt der bewegliche Stufenkopf gegenüber einem starren Kopf?',
        'a', 'Der bewegliche Stufenkopf sorgt für eine höhere Durchschlagskraft je Hub und reagiert besser auf unterschiedliche Bodenwiderstände. Dadurch bleibt die Erdrakete auch bei wechselnden Bodenverhältnissen spurtreuer und erreicht eine bessere Zielgenauigkeit als Erdraketen mit einem starren Kopf.'
      ),
      jsonb_build_object(
        'q', 'Was macht die Kulissensteine der Hercu T-Serie besonders?',
        'a', 'Die Kulissensteine sind das zentrale Steuerungselement der Turbo-Modelle: Sie ermöglichen einen präziseren Ablauf der Schlagbewegung und dadurch eine höhere Schlagenergie pro Zeiteinheit. In der Praxis bedeutet das gegenüber Erdraketen ohne dieses System einen deutlichen Zeitvorteil bei gleichen Bodenverhältnissen.'
      ),
      jsonb_build_object(
        'q', 'Was gehört zur optionalen Grundausstattung dazu?',
        'a', 'Die Grundausstattung umfasst zusätzlich zur HP55 RT einen passenden Druckluftschlauch, Bio-Erdraketenöl (5 L) sowie den Nebelöler 1,3 Liter. Der Nebelöler dient zur Schmierung von Druckluftwerkzeugen und Erdraketen, die über keinen integrierten Schmierstoffgeber verfügen – das schützt die Maschine vor vorzeitigem Verschleiß. Aufpreis für die Grundausstattung: 450 € brutto.'
      ),
      jsonb_build_object(
        'q', 'Kann ich die HP55 RT auch mit Tracto-Kupplungen bekommen?',
        'a', 'Ja, auf Wunsch liefern wir den Druckluftschlauch für die HP55 RT mit Tracto-Kupplungen aus, sodass Du sie problemlos in Deinen bestehenden Fuhrpark mit Tracto-Technik-Anschlüssen integrieren kannst. Bitte in der Kaufanfrage kurz vermerken.'
      ),
      jsonb_build_object(
        'q', 'Wo kann ich die Hercu HP55 RT vor dem Kauf ansehen?',
        'a', 'Eine Vorführung ist an unseren Standorten Krefeld und Bonn möglich. Vereinbare am besten kurz vorab telefonisch einen Termin, damit die Maschine bereitsteht und wir Dich in Ruhe beraten können.'
      )
    )
  ),
  101,
  true,
  true,
  ARRAY['krefeld','bonn']::text[]
);