-- Wäscheportal Oberpinzgau - Datenbank-Schema
-- HINWEIS: RLS ist während der Entwicklung deaktiviert

-- 1. Enum für Benutzerrollen
CREATE TYPE public.app_role AS ENUM ('admin', 'waeschekraft', 'kunde');

-- 2. Enum für Objekttypen
CREATE TYPE public.objekt_typ AS ENUM ('hotel', 'apartmenthaus', 'ferienhaus', 'ferienwohnung');

-- 3. Enum für Bestellstatus
CREATE TYPE public.bestellung_status AS ENUM ('neu', 'in_bearbeitung', 'ausgeliefert', 'abgeholt', 'abgeschlossen', 'storniert');

-- 4. Enum für Bestellart
CREATE TYPE public.bestellart AS ENUM ('lieferung', 'abholung', 'beides');

-- 5. Benutzerrollen-Tabelle
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'kunde',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 6. Profile-Tabelle
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  telefon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Kunden-Tabelle
CREATE TABLE public.kunden (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kundennummer TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  firma TEXT,
  strasse TEXT,
  plz TEXT,
  ort TEXT,
  telefon TEXT,
  email TEXT,
  anlieferadresse TEXT,
  bestellart bestellart DEFAULT 'beides',
  notizen TEXT,
  aktiv BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Objekte-Tabelle
CREATE TABLE public.objekte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kunde_id UUID REFERENCES public.kunden(id) ON DELETE CASCADE NOT NULL,
  objektnummer TEXT NOT NULL,
  name TEXT NOT NULL,
  typ objekt_typ NOT NULL,
  strasse TEXT,
  plz TEXT,
  ort TEXT,
  ansprechpartner TEXT,
  telefon TEXT,
  notizen TEXT,
  aktiv BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (kunde_id, objektnummer)
);

-- 9. Wäscheartikel-Tabelle
CREATE TABLE public.waescheartikel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artikelnummer TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bezeichnung TEXT,
  farbe TEXT,
  kategorie TEXT,
  aktiv BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. Wäschesets-Tabelle
CREATE TABLE public.waeschesets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objekt_id UUID REFERENCES public.objekte(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  beschreibung TEXT,
  aktiv BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 11. Wäscheset-Artikel (Verknüpfung)
CREATE TABLE public.waescheset_artikel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID REFERENCES public.waeschesets(id) ON DELETE CASCADE NOT NULL,
  artikel_id UUID REFERENCES public.waescheartikel(id) ON DELETE CASCADE NOT NULL,
  menge INTEGER NOT NULL DEFAULT 1,
  UNIQUE (set_id, artikel_id)
);

-- 12. Wäschekräfte-Tabelle
CREATE TABLE public.waeschekraefte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  personalnummer TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  strasse TEXT,
  plz TEXT,
  ort TEXT,
  telefon TEXT,
  email TEXT,
  portalzugang BOOLEAN DEFAULT false,
  aktiv BOOLEAN DEFAULT true,
  notizen TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 13. Buchungen-Tabelle
CREATE TABLE public.buchungen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objekt_id UUID REFERENCES public.objekte(id) ON DELETE CASCADE NOT NULL,
  buchungsnummer TEXT NOT NULL,
  gastname TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  anzahl_personen INTEGER DEFAULT 1,
  notizen TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 14. Wäschebestellungen-Tabelle
CREATE TABLE public.waeschebestellungen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bestellnummer TEXT UNIQUE NOT NULL,
  kunde_id UUID REFERENCES public.kunden(id) ON DELETE CASCADE NOT NULL,
  objekt_id UUID REFERENCES public.objekte(id) ON DELETE SET NULL,
  buchung_id UUID REFERENCES public.buchungen(id) ON DELETE SET NULL,
  waeschekraft_id UUID REFERENCES public.waeschekraefte(id) ON DELETE SET NULL,
  status bestellung_status DEFAULT 'neu',
  lieferdatum DATE,
  lieferzeit TEXT,
  abholdatum DATE,
  abholzeit TEXT,
  notizen TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 15. Bestellpositionen-Tabelle
CREATE TABLE public.bestellpositionen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bestellung_id UUID REFERENCES public.waeschebestellungen(id) ON DELETE CASCADE NOT NULL,
  artikel_id UUID REFERENCES public.waescheartikel(id) ON DELETE CASCADE NOT NULL,
  menge INTEGER NOT NULL DEFAULT 1,
  notizen TEXT
);

-- 16. Liefertouren-Tabelle
CREATE TABLE public.liefertouren (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournummer TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  datum DATE NOT NULL,
  waeschekraft_id UUID REFERENCES public.waeschekraefte(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'geplant',
  notizen TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 17. Liefertour-Stopps
CREATE TABLE public.liefertour_stopps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES public.liefertouren(id) ON DELETE CASCADE NOT NULL,
  bestellung_id UUID REFERENCES public.waeschebestellungen(id) ON DELETE CASCADE NOT NULL,
  reihenfolge INTEGER NOT NULL,
  erledigt BOOLEAN DEFAULT false,
  ankunftszeit TIMESTAMP WITH TIME ZONE,
  notizen TEXT
);

-- Trigger für automatische Profil-Erstellung
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'name', new.email)
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kunden_updated_at BEFORE UPDATE ON public.kunden FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_objekte_updated_at BEFORE UPDATE ON public.objekte FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_waescheartikel_updated_at BEFORE UPDATE ON public.waescheartikel FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_waeschesets_updated_at BEFORE UPDATE ON public.waeschesets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_waeschekraefte_updated_at BEFORE UPDATE ON public.waeschekraefte FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_buchungen_updated_at BEFORE UPDATE ON public.buchungen FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_waeschebestellungen_updated_at BEFORE UPDATE ON public.waeschebestellungen FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_liefertouren_updated_at BEFORE UPDATE ON public.liefertouren FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();