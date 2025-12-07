import { useState, useMemo } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useRechnungen,
  useUpdateRechnungStatus,
  Rechnung,
  RechnungStatus,
} from "@/hooks/useRechnungen";
import { RechnungenStats } from "@/components/rechnungen/RechnungenStats";
import { RechnungenFilter } from "@/components/rechnungen/RechnungenFilter";
import { RechnungenTable } from "@/components/rechnungen/RechnungenTable";
import { RechnungDetailDialog } from "@/components/rechnungen/RechnungDetailDialog";

export default function Rechnungen() {
  const { toast } = useToast();
  const { data: rechnungen = [], isLoading, error } = useRechnungen();
  const updateStatus = useUpdateRechnungStatus();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RechnungStatus | "alle">("alle");
  const [selectedRechnung, setSelectedRechnung] = useState<Rechnung | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Gefilterte Rechnungen
  const filteredRechnungen = useMemo(() => {
    return rechnungen.filter((r) => {
      const matchesSearch =
        searchTerm === "" ||
        r.rechnungsnummer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.kunde_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.kunde_firma?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (r.bestellnummer?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesStatus = statusFilter === "alle" || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rechnungen, searchTerm, statusFilter]);

  // Statistiken
  const stats = useMemo(() => {
    const offen = rechnungen.filter((r) => r.status === "offen");
    const bezahlt = rechnungen.filter((r) => r.status === "bezahlt");
    const mahnung = rechnungen.filter((r) => r.status === "mahnung");

    return {
      gesamt: rechnungen.length,
      offen: offen.length,
      bezahlt: bezahlt.length,
      mahnung: mahnung.length,
      offeneSumme: offen.reduce((sum, r) => sum + Number(r.bruttobetrag), 0),
      bezahlteSumme: bezahlt.reduce((sum, r) => sum + Number(r.bruttobetrag), 0),
    };
  }, [rechnungen]);

  const handleViewDetails = (rechnung: Rechnung) => {
    setSelectedRechnung(rechnung);
    setDetailDialogOpen(true);
  };

  const handleStatusChange = (id: string, status: RechnungStatus) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast({
            title: "Status geändert",
            description: `Rechnung wurde auf "${status}" gesetzt.`,
          });
        },
        onError: () => {
          toast({
            title: "Fehler",
            description: "Status konnte nicht geändert werden.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1 p-6">
            <div className="text-destructive">
              Fehler beim Laden der Rechnungen: {error.message}
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Rechnungen</h1>
                <p className="text-muted-foreground">
                  Übersicht aller Rechnungen
                </p>
              </div>
              <Button variant="outline" disabled>
                <FileText className="mr-2 h-4 w-4" />
                Export (bald verfügbar)
              </Button>
            </div>

            {/* Stats */}
            <RechnungenStats stats={stats} />

            {/* Filter */}
            <RechnungenFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />

            {/* Tabelle */}
            <RechnungenTable
              rechnungen={filteredRechnungen}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
              onStatusChange={handleStatusChange}
            />
          </div>
        </main>
      </div>

      {/* Detail Dialog */}
      <RechnungDetailDialog
        rechnung={selectedRechnung}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onStatusChange={handleStatusChange}
      />
    </SidebarProvider>
  );
}
