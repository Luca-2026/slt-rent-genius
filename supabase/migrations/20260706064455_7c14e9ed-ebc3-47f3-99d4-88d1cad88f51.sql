-- HP65 KRT: Produktbild ergänzen
UPDATE new_machines
SET images = ARRAY['/product-images/hercu/hp65krt-1.jpg']::text[],
    updated_at = now()
WHERE slug = 'slt-hp65-krt-erdrakete';

-- Versandkosten je Erdraketen-Durchmesser
-- 45 mm → 49 €
UPDATE new_machines
SET content = jsonb_set(content, '{shipping}', to_jsonb('49 € Versand per Spedition (Lieferung auf Palette) · kostenfreie Abholung in Krefeld oder Bonn'::text)),
    updated_at = now()
WHERE slug IN ('hercu-hp45-eko-t-erdrakete', 'slt-hp45-t-erdrakete');

-- 55 mm → 59 €
UPDATE new_machines
SET content = jsonb_set(content, '{shipping}', to_jsonb('59 € Versand per Spedition (Lieferung auf Palette) · kostenfreie Abholung in Krefeld oder Bonn'::text)),
    updated_at = now()
WHERE slug IN ('hercu-hp55-t-erdrakete', 'hercu-hp55-eko-t-erdrakete', 'hercu-hp55-rt-erdrakete', 'hercu-hp55-krt-erdrakete');

-- 65 mm → 69 €
UPDATE new_machines
SET content = jsonb_set(content, '{shipping}', to_jsonb('69 € Versand per Spedition (Lieferung auf Palette) · kostenfreie Abholung in Krefeld oder Bonn'::text)),
    updated_at = now()
WHERE slug IN ('slt-hp65-t-erdrakete', 'slt-hp65-eko-t-erdrakete', 'slt-hp65-rt-erdrakete', 'slt-hp65-krt-erdrakete');