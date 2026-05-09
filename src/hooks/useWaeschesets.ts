import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/external/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/external/types";

export type Waescheset = Tables<"waeschesets"> & {
  objektName: string;
  kundeName: string;
  kundeId: string;
  artikelCount: number;
  gesamtpreis: number | null;
};

export type WaeschesetInsert = TablesInsert<"waeschesets">;
export type WaeschesetUpdate = TablesUpdate<"waeschesets">;

export type Berechnungsart = "pro_buchung" | "pro_gast";

export type WaeschesetArtikel = Tables<"waescheset_artikel"> & {
  artikelName: string;
  artikelNummer: string;
  kategorie: string | null;
  farbe: string | null;
  bild_url: string | null;
  bezeichnung: string | null;
  preis: number | null;
  groesse: string | null;
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

// Fetch all Wäschesets with Objekt name, Kunde name, article count, and total price
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

      // Get article details with prices for each set
      const { data: artikelDetails, error: artikelError } = await supabase
        .from("waescheset_artikel")
        .select(`
          set_id,
          menge,
          waescheartikel!artikel_id (preis)
        `);

      if (artikelError) throw artikelError;

      // Calculate count and total price per set
      const statsMap = new Map<string, { count: number; gesamtpreis: number | null }>();
      artikelDetails?.forEach((item) => {
        const current = statsMap.get(item.set_id) || { count: 0, gesamtpreis: null };
        current.count += 1;
        
        const artikel = item.waescheartikel as { preis: number | null } | null;
        if (artikel?.preis !== null && artikel?.preis !== undefined) {
          const artikelSumme = item.menge * artikel.preis;
          current.gesamtpreis = (current.gesamtpreis ?? 0) + artikelSumme;
        }
        
        statsMap.set(item.set_id, current);
      });

      return sets?.map((set) => {
        const objekt = set.objekte as { name: string; kunde_id: string; kunden: { name: string; firma: string | null } | null } | null;
        const kunde = objekt?.kunden;
        const stats = statsMap.get(set.id) || { count: 0, gesamtpreis: null };
        
        return {
          ...set,
          objektName: objekt?.name || "Unbekannt",
          kundeId: objekt?.kunde_id || "",
          kundeName: kunde?.firma || kunde?.name || "Unbekannt",
          artikelCount: stats.count,
          gesamtpreis: stats.gesamtpreis,
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
            farbe,
            bild_url,
            bezeichnung,
            preis,
            groesse
          )
        `)
        .eq("set_id", setId!);

      if (error) throw error;

      return data?.map((item) => {
        const artikel = item.waescheartikel as { 
          name: string; 
          artikelnummer: string; 
          kategorie: string | null; 
          farbe: string | null;
          bild_url: string | null;
          bezeichnung: string | null;
          preis: number | null;
          groesse: string | null;
        } | null;
        
        return {
          ...item,
          artikelName: artikel?.name || "",
          artikelNummer: artikel?.artikelnummer || "",
          kategorie: artikel?.kategorie || null,
          farbe: artikel?.farbe || null,
          bild_url: artikel?.bild_url || null,
          bezeichnung: artikel?.bezeichnung || null,
          preis: artikel?.preis ?? null,
          groesse: artikel?.groesse ?? null,
          berechnungsart: (item.berechnungsart as Berechnungsart) || "pro_buchung",
        };
      }) as WaeschesetArtikel[];
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

// Fetch all active Wäscheartikel for adding to sets (with image, description, and price)
export function useWaescheartikelForSelect() {
  return useQuery({
    queryKey: ["waescheartikel-for-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waescheartikel")
        .select("id, name, artikelnummer, kategorie, farbe, bild_url, bezeichnung, preis, groesse")
        .eq("aktiv", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

// Create a new Wäscheset
export function useCreateWaescheset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (waescheset: WaeschesetInsert) => {
      const { data, error } = await supabase
        .from("waeschesets")
        .insert(waescheset)
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
