import { useState, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ManagementHeader } from "@/components/management/ManagementHeader";
import { ManagementFilterBar } from "@/components/management/ManagementFilterBar";
import { ManagementTable } from "@/components/management/ManagementTable";
import { BestellungDetailDialog } from "@/components/bestellungen/BestellungDetailDialog";
import { useManagementBestellungen } from "@/hooks/useManagementBestellungen";
import { Loader2 } from "lucide-react";

export default function BestellungsManagement() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<"today" | "week" | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [waeschekraftFilter, setWaeschekraftFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data: bestellungen, isLoading } = useManagementBestellungen();

  // Filter bestellungen
  const filteredBestellungen = useMemo(() => {
    if (!bestellungen) return [];

    return bestellungen.filter((b) => {
      // Date filter
      if (dateRange === "today") {
        const today = new Date();
        const lieferdatum = b.lieferdatum ? new Date(b.lieferdatum) : null;
        if (!lieferdatum || lieferdatum.toDateString() !== today.toDateString()) {
          return false;
        }
      } else if (dateRange === "week") {
        const today = new Date();
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 14);
        const lieferdatum = b.lieferdatum ? new Date(b.lieferdatum) : null;
        if (!lieferdatum || lieferdatum < today || lieferdatum > weekEnd) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && b.status !== statusFilter) {
        return false;
      }

      // Wäschekraft filter
      if (waeschekraftFilter !== "all" && b.waeschekraft_id !== waeschekraftFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "all" && b.prioritaet !== parseInt(priorityFilter)) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        return (
          b.bestellnummer.toLowerCase().includes(search) ||
          b.kundeName.toLowerCase().includes(search) ||
          (b.objektName && b.objektName.toLowerCase().includes(search))
        );
      }

      return true;
    });
  }, [bestellungen, dateRange, statusFilter, waeschekraftFilter, priorityFilter, searchQuery]);

  // Sort by reihenfolge, then by lieferdatum
  const sortedBestellungen = useMemo(() => {
    return [...filteredBestellungen].sort((a, b) => {
      if (a.reihenfolge !== null && b.reihenfolge !== null) {
        return a.reihenfolge - b.reihenfolge;
      }
      if (a.reihenfolge !== null) return -1;
      if (b.reihenfolge !== null) return 1;
      
      // Sort by priority (higher priority first)
      if ((a.prioritaet || 0) !== (b.prioritaet || 0)) {
        return (b.prioritaet || 0) - (a.prioritaet || 0);
      }
      
      // Then by lieferdatum
      if (a.lieferdatum && b.lieferdatum) {
        return new Date(a.lieferdatum).getTime() - new Date(b.lieferdatum).getTime();
      }
      return 0;
    });
  }, [filteredBestellungen]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-14 items-center gap-3 border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-4 md:px-6">
            <SidebarTrigger className="hidden h-9 w-9 rounded-lg hover:bg-sidebar-accent shrink-0" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Arbeitsverwaltung</h1>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 space-y-4 overflow-x-hidden min-w-0">
            <ManagementHeader
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              totalCount={filteredBestellungen.length}
              openCount={filteredBestellungen.filter(b => b.status === "neu" || b.status === "in_bearbeitung").length}
            />

            <ManagementFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              waeschekraftFilter={waeschekraftFilter}
              onWaeschekraftChange={setWaeschekraftFilter}
              priorityFilter={priorityFilter}
              onPriorityChange={setPriorityFilter}
            />

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ManagementTable
                bestellungen={sortedBestellungen}
                onViewDetails={setDetailId}
              />
            )}
          </main>
        </SidebarInset>
      </div>

      <BestellungDetailDialog
        open={!!detailId}
        onOpenChange={(open) => !open && setDetailId(null)}
        bestellungId={detailId}
      />
    </SidebarProvider>
  );
}