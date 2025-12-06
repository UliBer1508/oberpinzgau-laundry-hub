import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Waeschekraft = Tables<"waeschekraefte">;

// Fetch all workers
export function useWaeschekraefteList() {
  return useQuery({
    queryKey: ["waeschekraefte_list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waeschekraefte")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

// Generate next personnel number
export function useGeneratePersonalnummer() {
  return useQuery({
    queryKey: ["next_personalnummer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waeschekraefte")
        .select("personalnummer")
        .order("personalnummer", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return "WK001";
      }

      const lastNumber = data[0].personalnummer;
      const match = lastNumber.match(/WK(\d+)/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `WK${nextNum.toString().padStart(3, "0")}`;
      }

      return `WK${Date.now()}`;
    },
  });
}

// Create worker
export function useCreateWaeschekraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (worker: TablesInsert<"waeschekraefte">) => {
      const { data, error } = await supabase
        .from("waeschekraefte")
        .insert(worker)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waeschekraefte_list"] });
      queryClient.invalidateQueries({ queryKey: ["waeschekraefte"] });
      queryClient.invalidateQueries({ queryKey: ["next_personalnummer"] });
      toast.success("Wäschekraft erstellt");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
}

// Update worker
export function useUpdateWaeschekraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...worker }: TablesUpdate<"waeschekraefte"> & { id: string }) => {
      const { data, error } = await supabase
        .from("waeschekraefte")
        .update(worker)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waeschekraefte_list"] });
      queryClient.invalidateQueries({ queryKey: ["waeschekraefte"] });
      toast.success("Wäschekraft aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
}

// Toggle worker active status
export function useToggleWaeschekraftAktiv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, aktiv }: { id: string; aktiv: boolean }) => {
      const { error } = await supabase
        .from("waeschekraefte")
        .update({ aktiv })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waeschekraefte_list"] });
      queryClient.invalidateQueries({ queryKey: ["waeschekraefte"] });
      toast.success("Status aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
}

// Toggle portal access
export function useTogglePortalzugang() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, portalzugang }: { id: string; portalzugang: boolean }) => {
      const { error } = await supabase
        .from("waeschekraefte")
        .update({ portalzugang })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waeschekraefte_list"] });
      queryClient.invalidateQueries({ queryKey: ["waeschekraefte"] });
      toast.success("Portalzugang aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
}

// Delete worker
export function useDeleteWaeschekraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("waeschekraefte")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waeschekraefte_list"] });
      queryClient.invalidateQueries({ queryKey: ["waeschekraefte"] });
      toast.success("Wäschekraft gelöscht");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
}
