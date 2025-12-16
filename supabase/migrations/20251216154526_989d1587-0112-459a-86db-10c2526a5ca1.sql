-- Funktion robuster machen - Bestellnummern mit mehr als 8 Zeichen ausschließen
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
  -- Nur gültige Bestellnummern berücksichtigen (max 8 Zeichen = B + 7 Ziffern)
  SELECT COALESCE(MAX(CAST(SUBSTRING(bestellnummer FROM 2) AS INTEGER)), 0)
  INTO max_num
  FROM waeschebestellungen
  WHERE bestellnummer ~ '^B[0-9]+$'
    AND LENGTH(bestellnummer) <= 8;
  
  -- Nächste Nummer formatieren (B + 4 Ziffern mit führenden Nullen)
  new_num := 'B' || LPAD((max_num + 1)::TEXT, 4, '0');
  
  RETURN new_num;
END;
$$;