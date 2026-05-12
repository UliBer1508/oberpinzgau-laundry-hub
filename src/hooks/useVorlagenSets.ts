import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type { Berechnungsart } from "@/hooks/useWaeschesets";

export type VorlageSet = Tables<"waescheset_vorlagen"> & {
  artikelCount: number;
  gesamtpreis: number | null;
};

export type VorlageInsert = TablesInsert<"waescheset_vorlagen">;
export type VorlageUpdate = TablesUpdate<"waescheset_vorlagen">;

export type VorlageArtikel = Tables<"waescheset_vorlage_artikel"> & {
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

export function useVorlagenSets() {
  return useQuery({
    queryKey: ["vorlagen-sets"],
    queryFn: async () => {
      const { data: vorlagen, error } = await supabase
        .from("waescheset_vorlagen")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: positionen, error: posError } = await supabase
        .from("waescheset_vorlage_artikel")
        .select("vorlage_id, menge, waescheartikel!artikel_id (preis)");
      if (posError) throw posError;

      const stats = new Map<string, { count: number; gesamtpreis: number | null }>();
      positionen?.forEach((p) => {
        const cur = stats.get(p.vorlage_id) || { count: 0, gesamtpreis: null };
        cur.count += 1;
        const art = p.waescheartikel as { preis: number | null } | null;
        if (art?.preis !== null && art?.preis !== undefined) {
          cur.gesamtpreis = (cur.gesamtpreis ?? 0) + p.menge * art.preis;
        }
        stats.set(p.vorlage_id, cur);
      });

      return (vorlagen ?? []).map((v) => ({
        ...v,
        artikelCount: stats.get(v.id)?.count ?? 0,
        gesamtpreis: stats.get(v.id)?.gesamtpreis ?? null,
      })) as VorlageSet[];
    },
  });
}

export function useVorlageArtikel(vorlageId: string | null) {
  return useQuery({
    queryKey: ["vorlage-artikel", vorlageId],
    enabled: !!vorlageId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waescheset_vorlage_artikel")
        .select(`*, waescheartikel!artikel_id (name, artikelnummer, kategorie, farbe, bild_url, bezeichnung, preis, groesse)`)
        .eq("vorlage_id", vorlageId!);
      if (error) throw error;

      return (data ?? []).map((item) => {
        const a = item.waescheartikel as {
          name: string; artikelnummer: string; kategorie: string | null;
          farbe: string | null; bild_url: string | null; bezeichnung: string | null;
          preis: number | null; groesse: string | null;
        } | null;
        return {
          ...item,
          artikelName: a?.name ?? "",
          artikelNummer: a?.artikelnummer ?? "",
          kategorie: a?.kategorie ?? null,
          farbe: a?.farbe ?? null,
          bild_url: a?.bild_url ?? null,
          bezeichnung: a?.bezeichnung ?? null,
          preis: a?.preis ?? null,
          groesse: a?.groesse ?? null,
          berechnungsart: (item.berechnungsart as Berechnungsart) ?? "pro_buchung",
        };
      }) as VorlageArtikel[];
    },
  });
}

export function useCreateVorlage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: VorlageInsert) => {
      const { data, error } = await supabase.from("waescheset_vorlagen").insert(v).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vorlagen-sets"] }),
  });
}

export function useUpdateVorlage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...u }: VorlageUpdate & { id: string }) => {
      const { data, error } = await supabase.from("waescheset_vorlagen").update(u).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vorlagen-sets"] }),
  });
}

export function useDeleteVorlage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("waescheset_vorlagen").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vorlagen-sets"] }),
  });
}

export function useAddVorlageArtikel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { vorlage_id: string; artikel_id: string; menge: number; berechnungsart: Berechnungsart }) => {
      const { error } = await supabase.from("waescheset_vorlage_artikel").insert(p);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["vorlage-artikel", v.vorlage_id] });
      qc.invalidateQueries({ queryKey: ["vorlagen-sets"] });
    },
  });
}

export function useRemoveVorlageArtikel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, vorlage_id: _v }: { id: string; vorlage_id: string }) => {
      const { error } = await supabase.from("waescheset_vorlage_artikel").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["vorlage-artikel", v.vorlage_id] });
      qc.invalidateQueries({ queryKey: ["vorlagen-sets"] });
    },
  });
}

export function useUpdateVorlageArtikel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, vorlage_id: _v, ...u }: { id: string; vorlage_id: string; menge?: number; berechnungsart?: Berechnungsart }) => {
      const { error } = await supabase.from("waescheset_vorlage_artikel").update(u).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["vorlage-artikel", v.vorlage_id] });
      qc.invalidateQueries({ queryKey: ["vorlagen-sets"] });
    },
  });
}

/**
 * Übernimmt eine Teuni-Vorlage als neues kundenspezifisches Wäscheset für ein Objekt.
 * Erstellt eine unabhängige Kopie (Set + Artikel-Positionen).
 */
export function useApplyVorlageToObjekt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ vorlage_id, objekt_id, name, beschreibung }: { vorlage_id: string; objekt_id: string; name: string; beschreibung?: string | null }) => {
      const { data: positionen, error: pErr } = await supabase
        .from("waescheset_vorlage_artikel")
        .select("artikel_id, menge, berechnungsart")
        .eq("vorlage_id", vorlage_id);
      if (pErr) throw pErr;

      const { data: newSet, error: sErr } = await supabase
        .from("waeschesets")
        .insert({ objekt_id, name, beschreibung: beschreibung ?? null, aktiv: true })
        .select()
        .single();
      if (sErr) throw sErr;

      if (positionen && positionen.length > 0) {
        const { error: aErr } = await supabase.from("waescheset_artikel").insert(
          positionen.map((p) => ({
            set_id: newSet.id,
            artikel_id: p.artikel_id,
            menge: p.menge,
            berechnungsart: p.berechnungsart,
          })),
        );
        if (aErr) throw aErr;
      }

      return newSet;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["waeschesets"] });
    },
  });
}
