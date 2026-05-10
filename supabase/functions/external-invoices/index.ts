import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 60;
const WINDOW_MS = 60_000;

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const t0 = Date.now();
  const requestId = crypto.randomUUID();
  const url = new URL(req.url);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const log = async (status: number, kundennummer: string | null) => {
    try {
      await supabase.from("partner_api_log").insert({
        endpoint: "external-invoices",
        method: req.method,
        kundennummer,
        status_code: status,
        latency_ms: Date.now() - t0,
        request_id: requestId,
        query: url.searchParams.toString(),
      });
    } catch (_) {}
  };

  try {
    if (req.method !== "GET") {
      await log(405, null);
      return jsonResponse({ error: "Method Not Allowed" }, 405);
    }

    const auth = req.headers.get("Authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!token) {
      await log(401, null);
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const tokenHash = await sha256Hex(token);
    const { data: keyRow } = await supabase
      .from("partner_api_keys")
      .select("kundennummer, is_active")
      .eq("token_hash", tokenHash)
      .eq("is_active", true)
      .maybeSingle();

    if (!keyRow) {
      await log(401, null);
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    const tokenKundennummer = keyRow.kundennummer as string;

    // Rate limit
    const now = Date.now();
    const entry = rateLimitMap.get(tokenHash);
    if (!entry || now - entry.windowStart > WINDOW_MS) {
      rateLimitMap.set(tokenHash, { count: 1, windowStart: now });
    } else {
      entry.count += 1;
      if (entry.count > RATE_LIMIT) {
        await log(429, tokenKundennummer);
        return jsonResponse({ error: "Rate limit exceeded" }, 429);
      }
    }

    supabase.from("partner_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("token_hash", tokenHash).then(() => {});

    // Query params
    const queryKunde = url.searchParams.get("kundennummer")?.trim();
    if (queryKunde && queryKunde !== tokenKundennummer) {
      await log(403, tokenKundennummer);
      return jsonResponse({ error: "Forbidden" }, 403);
    }
    const kundennummer = tokenKundennummer;
    const since = url.searchParams.get("since")?.trim();
    const status = url.searchParams.get("status")?.trim();
    const limitParam = parseInt(url.searchParams.get("limit") ?? "100", 10);
    const limit = Math.min(Math.max(isNaN(limitParam) ? 100 : limitParam, 1), 500);

    let q = supabase
      .from("rechnungen")
      .select(`
        id, rechnungsnummer, rechnungsdatum, faelligkeitsdatum, bezahlt_am, status,
        nettobetrag, mwst_betrag, bruttobetrag, kunde_kundennummer, kunde_name,
        bestellung_id
      `)
      .eq("kunde_kundennummer", kundennummer)
      .order("rechnungsdatum", { ascending: false })
      .limit(limit);

    if (since) q = q.gte("rechnungsdatum", since);
    if (status) q = q.eq("status", status);

    const { data: rechnungen, error } = await q;
    if (error) {
      await log(500, kundennummer);
      return jsonResponse({ error: "Internal", message: error.message }, 500);
    }

    const ids = (rechnungen ?? []).map((r: any) => r.id);
    const bestellIds = (rechnungen ?? [])
      .map((r: any) => r.bestellung_id).filter(Boolean);

    // Positionen + Bestellnummern in Batches laden
    const [posRes, bestRes] = await Promise.all([
      ids.length
        ? supabase.from("rechnungspositionen")
            .select("rechnung_id, bezeichnung, menge, einzelpreis, gesamtpreis")
            .in("rechnung_id", ids)
        : Promise.resolve({ data: [], error: null } as any),
      bestellIds.length
        ? supabase.from("waeschebestellungen")
            .select("id, bestellnummer")
            .in("id", bestellIds)
        : Promise.resolve({ data: [], error: null } as any),
    ]);

    const posByRechnung = new Map<string, any[]>();
    for (const p of (posRes.data ?? [])) {
      const arr = posByRechnung.get(p.rechnung_id) ?? [];
      arr.push(p);
      posByRechnung.set(p.rechnung_id, arr);
    }
    const bestNrById = new Map<string, string>();
    for (const b of (bestRes.data ?? [])) {
      bestNrById.set(b.id, b.bestellnummer);
    }

    const out = (rechnungen ?? []).map((r: any) => {
      const bestNr = r.bestellung_id ? bestNrById.get(r.bestellung_id) ?? null : null;
      const positionen = (posByRechnung.get(r.id) ?? []).map((p: any) => ({
        bezeichnung: p.bezeichnung,
        menge: Number(p.menge ?? 0),
        einzelpreis: Number(Number(p.einzelpreis ?? 0).toFixed(2)),
        summe: Number(Number(p.gesamtpreis ?? 0).toFixed(2)),
        bestellnummer: bestNr,
      }));
      return {
        id: r.id,
        rechnungsnummer: r.rechnungsnummer,
        rechnungsdatum: r.rechnungsdatum,
        faelligkeitsdatum: r.faelligkeitsdatum,
        bezahlt_am: r.bezahlt_am,
        status: r.status,
        nettobetrag: Number(Number(r.nettobetrag ?? 0).toFixed(2)),
        mwst_betrag: Number(Number(r.mwst_betrag ?? 0).toFixed(2)),
        bruttobetrag: Number(Number(r.bruttobetrag ?? 0).toFixed(2)),
        waehrung: "EUR",
        kunde_kundennummer: r.kunde_kundennummer,
        kunde_name: r.kunde_name,
        pdf_url: null, // Folge-Iteration: signierte URL via Storage
        positionen,
      };
    });

    await log(200, kundennummer);
    return jsonResponse({ rechnungen: out, count: out.length }, 200);
  } catch (e) {
    await log(500, null);
    return jsonResponse({ error: "Internal", message: String(e) }, 500);
  }
});
