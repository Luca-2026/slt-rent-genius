
-- Add rental_group_id to link multiple reservation rows as one logical rental
ALTER TABLE public.b2b_reservations 
ADD COLUMN rental_group_id TEXT;

-- Index for efficient grouping
CREATE INDEX idx_b2b_reservations_rental_group_id 
ON public.b2b_reservations (rental_group_id) 
WHERE rental_group_id IS NOT NULL;
