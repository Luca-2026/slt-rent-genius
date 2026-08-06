ALTER TABLE public.b2b_managed_products ADD COLUMN IF NOT EXISTS price_unit_label text;

DROP VIEW IF EXISTS public.managed_products_public;
CREATE VIEW public.managed_products_public
WITH (security_invoker = on) AS
SELECT
  id, slug, name, model_name, description, detailed_description,
  category, available_locations, images, specifications, features, tags,
  rental_notes, price_per_day, price_weekend, price_per_month, min_rental_months,
  weight_kg, drive_type, rentware_code, on_request, pdf_url, external_manual_url,
  video_url, video_urls, sort_order, seo_meta_description, seo_faqs, seo_local_content,
  image_alts, price_unit_label, created_at, updated_at
FROM public.b2b_managed_products
WHERE is_published = true;

GRANT SELECT ON public.managed_products_public TO anon, authenticated;

UPDATE public.b2b_managed_products
SET price_per_day = 'ab 59 €',
    price_unit_label = '/ Wochenende',
    seo_title = 'CDJ-3000X mieten – AlphaTheta DJ-Player ab 59 € | SLT',
    description = replace(description, 'ab 69 €', 'ab 59 €'),
    seo_meta_description = replace(seo_meta_description, 'ab 69 €', 'ab 59 €')
WHERE slug = 'cdj-3000x';

