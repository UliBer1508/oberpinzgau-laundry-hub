-- Storage Bucket für Artikelbilder erstellen
INSERT INTO storage.buckets (id, name, public)
VALUES ('artikel-bilder', 'artikel-bilder', true);

-- Policy für öffentlichen Lesezugriff
CREATE POLICY "Öffentlicher Lesezugriff auf Artikelbilder" ON storage.objects
FOR SELECT USING (bucket_id = 'artikel-bilder');

-- Policy für Upload (authentifizierte Benutzer)
CREATE POLICY "Upload Artikelbilder für authentifizierte Benutzer" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'artikel-bilder' AND auth.role() = 'authenticated');

-- Policy für Update
CREATE POLICY "Update Artikelbilder für authentifizierte Benutzer" ON storage.objects
FOR UPDATE USING (bucket_id = 'artikel-bilder' AND auth.role() = 'authenticated');

-- Policy für Delete
CREATE POLICY "Delete Artikelbilder für authentifizierte Benutzer" ON storage.objects
FOR DELETE USING (bucket_id = 'artikel-bilder' AND auth.role() = 'authenticated');

-- Neue Spalte bild_url zur waescheartikel-Tabelle
ALTER TABLE public.waescheartikel
ADD COLUMN bild_url TEXT NULL;