-- Berechnungsart ENUM-Typ erstellen
CREATE TYPE public.berechnungsart AS ENUM ('pro_buchung', 'pro_gast');

-- Spalte zur waescheset_artikel Tabelle hinzufügen
ALTER TABLE public.waescheset_artikel 
ADD COLUMN berechnungsart public.berechnungsart NOT NULL DEFAULT 'pro_buchung';