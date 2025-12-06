import { ShoppingCart, Clock, Truck, CheckCircle, Package } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

interface BestellungenStatsProps {
  stats: {
    gesamt: number;
    neu: number;
    inBearbeitung: number;
    ausgeliefert: number;
    abgeschlossen: number;
  };
}

export function BestellungenStats({ stats }: BestellungenStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Gesamt"
        value={stats.gesamt}
        subtitle="Alle Bestellungen"
        icon={ShoppingCart}
        variant="default"
      />
      <StatCard
        title="Neu"
        value={stats.neu}
        subtitle="Noch nicht bearbeitet"
        icon={Package}
        variant="primary"
      />
      <StatCard
        title="In Bearbeitung"
        value={stats.inBearbeitung}
        subtitle="Wird vorbereitet"
        icon={Clock}
        variant="warning"
      />
      <StatCard
        title="Ausgeliefert"
        value={stats.ausgeliefert}
        subtitle="Unterwegs"
        icon={Truck}
        variant="info"
      />
      <StatCard
        title="Abgeschlossen"
        value={stats.abgeschlossen}
        subtitle="Erfolgreich beendet"
        icon={CheckCircle}
        variant="success"
      />
    </div>
  );
}
