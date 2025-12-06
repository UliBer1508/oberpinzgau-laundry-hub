import { Truck, Calendar, Play, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import type { Liefertour } from "@/hooks/useLiefertouren";

interface LiefertourenStatsProps {
  touren: Liefertour[];
}

export function LiefertourenStats({ touren }: LiefertourenStatsProps) {
  const today = new Date().toISOString().split("T")[0];

  const stats = {
    total: touren.length,
    today: touren.filter((t) => t.datum === today).length,
    aktiv: touren.filter((t) => t.status === "aktiv").length,
    abgeschlossen: touren.filter((t) => t.status === "abgeschlossen").length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Gesamt Touren"
        value={stats.total}
        icon={Truck}
        variant="primary"
      />
      <StatCard
        title="Heute geplant"
        value={stats.today}
        icon={Calendar}
        variant="info"
      />
      <StatCard
        title="Aktive Touren"
        value={stats.aktiv}
        icon={Play}
        variant="warning"
      />
      <StatCard
        title="Abgeschlossen"
        value={stats.abgeschlossen}
        icon={CheckCircle}
        variant="success"
      />
    </div>
  );
}
