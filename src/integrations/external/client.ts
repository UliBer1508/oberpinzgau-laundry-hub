// External Supabase client - connects to the shared customer-portal database.
// This client is separate from the Lovable Cloud client to avoid auth-token collisions.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://uzworhojxcxbtsbttstp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6d29yaG9qeGN4YnRzYnR0c3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMTI5MjgsImV4cCI6MjA5Mzg4ODkyOH0.VFQcPQbV7o1XPnsdi-PvOaGG9s_58mC4LD_KgOPwLNA";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    storageKey: "sb-uzworhoj-auth",
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Check if a user has a specific role using the SECURITY DEFINER function in the DB.
 * Never check roles client-side – always go through has_role().
 */
export async function hasRole(
  userId: string,
  role: "admin" | "waeschekraft" | "kunde",
): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: role,
  });
  if (error) {
    console.error("hasRole error:", error);
    return false;
  }
  return Boolean(data);
}
