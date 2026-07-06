
INSERT INTO public.new_machines (
  slug, name, brand, model, category, article_number,
  short_description, description,
  price_gross, vat_rate, price_on_request,
  images, specifications, content, sort_order, is_active, is_featured, showroom_locations
) VALUES (
  'slt-hp65-eko-t-erdrakete',
  'SLT-Erdrakete HP65 EKO T – kompakte Turbo-Erdrakete Ø 65 mm',
  'SLT',
  'HP65 EKO T',
  'Erdrakete',
  'HP65-EKO-T',
  'Kompakte Turbo-Erdrakete Ø 65 mm, 920 mm Länge, 15,5 kg – mit Kulissensteinen bis zu 50 % schneller, reversierbar.',
  E'Die SLT-Erdrakete HP65 EKO T (Turbo) ist die kompakte Wahl für Bohrlöcher mit Ø 65 mm. Wie alle T-Modelle verfügt auch die HP65 EKO T über Kulissensteine – dadurch läuft die Maschine bis zu 50 % schneller als vergleichbare Erdraketen ohne dieses System.\n\nUm die Laufrichtung des Bodendurchschlagsgeräts zu ändern, wird die Luftzufuhr kurz unterbrochen und der Rückwärtslauf anschließend durch ein leichtes Ziehen am Druckluftschlauch aktiviert – kein Werkzeug, kein Ausbau nötig.\n\nAufgrund der qualitativ hochwertigen Verarbeitung sind die SLT HP-Modelle deutlich weniger wartungsanfällig und langfristig zuverlässig im täglichen Baustelleneinsatz.',
  4403.00, -- 3.700 € netto * 1,19
  19.00,
  false,
  ARRAY['/product-images/hercu/hp65ekot-1.jpg']::text[],
  jsonb_build_object(
    'Modell', 'SLT HP65 EKO T (Turbo)',
    'Typ', 'Pneumatische Erdrakete / Bodendurchschlagsgerät',
    'Durchmesser', '65 mm',
    'Länge', '920 mm',
    'Gewicht', '15,5 kg',
    'Luftbedarf', '1,0 m³/min (bei 7 bar)',
    'Schlagfrequenz', '7,0 Hz',
    'Betriebsdruck', '7 bar',
    'Max. Betriebsdruck Rückwärtsgang', '5,0 bar',
    'Steuerungssystem', 'Kulissensteine (T-Serie)',
    'Rückwärtsgang', 'reversierbar über Zug am Druckluftschlauch',
    'Empf. Kompressor', 'mind. 2,0 m³/min Liefermenge / 8 bar',
    'Lieferumfang Solo', 'Erdrakete HP65 EKO T',
    'Lieferumfang Grundausstattung', 'HP65 EKO T + Druckluftschlauch + Bio-Erdraketenöl 5 L + Nebelöler 1,3 L'
  ),
  jsonb_build_object(
    'seoTitle', 'SLT-Erdrakete HP65 EKO T kaufen – kompakt Ø 65 mm, 920 mm',
    'seoDescription', 'SLT HP65 EKO T kompakte Turbo-Erdrakete Ø 65 mm, 920 mm Länge, mit Kulissensteinen und Rückwärtsgang. Ab 3.700 € netto beim Fachhändler SLT Rental in NRW.',
    'seoKeywords', ARRAY['SLT HP65 EKO T kaufen','Erdrakete kaufen','Bodendurchschlagsgerät 65 mm','Erdrakete 65 mm kompakt','Erdrakete Turbo','Erdrakete mit Rückwärtsgang','Erdrakete Kabelverlegung','Erdrakete Rohrverlegung','Erdrakete NRW'],
    'intro', 'Die SLT HP65 EKO T ist die kompakte Turbo-Erdrakete für Ø 65 mm Bohrungen – mit Kulissensteinen, nur 920 mm Länge und 15,5 kg Gewicht. Ideal für beengte Baustellen, in denen die volle Länge der HP65 T nicht passt.',
    'priceFromLabel', 'ab',
    'priceNote', 'Ab-Preis netto zzgl. 19 % MwSt. Grundausstattung (Druckluftschlauch, Bio-Erdraketenöl 5 L, Nebelöler 1,3 L) optional gegen Aufpreis von 450 € netto.',
    'highlights', ARRAY[
      'Turbo-System mit Kulissensteinen – bis zu 50 % schneller als vergleichbare Erdraketen',
      'Reversierbar: Rückwärtsgang per Zug am Druckluftschlauch, ohne Werkzeug',
      'Bohrloch Ø 65 mm bei nur 920 mm Bauform – ideal für beengte Baustellen',
      'Nur 15,5 kg – deutlich leichter als die HP65 T (28 kg)',
      'Betriebsdruck 7 bar, Luftbedarf 1,0 m³/min',
      'Ideal für größere Leerrohre und Schutzrohre bei beengten Verhältnissen'
    ],
    'imageAlts', ARRAY[
      'SLT-Erdrakete HP65 EKO T Ø 65 mm mit Druckluftschlauch – Seitenansicht'
    ],
    'options', jsonb_build_array(
      jsonb_build_object(
        'name', 'Solo-Maschine',
        'price', 'ab 3.700 € netto',
        'note', 'Nur die SLT-Erdrakete HP65 EKO T – ohne Zubehör.'
      ),
      jsonb_build_object(
        'name', 'Solo-Maschine + Grundausstattung',
        'price', '+ 450 € netto',
        'note', 'Aufpreis 450 € netto zusätzlich zur Solo-Maschine. Enthält Druckluftschlauch, Bio-Erdraketenöl (5 L) sowie Nebelöler 1,3 L zur Druckluftschmierung von Erdraketen und Druckluftwerkzeugen ohne integrierten Schmierstoffgeber.'
      )
    ),
    'suitableFor', ARRAY[
      'Grabenlose Verlegung größerer Leerrohre und Schutzrohre',
      'Hausanschlüsse mit größerem Querschnitt',
      'Beengte Baustellen mit begrenztem Ansatzweg',
      'Unterquerung von Wegen, Straßen und Einfahrten',
      'Tiefbau, Kabelverlegung und Rohrverlegung'
    ],
    'whyTitle', 'Warum die SLT HP65 EKO T bei SLT Rental kaufen?',
    'whyItems', jsonb_build_array(
      jsonb_build_object('title', 'Direkt vom Hersteller', 'desc', 'SLT-Erdraketen als Whitelabel-Produkt – Beratung, Ersatzteile und Garantieabwicklung aus einer Hand.'),
      jsonb_build_object('title', 'Beratung durch Vermietprofis', 'desc', 'Wir vermieten Baumaschinen seit Jahren – wir kennen die Praxis, die Grenzen der Maschine und passende Kompressor-Kombinationen.'),
      jsonb_build_object('title', 'Vor Ort in Krefeld & Bonn', 'desc', 'Besichtigung, Übergabe und Einweisung persönlich vor Ort – kein anonymer Online-Kauf.'),
      jsonb_build_object('title', 'Service & Ersatzteile', 'desc', 'Wartung und Ersatzteilversorgung direkt über SLT Rental.')
    ),
    'leadTime', 'Lieferbar innerhalb von ca. 5–10 Werktagen',
    'shipping', 'Lieferung deutschlandweit auf Anfrage · kostenfreie Abholung in Krefeld oder Bonn',
    'faq', jsonb_build_array(
      jsonb_build_object(
        'q', 'Worin unterscheidet sich die HP65 EKO T von der HP65 T?',
        'a', 'Beide Modelle bohren Ø 65 mm und gehören zur Turbo-T-Serie mit Kulissensteinen. Die HP65 EKO T ist mit 920 mm Länge und 15,5 kg deutlich kompakter und leichter als die HP65 T (1.350 mm, 28 kg) – ideal für beengte Baustellen. Die HP65 T bringt mit ihrer größeren Masse dafür mehr Schlagenergie für längere Bohrstrecken und schwierigere Böden.'
      ),
      jsonb_build_object(
        'q', 'Für welche Einsätze eignet sich die HP65 EKO T?',
        'a', 'Der Bohrdurchmesser von 65 mm eignet sich für größere Leerrohre, Schutzrohre und Verlegungen mit stärkerem Querschnitt. Durch die kompakte Bauform von nur 920 mm ist die HP65 EKO T besonders geeignet für Baustellen mit wenig Platz für den Ansatzweg.'
      ),
      jsonb_build_object(
        'q', 'Welchen Kompressor benötige ich für die SLT HP65 EKO T?',
        'a', 'Die Erdrakete arbeitet bei einem Betriebsdruck von 7 bar mit einem Luftbedarf von 1,0 m³/min. Damit die Maschine dauerhaft mit Nenndruck laufen kann, empfehlen wir einen Baukompressor mit mindestens 2,0 m³/min Liefermenge und 8 bar Nutzdruck – so bleibt Reserve für Schlauchverluste und den Rückwärtsgang.'
      ),
      jsonb_build_object(
        'q', 'Wie funktioniert der Rückwärtsgang der HP65 EKO T?',
        'a', 'Der Rückwärtsgang wird pneumatisch am Kopf umgeschaltet: Die Luftzufuhr wird kurz unterbrochen, anschließend wird durch ein leichtes Ziehen am Druckluftschlauch die Reversierung aktiviert. Der Rückwärtsgang läuft mit maximal 5,0 bar. So kann die Maschine bei Hindernissen oder Verläufern kontrolliert zurückgeholt werden – ohne Ausgraben.'
      ),
      jsonb_build_object(
        'q', 'Was macht die Kulissensteine der T-Serie besonders?',
        'a', 'Die Kulissensteine sind das zentrale Steuerungselement der Turbo-Modelle: Sie ermöglichen einen präziseren Ablauf der Schlagbewegung und dadurch eine höhere Schlagenergie pro Zeiteinheit. In der Praxis bedeutet das gegenüber Erdraketen ohne dieses System einen deutlichen Zeitvorteil bei gleichen Bodenverhältnissen.'
      ),
      jsonb_build_object(
        'q', 'Was gehört zur optionalen Grundausstattung dazu?',
        'a', 'Die Grundausstattung umfasst zusätzlich zur HP65 EKO T einen passenden Druckluftschlauch, Bio-Erdraketenöl (5 L) sowie den Nebelöler 1,3 Liter. Der Nebelöler dient zur Schmierung von Druckluftwerkzeugen und Erdraketen, die über keinen integrierten Schmierstoffgeber verfügen – das schützt die Maschine vor vorzeitigem Verschleiß. Aufpreis für die Grundausstattung: 450 € netto.'
      ),
      jsonb_build_object(
        'q', 'Kann ich die HP65 EKO T auch mit Tracto-Kupplungen bekommen?',
        'a', 'Ja, auf Wunsch liefern wir den Druckluftschlauch für die HP65 EKO T mit Tracto-Kupplungen aus, sodass Du sie problemlos in Deinen bestehenden Fuhrpark mit Tracto-Technik-Anschlüssen integrieren kannst. Bitte in der Kaufanfrage kurz vermerken.'
      ),
      jsonb_build_object(
        'q', 'Wo kann ich die SLT HP65 EKO T vor dem Kauf ansehen?',
        'a', 'Eine Vorführung ist an unseren Standorten Krefeld und Bonn möglich. Vereinbare am besten kurz vorab telefonisch einen Termin, damit die Maschine bereitsteht und wir Dich in Ruhe beraten können.'
      )
    )
  ),
  107,
  true,
  true,
  ARRAY['krefeld','bonn']::text[]
);
