DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.customer_feedback;
CREATE POLICY "Anyone can submit feedback" ON public.customer_feedback FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'new' AND internal_note IS NULL AND voucher_code IS NULL AND voucher_sent_at IS NULL
  AND voucher_sent_to IS NULL AND google_review_confirmed IS NOT NULL
  AND (customer_email IS NULL OR (length(customer_email) <= 255 AND customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'))
  AND (customer_name IS NULL OR length(customer_name) <= 200)
  AND (recommend_score IS NULL OR recommend_score BETWEEN 0 AND 10)
);