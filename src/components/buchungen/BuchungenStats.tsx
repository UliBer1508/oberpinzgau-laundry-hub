import { Calendar, LogIn, LogOut, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import type { Buchung } from "@/hooks/useBuchungen";

interface BuchungenStatsProps {
  buchungen: Buchung[];
}

export function BuchungenStats({ buchungen }: BuchungenStatsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const stats = {
    total: buchungen.length,
    eingecheckt: buchungen.filter((b) => b.status === "eingecheckt").length,
    checkInHeute: buchungen.filter((b) => b.check_in === todayStr).length,
    checkOutHeute: buchungen.filter((b) => b.check_out === todayStr).length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Gesamt Buchungen"
        value={stats.total}
        icon={Calendar}
        variant="primary"
      />
      <StatCard
        title="Aktuell eingecheckt"
        value={stats.eingecheckt}
        icon={Users}
        variant="success"
      />
      <StatCard
        title="Check-in heute"
        value={stats.checkInHeute}
        icon={LogIn}
        variant="info"
      />
      <StatCard
        title="Check-out heute"
        value={stats.checkOutHeute}
        icon={LogOut}
        variant="warning"
      />
    </div>
  );
}
