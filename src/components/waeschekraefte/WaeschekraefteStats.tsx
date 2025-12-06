import { Users, Shirt, Truck, UserCog } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import type { Waeschekraft } from "@/hooks/useWaeschekraefte";

interface WaeschekraefteStatsProps {
  waeschekraefte: Waeschekraft[];
}

export function WaeschekraefteStats({ waeschekraefte }: WaeschekraefteStatsProps) {
  const stats = {
    total: waeschekraefte.length,
    waeschekraft: waeschekraefte.filter((w) => w.typ === "waeschekraft").length,
    fahrer: waeschekraefte.filter((w) => w.typ === "fahrer").length,
    beides: waeschekraefte.filter((w) => w.typ === "beides").length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Gesamt Personal"
        value={stats.total}
        icon={Users}
        variant="primary"
      />
      <StatCard
        title="Wäschekräfte"
        value={stats.waeschekraft}
        icon={Shirt}
        variant="info"
      />
      <StatCard
        title="Fahrer"
        value={stats.fahrer}
        icon={Truck}
        variant="success"
      />
      <StatCard
        title="Beides"
        value={stats.beides}
        icon={UserCog}
        variant="warning"
      />
    </div>
  );
}
