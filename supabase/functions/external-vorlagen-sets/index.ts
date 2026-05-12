import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    const expected = Deno.env.get("EXTERNAL_API_KEY");
    if (!auth?.startsWith("Bearer ") || auth.replace("Bearer ", "") !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const aktivParam = url.searchParams.get("aktiv");
    const aktiv = aktivParam === null ? true : aktivParam === "true";
    const kategorie = url.searchParams.get("kategorie");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let vq = supabase
      .from("waescheset_vorlagen")
      .select("id, name, beschreibung, kategorie, bild_url, aktiv")
      .order("name");
    if (aktiv) vq = vq.eq("aktiv", true);
    if (kategorie) vq = vq.eq("kategorie", kategorie);

    const { data: vorlagen, error: vErr } = await vq;
    if (vErr) throw vErr;

    const ids = (vorlagen ?? []).map((v) => v.id);
    let positionen: Array<{
      vorlage_id: string; menge: number; berechnungsart: string;
      waescheartikel: { artikelnummer: string; name: string } | null;
    }> = [];
    if (ids.length > 0) {
      const { data, error } = await supabase
        .from("waescheset_vorlage_artikel")
        .select("vorlage_id, menge, berechnungsart, waescheartikel!artikel_id (artikelnummer, name)")
        .in("vorlage_id", ids);
      if (error) throw error;
      positionen = (data as typeof positionen) ?? [];
    }

    const result = (vorlagen ?? []).map((v) => ({
      ...v,
      positionen: positionen
        .filter((p) => p.vorlage_id === v.id)
        .map((p) => ({
          artikelnummer: p.waescheartikel?.artikelnummer ?? null,
          name: p.waescheartikel?.name ?? null,
          menge: p.menge,
          berechnungsart: p.berechnungsart,
        })),
    }));

    return new Response(JSON.stringify({ success: true, count: result.length, data: result }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: "Internal Server Error", message: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
