import { useState, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { BestellungenStats } from "@/components/bestellungen/BestellungenStats";
import { BestellungenFilter } from "@/components/bestellungen/BestellungenFilter";
import { BestellungenTable } from "@/components/bestellungen/BestellungenTable";
import { BestellungFormDialog, type BestellungFormData } from "@/components/bestellungen/BestellungFormDialog";
import { BestellungPositionenDialog } from "@/components/bestellungen/BestellungPositionenDialog";
import { BestellungDetailDialog } from "@/components/bestellungen/BestellungDetailDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useBestellungen,
  useKundenForSelect,
  useCreateBestellung,
  useUpdateBestellung,
  useUpdateBestellungStatus,
  useDeleteBestellung,
  type Bestellung,
  type BestellungInsert,
  type BestellungStatus,
} from "@/hooks/useBestellungen";

export default function Bestellungen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<BestellungStatus | "alle">("alle");
  const [selectedKunde, setSelectedKunde] = useState<string>("alle");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [positionenDialogOpen, setPositionenDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedBestellung, setSelectedBestellung] = useState<Bestellung | null>(null);

  const queryClient = useQueryClient();
  const { data: bestellungen = [], isLoading, error } = useBestellungen();
  const { data: kunden = [] } = useKundenForSelect();
  const createBestellung = useCreateBestellung();
  const updateBestellung = useUpdateBestellung();
  const updateStatus = useUpdateBestellungStatus();
  const deleteBestellung = useDeleteBestellung();

  const filteredBestellungen = useMemo(() => {
    return bestellungen.filter((b) => {
      const matchesSearch =
        searchTerm === "" ||
        b.bestellnummer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.kundeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.objektName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === "alle" || b.status === selectedStatus;
      const matchesKunde = selectedKunde === "alle" || b.kunde_id === selectedKunde;

      return matchesSearch && matchesStatus && matchesKunde;
    });
  }, [bestellungen, searchTerm, selectedStatus, selectedKunde]);

  const stats = useMemo(() => {
    const gesamtumsatz = bestellungen.reduce((sum, b) => sum + (b.gesamtpreis || 0), 0);
    return {
      gesamt: bestellungen.length,
      inBearbeitung: bestellungen.filter((b) => 
        b.status === "neu" || b.status === "in_bearbeitung" || b.status === "ausgeliefert"
      ).length,
      abgeschlossen: bestellungen.filter((b) => b.status === "abgeschlossen").length,
      gesamtumsatz,
    };
  }, [bestellungen]);

  const handleAddBestellung = () => {
    setSelectedBestellung(null);
    setFormDialogOpen(true);
  };

  const handleEditBestellung = (bestellung: Bestellung) => {
    setSelectedBestellung(bestellung);
    setFormDialogOpen(true);
  };

  const handleManagePositionen = (bestellung: Bestellung) => {
    setSelectedBestellung(bestellung);
    setPositionenDialogOpen(true);
  };

  const handleViewDetails = (bestellung: Bestellung) => {
    setSelectedBestellung(bestellung);
    setDetailDialogOpen(true);
  };

  const handleStatusChange = async (id: string, status: BestellungStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Status aktualisiert");
    } catch {
      toast.error("Fehler beim Aktualisieren des Status");
    }
  };

  const handleDeleteClick = (bestellung: Bestellung) => {
    setSelectedBestellung(bestellung);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBestellung) return;
    try {
      await deleteBestellung.mutateAsync(selectedBestellung.id);
      toast.success("Bestellung gelöscht");
      setDeleteDialogOpen(false);
      setSelectedBestellung(null);
    } catch {
      toast.error("Fehler beim Löschen der Bestellung");
    }
  };

  const handleSaveBestellung = async (
    data: BestellungInsert, 
    formData?: BestellungFormData
  ) => {
    try {
      let createdBestellungId: string | null = null;

      if (selectedBestellung) {
        await updateBestellung.mutateAsync({ id: selectedBestellung.id, ...data });
        toast.success("Bestellung aktualisiert");
      } else {
        // Bestellung direkt erstellen (mit oder ohne Buchungsdaten)
        const result = await createBestellung.mutateAsync(data);
        createdBestellungId = result.id;

        // Wäscheset-Positionen automatisch hinzufügen
        if (createdBestellungId && formData?.waescheset_id) {
          const { data: setArtikel, error: fetchError } = await supabase
            .from("waescheset_artikel")
            .select("artikel_id, menge, berechnungsart")
            .eq("set_id", formData.waescheset_id);

          if (!fetchError && setArtikel && setArtikel.length > 0) {
            const anzahlPersonen = formData.anzahl_personen || 1;
            
            const positions = setArtikel.map((artikel) => ({
              bestellung_id: createdBestellungId!,
              artikel_id: artikel.artikel_id,
              menge: artikel.berechnungsart === "pro_gast" 
                ? artikel.menge * anzahlPersonen 
                : artikel.menge,
            }));

            await supabase.from("bestellpositionen").insert(positions);
            queryClient.invalidateQueries({ queryKey: ["bestellungen"] });
          }
        }

        toast.success("Bestellung erstellt");
      }
      setFormDialogOpen(false);
    } catch {
      toast.error("Fehler beim Speichern");
    }
  };

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 p-6">
            <p className="text-destructive">Fehler beim Laden der Bestellungen.</p>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Bestellungen</h1>
                <p className="text-sm text-muted-foreground">
                  Verwalten Sie alle Wäschebestellungen
                </p>
              </div>
              <Button onClick={handleAddBestellung}>
                <Plus className="mr-2 h-4 w-4" />
                Bestellung erstellen
              </Button>
            </div>
          </header>

          <div className="space-y-6 p-6">
            <BestellungenStats stats={stats} />

            <BestellungenFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              selectedKunde={selectedKunde}
              onKundeChange={setSelectedKunde}
              kunden={kunden}
            />

            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">Lädt Bestellungen...</p>
              </div>
            ) : (
              <BestellungenTable
                bestellungen={filteredBestellungen}
                onEdit={handleEditBestellung}
                onManagePositionen={handleManagePositionen}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteClick}
                onViewDetails={handleViewDetails}
              />
            )}
          </div>
        </main>
      </div>

      <BestellungFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        bestellung={selectedBestellung}
        onSave={handleSaveBestellung}
      />

      <BestellungPositionenDialog
        open={positionenDialogOpen}
        onOpenChange={setPositionenDialogOpen}
        bestellung={selectedBestellung}
      />

      <BestellungDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        bestellungId={selectedBestellung?.id || null}
      />


      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bestellung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie die Bestellung "{selectedBestellung?.bestellnummer}" wirklich löschen?
              Alle zugehörigen Positionen werden ebenfalls gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
