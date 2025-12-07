import {
  LayoutDashboard,
  Users,
  Building2,
  ShoppingCart,
  Truck,
  UserCheck,
  Package,
  Layers,
  Settings,
  LogOut,
  LogIn,
  ChevronDown,
  FileText,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Kunden", url: "/kunden", icon: Users },
  { title: "Objekte", url: "/objekte", icon: Building2 },
  { title: "Liefertouren", url: "/liefertouren", icon: Truck },
  { title: "Rechnungen", url: "/rechnungen", icon: FileText },
];

const bestellungenSubItems = [
  { title: "Übersicht", url: "/bestellungen" },
  { title: "Arbeitsverwaltung", url: "/bestellungen/management" },
];

const managementNavItems = [
  { title: "Wäschekräfte/Fahrer", url: "/waeschekraefte", icon: UserCheck },
  { title: "Wäscheartikel", url: "/waescheartikel", icon: Package },
  { title: "Wäschesets", url: "/waeschesets", icon: Layers },
  { title: "Benutzerverwaltung", url: "/benutzer", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [bestellungenOpen, setBestellungenOpen] = useState(
    location.pathname.startsWith("/bestellungen")
  );

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
            <div className="flex items-center gap-3">
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
            </div>
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
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Bestellungen mit Untermenü */}
              <Collapsible open={bestellungenOpen} onOpenChange={setBestellungenOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Bestellungen"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full"
                    >
                      <ShoppingCart className="h-5 w-5 shrink-0" />
                      <span className="flex-1">Bestellungen</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${bestellungenOpen ? "rotate-180" : ""}`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {bestellungenSubItems.map((item) => (
                        <SidebarMenuSubItem key={item.url}>
                          <SidebarMenuSubButton asChild>
                            <NavLink
                              to={item.url}
                              end
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                            >
                              {item.title}
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-3 text-xs font-medium uppercase tracking-wider text-sidebar-muted">
            Verwaltung
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementNavItems.map((item) => (
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
