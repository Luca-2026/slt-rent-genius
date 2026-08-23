BEGIN;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'planen-s-750', '750 kg Planenanhänger S', NULL, 'Ladefläche: 200 x 108 x 100 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/planen-s-750.jpg']::text[], '{"Eigengewicht":"ca. 180 kg","Nutzlast":"ca. 570 kg"}'::jsonb, ARRAY[]::text[], ARRAY['geschlossen','ungebremst','einachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      750, NULL, '{"krefeld":"LNQBH7"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], 1, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'planen-m-750', '750 kg Planenanhänger M', NULL, 'Ladefläche: 200 x 108 x 130 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/planen-m-750.jpg']::text[], '{"Eigengewicht":"ca. 200 kg","Nutzlast":"ca. 550 kg"}'::jsonb, ARRAY[]::text[], ARRAY['geschlossen','ungebremst','einachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      750, NULL, '{"krefeld":"7RLWP2","bonn":"Y9OVFR"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], 2, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'planen-l-750', '750 kg Planenanhänger L', NULL, 'Ladefläche: 200 x 108 x 160 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/planen-l-750.jpg']::text[], '{"Eigengewicht":"ca. 220 kg","Nutzlast":"ca. 530 kg"}'::jsonb, ARRAY[]::text[], ARRAY['geschlossen','ungebremst','einachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      750, NULL, '{"krefeld":"YNWU3V","bonn":"E4QDT5"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], 3, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'planen-xl-750', '750 kg Planenanhänger XL', NULL, 'Ladefläche: 264 x 124 x 160 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/planen-xl-750.jpg']::text[], '{"Eigengewicht":"ca. 250 kg","Nutzlast":"ca. 500 kg"}'::jsonb, ARRAY[]::text[], ARRAY['geschlossen','ungebremst','einachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      750, NULL, '{"krefeld":"7HD28M","bonn":"3G3FM1"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], 4, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'planen-xxl-750', '750 kg Planenanhänger XXL', NULL, 'Ladefläche: 300 x 150 x 180 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/planen-xxl-750.jpg']::text[], '{"Eigengewicht":"ca. 280 kg","Nutzlast":"ca. 470 kg"}'::jsonb, ARRAY[]::text[], ARRAY['geschlossen','ungebremst','einachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      750, NULL, '{"krefeld":"86X7LN","bonn":"ENWG89"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], 5, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'planen-1300', '1300 kg Planenanhänger', NULL, 'Ladefläche: 300 x 150 x 190 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/planen-1300.jpg']::text[], '{"Eigengewicht":"ca. 450 kg","Nutzlast":"ca. 850 kg"}'::jsonb, ARRAY[]::text[], ARRAY['geschlossen','gebremst','einachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      1300, NULL, '{"krefeld":"EZQM77","bonn":"QDSW59"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], 6, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'planen-3500', '3500 kg Planenanhänger', NULL, 'Ladefläche: 400 x 200 x 210 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/planen-3500-1.jpg','/product-images/anhaenger/planen-3500-2.jpg','/product-images/anhaenger/planen-3500-3.jpg','/product-images/anhaenger/planen-3500-4.jpg']::text[], '{"Eigengewicht":"ca. 674 kg","Nutzlast":"ca. 2.826 kg"}'::jsonb, ARRAY[]::text[], ARRAY['geschlossen','gebremst','zweiachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      3500, NULL, '{"krefeld":"5L3GWF"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], 7, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'planen-xxl-3500', '3500 kg Planenanhänger XXL', NULL, 'Ladefläche: 600 x 250 x 250 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/planen-xxl-3500-1.jpg','/product-images/anhaenger/planen-3500-4.jpg']::text[], '{"Eigengewicht":"ca. 750 kg","Nutzlast":"ca. 2.750 kg"}'::jsonb, ARRAY[]::text[], ARRAY['geschlossen','gebremst','zweiachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      3500, NULL, '{"krefeld":"SHR5LA"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], 8, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'koffer-750', '750 kg Kofferanhänger', NULL, 'Ladefläche: 223 x 147 x 147 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/koffer-750-1.jpg','/product-images/anhaenger/koffer-750-2.jpg','/product-images/anhaenger/koffer-750-3.jpg','/product-images/anhaenger/koffer-750-4.jpg']::text[], '{"Eigengewicht":"ca. 378 kg","Nutzlast":"ca. 372 kg"}'::jsonb, ARRAY[]::text[], ARRAY['geschlossen','ungebremst','einachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      750, NULL, '{"krefeld":"14KMC5","bonn":"ZLNHYD"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'koffer-1500', '1500 kg Kofferanhänger', NULL, 'Ladefläche: 300 x 150 x 180 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/koffer-1500-1.jpg','/product-images/anhaenger/koffer-1500-2.jpg','/product-images/anhaenger/koffer-1500-3.jpg','/product-images/anhaenger/koffer-1500-4.jpg','/product-images/anhaenger/koffer-1500-5.jpg']::text[], '{"Eigengewicht":"ca. 500 kg","Nutzlast":"ca. 1.000 kg"}'::jsonb, ARRAY[]::text[], ARRAY['geschlossen','gebremst','einachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      1500, NULL, '{"krefeld":"WWSMO3"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'koffer-2000', '2000 kg Kofferanhänger', NULL, 'Ladefläche: 300 x 155 x 185 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/koffer-2000-1.jpg','/product-images/anhaenger/koffer-2000-2.jpg','/product-images/anhaenger/koffer-2000-3.jpg','/product-images/anhaenger/koffer-2000-4.jpg','/product-images/anhaenger/koffer-2000-5.jpg']::text[], '{"Eigengewicht":"ca. 600 kg","Nutzlast":"ca. 1.400 kg"}'::jsonb, ARRAY[]::text[], ARRAY['geschlossen','gebremst','zweiachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      2000, NULL, '{"krefeld":"WOH21S"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kasten-750', '750 kg Kastenanhänger', NULL, 'Ladefläche: 200 x 108 x 30 cm', NULL, 'anhaenger',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/anhaenger/kasten-750.jpg']::text[], '{"Eigengewicht":"ca. 120 kg","Nutzlast":"ca. 630 kg"}'::jsonb, ARRAY[]::text[], ARRAY['ungebremst','einachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      750, NULL, '{"krefeld":"3EA6HE"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kasten-laubgitter-750', '750 kg Kastenanhänger & Laubgitter', NULL, 'Ladefläche: 264 x 126 x 100 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/kasten-laubgitter-750.jpg']::text[], '{"Eigengewicht":"ca. 250 kg","Nutzlast":"ca. 500 kg"}'::jsonb, ARRAY[]::text[], ARRAY['laubgitter','ungebremst','einachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      750, NULL, '{"krefeld":"RTNVGC","bonn":"9RBYTF"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kasten-laubgitter-1300', '1300 kg Kastenanhänger & Laubgitter', NULL, 'Ladefläche: 255 x 151 x 100 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/kasten-laubgitter-1300.jpg']::text[], '{"Eigengewicht":"ca. 400 kg","Nutzlast":"ca. 900 kg"}'::jsonb, ARRAY[]::text[], ARRAY['laubgitter','gebremst','einachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      1300, NULL, '{"krefeld":"2B9AK5","bonn":"I6QV84"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'urlaub-750', '750 kg Urlaubanhänger', NULL, 'Ladefläche: 150 x 106 x 70 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/urlaub-750.jpg']::text[], '{"Eigengewicht":"ca. 150 kg","Nutzlast":"ca. 600 kg"}'::jsonb, ARRAY[]::text[], ARRAY['urlaub','ungebremst','einachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      750, NULL, '{"krefeld":"EM45ZK"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'motorrad-3fach-750', '750 kg Motorradanhänger 3-fach', NULL, 'Ladefläche: 220 x 131 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/motorrad-3fach-750-1.jpg','/product-images/anhaenger/motorrad-3fach-750-2.jpg','/product-images/anhaenger/motorrad-3fach-750-3.jpg']::text[], '{"Eigengewicht":"ca. 148 kg","Nutzlast":"ca. 602 kg"}'::jsonb, ARRAY[]::text[], ARRAY['motorrad','ungebremst','einachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      750, NULL, '{"krefeld":"9JL36T","bonn":"BJOMV6","muelheim":"NTIF8C"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'motorrad-1500', '1500 kg Motorradanhänger', NULL, 'Ladefläche: 301 x 165 x 17 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/autotransport-1500-1.jpg','/product-images/anhaenger/autotransport-1500-2.jpg','/product-images/anhaenger/autotransport-1500-3.jpg']::text[], '{"Eigengewicht":"ca. 360 kg","Nutzlast":"ca. 1.140 kg"}'::jsonb, ARRAY[]::text[], ARRAY['motorrad','gebremst','einachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      1500, NULL, '{"krefeld":"JT132X"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'autotransport-1500', '1500 kg Autotransportanhänger', NULL, 'Ladefläche: 301 x 165 x 17 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/autotransport-1500-1.jpg','/product-images/anhaenger/autotransport-1500-2.jpg','/product-images/anhaenger/autotransport-1500-3.jpg']::text[], '{"Eigengewicht":"ca. 360 kg","Nutzlast":"ca. 1.140 kg"}'::jsonb, ARRAY[]::text[], ARRAY['autotransport','gebremst','einachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      1500, NULL, '{"krefeld":"95OAGP"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'autotransport-2700', '2700 kg Autotransportanhänger', NULL, 'Ladefläche: 452 x 205 cm | Inklusive Seilwinde zum Aufziehen von Fahrzeugen', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/autotransport-2700-1.jpg','/product-images/anhaenger/autotransport-2700-2.jpg']::text[], '{"Eigengewicht":"ca. 653 kg","Nutzlast":"ca. 2.047 kg","Ausstattung":"Seilwinde"}'::jsonb, ARRAY[]::text[], ARRAY['autotransport','gebremst','zweiachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      2700, NULL, '{"krefeld":"OXUI12","bonn":"EVZK31"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'autotransportkipp-2700', '2700 kg Autotransportkippanhänger', NULL, 'Ladefläche: 469 x 210 cm | Inklusive Seilwinde zum Aufziehen von Fahrzeugen', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/autotransportkipp-2700-1.jpg','/product-images/anhaenger/autotransportkipp-2700-2.jpg']::text[], '{"Eigengewicht":"ca. 700 kg","Nutzlast":"ca. 2.000 kg","Ausstattung":"Seilwinde, Kippfunktion"}'::jsonb, ARRAY[]::text[], ARRAY['autotransport','gebremst','zweiachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      2700, NULL, '{"bonn":"4POSMU"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'baumaschinen-1800', '1800 kg Baumaschinenanhänger', NULL, 'Ladefläche: 260 x 150 x 25 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/baumaschinen-1800-1.jpg','/product-images/anhaenger/baumaschinen-1800-2.jpg']::text[], '{"Eigengewicht":"ca. 645 kg","Nutzlast":"ca. 1.155 kg"}'::jsonb, ARRAY[]::text[], ARRAY['baumaschine','gebremst','zweiachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      1800, NULL, '{"krefeld":"EDE97K","bonn":"3F11ZC"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'baumaschinen-3500', '3500 kg Baumaschinenanhänger', NULL, 'Temared Baumaschinenanhänger mit 350 x 168 x 25 cm Ladefläche und durchgehender Auffahrrampe. 3.500 kg Gesamtgewicht, 2.785 kg Nutzlast, 13-Pol-Anschluss (Adapter erhältlich). Führerschein Klasse 3 oder BE erforderlich. 100 km/h-Zulassung möglich, wenn das Zugfahrzeug ein eingetragenes Leergewicht von 3.182 kg hat.', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/baumaschinen-3500-1.jpg','/product-images/anhaenger/baumaschinen-3500-2.jpg','/product-images/anhaenger/baumaschinen-3500-3.jpg']::text[], '{"Hersteller":"Temared","Ladefläche (LxBxH)":"350 x 168 x 25 cm","Gesamtgewicht":"3.500 kg","Nutzlast":"2.785 kg","Anschluss":"13-Pol (Adapter erhältlich)","Ausstattung":"Durchgehende Auffahrrampe","Führerschein":"Klasse 3 oder BE","100 km/h-Zulassung":"Zugfahrzeug-Leergewicht min. 3.182 kg"}'::jsonb, ARRAY[]::text[], ARRAY['baumaschine','gebremst','dreiachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      3500, NULL, '{"krefeld":"7WW3IY","bonn":"WFQBAR","muelheim":"GWO6D9"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'plattform-3500-absenkbar', '3500 kg Plattformkippanhänger', 'Temared Universal (Tridem, kippbar)', 'Kippbarer 3-Achs-Plattformanhänger mit Seilwinde und Auffahrrampen – Ladefläche 590 x 214 cm.', 'Der kippbare Plattformanhänger von Temared kombiniert eine ebene Ladefläche von 590 x 214 cm mit einer kippbaren Plattform und integrierten Auffahrrampen. Dadurch eignet er sich gleichermaßen für den Fahrzeugtransport (PKW, Oldtimer, leichte Nutzfahrzeuge) und für den Transport von Baumaschinen wie Minibaggern, Radladern oder Stampfern. Die elektrische Seilwinde erleichtert das Beladen nicht fahrbereiter Fahrzeuge oder Maschinen.

Der Tridem-Achser bietet 2.672 kg Nutzlast bei 3.500 kg zulässigem Gesamtgewicht. Mit 13-poligem Stecker serienmäßig (Adapter auf 7-polig erhältlich). 100 km/h-Zulassung möglich, sofern dein Zugfahrzeug ein eingetragenes Leergewicht von mindestens 3.182 kg aufweist. Für Fahrten ins Ausland ist die Haftpflicht-Erweiterung notwendig – diese kann bei der Reservierung direkt mitgebucht werden.', 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/plattform-3500-absenkbar-1.webp','/product-images/anhaenger/plattform-3500-absenkbar-2.webp','/product-images/anhaenger/plattform-3500-absenkbar-3.jpg','/product-images/anhaenger/plattform-3500-absenkbar-4.jpg','/product-images/anhaenger/plattform-3500-absenkbar-5.jpg']::text[], '{"Hersteller":"Temared","Modellreihe":"Universal (kippbar)","Ladeflächenmaß (L x B)":"590 x 214 cm","Zul. Gesamtgewicht":"3.500 kg","Eigengewicht":"ca. 828 kg","Nutzlast":"ca. 2.672 kg","Achsen":"3 (Tridem)","Plattform":"kippbar","Anschluss":"13-polig (Adapter auf 7-polig erhältlich)","Ausstattung":"Seilwinde, Auffahrrampen","100 km/h Zulassung":"Zugfahrzeug muss mind. 3.182 kg Leergewicht eingetragen haben"}'::jsonb, ARRAY[]::text[], ARRAY['autotransport','baumaschine','laubgitter','gebremst','dreiachser','kippbar']::text[], ARRAY['13-Pol Stecker – Adapter auf 7-Pol auf Anfrage erhältlich','100 km/h nur mit Zugfahrzeug ≥ 3.182 kg Leergewicht','Auslandsfahrt nur mit Auslandsfahrt-Haftpflichterweiterung (bei Reservierung auswählbar)']::text[],
      'ab 49 €', NULL, NULL, NULL,
      3500, NULL, '{"krefeld":"6AZY6J"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], 2, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'plattform-3500', '3500 kg Plattformanhänger', NULL, 'Ladefläche: 512 x 211 cm | Inklusive Seilwinde zum Aufziehen von Fahrzeugen', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/plattform-3500-1.jpg','/product-images/anhaenger/plattform-3500-2.jpg','/product-images/anhaenger/plattform-3500-3.jpg','/product-images/anhaenger/plattform-3500-4.jpg','/product-images/anhaenger/plattform-3500-5.jpg','/product-images/anhaenger/plattform-3500-6.jpg']::text[], '{"Eigengewicht":"ca. 900 kg","Nutzlast":"ca. 2.600 kg","Ausstattung":"Seilwinde"}'::jsonb, ARRAY[]::text[], ARRAY['autotransport','baumaschine','gebremst','zweiachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      3500, NULL, '{"krefeld":"BOLUXJ","muelheim":"HO4PII"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rueckwaertskipp-1500', '1300 kg Rückwärtskippanhänger & Laubgitter', NULL, 'Ladefläche: 250 x 150 x 100 cm | Händische Kippfunktion (Handpumpe)', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/rueckwaertskipp-1300-1.jpg','/product-images/anhaenger/rueckwaertskipp-1300-2.jpg']::text[], '{"Eigengewicht":"ca. 410 kg","Nutzlast":"ca. 890 kg"}'::jsonb, ARRAY[]::text[], ARRAY['laubgitter','gebremst','zweiachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      1300, NULL, '{"krefeld":"QNRXMH"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rueckwaertskipp-2700', '2700 kg Rückwärtskippanhänger', NULL, 'Ladefläche: 300 x 150 x 40 cm', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaenger/rueckwaertskipp-2700-1.jpg','/product-images/anhaenger/rueckwaertskipp-2700-2.jpg','/product-images/anhaenger/rueckwaertskipp-2700-3.jpg']::text[], '{"Eigengewicht":"ca. 739 kg","Nutzlast":"ca. 1.961 kg"}'::jsonb, ARRAY[]::text[], ARRAY['laubgitter','gebremst','zweiachser']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      2700, NULL, '{"krefeld":"Q9IXR8","bonn":"131K99"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'aggregatanhaenger-1300kg', '1300 kg Aggregatanhänger', NULL, 'Anhänger für Transport von Aggregaten', NULL, 'anhaenger',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{"Marke / Hersteller":"Temared","Ladeflächenmaß (LxBxH)":"ca. 260 x 120 cm","Gesamtgewicht":"1300 kg","Nutzlast":"ca. 1050 kg","Benötigter Führerschein":"Klasse 3, BE oder B wenn der PKW weniger als 2150 kg z.GG hat","Anschluss Typ":"13 Pol (Adapter erhältlich)","Voraussetzung 100 Km/h":"Zugfahrzeug muss ein Leergewicht von 1228 Kg eingetragen haben"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      1300, NULL, '{"krefeld":"IK69DF","bonn":"3S1FQQ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bobcat-e10z', '1t Minibagger', 'Bobcat E10Z', 'Einsatzgewicht: 1.000 kg | Grabtiefe: 1.820 mm | Breite: 710 mm', NULL, 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/bobcat-e10z-1.jpg','/product-images/erdbewegung/bobcat-e10z-2.jpg','/product-images/erdbewegung/bobcat-e10z-3.jpg','/product-images/erdbewegung/bobcat-e10z-4.jpg']::text[], '{"Betriebsgewicht":"1176 kg","Gesamtbreite":"1100 mm einfahrbar auf 710 mm","Gesamthöhe":"2209 mm (Bügel einklappbar)","Löffelklasse":"MS01","PS":"11","Kraftstoff":"Diesel (16 l)","Anbaugeräte & Schaufeln":"Tieflöffel 30cm inkl. weiteres können Sie im 2. Schritt auswählen"}'::jsonb, ARRAY[]::text[], ARRAY['minibagger','diesel','bis-1500','maschine']::text[], ARRAY['Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.','Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,85 €/l.']::text[],
      NULL, NULL, NULL, NULL,
      1000, NULL, '{"krefeld":"WNE69F","muelheim":"G63XIE","bonn":"FQZBM1"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'xcmg-xe20e', '2t Minibagger', 'XCMG XE20E', 'Einsatzgewicht: 2.000 kg | Grabtiefe: 2.385 mm | Breite: 980 mm', NULL, 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/xcmg-xe20e-1.jpg','/product-images/erdbewegung/xcmg-xe20e-2.jpg','/product-images/erdbewegung/xcmg-xe20e-3.jpg']::text[], '{"Betriebsgewicht":"2050kg","Gesamtbreite":"1300 mm einfahrbar auf 990 mm","Gesamthöhe":"2350 mm","Löffelklasse":"MS01","PS":"15,8","Kraftstoff":"Diesel (25 l)","Anbaugeräte & Schaufeln":"Tieflöffel 30cm inkl. weiteres können Sie im 2. Schritt auswählen"}'::jsonb, ARRAY[]::text[], ARRAY['minibagger','diesel','1500-2500','maschine']::text[], ARRAY['Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.','Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,85 €/l.']::text[],
      NULL, NULL, NULL, NULL,
      2000, NULL, '{"krefeld":"UZEDUY","bonn":"PV2RQZ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'xcmg-xe27e', '2,7t Minibagger', 'XCMG XE27E', 'Einsatzgewicht: 2.700 kg | Grabtiefe: 2.800 mm | Breite: 1.500 mm', NULL, 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/xcmg-xe27e-1.jpg','/product-images/erdbewegung/xcmg-xe27e-2.jpg','/product-images/erdbewegung/xcmg-xe27e-3.jpg']::text[], '{"Betriebsgewicht":"2780 kg","Gesamtbreite":"1500 mm","Gesamthöhe":"2580 mm","Löffelklasse":"MS03","PS":"21","Anbaugeräte":"Tieflöffel 300mm inklusive","Kraftstoff":"Diesel (33 l)"}'::jsonb, ARRAY[]::text[], ARRAY['minibagger','diesel','ab-2500','maschine']::text[], ARRAY['Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.','Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,85 €/l.']::text[],
      NULL, NULL, NULL, NULL,
      2700, NULL, '{"krefeld":"MBUX18","bonn":"QU4BYW"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bobcat-e35z', '3,6t Minibagger', 'Bobcat E35z', 'Einsatzgewicht: 3.500 kg | Grabtiefe: 3.120 mm | Motorleistung: 24,8 kW | Abgasnorm Stufe V', 'Der Bobcat E35z ist ein leistungsstarker Minibagger der 3,5-Tonnen-Klasse mit Nullheck-Design für beengte Einsatzorte. Mit einer Grabtiefe von bis zu 3,12 m und einer maximalen Reichweite von 5,26 m am Boden eignet er sich hervorragend für Aushub-, Kanal- und Landschaftsbauarbeiten. Der Stage V Motor mit 24,8 kW (33,4 PS) sorgt für kraftvollen und emissionsarmen Betrieb. Das Laufwerk ist serienmäßig mit Gummiketten ausgestattet, Stahlketten sind optional verfügbar.

Verfügbare Anbaugeräte (Auswahl): Hydraulikhammer für Abbrucharbeiten, Schlegelmäher für Landschaftsgärten, Räumlöffel für Aushubarbeiten, Tieflöffel für Aushubarbeiten, Laserausrüstung für exakte Nivellierung.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/bobcat-e35z-1.webp','/product-images/erdbewegung/bobcat-e35z-2.webp','/product-images/erdbewegung/bobcat-e35z-3.webp','/product-images/erdbewegung/bobcat-e35z-4.webp']::text[], '{"Betriebsgewicht":"ca. 3.500 kg","Motorleistung":"24,8 kW (33,4 PS)","Abgasnorm":"Stufe V","Grabtiefe":"bis zu 3,12 m","Reichweite am Boden":"ca. 5,26 m","Max. Ausschütthöhe":"ca. 3,5 m","Löffelvolumen":"0,1 – 0,15 m³","Laufwerk":"Gummiketten (Stahlketten optional)"}'::jsonb, ARRAY[]::text[], ARRAY['minibagger','diesel','ab-2500','maschine']::text[], ARRAY['Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.','Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,85 €/l.']::text[],
      NULL, NULL, NULL, NULL,
      3500, NULL, '{}'::jsonb, TRUE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bobcat-e50z', '6t Minibagger', 'Bobcat E50z', 'Einsatzgewicht: 4.800 kg | Grabtiefe: 3.520 mm | Motorleistung: 36,4 kW | Abgasnorm Stufe V', 'Der Bobcat E50z ist ein kraftvoller Minibagger der 5-Tonnen-Klasse mit Nullheck-Design. Mit einer maximalen Grabtiefe von 3,52 m, einer Reichweite von 5,98 m und einer Ausschütthöhe von 4,08 m meistert er anspruchsvolle Erd-, Kanal- und Abbrucharbeiten. Der Stage V Motor mit 36,4 kW (49,6 PS) und 99,2 l/min Hydraulikleistung bietet hervorragende Performance. Der Schwenkbereich des Auslegers beträgt 75° links und 55° rechts. Serienmäßig mit Gummiketten, Stahlketten optional.

Verfügbare Anbaugeräte (Auswahl): Hydraulikhammer für Abbrucharbeiten, Schlegelmäher für Landschaftsgärten, Räumlöffel und Tieflöffel für Aushubarbeiten, Greifer zum sicheren Heben und Platzieren von Materialien.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/bobcat-e50z-1.webp','/product-images/erdbewegung/bobcat-e50z-2.webp','/product-images/erdbewegung/bobcat-e50z-3.webp','/product-images/erdbewegung/bobcat-e50z-4.webp']::text[], '{"Betriebsgewicht":"ca. 4,8 t","Motorleistung":"36,4 kW (49,6 PS)","Abgasnorm":"Stufe V","Max. Grabtiefe":"3,52 m","Max. Reichweite":"5,98 m","Ausschütthöhe":"4,08 m","Löffelvolumen":"0,13 – 0,22 m³","Laufwerk":"Gummiketten (Stahlketten optional)","Hydraulikleistung":"99,2 l/min","Schwenkbereich Ausleger":"Links 75°, Rechts 55°"}'::jsonb, ARRAY[]::text[], ARRAY['minibagger','diesel','ab-2500','maschine']::text[], ARRAY['Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.','Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,85 €/l.']::text[],
      NULL, NULL, NULL, NULL,
      4800, NULL, '{}'::jsonb, TRUE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'winterdienst-set-kramer-5045', 'Winterdienst-Set Kramer 5045', 'Special-Set: Kramer 5045 Radlader + Adler Schneeschild + Bluetooth-Salzstreuer', 'Profi-Winterdienstpaket: Kramer 5045 Radlader (Betriebsgewicht ca. 2.675 – 2.750 kg) mit hydraulisch schwenkbarem Adler-Schneeschild und Bluetooth-Anbau-Salzstreuer am Heck. Auf Anfrage in Krefeld, Bonn und Mülheim an der Ruhr.', 'Schnee war gestern – mit unserem Winterdienst-Set Kramer 5045 räumst du Hof, Parkplatz, Werksgelände und Zufahrt in Rekordzeit frei.

Das Set kombiniert den kompakten, wendigen Kramer 5045 Radlader (Betriebsgewicht ca. 2.675 – 2.750 kg, Yanmar-Dieselmotor, Stage V) mit einem hochwertigen Adler-Schneeschild und einem heckseitigen Anbau-Salzstreuer. So räumst du vorne und streust hinten in einem einzigen Arbeitsgang – ohne Aussteigen, ohne Umrüsten, ohne Werkzeug.

Das Adler-Schneeschild ist hydraulisch im Neigungswinkel verstellbar: Per Joystick aus der Kabine schwenkst du das Schild stufenlos nach links und rechts, je nach Räumrichtung. So bleibt der Schnee zuverlässig auf der gewünschten Seite – entlang von Bordsteinen, Hauswänden oder Tordurchfahrten.

Der Anbau-Salzstreuer wird per Bluetooth über eine Hersteller-App mit deinem Smartphone gekoppelt. Streumenge (g/m²), Streubreite und Vor-/Nachlauf stellst du direkt aus der Fahrerkabine ein – die Steuereinheit am Streuer regelt Förderschnecke und Streuteller entsprechend. Funkfernbedienung als Alternative ebenfalls möglich. Optional sind dazu Schneeketten zubuchbar, damit der Radlader auch auf vereisten Flächen und Steigungen sicher und mit voller Traktion arbeitet.

Preis: 1.499 € pro Monat inkl. 19 % USt. – Mindestbuchungszeit 3 Monate, zzgl. Maschinenbruchversicherung. Verfügbar auf Anfrage an unseren Standorten Krefeld, Bonn und Mülheim an der Ruhr.

Im Set enthalten:
• Kramer 5045 Radlader (Yanmar Diesel, Stage V, 0,45 m³ Standardschaufel)
• Adler-Schneeschild, hydraulisch schwenkbar (Neigungswinkel verstellbar)
• Anbau-Salzstreuer (Heck) mit Bluetooth-/App-Steuerung
• Optional zubuchbar: Schneeketten für Vorder- und Hinterachse

Fordere jetzt unverbindlich dein Angebot an – wir melden uns kurzfristig mit Verfügbarkeit und Konditionen.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/winterdienst-set-kramer-5045-1.jpg','/product-images/erdbewegung/winterdienst-set-kramer-5045-2.png','/product-images/erdbewegung/winterdienst-set-kramer-5045-3.png','/product-images/erdbewegung/winterdienst-set-kramer-5045-4.png']::text[], '{"Set-Inhalt":"Kramer 5045 Radlader + Adler-Schneeschild (hydraulisch schwenkbar) + Anbau-Salzstreuer mit Bluetooth-/App-Steuerung","Mietpreis":"1.499 € / Monat inkl. 19 % USt. (Mindestbuchungszeit 3 Monate, zzgl. Maschinenbruchversicherung)","Betriebsgewicht Radlader":"ca. 2.675 – 2.750 kg","Motorhersteller":"Yanmar","Motorleistung":"18,5 kW / 25,2 PS (Standard) – optional 33,3 kW / 45,3 PS","Abgasstufe":"EU Stage V","Schaufelinhalt (Standardschaufel)":"0,45 m³","Nutzlast (S=1,25)":"1.310 kg","Kipplast (Standardschaufel)":"2.270 kg","Fahrgeschwindigkeit":"0 – 20 km/h (optional 0 – 30 km/h)","Tankinhalt Diesel":"56 l","Schneeschild":"Adler – hydraulisch im Neigungswinkel verstellbar (Links-/Rechts-Schwenkung aus der Kabine)","Salzstreuer":"Anbau-Salzstreuer (Heck) mit Bluetooth-/App-Steuerung – Streumenge, Streubreite und Vor-/Nachlauf per Smartphone aus der Kabine","Schneeketten":"optional zubuchbar","Verfügbarkeit":"auf Anfrage an allen drei Standorten"}'::jsonb, ARRAY[]::text[], ARRAY['radlader','diesel','ab-2500','maschine','winterdienst','special-set']::text[], ARRAY['Mietpreis 1.499 € / Monat inkl. 19 % USt. – Mindestbuchungszeit 3 Monate, zzgl. Maschinenbruchversicherung.','Anlieferung, Einweisung und Schneeketten optional – bitte bei der Anfrage angeben.','Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,85 €/l.']::text[],
      NULL, NULL, '1.499 €', 3,
      2750, 'diesel', '{}'::jsonb, TRUE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kramer-5045', '3t Radlader', 'Kramer 5045', 'Einsatzgewicht: 3.000 kg | Dieselmotor | Schaufel inkl. | Kompakt & vielseitig', NULL, 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/kramer-5045-1.png','/product-images/erdbewegung/kramer-5045-2.png']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY['radlader','diesel','ab-2500','maschine']::text[], ARRAY['Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.','Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,85 €/l.']::text[],
      NULL, NULL, NULL, NULL,
      3000, NULL, '{"krefeld":"PMJJCT","muelheim":"ZC8JGH","bonn":"EEJXMU"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kramer-5050', '3t Radlader', 'Kramer 5050', 'Einsatzgewicht: 3.000 kg | Dieselmotor | Schaufel inkl. | Kompakt & vielseitig', NULL, 'erdbewegung',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/erdbewegung/kramer-5045-1.png','/product-images/erdbewegung/kramer-5045-2.png']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY['radlader','diesel','ab-2500','maschine']::text[], ARRAY['Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.','Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,85 €/l.']::text[],
      NULL, NULL, NULL, NULL,
      3000, NULL, '{}'::jsonb, TRUE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bobcat-l28-knicklader', 'Knicklader', 'Bobcat L28', 'Kompakter Knicklader für vielseitige Einsätze auf engen Baustellen', NULL, 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/bobcat-l28-1.jpeg']::text[], '{"Betriebsgewicht":"1903 kg","Hubkraft":"1085 kg (bei Knickstellung Lasttabelle beachten!)","Gesamtbreite":"1270 mm","Gesamthöhe":"1980 mm","Kraftstoff":"Diesel (36,20l)","Extras":"Teleskopierbarer Arm & Palettengabel"}'::jsonb, ARRAY[]::text[], ARRAY['knicklader','diesel','ab-2500','maschine']::text[], ARRAY['Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.','Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,85 €/l.']::text[],
      NULL, NULL, NULL, NULL,
      2800, NULL, '{}'::jsonb, TRUE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'knickdumper-kde550', 'Raddumper / Knickdumper 4x4 elektrisch', 'KDe550p', 'Elektro-Raddumper mit 8-10h reiner Arbeitszeit | Nutzlast: 550 kg | 4x4 Allradantrieb | Kippwinkel 110°', NULL, 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/raddumper-kde550p-1.jpg']::text[], '{"Antriebsart":"Elektro Raddumper mit 8-10h reiner Arbeitszeit","Kippwinkel":"110° (extra groß)","Maschinengewicht":"318 kg","max. Tragfähigkeit":"550 kg","Innenmaß Pritsche (LxBxH)":"80 cm x 64 cm x 40 cm","Gesamtbreite":"78 cm","Gesamthöhe":"117 cm","Geschwindigkeitsstufen":"3","Kraftstoff":"Elektro","Ladezeit von 0-100%":"ca. 7-8 h","Antriebsmotoren":"2 x 1000 W","Ladegerät":"integriert mit 5 m Kabel (230 V)","Beleuchtung":"1x LED Frontscheinwerfer, 1x LED Topscheinwerfer"}'::jsonb, ARRAY[]::text[], ARRAY['dumper','elektro','bis-1500','maschine']::text[], ARRAY['Preis gilt für 8 Betriebsstunden/Tag (Laufzeit ca. 8–10 h).']::text[],
      NULL, NULL, NULL, NULL,
      318, NULL, '{"krefeld":"L62XBG","muelheim":"LKXBX6"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kettendumper-rmd800', 'Ketten-Dumper', 'RMD-800', 'Nutzlast: 800 kg | Benzinmotor 6,2 PS | Raupenlaufwerk | Rungen für Holz-/Steinplattentransport', 'Der Ketten-Dumper RMD-800 ist ein kompakter Raupendumper mit 800 kg Tragfähigkeit und einer Muldenkapazität von 305 l (gestrichen) bzw. 400 l (gehäuft). Mit nur 80 cm Gesamtbreite eignet er sich hervorragend für enge Zugänge. Der 6,2 PS Benzinmotor bietet zuverlässige Leistung, zwei Geschwindigkeitsstufen ermöglichen flexibles Arbeiten. Serienmäßige Rungen ermöglichen den sicheren Transport von Holz oder Steinplatten.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/kettendumper-rmd800-1.jpeg']::text[], '{"Maschinengewicht":"450 kg","Max. Tragfähigkeit":"800 kg","Muldengröße":"305 l / 400 l (gestrichen / gehäuft)","Breite ohne seitliche Bordwände":"75 cm","Gesamtbreite":"80 cm","Gesamthöhe":"126 cm","Gesamtlänge":"213 cm","Innenmaße Kipppritsche (LxBxH)":"131 x 64 x 36 cm","Motorleistung":"6,2 PS","Kraftstoff":"Benzin","Tankinhalt":"6,5 l","Geschwindigkeitsstufen":"2","Extras":"Rungen (für Transport von Holz oder Steinplatten)"}'::jsonb, ARRAY[]::text[], ARRAY['dumper','benzin','bis-1500','maschine']::text[], ARRAY['Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.','Zzgl. Verbrauch – Rückgabe mit vollem Tank. Super (Benzin): brutto 2,95 €/l.']::text[],
      NULL, NULL, NULL, NULL,
      450, NULL, '{"bonn":"R1FU1X"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cormidi-c60-hitip', 'Dumper mit Hochauskippfunktion', 'Cormidi C60 HI TIP', 'Nutzlast: 600 kg | Dieselmotor | Hochauskippfunktion | Raupenlaufwerk | Kompakt & wendig', NULL, 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/cormidi-c60-1.jpg','/product-images/erdbewegung/cormidi-c60-2.jpg','/product-images/erdbewegung/cormidi-c60-3.jpg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY['dumper','diesel','bis-1500','maschine']::text[], ARRAY['Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.','Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,85 €/l.']::text[],
      NULL, NULL, NULL, NULL,
      600, NULL, '{}'::jsonb, TRUE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms01-tiefloeffel-20cm', 'MS01 Tieflöffel 20cm/14l', NULL, 'Tieflöffel 20cm für MS01 Schnellwechsler', NULL, 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{"Aufnahme":"MS01","Gewichtsklasse":"0,5 - 2 t","Volumen":"14 l","Arbeitsbreite":"300 mm","Zahnsystem":"geschraubt","Anzahl Zähne":"2","Gewicht":"22 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"ZDH9MF","bonn":"AIX9WF"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms01-tiefloeffel-30cm', 'MS01 Tieflöffel 30cm/24l', NULL, 'Tieflöffel 30cm für MS01 Schnellwechsler – Gewichtsklasse 1–2 t', 'Der MS01 Tieflöffel 30cm/24l eignet sich ideal für Grab- und Aushubarbeiten mit Minibaggern der 1- bis 2-Tonnen-Klasse. Mit 300 mm Arbeitsbreite und 24 Liter Volumen ist er vielseitig einsetzbar – von Fundamentaushub bis Leitungsgräben. Der zahnlose Löffel schont empfindliche Untergründe und ermöglicht saubere Grabensohlen.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/tiefloeffel-ms01-30cm-1.jpeg']::text[], '{"Aufnahme":"MS01","Gewichtsklasse Trägergerät":"1 – 2 t","Volumen":"24 l","Arbeitsbreite":"300 mm","Zahnsystem":"ohne Zähne","Anzahl Zähne":"0","Gewicht":"36 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"NXR6T1"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms01-tiefloeffel-30cm-symlock', 'MS01 Tieflöffel 30cm/24l Symlock', NULL, 'Tieflöffel 30cm für MS01 Symlock – Gewichtsklasse 1–2 t, 3 Zähne', 'Der MS01 Tieflöffel 30cm/24l Symlock ist ein kompakter Grabenlöffel mit 3 geschraubten Zähnen für anspruchsvolle Grab- und Aushubarbeiten in harten Böden. Mit 300 mm Arbeitsbreite und 24 Liter Volumen eignet er sich ideal für schmale Gräben und Fundamentarbeiten. Das Symlock-Schnellwechselsystem ermöglicht den werkzeuglosen Anbau an MS01-kompatible Minibagger.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/tiefloeffel-ms01-30cm-symlock-1.jpeg']::text[], '{"Aufnahme":"MS01 (Symlock)","Gewichtsklasse Trägergerät":"1 – 2 t","Volumen":"24 l","Arbeitsbreite":"300 mm","Zahnsystem":"geschraubt","Anzahl Zähne":"3","Gewicht":"36 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"1JXMIQ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms01-tiefloeffel-50cm-symlock', 'MS01 Tieflöffel 50cm/45l Symlock', NULL, 'Tieflöffel 50cm für MS01 Symlock – Gewichtsklasse 1–2 t, 4 Zähne', 'Der MS01 Tieflöffel 50cm/45l Symlock ist ein robuster Grabenlöffel mit 4 geschraubten Zähnen für anspruchsvolle Grab- und Aushubarbeiten. Mit 500 mm Arbeitsbreite und 45 Liter Volumen eignet er sich hervorragend für Fundamentarbeiten, Kanalisation und allgemeine Erdarbeiten. Das Symlock-Schnellwechselsystem ermöglicht den werkzeuglosen Anbau an MS01-kompatible Minibagger.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/tiefloeffel-ms01-50cm-1.jpeg']::text[], '{"Aufnahme":"MS01 (Symlock)","Gewichtsklasse Trägergerät":"1 – 2 t","Volumen":"45 l","Arbeitsbreite":"500 mm","Zahnsystem":"geschraubt","Anzahl Zähne":"4","Gewicht":"48 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"7A6LGC","muelheim":"JM8TLN"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms03-tiefloeffel-30cm-symlock', 'MS03 Tieflöffel 30cm/41l Symlock', NULL, 'Tieflöffel 30cm für MS03 Symlock', NULL, 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{"Aufnahme":"MS03 (Symlock)","Gewichtsklasse":"1 - 2 t","Volumen":"41 l","Arbeitsbreite":"300 mm","Zahnsystem":"geschraubt","Anzahl Zähne":"3","Gewicht":"36 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"JZQKVD","bonn":"4I75NO"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms03-tiefloeffel-50cm-symlock', 'MS03 Tieflöffel 50cm/107l Symlock', NULL, 'Tieflöffel 50cm für MS03 Symlock – 4 Zähne, 107 l Volumen', 'Der MS03 Tieflöffel 50cm/107l Symlock ist ein leistungsstarker Grabenlöffel mit 4 geschraubten Zähnen für anspruchsvolle Aushubarbeiten. Mit 500 mm Arbeitsbreite und 107 Liter Volumen eignet er sich für Fundamentarbeiten, Kanalisation und allgemeine Erdarbeiten mit Baggern der 2,5- bis 4-Tonnen-Klasse.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/tiefloeffel-ms03-50cm-1.jpeg']::text[], '{"Aufnahme":"MS03 (Symlock)","Volumen":"107 l","Arbeitsbreite":"500 mm","Zahnsystem":"geschraubt","Anzahl Zähne":"4","Gewicht":"79 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms01-kabelloeffel-15cm-symlock', 'MS01 Kabellöffel 15cm Symlock', NULL, 'Kabellöffel 15cm für MS01 Symlock – Gewichtsklasse 1–2 t', 'Der MS01 Kabellöffel 15cm Symlock ist ein schmaler Löffel ohne Zähne, speziell für das präzise Freilegen und Verlegen von Kabeln und Leitungen in engen Gräben. Die 150 mm Arbeitsbreite ermöglicht akkurates Arbeiten bei minimalem Aushub. Dank des Symlock-Schnellwechselsystems ist der Anbau an MS01-kompatible Minibagger der 1- bis 2-Tonnen-Klasse in wenigen Sekunden erledigt.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/kabelloeffel-ms01-15cm-1.png']::text[], '{"Aufnahme":"MS01 Symlock","Gewichtsklasse Trägergerät":"1 – 2 t","Arbeitsbreite":"150 mm","Anzahl Zähne":"0","Gewicht":"36 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"ZHXAG6","bonn":"3PP7G6"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms03-kabelloeffel-20cm-symlock', 'MS03 Kabellöffel 20cm Symlock', NULL, 'Kabellöffel 20cm für MS03 Symlock – Gewichtsklasse 2,5–4 t', 'Der MS03 Kabellöffel 20cm Symlock ist ein schmaler Löffel ohne Zähne, speziell für das präzise Freilegen und Verlegen von Kabeln und Leitungen in engen Gräben. Die 200 mm Arbeitsbreite ermöglicht akkurates Arbeiten bei minimalem Aushub. Dank des Symlock-Schnellwechselsystems ist der Anbau an MS03-kompatible Bagger der 2,5- bis 4-Tonnen-Klasse in wenigen Sekunden erledigt.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/kabelloeffel-ms03-20cm-1.png']::text[], '{"Aufnahme":"MS03 (Symlock)","Gewichtsklasse Trägergerät":"2,5 – 4 t","Arbeitsbreite":"200 mm","Gewicht":"46 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"bonn":"GS5BXN"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms01-grabenraeumloeffel-100cm-symlock', 'MS01 Grabenräumlöffel hydr. 100cm/80l Symlock', NULL, 'Hydraulischer Grabenräumlöffel 100cm für MS01 Symlock – schwenkbar', 'Der MS01 Grabenräumlöffel hydr. 100cm/80l Symlock ist ein hydraulisch schwenkbarer Löffel mit 1000 mm Arbeitsbreite und 80 Liter Volumen. Dank der hydraulischen Schwenkfunktion lassen sich Gräben und Böschungen auch in unebenem Gelände exakt profilieren. Das Symlock-Schnellwechselsystem ermöglicht den werkzeuglosen Anbau an MS01-kompatible Minibagger.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/grabenraeumloeffel-ms01-hydr-100cm-1.jpeg']::text[], '{"Aufnahme":"MS01 (Symlock)","Volumen":"80 l","Arbeitsbreite":"1000 mm","Gewicht":"104 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"EZKG9U","bonn":"E3DLEB"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms01-grabenraeumloeffel-hydr-80cm', 'MS01 Grabenräumlöffel hydr. 80cm/52l', NULL, 'Hydraulischer Grabenräumlöffel 80cm für MS01 – schwenkbar', 'Der MS01 Grabenräumlöffel hydr. 80cm/52l ist ein hydraulisch schwenkbarer Löffel für präzise Grabenräum- und Planierarbeiten. Dank der hydraulischen Schwenkfunktion kann der Löffel auch an Böschungen und in unebenem Gelände exakt ausgerichtet werden – ideal für saubere Grabensohlen und Profilierungsarbeiten.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/grabenraeumloeffel-ms01-hydr-80cm-1.jpeg']::text[], '{"Aufnahme":"MS01","Volumen":"63 l","Arbeitsbreite":"800 mm","Gewicht":"92 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms01-grabenraeumloeffel-80cm', 'MS01 Grabenräumlöffel starr 80cm/45l', NULL, 'Starrer Grabenräumlöffel 80cm für MS01 – Gewichtsklasse 1–2 t', 'Der MS01 Grabenräumlöffel starr 80cm/45l ist ideal zum sauberen Profilieren und Räumen von Gräben. Mit 800 mm Arbeitsbreite und 45 Liter Volumen eignet er sich für Planierarbeiten, Böschungsprofilierung und das Anlegen von Gräben. Die starre Bauweise sorgt für maximale Stabilität bei der Arbeit.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/grabenraeumloeffel-ms01-80cm-1.jpeg']::text[], '{"Aufnahme":"MS01","Gewichtsklasse Trägergerät":"1 – 2 t","Volumen":"45 l","Arbeitsbreite":"800 mm","Gewicht":"46 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"2A5TQZ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms01-grabenraeumloeffel-80cm-65l', 'MS01 Grabenräumlöffel starr 80cm/65l', NULL, 'Starrer Grabenräumlöffel 80cm/65l für MS01 – größeres Volumen', 'Der MS01 Grabenräumlöffel starr 80cm/65l bietet mit 65 Liter Volumen eine größere Kapazität als das 45l-Modell bei gleicher Arbeitsbreite von 800 mm. Ideal für Planierarbeiten, Böschungsprofilierung und das effiziente Räumen breiterer Gräben mit MS01-kompatiblen Minibaggern.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/grabenraeumloeffel-ms01-100cm-1.jpeg']::text[], '{"Aufnahme":"MS01","Volumen":"65 l","Arbeitsbreite":"800 mm","Gewicht":"55 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms03-grabenraeumloeffel-120cm-symlock', 'MS03 Grabenräumlöffel hydr. 120cm/120l Symlock', NULL, 'Hydraulischer Grabenräumlöffel 120cm für MS03 Symlock', NULL, 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{"Aufnahme":"MS03 (Symlock)","Gewichtsklasse":"2,5 - 4 t","Volumen":"120 l","Arbeitsbreite":"1200 mm","Zahnsystem":"keine Zähne","Anzahl Zähne":"0","Gewicht":"114 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"1G5LXK","bonn":"6RX3MS"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms03-grabenraeumloeffel-140cm-symlock', 'MS03 Grabenräumlöffel starr 140cm/170l Symlock', NULL, 'Starrer Grabenräumlöffel 140cm für MS03 Symlock – 170 l Volumen', 'Der MS03 Grabenräumlöffel starr 140cm/170l Symlock ist ein großer Planierungslöffel für Minibagger der 2,5- bis 3,5-Tonnen-Klasse. Mit 1400 mm Arbeitsbreite und 170 Liter Volumen eignet er sich hervorragend für großflächige Planierarbeiten, Böschungsprofilierung und das Räumen breiter Gräben.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/grabenraeumloeffel-ms03-140cm-1.jpeg']::text[], '{"Aufnahme":"MS03 (Symlock)","Volumen":"170 l","Arbeitsbreite":"1400 mm","Gewicht":"129 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms08-grabenraeumloeffel-hydr-160cm-symlock', 'MS08 Grabenräumlöffel hydr. 160cm/288l Symlock', NULL, 'Hydraulischer Grabenräumlöffel 160cm für MS08 Symlock – 288 l Volumen, Gewichtsklasse 5–10 t', 'Der MS08 Grabenräumlöffel hydr. 160cm/288l Symlock ist ein hydraulisch schwenkbarer Großlöffel für Bagger der 5- bis 10-Tonnen-Klasse. Mit 1600 mm Arbeitsbreite und 288 Liter Volumen eignet er sich hervorragend für großflächige Planierarbeiten, Böschungsprofilierung und das Räumen breiter Gräben. Die hydraulische Schwenkfunktion ermöglicht präzises Arbeiten auch in schwierigem Gelände.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/grabenraeumloeffel-ms08-hydr-160cm.avif']::text[], '{"Aufnahme":"SB08S (passend MS08 Symlock)","Gewichtsklasse Trägergerät":"5 – 10 t","Gewicht":"317 kg","Arbeitsbreite":"1600 mm","Höhe":"850 mm","Volumen (SAE)":"288 l","Grundkörper Material":"S355","Schneiden Material":"HB500"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"P5ENQ7"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms01-hydraulikhammer-shb40', 'MS01 Hydraulikhammer SHB40', NULL, 'Hydraulikhammer für MS01 Schnellwechsler – Gewichtsklasse 1–2,5 t', 'Der SHB40 Hydraulikhammer ist das ideale Anbaugerät für Minibagger der 1- bis 2,5-Tonnen-Klasse mit MS01 Schnellwechsler. Mit einer Schlagkraft von 280 Joule und 800–1.400 Schlägen pro Minute eignet er sich hervorragend zum Aufbrechen von Beton, Asphalt und Gestein. Das kompakte Eigengewicht von nur 105 kg ermöglicht den Einsatz auch auf kleineren Maschinen ohne Stabilitätsverlust.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/hydraulikhammer-shb40-1.jpeg','/product-images/erdbewegung/hydraulikhammer-shb40-2.jpeg','/product-images/erdbewegung/hydraulikhammer-shb40-3.jpeg']::text[], '{"Schnellwechsler":"MS01","Gewichtsklasse Trägergerät":"1 – 2,5 t","Gewicht":"105 kg","Höhe":"109 cm","Meißel-Durchmesser":"40 mm","Schlaganzahl":"800 – 1.400 bpm","Schlagkraft":"280 J","Betriebsdruck":"9 – 12 MPa","Öldurchfluss":"15 – 25 l/min"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"DC6H9Z","muelheim":"11Y51V"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms01-ms03-hydraulikhammer-shb45', 'MS01/MS03 Hydraulikhammer SHB45', NULL, 'Hydraulikhammer für MS01/MS03 Schnellwechsler', NULL, 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/hydraulikhammer-shb45-1.jpg','/product-images/erdbewegung/hydraulikhammer-shb45-2.jpg','/product-images/erdbewegung/hydraulikhammer-shb45-3.jpg']::text[], '{"Betriebsdruck":"9 - 12 MPa","Gewicht":"126 kg","Gewichtsklasse":"1 - 3,5 t","Höhe":"109 cm","Meißel Durchmesser":"45 mm","Schlaganzahl":"800 - 1400 bpm","Schlagkraft":"350 J","Öldurchfluss":"20 - 30 l/min"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"CRLJPA"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms03-ms08-hydraulikhammer-shb75', 'MS03/MS08 Hydraulikhammer SHB75', NULL, 'Hydraulikhammer für MS03/MS08 Schnellwechsler – Gewichtsklasse 6–9 t', 'Der SHB75 Hydraulikhammer ist ein leistungsstarkes Anbaugerät für Bagger der 6- bis 9-Tonnen-Klasse mit MS03 oder MS08 Schnellwechsler. Mit einer Schlagkraft von 1.200 Joule und 400–800 Schlägen pro Minute eignet er sich hervorragend zum Aufbrechen von Beton, Asphalt, Fels und Gestein. Der 75-mm-Meißel bietet optimale Durchschlagskraft bei kompaktem Eigengewicht von 375 kg.', 'erdbewegung',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/erdbewegung/hydraulikhammer-shb75-1.avif']::text[], '{"Meißel Durchmesser":"75 mm","Schlaganzahl":"400 – 800 bpm","Schlagkraft":"1.200 J","Gewichtsklasse Trägergerät":"6 – 9 t","Gewicht":"375 kg","Höhe":"1.500 mm","Öldurchfluss":"50 – 90 l/min","Betriebsdruck":"12 – 17 MPa"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms10-hydraulikhammer-shb100', 'MS10 Hydraulikhammer SHB100', NULL, 'Hydraulikhammer für MS10 Schnellwechsler – Gewichtsklasse 10–15 t', 'Der SHB100 Hydraulikhammer ist ein leistungsstarkes Anbaugerät für Bagger der 10- bis 15-Tonnen-Klasse mit MS10 Schnellwechsler. Mit einer Schlagkraft von 2.100 Joule und 400–650 Schlägen pro Minute eignet er sich für schwere Abbrucharbeiten an Beton, Fels und Mauerwerk. Der 100-mm-Meißel bietet maximale Durchschlagskraft bei einem Eigengewicht von 861 kg.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/hydraulikhammer-shb100-1.avif']::text[], '{"Meißel Durchmesser":"100 mm","Schlaganzahl":"400 – 650 bpm","Schlagkraft":"2.100 J","Gewichtsklasse Trägergerät":"10 – 15 t","Gewicht":"861 kg","Höhe":"1.900 mm","Öldurchfluss":"80 – 110 l/min","Betriebsdruck":"15 – 17 MPa"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms01-ms03-sortiergreifer-ssg150', 'MS01/MS03 Sortiergreifer SSG 150', NULL, 'Kompakter Sortiergreifer mit 6,75 kN Schließkraft – Gewichtsklasse 2–3 t', 'Der SSG150 erzielt eine, in der Gewichtsklasse von 2–3 Tonnen, überdurchschnittliche Schließkraft von 6,75 kN – bei einem Eigengewicht von nur 150 kg. Die Schalenbreite beträgt 40 Zentimeter, die Öffnungsweite 92 Zentimeter.

Bei Qualität und Zuverlässigkeit spielt der SSG150 in derselben Liga wie seine großen Brüder. SEIFERT hat bei der Entwicklung den Fokus auf maximale Belastbarkeit gelegt.

Für die Greifer der SEIFERT SSG-Baureihe sind, neben den standardmäßig im Lieferumfang enthaltenen Greiferzähnen, optionale Anbauschneiden erhältlich – als Wechselschneiden mit 2 Verschleißkanten oder als gezahnte Schneiden für maximalen Halt.

Alle SEIFERT SSG-Sortiergreifer verfügen serienmäßig über ein Lasthalteventil, um gegriffene Objekte sicher zu halten und vor dem Herausrutschen zu schützen.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/sortiergreifer-ssg150-1.avif','/product-images/erdbewegung/sortiergreifer-ssg150-2.avif','/product-images/erdbewegung/sortiergreifer-ssg150-3.avif']::text[], '{"Arbeitsbreite":"400 mm","Bauhöhe (geöffnet)":"680 mm","Betriebsdruck":"25 MPa","Gewicht":"150 kg","Gewichtsklasse Trägergerät":"2 – 3 t","Max. Schließkraft":"6,75 kN","Rotation":"360° / endlos","Rotation Betriebsdruck":"20 MPa","Rotation Öldurchfluss":"20 l/min","Öffnungsweite":"920 mm","Öldurchfluss":"35 l/min"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"bonn":"F7N9YA"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY['https://www.youtube.com/watch?v=NxHLwYjWVA8']::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'sortiergreifer-ssg390', 'MS03/MS08 Sortiergreifer SSG 390', 'Seifert SSG 390', 'Hydraulischer Sortiergreifer mit 360°-Endlosrotation und 24 kN Schließkraft – für Bagger der 5–8 t Klasse. Mit Schneide, ideal zum Sortieren, Greifen und Verladen.', 'Der Seifert SSG 390 ist ein leistungsstarker Sortiergreifer mit 360°-Endlosrotation für präzises Positionieren von Schüttgütern, Steinen, Baumstämmen und Abbruchmaterial. Die robuste Ausführung mit Schneide ermöglicht auch den Einsatz bei verdichteten Materialien. Kompatibel mit MS03/MS08 Aufnahme für Bagger der 5–8 t Klasse.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/sortiergreifer-ssg390.jpg']::text[], '{"Aufnahme":"MS03 / MS08","Gewichtsklasse":"5 – 8 t","Gewicht":"390 kg","Öffnungsweite":"1.280 mm","Arbeitsbreite":"550 mm","Bauhöhe (geöffnet)":"1.060 mm","Max. Schließkraft":"24 kN","Rotation":"360° / endlos","Rotation Betriebsdruck":"25 MPa","Rotation Öldurchfluss":"40 l/min","Öldurchfluss":"60 l/min","Betriebsdruck":"30 MPa","Ausführung":"Mit Schneide"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"DCMDXV"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ms01-roderechen-symlock', 'MS01 Roderechen Symlock', NULL, 'Aufnahme: MS01, Gewichtsklasse: 1 - 2 t, Arbeitsbreite: 800 mm, Anzahl Zähne: 9, Gewicht: 36 kg', 'Der MS01 Roderechen Symlock eignet sich ideal zum Roden, Sortieren und Aufsammeln von Wurzeln, Steinen und Gestrüpp. Mit 800 mm Arbeitsbreite und 9 robusten Zähnen arbeitet er effizient in der Boden- und Geländevorbereitung. Dank des Symlock-Schnellwechselsystems ist der Anbau an MS01-kompatible Minibagger in wenigen Sekunden erledigt.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/roderechen-ms01-1.jpeg']::text[], '{"Aufnahme":"MS01 (Symlock)","Gewichtsklasse Trägergerät":"1 – 2 t","Arbeitsbreite":"800 mm","Anzahl Zähne":"9","Gewicht":"36 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"R5B2W9","bonn":"N2EKOE"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bodenschutz-fahrmatten', 'Bodenschutz- / Fahrmatten 0,86m² mit Nut & Feder', NULL, 'Bodenschutzplatten für Baumaschinen', NULL, 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/bodenschutz-fahrmatten-1.jpg','/product-images/erdbewegung/bodenschutz-fahrmatten-2.jpg','/product-images/erdbewegung/bodenschutz-fahrmatten-3.jpg','/product-images/erdbewegung/bodenschutz-fahrmatten-4.jpg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"EH43YT","bonn":"E3IB5R"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'diesel-kanister-10l', 'Diesel Kanister 10 l', NULL, 'Zum Nachtanken der Mietgeräte – Kanister wird leer übergeben!', 'Der 10-Liter-Dieselkanister ist das praktische Zubehör für alle dieselbetriebenen Mietgeräte. Er wird leer übergeben und kann an jeder Tankstelle befüllt werden. Ideal für Minibagger und Radlader, die auf der Baustelle nachgetankt werden müssen.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/diesel-kanister-10l-1.jpeg']::text[], '{"Volumen":"10 l","Kraftstoff":"Diesel","Übergabe":"leer"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'diesel-kanister-20l', 'Diesel Kanister 20 l', NULL, 'Zum Nachtanken der Mietgeräte – Kanister wird leer übergeben!', 'Der 20-Liter-Dieselkanister ist das praktische Zubehör für alle dieselbetriebenen Mietgeräte. Er wird leer übergeben und kann an jeder Tankstelle befüllt werden. Mit 20 Litern Fassungsvermögen ideal für längere Einsätze mit Minibaggern und Radladern.', 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/diesel-kanister-20l-1.jpeg']::text[], '{"Volumen":"20 l","Kraftstoff":"Diesel","Übergabe":"leer"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'dieseltankstelle-400l', 'Sirocco Mobile Dieseltankstelle 400L/50L', NULL, 'Mobile Tankstelle mit AdBlue-Tank', NULL, 'erdbewegung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdbewegung/dieseltankstelle-400l-1.jpg','/product-images/erdbewegung/dieseltankstelle-400l-2.jpg']::text[], '{"AdBluetank":"50L","Maße":"120 x 80 x 78,5 cm","Leergewicht":"45kg (nur Tank)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"KP5KOB"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-bohrhammer-gbh18v-26f', 'Akku Bohrhammer', 'Bosch GBH 18V-26 F', 'Akku-Bohrhammer mit SDS-Plus Aufnahme', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/bohrhammer-gbh18v-26f.jpg']::text[], '{"Hersteller":"Bosch","Schlagenergie (gemäß EPTA 05/2016)":"2,6 J","Schlagzahl bei Nenndrehzahl":"0 – 4.350 bpm","Nenndrehzahl":"0 – 980 min-1","Akkuspannung":"18,0 V","Verpackungsabmessungen (Breite x Länge x Höhe)":"251 x 398 x 104 mm","Bohr-Ø in Beton mit Hammerbohrern":"4 – 26 mm","Optimaler Einsatzbereich Beton mit Hammerbohrern":"8 – 16 mm","Max. Bohrdurchmesser in Metall":"13 mm","Max. Bohr-Ø Holz":"30 mm","Schalldruckpegel":"88 dB(A)","Schallleistungspegel":"99 dB(A)","Unsicherheit K":"3 dB"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"B3P8MO"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-bohrhammer-gbh18v-45c', 'Akku Bohrhammer', 'Bosch GBH 18V-45C', 'Schwerer Akku-Bohrhammer mit Bluetooth', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/bohrhammer-gbh18v-45c.jpg']::text[], '{"Hersteller":"Bosch","Schlagenergie (gemäß EPTA 05/2016)":"2,6 J","Schlagzahl bei Nenndrehzahl":"0 – 4.350 bpm","Nenndrehzahl":"0 – 980 min-1","Akkuspannung":"18,0 V","Verpackungsabmessungen (Breite x Länge x Höhe)":"251 x 398 x 104 mm","Bohr-Ø in Beton mit Hammerbohrern":"4 – 26 mm","Optimaler Einsatzbereich Beton mit Hammerbohrern":"8 – 16 mm","Max. Bohrdurchmesser in Metall":"13 mm","Max. Bohr-Ø Holz":"30 mm","Schalldruckpegel":"88 dB(A)","Schallleistungspegel":"99 dB(A)","Unsicherheit K":"3 dB"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"G8HYWM"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-abbruchhammer-gsh16-28', 'Abbruchhammer 41J / 18kg', 'Bosch GSH 16-28', 'Kabelgebundener Abbruchhammer Bosch GSH 16-28 mit 41 J Schlagenergie und 18,3 kg Eigengewicht – ideal für Beton- und Mauerwerksabbruch sowie Aufbrucharbeiten an Estrich und Fundamenten.', 'Der Bosch GSH 16-28 Professional ist der kabelgebundene Allrounder im Bosch Abbruchhammer-Segment. Der leistungsstarke 1.750-W-Motor liefert 41 Joule Schlagenergie und sorgt für eine herausragende Abtragsleistung in Beton, Mauerwerk und Naturstein. Das robuste Metallgehäuse ist auf Langlebigkeit im Dauereinsatz ausgelegt. Vibration Control reduziert die Belastung der Hand-Arm-Region (Schwingungsemissionswert 12,3 m/s²), der integrierte Tragegriff erleichtert das Handling im Hoch- und Querbetrieb. Werkzeugaufnahme HEX-28 für gängige Spitz- und Flachmeißel.

Lieferumfang: 1× Spitzmeißel und 1× Flachmeißel.', 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/abbruchhammer-gsh16-28.png']::text[], '{"Hersteller":"Bosch Professional","Modell":"GSH 16-28","Schlagenergie":"41 J","Schlagzahl bei Nenndrehzahl":"1.280 bpm","Nenneingangsleistung":"1.750 W","Spannung":"230 V","Gewicht":"18,3 kg","Werkzeugaufnahme":"HEX-28","Schwingungsemissionswert (Meißeln in Beton)":"12,3 m/s² (K = 1,5 m/s²)","Schalldruckpegel":"93 dB(A)","Schallleistungspegel":"104 dB(A)","Lieferumfang":"1× Spitzmeißel, 1× Flachmeißel"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"JR8BYL","bonn":"226JZO"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'makita-abbruchhammer-hm1812', 'Abbruchhammer 72,8J / 31kg', 'Makita HM1812', 'Schwerer Makita HM1812 Abbruchhammer mit 72,8 J Schlagenergie, 2.000 W und 31 kg Eigengewicht – ideal für Boden- und Fundamentabbruch sowie schwere Stemmarbeiten in Beton.', 'Der Makita HM1812 ist ein leistungsstarker Abbruchhammer der 30-kg-Klasse mit 2.000 W und 72,8 J Schlagenergie. Dank AVT (Anti-Vibrations-Technologie) wird die Hand-Arm-Belastung des Anwenders deutlich reduziert, sodass auch längere Stemmarbeiten in Beton, Asphalt oder Estrich möglich sind. Die HEX-28-Werkzeugaufnahme erlaubt schnellen Werkzeugwechsel ohne Zusatzwerkzeug. Mit 31 kg Gewicht entwickelt das Gerät die nötige Massenwirkung für Boden- und Fundamentabbrüche.

Lieferumfang: 1× Spitzmeißel und 1× Flachmeißel.', 'werkzeuge',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/werkzeuge/abbruchhammer-hm1812.jpeg']::text[], '{"Hersteller":"Makita","Modell":"HM1812","Schlagenergie":"72,8 J","Schlagzahl bei Nenndrehzahl":"870 bpm","Nenneingangsleistung":"2.000 W","Gewicht":"31 kg","Abmessung (LxB)":"84 x 60 cm","Werkzeugaufnahme":"HEX-28","Vibrationsdämpfung":"AVT (Anti-Vibrations-Technologie)","Lieferumfang":"1× Spitzmeißel, 1× Flachmeißel"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"EFFXYJ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-bohrschrauber-gsr12v-15', 'Akku Bohrschrauber', 'Bosch GSR 12V-15', 'Kompakter Akku-Bohrschrauber', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/bohrschrauber-gsr12v-15.jpg','/product-images/werkzeuge/bohrschrauber-gsr18v-55.jpeg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"3ZZ6ET","bonn":"LK67CV"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-bohrschrauber-gsr18v-60c', 'Akku Bohrschrauber', 'Bosch GSR 18V-60C', 'Leistungsstarker Akku-Bohrschrauber mit Bluetooth', NULL, 'werkzeuge',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/werkzeuge/bohrschrauber-gsr18v-60c.jpg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"QMLQVQ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bohrschrauber-gsr18v55', 'Akku Bohrschrauber', 'Bosch GSR 18V-55', 'Leistungsstarker Akku-Bohrschrauber mit 55 Nm Drehmoment und EC-Motor.', 'Professioneller Bosch Akku-Bohrschrauber GSR 18V-55 mit bürstenlosem EC-Motor für maximale Leistung und Lebensdauer. Mit 20+1 Drehmomentstufen und 2-Gang-Getriebe ideal für vielfältige Schraub- und Bohrarbeiten in Holz, Stahl und anderen Materialien.', 'werkzeuge',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/werkzeuge/bohrschrauber-gsr18v-55.jpeg']::text[], '{"Hersteller":"Bosch","Drehmoment (weich/hart)":"28 / 55 Nm","Leerlaufdrehzahl (1./2. Gang)":"0–460 / 0–1.800 min⁻¹","Akkutyp":"Lithium-Ionen","Akkuspannung":"18,0 V","Bohrfutterspannbereich":"1,5–13 mm","Gewicht exkl. Akku":"1 kg","Drehmomentstufen":"20+1","Schrauben-Ø max.":"10 mm","Bohr-Ø Holz max.":"35 mm","Bohr-Ø Stahl max.":"13 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, TRUE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-winkelschleifer-gws18v-10', 'Akku Winkelschleifer', 'Bosch GWS 18V-10', 'Akku-Winkelschleifer mit 125mm Scheibe', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/winkelschleifer-gws18v-10.jpg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"MY6WRS","bonn":"UL9XG5"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-handkreissaege-gks18v-57g', 'Akku Hand-Kreissäge', 'Bosch GKS 18V-57G', 'Akku-Handkreissäge mit Führungsschiene – führungsschienenkompatibel.', 'Die Bosch GKS 18V-57G ist eine leistungsstarke Akku-Handkreissäge mit 165 mm Sägeblatt und einer maximalen Schnitttiefe von 57 mm bei 90°. Dank Führungsschienenkompatibilität eignet sie sich ideal für präzise, gerade Schnitte in Holz. Mit nur 3,8 kg (ohne Akku) ist sie leicht und handlich.', 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/kreissaege-gks18v-57g.jpeg']::text[], '{"Hersteller":"Bosch","Leerlaufdrehzahl":"3.400 min⁻¹","Sägeblattdurchmesser":"165 mm","Sägeblattbohrungs-Ø":"20 mm","Akkuspannung":"18,0 V","Führungsschienenkompatibel":"Ja","Gewicht ohne Akku":"3,8 kg","Schnitttiefe 90°":"57 mm","Schnitttiefe 45°":"42 mm","Schalldruckpegel":"80 dB(A)","Schallleistungspegel":"91 dB(A)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"4A7OZI","bonn":"PKQ1ID"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'steinsaege-80cm', 'Steinsäge 80cm Nasschneidetisch', NULL, 'Steinsäge mit Kühlwasserzufuhr – Nassschneidetisch für präzise Steinschnitte.', 'Professioneller Nasschneidetisch für präzise Steinschnitte mit integrierter Kühlwasserzufuhr. Ideal zum Schneiden von Naturstein, Pflastersteinen, Fliesen und Betonsteinen. Die Messung des Verschleißes erfolgt bei der Abholung und Rückgabe. Je nach Durchmesser und Typ der Sägeblätter wird ein Einheitspreis pro 0,1 mm veranschlagt. Im Mietpreis ist ein Mindestbetrag für 0,25 mm berücksichtigt. Diamanttrennscheiben zum Kauf optional erhältlich.', 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/saegen/steinsaege-80cm-1.jpeg','/product-images/saegen/steinsaege-80cm-2.jpeg','/product-images/saegen/steinsaege-80cm-3.jpeg']::text[], '{"Durchmesser Sägeblatt":"350 mm","Nenneingangsleistung":"2.200 W","Gewicht":"70 kg","Abmessung (LxBxH)":"110 x 58 x 118 cm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY['Die Messung des Verschleißes erfolgt bei der Abholung und Rückgabe.','Je nach Durchmesser und Typ der Sägeblätter wird ein Einheitspreis pro 0,1 mm veranschlagt.','Im Mietpreis ist ein Mindestbetrag für 0,25 mm berücksichtigt.','Diamanttrennscheiben zum Kauf optional erhältlich.']::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"L2QI1R","bonn":"RVQWQN"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'zwangsmischer-140l', 'Zwangsmischer 140L', NULL, 'Zwangsmischer Compakt 140L – für gleichmäßige Beton- und Mörtelmischungen.', 'Leistungsstarker Zwangsmischer Compakt 140L für gleichmäßige Beton-, Mörtel- und Estrichmischungen auf der Baustelle.', 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/mischer/zwangsmischer-140l-1.jpeg','/product-images/mischer/zwangsmischer-140l-2.jpeg','/product-images/mischer/zwangsmischer-140l-3.jpeg']::text[], '{"Typ":"Compakt 140L","Motorleistung":"2.200 W / 230V","Rührwerk N":"27,5 min⁻¹","Trommelvolumen":"max. 140 L","Gewicht":"130 kg","Abmessung (LxBxH)":"82 x 77 x 121 cm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY['Der Zwangsmischer ist gereinigt zurückzugeben.','Bei ungereinigter Rückgabe berechnen wir eine Reinigungspauschale in Höhe von 100 €.']::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"bonn":"VSE9XB"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-saebelsaege-gsa18v-li-c', 'Akku Säbelsäge', 'Bosch GSA 18V-LI C', 'Akku-Säbelsäge mit variabler Geschwindigkeit', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/saebelsaege-gsa18v-li-c.jpg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"ZZOHCI"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-multicutter-gop18v-28', 'Akku Multicutter', 'Bosch GOP 18V-28', 'Multifunktionswerkzeug für verschiedene Anwendungen', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/multicutter-gop18v-28.jpg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"W2GTY5"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-drehschlagschrauber-gds18v-1050h', 'Akku Drehschlagschrauber', 'Bosch GDS 18V-1050 H', 'Hochleistungs-Schlagschrauber', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/drehschlagschrauber-gds18v-1050h.jpg','/product-images/werkzeuge/drehschlagschrauber-gds18v-1050h-2.jpg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"YRSP66"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-staubsauger-gas18v-10l', 'Akku Staubsauger', 'Bosch GAS 18V-10 L', 'Akku-Staubsauger für Baustellen', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/staubsauger-gas18v-10l.jpg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"MS2EV3"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-staubsaugeraufsatz-gde18v-16', 'Staubsaugeraufsatz', 'Bosch GDE 18V-16', 'Staubabsaugung für Bohrhämmer', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/staubsaugeraufsatz-gde18v-16.jpg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"7WVKE3"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-linienlaser-gll3-80', 'Linienlaser', 'Bosch GLL 3-80', '360° Linienlaser für präzise Ausrichtung', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{"Hersteller":"Bosch","Laserdiode Linie":"630 - 650 nm, < 10mW","Betriebstemperatur":"-10 – 40 °C","Laserklasse":"2","Arbeitsbereich*":"bis zu 30 m","Arbeitsbereich mit Empfänger*":"bis zu 120 m","Nivelliergenauigkeit*":"± 0,3 mm/m","Selbstnivellierbereich":"± 4°","Nivellierzeit":"4 s","Staub- und Spritzwasserschutz":"IP 54","Betriebsdauer, max.":"4 h in 3-Linien-Modus","Stativ-Gewinde":"1/4\", 5/8\"","Gewicht, ca.":"0,82 kg","Farbe Laserlinie":"rot","Projektion":"3 x 360° Linie","Kompatible Laser-Empfänger":"LR 6 + 7"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"61VZOZ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rotationslaser-grl400h', 'Rotationslaser', 'Bosch GRL 400H', 'Rotationslaser bis 400 m Arbeitsbereich für horizontale Nivellierungen.', 'Professioneller Bosch Rotationslaser GRL 400H mit bis zu 400 m Arbeitsbereich (Durchmesser) mit Empfänger. Ideal für horizontale Nivellierarbeiten auf großen Baustellen. Empfänger nicht im Set enthalten.', 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/messtechnik/rotationslaser-grl400h-1.jpeg','/product-images/messtechnik/rotationslaser-grl400h-2.jpeg']::text[], '{"Arbeitsbereich mit Empfänger":"bis zu 400 m (Durchmesser)","Arbeitsbereich ohne Empfänger":"bis zu 20 m (Durchmesser)","Nivelliergenauigkeit":"± 2,4 mm bei 30 m","Selbstnivellierbereich":"± 8 % (± 5°)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY['Empfänger nicht im Set enthalten.','Nivelliergenauigkeit zzgl. einsatzabhängiger Abweichung.']::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"bonn":"LYH46M"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'fliesenschneider-80cm', 'Fliesenschneider 80cm', NULL, 'Profi-Fliesenschneider zum präzisen Schneiden und Trennen von Keramikfliesen.', 'Der Profi-Fliesenschneider eignet sich zum präzisen Schneiden und Trennen von Keramikfliesen. Mit einer maximalen Schnittlänge von 800 mm und einer Schneidleistung bis 14 mm ist er ideal für Fliesen- und Plattenleger.', 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/fliesenschneider/fliesenschneider-80cm-1.jpeg','/product-images/fliesenschneider/fliesenschneider-80cm-2.jpeg','/product-images/fliesenschneider/fliesenschneider-80cm-3.jpeg','/product-images/fliesenschneider/fliesenschneider-80cm-4.jpeg','/product-images/fliesenschneider/fliesenschneider-80cm-5.jpeg']::text[], '{"Schnittlänge max.":"800 mm","Schneidleistung max.":"14 mm","Diagonal-Schnittlänge mit Auflage":"565 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"bonn":"ATIOQF"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-ortungsgeraet-dtect200c', 'Ortungsgerät', 'Bosch D-TECT 200 C', 'Universalortungsgerät für Metall, Holz und Leitungen', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/ortungsgeraet-dtect200c.jpg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"99MVV7"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-ortungsgeraet-gms120', 'Ortungsgerät', 'Bosch GMS 120', 'Multidetektor für Metall und Leitungen', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"FFGU4V"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-bauleuchte-gli18v-2200c', 'Akku Bauleuchte', 'Bosch GLI 18V-2200 C', 'Akku-Bauleuchte mit 2200 Lumen', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/bauleuchte-gli18v-2200c.jpg']::text[], '{"Hersteller":"Bosch","Gewicht exkl. Akku":"1,9 kg","Akkuspannung":"14,4–18 V","Lichtstrom":"2.200 lm","Max. Betriebszeit 14,4 V":"80 min/Ah","Max. Betriebszeit 18 V":"100 min/Ah","Anzahl der Helligkeitsstufen":"2","Verpackungsabmessungen (Breite x Länge x Höhe)":"196 x 332 x 178 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"E282P3"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'einhell-bauleuchte-te-cl18-2000', 'Akku Bauleuchte', 'Einhell TE-CL 18/2000', 'LED-Bauleuchte mit 2000 Lumen', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/einhell-bauleuchte-te-cl18-2000.jpg']::text[], '{"Hersteller":"Bosch","Gewicht exkl. Akku":"1,9 kg","Akkuspannung":"14,4–18 V","Lichtstrom":"2.200 lm","Max. Betriebszeit 14,4 V":"80 min/Ah","Max. Betriebszeit 18 V":"100 min/Ah","Anzahl der Helligkeitsstufen":"2","Verpackungsabmessungen (Breite x Länge x Höhe)":"196 x 332 x 178 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"A8YVVO"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-ladegeraet-gal18v6-80', '6-fach Ladegerät', 'Bosch GAL 18V6-80', 'Schnellladegerät für 6 Akkus gleichzeitig', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"CBQG5R"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'eibenstock-diamantbohrer-ehd1500', 'Diamantbohrer', 'Eibenstock EHD 1500', 'Kernbohrgerät für Beton und Mauerwerk', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/diamantbohrer-ehd1500.jpg','/product-images/werkzeuge/diamantbohrer-gdb180we.jpeg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"I578B5","bonn":"SYBKDJ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bosch-diamantbohrer-gdb180we', 'Diamantbohrer', 'Bosch GDB 180 WE', 'Diamantbohrmaschine für Kernbohrungen bis 180 mm in Beton und Mauerwerk.', 'Die Bosch GDB 180 WE ist eine leistungsstarke Diamantbohrmaschine mit 2.000 W Nenneingangsleistung für Nassbohrungen in Beton und Mauerwerk bis 180 mm. Mit zwei Drehzahlstufen (900/2.800 min⁻¹) und einem Gewicht von nur 5,2 kg eignet sie sich hervorragend für professionelle Kernbohrungen. Die passenden Diamantbohrkronen können im nächsten Schritt ausgewählt werden.', 'werkzeuge',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/werkzeuge/diamantbohrer-gdb180we.jpeg']::text[], '{"Hersteller":"Bosch","Nenneingangsleistung":"2.000 W","Gewicht":"5,2 kg","Leerlaufdrehzahl":"900 / 2.800 min⁻¹","Bohrbereich":"bis 180 mm","Bohrspindelanschlussgewinde":"1 1/4\" UNC","Eignung":"Nassbohren in Beton","Spannung":"230 V","Beton, möglicher Bereich":"180 mm","Mauerwerk, möglicher Bereich":"180 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY['Die passenden Diamantbohrkronen können im nächsten Schritt ausgewählt werden.']::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, TRUE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'mauerschlitzfraese', 'Mauerschlitzfräse', NULL, 'Elektrofräse für Kabelschlitze – bis 45 mm Tiefe und 46 mm Breite.', 'Leistungsstarke Mauerschlitzfräse mit 2.300 W für das Fräsen von Kabelschlitzen in Mauerwerk. Mit einer maximalen Schlitztiefe von 45 mm und Schlitzbreite von 46 mm ideal für Elektroinstallationen. Im Mietpreis sind 2 mm Verschleiß je Diamanttrennscheibe enthalten. Diamanttrennscheiben zum Kauf optional erhältlich.', 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/mauerschlitzfraese.jpeg']::text[], '{"Leistungsaufnahme":"2.300 W","Nennspannung":"230 V","Max. Schlitztiefe":"45 mm","Max. Schlitzbreite":"46 mm","Nenndrehzahl":"4.300 U/min","Leerlaufdrehzahl":"7.500 U/min","Werkzeugaufnahme":"22,2 mm","Scheibendurchmesser":"max. 150 mm","Gewicht":"6,1 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY['Im Mietpreis sind 2 mm Verschleiß je Diamanttrennscheibe enthalten.','Diamanttrennscheiben zum Kauf optional erhältlich.']::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"XUQECL","bonn":"KWUY1N"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'einhell-laubbläser-gp-lb', 'Akku Laubbläser', 'Einhell GP-LB 36/210 Li', 'Akku-Laubbläser mit hoher Blasleistung', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"H9ZZD7"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'einhell-nageler-te-cn', 'Akku Nageler', 'Einhell TE-CN', 'Akku-Nagelpistole für Dachdecker', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/nageler-te-cn.jpg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"TI6BTL"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'einhell-heissluftfoehn-te-ha18li', 'Akku Heißluftföhn', 'Einhell TE-HA 18li', 'Akku-Heißluftgebläse', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"KO8B6L"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'trennschleifer-ts420', 'Benzin-Trennschleifer', 'TS420', 'Benzin-Trennschleifer für Stein und Beton', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/trennschleifer-ts420.jpg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"J83HOT"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'fugenschneider-bs50e', 'Fugenschneider 13PS', 'BS50E', 'Motor: 1-Zylinder-4-Takt-Benzin | 13 PS | E-Start | Max. Trennscheibe: 500 mm | Gewicht: 280 kg', 'Leistungsstarker Fugenschneider mit 13 PS Benzinmotor und Elektro-Start für den professionellen Einsatz. Ideal zum Schneiden von Asphalt, Beton und Frischbeton. Die maximale Trennscheibengröße beträgt 500 mm. Mit regulierbarer Schleiflast (80–200 kg) und einer Schleifgeschwindigkeit von 450 U/min ist das Gerät vielseitig einsetzbar – auch als Schleifmaschine mit 500 mm Schnittbreite.', 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/fugenschneider-bs50e-1.jpg','/product-images/werkzeuge/fugenschneider-bs50e-2.jpg']::text[], '{"Motor":"1-Zylinder-4-Takt-Benzinmotor","Leistung":"13 PS","Startsystem":"Elektro-Start (E-Start)","Max. Trennscheibengröße":"500 mm","Schnittbreite":"500 mm","Einsatzgebiete":"Asphalt, Beton, Frischbeton","Gewicht (ohne Ballast)":"280 kg","Regulierbare Schleiflast":"80 – 200 kg","Schleifgeschwindigkeit":"450 U/min"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"57UXIA","bonn":"RC3QNC"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'betonruettler-ir1000', 'Beton Rüttler 2m', 'IR 1000', 'Innenrüttler für Betonverdichtung', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/betonruettler-ir1000.jpg']::text[], '{"Vibrationsflaschen Durchmesser":"35 mm","Leistung":"230V / 1000 W"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"TXALE6","bonn":"LJ66QJ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'sds-plus-bohrer-meissel-set', 'SDS-Plus Bohrer-/Meißel-Set', NULL, 'Umfangreiches Set für Bohrhämmer', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/werkzeuge/sds-plus-bohrer-meissel-set.jpg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"JHFAVK"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'presslufthammer-tex21pe', 'Presslufthammer 21 kg', 'Atlas Copco TEX 21 PE', 'Presslufthammer 21 kg mit Spitz- und Flachmeißel – ideal für Abbrucharbeiten und Straßenbau.', 'Der Atlas Copco TEX 21 PE ist ein leistungsstarker Presslufthammer mit 21 kg Gewicht und ca. 56 J Schlagenergie. Ideal für Abbruch-, Beton- und Asphaltarbeiten. Inkl. 1× Spitzmeißel und 1× Flachmeißel.

Benötigt einen Baukompressor mit mind. 25 l/s Luftleistung (z. B. unseren 2,5 m³ Baukompressor).', 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/presslufthammer-tex21pe-1.jpeg']::text[], '{"Hersteller":"Atlas Copco","Modell":"TEX 21 PE","Schlagenergie":"ca. 56 J","Schlagzahl bei Nenndrehzahl":"1.140 bpm","Luftverbrauch":"25 l/s","Gewicht":"21 kg","Abmessung (L × B)":"84 × 60 cm","Werkzeugaufnahme":"25 × 108","Lieferumfang":"1× Spitzmeißel, 1× Flachmeißel"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"5M8U7T"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'steinknacker-43cm', 'Steinknacker 43 cm', NULL, 'Steinknacker mit 43 cm Schnittbreite – ideal zum Spalten von Pflastersteinen, Bordsteinen und Klinkern.', 'Der Steinknacker mit 43 cm maximaler Schnittbreite eignet sich ideal zum sauberen Spalten von Pflastersteinen, Bordsteinen, Klinkern und Natursteinen. Mit gehärtetem 4-Schneiden-Messer für langlebige und präzise Ergebnisse.

Schnitthöhe stufenlos einstellbar von 10 bis 350 mm.', 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/steinknacker-43cm-1.png']::text[], '{"Gewicht":"57 kg","Max. Schnittbreite":"430 mm","Min. Schnitthöhe":"10 mm","Max. Schnitthöhe":"350 mm","Messer":"Feststehend, gehärtet, 4 Schneiden"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"8CUFWQ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'schmutzwasserpumpe-11m3h', 'Schmutzwasserpumpe 11m³/h', 'Grindex', 'Tauchpumpe für Schmutzwasser mit bis zu 11.000 l/h Förderleistung – inkl. 15m Storz C Schlauch.', 'Leistungsstarke Schmutzwasserpumpe mit max. 11.000 l/h Fördermenge und 10 m Förderhöhe. Ideal zum Auspumpen von Baugruben, überfluteten Kellern und Schächten. Inkl. 15 m Storz C Schlauch.

900 Watt Motorleistung (max. 1.200 Watt Leistungsaufnahme), 230 V Stromanschluss.', 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/schmutzwasserpumpe-11m3h-1.png']::text[], '{"Hersteller":"Grindex","Max. Förderhöhe":"10 m","Max. Fördermenge":"11.000 l/h","Druckanschluss":"C Schlauch (Storz)","Motorleistung":"900 Watt","Max. Leistungsaufnahme":"1.200 Watt","Drehzahl":"2.800 U/min","Lieferumfang":"inkl. 15 m Storz C Schlauch"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"EGS8ZZ","bonn":"GU1CLE"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'erdrakete-45mm', 'Erdrakete 45 mm', NULL, 'Druckluftbetriebene Erdrakete mit 45 mm Durchmesser – für grabenlose Rohrverlegung unter Wegen, Einfahrten und Fundamenten.', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdrakete-1.jpg']::text[], '{"Durchmesser":"45 mm","Länge":"979 mm","Gewicht":"9 kg","Luftbedarf":"0,35 m³/min","Lastschlagzahl":"530 1/min"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'erdrakete-65mm', 'Erdrakete 65 mm', NULL, 'Druckluftbetriebene Erdrakete mit 65 mm Durchmesser – für grabenlose Rohrverlegung mit höherer Schlagkraft.', NULL, 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdrakete-1.jpg']::text[], '{"Durchmesser":"65 mm","Länge":"1.366 mm","Gewicht":"22,5 kg","Luftbedarf":"ab 0,8 m³/min","Empfohlene Kompressorleistung":"1,20 m³/min","Schlagenergie":"100 J","Schlagfrequenz":"6 Hz","Arbeitsdruck":"7 bar"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'erdrakete-75mm', 'Erdrakete 75 mm', NULL, 'Druckluftbetriebene Erdrakete mit 75 mm Durchmesser – für grabenlose Rohrverlegung mit hoher Schlagkraft. Auf Anfrage.', 'Die Erdrakete 75 mm ist ein leistungsstarkes Bodenverdrängungsgerät für die grabenlose Verlegung von Leerrohren, Kabeln und Hausanschlüssen. Dank hoher Durchschlagskraft und zuverlässiger Vortriebsleistung ist sie flexibel im Rohrleitungsbau einsetzbar – z. B. für die Unterquerung von Straßen, Gebäuden oder Gleisanlagen, für Hausanschlüsse von Gas, Wasser und Glasfaser (FTTH) sowie vertikal für Pfahlgründungen zum Setzen von Schildern und Pfosten.', 'werkzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdrakete-75mm-1.jpg']::text[], '{"Hersteller":"Tracto-Technik","Durchmesser":"75 mm","Länge":"1.465 mm","Gewicht":"34 kg","Luftverbrauch":"1 m³/min"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'akku-kettensaege-gke18v-40', 'Akku Kettensäge GKE 18V-40', NULL, 'Bosch Akku-Kettensäge mit 40cm Schwert', NULL, 'gartenpflege',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/akku-kettensaege-1.jpeg','/product-images/akku-kettensaege-2.jpeg','/product-images/akku-kettensaege-3.jpeg','/product-images/akku-kettensaege-4.jpeg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"JID3OY","bonn":"UWKKF9"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'akku-heckenschere-ghe18v-60', 'Akku Heckenschere GHE 18V-60', NULL, 'Bosch Professional Akku-Heckenschere mit bürstenlosem Motor und Anti-Blocking System für sauberen, kraftvollen Heckenschnitt.', 'Kraftvoller bürstenloser Motor für hohe Leistung und lange Lebensdauer. Schneidet dickere Äste ohne Verklemmen dank des patentierten Bosch Anti-Blocking Systems. Einfache Handhabung durch geringes Gewicht, ergonomisches Design und optimale Balance – ideal für längere Arbeiten.', 'gartenpflege',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{"Hersteller":"Bosch Professional","Modell":"GHE 18V-60","Antrieb":"18V Akku (ProCORE)","Motor":"Bürstenlos (Brushless)","Schwertlänge":"60 cm","Anti-Blocking":"Ja (Bosch ABS)","Gewicht":"ca. 3,6 kg (ohne Akku)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"","bonn":"7I8923"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'unkrautbrenner-gloria-thermoflamm', 'Unkrautbrenner', 'GLORIA Thermoflamm bio Professional PLUS', 'Gas-Unkrautbrenner & Abflammgerät mit 5m Schlauch. Umweltfreundliche Unkrautbeseitigung ohne Chemie durch gezielte Hitzeeinwirkung.', NULL, 'gartenpflege',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{"Hersteller":"GLORIA","Modell":"Thermoflamm bio Professional PLUS","Betrieb":"Gas (Propan/Butan)","Schlauchlänge":"5 m","Methode":"Thermisch (chemiefrei)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"","bonn":"XQOA86"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'freischneider-ps162', 'Benzin-Freischneider', 'PS162', 'Benzin-Freischneider für Dickicht', NULL, 'gartenpflege',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/freischneider-1.jpeg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"86O771","bonn":"UISB2E"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'erdbohrer-benzin', 'Benzin-Erdbohrer', NULL, 'Motorerdbohrer für Zaunpfähle und Pflanzlöcher – Bohrschnecken 100, 150 und 200 mm im Buchungsschritt auswählbar', 'Robuster Benzin-Erdbohrer für Zaunpfähle, Pflanzlöcher, Fundamente und Bodenproben. Im Buchungsprozess können Sie die passende Bohrschnecke direkt mit auswählen – verfügbar in den Durchmessern 100 mm, 150 mm und 200 mm. So erhalten Sie exakt den Lochdurchmesser, den Ihr Vorhaben erfordert (z. B. 100 mm für dünne Zaunpfähle/Erdanker, 150 mm für Standard-Zaunpfosten und Sträucher, 200 mm für Fundamentlöcher und größere Pflanzungen).', 'gartenpflege',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/benzin-erdbohrer-1.jpeg','/product-images/benzin-erdbohrer-2.jpeg']::text[], '{"Bohrschnecken (im Buchungsprozess auswählbar)":"100 mm, 150 mm, 200 mm","Empfehlung 100 mm":"Erdanker, dünne Zaunpfähle, Bodenproben","Empfehlung 150 mm":"Standard-Zaunpfosten, Sträucher, kleinere Pflanzlöcher","Empfehlung 200 mm":"Fundamentlöcher, größere Pflanzungen, Pergolapfosten"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"ZC7HYZ","bonn":"9FJJ7O"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'hochdruckreiniger', 'Hochdruckreiniger', NULL, 'Professioneller Hochdruckreiniger', NULL, 'gartenpflege',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/hochdruckreiniger-1.jpeg']::text[], '{"Leistung":"150 bar - 810 l/h","Schlauchlänge":"5m","Durchflussrate":"‎8.1E+2 Liter pro Stunde","Gewicht":"35 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"V31KWM"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bodenhacke-af1212', 'Benzin Bodenhacke / Gartenfräse 6 PS AF1212', NULL, '4-Takt-Benzinmotor | 4 kW bei 3600 U/min | Arbeitsbreite 360–850 mm | bis zu 6 Fräswerkzeuge', 'Leistungsstarke Benzin-Bodenhacke mit 212 ccm 4-Takt-Motor und 4 kW Leistung. Ideal für die Bodenbearbeitung im Garten – ob Umgraben, Lockern oder Beetvorbereitung. Die Arbeitsbreite lässt sich flexibel von 360 bis 850 mm einstellen, mit bis zu 6 Fräswerkzeugen für effizientes Arbeiten.', 'gartenpflege',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/benzin-bodenhacke-1.jpeg','/product-images/benzin-bodenhacke-2.jpeg']::text[], '{"Motor":"4-Takt-Benzinmotor","Hubraum":"212 ccm","Max. Leistung":"4 kW bei 3600 U/min","Arbeitsbreite":"360–850 mm","Fräswerkzeuge":"bis zu 6"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"Q81RP5","bonn":"1JEK78"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'baumstumpffraese-f360', 'Baumstumpffräse F-360', NULL, 'Einachsige Baumstumpffräse mit Honda GX-390 Motor', 'Einachsige Baumstumpffräse ohne Fahrantrieb mit auf Drehkranz gelagertem Oberteil und 60° Schwenkbereich. Angetrieben vom Honda GX-390 Motor (8,2 kW / 11 PS) mit Seilzugstart. Das Schneidrad mit acht DoublePro-Fräsmessern wird über einen dreifachen Keilriementrieb direkt angetrieben. Betriebsbremse auf beide Räder wirkend, Maschinenbreite 650 mm.', 'gartenpflege',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/baumstumpffraese-f360-1.jpg','/product-images/baumstumpffraese-f360-2.jpeg']::text[], '{"Motor":"Honda GX-390","Leistung":"8,2 kW / 11 PS","Start":"Seilzugstart","Fräsmesser":"8× DoublePro","Antrieb":"Dreifacher Keilriementrieb","Schwenkbereich":"60°","Maschinenbreite":"650 mm","Bauart":"Einachsig, ohne Fahrantrieb","Drehkranz":"Ja, Oberteil gelagert","Bremse":"Betriebsbremse auf beide Räder"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"YJ43UU","bonn":"W4I4YI"}'::jsonb, FALSE, '/downloads/baumstumpffraese-f360-anleitung.pdf',
      NULL, 'https://www.youtube.com/shorts/rqARqFtQB7k', ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'haecksler-axt25tc', 'Elektro-Häcksler', 'Bosch AXT 25 TC', 'Elektro-Häcksler für Gartenabfälle', NULL, 'gartenpflege',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/haecksler-axt-1.jpeg']::text[], '{"Hersteller":"Bosch","Typ":"AXT25TC","Motorleistung":"2.500 W","Anschluss":"230V Schuko","Schneidekapazität max.":"45 mm","Gewicht":"30,500 kg","Extras":"Fangbox mit 53 l"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"XN3IWG","bonn":"3VVG1Y"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'haecksler-ls95-gx', 'Benzin-Häcksler', 'Eliet LS-95 GX', 'Benzin-Häcksler für größere Mengen', 'Der Buschholzhäcksler LS 95/CH zeichnet sich durch hohe Arbeitsleistung und einfache Bauart aus. Angetrieben von einem leistungsstarken Kohler Motor, zerkleinert er Äste bis 7,5 cm Durchmesser zuverlässig. Zwei Zerkleinerungsmesser und eine ortsfeste Gegenschneide sorgen für effizientes Häckseln. Der Messerwechsel ist denkbar einfach – nur Rutsche abkippen. Der Einzug erfolgt automatisch durch das Eigengewicht des Materials. Große Laufräder machen das Manövrieren auch in schwierigem Gelände problemlos.', 'gartenpflege',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/haecksler-ls95-1.jpeg']::text[], '{"Motor":"Kohler Benzinmotor","Max. Astdurchmesser":"7,5 cm","Messer":"2 Zerkleinerungsmesser + Gegenschneide","Einzug":"Automatisch (Gewichtsfluss)","Antrieb":"Keilriementrieb"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"4OEGBK","bonn":"A373OH"}'::jsonb, FALSE, NULL,
      NULL, 'https://www.youtube.com/watch?v=ZRLLsGXfL6I', ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vertikutierer-sa35-vel', 'Vertikutierer SA35-V EL', NULL, 'Elektro-Vertikutierer für Rasenpflege', NULL, 'gartenpflege',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vertikutierer-1.jpeg','/product-images/vertikutierer-2.jpeg']::text[], '{"Hersteller":"Sabo","Typ":"SA35-V EL","Arbeitsbreite":"35 cm","Messersystem":"15 Scheiben/ drei Zähne","Motorleistung":"1.600 W","Anschluss":"230V Schuko","Gewicht":"18,500 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"EP9F7Q","bonn":"BQ4RKS"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vertikutierer-sa38-bv', 'Benzin-Vertikutierer', 'Grizzly BV240', 'Benzin-Vertikutierer für große Flächen', NULL, 'gartenpflege',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vertikutierer-benzin-1.jpeg']::text[], '{"Typ":"BV240","Arbeitsbreite":"38 cm","Messersystem":"15 Scheiben/ drei Zähne","Motorleistung":"2.300 W / 3,1 PS","Tankinhalt":"5 l","Kraftstoff":"Benzin","Gewicht":"37 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"IXDJ8K","bonn":"L3EJDP"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rasenwalze', 'Rasenwalze', NULL, 'Robuste Rasenwalze zum Einebnen und Verdichten von Rasenflächen nach Aussaat oder Verlegung von Rollrasen.', NULL, 'gartenpflege',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{"Typ":"Hand-Rasenwalze","Befüllung":"Wasser oder Sand","Einsatz":"Rasenanlage, Rollrasen, Nachsaat"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"CH522H","bonn":"S3ATTY"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'aggregat-2-8kva', '2,8 kVA Aggregat Ford FG4050', NULL, 'Kompaktes Benzin-Stromaggregat auf Rollen – ideal für kleine Verbraucher. Inkl. 8 Betriebsstunden/Tag.', 'Das Ford FG4050 ist ein kompaktes, rollbares Benzin-Stromaggregat mit 2.800 Watt Spitzenleistung. Mit 15 Liter Tankinhalt erreicht es ca. 5,5 Stunden Laufzeit bei Nennleistung. Inklusive 8 Betriebsstunden pro Tag, Mehrstunden werden mit brutto 8,- € pro Stunde berechnet. Verbrauch wird separat abgerechnet – Rückgabe mit vollem Tank vereinbart, Benzin wird mit brutto 2,80 €/l berechnet.', 'aggregate',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/aggregat-2-8kva-1.jpeg','/product-images/aggregat-2-8kva-2.jpeg']::text[], '{"Hersteller":"Ford","Typ":"FG4050","Spitzenleistung":"2.800 Watt","Dauerleistung":"2.500 Watt","Spannung":"230 V","Anschlüsse":"2x Schuko 16A","Drehzahl":"1.500 U/min","Frequenz":"50 Hz","Gewicht":"ca. 50 kg","Abmessung (LxBxH)":"64 × 47 × 53 cm","Tankinhalt":"15 l","Autonomie":"ca. 5,5 h bei Nennleistung","Kraftstoff":"Benzin","Sonderausstattung":"Auf Rollen"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"Q241BU","bonn":"INO6QP"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'aggregat-7-5kva', '7,5 kVA Aggregat Kärcher PGG 8/3', NULL, 'Leistungsstarkes Stromaggregat mit 7,5 kVA Drehstrom und 2,5 kVA Wechselstrom – ideal für Baustellen und Events.', 'Das Kärcher PGG 8/3 ist ein robustes, rollbares Stromaggregat mit 7,5 kVA Drehstrom- und 2,5 kVA Wechselstromleistung. Dank 25-Liter-Tank erreicht es bis zu 7 Stunden Laufzeit bei Nennleistung. Die Anschlüsse (2x Schuko 16A, 1x CEE 16A 5-polig) decken sowohl Standard- als auch Drehstrombedarf ab.', 'aggregate',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/aggregat-7kva-1.jpeg','/product-images/aggregat-7kva-2.jpeg','/product-images/aggregat-7kva-3.jpeg']::text[], '{"Hersteller":"Kärcher","Typ":"PGG 8/3","Spitzenleistung (Wechselstrom)":"2,5 kVA","Spitzenleistung (Drehstrom)":"7,5 kVA / 7,5 kW","Dauerleistung (Wechselstrom)":"2,5 kVA / 2 kW","Dauerleistung (Drehstrom)":"7,5 kVA / 7 kW","Spannung":"400/230 V","Anschlüsse":"2x Schuko 16A, 1x CEE 16A 5-Pol","Drehzahl":"3.000 U/min","Frequenz":"50 Hz","Gewicht":"ca. 89 kg","Abmessung (LxBxH)":"75 x 71 x 67 cm","Tankinhalt":"25 l","Autonomie":"ca. 7 h bei Nennleistung","Kraftstoff":"Benzin","Zusatzausstattung":"Rollbar"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"59F4T2","bonn":"3PHDI2"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'aggregat-20kva', '20 kVA Aggregat Doosan G20', NULL, 'Leistungsstarkes Diesel-Stromaggregat (EU Stage V) für größere Baustellen und Events – inkl. 8 Betriebsstunden/Tag.', 'Das Doosan G20 ist ein schallgedämmtes Diesel-Stromaggregat mit 20 kVA Spitzenleistung und EU Stage V Emissionsklasse. Mit 181 Liter Tankinhalt erreicht es bis zu 47 Stunden Autonomie bei Nennleistung. Inklusive 8 Betriebsstunden pro Tag, Mehrstunden werden mit brutto 10,- € pro Stunde berechnet. Verbrauch wird separat abgerechnet – Rückgabe mit vollem Tank vereinbart, Diesel wird mit brutto 2,85 €/l berechnet. Optional mit Anhänger verfügbar.', 'aggregate',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/aggregat-20kva-1.jpeg']::text[], '{"Spitzenleistung":"20 kVA","Dauerleistung":"19 kVA / 15,2 kW","Emissionsklasse":"EU Stage V","Batteriespannung":"12 V","Anschlüsse":"2x Schuko 16A, 1x CEE 32A 5-Pol","Drehzahl":"1.500 U/min","Frequenz":"50 Hz","Gewicht":"ca. 1.003 kg","Abmessung (LxBxH)":"187 × 82 × 149,5 cm","Tankinhalt":"181 l","Autonomie":"ca. 47 h bei Nennleistung","Kraftstoff":"Diesel","Zusatzausstattung":"Optional mit Anhänger"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"CGYRQH","bonn":"GMKLML"}'::jsonb, FALSE, '/manuals/doosan-g20-g30-g40-betriebsanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'aggregat-50kva', '50 kVA Aggregat Doosan G50', NULL, 'Leistungsstarkes Diesel-Stromaggregat (EU Stage V) mit 60 kVA Spitzenleistung – für große Baustellen und Veranstaltungen.', 'Das Doosan G50 ist ein schallgedämmtes Diesel-Stromaggregat mit 60 kVA Spitzenleistung und EU Stage V Emissionsklasse. Der 176-Liter-Tank ermöglicht ca. 35 Stunden Autonomie bei 75 % Last. Verbrauch wird separat abgerechnet – Rückgabe mit vollem Tank vereinbart, Diesel wird mit brutto 2,85 €/l berechnet. Optional mit Anhänger verfügbar.', 'aggregate',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/aggregat-50kva-1.jpeg']::text[], '{"Spitzenleistung":"60 kVA","Dauerleistung":"50 kVA / 24 kW","Emissionsklasse":"EU Stage V","Batteriespannung":"12 V","Anschlüsse":"2x Schuko 16A, 1x CEE 16A 5-Pol, 1x CEE 32A 5-Pol","Drehzahl":"1.500 U/min","Frequenz":"50 Hz","Gewicht":"ca. 2.061 kg","Abmessung (LxBxH)":"187 × 82 × 149,5 cm","Tankinhalt":"176 l","Autonomie":"ca. 35 h bei 75 % Last","Kraftstoff":"Diesel","Zusatzausstattung":"Optional mit Anhänger"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"RDRWAR"}'::jsonb, FALSE, '/manuals/doosan-g20-g30-g40-betriebsanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'aggregat-100kva', '100 kVA Aggregat Doosan G100 auf PKW-Anhänger', NULL, 'Leistungsstarkes Diesel-Stromaggregat (EU Stage V) mit 120 kVA Spitzenleistung auf PKW-Anhänger – für Großbaustellen und Events.', 'Das Doosan G100 ist ein schallgedämmtes Diesel-Stromaggregat mit 120 kVA Spitzenleistung und EU Stage V Emissionsklasse, montiert auf einem PKW-Anhänger. Der 176-Liter-Tank ermöglicht ca. 11 Stunden Autonomie bei 75 % Last. Verbrauch wird separat abgerechnet – Rückgabe mit vollem Tank vereinbart. Diesel wird mit brutto 2,85 €/l berechnet, AdBlue mit brutto 1,45 €/l.', 'aggregate',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/aggregat-100kva-1.jpeg']::text[], '{"Spitzenleistung":"120 kVA","Dauerleistung":"100 kVA / 80 kW","Emissionsklasse":"EU Stage V","Batteriespannung":"12 V","Anschlüsse":"2x Schuko 16A, 1x CEE 32A 5-Pol, 1x CEE 63A 5-Pol, 1x CEE 125A 5-Pol","Drehzahl":"1.500 U/min","Frequenz":"50 Hz","Gewicht Aggregat":"ca. 2.061 kg","Gewicht inkl. Anhänger":"ca. 2.400 kg","Abmessung (LxBxH)":"187 × 82 × 149,5 cm","Tankinhalt":"176 l","Autonomie":"ca. 11 h bei 75 % Last","Kraftstoff":"Diesel"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"E7TNYQ"}'::jsonb, FALSE, '/manuals/doosan-g20-g30-g40-betriebsanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'aggregat-80kva', '80 kVA Aggregat Doosan G80', NULL, 'Leistungsstarkes Diesel-Stromaggregat (EU Stage V) mit 90 kVA Spitzenleistung – für große Baustellen und Veranstaltungen.', 'Das Doosan G80 ist ein schallgedämmtes Diesel-Stromaggregat mit 90 kVA Spitzenleistung und EU Stage V Emissionsklasse. Der 176-Liter-Tank ermöglicht ca. 11 Stunden Autonomie bei 75 % Last. Verbrauch wird separat abgerechnet – Rückgabe mit vollem Tank vereinbart, Diesel wird mit brutto 2,85 €/l berechnet. Optional mit Anhänger verfügbar.', 'aggregate',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/aggregat-80kva-1.jpeg']::text[], '{"Spitzenleistung":"90 kVA","Dauerleistung":"80 kVA / 64 kW","Emissionsklasse":"EU Stage V","Batteriespannung":"12 V","Anschlüsse":"2x Schuko 16A, 1x CEE 32A 5-Pol, 1x CEE 63A 5-Pol, 1x CEE 125A 5-Pol","Drehzahl":"1.500 U/min","Frequenz":"50 Hz","Gewicht":"ca. 2.061 kg","Abmessung (LxBxH)":"187 × 82 × 149,5 cm","Tankinhalt":"176 l","Autonomie":"ca. 11 h bei 75 % Last","Kraftstoff":"Diesel","Zusatzausstattung":"Optional mit Anhänger"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"H8WHKV"}'::jsonb, FALSE, '/manuals/doosan-g20-g30-g40-betriebsanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'akkupack-bluetti', 'Bluetti Akkupack 1152 Wh', NULL, 'Tragbare Powerstation mit 1.800 W Maximalleistung – ideal für Baustellen ohne Stromanschluss, Events und Outdoor-Einsätze.', 'Die Bluetti Powerstation bietet 1.152 Wh Kapazität und bis zu 1.800 W Ausgangsleistung. Vielseitige Anschlüsse (Schuko, USB-A, USB-C, 12V DC) ermöglichen die gleichzeitige Versorgung verschiedener Geräte. Perfekt als mobile Stromversorgung auf Baustellen, bei Veranstaltungen oder im Outdoor-Bereich.', 'aggregate',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/akkupack-bluetti-1.png']::text[], '{"Kapazität":"1.152 Wh","Max. Leistung":"1.800 W","Anschlüsse":"2x Schuko, 4x USB-A, 1x USB-C, 1x 12V DC","Telefon aufladen (10 Wh)":"ca. 115 Mal","Laptop aufladen (60 Wh)":"ca. 20 Mal"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"7NPRPK"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kompressor-5m3', '4m³ Kompressor', NULL, 'Kompressor inkl. Generator – Doosan 7/45, 4m³/min Volumenstrom, 6 kVA Generator 400V/230V – inkl. 8 Betriebsstunden/Tag.', 'Kompressor inkl. Generator – auf Fahrgestell.

inkl. 8 Betriebsstunden/Tag, Mehrstunden werden mit brutto 10,-€ pro Std. berechnet.
zzgl. Verbrauch, Tankfüllung je Mietgerät – Rückgabe des Mietgeräts mit vollgetanktem Tank vereinbart. Diesel wird mit brutto 2,85€/l berechnet.', 'aggregate',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/kompressor-5m3-1.jpeg','/product-images/kompressor-5m3-2.jpeg']::text[], '{"Marke":"Doosan","Typ":"7/45","Volumenstrom":"4m³/min","Max. Druck":"6,8 bar","Emissionsklasse":"EU Stage V","Batteriespannung":"12 V","Anschlüsse":"3x","Drehzahl":"1500 U/min","Gewicht":"ca. 680 kg","Tankinhalt":"58 l","Kraftstoff":"Diesel","Abgasnorm":"Stage V","Zusatzausstattung":"auf Fahrgestell","Generator":"6 kVA 400V/230V"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"4UGSQN","bonn":"","muelheim":""}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kompressor-1-2m3-stationaer', '1,2 m³ Kompressor (stationär)', NULL, 'Stationärer Elektro-Kompressor mit Siemens-Motor (7,5 kW / 400 V) – kompakt, robust und vielseitig einsetzbar.', 'Vielseitig, zuverlässig und leicht mitzunehmen: Unser stationärer Kleinkompressor passt auf die kleinste Ladefläche und meistert mit seinem Siemens-Qualitätsmotor und dem äußerst schlagfesten PE-Gehäuse klaglos jeden Einsatz. Ideal für Druckluftwerkzeuge, Erdraketen und mobile Baustellenanwendungen mit 400 V Stromanschluss (32 A Absicherung erforderlich).', 'aggregate',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/kompressor-1-2m3-1.jpeg','/product-images/kompressor-1-2m3-2.webp']::text[], '{"Motor":"Siemens Elektromotor (400 V / 7,5 kW)","Absicherung":"32 A erforderlich","Volumenstrom bei 7 bar":"1,2 m³/min","Volumenstrom bei 10 bar":"1,0 m³/min","Volumenstrom bei 13 bar":"0,85 m³/min","Anschluss Druckluft":"1× G 1/2\"","Gewicht":"187 kg","Bauart":"stationär, PE-Gehäuse"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, TRUE, NULL,
      'https://www.kaeser.com/de-de/shortinstructions/mobilair-m13', NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kompressor-2m3-bobcat-pa72', '2 m³ Kompressor', 'Bobcat PA7.2', 'Mobiler Bau-Kompressor (Diesel) mit 2,0 m³/min bei 7 bar – ideal für Druckluftwerkzeuge und Erdraketen auf der Baustelle.', 'Der Bobcat PA7.2 ist ein robuster, mobiler Bau-Kompressor mit 2,0 m³/min Liefermenge bei 7 bar Betriebsdruck. Angetrieben von einem 3-Zylinder Kubota D1005 Dieselmotor (17,5 kW, Stage V) eignet er sich ideal für den Antrieb von Presslufthämmern, Aufbruchhämmern, Stampfern, Sandstrahlgeräten und Erdraketen. Auf einem straßenzulassungsfähigen Einachs-Fahrgestell mit zentralem Hebepunkt, Kraftstoff-/Wasserabscheider und Stützrad – einfach zu transportieren und schnell einsatzbereit.', 'aggregate',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/kompressor-2m3-1.png']::text[], '{"Hersteller":"Bobcat","Modell":"PA7.2","Liefermenge (FAD)":"2,0 m³/min","Betriebsdruck":"7,0 bar","Motor":"Kubota D1005 (3 Zylinder, Diesel)","Motorleistung":"17,5 kW","Drehzahl":"3.000 U/min","Kühlung":"Wasser","Tankinhalt":"26 l","Emissionsklasse":"EU Stage V","Leergewicht":"ca. 430 kg","Betriebsgewicht":"ca. 445 kg","Max. zul. Gewicht":"750 kg","Abmessungen (L × B × H)":"2.611 × 1.272 × 1.130 mm","Fahrgestell":"Einachs-Anhänger mit Stützrad"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, TRUE, '/manuals/datenblatt-bobcat-kompressor-pa7-2.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kompressor-5m3-bobcat-pa75', '5 m³ Kompressor', 'Bobcat PA7.5', 'Mobiler Bau-Kompressor (Diesel) mit 5,0 m³/min bei 6,8 bar – Stage V, leistungsstark für mehrere Druckluftwerkzeuge gleichzeitig.', 'Der Bobcat PA7.5 ist ein leistungsstarker mobiler Bau-Kompressor mit 5,0 m³/min Liefermenge bei 6,8 bar Betriebsdruck. Angetrieben von einem 4-Zylinder Yanmar 4TNV88C Dieselmotor (35,5 kW, Stage V, wassergekühlt) eignet er sich ideal für den parallelen Betrieb mehrerer Presslufthämmer, Aufbruchhämmer, Sandstrahlgeräte und größerer Erdraketen. Auf einem straßenzulassungsfähigen Einachs-Fahrgestell mit zentralem Hebepunkt, Kraftstoff-/Wasserabscheider, Auffangwanne (110 % Fluid Containment) und Stützrad – einfach zu transportieren und schnell einsatzbereit.', 'aggregate',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/kompressor-5m3-bobcat-1.png']::text[], '{"Hersteller":"Bobcat","Modell":"PA7.5","Liefermenge (FAD)":"5,0 m³/min","Betriebsdruck":"6,8 bar","Motor":"Yanmar 4TNV88C (4 Zylinder, Diesel)","Motorleistung":"35,5 kW","Drehzahl":"3.000 U/min","Kühlung":"Wasser","Tankinhalt":"58 l","Emissionsklasse":"EU Stage V","Schallleistungspegel":"98 dB(A)","Leergewicht":"ca. 660 kg","Betriebsgewicht":"ca. 705 kg","Max. zul. Gewicht":"750 kg","Abmessungen (L × B × H)":"3.475 × 1.410 × 1.350 mm","Fahrgestell":"Einachs-Anhänger mit Stützrad, LED-Beleuchtung (13-pol.)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, TRUE, '/manuals/datenblatt-bobcat-kompressor-pa7-5.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'presslufthammer-tex21pe-aggregat', 'Presslufthammer 21 kg', 'Atlas Copco TEX 21 PE', 'Presslufthammer 21 kg mit Spitz- und Flachmeißel – benötigt Baukompressor.', 'Der Atlas Copco TEX 21 PE ist ein leistungsstarker Presslufthammer mit 21 kg Gewicht und ca. 56 J Schlagenergie. Ideal für Abbruch-, Beton- und Asphaltarbeiten. Inkl. 1× Spitzmeißel und 1× Flachmeißel.

Benötigt einen Baukompressor mit mind. 25 l/s Luftleistung (z. B. unseren 2,5 m³ Baukompressor).', 'aggregate',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/presslufthammer-tex21pe-1.jpeg']::text[], '{"Hersteller":"Atlas Copco","Modell":"TEX 21 PE","Schlagenergie":"ca. 56 J","Schlagzahl bei Nenndrehzahl":"1.140 bpm","Luftverbrauch":"25 l/s","Gewicht":"21 kg","Abmessung (L × B)":"84 × 60 cm","Werkzeugaufnahme":"25 × 108","Lieferumfang":"1× Spitzmeißel, 1× Flachmeißel"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"5M8U7T"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'erdrakete-45mm-aggregat', 'Erdrakete 45 mm', NULL, 'Druckluftbetriebene Erdrakete mit 45 mm Durchmesser – für grabenlose Rohrverlegung unter Wegen, Einfahrten und Fundamenten.', 'Die Erdrakete 45 mm ist ein kompaktes, druckluftbetriebenes Bodenverdrängungsgerät für die grabenlose Verlegung von Leerrohren und Kabeln. Mit nur 9 kg Gewicht und 45 mm Durchmesser eignet sie sich ideal für kleine Durchführungen unter Gehwegen, Einfahrten und Fundamenten – ohne den Belag aufzureißen.', 'aggregate',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdrakete-1.jpg']::text[], '{"Durchmesser":"45 mm","Länge":"979 mm","Gewicht":"9 kg","Luftbedarf":"0,35 m³/min","Lastschlagzahl":"530 1/min"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'erdrakete-65mm-aggregat', 'Erdrakete 65 mm', NULL, 'Druckluftbetriebene Erdrakete mit 65 mm Durchmesser – für grabenlose Rohrverlegung mit höherer Schlagkraft.', 'Die Erdrakete 65 mm ist ein leistungsstarkes Bodenverdrängungsgerät für die grabenlose Verlegung von Leerrohren, Kabeln und Wasserleitungen. Mit 100 Joule Schlagenergie und 65 mm Durchmesser durchdringt sie auch härtere Böden zuverlässig. Empfohlene Kompressorleistung: 1,20 m³/min.', 'aggregate',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdrakete-1.jpg']::text[], '{"Durchmesser":"65 mm","Länge":"1.366 mm","Gewicht":"22,5 kg","Luftbedarf":"ab 0,8 m³/min","Empfohlene Kompressorleistung":"1,20 m³/min","Schlagenergie":"100 J","Schlagfrequenz":"6 Hz","Arbeitsdruck":"7 bar"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'erdrakete-75mm-aggregat', 'Erdrakete 75 mm', NULL, 'Druckluftbetriebene Erdrakete mit 75 mm Durchmesser – für grabenlose Rohrverlegung mit hoher Schlagkraft. Auf Anfrage.', 'Die Erdrakete 75 mm ist ein leistungsstarkes Bodenverdrängungsgerät für die grabenlose Verlegung von Leerrohren, Kabeln und Hausanschlüssen. Dank hoher Durchschlagskraft und zuverlässiger Vortriebsleistung ist sie flexibel im Rohrleitungsbau einsetzbar – z. B. für die Unterquerung von Straßen, Gebäuden oder Gleisanlagen, für Hausanschlüsse von Gas, Wasser und Glasfaser (FTTH) sowie vertikal für Pfahlgründungen zum Setzen von Schildern und Pfosten.', 'aggregate',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdrakete-75mm-1.jpg']::text[], '{"Hersteller":"Tracto-Technik","Durchmesser":"75 mm","Länge":"1.465 mm","Gewicht":"34 kg","Luftverbrauch":"1 m³/min"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'scherenbuehne-8m', '7,8 m Scherenarbeitsbühne elektro (Typ ZS0607)', NULL, 'Kompakte elektrische Scherenarbeitsbühne von Zoomlion mit 7,80 m Arbeitshöhe – ideal für Indoor- und Outdoor-Einsätze.', 'Die Zoomlion ZS0607AC-Li ist eine kompakte, elektrische Scherenarbeitsbühne mit 7,80 m Arbeitshöhe und 0,91 m Plattformausschub. Mit Non-Marking-Reifen ist sie für den Innen- und Außeneinsatz geeignet. Die Plattform (1,65 × 0,74 m) bietet Platz für bis zu 2 Personen bei einer maximalen Traglast von 230 kg. Die Durchfahrtshöhe von nur 1,79 m (Geländer eingeklappt) ermöglicht den Zugang durch niedrige Durchfahrten.', 'arbeitsbuehnen',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/scherenbuehne-zs0607-1.jpg']::text[], '{"Hersteller":"Zoomlion","Typ":"ZS0607AC-Li","Arbeitshöhe":"7,80 m","Plattformausschub":"0,91 m","Antrieb":"Batterie (Lithium)","Reifen":"Non-Marking","Max. Traglast Plattform":"230 kg","Plattformgröße (L × B)":"1,65 × 0,74 m","Fahrzeuglänge":"1,85 m","Fahrzeugbreite":"0,76 m","Durchfahrtshöhe (Geländer eingeklappt)":"1,79 m"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      'ab 40 €', NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"TQ7BOF","bonn":"M4H2CP"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'scherenbuehne-12m', '11,8 m Scherenarbeitsbühne elektro (Typ ZS1012)', NULL, 'Elektrische Scherenbühne mit 11,80 m Arbeitshöhe und 1 m Plattformausschub – für bis zu 3 Personen.', 'Die Zoomlion ZS1012AC ist eine kompakte, elektrische Scherenarbeitsbühne mit 11,80 m Arbeitshöhe und 1 m Plattformausschub. Mit Non-Marking-Reifen ist sie ideal für den Inneneinsatz geeignet. Die Plattform (2,30 × 1,12 m) bietet Platz für bis zu 3 Personen bei einer maximalen Traglast von 350 kg. Die Transporthöhe von nur 2 m ermöglicht den Zugang durch Standardtore.', 'arbeitsbuehnen',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/scherenbuehne-zs1012ac-1.png']::text[], '{"Typ":"ZS1012AC","Arbeitshöhe":"11,80 m","Plattformbodenhöhe":"9,80 m","Plattformausschub":"1 m","Steigfähigkeit":"25 %","Antrieb":"Batterie","Reifen":"Non-Marking","Max. Traglast Plattform":"350 kg","Max. Personen":"3","Plattformgröße (L × B)":"2,30 × 1,12 m","Fahrzeuglänge":"2,29 m","Fahrzeugbreite":"1,15 m","Fahrzeughöhe":"2,53 m","Transporthöhe":"2 m","Gesamtgewicht":"2.930 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      'ab 55 €', NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"G98ORG","bonn":"ADYTHS"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'mastbuehne-11m', '11,2 m Teleskop-Mastarbeitsbühne elektro (Typ ZMP09J)', NULL, 'Kompakte elektrische Mastbühne mit 11,20 m Arbeitshöhe und 3,23 m Reichweite – 230 V Anschluss im Korb.', 'Die Zoomlion ZMP09J ist eine kompakte, elektrische Mastbühne mit 11,20 m Arbeitshöhe und 3,23 m seitlicher Reichweite. Die hohe Überbrückungshöhe von 7,75 m ermöglicht das Arbeiten über Hindernisse hinweg. Mit Non-Marking-Reifen ist sie für den Innen- und Außeneinsatz geeignet. Die Plattform (0,99 × 0,76 m) bietet Platz für 2 Personen bei einer Traglast von 200 kg. Zusatzausstattung: 230 V Anschluss im Korb.', 'arbeitsbuehnen',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/mastbuehne-zmp09-1.png','/product-images/mastbuehne-zmp09-2.png','/product-images/mastbuehne-zmp09-3.avif']::text[], '{"Typ":"ZMP09J","Arbeitshöhe":"11,20 m","Plattformbodenhöhe":"9,20 m","Max. Reichweite":"3,23 m","Steigfähigkeit":"25 %","Überbrückungshöhe":"7,75 m","Antrieb":"Batterie","Reifen":"Non-Marking","Zusatzausstattung":"230 V Anschluss im Korb","Max. Traglast Plattform":"200 kg","Max. Personen":"2","Plattformgröße (L × B)":"0,99 × 0,76 m","Fahrzeuglänge":"2,70 m","Fahrzeugbreite":"1,00 m","Fahrzeughöhe":"1,99 m","Gesamtgewicht":"2.950 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      'ab 75 €', NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"JQJ2PS","bonn":"AN9D7X"}'::jsonb, FALSE, '/documents/Datenblatt-Mastbuehne-ZMP09J.pdf',
      NULL, 'https://www.youtube.com/watch?v=9n7ZX-l6Nhg', ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'gelenkteleskopsteiger-12m', '12m Gelenkteleskopsteiger Nifty HR12L', NULL, 'Elektrischer Gelenkteleskopsteiger mit 12,10 m Arbeitshöhe und 6,40 m Reichweite – Non-Marking-Reifen für Indoor/Outdoor.', 'Der Nifty HR12L ist ein kompakter, elektrisch angetriebener Gelenkteleskopsteiger mit 12,10 m Arbeitshöhe und 6,40 m seitlicher Reichweite. Die Überbrückungshöhe von 4,10 m ermöglicht das Arbeiten über Hindernisse hinweg. Mit Non-Marking-Reifen ist er für den Innen- und Außeneinsatz geeignet. Die Plattform (1,20 × 0,85 m) bietet Platz für 2 Personen bei einer Traglast von 200 kg.', 'arbeitsbuehnen',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/gelenkteleskop-hr12l-1.jpeg','/product-images/gelenkteleskop-hr12l-2.jpeg','/product-images/gelenkteleskop-hr12l-3.jpeg']::text[], '{"Typ":"HR12L","Arbeitshöhe":"12,10 m","Plattformbodenhöhe":"10,10 m","Max. Reichweite":"6,40 m","Steigfähigkeit":"25 %","Überbrückungshöhe":"4,10 m","Antrieb":"Batterie","Reifen":"Non-Marking","Max. Traglast Plattform":"200 kg","Max. Personen":"2","Plattformgröße (L × B)":"1,20 × 0,85 m","Fahrzeuglänge":"3,97 m","Fahrzeugbreite":"1,79 m","Fahrzeughöhe":"1,98 m","Gesamtgewicht":"2.540 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      'ab 90 €', NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"XL1WVX"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'anhaengerbuehne-18m', '18m Gelenk- Teleskop-Anhängerarbeitsbühne elektro/benzin', NULL, 'Gelenkteleskop-Anhängerbühne mit 18 m Arbeitshöhe und 10,50 m Reichweite – inkl. 8 Betriebsstunden/Tag.', 'Die EuropeLIFT TM18GTi ist eine benzinbetriebene Gelenkteleskop-Anhängerbühne mit 18 m Arbeitshöhe und bis zu 10,50 m seitlicher Reichweite. Der Korb bietet Platz für 2 Personen (max. 220 kg bei 8 m bzw. 100 kg bei 11 m Reichweite). Zusatzausstattung: 230 V und Druckluft-Anschluss im Korb. Inklusive 8 Betriebsstunden pro Tag, Mehrstunden werden mit brutto 22,- € pro Stunde berechnet. Verbrauch wird separat abgerechnet – Rückgabe mit vollem Tank vereinbart, Diesel wird mit brutto 2,85 €/l berechnet.', 'arbeitsbuehnen',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anhaengerbuehne-tm18gti-1.jpeg','/product-images/anhaengerbuehne-tm18gti-2.jpeg','/product-images/anhaengerbuehne-tm18gti-3.jpeg','/product-images/anhaengerbuehne-tm18gti-4.jpeg','/product-images/anhaengerbuehne-tm18gti-5.jpeg']::text[], '{"Typ":"TM18GTi","Arbeitshöhe":"18 m","Plattformbodenhöhe":"16 m","Korbarmlänge":"1,30 m","Max. Reichweite":"10,50 m","Max. Korblast":"8 m / 220 kg | 11 m / 100 kg","Max. Personen":"2","Steigfähigkeit":"25 %","Überbrückungshöhe":"6 m","Antrieb":"Benzin","Zusatzausstattung":"230 V / Druckluft im Korb","Plattformgröße (L × B)":"1,20 × 0,80 m","Stützbreite":"3,85 m","Fahrzeuglänge":"6,10 m","Fahrzeugbreite":"1,65 m","Fahrzeughöhe":"2,10 m","Gesamtgewicht":"2.070 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      'ab 130 €', NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"32EVXI","bonn":"32EVXI"}'::jsonb, FALSE, '/documents/Datenblatt-Anhaengerbuehne-TM18GTi.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'stampfer-gs72-xh', 'Stampfer GS72-XH 72kg', NULL, 'Vibrationsstampfer mit 72 kg Gewicht und 14 kN Verdichtungsdruck – inkl. 8 Betriebsstunden/Tag.', 'Der GS72-XH ist ein kompakter Vibrationsstampfer mit 72 kg Gewicht und 14 kN Verdichtungsdruck. Ideal für Gräben, Engstellen und schwer zugängliche Bereiche. Verdichtungstiefe ca. 30 cm. Inklusive 8 Betriebsstunden pro Tag, Mehrstunden werden mit brutto 4,50 € pro Stunde berechnet. Benzin (95) wird mit brutto 2,85 €/l berechnet – Rückgabe mit vollem Tank.', 'verdichtung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/stampfer-gs72xh-1.jpeg']::text[], '{"Typ":"GS72-XH","Gewicht":"72 kg","Plattengröße (L × B)":"ca. 29 × 29 cm","Verdichtungsdruck":"14 kN","Motorleistung":"2,7 kW / 3,7 PS","Kraftstoffinhalt":"2,7 l","Kraftstoffart":"Benzin (95)","Vorschub":"25 m/min","Verdichtungstiefe":"ca. 30 cm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      72, NULL, '{"krefeld":"DNXDNX","bonn":"XZA2I2"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ruettelplatte-vp1550w', 'Rüttelplatte VP 15/50W 97kg', 'Baumax VP 15/50W', 'Vorwärtslaufende Baumax Rüttelplatte mit 97 kg Gewicht, 14 kN Zentrifugalkraft und integriertem Wassertank mit Sprinkleranlage zur Staubbindung.', 'Die Baumax VP 15/50W ist eine vorwärtslaufende Rüttelplatte mit 97 kg Betriebsgewicht und 14 kN Zentrifugalkraft. Charakteristisch ist die integrierte Sprinkleranlage mit Wassertank zur Befeuchtung der Grundplatte – ideal bei der Verdichtung von Asphalt und Pflasterflächen, damit kein Material an der Platte haftet. Mit 500 × 500 mm Grundplatte, 105 Hz Vibrationsfrequenz und bis zu 600 m²/h Flächenleistung deckt sie typische Garten-, Wege- und kleinere Tiefbau-Arbeiten ab. Der luftgekühlte 1-Zylinder Loncin Benzinmotor (196 cm³, 4,8 kW) startet per Reversierstarter und verbraucht ca. 0,9 l/h aus dem 3,5-Liter-Tank. Klappbarer Führungsbügel und integrierte Räder erleichtern den Transport. Hinweis: Der Wassertank versorgt ausschließlich die Sprinkleranlage – der Motor selbst ist luftgekühlt.', 'verdichtung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/ruettelplatte-vp1550w-1.png','/product-images/ruettelplatte-vp1550w-2.png','/product-images/ruettelplatte-vp1550w-3.png']::text[], '{"Marke":"Baumax","Typ":"VP 15/50W","Maschinenart":"Rüttelplatte vorwärtslaufend","Betriebsgewicht":"97 kg","Grundplattengröße (B × L)":"500 × 500 mm","Zentrifugalkraft":"14 kN","Frequenz":"105 Hz","Arbeitsgeschwindigkeit max.":"20 m/min","Flächenleistung max.":"600 m²/h","Steigfähigkeit max.":"25 %","Erregersystem":"vorwärtslaufend","Wassertank / Sprinkleranlage":"Ja – zur Staubbindung","Motor":"1-Zylinder, 4-Takt OHV, luftgekühlt","Motorhersteller":"Loncin","Hubraum":"196 cm³","Motorleistung max.":"4,8 kW","Kraftstoff":"Benzin","Kraftstoffinhalt":"3,5 l","Kraftstoffverbrauch":"0,9 l/h","Startsystem":"Reversierstarter","Kraftübertragung":"Fliehkraftkupplung / Keilriemen","Arbeitshöhe (Unterfahrhöhe)":"540 mm","Höhe Führungsgriff (Arbeitsposition)":"920 mm","Maschinenlänge (Arbeitsposition)":"1.100 mm","Maschinenlänge (Transportposition)":"720 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      'ab 29 €', NULL, NULL, NULL,
      97, NULL, '{"bonn":"IHTL3N"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ruettelplatte-vp16-44', 'Rüttelplatte VP 16/44 105kg', NULL, 'Vorwärts-Rüttelplatte mit 105 kg Gewicht und 20 kN Verdichtungsdruck – inkl. Rollgestell.', 'Die VP 16/44 ist eine kompakte Vorwärts-Rüttelplatte mit 105 kg Gewicht und 20 kN Verdichtungsdruck. Inkl. Rollgestell zum praktikablen Transport. Verdichtungstiefe ca. 20 cm.', 'verdichtung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/ruettelplatte-vp1644-1.jpeg','/product-images/ruettelplatte-vp1644-2.jpeg']::text[], '{"Typ":"VP 16/44","Gewicht":"105 kg","Plattengröße (L × B)":"ca. 55 × 44 cm","Verdichtungsdruck":"20 kN","Motorleistung":"4,8 kW","Kraftstoffinhalt":"3,5 l","Kraftstoffart":"Benzin (95)","Vorschub":"25 m/min","Vibrationsstöße":"4.200 vpm","Verdichtungstiefe":"ca. 20 cm","Zubehör":"Rollgestell inkl."}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      105, NULL, '{"krefeld":"N71PUB","bonn":"4KI9AM"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ruettelplatte-vp25-50', 'Rüttelplatte VP 25/50 130kg', NULL, 'Vorwärts-Rüttelplatte mit 130 kg Gewicht und 25 kN Verdichtungsdruck – inkl. Rollgestell und 8 Betriebsstunden/Tag.', 'Die VP 25/50 ist eine Vorwärts-Rüttelplatte mit 130 kg Gewicht und 25 kN Verdichtungsdruck. Inkl. Rollgestell zum praktikablen Transport. Verdichtungstiefe ca. 25 cm. Inklusive 8 Betriebsstunden pro Tag, Mehrstunden werden mit brutto 4,50 € pro Stunde berechnet. Benzin (95) wird mit brutto 2,85 €/l berechnet – Rückgabe mit vollem Tank.', 'verdichtung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/ruettelplatte-vp2550-1.jpeg','/product-images/ruettelplatte-vp2550-2.jpeg']::text[], '{"Typ":"VP 25/50","Gewicht":"130 kg","Plattengröße (L × B)":"ca. 59 × 49 cm","Verdichtungsdruck":"25 kN","Motorleistung":"4,8 kW","Kraftstoffinhalt":"3,5 l","Kraftstoffart":"Benzin (95)","Vorschub":"25 m/min","Vibrationsstöße":"4.200 vpm","Verdichtungstiefe":"ca. 25 cm","Zubehör":"Rollgestell inkl."}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      'ab 19 €', NULL, NULL, NULL,
      130, NULL, '{"krefeld":"MWQG3Q","bonn":"8I2GX3"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ruettelplatte-hvp30-50', 'Rüttelplatte HVP 30/50 175kg reversierbar', NULL, 'Hydraulisch reversierbare Rüttelplatte mit 175 kg Gewicht und 30 kN Verdichtungsdruck – inkl. 8 Betriebsstunden/Tag.', 'Die HVP 30/50 ist eine hydraulisch reversierbare Rüttelplatte mit 175 kg Gewicht und 30 kN Verdichtungsdruck. Mit stufenloser hydraulischer Umschaltung der Fahrtrichtung ist sie besonders wendig und effizient. Verdichtungstiefe ca. 30 cm. Inklusive 8 Betriebsstunden pro Tag, Mehrstunden werden mit brutto 4,50 € pro Stunde berechnet. Benzin (95) wird mit brutto 2,85 €/l berechnet – Rückgabe mit vollem Tank.', 'verdichtung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/ruettelplatte-hvp3050-1.jpeg']::text[], '{"Typ":"HVP 30/50","Gewicht":"175 kg","Plattengröße (L × B)":"ca. 70 × 50 cm","Verdichtungsdruck":"30 kN","Motorleistung":"4,8 kW","Kraftstoffinhalt":"3,5 l","Kraftstoffart":"Benzin (95)","Vorschub":"25 m/min","Verdichtungstiefe":"ca. 30 cm","Umschaltung":"Stufenlos hydraulisch"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      'ab 29 €', NULL, NULL, NULL,
      175, NULL, '{"krefeld":"371IBO","bonn":"DKAF58"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ruettelplatte-hvp38-60', 'Rüttelplatte HVP 38/60 247kg reversierbar', NULL, 'Hydraulisch reversierbare Rüttelplatte mit 247 kg Gewicht und 38 kN Verdichtungsdruck – inkl. 8 Betriebsstunden/Tag.', 'Die HVP 38/60 ist eine hydraulisch reversierbare Rüttelplatte mit 247 kg Gewicht und 38 kN Verdichtungsdruck. Mit stufenloser hydraulischer Umschaltung der Fahrtrichtung besonders effizient. Verdichtungstiefe ca. 30 cm. Inklusive 8 Betriebsstunden pro Tag, Mehrstunden werden mit brutto 6,50 € pro Stunde berechnet. Benzin (95) wird mit brutto 2,85 €/l berechnet – Rückgabe mit vollem Tank.', 'verdichtung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/ruettelplatte-hvp3860-1.jpeg']::text[], '{"Typ":"HVP 38/60","Gewicht":"247 kg","Plattengröße (L × B)":"ca. 70 × 60 cm","Verdichtungsdruck":"38 kN","Motorleistung":"4,8 kW","Kraftstoffinhalt":"5,5 l","Kraftstoffart":"Benzin (95)","Vorschub":"25 m/min","Verdichtungstiefe":"ca. 30 cm","Umschaltung":"Stufenlos hydraulisch"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      'ab 39 €', NULL, NULL, NULL,
      247, NULL, '{"krefeld":"5B9HL3","bonn":"OYOWC6"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ruettelplatte-hvp50-60', 'Rüttelplatte HVP 50/60 420kg reversierbar', NULL, 'Hydraulisch reversierbare Rüttelplatte mit 420 kg Gewicht und 50 kN Verdichtungsdruck – inkl. 8 Betriebsstunden/Tag.', 'Die HVP 50/60 ist eine leistungsstarke hydraulisch reversierbare Rüttelplatte mit 420 kg Gewicht und 50 kN Verdichtungsdruck. Dank stufenlos hydraulischer Umschaltung der Fahrtrichtung ist sie besonders effizient auf großen Flächen und bei schweren Verdichtungsarbeiten. Verdichtungstiefe ca. 45 cm.

Inkl. 8 Betriebsstunden pro Tag, Mehrstunden werden mit brutto 8,50 € pro Stunde berechnet.

Benzin (95) wird mit brutto 2,85 €/l berechnet – Rückgabe mit vollem Tank.', 'verdichtung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/ruettelplatte-hvp5060-1.jpg']::text[], '{"Typ":"HVP 50/60","Gewicht":"420 kg","Plattengröße (L × B)":"ca. 90 × 60 cm","Verdichtungsdruck":"50 kN","Motorleistung":"4,8 kW","Kraftstoffinhalt":"6,5 l","Kraftstoffart":"Benzin (95)","Vorschub":"23 m/min","Verdichtungstiefe":"ca. 45 cm","Umschaltung":"Stufenlos hydraulisch"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      420, NULL, '{"krefeld":"BYTF4N"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'grabenwalze-bmp8500', '1,5t Grabenwalze', 'Bomag BMP 8500', 'Ferngesteuerte Grabenwalze mit 1,5 t Betriebsgewicht und Doppelerregersystem – ECOMODE, Kombifernsteuerung Kabel/Funk.', 'Die Bomag BMP 8500 ist eine leistungsstarke ferngesteuerte Grabenwalze mit 1,5 t Betriebsgewicht. Dank Kombifernsteuerung (Kabel/Funk) und ECOMODE arbeitet sie effizient und sicher in Gräben, an Böschungen und in engen Bereichen.

Ausstattung:
• Hydrostatische Knicklenkung, wartungsfrei
• Kombifernsteuerung Kabel/Funk mit 2 Akkus
• Doppelerregersystem mit Richtschwinger
• Zwei Fahrgeschwindigkeitsstufen & 2 Amplituden
• Intelligent Vibration Control (IVC)
• BOMAG Operator Safety System
• Automatische Motorabschaltung bei seitlichem Kippwinkel >40°
• Easy Service Concept mit Diagnosemodul
• Vollschutzhauben aus hochschlagfestem Verbundwerkstoff
• Abschließbare Motorhaube und Armaturenabdeckung', 'verdichtung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/verdichtung/grabenwalze-bmp8500-1.webp','/product-images/verdichtung/grabenwalze-bmp8500-2.webp']::text[], '{"Hersteller":"Bomag","Modell":"BMP 8500","Betriebsgewicht":"ca. 1.500 kg","Lenkung":"Hydrostatische Knicklenkung, wartungsfrei","Fernsteuerung":"Kombifernsteuerung Kabel/Funk","Erregersystem":"Doppelerregersystem mit Richtschwinger","Fahrgeschwindigkeit":"2 Stufen","Amplituden":"2","Vibrationskontrolle":"Intelligent Vibration Control (IVC)","Sicherheit":"BOMAG Operator Safety System, Abschaltautomatik bei Ölmangel, Motorabschaltung >40° Kippwinkel","Starter":"Elektrostarter","Service":"Easy Service Concept mit Diagnosemodul & Fehlercodeanzeige"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-16a-uv-3xschuko', 'CEE 16A UV auf 3x 16A Schuko', NULL, 'mit 16 A CEE-Eingang und 3 Schutzkontakt-Ausgängen', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/cee-16a-uv-3x-schuko-1.jpeg']::text[], '{"Produktmaße":"165 x 190 x 85 mm","Eingang":"CEE 16A","Ausgänge":"3x 16A Schuko","Max. Strom":"3 x 16 A","Schutzart":"IP44"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"69PG1T","bonn":"7LPFYE"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-32a-uv-6xschuko', 'CEE 32A UV auf 6x 16A Schuko', NULL, 'Verteiler CEE 32A auf 6x Schuko', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/cee-32a-uv-6x-schuko-1.jpeg']::text[], '{"Produktmaße":"465 x 165 x 125 mm","Gewicht":"4,5 kg","Eingangsspannung":"380V, 32A","Eingangsanschluss":"CEE, 32A, 5-polig","Stromausgabe":"6 x 230V, 32A","Ausgangsanschluss":"Schuko","Sicherungen":"6 x C-16"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"KYB943"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-63a-uv-2x32a-1x16a-6xschuko', 'CEE 63A UV auf 2x CEE 32A, 1x CEE 16A, 6x Schuko', NULL, 'Vollgummiverteiler mit CEE 63A Eingang, 2x CEE 32A, 1x CEE 16A und 6x Schuko Ausgängen', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/cee-63a-uv-2x32a-1x16a-6xschuko-1.webp']::text[], '{"Produktmaße":"48,3 x 31 x 13,35 cm","Gewicht":"8,15 kg","Spannungsversorgung":"380–400V AC, 50Hz","Eingang":"CEE 63A 5-pol Stecker","Ausgänge":"2x CEE 32A, 1x CEE 16A, 6x Schuko 16A","FI-Schutz":"Typ A 63A/0,03A 4-pol","Bauart":"Vollgummiverteiler"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"H5YEKN"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-63a-uv-2x32a-2x16a', 'CEE 63A UV auf 2x CEE 32A, 2x CEE 16A', NULL, '19"-Rackeinbau Stromverteiler (3 HE) mit CEE 63A Eingang, 2x CEE 32A und 2x CEE 16A Ausgängen, FI Typ B 63A', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/cee-63a-uv-2x32a-2x16a-1.jpeg']::text[], '{"Produktmaße":"48,3 x 31 x 13,35 cm","Gewicht":"8,15 kg","Spannungsversorgung":"380–400V AC, 50Hz","Stromanschluss":"CEE 63A 5-pol, 5x16mm² H07RN-F, 1 m","Stromausgang":"2x CEE 32A + 2x CEE 16A 5-pol","Absicherung":"FI Typ B 63A/0,03A, 2x C16A + 2x C32A 3-pol","Phasenpräsenzanzeige":"3","Gehäuse":"19\" Rackeinbau 3 HE"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"42SR2E"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'anschlussverteilerschrank-44kva', 'Anschlussverteilerschrank 44kVA', NULL, 'Anschlußleistung 44 kVA mit einem Zählerfeld', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/anschlussverteilerschrank-44kva-1.jpeg','/product-images/anschlussverteilerschrank-44kva-2.jpeg','/product-images/anschlussverteilerschrank-44kva-3.jpeg']::text[], '{"Anschlußleistung":"44 kVA","Produktmaße":"1270 x 710 x 360 mm","Gewicht":"49 kg","Gehäuse":"Stahlblech, verzinkt und orange pulverbeschichtet","Standgestell":"Feuerverzinkt","Prüfung":"Stückgeprüft"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"2EKAZB"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'endverteilerschrank-22kva-ev32', 'Endverteilerschrank 22 kVA – EV32 Typ B', NULL, 'Mobiler Baustromverteiler / Endverteilerschrank EV32 Typ B mit 22 kVA Anschlussleistung – ideal für Baustromversorgung, Veranstaltungen und Industrie. Ausgestattet mit allstromsensitiven FI-Schutzschaltern Typ B (2× 40 A / 0,03 A), 32 A Phasenwender-Zuleitung sowie 1× CEE 32 A, 2× CEE 16 A und 6× 230 V Schutzkontakt-Steckdosen. Robustes verzinktes und orange pulverbeschichtetes Stahlblechgehäuse mit feuerverzinktem Standgestell – stückgeprüft nach VDE.', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/endverteiler-ev32-1.jpg','/product-images/endverteiler-ev32-2.jpg','/product-images/endverteiler-ev32-3.jpg']::text[], '{"Typ":"EV32 – Typ B","Anschlussleistung":"22 kVA","Stromaufnahme / Zuleitung":"32 A – 400 V CEE (Phasenwender)","CEE-Steckdosen 400 V/6h":"1× 32 A + 2× 16 A (5-polig)","Schutzkontaktsteckdosen":"6× 230 V / 16 A","FI-Schutzschalter":"2× 40 A / 0,03 A – Typ B (allstromsensitiv)","Gehäuse":"Stahlblech, verzinkt und orange pulverbeschichtet","Standgestell":"Feuerverzinkt","Transportmaße (B×H×T)":"670 × 1060 × 360 mm","Transportgewicht":"39 kg","Verarbeitung":"Hochwertige Verdrahtung & Steckvorrichtungen, stückgeprüft"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"CIRWT3","bonn":"ZA2THI"}'::jsonb, FALSE, '/manuals/datenblatt-endverteiler-ev32.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'endverteilerschrank-44kva-ev63', 'Endverteilerschrank 44 kVA – EV63 Typ B', NULL, 'Mobiler Baustromverteiler / Endverteilerschrank EV63 Typ B mit 44 kVA Anschlussleistung – ideal für große Baustellen, Veranstaltungen, Industrie und Eventstromversorgung. Ausgestattet mit allstromsensitivem FI Typ B (63 A / 0,03 A) plus zusätzlichem FI 40 A, 63 A CEE-Phasenwender-Zuleitung sowie 2× CEE 32 A, 2× CEE 16 A und 6× 230 V Schutzkontakt-Steckdosen. Robustes verzinktes und orange pulverbeschichtetes Stahlblechgehäuse mit feuerverzinktem Standgestell – stückgeprüft nach VDE.', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/endverteiler-ev63-1.png','/product-images/endverteiler-ev63-2.jpg','/product-images/endverteiler-ev63-3.webp']::text[], '{"Typ":"EV63 – Typ B","Anschlussleistung":"44 kVA","Stromaufnahme / Zuleitung":"63 A – 400 V CEE (Phasenwender)","CEE-Steckdosen 400 V/6h":"2× 32 A + 2× 16 A (5-polig)","Schutzkontaktsteckdosen":"6× 230 V / 16 A","FI-Schutzschalter":"1× 63 A / 0,03 A – Typ B (allstromsensitiv), 1× 40 A","Gehäuse":"Stahlblech, verzinkt und orange pulverbeschichtet","Standgestell":"Feuerverzinkt","Transportmaße (B×H×T)":"670 × 1060 × 360 mm","Transportgewicht":"45 kg","Verarbeitung":"Hochwertige Verdrahtung & Steckvorrichtungen, stückgeprüft"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"4VXWR6"}'::jsonb, FALSE, '/manuals/datenblatt-endverteiler-ev63.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'hauptverteilerschrank-86kva-hv125', 'Hauptverteilerschrank 86 kVA – HV125 Typ B', NULL, 'Mobiler Hauptverteilerschrank / Baustromverteiler HV125 Typ B mit 86 kVA Anschlussleistung – ideal als Hauptverteilung für Großbaustellen, Industrie, Festivals und Großveranstaltungen. Zuleitung wahlweise über 125 A CEE oder 10 mm² Kabelschuhe (Direktanschluss). Ausgestattet mit allstromsensitivem FI Typ B (63 A / 0,03 A) und zusätzlichem FI 40 A, 1× CEE 63 A, 3× CEE 32 A, 3× CEE 16 A sowie 6× 230 V Schutzkontakt-Steckdosen. Robustes verzinktes und orange pulverbeschichtetes Stahlblechgehäuse mit feuerverzinktem Standgestell, schwenkbare Kranöse und Tragegriff mit 90°-Winkelstopp – stückgeprüft nach VDE.', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/hauptverteiler-hv125-1.png']::text[], '{"Typ":"HV125 – Typ B","Anschlussleistung":"86 kVA","Stromaufnahme / Zuleitung":"125 A – 400 V CEE oder 10 mm² Kabelschuhe","CEE-Steckdosen 400 V/6h":"1× 63 A + 3× 32 A + 3× 16 A (5-polig)","Schutzkontaktsteckdosen":"6× 230 V / 16 A","FI-Schutzschalter":"1× 63 A / 0,03 A – Typ B (allstromsensitiv), 1× 40 A","Gehäuse":"Stahlblech, verzinkt und orange pulverbeschichtet","Standgestell":"Feuerverzinkt","Handling":"Schwenkbare Kranöse, Tragegriff mit 90°-Winkelstopp","Transportmaße (B×H×T)":"840 × 1330 × 480 mm","Transportgewicht":"90 kg","Verarbeitung":"Hochwertige Verdrahtung & Steckvorrichtungen, stückgeprüft"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"DI55LU"}'::jsonb, FALSE, '/manuals/datenblatt-hauptverteiler-hv125.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-kabel-16a-3m', 'CEE Kabel 16A rot 3 m', NULL, '3 m Verlängerungskabel mit Stecker und Kupplung, Kabel-Typ: H07RN-F5G2,5 – 16A rot', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/cee-kabel-16a-rot-3m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"3 m","Gewicht":"1,5 kg","Kabel-Typ":"H07RN-F5G2,5 – 16A rot"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"SYZ3UO"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-kabel-16a-5m', 'CEE Kabel 16A rot 5 m', NULL, '5 m Verlängerungskabel mit Stecker und Kupplung, Kabel-Typ: H07RN-F5G2,5 – 16A rot', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/cee-kabel-16a-rot-5m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"5 m","Gewicht":"2,2 kg","Kabel-Typ":"H07RN-F5G2,5 – 16A rot"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"WT1HNO"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-kabel-16a-10m', 'CEE Kabel 16A rot 10 m', NULL, '10 m Verlängerungskabel mit Stecker und Kupplung, Kabel-Typ: H07RN-F5G2,5 – 16A rot', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/cee-kabel-16a-rot-10m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"10 m","Gewicht":"3,9 kg","Kabel-Typ":"H07RN-F5G2,5 – 16A rot"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"8AMCNG","bonn":"FZV4QW"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-kabel-16a-20m', 'CEE Kabel 16A rot 20 m', NULL, '20 m Verlängerungskabel mit Stecker und Kupplung, Kabel-Typ: H07RN-F5G2,5 – 16A rot', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/cee-kabel-16a-rot-20m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"20 m","Gewicht":"7,3 kg","Kabel-Typ":"H07RN-F5G2,5 – 16A rot"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"G9R37U","bonn":"G9R37U"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-kabel-32a-3m', 'CEE Kabel 32A rot 3 m', NULL, '3 m Verlängerungskabel mit Stecker und Kupplung, Kabel-Typ: H07RN-F5G6 – 32A rot', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/cee-kabel-32a-rot-3m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"3 m","Gewicht":"2,4 kg","Kabel-Typ":"H07RN-F5G6 – 32A rot"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"O35O9Y"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-kabel-32a-5m', 'CEE Kabel 32A rot 5 m', NULL, '5 m Verlängerungskabel mit Stecker und Kupplung, Kabel-Typ: H07RN-F5G6 – 32A rot', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/cee-kabel-32a-rot-5m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"5 m","Gewicht":"3,6 kg","Kabel-Typ":"H07RN-F5G6 – 32A rot"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"V2T7GR"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-kabel-32a-10m', 'CEE Kabel 32A rot 10 m', NULL, '10 m Verlängerungskabel mit Stecker und Kupplung, Kabel-Typ: H07RN-F5G6 – 32A rot', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/cee-kabel-32a-rot-10m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"10 m","Gewicht":"6,8 kg","Kabel-Typ":"H07RN-F5G6 – 32A rot"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"EHGMP8"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-kabel-32a-20m', 'CEE Kabel 32A rot 20 m', NULL, '20 m Verlängerungskabel mit Stecker und Kupplung, Kabel-Typ: H07RN-F5G6 – 32A rot', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/cee-kabel-32a-rot-20m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"20 m","Gewicht":"13,1 kg","Kabel-Typ":"H07RN-F5G6 – 32A rot"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"NBGVF6","bonn":"9L9EQZ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-kabel-32a-50m', 'CEE Kabel 32A rot 50 m', NULL, '50 m Verlängerungskabel mit Stecker und Kupplung, Kabel-Typ: H07RN-F5G6 – 32A rot', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/cee-kabel-32a-rot-50m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"50 m","Gewicht":"7,3 kg","Kabel-Typ":"H07RN-F5G6 – 32A rot"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"RSBH8K"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-kabel-63a-3m', 'CEE Kabel 63A rot 3 m', NULL, '3 m Verlängerungskabel mit Stecker und Kupplung, Kabel-Typ: H07RN-F5G16 – 63A rot', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/cee-kabel-63a-rot-3m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"3 m","Gewicht":"4,5 kg","Kabel-Typ":"H07RN-F5G16 – 63A rot"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"WCJ8MZ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-kabel-63a-5m', 'CEE Kabel 63A rot 5 m', NULL, '5 m Verlängerungskabel mit Stecker und Kupplung, Kabel-Typ: H07RN-F5G16 – 63A rot', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/cee-kabel-63a-5m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"5 m","Gewicht":"7 kg","Kabel-Typ":"H07RN-F5G16 – 63A rot"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"GIX1D1"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-kabel-63a-10m', 'CEE Kabel 63A rot 10 m', NULL, '10 m Verlängerungskabel mit Stecker und Kupplung, Kabel-Typ: H07RN-F5G16 – 63A rot', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/cee-kabel-63a-rot-10m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"10 m","Gewicht":"14,5 kg","Kabel-Typ":"H07RN-F5G16 – 63A rot"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"D41R65"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-kabel-63a-20m', 'CEE Kabel 63A rot 20 m', NULL, '20 m Verlängerungskabel mit Stecker und Kupplung, Kabel-Typ: H07RN-F5G16 – 63A rot', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','muelheim']::text[], ARRAY['/product-images/cee-kabel-63a-rot-20m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"20 m","Gewicht":"29 kg","Kabel-Typ":"H07RN-F5G16 – 63A rot"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"756WGG"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'schukokabel-3m', 'Schukokabel 3 m', NULL, '3 m Verlängerungskabel mit Stecker und Kupplung, Typ: H07RN-F3G2,5 – 16A', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/schukokabel-3m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"3 m","Gewicht":"ca. 1,2 kg","Kabel-Typ":"H07RN-F3G2,5 – 16A"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"QRRDMQ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'schukokabel-5m', 'Schukokabel 5 m', NULL, '5 m Verlängerungskabel mit Stecker und Kupplung, Typ: H07RN-F3G2,5 – 16A', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/schukokabel-5m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"5 m","Gewicht":"ca. 1,7 kg","Kabel-Typ":"H07RN-F3G2,5 – 16A"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"7J5K6A"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'schukokabel-10m', 'Schukokabel 10 m', NULL, '10 m Verlängerungskabel mit Stecker und Kupplung, Typ: H07RN-F3G2,5 – 16A', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/schukokabel-10m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"10 m","Gewicht":"ca. 2,9 kg","Kabel-Typ":"H07RN-F3G2,5 – 16A"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"I17TOM"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'schukokabel-20m', 'Schukokabel 20 m', NULL, '20 m Verlängerungskabel mit Stecker und Kupplung, Typ: H07RN-F3G2,5 – 16A', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/schukokabel-20m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"20 m","Gewicht":"ca. 5,2 kg","Kabel-Typ":"H07RN-F3G2,5 – 16A"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"S6AL9G"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'schuko-kabeltrommel-50m', 'Schuko-Kabeltrommel 50m', NULL, '50 m Verlängerungskabel auf Trommel, Typ: H07RN-F3G2,5 – 16A', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/schuko-kabeltrommel-50m-1.jpeg']::text[], '{"Marke":"Mennekes / Titanex","Kabellänge":"50 m","Gewicht":"ca. 5,2 kg","Kabel-Typ":"H07RN-F3G2,5 – 16A"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"HV6W8A"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-adapter-16a-32a', 'Mennekes CEE Adapter 16A < > 32A', NULL, 'CEE Adapter 16A Stecker rot auf 32A Kupplung rot', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/cee-adapter-16a-32a-1.jpeg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"7B35BP"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-adapter-32a-63a', 'Mennekes CEE Adapter 32A < > 63A', NULL, 'CEE Adapter 32A Stecker rot auf 63A Kupplung rot', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/cee-adapter-32a-63a-1.jpeg']::text[], '{"Marke":"Mennekes","Input":"CEE 32A Stecker rot","Output":"CEE 63A Kupplung rot"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"WBHW1T"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-adapter-32a-16a', 'CEE Adapter 32A < > 16A', NULL, 'CEE Adapter 32A Stecker auf 16A Kupplung', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/cee-adapter-32a-16a-1.jpeg']::text[], '{"Input":"CEE 32A Stecker rot","Output":"CEE 16A Kupplung rot"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-adapter-63a-32a-sicherung', 'Mennekes CEE Adapter 63A < > 32A inkl. Sicherung', NULL, 'CEE Adapter 63A Stecker rot auf 32A Kupplung rot, inkl. Leitungsschutzschalter 3-pol. C-32A, 6kA', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/cee-adapter-63a-32a-1.jpeg']::text[], '{"Marke":"Mennekes","Input":"CEE 63A Stecker rot","Output":"CEE 32A Kupplung rot","Sicherung":"Leitungsschutzschalter 3-pol. C-32A, 6kA"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"G8HMB1"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'cee-adapter-schuko-16a', 'Mennekes CEE Adapter Schuko < > 16A (b)', NULL, 'Schuko Adapter Schuko 16A Stecker auf 16A Kupplung blau', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/cee-adapter-schuko-16a-1.jpeg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"IC7B9S"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'erdungsspiess-1-5m', 'Erdungsspieß 1,5m mit 3m Leitung', NULL, 'Erdungs-Anschlussleitung 16mm², flexible Verbindungsleitung H07V-K grün-gelb. Zur Verbindung von Erdungspunkten mit ortveränderlichen Einrichtungen wie Baustromverteiler, Notstromaggregaten, Fahrzeugen etc.', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/erdungsspiess-1-5m-1.jpeg']::text[], '{"Erdungsspieß":"1,5 m","Leitungslänge":"3 m","Querschnitt":"16 mm²","Leitung":"H07V-K grün-gelb","Kabelschuh":"8 mm / 10 mm Lochdurchmesser"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"SB6Z2F"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ethercon-kabel-3m-cat7', 'Major EtherCon Kabel 3 m, Cat 7', NULL, '3 m Cat6a Netzwerkkabel', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/ethercon-cat7-3m-1.jpeg']::text[], '{"Marke":"Major","Kabellänge":"3 m","Kategorie":"Cat 7"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"UDHP5O"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ethercon-kabel-20m-cat5e', 'Major EtherCon Kabel Cat-5e 20m', NULL, '20 m Cat-5e Netzwerkkabel', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/ethercon-cat5e-20m-1.jpeg']::text[], '{"Marke":"Major","Kabellänge":"20 m","Kategorie":"Cat-5e"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"A7BAWQ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ethercon-kabel-25m-cat5e', 'Major EtherCon Kabel Cat-5e 25m', NULL, '25 m Cat-5e Netzwerkkabel', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/ethercon-cat5e-25m-1.jpeg']::text[], '{"Marke":"Major","Kabellänge":"25 m","Kategorie":"Cat-5e"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"OQ3ZBU"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'ethercon-kabel-50m-cat5e', 'Major EtherCon Kabeltrommel Cat-5e 50m', NULL, '50 m Netzwerkkabel auf Schill GT310 Trommel', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/ethercon-cat5e-50m-1.jpeg','/product-images/ethercon-cat5e-50m-2.jpeg']::text[], '{"Marke":"Major","Kabellänge":"50 m","Trommel":"Schill GT310"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"AN298G"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'netzwerkkabel-30m-cat7', 'Major Netzwerkkabel Cat-7 30m', NULL, '30 m Cat-7 Netzwerkkabel', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/netzwerkkabel-cat7-30m-1.jpeg']::text[], '{"Marke / Hersteller":"Major","Kabellänge":"30 m"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"T7E3LU"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'netzwerkkabel-2m-cat5e', 'Major Netzwerkkabel Cat-5e 2m', NULL, '2 m Cat-5e Netzwerkkabel', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/netzwerkkabel-cat5e-2m-1.jpeg']::text[], '{"Marke":"Major","Kabellänge":"2 m","Kategorie":"Cat-5e"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"72BNF6"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'netzwerkkabel-5m-cat5e', 'Major Netzwerkkabel Cat-5e 5m', NULL, '5 m Cat-5e Netzwerkkabel', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/netzwerkkabel-cat5e-5m-1.jpeg']::text[], '{"Marke":"Major","Kabellänge":"5 m"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"F76J8U"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'netzwerkkabel-20m-cat5e', 'Major Netzwerkkabel Cat-5e 20 m', NULL, '20 m Cat-5e Netzwerkkabel', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/netzwerkkabel-cat5e-20m-1.jpeg']::text[], '{"Marke":"Major","Kabellänge":"20 m","Kategorie":"Cat-5e"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"SUYKRA"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'hdmi-glasfaser-35m', 'HDMI Glasfaser Kabel 35m', NULL, 'HDMI über Glasfaser 35m', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/hdmi-glasfaser-35m-1.png']::text[], '{"Marke":"Kramer","Kabellänge":"35 m"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"HLQOB5"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'powercon-linkkabel-1-5m', 'PowerCon Link Cable 1,5 m', NULL, 'Neutrik / Titanex – Link Cable H07RN-F3G2,5 – 16A, ca. 0,4 kg', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/powercon-linkkabel-1-5m-1.jpeg']::text[], '{"Marke":"Neutrik / Titanex","Typ":"H07RN-F3G2,5 – 16A","Kabellänge":"1,5 m","Gewicht":"ca. 0,4 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"792P5K"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'powercon-linkkabel-5m', 'PowerCon Link Cable 5 m', NULL, '5 m Link Cable, Typ: H07RN-F3G2,5 – 16A', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/powercon-linkkabel-5m-1.jpeg']::text[], '{"Marke":"Neutrik / Titanex","Kabellänge":"5 m","Gewicht":"ca. 1,2 kg","Kabel-Typ":"H07RN-F3G2,5 – 16A"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"JV8JSU"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'powercon-hybrid-linkkabel-3m', 'PowerCon Hybrid Link Cable 3 m', NULL, 'PowerCon & XLR Hybrid Link Cable, 3 m', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/powercon-hybrid-linkkabel-3m-1.jpeg']::text[], '{"Marke":"Neutrik / Titanex","Anschlüsse":"PowerCon & XLR","Kabellänge":"3 m","Gewicht":"ca. 1,9 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"6TZVSR"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'powercon-true1-linkkabel-3m', 'PowerCon TRUE1 Top Link Cable 3 m', NULL, '3 m Link Cable, Kabel-Typ: H07RN-F3G2,5 – 16A', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/titanex-powercon-true1-3m-1.jpeg']::text[], '{"Marke":"Neutrik / Titanex","Kabellänge":"3 m","Gewicht":"ca. 0,7 kg","Kabel-Typ":"H07RN-F3G2,5 – 16A"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"4EWYOO"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'powercon-true1-linkkabel-5m', 'PowerCon TRUE1 Top Linkkabel 5 m', NULL, 'Neutrik / Titanex – 5 m Linkkabel H07RN-F3G2,5 – 16A, ca. 1,3 kg', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/powercon-true1-linkkabel-5m-1.jpeg']::text[], '{"Marke":"Neutrik / Titanex","Typ":"H07RN-F3G2,5 – 16A","Kabellänge":"5 m","Gewicht":"ca. 1,3 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"9BNX8U"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'titanex-powercon-true1-10m', 'Titanex PowerCon TRUE1 Top Link Cable 10 m', NULL, '10 m Link Cable, Kabel-Typ: H07RN-F3G2,5 – 16A', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/titanex-powercon-true1-10m-1.jpeg']::text[], '{"Marke":"Neutrik / Titanex","Kabellänge":"10 m","Gewicht":"ca. 3,5 kg","Kabel-Typ":"H07RN-F3G2,5 – 16A"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"8X5N7T"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'titanex-powercon-true1-5m', 'Titanex PowerCon TRUE1 Top Link Cable 5 m', NULL, 'Neutrik / Titanex – 5 m Link Cable H07RN-F3G2,5 – 16A, ca. 1,7 kg', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/titanex-powercon-true1-5m-1.jpeg']::text[], '{"Marke":"Neutrik / Titanex","Typ":"H07RN-F3G2,5 – 16A","Kabellänge":"5 m","Gewicht":"ca. 1,7 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"PK9M65"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'titanex-speakon-y-adapter', 'Titanex Speakon Y-Adapter', NULL, 'NL4 auf 1x NL2 (1+-) & 1x NL2 (2+-)', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/speakon-y-adapter-1.jpeg']::text[], '{"Marke":"Titanex","Kabellänge":"0,5 m","Anschluss":"NL4 auf 1x NL2 (1+-) & 1x NL2 (2+-)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"97DSP4"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'defender-micro-2', 'Defender Micro 2 Kabelbrücke', NULL, 'Kabelbrücke mit 2 Kabelkanälen, Typ 535-5', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/defender-micro-2-1.jpeg','/product-images/defender-micro-2-2.avif']::text[], '{"Typ":"535-5","Kabelkanäle":"2","Länge":"100 cm","Breite":"28 cm","Höhe":"4,5 cm","Achslast (max)":"2 t","Brandschutzklasse":"B2"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"4QXW6T"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'defender-midi-5', 'Defender Midi 5 Kabelbrücke', NULL, 'Kabelbrücke Typ 535-5 mit 5 Kabelkanälen, max. Achslast 5 t, Brandschutzklasse B2', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/defender-midi-5-1.jpeg','/product-images/defender-midi-5-2.jpeg']::text[], '{"Typ":"535-5","Kabelkanäle":"5","Länge":"80 cm","Breite":"90 cm","Höhe":"0,5 cm","Achslast (max)":"5 t","Brandschutzklasse":"B2"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"6BWU5U"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'office-kabelbruecke-1m', 'Office Kabelbrücke black 1m', NULL, 'Kabelbrücke mit 4 Kanälen für die Innenanwendung', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/office-kabelbruecke-1m-1.jpeg','/product-images/office-kabelbruecke-1m-2.jpeg']::text[], '{"Kanäle":"4","Länge":"1 m","Anwendung":"Innenbereich"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"YESZ5H"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'office-kabelbruecke-2m', 'Office Kabelbrücke black 2m', NULL, 'Kabelbrücke mit Kanälen für die Innenanwendung, 2 m Länge', NULL, 'kabel-stromverteiler',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/office-kabelbruecke-2m-1.jpeg','/product-images/office-kabelbruecke-2m-2.jpeg']::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"4IJ1SS"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'stehleiter-hailo-l60-6stufen', 'Hailo L60 – 6 Stufen', NULL, 'Alu-Stehleiter mit 5 Stufen, standfest und leicht. Geeignet für Innen- und Außenarbeiten.', NULL, 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/hailo-l60-6stufen.jpeg']::text[], '{"Stufenanzahl":"5","Leiterlänge":"1,90 m","Plattformhöhe":"1,28 m","Material":"Aluminium","Max. Belastung":"150 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"7HKFN5","bonn":"K5IH5O"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'mehrzweckleiter-3x12', 'Mehrzweckleiter 3×12 Sprossen', NULL, 'Vielseitige Aluminium-Mehrzweckleiter mit 3×12 Sprossen – einsetzbar als Stehleiter, Anlegeleiter oder Schiebeleiter. Ideal für Arbeiten auf unterschiedlichen Höhen.', NULL, 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/mehrzweckleiter-3x12-1.jpeg']::text[], '{"Sprossen":"3 × 12","Leiterlänge":"3,47 m","Höhe angelegt":"7,95 m","Höhe eingefahren":"3,5 m","Material":"Aluminium"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"7XT9BR","bonn":"V5ZJYP"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'leiter-kaiserthal-l50-5-stufen', 'Leiter Kaiserthal L50 – 5 Stufen', NULL, 'Aluminium-Stehleiter Kaiserthal L50 mit 5 Stufen und ergonomischem Haltebügel. Kompakt und stabil – ideal für Arbeiten im Innenbereich auf mittlerer Höhe.', NULL, 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/leiter-kaiserthal-l50-5-stufen-1.jpeg']::text[], '{"Stufen":"5","Leiterlänge":"1,75 m","Plattformhöhe":"1,02 m","Belastbarkeit":"150 kg","Material":"Aluminium"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"7I1HQL","bonn":"GQKKRB"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rollgeruest-krause-3-3m', 'Rollgerüst – 3,3 m Arbeitshöhe (2,00 × 1,20 m)', NULL, 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 1,20 m und 3,3 m Arbeitshöhe. Ideal für Innenarbeiten. Höhenverstellbare Fahrrollen Ø 150 mm für sicheren Stand auf unebenem Untergrund.', NULL, 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/rollgeruest-3-3m-2x1-2m-1.jpeg']::text[], '{"Arbeitshöhe":"3,3 m","Gerüsthöhe":"2,3 m","Standhöhe":"1,3 m","Arbeitsfläche":"2,00 × 1,20 m","Fahrrollen":"Ø 150 mm, höhenverstellbar (220–335 mm)","Material":"Aluminium"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"FSQFEL"}'::jsonb, FALSE, '/manuals/krause-rollgeruest-stabilo-serie-10-50-aufbauanleitung.pdf',
      NULL, 'https://www.youtube.com/watch?v=5tqZPFwN02c', ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rollgeruest-krause-breitaufbau-4-4m', 'Rollgerüst Breitaufbau – 4,4 m Arbeitshöhe', NULL, 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 1,50 m und 4,4 m Arbeitshöhe. TÜV-geprüft nach DIN EN 1004-1. Das selbstsichernde KRAUSE-Verriegelungssystem ermöglicht einen einfachen, schnellen und sicheren Auf- und Abbau. Die Standfläche von über 3,00 m² bietet einen großen und sicheren Arbeitsplatz für Personal und Material.', NULL, 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/rollgeruest-breitaufbau-4-4m-1.jpeg','/product-images/rollgeruest-breitaufbau-4-4m-2.jpeg']::text[], '{"Arbeitshöhe":"4,4 m","Gerüsthöhe":"3,5 m","Standhöhe":"2,4 m","Arbeitsfläche":"2,00 × 1,50 m","Standfläche":"über 3,00 m²","Fahrrollen":"Ø 150 mm, höhenverstellbar (220–335 mm)","Belastbarkeit":"200 kg/m² (Gerüstgruppe 3)","Norm":"DIN EN 1004-1, TÜV-geprüft","Material":"Aluminium","Verriegelung":"Selbstsicherndes KRAUSE-System"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"B9WD7T"}'::jsonb, FALSE, '/manuals/krause-rollgeruest-stabilo-serie-10-50-aufbauanleitung.pdf',
      NULL, 'https://www.youtube.com/watch?v=5tqZPFwN02c', ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rollgeruest-krause-breitaufbau-5-4m', 'Rollgerüst Breitaufbau – 5,4 m Arbeitshöhe', NULL, 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 1,50 m und 5,4 m Arbeitshöhe. TÜV-geprüft nach DIN EN 1004-1. Das selbstsichernde KRAUSE-Verriegelungssystem ermöglicht einen einfachen, schnellen und sicheren Auf- und Abbau. Die Standfläche von über 3,00 m² bietet einen großen und sicheren Arbeitsplatz für Personal und Material.', NULL, 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/rollgeruest-breitaufbau-5-4m-1.jpeg','/product-images/rollgeruest-breitaufbau-5-4m-2.jpeg']::text[], '{"Arbeitshöhe":"5,4 m","Gerüsthöhe":"4,5 m","Standhöhe":"3,4 m","Arbeitsfläche":"2,00 × 1,50 m","Standfläche":"über 3,00 m²","Fahrrollen":"Ø 150 mm, höhenverstellbar (220–335 mm)","Belastbarkeit":"200 kg/m² (Gerüstgruppe 3)","Norm":"DIN EN 1004-1, TÜV-geprüft","Material":"Aluminium","Verriegelung":"Selbstsicherndes KRAUSE-System"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"R5PHJN"}'::jsonb, FALSE, '/manuals/krause-rollgeruest-stabilo-serie-10-50-aufbauanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rollgeruest-krause-breitaufbau-6-4m', 'Rollgerüst Breitaufbau – 6,4 m Arbeitshöhe', NULL, 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 1,50 m und 6,4 m Arbeitshöhe. TÜV-geprüft nach DIN EN 1004-1. Das selbstsichernde KRAUSE-Verriegelungssystem ermöglicht einen einfachen, schnellen und sicheren Auf- und Abbau. Die Standfläche von über 3,00 m² bietet einen großen und sicheren Arbeitsplatz für Personal und Material.', NULL, 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/rollgeruest-breitaufbau-6-4m-1.jpeg','/product-images/rollgeruest-breitaufbau-6-4m-2.jpeg']::text[], '{"Arbeitshöhe":"6,4 m","Gerüsthöhe":"5,5 m","Standhöhe":"4,4 m","Arbeitsfläche":"2,00 × 1,50 m","Standfläche":"über 3,00 m²","Fahrrollen":"Ø 150 mm, höhenverstellbar (220–335 mm)","Belastbarkeit":"200 kg/m² (Gerüstgruppe 3)","Norm":"DIN EN 1004-1, TÜV-geprüft","Material":"Aluminium","Verriegelung":"Selbstsicherndes KRAUSE-System"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"BNHOAY"}'::jsonb, FALSE, '/manuals/krause-rollgeruest-stabilo-serie-10-50-aufbauanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rollgeruest-krause-breitaufbau-9-4m', 'Rollgerüst Breitaufbau – 9,4 m Arbeitshöhe', NULL, 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 1,50 m und 9,4 m Arbeitshöhe. TÜV-geprüft nach DIN EN 1004-1. Das selbstsichernde KRAUSE-Verriegelungssystem ermöglicht einen einfachen, schnellen und sicheren Auf- und Abbau. Die Standfläche von über 3,00 m² bietet einen großen und sicheren Arbeitsplatz für Personal und Material.', NULL, 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/rollgeruest-breitaufbau-9-4m-1.jpeg','/product-images/rollgeruest-breitaufbau-9-4m-2.jpeg']::text[], '{"Arbeitshöhe":"9,4 m","Gerüsthöhe":"8,5 m","Standhöhe":"7,4 m","Arbeitsfläche":"2,00 × 1,50 m","Standfläche":"über 3,00 m²","Fahrrollen":"Ø 150 mm, höhenverstellbar (220–335 mm)","Belastbarkeit":"200 kg/m² (Gerüstgruppe 3)","Norm":"DIN EN 1004-1, TÜV-geprüft","Material":"Aluminium","Verriegelung":"Selbstsicherndes KRAUSE-System"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"X29968"}'::jsonb, FALSE, '/manuals/krause-rollgeruest-stabilo-serie-10-50-aufbauanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rollgeruest-krause-4-4m', 'Rollgerüst – 4,4 m Arbeitshöhe (2,00 × 0,75 m)', NULL, 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 0,75 m und 4,4 m Arbeitshöhe (3,5 m Gerüsthöhe, 2,4 m Standhöhe). TÜV-geprüft nach DIN EN 1004-1. Das selbstsichernde KRAUSE-Verriegelungssystem ermöglicht einen einfachen, schnellen und sicheren Auf- und Abbau. Die Standfläche von 1,5 m² bietet einen sicheren Arbeitsplatz.', 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 0,75 m. Hier sorgt das komfortabel aufzubauende Verriegelungssystem für eine besonders hohe Stabilität.

TÜV-geprüft, Belastbarkeit 200 kg/m² (Gerüstgruppe 3) nach DIN EN 1004-1.

Durch die Befestigung des Geländerrahmens vor dem Einhängen der nächsthöheren Belagbühne ist der sichere Aufbau gewährleistet. Beim Durchsteigen der Belagbühne ist ein komplettes Geländer und damit eine Absturzsicherung vorhanden.

Das selbstsichernde KRAUSE-Verriegelungssystem mit einer formschlüssigen Verbindung ermöglicht den einfachen, schnellen und sicheren Auf- und Abbau.

Höhenverstellbare Fahrrollen (Ø 150 mm) gewährleisten durch das integrierte Spindelgewinde auch den Einsatz auf unebenem Gelände (stufenloser Verstellbereich: 220–335 mm).

Die Standfläche von 1,5 m² bietet einen großen und sicheren Arbeitsplatz für Personal und Material.', 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/rollgeruest-krause-44m-1.jpeg','/product-images/rollgeruest-krause-44m-2.jpeg','/product-images/rollgeruest-krause-44m-3.jpeg']::text[], '{"Arbeitshöhe":"4,4 m","Gerüsthöhe":"3,5 m","Standhöhe":"2,4 m","Arbeitsfläche":"2,00 × 0,75 m","Standfläche":"1,5 m²","Feldlängen":"2,00 m","Gerüstfeldbreite":"0,75 m","Fahrrollen":"Ø 150 mm, höhenverstellbar (220–335 mm)","Belastbarkeit":"200 kg/m² (Gerüstgruppe 3)","Norm":"DIN EN 1004-1, TÜV-geprüft","Material":"Aluminium (Traverse aus Stahl)","Verriegelung":"Selbstsicherndes KRAUSE-System"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"R8MN5D","bonn":"NP1PGC"}'::jsonb, FALSE, '/manuals/krause-rollgeruest-stabilo-serie-10-50-aufbauanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rollgeruest-krause-5-4m', 'Rollgerüst – 5,4 m Arbeitshöhe (2,00 × 0,75 m)', NULL, 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 0,75 m und 5,4 m Arbeitshöhe (6,4 m Arbeitshöhe, 5,5 m Gerüsthöhe, 4,4 m Standhöhe). TÜV-geprüft nach DIN EN 1004-1. Das selbstsichernde KRAUSE-Verriegelungssystem ermöglicht einen einfachen, schnellen und sicheren Auf- und Abbau. Die Standfläche von 1,5 m² bietet einen sicheren Arbeitsplatz.', 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 0,75 m. Hier sorgt das komfortabel aufzubauende Verriegelungssystem für eine besonders hohe Stabilität.

TÜV-geprüft, Belastbarkeit 200 kg/m² (Gerüstgruppe 3) nach DIN EN 1004-1.

Durch die Befestigung des Geländerrahmens vor dem Einhängen der nächsthöheren Belagbühne ist der sichere Aufbau gewährleistet. Beim Durchsteigen der Belagbühne ist ein komplettes Geländer und damit eine Absturzsicherung vorhanden.

Das selbstsichernde KRAUSE-Verriegelungssystem mit einer formschlüssigen Verbindung ermöglicht den einfachen, schnellen und sicheren Auf- und Abbau.

Höhenverstellbare Fahrrollen (Ø 150 mm) gewährleisten durch das integrierte Spindelgewinde auch den Einsatz auf unebenem Gelände (stufenloser Verstellbereich: 220–335 mm).

Die Standfläche von 1,5 m² bietet einen großen und sicheren Arbeitsplatz für Personal und Material.', 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/rollgeruest-krause-54m-1.jpeg','/product-images/rollgeruest-krause-54m-2.jpeg','/product-images/rollgeruest-krause-54m-3.jpeg']::text[], '{"Arbeitshöhe":"6,4 m","Gerüsthöhe":"5,5 m","Standhöhe":"4,4 m","Arbeitsfläche":"2,00 × 0,75 m","Standfläche":"1,5 m²","Feldlängen":"2,00 m","Gerüstfeldbreite":"0,75 m","Fahrrollen":"Ø 150 mm, höhenverstellbar (220–335 mm)","Belastbarkeit":"200 kg/m² (Gerüstgruppe 3)","Norm":"DIN EN 1004-1, TÜV-geprüft","Material":"Aluminium (Traverse aus Stahl)","Verriegelung":"Selbstsicherndes KRAUSE-System"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"55QTF9","bonn":"ILQNCT"}'::jsonb, FALSE, '/manuals/krause-rollgeruest-stabilo-serie-10-50-aufbauanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rollgeruest-krause-6-4m', 'Rollgerüst – 6,4 m Arbeitshöhe (2,00 × 0,75 m)', NULL, 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 0,75 m und 6,4 m Arbeitshöhe (5,5 m Gerüsthöhe, 4,4 m Standhöhe). TÜV-geprüft nach DIN EN 1004-1. Das selbstsichernde KRAUSE-Verriegelungssystem ermöglicht einen einfachen, schnellen und sicheren Auf- und Abbau. Die Standfläche von 1,5 m² bietet einen sicheren Arbeitsplatz.', 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 0,75 m. Hier sorgt das komfortabel aufzubauende Verriegelungssystem für eine besonders hohe Stabilität.

TÜV-geprüft, Belastbarkeit 200 kg/m² (Gerüstgruppe 3) nach DIN EN 1004-1.

Durch die Befestigung des Geländerrahmens vor dem Einhängen der nächsthöheren Belagbühne ist der sichere Aufbau gewährleistet. Beim Durchsteigen der Belagbühne ist ein komplettes Geländer und damit eine Absturzsicherung vorhanden.

Das selbstsichernde KRAUSE-Verriegelungssystem mit einer formschlüssigen Verbindung ermöglicht den einfachen, schnellen und sicheren Auf- und Abbau.

Höhenverstellbare Fahrrollen (Ø 150 mm) gewährleisten durch das integrierte Spindelgewinde auch den Einsatz auf unebenem Gelände (stufenloser Verstellbereich: 220–335 mm).

Die Standfläche von 1,5 m² bietet einen großen und sicheren Arbeitsplatz für Personal und Material.', 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/rollgeruest-krause-64m-1.jpeg','/product-images/rollgeruest-krause-64m-2.jpeg','/product-images/rollgeruest-krause-64m-3.jpeg']::text[], '{"Arbeitshöhe":"6,4 m","Gerüsthöhe":"5,5 m","Standhöhe":"4,4 m","Arbeitsfläche":"2,00 × 0,75 m","Standfläche":"1,5 m²","Feldlängen":"2,00 m","Gerüstfeldbreite":"0,75 m","Fahrrollen":"Ø 150 mm, höhenverstellbar (220–335 mm)","Belastbarkeit":"200 kg/m² (Gerüstgruppe 3)","Norm":"DIN EN 1004-1, TÜV-geprüft","Material":"Aluminium (Traverse aus Stahl)","Verriegelung":"Selbstsicherndes KRAUSE-System"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"HGHBJW","bonn":"XAC9I4"}'::jsonb, FALSE, '/manuals/krause-rollgeruest-stabilo-serie-10-50-aufbauanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rollgeruest-krause-7-4m', 'Rollgerüst – 7,4 m Arbeitshöhe (2,00 × 0,75 m)', NULL, 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 0,75 m und 7,4 m Arbeitshöhe (6,4 m Arbeitshöhe, 5,5 m Gerüsthöhe, 4,4 m Standhöhe). TÜV-geprüft nach DIN EN 1004-1. Das selbstsichernde KRAUSE-Verriegelungssystem ermöglicht einen einfachen, schnellen und sicheren Auf- und Abbau. Die Standfläche von 1,5 m² bietet einen sicheren Arbeitsplatz.', 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 0,75 m. Hier sorgt das komfortabel aufzubauende Verriegelungssystem für eine besonders hohe Stabilität.

TÜV-geprüft, Belastbarkeit 200 kg/m² (Gerüstgruppe 3) nach DIN EN 1004-1.

Durch die Befestigung des Geländerrahmens vor dem Einhängen der nächsthöheren Belagbühne ist der sichere Aufbau gewährleistet. Beim Durchsteigen der Belagbühne ist ein komplettes Geländer und damit eine Absturzsicherung vorhanden.

Das selbstsichernde KRAUSE-Verriegelungssystem mit einer formschlüssigen Verbindung ermöglicht den einfachen, schnellen und sicheren Auf- und Abbau.

Höhenverstellbare Fahrrollen (Ø 150 mm) gewährleisten durch das integrierte Spindelgewinde auch den Einsatz auf unebenem Gelände (stufenloser Verstellbereich: 220–335 mm).

Die Standfläche von 1,5 m² bietet einen großen und sicheren Arbeitsplatz für Personal und Material.', 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/rollgeruest-krause-74m-1.jpeg','/product-images/rollgeruest-krause-74m-2.jpeg','/product-images/rollgeruest-krause-74m-3.jpeg']::text[], '{"Arbeitshöhe":"6,4 m","Gerüsthöhe":"5,5 m","Standhöhe":"4,4 m","Arbeitsfläche":"2,00 × 0,75 m","Standfläche":"1,5 m²","Feldlängen":"2,00 m","Gerüstfeldbreite":"0,75 m","Fahrrollen":"Ø 150 mm, höhenverstellbar (220–335 mm)","Belastbarkeit":"200 kg/m² (Gerüstgruppe 3)","Norm":"DIN EN 1004-1, TÜV-geprüft","Material":"Aluminium (Traverse aus Stahl)","Verriegelung":"Selbstsicherndes KRAUSE-System"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"NFJLTZ","bonn":"LYF6UT"}'::jsonb, FALSE, '/manuals/krause-rollgeruest-stabilo-serie-10-50-aufbauanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rollgeruest-krause-8-4m', 'Rollgerüst – 8,4 m Arbeitshöhe (2,00 × 0,75 m)', NULL, 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 0,75 m und 8,4 m Arbeitshöhe (7,5 m Gerüsthöhe, 6,4 m Standhöhe). TÜV-geprüft nach DIN EN 1004-1. Das GuardMatic-System gewährleistet einen sicheren Aufbau mit 6-Punkt-Fixierung für maximale Stabilität. Die Standfläche von über 1,5 m² bietet einen sicheren Arbeitsplatz.', 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 0,75 m. Hier sorgt das komfortabel aufzubauende Verriegelungssystem für eine besonders hohe Stabilität.

TÜV-geprüft, Belastbarkeit 200 kg/m² (Gerüstgruppe 3) nach DIN EN 1004-1.

Durch die Befestigung des Geländerrahmens GuardMatic-System vor dem Einhängen der nächsthöheren Belagbühne ist der sichere Aufbau gewährleistet. Beim Durchsteigen der Belagbühne ist ein komplettes Geländer und damit eine Absturzsicherung vorhanden.

Die Integration der Diagonalen in das GuardMatic-System gewährleistet eine einfache und sichere Montage. Für Transport oder Lagerung kann der Geländerrahmen platzsparend zusammengefaltet werden.

Die 6-Punkt-Fixierung des GuardMatic-Systems sorgt für maximale Stabilität in der Höhe. Das einzigartige selbstsichernde KRAUSE-Verriegelungssystem mit einer formschlüssigen Verbindung ermöglicht den einfachen, schnellen und sicheren Auf- und Abbau.

Die innovative Form der Diagonalen bietet eine maximale Nutzfläche auf der Belagbühne und stört in keiner Weise.

Höhenverstellbare Fahrrollen (Ø 150 mm) gewährleisten durch das integrierte Spindelgewinde auch den Einsatz auf unebenem Gelände (stufenloser Verstellbereich: 220–335 mm).

Die Standfläche von über 1,5 m² bietet einen großen und sicheren Arbeitsplatz für Personal und Material.', 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/rollgeruest-krause-84m-1.jpeg','/product-images/rollgeruest-krause-84m-2.jpeg','/product-images/rollgeruest-krause-84m-3.jpeg']::text[], '{"Arbeitshöhe":"8,4 m","Gerüsthöhe":"7,5 m","Standhöhe":"6,4 m","Arbeitsfläche":"2,00 × 0,75 m","Standfläche":"über 1,5 m²","Feldlängen":"2,00 m","Gerüstfeldbreite":"0,75 m","Fahrrollen":"Ø 150 mm, höhenverstellbar (220–335 mm)","Belastbarkeit":"200 kg/m² (Gerüstgruppe 3)","Norm":"DIN EN 1004-1, TÜV-geprüft","Material":"Aluminium (Traverse aus Stahl)","Verriegelung":"Selbstsicherndes KRAUSE-System","Sicherheit":"GuardMatic-System mit 6-Punkt-Fixierung"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"4TGJ2L","bonn":"KZJ688"}'::jsonb, FALSE, '/manuals/krause-rollgeruest-stabilo-serie-10-50-aufbauanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rollgeruest-krause-9-4m', 'Rollgerüst – 9,4 m Arbeitshöhe (2,00 × 0,75 m)', NULL, 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 0,75 m und 9,4 m Arbeitshöhe (8,4 m Arbeitshöhe, 7,5 m Gerüsthöhe). TÜV-geprüft nach DIN EN 1004-1. Das GuardMatic-System gewährleistet einen sicheren Aufbau mit 6-Punkt-Fixierung für maximale Stabilität. Die Standfläche von über 1,5 m² bietet einen sicheren Arbeitsplatz.', 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 0,75 m. Hier sorgt das komfortabel aufzubauende Verriegelungssystem für eine besonders hohe Stabilität.

Durch die Befestigung des Geländerrahmens GuardMatic-System vor dem Einhängen der nächsthöheren Belagbühne ist der sichere Aufbau gewährleistet. Beim Durchsteigen der Belagbühne ist ein komplettes Geländer und damit eine Absturzsicherung vorhanden.

Die Integration der Diagonalen in das GuardMatic-System gewährleistet eine einfache und sichere Montage. Für Transport oder Lagerung kann der Geländerrahmen platzsparend zusammengefaltet werden.

Die 6-Punkt-Fixierung des GuardMatic-Systems sorgt für maximale Stabilität in der Höhe. Das einzigartige selbstsichernde KRAUSE-Verriegelungssystem mit einer formschlüssigen Verbindung ermöglicht den einfachen, schnellen und sicheren Auf- und Abbau.

Die innovative Form der Diagonalen bietet eine maximale Nutzfläche auf der Belagbühne und stört in keiner Weise.

Höhenverstellbare Fahrrollen (Ø 150 mm) gewährleisten durch das integrierte Spindelgewinde auch den Einsatz auf unebenem Gelände (stufenloser Verstellbereich: 220–335 mm).

Die Standfläche von über 1,5 m² bietet einen großen und sicheren Arbeitsplatz für Personal und Material.', 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/rollgeruest-krause-94m-1.jpeg','/product-images/rollgeruest-krause-94m-2.jpeg','/product-images/rollgeruest-krause-94m-3.jpeg']::text[], '{"Arbeitshöhe":"9,4 m","Gerüsthöhe":"8,4 m","Standhöhe":"7,4 m","Arbeitsfläche":"2,00 × 0,75 m","Standfläche":"über 1,5 m²","Feldlängen":"2,00 m","Gerüstfeldbreite":"0,75 m","Fahrrollen":"Ø 150 mm, höhenverstellbar (220–335 mm)","Belastbarkeit":"200 kg/m² (Gerüstgruppe 3)","Norm":"DIN EN 1004-1, TÜV-geprüft","Material":"Aluminium (Traverse aus Stahl)","Verriegelung":"Selbstsicherndes KRAUSE-System","Sicherheit":"GuardMatic-System mit 6-Punkt-Fixierung"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"bonn":"GTQBCT"}'::jsonb, FALSE, '/manuals/krause-rollgeruest-stabilo-serie-10-50-aufbauanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rollgeruest-krause-breitaufbau-8-4m', 'Rollgerüst Breitaufbau – 8,4 m Arbeitshöhe', NULL, 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 1,50 m und 8,4 m Arbeitshöhe. TÜV-geprüft nach DIN EN 1004-1. Das selbstsichernde KRAUSE-Verriegelungssystem ermöglicht einen einfachen, schnellen und sicheren Auf- und Abbau. Die Standfläche von über 3,00 m² bietet einen großen und sicheren Arbeitsplatz für Personal und Material.', NULL, 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/rollgeruest-breitaufbau-8-4m-1.jpeg','/product-images/rollgeruest-breitaufbau-8-4m-2.jpeg']::text[], '{"Arbeitshöhe":"8,4 m","Gerüsthöhe":"7,5 m","Standhöhe":"6,4 m","Arbeitsfläche":"2,00 × 1,50 m","Standfläche":"über 3,00 m²","Fahrrollen":"Ø 150 mm, höhenverstellbar (220–335 mm)","Belastbarkeit":"200 kg/m² (Gerüstgruppe 3)","Norm":"DIN EN 1004-1, TÜV-geprüft","Material":"Aluminium","Verriegelung":"Selbstsicherndes KRAUSE-System"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"Z1NE9X"}'::jsonb, FALSE, '/manuals/krause-rollgeruest-stabilo-serie-10-50-aufbauanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rollgeruest-krause-breitaufbau-7-4m', 'Rollgerüst Breitaufbau – 7,4 m Arbeitshöhe', NULL, 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 1,50 m und 7,4 m Arbeitshöhe. TÜV-geprüft nach DIN EN 1004-1. Das selbstsichernde KRAUSE-Verriegelungssystem ermöglicht einen einfachen, schnellen und sicheren Auf- und Abbau. Die Standfläche von über 3,00 m² bietet einen großen und sicheren Arbeitsplatz für Personal und Material.', NULL, 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/rollgeruest-breitaufbau-7-4m-1.jpeg','/product-images/rollgeruest-breitaufbau-7-4m-2.jpeg']::text[], '{"Arbeitshöhe":"7,4 m","Gerüsthöhe":"6,5 m","Standhöhe":"5,4 m","Arbeitsfläche":"2,00 × 1,50 m","Standfläche":"über 3,00 m²","Fahrrollen":"Ø 150 mm, höhenverstellbar (220–335 mm)","Belastbarkeit":"200 kg/m² (Gerüstgruppe 3)","Norm":"DIN EN 1004-1, TÜV-geprüft","Material":"Aluminium","Verriegelung":"Selbstsicherndes KRAUSE-System"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"IYWH71"}'::jsonb, FALSE, '/manuals/krause-rollgeruest-stabilo-serie-10-50-aufbauanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rollgeruest-krause-breitaufbau-10-4m', 'Rollgerüst Breitaufbau – 10,4 m Arbeitshöhe', NULL, 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 1,50 m und 10,4 m Arbeitshöhe. TÜV-geprüft nach DIN EN 1004-1. Das selbstsichernde KRAUSE-Verriegelungssystem ermöglicht einen einfachen, schnellen und sicheren Auf- und Abbau. Die Standfläche von über 3,00 m² bietet einen großen und sicheren Arbeitsplatz für Personal und Material.', NULL, 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/rollgeruest-breitaufbau-10-4m-1.jpeg','/product-images/rollgeruest-breitaufbau-10-4m-2.jpeg']::text[], '{"Arbeitshöhe":"10,4 m","Gerüsthöhe":"9,5 m","Standhöhe":"8,4 m","Arbeitsfläche":"2,00 × 1,50 m","Standfläche":"über 3,00 m²","Fahrrollen":"Ø 150 mm, höhenverstellbar (220–335 mm)","Belastbarkeit":"200 kg/m² (Gerüstgruppe 3)","Norm":"DIN EN 1004-1, TÜV-geprüft","Material":"Aluminium","Verriegelung":"Selbstsicherndes KRAUSE-System"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"1VVWHI"}'::jsonb, FALSE, '/manuals/krause-rollgeruest-stabilo-serie-10-50-aufbauanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rollgeruest-krause-breitaufbau-11-4m', 'Rollgerüst Breitaufbau – 11,4 m Arbeitshöhe', NULL, 'KRAUSE Fahrgerüst mit einer Arbeitsfläche von 2,00 × 1,50 m und 11,4 m Arbeitshöhe. TÜV-geprüft nach DIN EN 1004-1. Das selbstsichernde KRAUSE-Verriegelungssystem ermöglicht einen einfachen, schnellen und sicheren Auf- und Abbau. Die Standfläche von über 3,00 m² bietet einen großen und sicheren Arbeitsplatz für Personal und Material.', NULL, 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/rollgeruest-breitaufbau-11-4m-1.jpeg','/product-images/rollgeruest-breitaufbau-11-4m-2.jpeg']::text[], '{"Arbeitshöhe":"11,4 m","Gerüsthöhe":"10,5 m","Standhöhe":"9,4 m","Arbeitsfläche":"2,00 × 1,50 m","Standfläche":"über 3,00 m²","Fahrrollen":"Ø 150 mm, höhenverstellbar (220–335 mm)","Belastbarkeit":"200 kg/m² (Gerüstgruppe 3)","Norm":"DIN EN 1004-1, TÜV-geprüft","Material":"Aluminium","Verriegelung":"Selbstsicherndes KRAUSE-System"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"J5A49M"}'::jsonb, FALSE, '/manuals/krause-rollgeruest-stabilo-serie-10-50-aufbauanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'krause-rollgeruest-breitaufbau-12-4m', 'Rollgerüst Breitaufbau – 12,4 m Arbeitshöhe', NULL, 'KRAUSE Rollgerüst Breitaufbau mit einer Arbeitsfläche von 2,00 × 1,50 m und 12,4 m Arbeitshöhe (Gerüsthöhe 11,5 m, Standhöhe 10,4 m). TÜV-geprüft nach DIN EN 1004-1, Belastbarkeit 200 kg/m² (Gerüstgruppe 3). Höhenverstellbare Fahrrollen Ø 150 mm (220–335 mm) gleichen unebenes Gelände aus. Das selbstsichernde KRAUSE-Verriegelungssystem ermöglicht einen sicheren Auf- und Abbau; die Standfläche von über 3,00 m² bietet viel Platz für Personal und Material.', 'KRAUSE Rollgerüst Breitaufbau mit einer Arbeitsfläche von 2,00 × 1,50 m. Hier sorgt das komfortabel aufzubauende Verriegelungssystem für eine besonders hohe Stabilität.

Arbeitshöhe: 12,4 m
Gerüsthöhe: 11,5 m
Standhöhe: 10,4 m
Höhenverstellbare Fahrrollen Ø 150 mm (stufenloser Verstellbereich: 220–335 mm)

TÜV-geprüft, Belastbarkeit 200 kg/m² (Gerüstgruppe 3) nach DIN EN 1004-1.

Durch die Befestigung des Geländerrahmens vor dem Einhängen der nächsthöheren Belagbühne ist der sichere Aufbau gewährleistet. Beim Durchsteigen der Belagbühne ist ein komplettes Geländer und damit eine Absturzsicherung vorhanden.

Das selbstsichernde KRAUSE-Verriegelungssystem mit einer formschlüssigen Verbindung ermöglicht den einfachen, schnellen und sicheren Auf- und Abbau.

Die Standfläche von über 3,00 m² bietet einen großen und sicheren Arbeitsplatz für Personal und Material.', 'leitern-gerueste',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/rollgeruest-breitaufbau-11-4m-1.jpeg','/product-images/rollgeruest-breitaufbau-11-4m-2.jpeg']::text[], '{"Arbeitshöhe":"12,4 m","Gerüsthöhe":"11,5 m","Standhöhe":"10,4 m","Arbeitsfläche":"2,00 × 1,50 m","Standfläche":"über 3,00 m²","Fahrrollen":"Ø 150 mm, höhenverstellbar (220–335 mm)","Belastbarkeit":"200 kg/m² (Gerüstgruppe 3)","Norm":"DIN EN 1004-1, TÜV-geprüft","Material":"Aluminium","Verriegelung":"Selbstsicherndes KRAUSE-System"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"VMCAWI"}'::jsonb, FALSE, '/manuals/krause-rollgeruest-stabilo-serie-10-50-aufbauanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'heizluefter-2kw', '2 kW Elektro Heizlüfter', NULL, 'Kompakter Elektro-Heizlüfter mit zwei Heizstufen (1 kW & 2 kW) – ideal für kleine Räume und Baustellen. Robustes Metallgehäuse mit Tragegriff.', NULL, 'heizung-trocknung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/heizluefter-2kw-1.jpeg','/product-images/heizluefter-2kw-2.jpeg']::text[], '{"Heizleistung":"1 kW & 2 kW (umschaltbar)","Leistungsaufnahme":"2 kW","Elektroanschluss":"230 V","Luftleistung":"500 m³/h"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"CD894R","bonn":"","muelheim":""}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'heizpilz-2kw', '2 kW Elektro Heizpilz', NULL, 'Eleganter Infrarot-Heizstrahler im Pilzdesign – ideal für Terrassen, Events und Außengastronomie. Zwei Heizstufen (1 kW & 2 kW), stufenlos höhenverstellbar, Schutzklasse IP34.', NULL, 'heizung-trocknung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/heizpilz-2kw-1.jpeg','/product-images/heizpilz-2kw-2.jpeg','/product-images/heizpilz-2kw-3.jpeg','/product-images/heizpilz-2kw-4.jpeg','/product-images/heizpilz-2kw-5.jpeg']::text[], '{"Heizleistung":"1 kW & 2 kW (umschaltbar)","Leistungsaufnahme":"2 kW","Elektroanschluss":"230 V","Wirkungsfläche":"ca. 15 m²","Höhenverstellbar":"194 cm – 210 cm","Heizart":"Infrarot","Schutzklasse":"IP34","Material":"Aluminium / Edelstahl"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"552B4C","bonn":"MSKYPD","muelheim":""}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'heizluefter-3kw', 'Allegra 3 kW Elektro Heizlüfter', NULL, 'Kompakter Allegra Elektroheizlüfter mit zwei Heizstufen (1,5 kW & 3 kW) – ideal für mittlere Räume und Baustellen. 230 V Normsteckdose, robustes Metallgehäuse mit Tragegriff.', NULL, 'heizung-trocknung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/heizluefter-3kw-1.jpeg','/product-images/heizluefter-3kw-2.jpeg']::text[], '{"Hersteller":"Allegra","Heizleistung":"1,5 kW & 3 kW (umschaltbar)","Leistungsaufnahme":"3 kW","Elektroanschluss":"230 V","Luftleistung":"510 m³/h"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"5FW6KJ","bonn":"YWLOT7","muelheim":""}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'heizluefter-9kw', 'Allegra 9 kW Elektro Heizlüfter', NULL, 'Leistungsstarker Industrie-Elektroheizlüfter von Allegra mit zwei Heizstufen (4,5 kW & 9 kW) – ideal für große Baustellen, Hallen und Werkstätten. 400 V Drehstrom.', NULL, 'heizung-trocknung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/heizluefter-9kw-1.jpeg','/product-images/heizluefter-9kw-2.jpeg']::text[], '{"Hersteller":"Allegra","Heizleistung":"4,5 kW & 9 kW (umschaltbar)","Leistungsaufnahme":"9 kW","Elektroanschluss":"400 V (Drehstrom)","Luftumwälzung":"845 m³/h"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"FO81O2","bonn":"QHFZ9G","muelheim":""}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bautrockner-kt200', 'Bautrockner 20L/Tag', 'Allegra KT200', 'Kompakter Kondensations-Bautrockner mit geeichtem MID-Stromzähler (PH10) und Betriebsstundenzähler – ideal für kleinere Räume bis 20 m². Automatische Abschaltung bei vollem 4-Liter-Wassertank, Schlauchanschluss möglich.', NULL, 'heizung-trocknung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/allegra-bautrockner-kt200-1.webp','/product-images/allegra-bautrockner-kt200-2.webp']::text[], '{"Hersteller":"Allegra","Modell":"KT200","Trocknungsfläche":"20 m²","Entfeuchtungsleistung":"bis zu 20 l/24h","Leistung":"350 W","Luftumwälzung":"260 m³/h","Stromanschluss":"230 V – 16 A","Arbeitsbereich":"5 °C – 35 °C","Wassertank":"4 Liter (Abschaltautomatik)","Schlauchanschluss":"Ja","Stromzähler":"Geeichter MID-Zähler PH10","Betriebsstundenzähler":"Ja","Gewicht":"18,50 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"3EZNGC","bonn":"QSWO1M","muelheim":""}'::jsonb, FALSE, '/manuals/allegra-bautrockner-kt200-anleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bautrockner-kt553', 'Bautrockner 50L/Tag', 'Allegra KT553/KT554', 'Professioneller Kondensations-Bautrockner mit geeichtem MID-Stromzähler (PH10) und Betriebsstundenzähler – ideal zur Bauaustrocknung auf 50–60 m². Automatische Abschaltung bei vollem 4-Liter-Wassertank, Schlauchanschluss möglich.', NULL, 'heizung-trocknung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/allegra-bautrockner-kt553-1.jpeg','/product-images/allegra-bautrockner-kt553-2.jpeg']::text[], '{"Hersteller":"Allegra","Modell":"KT553 / KT554","Trocknungsfläche":"50–60 m²","Entfeuchtungsleistung":"bis zu 50 l/24h","Leistung":"700 W","Luftumwälzung":"330 m³/h","Stromanschluss":"230 V – 16 A","Arbeitsbereich":"5 °C – 35 °C","Wassertank":"4 Liter (Abschaltautomatik)","Schlauchanschluss":"Ja","Stromzähler":"Geeichter MID-Zähler PH10","Betriebsstundenzähler":"Ja","Gewicht":"30 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"Z6BL9U","bonn":"XK3ZV4","muelheim":""}'::jsonb, FALSE, '/manuals/allegra-bautrockner-kt553-anleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-121-10-ra2', 'VZ 121-10, RA2', NULL, 'Einseitig verengte Fahrbahn, Verengung rechts – Dreieckiges Gefahrzeichen, Seitenlänge 900 mm, Flachform 2 mm, Reflektionsklasse RA2.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-121-10-ra2.jpeg']::text[], '{"Bezeichnung":"VZ 121-10","Bedeutung":"Einseitig verengte Fahrbahn, Verengung rechts","Reflektionsklasse":"RA2","Form":"Flachform","Material":"2 mm","Seitenlänge":"900 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"XC3MNE"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-121-20-ra2', 'VZ 121-20, RA2', NULL, 'Einseitig verengte Fahrbahn, Verengung links – Dreieckiges Gefahrzeichen, Seitenlänge 900 mm, Flachform 2 mm, Reflektionsklasse RA2.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-121-20-ra2.jpeg']::text[], '{"Bezeichnung":"VZ 121-20","Bedeutung":"Einseitig verengte Fahrbahn, Verengung links","Reflektionsklasse":"RA2","Form":"Flachform","Material":"2 mm","Seitenlänge":"900 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"JBQ7S2"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-123-ra1', 'VZ 123, RA1', NULL, 'Arbeitsstelle – Dreieckiges Gefahrzeichen, Seitenlänge 900 mm, Flachform 2 mm, Reflektionsklasse RA1.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-123-ra1.jpeg']::text[], '{"Bezeichnung":"VZ 123","Bedeutung":"Arbeitsstelle","Reflektionsklasse":"RA1","Form":"Flachform","Material":"2 mm","Seitenlänge":"900 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"WH4OQC"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-123-ra2', 'VZ 123, RA2', NULL, 'Arbeitsstelle – Dreieckiges Gefahrzeichen, Seitenlänge 900 mm, Flachform 2 mm, Reflektionsklasse RA2.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-123-ra2.jpeg']::text[], '{"Bezeichnung":"VZ 123","Bedeutung":"Arbeitsstelle","Reflektionsklasse":"RA2","Form":"Flachform","Material":"2 mm","Seitenlänge":"900 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"UXKG5G"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-240-ra1', 'VZ 240, RA1', NULL, 'Gemeinsamer Geh- und Radweg – Rundes Verkehrszeichen Ø 600 mm, Flachform 2 mm, Reflektionsklasse RA1.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-240-ra1.jpeg']::text[], '{"Bezeichnung":"VZ 240","Bedeutung":"Gemeinsamer Geh- und Radweg","Reflektionsklasse":"RA1","Form":"Flachform","Material":"2 mm","Durchmesser":"600 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"ZSNQ9H"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-267-ra1', 'VZ 267, RA1', NULL, 'Verbot der Einfahrt – Rundes Verkehrszeichen Ø 600 mm in Flachform (2 mm), Reflektionsklasse RA1.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-267-ra1.jpeg']::text[], '{"Bezeichnung":"VZ 267","Bedeutung":"Verbot der Einfahrt","Reflektionsklasse":"RA1","Form":"Flachform","Material":"2 mm","Durchmesser":"600 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"NCQ97L"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-283-10-ra1', 'VZ 283-10, RA1', NULL, 'Absolutes Haltverbot Anfang, Rechtsaufstellung – Rundes Verkehrszeichen Ø 600 mm in Flachform (2 mm), Reflektionsklasse RA1.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-283-10-ra1.jpeg']::text[], '{"Bezeichnung":"VZ 283-10","Bedeutung":"Absolutes Haltverbot Anfang, Rechtsaufstellung","Reflektionsklasse":"RA1","Form":"Flachform","Material":"2 mm","Durchmesser":"600 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"C7NXIO"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-283-11-ra1', 'VZ 283-11, RA1', NULL, 'Absolutes Haltverbot Ende, Linksaufstellung – Rundes Verkehrszeichen Ø 600 mm in Flachform (2 mm), Reflektionsklasse RA1.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-283-11-ra1.jpeg']::text[], '{"Bezeichnung":"VZ 283-11","Bedeutung":"Absolutes Haltverbot Ende, Linksaufstellung","Reflektionsklasse":"RA1","Form":"Flachform","Material":"2 mm","Durchmesser":"600 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"FSBHNJ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-283-20-ra1', 'VZ 283-20, RA1', NULL, 'Absolutes Haltverbot Ende, Rechtsaufstellung – Rundes Verkehrszeichen Ø 600 mm in Flachform (2 mm), Reflektionsklasse RA1.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-283-20-ra1.jpeg']::text[], '{"Bezeichnung":"VZ 283-20","Bedeutung":"Absolutes Haltverbot Ende, Rechtsaufstellung","Reflektionsklasse":"RA1","Form":"Flachform","Material":"2 mm","Durchmesser":"600 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"GAWVK6"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-283-21-ra1', 'VZ 283-21, RA1', NULL, 'Absolutes Haltverbot Anfang, Linksaufstellung – Rundes Verkehrszeichen Ø 600 mm, Flachform 2 mm, Reflektionsklasse RA1.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-283-21-ra1.jpeg']::text[], '{"Bezeichnung":"VZ 283-21","Bedeutung":"Absolutes Haltverbot Anfang, Linksaufstellung","Reflektionsklasse":"RA1","Form":"Flachform","Material":"2 mm","Durchmesser":"600 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"SBF5T8"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-283-42cm', 'Verkehrszeichen 283, Absolutes Haltverbot 42 cm', NULL, 'Kleines Halteverbotsschild', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{"Durchmesser":"42 cm","Reflektionsklasse":"RA1"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"SH78N1"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'halteverbotsschilder-set', 'Halteverbotsschilder-Set', NULL, '18-teiliges Komplett-Set für mobile Halteverbotszonen-Kennzeichnung. Besonders standfest durch 2 Fußplatten. Zusatzschilder individuell beschriftbar (StVO Größe 1). Aufstellung mind. 72 Stunden vor Nutzungsbeginn erforderlich.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/halteverbotsschilder-set-1.jpeg','/product-images/halteverbotsschilder-set-2.jpeg','/product-images/halteverbotsschilder-set-3.jpeg']::text[], '{"Umfang":"18-teiliges Komplett-Set","Standfestigkeit":"Klasse RA2 (2 Fußplatten)","Reflektionsklasse":"RA1","Zusatzschilder":"StVO Größe 1, individuell beschriftbar","Aufstellfrist":"Min. 72 Stunden vor Nutzungstag","Genehmigung":"Min. 14 Werktage Vorlaufzeit bei Beantragung durch uns","Hinweis":"Genehmigungs-Kopie an krefeld@slt-rental.de senden","Abholung":"24/7 an allen Standorten möglich"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"ONFC2E","muelheim":"BX4E9Q","bonn":"BDX3N5"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], 0, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-308-ra1', 'VZ 308, RA1', NULL, 'Vorrang vor dem Gegenverkehr – Quadratisches Verkehrszeichen 600 × 600 mm in Flachform (2 mm), Reflektionsklasse RA1.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-308-ra1.jpeg']::text[], '{"Bezeichnung":"VZ 308","Bedeutung":"Vorrang vor dem Gegenverkehr","Reflektionsklasse":"RA1","Form":"Flachform","Material":"2 mm","Abmessungen":"600 × 600 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"O79BYU"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-357-ra1', 'VZ 357, RA1', NULL, 'Sackgasse – Quadratisches Verkehrszeichen 600 × 600 mm, Flachform 2 mm, Reflektionsklasse RA1.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-357-ra1.jpeg']::text[], '{"Bezeichnung":"VZ 357","Bedeutung":"Sackgasse","Reflektionsklasse":"RA1","Form":"Flachform","Material":"2 mm","Abmessungen":"600 × 600 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"P2P3JU"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-1000-12-ra1-gr1', 'VZ 1000-12, RA1, Gr. 1', NULL, 'Fußgänger Gehweg links gegenüber benutzen – Zusatzzeichen 231 × 420 mm, Flachform 2 mm, Reflektionsklasse RA1.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-1000-12-ra1-gr1.jpeg']::text[], '{"Bezeichnung":"VZ 1000-12","Bedeutung":"Fußgänger Gehweg links gegenüber benutzen","Reflektionsklasse":"RA1","Form":"Flachform","Material":"2 mm","Abmessungen":"231 × 420 mm","Größe":"Gr. 1"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"ANT9D8"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-1000-12-ra1-gr2', 'VZ 1000-12, RA1, Gr. 2', NULL, 'Zusatzzeichen VZ 1000-12: Fußgänger – Gehweg links gegenüber benutzen. Flachform 2 mm, Reflektionsklasse RA1.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-1000-12-ra1.jpeg']::text[], '{"Bezeichnung":"VZ 1000-12","Bedeutung":"Fußgänger Gehweg links gegenüber benutzen","Reflektionsklasse":"RA1","Form":"Flachform","Material":"2 mm","Seitenlänge":"330 mm × 600 mm","Größe":"Gr. 2"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"DEXR4U"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-1000-22-ra1-gr1', 'VZ 1000-22, RA1, Gr. 1', NULL, 'Fußgänger Gehweg rechts gegenüber benutzen – Zusatzzeichen 231 × 420 mm, Flachform 2 mm, Reflektionsklasse RA1.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-1000-22-ra1-gr1.jpeg']::text[], '{"Bezeichnung":"VZ 1000-22","Bedeutung":"Fußgänger Gehweg rechts gegenüber benutzen","Reflektionsklasse":"RA1","Form":"Flachform","Material":"2 mm","Abmessungen":"231 × 420 mm","Größe":"Gr. 1"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"D2MTMY"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-1000-22-ra1-gr2', 'VZ 1000-22, RA1, Gr. 2', NULL, 'Zusatzzeichen VZ 1000-22: Fußgänger – Gehweg rechts gegenüber benutzen. Flachform 2 mm, Reflektionsklasse RA1.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-1000-22-ra1.jpeg']::text[], '{"Bezeichnung":"VZ 1000-22","Bedeutung":"Fußgänger Gehweg rechts gegenüber benutzen","Reflektionsklasse":"RA1","Form":"Flachform","Material":"2 mm","Seitenlänge":"330 mm × 600 mm","Größe":"Gr. 2"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"ICH8W8"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'vz-zusatz-neutral-ra1-gr2', 'VZ Zusatz Neutral, RA1, Gr. 2', NULL, 'Zusatzzeichen mit schwarzem Rand (neutral/unbeschriftet), Reflektionsklasse RA1, Flachform 2 mm, 330 × 600 mm.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vz-zusatz-neutral-ra1-gr2.jpeg']::text[], '{"Bezeichnung":"VZ Zusatz Neutral","Bedeutung":"Zusatzzeichen mit Rand (neutral)","Reflektionsklasse":"RA1","Form":"Flachform","Material":"2 mm","Abmessungen":"330 × 600 mm","Größe":"Gr. 2"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"GZZWD3"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'blanko-zusatzschild-42x23', 'Blanko-Zusatzschild, 42 x 23 cm', NULL, 'Beschreibbares Zusatzschild', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"T17EOU"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'tl-warnleuchte-gelb', 'TL-Warnleuchte, gelb', NULL, 'LED Warnleuchte nach EN 12352, gelbe Streuscheibe, doppelseitig, Ø 180 mm. Blink-/Dauerlicht per Lampenschlüssel umschaltbar. Batterien optional.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/tl-warnleuchte-gelb.jpeg','/product-images/tl-warnleuchte-gelb-front.jpeg','/product-images/tl-warnleuchte-gelb-seite.jpeg']::text[], '{"Norm":"EN 12352","Streuscheibe":"Gelb, doppelseitig","Lichtaustritt":"Ø 180 mm","Technik":"Verbrauchsarme LED","Umschaltung":"Blink-/Dauerlicht per Lampenschlüssel","Hinweis":"Batterien optional erhältlich"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"XLIU51","bonn":"P82DB9"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'fussplatte-k1-tl', 'Fußplatte K1 TL', NULL, 'Fußplatte für Verkehrsschilder, Warnbarken oder Schrankenzäune, ca. 28 kg.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/fussplatte-k1-tl.jpeg']::text[], '{"Verwendung":"Verkehrsschilder, Warnbarken, Schrankenzäune","Gewicht":"ca. 28 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"WG72M2","bonn":"JDKD4X"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'stahl-vierkantrohr-4x4cm-2-5m', 'Alu-Vierkantrohr, 4x4cm, 2,5m', NULL, 'Alu-Vierkantrohr 4 × 4 cm, Länge 2,5 m, Materialstärke 1,5 mm. Geeignet als Pfosten für Verkehrszeichen.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/stahl-vierkantrohr-4x4-2-5m.jpeg']::text[], '{"Querschnitt":"4 × 4 cm","Länge":"2,5 m","Materialstärke":"1,5 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"VVOJM5"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'wemas-klemmschelle-k1', 'Wemas Klemmschelle K1', NULL, 'Kunststoff-Klemmschelle zur Befestigung von Verkehrsschildern an Vierkantrohren 40×40 mm und Rundrohren Ø 42 mm.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/wemas-klemmschelle-k1.jpeg']::text[], '{"Hersteller":"Wemas","Modell":"Klemmschelle K1","Material":"Kunststoff","Passend für Vierkantrohr":"40 × 40 mm","Passend für Rundrohr":"Ø 42 mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"WXZIEE","bonn":"KSVK2T"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bauzaun', 'Bauzaun', NULL, 'Mobiler Bauzaun ca. 3,5 m × 2,0 m, verzinkt, ca. 13 kg. Ideal für Baustellen- und Veranstaltungsabsperrungen.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/bauzaun-1.jpeg','/product-images/bauzaun-2.jpeg']::text[], '{"Abmessungen":"ca. 3,5 m × 2,0 m","Gewicht":"ca. 13 kg","Ausführung":"Verzinkt"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"B8V6OY"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bauzaunfuss-kunststoff', 'Bauzaunfuß aus Kunststoffrecycling', NULL, 'Fußplatte für Bauzäune aus Kunststoffrecycling mit 5 Aufnahmen. Ca. 20 kg schwer für optimale Standfestigkeit.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/bauzaunfuss-kunststoff.jpeg']::text[], '{"Material":"Kunststoffrecycling","Aufnahmen":"5","Gewicht":"ca. 20 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"96SCQN"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'mannesmanngitter', 'Mannesmanngitter', NULL, 'Mannesmanngitter 250 × 110 cm, ca. 16 kg. Stabile Absperrgitter für Veranstaltungen und Baustellen.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/mannesmanngitter.jpeg']::text[], '{"Abmessungen":"250 × 110 cm","Gewicht":"ca. 16 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"QQWZPJ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'schrankenzaun-ra2', 'Schrankenzaun RA2 weiß/rot', NULL, 'Schrankenzaun mit RA2-Folie und Lampenadapter, ca. 9 kg.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/schrankenzaun-ra2.jpeg']::text[], '{"Ausführung":"RA2 weiß/rot","Ausstattung":"Lampenadapter","Gewicht":"ca. 9 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"LANT3O","bonn":"IRL7WZ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'schrankenzaun-inkl-fuss', 'Schrankenzaun inkl. Fuß', NULL, 'Schrankenzaun RA2 weiß/rot inkl. 1× Fußplatte K1 TL. Warnleuchte optional erhältlich.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/schrankenzaun-inkl-fuss.jpeg']::text[], '{"Ausführung":"RA2 weiß/rot","Inklusive":"1× Fußplatte K1 TL","Warnleuchte":"Optional erhältlich"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"ZLRA2E"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'blockbatterie-6v', '6V Blockbatterie (Verkauf)', NULL, '6V Blockbatterie, 7,5 Ah – für Warnleuchten und Absperrtechnik. Packungsinhalt: 1 Stück.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/blockbatterie-6v.jpeg']::text[], '{"Spannung":"6 Volt","Kapazität":"7,5 Ah","Packungsinhalt":"1 Stück","Hinweis":"Verkaufsartikel"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"T17EOU"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'warnbarke-ra1', 'Warnbarke weiß/rot, RA 1', NULL, 'Warnbarke mit RA1-Folie, beidseitig beklebt, ohne Fuß, ca. 2 kg.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/warnbarke-ra1.jpeg']::text[], '{"Reflektionsklasse":"RA1","Beklebung":"Beidseitig","Gewicht":"ca. 2 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"DHE9HH"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'warnbarke-ra2-ohne-fuss', 'Warnbarke weiß/rot, RA 2', NULL, 'Warnbarke mit RA2-Folie, beidseitig beklebt, ohne Fuß, ca. 2 kg.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/warnbarke-ra2.jpeg']::text[], '{"Reflektionsklasse":"RA2","Beklebung":"Beidseitig","Gewicht":"ca. 2 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"U9BFGZ","bonn":"FD2IMJ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'warnbarke-ra2', 'Warnbarke mit Fuß, RA2', NULL, 'Warnbarke mit RA2-Folie inkl. Fußplatte K! TL, beidseitig beklebt. Warnleuchte optional erhältlich.', NULL, 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/warnbarke-mit-fuss.jpeg','/product-images/warnbarke-mit-fuss-transport.jpeg']::text[], '{"Reflektionsklasse":"RA2","Beklebung":"Beidseitig","Fußplatte":"K! TL","Warnleuchte":"Optional erhältlich"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"U9BFGZ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'lichtsignalanlage-lza-500-led', 'Lichtsignalanlage LZA 500 LED', 'LZA 500 LED', 'Mobile Baustellenampel mit 2 LED-Signalgebern, 12 V Akkubetrieb, Quarz- oder Funksteuerung, klappbare Standrohre – inkl. 2 Akkus und Ladegerät.', 'Die Lichtsignalanlage LZA 500 LED besteht aus 2 Signalgebern mit LED-Leuchten im 12-Volt-Akkubetrieb, Sonnenblenden, Quarzsteuerung und klappbaren Standrohren. Inklusive 2 Akkus und Ladegerät.

Im Funkbetrieb lassen sich bis zu 4 Signalgeber koppeln, im Kabelbetrieb bis zu 16 Signalgeber. Laufzeit mit Batterie 12 V / 180 Ah: 550 Std., mit Batterie 12 V / 230 Ah: 700 Std.', 'absperrtechnik',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/absperrtechnik/lza-500-led-1.jpeg','/product-images/absperrtechnik/lza-500-led-2.png']::text[], '{"Signalgeber":"2 Stück, LED","Stromversorgung":"12 V Akkubetrieb","Ausstattung":"Sonnenblenden, klappbare Standrohre","Steuerung":"Quarzsteuerung","Funkbetrieb":"Bis zu 4 Signalgeber","Kabelbetrieb":"Bis zu 16 Signalgeber","Laufzeit (180 Ah)":"550 Std.","Laufzeit (230 Ah)":"700 Std.","Lieferumfang":"2 Signalgeber, 2 Akkus, Ladegerät"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      'ab 69 €', NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"1AAK8N"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'soundboks-gen3', 'Soundboks Gen.3', NULL, 'Tragbarer Outdoor-Lautsprecher mit 126 dB max. SPL und bis zu 40 Stunden Akkulaufzeit bei halber Lautstärke. Bluetooth 5.0 mit SKAA-Technologie: Bis zu 5 Soundboks lassen sich im "TeamUP"-Modus drahtlos verbinden (kostenlose App im App Store / Play Store). Im nächsten Schritt können Sie zusätzliche Akkus reservieren.', NULL, 'beschallung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/soundboks-gen3-1.jpeg','/product-images/soundboks-gen3-2.jpeg','/product-images/soundboks-gen3-3.jpeg']::text[], '{"Leistung":"3 × 72 W","Verstärker":"Merus Audio Eximo Class-D","Bestückung":"2× 10\" Subwoofer, 1× 1\" Hochtöner","Max. Schalldruckpegel":"126 dB SPL","Bluetooth":"5.0 + SKAA (TeamUP-Modus)","Max. Verbund":"bis zu 5 Geräte","Akku":"1× Akku mit 5-stufiger LED-Anzeige","Akkulaufzeit":"40 h (50 % Lautstärke) / 5 h (100 %)","Ladezeit":"3,5 Stunden (230 V)","Gewicht":"15,4 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"48MYNA","bonn":"7ELXMB"}'::jsonb, FALSE, '/manuals/soundboks-gen3-bedienungsanleitung.pdf',
      NULL, 'https://youtu.be/HEQiWWrrjM8', ARRAY['https://youtu.be/HEQiWWrrjM8','https://youtu.be/u6BDAf2W4x8']::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'soundboks-batteryboks', 'Soundboks Batteryboks', NULL, 'Ersatz-Akku passend für Soundboks Gen.3 und Gen.4. Mit 40 Stunden Akkulaufzeit bei halber Lautstärke bzw. 5 Stunden bei voller Lautstärke und einer Ladezeit von nur 3,5 Stunden.', NULL, 'beschallung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/soundboks-batteryboks-1.jpeg']::text[], '{"Kompatibilität":"Soundboks Gen.3 und Gen.4","Akkulaufzeit (50% Lautstärke)":"40 Stunden","Akkulaufzeit (100% Lautstärke)":"5 Stunden","Ladezeit":"3,5 Stunden"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"6FQZ3A","bonn":"O567KS"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'soundsystem-2-1-1400w', '2.1 Soundsystem 1400W RMS – mit eingebautem Mischpult und Bluetooth-Empfänger – bis zu 75 Personen', NULL, 'Aktive 2.1 PA-Anlage mit 1400W RMS Systemleistung, integriertem 4-Kanal-Mischpult und bereits enthaltenem Bluetooth-Empfänger. Bis zu 75 Personen, 126 dB Lautstärke, einfacher Aufbau. Inkl. 1× Stativ, 1× Distanzstange, 1× 3m & 1× 5m Speakonkabel sowie Miniklinke-auf-XLR Adapter.', 'Kompakte 2.1 PA-Anlage mit 1400W RMS – ideal für mobile DJs, Hochzeiten, Geburtstage, Firmenfeiern und kleinere Open-Air-Events mit bis zu 75 Personen.

✅ 1400W RMS Systemleistung, bis zu 126 dB
✅ Integriertes 4-Kanal-Mischpult (XLR, AUX, Klinke)
✅ Bluetooth-Empfänger im Set enthalten – direkt vom Smartphone streamen
✅ Aktiv mit eingebauter Endstufe – keine externe Endstufe nötig
✅ Komplett-Set inkl. Stativ, Distanzstange, Speakon-Kabeln (3 m & 5 m) und Miniklinke-auf-XLR-Adapter
✅ Schneller Aufbau in wenigen Minuten
✅ Gesamtgewicht ca. 55 kg – transportabel im Pkw oder Kombi

Perfekt für alle, die eine professionell klingende, einsatzfertige Anlage mit Bluetooth-Streaming für mittelgroße Räume und Open-Air-Veranstaltungen suchen.', 'beschallung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/soundsystem-1400w-1.jpeg','/product-images/soundsystem-1400w-2.jpeg']::text[], '{"Systemleistung":"1400W RMS","Geeignet für":"bis zu ca. 75 Personen","Max. Schalldruckpegel":"126 dB","Mischpult":"Integriertes 4-Kanal Mischpult","Anschlüsse":"XLR, AUX, Klinke","Bluetooth-Empfänger":"Im Set enthalten","Verbindung":"Kabellos / Bluetooth","Lieferumfang":"1× Stativ, 1× Distanzstange, 1× 3m & 1× 5m Speakonkabel, Miniklinke-auf-XLR Adapter, Bluetooth-Empfänger","Gewicht":"ca. 55 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"HP9CD4","bonn":"SIHY5A"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'das-soundsystem-3500w', 'D.A.S. Soundsystem 3500W RMS – bis zu 250 Personen', NULL, 'Große Aktiv-PA mit 3500W RMS – 2× 18" Subwoofer + 2× 12" Topteile von DAS Audio. Bluetooth-Streaming, App-Steuerung, Live-Musik-Presets. Für bis zu 250 Personen, indoor & outdoor. Inkl. Distanzstangen, Powercon-Link- und XLR-Kabeln.', 'Professionelle PA-Anlage von DAS Audio mit 3500W RMS Systemleistung – ideal für Hochzeiten, Firmenfeiern, DJ-Partys, Open-Air-Events und Live-Musik mit bis zu 250 Personen.

✅ 2× DAS Audio VANTEC-18A Aktiv-Subwoofer (18 Zoll) – druckvoller Tiefbass
✅ 2× DAS Audio VANTEC-12A Aktiv-Topteile (12 Zoll) – klare Mitten & Höhen
✅ Eingebaute Endstufen & DSP – keine externe Endstufe nötig
✅ Bluetooth-Empfänger in den Topteilen – direkt vom Smartphone streamen
✅ Steuerung & Presets per DAS Audio Aliante App (iOS/Android)
✅ Werkseitige DSP-Presets, u.a. für Live-Musik, DJ/Playback und Sprache
✅ Komplett-Set inkl. 2× Distanzstangen, 2× Hybrid-Powercon-Linkkabeln (3 m) & 2× XLR-Kabeln (10 m)
✅ Indoor & Outdoor einsetzbar

Aufbau in wenigen Minuten: Subwoofer aufstellen, Distanzstange aufsetzen, Topteil aufstecken, Powercon-Link- und XLR-Kabel verbinden, Strom anschließen – fertig. Per Bluetooth Musik streamen oder via XLR ein Mischpult/DJ-Pult anschließen.

Gesamtgewicht: ca. 130 kg. Auf Wunsch liefern wir die Anlage direkt zu deiner Veranstaltung – sprich uns einfach an.', 'beschallung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/das-soundsystem-3500w-1.jpeg']::text[], '{"Systemleistung":"3500W RMS","Geeignet für":"bis zu ca. 250 Personen","Subwoofer":"2× DAS Audio VANTEC-18A (aktiv, 18\")","Tops":"2× DAS Audio VANTEC-12A (aktiv, 12\")","Bluetooth":"Ja (in den Topteilen integriert)","App-Steuerung":"DAS Audio Aliante App (iOS/Android)","Presets":"u.a. Live-Musik, DJ/Playback, Sprache","Distanzstangen":"2× Distanzstange (inkl.)","Verbindungskabel":"2× Hybrid-Audio-Powercon Link Kabel 3m","XLR Kabel":"2× XLR Kabel 10m","Einsatz":"Indoor & Outdoor","Gesamtgewicht":"ca. 130 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"4WX78O","bonn":"IGH3BH"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'das-action-508a', 'D.A.S. Audio Action 508A', NULL, 'Aktiver 8" Lautsprecher mit 720 W und 122 dB max. SPL. Ideal für kleinere Veranstaltungen, Sprachbeschallungen und als Monitor. Optional sind Lautsprecherstative erhältlich, welche Sie im nächsten Schritt auswählen können.', NULL, 'beschallung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/das-action-508a-1.jpeg','/product-images/das-action-508a-2.jpeg']::text[], '{"Typ":"Aktiv, 2-Wege","Leistung":"720 W (Peak)","Bestückung":"1× 8\", 1,4\" Tweeter","Abstrahlwinkel":"90° × 60°","Max. Schalldruckpegel":"122 dB SPL (Peak, 1 m)","Zubehör":"Lautsprecherstative optional erhältlich"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"CU51C2"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'das-vantec-12a', 'D.A.S. Audio Vantec 12A', NULL, 'Aktiver 12" Lautsprecher mit 1500 W und Bluetooth. Ideal für Veranstaltungen, Partys und Sprachbeschallungen. Optional sind Lautsprecherstative erhältlich, welche Sie im nächsten Schritt auswählen können.', NULL, 'beschallung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/das-vantec-12a-1.jpeg','/product-images/das-vantec-12a-2.jpeg','/product-images/das-vantec-12a-3.jpeg']::text[], '{"Typ":"Aktiv, 2-Wege","Leistung":"1500 W (Peak)","Bestückung":"1× 12\", 3\" Tweeter","Bluetooth":"Ja","Abstrahlwinkel":"90° × 50°","Max. Schalldruckpegel":"135 dB SPL (Peak, 1 m)","Zubehör":"Lautsprecherstative optional erhältlich"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"TJOHWT"}'::jsonb, FALSE, '/manuals/das-vantec-12a-bedienungsanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'das-vantec-18a', 'D.A.S. Audio Vantec 18A', NULL, 'Aktiver 18" Subwoofer mit 2000 W und 134 dB max. SPL. Kraftvoller Bass für Veranstaltungen jeder Größe. Optional sind Distanzstangen erhältlich, welche Sie im nächsten Schritt auswählen können.', NULL, 'beschallung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/das-vantec-18a-1.jpeg','/product-images/das-vantec-18a-2.jpeg','/product-images/das-vantec-18a-3.jpeg']::text[], '{"Typ":"Aktiv, Subwoofer","Leistung":"2000 W (Peak)","Bestückung":"1× 18\"","Max. Schalldruckpegel":"134 dB SPL (Peak, 1 m)","Zubehör":"Distanzstangen optional erhältlich"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"I3RY5W"}'::jsonb, FALSE, '/manuals/das-vantec-18a-bedienungsanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'km-distanzstange-21366', 'K&M 21366 Distanzstange', NULL, 'Distanzstange zur Montage von Lautsprechern auf Subwoofern. Stabil, höhenverstellbar und passend für gängige 35-mm-Flansche.', NULL, 'beschallung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/km-21366-distanzstange-1.jpeg']::text[], '{"Verwendung":"Montage von Tops auf Subwoofern","Anschluss":"35-mm-Flansch (oben & unten)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"MVFUVW"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'midas-dl16-stagebox', 'Midas DL16 Digital Stagebox', NULL, '16-Kanal digitale Stagebox', NULL, 'beschallung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{"Kanäle":"24","Eingänge":"16x XLR + 1x AES50","Ausgänge":"8x XLR + 1x AES50"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"BIAGN6"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'yamaha-dm3', 'Yamaha DM3 – Digitalmischpult (Dante-Version)', NULL, '16-Kanal Digitalmischpult für Studio-, Stream- und Live-Anwendungen mit 9" Multi-Touchscreen, 9 Motorfadern und integriertem 16×16 Dante-Interface. Kompakt, leistungsstark und vielseitig.', NULL, 'beschallung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/yamaha-dm3-1.jpeg','/product-images/yamaha-dm3-2.jpeg','/product-images/yamaha-dm3-3.jpeg']::text[], '{"Kanäle":"16 Mono + 1 Stereo + 2 FX Return","Ausgänge":"8 Ausgänge","Busse":"1 Stereo, 6 Mix, 2 FX, 2 Matrix (Input to Matrix)","Display":"9\" Multi-Touchscreen","Fader":"9 Motorfader","Bedienung":"\"Touch and Turn\"-Regler","USB Audio Interface":"18 × 18, 48 kHz / 96 kHz","Dante Interface":"16 × 16 (16 Ein- und Ausgänge)","Aufnahme/Wiedergabe":"2 × 2 Kanal über USB Port","Effekte":"18 wählbare Effekte + GEQ auf Mix 1–6 & Stereo Bus","Frei belegbare Taster":"6","DAW Remote":"HUI","OSC Unterstützung":"Ja (für Installationen)","Abmessungen (B × H × T)":"320 × 140 × 455 mm","Gewicht":"6,5 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"1BNTNX"}'::jsonb, FALSE, '/manuals/yamaha-dm3-anleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'pioneer-cdj2000-nxs', 'Pioneer CDJ 2000 NXS', NULL, 'Professioneller DJ-Multiplayer mit Kompatibilität für Smartphones (USB/Wi-Fi), USB-Speichermedien, SD-Karten und CDs. Mit Beat-Sync, detailliertem Display und Wave-Zoom Funktion für präzises Beat Matching.', NULL, 'beschallung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/pioneer-cdj2000-nxs-1.jpeg','/product-images/pioneer-cdj2000-nxs-2.jpeg','/product-images/pioneer-cdj2000-nxs-3.jpeg']::text[], '{"Abspielbare Medien":"Smartphone (USB/Wi-Fi), USB, SD-Karte, Audio CD, CD-R/RW, DVD","Abspielbare Dateien":"MP3, AAC, WAV, AIFF","Frequenzgang":"4 Hz – 20 kHz","Rauschabstand":"115 dB oder größer","Klirrfaktor":"0,0018% oder kleiner","USB-Anschlüsse":"2×","Audioausgänge":"1× Stereo Out (Cinch), 1× Digital Out (Koaxial)","Weitere Anschlüsse":"1× LAN, 1× Control (3,5 mm Minibuchse)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"PAVOZ5"}'::jsonb, FALSE, '/manuals/pioneer-cdj2000-nxs-bedienungsanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'pioneer-djm900-nxs2', 'Pioneer DJM 900 NXS2', NULL, 'Der neue DJM 900 NXS2 unterstützt den ersten 64-bit Mixing Prozessor von Pioneer, der für einen wärmeren und detaillierten Sound sorgt. Der EQ und die Fader Kurven wurden verbessert und die FX Steuerung wurde erweitert, um noch mehr kreative Möglichkeiten zu bieten. Der vielseitige DJM 900 Nexus 2 hat unabhängige Send/Return Wege, 4 Phono Eingänge und 2 USB Ports, für noch mehr Flexibilität.', NULL, 'beschallung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/pioneer-djm900-nxs2-1.jpeg','/product-images/pioneer-djm900-nxs2-2.jpeg','/product-images/pioneer-djm900-nxs2-3.jpeg']::text[], '{"Audiokanäle":"4","Mikrofonkanäle":"2","Send/Return":"1× Send (6,3 mm Klinke), 1× Return (6,3 mm Klinke)","USB-Anschlüsse":"2× USB-B","Link Anschluss":"1×","D/A-Wandler":"32-Bit","A/D-Wandler":"24-Bit","Frequenzgang":"20 Hz – 40 kHz","Klirrfaktor":"0,005 % oder niedriger","Maße (B × T × H)":"333 × 414 × 108 mm","Gewicht":"8 kg"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"SZ3C5J"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'shure-qlxd4e-empfaenger', 'Shure QLXD4E Empfänger', NULL, 'Digitaler Funkempfänger', NULL, 'beschallung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{"Frequenzbereich":"606-670MHz"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"5O2XVJ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'shure-qlxd2-beta58-handsender', 'Shure QLXD2/Beta58 Handsender', NULL, 'Handfunkmikrofon', NULL, 'beschallung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{"Frequenzbereich":"606-670MHz"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"5ZVFRZ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'shure-qlxd1-taschensender', 'Shure QLXD1 Taschensender', NULL, 'Taschensender für Headsets', NULL, 'beschallung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{"Frequenzbereich":"606-670MHz"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"C9OJPF"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'funkmikrofon', 'Sennheiser Funkmikrofon XSW 1-835', NULL, 'Professionelles UHF-Funkmikrofon-Set von Sennheiser mit ca. 25m Reichweite (je nach Umgebung). Ideal für Präsentationen, Veranstaltungen und Bühnenauftritte.', NULL, 'beschallung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/sennheiser-xsw1-1.jpeg']::text[], '{"Empfänger":"EM-XSW 1 (stationär)","Handsender":"SKM 835-XSW","Reichweite":"ca. 25 m (umgebungsabhängig)","Lieferumfang":"1× Empfänger, 1× Handsender, 1× Netzteil NT 12-5 CW, 1× XLR-Kabel 1,5m, 1× Mikrofonklemme MZQ 1, 2× AA Batterien"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"6UTPYZ","bonn":"PX1N8H"}'::jsonb, FALSE, '/manuals/sennheiser-xsw1-bedienungsanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'uhf-funkgeraet', 'UHF Funkgeräte 6er Set (Retevis RT29)', NULL, 'Professionelles UHF-Funkgerät-Set mit 6 Geräten des Typs Retevis RT29 inkl. 6-fach Ladestation. Mit 10 W Ausgangsleistung und einem 3200 mAh Akku für bis zu 168 Stunden Standby-Betrieb. Ideal für Veranstaltungen, Baustellen und Events. Weiteres Zubehör finden Sie im nächsten Schritt.', NULL, 'kommunikation',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/retevis-rt29-1.jpeg','/product-images/retevis-rt29-set-new.jpeg','/product-images/retevis-rt29-set-1.jpeg','/product-images/retevis-rt29-set-2.jpeg','/product-images/retevis-rt29-set-3.jpeg','/product-images/retevis-rt29-set-4.jpeg']::text[], '{"Typ":"Retevis RT29","Ausgangsleistung":"10 W","Frequenzbereich":"400–430 MHz (UHF)","Akku":"3200 mAh Li-Ion","Standby-Laufzeit":"bis zu 168 Stunden","Reichweite (städtisch)":"3–5 km","Reichweite (offenes Gelände)":"bis zu 8 km","VOX-Freisprechfunktion":"Ja","Lieferumfang":"6× Funkgerät + 6-fach Ladestation"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"PGC49X"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'uhf-funkgeraet-lautsprecher', 'UHF Funkgerät Lautsprecher', NULL, 'Externer Lautsprecher für Funkgerät', NULL, 'kommunikation',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{"Lautsprecher für Typ":"Retevis RT29"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"OZHNRX"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'led-outdoorscheinwerfer-tourled50xcr', 'LED Outdoorscheinwerfer TourLED 50 XCR', NULL, 'Professioneller LED-Outdoorscheinwerfer mit RGBW-LEDs – ideal für Fassadenanstrahlungen, Eventbeleuchtung und Außeneinsätze. Statisch oder mit Farbprogrammen betreibbar, spritzwassergeschützt nach IP65, inkl. PowerCon True1 Kabel, Super Clamp und Safety 5mm.', NULL, 'beleuchtung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/tourled-50-xcr-1.jpeg','/product-images/tourled-50-xcr-2.jpeg','/product-images/tourled-50-xcr-3.jpeg']::text[], '{"LEDs":"RGBW","Betrieb":"Statisch oder Farbprogramme","Schutzklasse":"IP65 (Spritzwasser geschützt)","Lieferumfang":"1× PowerCon True1 Kabel, 1× Super Clamp, 1× Safety 5mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"QKTPFF","bonn":"7NA19B"}'::jsonb, FALSE, '/manuals/tourled-50-xcr-manual.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'led-beleuchtungsset-single', 'LED Beleuchtungsset single – 4in1 Multieffekt Lichtanlage', NULL, 'Komplett-Lichtanlage mit 2× LED Moving Heads, 2× RGBW Derby-Effekten, 4× weißem Stroboskop und 2× RGBW-LED Scheinwerfern. Programmbetrieb oder Sound to Light möglich. Inkl. 5m Anschlusskabel, Stativ und 2 Tragetaschen.', NULL, 'beleuchtung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/led-beleuchtungsset-single-1.jpeg']::text[], '{"Inhalt":"2× LED Moving Head, 2× RGBW Derby-Effekt, 4× weißes Stroboskop, 2× RGBW-LED Scheinwerfer","Betrieb":"Programmbetrieb oder Sound to Light","Lieferumfang":"1× 5m Anschlusskabel, 1× Stativ, 2× Tasche"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"G47Y4H","bonn":"YPSGY4"}'::jsonb, FALSE, '/manuals/led-beleuchtungsset-single-manual.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'led-beleuchtungsset-duo', 'LED Beleuchtungsset duo – 2× 4in1 Multieffekt Lichtanlage', NULL, 'Doppeltes Komplettpaket: 2× LED Beleuchtungsset, jeweils mit 2× LED Moving Heads, 2× RGBW Derby-Effekten, 4× weißem Stroboskop und 2× RGBW-LED Scheinwerfern. Programmbetrieb oder Sound to Light möglich. Ideal für größere Veranstaltungen.', NULL, 'beleuchtung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/led-beleuchtungsset-duo-1.jpeg']::text[], '{"Inhalt":"2× Komplettset: je 2× LED Moving Head, 2× RGBW Derby-Effekt, 4× weißes Stroboskop, 2× RGBW-LED Scheinwerfer","Betrieb":"Programmbetrieb oder Sound to Light","Lieferumfang":"2× 5m Anschlusskabel, 2× Stativ, 4× Tasche"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"63GT72","bonn":"H5HKTK"}'::jsonb, FALSE, '/manuals/led-beleuchtungsset-duo-manual.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'led-moving-head-vector-spot', 'LED Moving Head – Vector Spot Zoom 2.0', NULL, 'Professioneller 230-Watt LED Moving Head mit motorisiertem Zoom, Farbrad (7 Farben + Weiß), rotierendem 5-/6-Facetten-Prisma und zwei Gobo-Rädern. Regenbogeneffekt mit variabler Geschwindigkeit in beide Richtungen. DMX-steuerbar (6/18 Kanal) oder autonomer Betrieb.', NULL, 'beleuchtung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/vector-spot-zoom-20-2.jpeg','/product-images/vector-spot-zoom-20-3.jpeg','/product-images/vector-spot-zoom-20-1.png']::text[], '{"Leistung":"230 Watt LED","PAN-Bewegung":"540° (16-bit)","TILT-Bewegung":"270° (16-bit)","Zoom":"motorisiert, 11°–25°","Farbrad":"7 Farben + Weiß, Regenbogeneffekt","Gobos":"7 rotierende + 7 statische Gobos (je offen)","Prisma":"5-Facetten- & 6-Facetten-Prisma, bidirektional rotierend","Dimmer":"0–100 %","Stroboskop":"0–20 Hz","DMX-Modi":"6-Kanal und 18-Kanal","Betriebsmodi":"DMX, Auto, Sound, Master/Slave","Anschlüsse":"PowerCon In/Out, DMX In/Out (3- & 5-polig)","Schutzklasse":"IP20 (nur Innenbereich)","Gewicht":"12,5 kg","Maße (L×B×H)":"328 × 220 × 482 mm","Lieferumfang":"2× Omega-Bracket, 1× Stromkabel"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"VE92CT","bonn":"EKOMK2"}'::jsonb, FALSE, '/manuals/vector-spot-zoom-20-manual.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'slt-led-fluter-rgbwauv', 'SLT LED Fluter RGBWAUV – LED Flutlicht-Scheinwerfer (44×15W) IP65', NULL, 'Professioneller LED-Flutlicht-Scheinwerfer mit 44×15W LEDs in RGBWA+UV – ideal für Fassadenanstrahlungen, Eventbeleuchtung und Outdoor-Einsätze. IP65 wetterfest, inkl. PowerCon True1 Kabel, Super Clamp und Safety.', NULL, 'beleuchtung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/slt-led-fluter-rgbwauv-1.jpeg','/product-images/slt-led-fluter-rgbwauv-2.jpeg','/product-images/slt-led-fluter-rgbwauv-3.jpeg','/product-images/slt-led-fluter-rgbwauv-4.jpeg']::text[], '{"LEDs":"44 × 15 W","Farben":"RGBWA + UV","Abstrahlwinkel":"25°","Schutzklasse":"IP65","Lieferumfang":"1× PowerCon True1 Kabel, 1× Super Clamp, 1× Safety 5mm"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"5N4U12"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'showtec-sunstrip-active-mkii', 'Showtec Sunstrip Active MKII', NULL, 'Professionelle Stage-Blinder-Leiste mit 10× GU10 50W Leuchtmitteln, eingebauten Programmen und DMX-Steuerung (1, 2, 5 oder 10 Kanäle). Mit Powercon In/Output sowie Montage- und Bodenbefestigung – ideal für Bühnenblinder und Ambientebeleuchtung.', NULL, 'beleuchtung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/showtec-sunstrip-mkii-1.jpg','/product-images/showtec-sunstrip-mkii-2.jpg']::text[], '{"Leuchtmittel":"10× Showtec 240V / 50W GU10 (inkl.)","Stromspannung":"240V 50Hz","Stromverbrauch":"550W","Strom":"3,5A","Sicherung":"F6,3A","DMX-Kanäle":"wählbar: 1, 2, 5 oder 10 Kanäle","Anschluss":"Powercon In & Output","Abmessungen":"1000 × 130 × 77 mm","Gewicht":"5,32 kg","Lieferumfang":"inkl. Montage- / Bodenbefestigung, inkl. Leuchtmittel"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"1E8ME4"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'party-ton-licht-set', 'Party Ton & Licht-Set', NULL, 'Komplettpaket aus 2× LED Beleuchtungsset (4in1 Multieffekt) und 1× 2.1 Soundsystem mit 1.400 Watt – für bis zu 75 Personen.', 'Das Party Ton & Licht-Set ist das Rundum-Sorglos-Paket für Veranstaltungen mit bis zu 75 Personen. Es besteht aus 2× LED Beleuchtungsset (4in1 Multieffekt Lichtanlage) und 1× aktiver 2.1 Anlage mit 1.400 W RMS Systemleistung.

LED Beleuchtungsset (2×):
Je 2× LED Moving Heads, 2× RGBW Derby-Effekte, 4× weißes Stroboskop und 2× RGBW-LED Scheinwerfer. Programmbetrieb oder Sound to Light möglich. Inkl. je 1× 5m Anschlusskabel, 1× Stativ und 2× Tasche.

2.1 Soundsystem:
Aktive Anlage mit integriertem 4-Kanal Mischpult, Bluetooth-Empfänger und 126 dB max. Lautstärke. Anschlüsse: XLR, AUX, Klinke. Inkl. 1× Stativ, 1× Distanzstange, 1× 3m & 1× 5m Speakonkabel, Miniklinke auf XLR Adapter.', 'beleuchtung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/party-ton-licht-set-1.jpg']::text[], '{"Inhalt Licht":"2× LED Beleuchtungsset (4in1 Multieffekt)","Inhalt Ton":"1× 2.1 Soundsystem 1.400 W RMS","Max. Personenzahl":"bis 75 Personen","Max. Lautstärke":"126 dB","Verbindung":"Bluetooth, XLR, AUX, Klinke","Mischpult":"Integriertes 4-Kanal Mischpult","Gewicht Soundsystem":"55 kg","Lieferumfang Licht":"2× 5m Anschlusskabel, 2× Stativ, 4× Tasche","Lieferumfang Ton":"1× Stativ, 1× Distanzstange, 1× 3m & 1× 5m Speakonkabel, Miniklinke-XLR Adapter, Bluetooth Empfänger"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"8UGDZU","bonn":"7QEBFQ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'led-outdoorscheinwerfer-6er-set', 'LED Outdoorscheinwerfer 6er-Set', NULL, '6× LED Outdoorscheinwerfer (14 × 5 W Osram RGBW-LED, IP65) inkl. Transportcase, PowerCon True One Kabel, Super Clamps und Safetys.', 'Das LED Outdoorscheinwerfer 6er-Set besteht aus 6 robusten LED-Scheinwerfern mit je 14 × 5 Watt Osram RGBW-LEDs. Dank Schutzart IP65 sind die Scheinwerfer für den Außeneinsatz bei jeder Witterung geeignet.

Lieferumfang:
• 6× LED Outdoorscheinwerfer (14 × 5 W Osram RGBW-LED, IP65)
• 6× PowerCon True One Kabel
• 6× Super Clamp
• 6× Safety 5 mm
• 1× Transportcase', 'beleuchtung',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/led-outdoorscheinwerfer-6er-set-1.jpg']::text[], '{"Anzahl Scheinwerfer":"6 Stück","LEDs pro Scheinwerfer":"14 × 5 W Osram RGBW","Schutzart":"IP65 (Outdoor)","Lieferumfang":"6× PowerCon True One Kabel, 6× Super Clamp, 6× Safety 5 mm, 1× Transportcase"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"CCPT5S","bonn":"IEAV6M"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'nivtec-systempodest-2x0-5m', 'Nivtec 2m x 0,5m Systempodest', NULL, 'Bühnenelement 2m x 0,5m', NULL, 'buehne',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"L6A4BP"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'nivtec-systempodest-2x0-75m', 'Nivtec 2m x 0,75m Systempodest', NULL, 'Bühnenelement 2m x 0,75m', NULL, 'buehne',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"MFU3TU"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'nivtec-systempodest-2x1m', 'Nivtec 2m x 1m Systempodest', NULL, 'Bühnenelement 2m x 1m', NULL, 'buehne',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"3W8MV3"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'nivtec-teleskopfuss-40cm', 'Nivtec Teleskopfuß 40cm', NULL, 'Bühnenfuß höhenverstellbar bis 40cm', NULL, 'buehne',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"H7AMWK"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'nivtec-teleskopfuss-80cm', 'Nivtec Teleskopfuß 80cm', NULL, 'Bühnenfuß höhenverstellbar bis 80cm', NULL, 'buehne',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"3M8QIY"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'nivtec-verstellspindelfuss-60cm', 'Nivtec Verstellspindelfuß 60cm', NULL, 'Spindelfuß für Niveauausgleich bis 60cm', NULL, 'buehne',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"5E7SZC"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'manfrotto-autopole-032b', 'Manfrotto 032B Autopole schwarz', NULL, 'Spannstange für Hintergründe und Licht', NULL, 'buehne',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"OE1X1T"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'milos-m290-multicube-black', 'Milos M290 Multicube black', NULL, 'Traversenverbinder schwarz', NULL, 'traversen-rigging',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"2VTASC"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'milos-m290-qtu-500-black', 'Milos M290 P4 QTU 500 black', NULL, '4-Punkt Traverse 0,5m schwarz', NULL, 'traversen-rigging',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"B1UCON"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'milos-m290-qtu-1000-black', 'Milos M290 P4 QTU 1000 black', NULL, '4-Punkt Traverse 1m schwarz', NULL, 'traversen-rigging',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"DHFDR9"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'milos-m290-qtu-1500-black', 'Milos M290 P4 QTU 1500 black', NULL, '4-Punkt Traverse 1,5m schwarz', NULL, 'traversen-rigging',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"B93VX1"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'milos-m290-qtu-2000-black', 'Milos M290 P4 QTU 2000 black', NULL, '4-Punkt Traverse 2m schwarz', NULL, 'traversen-rigging',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"UDELEF"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'milos-m290-ubpqc-base-black', 'Milos M290 P4 UBPQC Base black', NULL, 'Traversenbodenplatte schwarz', NULL, 'traversen-rigging',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"TL4W2L"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'traversen-cover-weiss-2m', 'Traversen Cover weiß 2m', NULL, 'Stoffcover für Traverse 2m', NULL, 'traversen-rigging',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"2YQ15O"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'traversen-cover-weiss-3m', 'Traversen Cover weiß 3m', NULL, 'Stoffcover für Traverse 3m', NULL, 'traversen-rigging',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"WDP947"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'partyzelt-3x3m', 'Party- / Eventzelt 3x3m', NULL, 'Party- / Eventzelt mit 9 m² Grundfläche – UV-beständige 500 g/m² PVC-Plane (rasterfaserverstärkt), inkl. Dachspanner gegen Wassersäcken. Trocken zurückgeben – andernfalls fällt eine Trocknungspauschale von 60 € an.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/masse-3x3.avif','/product-images/partyzelt-3x3-1.jpeg','/product-images/partyzelt-weiss-allgemein.jpeg','/product-images/partyzelt-3x3-2.avif']::text[], '{"Grundfläche":"9 m² (3 m × 3 m)","Farbe":"weiß","Material":"UV-beständige 500 g/m² PVC-Plane, rasterfaserverstärkt","Kapazität (Stehend)":"ca. 15 Personen (0,6 m²/Person)","Kapazität (Bestuhlung)":"ca. 13 Personen (0,71 m²/Person)","Hinweis":"Trocken zurückgeben (Trocknungspauschale 60 € bei Nichtbeachtung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"U5FLRB","bonn":"ZPBA4S"}'::jsonb, FALSE, '/manuals/aufbauanleitung-classicpro-3x3.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'partyzelt-4x4m', 'Party- / Eventzelt 4x4m', NULL, 'Party- / Eventzelt mit 16 m² Grundfläche – UV-beständige 500 g/m² PVC-Plane (rasterfaserverstärkt), inkl. Dachspanner gegen Wassersäcken. Trocken zurückgeben – andernfalls fällt eine Trocknungspauschale von 60 € an.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/masse-4x4.avif','/product-images/partyzelt-4x4-1.jpeg','/product-images/partyzelt-weiss-allgemein.jpeg']::text[], '{"Grundfläche":"16 m² (4 m × 4 m)","Farbe":"weiß","Material":"UV-beständige 500 g/m² PVC-Plane, rasterfaserverstärkt","Kapazität (Stehend)":"ca. 27 Personen (0,6 m²/Person)","Kapazität (Bestuhlung)":"ca. 23 Personen (0,71 m²/Person)","Hinweis":"Trocken zurückgeben (Trocknungspauschale 60 € bei Nichtbeachtung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"4ZSXIQ"}'::jsonb, FALSE, '/manuals/partyzelt-4x4-aufbauanleitung.pdf',
      NULL, NULL, ARRAY['https://www.youtube.com/watch?v=kh1RA96IBcU']::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'partyzelt-4x6m', 'Party- / Eventzelt 4x6m', NULL, 'Party- / Eventzelt mit 24 m² Grundfläche – UV-beständige 500 g/m² PVC-Plane (rasterfaserverstärkt), inkl. Dachspanner gegen Wassersäcken. Trocken zurückgeben – andernfalls fällt eine Trocknungspauschale von 100 € an.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/masse-4x6.avif','/product-images/partyzelt-4x6-1.jpeg','/product-images/partyzelt-weiss-allgemein.jpeg']::text[], '{"Grundfläche":"24 m² (4 m × 6 m)","Farbe":"weiß","Material":"UV-beständige 500 g/m² PVC-Plane, rasterfaserverstärkt","Kapazität (Stehend)":"ca. 40 Personen (0,6 m²/Person)","Kapazität (Bestuhlung)":"ca. 34 Personen (0,71 m²/Person)","Hinweis":"Trocken zurückgeben (Trocknungspauschale 100 € bei Nichtbeachtung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"K12XM9","bonn":"6GI1UN"}'::jsonb, FALSE, '/manuals/partyzelt-4x6-aufbauanleitung.pdf',
      NULL, NULL, ARRAY['https://www.youtube.com/watch?v=kh1RA96IBcU']::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'partyzelt-4x8m', 'Party- / Eventzelt 4x8m', NULL, 'Party- / Eventzelt mit 32 m² Grundfläche – UV-beständige 500 g/m² PVC-Plane (rasterfaserverstärkt), inkl. Dachspanner gegen Wassersäcken. Trocken zurückgeben – andernfalls fällt eine Trocknungspauschale von 100 € an.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/partyzelt-4x10-1.jpeg','/product-images/partyzelt-weiss-allgemein.jpeg']::text[], '{"Grundfläche":"32 m² (4 m × 8 m)","Farbe":"weiß","Material":"UV-beständige 500 g/m² PVC-Plane, rasterfaserverstärkt","Kapazität (Stehend)":"ca. 53 Personen (0,6 m²/Person)","Kapazität (Bestuhlung)":"ca. 45 Personen (0,71 m²/Person)","Hinweis":"Trocken zurückgeben (Trocknungspauschale 100 € bei Nichtbeachtung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"6QCPH6"}'::jsonb, FALSE, '/manuals/partyzelt-4x6-aufbauanleitung.pdf',
      NULL, NULL, ARRAY['https://www.youtube.com/watch?v=kh1RA96IBcU']::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'partyzelt-4x10m', 'Party- / Eventzelt 4x10m', NULL, 'Modularzelt mit 40 m² Grundfläche – zusammengesetzt aus einem 4×6m und einem 4×4m Zelt, trocken verbunden durch eine Regenrinne. UV-beständige 500 g/m² PVC-Plane (rasterfaserverstärkt), inkl. Dachspanner gegen Wassersäcken. Trocken zurückgeben – andernfalls fällt eine Trocknungspauschale von 100 € an.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/partyzelt-4x10-1.jpeg','/product-images/partyzelt-weiss-allgemein.jpeg','/product-images/partyzelt-4x14-2.jpeg','/product-images/partyzelt-4x14-1.jpeg']::text[], '{"Grundfläche":"40 m² (4 m × 10 m)","Aufbau":"4×6m + 4×4m, verbunden mit Regenrinne","Farbe":"weiß","Material":"UV-beständige 500 g/m² PVC-Plane, rasterfaserverstärkt","Kapazität (Stehend)":"ca. 67 Personen (0,6 m²/Person)","Kapazität (Bestuhlung)":"ca. 56 Personen (0,71 m²/Person)","Hinweis":"Trocken zurückgeben (Trocknungspauschale 100 € bei Nichtbeachtung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"7EW3HR"}'::jsonb, FALSE, '/manuals/partyzelt-4x10-aufbauanleitung.pdf',
      NULL, NULL, ARRAY['https://www.youtube.com/watch?v=kh1RA96IBcU']::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'partyzelt-4x14m', 'Party- / Eventzelt 4x14m', NULL, 'Großes Modularzelt mit 56 m² Grundfläche – zusammengesetzt aus einem 4×6m und zwei 4×4m Zelten, trocken verbunden durch eine Regenrinne. UV-beständige 500 g/m² PVC-Plane (rasterfaserverstärkt), inkl. Dachspanner gegen Wassersäcken. Trocken zurückgeben – andernfalls fällt eine Trocknungspauschale von 100 € an.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/partyzelt-4x14-1.jpeg','/product-images/partyzelt-weiss-allgemein.jpeg','/product-images/partyzelt-4x14-2.jpeg','/product-images/partyzelt-4x14-3.jpeg']::text[], '{"Grundfläche":"56 m² (4 m × 14 m)","Aufbau":"4×6m + 2× 4×4m, verbunden mit Regenrinne","Farbe":"weiß","Material":"UV-beständige 500 g/m² PVC-Plane, rasterfaserverstärkt","Kapazität (Stehend)":"ca. 93 Personen (0,6 m²/Person)","Kapazität (Bestuhlung)":"ca. 79 Personen (0,71 m²/Person)","Hinweis":"Trocken zurückgeben (Trocknungspauschale 100 € bei Nichtbeachtung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, FALSE, '/manuals/partyzelt-4x14-aufbauanleitung.pdf',
      NULL, NULL, ARRAY['https://www.youtube.com/watch?v=kh1RA96IBcU']::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'partyzelt-5x8m', 'Party- / Eventzelt 5x8m extra hoch', NULL, 'Party- / Eventzelt mit 40 m² Grundfläche und extra hoher Durchgangshöhe von 2,6 m – inkl. Seiten- und Stirnwände sowie Dachstangen gegen die Bildung von Wassersäcken. UV-beständige 500 g/m² PVC-Plane (rasterfaserverstärkt), ähnlich einer LKW-Plane. Trocken zurückgeben – andernfalls fällt eine Trocknungspauschale von 150 € an.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/partyzelt-5x8-1.avif','/product-images/partyzelt-5x8-2.jpeg','/product-images/partyzelt-5x8-3.jpeg','/product-images/partyzelt-weiss-allgemein.jpeg']::text[], '{"Grundfläche":"40 m² (5 m × 8 m)","Durchgangshöhe":"2,6 m (extra hoch)","Farbe":"weiß","Inklusive":"Seiten- und Stirnwände, Dachstangen","Material":"UV-beständige 500 g/m² PVC-Plane, rasterfaserverstärkt","Kapazität (Stehend)":"ca. 66 Personen (0,6 m²/Person)","Kapazität (Bestuhlung)":"ca. 56 Personen (0,71 m²/Person)","Hinweis":"Trocken zurückgeben (Trocknungspauschale 150 € bei Nichtbeachtung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"MI45AU"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'eventzelt-6x8m', 'Party- / Eventzelt 6x8m extra hoch', NULL, 'Party- / Eventzelt mit 48 m² und extra hoher Durchgangshöhe von 2,6m – inkl. Seiten- und Stirnwände. UV-beständige 500 g/m² PVC-Plane (rasterfaserverstärkt), inkl. Dachstangen gegen Wassersäcken. Trocken zurückgeben – andernfalls fällt eine Trocknungspauschale von 150 € an.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/masse-6x8.avif','/product-images/eventzelt-6x8-1.jpeg','/product-images/partyzelt-weiss-allgemein.jpeg','/product-images/eventzelt-6x8-2.jpeg','/product-images/eventzelt-6x8-3.jpeg']::text[], '{"Grundfläche":"48 m² (6 m × 8 m)","Durchgangshöhe":"2,6 m (extra hoch)","Farbe":"weiß","Inklusive":"Seiten- und Stirnwände, Dachstangen","Material":"UV-beständige 500 g/m² PVC-Plane, rasterfaserverstärkt","Kapazität (Stehend)":"ca. 80 Personen (0,6 m²/Person)","Kapazität (Bestuhlung)":"ca. 68 Personen (0,71 m²/Person)","Hinweis":"Trocken zurückgeben (Trocknungspauschale 150 € bei Nichtbeachtung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"7PGYQB"}'::jsonb, FALSE, '/manuals/aufbauanleitung-giant-6m.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'partyzelt-5x12m', 'Party- / Eventzelt 5x12m extra hoch', NULL, 'Party- / Eventzelt mit 60 m² Grundfläche und extra hoher Durchgangshöhe von 2,3 m – feuerfest nach EN-13501-1. UV-beständige 500 g/m² PVC-Plane (rasterfaserverstärkt), ähnlich einer LKW-Plane, inkl. Dachspanner gegen die Bildung von Wassersäcken. Trocken zurückgeben – andernfalls fällt eine Trocknungspauschale von 150 € an.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/partyzelt-5x12-1.avif','/product-images/partyzelt-weiss-allgemein.jpeg']::text[], '{"Grundfläche":"60 m² (5 m × 12 m)","Durchgangshöhe":"2,3 m (extra hoch)","Farbe":"weiß","Material":"UV-beständige 500 g/m² PVC-Plane, rasterfaserverstärkt","Brandschutz":"feuerfest nach EN-13501-1","Inklusive":"Dachspanner gegen Wassersäcke","Kapazität (Stehend)":"ca. 100 Personen (0,6 m²/Person)","Kapazität (Bestuhlung)":"ca. 84 Personen (0,71 m²/Person)","Hinweis":"Trocken zurückgeben (Trocknungspauschale 150 € bei Nichtbeachtung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"GKQJTC"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'eventzelt-6x12m', 'Party- / Eventzelt 6x12m extra hoch', NULL, 'Großes Party- / Eventzelt mit 72 m² und extra hoher Durchgangshöhe von 2,6m – feuerfest nach EN-13501-1. UV-beständige 500 g/m² PVC-Plane (rasterfaserverstärkt), inkl. Dachspanner gegen Wassersäcken. Trocken zurückgeben – andernfalls fällt eine Trocknungspauschale von 130 € an.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/masse-6x12.avif','/product-images/eventzelt-6x12-1.jpeg','/product-images/partyzelt-weiss-allgemein.jpeg','/product-images/eventzelt-6x12-2.jpeg']::text[], '{"Grundfläche":"72 m² (6 m × 12 m)","Durchgangshöhe":"2,6 m (extra hoch)","Farbe":"weiß","Material":"UV-beständige 500 g/m² PVC-Plane, rasterfaserverstärkt","Brandschutz":"feuerfest nach EN-13501-1","Kapazität (Stehend)":"ca. 120 Personen (0,6 m²/Person)","Kapazität (Bestuhlung)":"ca. 101 Personen (0,71 m²/Person)","Hinweis":"Trocken zurückgeben (Trocknungspauschale 130 € bei Nichtbeachtung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"O3E6TK"}'::jsonb, FALSE, '/manuals/aufbauanleitung-giant-6m.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'zeltboden-anthrazit', 'Event- / Zeltboden Anthrazit', NULL, 'Robuster Event- und Zeltboden aus recyceltem Kunststoff-Mix mit Nut-und-Feder-System für lückenlosen, stabilen Bodenbelag – ideal für Zelte, Outdoor-Events und temporäre Veranstaltungsflächen. Anthrazit, rutschfeste Oberfläche, ca. 15 t/m² belastbar. Besenrein zurückzugeben.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/zeltboden-anthrazit-1.jpeg','/product-images/zeltboden-anthrazit-2.jpeg','/product-images/zeltboden-anthrazit-3.jpeg','/product-images/zeltboden-extra-1.jpeg','/product-images/zeltboden-extra-2.jpeg','/product-images/zeltboden-extra-3.jpeg','/product-images/zeltboden-extra-4.jpeg','/product-images/zeltboden-extra-5.jpeg']::text[], '{"Material":"Recycelter Kunststoff-Mix","Abmessung":"1.000 × 860 mm (0,86 m²)","Nutzfläche":"0,80 m²/Stück","Mattenstärke":"23 mm","Farbe":"Anthrazit","Belastbarkeit":"ca. 15 t/m² (fester Untergrund)","Verbindung":"Nut-und-Feder-System","Gewicht":"15 kg/Stück","Rückgabe":"besenrein"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      'ab 1 €', NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"2RKZVT","bonn":"266FGI"}'::jsonb, FALSE, '/manuals/slt-rental-datenblatt-eventboden.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bierzeltgarnitur-set', 'Bierzeltgarnitur-Set', NULL, 'Klassische Bierzeltgarnitur als Set: 1× Tisch (50×220 cm) + 2× Bank (25×220 cm). Optional sind weiße Hussen für Tisch und Bänke erhältlich – im nächsten Schritt der Bestellung hinzufügbar.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/bierzeltgarnitur-set-1.jpeg','/product-images/bierzeltgarnitur-set-2.jpeg','/product-images/bierzeltgarnitur-set-3.jpeg']::text[], '{"Set-Inhalt":"1× Tisch + 2× Bänke","Tischmaß":"50 × 220 cm","Bankmaß":"25 × 220 cm","Zubehör (optional)":"Hussen in weiß (Tisch & Bank) – im Bestellprozess hinzufügbar"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      'ab 8 €', NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"5S2ECT","bonn":"PTPDTD"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bierzeltgarnitur-hussen-set-weiss', 'Bierzeltgarnitur Hussen-Set weiß', NULL, 'Elegantes weißes Hussen-Set für Bierzeltgarnituren. 1 Set = 2× Bankhusse + 1× Tischhusse. Gewaschen zurückzugeben.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/bierzeltgarnitur-hussen-weiss-1.jpeg']::text[], '{"Set-Inhalt":"2× Bankhusse + 1× Tischhusse","Bankhusse":"25 × 220 cm","Tischhusse":"50 × 220 cm","Farbe":"weiß","Rückgabe":"gewaschen"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"1MYLJ5","bonn":"6AVVWR"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'stehtisch', 'Stehtisch', NULL, 'Runder, klappbarer Stehtisch – ideal für Events, Empfänge und Partys. Stabile Metallbeine, pflegeleichte Kunststoffplatte.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/stehtisch-rund-1.jpeg']::text[], '{"Form":"rund","Abmessungen":"Ø 80 cm × H 110 cm","Bauweise":"klappbar"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      'ab 5 €', NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"J1MZJQ","bonn":"DYAJ56"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'stehtisch-husse-weiss', 'Stehtisch Husse weiß', NULL, 'Elegante weiße Stretch-Husse für runde Stehtische (Ø 80 cm, H 110 cm). Gewaschen zurückzugeben – Reinigung gegen Aufpreis möglich.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/stehtisch-husse-weiss-1.jpeg']::text[], '{"Farbe":"weiß","Passend für":"Stehtisch Ø 80 cm × H 110 cm","Rückgabe":"gewaschen (Reinigung gegen Aufpreis möglich)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"AOZ99O","bonn":"QGPZGO"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'stehtisch-husse-schwarz', 'Stehtisch Husse schwarz', NULL, 'Elegante schwarze Stretch-Husse für runde Stehtische (Ø 80 cm, H 110 cm). Gewaschen zurückzugeben – Reinigung gegen Aufpreis möglich.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/stehtisch-husse-schwarz-1.jpg']::text[], '{"Farbe":"schwarz","Passend für":"Stehtisch Ø 80 cm × H 110 cm","Rückgabe":"gewaschen (Reinigung gegen Aufpreis möglich)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"V9E8C7"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'klappstuhl-event-black', 'Klappstuhl Event black', NULL, 'Wetterbeständiger Event-Klappstuhl mit Stahlrohrgestell und Polypropylen-Sitzschale. Stapelbar bis 50 Stück, Belastbarkeit max. 120 kg, mit praktischer Regenabfluss-Bohrung in der Sitzfläche.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/moebel/klappstuhl-event-4505050-awzr41xgq1dhtz.jpg.webp','/product-images/moebel/klappstuhl-event-4505050_3d.jpg.webp','/product-images/moebel/klappstuhl-event-4505050_3h.jpg.webp','/product-images/moebel/klappstuhl-event-4505050-02la3xtmriarxhi.jpg.webp','/product-images/moebel/klappstuhl-event-4505050-d.jpg.webp','/product-images/moebel/klappstuhl-event-4505050-01qu0piv2hby4xm.jpg.webp','/product-images/moebel/klappstuhl-event-4505050-b.jpg.webp','/product-images/moebel/klappstuhl-event-4505050_3i.jpg.webp']::text[], '{"Farbe":"schwarz","Material Gestell":"geschweißtes Stahlrohr (Ø 19 × 1,20 mm)","Material Sitz / Rückenlehne":"Polypropylen","Sitzhöhe":"45 cm","Sitzfläche":"39,5 × 40 cm","Stuhlhöhe (offen)":"80,5 cm","Stuhlhöhe (geklappt)":"97 cm","Stuhltiefe (offen)":"44 cm","Abmessungen zusammengeklappt":"97 × 45,5 cm","Belastbarkeit":"max. 120 kg","Gewicht":"3,4 kg","Stapelhöhe":"bis 50 Stück (eingeklappt)","Pro Euro-Palette":"100 Stühle (2 Stapel à 50)","Besonderheit":"Regenabfluss-Bohrung in der Sitzfläche"}'::jsonb, ARRAY[]::text[], ARRAY['stuhl']::text[], ARRAY[]::text[],
      'ab 1,90 €', NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"KKVNMJ","bonn":"KRQ7C7"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kleiderstaender-rollen', 'Kleiderständer mit Rollen inkl. Bügel', NULL, 'Robuster, ausziehbarer Garderobenständer auf Rollen mit bis zu 90 kg Tragkraft – inkl. 20 Holz-Kleiderbügel (schwarz). Ideal für Events, Messen, Fotostudios und Garderobenbereiche.', 'Sie besitzen viele Kleidungsstücke, aber es fehlt an Stauraum in Ihrem Kleiderschrank? Dann heißen Sie diesen Garderobenständer willkommen! Er ist eine neue Aufbewahrungsmöglichkeit für Ihr Zuhause sowie eine optimale Ergänzung zu Ihrem Kleiderschrank!

Perfekt für den Heimgebrauch geeignet – an der Kleiderstange aufgehängt, sehen Ihre Jacken immer so aus, als hätten Sie sie gerade erst gebügelt.

Auch für den gewerblichen Gebrauch geeignet – stellen Sie diesen Kleiderständer in Ihr Bekleidungsgeschäft oder Fotostudio und hängen Sie verschiedene Kleidungsstücke hieran auf. Dank der 4 Rollen lässt er sich mühelos an jede beliebige Stelle schieben. Demontieren Sie einfach den oberen Teil und klappen Sie den unteren Teil zusammen, um den Transport zu erleichtern.

Inkl. 20 Stk. Kleiderbügel Holz schwarz! Die max. Belastbarkeit bezieht sich auf das statische Maximalgewicht.', 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/moebel/kleiderstaender-rollen-1.webp','/product-images/moebel/kleiderstaender-rollen-2.jpg','/product-images/moebel/kleiderstaender-rollen-3.jpg','/product-images/moebel/kleiderstaender-rollen-4.jpg']::text[], '{"Farbe":"Schwarz","Material":"Eisenrohr, pulverbeschichtet","Größe (L × B × H)":"(92–132) × 45,4 × 160 cm","Kleiderstange":"ausziehbar von 92 cm auf 132 cm","Max. Belastbarkeit":"90 kg (statisch)","Gewicht":"5 kg","Rollen":"4 × Lenkrollen mit Bremse","Inklusive":"20 Stk. Kleiderbügel Holz schwarz"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"CQBBQC"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kleiderstaender-rollen-ohne-buegel', 'Kleiderständer mit Rollen, black', NULL, 'Robuster, ausziehbarer Garderobenständer auf Rollen mit bis zu 90 kg Tragkraft – ohne Kleiderbügel. Ideal für Events, Messen, Fotostudios und Garderobenbereiche.', 'Robuster, ausziehbarer Garderobenständer auf Rollen – ohne Kleiderbügel.

Perfekt für den Heimgebrauch geeignet – an der Kleiderstange aufgehängt, sehen Ihre Jacken immer so aus, als hätten Sie sie gerade erst gebügelt.

Auch für den gewerblichen Gebrauch geeignet – stellen Sie diesen Kleiderständer in Ihr Bekleidungsgeschäft oder Fotostudio und hängen Sie verschiedene Kleidungsstücke hieran auf. Dank der 4 Rollen lässt er sich mühelos an jede beliebige Stelle schieben. Demontieren Sie einfach den oberen Teil und klappen Sie den unteren Teil zusammen, um den Transport zu erleichtern.

Die max. Belastbarkeit bezieht sich auf das statische Maximalgewicht.', 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/moebel/kleiderstaender-rollen-1.webp','/product-images/moebel/kleiderstaender-rollen-2.jpg','/product-images/moebel/kleiderstaender-rollen-3.jpg','/product-images/moebel/kleiderstaender-rollen-4.jpg']::text[], '{"Farbe":"Schwarz","Material":"Eisenrohr, pulverbeschichtet","Größe (L × B × H)":"(92–132) × 45,4 × 160 cm","Kleiderstange":"ausziehbar von 92 cm auf 132 cm","Max. Belastbarkeit":"90 kg (statisch)","Gewicht":"5 kg","Rollen":"4 × Lenkrollen mit Bremse"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"UL3K2S"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kleiderbuegel-20er-set', 'Kleiderbügel 20er Set, black', NULL, '20 Holz-Kleiderbügel (schwarz). Ideal für Events, Messen, Fotostudios und Garderobenbereiche.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/moebel/kleiderbuegel-schwarz.jpg']::text[], '{"Anzahl":"20 Stück","Material":"Holz","Farbe":"Schwarz"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"BLMZ6M"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'getraenkekuehlschrank-236l', 'Getränkekühlschrank 236l', NULL, 'Gewerblicher Glastürkühlschrank mit LED-Beleuchtung und 236 l Fassungsvermögen – ideal für Events und Catering.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/getraenkekuehlschrank-236l-1.jpeg','/product-images/getraenkekuehlschrank-236l-2.jpeg','/product-images/getraenkekuehlschrank-236l-3.jpeg']::text[], '{"Fassungsvermögen":"236 l","Abmessung (B×T×H)":"54 cm × 55 cm × 144 cm","Gewicht":"45 kg","Beleuchtung":"LED","Tür":"Glastür"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      'ab 20 €', NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"Q3VB7F"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'sonnenschirm', 'Sonnenschirm Premium Ø 3 m', NULL, 'Hochwertiger Marktschirm mit FSC®-zertifizierter Hartholzstange und UV-beständiger, wasserabweisender Polyesterbespannung.
Mit praktischer Neigungsfunktion für optimalen Schatten – auch bei tiefem Sonnenstand.
Belüftungsöffnung reduziert Winddruck. Öffnen und Schließen per Zugschnur.
Sonnenschirmständer (mind. 35 kg empfohlen) nicht im Lieferumfang.', NULL, 'moebel-zelte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/sonnenschirm-1.jpeg','/product-images/sonnenschirm-2.jpeg','/product-images/sonnenschirm-3.jpeg','/product-images/sonnenschirm-4.jpeg','/product-images/sonnenschirm-5.jpeg']::text[], '{"Durchmesser":"3 m","Höhe":"2,6 m","Farbe":"weiß/natur","Material Stange":"Lackiertes FSC® 100 % Hartholz","Material Bespannung":"UV-beständiges Polyester, wasserabweisend","Neigungsfunktion":"Ja – Schirmkopf kippbar","Öffnungsmechanismus":"Zugschnur","Belüftung":"Belüftungsöffnung oben (reduziert Winddruck)","Ständer":"Nicht enthalten – mind. 35 kg empfohlen"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"UIHFH3","bonn":"S8U5XL"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'longdrinkglas-passionata-25er', 'Longdrinkglas Passionata 460ml, 25er Set', NULL, 'Schott Zwiesel Passionata Longdrinkglas, 460 ml, Tritan®-Kristallglas. Spülmaschinenfest, kratzfest & bruchsicher. Reinigungspauschale: 3,90 €/Set. Glasbruch: 5,00€/Glas.', 'Die Schott Zwiesel Passionata Longdrinkgläser im 25er Set – zeitloses Design trifft auf hochwertigen Luxus. Hergestellt aus Tritan®-Kristallglas, sind diese Gläser klar, kratzfest und extrem bruchsicher. Mit 460 ml Fassungsvermögen perfekt für Longdrinks, Cocktails, Mocktails oder einfach erfrischendes Wasser. Das kraftvolle, schlanke Design mit massivem Sockel garantiert gute Stabilität und liegt bequem in der Hand. Spülmaschinenfest – bleibt immer klar, ohne matt zu werden. Ideal für Events, Caterings und private Feiern. Bitte beachten: Die Gläser müssen gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 3,90 € pro Set erhoben. Glasbruch wird mit 5,00 € pro Glas berechnet.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/longdrinkglas-passionata-2.jpg','/product-images/geschirr/longdrinkglas-passionata-1.avif','/product-images/geschirr/longdrinkglas-passionata-3.avif']::text[], '{"Hersteller":"Schott Zwiesel","Serie":"Passionata","Material":"Tritan®-Kristallglas","Fassungsvermögen":"460 ml","Typ":"Longdrinkglas","Spülmaschinenfest":"Ja","Eigenschaft":"Kratzfest & bruchsicher","Stückzahl":"25 Stück pro Set","Reinigungspauschale":"3,90 € pro Set (bei Rückgabe ohne Reinigung)","Glasbruch":"5,00 € pro Glas"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"SORKGR","bonn":"BJRX3W"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'wasserglas-passionata-25er', 'Wasserglas Passionata 460ml, 25er Set', NULL, 'Schott Zwiesel Passionata Wasserglas, 460 ml, Tritan®-Kristallglas. Spülmaschinenfest, kratzfest & bruchsicher. Reinigungspauschale: 3,90 €/Set. Glasbruch: 5,00€/Glas.', 'Die Schott Zwiesel Passionata Wassergläser im 25er Set – zeitloses Design trifft auf hochwertigen Luxus. Hergestellt aus Tritan®-Kristallglas, sind diese Gläser klar, kratzfest und extrem bruchsicher. Mit 460 ml Fassungsvermögen perfekt für Wasser, Softdrinks und erfrischende Getränke. Das kraftvolle, schlanke Design mit massivem Sockel garantiert gute Stabilität und liegt bequem in der Hand. Spülmaschinenfest – bleibt immer klar, ohne matt zu werden. Ideal für Events, Caterings und private Feiern. Bitte beachten: Die Gläser müssen gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 3,90 € pro Set erhoben. Glasbruch wird mit 5,00 € pro Glas berechnet.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/wasserglas-passionata.jpg']::text[], '{"Hersteller":"Schott Zwiesel","Serie":"Passionata","Material":"Tritan®-Kristallglas","Fassungsvermögen":"460 ml","Typ":"Wasserglas","Höhe":"11,6 cm","Durchmesser":"9,0 cm","Spülmaschinenfest":"Ja","Eigenschaft":"Kratzfest & bruchsicher","Stückzahl":"25 Stück pro Set","Reinigungspauschale":"3,90 € pro Set (bei Rückgabe ohne Reinigung)","Glasbruch":"5,00 € pro Glas"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"PVBY61","bonn":"ZBETJO"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'weissweinglas-passionata-25er', 'Weißweinglas Passionata, 25er Set', NULL, 'Schott Zwiesel Passionata Weißweinglas, 450 ml, Tritan®-Kristallglas. Aromaverstärkend, spülmaschinenfest & nachhaltig. Reinigungspauschale: 3,90 €/Set.', 'Das Schott Zwiesel Passionata Weißweinglas im 10er Set – optimiert für den aromatischen Ausdruck von Weißweinen. Die Kombination aus dünnen Wänden und stabilem Boden bietet ein erhabenes Trinkerlebnis. Hergestellt aus Tritan®-Kristallglas – klar, kratzfest und extrem bruchsicher. Spülmaschinenfest und unter Berücksichtigung von Nachhaltigkeit und Umweltverantwortung hergestellt. Ideal für gehobene Veranstaltungen, Caterings und private Feiern. Bitte beachten: Die Gläser müssen gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 3,90 € pro Set erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/weissweinglas-passionata-1.jpg','/product-images/geschirr/weissweinglas-passionata-2.jpg','/product-images/geschirr/weissweinglas-passionata-3.jpg','/product-images/geschirr/weissweinglas-passionata-4.jpg']::text[], '{"Hersteller":"Schott Zwiesel","Serie":"Passionata","Material":"Tritan®-Kristallglas","Typ":"Weißweinglas","Fassungsvermögen":"450 ml","Farbe":"Klar","Spülmaschinenfest":"Ja","Eigenschaft":"Aromaverstärkend, kratzfest, nachhaltig","Stückzahl":"25 Stück pro Set","Reinigungspauschale":"3,90 € pro Set (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"B98IC4","bonn":"NSLH2C"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rotweinglas-passionata-25er', 'Rotweinglas Passionata, 20er Set', NULL, 'Schott Zwiesel Passionata Rotweinglas, Tritan®-Kristallglas. Bruchsicher, kratzfest & spülmaschinenfest. Reinigungspauschale: 3,90 €/Set.', 'Das Schott Zwiesel Passionata Rotweinglas im 20er Set – bruchsichere Klasse für Rotwein. Speziell geformt, um die Aromen und den Geschmack von Rotwein optimal zur Geltung zu bringen. Hergestellt aus patentiertem Tritan®-Kristallglas, das extrem bruchfest und kratzfest ist. Langanhaltender Glanz auch nach tausenden Spülvorgängen. Abmessungen ca. 94 × 94 × 238 mm (B × T × H). Perfekt für gehobene Veranstaltungen, Caterings und private Feiern. Bitte beachten: Die Gläser müssen gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 3,90 € pro Set erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/rotweinglas-passionata-1.jpg','/product-images/geschirr/rotweinglas-passionata-2.avif','/product-images/geschirr/rotweinglas-passionata-3.jpg']::text[], '{"Hersteller":"Schott Zwiesel","Serie":"Passionata","Material":"Tritan®-Kristallglas","Typ":"Rotweinglas","Farbe":"Transparent","Abmessung (B×T×H)":"ca. 94 × 94 × 238 mm","Spülmaschinenfest":"Ja","Eigenschaft":"Bruchsicher, kratzfest, langanhaltender Glanz","Stückzahl":"20 Stück pro Set","Reinigungspauschale":"3,90 € pro Set (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"S2KNX3","bonn":"HCSX3O"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'sektglas-passionata-36er', 'Sektglas Passionata, 36er Set', NULL, 'Schott Zwiesel Passionata Sektglas, 325 ml, Tritan®-Kristallglas. Reinigungspauschale: 3,90 €/Set.', 'Das Schott Zwiesel Passionata Sektglas im 36er Set – feierliche Eleganz mit jeder Flasche. Das hohe, schlanke Design verstärkt das Prickeln und den Geschmack von Sekt und Champagner. Hergestellt aus bleifreiem Tritan®-Kristallglas, das extrem bruchfest und kratzfest ist. Spülmaschinenfest mit langanhaltender Brillanz. Ideal für gehobene Veranstaltungen, Empfänge und festliche Anlässe. Bitte beachten: Die Gläser müssen gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 3,90 € pro Set erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/champagnerglas-passionata-1.jpg','/product-images/geschirr/champagnerglas-passionata-2.jpg','/product-images/geschirr/champagnerglas-passionata-3.jpg','/product-images/geschirr/champagnerglas-passionata-4.jpg']::text[], '{"Hersteller":"Schott Zwiesel","Serie":"Passionata","Material":"Tritan®-Kristallglas (bleifrei)","Typ":"Sektglas / Sektflöte","Fassungsvermögen":"325 ml","Farbe":"Transparent","Spülmaschinenfest":"Ja","Eigenschaft":"Bruchsicher, kratzfest, langanhaltender Glanz","Stückzahl":"36 Stück pro Set","Reinigungspauschale":"3,90 € pro Set (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"F66UKS","bonn":"7CD2SE"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'rotweinglas-brunelli-9er', 'Rotweinglas Brunelli, 9er Set', NULL, 'Rotweinglas von Leonardo, Höhe 23,8 cm, Ø 11,5 cm. Klar, stoßfest & spülmaschinenfest. Reinigungspauschale: 3,90 €/Set. Glasbruch: 5,00€/Glas.', 'Das Rotweinglas Brunelli von Leonardo im 9er Set – ein elegantes Burgunderglas mit großzügigem Kelch für optimale Aromaentfaltung. Klar, stoßfest und spülmaschinenfest. Mit 23,8 cm Höhe und 11,5 cm Durchmesser ideal für gehobene Veranstaltungen, Caterings und private Feiern. Bitte beachten: Die Gläser müssen gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 3,90 € pro Set erhoben. Glasbruch wird mit 5,00 € pro Glas berechnet.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/rotweinglas-brunelli-1.jpeg','/product-images/geschirr/rotweinglas-brunelli-2.jpeg']::text[], '{"Hersteller":"Leonardo","Typ":"Rotweinglas","Höhe":"23,8 cm","Durchmesser":"11,5 cm","Spülmaschinenfest":"Ja","Eigenschaft":"Klar & stoßfest","Stückzahl":"9 Stück pro Set","Reinigungspauschale":"3,90 € pro Set (bei Rückgabe ohne Reinigung)","Glasbruch":"5,00 € pro Glas"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"C2Z5S4","bonn":""}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'weissweinglas-brunelli-25er', 'Weißweinglas Brunelli, 25er Set', NULL, 'Weißweinglas von Leonardo, Höhe 23,7 cm, Ø 8,5 cm. Klar, stoßfest & spülmaschinenfest. Reinigungspauschale: 3,90 €/Set. Glasbruch: 5,00€/Glas.', 'Das Weißweinglas Brunelli von Leonardo im 25er Set – elegant, klar und stoßfest. Die schlanke Form mit 23,7 cm Höhe bringt Weißweine optimal zur Geltung. Spülmaschinenfest und ideal für gehobene Veranstaltungen, Caterings und private Feiern. Bitte beachten: Die Gläser müssen gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 3,90 € pro Set erhoben. Glasbruch wird mit 5,00 € pro Glas berechnet.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/weisweinglas-brunelli-1.jpeg']::text[], '{"Hersteller":"Leonardo","Typ":"Weißweinglas","Höhe":"23,7 cm","Durchmesser":"8,5 cm","Stückzahl":"25 Stück pro Set","Eigenschaften":"Klar, stoßfest, spülmaschinenfest","Reinigungspauschale":"3,90 € pro Set (bei Rückgabe ohne Reinigung)","Glasbruch":"5,00 € pro Glas"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"CFDC7J"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'champagnerglas-brunelli-36er', 'Champagnerglas Brunelli, 36er Set', NULL, 'Sekt-/Champagnerglas von Leonardo. Höhe 25,4 cm, Durchmesser 7,8 cm. Spülmaschinenfest, klar & stoßfest. Reinigungspauschale: 3,90 €/Set. Glasbruch: 5,00€/Glas.', 'Das Champagnerglas Brunelli von Leonardo im praktischen 36er Set besticht durch seine elegante, schlanke Silhouette. Ideal für Sekt, Champagner und Prosecco bei Veranstaltungen, Hochzeiten und Caterings. Die Gläser sind spülmaschinenfest, klar und stoßfest. Bitte beachten: Die Gläser müssen gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 3,90 € pro Set erhoben. Glasbruch wird mit 5,00 € pro Glas berechnet.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/champagnerglas-brunelli-1.jpeg','/product-images/geschirr/champagnerglas-brunelli-2.jpeg']::text[], '{"Hersteller":"Leonardo","Typ":"Sekt-/Champagnerglas","Höhe":"25,4 cm","Durchmesser":"7,8 cm","Stückzahl":"36 Stück pro Set","Spülmaschinenfest":"Ja","Eigenschaften":"Klar & stoßfest","Reinigungspauschale":"3,90 € pro Set (bei Rückgabe ohne Reinigung)","Glasbruch":"5,00 € pro Glas"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"SLGIZH"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'willi-becher-0-2l-40er', 'Bierglas 0,2, 50er Set', NULL, 'Bierglas 0,2L geeicht von VAN WELL. Spülmaschinenfest. Die Gläser müssen gereinigt zurückgegeben werden. Reinigungspauschale: 3,90 €.', 'Hochwertiges Bierglas 0,2L geeicht vom Hersteller VAN WELL im praktischen 50er Set. Die Gläser sind spülmaschinenfest und eignen sich ideal für Veranstaltungen, Caterings und private Feiern. Bitte beachten: Die Gläser müssen gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 3,90 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/bierglas-02-1.jpeg']::text[], '{"Hersteller":"VAN WELL","Volumen":"0,2 L (geeicht)","Höhe":"13,5 cm","Durchmesser":"6 cm","Stückzahl":"50 Stück pro Set","Spülmaschinenfest":"Ja","Reinigungspauschale":"3,90 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"RH1TFT"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kaffeetasse-12er', 'Kaffeetasse, 12er Set', NULL, 'Kaffeetasse weiß aus Porzellan inkl. Untertasse. Fassungsvermögen ca. 200 ml. Die Tassen müssen gereinigt zurückgegeben werden. Reinigungspauschale: 2,50 €/Set.', 'Klassische Kaffeetasse im 12er Set aus weißem Porzellan, inklusive passender Untertasse. Mit einem Fassungsvermögen von ca. 200 ml und einem Untertassen-Durchmesser von 16 cm ideal für Veranstaltungen, Caterings und private Feiern. Bitte beachten: Die Tassen müssen gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,50 € pro Set erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/kaffeetasse-12er-1.png','/product-images/geschirr/kaffeetasse-12er-2.png']::text[], '{"Material":"Porzellan (weiß)","Fassungsvermögen":"ca. 200 ml","Durchmesser Untertasse":"16 cm","Stückzahl":"12 Tassen + 12 Untertassen pro Set","Reinigungspauschale":"2,50 € pro Set (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"W3X799","bonn":"UY8AV1"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'teller-deluxe-27-10er', 'Teller Deluxe 27, 10er Set', NULL, 'Speiseteller 27 cm, Hersteller Sänger, Serie Darwin. Spülmaschinenfest. Das Geschirr muss gereinigt zurückgegeben werden. Reinigungspauschale: 2,50 €.', 'Der Teller Deluxe 27 im 10er Set aus der Serie Darwin von Sänger. Das schlichte und dennoch elegante Design des Darwin Sets fügt sich nahtlos in jede Tischdekoration ein und passt zu verschiedenen Anlässen. Inspiriert von der gehobenen Sterneküche. Spülmaschinenfest – einfache und unkomplizierte Reinigung in der Spülmaschine oder auch von Hand. Bitte beachten: Das Geschirr muss gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,50 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/speiseteller-darwin-27-1.jpeg','/product-images/geschirr/speiseteller-darwin-27-2.jpeg','/product-images/geschirr/speiseteller-darwin-27-3.jpeg','/product-images/geschirr/speiseteller-darwin-27-4.jpeg','/product-images/geschirr/speiseteller-darwin-27-5.jpeg','/product-images/geschirr/speiseteller-darwin-27-6.jpeg']::text[], '{"Hersteller":"Sänger","Serie":"Darwin","Durchmesser":"27 cm","Design":"Vintage mit feiner Maserung","Spülmaschinenfest":"Ja","Stückzahl":"10 Stück pro Set","Reinigungspauschale":"2,50 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"NZWMHN","bonn":""}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'dessertteller-deluxe-21-10er', 'Dessertteller Deluxe 21, 10er Set', NULL, 'Dessertteller ØxH: 21,8x2,3 cm, Hersteller Sänger, Serie Darwin. Spülmaschinenfest. Das Geschirr muss gereinigt zurückgegeben werden. Reinigungspauschale: 2,50 €.', 'Der Dessertteller Deluxe 21 im 10er Set aus der Serie Darwin von Sänger. Das schlichte und dennoch elegante Design fügt sich nahtlos in jede Tischdekoration ein und passt zu verschiedenen Anlässen. Spülmaschinenfest. Bitte beachten: Das Geschirr muss gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,50 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/dessertteller-deluxe-21-1.jpeg','/product-images/geschirr/dessertteller-deluxe-21-2.jpeg','/product-images/geschirr/dessertteller-deluxe-21-3.jpeg','/product-images/geschirr/dessertteller-deluxe-21-4.jpeg','/product-images/geschirr/dessertteller-deluxe-21-5.jpeg','/product-images/geschirr/dessertteller-deluxe-21-6.jpeg']::text[], '{"Hersteller":"Sänger","Serie":"Darwin","Durchmesser":"21,8 cm","Höhe":"2,3 cm","Stückzahl":"10 Stück pro Set","Spülmaschinenfest":"Ja","Reinigungspauschale":"2,50 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"VIGSG2","bonn":""}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'teller-simply-25-10er', 'Teller SIMPLY 25, 10er Set', NULL, 'Teller weiß in Porzellanoptik, 25 cm. Das Geschirr muss gereinigt zurückgegeben werden. Reinigungspauschale: 2,50 €.', 'Der Teller SIMPLY 25 im 10er Set überzeugt durch seine elegante Porzellanoptik in Weiß und ist mit 25 cm Durchmesser ideal als Speiseteller für Hauptgerichte. Perfekt für Veranstaltungen, Caterings und private Feiern. Bitte beachten: Das Geschirr muss gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,50 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/teller-simply-25-1.jpeg','/product-images/geschirr/teller-simply-25-2.jpeg','/product-images/geschirr/teller-simply-25-3.jpeg','/product-images/geschirr/teller-simply-25-4.jpeg','/product-images/geschirr/teller-simply-25-5.jpeg','/product-images/geschirr/teller-simply-25-6.jpeg']::text[], '{"Material":"Porzellan (weiß)","Durchmesser":"25 cm","Stückzahl":"10 Stück pro Set","Reinigungspauschale":"2,50 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"1I2HWN","bonn":"UGNDNW"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'dessertteller-simply-19-10er', 'Dessertteller SIMPLY 19, 10er Set', NULL, 'Desserteller weiß in Porzellanoptik, 19cm. Das Geschirr muss gereinigt zurückgegeben werden. Reinigungspauschale: 2,50 €.', 'Der Dessertteller SIMPLY 19 im 10er Set überzeugt durch seine elegante Porzellanoptik in Weiß und ist mit 19 cm Durchmesser ideal für Desserts, Vorspeisen und Kuchen. Perfekt für Veranstaltungen, Caterings und private Feiern. Bitte beachten Sie: Das Geschirr muss gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,50 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/dessertteller-simply-19-1.jpeg','/product-images/geschirr/dessertteller-simply-19-2.jpeg','/product-images/geschirr/dessertteller-simply-19-3.jpeg','/product-images/geschirr/dessertteller-simply-19-4.jpeg','/product-images/geschirr/dessertteller-simply-19-5.jpeg']::text[], '{"Material":"Porzellan (weiß)","Durchmesser":"19 cm","Stückzahl":"10 Stück pro Set","Reinigungspauschale":"2,50 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"DRP3ZX","bonn":"1RWUHC"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'teller-tief-simply-20-10er', 'Teller tief SIMPLY 20, 10er Set', NULL, 'Suppenteller weiß in Porzellanoptik, 20 cm. Das Geschirr muss gereinigt zurückgegeben werden. Reinigungspauschale: 2,50 €.', 'Der Teller tief SIMPLY 20 im 10er Set – ein klassischer Suppenteller in eleganter weißer Porzellanoptik mit 20 cm Durchmesser. Ideal für Suppen, Eintöpfe, Pasta und Desserts. Perfekt für Veranstaltungen, Caterings und private Feiern. Bitte beachten: Das Geschirr muss gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,50 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/teller-tief-simply20-1.jpeg','/product-images/geschirr/teller-tief-simply20-2.jpeg']::text[], '{"Material":"Porzellan (weiß)","Typ":"Suppenteller / Teller tief","Durchmesser":"20 cm","Stückzahl":"10 Stück pro Set","Reinigungspauschale":"2,50 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"CYKHB6","bonn":"HAZLZ4"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'schuessel-deluxe-18-10er', 'Schüssel Deluxe 18, 10er Set', NULL, 'Suppenteller 18 cm, Füllmenge 700 ml. Hersteller Sänger, Serie Darwin. Das Geschirr muss gereinigt zurückgegeben werden. Reinigungspauschale: 2,50 €.', 'Die Schüssel Deluxe 18 im 10er Set aus der Serie Darwin von Sänger. Mit 18 cm Durchmesser und 700 ml Füllmenge ideal als Suppenteller oder Schale für Salate und Beilagen. Das schlichte und dennoch elegante Design des Darwin Sets fügt sich nahtlos in jede Tischdekoration ein und passt zu verschiedenen Anlässen. Spülmaschinenfest. Bitte beachten: Das Geschirr muss gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,50 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/schuessel-deluxe-darwin-18-1.jpeg','/product-images/geschirr/schuessel-deluxe-darwin-18-2.jpeg','/product-images/geschirr/schuessel-deluxe-darwin-18-3.jpeg','/product-images/geschirr/schuessel-deluxe-darwin-18-4.jpeg','/product-images/geschirr/schuessel-deluxe-darwin-18-5.jpeg','/product-images/geschirr/schuessel-deluxe-darwin-18-6.jpeg']::text[], '{"Hersteller":"Sänger","Serie":"Darwin","Durchmesser":"18 cm","Füllmenge":"ca. 700 ml","Design":"Vintage","Spülmaschinenfest":"Ja","Stückzahl":"10 Stück pro Set","Reinigungspauschale":"2,50 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"8SXZKZ","bonn":""}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'schuessel-simply-15-10er', 'Schüssel SIMPLY 15, 10er Set', NULL, 'Schüssel/Schale weiß in Porzellanoptik, 15 cm. Das Geschirr muss gereinigt zurückgegeben werden. Reinigungspauschale: 2,50 €.', 'Die Schüssel SIMPLY 15 im 10er Set in eleganter Porzellanoptik. Mit 15 cm Durchmesser ideal für Desserts, Beilagen, Salate und Suppen. Perfekt für Veranstaltungen, Caterings und private Feiern. Bitte beachten: Das Geschirr muss gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,50 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/schuessel-simply-15-1.jpeg','/product-images/geschirr/schuessel-simply-15-2.jpeg','/product-images/geschirr/schuessel-simply-15-3.jpeg','/product-images/geschirr/schuessel-simply-15-4.jpeg']::text[], '{"Material":"Porzellan (weiß)","Durchmesser":"15 cm","Stückzahl":"10 Stück pro Set","Reinigungspauschale":"2,50 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"7BS99N","bonn":"BD226L"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'aschenbecher-glas', 'Aschenbecher Glas', NULL, 'Glas-Aschenbecher Ø 10,7 x 3,5 cm. Klar, stapelbar.', 'Klassischer Glas-Aschenbecher in klarem Design. Mit einem Durchmesser von 10,7 cm und einer Höhe von 3,5 cm kompakt und praktisch. Die Aschenbecher sind stapelbar und eignen sich ideal für Veranstaltungen, Gastronomie und private Feiern.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/aschenbecher-glas-1.jpeg','/product-images/geschirr/aschenbecher-glas-2.jpeg']::text[], '{"Material":"Glas (klar)","Durchmesser":"10,7 cm","Höhe":"3,5 cm","Eigenschaften":"Stapelbar"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"QNIZSP"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'buffet-tellerwaermer', '2-in-1-Buffet- und Tellerwärmer, elektrisch', NULL, 'Elektrischer Speisenwärmer mit 300 Watt Leistung. Betriebstemperatur 40°–75°C, bis zu 8 Stunden Betriebszeit. 4 Behälter: 2x 2,4 l und 2x 1,15 l.', 'Der 2-in-1-Buffet- und Tellerwärmer vereint zwei Funktionen in einem Gerät: Als Buffetstation hält er Speisen in vier Edelstahlbehältern (2x 2,4 Liter und 2x 1,15 Liter) zuverlässig warm. Gleichzeitig kann die Edelstahloberfläche als Tellerwärmer genutzt werden. Mit 300 Watt Leistung, stufenlos regelbarer Temperatur von 40° bis 75°C und einer Betriebszeit von bis zu 8 Stunden ist er ideal für Buffets, Caterings und Veranstaltungen.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/buffet-tellerwaermer-1.jpeg','/product-images/geschirr/buffet-tellerwaermer-2.jpeg','/product-images/geschirr/buffet-tellerwaermer-3.jpeg','/product-images/geschirr/buffet-tellerwaermer-4.jpeg']::text[], '{"Leistung":"300 Watt","Betriebstemperatur":"40° bis 75°C (stufenlos regelbar)","Betriebszeit":"bis zu 8 Stunden","Behälter":"4 Stück (2x 2,4 l + 2x 1,15 l)","Material":"Edelstahl","Funktion":"Buffetstation & Tellerwärmer"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"E4FVHB","bonn":""}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'spuelmaschine-frontlader', 'Gastro-Spülmaschine Frontlader', NULL, 'Gewerbespülmaschine von Stalgast für Spülkörbe 50x50 cm und GN1/1. Einschubhöhe 32 cm, Waschzyklen 120s & 180s, inkl. Spülkorb und Wasserenthärter.', 'Die Gastro-Spülmaschine Frontlader von Stalgast ist speziell für die Aufnahme von Spülkörben (50x50 cm) oder GN1/1-Blechen und -Behältern konzipiert. Mit einer Einschubhöhe von 32 cm eignet sie sich auch für größere Töpfe oder Weizengläser. Die Maschine bietet zwei Waschzyklen (120s und 180s) und wird inklusive Spülkorb und Wasserenthärter geliefert. Anschlussleistung: 4,9 kW, verfügbar in 400V (Standard) oder 230V (bitte bei Buchung angeben). Benötigt einen 2 bar 3/4 Zoll Wasseranschluss. Ideal als Ergänzung bei Veranstaltungen mit großen Mengen an Geschirr, Gläsern und Besteck.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/spuelmaschine-stalgast-1.jpeg','/product-images/geschirr/spuelmaschine-stalgast-2.jpeg']::text[], '{"Hersteller":"Stalgast","Typ":"Frontlader-Gewerbespülmaschine","Spülkörbe":"50x50 cm / GN1/1","Einschubhöhe":"32 cm","Waschzyklen":"120s & 180s","Anschlussleistung":"4,9 kW","Spannung":"400V (Standard) oder 230V (bitte angeben)","Wasseranschluss":"2 bar, 3/4 Zoll","Inklusive":"Spülkorb & Wasserenthärter","Pumpen":"Klarspülmittel-, Reinigerdosierpumpe & Ablaufpumpe"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"DFGFG2","bonn":"EEZP7X"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'gabel-gross-deluxe-19-10er', 'Gabel groß Deluxe 19, 10er Set', NULL, 'Gabel 19 cm, Edelstahl, Athene Poliert. Das Besteck muss gereinigt zurückgegeben werden. Reinigungspauschale: 2,00 €.', 'Die Gabel groß Deluxe 19 im 10er Set – eine elegante Tafelgabel aus der Serie Athene Poliert. Mit 19 cm Länge aus hochwertigem Edelstahl, ideal für Hauptgerichte bei Veranstaltungen, Caterings und privaten Feiern. Bitte beachten: Das Besteck muss gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,00 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/besteck/gabel-deluxe-19-1.jpeg','/product-images/besteck/gabel-deluxe-19-2.jpeg','/product-images/besteck/gabel-deluxe-19-3.jpeg']::text[], '{"Material":"Edelstahl","Serie":"Athene Poliert","Typ":"Tafelgabel","Länge":"19 cm","Stückzahl":"10 Stück pro Set","Reinigungspauschale":"2,00 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"5GN1EH","bonn":""}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'gabel-klein-deluxe-14-10er', 'Gabel klein Deluxe 14, 10er Set', NULL, 'Gabel 14 cm, Edelstahl, Athene Poliert. Das Besteck muss gereinigt zurückgegeben werden. Reinigungspauschale: 2,00 €.', 'Die Gabel klein Deluxe 14 im 10er Set – eine elegante Kuchengabel aus der Serie Athene Poliert. Mit 14 cm Länge aus hochwertigem Edelstahl, ideal für Desserts, Kuchen und Gebäck bei Veranstaltungen, Caterings und privaten Feiern. Bitte beachten: Das Besteck muss gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,00 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/besteck/gabel-klein-deluxe-14-1.jpeg','/product-images/besteck/gabel-klein-deluxe-14-2.jpeg','/product-images/besteck/gabel-klein-deluxe-14-3.jpeg']::text[], '{"Material":"Edelstahl","Serie":"Athene Poliert","Typ":"Kuchengabel / Gabel klein","Länge":"14 cm","Stückzahl":"10 Stück pro Set","Reinigungspauschale":"2,00 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"GB31E4","bonn":""}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'gabel-simply-19-10er', 'Gabel SIMPLY 19, 10er Set', NULL, 'Gabel Edelstahl, 19 cm. Das Besteck muss gereinigt zurückgegeben werden. Reinigungspauschale: 2,00 €.', 'Die Gabel SIMPLY 19 im 10er Set aus hochwertigem Edelstahl mit 19 cm Länge. Ideal für Veranstaltungen, Caterings und private Feiern. Bitte beachten: Das Besteck muss gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,00 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/besteck/gabel-simply-19-1.jpeg','/product-images/besteck/gabel-simply-19-2.jpeg']::text[], '{"Material":"Edelstahl","Länge":"19 cm","Stückzahl":"10 Stück pro Set","Reinigungspauschale":"2,00 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"KX7QQ4","bonn":"GT8B4N"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'loeffel-gross-deluxe-19-10er', 'Löffel groß Deluxe 19, 10er Set', NULL, 'Löffel 19,5 cm, Edelstahl, Athene Poliert. Das Besteck muss gereinigt zurückgegeben werden. Reinigungspauschale: 2,00 €.', 'Der Löffel groß Deluxe 19 im 10er Set – ein hochwertiger Tafellöffel aus poliertem Edelstahl der Serie Athene. Mit 19,5 cm Länge ideal für Hauptgerichte und Suppen. Perfekt für gehobene Veranstaltungen, Caterings und private Feiern. Bitte beachten: Das Besteck muss gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,00 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/besteck/loeffel-gross-deluxe-19-1.jpeg','/product-images/besteck/loeffel-gross-deluxe-19-2.jpeg','/product-images/besteck/loeffel-gross-deluxe-19-3.jpeg']::text[], '{"Material":"Edelstahl","Serie":"Athene Poliert","Länge":"19,5 cm","Stückzahl":"10 Stück pro Set","Reinigungspauschale":"2,00 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"QQQ616"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'loeffel-klein-deluxe-14-10er', 'Löffel klein Deluxe 14, 10er Set', NULL, 'Löffel 14 cm, Edelstahl, Athene Poliert. Das Besteck muss gereinigt zurückgegeben werden. Reinigungspauschale: 2,00 €.', 'Der Löffel klein Deluxe 14 im 10er Set – ein eleganter Teelöffel aus der Serie Athene Poliert. Mit 14 cm Länge aus hochwertigem Edelstahl, ideal für Desserts, Kaffee und Tee bei Veranstaltungen, Caterings und privaten Feiern. Bitte beachten: Das Besteck muss gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,00 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/besteck/loeffel-klein-deluxe-14-1.jpeg','/product-images/besteck/loeffel-klein-deluxe-14-2.jpeg','/product-images/besteck/loeffel-klein-deluxe-14-3.jpeg']::text[], '{"Material":"Edelstahl","Serie":"Athene Poliert","Typ":"Teelöffel / Löffel klein","Länge":"14 cm","Stückzahl":"10 Stück pro Set","Reinigungspauschale":"2,00 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"9QYWO9","bonn":""}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'loeffel-simply-13-10er', 'Löffel SIMPLY 13, 10er Set', NULL, 'Löffel klein Edelstahl, 13 cm. Das Besteck muss gereinigt zurückgegeben werden. Reinigungspauschale: 2,00 €.', 'Der Löffel SIMPLY 13 im 10er Set – ein kompakter Kaffeelöffel aus Edelstahl mit 13 cm Länge. Ideal für Kaffee, Tee und Desserts bei Veranstaltungen, Caterings und privaten Feiern. Bitte beachten: Das Besteck muss gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,00 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/besteck/loeffel-simply-13-1.jpeg','/product-images/besteck/loeffel-simply-13-2.jpeg']::text[], '{"Material":"Edelstahl","Typ":"Kaffeelöffel / Löffel klein","Länge":"13 cm","Stückzahl":"10 Stück pro Set","Reinigungspauschale":"2,00 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"ENS2MB","bonn":"E941H1"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'loeffel-simply-19-10er', 'Löffel SIMPLY 19, 10er Set', NULL, 'Löffel klein Edelstahl, 19 cm. Das Besteck muss gereinigt zurückgegeben werden. Reinigungspauschale: 2,00 €.', 'Der Löffel SIMPLY 19 im 10er Set – ein klassischer Edelstahl-Löffel mit 19 cm Länge. Ideal für den täglichen Gebrauch bei Veranstaltungen, Caterings und privaten Feiern. Bitte beachten: Das Besteck muss gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,00 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/besteck/loeffel-simply-19-1.jpeg']::text[], '{"Material":"Edelstahl","Typ":"Löffel klein","Länge":"19 cm","Stückzahl":"10 Stück pro Set","Reinigungspauschale":"2,00 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"MVUAG2","bonn":"ML5SL8"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'messer-deluxe-21-10er', 'Messer Deluxe 21, 10er Set', NULL, 'Messer 21 cm, Edelstahl, Athene Poliert. Das Besteck muss gereinigt zurückgegeben werden. Reinigungspauschale: 2,00 €.', 'Das Messer Deluxe 21 im 10er Set aus der Serie Athene Poliert überzeugt durch hochwertigen Edelstahl und elegantes Design. Ideal für Veranstaltungen, Caterings und private Feiern. Bitte beachten: Das Besteck muss gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,00 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/besteck/messer-deluxe-21-1.jpeg','/product-images/besteck/messer-deluxe-21-2.jpeg','/product-images/besteck/messer-deluxe-21-3.jpeg']::text[], '{"Material":"Edelstahl","Serie":"Athene Poliert","Länge":"21 cm","Stückzahl":"10 Stück pro Set","Reinigungspauschale":"2,00 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"8ZQ4K9","bonn":""}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'messer-simply-20-10er', 'Messer SIMPLY 20, 10er Set', NULL, 'Messer Edelstahl, 20 cm. Das Besteck muss gereinigt zurückgegeben werden. Reinigungspauschale: 2,00 €.', 'Das Messer SIMPLY 20 im 10er Set – ein klassisches Tafelmesser aus Edelstahl mit 20 cm Länge. Ideal für Veranstaltungen, Caterings und private Feiern. Bitte beachten: Das Besteck muss gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 2,00 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/besteck/messer-simply-20-1.jpeg','/product-images/besteck/messer-simply-20-2.jpeg']::text[], '{"Material":"Edelstahl","Typ":"Tafelmesser","Länge":"20 cm","Stückzahl":"10 Stück pro Set","Reinigungspauschale":"2,00 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"LKA1DW","bonn":"ISUEVC"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'slt-eiswuerfelbereiter', 'SLT Eiswürfelbereiter kompakt – kleine Eiswürfelmaschine', 'Kompakt-Modell (ca. 150 W) – ideal für Bar, Hausbar & kleinere Feiern', 'Kompakte Eiswürfelmaschine für Events, Bar und Zuhause. Vollautomatisch, mit integriertem Wassertank – kein Wasseranschluss nötig. Erste Eiswürfel in wenigen Minuten.', 'Kompakter SLT Eiswürfelbereiter zum Mieten – die praktische Eiswürfelmaschine für Hochzeiten, Firmenfeiern, Gartenpartys, Foodtrucks, Messestände und den privaten Haushalt. Das freistehende Tischgerät produziert Eiswürfel vollautomatisch aus dem integrierten Wassertank, ohne festen Wasseranschluss. So lässt es sich flexibel überall dort aufstellen, wo Strom vorhanden ist – auf der Theke, im Cateringzelt oder im Getränkeausschank.

Die Bedienung erfolgt über ein übersichtliches Tastenfeld: Wasser einfüllen, Knopf drücken – nach wenigen Minuten sind die ersten Eiswürfel fertig. Sensoren stoppen die Produktion automatisch, wenn der Wassertank leer oder der Eiswürfelkorb voll ist. Ein Sichtfenster im Deckel zeigt jederzeit den Füllstand. Der entnehmbare Eiskorb und das Ablaufventil erleichtern Entnahme, Umfüllen in einen Getränkekühler und Reinigung.

Das Gerät ist an unserem Hauptsitz Krefeld und an unserer Filiale Bonn direkt buchbar. Für Mülheim an der Ruhr disponieren wir es kurzfristig aus dem Hauptsitz Krefeld.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/slt-eiswuerfelbereiter-1.jpeg']::text[], '{"Geräteart":"Freistehende Eiswürfelmaschine (Ice Maker), Tischgerät","Gehäusefarbe":"Schwarz","Material":"Kunststoff / Edelstahl","Abmessungen (B×H×T)":"ca. 27 × 29,5 × 33,5 cm","Leistung":"ca. 150 W","Spannung":"230 V (Schuko-Steckdose)","Wasserversorgung":"Integrierter Wassertank – kein Festwasseranschluss nötig","Ausstattung":"Entnehmbarer Eiswürfelkorb, transparentes Sichtfenster im Deckel, Kontrollanzeigen (Wasser leer / Eis voll)","Automatik":"Automatische Abschaltung bei leerem Tank oder vollem Korb","Aufstellort":"Bar-/Küchentheke, Cateringzelt, Foodtruck, Büro, Hausbar"}'::jsonb, ARRAY['Vollautomatische Eiswürfelproduktion','Erste Eiswürfel nach wenigen Minuten','Kein Wasseranschluss nötig – flexibler Aufstellort','Automatische Abschaltung bei vollem Korb / leerem Tank','Sichtfenster im Deckel zur Füllstandskontrolle','Entnehmbarer Eiskorb, einfach zu reinigen']::text[], ARRAY['event','hochzeit','gastronomie','bar']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"7GGNJB","bonn":"5ZOOLD"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'slt-eiswuerfelmaschine-profi-35kg', 'SLT Eiswürfelmaschine Profi – 35 kg/24 h Edelstahl', 'Profi-Modell 35 kg/Tag – für Gastronomie, Bar & Großevents', 'Professionelle Eiswürfelmaschine mit bis zu 35 kg Eis pro Tag – 34 Eiswürfel in nur 15 Minuten. Edelstahlgehäuse, LED-Bedienfeld, drei Würfelgrößen. Auch ohne Festwasseranschluss betreibbar.', 'Die große Profi-Variante unserer Eiswürfelmaschinen zum Mieten – konzipiert für den professionellen Dauereinsatz in Gastronomie, Catering, Bar- und Eventbetrieb. Mit einer Tageskapazität von bis zu 35 kg Eiswürfeln pro 24 Stunden versorgt ein einziges Gerät mehrere Zapfstellen und Cocktail-Stationen gleichzeitig – ohne Abhängigkeit vom Packeis-Lieferanten.

Der eingebaute Kompressor mit Kältemittel R290 arbeitet kontinuierlich und ohne Vorkühlzeit. Pro Zyklus entstehen in nur 15 Minuten bis zu 34 klare Eiswürfel. Über das beleuchtete LED-Bedienfeld lässt sich die Würfelgröße in drei Stufen (klein / mittel / groß) wählen – passend für Softdrinks, Longdrinks, Cocktails oder Smoothies. Alle wasserführenden Oberflächen sind geschmacks- und geruchsneutral, das Edelstahlgehäuse entspricht den Hygieneanforderungen der Lebensmittelindustrie und lässt sich einfach reinigen.

Besonders praktisch für den mobilen Einsatz: Das Gerät kann direkt über den mitgelieferten Zu- und Ablaufschlauch an eine Wasserleitung angeschlossen werden – dank Automatik-Wassernachfüller läuft es dann unterbrechungsfrei im Dauerbetrieb. Genauso funktioniert es aber auch ohne Festwasseranschluss über die manuelle Wasserbefüllung, ideal für Locations, an denen kein Wasseranschluss verfügbar ist (Zelt, Foodtruck, Freifläche).

Höhenverstellbare Standfüße gleichen unebene Untergründe aus, der geräuscharme Betrieb ist auch in Gasträumen und offenen Küchen komfortabel. Verfügbar auf Anfrage über alle drei SLT-Standorte Krefeld, Bonn und Mülheim an der Ruhr – wir prüfen die Verfügbarkeit für Ihren Zeitraum und melden uns kurzfristig mit einem Angebot zurück.', 'geschirr-glaeser-besteck',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/geschirr/slt-frostmaster-1.jpg','/product-images/geschirr/slt-frostmaster-2.jpg','/product-images/geschirr/slt-frostmaster-3.jpg']::text[], '{"Geräteart":"Freistehende Profi-Eiswürfelmaschine, Tischgerät","Gehäusefarbe":"Silber / Edelstahl","Material":"Lebensmittelechter Edelstahl","Tageskapazität":"ca. 35 kg Eiswürfel pro 24 Stunden","Zyklusleistung":"Bis zu 34 Eiswürfel je Zyklus","Zyklusdauer":"ca. 15 Minuten","Wassertank":"3 Liter","Würfelgrößen":"Klein / Mittel / Groß wählbar","Kältemittel":"R290 (natürliches, umweltfreundliches Kältemittel)","Bedienung":"LED-Bedienfeld mit Timer, Clean- und Deice-Funktion","Wasserversorgung":"Direkter Festwasseranschluss (Zu-/Ablaufschlauch im Lieferumfang) ODER manueller Betrieb ohne Wasseranschluss","Automatik":"Automatischer Wassernachfüller für unterbrechungsfreien Dauerbetrieb","Standfüße":"Höhenverstellbar für sicheren Stand auf unebenem Untergrund","Anschluss":"230 V (Schuko-Steckdose)","Einsatzbereich":"Gastronomie, Catering, Bar, Hotel, Event, Hochzeit, Firmenfeier","Verfügbarkeit":"Auf Anfrage an den Standorten Krefeld, Bonn und Mülheim an der Ruhr"}'::jsonb, ARRAY['Bis zu 35 kg Eiswürfel pro Tag – für Profi-Bedarf','34 Eiswürfel in nur 15 Minuten je Zyklus','Drei Würfelgrößen wählbar – passend für jeden Drink','Edelstahlgehäuse, lebensmittelecht und leicht zu reinigen','Wahlweise mit oder ohne Festwasseranschluss betreibbar','Automatischer Wassernachfüller für Dauerbetrieb','LED-Bedienfeld mit Timer und Clean-Funktion','Kältemittel R290 – umweltfreundlich','Geräuscharmer Betrieb auch im Gastraum','Höhenverstellbare Standfüße']::text[], ARRAY['event','hochzeit','gastronomie','bar','catering','profi']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, TRUE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'adj-fog-fury-jett-pro', 'ADJ Fog Fury Jett PRO', NULL, 'Senkrecht-Nebelmaschine inkl. LED-Beleuchtung mit 2,5 l Nebelfluid. Erzeugt vertikale, farbig beleuchtete Nebelsäulen – ideal für Bühnen, Events und Partys. Weiteres Nebelfluid kann im nächsten Schritt dazu gebucht werden.', NULL, 'spezialeffekte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/spezialeffekte/fog-fury-jett-pro-1.jpeg','/product-images/spezialeffekte/fog-fury-jett-pro-2.jpeg','/product-images/spezialeffekte/fog-fury-jett-pro-3.jpeg','/product-images/spezialeffekte/fog-fury-jett-pro-4.jpeg','/product-images/spezialeffekte/fog-fury-jett-pro-5.jpeg']::text[], '{"Typ":"Senkrecht-Nebelmaschine mit LED","Leistung":"1.520 W","LEDs":"21 × 3 W RGBA LEDs","Nebelausstoß":"ca. 283 m³/min","Tankvolumen":"2,5 Liter","Aufheizzeit":"ca. 8 Minuten","Steuerung":"DMX / Wireless / Fernbedienung","Lieferumfang":"inkl. 2,5 l Nebelfluid","Montage":"Boden- oder Deckenmontage (Kopfüber) möglich"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"H77LBM"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kalt-funkenfontaene-einzeln', 'Kalt-Funkenfontäne (Spark / Sparkular), Einzelgerät', NULL, 'Kalt-Funkenfontäne (Spark / Sparkular) als Einzelgerät – auf Knopfdruck spektakuläre Funkeneffekte bis 6 m Höhe für jede Veranstaltung. Vollkommen ungefährlich, kein Geruch, kein Rauch – ideal für Indoor-Einsatz.', 'Mit diesem Spark- bzw. Sparkular-Gerät erzeugen Sie auf Knopfdruck fantastische Kalt-Funkenfontänen für jegliche Veranstaltungen. Die bis zu 6 Meter hohen Fontänen sind dabei vollkommen ungefährlich und erzeugen weder Geruch noch Rauch.

✅ bis zu 6 Meter hohe Funkenfontänen
✅ kinderleichte Bedienung über Fernbedienung oder DMX
✅ Höhe stufenlos einstellbar
✅ inkl. einer Granulat-Füllung (bis zu 10 min. Effektzeit)

Jede weitere Minute Effektzeit wird mit 3,00 € berechnet.

Wichtiger Hinweis: Nach jeder Benutzung unbedingt „Clear Powder“ auf der Fernbedienung drücken – sonst verklumpt das Granulat im Gerät!', 'spezialeffekte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/spezialeffekte/kalt-funkenfontaene-einzeln-1.jpg','/product-images/spezialeffekte/kalt-funkenfontaene-einzeln-2.jpeg','/product-images/spezialeffekte/kalt-funkenfontaene-einzeln-3.jpeg','/product-images/spezialeffekte/kalt-funkenfontaene-einzeln-4.jpeg']::text[], '{"Set":"1 × Kalt-Funkenfontäne","Effekthöhe":"bis zu 6 Meter","Steuerung":"Fernbedienung oder DMX","Höhe":"stufenlos einstellbar","Lieferumfang":"inkl. einer Granulat-Füllung (bis zu 10 min. Effektzeit)","Verbrauchsmaterial":"jede weitere Minute: 3,00 €","Besonderheiten":"kein Geruch, kein Rauch, vollkommen ungefährlich","Hinweis":"Nach jeder Benutzung „Clear Powder“ drücken – sonst verklumpt das Granulat"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"IHAKJD","bonn":"XIUA3R"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kalt-funkenfontaene-2er', 'Kalt-Funkenfontäne (Spark / Sparkular), 2er Set', NULL, '2er Set Kalt-Funkenfontänen (Spark / Sparkular) im Flightcase – zwei Geräte für symmetrische Funkeneffekte bis 6 m Höhe. Vollkommen ungefährlich, kein Geruch, kein Rauch – ideal für Bühnen, Hochzeiten und Events.', 'Mit diesen Spark- bzw. Sparkular-Geräten erzeugen Sie auf Knopfdruck fantastische Kalt-Funkenfontänen für jegliche Veranstaltungen. Die bis zu 6 Meter hohen Fontänen sind dabei vollkommen ungefährlich und erzeugen weder Geruch noch Rauch.

✅ bis zu 6 Meter hohe Funkenfontänen
✅ kinderleichte Bedienung über Fernbedienung oder DMX
✅ Höhe stufenlos einstellbar
✅ inkl. einer Granulat-Füllung pro Gerät (bis zu 10 min. Effektzeit)

Jede weitere Minute Effektzeit wird mit 3,00 € berechnet.

Wichtiger Hinweis: Nach jeder Benutzung unbedingt „Clear Powder“ auf der Fernbedienung drücken – sonst verklumpt das Granulat im Gerät!', 'spezialeffekte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/spezialeffekte/kalt-funkenfontaene-set-1.jpeg','/product-images/spezialeffekte/kalt-funkenfontaene-set-2.jpeg','/product-images/spezialeffekte/kalt-funkenfontaene-set-3.jpeg','/product-images/spezialeffekte/kalt-funkenfontaene-set-4.jpeg']::text[], '{"Set":"2 × Kalt-Funkenfontäne im Flightcase","Effekthöhe":"bis zu 6 Meter","Steuerung":"Fernbedienung oder DMX","Höhe":"stufenlos einstellbar","Lieferumfang":"inkl. einer Granulat-Füllung pro Gerät (bis zu 10 min. Effektzeit)","Verbrauchsmaterial":"jede weitere Minute: 3,00 €","Besonderheiten":"kein Geruch, kein Rauch, vollkommen ungefährlich","Hinweis":"Nach jeder Benutzung „Clear Powder“ drücken – sonst verklumpt das Granulat"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"IHAKJD","bonn":"AUL1QE"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'kalt-funkenfontaene-4er', 'Kalt-Funkenfontäne (Spark / Sparkular), 4er Set', NULL, '4er Set Kalt-Funkenfontänen (Spark / Sparkular) im Flightcase – vier Geräte für spektakuläre Funkeneffekte bis 6 m Höhe auf großen Bühnen und Events. Vollkommen ungefährlich, kein Geruch, kein Rauch.', 'Mit diesen Spark- bzw. Sparkular-Geräten erzeugen Sie auf Knopfdruck fantastische Kalt-Funkenfontänen für jegliche Veranstaltungen. Die bis zu 6 Meter hohen Fontänen sind dabei vollkommen ungefährlich und erzeugen weder Geruch noch Rauch.

✅ bis zu 6 Meter hohe Funkenfontänen
✅ kinderleichte Bedienung über Fernbedienung oder DMX
✅ Höhe stufenlos einstellbar
✅ inkl. einer Granulat-Füllung pro Gerät (bis zu 10 min. Effektzeit)

Jede weitere Minute Effektzeit wird mit 3,00 € berechnet.

Wichtiger Hinweis: Nach jeder Benutzung unbedingt „Clear Powder“ auf der Fernbedienung drücken – sonst verklumpt das Granulat im Gerät!', 'spezialeffekte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/spezialeffekte/kalt-funkenfontaene-4er-set.jpeg','/product-images/kalt-funkenfontaene-1.jpeg','/product-images/kalt-funkenfontaene-2.jpeg','/product-images/kalt-funkenfontaene-3.jpeg','/product-images/kalt-funkenfontaene-4.jpeg']::text[], '{"Set":"4 × Kalt-Funkenfontäne im Flightcase","Effekthöhe":"bis zu 6 Meter","Steuerung":"Fernbedienung oder DMX","Höhe":"stufenlos einstellbar","Lieferumfang":"inkl. einer Granulat-Füllung pro Gerät (bis zu 10 min. Effektzeit)","Verbrauchsmaterial":"jede weitere Minute: 3,00 €","Besonderheiten":"kein Geruch, kein Rauch, vollkommen ungefährlich","Hinweis":"Nach jeder Benutzung „Clear Powder“ drücken – sonst verklumpt das Granulat"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"9OU48Z","bonn":"WS6SDB"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'tcm-fx-turbo-co2-jet', 'TCM FX Turbo CO2 Jet', NULL, 'Der TCM FX Turbo Jet ist ein leistungsstarker CO2-Nebel-Shooter für eindrucksvolle Effekte auf Bühnen, Dancefloors und Events. Mit bis zu 20 m Reichweite erzeugt er dichte, kalte Nebelsäulen, die jedes Drop und jeden Showmoment unterstreichen. Die stufenlos einstellbare Düse erlaubt präzise Ausrichtung – vom knackigen Frontschuss bis zum markanten Up-FX.', NULL, 'spezialeffekte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/spezialeffekte/turbo-jet-co2-1.jpg','/product-images/spezialeffekte/turbo-jet-co2-2.jpg','/product-images/spezialeffekte/turbo-jet-co2-3.jpg']::text[], '{"Ausstoßweite":"ca. 20 m","Stromversorgung":"230 V AC, 50 Hz","Gesamtanschlusswert":"100 W","Stromanschluss":"PowerCON (blau), Einbauversion","Stromausgang":"1 × PowerCON (grau), Einbauversion","Ansteuerung":"Plug & Play (230-V-Impuls, DMX via Switchpack möglich)","Abschusswinkel":"stufenlos einstellbar","CO2-Versorgung":"CO2-Steigrohrflaschen","Maße (B × T × H)":"37 × 30 × 41 cm","Gewicht":"8,10 kg","Herstellung":"Made in Europe"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":""}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY['https://www.youtube.com/watch?v=G-afE8F7ZCs']::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'popcornmaschine-xl-profi', 'XL Profi Popcornmaschine', NULL, 'Nostalgische XL Profi Popcornmaschine auf Nostalgiewagen – inkl. Maiseinsatz. Maschine vom Wagen abnehmbar. Verbrauchsmaterial (Mais-Fett-Zucker-Tüten) im nächsten Schritt im Warenkorb dazubuchbar.', 'Maschine kann zum Transport vom Wagen getrennt werden

Abmessungen Maschine ohne Wagen (B×H×T): ca. 75 × 59 × 45 cm

Gewicht: ca. 25 kg

Anschlussleistung: 850 Watt mit 230 V

Empfohlene Zubereitungsmenge pro Durchgang: Mais 150 g, Zucker 50 g, Öl 40 ml

Lieferumfang:
- Popcorn Maschine
- Nostalgiewagen
- Maiseinsatz

Das benötigte Material (Mais-Fett-Zucker-Tüten) kannst du im nächsten Schritt im Warenkorb buchen (ca. 20 Standard-Portionen, die du für 1 € verkaufen kannst). Du bekommst ausreichend Material zur Verfügung – berechnet wird nur das tatsächlich verbrauchte Material.', 'spezialeffekte',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/spezialeffekte/popcornmaschine-xl-profi.jpg']::text[], '{"Abmessungen Maschine (B×H×T)":"ca. 75 × 59 × 45 cm","Gewicht":"ca. 25 kg","Anschlussleistung":"850 W","Stromanschluss":"230 V","Empfohlene Menge pro Durchgang":"150 g Mais, 50 g Zucker, 40 ml Öl","Lieferumfang":"Popcornmaschine, Nostalgiewagen, Maiseinsatz","Besonderheit":"Maschine vom Wagen abnehmbar"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"SPA843"}'::jsonb, FALSE, '/manuals/popcornmaschine-bedienungsanleitung.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'huepfburg-lamar', 'HappyHop Hüpfburg Lamar 2,8 x 2,1m', NULL, 'Aufblasbare Burg mit Basketballkorb und Sicherheitsnetz – inkl. Gebläse. Ideal für Kindergeburtstage im Garten.', 'Die HappyHop Hüpfburg Lamar bietet viel Platz zum Springen und Toben auf kompakter Fläche (2,80 m × 2,10 m × 1,85 m). Die gesamte Hüpfburg ist vollständig von einem Sicherheitsnetz umgeben und verfügt über einen integrierten Basketballkorb für zusätzlichen Spielspaß. Dank des mitgelieferten 300-Watt-Gebläses ist die Burg in ca. 5 Minuten aufgebaut. Alle Nähte sind doppelt vernäht für maximale Haltbarkeit. Im Lieferumfang enthalten: Tragekiste, Gebläse (300 W), Gewebeplane und 8 Heringe zur Fixierung im Boden.', 'huepfburgen',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/huepfburg-lamar-front.jpeg','/product-images/huepfburg-lamar-side.jpeg','/product-images/huepfburg-lamar-top.jpeg','/product-images/huepfburg-lamar-angle.jpeg']::text[], '{"Maße (L × B × H)":"2,80 m × 2,10 m × 1,85 m","Gewicht":"6,4 kg","Max. Belastung":"90 kg","Max. Kinder":"2","Altersempfehlung":"3 – 10 Jahre","Aufbauzeit":"ca. 5 Minuten","Gebläse":"300 Watt (inkl.)","Nähte":"Doppelt vernäht","Extras":"Basketballkorb, Sicherheitsnetz rundum","Zubehör":"Tragekiste, Gebläse, Gewebeplane, 8 Heringe"}'::jsonb, ARRAY['Inkl. 300W Gebläse','Sicherheitsnetz rundum','Basketballkorb','Aufbau in 5 Min.','Doppelt vernähte Nähte','Inkl. Heringe & Plane']::text[], ARRAY['huepfburg','spiel','klein']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"RC5ZQQ","bonn":"WKM6GJ"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'huepfburg-wasserpark', 'Hüpfburg Wasserpark 3 x 4m', NULL, 'Hüpfburg mit Kletterturm, Wasserrutsche und Pool – inkl. 300W Gebläse. Perfekt für heiße Sommertage!', 'Die Hüpfburg Wasserpark vereint Kletterturm, Rutsche und Pool auf 3,00 m × 4,00 m × 2,25 m. Ideal für Kindergeburtstage und Gartenpartys an heißen Tagen. Die Rutsche mündet in ein aufblasbares Planschbecken – Palmen-Design inklusive. Für bis zu 3 Kinder (3–5 Jahre, max. 60 kg). Aufbau in ca. 5 Minuten dank 300W Gebläse. Alle Nähte doppelt vernäht. Wichtig: Die Hüpfburg muss trocken zurückgegeben werden. Im Lieferumfang: Tragekiste, Gebläse, Gewebeplane und 8 Heringe.', 'huepfburgen',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/huepfburg-wasserpark-1.jpeg','/product-images/huepfburg-wasserpark-2.jpeg']::text[], '{"Maße (L × B × H)":"3,00 m × 4,00 m × 2,25 m","Gewicht":"20 kg","Max. Belastung":"60 kg","Max. Kinder":"3","Altersempfehlung":"3 – 5 Jahre","Aufbauzeit":"ca. 5 Minuten","Gebläse":"300 Watt (inkl.)","Nähte":"Doppelt vernäht","Extras":"Kletterturm, Rutsche, Pool","Zubehör":"Tragekiste, Gebläse, Gewebeplane, 8 Heringe"}'::jsonb, ARRAY['Inkl. 300W Gebläse','Wasserrutsche & Pool','Kletterturm','Aufbau in 5 Min.','Doppelt vernähte Nähte','Trocken zurückgeben']::text[], ARRAY['huepfburg','rutsche','mittel']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"JLXJUH","bonn":"2NA195"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'huepfburg-rollercoaster-1', 'Hüpfburg Rollercoaster 4,9 x 4m', NULL, 'Große aufblasbare Hüpfburg mit Rutsche im Kirmes-Design – inkl. 1100W Gebläse. Für bis zu 6 Kinder.', 'Die Hüpfburg Rollercoaster bietet auf 4,90 m × 4,00 m × 3,50 m jede Menge Platz zum Springen, Toben und Rutschen. Das farbenfrohe Kirmes-Design mit Riesenrad und Achterbahn-Motiven begeistert Kinder von 3 bis 16 Jahren. Die gesamte Burg ist vollständig von einer Wand umgeben und hält bis zu 450 kg (max. 6 Kinder gleichzeitig) stand. Alle Nähte sind doppelt vernäht. Im Lieferumfang: Tragesack, 1100W Gebläse, Gewebeplane und 8 Heringe.', 'huepfburgen',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/huepfburg-rollercoaster-front.jpeg','/product-images/huepfburg-rollercoaster-angle.jpeg','/product-images/huepfburg-rollercoaster-inside1.jpeg','/product-images/huepfburg-rollercoaster-inside2.jpeg']::text[], '{"Maße (L × B × H)":"4,90 m × 4,00 m × 3,50 m","Gewicht":"100 kg","Max. Belastung":"450 kg","Max. Kinder":"6","Altersempfehlung":"3 – 16 Jahre","Aufbauzeit":"ca. 10 Minuten","Gebläse":"1.100 Watt (inkl.)","Nähte":"Doppelt vernäht","Extras":"Rutsche, Kirmes-Design","Zubehör":"Tragesack, Gebläse, Gewebeplane, 8 Heringe"}'::jsonb, ARRAY['Inkl. 1100W Gebläse','Große Rutsche','Platz für 6 Kinder','Kirmes-Design','Doppelt vernähte Nähte','Inkl. Heringe & Plane']::text[], ARRAY['huepfburg','rutsche','gross']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"A92U2I"}'::jsonb, FALSE, '/manuals/aufbauanleitung-huepfburg.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'huepfburg-clown', 'Hüpfburg Clown 6,1 x 5,2m', NULL, 'Extra große Hüpfburg im Clown-Design mit riesiger Springfläche – inkl. 1500W Gebläse. Für bis zu 6 Kinder.', 'Die Hüpfburg Clown ist mit 6,10 m × 5,20 m × 5,90 m unsere größte Hüpfburg und bietet eine riesige Springfläche für bis zu 6 Kinder gleichzeitig. Das farbenfrohe Clown-Motiv mit aufblasbarer Figur auf dem Dach begeistert auf jeder Veranstaltung. Die gesamte Burg ist vollständig von einer Wand umgeben und hält bis zu 450 kg stand. Alle Nähte sind doppelt vernäht für maximale Haltbarkeit. Im Lieferumfang: Tragesack, 1500W Gebläse, Gewebeplane und 8 Heringe.', 'huepfburgen',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/huepfburg-clown-1.webp','/product-images/huepfburg-clown-2.jpeg']::text[], '{"Maße (L × B × H)":"6,10 m × 5,20 m × 5,90 m","Gewicht":"150 kg","Max. Belastung":"450 kg","Max. Kinder":"6","Altersempfehlung":"3 – 16 Jahre","Aufbauzeit":"ca. 10 Minuten","Gebläse":"1.500 Watt (inkl.)","Nähte":"Doppelt vernäht","Extras":"Große Springfläche, Clown-Design","Zubehör":"Tragesack, Gebläse, Gewebeplane, 8 Heringe"}'::jsonb, ARRAY['Inkl. 1500W Gebläse','Riesige Springfläche','Platz für 6 Kinder','Clown-Design mit Figur','Doppelt vernähte Nähte','Inkl. Heringe & Plane']::text[], ARRAY['huepfburg','spiel','gross']::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"krefeld":"Y6ASNV"}'::jsonb, FALSE, '/manuals/aufbauanleitung-huepfburg.pdf',
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'weinsberg-caraone-480-qdk', 'Weinsberg CaraOne 480 QDK', 'Weinsberg CaraOne 480 QDK', 'Familientauglicher Wohnwagen für bis zu 5 Personen – mit Dusche, WC, Truma-Heizung und Mover. Auf Anfrage in Krefeld, Bonn und Mülheim an der Ruhr.', 'Du suchst einen familientauglichen Wohnwagen zum Mieten in NRW? Der Weinsberg CaraOne 480 QDK ist unser Allround-Caravan für bis zu 5 Personen – kompakt genug für jedes Zugfahrzeug ab 1.500 kg Anhängelast, komfortabel ausgestattet mit Dusche, WC und Heizung. Verfügbar an unseren Standorten in Krefeld, Bonn und Mülheim an der Ruhr. Ideal für Familienurlaube, Festival-Trips, Campingplätze an der Mosel, in den Niederlanden oder am Gardasee.

Vollwertige Nasszelle mit Dusche & WC, Truma-Heizung, Mover für einfaches Rangieren und Antischlingerkupplung sind Serie. Im Mietpreis enthalten: voll ausgestattete Küche, 11-kg-Gasflasche, Strom- und Wasseranschlusskabel, Spiegelverlängerung sowie Vollkaskoversicherung.

Die Mietkonditionen findest du übersichtlich im Kasten weiter unten.', 'wohnwagen-camping',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/wohnwagen-camping/weinsberg-caraone-480-qdk-1.png','/product-images/wohnwagen-camping/weinsberg-caraone-480-qdk-2.jpg','/product-images/wohnwagen-camping/weinsberg-caraone-480-qdk-3.png','/product-images/wohnwagen-camping/weinsberg-caraone-480-qdk-4.webp','/product-images/wohnwagen-camping/weinsberg-caraone-480-qdk-5.png','/product-images/wohnwagen-camping/weinsberg-caraone-480-qdk-6.jpg']::text[], '{"Sitzplätze":"2 Erwachsene + 3 Kinder","Schlafplätze":"2 Erwachsene + 3 Kinder","Anzahl feste Betten":"4","Gesamtlänge mit Deichsel":"7,07 m","Aufbaulänge":"5,84 m","Breite":"2,32 m","Höhe":"2,57 m","Innenhöhe":"1,96 m","Innenbreite":"2,16 m","Zulässiges Gesamtgewicht":"1.500 kg"}'::jsonb, ARRAY[]::text[], ARRAY['familie','auf anfrage']::text[], ARRAY['Mindestmietdauer 5 Tage','Servicepauschale 99 € einmalig (Einweisung, 11 kg Gasflasche, Spiegelverlängerungen, Strom-Adapterkabel, Sanitärchemie, 2 Rollen Toilettenpapier)','Endreinigung optional 99 € einmalig','Kaution 1.000 €','Teil- & Vollkasko enthalten – Selbstbeteiligung gegenüber Versicherung 2.500 € (deine Kaution beträgt nur 1.000 €)']::text[],
      'ab 30 €', NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, TRUE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'man-kipper-meiller-d205', '7,5t Dreiseitenkipper', 'MAN TGL 8.220 4x2 · Meiller D205', 'MAN 7,5-Tonner Dreiseitenkipper mit Meiller D205 Aufbau zum Mieten: kippbar nach hinten, links und rechts, 4,5 m³ Volumen, 220 PS, Automatikgetriebe, Euro 6e, Hydraulikanschluss für Kippanhänger. Ideal für Bau, Garten- und Landschaftsbau sowie Schüttguttransport. Auf Anfrage in Krefeld, Bonn und Mülheim an der Ruhr.', NULL, 'nutzfahrzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/man-tgl-8220-kipper-1.jpg','/product-images/man-tgl-8220-kipper-2.jpg','/product-images/man-tgl-8220-kipper-3.jpg','/product-images/man-tgl-8220-kipper-4.jpg']::text[], '{"Hersteller":"MAN","Antrieb":"4x2","Anzahl Achsen":"2","Radstand":"3.050 mm","Fahrzeuglänge":"5.713 mm","Fahrzeughöhe":"2.628 mm","Fahrzeugbreite":"2.981 mm","Zul. Gesamtgewicht":"7.490 kg","Leergewicht":"5.176 kg","Nutzlast":"2.314 kg","Schadstoffklasse":"Euro 6e","Erstzulassung":"09.10.2024","Getriebe":"Automatik","PS / kW":"220 / 162","Bereifung Achse 1":"235/75 R17.5","Federung Achse 1":"Blattfederung","Bereifung Achse 2":"235/75 R17.5","Federung Achse 2":"Blattfederung","Aufbau":"Meiller D205 Dreiseitenkipper","Kippfunktion":"3-Seiten-Kipper (hinten, links, rechts)","Volumen":"4,5 m³","Bodenstärke":"2,5 mm","Stärke Seitenwände":"1,5 mm","Länge innen":"3.800 mm","Höhe innen":"500 mm","Breite innen":"2.350 mm","Hydraulikanschluss":"für Kippanhänger","Stirnwand":"700 mm – Stahl","Kippsteuerung im Fahrerhaus":"ja","Hintere Stoßstange":"starr","Verzurrmöglichkeit":"ja","Stirnwandgitter":"ja","Hecktür":"Pendelklappe","Seitenwand links":"klappbar","Seitenwand rechts":"klappbar","Material Seitenwände":"Stahl","Material Boden":"Stahl","Frei-Kilometer":"100 km/Tag inklusive","Mehrkilometer":"0,40 € netto/km","Kraftstoff":"Diesel – Rückgabe vollgetankt (sonst 2,85 €/l zzgl. MwSt.)","AdBlue":"Rückgabe vollgetankt (sonst 1,85 €/l zzgl. MwSt.)","Maut":"Weiterberechnung per Einzelfahrtnachweis","Vollkasko Selbstbeteiligung":"2.500 €","Kaution":"1.000 €"}'::jsonb, ARRAY[]::text[], ARRAY['dreiseitenkipper','kipper','7,5-tonner','kipper-lkw','fuehrerschein-c1','meiller d205','auf anfrage']::text[], ARRAY[]::text[],
      'ab 75 €', NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, TRUE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'pritschenkipper-3-5t-dreiseitenkipper', '3,5t Pritschenwagen Dreiseitenkipper', 'Opel Movano (oder vergleichbar) · Doppelkabine', 'Opel Movano 3,5-Tonner Pritschenwagen mit Doppelkabine und Dreiseiten-Kippvorrichtung zum Mieten. Fahrbar mit Führerscheinklasse B, 1.135 kg Nutzlast, 3,60 × 2,05 m Ladefläche, Anhängerkupplung bis 2.500 kg, Klimaanlage und DAB-Radio, 3 Sitzplätze. Ideal für Bau, Garten- und Landschaftsbau, Umzüge und Schüttguttransport. Auf Anfrage in Krefeld, Bonn und Mülheim an der Ruhr.', NULL, 'nutzfahrzeuge',
      ARRAY['krefeld','bonn','muelheim']::text[], ARRAY['/product-images/opel-movano-pritschenkipper-1.jpg','/product-images/opel-movano-pritschenkipper-2.jpg','/product-images/opel-movano-pritschenkipper-3.jpg','/product-images/opel-movano-pritschenkipper-4.jpg']::text[], '{"Fahrzeugtyp":"PKW-Pritschenwagen mit Doppelkabine","Leergewicht":"2.365 kg","Zul. Gesamtgewicht":"3.500 kg","Nutzlast":"1.135 kg","Fahrzeughöhe":"2.500 mm","Fahrzeuglänge":"6.225 mm","Sitzplätze":"3","Zul. Anhängelast":"2.500 kg","Ladefläche Länge":"3.600 mm","Ladefläche Breite":"2.050 mm","Bordwandhöhe":"350 mm","Kippfunktion":"3-Seiten-Kipper (hinten, links, rechts)","Anhängerkupplung":"ja","Klimaanlage":"ja","Radio":"DAB","Sicherheitsfeatures":"moderne Assistenzsysteme","Frei-Kilometer":"100 km/Tag inklusive","Mehrkilometer":"0,23 € netto/km","Kraftstoff":"Diesel – Rückgabe vollgetankt (sonst 2,85 €/l brutto)","Vollkasko Selbstbeteiligung":"2.500 €","Kaution":"1.000 €"}'::jsonb, ARRAY[]::text[], ARRAY['dreiseitenkipper','kipper','3,5-tonner','pritschenwagen','doppelkabine','opel movano','fuehrerschein-b','auf anfrage']::text[], ARRAY[]::text[],
      'ab 55 €', NULL, NULL, NULL,
      NULL, NULL, '{}'::jsonb, TRUE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bonn-graben-abdeckung-150x100', 'Graben Abdeckung 150x100cm LowPro 15/10', NULL, 'Grabenabdeckplatte für sichere Überfahrt über offene Gräben.', NULL, 'erdbewegung',
      ARRAY['bonn']::text[], ARRAY[]::text[], '{}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"bonn":"WLEUDP"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bonn-nasstrockensauger-gas35', 'Nass-/Trockensauger', 'Bosch GAS 35 M AFC', 'Professioneller Industriesauger mit Filterreinigung.', NULL, 'werkzeuge',
      ARRAY['bonn']::text[], ARRAY[]::text[], '{"Hersteller":"Bosch","Nenneingangsleistung":"1.200 W","Gewicht":"12,4 kg","Behältervolumen brutto":"35 l","Behältervolumen netto":"23 l","Behältervolumen netto Wasser":"19,2 l","Staubklasse Nass-/Trockensauger":"M","Staubklasse":"M","Schlauchlänge":"5 m","Filterfläche":"6.150 cm²","Maße":"(BxLxH):590 x 740 x 400 mm","Spannung, elektrisch":"230 V"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"bonn":"5FSVCT"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bonn-bierglas-0-2l-40er', 'Wasserglas Willi 200ml, 40er Set', NULL, 'Wasserglas 0,2L geeicht von VAN WELL. Spülmaschinenfest. Die Gläser müssen gereinigt zurückgegeben werden. Reinigungspauschale: 3,90 €.', 'Hochwertiges Wasserglas 0,2L geeicht vom Hersteller VAN WELL im praktischen 40er Set. Die Gläser sind spülmaschinenfest und eignen sich ideal für Veranstaltungen, Caterings und private Feiern. Bitte beachten: Die Gläser müssen gereinigt zurückgegeben werden. Bei Rückgabe ohne Reinigung wird eine Reinigungspauschale von 3,90 € erhoben.', 'geschirr-glaeser-besteck',
      ARRAY['bonn']::text[], ARRAY['/product-images/geschirr/bierglas-02-1.jpeg']::text[], '{"Hersteller":"VAN WELL","Typ":"Wasserglas","Volumen":"200 ml (geeicht)","Höhe":"13,5 cm","Durchmesser":"6 cm","Stückzahl":"40 Stück pro Set","Spülmaschinenfest":"Ja","Reinigungspauschale":"3,90 € (bei Rückgabe ohne Reinigung)"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      NULL, NULL, NULL, NULL,
      NULL, NULL, '{"bonn":"3BLGZO"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.b2b_managed_products (
      slug, name, model_name, description, detailed_description, category,
      available_locations, images, specifications, features, tags, rental_notes,
      price_per_day, price_weekend, price_per_month, min_rental_months,
      weight_kg, drive_type, rentware_code, on_request, pdf_url,
      external_manual_url, video_url, video_urls, sort_order, is_published
    ) VALUES (
      'bonn-getraenkekuehlschrank-236l', 'Getränkekühlschrank 236l', NULL, 'Gewerblicher Glastürkühlschrank mit LED-Beleuchtung und 236 l Fassungsvermögen – ideal für Events und Catering.', 'Der Getränkekühlschrank mit 236 Litern Fassungsvermögen ist ein gewerblicher Glastürkühlschrank mit energieeffizienter LED-Beleuchtung. Dank seiner kompakten Abmessungen (54 × 55 × 144 cm) passt er in jede Eventlocation und bietet ausreichend Platz für Getränke aller Art.', 'geschirr-glaeser-besteck',
      ARRAY['bonn']::text[], ARRAY['/product-images/geschirr/getraenkekuehlschrank-236l-1.jpeg','/product-images/geschirr/getraenkekuehlschrank-236l-2.jpeg','/product-images/geschirr/getraenkekuehlschrank-236l-3.jpeg']::text[], '{"Fassungsvermögen":"236 l","Abmessung (B×T×H)":"54 cm × 55 cm × 144 cm","Gewicht":"45 kg","Beleuchtung":"LED","Tür":"Glastür"}'::jsonb, ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
      'ab 20 €', NULL, NULL, NULL,
      NULL, NULL, '{"bonn":"MY5VGV"}'::jsonb, FALSE, NULL,
      NULL, NULL, ARRAY[]::text[], NULL, TRUE
    ) ON CONFLICT (slug) DO NOTHING;
COMMIT;