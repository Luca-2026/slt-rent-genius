
-- 1) Name-Spalte
UPDATE new_machines
SET name = REPLACE(REPLACE(name, 'SLT-Erdrakete', 'Hercu-Erdrakete'), 'Hercu / Hercu-Erdrakete', 'Hercu-Erdrakete')
WHERE category = 'Erdrakete';

-- 2) Short description
UPDATE new_machines
SET short_description = REPLACE(REPLACE(short_description, 'SLT-Erdrakete', 'Hercu-Erdrakete'), 'Hercu / Hercu-Erdrakete', 'Hercu-Erdrakete')
WHERE category = 'Erdrakete' AND short_description IS NOT NULL;

-- 3) Description (long text)
UPDATE new_machines
SET description =
  REPLACE(
  REPLACE(
  REPLACE(
  REPLACE(
  REPLACE(
  REPLACE(
  REPLACE(
  REPLACE(
    description,
    'Hercu / SLT-Erdraketen', 'Hercu-Erdraketen'),
    'Hercu / SLT-Erdrakete', 'Hercu-Erdrakete'),
    'Hercu / SLT Erdrakete', 'Hercu-Erdrakete'),
    'Hercu / SLT', 'Hercu'),
    'SLT-Erdraketen', 'Hercu-Erdraketen'),
    'SLT-Erdrakete', 'Hercu-Erdrakete'),
    'SLT T-Serie', 'Hercu T-Serie'),
    'Eigenmarke SLT', 'Marke Hercu')
WHERE category = 'Erdrakete' AND description IS NOT NULL;

-- 3b) Description: "SLT HP" (nur wo Modellnummer folgt)
UPDATE new_machines
SET description = regexp_replace(description, 'SLT (HP\d)', 'Hercu \1', 'g')
WHERE category = 'Erdrakete' AND description IS NOT NULL;

-- 3c) Description: "unter der Eigenmarke SLT vertreiben" (Parenthetical bereinigt)
UPDATE new_machines
SET description = regexp_replace(description, '\s*\(die wir unter der Eigenmarke SLT vertreiben\)', '', 'g')
WHERE category = 'Erdrakete' AND description IS NOT NULL;

-- 4) Content JSON (via text cast)
UPDATE new_machines
SET content =
  regexp_replace(
  regexp_replace(
    REPLACE(
    REPLACE(
    REPLACE(
    REPLACE(
    REPLACE(
    REPLACE(
    REPLACE(
    REPLACE(
    REPLACE(
      content::text,
      'Hercu / SLT-Erdraketen', 'Hercu-Erdraketen'),
      'Hercu / SLT-Erdrakete', 'Hercu-Erdrakete'),
      'Hercu / SLT Erdrakete', 'Hercu-Erdrakete'),
      'Hercu / SLT', 'Hercu'),
      'SLT-Erdraketen', 'Hercu-Erdraketen'),
      'SLT-Erdrakete', 'Hercu-Erdrakete'),
      'SLT T-Serie', 'Hercu T-Serie'),
      'Eigenmarke SLT', 'Marke Hercu'),
      '(die wir unter der Marke Hercu vertreiben) ', ''),
    'SLT (HP\d)', 'Hercu \1', 'g'),
    '\s*\(die wir unter der Eigenmarke SLT vertreiben\)', '', 'g')::jsonb
WHERE category = 'Erdrakete' AND content IS NOT NULL;

-- 5) Brand
UPDATE new_machines SET brand = 'Hercu' WHERE category = 'Erdrakete' AND brand = 'SLT';
