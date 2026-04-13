<?php
/**
 * Meta-Tag Injection for SPA Link Previews
 * 
 * This script serves correct OG meta tags for social media crawlers
 * (WhatsApp, Facebook, Slack, Twitter, etc.) that can't execute JavaScript.
 * Regular users are served the normal SPA (index.html).
 * 
 * Deploy this file to the root of your Serverprofis hosting.
 */

$SITE_ORIGIN = 'https://www.slt-rental.de';
$BASE_URL = $SITE_ORIGIN;
$OG_IMAGE = $SITE_ORIGIN . '/og-image.jpg';
$SITE_NAME = 'SLT Rental';

function buildAbsoluteUrl(string $path = '/'): string
{
    global $SITE_ORIGIN;

    $normalizedPath = parse_url($path, PHP_URL_PATH) ?: '/';
    $normalizedPath = '/' . ltrim($normalizedPath, '/');

    return $SITE_ORIGIN . $normalizedPath;
}

// Get the request path
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH);
$path = rtrim($path, '/') ?: '/';

// Check if the request is from a bot/crawler
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$botPatterns = [
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'WhatsApp',
    'LinkedInBot',
    'Slackbot',
    'TelegramBot',
    'Discordbot',
    'Googlebot',
    'bingbot',
    'Embedly',
    'Quora Link Preview',
    'Showyoubot',
    'outbrain',
    'pinterest',
    'vkShare',
    'W3C_Validator',
    'redditbot',
    'Applebot',
    'Pinterestbot',
    'Viber',
    'Skype',
    'Line/',
    'kakaotalk-scrap',
];

$isBot = false;
foreach ($botPatterns as $pattern) {
    if (stripos($userAgent, $pattern) !== false) {
        $isBot = true;
        break;
    }
}

// If not a bot, serve the normal SPA
if (!$isBot) {
    // Let Apache handle it normally (falls through to index.html via .htaccess)
    include __DIR__ . '/index.html';
    exit;
}

