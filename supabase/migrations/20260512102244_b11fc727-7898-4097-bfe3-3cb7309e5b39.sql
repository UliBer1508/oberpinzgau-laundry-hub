CREATE TABLE public.user_export_presets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  preset_type text NOT NULL CHECK (preset_type IN ('bestellungen','arbeitsauftraege','rechnungen')),
  statuses text[] NOT NULL DEFAULT '{}',
  date_mode text NOT NULL DEFAULT 'alle' CHECK (date_mode IN ('heute','morgen','woche','alle','custom')),
  von date,
  bis date,
  action text NOT NULL DEFAULT 'excel' CHECK (action IN ('print','excel')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, preset_type)
);

ALTER TABLE public.user_export_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own export presets"
  ON public.user_export_presets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own export presets"
  ON public.user_export_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own export presets"
  ON public.user_export_presets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own export presets"
  ON public.user_export_presets FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_user_export_presets_updated_at
  BEFORE UPDATE ON public.user_export_presets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();