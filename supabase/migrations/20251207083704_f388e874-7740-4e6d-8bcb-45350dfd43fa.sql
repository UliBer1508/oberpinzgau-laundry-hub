-- Einstellungstabelle für globale Rechnungswerte
CREATE TABLE public.rechnungseinstellungen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mwst_satz numeric(4,2) NOT NULL DEFAULT 20.00,
  bearbeitungsgebuehr numeric(10,2) NOT NULL DEFAULT 0.00,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Eine einzige Zeile für die Einstellungen (Singleton)
INSERT INTO public.rechnungseinstellungen (mwst_satz, bearbeitungsgebuehr) 
VALUES (20.00, 0.00);

-- Trigger für updated_at
CREATE TRIGGER update_rechnungseinstellungen_updated_at
  BEFORE UPDATE ON public.rechnungseinstellungen
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Spalte bearbeitungsgebuehr zu rechnungen hinzufügen
ALTER TABLE public.rechnungen
ADD COLUMN bearbeitungsgebuehr numeric(10,2) DEFAULT 0.00 NOT NULL;