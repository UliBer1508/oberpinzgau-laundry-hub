import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { WaescheartikelStats } from "@/components/waescheartikel/WaescheartikelStats";
import { WaescheartikelFilter } from "@/components/waescheartikel/WaescheartikelFilter";
import { WaescheartikelTable } from "@/components/waescheartikel/WaescheartikelTable";
import { WaescheartikelFormDialog } from "@/components/waescheartikel/WaescheartikelFormDialog";
import {
  useWaescheartikel,
  useCreateWaescheartikel,
  useUpdateWaescheartikel,
  useToggleWaescheartikelAktiv,
  useGenerateArtikelnummer,
  type Waescheartikel as WaescheartikelType,
  type WaescheartikelInsert,
} from "@/hooks/useWaescheartikel";
import { useToast } from "@/hooks/use-toast";

export default function Waescheartikel() {
  const { toast } = useToast();
  const { data: artikel = [], isLoading } = useWaescheartikel();
  const { data: nextArtikelnummer = "WA001" } = useGenerateArtikelnummer();
  const createMutation = useCreateWaescheartikel();
  const updateMutation = useUpdateWaescheartikel();
  const toggleAktivMutation = useToggleWaescheartikelAktiv();

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategorie, setSelectedKategorie] = useState("all");
  const [selectedFarbe, setSelectedFarbe] = useState("all");
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArtikel, setEditingArtikel] = useState<WaescheartikelType | null>(null);

  // Filter articles
  const filteredArtikel = useMemo(() => {
    return artikel.filter((a) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          a.name.toLowerCase().includes(search) ||
          a.artikelnummer.toLowerCase().includes(search) ||
          (a.bezeichnung && a.bezeichnung.toLowerCase().includes(search));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedKategorie !== "all" && a.kategorie !== selectedKategorie) {
        return false;
      }

      // Color filter
      if (selectedFarbe !== "all" && a.farbe !== selectedFarbe) {
        return false;
      }

      // Active filter
      if (showOnlyActive && !a.aktiv) {
        return false;
      }

      return true;
    });
  }, [artikel, searchTerm, selectedKategorie, selectedFarbe, showOnlyActive]);

  const handleOpenDialog = (artikelToEdit?: WaescheartikelType) => {
    setEditingArtikel(artikelToEdit || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingArtikel(null);
  };

  const handleSubmit = async (data: WaescheartikelInsert & { bild_url?: string | null }) => {
    try {
      if (editingArtikel) {
        await updateMutation.mutateAsync({ id: editingArtikel.id, ...data });
        toast({
          title: "Artikel aktualisiert",
          description: `"${data.name}" wurde erfolgreich aktualisiert.`,
        });
      } else {
        await createMutation.mutateAsync(data);
        toast({
          title: "Artikel erstellt",
          description: `"${data.name}" wurde erfolgreich erstellt.`,
        });
      }
      handleCloseDialog();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Der Artikel konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const handleToggleAktiv = async (id: string, aktiv: boolean) => {
    try {
      await toggleAktivMutation.mutateAsync({ id, aktiv });
      toast({
        title: aktiv ? "Artikel aktiviert" : "Artikel deaktiviert",
        description: `Der Artikel wurde ${aktiv ? "aktiviert" : "deaktiviert"}.`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Der Status konnte nicht geändert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <SidebarTrigger className="md:hidden h-9 w-9 rounded-lg hover:bg-sidebar-accent shrink-0" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Wäscheartikel</h1>
              <p className="text-muted-foreground">
                Verwalten Sie Ihre Wäscheartikel mit Kategorien und Farben
              </p>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Neuer Artikel
            </Button>
          </div>

          <div className="space-y-6">
            <WaescheartikelStats artikel={artikel} />

            <WaescheartikelFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedKategorie={selectedKategorie}
              onKategorieChange={setSelectedKategorie}
              selectedFarbe={selectedFarbe}
              onFarbeChange={setSelectedFarbe}
              showOnlyActive={showOnlyActive}
              onShowOnlyActiveChange={setShowOnlyActive}
              artikel={artikel}
            />

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Lade Wäscheartikel...
              </div>
            ) : (
              <WaescheartikelTable
                artikel={filteredArtikel}
                onEdit={handleOpenDialog}
                onToggleAktiv={handleToggleAktiv}
              />
            )}
          </div>

          <WaescheartikelFormDialog
            open={dialogOpen}
            onOpenChange={handleCloseDialog}
            artikel={editingArtikel}
            nextArtikelnummer={nextArtikelnummer}
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </main>
      </div>
    </SidebarProvider>
  );
}