INSERT INTO public.b2b_managed_products (
  slug, name, model_name, description, detailed_description, category,
  available_locations, images, image_alts, specifications, features, tags, rental_notes,
  price_per_day, price_unit_label, on_request, pdf_url, external_manual_url,
  seo_title, seo_meta_description, seo_faqs, is_published
) VALUES (
  'djm-a9',
  'AlphaTheta DJM-A9 DJ-Mixer',
  'DJM-A9 – 4-Kanal-Profi-DJ-Mixer mit MAGVEL FADER PRO, Bluetooth-Eingang und WLAN',
  'DJM-A9 mieten: 4-Kanal-Profi-DJ-Mixer von AlphaTheta (Pioneer DJ) mit MAGVEL FADER PRO, X-PAD, Bluetooth-Eingang, WLAN und 96 kHz/32-Bit-Wandlern. Ab 59 € je Wochenende – an allen Standorten auf Anfrage.',
  'Der DJM-A9 von AlphaTheta (Pioneer DJ) ist der aktuelle 4-Kanal-Profi-Mixer für Club, Festival und große Event-Bühnen und bei uns an allen Standorten auf Anfrage mietbar. Der Kanaleingang arbeitet mit einem 32-Bit-A/D-Wandler, Master-, Booth-, REC- und SEND-Ausgang mit 32-Bit-D/A-Wandlern; die Abtastrate beträgt 96 kHz. Der Frequenzgang der LINE-Eingänge reicht von 20 Hz bis 40 kHz, der Klirrfaktor liegt bei 0,005 % (LINE – MASTER 1).

Gemixt wird über vier Kanäle mit MAGVEL FADER PRO und Crossfader, dazu Sound Color FX, Beat FX mit X-PAD und getrennter FX-Frequenzauswahl (LOW/MID/HI). Der Kanal-Equalizer regelt von -26 dB bis +6 dB (HI 20 kHz, MID 1 kHz, LOW 20 Hz), der Booth-Monitor besitzt einen eigenen 2-Band-EQ (-12 dB bis +6 dB bei 10 kHz bzw. 100 Hz).

Anschlussseitig stehen je 4 Sätze PHONO- und LINE-Cinch-Eingänge, 4 koaxiale DIGITAL-IN-Buchsen, MIC 1 als XLR/6,3-mm-TRS-Kombibuchse mit 48-V-Phantomspeisung, MIC 2 als 6,3-mm-TRS, Send (TS) und Return (TS) bereit. Ausgänge: MASTER als XLR und Cinch, BOOTH als 6,3-mm-TRS, REC OUT (Cinch), SEND (TS) sowie ein koaxialer DIGITAL MASTER OUT. Zwei unabhängige Kopfhörerausgänge (je 6,3 mm und 3,5 mm) erlauben das Auflegen zu zweit. Für Rechner gibt es 2× USB Typ B / Typ C und 1× USB Typ A (5 V / 2,1 A), für PRO DJ LINK eine LAN-Buchse (100BASE-TX). Kabellos unterstützt der Mixer WLAN nach IEEE 802.11a/b/g/n/ac (2,4/5 GHz) sowie Bluetooth 5.0 mit rund 10 m Reichweite als zusätzlichen Eingang.

Mit 407,4 × 458,3 × 107,9 mm (B × T × H, ohne aufgestellte Antenne) und 10,2 kg passt der DJM-A9 in gängige Mixer-Cases. Betrieben wird er an 110–240 V, 50/60 Hz bei 61 W Leistungsaufnahme; die zulässige Betriebstemperatur liegt bei +5 °C bis +35 °C. Wir vermieten den DJM-A9 an allen drei Standorten – Krefeld, Bonn und Mülheim an der Ruhr – auf Anfrage, typischerweise zusammen mit zwei CDJ-3000X als komplettes DJ-Setup.',
  'dj-equipment',
  ARRAY['krefeld','bonn','muelheim'],
  ARRAY['/product-images/djm-a9-1.jpeg','/product-images/djm-a9-2.jpeg','/product-images/djm-a9-3.jpeg','/product-images/djm-a9-4.jpeg'],
  ARRAY[
    'AlphaTheta DJM-A9 mieten – 4-Kanal-DJ-Mixer von oben mit Kanalzügen, MAGVEL FADER PRO und Beat-FX-Display',
    'DJM-A9 DJ-Mixer mieten – seitliche Ansicht mit Sound Color FX, X-PAD und WLAN-Antenne',
    'Rückseite des DJM-A9 – 4× Phono/Line, 4× Digital In, XLR-Master, Booth, Send/Return, MIC 1 XLR/TRS und LAN',
    'Frontseite des DJM-A9 mit zweitem Kopfhörerausgang PHONES B (6,3 mm und 3,5 mm)'
  ],
  '{"Typ":"4-Kanal-Profi-DJ-Mixer","Abtastrate":"96 kHz","D/A-Wandler (MASTER, BOOTH, REC, SEND)":"32 Bit","A/D-Wandler (Kanaleingang)":"32 Bit","Weitere A/D- und D/A-Wandler":"24 Bit","Frequenzgang (LINE)":"20 Hz – 40 kHz","Klirrfaktor (LINE – MASTER 1)":"0,005 %","Rauschabstand":"USB/Digital In 114 dB, LINE 105 dB, PHONO 88 dB, MIC 79 dB","Übersprechen (LINE)":"82 dB","Kanal-Equalizer":"HI/MID/LOW jeweils -26 dB bis +6 dB (20 kHz / 1 kHz / 20 Hz)","Booth-Monitor-EQ":"HI -12 dB bis +6 dB (10 kHz), LOW -12 dB bis +6 dB (100 Hz)","Eingänge":"4× PHONO (Cinch), 4× LINE (Cinch), 4× DIGITAL IN (koaxial), MIC 1 (XLR/6,3 mm TRS, 48 V Phantom), MIC 2 (6,3 mm TRS), RETURN (6,3 mm TS)","Ausgänge":"MASTER (XLR + Cinch), BOOTH (6,3 mm TRS), REC OUT (Cinch), SEND (6,3 mm TS), DIGITAL MASTER OUT (koaxial)","Kopfhörerausgänge":"2× 6,3 mm Stereo und 2× 3,5 mm Stereo-Mini (PHONES A und B)","USB":"USB Typ A × 1 (5 V / 2,1 A), USB Typ B / Typ C × 2","Netzwerk":"LAN 100BASE-TX (PRO DJ LINK)","WLAN":"IEEE 802.11 a/b/g/n/ac, 2,4 GHz / 5 GHz","Bluetooth":"Bluetooth Ver. 5.0, ca. 10 m Reichweite, 2,4 GHz","Abmessungen (B × T × H)":"407,4 × 458,3 × 107,9 mm (mit aufgestellter Antenne 140,7 mm hoch)","Gewicht":"10,2 kg","Stromversorgung":"AC 110 V – 240 V, 50/60 Hz","Leistungsaufnahme":"61 W (Standby 0,3 W)","Betriebstemperatur":"+5 °C bis +35 °C","Standorte":"Krefeld, Bonn und Mülheim an der Ruhr – jeweils auf Anfrage"}'::jsonb,
  ARRAY[
    '4 Kanäle mit MAGVEL FADER PRO und langlebigem Magnet-Crossfader',
    'Beat FX mit X-PAD sowie getrennter FX-Frequenzauswahl (LOW/MID/HI)',
    'Sound Color FX mit Center-Lock für präzise Effektarbeit',
    'MIC 1 mit XLR/TRS-Kombibuchse und 48-V-Phantomspeisung plus Push-To-Talk',
    'Bluetooth-5.0-Eingang – Musik kabellos auf jeden Kanal legen',
    'Zwei unabhängige Kopfhörerausgänge (PHONES A und B) für B2B-Sets',
    'Dual-USB (2× Typ B/Typ C) für zwei Laptops gleichzeitig',
    '96 kHz Abtastrate, 32-Bit-Wandler von ESS für Master, Booth, REC und SEND'
  ],
  ARRAY['event','dj','party','hochzeit','club','profi'],
  ARRAY[
    'Der DJM-A9 ist an allen Standorten auf Anfrage verfügbar – Verfügbarkeit und Termine stimmen wir vor der Buchung mit dir ab.',
    'Beliebte Kombination: DJM-A9 mit zwei CDJ-3000X als komplettes Club-Setup – bitte gemeinsam anfragen.',
    'Netzkabel und Kurzanleitung sind im Lieferumfang enthalten; Cinch-, XLR- und LAN-Kabel bitte bei Bedarf mit anfragen.',
    'Transport bitte liegend im Case oder gut gepolstert – die WLAN-Antenne vorher umklappen.',
    'Rückgabe sauber und vollständig mit allen mitgelieferten Kabeln.'
  ],
  'ab 59 €',
  '/ Wochenende',
  true,
  '/manuals/djm-a9-bedienungsanleitung.pdf',
  'https://www.pioneerdj.com/de/product/dj-mixers/djm-a9/',
  'DJM-A9 mieten Krefeld – DJ-Mixer ab 59 € | SLT',
  'AlphaTheta DJM-A9 mieten in Krefeld: 4-Kanal-Club-Mixer mit MAGVEL FADER PRO, Beat FX, Bluetooth und 96 kHz/32-Bit. Ab 59 € je Wochenende, auf Anfrage.',
  '[
    {"question":"Was kostet es, einen DJM-A9 zu mieten?","answer":"Die Miete startet ab 59 € netto je Wochenende. Für Komplett-Setups mit zwei CDJ-3000X sowie für längere Mietzeiträume nennen wir dir auf Anfrage einen Preis."},
    {"question":"Ist der DJM-A9 sofort verfügbar?","answer":"Der DJM-A9 ist bei uns auf Anfrage im Programm. Sag uns deinen Termin – wir bestätigen dir Verfügbarkeit und Abholzeit kurzfristig."},
    {"question":"Welche Anschlüsse hat der DJM-A9?","answer":"Je 4 Sätze PHONO- und LINE-Cinch-Eingänge, 4 koaxiale DIGITAL-IN, MIC 1 als XLR/6,3-mm-TRS mit 48-V-Phantomspeisung, MIC 2 als 6,3-mm-TRS sowie Send/Return. Ausgänge: MASTER (XLR und Cinch), BOOTH (6,3 mm TRS), REC OUT, SEND und ein koaxialer DIGITAL MASTER OUT."},
    {"question":"Kann ich Musik per Bluetooth zuspielen?","answer":"Ja. Der DJM-A9 hat einen Bluetooth-5.0-Eingang mit rund 10 m Reichweite, der sich auf jeden Kanal legen lässt."},
    {"question":"Wie viele Laptops und Kopfhörer lassen sich anschließen?","answer":"Zwei Rechner gleichzeitig über 2× USB Typ B / Typ C, dazu 1× USB Typ A. Für B2B-Sets stehen zwei unabhängige Kopfhörerausgänge (je 6,3 mm und 3,5 mm) bereit."},
    {"question":"Wie groß und schwer ist der Mixer für den Transport?","answer":"407,4 × 458,3 × 107,9 mm (B × T × H) bei 10,2 kg. Mit aufgestellter WLAN-Antenne beträgt die Höhe 140,7 mm – zum Transport bitte umklappen."},
    {"question":"Passt der DJM-A9 zu den CDJ-3000X?","answer":"Ja, beides ist über PRO DJ LINK (LAN, 100BASE-TX) vernetzbar. Wir vermieten den Mixer üblicherweise zusammen mit zwei CDJ-3000X als komplettes Club-Setup."}
  ]'::jsonb,
  true
)
ON CONFLICT (slug) DO NOTHING;