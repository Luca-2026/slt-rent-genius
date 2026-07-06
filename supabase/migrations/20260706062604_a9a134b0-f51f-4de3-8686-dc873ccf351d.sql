
INSERT INTO public.new_machines (
  slug, name, brand, model, category, article_number,
  short_description, description,
  price_gross, vat_rate, price_on_request,
  images, specifications, content, sort_order, is_active, is_featured, showroom_locations
) VALUES (
  'slt-hp45-t-erdrakete',
  'SLT-Erdrakete HP45 T – Turbo-Bodendurchschlagsgerät Ø 45 mm',
  'SLT',
  'HP45 T',
  'Erdrakete',
  'HP45-T',
  'Turbo-Erdrakete Ø 45 mm, 955 mm Länge, 7,8 kg – mit Kulissensteinen bis zu 50 % schneller als konventionelle Erdraketen, reversierbar.',
  E'Die SLT-Erdrakete HP45 T (Turbo) ist die passende Wahl für Bohrlöcher mit Ø 45 mm in mittlerer Bauform. Wie alle T-Modelle verfügt auch die HP45 T über Kulissensteine – dadurch läuft die Maschine bis zu 50 % schneller als vergleichbare Erdraketen ohne dieses System.\n\nUm die Laufrichtung des Bodendurchschlagsgeräts zu ändern, wird die Luftzufuhr kurz unterbrochen und der Rückwärtslauf anschließend durch ein leichtes Ziehen am Druckluftschlauch aktiviert – kein Werkzeug, kein Ausbau nötig.\n\nAufgrund der qualitativ hochwertigen Verarbeitung sind die SLT HP-Modelle deutlich weniger wartungsanfällig und langfristig zuverlässig im täglichen Baustelleneinsatz.',
  2932.16, -- 2.464 € netto * 1,19
  19.00,
  false,
  ARRAY['/product-images/hercu/hp45t-1.jpg']::text[],
  jsonb_build_object(
    'Modell', 'SLT HP45 T (Turbo)',
    'Typ', 'Pneumatische Erdrakete / Bodendurchschlagsgerät',
    'Durchmesser', '45 mm',
    'Länge', '955 mm',
    'Gewicht', '7,8 kg',
    'Luftbedarf', '0,9 m³/min (bei 6 bar)',
    'Schlagfrequenz', '7,2 Hz',
    'Betriebsdruck', '6 bar',
    'Max. Betriebsdruck Rückwärtsgang', '6,0 bar',
    'Steuerungssystem', 'Kulissensteine (T-Serie)',
    'Rückwärtsgang', 'reversierbar über Zug am Druckluftschlauch',
    'Empf. Kompressor', 'mind. 1,5 m³/min Liefermenge / 7 bar',
    'Lieferumfang Solo', 'Erdrakete HP45 T',
    'Lieferumfang Grundausstattung', 'HP45 T + Druckluftschlauch + Bio-Erdraketenöl 5 L + Nebelöler 1,3 L'
  ),
  jsonb_build_object(
    'seoTitle', 'SLT-Erdrakete HP45 T kaufen – Turbo Ø 45 mm, 955 mm',
    'seoDescription', 'SLT HP45 T Turbo-Erdrakete Ø 45 mm, 955 mm Länge, mit Kulissensteinen und Rückwärtsgang. Ab 2.464 € netto direkt vom Fachhändler SLT Rental in NRW.',
    'seoKeywords', ARRAY['SLT HP45 T kaufen','Erdrakete kaufen','Bodendurchschlagsgerät 45 mm','Erdrakete 45 mm 955 mm','Erdrakete Turbo','Erdrakete mit Rückwärtsgang','Erdrakete Kabelverlegung','Erdrakete Rohrverlegung','Erdrakete NRW'],
    'intro', 'Die SLT HP45 T ist die mittlere Turbo-Erdrakete für Ø 45 mm Bohrungen – mit Kulissensteinen, 955 mm Bauform und 7,8 kg Gewicht. Ideal für Hausanschlüsse, Datenleitungen und Glasfaser mit gutem Geradeauslauf bei kompakter Handhabung.',
    'priceFromLabel', 'ab',
    'priceNote', 'Ab-Preis netto zzgl. 19 % MwSt. Grundausstattung (Druckluftschlauch, Bio-Erdraketenöl 5 L, Nebelöler 1,3 L) optional gegen Aufpreis von 436 € netto.',
    'highlights', ARRAY[
      'Turbo-System mit Kulissensteinen – bis zu 50 % schneller als vergleichbare Erdraketen',
      'Reversierbar: Rückwärtsgang per Zug am Druckluftschlauch, ohne Werkzeug',
      'Bohrloch Ø 45 mm, Bauform 955 mm für ruhigen Geradeauslauf',
      'Nur 7,8 kg – handlich und leicht positionierbar',
      'Betriebsdruck 6 bar, Luftbedarf 0,9 m³/min – kompatibel mit gängigen Baukompressoren',
      'Ideal für Glasfaser, Datenleitungen und Hausanschlüsse'
    ],
    'imageAlts', ARRAY[
      'SLT-Erdrakete HP45 T Ø 45 mm mit Druckluftschlauch – Seitenansicht'
    ],
    'options', jsonb_build_array(
      jsonb_build_object(
        'name', 'Solo-Maschine',
        'price', 'ab 2.464 € netto',
        'note', 'Nur die SLT-Erdrakete HP45 T – ohne Zubehör.'
      ),
      jsonb_build_object(
        'name', 'Solo-Maschine + Grundausstattung',
        'price', '+ 436 € netto',
        'note', 'Aufpreis 436 € netto zusätzlich zur Solo-Maschine. Enthält Druckluftschlauch, Bio-Erdraketenöl (5 L) sowie Nebelöler 1,3 L zur Druckluftschmierung von Erdraketen und Druckluftwerkzeugen ohne integrierten Schmierstoffgeber.'
      )
    ),
    'suitableFor', ARRAY[
      'Grabenlose Verlegung von Glasfaser- und Datenleitungen',
      'Verlegung dünner Stromkabel und Leerrohre',
      'Kleinere Hausanschlüsse (Glasfaser, Strom)',
      'Unterquerung von Wegen, Straßen und Einfahrten',
      'Garten- und Landschaftsbau',
      'Gewerblicher Tiefbau und Kabelverlegung'
    ],
    'whyTitle', 'Warum die SLT HP45 T bei SLT Rental kaufen?',
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
        'q', 'Worin unterscheidet sich die HP45 T von der HP45 EKO T?',
        'a', 'Beide Modelle bohren Ø 45 mm und gehören zur Turbo-T-Serie mit Kulissensteinen. Die HP45 T ist mit 955 mm Länge und 7,8 kg die etwas größere Ausführung – sie läuft dadurch ruhiger und geradliniger als die sehr kompakte HP45 EKO T (750 mm, 6,5 kg), eignet sich also besser für längere Bohrstrecken.'
      ),
      jsonb_build_object(
        'q', 'Für welche Einsätze eignet sich die HP45 T mit Ø 45 mm?',
        'a', 'Der Bohrdurchmesser von 45 mm ist ideal für dünne Kabel, Datenleitungen, Glasfaseranschlüsse und kleinere Leerrohre. Für Standard-Stromhausanschlüsse oder größere Leerrohre eignet sich eher eine Ø-55-mm-Erdrakete wie die HP55 T, HP55 EKO T oder HP55 KRT.'
      ),
      jsonb_build_object(
        'q', 'Welchen Kompressor benötige ich für die SLT HP45 T?',
        'a', 'Die Erdrakete arbeitet bei einem Betriebsdruck von 6 bar mit einem Luftbedarf von 0,9 m³/min. Damit die Maschine dauerhaft mit Nenndruck laufen kann, empfehlen wir einen Baukompressor mit mindestens 1,5 m³/min Liefermenge und 7 bar Nutzdruck – so bleibt Reserve für Schlauchverluste und den Rückwärtsgang.'
      ),
      jsonb_build_object(
        'q', 'Wie funktioniert der Rückwärtsgang der HP45 T?',
        'a', 'Der Rückwärtsgang wird pneumatisch am Kopf umgeschaltet: Die Luftzufuhr wird kurz unterbrochen, anschließend wird durch ein leichtes Ziehen am Druckluftschlauch die Reversierung aktiviert. Der Rückwärtsgang läuft mit maximal 6,0 bar. So kann die Maschine bei Hindernissen oder Verläufern kontrolliert zurückgeholt werden – ohne Ausgraben.'
      ),
      jsonb_build_object(
        'q', 'Was macht die Kulissensteine der T-Serie besonders?',
        'a', 'Die Kulissensteine sind das zentrale Steuerungselement der Turbo-Modelle: Sie ermöglichen einen präziseren Ablauf der Schlagbewegung und dadurch eine höhere Schlagenergie pro Zeiteinheit. In der Praxis bedeutet das gegenüber Erdraketen ohne dieses System einen deutlichen Zeitvorteil bei gleichen Bodenverhältnissen.'
      ),
      jsonb_build_object(
        'q', 'Was gehört zur optionalen Grundausstattung dazu?',
        'a', 'Die Grundausstattung umfasst zusätzlich zur HP45 T einen passenden Druckluftschlauch, Bio-Erdraketenöl (5 L) sowie den Nebelöler 1,3 Liter. Der Nebelöler dient zur Schmierung von Druckluftwerkzeugen und Erdraketen, die über keinen integrierten Schmierstoffgeber verfügen – das schützt die Maschine vor vorzeitigem Verschleiß. Aufpreis für die Grundausstattung: 436 € netto.'
      ),
      jsonb_build_object(
        'q', 'Kann ich die HP45 T auch mit Tracto-Kupplungen bekommen?',
        'a', 'Ja, auf Wunsch liefern wir den Druckluftschlauch für die HP45 T mit Tracto-Kupplungen aus, sodass Du sie problemlos in Deinen bestehenden Fuhrpark mit Tracto-Technik-Anschlüssen integrieren kannst. Bitte in der Kaufanfrage kurz vermerken.'
      ),
      jsonb_build_object(
        'q', 'Wo kann ich die SLT HP45 T vor dem Kauf ansehen?',
        'a', 'Eine Vorführung ist an unseren Standorten Krefeld und Bonn möglich. Vereinbare am besten kurz vorab telefonisch einen Termin, damit die Maschine bereitsteht und wir Dich in Ruhe beraten können.'
      )
    )
  ),
  105,
  true,
  true,
  ARRAY['krefeld','bonn']::text[]
);
