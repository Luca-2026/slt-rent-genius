UPDATE public.new_machines
SET content = REPLACE(
  content::text,
  '/__l5e/assets-v1/e41af02e-2e9c-472f-ae3c-02164b8b94e7/hercu-erdrakete-animation.mp4',
  'https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/videos/hercu-erdrakete-animation.mp4'
)::jsonb
WHERE content::text LIKE '%erdrakete-animation.mp4%';