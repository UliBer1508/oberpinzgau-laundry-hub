import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { StatCard } from "@/components/dashboard/StatCard";

import { QuickActionsUpdated } from "@/components/dashboard/QuickActionsUpdated";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useNavigate } from "react-router-dom";
import { Package, Users, ListTodo, Truck, FileText } from "lucide-react";

const Index = () => {
  const today = new Date().toLocaleDateString("de-AT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { data: stats } = useDashboardStats();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden min-w-0">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-4 md:px-6">
            <SidebarTrigger className="hidden h-9 w-9 rounded-lg hover:bg-sidebar-accent shrink-0" />
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-sidebar-foreground truncate">Dashboard</h1>
                <p className="text-sm text-sidebar-foreground/80 truncate">{today}</p>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-6 space-y-6">
            {/* Übersichts-Kacheln */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
              <StatCard
                title="Bestellungen"
                value={stats?.bestellungen?.total ?? 0}
                subtitle={`${stats?.bestellungen?.neu ?? 0} neu`}
                icon={Package}
                variant="info"
                onClick={() => navigate("/bestellungen")}
              />
              <StatCard
                title="Kunden & Objekte"
                value={stats?.kunden?.total ?? 0}
                subtitle={`${stats?.kunden?.aktiv ?? 0} aktiv`}
                icon={Users}
                variant="primary"
                onClick={() => navigate("/kunden")}
              />
              <StatCard
                title="Arbeitsaufträge"
                value={stats?.arbeitsauftraege?.offen ?? 0}
                subtitle="offen"
                icon={ListTodo}
                variant="warning"
                onClick={() => navigate("/bestellungen/management")}
              />
              <StatCard
                title="Liefertouren"
                value={stats?.liefertouren?.heute ?? 0}
                subtitle={`heute · ${stats?.liefertouren?.total ?? 0} gesamt`}
                icon={Truck}
                variant="success"
                onClick={() => navigate("/liefertouren")}
              />
              <StatCard
                title="Rechnungen"
                value={stats?.rechnungen?.offen ?? 0}
                subtitle={`offen · ${stats?.rechnungen?.total ?? 0} gesamt`}
                icon={FileText}
                variant="default"
                onClick={() => navigate("/rechnungen")}
              />
            </div>

            <div className="grid gap-6">
              <QuickActionsUpdated />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
