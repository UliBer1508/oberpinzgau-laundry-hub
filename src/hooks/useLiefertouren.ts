import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Liefertour = Tables<"liefertouren"> & {
  waeschekraftName: string | null;
  stoppCount: number;
  erledigtCount: number;
};

export type LiefertourStopp = Tables<"liefertour_stopps"> & {
  bestellnummer: string;
  kundeName: string;
  objektName: string | null;
  adresse: string | null;
};

export type AvailableBestellung = {
  id: string;
  bestellnummer: string;
  kundeName: string;
  objektName: string | null;
};

// Fetch all tours with worker names and stop counts
export function useLiefertouren() {
  return useQuery({
    queryKey: ["liefertouren"],
    queryFn: async () => {
      // Fetch tours with worker names
      const { data: touren, error: tourenError } = await supabase
        .from("liefertouren")
        .select(`
          *,
          waeschekraefte (name)
        `)
        .order("datum", { ascending: false });

      if (tourenError) throw tourenError;

      // Fetch all stops for counting
      const { data: stopps, error: stoppsError } = await supabase
        .from("liefertour_stopps")
        .select("tour_id, erledigt");

      if (stoppsError) throw stoppsError;

      // Map stops to tours
      const stoppCountMap = new Map<string, { total: number; erledigt: number }>();
      stopps?.forEach((stopp) => {
        const current = stoppCountMap.get(stopp.tour_id) || { total: 0, erledigt: 0 };
        current.total++;
        if (stopp.erledigt) current.erledigt++;
        stoppCountMap.set(stopp.tour_id, current);
      });

      return touren.map((tour): Liefertour => {
        const counts = stoppCountMap.get(tour.id) || { total: 0, erledigt: 0 };
        return {
          ...tour,
          waeschekraftName: (tour.waeschekraefte as { name: string } | null)?.name || null,
          stoppCount: counts.total,
          erledigtCount: counts.erledigt,
        };
      });
    },
  });
}

// Fetch stops for a specific tour
export function useLiefertourStopps(tourId: string | null) {
  return useQuery({
    queryKey: ["liefertour_stopps", tourId],
    queryFn: async () => {
      if (!tourId) return [];

      const { data, error } = await supabase
        .from("liefertour_stopps")
        .select(`
          *,
          waeschebestellungen (
            bestellnummer,
            kunden (name),
            objekte (name, strasse, plz, ort)
          )
        `)
        .eq("tour_id", tourId)
        .order("reihenfolge");

      if (error) throw error;

      return data.map((stopp): LiefertourStopp => {
        const bestellung = stopp.waeschebestellungen as {
          bestellnummer: string;
          kunden: { name: string } | null;
          objekte: { name: string; strasse: string | null; plz: string | null; ort: string | null } | null;
        } | null;
        
        const objekt = bestellung?.objekte;
        const adresse = objekt ? [objekt.strasse, objekt.plz, objekt.ort].filter(Boolean).join(", ") : null;

        return {
          ...stopp,
          bestellnummer: bestellung?.bestellnummer || "---",
          kundeName: bestellung?.kunden?.name || "Unbekannt",
          objektName: objekt?.name || null,
          adresse,
        };
      });
    },
    enabled: !!tourId,
  });
}