// ── Page Meta Data Map ──────────────────────────────────────
$pages = [
    '/' => [
        'title' => 'Baumaschinen & Equipment mieten in NRW | SLT Rental',
        'description' => 'SLT Rental vermietet Baumaschinen, Anhänger & Event-Equipment in NRW. 3 Standorte (Krefeld, Bonn, Mülheim), über 1.700 Mietprodukte, Tiefpreisgarantie & Wochenendtarife. Jetzt online mieten.',
    ],
    '/mieten' => [
        'title' => 'Equipment mieten in NRW – Standort wählen | SLT Rental',
        'description' => 'Baumaschinen, Anhänger & Eventequipment mieten – einfach online buchen. Wähle deinen Standort in Krefeld, Bonn oder Mülheim und starte direkt.',
    ],
    '/mieten/krefeld' => [
        'title' => 'Equipment mieten in Krefeld – Baumaschinen, Anhänger & mehr | SLT Rental',
        'description' => 'Über 600 Mietartikel in Krefeld ✓ Anhänger, Minibagger, Arbeitsbühnen, Werkzeuge & Event-Equipment ✓ Tiefpreisgarantie ✓ Wochenend-Tarife ✓ Lieferung',
    ],
    '/mieten/bonn' => [
        'title' => 'Equipment mieten in Bonn – Baumaschinen, Anhänger & mehr | SLT Rental',
        'description' => 'Über 500 Mietartikel in Bonn ✓ Anhänger, Minibagger, Arbeitsbühnen, Werkzeuge & Event-Equipment ✓ Tiefpreisgarantie ✓ Wochenend-Tarife ✓ Lieferung',
    ],
    '/mieten/muelheim' => [
        'title' => 'Equipment mieten in Mülheim an der Ruhr – Baumaschinen & Anhänger | SLT Rental',
        'description' => 'Baumaschinen & Anhänger mieten in Mülheim an der Ruhr ✓ 24/7 Self-Service ✓ Minibagger, Radlader, Anhänger ✓ Tiefpreisgarantie',
    ],
    '/standorte' => [
        'title' => 'Standorte – Krefeld, Bonn & Mülheim | SLT Rental',
        'description' => 'SLT Rental: 3 Standorte in NRW – Krefeld, Bonn & Mülheim an der Ruhr. Öffnungszeiten, Adressen und Ansprechpartner auf einen Blick.',
    ],
    '/standorte/krefeld' => [
        'title' => 'SLT Rental Krefeld – Hauptsitz | SLT Rental',
        'description' => 'SLT Rental Krefeld – Hauptsitz Anrather Str. 291, 47807 Krefeld. Mo–Fr 07:30–18 Uhr, Sa 08–14:30 Uhr. Baumaschinen, Anhänger & Eventequipment.',
    ],
    '/standorte/bonn' => [
        'title' => 'SLT Rental Bonn – Filiale | SLT Rental',
        'description' => 'SLT Rental Bonn – Drachenburgstraße 5, 53179 Bonn. Mo–Fr 07:30–18 Uhr, Sa 08–14:30 Uhr. Baumaschinen, Anhänger & Eventausstattung mieten.',
    ],
    '/standorte/muelheim' => [
        'title' => 'SLT Rental Mülheim – Corporate Filiale | SLT Rental',
        'description' => 'SLT Rental Mülheim – Bobcat Kompaktmaschinen & Bauequipment. Ruhrorter Str. 122, 45478 Mülheim. Online 24/7 buchbar, Abholung nach Vereinbarung.',
    ],
    '/kontakt' => [
        'title' => 'Kontakt – SLT Rental',
        'description' => 'SLT Rental kontaktieren: Telefon, E-Mail oder persönlich an 3 Standorten in NRW. Schnelle Beratung für Privat- & Geschäftskunden.',
    ],
    '/so-funktionierts' => [
        'title' => "So funktioniert's – Equipment mieten | SLT Rental",
        'description' => 'In 5 Schritten zur Mietmaschine: Online buchen, bezahlen, abholen oder liefern lassen. Schnell, transparent, ohne Stress – SLT Rental NRW.',
    ],
    '/lieferung' => [
        'title' => 'Lieferung & Abholung – Preise & Infos | SLT Rental',
        'description' => 'Lieferkosten transparent berechnen: SLT Rental liefert in ganz NRW – Niederrhein, Ruhrgebiet, Rheinland & Raum Bonn. Jetzt online kalkulieren.',
    ],
    '/faq' => [
        'title' => 'FAQ – Häufige Fragen | SLT Rental',
        'description' => 'Häufige Fragen zum Mieten bei SLT Rental: Buchung, Zahlung, Lieferung, Kaution & Schadensabwicklung. Alle Antworten auf einen Blick.',
    ],
    '/karriere' => [
        'title' => 'Karriere bei SLT Rental – Jobs in NRW',
        'description' => 'Jetzt beim SLT Rental Team einsteigen – Stellen in Krefeld, Bonn & Mülheim. Wir suchen Verstärkung im Verleih, Werkstatt und Vertrieb in NRW.',
    ],
    '/ueber-uns' => [
        'title' => 'Über uns – SLT Rental',
        'description' => 'SLT Rental – seit 2016 Ihr Partner für Baumaschinen & Eventausstattung in NRW. Über 3.500 zufriedene Kunden an 3 Standorten. Lernen Sie uns kennen.',
    ],
    '/hilfe' => [
        'title' => 'Hilfe & Wissensbasis – Anleitungen & Tipps | SLT Rental',
        'description' => 'Bedienanleitungen, Tipps & Hinweise zu allen Mietgeräten. Häufige Fragen zu Baumaschinen, Anhängern & Eventequipment – SLT Rental.',
    ],
    '/tiefpreisgarantie' => [
        'title' => 'Tiefpreisgarantie – Günstigster Preis garantiert | SLT Rental',
        'description' => 'SLT Rental garantiert: mindestens 10 % günstiger als jeder Wettbewerber. So funktioniert unsere Tiefpreisgarantie beim Baumaschinen- & Geräteverleih.',
    ],
    '/loesungen' => [
        'title' => 'Lösungen – Equipment für jede Branche | SLT Rental',
        'description' => 'Die passende Mietlösung für jedes Projekt: Tiefbau, Hochbau, Gartenbau, Events, Umzug & mehr. SLT Rental berät persönlich an 3 Standorten in NRW.',
    ],
    '/loesungen/tiefbau-erdbewegung' => [
        'title' => 'Tiefbau & Erdbewegung – Mietlösungen | SLT Rental',
        'description' => 'Baumaschinen für Tiefbau & Erdbewegung mieten: Minibagger, Radlader, Dumper & Verdichtung. Für Kanalbau, Hausanschlüsse & Erdarbeiten in NRW.',
    ],
    '/loesungen/hochbau-renovierung' => [
        'title' => 'Hochbau & Renovierung – Mietlösungen | SLT Rental',
        'description' => 'Equipment für Hochbau & Renovierung mieten in NRW: Arbeitsbühnen, Gerüste, Werkzeuge & Hebebühnen – für Neubau, Sanierung und Ausbau.',
    ],
    '/loesungen/galabau' => [
        'title' => 'Garten- & Landschaftsbau – Mietlösungen | SLT Rental',
        'description' => 'Gartenmaschinen mieten in NRW: Bagger, Häcksler, Vertikutierer & mehr. Für Privatgarten bis Parkanlage – faire Preise, 3 Standorte in NRW.',
    ],
    '/loesungen/events' => [
        'title' => 'Events & Veranstaltungen – Mietlösungen | SLT Rental',
        'description' => 'Eventausstattung mieten in NRW: PA-Anlagen, Zelte, Beleuchtung, Möbel & Geschirr. Für Hochzeiten, Firmenfeiern & Festivals – inkl. Auf-/Abbauservice.',
    ],
    '/loesungen/handwerk' => [
        'title' => 'Handwerk & Gewerbe – Mietlösungen | SLT Rental',
        'description' => 'Profi-Werkzeug & Baumaschinen für Handwerk und Gewerbe mieten in NRW: Bohrmaschinen, Trockner, Kompressoren & mehr. Tiefpreisgarantie.',
    ],
    '/loesungen/transport' => [
        'title' => 'Umzug & Transport – Mietlösungen | SLT Rental',
        'description' => 'Anhänger für Ihren Umzug mieten: Kastenanhänger, Autotransporter, Planenanhänger – 24/7 per SMS-Code. 3 Standorte in NRW, faire Preise.',
    ],
    '/loesungen/kinder' => [
        'title' => 'Kindergeburtstage – Hüpfburgen & Spaß | SLT Rental',
        'description' => 'Kindergeburtstag mieten in NRW: Hüpfburgen, Partyzelte, Besteck, Spiele & Deko. Alles aus einer Hand – mit Lieferung nach Krefeld, Bonn & Mülheim.',
    ],
    '/mietartikel' => [
        'title' => 'Baumaschinen, Event-Equipment & Anhänger mieten in NRW – alle Kategorien | SLT Rental',
        'description' => 'Alle Mietkategorien von SLT Rental auf einen Blick: Bagger, Anhänger, Arbeitsbühnen, PA-Anlagen, Geschirr & mehr. Über 1.700 Mietprodukte an 3 Standorten in NRW.',
    ],
    '/produkte' => [
        'title' => 'Equipment mieten in NRW – Standort wählen | SLT Rental',
        'description' => 'Baumaschinen, Anhänger & Eventequipment mieten – einfach online buchen. Wähle deinen Standort in Krefeld, Bonn oder Mülheim und starte direkt.',
    ],
    '/verkauf' => [
        'title' => 'Baumaschinen kaufen – Zoomlion, BAUMAX, Temared | SLT Rental',
        'description' => 'Baumaschinen kaufen in NRW: Zoomlion, BAUMAX & Temared – autorisierter Fachhändler. Neumaschinen & Gebrauchtmaschinen. Beratung & Lieferung NRW-weit.',
    ],
    '/verkauf/gebrauchtmaschinen' => [
        'title' => 'SLT Used – Gebrauchte Baumaschinen kaufen | SLT Rental',
        'description' => 'Geprüfte Gebrauchtmaschinen aus dem SLT-Mietpark: Baumaschinen & Anhänger sofort verfügbar. Persönliche Beratung, NRW-weit lieferbar.',
    ],
    '/dienstleistungen' => [
        'title' => 'Dienstleistungen – Planung, Lieferung & Service | SLT Rental',
        'description' => 'Mehr als nur Verleih: Planung, Auf-/Abbau, Lieferung & Verkehrssicherung für Events und Baustellen in NRW. Alles aus einer Hand – SLT Rental.',
    ],
    '/impressum' => [
        'title' => 'Impressum | SLT Rental',
        'description' => 'Impressum der SLT Technology Group GmbH & Co. KG. Geschäftsführer, Kontaktdaten, Handelsregistereintrag und Umsatzsteuer-ID.',
    ],
    '/datenschutz' => [
        'title' => 'Datenschutz | SLT Rental',
        'description' => 'Datenschutzerklärung der SLT Technology Group GmbH & Co. KG. Informationen zur Datenverarbeitung gemäß DSGVO.',
    ],
    '/agb' => [
        'title' => 'AGB | SLT Rental',
        'description' => 'Allgemeine Geschäftsbedingungen der SLT Technology Group GmbH & Co. KG für die Vermietung von Baumaschinen und Equipment.',
    ],
    '/ratgeber' => [
        'title' => 'Ratgeber & Magazin – Tipps rund ums Mieten | SLT Rental',
        'description' => 'Praxis-Tipps, Checklisten und Wissenswertes rund ums Mieten von Baumaschinen, Anhängern und Event-Equipment in NRW.',
    ],
    '/ratgeber/minibagger-mieten-ohne-fuehrerschein' => [
        'title' => 'Minibagger mieten ohne Führerschein – Rechtslage & Tipps | SLT Rental',
        'description' => 'Darf man einen Minibagger ohne Führerschein fahren? Rechtslage, Einweisungspflicht, Schutzausrüstung & wann ein Baggerschein nötig ist – verständlich erklärt.',
    ],
    '/ratgeber/anhaenger-24-stunden-mieten-sms-code' => [
        'title' => 'Anhänger 24 Stunden mieten per SMS-Code | SLT Rental',
        'description' => 'Anhänger rund um die Uhr mieten – auch nachts und am Wochenende. So funktioniert das SMS-Code-System von SLT Rental: Buchung, Code, Abholung, Rückgabe.',
    ],
    '/ratgeber/wochenendtarif-vs-tagesmiete' => [
        'title' => 'Wochenendtarif Baumaschine mieten – lohnt sich das? | SLT Rental',
        'description' => 'Wochenendtarif oder Tagesmiete? Vergleich mit Rechenbeispiel am Minibagger. So sparen Sie bei SLT Rental bis zu 40 % am Wochenende.',
    ],
    '/ratgeber/baustelle-innenstadt-baumaschine-beengte-verhaeltnisse' => [
        'title' => 'Baumaschinen für Innenstadt & beengte Baustellen | SLT Rental',
        'description' => 'Innenstadt-Baustelle? Elektro-Minibagger, Gummiketten & lärmarme Maschinen für beengte Verhältnisse. Lärmschutz NRW, Halteverbotszonen & Tipps von SLT Rental.',
    ],
    '/ratgeber/geschirr-mieten-hochzeit-mengen-checkliste' => [
        'title' => 'Geschirr mieten Hochzeit – Mengen-Checkliste & Tipps | SLT Rental',
        'description' => 'Wie viel Geschirr brauchen Sie für Ihre Hochzeit? Mengen-Checkliste für 50, 100 und 150 Gäste: Teller, Gläser, Besteck. Jetzt bei SLT Rental mieten.',
    ],
];

