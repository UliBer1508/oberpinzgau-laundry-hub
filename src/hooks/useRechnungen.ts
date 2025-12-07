import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchRechnungseinstellungen } from "./useRechnungseinstellungen";

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
  nettobetrag: number;
  mwst_satz: number;
  mwst_betrag: number;
  bearbeitungsgebuehr: number;
  bruttobetrag: number;
  status: RechnungStatus;
  bezahlt_am: string | null;
  notizen: string | null;
  created_at: string;
  updated_at: string;
  bestellnummer?: string;
};

export type RechnungPosition = {
  id: string;
  rechnung_id: string;
  artikelnummer: string;
  bezeichnung: string;
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

// Rechnung erstellen (wird automatisch bei Status "ausgeliefert" aufgerufen)
export async function createRechnungForBestellung(bestellungId: string) {
  // Bestellung mit Kunde laden
  const { data: bestellung, error: bestellungError } = await supabase
    .from("waeschebestellungen")
    .select(`
      *,
      kunden (*)
    `)
    .eq("id", bestellungId)
    .single();

  if (bestellungError) throw bestellungError;

  // Positionen mit Artikelpreisen laden
  const { data: positionen, error: positionenError } = await supabase
    .from("bestellpositionen")
    .select(`
      *,
      waescheartikel (artikelnummer, name, preis)
    `)
    .eq("bestellung_id", bestellungId);

  if (positionenError) throw positionenError;

  // Nettobetrag berechnen
  let nettobetrag = 0;
  const rechnungsPositionen = positionen.map(pos => {
    const einzelpreis = Number(pos.waescheartikel?.preis) || 0;
    const gesamtpreis = einzelpreis * pos.menge;
    nettobetrag += gesamtpreis;

    return {
      artikelnummer: pos.waescheartikel?.artikelnummer || "-",
      bezeichnung: pos.waescheartikel?.name || "-",
      menge: pos.menge,
      einzelpreis,
      gesamtpreis
    };
  });

  // Globale Einstellungen laden
  const einstellungen = await fetchRechnungseinstellungen();
  const mwstSatz = einstellungen?.mwst_satz ?? 20;
  const bearbeitungsgebuehr = einstellungen?.bearbeitungsgebuehr ?? 0;
  
  // MwSt berechnen
  const mwstBetrag = nettobetrag * (mwstSatz / 100);
  const bruttobetrag = nettobetrag + mwstBetrag + bearbeitungsgebuehr;

  // Rechnungsnummer generieren
  const currentYear = new Date().getFullYear();
  const prefix = `R${currentYear}-`;

  const { data: lastRechnung } = await supabase
    .from("rechnungen")
    .select("rechnungsnummer")
    .like("rechnungsnummer", `${prefix}%`)
    .order("rechnungsnummer", { ascending: false })
    .limit(1);

  let nextNumber = 1;
  if (lastRechnung && lastRechnung.length > 0) {
    const lastNum = lastRechnung[0].rechnungsnummer.replace(prefix, "");
    nextNumber = parseInt(lastNum, 10) + 1;
  }
  const rechnungsnummer = `${prefix}${nextNumber.toString().padStart(4, "0")}`;

  // Fälligkeitsdatum (14 Tage ab heute)
  const faelligkeitsdatum = new Date();
  faelligkeitsdatum.setDate(faelligkeitsdatum.getDate() + 14);

  const kunde = bestellung.kunden;

  // Rechnung erstellen
  const { data: rechnung, error: rechnungError } = await supabase
    .from("rechnungen")
    .insert({
      rechnungsnummer,
      bestellung_id: bestellungId,
      kunde_id: bestellung.kunde_id,
      rechnungsdatum: new Date().toISOString().split('T')[0],
      faelligkeitsdatum: faelligkeitsdatum.toISOString().split('T')[0],
      kunde_name: kunde.name,
      kunde_firma: kunde.firma,
      kunde_strasse: kunde.strasse,
      kunde_plz: kunde.plz,
      kunde_ort: kunde.ort,
      nettobetrag,
      mwst_satz: mwstSatz,
      mwst_betrag: mwstBetrag,
      bearbeitungsgebuehr,
      bruttobetrag
    })
    .select()
    .single();

  if (rechnungError) throw rechnungError;

  // Rechnungspositionen erstellen
  if (rechnungsPositionen.length > 0) {
    const { error: posError } = await supabase
      .from("rechnungspositionen")
      .insert(
        rechnungsPositionen.map(pos => ({
          rechnung_id: rechnung.id,
          ...pos
        }))
      );

    if (posError) throw posError;
  }

  return rechnung;
}
