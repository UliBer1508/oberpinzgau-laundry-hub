import { Users, UserCheck, UserX, KeyRound } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import type { Waeschekraft } from "@/hooks/useWaeschekraefte";

interface WaeschekraefteStatsProps {
  waeschekraefte: Waeschekraft[];
}

export function WaeschekraefteStats({ waeschekraefte }: WaeschekraefteStatsProps) {
  const stats = {
    total: waeschekraefte.length,
    aktiv: waeschekraefte.filter((w) => w.aktiv).length,
    inaktiv: waeschekraefte.filter((w) => !w.aktiv).length,
    mitPortal: waeschekraefte.filter((w) => w.portalzugang).length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Gesamt Wäschekräfte"
        value={stats.total}
        icon={Users}
        variant="primary"
      />
      <StatCard
        title="Aktiv"
        value={stats.aktiv}
        icon={UserCheck}
        variant="success"
      />
      <StatCard
        title="Inaktiv"
        value={stats.inaktiv}
        icon={UserX}
        variant="warning"
      />
      <StatCard
        title="Mit Portalzugang"
        value={stats.mitPortal}
        icon={KeyRound}
        variant="info"
      />
    </div>
  );
}
