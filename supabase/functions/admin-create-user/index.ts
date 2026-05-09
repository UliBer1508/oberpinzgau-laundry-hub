import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Role = "admin" | "waeschekraft" | "kunde";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const admin = createClient(url, serviceKey);

    // Verify caller is admin
    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return json({ error: "Unauthorized" }, 401);
    }
    const callerId = claims.claims.sub as string;
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Forbidden – nur Admins" }, 403);

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim();
    const role = body.role as Role;

    if (!email || !password || !name || !role) {
      return json({ error: "email, password, name, role erforderlich" }, 400);
    }
    if (!["admin", "waeschekraft", "kunde"].includes(role)) {
      return json({ error: "Ungültige Rolle" }, 400);
    }
    if (password.length < 6) {
      return json({ error: "Passwort min. 6 Zeichen" }, 400);
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (createErr || !created.user) {
      return json({ error: createErr?.message ?? "Fehler beim Erstellen" }, 400);
    }

    // Trigger handle_new_user creates profile. Insert role.
    const { error: roleErr } = await admin
      .from("user_roles")
      .insert({ user_id: created.user.id, role });
    if (roleErr) {
      // Roll back the user if role insert fails
      await admin.auth.admin.deleteUser(created.user.id);
      return json({ error: "Rollen-Zuweisung fehlgeschlagen: " + roleErr.message }, 500);
    }

    return json({ success: true, user_id: created.user.id });
  } catch (e) {
    console.error("admin-create-user error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
