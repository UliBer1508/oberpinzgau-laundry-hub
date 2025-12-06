-- Enum für die verschiedenen Mitarbeiter-Typen erstellen
CREATE TYPE public.mitarbeiter_typ AS ENUM ('waeschekraft', 'fahrer', 'beides');

-- Neue Spalte hinzufügen (Default: 'waeschekraft' für bestehende Einträge)
ALTER TABLE public.waeschekraefte 
ADD COLUMN typ public.mitarbeiter_typ NOT NULL DEFAULT 'waeschekraft';