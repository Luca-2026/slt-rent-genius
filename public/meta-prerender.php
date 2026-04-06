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
        'title' => 'Tiefpreisgarantie – Günstigster Preis garantiert | SLT Rental',
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
    $h1 = $seo['h1'] ?? ($productName . ' mieten in ' . $locName . ' – Jetzt verfügbar bei SLT Rental');

    // Build meta description dynamically from product data
    $descSnippet = '';
    $rawDesc = $detail['description'] ?? '';
    if ($rawDesc) {
        $descSnippet = mb_substr($rawDesc, 0, 80);
        if (mb_strlen($rawDesc) > 80) {
            $descSnippet = preg_replace('/\s+\S*$/', '', $descSnippet);
        }
        $metaDesc = $productName . ' mieten in ' . $locName . ' – ' . $descSnippet . '. Tiefpreisgarantie – online buchbar.';
    } else {
        $metaDesc = $productName . ' mieten in ' . $locName . ' bei SLT Rental. Online buchbar, Abholung oder Lieferung. Tiefpreisgarantie.';
    }
    if (mb_strlen($metaDesc) > 155) {
        $metaDesc = mb_substr($metaDesc, 0, 152) . '...';
    }

    $meta = [
        'title' => $productName . ' mieten in ' . $locName . ' | SLT Rental',
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

    // Description
    $desc = $detail['description'] ?? '';
    if ($desc) {
        $productBodyContent .= '<p>' . htmlspecialchars($desc) . '</p>';
    }

    // Availability
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
<?php if ($homepageBody): ?>
<?= $homepageBody ?>
<?php elseif ($productBodyContent): ?>
<?= $productBodyContent ?>
<?php else: ?>
  <h1><?= $title ?></h1>
  <p><?= $description ?></p>
  <p><a href="<?= $canonicalUrl ?>"><?= $canonicalUrl ?></a></p>
<?php endif; ?>
</body>
</html>
