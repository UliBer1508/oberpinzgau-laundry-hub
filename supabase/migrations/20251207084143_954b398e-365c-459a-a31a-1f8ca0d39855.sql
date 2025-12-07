-- Add company information columns to rechnungseinstellungen
ALTER TABLE public.rechnungseinstellungen
ADD COLUMN firma_name TEXT,
ADD COLUMN firma_bezeichnung TEXT,
ADD COLUMN firma_strasse TEXT,
ADD COLUMN firma_plz TEXT,
ADD COLUMN firma_ort TEXT,
ADD COLUMN firma_telefon TEXT,
ADD COLUMN firma_email TEXT;

-- Add customer number column to rechnungen
ALTER TABLE public.rechnungen
ADD COLUMN kunde_kundennummer TEXT;