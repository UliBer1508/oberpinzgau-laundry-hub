-- Erweitere rechnungseinstellungen um Bankverbindung und Firmendaten
ALTER TABLE public.rechnungseinstellungen
ADD COLUMN IF NOT EXISTS firma_hg TEXT,
ADD COLUMN IF NOT EXISTS firma_fn TEXT,
ADD COLUMN IF NOT EXISTS firma_uid TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_iban TEXT,
ADD COLUMN IF NOT EXISTS bank_bic TEXT,
ADD COLUMN IF NOT EXISTS zahlungskondition_text TEXT DEFAULT 'Zahlungsfrist: {zahlungsfrist_tage} Tage netto';

-- Erweitere rechnungen um Lieferadresse-Snapshot
ALTER TABLE public.rechnungen
ADD COLUMN IF NOT EXISTS lieferadresse_strasse TEXT,
ADD COLUMN IF NOT EXISTS lieferadresse_plz TEXT,
ADD COLUMN IF NOT EXISTS lieferadresse_ort TEXT;