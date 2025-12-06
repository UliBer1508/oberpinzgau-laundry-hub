import { StatCard } from "@/components/dashboard/StatCard";
import { Users, UserCheck, Building2, Home } from "lucide-react";

interface KundenStatsProps {
  total: number;
  aktiv: number;
  hotels: number;
  apartments: number;
}

export function KundenStats({ total, aktiv, hotels, apartments }: KundenStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Kunden gesamt"
        value={total}
        icon={Users}
        variant="primary"
      />
      <StatCard
        title="Aktive Kunden"
        value={aktiv}
        subtitle={`${Math.round((aktiv / total) * 100)}% aktiv`}
        icon={UserCheck}
        variant="success"
      />
      <StatCard
        title="Hotels"
        value={hotels}
        icon={Building2}
        variant="info"
      />
      <StatCard
        title="Ferienwohnungen"
        value={apartments}
        icon={Home}
        variant="warning"
      />
    </div>
  );
}
