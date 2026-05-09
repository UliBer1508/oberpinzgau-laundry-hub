import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { permKey, type PermissionAction, type Resource } from "@/lib/permissions";

export type Role = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  is_system: boolean;
};

export type RolePermission = {
  id: string;
  role_id: string;
  resource: string;
  action: PermissionAction;
};

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async (): Promise<Role[]> => {
      const { data, error } = await supabase
        .from("roles" as any)
        .select("id, key, label, description, is_system")
        .order("is_system", { ascending: false })
        .order("label");
      if (error) throw error;
      return (data ?? []) as unknown as Role[];
    },
  });
}

export function useRolePermissions(roleId: string | null | undefined) {
  return useQuery({
    queryKey: ["role-permissions", roleId],
    enabled: !!roleId,
    queryFn: async (): Promise<RolePermission[]> => {
      const { data, error } = await supabase
        .from("role_permissions" as any)
        .select("id, role_id, resource, action")
        .eq("role_id", roleId!);
      if (error) throw error;
      return (data ?? []) as unknown as RolePermission[];
    },
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { key: string; label: string; description?: string | null }) => {
      const { data, error } = await supabase
        .from("roles" as any)
        .insert({ ...input, is_system: false })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Role;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; label: string; description?: string | null }) => {
      const { error } = await supabase
        .from("roles" as any)
        .update({ label: input.label, description: input.description })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("roles" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["role-permissions"] });
    },
  });
}

/**
 * Replace permissions for a role with the given set.
 */
export function useSaveRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      role_id: string;
      permissions: { resource: Resource | string; action: PermissionAction }[];
    }) => {
      const { error: delErr } = await supabase
        .from("role_permissions" as any)
        .delete()
        .eq("role_id", input.role_id);
      if (delErr) throw delErr;
      if (input.permissions.length === 0) return;
      const rows = input.permissions.map((p) => ({
        role_id: input.role_id,
        resource: p.resource,
        action: p.action,
      }));
      const { error } = await supabase.from("role_permissions" as any).insert(rows);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["role-permissions", vars.role_id] });
      qc.invalidateQueries({ queryKey: ["my-permissions"] });
    },
  });
}

/**
 * Effective permissions for the currently logged-in user.
 */
export function useMyPermissions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-permissions", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Set<string>> => {
      const { data, error } = await supabase.rpc("get_user_permissions", {
        _user_id: user!.id,
      });
      if (error) throw error;
      const set = new Set<string>();
      (data ?? []).forEach((row: { resource: string; action: string }) =>
        set.add(permKey(row.resource, row.action))
      );
      return set;
    },
  });
}

export function useCan() {
  const { data: perms } = useMyPermissions();
  return (resource: string, action: PermissionAction = "view") =>
    perms?.has(permKey(resource, action)) ?? false;
}
