-- Routenvorlagen - Vordefinierte Routen (z.B. "Pinzgau West", "Mittersill-Krimml")
CREATE TABLE public.routenvorlagen (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  beschreibung TEXT,
  aktiv BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Kunden pro Vorlage in Reihenfolge
CREATE TABLE public.routenvorlage_kunden (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vorlage_id UUID NOT NULL REFERENCES public.routenvorlagen(id) ON DELETE CASCADE,
  kunde_id UUID NOT NULL REFERENCES public.kunden(id) ON DELETE CASCADE,
  reihenfolge INTEGER NOT NULL,
  notizen TEXT,
  UNIQUE(vorlage_id, kunde_id)
);

-- Indexes für Performance
CREATE INDEX idx_routenvorlage_kunden_vorlage ON public.routenvorlage_kunden(vorlage_id);
CREATE INDEX idx_routenvorlage_kunden_reihenfolge ON public.routenvorlage_kunden(vorlage_id, reihenfolge);

-- Trigger für updated_at
CREATE TRIGGER update_routenvorlagen_updated_at
  BEFORE UPDATE ON public.routenvorlagen
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();