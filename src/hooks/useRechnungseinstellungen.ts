import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Rechnungseinstellungen = {
  id: string;
  mwst_satz: number;
  bearbeitungsgebuehr: number;
  updated_at: string;
};

// Einstellungen abrufen
export function useRechnungseinstellungen() {
  return useQuery({
    queryKey: ["rechnungseinstellungen"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rechnungseinstellungen")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Rechnungseinstellungen | null;
    },
  });
}

// Einstellungen aktualisieren
export function useUpdateRechnungseinstellungen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      mwst_satz, 
      bearbeitungsgebuehr 
    }: { 
      id: string; 
      mwst_satz: number; 
      bearbeitungsgebuehr: number; 
    }) => {
      const { data, error } = await supabase
        .from("rechnungseinstellungen")
        .update({ mwst_satz, bearbeitungsgebuehr })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rechnungseinstellungen"] });
    },
  });
}

// Einstellungen für createRechnungForBestellung laden
export async function fetchRechnungseinstellungen() {
  const { data, error } = await supabase
    .from("rechnungseinstellungen")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as Rechnungseinstellungen | null;
}
