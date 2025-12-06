import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Waescheset = Tables<"waeschesets"> & {
  objektName: string;
  kundeName: string;
  kundeId: string;
  artikelCount: number;
};

export type WaeschesetInsert = TablesInsert<"waeschesets">;
export type WaeschesetUpdate = TablesUpdate<"waeschesets">;

export type Berechnungsart = "pro_buchung" | "pro_gast";

export type WaeschesetArtikel = Tables<"waescheset_artikel"> & {
  artikelName: string;
  artikelNummer: string;
  kategorie: string | null;
  farbe: string | null;
  berechnungsart: Berechnungsart;
};

// Fetch all Kunden for Wäscheset selection
export function useKundenForWaeschesets() {
  return useQuery({
    queryKey: ["kunden-for-waeschesets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kunden")
        .select("id, name, firma, kundennummer")
        .eq("aktiv", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

// Fetch Objekte by Kunde
export function useObjekteByKunde(kundeId: string | null) {
  return useQuery({
    queryKey: ["objekte-by-kunde", kundeId],
    enabled: !!kundeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("objekte")
        .select("id, name, objektnummer")
        .eq("kunde_id", kundeId!)
        .eq("aktiv", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

// Fetch all Wäschesets with Objekt name, Kunde name, and article count
// Hook to get existing Wäscheset names for a specific object (for automatic numbering)
export function useExistingWaeschesetNames(objektId: string | null) {
  return useQuery({
    queryKey: ["waescheset-names", objektId],
    enabled: !!objektId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waeschesets")
        .select("name")
        .eq("objekt_id", objektId!);
      
      if (error) throw error;
      return data?.map(s => s.name) || [];
    },
  });
}

export function useWaeschesets() {
  return useQuery({
    queryKey: ["waeschesets"],
    queryFn: async () => {
      // First get sets with objekt and kunde info
      const { data: sets, error: setsError } = await supabase
        .from("waeschesets")
        .select(`
          *,
          objekte!objekt_id (
            name,
            kunde_id,
            kunden!kunde_id (name, firma)
          )
        `)
        .order("created_at", { ascending: false });

      if (setsError) throw setsError;

      // Get article counts for each set
      const { data: artikelCounts, error: countsError } = await supabase
        .from("waescheset_artikel")
        .select("set_id");

      if (countsError) throw countsError;

      // Count articles per set
      const countMap = new Map<string, number>();
      artikelCounts?.forEach((item) => {
        countMap.set(item.set_id, (countMap.get(item.set_id) || 0) + 1);
      });

      return sets?.map((set) => {
        const objekt = set.objekte as { name: string; kunde_id: string; kunden: { name: string; firma: string | null } | null } | null;
        const kunde = objekt?.kunden;
        
        return {
          ...set,
          objektName: objekt?.name || "Unbekannt",
          kundeId: objekt?.kunde_id || "",
          kundeName: kunde?.firma || kunde?.name || "Unbekannt",
          artikelCount: countMap.get(set.id) || 0,
        };
      }) as Waescheset[];
    },
  });
}

// Fetch sets for a specific objekt
export function useWaeschesetsByObjekt(objektId: string | null) {
  return useQuery({
    queryKey: ["waeschesets", "objekt", objektId],
    enabled: !!objektId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waeschesets")
        .select("*")
        .eq("objekt_id", objektId!)
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

// Fetch articles for a specific set (with berechnungsart)
export function useWaeschesetArtikel(setId: string | null) {
  return useQuery({
    queryKey: ["waescheset-artikel", setId],
    enabled: !!setId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waescheset_artikel")
        .select(`
          *,
          waescheartikel!artikel_id (
            name,
            artikelnummer,
            kategorie,
            farbe
          )
        `)
        .eq("set_id", setId!);

      if (error) throw error;

      return data?.map((item) => ({
        ...item,
        artikelName: (item.waescheartikel as { name: string } | null)?.name || "",
        artikelNummer: (item.waescheartikel as { artikelnummer: string } | null)?.artikelnummer || "",
        kategorie: (item.waescheartikel as { kategorie: string | null } | null)?.kategorie || null,
        farbe: (item.waescheartikel as { farbe: string | null } | null)?.farbe || null,
        berechnungsart: (item.berechnungsart as Berechnungsart) || "pro_buchung",
      })) as WaeschesetArtikel[];
    },
  });
}

// Fetch all Objekte for select dropdown
export function useObjekteForSelect() {
  return useQuery({
    queryKey: ["objekte-for-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("objekte")
        .select("id, name, objektnummer")
        .eq("aktiv", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

// Fetch all active Wäscheartikel for adding to sets
export function useWaescheartikelForSelect() {
  return useQuery({
    queryKey: ["waescheartikel-for-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waescheartikel")
        .select("id, name, artikelnummer, kategorie, farbe")
        .eq("aktiv", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

// Type for creating waescheset with articles
export type CreateWaeschesetWithArtikel = {
  waescheset: WaeschesetInsert;
  artikel: {
    artikel_id: string;
    menge: number;
    berechnungsart: Berechnungsart;
  }[];
};

// Create a new Wäscheset with articles
export function useCreateWaescheset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ waescheset, artikel }: CreateWaeschesetWithArtikel) => {
      // Create the set first
      const { data: createdSet, error: setError } = await supabase
        .from("waeschesets")
        .insert(waescheset)
        .select()
        .single();

      if (setError) throw setError;

      // If there are articles, add them
      if (artikel.length > 0) {
        const artikelToInsert = artikel.map(a => ({
          set_id: createdSet.id,
          artikel_id: a.artikel_id,
          menge: a.menge,
          berechnungsart: a.berechnungsart,
        }));

        const { error: artikelError } = await supabase
          .from("waescheset_artikel")
          .insert(artikelToInsert);

        if (artikelError) throw artikelError;
      }

      return createdSet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waeschesets"] });
    },
  });
}

// Type for updating waescheset with articles
export type UpdateWaeschesetWithArtikel = {
  id: string;
  waescheset: WaeschesetUpdate;
  artikel: {
    artikel_id: string;
    menge: number;
    berechnungsart: Berechnungsart;
  }[];
};

// Update an existing Wäscheset with articles
export function useUpdateWaeschesetWithArtikel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, waescheset, artikel }: UpdateWaeschesetWithArtikel) => {
      // Update the set
      const { data: updatedSet, error: setError } = await supabase
        .from("waeschesets")
        .update(waescheset)
        .eq("id", id)
        .select()
        .single();

      if (setError) throw setError;

      // Delete existing articles
      const { error: deleteError } = await supabase
        .from("waescheset_artikel")
        .delete()
        .eq("set_id", id);

      if (deleteError) throw deleteError;

      // Insert new articles
      if (artikel.length > 0) {
        const artikelToInsert = artikel.map(a => ({
          set_id: id,
          artikel_id: a.artikel_id,
          menge: a.menge,
          berechnungsart: a.berechnungsart,
        }));

        const { error: artikelError } = await supabase
          .from("waescheset_artikel")
          .insert(artikelToInsert);

        if (artikelError) throw artikelError;
      }

      return updatedSet;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["waeschesets"] });
      queryClient.invalidateQueries({ queryKey: ["waescheset-artikel", variables.id] });
    },
  });
}

// Update an existing Wäscheset
export function useUpdateWaescheset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: WaeschesetUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("waeschesets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waeschesets"] });
    },
  });
}

