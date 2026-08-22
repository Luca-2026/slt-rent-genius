UPDATE public.b2b_local_category_content
SET hookline = replace(replace(coalesce(hookline,''), 'SMS-Code', 'E-Mail-Code'), 'per SMS', 'per E-Mail'),
    standort_fakten = replace(replace(coalesce(standort_fakten,''), 'SMS-Code', 'E-Mail-Code'), 'per SMS', 'per E-Mail'),
    faqs = replace(replace(faqs::text, 'SMS-Code', 'E-Mail-Code'), 'per SMS', 'per E-Mail')::jsonb,
    updated_at = now()
WHERE (coalesce(hookline,'') || coalesce(standort_fakten,'') || coalesce(faqs::text,'')) ILIKE '%SMS%';