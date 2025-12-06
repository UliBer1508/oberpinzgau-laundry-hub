import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Buchung = Tables<"buchungen"> & {
  objektName: string | null;
  kundeName: string | null;
  status: "anstehend" | "eingecheckt" | "ausgecheckt" | "storniert";
};

// Calculate booking status based on dates
function calculateStatus(checkIn: string, checkOut: string): Buchung["status"] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (today < checkInDate) {
    return "anstehend";
  } else if (today >= checkInDate && today < checkOutDate) {
    return "eingecheckt";
  } else {
    return "ausgecheckt";
  }
}

// Fetch all bookings with object and customer names
export function useBuchungen() {
  return useQuery({
    queryKey: ["buchungen"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("buchungen")
        .select(`
          *,
          objekte (
            name,
            kunden (name)
          )
        `)
        .order("check_in", { ascending: false });

      if (error) throw error;

      return data.map((buchung): Buchung => {
        const objekt = buchung.objekte as { name: string; kunden: { name: string } | null } | null;
        return {
          ...buchung,
          objektName: objekt?.name || null,
          kundeName: objekt?.kunden?.name || null,
          status: calculateStatus(buchung.check_in, buchung.check_out),
        };
      });
    },
  });
}

// Fetch objects for dropdown (with customer info)
export function useObjekteForBuchung() {
  return useQuery({
    queryKey: ["objekte_for_buchung"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("objekte")
        .select(`
          id, name, objektnummer,
          kunden (id, name)
        `)
        .eq("aktiv", true)
        .order("name");

      if (error) throw error;
      return data.map((obj) => ({
        id: obj.id,
        name: obj.name,
        objektnummer: obj.objektnummer,
        kundeName: (obj.kunden as { name: string } | null)?.name || "Unbekannt",
      }));
    },
  });
}

// Generate next booking number
export function useGenerateBuchungsnummer() {
  return useQuery({
    queryKey: ["next_buchungsnummer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("buchungen")
        .select("buchungsnummer")
        .order("buchungsnummer", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return "BU001";
      }

      const lastNumber = data[0].buchungsnummer;
      const match = lastNumber.match(/BU(\d+)/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `BU${nextNum.toString().padStart(3, "0")}`;
      }

      return `BU${Date.now()}`;
    },
  });
}

// Create booking
export function useCreateBuchung() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (buchung: TablesInsert<"buchungen">) => {
      const { data, error } = await supabase
        .from("buchungen")
        .insert(buchung)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buchungen"] });
      queryClient.invalidateQueries({ queryKey: ["next_buchungsnummer"] });
      toast.success("Buchung erstellt");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
}

// Update booking
export function useUpdateBuchung() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...buchung }: TablesUpdate<"buchungen"> & { id: string }) => {
      const { data, error } = await supabase
        .from("buchungen")
        .update(buchung)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buchungen"] });
      toast.success("Buchung aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
}

// Delete booking
export function useDeleteBuchung() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("buchungen")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buchungen"] });
      toast.success("Buchung gelöscht");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
}
