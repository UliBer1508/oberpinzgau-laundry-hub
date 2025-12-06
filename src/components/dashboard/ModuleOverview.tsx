import {
  Users,
  Building2,
  ShoppingCart,
  Calendar,
  Truck,
  UserCheck,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import type { DashboardStats } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";

interface ModuleOverviewProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

interface ModuleCardProps {
  title: string;
  icon: React.ElementType;
  total: number;
  subtitle: string;
  href: string;
  color: string;
}

function ModuleCard({ title, icon: Icon, total, subtitle, href, color }: ModuleCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
      onClick={() => navigate(href)}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", color)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-sm font-medium text-foreground truncate">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ModuleOverview({ stats, isLoading }: ModuleOverviewProps) {
  if (isLoading || !stats) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Module</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          Laden...
        </CardContent>
      </Card>
    );
  }

  const modules = [
    {
      title: "Kunden",
      icon: Users,
      total: stats.kunden.total,
      subtitle: `${stats.kunden.aktiv} aktiv`,
      href: "/kunden",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      title: "Objekte",
      icon: Building2,
      total: stats.objekte.total,
      subtitle: `${stats.objekte.aktiv} aktiv`,
      href: "/objekte",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      title: "Bestellungen",
      icon: ShoppingCart,
      total: stats.bestellungen.total,
      subtitle: `${stats.bestellungen.neu} neu, ${stats.bestellungen.inBearbeitung} in Bearbeitung`,
      href: "/bestellungen",
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    },
    {
      title: "Buchungen",
      icon: Calendar,
      total: stats.buchungen.total,
      subtitle: `${stats.buchungen.eingecheckt} eingecheckt`,
      href: "/buchungen",
      color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      title: "Liefertouren",
      icon: Truck,
      total: stats.liefertouren.total,
      subtitle: `${stats.liefertouren.heute} heute, ${stats.liefertouren.aktiv} aktiv`,
      href: "/liefertouren",
      color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    },
    {
      title: "Wäschekräfte",
      icon: UserCheck,
      total: stats.waeschekraefte.total,
      subtitle: `${stats.waeschekraefte.aktiv} aktiv`,
      href: "/waeschekraefte",
      color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
    },
    {
      title: "Wäscheartikel",
      icon: Package,
      total: stats.waescheartikel.total,
      subtitle: `${stats.waescheartikel.aktiv} aktiv`,
      href: "/waescheartikel",
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {modules.map((module) => (
        <ModuleCard key={module.title} {...module} />
      ))}
    </div>
  );
}
