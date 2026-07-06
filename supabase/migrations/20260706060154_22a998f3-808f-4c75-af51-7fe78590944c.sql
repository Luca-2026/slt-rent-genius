UPDATE public.new_machines
SET content = jsonb_set(
  jsonb_set(
    content,
    '{options}',
    jsonb_build_array(
      jsonb_build_object(
        'name', 'Solo-Maschine',
        'price', 'ab 3.600 € brutto',
        'note', 'Nur die Erdrakete Hercu HP55 KRT – ohne Zubehör.'
      ),
      jsonb_build_object(
        'name', 'Solo-Maschine + Grundausstattung',
        'price', '+ 450 € brutto',
        'note', 'Aufpreis 450 € brutto zusätzlich zur Solo-Maschine. Enthält Druckluftschlauch, Bio-Erdraketenöl (5 L) sowie Nebelöler 1,3 L zur Druckluftschmierung von Erdraketen und Druckluftwerkzeugen ohne integrierten Schmierstoffgeber.'
      )
    )
  ),
  '{priceNote}',
  '"Ab-Preis inkl. 19 % MwSt. Grundausstattung (Druckluftschlauch, Bio-Erdraketenöl 5 L, Nebelöler 1,3 L) optional gegen Aufpreis von 450 € brutto."'::jsonb
)
WHERE slug = 'hercu-hp55-krt-erdrakete';