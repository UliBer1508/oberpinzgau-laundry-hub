import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  bestellungen: {
    total: number;
    neu: number;
    inBearbeitung: number;
    versandbereit: number;
    heuteAuszuliefern: number;
  };
  liefertouren: {
    total: number;
    aktiv: number;
    heute: number;
  };
  kunden: {
    total: number;
    aktiv: number;
  };
  arbeitsauftraege: {
    offen: number;
  };
  rechnungen: {
    total: number;
    offen: number;
  };
}

export interface DashboardBestellung {
  id: string;
  bestellnummer: string;
  kundeName: string;
  objektName: string | null;
  status: string | null;
  lieferdatum: string | null;
  created_at: string;
  prioritaet: number | null;
  positionen: Array<{
    id: string;
    menge: number;
    artikelName: string;
    artikelFarbe: string | null;
  }>;
}

export interface TodayLiefertour {
  id: string;
  tournummer: string;
  name: string;
  status: string | null;
  waeschekraftName: string | null;
  stoppCount: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard_stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date().toISOString().split("T")[0];

      const [bestellungenResult, liefertourenResult] = await Promise.all([
        supabase.from("waeschebestellungen").select("id, status, lieferdatum"),
        supabase.from("liefertouren").select("id, status, datum"),
      ]);

      const bestellungen = bestellungenResult.data || [];
      const touren = liefertourenResult.data || [];

      return {
        bestellungen: {
          total: bestellungen.length,
          neu: bestellungen.filter((b) => b.status === "neu").length,
          inBearbeitung: bestellungen.filter((b) => b.status === "in_bearbeitung").length,
          versandbereit: bestellungen.filter((b) => b.status === "ausgeliefert").length,
          heuteAuszuliefern: bestellungen.filter((b) => b.lieferdatum === today && b.status !== "abgeschlossen" && b.status !== "storniert").length,
        },
        liefertouren: {
          total: touren.length,
          aktiv: touren.filter((t) => t.status === "aktiv" || t.status === "in_durchfuehrung").length,
          heute: touren.filter((t) => t.datum === today).length,
        },
      };
    },
    refetchInterval: 30000,
  });
}

export type DashboardFilter = "neu" | "in_bearbeitung" | "ausgeliefert" | "heute";

export function useDashboardBestellungen(filter: DashboardFilter) {
  return useQuery({
    queryKey: ["dashboard_bestellungen", filter],
    queryFn: async (): Promise<DashboardBestellung[]> => {
      const today = new Date().toISOString().split("T")[0];

      let query = supabase
        .from("waeschebestellungen")
        .select(`
          id, bestellnummer, status, lieferdatum, created_at, prioritaet,
          kunden (name),
          objekte (name)
        `);

      if (filter === "heute") {
        query = query
          .eq("lieferdatum", today)
          .not("status", "in", "(abgeschlossen,storniert)");
      } else {
        query = query.eq("status", filter);
      }

      const { data, error } = await query
        .order("prioritaet", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch positions for all orders
      const orderIds = (data || []).map((b) => b.id);
      const { data: positionen } = await supabase
        .from("bestellpositionen")
        .select(`
          id, menge, bestellung_id,
          waescheartikel (name, farbe)
        `)
        .in("bestellung_id", orderIds);

      const positionenByOrder = (positionen || []).reduce((acc, p) => {
        if (!acc[p.bestellung_id]) acc[p.bestellung_id] = [];
        const artikel = p.waescheartikel as { name: string; farbe: string | null } | null;
        acc[p.bestellung_id].push({
          id: p.id,
          menge: p.menge,
          artikelName: artikel?.name || "—",
          artikelFarbe: artikel?.farbe || null,
        });
        return acc;
      }, {} as Record<string, DashboardBestellung["positionen"]>);

      return (data || []).map((b) => ({
        id: b.id,
        bestellnummer: b.bestellnummer,
        kundeName: (b.kunden as { name: string } | null)?.name || "—",
        objektName: (b.objekte as { name: string } | null)?.name || null,
        status: b.status,
        lieferdatum: b.lieferdatum,
        created_at: b.created_at,
        prioritaet: b.prioritaet,
        positionen: positionenByOrder[b.id] || [],
      }));
    },
  });
}

export function useTodayLiefertouren() {
  return useQuery({
    queryKey: ["today_liefertouren"],
    queryFn: async (): Promise<TodayLiefertour[]> => {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("liefertouren")
        .select(`
          id, tournummer, name, status,
          waeschekraefte (name)
        `)
        .eq("datum", today)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get stop counts
      const tourIds = (data || []).map((t) => t.id);
      const { data: stopps } = await supabase
        .from("liefertour_stopps")
        .select("id, tour_id")
        .in("tour_id", tourIds);

      const stoppCountByTour = (stopps || []).reduce((acc, s) => {
        acc[s.tour_id] = (acc[s.tour_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return (data || []).map((t) => ({
        id: t.id,
        tournummer: t.tournummer,
        name: t.name,
        status: t.status,
        waeschekraftName: (t.waeschekraefte as { name: string } | null)?.name || null,
        stoppCount: stoppCountByTour[t.id] || 0,
      }));
    },
  });
}
