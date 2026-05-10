import {
  LayoutDashboard,
  Users,
  
  Truck,
  UserCheck,
  Package,
  Layers,
  Settings,
  LogOut,
  LogIn,
  FileText,
  ClipboardList,
  ListTodo,
  Plug,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import { useCan } from "@/hooks/useRoles";
import { useCurrentUserRole } from "@/hooks/useBenutzer";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  waeschekraft: "Wäschekraft",
  kunde: "Kunde",
};
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { title: "Kunden & Objekte", url: "/kunden", icon: Users, resource: "kunden" },
  { title: "Bestellungen", url: "/bestellungen", icon: ClipboardList, resource: "bestellungen" },
  { title: "Arbeitsverwaltung", url: "/bestellungen/management", icon: ListTodo, resource: "bestellungen_management" },
  { title: "Liefertouren", url: "/liefertouren", icon: Truck, resource: "liefertouren" },
  { title: "Rechnungen", url: "/rechnungen", icon: FileText, resource: "rechnungen" },
];

const managementNavItems = [
  { title: "Wäschekräfte/Fahrer", url: "/waeschekraefte", icon: UserCheck, resource: "waeschekraefte" },
  { title: "Wäscheartikel", url: "/waescheartikel", icon: Package, resource: "waescheartikel" },
  { title: "Wäschesets", url: "/waeschesets", icon: Layers, resource: "waeschesets" },
  { title: "Rechnungseinstellungen", url: "/rechnungseinstellungen", icon: FileText, resource: "rechnungen" },
  { title: "Benutzerverwaltung", url: "/benutzer", icon: Settings, resource: "benutzer" },
  { title: "API & Integrationen", url: "/integrationen", icon: Plug, resource: "benutzer" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { user, profile, signOut } = useAuth();
  const can = useCan();
  // Wenn niemand eingeloggt ist (Dev-Modus), alles zeigen.
  const showAll = !user;
  const visibleMainItems = mainNavItems.filter((item) => showAll || can(item.resource, "view"));
  const visibleManagementItems = managementNavItems.filter((item) => showAll || can(item.resource, "view"));
  const navigate = useNavigate();

  const getInitials = () => {
    if (profile?.name) {
      return profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "??";
  };

  const getDisplayName = () => {
    if (profile?.name) return profile.name;
    if (user?.email) return user.email.split("@")[0];
    return "Nicht angemeldet";
  };

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate("/auth");
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <NavLink to="/" end className="flex items-center gap-3 rounded-lg hover:bg-sidebar-accent/50 transition-colors p-1 -m-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Package className="h-5 w-5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-sidebar-foreground">
                    Wäscheportal
                  </span>
                  <span className="text-xs text-sidebar-muted">
                    Oberpinzgau
                  </span>
                </div>
              )}
            </NavLink>
            {!isCollapsed && (
              <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-sidebar-accent" />
            )}
          </div>
          {isCollapsed && (
            <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-sidebar-accent mx-auto" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-medium uppercase tracking-wider text-sidebar-muted">
            Hauptmenü
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/" || item.url === "/bestellungen"}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-3 text-xs font-medium uppercase tracking-wider text-sidebar-muted">
            Verwaltung
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleManagementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
            <span className="text-sm font-medium">{getInitials()}</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">
                {getDisplayName()}
              </span>
              <span className="text-xs text-sidebar-muted">
                {user ? "Benutzer" : "Gast"}
              </span>
            </div>
          )}
          {!isCollapsed && (
            <button 
              onClick={handleAuthAction}
              className="rounded-lg p-2 text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              title={user ? "Abmelden" : "Anmelden"}
            >
              {user ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            </button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
