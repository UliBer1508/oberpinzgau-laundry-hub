import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  kunden: { total: number; aktiv: number };
  objekte: { total: number; aktiv: number };
  bestellungen: { total: number; neu: number; inBearbeitung: number; ausgeliefert: number };
  buchungen: { total: number; eingecheckt: number; checkInHeute: number; checkOutHeute: number };
  liefertouren: { total: number; aktiv: number; heute: number };
  waeschekraefte: { total: number; aktiv: number };
  waescheartikel: { total: number; aktiv: number };
}

export interface UpcomingCheckIn {
  id: string;
  buchungsnummer: string;
  gastname: string | null;
  objektName: string;
  kundeName: string;
  check_in: string;
  anzahl_personen: number | null;
}

export interface UpcomingCheckOut {
  id: string;
  buchungsnummer: string;
  gastname: string | null;
  objektName: string;
  kundeName: string;
  check_out: string;
  anzahl_personen: number | null;
}

export interface RecentBestellung {
  id: string;
  bestellnummer: string;
  kundeName: string;
  objektName: string | null;
  status: string | null;
  lieferdatum: string | null;
  created_at: string;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard_stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date().toISOString().split("T")[0];

      // Parallel queries for all stats
      const [
        kundenResult,
        objekteResult,
        bestellungenResult,
        buchungenResult,
        liefertourenResult,
        waeschekraefteResult,
        waescheartikelResult,
      ] = await Promise.all([
        supabase.from("kunden").select("id, aktiv"),
        supabase.from("objekte").select("id, aktiv"),
        supabase.from("waeschebestellungen").select("id, status"),
        supabase.from("buchungen").select("id, check_in, check_out"),
        supabase.from("liefertouren").select("id, status, datum"),
        supabase.from("waeschekraefte").select("id, aktiv"),
        supabase.from("waescheartikel").select("id, aktiv"),
      ]);

      const kunden = kundenResult.data || [];
      const objekte = objekteResult.data || [];
      const bestellungen = bestellungenResult.data || [];
      const buchungen = buchungenResult.data || [];
      const touren = liefertourenResult.data || [];
      const waeschekraefte = waeschekraefteResult.data || [];
      const waescheartikel = waescheartikelResult.data || [];

      // Calculate buchung status
      const buchungStats = buchungen.reduce(
        (acc, b) => {
          const checkIn = new Date(b.check_in);
          const checkOut = new Date(b.check_out);
          const todayDate = new Date(today);

          if (todayDate >= checkIn && todayDate < checkOut) {
            acc.eingecheckt++;
          }
          if (b.check_in === today) acc.checkInHeute++;
          if (b.check_out === today) acc.checkOutHeute++;

          return acc;
        },
        { eingecheckt: 0, checkInHeute: 0, checkOutHeute: 0 }
      );

      return {
        kunden: {
          total: kunden.length,
          aktiv: kunden.filter((k) => k.aktiv).length,
        },
        objekte: {
          total: objekte.length,
          aktiv: objekte.filter((o) => o.aktiv).length,
        },
        bestellungen: {
          total: bestellungen.length,
          neu: bestellungen.filter((b) => b.status === "neu").length,
          inBearbeitung: bestellungen.filter((b) => b.status === "in_bearbeitung").length,
          ausgeliefert: bestellungen.filter((b) => b.status === "ausgeliefert").length,
        },
        buchungen: {
          total: buchungen.length,
          ...buchungStats,
        },
        liefertouren: {
          total: touren.length,
          aktiv: touren.filter((t) => t.status === "aktiv").length,
          heute: touren.filter((t) => t.datum === today).length,
        },
        waeschekraefte: {
          total: waeschekraefte.length,
          aktiv: waeschekraefte.filter((w) => w.aktiv).length,
        },
        waescheartikel: {
          total: waescheartikel.length,
          aktiv: waescheartikel.filter((w) => w.aktiv).length,
        },
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useUpcomingCheckIns() {
  return useQuery({
    queryKey: ["upcoming_checkins"],
    queryFn: async (): Promise<UpcomingCheckIn[]> => {
      const today = new Date().toISOString().split("T")[0];
      const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("buchungen")
        .select(`
          id, buchungsnummer, gastname, check_in, anzahl_personen,
          objekte (name, kunden (name))
        `)
        .gte("check_in", today)
        .lte("check_in", in7Days)
        .order("check_in")
        .limit(5);

      if (error) throw error;

      return (data || []).map((b) => {
        const objekt = b.objekte as { name: string; kunden: { name: string } | null } | null;
        return {
          id: b.id,
          buchungsnummer: b.buchungsnummer,
          gastname: b.gastname,
          objektName: objekt?.name || "—",
          kundeName: objekt?.kunden?.name || "—",
          check_in: b.check_in,
          anzahl_personen: b.anzahl_personen,
        };
      });
    },
  });
}

export function useUpcomingCheckOuts() {
  return useQuery({
    queryKey: ["upcoming_checkouts"],
    queryFn: async (): Promise<UpcomingCheckOut[]> => {
      const today = new Date().toISOString().split("T")[0];
      const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("buchungen")
        .select(`
          id, buchungsnummer, gastname, check_out, anzahl_personen,
          objekte (name, kunden (name))
        `)
        .gte("check_out", today)
        .lte("check_out", in3Days)
        .order("check_out")
        .limit(5);

      if (error) throw error;

      return (data || []).map((b) => {
        const objekt = b.objekte as { name: string; kunden: { name: string } | null } | null;
        return {
          id: b.id,
          buchungsnummer: b.buchungsnummer,
          gastname: b.gastname,
          objektName: objekt?.name || "—",
          kundeName: objekt?.kunden?.name || "—",
          check_out: b.check_out,
          anzahl_personen: b.anzahl_personen,
        };
      });
    },
  });
}

export function useRecentBestellungen() {
  return useQuery({
    queryKey: ["recent_bestellungen"],
    queryFn: async (): Promise<RecentBestellung[]> => {
      const { data, error } = await supabase
        .from("waeschebestellungen")
        .select(`
          id, bestellnummer, status, lieferdatum, created_at,
          kunden (name),
          objekte (name)
        `)
        .in("status", ["neu", "in_bearbeitung"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      return (data || []).map((b) => ({
        id: b.id,
        bestellnummer: b.bestellnummer,
        kundeName: (b.kunden as { name: string } | null)?.name || "—",
        objektName: (b.objekte as { name: string } | null)?.name || null,
        status: b.status,
        lieferdatum: b.lieferdatum,
        created_at: b.created_at,
      }));
    },
  });
}
