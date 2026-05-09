import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Routenvorlage {
  id: string;
  name: string;
  beschreibung: string | null;
  aktiv: boolean;
  created_at: string;
  updated_at: string;
  kundenCount?: number;
}

export interface RoutenvorlageKunde {
  id: string;
  vorlage_id: string;
  kunde_id: string;
  reihenfolge: number;
  notizen: string | null;
  kunde?: {
    id: string;
    name: string;
    firma: string | null;
    kundennummer: string;
    plz: string | null;
    ort: string | null;
    strasse: string | null;
  };
}

// Alle Routenvorlagen laden
export function useRoutenvorlagen() {
  return useQuery({
    queryKey: ["routenvorlagen"],
    queryFn: async () => {
      const { data: vorlagen, error } = await supabase
        .from("routenvorlagen")
        .select("*")
        .order("name");

      if (error) throw error;

      // Kundenanzahl für jede Vorlage laden
      const vorlagenMitCount = await Promise.all(
        (vorlagen || []).map(async (vorlage) => {
          const { count } = await supabase
            .from("routenvorlage_kunden")
            .select("*", { count: "exact", head: true })
            .eq("vorlage_id", vorlage.id);

          return {
            ...vorlage,
            kundenCount: count || 0,
          } as Routenvorlage;
        })
      );

      return vorlagenMitCount;
    },
  });
}

// Kunden einer Vorlage laden (in Reihenfolge)
export function useRoutenvorlageKunden(vorlageId: string | null) {
  return useQuery({
    queryKey: ["routenvorlage-kunden", vorlageId],
    queryFn: async () => {
      if (!vorlageId) return [];

      const { data, error } = await supabase
        .from("routenvorlage_kunden")
        .select(`
          id,
          vorlage_id,
          kunde_id,
          reihenfolge,
          notizen,
          kunden (
            id,
            name,
            firma,
            kundennummer,
            plz,
            ort,
            strasse
          )
        `)
        .eq("vorlage_id", vorlageId)
        .order("reihenfolge");

      if (error) throw error;

      return (data || []).map((item) => ({
        id: item.id,
        vorlage_id: item.vorlage_id,
        kunde_id: item.kunde_id,
        reihenfolge: item.reihenfolge,
        notizen: item.notizen,
        kunde: item.kunden as RoutenvorlageKunde["kunde"],
      })) as RoutenvorlageKunde[];
    },
    enabled: !!vorlageId,
  });
}

// Neue Routenvorlage erstellen
export function useCreateRoutenvorlage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; beschreibung?: string }) => {
      const { data: result, error } = await supabase
        .from("routenvorlagen")
        .insert({
          name: data.name,
          beschreibung: data.beschreibung || null,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routenvorlagen"] });
    },
  });
}

// Routenvorlage aktualisieren
export function useUpdateRoutenvorlage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      name: string;
      beschreibung?: string;
      aktiv?: boolean;
    }) => {
      const { data: result, error } = await supabase
        .from("routenvorlagen")
        .update({
          name: data.name,
          beschreibung: data.beschreibung || null,
          aktiv: data.aktiv ?? true,
        })
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routenvorlagen"] });
    },
  });
}

// Routenvorlage löschen
export function useDeleteRoutenvorlage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("routenvorlagen")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routenvorlagen"] });
    },
  });
}

// Kunde zur Vorlage hinzufügen
export function useAddKundeToVorlage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      vorlage_id: string;
      kunde_id: string;
      notizen?: string;
    }) => {
      // Höchste Reihenfolge ermitteln
      const { data: existing } = await supabase
        .from("routenvorlage_kunden")
        .select("reihenfolge")
        .eq("vorlage_id", data.vorlage_id)
        .order("reihenfolge", { ascending: false })
        .limit(1);

      const nextReihenfolge = existing?.[0]?.reihenfolge
        ? existing[0].reihenfolge + 1
        : 1;

      const { data: result, error } = await supabase
        .from("routenvorlage_kunden")
        .insert({
          vorlage_id: data.vorlage_id,
          kunde_id: data.kunde_id,
          reihenfolge: nextReihenfolge,
          notizen: data.notizen || null,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["routenvorlage-kunden", variables.vorlage_id],
      });
      queryClient.invalidateQueries({ queryKey: ["routenvorlagen"] });
    },
  });
}

// Kunde aus Vorlage entfernen
export function useRemoveKundeFromVorlage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; vorlage_id: string }) => {
      const { error } = await supabase
        .from("routenvorlage_kunden")
        .delete()
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["routenvorlage-kunden", variables.vorlage_id],
      });
      queryClient.invalidateQueries({ queryKey: ["routenvorlagen"] });
    },
  });
}

// Reihenfolge der Kunden aktualisieren
export function useUpdateKundenReihenfolge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      vorlage_id: string;
      items: { id: string; reihenfolge: number }[];
    }) => {
      // Alle Updates parallel ausführen
      await Promise.all(
        data.items.map((item) =>
          supabase
            .from("routenvorlage_kunden")
            .update({ reihenfolge: item.reihenfolge })
            .eq("id", item.id)
        )
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["routenvorlage-kunden", variables.vorlage_id],
      });
    },
  });
}

// Bestellungen der Vorlagen-Kunden für ein Datum laden
export function useBestellungenFuerVorlage(
  vorlageId: string | null,
  datum: string | null
) {
  return useQuery({
    queryKey: ["bestellungen-fuer-vorlage", vorlageId, datum],
    queryFn: async () => {
      if (!vorlageId || !datum) return [];

      // Erst Vorlagen-Kunden laden (in Reihenfolge)
      const { data: vorlagenKunden, error: kundenError } = await supabase
        .from("routenvorlage_kunden")
        .select("kunde_id, reihenfolge")
        .eq("vorlage_id", vorlageId)
        .order("reihenfolge");

      if (kundenError) throw kundenError;
      if (!vorlagenKunden?.length) return [];

      const kundenIds = vorlagenKunden.map((k) => k.kunde_id);
      const kundenReihenfolge = new Map(
        vorlagenKunden.map((k) => [k.kunde_id, k.reihenfolge])
      );

      // Bestellungen dieser Kunden für das Datum laden
      const { data: bestellungen, error: bestellError } = await supabase
        .from("waeschebestellungen")
        .select(`
          id,
          bestellnummer,
          kunde_id,
          lieferdatum,
          status,
          kunden (
            id,
            name,
            firma,
            plz,
            ort,
            strasse
          ),
          objekte (
            id,
            name,
            plz,
            ort,
            strasse
          )
        `)
        .in("kunde_id", kundenIds)
        .eq("lieferdatum", datum)
        .in("status", ["neu", "in_bearbeitung"]);

      if (bestellError) throw bestellError;

      // Nach Vorlagen-Reihenfolge sortieren
      return (bestellungen || [])
        .map((b) => ({
          ...b,
          vorlagenReihenfolge: kundenReihenfolge.get(b.kunde_id) || 999,
        }))
        .sort((a, b) => a.vorlagenReihenfolge - b.vorlagenReihenfolge);
    },
    enabled: !!vorlageId && !!datum,
  });
}
