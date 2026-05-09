import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/external/client";

export type Rechnungseinstellungen = {
  id: string;
  mwst_satz: number;
  bearbeitungsgebuehr: number;
  updated_at: string;
  firma_name: string | null;
  firma_bezeichnung: string | null;
  firma_strasse: string | null;
  firma_plz: string | null;
  firma_ort: string | null;
  firma_telefon: string | null;
  firma_email: string | null;
  zahlungsfrist_tage: number;
  mahnung_nach_tagen: number;
  mahnung_betreff: string | null;
  mahnung_text: string | null;
  // Neue Felder
  firma_hg: string | null;
  firma_fn: string | null;
  firma_uid: string | null;
  bank_name: string | null;
  bank_iban: string | null;
  bank_bic: string | null;
  zahlungskondition_text: string | null;
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
    mutationFn: async (data: { 
      id: string; 
      mwst_satz: number; 
      bearbeitungsgebuehr: number;
      firma_name?: string | null;
      firma_bezeichnung?: string | null;
      firma_strasse?: string | null;
      firma_plz?: string | null;
      firma_ort?: string | null;
      firma_telefon?: string | null;
      firma_email?: string | null;
      zahlungsfrist_tage?: number;
      mahnung_nach_tagen?: number;
      mahnung_betreff?: string | null;
      mahnung_text?: string | null;
      // Neue Felder
      firma_hg?: string | null;
      firma_fn?: string | null;
      firma_uid?: string | null;
      bank_name?: string | null;
      bank_iban?: string | null;
      bank_bic?: string | null;
      zahlungskondition_text?: string | null;
    }) => {
      const { id, ...updateData } = data;
      const { data: result, error } = await supabase
        .from("rechnungseinstellungen")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
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
