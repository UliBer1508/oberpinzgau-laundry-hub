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
        endpoint: "external-order-status",
        method: req.method,
        kundennummer,
        status_code: status,
        latency_ms: Date.now() - t0,
        request_id: requestId,
        query: url.searchParams.toString(),
      });
    } catch (_) { /* fire-and-forget */ }
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
    const kundennummer = keyRow.kundennummer as string;

    // Rate limit
    const now = Date.now();
    const entry = rateLimitMap.get(tokenHash);
    if (!entry || now - entry.windowStart > WINDOW_MS) {
      rateLimitMap.set(tokenHash, { count: 1, windowStart: now });
    } else {
      entry.count += 1;
      if (entry.count > RATE_LIMIT) {
        await log(429, kundennummer);
        return jsonResponse({ error: "Rate limit exceeded" }, 429);
      }
    }

    // last_used_at (fire-and-forget)
    supabase.from("partner_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("token_hash", tokenHash).then(() => {});

    const single = url.searchParams.get("bestellnummer")?.trim();
    const batchRaw = url.searchParams.get("bestellnummern")?.trim();
    if (!single && !batchRaw) {
      await log(400, kundennummer);
      return jsonResponse(
        { error: "Bad Request", message: "bestellnummer oder bestellnummern erforderlich" },
        400,
      );
    }

    const bestellnummern = single
      ? [single]
      : batchRaw!.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 100);

    const { data: rows, error } = await supabase
      .from("waeschebestellungen")
      .select(`
        bestellnummer, status, gastname, check_in, check_out, anzahl_personen,
        lieferdatum, abholdatum, created_at, updated_at,
        kunden!inner(kundennummer, name),
        objekte(objektnummer),
        bestellpositionen(menge, waescheartikel(artikelnummer, name, preis))
      `)
      .eq("kunden.kundennummer", kundennummer)
      .in("bestellnummer", bestellnummern);

    if (error) {
      await log(500, kundennummer);
      return jsonResponse({ error: "Internal", message: error.message }, 500);
    }

    const orders = (rows ?? []).map((r: any) => {
      const positionen = (r.bestellpositionen ?? []).map((p: any) => {
        const einzelpreis = Number(p.waescheartikel?.preis ?? 0);
        const menge = Number(p.menge ?? 0);
        return {
          artikelnummer: p.waescheartikel?.artikelnummer ?? null,
          name: p.waescheartikel?.name ?? null,
          menge,
          einzelpreis: Number(einzelpreis.toFixed(2)),
          summe: Number((einzelpreis * menge).toFixed(2)),
        };
      });
      const gesamt_preis = Number(
        positionen.reduce((s: number, p: any) => s + p.summe, 0).toFixed(2),
      );
      return {
        bestellnummer: r.bestellnummer,
        status: r.status,
        kunde_kundennummer: r.kunden?.kundennummer ?? null,
        objekt_objektnummer: r.objekte?.objektnummer ?? null,
        gastname: r.gastname,
        check_in: r.check_in,
        check_out: r.check_out,
        anzahl_personen: r.anzahl_personen,
        lieferdatum: r.lieferdatum,
        abholdatum: r.abholdatum,
        erstellt_am: r.created_at,
        aktualisiert_am: r.updated_at,
        gesamt_preis,
        waehrung: "EUR",
        positionen,
      };
    });

    if (single) {
      if (orders.length === 0) {
        await log(404, kundennummer);
        return jsonResponse({ error: "Not Found" }, 404);
      }
      await log(200, kundennummer);
      return jsonResponse(orders[0], 200);
    }

    await log(200, kundennummer);
    return jsonResponse({ orders }, 200);
  } catch (e) {
    await log(500, null);
    return jsonResponse({ error: "Internal", message: String(e) }, 500);
  }
});