// ── Category pages pattern: /mieten/{location}/{category} ──
$categoryTitles = [
    'anhaenger' => 'Anhänger mieten in %s',
    'erdbewegung' => 'Minibagger & Erdbewegung mieten in %s',
    'werkzeuge' => 'Werkzeuge mieten in %s',
    'gartenpflege' => 'Gartengeräte mieten in %s',
    'aggregate' => 'Stromaggregate mieten in %s',
    'arbeitsbuehnen' => 'Arbeitsbühnen mieten in %s',
    'verdichtung' => 'Rüttelplatten & Stampfer mieten in %s',
    'kabel-stromverteiler' => 'Kabel & Stromverteiler mieten in %s',
    'leitern-gerueste' => 'Leitern & Gerüste mieten in %s',
    'heizung-trocknung' => 'Bautrockner & Heizgeräte mieten in %s',
    'absperrtechnik' => 'Absperrtechnik mieten in %s',
    'beschallung' => 'Beschallung mieten in %s',
    'kommunikation' => 'Kommunikationstechnik mieten in %s',
    'beleuchtung' => 'Beleuchtung mieten in %s',
    'buehne' => 'Bühne mieten in %s',
    'traversen-rigging' => 'Traversen & Rigging mieten in %s',
    'moebel-zelte' => 'Möbel & Zelte mieten in %s',
    'geschirr-glaeser-besteck' => 'Geschirr & Besteck mieten in %s',
    'spezialeffekte' => 'Spezialeffekte mieten in %s',
    'huepfburgen' => 'Hüpfburgen mieten in %s',
];

$locationNames = [
    'krefeld' => 'Krefeld',
    'bonn' => 'Bonn',
    'muelheim' => 'Mülheim an der Ruhr',
];

// ── Local area pages: /mieten-in/{area} ──
$localAreas = [
    'krefeld' => 'Krefeld', 'meerbusch' => 'Meerbusch', 'willich' => 'Willich',
    'toenisvorst' => 'Tönisvorst', 'kempen' => 'Kempen', 'moers' => 'Moers',
    'duisburg-west' => 'Duisburg-West', 'neuss' => 'Neuss', 'viersen' => 'Viersen',
    'kaarst' => 'Kaarst', 'bonn' => 'Bonn', 'bad-godesberg' => 'Bad Godesberg',
    'koenigswinter' => 'Königswinter', 'bad-honnef' => 'Bad Honnef',
    'sankt-augustin' => 'Sankt Augustin', 'siegburg' => 'Siegburg',
    'troisdorf' => 'Troisdorf', 'alfter' => 'Alfter', 'bornheim' => 'Bornheim',
    'meckenheim' => 'Meckenheim', 'rheinbach' => 'Rheinbach', 'wachtberg' => 'Wachtberg',
    'bad-neuenahr-ahrweiler' => 'Bad Neuenahr-Ahrweiler', 'remagen' => 'Remagen',
    'sinzig' => 'Sinzig', 'grafschaft' => 'Grafschaft', 'swisttal' => 'Swisttal',
    'muelheim-an-der-ruhr' => 'Mülheim an der Ruhr', 'essen' => 'Essen',
    'oberhausen' => 'Oberhausen', 'duisburg-sued' => 'Duisburg-Süd',
    'bottrop' => 'Bottrop', 'gelsenkirchen' => 'Gelsenkirchen',
    'ratingen' => 'Ratingen', 'bochum-west' => 'Bochum-West', 'dinslaken' => 'Dinslaken',
];

// ── Resolve meta data ──
$meta = null;

// 1. Exact match
if (isset($pages[$path])) {
    $meta = $pages[$path];
}

