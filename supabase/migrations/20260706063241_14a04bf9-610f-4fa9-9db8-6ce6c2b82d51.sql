
INSERT INTO public.new_machines (
  slug, name, brand, model, category, article_number,
  short_description, description,
  price_gross, vat_rate, price_on_request,
  images, specifications, content, sort_order, is_active, is_featured, showroom_locations
) VALUES (
  'slt-hp65-rt-erdrakete',
  'SLT-Erdrakete HP65 RT – Turbo-Bodendurchschlagsgerät Ø 65 mm mit Stufenkopf',
  'SLT',
  'HP65 RT',
  'Erdrakete',
  'HP65-RT',
  'Turbo-Erdrakete Ø 65 mm, 1.350 mm Länge, 28 kg – mit beweglichem Stufenkopf, Kulissensteinen und Rückwärtsgang.',
  E'Die SLT-Erdrakete HP65 RT (Turbo) ist die passende Wahl für die schnelle Herstellung von Bohrlöchern mit Ø 65 mm. Wie alle T-Modelle verfügt auch die HP65 RT über Kulissensteine – dadurch läuft die Maschine bis zu 50 % schneller als vergleichbare Erdraketen ohne dieses System.\n\nDurch den beweglichen Stufenkopf erreicht die HP65 RT eine höhere Durchschlagskraft sowie eine bessere Zielgenauigkeit gegenüber herkömmlichen Erdraketen. Um die Laufrichtung des Bodendurchschlagsgeräts zu ändern, wird die Luftzufuhr kurz unterbrochen und der Rückwärtslauf anschließend durch ein leichtes Ziehen am Druckluftschlauch aktiviert – kein Werkzeug, kein Ausbau nötig.\n\nAufgrund der qualitativ hochwertigen Verarbeitung sind die SLT HP-Modelle deutlich weniger wartungsanfällig und langfristig zuverlässig im täglichen Baustelleneinsatz.',
  5533.50, -- 4.650 € netto * 1,19
  19.00,
  false,
  ARRAY['/product-images/hercu/hp65rt-1.jpg']::text[],
  jsonb_build_object(
    'Modell', 'SLT HP65 RT (Turbo)',
    'Typ', 'Pneumatische Erdrakete / Bodendurchschlagsgerät',
    'Durchmesser', '65 mm',
    'Länge', '1.350 mm',
    'Gewicht', '28 kg',
    'Luftbedarf', '1,4 m³/min (bei 6 bar)',
    'Schlagfrequenz', '5,6 Hz',
    'Betriebsdruck', '6 bar',
    'Max. Betriebsdruck Rückwärtsgang', '6,0 bar',
    'Steuerungssystem', 'Kulissensteine (T-Serie)',
    'Kopf', 'beweglicher Stufenkopf für höhere Durchschlagskraft & Zielgenauigkeit',
    'Rückwärtsgang', 'reversierbar über Zug am Druckluftschlauch',
    'Empf. Kompressor', 'mind. 2,5 m³/min Liefermenge / 7 bar',
    'Lieferumfang Solo', 'Erdrakete HP65 RT',
    'Lieferumfang Grundausstattung', 'HP65 RT + Druckluftschlauch + Bio-Erdraketenöl 5 L + Nebelöler 1,3 L'
  ),
  jsonb_build_object(
    'seoTitle', 'SLT-Erdrakete HP65 RT kaufen – Turbo Ø 65 mm mit Stufenkopf',
    'seoDescription', 'SLT HP65 RT Turbo-Erdrakete Ø 65 mm, 1.350 mm Länge, mit beweglichem Stufenkopf, Kulissensteinen und Rückwärtsgang. Ab 4.650 € netto beim Fachhändler SLT Rental in NRW.',
    'seoKeywords', ARRAY['SLT HP65 RT kaufen','Erdrakete kaufen','Bodendurchschlagsgerät 65 mm','Erdrakete Stufenkopf','Erdrakete Turbo','Erdrakete mit Rückwärtsgang','Erdrakete Zielgenauigkeit','Erdrakete Rohrverlegung','Erdrakete NRW'],
    'intro', 'Die SLT HP65 RT ist die Turbo-Erdrakete für Ø 65 mm Bohrungen mit beweglichem Stufenkopf – mit Kulissensteinen, 1.350 mm Bauform und 28 kg Gewicht. Der Stufenkopf sorgt für höhere Durchschlagskraft und bessere Zielgenauigkeit als konventionelle Erdraketen.',
    'priceFromLabel', 'ab',
    'priceNote', 'Ab-Preis netto zzgl. 19 % MwSt. Grundausstattung (Druckluftschlauch, Bio-Erdraketenöl 5 L, Nebelöler 1,3 L) optional gegen Aufpreis von 450 € netto.',
    'highlights', ARRAY[
      'Beweglicher Stufenkopf – höhere Durchschlagskraft & bessere Zielgenauigkeit',
      'Turbo-System mit Kulissensteinen – bis zu 50 % schneller als vergleichbare Erdraketen',
      'Reversierbar: Rückwärtsgang per Zug am Druckluftschlauch, ohne Werkzeug',
      'Bohrloch Ø 65 mm, Bauform 1.350 mm für ruhigen Geradeauslauf',
      'Hohe Schlagenergie durch 28 kg Masse – auch für anspruchsvolle Böden',
      'Ideal für längere Bohrstrecken mit größeren Leer- und Schutzrohren'
    ],
    'imageAlts', ARRAY[
      'SLT-Erdrakete HP65 RT Ø 65 mm mit beweglichem Stufenkopf – Seitenansicht'
    ],
    'options', jsonb_build_array(
      jsonb_build_object(
        'name', 'Solo-Maschine',
        'price', 'ab 4.650 € netto',
        'note', 'Nur die SLT-Erdrakete HP65 RT – ohne Zubehör.'
      ),
      jsonb_build_object(
        'name', 'Solo-Maschine + Grundausstattung',
        'price', '+ 450 € netto',
        'note', 'Aufpreis 450 € netto zusätzlich zur Solo-Maschine. Enthält Druckluftschlauch, Bio-Erdraketenöl (5 L) sowie Nebelöler 1,3 L zur Druckluftschmierung von Erdraketen und Druckluftwerkzeugen ohne integrierten Schmierstoffgeber.'
      )
    ),
    'suitableFor', ARRAY[
      'Grabenlose Verlegung größerer Leerrohre und Schutzrohre',
      'Längere Bohrstrecken mit hoher Zielgenauigkeit',
      'Anspruchsvolle Böden mit hohem Widerstand',
      'Unterquerung von Wegen, Straßen und Einfahrten',
      'Tiefbau, Kabel- und Rohrverlegung'
    ],
    'whyTitle', 'Warum die SLT HP65 RT bei SLT Rental kaufen?',
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
        'q', 'Worin unterscheidet sich die HP65 RT von der HP65 T?',
        'a', 'Beide Modelle sind Ø 65 mm, 1.350 mm lang und 28 kg schwer. Der Hauptunterschied: Die HP65 RT verfügt über einen beweglichen Stufenkopf, der für höhere Durchschlagskraft und bessere Zielgenauigkeit sorgt – besonders bei anspruchsvollen Böden und längeren Bohrstrecken. Die HP65 T hat einen festen Kopf und ist entsprechend günstiger.'
      ),
      jsonb_build_object(
        'q', 'Was bringt der bewegliche Stufenkopf?',
        'a', 'Der bewegliche Stufenkopf steigert zum einen die Durchschlagskraft, weil die Schlagenergie effizienter in den Boden übertragen wird. Zum anderen erhöht er die Zielgenauigkeit gegenüber Erdraketen mit festem Kopf – wichtig, wenn die Bohrung punktgenau an einer bestimmten Stelle austreten soll.'
      ),
      jsonb_build_object(
        'q', 'Für welche Einsätze eignet sich die HP65 RT?',
        'a', 'Der Bohrdurchmesser von 65 mm eignet sich für größere Leerrohre, Schutzrohre und Verlegungen mit stärkerem Querschnitt. Durch Stufenkopf und Turbo-System ist die HP65 RT besonders geeignet für längere Bohrstrecken sowie Böden, in denen konventionelle Erdraketen an ihre Grenzen kommen.'
      ),
      jsonb_build_object(
        'q', 'Welchen Kompressor benötige ich für die SLT HP65 RT?',
        'a', 'Die Erdrakete arbeitet bei einem Betriebsdruck von 6 bar mit einem Luftbedarf von 1,4 m³/min. Damit die Maschine dauerhaft mit Nenndruck laufen kann, empfehlen wir einen Baukompressor mit mindestens 2,5 m³/min Liefermenge und 7 bar Nutzdruck – so bleibt Reserve für Schlauchverluste und den Rückwärtsgang.'
      ),
      jsonb_build_object(
        'q', 'Wie funktioniert der Rückwärtsgang der HP65 RT?',
        'a', 'Der Rückwärtsgang wird pneumatisch am Kopf umgeschaltet: Die Luftzufuhr wird kurz unterbrochen, anschließend wird durch ein leichtes Ziehen am Druckluftschlauch die Reversierung aktiviert. Der Rückwärtsgang läuft mit maximal 6,0 bar. So kann die Maschine bei Hindernissen oder Verläufern kontrolliert zurückgeholt werden – ohne Ausgraben.'
      ),
      jsonb_build_object(
        'q', 'Was gehört zur optionalen Grundausstattung dazu?',
        'a', 'Die Grundausstattung umfasst zusätzlich zur HP65 RT einen passenden Druckluftschlauch, Bio-Erdraketenöl (5 L) sowie den Nebelöler 1,3 Liter. Der Nebelöler dient zur Schmierung von Druckluftwerkzeugen und Erdraketen, die über keinen integrierten Schmierstoffgeber verfügen – das schützt die Maschine vor vorzeitigem Verschleiß. Aufpreis für die Grundausstattung: 450 € netto.'
      ),
      jsonb_build_object(
        'q', 'Kann ich die HP65 RT auch mit Tracto-Kupplungen bekommen?',
        'a', 'Ja, auf Wunsch liefern wir den Druckluftschlauch für die HP65 RT mit Tracto-Kupplungen aus, sodass Du sie problemlos in Deinen bestehenden Fuhrpark mit Tracto-Technik-Anschlüssen integrieren kannst. Bitte in der Kaufanfrage kurz vermerken.'
      ),
      jsonb_build_object(
        'q', 'Wo kann ich die SLT HP65 RT vor dem Kauf ansehen?',
        'a', 'Eine Vorführung ist an unseren Standorten Krefeld und Bonn möglich. Vereinbare am besten kurz vorab telefonisch einen Termin, damit die Maschine bereitsteht und wir Dich in Ruhe beraten können.'
      )
    )
  ),
  108,
  true,
  true,
  ARRAY['krefeld','bonn']::text[]
);