// Toggle aktiv status
export function useToggleWaeschesetAktiv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, aktiv }: { id: string; aktiv: boolean }) => {
      const { data, error } = await supabase
        .from("waeschesets")
        .update({ aktiv })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waeschesets"] });
    },
  });
}

// Add article to set (with berechnungsart)
export function useAddArtikelToSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      set_id, 
      artikel_id, 
      menge, 
      berechnungsart = "pro_buchung" 
    }: { 
      set_id: string; 
      artikel_id: string; 
      menge: number; 
      berechnungsart?: Berechnungsart;
    }) => {
      const { data, error } = await supabase
        .from("waescheset_artikel")
        .insert({ set_id, artikel_id, menge, berechnungsart })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["waescheset-artikel", variables.set_id] });
      queryClient.invalidateQueries({ queryKey: ["waeschesets"] });
    },
  });
}

// Remove article from set
export function useRemoveArtikelFromSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, set_id }: { id: string; set_id: string }) => {
      const { error } = await supabase
        .from("waescheset_artikel")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, set_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["waescheset-artikel", result.set_id] });
      queryClient.invalidateQueries({ queryKey: ["waeschesets"] });
    },
  });
}

// Update article quantity in set
export function useUpdateArtikelMenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, menge, set_id }: { id: string; menge: number; set_id: string }) => {
      const { data, error } = await supabase
        .from("waescheset_artikel")
        .update({ menge })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, set_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["waescheset-artikel", result.set_id] });
    },
  });
}

// Update article berechnungsart in set
export function useUpdateArtikelBerechnungsart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, berechnungsart, set_id }: { id: string; berechnungsart: Berechnungsart; set_id: string }) => {
      const { data, error } = await supabase
        .from("waescheset_artikel")
        .update({ berechnungsart })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, set_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["waescheset-artikel", result.set_id] });
    },
  });
}