// 2. Category page: /mieten/{location}/{category}
if (!$meta && preg_match('#^/mieten/(krefeld|bonn|muelheim)/([a-z0-9-]+)$#', $path, $m)) {
    $locSlug = $m[1];
    $catSlug = $m[2];
    $locName = $locationNames[$locSlug] ?? ucfirst($locSlug);

    $categoryMetaDescs = [
        'anhaenger' => 'Anhänger mieten in %s – 24/7 per SMS-Code: Planenanhänger, Autotransporter, Kastenanhänger & mehr. Online buchbar, Tiefpreisgarantie.',
        'erdbewegung' => 'Bagger & Erdbewegungsmaschinen mieten in %s: Bobcat, Minibagger, Radlader, Dumper + Anbaugeräte. Tiefpreisgarantie, sofort verfügbar.',
        'werkzeuge' => 'Elektro- & Handwerkzeuge mieten in %s: Bohrmaschinen, Flex, Sägen, Rotationslaser & mehr. Kurzfristig verfügbar – SLT Rental Tiefpreisgarantie.',
        'gartenpflege' => 'Gartengeräte mieten in %s: Kettensäge, Heckenschere, Häcksler, Vertikutierer & Hochdruckreiniger. Online buchbar bei SLT Rental.',
        'aggregate' => 'Stromerzeuger & Kompressoren mieten in %s: 2,8 kVA bis 100 kVA, Akkupacks. Für Baustelle, Event & Outdoor – SLT Rental.',
        'arbeitsbuehnen' => 'Arbeitsbühnen mieten in %s: Scherenbühnen 8–12 m, Mastbühne 11 m, Gelenksteiger, Anhängerbühne 18 m. Tiefpreisgarantie.',
        'verdichtung' => 'Rüttelplatten & Stampfer mieten in %s: VP 16/44 bis HVP 50/60, Grabenwalze, Stampfer. SLT Rental Tiefpreisgarantie.',
        'kabel-stromverteiler' => 'Kabel & Stromverteiler mieten in %s: CEE-Kabel, Schukokabel, Verteiler, Kabelbrücken – geprüft, sicher, für Event & Baustelle.',
        'leitern-gerueste' => 'Leitern & Rollgerüste mieten in %s: Steh-, Mehrzweckleitern, Krause-Rollgerüste 3–11 m, Breitaufbau. SLT Rental.',
        'heizung-trocknung' => 'Bautrockner & Heizlüfter mieten in %s: KT200, KT553, Heizlüfter 2–9 kW. Schnelle Trocknung – SLT Rental.',
        'absperrtechnik' => 'Absperrtechnik & Verkehrszeichen mieten in %s: Bauzäune, VZ-Schilder, Warnbarken, Halteverbotsschilder. SLT Rental.',
        'beschallung' => 'PA-Anlage & Beschallung mieten in %s: Soundboks Gen.3, DAS PA-Systeme, Pioneer CDJ/DJM, Shure Funkmikrofone. SLT Rental.',
        'kommunikation' => 'Funkgeräte mieten in %s: UHF-Funkgeräte für Events & Baustellen. Kurzfristig verfügbar – SLT Rental.',
        'beleuchtung' => 'Eventbeleuchtung mieten in %s: LED-Scheinwerfer, Moving Head, 4er Bar, LED-Fluter RGBWAUV. SLT Rental.',
        'buehne' => 'Bühnenelemente & Podeste mieten in %s: Nivtec Systempodeste, Teleskopfüße. Für Events in NRW – SLT Rental.',
        'traversen-rigging' => 'Traversen & Rigging mieten in %s: Milos M290 Traversen, Multicube, Traversencover. Für Licht & Ton – SLT Rental.',
        'moebel-zelte' => 'Partyzelte & Eventmöbel mieten in %s: 3×3 m bis 6×12 m, Bierzeltgarnituren, Stehtische, Stühle. SLT Rental.',
        'geschirr-glaeser-besteck' => 'Geschirr, Gläser & Besteck mieten in %s: Teller, Weingläser, Sektgläser, Besteck – Gastro-Qualität für Events.',
        'spezialeffekte' => 'Spezialeffekte mieten in %s: Nebelmaschine, Kalte Funkenfontänen, CO2-Jet. Für Events & Hochzeiten – SLT Rental.',
        'huepfburgen' => 'Hüpfburgen mieten in %s: Lamar, Wasserpark, Rollercoaster, Clown. Für Kindergeburtstage & Familienfeste – SLT Rental.',
    ];

    if (isset($categoryTitles[$catSlug])) {
        $catTitle = sprintf($categoryTitles[$catSlug], $locName);
        $catDesc = isset($categoryMetaDescs[$catSlug]) ? sprintf($categoryMetaDescs[$catSlug], $locName) : $catTitle . ' – online buchbar bei SLT Rental. Tiefpreisgarantie, Lieferung möglich.';
        $meta = [
            'title' => $catTitle . ' | SLT Rental',
            'description' => $catDesc,
        ];
    }
}

// 3. Product detail page: /mieten/{location}/{category}/{product}
$productBodyContent = '';
if (!$meta && preg_match('#^/mieten/(krefeld|bonn|muelheim)/([a-z0-9-]+)/([a-z0-9-]+)$#', $path, $m)) {
    $locSlug = $m[1];
    $catSlug = $m[2];
    $productSlug = $m[3];
    $locName = $locationNames[$locSlug] ?? ucfirst($locSlug);
    $catName = isset($categoryTitles[$catSlug]) ? str_replace(' mieten in %s', '', $categoryTitles[$catSlug]) : ucwords(str_replace('-', ' ', $catSlug));

    // Load product SEO data
    @include __DIR__ . '/product-seo-data.php';

    $seo = $productSEOLookup[$productSlug] ?? null;
    $detail = $productDetails[$productSlug] ?? null;

    $productName = $detail['name'] ?? ($seo['name'] ?? ucwords(str_replace('-', ' ', $productSlug)));
    $modelName = $detail['modelName'] ?? '';
    $h1 = $productName . ' mieten in ' . $locName;

    // Build meta description: generic name + model mention for CTR
    $descSnippet = '';
    $rawDesc = $detail['description'] ?? '';
    if ($rawDesc) {
        $descSnippet = mb_substr($rawDesc, 0, 80);
        if (mb_strlen($rawDesc) > 80) {
            $descSnippet = preg_replace('/\s+\S*$/', '', $descSnippet);
        }
        $metaDesc = $productName . ' mieten in ' . $locName . ' bei SLT Rental. ' . $descSnippet . '. Tiefpreisgarantie, flexible Mietzeiten, Lieferung möglich.';
    } else {
        $metaDesc = $productName . ' mieten in ' . $locName . ' bei SLT Rental.' . ($modelName ? ' ' . $modelName . '.' : '') . ' Tiefpreisgarantie, flexible Mietzeiten, Lieferung möglich.';
    }
    if (mb_strlen($metaDesc) > 155) {
        $metaDesc = mb_substr($metaDesc, 0, 152) . '...';
    }

    // Title: max 60 chars
    $titleBase = $productName . ' mieten in ' . $locName;
    $seoTitle = mb_strlen($titleBase . ' | SLT Rental') <= 60 ? $titleBase . ' | SLT Rental' : $titleBase;

    $meta = [
        'title' => $seoTitle,
        'description' => $metaDesc,
    ];

    // Build rich product body for crawlers
    $productBodyContent = '<nav aria-label="Breadcrumb"><ol>';
    $productBodyContent .= '<li><a href="' . $BASE_URL . '/mieten">Equipment mieten</a></li>';
    $productBodyContent .= '<li><a href="' . $BASE_URL . '/mieten/' . htmlspecialchars($locSlug) . '">' . htmlspecialchars($locName) . '</a></li>';
    $productBodyContent .= '<li><a href="' . $BASE_URL . '/mieten/' . htmlspecialchars($locSlug) . '/' . htmlspecialchars($catSlug) . '">' . htmlspecialchars($catName) . '</a></li>';
    $productBodyContent .= '<li>' . htmlspecialchars($productName) . '</li>';
    $productBodyContent .= '</ol></nav>';

    $productBodyContent .= '<article>';
    $productBodyContent .= '<h1>' . htmlspecialchars($h1) . '</h1>';
    if ($modelName) {
        $productBodyContent .= '<p><strong>Modell:</strong> ' . htmlspecialchars($modelName) . '</p>';
    }

    // Description
    $desc = $detail['description'] ?? '';
    if ($desc) {
        $productBodyContent .= '<p>' . htmlspecialchars($desc) . '</p>';
    }
    $productBodyContent .= '<section><h2>Verfügbarkeit</h2>';
    $productBodyContent .= '<p>Standort: ' . htmlspecialchars($locName) . '</p>';
    $productBodyContent .= '<p>Status: Sofort verfügbar</p>';
    $productBodyContent .= '<p><a href="' . $BASE_URL . '/kontakt">Jetzt anfragen</a></p>';
    $productBodyContent .= '</section>';

    // Technical specifications
    if ($detail && !empty($detail['specs'])) {
        $productBodyContent .= '<section><h2>Technische Daten</h2><table>';
        foreach ($detail['specs'] as $key => $val) {
            $productBodyContent .= '<tr><th>' . htmlspecialchars($key) . '</th><td>' . htmlspecialchars($val) . '</td></tr>';
        }
        if (!empty($detail['weightKg'])) {
            $w = (int)$detail['weightKg'];
            $productBodyContent .= '<tr><th>Gewichtsklasse</th><td>' . ($w >= 1000 ? number_format($w/1000, 1, ',', '.') . ' t' : $w . ' kg') . '</td></tr>';
        }
        $productBodyContent .= '</table></section>';
    }

    // SEO H2 sections
    if ($seo && !empty($seo['h2s'])) {
        foreach ($seo['h2s'] as $h2) {
            $productBodyContent .= '<section><h2>' . htmlspecialchars($h2) . '</h2></section>';
        }
    }

    // Use cases
    if ($seo) {
        $productBodyContent .= '<section><h2>Einsatzgebiete</h2><ul>';
        if (!empty($seo['useCaseBau'])) {
            $productBodyContent .= '<li><strong>Bau &amp; Handwerk:</strong> ' . htmlspecialchars($seo['useCaseBau']) . '</li>';
        }
        if (!empty($seo['useCaseEvent'])) {
            $productBodyContent .= '<li><strong>Events &amp; Veranstaltungen:</strong> ' . htmlspecialchars($seo['useCaseEvent']) . '</li>';
        }
        if (!empty($seo['useCasePrivat'])) {
            $productBodyContent .= '<li><strong>Privat:</strong> ' . htmlspecialchars($seo['useCasePrivat']) . '</li>';
        }
        $productBodyContent .= '</ul></section>';
    }

    // FAQs
    if ($seo && !empty($seo['faqs'])) {
        $productBodyContent .= '<section><h2>Häufig gestellte Fragen</h2><dl>';
        foreach ($seo['faqs'] as $faq) {
            $productBodyContent .= '<dt>' . htmlspecialchars($faq['q']) . '</dt>';
            $productBodyContent .= '<dd>' . htmlspecialchars($faq['a']) . '</dd>';
        }
        $productBodyContent .= '</dl></section>';
    }

    // Purchase banner (visible but not the only content)
    $productBodyContent .= '<section><h2>Lieber kaufen statt mieten?</h2>';
    $productBodyContent .= '<p>Wir bieten auch Neumaschinen und Gebrauchtmaschinen zum Kauf an.</p>';
    $productBodyContent .= '<a href="' . $BASE_URL . '/verkauf">Kaufangebote ansehen</a>';
    $productBodyContent .= '</section>';

    // Related links
    $productBodyContent .= '<section><h2>Weitere Artikel in ' . htmlspecialchars($catName) . '</h2>';
    $productBodyContent .= '<a href="' . $BASE_URL . '/mieten/' . htmlspecialchars($locSlug) . '/' . htmlspecialchars($catSlug) . '">Alle ' . htmlspecialchars($catName) . ' in ' . htmlspecialchars($locName) . ' ansehen</a>';
    $productBodyContent .= '</section>';

    $productBodyContent .= '</article>';

    // Footer
    $productBodyContent .= '<footer><ul>';
    $productBodyContent .= '<li><a href="' . $BASE_URL . '/impressum">Impressum</a></li>';
    $productBodyContent .= '<li><a href="' . $BASE_URL . '/datenschutz">Datenschutz</a></li>';
    $productBodyContent .= '<li><a href="' . $BASE_URL . '/agb">AGB</a></li>';
    $productBodyContent .= '</ul></footer>';
}

