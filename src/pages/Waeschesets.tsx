import { useState, useMemo } from "react";
import { Plus, Layers } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  useWaeschesets,
  useObjekteForSelect,
  useCreateWaescheset,
  useUpdateWaescheset,
  useToggleWaeschesetAktiv,
  type Waescheset,
  type WaeschesetInsert,
} from "@/hooks/useWaeschesets";
import { WaeschesetsStats } from "@/components/waeschesets/WaeschesetsStats";
import { WaeschesetsFilter } from "@/components/waeschesets/WaeschesetsFilter";
import { WaeschesetsTable } from "@/components/waeschesets/WaeschesetsTable";
import { WaeschesetFormDialog } from "@/components/waeschesets/WaeschesetFormDialog";
import { WaeschesetArtikelDialog } from "@/components/waeschesets/WaeschesetArtikelDialog";

export default function Waeschesets() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedObjekt, setSelectedObjekt] = useState("all");
  const [showOnlyAktiv, setShowOnlyAktiv] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [artikelDialogOpen, setArtikelDialogOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<Waescheset | null>(null);

  const { data: sets = [], isLoading, error } = useWaeschesets();
  const { data: objekte = [] } = useObjekteForSelect();
  const createSet = useCreateWaescheset();
  const updateSet = useUpdateWaescheset();
  const toggleAktiv = useToggleWaeschesetAktiv();

  // Filter sets
  const filteredSets = useMemo(() => {
    return sets.filter((set) => {
      const matchesSearch =
        searchTerm === "" ||
        set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        set.beschreibung?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        set.objektName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesObjekt =
        selectedObjekt === "all" || set.objekt_id === selectedObjekt;

      const matchesAktiv = !showOnlyAktiv || set.aktiv;

      return matchesSearch && matchesObjekt && matchesAktiv;
    });
  }, [sets, searchTerm, selectedObjekt, showOnlyAktiv]);

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

  const handleSaveSet = async (data: WaeschesetInsert) => {
    try {
      if (selectedSet) {
        await updateSet.mutateAsync({ id: selectedSet.id, ...data });
        toast({ title: "Wäscheset aktualisiert" });
      } else {
        await createSet.mutateAsync(data);
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
                selectedObjekt={selectedObjekt}
                onObjektChange={setSelectedObjekt}
                objekte={objekte}
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
              objekte={objekte}
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
