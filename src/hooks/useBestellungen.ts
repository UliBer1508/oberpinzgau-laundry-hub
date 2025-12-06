import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Bestellung = Tables<"waeschebestellungen"> & {
  kundeName: string;
  objektName: string | null;
  waeschekraftName: string | null;
  positionenCount: number;
};

export type BestellungInsert = TablesInsert<"waeschebestellungen">;
export type BestellungUpdate = TablesUpdate<"waeschebestellungen">;

export type BestellPosition = Tables<"bestellpositionen"> & {
  artikelName: string;
  artikelNummer: string;
  kategorie: string | null;
  farbe: string | null;
};

export type BestellungStatus = "neu" | "in_bearbeitung" | "ausgeliefert" | "abgeholt" | "abgeschlossen" | "storniert";

// Fetch all Bestellungen with related data
export function useBestellungen() {
  return useQuery({
    queryKey: ["bestellungen"],
    queryFn: async () => {
      const { data: bestellungen, error } = await supabase
        .from("waeschebestellungen")
        .select(`
          *,
          kunden!kunde_id (name),
          objekte!objekt_id (name),
          waeschekraefte!waeschekraft_id (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get position counts
      const { data: positionCounts, error: countsError } = await supabase
        .from("bestellpositionen")
        .select("bestellung_id");

      if (countsError) throw countsError;

      const countMap = new Map<string, number>();
      positionCounts?.forEach((item) => {
        countMap.set(item.bestellung_id, (countMap.get(item.bestellung_id) || 0) + 1);
      });

      return bestellungen?.map((b) => ({
        ...b,
        kundeName: (b.kunden as { name: string } | null)?.name || "Unbekannt",
        objektName: (b.objekte as { name: string } | null)?.name || null,
        waeschekraftName: (b.waeschekraefte as { name: string } | null)?.name || null,
        positionenCount: countMap.get(b.id) || 0,
      })) as Bestellung[];
    },
  });
}

// Fetch positions for a specific Bestellung
export function useBestellungPositionen(bestellungId: string | null) {
  return useQuery({
    queryKey: ["bestellung-positionen", bestellungId],
    enabled: !!bestellungId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bestellpositionen")
        .select(`
          *,
          waescheartikel!artikel_id (
            name,
            artikelnummer,
            kategorie,
            farbe
          )
        `)
        .eq("bestellung_id", bestellungId!);

      if (error) throw error;

      return data?.map((item) => ({
        ...item,
        artikelName: (item.waescheartikel as { name: string } | null)?.name || "",
        artikelNummer: (item.waescheartikel as { artikelnummer: string } | null)?.artikelnummer || "",
        kategorie: (item.waescheartikel as { kategorie: string | null } | null)?.kategorie || null,
        farbe: (item.waescheartikel as { farbe: string | null } | null)?.farbe || null,
      })) as BestellPosition[];
    },
  });
}

// Fetch Kunden for select
export function useKundenForSelect() {
  return useQuery({
    queryKey: ["kunden-for-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kunden")
        .select("id, name, kundennummer")
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

// Fetch Wäschekräfte for select
export function useWaeschekraefteForSelect() {
  return useQuery({
    queryKey: ["waeschekraefte-for-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waeschekraefte")
        .select("id, name, personalnummer")
        .eq("aktiv", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

// Generate next Bestellnummer
export function useGenerateBestellnummer() {
  return useQuery({
    queryKey: ["next-bestellnummer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waeschebestellungen")
        .select("bestellnummer")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return "B0001";
      }

      const lastNumber = data[0].bestellnummer;
      const match = lastNumber.match(/B(\d+)/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `B${nextNum.toString().padStart(4, "0")}`;
      }
      return `B0001`;
    },
  });
}

// Create new Bestellung
export function useCreateBestellung() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bestellung: BestellungInsert) => {
      const { data, error } = await supabase
        .from("waeschebestellungen")
        .insert(bestellung)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bestellungen"] });
      queryClient.invalidateQueries({ queryKey: ["next-bestellnummer"] });
    },
  });
}

// Update Bestellung
export function useUpdateBestellung() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: BestellungUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("waeschebestellungen")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bestellungen"] });
    },
  });
}

// Update Bestellung status
export function useUpdateBestellungStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BestellungStatus }) => {
      const { data, error } = await supabase
        .from("waeschebestellungen")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bestellungen"] });
    },
  });
}

// Add position to Bestellung
export function useAddPositionToBestellung() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bestellung_id, artikel_id, menge, notizen }: { 
      bestellung_id: string; 
      artikel_id: string; 
      menge: number;
      notizen?: string;
    }) => {
      const { data, error } = await supabase
        .from("bestellpositionen")
        .insert({ bestellung_id, artikel_id, menge, notizen })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bestellung-positionen", variables.bestellung_id] });
      queryClient.invalidateQueries({ queryKey: ["bestellungen"] });
    },
  });
}

// Remove position from Bestellung
export function useRemovePositionFromBestellung() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, bestellung_id }: { id: string; bestellung_id: string }) => {
      const { error } = await supabase
        .from("bestellpositionen")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, bestellung_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["bestellung-positionen", result.bestellung_id] });
      queryClient.invalidateQueries({ queryKey: ["bestellungen"] });
    },
  });
}

// Update position quantity
export function useUpdatePositionMenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, menge, bestellung_id }: { id: string; menge: number; bestellung_id: string }) => {
      const { data, error } = await supabase
        .from("bestellpositionen")
        .update({ menge })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, bestellung_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["bestellung-positionen", result.bestellung_id] });
    },
  });
}

// Add multiple positions from Wäscheset
export function useAddWaeschesetToBestellung() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bestellung_id, set_id }: { bestellung_id: string; set_id: string }) => {
      // Get all articles from the set
      const { data: setArtikel, error: fetchError } = await supabase
        .from("waescheset_artikel")
        .select("artikel_id, menge")
        .eq("set_id", set_id);

      if (fetchError) throw fetchError;

      if (!setArtikel || setArtikel.length === 0) {
        throw new Error("Das Wäscheset enthält keine Artikel");
      }

      // Get existing positions to avoid duplicates
      const { data: existingPositions } = await supabase
        .from("bestellpositionen")
        .select("artikel_id")
        .eq("bestellung_id", bestellung_id);

      const existingArtikelIds = new Set(existingPositions?.map(p => p.artikel_id) || []);

      // Filter out articles that already exist
      const newArtikel = setArtikel.filter(a => !existingArtikelIds.has(a.artikel_id));

      if (newArtikel.length === 0) {
        throw new Error("Alle Artikel des Sets sind bereits in der Bestellung");
      }

      // Insert new positions
      const positions = newArtikel.map(a => ({
        bestellung_id,
        artikel_id: a.artikel_id,
        menge: a.menge,
      }));

      const { error: insertError } = await supabase
        .from("bestellpositionen")
        .insert(positions);

      if (insertError) throw insertError;

      return { count: newArtikel.length };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bestellung-positionen", variables.bestellung_id] });
      queryClient.invalidateQueries({ queryKey: ["bestellungen"] });
    },
  });
}
