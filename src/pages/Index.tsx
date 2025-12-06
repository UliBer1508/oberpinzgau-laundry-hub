import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { BestellungenDashboard } from "@/components/dashboard/BestellungenDashboard";
import { TodayLiefertouren } from "@/components/dashboard/TodayLiefertouren";
import { QuickActionsUpdated } from "@/components/dashboard/QuickActionsUpdated";
import { useDashboardStats } from "@/hooks/useDashboard";
import { Package, Clock, Truck, CalendarCheck } from "lucide-react";

const Index = () => {
  const today = new Date().toLocaleDateString("de-AT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { data: stats } = useDashboardStats();

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
          </header>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Stats Grid - Order focused */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Neue Bestellungen"
                value={stats?.bestellungen.neu ?? 0}
                icon={Package}
                variant="info"
              />
              <StatCard
                title="In Bearbeitung"
                value={stats?.bestellungen.inBearbeitung ?? 0}
                icon={Clock}
                variant="warning"
              />
              <StatCard
                title="Versandbereit"
                value={stats?.bestellungen.versandbereit ?? 0}
                icon={Truck}
                variant="success"
              />
              <StatCard
                title="Heute auszuliefern"
                value={stats?.bestellungen.heuteAuszuliefern ?? 0}
                subtitle={`${stats?.liefertouren.heute ?? 0} Touren geplant`}
                icon={CalendarCheck}
                variant="primary"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left column - Bestellungen (takes 2 cols) */}
              <div className="lg:col-span-2">
                <BestellungenDashboard />
              </div>

              {/* Right column - Touren & Quick Actions */}
              <div className="space-y-6">
                <TodayLiefertouren />
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
