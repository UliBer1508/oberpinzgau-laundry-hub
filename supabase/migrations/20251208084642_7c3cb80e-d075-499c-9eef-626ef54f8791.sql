-- Add dunning period field to rechnungseinstellungen
ALTER TABLE rechnungseinstellungen 
ADD COLUMN mahnung_nach_tagen INTEGER NOT NULL DEFAULT 7;