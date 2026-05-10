
CREATE TABLE IF NOT EXISTS public.partner_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kundennummer text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  bezeichnung text,
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_api_keys_active_hash
  ON public.partner_api_keys(token_hash) WHERE is_active;

ALTER TABLE public.partner_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage partner_api_keys"
  ON public.partner_api_keys FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_partner_api_keys_updated_at
  BEFORE UPDATE ON public.partner_api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


CREATE TABLE IF NOT EXISTS public.partner_api_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  method text NOT NULL,
  kundennummer text,
  status_code int NOT NULL,
  latency_ms int,
  request_id text,
  query text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_api_log_kunde_time
  ON public.partner_api_log(kundennummer, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_partner_api_log_endpoint_time
  ON public.partner_api_log(endpoint, created_at DESC);

ALTER TABLE public.partner_api_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read partner_api_log"
  ON public.partner_api_log FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
