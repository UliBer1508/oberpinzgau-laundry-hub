-- Rechnungen Tabelle
CREATE TABLE public.rechnungen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rechnungsnummer text NOT NULL UNIQUE,
  bestellung_id uuid NOT NULL REFERENCES waeschebestellungen(id) ON DELETE CASCADE,
  kunde_id uuid NOT NULL REFERENCES kunden(id),
  
  -- Rechnungsdaten
  rechnungsdatum date NOT NULL DEFAULT CURRENT_DATE,
  faelligkeitsdatum date,
  
  -- Kundenadresse (Snapshot bei Rechnungserstellung)
  kunde_name text NOT NULL,
  kunde_firma text,
  kunde_strasse text,
  kunde_plz text,
  kunde_ort text,
  
  -- Beträge
  nettobetrag numeric(10,2) NOT NULL,
  mwst_satz numeric(4,2) NOT NULL DEFAULT 20.00,
  mwst_betrag numeric(10,2) NOT NULL,
  bruttobetrag numeric(10,2) NOT NULL,
  
  -- Status
  status text NOT NULL DEFAULT 'offen' CHECK (status IN ('offen', 'bezahlt', 'storniert', 'mahnung')),
  bezahlt_am date,
  
  -- Notizen
  notizen text,
  
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Rechnungspositionen Tabelle
CREATE TABLE public.rechnungspositionen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rechnung_id uuid NOT NULL REFERENCES rechnungen(id) ON DELETE CASCADE,
  
  -- Artikeldaten (Snapshot)
  artikelnummer text NOT NULL,
  bezeichnung text NOT NULL,
  menge integer NOT NULL,
  einzelpreis numeric(10,2) NOT NULL,
  gesamtpreis numeric(10,2) NOT NULL
);

-- Trigger für updated_at
CREATE TRIGGER update_rechnungen_updated_at
  BEFORE UPDATE ON public.rechnungen
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indizes
CREATE INDEX idx_rechnungen_kunde_id ON public.rechnungen(kunde_id);
CREATE INDEX idx_rechnungen_bestellung_id ON public.rechnungen(bestellung_id);
CREATE INDEX idx_rechnungspositionen_rechnung_id ON public.rechnungspositionen(rechnung_id);