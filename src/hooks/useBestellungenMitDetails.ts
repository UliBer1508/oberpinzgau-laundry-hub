import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BestellungStatus } from "./useBestellungen";

export interface BestellungMitDetails {
  id: string;
  bestellnummer: string;
  status: BestellungStatus;
  created_at: string;
  lieferdatum: string | null;
  lieferzeit: string | null;
  abholdatum: string | null;
  abholzeit: string | null;
  gastname: string | null;
  check_in: string | null;
  check_out: string | null;
  anzahl_personen: number | null;
  prioritaet: number | null;
  notizen: string | null;
  bearbeitung_notizen: string | null;
  // Kunde
  kunde_id: string;
  kundeName: string;
  kundeFirma: string | null;
  kundeKundennummer: string | null;
  // Objekt
  objekt_id: string | null;
  objektName: string | null;
  objektStrasse: string | null;
  objektPlz: string | null;
  objektOrt: string | null;
  // Wäschekraft
  waeschekraft_id: string | null;
  waeschekraftName: string | null;
  // Positionen
  positionen: {
    id: string;
    menge: number;
    artikelName: string;
    artikelNummer: string;
    preis: number | null;
  }[];
  positionenCount: number;
  nettoPreis: number | null;
  // Rechnung
  rechnung: {
    id: string;
    rechnungsnummer: string;
    status: string;
    bruttobetrag: number;
  } | null;
  // Letzter History-Eintrag
  letzteBearbeitung: {
    zeitpunkt: string;
    status: string;
    bearbeiter_name: string | null;
    notiz: string | null;
  } | null;
}

export function useBestellungenMitDetails() {
  return useQuery({
    queryKey: ["bestellungen-mit-details"],
    queryFn: async () => {
      // Bestellungen mit Kunde, Objekt, Wäschekraft
      const { data: bestellungen, error } = await supabase
        .from("waeschebestellungen")
        .select(`
          *,
          kunden!kunde_id (name, firma, kundennummer),
          objekte!objekt_id (name, strasse, plz, ort),
          waeschekraefte!waeschekraft_id (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!bestellungen) return [];

      const bestellungIds = bestellungen.map(b => b.id);

      // Positionen laden
      const { data: allPositionen, error: posError } = await supabase
        .from("bestellpositionen")
        .select(`
          id,
          bestellung_id,
          menge,
          waescheartikel!artikel_id (name, artikelnummer, preis)
        `)
        .in("bestellung_id", bestellungIds);

      if (posError) throw posError;

      // Rechnungen laden
      const { data: allRechnungen, error: rechError } = await supabase
        .from("rechnungen")
        .select("id, bestellung_id, rechnungsnummer, status, bruttobetrag")
        .in("bestellung_id", bestellungIds);

      if (rechError) throw rechError;

      // History laden (nur letzter Eintrag pro Bestellung)
      const { data: allHistory, error: histError } = await supabase
        .from("bestellung_history")
        .select("*")
        .in("bestellung_id", bestellungIds)
        .order("zeitpunkt", { ascending: false });

      if (histError) throw histError;

      // Maps erstellen
      const positionenMap = new Map<string, typeof allPositionen>();
      allPositionen?.forEach(p => {
        const list = positionenMap.get(p.bestellung_id) || [];
        list.push(p);
        positionenMap.set(p.bestellung_id, list);
      });

      const rechnungMap = new Map<string, typeof allRechnungen[0]>();
      allRechnungen?.forEach(r => {
        if (!rechnungMap.has(r.bestellung_id)) {
          rechnungMap.set(r.bestellung_id, r);
        }
      });

      const historyMap = new Map<string, typeof allHistory[0]>();
      allHistory?.forEach(h => {
        if (!historyMap.has(h.bestellung_id)) {
          historyMap.set(h.bestellung_id, h);
        }
      });

      return bestellungen.map((b): BestellungMitDetails => {
        const positionen = positionenMap.get(b.id) || [];
        const mappedPositionen = positionen.map(p => ({
          id: p.id,
          menge: p.menge,
          artikelName: (p.waescheartikel as { name: string } | null)?.name || "",
          artikelNummer: (p.waescheartikel as { artikelnummer: string } | null)?.artikelnummer || "",
          preis: (p.waescheartikel as { preis: number | null } | null)?.preis ?? null,
        }));

        const nettoPreis = mappedPositionen.reduce((sum, p) => {
          if (p.preis !== null) {
            return sum + p.menge * p.preis;
          }
          return sum;
        }, 0);

        const rechnung = rechnungMap.get(b.id);
        const history = historyMap.get(b.id);

        return {
          id: b.id,
          bestellnummer: b.bestellnummer,
          status: b.status as BestellungStatus,
          created_at: b.created_at,
          lieferdatum: b.lieferdatum,
          lieferzeit: b.lieferzeit,
          abholdatum: b.abholdatum,
          abholzeit: b.abholzeit,
          gastname: b.gastname,
          check_in: b.check_in,
          check_out: b.check_out,
          anzahl_personen: b.anzahl_personen,
          prioritaet: b.prioritaet,
          notizen: b.notizen,
          bearbeitung_notizen: b.bearbeitung_notizen,
          kunde_id: b.kunde_id,
          kundeName: (b.kunden as { name: string } | null)?.name || "Unbekannt",
          kundeFirma: (b.kunden as { firma: string | null } | null)?.firma || null,
          kundeKundennummer: (b.kunden as { kundennummer: string } | null)?.kundennummer || null,
          objekt_id: b.objekt_id,
          objektName: (b.objekte as { name: string } | null)?.name || null,
          objektStrasse: (b.objekte as { strasse: string | null } | null)?.strasse || null,
          objektPlz: (b.objekte as { plz: string | null } | null)?.plz || null,
          objektOrt: (b.objekte as { ort: string | null } | null)?.ort || null,
          waeschekraft_id: b.waeschekraft_id,
          waeschekraftName: (b.waeschekraefte as { name: string } | null)?.name || null,
          positionen: mappedPositionen,
          positionenCount: mappedPositionen.length,
          nettoPreis: nettoPreis > 0 ? nettoPreis : null,
          rechnung: rechnung ? {
            id: rechnung.id,
            rechnungsnummer: rechnung.rechnungsnummer,
            status: rechnung.status,
            bruttobetrag: Number(rechnung.bruttobetrag),
          } : null,
          letzteBearbeitung: history ? {
            zeitpunkt: history.zeitpunkt,
            status: history.status,
            bearbeiter_name: history.bearbeiter_name,
            notiz: history.notiz,
          } : null,
        };
      });
    },
  });
}