// 4. Local area page: /mieten-in/{area}
if (!$meta && preg_match('#^/mieten-in/([a-z0-9-]+)$#', $path, $m)) {
    $areaSlug = $m[1];
    $areaDisplayNames = [
        'toenisvorst' => 'Tönisvorst', 'duisburg-west' => 'Duisburg', 'duesseldorf' => 'Düsseldorf',
        'koenigswinter' => 'Königswinter', 'bad-honnef' => 'Bad Honnef', 'bad-godesberg' => 'Bad Godesberg',
        'sankt-augustin' => 'Sankt Augustin', 'bad-neuenahr-ahrweiler' => 'Bad Neuenahr-Ahrweiler',
        'muelheim-an-der-ruhr' => 'Mülheim an der Ruhr', 'duisburg-sued' => 'Duisburg', 'bochum-west' => 'Bochum',
    ];
    $areaName = $areaDisplayNames[$areaSlug] ?? ($localAreas[$areaSlug] ?? ucwords(str_replace('-', ' ', $areaSlug)));

    // Region mapping: slug → nearest SLT location
    $regionKrefeld = ['krefeld','meerbusch','willich','toenisvorst','kempen','moers','duisburg-west','neuss','viersen','kaarst','duesseldorf'];
    $regionBonn = ['bonn','bad-godesberg','koenigswinter','bad-honnef','sankt-augustin','siegburg','troisdorf','alfter','bornheim','meckenheim','rheinbach','wachtberg','bad-neuenahr-ahrweiler','remagen','sinzig','grafschaft','swisttal'];
    $regionMuelheim = ['muelheim-an-der-ruhr','essen','oberhausen','duisburg-sued','bottrop','gelsenkirchen','ratingen','bochum-west','dinslaken'];

    // Sonderfälle
    if ($areaSlug === 'krefeld') {
        $metaDesc = 'Baumaschinen, Anhänger & Equipment mieten in Krefeld. Direkt am Standort Anrather Str. 291. Online buchbar, Tiefpreisgarantie.';
    } elseif ($areaSlug === 'bonn') {
        $metaDesc = 'Baumaschinen, Anhänger & Equipment mieten in Bonn. Direkt am Standort Drachenburgstraße 5. Online buchbar, Tiefpreisgarantie.';
    } elseif ($areaSlug === 'muelheim-an-der-ruhr') {
        $metaDesc = 'Baumaschinen, Anhänger & Equipment mieten in Mülheim an der Ruhr. Bobcat-Spezialist. Online 24/7 buchbar – SLT Rental.';
    } elseif (in_array($areaSlug, $regionBonn)) {
        $metaDesc = 'Baumaschinen, Anhänger & Equipment mieten für ' . $areaName . ' – Lieferung vom SLT Rental Standort Bonn. Online buchbar, Tiefpreisgarantie.';
    } elseif (in_array($areaSlug, $regionMuelheim)) {
        $metaDesc = 'Baumaschinen, Anhänger & Equipment mieten für ' . $areaName . ' – Lieferung vom SLT Rental Standort Mülheim. Online buchbar, Tiefpreisgarantie.';
    } else {
        $metaDesc = 'Baumaschinen, Anhänger & Equipment mieten für ' . $areaName . ' – Lieferung vom SLT Rental Standort Krefeld. Online buchbar, Tiefpreisgarantie.';
    }

    $meta = [
        'title' => 'Baumaschinen & Equipment mieten in ' . $areaName . ' | SLT Rental',
        'description' => $metaDesc,
    ];
}

// 5. Standort detail: /standorte/{id}
if (!$meta && preg_match('#^/standorte/(krefeld|bonn|muelheim)$#', $path, $m)) {
    $locName = $locationNames[$m[1]] ?? ucfirst($m[1]);
    $meta = [
        'title' => 'Standort ' . $locName . ' – Öffnungszeiten & Anfahrt | SLT Rental',
        'description' => 'SLT Rental Standort in ' . $locName . '. Öffnungszeiten, Anfahrt, Kontakt und verfügbare Mietartikel.',
    ];
}

