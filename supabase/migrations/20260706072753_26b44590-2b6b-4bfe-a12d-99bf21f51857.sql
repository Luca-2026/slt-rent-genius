UPDATE public.new_machines
SET content = jsonb_set(
  content,
  '{dealerInfo,linkUrl}',
  '"/verkauf/neumaschinen?category=Erdrakete"'::jsonb,
  true
)
WHERE category = 'Erdrakete'
  AND content ? 'dealerInfo';