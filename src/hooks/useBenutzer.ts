import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "admin" | "waeschekraft" | "kunde";

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Admin",
  waeschekraft: "Wäschekraft",
  kunde: "Kunde",
};

export const ALL_ROLES: AppRole[] = ["admin", "waeschekraft", "kunde"];

export type Benutzer = {
  id: string;
  email: string;
  name: string;
  telefon: string | null;
  created_at: string;
  role: AppRole | null;
};

export function useCurrentUserRole() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["current-role", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<AppRole | null> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data?.role as AppRole | undefined) ?? null;
    },
  });
}

export function useBenutzer() {
  return useQuery({
    queryKey: ["benutzer"],
    queryFn: async (): Promise<Benutzer[]> => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, email, name, telefon, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: roles, error: rolesErr } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rolesErr) throw rolesErr;

      const roleMap = new Map<string, AppRole>();
      roles?.forEach((r) => roleMap.set(r.user_id, r.role as AppRole));

      return (profiles ?? []).map((p) => ({
        ...p,
        role: roleMap.get(p.id) ?? null,
      }));
    },
  });
}

export function useCreateBenutzer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      email: string;
      password: string;
      name: string;
      role: AppRole;
    }) => {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: input,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["benutzer"] }),
  });
}

export function useDeleteBenutzer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (user_id: string) => {
      const { data, error } = await supabase.functions.invoke("admin-delete-user", {
        body: { user_id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["benutzer"] }),
  });
}

export function useUpdateBenutzerProfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; name: string; telefon: string | null }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ name: input.name, telefon: input.telefon })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["benutzer"] }),
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { user_id: string; role: AppRole }) => {
      // delete existing roles, insert new (single role per user)
      const { error: delErr } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", input.user_id);
      if (delErr) throw delErr;
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: input.user_id, role: input.role });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["benutzer"] }),
  });
}
