-- Rechnungseinstellungen erweitern für Mahnwesen
ALTER TABLE public.rechnungseinstellungen 
ADD COLUMN zahlungsfrist_tage INTEGER NOT NULL DEFAULT 14,
ADD COLUMN mahnung_email_absender TEXT,
ADD COLUMN mahnung_betreff TEXT DEFAULT 'Zahlungserinnerung - Rechnung {rechnungsnummer}',
ADD COLUMN mahnung_text TEXT DEFAULT 'Sehr geehrte/r {kunde_name},

wir möchten Sie freundlich daran erinnern, dass die Rechnung {rechnungsnummer} vom {rechnungsdatum} über {bruttobetrag} noch offen ist.

Das Zahlungsziel war der {faelligkeitsdatum}.

Bitte überweisen Sie den Betrag zeitnah auf unser Konto.

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen,
{firma_name}';

-- Rechnungen erweitern für Mahnungs-Tracking
ALTER TABLE public.rechnungen 
ADD COLUMN mahnung_gesendet_am TIMESTAMPTZ,
ADD COLUMN mahnung_anzahl INTEGER DEFAULT 0,
ADD COLUMN kunde_email TEXT;