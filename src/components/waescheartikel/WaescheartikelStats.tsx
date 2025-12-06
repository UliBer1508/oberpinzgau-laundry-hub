import { Package, CheckCircle, Layers, Palette } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import type { Waescheartikel } from "@/hooks/useWaescheartikel";

interface WaescheartikelStatsProps {
  artikel: Waescheartikel[];
}

export function WaescheartikelStats({ artikel }: WaescheartikelStatsProps) {
  const totalArtikel = artikel.length;
  const activeArtikel = artikel.filter((a) => a.aktiv).length;
  const uniqueKategorien = new Set(artikel.map((a) => a.kategorie).filter(Boolean)).size;
  const uniqueFarben = new Set(artikel.map((a) => a.farbe).filter(Boolean)).size;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Gesamt Artikel"
        value={totalArtikel}
        icon={Package}
        variant="info"
      />
      <StatCard
        title="Aktive Artikel"
        value={activeArtikel}
        subtitle={`${totalArtikel > 0 ? Math.round((activeArtikel / totalArtikel) * 100) : 0}% aktiv`}
        icon={CheckCircle}
        variant="success"
      />
      <StatCard
        title="Kategorien"
        value={uniqueKategorien}
        icon={Layers}
        variant="primary"
      />
      <StatCard
        title="Farben"
        value={uniqueFarben}
        icon={Palette}
        variant="warning"
      />
    </div>
  );
}
