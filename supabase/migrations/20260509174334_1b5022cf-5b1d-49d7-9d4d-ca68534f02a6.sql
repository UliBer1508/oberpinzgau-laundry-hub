
-- 1) Rollen-Tabelle
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage roles" ON public.roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can read roles" ON public.roles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE TRIGGER trg_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Berechtigungen
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  resource text NOT NULL,
  action text NOT NULL CHECK (action IN ('view','edit')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_id, resource, action)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage role_permissions" ON public.role_permissions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can read role_permissions" ON public.role_permissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_role_permissions_role ON public.role_permissions(role_id);

-- 3) user_roles erweitern
ALTER TABLE public.user_roles
  ADD COLUMN role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE;

ALTER TABLE public.user_roles ALTER COLUMN role DROP NOT NULL;

CREATE INDEX idx_user_roles_role_id ON public.user_roles(role_id);

-- 4) System-Rollen seeden
INSERT INTO public.roles (key, label, description, is_system) VALUES
  ('admin', 'Administrator', 'Voller Zugriff auf alle Bereiche', true),
  ('waeschekraft', 'Wäschekraft', 'Bearbeitet Aufträge und Liefertouren', true),
  ('kunde', 'Kunde', 'Sieht und legt eigene Bestellungen an', true);

-- 5) Default-Permissions
DO $$
DECLARE
  admin_id uuid;
  wk_id uuid;
  kunde_id uuid;
  res text;
  resources text[] := ARRAY[
    'dashboard','kunden','waescheartikel','waeschesets',
    'bestellungen','bestellungen_management','liefertouren',
    'rechnungen','waeschekraefte','benutzer'
  ];
BEGIN
  SELECT id INTO admin_id FROM public.roles WHERE key='admin';
  SELECT id INTO wk_id FROM public.roles WHERE key='waeschekraft';
  SELECT id INTO kunde_id FROM public.roles WHERE key='kunde';

  -- Admin: alles
  FOREACH res IN ARRAY resources LOOP
    INSERT INTO public.role_permissions (role_id, resource, action) VALUES (admin_id, res, 'view'), (admin_id, res, 'edit');
  END LOOP;

  -- Wäschekraft
  INSERT INTO public.role_permissions (role_id, resource, action) VALUES
    (wk_id, 'dashboard', 'view'),
    (wk_id, 'bestellungen_management', 'view'),
    (wk_id, 'bestellungen_management', 'edit'),
    (wk_id, 'liefertouren', 'view'),
    (wk_id, 'liefertouren', 'edit');

  -- Kunde
  INSERT INTO public.role_permissions (role_id, resource, action) VALUES
    (kunde_id, 'dashboard', 'view'),
    (kunde_id, 'bestellungen', 'view'),
    (kunde_id, 'bestellungen', 'edit');
END $$;

-- 6) Helper: effektive Permissions eines Users
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS TABLE(resource text, action text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT rp.resource, rp.action
  FROM public.user_roles ur
  LEFT JOIN public.roles r_enum ON r_enum.key = ur.role::text
  LEFT JOIN public.roles r_id ON r_id.id = ur.role_id
  JOIN public.role_permissions rp
    ON rp.role_id = COALESCE(r_id.id, r_enum.id)
  WHERE ur.user_id = _user_id;
$$;
