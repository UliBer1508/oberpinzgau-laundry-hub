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
        <main className="flex-1 overflow-x-hidden min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-4 md:px-6">
            <SidebarTrigger className="hidden h-9 w-9 rounded-lg hover:bg-sidebar-accent shrink-0" />
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-sidebar-foreground truncate">Dashboard</h1>
                <p className="text-sm text-sidebar-foreground/80 truncate">{today}</p>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 md:p-6 space-y-6">
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
