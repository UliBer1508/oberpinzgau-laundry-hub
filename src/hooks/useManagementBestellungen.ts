import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type BestellPosition = {
  id: string;
  menge: number;
  artikelName: string;
  farbe: string | null;
};

export type ManagementBestellung = Tables<"waeschebestellungen"> & {
  kundeName: string;
  kundeNummer: string;
  objektName: string | null;
  objektStrasse: string | null;
  objektOrt: string | null;
  waeschekraftName: string | null;
  positionen: BestellPosition[];
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

      // Get all positions with article data
      const { data: allPositionen, error: positionenError } = await supabase
        .from("bestellpositionen")
        .select(`
          id,
          bestellung_id,
          menge,
          waescheartikel!artikel_id (name, farbe)
        `);

      if (positionenError) throw positionenError;

      // Group positions by bestellung_id
      const positionenMap = new Map<string, BestellPosition[]>();
      allPositionen?.forEach((pos) => {
        const bestellungId = pos.bestellung_id;
        if (!positionenMap.has(bestellungId)) {
          positionenMap.set(bestellungId, []);
        }
        positionenMap.get(bestellungId)!.push({
          id: pos.id,
          menge: pos.menge,
          artikelName: (pos.waescheartikel as { name: string } | null)?.name || "",
          farbe: (pos.waescheartikel as { farbe: string | null } | null)?.farbe || null,
        });
      });

      return bestellungen?.map((b) => ({
        ...b,
        kundeName: (b.kunden as { name: string } | null)?.name || "Unbekannt",
        kundeNummer: (b.kunden as { kundennummer: string } | null)?.kundennummer || "",
        objektName: (b.objekte as { name: string } | null)?.name || null,
        objektStrasse: (b.objekte as { strasse: string } | null)?.strasse || null,
        objektOrt: (b.objekte as { ort: string } | null)?.ort || null,
        waeschekraftName: (b.waeschekraefte as { name: string } | null)?.name || null,
        positionen: positionenMap.get(b.id) || [],
      })) as ManagementBestellung[];
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

// Update Bearbeitung Deadline
export function useUpdateBearbeitungDeadline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, bearbeitung_deadline }: { id: string; bearbeitung_deadline: string | null }) => {
      const { data, error } = await supabase
        .from("waeschebestellungen")
        .update({ bearbeitung_deadline })
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