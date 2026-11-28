# src/data rules
- Location text localization only via localizeProductText (React, seo-routes, prerender); blanket city replacement produced mixed addresses.
- Home and /mieten/:loc SEO texts live in src/data/hubSeo.ts so prerender matches React.
- Renamed slugs: RENAMED_PRODUCT_SLUGS → client Navigate + noindex canonical refresh pages (emit-legacy-redirect-pages); hosting ignores .htaccess, no real 301/404.
