import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { useNavigate } from "react-router-dom";
import { UserCheck, Package, Layers, FileText, Settings, Plug } from "lucide-react";

export default function Verwaltung() {
  const navigate = useNavigate();

  const items = [
    { label: "Wäschekräfte/Fahrer", description: "Personal verwalten", icon: UserCheck, variant: "primary" as const, href: "/waeschekraefte" },
    { label: "Wäscheartikel", description: "Artikel-Stammdaten", icon: Package, variant: "info" as const, href: "/waescheartikel" },
    { label: "Wäschesets", description: "Sets konfigurieren", icon: Layers, variant: "success" as const, href: "/waeschesets" },
    { label: "Rechnungseinstellungen", description: "Rechnungsdaten & MwSt.", icon: FileText, variant: "warning" as const, href: "/rechnungseinstellungen" },
    { label: "Benutzerverwaltung", description: "Benutzer & Rollen", icon: Settings, variant: "primary" as const, href: "/benutzer" },
    { label: "API & Integrationen", description: "Schnittstellen", icon: Plug, variant: "info" as const, href: "/integrationen" },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden min-w-0">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-4 md:px-6">
            <SidebarTrigger className="hidden h-9 w-9 rounded-lg hover:bg-sidebar-accent shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl font-semibold truncate">Verwaltung</h1>
              <p className="text-sm text-sidebar-foreground/80 truncate">Stammdaten und Einstellungen</p>
            </div>
          </header>

          <div className="p-4 md:p-6">
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <QuickActionCard
                  key={item.href}
                  label={item.label}
                  description={item.description}
                  icon={item.icon}
                  variant={item.variant}
                  onClick={() => navigate(item.href)}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
