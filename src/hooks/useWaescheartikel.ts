import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Waescheartikel = Tables<"waescheartikel">;
export type WaescheartikelInsert = TablesInsert<"waescheartikel">;
export type WaescheartikelUpdate = TablesUpdate<"waescheartikel">;

export function useWaescheartikel() {
  return useQuery({
    queryKey: ["waescheartikel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waescheartikel")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Waescheartikel[];
    },
  });
}

export function useCreateWaescheartikel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artikel: WaescheartikelInsert) => {
      const { data, error } = await supabase
        .from("waescheartikel")
        .insert(artikel)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waescheartikel"] });
    },
  });
}

export function useUpdateWaescheartikel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: WaescheartikelUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("waescheartikel")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waescheartikel"] });
    },
  });
}

export function useToggleWaescheartikelAktiv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, aktiv }: { id: string; aktiv: boolean }) => {
      const { data, error } = await supabase
        .from("waescheartikel")
        .update({ aktiv })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waescheartikel"] });
    },
  });
}

export function useGenerateArtikelnummer() {
  return useQuery({
    queryKey: ["waescheartikel", "next-artikelnummer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waescheartikel")
        .select("artikelnummer")
        .order("artikelnummer", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return "WA001";
      }

      const lastNumber = data[0].artikelnummer;
      const match = lastNumber.match(/WA(\d+)/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `WA${nextNum.toString().padStart(3, "0")}`;
      }

      return `WA${(data.length + 1).toString().padStart(3, "0")}`;
    },
  });
}
