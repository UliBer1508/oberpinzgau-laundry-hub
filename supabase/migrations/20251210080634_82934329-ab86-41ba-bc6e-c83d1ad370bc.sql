-- Add farbe column to rechnungspositionen
ALTER TABLE rechnungspositionen ADD COLUMN farbe TEXT;

-- Update existing positions with color from waescheartikel
UPDATE rechnungspositionen rp
SET farbe = wa.farbe
FROM waescheartikel wa
WHERE rp.artikelnummer = wa.artikelnummer;