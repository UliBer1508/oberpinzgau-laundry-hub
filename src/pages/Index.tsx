import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { ModuleOverview } from "@/components/dashboard/ModuleOverview";
import { UpcomingCheckIns } from "@/components/dashboard/UpcomingCheckIns";
import { UpcomingCheckOuts } from "@/components/dashboard/UpcomingCheckOuts";
import { RecentBestellungen } from "@/components/dashboard/RecentBestellungen";
import { QuickActionsUpdated } from "@/components/dashboard/QuickActionsUpdated";
import {
  useDashboardStats,
  useUpcomingCheckIns,
  useUpcomingCheckOuts,
  useRecentBestellungen,
} from "@/hooks/useDashboard";
import {
  Users,
  ShoppingCart,
  Calendar,
  Truck,
  Bell,
  LogIn,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const today = new Date().toLocaleDateString("de-AT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: checkIns = [], isLoading: checkInsLoading } = useUpcomingCheckIns();
  const { data: checkOuts = [], isLoading: checkOutsLoading } = useUpcomingCheckOuts();
  const { data: bestellungen = [], isLoading: bestellungenLoading } = useRecentBestellungen();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">{today}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {stats && (stats.bestellungen.neu > 0 || stats.buchungen.checkInHeute > 0) && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                    {stats.bestellungen.neu + stats.buchungen.checkInHeute}
                  </span>
                )}
              </Button>
            </div>
          </header>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Key Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Check-ins heute"
                value={stats?.buchungen.checkInHeute ?? 0}
                subtitle={`${stats?.buchungen.eingecheckt ?? 0} aktuell eingecheckt`}
                icon={LogIn}
                variant="success"
              />
              <StatCard
                title="Check-outs heute"
                value={stats?.buchungen.checkOutHeute ?? 0}
                icon={LogOut}
                variant="warning"
              />
              <StatCard
                title="Offene Bestellungen"
                value={(stats?.bestellungen.neu ?? 0) + (stats?.bestellungen.inBearbeitung ?? 0)}
                subtitle={`${stats?.bestellungen.neu ?? 0} neu`}
                icon={ShoppingCart}
                variant="info"
              />
              <StatCard
                title="Aktive Touren"
                value={stats?.liefertouren.aktiv ?? 0}
                subtitle={`${stats?.liefertouren.heute ?? 0} heute geplant`}
                icon={Truck}
                variant="primary"
              />
            </div>

            {/* Module Overview */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Module Übersicht</CardTitle>
              </CardHeader>
              <CardContent>
                <ModuleOverview stats={stats} isLoading={statsLoading} />
              </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left column - Check-ins & Check-outs */}
              <div className="space-y-6">
                <UpcomingCheckIns checkIns={checkIns} isLoading={checkInsLoading} />
                <UpcomingCheckOuts checkOuts={checkOuts} isLoading={checkOutsLoading} />
              </div>

              {/* Middle column - Bestellungen */}
              <div className="space-y-6">
                <RecentBestellungen bestellungen={bestellungen} isLoading={bestellungenLoading} />
              </div>

              {/* Right column - Quick Actions */}
              <div className="space-y-6">
                <QuickActionsUpdated />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
