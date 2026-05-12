import { Layers, CheckCircle, Building2, Package } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

interface WaeschesetsStatsProps {
  total: number;
  aktiv: number;
  objekteMitSets: number;
  artikelZugeordnet: number;
}

export function WaeschesetsStats({
  total,
  aktiv,
  objekteMitSets,
  artikelZugeordnet,
}: WaeschesetsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Gesamt Kunden-Sets"
        value={total}
        icon={Layers}
        variant="info"
      />
      <StatCard
        title="Aktive Kunden-Sets"
        value={aktiv}
        icon={CheckCircle}
        variant="success"
      />
      <StatCard
        title="Objekte mit Kunden-Sets"
        value={objekteMitSets}
        icon={Building2}
        variant="primary"
      />
      <StatCard
        title="Artikel zugeordnet"
        value={artikelZugeordnet}
        icon={Package}
        variant="warning"
      />
    </div>
  );
}
