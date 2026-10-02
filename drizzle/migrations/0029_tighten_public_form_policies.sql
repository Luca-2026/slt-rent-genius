DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.customer_feedback;
CREATE POLICY "Anyone can submit feedback" ON public.customer_feedback FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'new' AND internal_note IS NULL AND voucher_code IS NULL AND voucher_sent_at IS NULL
  AND voucher_sent_to IS NULL AND google_review_confirmed = false
  AND (customer_email IS NULL OR (length(customer_email) <= 255 AND customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'))
  AND (customer_name IS NULL OR length(customer_name) <= 200)
  AND (recommend_score IS NULL OR recommend_score BETWEEN 0 AND 10)
);

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated
WITH CHECK (
  gdpr_consent = true AND length(email) <= 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (source IS NULL OR length(source) <= 100)
);

DROP POLICY IF EXISTS "Anyone can submit job applications" ON public.job_applications;
CREATE POLICY "Anyone can submit job applications" ON public.job_applications FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'new' AND internal_notes IS NULL
  AND length(first_name) BETWEEN 1 AND 100 AND length(last_name) BETWEEN 1 AND 100
  AND length(email) <= 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(phone) BETWEEN 3 AND 50
  AND length(job_id) <= 100 AND length(job_title) <= 200
  AND (motivation IS NULL OR length(motivation) <= 10000)
);

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;