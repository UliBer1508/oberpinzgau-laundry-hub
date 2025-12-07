-- Add bearbeitung_deadline column to waeschebestellungen table
ALTER TABLE public.waeschebestellungen 
ADD COLUMN bearbeitung_deadline timestamp with time zone NULL;