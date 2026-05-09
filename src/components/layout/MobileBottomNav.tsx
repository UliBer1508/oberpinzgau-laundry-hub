import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, ShoppingCart, FileText, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Start", url: "/", icon: LayoutDashboard, end: true },
  { title: "Kunden", url: "/kunden", icon: Users },
  { title: "Bestellungen", url: "/bestellungen", icon: ShoppingCart },
  { title: "Rechnungen", url: "/rechnungen", icon: FileText },
  { title: "Sets", url: "/waeschesets", icon: Layers },
];

export function MobileBottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-sidebar-border bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => (
          <li key={item.url}>
            <NavLink
              to={item.url}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium text-sidebar-muted transition-colors",
                  isActive && "text-sidebar-primary"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex h-9 w-12 items-center justify-center rounded-full transition-colors",
                      isActive && "bg-sidebar-accent"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="leading-none">{item.title}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
