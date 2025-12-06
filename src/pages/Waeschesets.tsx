import { useState, useMemo } from "react";
import { Plus, Layers } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  useWaeschesets,
  useCreateWaescheset,
  useUpdateWaeschesetWithArtikel,
  useToggleWaeschesetAktiv,
  useKundenForWaeschesets,
  type Waescheset,
  type WaeschesetInsert,
} from "@/hooks/useWaeschesets";
import type { TempArtikel } from "@/components/waeschesets/WaeschesetFormDialog";
import { WaeschesetsStats } from "@/components/waeschesets/WaeschesetsStats";
import { WaeschesetsFilter } from "@/components/waeschesets/WaeschesetsFilter";
import { WaeschesetsTable } from "@/components/waeschesets/WaeschesetsTable";
import { WaeschesetFormDialog } from "@/components/waeschesets/WaeschesetFormDialog";
import { WaeschesetArtikelDialog } from "@/components/waeschesets/WaeschesetArtikelDialog";

export default function Waeschesets() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKunde, setSelectedKunde] = useState("all");
  const [showOnlyAktiv, setShowOnlyAktiv] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [artikelDialogOpen, setArtikelDialogOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<Waescheset | null>(null);

  const { data: sets = [], isLoading, error } = useWaeschesets();
  const { data: kunden = [] } = useKundenForWaeschesets();
  const createSet = useCreateWaescheset();
  const updateSet = useUpdateWaeschesetWithArtikel();
  const toggleAktiv = useToggleWaeschesetAktiv();

  // Filter sets
  const filteredSets = useMemo(() => {
    return sets.filter((set) => {
      const matchesSearch =
        searchTerm === "" ||
        set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        set.beschreibung?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        set.objektName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        set.kundeName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesKunde =
        selectedKunde === "all" || set.kundeId === selectedKunde;

      const matchesAktiv = !showOnlyAktiv || set.aktiv;

      return matchesSearch && matchesKunde && matchesAktiv;
    });
  }, [sets, searchTerm, selectedKunde, showOnlyAktiv]);

  // Calculate statistics
  const stats = useMemo(() => {
    const uniqueObjekte = new Set(sets.map((s) => s.objekt_id));
    const totalArtikel = sets.reduce((sum, s) => sum + s.artikelCount, 0);

    return {
      total: sets.length,
      aktiv: sets.filter((s) => s.aktiv).length,
      objekteMitSets: uniqueObjekte.size,
      artikelZugeordnet: totalArtikel,
    };
  }, [sets]);

  const handleAddSet = () => {
    setSelectedSet(null);
    setFormDialogOpen(true);
  };

  const handleEditSet = (set: Waescheset) => {
    setSelectedSet(set);
    setFormDialogOpen(true);
  };

  const handleManageArtikel = (set: Waescheset) => {
    setSelectedSet(set);
    setArtikelDialogOpen(true);
  };

  const handleToggleAktiv = async (set: Waescheset) => {
    try {
      await toggleAktiv.mutateAsync({ id: set.id, aktiv: !set.aktiv });
      toast({
        title: set.aktiv ? "Set deaktiviert" : "Set aktiviert",
      });
    } catch {
      toast({
        title: "Fehler beim Ändern des Status",
        variant: "destructive",
      });
    }
  };

  const handleSaveSet = async (data: WaeschesetInsert, artikel: TempArtikel[]) => {
    try {
      const artikelData = artikel.map(a => ({
        artikel_id: a.artikel_id,
        menge: a.menge,
        berechnungsart: a.berechnungsart,
      }));

      if (selectedSet) {
        await updateSet.mutateAsync({ 
          id: selectedSet.id, 
          waescheset: data,
          artikel: artikelData,
        });
        toast({ title: "Wäscheset aktualisiert" });
      } else {
        await createSet.mutateAsync({ 
          waescheset: data, 
          artikel: artikelData,
        });
        toast({ title: "Wäscheset erstellt" });
      }
      setFormDialogOpen(false);
    } catch {
      toast({
        title: "Fehler beim Speichern",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 p-6">
            <div className="text-center text-destructive">
              Fehler beim Laden der Daten
            </div>
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
          <div className="container py-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Wäschesets</h1>
                  <p className="text-sm text-muted-foreground">
                    Verwalten Sie Wäschesets für Ihre Objekte
                  </p>
                </div>
              </div>
              <Button onClick={handleAddSet}>
                <Plus className="mr-2 h-4 w-4" />
                Neues Set
              </Button>
            </div>

            {/* Stats */}
            <div className="mb-6">
              <WaeschesetsStats {...stats} />
            </div>

            {/* Filter */}
            <div className="mb-6">
              <WaeschesetsFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedKunde={selectedKunde}
                onKundeChange={setSelectedKunde}
                kunden={kunden.map(k => ({ 
                  id: k.id, 
                  name: k.firma || k.name 
                }))}
                showOnlyAktiv={showOnlyAktiv}
                onShowOnlyAktivChange={setShowOnlyAktiv}
              />
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                Lade Wäschesets...
              </div>
            ) : (
              <WaeschesetsTable
                sets={filteredSets}
                onEdit={handleEditSet}
                onToggleAktiv={handleToggleAktiv}
                onManageArtikel={handleManageArtikel}
              />
            )}

            {/* Form Dialog */}
            <WaeschesetFormDialog
              open={formDialogOpen}
              onOpenChange={setFormDialogOpen}
              set={selectedSet}
              objekte={[]}
              onSubmit={handleSaveSet}
              isLoading={createSet.isPending || updateSet.isPending}
            />

            {/* Artikel Dialog */}
            <WaeschesetArtikelDialog
              open={artikelDialogOpen}
              onOpenChange={setArtikelDialogOpen}
              set={selectedSet}
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