// Available orders for a specific date (not yet assigned to any tour)
export function useAvailableBestellungen(datum: string | null, tourId: string | null) {
  return useQuery({
    queryKey: ["available_bestellungen", datum, tourId],
    queryFn: async () => {
      if (!datum) return [];

      // Get already assigned order IDs for this tour
      const { data: existingStopps } = await supabase
        .from("liefertour_stopps")
        .select("bestellung_id")
        .eq("tour_id", tourId || "");

      const assignedIds = existingStopps?.map((s) => s.bestellung_id) || [];

      // Fetch available orders
      let query = supabase
        .from("waeschebestellungen")
        .select(`
          id, bestellnummer,
          kunden (name),
          objekte (name)
        `)
        .eq("lieferdatum", datum)
        .in("status", ["neu", "in_bearbeitung", "ausgeliefert"]);

      if (assignedIds.length > 0) {
        query = query.not("id", "in", `(${assignedIds.join(",")})`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((b): AvailableBestellung => ({
        id: b.id,
        bestellnummer: b.bestellnummer,
        kundeName: (b.kunden as { name: string } | null)?.name || "Unbekannt",
        objektName: (b.objekte as { name: string } | null)?.name || null,
      }));
    },
    enabled: !!datum,
  });
}

// Fetch workers for dropdown
export function useWaeschekraefte() {
  return useQuery({
    queryKey: ["waeschekraefte"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waeschekraefte")
        .select("id, name, personalnummer, typ")
        .eq("aktiv", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

// Fetch only drivers (fahrer or beides) for tour dropdown
export function useFahrer() {
  return useQuery({
    queryKey: ["fahrer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waeschekraefte")
        .select("id, name, personalnummer, typ")
        .eq("aktiv", true)
        .in("typ", ["fahrer", "beides"])
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

// Generate next tour number
export function useGenerateTournummer() {
  return useQuery({
    queryKey: ["next_tournummer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("liefertouren")
        .select("tournummer")
        .order("tournummer", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return "T001";
      }

      const lastNumber = data[0].tournummer;
      const match = lastNumber.match(/T(\d+)/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `T${nextNum.toString().padStart(3, "0")}`;
      }

      return `T${Date.now()}`;
    },
  });
}

// Create tour
export function useCreateLiefertour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tour: TablesInsert<"liefertouren">) => {
      const { data, error } = await supabase
        .from("liefertouren")
        .insert(tour)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liefertouren"] });
      queryClient.invalidateQueries({ queryKey: ["next_tournummer"] });
      toast.success("Liefertour erstellt");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
}

// Update tour
export function useUpdateLiefertour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...tour }: TablesUpdate<"liefertouren"> & { id: string }) => {
      const { data, error } = await supabase
        .from("liefertouren")
        .update(tour)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liefertouren"] });
      toast.success("Liefertour aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
}

// Update tour status
export function useUpdateLiefertourStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("liefertouren")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liefertouren"] });
      toast.success("Status aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
}

// Add stop to tour
export function useAddStoppToTour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tour_id, bestellung_id }: { tour_id: string; bestellung_id: string }) => {
      // Get max reihenfolge
      const { data: existing } = await supabase
        .from("liefertour_stopps")
        .select("reihenfolge")
        .eq("tour_id", tour_id)
        .order("reihenfolge", { ascending: false })
        .limit(1);

      const nextReihenfolge = (existing?.[0]?.reihenfolge || 0) + 1;

      const { error } = await supabase
        .from("liefertour_stopps")
        .insert({
          tour_id,
          bestellung_id,
          reihenfolge: nextReihenfolge,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["liefertour_stopps", variables.tour_id] });
      queryClient.invalidateQueries({ queryKey: ["liefertouren"] });
      queryClient.invalidateQueries({ queryKey: ["available_bestellungen"] });
      toast.success("Stopp hinzugefügt");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
}

// Remove stop from tour
export function useRemoveStoppFromTour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tour_id }: { id: string; tour_id: string }) => {
      const { error } = await supabase
        .from("liefertour_stopps")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return tour_id;
    },
    onSuccess: (tour_id) => {
      queryClient.invalidateQueries({ queryKey: ["liefertour_stopps", tour_id] });
      queryClient.invalidateQueries({ queryKey: ["liefertouren"] });
      queryClient.invalidateQueries({ queryKey: ["available_bestellungen"] });
      toast.success("Stopp entfernt");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
}

// Toggle stop completed
export function useToggleStoppErledigt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tour_id, erledigt }: { id: string; tour_id: string; erledigt: boolean }) => {
      const { error } = await supabase
        .from("liefertour_stopps")
        .update({
          erledigt,
          ankunftszeit: erledigt ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) throw error;
      return tour_id;
    },
    onSuccess: (tour_id) => {
      queryClient.invalidateQueries({ queryKey: ["liefertour_stopps", tour_id] });
      queryClient.invalidateQueries({ queryKey: ["liefertouren"] });
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
}

// Update stop order (reorder)
export function useUpdateStoppReihenfolge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stopps, tour_id }: { stopps: { id: string; reihenfolge: number }[]; tour_id: string }) => {
      for (const stopp of stopps) {
        const { error } = await supabase
          .from("liefertour_stopps")
          .update({ reihenfolge: stopp.reihenfolge })
          .eq("id", stopp.id);

        if (error) throw error;
      }
      return tour_id;
    },
    onSuccess: (tour_id) => {
      queryClient.invalidateQueries({ queryKey: ["liefertour_stopps", tour_id] });
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
}
