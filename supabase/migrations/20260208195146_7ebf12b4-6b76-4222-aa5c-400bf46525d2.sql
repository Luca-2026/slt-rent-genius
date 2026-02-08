
-- Add known defects and additional defects fields to delivery notes
ALTER TABLE public.b2b_delivery_notes ADD COLUMN known_defects TEXT;
ALTER TABLE public.b2b_delivery_notes ADD COLUMN additional_defects TEXT;

-- Add known defects and photo URLs to return protocols
ALTER TABLE public.b2b_return_protocols ADD COLUMN known_defects_from_delivery TEXT;
ALTER TABLE public.b2b_return_protocols ADD COLUMN additional_defects_at_return TEXT;
ALTER TABLE public.b2b_return_protocols ADD COLUMN photo_urls TEXT[] DEFAULT '{}'::TEXT[];
