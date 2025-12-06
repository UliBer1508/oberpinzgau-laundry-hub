import { useState, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { BestellungenStats } from "@/components/bestellungen/BestellungenStats";
import { BestellungenFilter } from "@/components/bestellungen/BestellungenFilter";
import { BestellungenTable } from "@/components/bestellungen/BestellungenTable";
import { BestellungFormDialog } from "@/components/bestellungen/BestellungFormDialog";
import { BestellungPositionenDialog } from "@/components/bestellungen/BestellungPositionenDialog";
import {
  useBestellungen,
  useKundenForSelect,
  useCreateBestellung,
  useUpdateBestellung,
  useUpdateBestellungStatus,
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
  const [selectedBestellung, setSelectedBestellung] = useState<Bestellung | null>(null);

  const { data: bestellungen = [], isLoading, error } = useBestellungen();
  const { data: kunden = [] } = useKundenForSelect();
  const createBestellung = useCreateBestellung();
  const updateBestellung = useUpdateBestellung();
  const updateStatus = useUpdateBestellungStatus();

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
    return {
      gesamt: bestellungen.length,
      neu: bestellungen.filter((b) => b.status === "neu").length,
      inBearbeitung: bestellungen.filter((b) => b.status === "in_bearbeitung").length,
      ausgeliefert: bestellungen.filter((b) => b.status === "ausgeliefert").length,
      abgeschlossen: bestellungen.filter((b) => b.status === "abgeschlossen").length,
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

  const handleStatusChange = async (id: string, status: BestellungStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Status aktualisiert");
    } catch {
      toast.error("Fehler beim Aktualisieren des Status");
    }
  };

  const handleSaveBestellung = async (data: BestellungInsert) => {
    try {
      if (selectedBestellung) {
        await updateBestellung.mutateAsync({ id: selectedBestellung.id, ...data });
        toast.success("Bestellung aktualisiert");
      } else {
        await createBestellung.mutateAsync(data);
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
                Neue Bestellung
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
    </SidebarProvider>
  );
}
