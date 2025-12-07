-- Create bestellung_history table for tracking order workflow
CREATE TABLE public.bestellung_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bestellung_id UUID NOT NULL REFERENCES public.waeschebestellungen(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  bearbeiter_name TEXT,
  zeitpunkt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notiz TEXT
);

-- Add index for faster lookups
CREATE INDEX idx_bestellung_history_bestellung_id ON public.bestellung_history(bestellung_id);
CREATE INDEX idx_bestellung_history_zeitpunkt ON public.bestellung_history(zeitpunkt DESC);

-- Enable RLS (disabled during development as per project policy)
ALTER TABLE public.bestellung_history ENABLE ROW LEVEL SECURITY;