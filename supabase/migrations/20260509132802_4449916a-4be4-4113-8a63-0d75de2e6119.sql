ALTER TABLE public.objekte ADD COLUMN IF NOT EXISTS bild_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('objekt-bilder', 'objekt-bilder', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Objekt-Bilder oeffentlich lesen"
ON storage.objects FOR SELECT
USING (bucket_id = 'objekt-bilder');

CREATE POLICY "Objekt-Bilder hochladen"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'objekt-bilder' AND auth.uid() IS NOT NULL);

CREATE POLICY "Objekt-Bilder aktualisieren"
ON storage.objects FOR UPDATE
USING (bucket_id = 'objekt-bilder' AND auth.uid() IS NOT NULL);

CREATE POLICY "Objekt-Bilder loeschen"
ON storage.objects FOR DELETE
USING (bucket_id = 'objekt-bilder' AND auth.uid() IS NOT NULL);