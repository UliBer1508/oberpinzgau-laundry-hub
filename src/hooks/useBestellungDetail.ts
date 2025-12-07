import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BestellungHistory {
  id: string;
  bestellung_id: string;
  status: string;
  bearbeiter_name: string | null;
  zeitpunkt: string;
  notiz: string | null;
}

export interface BestellungDetailData {
  id: string;
  bestellnummer: string;
  status: string | null;
  created_at: string;
  lieferdatum: string | null;
  abholdatum: string | null;
  lieferzeit: string | null;
  abholzeit: string | null;
  notizen: string | null;
  bearbeitung_notizen: string | null;
  gastname: string | null;
  check_in: string | null;
  check_out: string | null;
  anzahl_personen: number | null;
  prioritaet: number | null;
  // Related data
  kunde: {
    id: string;
    name: string;
    firma: string | null;
    kundennummer: string;
    email: string | null;
    telefon: string | null;
    strasse: string | null;
    plz: string | null;
    ort: string | null;
    bestellmodus: string;
  } | null;
  objekt: {
    id: string;
    name: string;
    objektnummer: string;
    strasse: string | null;
    plz: string | null;
    ort: string | null;
    ansprechpartner: string | null;
    telefon: string | null;
  } | null;
  waeschekraft: {
    id: string;
    name: string;
    personalnummer: string;
  } | null;
  positionen: Array<{
    id: string;
    menge: number;
    notizen: string | null;
    artikel: {
      id: string;
      name: string;
      artikelnummer: string;
      preis: number | null;
      kategorie: string | null;
      farbe: string | null;
    } | null;
  }>;
  rechnung: {
    id: string;
    rechnungsnummer: string;
    rechnungsdatum: string;
    status: string;
    nettobetrag: number;
    mwst_betrag: number;
    bearbeitungsgebuehr: number;
    bruttobetrag: number;
    bezahlt_am: string | null;
  } | null;
  history: BestellungHistory[];
}

export function useBestellungDetail(bestellungId: string | null) {
  return useQuery({
    queryKey: ["bestellung-detail", bestellungId],
    enabled: !!bestellungId,
    queryFn: async (): Promise<BestellungDetailData | null> => {
      if (!bestellungId) return null;

      // Fetch main order with related data
      const { data: bestellung, error } = await supabase
        .from("waeschebestellungen")
        .select(`
          *,
          kunden!kunde_id (
            id, name, firma, kundennummer, email, telefon, strasse, plz, ort, bestellmodus
          ),
          objekte!objekt_id (
            id, name, objektnummer, strasse, plz, ort, ansprechpartner, telefon
          ),
          waeschekraefte!waeschekraft_id (
            id, name, personalnummer
          )
        `)
        .eq("id", bestellungId)
        .maybeSingle();

      if (error) throw error;
      if (!bestellung) return null;

      // Fetch positions with article data
      const { data: positionen, error: posError } = await supabase
        .from("bestellpositionen")
        .select(`
          id, menge, notizen,
          waescheartikel!artikel_id (
            id, name, artikelnummer, preis, kategorie, farbe
          )
        `)
        .eq("bestellung_id", bestellungId);

      if (posError) throw posError;

      // Fetch invoice if exists
      const { data: rechnung, error: rechnungError } = await supabase
        .from("rechnungen")
        .select("id, rechnungsnummer, rechnungsdatum, status, nettobetrag, mwst_betrag, bearbeitungsgebuehr, bruttobetrag, bezahlt_am")
        .eq("bestellung_id", bestellungId)
        .maybeSingle();

      if (rechnungError) throw rechnungError;

      // Fetch history
      const { data: history, error: historyError } = await supabase
        .from("bestellung_history")
        .select("*")
        .eq("bestellung_id", bestellungId)
        .order("zeitpunkt", { ascending: false });

      if (historyError) throw historyError;

      return {
        id: bestellung.id,
        bestellnummer: bestellung.bestellnummer,
        status: bestellung.status,
        created_at: bestellung.created_at,
        lieferdatum: bestellung.lieferdatum,
        abholdatum: bestellung.abholdatum,
        lieferzeit: bestellung.lieferzeit,
        abholzeit: bestellung.abholzeit,
        notizen: bestellung.notizen,
        bearbeitung_notizen: bestellung.bearbeitung_notizen,
        gastname: bestellung.gastname,
        check_in: bestellung.check_in,
        check_out: bestellung.check_out,
        anzahl_personen: bestellung.anzahl_personen,
        prioritaet: bestellung.prioritaet,
        kunde: bestellung.kunden as BestellungDetailData["kunde"],
        objekt: bestellung.objekte as BestellungDetailData["objekt"],
        waeschekraft: bestellung.waeschekraefte as BestellungDetailData["waeschekraft"],
        positionen: (positionen || []).map((p) => ({
          id: p.id,
          menge: p.menge,
          notizen: p.notizen,
          artikel: p.waescheartikel as BestellungDetailData["positionen"][0]["artikel"],
        })),
        rechnung: rechnung as BestellungDetailData["rechnung"],
        history: (history || []) as BestellungHistory[],
      };
    },
  });
}

// Add history entry when status changes
export function useAddBestellungHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bestellung_id,
      status,
      bearbeiter_name,
      notiz,
    }: {
      bestellung_id: string;
      status: string;
      bearbeiter_name?: string;
      notiz?: string;
    }) => {
      const { data, error } = await supabase
        .from("bestellung_history")
        .insert({
          bestellung_id,
          status,
          bearbeiter_name: bearbeiter_name || null,
          notiz: notiz || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bestellung-detail", variables.bestellung_id] });
    },
  });
}
