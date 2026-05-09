
-- Enable RLS on sensitive tables
ALTER TABLE public.rechnungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rechnungspositionen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rechnungseinstellungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waeschekraefte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper: any authenticated staff (admin or waeschekraft)
-- Policies: rechnungen — staff only
CREATE POLICY "Staff can view rechnungen"
  ON public.rechnungen FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'waeschekraft'));

CREATE POLICY "Staff can insert rechnungen"
  ON public.rechnungen FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'waeschekraft'));

CREATE POLICY "Staff can update rechnungen"
  ON public.rechnungen FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'waeschekraft'));

CREATE POLICY "Admins can delete rechnungen"
  ON public.rechnungen FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policies: rechnungspositionen — staff only
CREATE POLICY "Staff can view rechnungspositionen"
  ON public.rechnungspositionen FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'waeschekraft'));

CREATE POLICY "Staff can insert rechnungspositionen"
  ON public.rechnungspositionen FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'waeschekraft'));

CREATE POLICY "Staff can update rechnungspositionen"
  ON public.rechnungspositionen FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'waeschekraft'));

CREATE POLICY "Admins can delete rechnungspositionen"
  ON public.rechnungspositionen FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policies: rechnungseinstellungen — admin only (banking config)
CREATE POLICY "Admins can view rechnungseinstellungen"
  ON public.rechnungseinstellungen FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage rechnungseinstellungen"
  ON public.rechnungseinstellungen FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policies: waeschekraefte — staff can view, admin manages
CREATE POLICY "Staff can view waeschekraefte"
  ON public.waeschekraefte FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'waeschekraft'));

CREATE POLICY "Admins can manage waeschekraefte"
  ON public.waeschekraefte FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage: artikel-bilder — public read remains, restrict writes to authenticated
DROP POLICY IF EXISTS "Anyone can upload artikel-bilder" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update artikel-bilder" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete artikel-bilder" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload artikel-bilder" ON storage.objects;
DROP POLICY IF EXISTS "Public can update artikel-bilder" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete artikel-bilder" ON storage.objects;

CREATE POLICY "Public can view artikel-bilder"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'artikel-bilder');

CREATE POLICY "Authenticated can upload artikel-bilder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'artikel-bilder');

CREATE POLICY "Authenticated can update artikel-bilder"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'artikel-bilder');

CREATE POLICY "Authenticated can delete artikel-bilder"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'artikel-bilder');
