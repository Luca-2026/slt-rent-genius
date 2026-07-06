UPDATE public.new_machines
SET content = jsonb_set(
  jsonb_set(
    content,
    '{productVideoTitle}',
    to_jsonb('Aufbau & Komponenten der Hercu Erdrakete'::text)
  ),
  '{productVideoCaption}',
  to_jsonb('Hersteller-Animation von Hercu Pneumatic: detaillierter Blick auf den inneren Aufbau der pneumatischen Erdrakete und die hochwertigen, langlebigen Komponenten – von Schlagkolben und Steuerhülse bis zum verschleißfesten Stahlgehäuse.'::text)
)
WHERE category = 'Erdrakete'
  AND content ? 'productVideoUrl';