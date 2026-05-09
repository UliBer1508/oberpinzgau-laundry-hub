import { StatCard } from "@/components/dashboard/StatCard";
import { Users, UserCheck, Building2, Home } from "lucide-react";

interface KundenStatsProps {
  total: number;
  aktiv: number;
  hotels: number;
  apartments: number;
  onResetFilters?: () => void;
  onToggleAktiv?: () => void;
  onFilterHotels?: () => void;
  onFilterApartments?: () => void;
  activeFilter?: "alle" | "aktiv" | "hotels" | "apartments";
}

export function KundenStats({
  total,
  aktiv,
  hotels,
  apartments,
  onResetFilters,
  onToggleAktiv,
  onFilterHotels,
  onFilterApartments,
  activeFilter = "alle",
}: KundenStatsProps) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Kunden gesamt"
        value={total}
        icon={Users}
        variant="primary"
        active={activeFilter === "alle"}
        onClick={onResetFilters}
      />
      <StatCard
        title="Aktive Kunden"
        value={aktiv}
        subtitle={total > 0 ? `${Math.round((aktiv / total) * 100)}% aktiv` : undefined}
        icon={UserCheck}
        variant="success"
        active={activeFilter === "aktiv"}
        onClick={onToggleAktiv}
      />
      <StatCard
        title="Hotels"
        value={hotels}
        icon={Building2}
        variant="info"
        active={activeFilter === "hotels"}
        onClick={onFilterHotels}
      />
      <StatCard
        title="Ferienwohnungen"
        value={apartments}
        icon={Home}
        variant="warning"
        active={activeFilter === "apartments"}
        onClick={onFilterApartments}
      />
    </div>
  );
}
