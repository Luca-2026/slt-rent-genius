
INSERT INTO public.new_machines (
  slug, brand, model, name, category, short_description,
  price_gross, compare_at_price, vat_rate, price_on_request,
  is_featured, is_active, sort_order,
  images, showroom_locations,
  specifications, content
) VALUES (
  'baumax-rmd800p-minidumper',
  'BAUMAX',
  'RMD800P',
  'Minidumper BAUMAX RMD800P inkl. 8 Rungen',
  'Minidumper',
  'BAUMAX RMD800P Minidumper mit multifunktionaler Kipppritsche, 800 kg Nutzlast, 8 Rungen serienmäßig und Elektrostart. Robuster Raupendumper für Brennholz, Stückgut und unwegsames Gelände.',
  4345, 4779.50, 19, false,
  true, true, 15,
  ARRAY[
    '/product-images/baumax-rmd800p-1.jpg',
    '/product-images/baumax-rmd800p-2.jpg',
    '/product-images/baumax-rmd800p-3.jpg',
    '/product-images/baumax-rmd800p-4.jpg',
    '/product-images/baumax-rmd800p-5.jpg',
    '/product-images/baumax-rmd800p-6.jpg',
    '/product-images/baumax-rmd800p-7.jpg',
    '/product-images/baumax-rmd800p-8.jpg',
    '/product-images/baumax-rmd800p-9.jpg'
  ],
  ARRAY['krefeld','bonn']::text[],
  jsonb_build_object(
    'Modell', 'BAUMAX RMD800P',
    'Nutzlast max.', '800 kg',
    'Eigengewicht', '450 kg',
    'Aufbau', 'multifunktionale Kipppritsche',
    'Antrieb', 'Benzin, Raupenlaufwerk',
    'Getriebe', '6 Vorwärts-, 2 Rückwärtsgänge',
    'Steuerung', 'Daumenhebel',
    'Lieferumfang', 'inkl. 8 Rungen',
    'Start', 'Elektrostart serienmäßig'
  ),
  jsonb_build_object(
    'seoTitle', 'BAUMAX RMD800P Minidumper kaufen, 800 kg Kipppritsche',
    'seoDescription', 'BAUMAX RMD800P Minidumper mit Kipppritsche und 800 kg Nutzlast, inkl. 8 Rungen und Elektrostart. Robuster Raupendumper für Brennholz und Stückgut jetzt kaufen.',
    'intro', 'Der BAUMAX RMD800P ist der Multifunktionstransporter für anspruchsvolle Transportaufgaben. Mit einer maximalen Nutzlast von 800 kg und der serienmäßigen, multifunktionalen Kipppritsche bewegen Sie Brennholz, Pflastersteine, Pflanzen und Stückgut sicher, auch durch enges und unwegsames Gelände.',
    'description', 'Das robuste Raupenlaufwerk sorgt für hohe Geländegängigkeit, der kräftige Benzinantrieb mit sechs Vorwärts- und zwei Rückwärtsgängen ermöglicht zügiges und kontrolliertes Arbeiten. Die Steuerung erfolgt intuitiv über das Kettenlaufwerk, die Gassteuerung bequem per Daumenhebel. So lässt sich der RMD800P von nur einer Person bedienen, eine aufwendige Schulung ist nicht nötig. Im Lieferumfang enthalten sind 8 Rungen für den sicheren Holztransport, der Elektrostart gehört serienmäßig zur Ausstattung.',
    'highlights', jsonb_build_array(
      '800 kg maximale Nutzlast',
      'Multifunktionale Kipppritsche für Stückgut und Brennholz',
      'Robustes Raupenlaufwerk, hohe Geländegängigkeit',
      'Sechs Vorwärtsgänge, zwei Rückwärtsgänge',
      '8 Rungen serienmäßig im Lieferumfang',
      'Elektrostart serienmäßig',
      'Eigengewicht nur 450 kg',
      'Bedienung durch eine Person, intuitive Daumenhebel-Steuerung'
    ),
    'suitableFor', jsonb_build_array(
      'Brennholz- und Stückguttransport',
      'Garten-, Landschafts- und Forstbau',
      'Baustellen mit engen Zufahrten',
      'Unwegsames Gelände und weiche Untergründe'
    ),
    'seoKeywords', jsonb_build_array(
      'Minidumper kaufen','Raupendumper','Kettendumper','Motorschubkarre',
      'BAUMAX RMD800P','Minidumper mit Kipppritsche','Minidumper 800 kg',
      'Brennholz Transporter','Dumper mit Pritsche'
    ),
    'imageAlts', jsonb_build_array(
      'BAUMAX RMD800P Minidumper mit Kipppritsche, Gesamtansicht',
      'BAUMAX RMD800P Raupendumper im Baustelleneinsatz mit Material',
      'BAUMAX RMD800P beim Abkippen von Erde auf der Baustelle',
      'BAUMAX RMD800P Heckansicht mit beladener Kipppritsche',
      'BAUMAX RMD800P Seitenansicht mit Benzinmotor und Bedienholm',
      'BAUMAX RMD800P Kipppritsche im hochgekippten Zustand',
      'BAUMAX RMD800P Pritschenvarianten und 8 Rungen für Holztransport',
      'BAUMAX RMD800P Detailansicht Kettenlaufwerk und Hydraulikzylinder',
      'BAUMAX RMD800P Heckansicht mit Pritsche und Ladeöffnungen'
    ),
    'leadTime', 'Lieferzeit auf Anfrage – Vorführmaschine in Krefeld & Bonn',
    'shipping', 'Lieferung NRW-weit, Konditionen auf Anfrage',
    'priceNote', 'Preis inkl. MwSt., zzgl. Überführungskosten.',
    'youtubeId', 'l_morQXUhp8'
  )
);
