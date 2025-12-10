import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type RechnungStatus = 'offen' | 'bezahlt' | 'storniert' | 'mahnung';

export type Rechnung = {
  id: string;
  rechnungsnummer: string;
  bestellung_id: string;
  kunde_id: string;
  rechnungsdatum: string;
  faelligkeitsdatum: string | null;
  kunde_name: string;
  kunde_firma: string | null;
  kunde_strasse: string | null;
  kunde_plz: string | null;
  kunde_ort: string | null;
  kunde_kundennummer: string | null;
  kunde_email: string | null;
  nettobetrag: number;
  mwst_satz: number;
  mwst_betrag: number;
  bearbeitungsgebuehr: number;
  bruttobetrag: number;
  status: RechnungStatus;
  bezahlt_am: string | null;
  notizen: string | null;
  mahnung_gesendet_am: string | null;
  mahnung_anzahl: number | null;
  created_at: string;
  updated_at: string;
  bestellnummer?: string;
  // Lieferadresse-Snapshot
  lieferadresse_strasse?: string | null;
  lieferadresse_plz?: string | null;
  lieferadresse_ort?: string | null;
};

export type RechnungPosition = {
  id: string;
  rechnung_id: string;
  artikelnummer: string;
  bezeichnung: string;
  farbe?: string | null;
  menge: number;
  einzelpreis: number;
  gesamtpreis: number;
};

// Alle Rechnungen abrufen
export function useRechnungen() {
  return useQuery({
    queryKey: ["rechnungen"],
    queryFn: async () => {
      const { data: rechnungen, error } = await supabase
        .from("rechnungen")
        .select("*")
        .order("rechnungsdatum", { ascending: false });

      if (error) throw error;

      // Bestellnummern abrufen
      const bestellungIds = rechnungen.map(r => r.bestellung_id);
      const { data: bestellungen } = await supabase
        .from("waeschebestellungen")
        .select("id, bestellnummer")
        .in("id", bestellungIds);

      const bestellungMap = new Map(bestellungen?.map(b => [b.id, b.bestellnummer]) || []);

      return rechnungen.map(r => ({
        ...r,
        bestellnummer: bestellungMap.get(r.bestellung_id) || "-"
      })) as Rechnung[];
    },
  });
}

// Positionen einer Rechnung abrufen
export function useRechnungPositionen(rechnungId: string | null) {
  return useQuery({
    queryKey: ["rechnung-positionen", rechnungId],
    queryFn: async () => {
      if (!rechnungId) return [];

      const { data, error } = await supabase
        .from("rechnungspositionen")
        .select("*")
        .eq("rechnung_id", rechnungId);

      if (error) throw error;
      return data as RechnungPosition[];
    },
    enabled: !!rechnungId,
  });
}

// Nächste Rechnungsnummer generieren
export function useGenerateRechnungsnummer() {
  return useQuery({
    queryKey: ["next-rechnungsnummer"],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const prefix = `R${currentYear}-`;

      const { data, error } = await supabase
        .from("rechnungen")
        .select("rechnungsnummer")
        .like("rechnungsnummer", `${prefix}%`)
        .order("rechnungsnummer", { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastNumber = data[0].rechnungsnummer.replace(prefix, "");
        nextNumber = parseInt(lastNumber, 10) + 1;
      }

      return `${prefix}${nextNumber.toString().padStart(4, "0")}`;
    },
  });
}

// Rechnung Status ändern
export function useUpdateRechnungStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, bezahlt_am }: { id: string; status: RechnungStatus; bezahlt_am?: string | null }) => {
      const updateData: { status: RechnungStatus; bezahlt_am?: string | null } = { status };
      
      if (status === 'bezahlt') {
        updateData.bezahlt_am = bezahlt_am || new Date().toISOString().split('T')[0];
      } else {
        updateData.bezahlt_am = null;
      }

      const { data, error } = await supabase
        .from("rechnungen")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rechnungen"] });
    },
  });
}

// Mahnung Status aktualisieren
export function useUpdateMahnungStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      // Erst aktuelle Rechnung laden um mahnung_anzahl zu erhöhen
      const { data: current, error: fetchError } = await supabase
        .from("rechnungen")
        .select("mahnung_anzahl")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const newAnzahl = (current?.mahnung_anzahl || 0) + 1;

      const { data, error } = await supabase
        .from("rechnungen")
        .update({
          mahnung_gesendet_am: new Date().toISOString(),
          mahnung_anzahl: newAnzahl,
          status: 'mahnung'
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rechnungen"] });
    },
  });
}