// Fallback
if (!$meta) {
    $meta = [
        'title' => 'Baumaschinen & Equipment mieten in NRW | SLT Rental',
        'description' => 'Über 1.700 Mietartikel ✓ 3 Standorte in NRW ✓ Tiefpreisgarantie ✓ Faire Preise ✓ Lieferung möglich',
    ];
}

$title = htmlspecialchars($meta['title'], ENT_QUOTES, 'UTF-8');
$description = htmlspecialchars($meta['description'], ENT_QUOTES, 'UTF-8');
$canonicalUrl = buildAbsoluteUrl($path);

// ── Homepage rich body content ──
$homepageBody = '';
if ($path === '/') {
    $homepageBody = <<<'HTML'
  <nav aria-label="Hauptnavigation">
    <ul>
      <li><a href="https://www.slt-rental.de/mieten">Equipment mieten</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld">Krefeld</a></li>
      <li><a href="https://www.slt-rental.de/mieten/bonn">Bonn</a></li>
      <li><a href="https://www.slt-rental.de/mieten/muelheim">Mülheim an der Ruhr</a></li>
      <li><a href="https://www.slt-rental.de/standorte">Standorte</a></li>
      <li><a href="https://www.slt-rental.de/loesungen">Lösungen</a></li>
      <li><a href="https://www.slt-rental.de/kontakt">Kontakt</a></li>
      <li><a href="https://www.slt-rental.de/so-funktionierts">So funktioniert's</a></li>
      <li><a href="https://www.slt-rental.de/lieferung">Lieferung &amp; Abholung</a></li>
      <li><a href="https://www.slt-rental.de/faq">FAQ</a></li>
      <li><a href="https://www.slt-rental.de/karriere">Karriere</a></li>
      <li><a href="https://www.slt-rental.de/tiefpreisgarantie">Tiefpreisgarantie</a></li>
      <li><a href="https://www.slt-rental.de/verkauf">Verkauf &amp; Marken</a></li>
      <li><a href="https://www.slt-rental.de/dienstleistungen">Dienstleistungen</a></li>
    </ul>
  </nav>

  <section>
    <p>Das beste Equipment zum besten Preis.</p>
    <h1>Baumaschinen, Anhänger &amp; Eventausstattung mieten – einfach, schnell, zuverlässig.</h1>
    <p>Über 1.700 Mietartikel an 3 Standorten in NRW. Faire Tagespreise, Wochenend-Tarife und Lieferung direkt auf Ihre Baustelle oder zu Ihrem Event.</p>
  </section>

  <section>
    <p>+3.500 zufriedene Kunden</p>
    <p>+1.700 Mietartikel</p>
    <p>3 Standorte in NRW</p>
    <p>seit 2016 Ihr Partner</p>
  </section>

  <section>
    <h2>Unsere Standorte in NRW</h2>
    <p>Drei Standorte – ein Versprechen: Das beste Equipment zum besten Preis.</p>

    <h3>Krefeld</h3>
    <p>Anrather Straße 291, 47807 Krefeld-Fichtenhain</p>
    <p>Telefon: 02151 417 99 04</p>
    <p>E-Mail: krefeld@slt-rental.de</p>
    <a href="https://www.slt-rental.de/mieten/krefeld">Kategorien ansehen</a>

    <h3>Bonn</h3>
    <p>Drachenburgstraße 8, 53179 Bonn</p>
    <p>Telefon: 0228 504 660 61</p>
    <p>E-Mail: bonn@slt-rental.de</p>
    <a href="https://www.slt-rental.de/mieten/bonn">Kategorien ansehen</a>

    <h3>Mülheim an der Ruhr</h3>
    <p>Ruhrorter Str. 122, 45478 Mülheim an der Ruhr</p>
    <p>Telefon: 02151 417 99 04</p>
    <a href="https://www.slt-rental.de/mieten/muelheim">Kategorien ansehen</a>

    <a href="https://www.slt-rental.de/standorte">Alle Standorte ansehen</a>
  </section>

  <section>
    <h2>So funktioniert's – In 5 Schritten zum Equipment</h2>
    <ol>
      <li>Standort wählen – Krefeld, Bonn oder Mülheim</li>
      <li>Equipment suchen – Über 1.700 Mietartikel durchstöbern</li>
      <li>Anfrage senden – Unverbindlich und kostenlos</li>
      <li>Angebot erhalten – Persönliches Angebot vom Team</li>
      <li>Abholen oder liefern lassen – Flexibel und unkompliziert</li>
    </ol>
  </section>

  <section>
    <h2>Unsere Dienstleistungen</h2>
    <a href="https://www.slt-rental.de/dienstleistungen">Dienstleistungen ansehen</a>
  </section>

  <section>
    <h2>Kategorien</h2>
    <ul>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/anhaenger">Anhänger mieten</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/erdbewegung">Minibagger &amp; Erdbewegung</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/werkzeuge">Werkzeuge mieten</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/arbeitsbuehnen">Arbeitsbühnen mieten</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/verdichtung">Rüttelplatten &amp; Stampfer</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/gartenpflege">Gartengeräte mieten</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/aggregate">Stromaggregate</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/leitern-gerueste">Leitern &amp; Gerüste</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/heizung-trocknung">Bautrockner &amp; Heizgeräte</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/kabel-stromverteiler">Kabel &amp; Stromverteiler</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/absperrtechnik">Absperrtechnik</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/moebel-zelte">Möbel &amp; Zelte</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/geschirr-glaeser-besteck">Geschirr, Gläser &amp; Besteck</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/beleuchtung">Beleuchtung</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/beschallung">Beschallung</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/buehne">Bühne</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/traversen-rigging">Traversen &amp; Rigging</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/spezialeffekte">Spezialeffekte</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/huepfburgen">Hüpfburgen</a></li>
      <li><a href="https://www.slt-rental.de/mieten/krefeld/kommunikation">Kommunikationstechnik</a></li>
    </ul>
  </section>

  <section>
    <h2>Verkauf &amp; Marken</h2>
    <p>Autorisierter Fachhändler &amp; Servicestützpunkt. Baumaschinen &amp; Anhänger auch zum Kauf verfügbar.</p>
    <a href="https://www.slt-rental.de/verkauf">Neumaschinen entdecken</a>
    <a href="https://www.slt-rental.de/verkauf/gebraucht">SLT Used ansehen</a>
  </section>

  <section>
    <h2>Jetzt Equipment mieten</h2>
    <p>Finden Sie das passende Equipment für Ihr Projekt – einfach, schnell und zum besten Preis.</p>
    <a href="https://www.slt-rental.de/mieten">Equipment mieten</a>
  </section>

  <section>
    <h2>Ihre Vorteile bei SLT Rental</h2>
    <ul>
      <li><strong>Faire Preise</strong> – Transparente Tagespreise ohne versteckte Kosten. Tiefpreisgarantie für Gewerbekunden.</li>
      <li><strong>Lieferung &amp; Abholung</strong> – Wir liefern Ihr Equipment direkt auf die Baustelle oder zum Event.</li>
      <li><strong>Flexible Mietzeiten</strong> – Tages-, Wochen- und Monatstarife. Auch am Wochenende.</li>
      <li><strong>Persönliche Beratung</strong> – Unser Team berät Sie bei der Auswahl des richtigen Equipments.</li>
    </ul>
  </section>

  <section>
    <h2>Baumaschinen &amp; Equipment mieten in NRW – Ihr Partner für jedes Projekt</h2>
    <p>SLT Rental ist Ihr Spezialist für die Vermietung von Baumaschinen, Anhängern und Event-Equipment in Nordrhein-Westfalen. Mit drei Standorten in <a href="https://www.slt-rental.de/mieten/krefeld">Krefeld</a>, <a href="https://www.slt-rental.de/mieten/bonn">Bonn</a> und <a href="https://www.slt-rental.de/mieten/muelheim">Mülheim an der Ruhr</a> sind wir immer in Ihrer Nähe – egal ob Sie einen Minibagger für den Garten, eine Arbeitsbühne für die Fassade oder eine Hüpfburg für den Kindergeburtstag suchen.</p>
    <h3>Über 1.700 Mietartikel für Bau, Garten &amp; Events</h3>
    <p>Unser Sortiment reicht von Baggern und Radladern über Rüttelplatten und Bautrockner bis hin zu Profi-Werkzeugen. Für Events bieten wir Zelte und Eventmöbel, Geschirr und Besteck, Beschallungsanlagen, Beleuchtung und professionelle Bühnensysteme. Am Standort Mülheim stehen außerdem leistungsstarke Bobcat-Maschinen zur Verfügung.</p>
    <h3>Die größte Anhänger-Auswahl in NRW</h3>
    <p>Mit über 200 Anhängern bieten wir die größte Auswahl in der Region – vom Kastenanhänger über den Autotransporter bis zum Schwerlast-Tieflader. Alle Anhänger sind regelmäßig geprüft und sofort einsatzbereit.</p>
    <h3>Tiefpreisgarantie &amp; Wochenend-Tarife</h3>
    <p>Wir bieten eine Tiefpreisgarantie für Gewerbekunden: Finden Sie ein identisches Produkt günstiger, erhalten Sie 10 % Rabatt auf den Nettomietpreis. Privatkunden profitieren von fairen Wochenend-Tarifen.</p>
    <h3>Lieferung in ganz NRW</h3>
    <p>Ihr Equipment können Sie an unseren <a href="https://www.slt-rental.de/standorte">Standorten</a> abholen oder wir liefern es direkt zu Ihnen. Unser Liefergebiet umfasst den gesamten Niederrhein, das Rheinland und das Ruhrgebiet. Die Lieferkosten berechnen Sie transparent mit unserem <a href="https://www.slt-rental.de/lieferung">Online-Kalkulator</a>.</p>
    <p><strong>SLT Rental – Das beste Equipment zum besten Preis.</strong></p>
  </section>

  <footer>
    <ul>
      <li><a href="https://www.slt-rental.de/impressum">Impressum</a></li>
      <li><a href="https://www.slt-rental.de/datenschutz">Datenschutz</a></li>
      <li><a href="https://www.slt-rental.de/agb">AGB</a></li>
    </ul>
  </footer>
HTML;
}

