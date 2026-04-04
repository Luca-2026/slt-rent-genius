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

$BASE_URL = 'https://www.slt-rental.de';
$OG_IMAGE = $BASE_URL . '/og-image.jpg';
$SITE_NAME = 'SLT Rental';

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
        'title' => 'Baumaschinen, Anhänger & Eventausstattung mieten in NRW | SLT Rental',
        'description' => 'Über 1.700 Mietartikel ✓ Baumaschinen, Anhänger, Arbeitsbühnen & Event-Equipment ✓ 3 Standorte in NRW ✓ Tiefpreisgarantie ✓ Wochenend-Tarife',
    ],
    '/mieten' => [
        'title' => 'Equipment mieten in NRW – Standort wählen | SLT Rental',
        'description' => 'Baumaschinen, Anhänger & Event-Equipment mieten ✓ 3 Standorte: Krefeld, Bonn, Mülheim ✓ Über 1.700 Mietartikel ✓ Tiefpreisgarantie ✓ Wochenend-Tarife ✓ Lieferung auf die Baustelle',
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
        'description' => '3 SLT Rental Standorte in NRW: Krefeld, Bonn und Mülheim an der Ruhr. Öffnungszeiten, Anfahrt und Kontakt. Equipment direkt vor Ort abholen.',
    ],
    '/kontakt' => [
        'title' => 'Kontakt – SLT Rental',
        'description' => 'Kontaktieren Sie SLT Rental: Telefon, E-Mail oder WhatsApp. 3 Standorte in Krefeld, Bonn und Mülheim. Persönliche Beratung für Ihre Mietanfrage.',
    ],
    '/so-funktionierts' => [
        'title' => "So funktioniert's – Equipment mieten | SLT Rental",
        'description' => "In 5 einfachen Schritten Baumaschinen, Anhänger und Event-Equipment mieten. Standort wählen, Artikel suchen, buchen und abholen – so einfach geht's bei SLT Rental.",
    ],
    '/lieferung' => [
        'title' => 'Lieferung & Abholung – Preise & Infos | SLT Rental',
        'description' => 'Lieferung und Abholung von Baumaschinen und Equipment in NRW. Transparente Preise nach Entfernung. Lieferrechner für Ihren Standort.',
    ],
    '/faq' => [
        'title' => 'FAQ – Häufige Fragen | SLT Rental',
        'description' => 'Antworten auf häufige Fragen zu Mietbedingungen, Buchung, Lieferung und Abholung bei SLT Rental. Alles Wichtige rund um Ihre Miete.',
    ],
    '/karriere' => [
        'title' => 'Karriere bei SLT Rental – Jobs in NRW',
        'description' => 'Arbeiten bei SLT Rental: Offene Stellen in Krefeld, Bonn und Mülheim. Flexible Arbeitszeiten, faire Bezahlung und ein starkes Team. Jetzt bewerben!',
    ],
    '/ueber-uns' => [
        'title' => 'Über uns – SLT Rental',
        'description' => 'Seit 2016 Ihr Partner für Baumaschinen- und Equipment-Vermietung in NRW. 3 Standorte, +3.500 Kunden, +1.700 Produkte. Lernen Sie unser Team kennen.',
    ],
    '/hilfe' => [
        'title' => 'Hilfe & Wissensbasis – Anleitungen & Tipps | SLT Rental',
        'description' => 'Anleitungen, Sicherheitshinweise und Tipps für Ihre Miete bei SLT Rental. Alles zu Anhängern, Baumaschinen, Event-Equipment und mehr.',
    ],
    '/tiefpreisgarantie' => [
        'title' => 'Tiefpreisgarantie – 10 % Rabatt bei günstigerem Angebot | SLT Rental',
        'description' => 'Günstigeren Preis gefunden? SLT Rental garantiert 10 % Rabatt auf den Nettomietpreis ✓ Identisches Produkt im Umkreis 10 km ✓ Für Gewerbekunden ✓ Einfach per E-Mail einreichen',
    ],
    '/loesungen' => [
        'title' => 'Lösungen – Equipment für jede Branche | SLT Rental',
        'description' => 'Maßgeschneiderte Mietlösungen für Tiefbau, Hochbau, GaLaBau, Events, Handwerk, Transport und mehr. Equipment für Profis und Privat.',
    ],
    '/loesungen/tiefbau-erdbewegung' => [
        'title' => 'Tiefbau & Erdbewegung – Mietlösungen | SLT Rental',
        'description' => 'Minibagger, Radlader, Dumper & Verdichtungsgeräte für Tiefbau und Erdbewegung mieten. Komplettlösungen für Ihr Bauprojekt.',
    ],
    '/loesungen/hochbau-renovierung' => [
        'title' => 'Hochbau & Renovierung – Mietlösungen | SLT Rental',
        'description' => 'Werkzeuge, Gerüste, Arbeitsbühnen & Bautrockner für Hochbau und Renovierung mieten. Alles aus einer Hand.',
    ],
    '/loesungen/galabau' => [
        'title' => 'Garten- & Landschaftsbau – Mietlösungen | SLT Rental',
        'description' => 'Minibagger, Häcksler, Erdbohrer & Gartengeräte für GaLaBau mieten. Professionelle Ausstattung für Ihre Projekte.',
    ],
    '/loesungen/events' => [
        'title' => 'Events & Veranstaltungen – Mietlösungen | SLT Rental',
        'description' => 'Bühne, Beschallung, Beleuchtung, Möbel & Zelte für Events mieten. Komplette Veranstaltungstechnik aus einer Hand.',
    ],
    '/loesungen/handwerk' => [
        'title' => 'Handwerk & Gewerbe – Mietlösungen | SLT Rental',
        'description' => 'Profi-Werkzeuge, Aggregate & Spezialgeräte für Handwerk und Gewerbe mieten. Flexibel und günstig.',
    ],
    '/loesungen/transport' => [
        'title' => 'Umzug & Transport – Mietlösungen | SLT Rental',
        'description' => 'Anhänger, Transporter & Umzugshelfer für Ihren Umzug oder Transport mieten. Verschiedene Größen verfügbar.',
    ],
    '/loesungen/kinder' => [
        'title' => 'Kindergeburtstage – Hüpfburgen & Spaß | SLT Rental',
        'description' => 'Hüpfburgen und Spaßgeräte für Kindergeburtstage mieten. Lieferung, Aufbau und Abbau inklusive.',
    ],
    '/produkte' => [
        'title' => 'Equipment mieten in NRW – Standort wählen | SLT Rental',
        'description' => 'Baumaschinen, Anhänger & Event-Equipment mieten ✓ 3 Standorte: Krefeld, Bonn, Mülheim ✓ Über 1.700 Mietartikel',
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
    if (isset($categoryTitles[$catSlug])) {
        $catTitle = sprintf($categoryTitles[$catSlug], $locName);
        $meta = [
            'title' => $catTitle . ' | SLT Rental',
            'description' => $catTitle . ' ✓ Tiefpreisgarantie ✓ Faire Tagespreise ✓ Lieferung möglich ✓ Persönliche Beratung',
        ];
    }
}

