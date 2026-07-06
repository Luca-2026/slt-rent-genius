
UPDATE new_machines
SET content = REPLACE(REPLACE(content::text, 'SLT HP-Modelle', 'Hercu HP-Modelle'), 'SLT T-Modelle', 'Hercu T-Modelle')::jsonb
WHERE category='Erdrakete';

UPDATE new_machines
SET description = REPLACE(REPLACE(description, 'SLT HP-Modelle', 'Hercu HP-Modelle'), 'SLT T-Modelle', 'Hercu T-Modelle')
WHERE category='Erdrakete' AND description IS NOT NULL;
