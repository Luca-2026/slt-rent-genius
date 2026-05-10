ALTER TABLE public.used_machines ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS used_machines_slug_unique ON public.used_machines(slug) WHERE slug IS NOT NULL;

INSERT INTO public.used_machines (
  category, manufacturer, model, year, hours, price_net, price_on_request,
  description, specifications, images, status, reference_number, location, is_featured, slug
) VALUES (
  'arbeitsbuehnen',
  'Niftylift',
  'HR12LE Lithium-Akku-Hubarbeitsbühne',
  2019,
  130,
  22900,
  false,
  E'Hochwertige Gelenkteleskop-Arbeitsbühne aus dem Hause Niftylift – komplett emissionsfrei und geräuscharm dank moderner Lithium-Ionen-Akkutechnologie. Mit nur 130 Betriebsstunden und durchgehender, professioneller Wartung in faktisch neuwertigem Zustand. Dank Außenzulassung und nicht-spurender weißer Bereifung sowohl für anspruchsvolle Innen- als auch Außeneinsätze geeignet.\n\nBesichtigung und Kauf am Standort Krefeld nach Terminvereinbarung.',
  '{"Hersteller":"Niftylift","Typ":"HR12LE","Baujahr":"2019","Betriebsstunden":"130","Arbeitshöhe max. (A)":"12,10 m","Plattformhöhe max. (B)":"10,10 m","Horizontale Reichweite (C)":"6,30 m","Plattformtragkraft":"200 kg","Plattformgröße":"0,85 × 1,20 m","Schwenkbereich":"355°","Höhe (D)":"1,98 m","Länge (J)":"3,97 m","Breite (F)":"1,80 m","Eigengewicht":"2.470 kg","Antrieb":"Lithium-Ionen-Akku","Ladegerät":"230 V (im Lieferumfang)","Außenzulassung":"Ja","Bereifung":"Weiß / nicht-spurend","Wartung":"Durchgehend professionell"}'::jsonb,
  ARRAY['/images/used/niftylift-hr12le-2019.jpg'],
  'available',
  'NIFTY-HR12LE-2019',
  'krefeld',
  true,
  'niftylift-hr12le-2019'
)
ON CONFLICT (slug) WHERE slug IS NOT NULL DO NOTHING;