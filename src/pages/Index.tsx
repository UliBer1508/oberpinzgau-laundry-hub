import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { DeliveryTable } from "@/components/dashboard/DeliveryTable";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { UpcomingPickups } from "@/components/dashboard/UpcomingPickups";
import {
  Truck,
  Package,
  ShoppingCart,
  Calendar,
  Bell,
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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">{today}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  3
                </span>
              </Button>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            {/* Stats Grid */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Heutige Lieferungen"
                value={12}
                subtitle="5 abgeschlossen"
                icon={Truck}
                variant="primary"
              />
              <StatCard
                title="Offene Bestellungen"
                value={28}
                trend={{ value: 12, isPositive: true }}
                icon={ShoppingCart}
                variant="info"
              />
              <StatCard
                title="Anstehende Abholungen"
                value={8}
                subtitle="Heute & Morgen"
                icon={Calendar}
                variant="warning"
              />
              <StatCard
                title="Wäscheartikel im Umlauf"
                value="2.450"
                trend={{ value: 5, isPositive: true }}
                icon={Package}
                variant="success"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Delivery Table - 2/3 width */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-lg font-semibold">
                      Heutige Lieferungen
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      Alle anzeigen
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <DeliveryTable />
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar - 1/3 width */}
              <div className="space-y-6">
                <QuickActions />
                <UpcomingPickups />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