// ── /verkauf rich body content with FAQ ──
$verkaufBody = '';
if ($path === '/verkauf') {
    $verkaufFaqs = [
        ['q' => 'Wo finde ich einen Zoomlion Händler in NRW?', 'a' => 'SLT Rental in Bonn und Krefeld ist autorisierter Zoomlion-Fachhändler und Servicestützpunkt für Nordrhein-Westfalen. Wir führen Bagger, Radlader, Teleskoplader und Arbeitsbühnen der Zoomlion-Linie und bieten persönliche Beratung, Vorführung und Werksdienst.'],
        ['q' => 'Wo kann ich BAUMAX Baumaschinen kaufen?', 'a' => 'SLT Rental ist autorisierter BAUMAX-Fachhändler in NRW. Wir führen das komplette BAUMAX-Sortiment: Rüttelplatten (VP, HVP, RVP-Serie), Vibrationsstampfer, Minidumper, Steinsägen und Betonrüttler – mit Ersatzteilservice und Kundendienst vor Ort.'],
        ['q' => 'Kann ich Temared Anhänger in Bonn oder Krefeld kaufen?', 'a' => 'Ja – SLT Rental ist autorisierter Temared-Fachhändler in NRW mit Ausstellungsmodellen in Bonn und Krefeld. Wir führen das komplette Temared-Sortiment von 750 kg bis 3.500 kg und übernehmen Zulassung, Lieferung und Service.'],
        ['q' => 'Bietet SLT Rental auch Service und Reparatur für gekaufte Maschinen an?', 'a' => 'Ja – als zertifizierter Servicestützpunkt für Zoomlion, BAUMAX und Temared übernehmen wir Wartung, Inspektion, Reparatur und Ersatzteilversorgung für alle bei uns verkauften Maschinen und Anhänger.'],
        ['q' => 'Kann ich eine Baumaschine erst mieten und dann kaufen?', 'a' => 'Ja, bei SLT Rental bieten wir ein Mietkauf-Modell an: Testen Sie die Maschine im Mietbetrieb und rechnen Sie die Mietkosten anteilig auf den Kaufpreis an. Sprechen Sie uns einfach an – wir beraten Sie individuell.'],
        ['q' => 'Liefert SLT Rental Baumaschinen und Anhänger auch an?', 'a' => 'Ja, wir liefern alle bei uns gekauften Maschinen und Anhänger direkt zur Baustelle, zum Betrieb oder nach Hause – in ganz NRW und darüber hinaus. Die Lieferkosten teilen wir Ihnen im Angebot transparent mit.'],
        ['q' => 'Welche Finanzierungsmöglichkeiten gibt es beim Kauf?', 'a' => 'Wir beraten Sie gerne zu individuellen Finanzierungs- und Leasingoptionen für Baumaschinen und Anhänger. Kontaktieren Sie uns für ein persönliches Angebot – als gewerblicher Kunde profitieren Sie von attraktiven Konditionen.'],
    ];

    $faqJsonLd = [
        '@context' => 'https://schema.org',
        '@type' => 'FAQPage',
        'mainEntity' => array_map(function($f) {
            return [
                '@type' => 'Question',
                'name' => $f['q'],
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f['a']],
            ];
        }, $verkaufFaqs),
    ];

    $faqJsonLdScript = '<script type="application/ld+json">' . json_encode($faqJsonLd, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';

    $faqHtml = '';
    foreach ($verkaufFaqs as $f) {
        $q = htmlspecialchars($f['q'], ENT_QUOTES, 'UTF-8');
        $a = htmlspecialchars($f['a'], ENT_QUOTES, 'UTF-8');
        $faqHtml .= "<div><h3>{$q}</h3><p>{$a}</p></div>\n";
    }

    $verkaufBody = <<<HTML
  {$faqJsonLdScript}
  <h1>Baumaschinen kaufen – Zoomlion, BAUMAX, Temared | SLT Rental</h1>
  <p>Autorisierter Fachhändler und Servicestützpunkt für Zoomlion, BAUMAX Baumaschinen und Temared in Nordrhein-Westfalen.</p>
  <section>
    <h2>Häufig gestellte Fragen zum Kauf</h2>
    {$faqHtml}
  </section>
HTML;
}

