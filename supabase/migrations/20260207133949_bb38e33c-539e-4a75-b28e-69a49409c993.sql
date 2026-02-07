
-- Create a public bucket for brand assets (logo etc.)
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Brand assets are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'brand-assets');

-- Allow admins to upload brand assets
CREATE POLICY "Admins can upload brand assets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'brand-assets' AND public.has_role(auth.uid(), 'admin'));
