CREATE TABLE public.waescheset_vorlagen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  beschreibung text,
  kategorie text,
  bild_url text,
  aktiv boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.waescheset_vorlage_artikel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vorlage_id uuid NOT NULL REFERENCES public.waescheset_vorlagen(id) ON DELETE CASCADE,
  artikel_id uuid NOT NULL REFERENCES public.waescheartikel(id) ON DELETE RESTRICT,
  menge integer NOT NULL DEFAULT 1,
  berechnungsart berechnungsart NOT NULL DEFAULT 'pro_buchung'
);

CREATE INDEX idx_vorlage_artikel_vorlage ON public.waescheset_vorlage_artikel(vorlage_id);

CREATE TRIGGER update_waescheset_vorlagen_updated_at
  BEFORE UPDATE ON public.waescheset_vorlagen
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();