// 3. Product detail page: /mieten/{location}/{category}/{product}
if (!$meta && preg_match('#^/mieten/(krefeld|bonn|muelheim)/([a-z0-9-]+)/([a-z0-9-]+)$#', $path, $m)) {
    $locName = $locationNames[$m[1]] ?? ucfirst($m[1]);
    $productSlug = $m[3];
    $productName = ucwords(str_replace('-', ' ', $productSlug));
    $meta = [
        'title' => $productName . ' mieten in ' . $locName . ' | SLT Rental',
        'description' => $productName . ' mieten in ' . $locName . ' ✓ Faire Tagespreise ✓ Sofort verfügbar ✓ Lieferung möglich ✓ Tiefpreisgarantie',
    ];
}

// 4. Local area page: /mieten-in/{area}
if (!$meta && preg_match('#^/mieten-in/([a-z0-9-]+)$#', $path, $m)) {
    $areaSlug = $m[1];
    $areaName = $localAreas[$areaSlug] ?? ucwords(str_replace('-', ' ', $areaSlug));
    $meta = [
        'title' => 'Baumaschinen & Equipment mieten in ' . $areaName . ' | SLT Rental',
        'description' => 'Baumaschinen, Anhänger & Event-Equipment mieten in ' . $areaName . ' ✓ Lieferung ✓ Tiefpreisgarantie ✓ Faire Preise ✓ Persönliche Beratung',
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
$canonicalUrl = $BASE_URL . $path;

// Output minimal HTML with correct meta tags
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
  <meta property="og:type" content="website">
  <meta property="og:image" content="<?= $OG_IMAGE ?>">
  <meta property="og:url" content="<?= $canonicalUrl ?>">
  <meta property="og:site_name" content="<?= $SITE_NAME ?>">
  <meta property="og:locale" content="de_DE">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?= $title ?>">
  <meta name="twitter:description" content="<?= $description ?>">
  <meta name="twitter:image" content="<?= $OG_IMAGE ?>">
</head>
<body>
  <h1><?= $title ?></h1>
  <p><?= $description ?></p>
  <p><a href="<?= $canonicalUrl ?>"><?= $canonicalUrl ?></a></p>
</body>
</html>
