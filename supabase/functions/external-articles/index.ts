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
    const search = url.searchParams.get("search");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let q = supabase
      .from("waescheartikel")
      .select("artikelnummer, name, bezeichnung, kategorie, farbe, groesse, preis, bild_url, aktiv")
      .order("name");

    if (aktiv) q = q.eq("aktiv", true);
    if (kategorie) q = q.eq("kategorie", kategorie);
    if (search) q = q.or(`name.ilike.%${search}%,artikelnummer.ilike.%${search}%`);

    const { data, error } = await q;
    if (error) throw error;

    return new Response(JSON.stringify({ success: true, count: data?.length ?? 0, data }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: "Internal Server Error", message: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
