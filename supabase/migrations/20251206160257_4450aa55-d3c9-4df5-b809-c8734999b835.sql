-- RLS auf allen Tabellen deaktivieren
ALTER TABLE public.bestellpositionen DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.buchungen DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.kunden DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.liefertour_stopps DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.liefertouren DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.objekte DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.waescheartikel DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.waeschebestellungen DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.waeschekraefte DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.waescheset_artikel DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.waeschesets DISABLE ROW LEVEL SECURITY;

-- Alte fehlerhafte Storage-Policies löschen
DROP POLICY IF EXISTS "Upload Artikelbilder für authentifizierte Benutzer" ON storage.objects;
DROP POLICY IF EXISTS "Update Artikelbilder für authentifizierte Benutzer" ON storage.objects;
DROP POLICY IF EXISTS "Delete Artikelbilder für authentifizierte Benutzer" ON storage.objects;

-- Neue offene Policies für artikel-bilder Bucket erstellen
CREATE POLICY "Upload Artikelbilder" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'artikel-bilder');

CREATE POLICY "Update Artikelbilder" ON storage.objects
FOR UPDATE USING (bucket_id = 'artikel-bilder');

CREATE POLICY "Delete Artikelbilder" ON storage.objects
FOR DELETE USING (bucket_id = 'artikel-bilder');