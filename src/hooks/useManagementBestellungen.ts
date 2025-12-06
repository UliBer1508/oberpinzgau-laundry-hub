import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ManagementBestellung = Tables<"waeschebestellungen"> & {
  kundeName: string;
  kundeNummer: string;
  objektName: string | null;
  objektStrasse: string | null;
  objektOrt: string | null;
  waeschekraftName: string | null;
  positionenCount: number;
};

export type BestellPosition = {
  id: string;
  artikel_id: string;
  menge: number;
  notizen: string | null;
  artikelName: string;
  artikelNummer: string;
  kategorie: string | null;
  farbe: string | null;
  bild_url: string | null;
};

// Fetch all Bestellungen for management view
export function useManagementBestellungen() {
  return useQuery({
    queryKey: ["management-bestellungen"],
    queryFn: async () => {
      const { data: bestellungen, error } = await supabase
        .from("waeschebestellungen")
        .select(`
          *,
          kunden!kunde_id (name, kundennummer),
          objekte!objekt_id (name, strasse, ort),
          waeschekraefte!waeschekraft_id (name)
        `)
        .order("lieferdatum", { ascending: true });

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
        kundeNummer: (b.kunden as { kundennummer: string } | null)?.kundennummer || "",
        objektName: (b.objekte as { name: string } | null)?.name || null,
        objektStrasse: (b.objekte as { strasse: string } | null)?.strasse || null,
        objektOrt: (b.objekte as { ort: string } | null)?.ort || null,
        waeschekraftName: (b.waeschekraefte as { name: string } | null)?.name || null,
        positionenCount: countMap.get(b.id) || 0,
      })) as ManagementBestellung[];
    },
  });
}

// Fetch positions for a specific Bestellung
export function useManagementPositionen(bestellungId: string | null) {
  return useQuery({
    queryKey: ["management-positionen", bestellungId],
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
            farbe,
            bild_url
          )
        `)
        .eq("bestellung_id", bestellungId!);

      if (error) throw error;

      return data?.map((item) => ({
        id: item.id,
        artikel_id: item.artikel_id,
        menge: item.menge,
        notizen: item.notizen,
        artikelName: (item.waescheartikel as { name: string } | null)?.name || "",
        artikelNummer: (item.waescheartikel as { artikelnummer: string } | null)?.artikelnummer || "",
        kategorie: (item.waescheartikel as { kategorie: string | null } | null)?.kategorie || null,
        farbe: (item.waescheartikel as { farbe: string | null } | null)?.farbe || null,
        bild_url: (item.waescheartikel as { bild_url: string | null } | null)?.bild_url || null,
      })) as BestellPosition[];
    },
  });
}

// Update Bestellung priority
export function useUpdatePrioritaet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, prioritaet }: { id: string; prioritaet: number }) => {
      const { data, error } = await supabase
        .from("waeschebestellungen")
        .update({ prioritaet })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["management-bestellungen"] });
    },
  });
}

// Update Bestellung reihenfolge (order)
export function useUpdateReihenfolge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; reihenfolge: number }>) => {
      const promises = updates.map(({ id, reihenfolge }) =>
        supabase
          .from("waeschebestellungen")
          .update({ reihenfolge })
          .eq("id", id)
      );

      const results = await Promise.all(promises);
      const error = results.find((r) => r.error)?.error;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["management-bestellungen"] });
    },
  });
}

// Update Wäschekraft assignment
export function useUpdateWaeschekraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, waeschekraft_id }: { id: string; waeschekraft_id: string | null }) => {
      const { data, error } = await supabase
        .from("waeschebestellungen")
        .update({ waeschekraft_id })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["management-bestellungen"] });
    },
  });
}

// Update Bestellung status
export function useUpdateManagementStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "neu" | "in_bearbeitung" | "ausgeliefert" | "abgeholt" | "abgeschlossen" | "storniert" }) => {
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
      queryClient.invalidateQueries({ queryKey: ["management-bestellungen"] });
    },
  });
}

// Update Bestellung notes
export function useUpdateBearbeitungNotizen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, bearbeitung_notizen }: { id: string; bearbeitung_notizen: string }) => {
      const { data, error } = await supabase
        .from("waeschebestellungen")
        .update({ bearbeitung_notizen })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["management-bestellungen"] });
    },
  });
}