// ── Blog / Ratgeber body ──
$blogBody = '';
$blogArticles = [
    'minibagger-mieten-ohne-fuehrerschein' => [
        'title' => 'Minibagger mieten ohne Führerschein – was erlaubt ist und was nicht',
        'date' => '2026-01-15',
        'image' => '/images/ratgeber/blog_thumbnail_minibagger_ohne_fuehrerschein.svg',
        'facts' => [
            'Minibagger bis 3,5 t dürfen auf Privatgelände ohne Führerschein bedient werden',
            'Im öffentlichen Straßenverkehr ist mindestens eine Fahrerlaubnis der Klasse L oder T erforderlich',
            'Eine Einweisung durch den Vermieter ist gesetzlich vorgeschrieben (DGUV Vorschrift 1)',
            'Schutzausrüstung (Helm, Sicherheitsschuhe, Warnweste) ist Pflicht auf Baustellen',
            'SLT Rental bietet eine kostenlose Einweisung bei jeder Anmietung',
        ],
    ],
    'anhaenger-24-stunden-mieten-sms-code' => [
        'title' => 'Anhänger 24/7 abholen per SMS-Code – so funktioniert das System bei SLT Rental',
        'date' => '2026-02-08',
        'image' => '/images/ratgeber/blog_thumbnail_anhaenger_sms_code_24_7.svg',
        'facts' => [
            'Anhänger an allen SLT-Standorten 24/7 per SMS-Code abholbar',
            'Online buchen, bezahlen, Code per SMS erhalten – fertig',
            'Rückgabe jederzeit ohne Wartezeit',
            'Führerschein Klasse B (bis 750 kg Anhänger) oder BE erforderlich',
        ],
    ],
    'wochenendtarif-vs-tagesmiete' => [
        'title' => 'Wochenendtarif vs. Tagesmiete – was lohnt sich wirklich?',
        'date' => '2025-11-22',
        'image' => '/images/ratgeber/blog_thumbnail_wochenendtarif_vs_tagesmiete.svg',
        'facts' => [
            'Wochenendtarif: Freitag 16 Uhr abholen, Montag 8 Uhr zurückgeben – 1 Tag bezahlen',
            'Bis zu 40 % günstiger als 3 Einzeltage',
            'Gilt für Baumaschinen, Anhänger und Event-Equipment',
        ],
    ],
    'baustelle-innenstadt-baumaschine-beengte-verhaeltnisse' => [
        'title' => 'Baustelle in der Innenstadt – welche Baumaschine für beengte Verhältnisse?',
        'date' => '2026-03-05',
        'image' => '/images/ratgeber/blog_thumbnail_innenstadt_baumaschine_beengt.svg',
        'facts' => [
            'Minibagger unter 1 m Breite passen durch Standard-Gartentore',
            'Elektro-Minibagger arbeiten emissionsfrei und leiser als Dieselmodelle',
            'Gummiketten schonen Pflaster, Asphalt und Gehwege',
            'Lärmschutzverordnung NRW: Bauarbeiten Mo–Sa 7–20 Uhr',
        ],
    ],
    'geschirr-mieten-hochzeit-mengen-checkliste' => [
        'title' => 'Geschirr mieten für die Hochzeit – Mengen-Checkliste für 50, 100 und 150 Gäste',
        'date' => '2025-12-10',
        'image' => '/images/ratgeber/blog_thumbnail_geschirr_hochzeit_mengen.svg',
        'facts' => [
            'Faustformel: 1,3× die Gästezahl bei Gläsern (Reserve für Glasbruch)',
            'Pro Gast mindestens 3 Gläser einplanen (Wasser, Wein, Sekt)',
            'Glasbruch bis 5 % ist in der Regel im Mietpreis enthalten',
            'Geschirrspülmaschine ebenfalls mietbar',
        ],
    ],
];

$articleOgImage = null;
if (preg_match('#^/ratgeber/([a-z0-9-]+)$#', $path, $bm) && isset($blogArticles[$bm[1]])) {
    $articleOgImage = $SITE_ORIGIN . str_replace('/images/ratgeber/', '/images/ratgeber/og/', str_replace('.svg', '.png', $blogArticles[$bm[1]]['image']));
    $ba = $blogArticles[$bm[1]];
    $slug = $bm[1];
    $articleJsonLd = json_encode([
        '@context' => 'https://schema.org',
        '@type' => 'Article',
        'headline' => $ba['title'],
        'datePublished' => $ba['date'],
        'dateModified' => $ba['date'],
        'author' => ['@type' => 'Organization', 'name' => 'SLT Rental', 'url' => $SITE_ORIGIN],
        'publisher' => ['@type' => 'Organization', 'name' => 'SLT Rental', 'logo' => ['@type' => 'ImageObject', 'url' => $OG_IMAGE]],
        'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $SITE_ORIGIN . '/ratgeber/' . $slug],
        'image' => $articleOgImage,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $factsHtml = '';
    foreach ($ba['facts'] as $f) {
        $factsHtml .= '<li>' . htmlspecialchars($f, ENT_QUOTES, 'UTF-8') . '</li>';
    }

    $blogBody = <<<HTML
  <script type="application/ld+json">{$articleJsonLd}</script>
  <article>
    <h1>{$ba['title']}</h1>
    <p>Von SLT Rental, aktualisiert am {$ba['date']}</p>
    <section><h2>Auf einen Blick</h2><ul>{$factsHtml}</ul></section>
  </article>
HTML;
}

// Output HTML with correct meta tags
header('Content-Type: text/html; charset=utf-8');
?><!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title><?= $title ?></title>
  <meta name="description" content="<?= $description ?>">
  <link rel="canonical" href="<?= $canonicalUrl ?>">

  <!-- Open Graph -->
  <meta property="og:title" content="<?= $title ?>">
  <meta property="og:description" content="<?= $description ?>">
  <meta property="og:type" content="<?= $blogBody ? 'article' : 'website' ?>">
  <meta property="og:image" content="<?= $articleOgImage ?? $OG_IMAGE ?>">
<?php if ($articleOgImage): ?>
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
<?php endif; ?>
  <meta property="og:url" content="<?= $canonicalUrl ?>">
  <meta property="og:site_name" content="<?= $SITE_NAME ?>">
  <meta property="og:locale" content="de_DE">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?= $title ?>">
  <meta name="twitter:description" content="<?= $description ?>">
  <meta name="twitter:image" content="<?= $articleOgImage ?? $OG_IMAGE ?>">
</head>
<body>
<?php if ($homepageBody): ?>
<?= $homepageBody ?>
<?php elseif ($verkaufBody): ?>
<?= $verkaufBody ?>
<?php elseif ($blogBody): ?>
<?= $blogBody ?>
<?php elseif ($productBodyContent): ?>
<?= $productBodyContent ?>
<?php else: ?>
  <h1><?= $title ?></h1>
  <p><?= $description ?></p>
  <p><a href="<?= $canonicalUrl ?>"><?= $canonicalUrl ?></a></p>
<?php endif; ?>
</body>
</html>
