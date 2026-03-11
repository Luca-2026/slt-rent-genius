import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_URL = 'https://www.slt-rental.de';
const TODAY = new Date().toISOString().split('T')[0];

// Static pages with their priorities and change frequencies
const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/mieten', priority: '0.9', changefreq: 'weekly' },
  { path: '/standorte', priority: '0.8', changefreq: 'monthly' },
  { path: '/kontakt', priority: '0.7', changefreq: 'monthly' },
  { path: '/so-funktionierts', priority: '0.7', changefreq: 'monthly' },
  { path: '/lieferung', priority: '0.6', changefreq: 'monthly' },
  { path: '/faq', priority: '0.6', changefreq: 'monthly' },
  { path: '/karriere', priority: '0.5', changefreq: 'monthly' },
  { path: '/ueber-uns', priority: '0.5', changefreq: 'monthly' },
  { path: '/hilfe', priority: '0.6', changefreq: 'monthly' },
  // Solutions
  { path: '/loesungen', priority: '0.7', changefreq: 'monthly' },
  { path: '/loesungen/tiefbau-erdbewegung', priority: '0.6', changefreq: 'monthly' },
  { path: '/loesungen/hochbau-renovierung', priority: '0.6', changefreq: 'monthly' },
  { path: '/loesungen/galabau', priority: '0.6', changefreq: 'monthly' },
  { path: '/loesungen/events', priority: '0.6', changefreq: 'monthly' },
  { path: '/loesungen/handwerk', priority: '0.6', changefreq: 'monthly' },
  { path: '/loesungen/transport', priority: '0.6', changefreq: 'monthly' },
  { path: '/loesungen/kinder', priority: '0.6', changefreq: 'monthly' },
  // Legal
  { path: '/impressum', priority: '0.3', changefreq: 'yearly' },
  { path: '/datenschutz', priority: '0.3', changefreq: 'yearly' },
  { path: '/agb', priority: '0.3', changefreq: 'yearly' },
];

// Location pages
const locationPages = [
  { path: '/mieten/krefeld', priority: '0.9', changefreq: 'weekly' },
  { path: '/mieten/bonn', priority: '0.9', changefreq: 'weekly' },
  { path: '/mieten/muelheim', priority: '0.9', changefreq: 'weekly' },
];

// Local SEO area pages
const localAreaPages = [
  // Krefeld region
  'krefeld', 'meerbusch', 'willich', 'toenisvorst', 'kempen', 'moers',
  'duisburg-west', 'neuss', 'viersen', 'kaarst',
  // Bonn region
  'bonn', 'bad-godesberg', 'koenigswinter', 'bad-honnef', 'sankt-augustin',
  'siegburg', 'troisdorf', 'alfter', 'bornheim', 'meckenheim', 'rheinbach',
  // Mülheim region
  'muelheim-an-der-ruhr', 'essen', 'oberhausen', 'duisburg-sued', 'bottrop',
  'gelsenkirchen', 'ratingen', 'bochum-west', 'dinslaken',
];

// Categories per location
const locationCategories: Record<string, string[]> = {
  krefeld: [
    'anhaenger', 'erdbewegung', 'werkzeuge', 'gartenpflege', 'aggregate',
    'arbeitsbuehnen', 'verdichtung', 'kabel-stromverteiler', 'leitern-gerueste',
    'heizung-trocknung', 'absperrtechnik', 'beschallung', 'kommunikation',
    'beleuchtung', 'buehne', 'traversen-rigging', 'moebel-zelte',
    'geschirr-glaeser-besteck', 'spezialeffekte', 'huepfburgen',
  ],
  bonn: [
    'anhaenger', 'erdbewegung', 'werkzeuge', 'gartenpflege', 'aggregate',
    'arbeitsbuehnen', 'verdichtung', 'kabel-stromverteiler', 'leitern-gerueste',
    'heizung-trocknung', 'absperrtechnik', 'beschallung', 'kommunikation',
    'beleuchtung', 'buehne', 'traversen-rigging', 'moebel-zelte',
    'geschirr-glaeser-besteck', 'spezialeffekte', 'huepfburgen',
  ],
  muelheim: [
    'anhaenger', 'erdbewegung', 'werkzeuge', 'gartenpflege', 'aggregate',
    'arbeitsbuehnen', 'verdichtung', 'kabel-stromverteiler', 'leitern-gerueste',
    'heizung-trocknung', 'absperrtechnik', 'beschallung', 'kommunikation',
    'beleuchtung', 'buehne', 'traversen-rigging', 'moebel-zelte',
    'geschirr-glaeser-besteck', 'spezialeffekte', 'huepfburgen',
  ],
};

function urlEntry(path: string, priority: string, changefreq: string, lastmod: string): string {
  return `  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all active products from DB with their categories
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('slug, category_id, available_locations, updated_at')
      .eq('is_active', true);

    const { data: categories, error: catErr } = await supabase
      .from('product_categories')
      .select('id, slug');

    if (prodErr) console.error('Products fetch error:', prodErr);
    if (catErr) console.error('Categories fetch error:', catErr);

    // Build category lookup
    const categoryMap = new Map<string, string>();
    (categories || []).forEach((c: { id: string; slug: string }) => {
      categoryMap.set(c.id, c.slug);
    });

    // Map location IDs used in available_locations to URL slugs
    const locationSlugMap: Record<string, string> = {
      krefeld: 'krefeld',
      bonn: 'bonn',
      muelheim: 'muelheim',
      mülheim: 'muelheim',
    };

    const urls: string[] = [];

    // 1. Static pages
    for (const page of staticPages) {
      urls.push(urlEntry(page.path, page.priority, page.changefreq, TODAY));
    }

    // 2. Location pages
    for (const page of locationPages) {
      urls.push(urlEntry(page.path, page.priority, page.changefreq, TODAY));
    }

    // 3. Category pages per location
    for (const [locId, cats] of Object.entries(locationCategories)) {
      for (const cat of cats) {
        urls.push(urlEntry(`/mieten/${locId}/${cat}`, '0.8', 'weekly', TODAY));
      }
    }

    // 4. Individual product pages from DB
    const dbProductUrls = new Set<string>();
    if (products) {
      for (const product of products) {
        const catSlug = product.category_id ? categoryMap.get(product.category_id) : null;
        if (!catSlug) continue;

        const locations = product.available_locations || [];
        for (const loc of locations) {
          const locSlug = locationSlugMap[loc.toLowerCase()] || loc.toLowerCase();
          const path = `/mieten/${locSlug}/${catSlug}/${product.slug}`;
          if (!dbProductUrls.has(path)) {
            dbProductUrls.add(path);
            const lastmod = product.updated_at ? product.updated_at.split('T')[0] : TODAY;
            urls.push(urlEntry(path, '0.7', 'weekly', lastmod));
          }
        }
      }
    }

    // 5. Local SEO area pages
    for (const area of localAreaPages) {
      urls.push(urlEntry(`/mieten-in/${area}`, '0.7', 'monthly', TODAY));
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response('Error generating sitemap', {
      status: 500,
      headers: corsHeaders,
    });
  }
});
