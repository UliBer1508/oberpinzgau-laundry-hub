-- Add management columns to waeschebestellungen
ALTER TABLE public.waeschebestellungen 
ADD COLUMN IF NOT EXISTS prioritaet integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reihenfolge integer,
ADD COLUMN IF NOT EXISTS bearbeitung_notizen text;

-- Create index for sorting
CREATE INDEX IF NOT EXISTS idx_waeschebestellungen_reihenfolge ON public.waeschebestellungen (reihenfolge);
CREATE INDEX IF NOT EXISTS idx_waeschebestellungen_prioritaet ON public.waeschebestellungen (prioritaet);
CREATE INDEX IF NOT EXISTS idx_waeschebestellungen_lieferdatum ON public.waeschebestellungen (lieferdatum);