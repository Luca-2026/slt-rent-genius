UPDATE public.b2b_managed_products
SET rental_notes = ARRAY[
  'Transport ausschließlich stehend. Wird der Kühlschrank liegend oder stark gekippt transportiert, kann Kompressoröl in den Kältekreislauf gelangen.',
  'Vor dem ersten Einschalten nach dem Transport mindestens 2 Stunden stehen lassen, damit das Öl in den Kompressor zurückfließen kann. Frühzeitiges Einschalten kann den Kompressor beschädigen.'
]::text[]
WHERE slug IN ('getraenkekuehlschrank-236l', 'bonn-getraenkekuehlschrank-236l');