import { Building2, CheckCircle, Hotel, Home } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

interface ObjekteStatsProps {
  total: number;
  aktiv: number;
  hotels: number;
  ferienwohnungen: number;
}

export function ObjekteStats({ total, aktiv, hotels, ferienwohnungen }: ObjekteStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Gesamt Objekte"
        value={total.toString()}
        subtitle="Alle registrierten Objekte"
        icon={Building2}
        variant="info"
      />
      <StatCard
        title="Aktive Objekte"
        value={aktiv.toString()}
        subtitle="Derzeit aktiv"
        icon={CheckCircle}
        variant="success"
      />
      <StatCard
        title="Hotels"
        value={hotels.toString()}
        subtitle="Hotel & Apartmenthäuser"
        icon={Hotel}
        variant="primary"
      />
      <StatCard
        title="Ferienwohnungen"
        value={ferienwohnungen.toString()}
        subtitle="FeWo & Ferienhäuser"
        icon={Home}
        variant="warning"
      />
    </div>
  );
}
