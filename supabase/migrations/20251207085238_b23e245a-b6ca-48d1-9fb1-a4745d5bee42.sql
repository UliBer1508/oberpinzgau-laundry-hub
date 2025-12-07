-- 1. Neue Spalten zu waeschebestellungen hinzufügen
ALTER TABLE public.waeschebestellungen
ADD COLUMN IF NOT EXISTS gastname TEXT,
ADD COLUMN IF NOT EXISTS check_in DATE,
ADD COLUMN IF NOT EXISTS check_out DATE;

-- anzahl_personen existiert implizit durch buchung, aber wir brauchen es direkt
-- Prüfen ob schon vorhanden, falls nicht hinzufügen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'waeschebestellungen' 
    AND column_name = 'anzahl_personen'
  ) THEN
    ALTER TABLE public.waeschebestellungen ADD COLUMN anzahl_personen INTEGER DEFAULT 1;
  END IF;
END $$;

-- 2. Bestehende Buchungsdaten migrieren (falls vorhanden)
UPDATE public.waeschebestellungen wb
SET 
  gastname = b.gastname,
  check_in = b.check_in,
  check_out = b.check_out,
  anzahl_personen = COALESCE(b.anzahl_personen, 1)
FROM public.buchungen b
WHERE wb.buchung_id = b.id;

-- 3. Foreign Key Constraint entfernen
ALTER TABLE public.waeschebestellungen 
DROP CONSTRAINT IF EXISTS waeschebestellungen_buchung_id_fkey;

-- 4. buchung_id Spalte entfernen
ALTER TABLE public.waeschebestellungen 
DROP COLUMN IF EXISTS buchung_id;

-- 5. Buchungen-Tabelle löschen
DROP TABLE IF EXISTS public.buchungen;