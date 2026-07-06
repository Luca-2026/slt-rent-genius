
UPDATE new_machines
SET content = regexp_replace(content::text, 'SLT (HP[0-9])', 'Hercu \1', 'g')::jsonb
WHERE category='Erdrakete' AND content::text LIKE '%SLT HP%';

UPDATE new_machines
SET description = regexp_replace(description, 'SLT (HP[0-9])', 'Hercu \1', 'g')
WHERE category='Erdrakete' AND description LIKE '%SLT HP%';
