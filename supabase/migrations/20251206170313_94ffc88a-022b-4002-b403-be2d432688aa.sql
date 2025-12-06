-- Neuen ENUM-Typ für Bestellmodus erstellen
CREATE TYPE bestellmodus AS ENUM ('mit_buchung', 'nur_sets');

-- Neue Spalte zur kunden-Tabelle hinzufügen
ALTER TABLE kunden 
ADD COLUMN bestellmodus bestellmodus NOT NULL DEFAULT 'mit_buchung';