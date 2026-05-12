import { useState, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BackButton } from "@/components/layout/BackButton";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportRechnungenToExcel } from "@/lib/rechnungenExport";
import {
  useRechnungen,
  useUpdateRechnungStatus,
  Rechnung,
  RechnungStatus,
} from "@/hooks/useRechnungen";
import {
  useRechnungseinstellungen,
  useUpdateRechnungseinstellungen,
} from "@/hooks/useRechnungseinstellungen";
import { RechnungenStats } from "@/components/rechnungen/RechnungenStats";
import { RechnungenFilter } from "@/components/rechnungen/RechnungenFilter";
import { RechnungenTable } from "@/components/rechnungen/RechnungenTable";
import { RechnungDetailDialog } from "@/components/rechnungen/RechnungDetailDialog";
import { RechnungseinstellungenCard } from "@/components/rechnungen/RechnungseinstellungenCard";
import { RechnungseinstellungenDialog } from "@/components/rechnungen/RechnungseinstellungenDialog";

export default function Rechnungen() {
  const { toast } = useToast();
  const { data: rechnungen = [], isLoading, error } = useRechnungen();
  const updateStatus = useUpdateRechnungStatus();
  const { data: einstellungen, isLoading: einstellungenLoading } = useRechnungseinstellungen();
  const updateEinstellungen = useUpdateRechnungseinstellungen();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RechnungStatus | "alle" | "ueberfaellig">("alle");
  const [selectedRechnung, setSelectedRechnung] = useState<Rechnung | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [einstellungenDialogOpen, setEinstellungenDialogOpen] = useState(false);

  // Prüfen ob Rechnung überfällig ist
  const isOverdue = (r: Rechnung) => {
    return r.status === 'offen' && 
      r.faelligkeitsdatum && 
      new Date(r.faelligkeitsdatum) < new Date();
  };

  // Gefilterte Rechnungen
  const filteredRechnungen = useMemo(() => {
    return rechnungen.filter((r) => {
      const matchesSearch =
        searchTerm === "" ||
        r.rechnungsnummer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.kunde_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.kunde_firma?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (r.bestellnummer?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      let matchesStatus = false;
      if (statusFilter === "alle") {
        matchesStatus = true;
      } else if (statusFilter === "ueberfaellig") {
        matchesStatus = isOverdue(r);
      } else {
        matchesStatus = r.status === statusFilter;
      }

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

  const handleSaveEinstellungen = (data: {
    mwst_satz: number;
    bearbeitungsgebuehr: number;
    firma_name: string | null;
    firma_bezeichnung: string | null;
    firma_strasse: string | null;
    firma_plz: string | null;
    firma_ort: string | null;
    firma_telefon: string | null;
    firma_email: string | null;
    zahlungsfrist_tage: number;
    mahnung_betreff: string | null;
    mahnung_text: string | null;
  }) => {
    if (!einstellungen?.id) return;
    
    updateEinstellungen.mutate(
      { id: einstellungen.id, ...data },
      {
        onSuccess: () => {
          toast({
            title: "Einstellungen gespeichert",
            description: "Die Rechnungseinstellungen wurden aktualisiert.",
          });
          setEinstellungenDialogOpen(false);
        },
        onError: () => {
          toast({
            title: "Fehler",
            description: "Einstellungen konnten nicht gespeichert werden.",
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
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden min-w-0">
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
        <main className="flex-1 overflow-x-hidden min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-4 md:px-6">
            <SidebarTrigger className="hidden h-9 w-9 rounded-lg hover:bg-sidebar-accent shrink-0" />
            <BackButton />
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold text-sidebar-foreground">Rechnungen</h1>
                <p className="text-sm text-sidebar-foreground/80">Übersicht aller Rechnungen</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                if (filteredRechnungen.length === 0) {
                  toast({
                    title: "Keine Rechnungen",
                    description: "Es gibt keine Rechnungen zum Exportieren.",
                    variant: "destructive",
                  });
                  return;
                }
                exportRechnungenToExcel(filteredRechnungen);
                toast({
                  title: "Export erstellt",
                  description: `${filteredRechnungen.length} Rechnungen exportiert.`,
                });
              }}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Excel-Export</span>
            </Button>
          </header>

          <div className="p-4 md:p-6 space-y-6">

            {/* Stats */}
            <RechnungenStats stats={stats} />

            {/* Einstellungen wurden in die Verwaltung verschoben */}


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

      {/* Einstellungen Dialog */}
      <RechnungseinstellungenDialog
        open={einstellungenDialogOpen}
        onOpenChange={setEinstellungenDialogOpen}
        einstellungen={einstellungen ?? null}
        onSave={handleSaveEinstellungen}
        isPending={updateEinstellungen.isPending}
      />
    </SidebarProvider>
  );
}
