import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Kunde = Tables<"kunden"> & {
  objekteCount: number;
};

export type KundeInsert = TablesInsert<"kunden">;
export type KundeUpdate = TablesUpdate<"kunden">;

export function useKunden() {
  return useQuery({
    queryKey: ["kunden"],
    queryFn: async (): Promise<Kunde[]> => {
      // Kunden laden
      const { data: kunden, error: kundenError } = await supabase
        .from("kunden")
        .select("*")
        .order("created_at", { ascending: false });

      if (kundenError) throw kundenError;

      // Objekte pro Kunde zählen
      const { data: objekteCounts, error: objekteError } = await supabase
        .from("objekte")
        .select("kunde_id");

      if (objekteError) throw objekteError;

      // Zählung aggregieren
      const countMap = new Map<string, number>();
      objekteCounts?.forEach((obj) => {
        const current = countMap.get(obj.kunde_id) || 0;
        countMap.set(obj.kunde_id, current + 1);
      });

      // Kunden mit Objektanzahl kombinieren
      return (kunden || []).map((kunde) => ({
        ...kunde,
        objekteCount: countMap.get(kunde.id) || 0,
      }));
    },
  });
}

export function useCreateKunde() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kunde: KundeInsert) => {
      const { data, error } = await supabase
        .from("kunden")
        .insert(kunde)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kunden"] });
    },
  });
}

export function useUpdateKunde() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: KundeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("kunden")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kunden"] });
    },
  });
}

export function useToggleKundeAktiv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, aktiv }: { id: string; aktiv: boolean }) => {
      const { data, error } = await supabase
        .from("kunden")
        .update({ aktiv })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kunden"] });
    },
  });
}
