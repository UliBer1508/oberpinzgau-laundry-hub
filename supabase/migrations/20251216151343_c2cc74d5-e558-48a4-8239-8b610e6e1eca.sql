-- Funktion zur Generierung der nächsten Bestellnummer
CREATE OR REPLACE FUNCTION public.generate_bestellnummer()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  max_num INTEGER;
  new_num TEXT;
BEGIN
  -- Höchste Bestellnummer extrahieren (B0001 -> 1)
  SELECT COALESCE(MAX(CAST(SUBSTRING(bestellnummer FROM 2) AS INTEGER)), 0)
  INTO max_num
  FROM waeschebestellungen
  WHERE bestellnummer ~ '^B[0-9]+$';
  
  -- Nächste Nummer formatieren (B + 4 Ziffern mit führenden Nullen)
  new_num := 'B' || LPAD((max_num + 1)::TEXT, 4, '0');
  
  RETURN new_num;
END;
$$;

-- Trigger-Funktion für automatische Bestellnummer
CREATE OR REPLACE FUNCTION public.trigger_auto_bestellnummer()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Wenn bestellnummer NULL oder leer ist, automatisch generieren
  IF NEW.bestellnummer IS NULL OR NEW.bestellnummer = '' THEN
    NEW.bestellnummer := generate_bestellnummer();
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger auf waeschebestellungen erstellen
DROP TRIGGER IF EXISTS auto_generate_bestellnummer ON waeschebestellungen;
CREATE TRIGGER auto_generate_bestellnummer
BEFORE INSERT ON waeschebestellungen
FOR EACH ROW
EXECUTE FUNCTION trigger_auto_bestellnummer();