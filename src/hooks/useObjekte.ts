import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Objekt = Tables<"objekte"> & {
  kundeName: string;
  kundeFirma: string | null;
};

export type ObjektInsert = TablesInsert<"objekte">;
export type ObjektUpdate = TablesUpdate<"objekte">;

export function useObjekte() {
  return useQuery({
    queryKey: ["objekte"],
    queryFn: async (): Promise<Objekt[]> => {
      const { data, error } = await supabase
        .from("objekte")
        .select(`
          *,
          kunden!kunde_id (name, firma)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((objekt: any) => ({
        ...objekt,
        kundeName: objekt.kunden?.name || "Unbekannt",
        kundeFirma: objekt.kunden?.firma || null,
        kunden: undefined,
      }));
    },
  });
}

export function useKundenForSelect() {
  return useQuery({
    queryKey: ["kunden", "select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kunden")
        .select("id, name, firma, kundennummer")
        .eq("aktiv", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateObjekt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (objekt: ObjektInsert) => {
      const { data, error } = await supabase
        .from("objekte")
        .insert(objekt)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objekte"] });
      queryClient.invalidateQueries({ queryKey: ["kunden"] });
    },
  });
}

export function useUpdateObjekt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ObjektUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("objekte")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objekte"] });
      queryClient.invalidateQueries({ queryKey: ["kunden"] });
    },
  });
}

export function useToggleObjektAktiv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, aktiv }: { id: string; aktiv: boolean }) => {
      const { data, error } = await supabase
        .from("objekte")
        .update({ aktiv })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objekte"] });
      queryClient.invalidateQueries({ queryKey: ["kunden"] });
    },
  });
}
